import { ORIGENES_META, metaPixelActivo } from "./meta-config.mjs"

/*
  Content-Security-Policy GLOBAL (todas las rutas salvo /tour/).

  Vivía en vercel.json como una cadena fija. Pasa a generarse aquí porque los
  dominios de Meta solo pueden estar en la política con SEDA_FLAG_META_PIXEL
  encendido, y vercel.json no puede ser condicional. `next.config.mjs` la
  publica con `headers()` en el mismo `source` que usaba vercel.json.

  ⚠️ NO volver a poner una CSP en la regla global de vercel.json: dos CSP sobre
  una misma respuesta se INTERSECAN, y la de vercel.json (sin Meta) anularía a
  esta. `tests/csp-headers.test.ts` lo vigila.

  Con todo apagado el resultado es, carácter por carácter, la cadena que había
  en vercel.json (el test la compara con una copia literal tomada de git).

  La CSP del visor 360 (/tour/*) sigue en vercel.json: no carga Meta.
*/

/** El mismo `source` que usaba vercel.json: todo menos /tour/ (el visor tiene su propia CSP). */
export const SOURCE_CSP_GLOBAL = "/((?!tour/).*)"

/** Directivas sin Meta, en el orden histórico de vercel.json. */
const BASE = [
  ["default-src", ["'self'"]],
  ["script-src", ["'self'", "'unsafe-inline'"]],
  ["style-src", ["'self'", "'unsafe-inline'"]],
  ["img-src", ["'self'"]],
  ["font-src", ["'self'"]],
  ["connect-src", ["'self'"]],
  ["media-src", ["'self'"]],
  ["frame-src", ["'self'", "https://calendly.com"]],
  ["frame-ancestors", ["'none'"]],
  ["base-uri", ["'self'"]],
  ["form-action", ["'self'"]],
  ["object-src", ["'none'"]],
]

/**
 * @param {Record<string, string | undefined>} [env]
 * @returns {string} la CSP global; con Meta solo si el píxel está encendido.
 */
export function cspGlobal(env = process.env) {
  const meta = metaPixelActivo(env)
  return BASE.map(([nombre, valores]) => {
    const extra = meta ? (ORIGENES_META[/** @type {keyof typeof ORIGENES_META} */ (nombre)] ?? []) : []
    return [nombre, ...valores, ...extra].join(" ")
  }).join("; ")
}
