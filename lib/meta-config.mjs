/*
  Meta (píxel + API de conversiones) — interruptores y orígenes. Plan «Motor SEDA», fase 1.

  Es un .mjs, y no un .ts, porque lo importan dos mundos: `next.config.mjs`
  (que genera la CSP) y el código de la app. Sin dependencias, sin secretos:
  aquí solo se LEE si algo está encendido, nunca se guarda un valor sensible.

  ── Los dos interruptores (apagados por defecto, fail closed) ────────────────
  · SEDA_FLAG_META_PIXEL = "1"  → aviso de cookies, píxel con consentimiento,
    dominios de Meta en la CSP. Solo el valor exacto "1".
    Necesita además NEXT_PUBLIC_META_PIXEL_ID (solo dígitos): con el flag
    encendido y sin un ID válido NO hay nada (ni aviso, ni CSP ampliada). Un
    aviso que pide permiso para una herramienta que no existe sería mentir.
  · SEDA_FLAG_META_CAPI = "1"   → el mismo Lead, desde el servidor. Solo tiene
    efecto con el píxel encendido (el consentimiento sale del aviso, que solo
    existe con el píxel) y con META_CAPI_TOKEN (solo servidor, nunca NEXT_PUBLIC_).

  Las páginas son estáticas: el valor se lee al hacer el build. Cambiarlo en
  Vercel exige un redeploy, igual que SEDA_FLAG_CALCULADORA_PROPIETARIOS.
*/

/** @typedef {Record<string, string | undefined>} Env */

/** Un ID de píxel de Meta son dígitos (15-16 hoy). Se acepta 8-20 para no atar el código a una longitud. */
export const META_PIXEL_ID_RE = /^\d{8,20}$/

/** Un token de la API de conversiones mide cientos de caracteres. Por debajo de esto es un valor de relleno. */
export const META_CAPI_TOKEN_MIN = 20

/**
 * Orígenes que necesita el píxel, por directiva de la CSP. Fuente: la guía de
 * Meta para el píxel con una Content-Security-Policy (script desde
 * connect.facebook.net; avisos y fallback de imagen a www.facebook.com).
 * Pendiente de contrastar con un navegador real y el Probador de eventos de Meta.
 */
export const ORIGENES_META = Object.freeze({
  "script-src": ["https://connect.facebook.net"],
  "img-src": ["https://www.facebook.com"],
  "connect-src": ["https://www.facebook.com", "https://connect.facebook.net"],
})

/** Endpoint de la API de conversiones (solo servidor: no entra en la CSP, que es del navegador). */
export const META_GRAPH_ORIGEN = "https://graph.facebook.com"
/** Versión de la Graph API. Meta retira versiones a los ~2 años: revisar contra la vigente. */
export const META_GRAPH_VERSION = "v23.0"

/** @param {Env} [env] @returns {string | null} el ID del píxel, o null si falta o no es válido. */
export function metaPixelId(env = process.env) {
  const id = (env.NEXT_PUBLIC_META_PIXEL_ID ?? "").trim()
  return META_PIXEL_ID_RE.test(id) ? id : null
}

/** @param {Env} [env] ¿Está encendido el píxel? Flag "1" Y un ID válido. */
export function metaPixelActivo(env = process.env) {
  return env.SEDA_FLAG_META_PIXEL === "1" && metaPixelId(env) !== null
}

/** @param {Env} [env] ¿Está encendida la API de conversiones? Píxel encendido Y flag "1" Y token. */
export function metaCapiActivo(env = process.env) {
  return (
    metaPixelActivo(env) &&
    env.SEDA_FLAG_META_CAPI === "1" &&
    (env.META_CAPI_TOKEN ?? "").trim().length >= META_CAPI_TOKEN_MIN
  )
}

/**
 * Avisos de configuración incoherente para el build (flag encendido sin lo que
 * necesita). No devuelve valores: solo nombres de variables.
 * @param {Env} [env] @returns {string[]}
 */
export function avisosConfiguracionMeta(env = process.env) {
  /** @type {string[]} */
  const avisos = []
  if (env.SEDA_FLAG_META_PIXEL === "1" && metaPixelId(env) === null) {
    avisos.push("SEDA_FLAG_META_PIXEL=1 pero NEXT_PUBLIC_META_PIXEL_ID falta o no es numérico: el píxel y el aviso quedan APAGADOS.")
  }
  if (env.SEDA_FLAG_META_CAPI === "1" && !metaCapiActivo(env)) {
    avisos.push("SEDA_FLAG_META_CAPI=1 pero falta el píxel encendido o META_CAPI_TOKEN: la API de conversiones queda APAGADA.")
  }
  return avisos
}
