import { routing } from "@/i18n/routing"
import { MAX_EMAIL_LENGTH, esEmailValido } from "@/lib/api-guards"
import { HONEYPOT_FIELD, HONEYPOT_MAX } from "@/lib/contact-fields"
import { OCUPACION_MAX, OCUPACION_MIN, estimar } from "@/lib/calculadora-propietarios"
import { PRIVACIDAD } from "@/lib/legal/privacidad"
import { normalizarTelefonoE164 } from "@/lib/telefono-e164"

/*
  Lead de propietario — lo que `/api/leads/propietario` de seda-web valida y
  reenvía al portal (solo servidor).

  El destino es el endpoint de CRM-PROPIETARIOS en seda_os. Mientras ese
  endpoint está en curso, el CUERPO de `cuerpoPortal` es una propuesta de seda-web,
  no un contrato firmado: se confirma con el endpoint real antes de encender el
  flag (docs/CALCULADORA-PROPIETARIOS.md).

  El navegador envía solo lo que el propietario escribe (precio, ocupación,
  municipio, dormitorios, contacto). La estimación la recalcula el servidor con
  lib/tarifa: un cliente no puede hacer que el CRM reciba un neto que la tarifa
  no da.
*/

export const ENDPOINT_PORTAL_LEADS_PROPIETARIO = "https://portal.sedaprivatehomes.com/api/leads/propietario"
export const ORIGEN_LEAD = "seda-web/calculadora-propietarios"

export const LEAD_MAX = { nombre: 120, telefono: 40, municipio: 80 } as const
// Un campo de una línea no admite ningún carácter de control (ni U+2028/2029).
const CONTROL = /[\x00-\x1f\x7f\u2028\u2029]/

export type Lead = {
  nombre: string
  email: string
  telefono?: string
  locale: string
  municipio?: string
  dormitorios?: number
  precioNoche: number
  ocupacionPct: number
}

export type ResultadoLead =
  | { ok: true; lead: Lead; honeypot: boolean }
  | { ok: false; error: string }

const fallo = (error: string): ResultadoLead => ({ ok: false, error })

function textoUnaLinea(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null
  const t = v.trim()
  if (t.length > max || CONTROL.test(t)) return null
  return t
}

/**
 * Valida el cuerpo del navegador. Sin coerción: cada valor llega ya con su tipo.
 * El consentimiento es obligatorio y tiene que ser el booleano `true`; ni el
 * texto "true" ni un 1 valen. Un campo que no esté aquí se rechaza.
 */
export function validarLead(body: unknown): ResultadoLead {
  if (typeof body !== "object" || body === null || Array.isArray(body)) return fallo("invalid_body")
  const b = body as Record<string, unknown>

  const permitidos = new Set([
    "nombre", "email", "telefono", "consentimiento", "locale", "municipio", "dormitorios",
    "precioNoche", "ocupacionPct", HONEYPOT_FIELD,
  ])
  if (Object.keys(b).some((k) => !permitidos.has(k))) return fallo("unknown_field")

  // Honeypot: se mira el valor pero la decisión se toma después de validar todo,
  // para que un bot reciba la misma respuesta que un envío bueno.
  const trampa = b[HONEYPOT_FIELD]
  if (trampa !== undefined && typeof trampa !== "string") return fallo("invalid_field_value")
  if (typeof trampa === "string" && trampa.length > HONEYPOT_MAX) return fallo("field_too_long")
  const honeypot = typeof trampa === "string" && trampa.trim().length > 0

  if (b.consentimiento !== true) return fallo("consent_required")

  const nombre = textoUnaLinea(b.nombre, LEAD_MAX.nombre)
  if (nombre === null) return fallo("invalid_name")
  if (nombre.length === 0) return fallo("missing_field")

  const email = typeof b.email === "string" ? b.email.trim() : ""
  if (email.length > MAX_EMAIL_LENGTH || !esEmailValido(email)) return fallo("invalid_email")

  // V4-04: la regla del teléfono es la de seda_os (lib/telefono-e164.ts, copia
  // atada por contrato). Lo que seda_os rechazaría se para AQUÍ, con un error
  // que el formulario entiende («escriba el prefijo»), y no allí con un 502.
  // Viaja ya en E.164: el portal lo normaliza otra vez y le da lo mismo.
  let telefono: string | undefined
  if (b.telefono !== undefined && b.telefono !== "") {
    const t = textoUnaLinea(b.telefono, LEAD_MAX.telefono)
    if (t === null) return fallo("invalid_phone")
    if (t.length > 0) {
      const e164 = normalizarTelefonoE164(t)
      if (e164 === null) return fallo("phone_needs_prefix")
      telefono = e164
    }
  }

  if (typeof b.locale !== "string" || !(routing.locales as readonly string[]).includes(b.locale)) {
    return fallo("invalid_locale")
  }

  let municipio: string | undefined
  if (b.municipio !== undefined && b.municipio !== "") {
    const m = textoUnaLinea(b.municipio, LEAD_MAX.municipio)
    if (m === null) return fallo("invalid_municipio")
    if (m.length > 0) municipio = m
  }

  let dormitorios: number | undefined
  if (b.dormitorios !== undefined && b.dormitorios !== null) {
    if (typeof b.dormitorios !== "number" || !Number.isInteger(b.dormitorios) || b.dormitorios < 1 || b.dormitorios > 30) {
      return fallo("invalid_dormitorios")
    }
    dormitorios = b.dormitorios
  }

  const { precioNoche, ocupacionPct } = b
  if (typeof precioNoche !== "number" || typeof ocupacionPct !== "number") return fallo("invalid_calculo")
  if (ocupacionPct < OCUPACION_MIN || ocupacionPct > OCUPACION_MAX || estimar(precioNoche, ocupacionPct) === null) {
    return fallo("invalid_calculo")
  }

  return {
    ok: true,
    honeypot,
    lead: { nombre, email, telefono, locale: b.locale, municipio, dormitorios, precioNoche, ocupacionPct },
  }
}

/**
 * Cuerpo del POST al portal: el contrato de `leadPropietarioSchema` de seda_os
 * (lib/leads-publico.ts, `.strict()`). Solo esos campos: cualquier otro da 400.
 * `origen` y `base_juridica` los fija el portal (web-calculadora / consentimiento).
 * `consentimiento_version` es la fecha de la política de privacidad que vio la
 * persona. La estimación NO viaja: el CRM no la guarda y se recalcula con la
 * tarifa cuando haga falta.
 */
export function cuerpoPortal(lead: Lead) {
  return {
    nombre: lead.nombre,
    correo: lead.email.toLowerCase(),
    telefono: lead.telefono ?? null,
    municipio: lead.municipio ?? null,
    dormitorios: lead.dormitorios ?? null,
    consentimiento: true as const,
    consentimiento_version: PRIVACIDAD.actualizado,
  }
}