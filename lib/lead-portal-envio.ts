import { randomUUID } from "node:crypto"
import { NextResponse, after } from "next/server"
import { clientKey } from "@/lib/api-guards"
import { ENDPOINT_PORTAL_LEADS_PROPIETARIO } from "@/lib/lead-propietario"
import { cabecerasFirmaPortal, secretoLead } from "@/lib/lead-firma"
import { enviarLeadCapi, identificadoresDeCookie } from "@/lib/meta-capi"
import { metaCapiActivo, metaPixelActivo } from "@/lib/meta-config.mjs"

/*
  El camino firmado de un lead hacia el portal de seda_os — SOLO SERVIDOR.

  Lo usan las dos puertas que dejan una solicitud de propietario:
    · app/api/leads/propietario/route.ts  (formulario de la calculadora, canal "calculadora")
    · app/api/asistente/solicitud/route.ts (mini formulario del chat,   canal "asistente")

  Es el código que antes vivía dentro de la ruta de la calculadora, movido sin
  cambiar su comportamiento (tests/calculadora-propietarios.test.ts,
  tests/cartas-qr.test.ts y tests/meta-pixel-leads.test.ts lo cubren). Una sola
  copia: firma HMAC, X-Visitor-Ip, traducción de los errores del portal y la
  medición de Meta (Lead solo con consentimiento de marketing y 201 del portal).

  Reglas que se mantienen (detalle en la cabecera de la ruta de la calculadora):
  · Sin secreto → 503 `not_configured`, sin llamar al portal.
  · UNA serialización: el mismo texto va a la firma y al body.
  · 400 del portal → 422 `rejected_data`; 429 `demasiadas_solicitudes` → 429;
    otro fallo → 502. Nunca se dice «recibido» de algo que no llegó.
  · En los logs no entra ningún dato personal: solo estados.
*/

const TIMEOUT_PORTAL_MS = 8_000

/** Cabecera con la que el navegador declara el consentimiento de marketing (solo la manda con una elección vigente). */
const CABECERA_CONSENTIMIENTO_MARKETING = "x-consent-marketing"

const json = (body: Record<string, unknown>, init?: ResponseInit) => NextResponse.json(body, init)

/** IP del visitante para el límite del portal; undefined si no la hay (no se manda). */
export function ipVisitante(req: Request): string | undefined {
  const ip = clientKey(req)
  return ip && ip !== "unknown" ? ip : undefined
}

/** Para que el envío a Meta no retrase la respuesta: `after` en producción; directo si no hay petición en curso (tests). */
function trasResponder(tarea: () => Promise<unknown>): void {
  try {
    after(tarea)
  } catch {
    void tarea()
  }
}

/** URL de la página que envió el formulario, sin query ni hash: el `Referer` solo si es del mismo origen. */
function urlOrigenEvento(req: Request, rutaPorDefecto: string): string {
  const origen = req.headers.get("origin") ?? ""
  try {
    const ref = new URL(req.headers.get("referer") ?? "")
    if (origen && ref.origin === origen) return `${ref.origin}${ref.pathname}`
  } catch {
    // sin Referer válido
  }
  return `${origen}${rutaPorDefecto}`
}

/**
 * Medición de Meta del lead recién creado. Devuelve el `event_id` compartido
 * con el píxel, o null si no hay nada que medir. Se llama SOLO tras un 2xx del portal.
 */
function medirLead(req: Request, estadoPortal: number, etiqueta: string, rutaPorDefecto: string): string | null {
  if (!metaPixelActivo()) return null
  if (req.headers.get(CABECERA_CONSENTIMIENTO_MARKETING) !== "1") return null
  if (estadoPortal !== 201) {
    console.warn(`[${etiqueta}] el portal respondió`, estadoPortal, "y no 201: no se emite Lead")
    return null
  }
  const eventId = randomUUID()
  if (metaCapiActivo()) {
    const { fbp, fbc } = identificadoresDeCookie(req.headers.get("cookie"))
    const evento = {
      eventId,
      urlOrigen: urlOrigenEvento(req, rutaPorDefecto),
      ip: ipVisitante(req),
      userAgent: req.headers.get("user-agent") ?? undefined,
      fbp,
      fbc,
    }
    trasResponder(() => enviarLeadCapi(evento))
  }
  return eventId
}

export type OpcionesEnvio = {
  /** Ruta de la puerta, para los logs («/api/leads/propietario»). */
  etiqueta: string
  /** Página que se da a Meta si el Referer no sirve («/propietarios/calculadora»). */
  rutaPagina: string
}

/**
 * Firma y envía `cuerpo` (el objeto de `cuerpoPortal`) al portal y traduce la
 * respuesta para el navegador. La validación y el honeypot van ANTES, en la ruta.
 */
export async function reenviarLeadAlPortal(req: Request, cuerpo: Record<string, unknown>, opciones: OpcionesEnvio): Promise<NextResponse> {
  const { etiqueta, rutaPagina } = opciones
  const secreto = secretoLead()
  if (!secreto) {
    console.error(`[${etiqueta}] falta SEDA_LEADS_HMAC_SECRET (o tiene menos de 32 caracteres): no se envía al portal`)
    return json({ ok: false, error: "not_configured" }, { status: 503 })
  }

  // UNA serialización: el mismo texto va a la firma y al body.
  const texto = JSON.stringify(cuerpo)
  const visitante = ipVisitante(req)
  try {
    const resp = await fetch(ENDPOINT_PORTAL_LEADS_PROPIETARIO, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...cabecerasFirmaPortal({ secreto, url: ENDPOINT_PORTAL_LEADS_PROPIETARIO, cuerpo: texto, ahora: new Date() }),
        ...(visitante ? { "X-Visitor-Ip": visitante } : {}),
      },
      body: texto,
      signal: AbortSignal.timeout(TIMEOUT_PORTAL_MS),
    })
    if (!resp.ok) {
      console.error(`[${etiqueta}] el portal respondió`, resp.status)
      // V4-04: un 400 del portal es un DATO que no acepta (su .strict() o su
      // CHECK), no una avería: reintentar «en unos minutos» daría lo mismo.
      if (resp.status === 400) return json({ ok: false, error: "rejected_data" }, { status: 422 })
      // V4-M06: límite por visitante del portal (5/min). Ventana de un minuto.
      if (resp.status === 429) {
        const rc = (await resp.json().catch(() => ({}))) as { error?: string }
        if (rc.error === "demasiadas_solicitudes") {
          return json({ ok: false, error: "demasiadas_solicitudes" }, { status: 429, headers: { "Retry-After": "60" } })
        }
      }
      return json({ ok: false, error: "send_failed" }, { status: 502 })
    }
    // La medición NUNCA puede estropear un lead ya creado: pase lo que pase aquí, el visitante ve el éxito.
    let eventId: string | null = null
    try {
      eventId = medirLead(req, resp.status, etiqueta, rutaPagina)
    } catch {
      console.error(`[${etiqueta}] fallo en la medición de Meta; el lead ya está creado`)
    }
    return json(eventId ? { ok: true, lead: { event_id: eventId } } : { ok: true })
  } catch (err) {
    console.error(`[${etiqueta}] error de red hacia el portal`, err instanceof Error ? err.name : "unknown")
    return json({ ok: false, error: "network_error" }, { status: 502 })
  }
}
