import { NextResponse } from "next/server"
import { clientKey, crearLimitador, esMismoOrigen } from "@/lib/api-guards"
import { esBot } from "@/lib/asistente/bots"
import { asistentePropietariosActivo } from "@/lib/asistente/config"
import { cuerpoPortal, validarLeadAsistente } from "@/lib/lead-propietario"
import { reenviarLeadAlPortal } from "@/lib/lead-portal-envio"

/*
  POST /api/asistente/solicitud — el mini formulario del chat.

  Es el MISMO camino que el formulario de la calculadora
  (app/api/leads/propietario), con dos diferencias:
    · canal "asistente" (seda_os lo guarda con origen 'web-asistente';
      contrato docs/CONTRATO-LEADS-CANAL-CARTA.md de portal-propietarios);
    · no hay precio ni ocupación: el chat no manda ninguna cifra (decisión del 6-nov).

  Lo rellena la PERSONA en pantalla, con la casilla de consentimiento y su texto
  (`calculadora.form.consent`); el modelo no interviene. Mismas guardas que la
  calculadora: interruptor (404), mismo origen, JSON, Vercel BotID (403), tamaño, frecuencia,
  honeypot, consentimiento `true`, teléfono con la regla de seda_os, firma HMAC,
  y el Lead de Meta solo con consentimiento de marketing y 201 del portal
  (lib/lead-portal-envio.ts).
*/

const MAX_BODY_BYTES = 4 * 1024
const limitar = crearLimitador(5, 10 * 60 * 1000)

const json = (body: Record<string, unknown>, init?: ResponseInit) => NextResponse.json(body, init)

export async function POST(req: Request) {
  if (!asistentePropietariosActivo()) return json({ ok: false, error: "not_found" }, { status: 404 })
  if (!esMismoOrigen(req)) return json({ ok: false, error: "forbidden_origin" }, { status: 403 })
  if (!/^application\/json\b/i.test(req.headers.get("content-type") ?? "")) {
    return json({ ok: false, error: "unsupported_media_type" }, { status: 415 })
  }
  if (await esBot(req)) return json({ ok: false, error: "forbidden" }, { status: 403 })

  const limite = limitar(clientKey(req))
  if (!limite.ok) {
    return json({ ok: false, error: "rate_limited" }, { status: 429, headers: { "Retry-After": String(limite.retryAfter) } })
  }

  const declarado = Number(req.headers.get("content-length") ?? "")
  if (Number.isFinite(declarado) && declarado > MAX_BODY_BYTES) {
    return json({ ok: false, error: "payload_too_large" }, { status: 413 })
  }
  let raw: string
  try {
    raw = await req.text()
  } catch {
    return json({ ok: false, error: "invalid_body" }, { status: 400 })
  }
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) {
    return json({ ok: false, error: "payload_too_large" }, { status: 413 })
  }
  let body: unknown
  try {
    body = JSON.parse(raw)
  } catch {
    return json({ ok: false, error: "invalid_json" }, { status: 400 })
  }

  const v = validarLeadAsistente(body)
  if (!v.ok) return json({ ok: false, error: v.error }, { status: 400 })

  if (v.honeypot) {
    console.warn("[/api/asistente/solicitud] honeypot filled — dropped without sending")
    return json({ ok: true })
  }

  return reenviarLeadAlPortal(req, cuerpoPortal(v.lead, "asistente"), {
    etiqueta: "/api/asistente/solicitud",
    rutaPagina: "/propietarios",
  })
}
