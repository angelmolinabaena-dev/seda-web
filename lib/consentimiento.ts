/*
  Consentimiento de cookies — el registro de la elección.

  Guía sobre el uso de las cookies de la AEPD (2023): la elección tiene que
  poder demostrarse, cambiarse y retirarse, y no puede durar para siempre. Aquí
  se guarda, en el almacenamiento local del navegador (no en una cookie: no
  viaja en cada petición), esto:

      { "version": "2026-11-06", "fecha": "2026-11-06T10:15:00.000Z", "marketing": true }

  · `version`: la de la política de cookies con Meta (ACTUALIZADO_CON_META). Si
    la política cambia, la elección guardada deja de valer y se pregunta otra vez.
  · `fecha`: cuándo eligió. A los 24 meses se pregunta otra vez.
  · `marketing`: la única categoría opcional. `false` es un rechazo o una
    retirada; también se guarda (con su fecha) para no insistir en cada página.

  Todo lo de aquí es puro (sin window ni document) para poder probarlo.
*/

export const CLAVE_ALMACENAMIENTO = "seda_consentimiento_cookies"
export const MESES_VIGENCIA = 24

export type Eleccion = {
  version: string
  /** ISO 8601 (UTC). */
  fecha: string
  marketing: boolean
}

const FECHA_ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/

/** Lee lo guardado. Cualquier cosa que no sea exactamente una elección válida es «sin elegir». */
export function parsearEleccion(crudo: string | null | undefined): Eleccion | null {
  if (!crudo) return null
  let v: unknown
  try {
    v = JSON.parse(crudo)
  } catch {
    return null
  }
  if (typeof v !== "object" || v === null || Array.isArray(v)) return null
  const { version, fecha, marketing } = v as Record<string, unknown>
  if (typeof version !== "string" || version.length === 0 || version.length > 40) return null
  if (typeof fecha !== "string" || !FECHA_ISO.test(fecha) || Number.isNaN(Date.parse(fecha))) return null
  if (typeof marketing !== "boolean") return null
  return { version, fecha, marketing }
}

export function serializarEleccion(e: Eleccion): string {
  return JSON.stringify({ version: e.version, fecha: e.fecha, marketing: e.marketing })
}

/** Instante en que caduca una elección tomada en `fecha`: 24 meses después, en UTC. */
export function caducidad(fecha: string): Date {
  const d = new Date(fecha)
  d.setUTCMonth(d.getUTCMonth() + MESES_VIGENCIA)
  return d
}

/**
 * ¿Sigue valiendo? Misma versión de la política, menos de 24 meses y una fecha
 * que no esté en el futuro (un reloj o un valor manipulado no la hace eterna).
 */
export function eleccionVigente(e: Eleccion | null, version: string, ahora: Date): e is Eleccion {
  if (!e || e.version !== version) return false
  const tomada = new Date(e.fecha).getTime()
  if (tomada > ahora.getTime() + 5 * 60_000) return false
  return ahora.getTime() < caducidad(e.fecha).getTime()
}

/** Nombres de cookie que pone el píxel de Meta y que se borran al retirar el consentimiento. */
export const COOKIES_META = ["_fbp", "_fbc"] as const
