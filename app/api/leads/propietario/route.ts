import { NextResponse } from "next/server"
import { clientKey, crearLimitador, esMismoOrigen } from "@/lib/api-guards"
import { calculadoraPropietariosActiva } from "@/lib/calculadora-propietarios"
import { ENDPOINT_PORTAL_LEADS_PROPIETARIO, cuerpoPortal, validarLead } from "@/lib/lead-propietario"

/*
  Lead de la calculadora de propietarios (/propietarios/calculadora).

  El navegador llama a ESTA ruta (mismo origen) y es el servidor quien hace el
  POST a https://portal.sedaprivatehomes.com/api/leads/propietario. No se llama
  al portal desde el navegador porque el CSP de seda-web es `connect-src 'self'`
  (vercel.json) y porque el portal tendría que abrir CORS a este sitio; así no
  hay que tocar ni una cosa ni la otra.

  · Flag apagado (SEDA_FLAG_CALCULADORA_PROPIETARIOS ≠ "1") → 404 antes de leer
    nada. No se envía nada a ningún sitio.
  · Solo POST del propio sitio, `application/json`, con límite de tamaño y de
    frecuencia (mismas reglas que /api/contact).
  · Consentimiento RGPD obligatorio (`consentimiento: true`).
  · Honeypot (`website`): relleno → misma respuesta que un envío bueno, sin enviar.
  · Sin fallback silencioso: si el portal no responde 2xx, el visitante ve un
    error. Nunca se le dice «recibido» de algo que no ha llegado.
  · No se escribe en los logs ningún dato personal: solo el estado de la respuesta.
*/

const MAX_BODY_BYTES = 4 * 1024
const TIMEOUT_PORTAL_MS = 8_000
const limitar = crearLimitador(5, 10 * 60 * 1000)

const json = (body: Record<string, unknown>, init?: ResponseInit) => NextResponse.json(body, init)

export async function POST(req: Request) {
  if (!calculadoraPropietariosActiva()) {
    return json({ ok: false, error: "not_found" }, { status: 404 })
  }
  if (!esMismoOrigen(req)) return json({ ok: false, error: "forbidden_origin" }, { status: 403 })
  if (!/^application\/json\b/i.test(req.headers.get("content-type") ?? "")) {
    return json({ ok: false, error: "unsupported_media_type" }, { status: 415 })
  }

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

  const v = validarLead(body)
  if (!v.ok) return json({ ok: false, error: v.error }, { status: 400 })

  if (v.honeypot) {
    console.warn("[/api/leads/propietario] honeypot filled — dropped without sending")
    return json({ ok: true })
  }

  try {
    const resp = await fetch(ENDPOINT_PORTAL_LEADS_PROPIETARIO, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cuerpoPortal(v.lead)),
      signal: AbortSignal.timeout(TIMEOUT_PORTAL_MS),
    })
    if (!resp.ok) {
      console.error("[/api/leads/propietario] el portal respondió", resp.status)
      return json({ ok: false, error: "send_failed" }, { status: 502 })
    }
    return json({ ok: true })
  } catch (err) {
    console.error("[/api/leads/propietario] error de red hacia el portal", err instanceof Error ? err.name : "unknown")
    return json({ ok: false, error: "network_error" }, { status: 502 })
  }
}
