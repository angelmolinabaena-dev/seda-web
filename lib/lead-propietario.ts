import { routing } from "@/i18n/routing"
import { cartaParaEnviar } from "@/lib/carta-qr"
import { MAX_EMAIL_LENGTH, esEmailValido } from "@/lib/api-guards"
import { HONEYPOT_FIELD, HONEYPOT_MAX } from "@/lib/contact-fields"
import { OCUPACION_MAX, OCUPACION_MIN, estimar } from "@/lib/calculadora-propietarios"
import { privacidadVigente } from "@/lib/legal/meta"
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
  /** Código de la carta postal (?carta= del QR), tal cual llegó; solo si mide 1–40 caracteres. */
  carta?: string
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

/** Los datos de contacto comunes a los dos formularios (calculadora y asistente). */
export type Contacto = {
  nombre: string
  email: string
  telefono?: string
  locale: string
  /** Código de la carta postal (?carta= del QR), tal cual llegó; solo si mide 1–40 caracteres. */
  carta?: string
}

type ResultadoContacto = { ok: true; contacto: Contacto; honeypot: boolean } | { ok: false; error: string }

/**
 * Honeypot, consentimiento, nombre, correo, teléfono, idioma y carta: las reglas
 * comunes. `b` ya es un objeto y sus claves ya se han comprobado.
 */
function validarContacto(b: Record<string, unknown>): ResultadoContacto {
  // Honeypot: se mira el valor pero la decisión se toma después de validar todo,
  // para que un bot reciba la misma respuesta que un envío bueno.
  const trampa = b[HONEYPOT_FIELD]
  if (trampa !== undefined && typeof trampa !== "string") return { ok: false, error: "invalid_field_value" }
  if (typeof trampa === "string" && trampa.length > HONEYPOT_MAX) return { ok: false, error: "field_too_long" }
  const honeypot = typeof trampa === "string" && trampa.trim().length > 0

  if (b.consentimiento !== true) return { ok: false, error: "consent_required" }

  const nombre = textoUnaLinea(b.nombre, LEAD_MAX.nombre)
  if (nombre === null) return { ok: false, error: "invalid_name" }
  if (nombre.length === 0) return { ok: false, error: "missing_field" }

  const email = typeof b.email === "string" ? b.email.trim() : ""
  if (email.length > MAX_EMAIL_LENGTH || !esEmailValido(email)) return { ok: false, error: "invalid_email" }

  // V4-04: la regla del teléfono es la de seda_os (lib/telefono-e164.ts, copia
  // atada por contrato). Lo que seda_os rechazaría se para AQUÍ, con un error
  // que el formulario entiende («escriba el prefijo»), y no allí con un 502.
  // Viaja ya en E.164: el portal lo normaliza otra vez y le da lo mismo.
  let telefono: string | undefined
  if (b.telefono !== undefined && b.telefono !== "") {
    const t = textoUnaLinea(b.telefono, LEAD_MAX.telefono)
    if (t === null) return { ok: false, error: "invalid_phone" }
    if (t.length > 0) {
      const e164 = normalizarTelefonoE164(t)
      if (e164 === null) return { ok: false, error: "phone_needs_prefix" }
      telefono = e164
    }
  }

  if (typeof b.locale !== "string" || !(routing.locales as readonly string[]).includes(b.locale)) {
    return { ok: false, error: "invalid_locale" }
  }

  // Cartas-QR: se reenvía tal cual, sin validar ni limpiar. Un valor que no es
  // texto o mide más de 40 se omite (no se rechaza el lead por un dato de medición).
  const carta = cartaParaEnviar(b.carta)

  return {
    ok: true,
    honeypot,
    contacto: { nombre, email, telefono, locale: b.locale, ...(carta !== undefined ? { carta } : {}) },
  }
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
    "precioNoche", "ocupacionPct", "carta", HONEYPOT_FIELD,
  ])
  if (Object.keys(b).some((k) => !permitidos.has(k))) return fallo("unknown_field")

  const c = validarContacto(b)
  if (!c.ok) return fallo(c.error)

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

  const { nombre, email, telefono, locale, carta } = c.contacto
  return {
    ok: true,
    honeypot: c.honeypot,
    lead: { nombre, email, telefono, locale, municipio, dormitorios, precioNoche, ocupacionPct, ...(carta !== undefined ? { carta } : {}) },
  }
}

export type ResultadoLeadAsistente =
  | { ok: true; lead: Contacto; honeypot: boolean }
  | { ok: false; error: string }

/**
 * El mini formulario del asistente (app/api/asistente/solicitud): nombre, correo,
 * teléfono opcional, consentimiento, idioma y carta. Mismas reglas que la
 * calculadora, sin precio ni ocupación: el chat no manda ninguna cifra.
 */
export function validarLeadAsistente(body: unknown): ResultadoLeadAsistente {
  if (typeof body !== "object" || body === null || Array.isArray(body)) return { ok: false, error: "invalid_body" }
  const b = body as Record<string, unknown>
  const permitidos = new Set(["nombre", "email", "telefono", "consentimiento", "locale", "carta", HONEYPOT_FIELD])
  if (Object.keys(b).some((k) => !permitidos.has(k))) return { ok: false, error: "unknown_field" }
  const c = validarContacto(b)
  if (!c.ok) return c
  return { ok: true, lead: c.contacto, honeypot: c.honeypot }
}

/** Por dónde llegó la persona (contrato de seda_os, docs/CONTRATO-LEADS-CANAL-CARTA.md de portal-propietarios). */
export type CanalLead = "calculadora" | "asistente"

/**
 * Cuerpo del POST al portal: el contrato de `leadPropietarioSchema` de seda_os
 * (lib/leads-publico.ts, `.strict()`). Solo esos campos: cualquier otro da 400.
 * `origen` y `base_juridica` los fija el portal (web-calculadora / consentimiento).
 * `consentimiento_version` es la fecha de la política de privacidad que vio la
 * persona. La estimación NO viaja: el CRM no la guarda y se recalcula con la
 * tarifa cuando haga falta.
 */
export function cuerpoPortal(lead: Contacto & Partial<Omit<Lead, keyof Contacto>>, canal: CanalLead = "calculadora") {
  return {
    nombre: lead.nombre,
    correo: lead.email.toLowerCase(),
    telefono: lead.telefono ?? null,
    municipio: lead.municipio ?? null,
    dormitorios: lead.dormitorios ?? null,
    consentimiento: true as const,
    consentimiento_version: privacidadVigente().actualizado,
    // Locale de la página desde la que se envió el formulario (es|en|de|fr):
    // seda_os lo usa para contestar en ese idioma. Única clave añadida.
    idioma: lead.locale,
    // Cartas-QR (seda_os #1150): `canal` siempre ("calculadora" o "asistente");
    // `carta` solo si venía en la URL.
    // Ninguna cifra de la estimación viaja (decisión del 6-nov).
    // "asistente" → seda_os guarda origen 'web-asistente'.
    canal,
    ...(lead.carta !== undefined ? { carta: lead.carta } : {}),
  }
}