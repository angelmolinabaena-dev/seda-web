import { NextResponse } from "next/server"
import { clientKey, crearLimitador, esMismoOrigen } from "@/lib/api-guards"
import { RUTA_CALCULADORA, calculadoraPropietariosActiva } from "@/lib/calculadora-propietarios"
import { cuerpoPortal, validarLead } from "@/lib/lead-propietario"
import { reenviarLeadAlPortal } from "@/lib/lead-portal-envio"

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
    error. Nunca se le dice «recibido» de algo que no ha llegado. Un 400 del
    portal (dato rechazado) sale como 422 `rejected_data`; un 5xx o la red
    caída, como 502 (V4-04).
  · El teléfono se valida con la regla de seda_os (lib/telefono-e164.ts): si no
    se puede llevar a E.164, 400 `phone_needs_prefix` y el formulario pide el
    prefijo internacional, sin llamar al portal.
  · No se escribe en los logs ningún dato personal: solo el estado de la respuesta.
  · V4-M06: el portal limita por VISITANTE (5/min) leyendo `X-Visitor-Ip`, que
    solo mira tras comprobar la firma HMAC. Se manda la IP del visitante (primera
    de x-forwarded-for, o x-real-ip); si no hay, no se manda la cabecera (el
    portal cae a la IP de este servidor). Va SOLO como cabecera: ni en la firma,
    ni en el cuerpo, ni en los logs. Si el portal contesta 429
    `demasiadas_solicitudes`, se devuelve 429 con ese mismo código y el
    formulario dice «espere un minuto».
  · LEADS-RUTA-FIRMADA (V4-01): el POST al portal va FIRMADO con
    `SEDA_LEADS_HMAC_SECRET` (`Authorization: HMAC-Lead …` + `X-Timestamp`,
    lib/lead-firma.ts). Sin secreto (o con menos de 32 caracteres) no se llama
    al portal: 503 `not_configured` y un console.error. El portal rechaza sin
    firma con 401, así que llamar sin ella solo serviría para perder el lead.
  · MEDICIÓN DE META (SEDA_FLAG_META_PIXEL, apagado por defecto). Con el flag
    apagado esta ruta responde exactamente `{ ok: true }`, como siempre. Con el
    flag encendido y SOLO si se cumplen las dos cosas —el navegador mandó
    `X-Consent-Marketing: 1` (el visitante aceptó las cookies de marketing) y el
    portal de seda_os respondió exactamente 201— la respuesta añade
    `lead: { event_id }`: el navegador lo usa para el `Lead` del píxel y, si
    SEDA_FLAG_META_CAPI está encendido, el servidor manda el mismo `Lead` a la
    API de conversiones con ESE mismo `event_id` (deduplicación). Sin
    consentimiento o con otro estado 2xx: no hay `event_id`, ni evento, ni
    llamada a Meta. Ni el correo ni el teléfono salen de aquí hacia Meta.
*/

const MAX_BODY_BYTES = 4 * 1024
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

  // Firma, envío al portal, errores y medición de Meta: lib/lead-portal-envio.ts
  // (el mismo camino que usa el asistente, con canal "asistente").
  return reenviarLeadAlPortal(req, cuerpoPortal(v.lead), { etiqueta: "/api/leads/propietario", rutaPagina: RUTA_CALCULADORA })
}
