/*
  Guardas de las rutas de entrada de datos de seda-web, para las que no son
  `/api/contact`.

  Son la misma lógica que `app/api/contact/route.ts` (origen, IP del cliente,
  email de una sola dirección). Esa ruta las tiene escritas dentro y no se ha
  tocado: es la puerta de producción y este módulo llega detrás de un flag
  apagado, así que el sitio con el flag apagado queda idéntico. Unificar las
  dos copias es un PR aparte, con `tests/contact-route.test.ts` delante.

  Un `route.ts` de Next no puede exportar nada que no sea un verbo HTTP o una
  opción de segmento, por eso viven en `lib/`.
*/

const SITE_HOSTS = ["sedaprivatehomes.com", "www.sedaprivatehomes.com"]

/**
 * ¿La petición viene de una página de este mismo sitio? Un navegador manda
 * `Origin` en todo POST y la página que lo escribe no puede falsearlo.
 * `Sec-Fetch-Site`, si viene, tiene que decir same-origin. Sin `Origin`
 * (curl, scripts) no se acepta. No frena un script que falsee cabeceras: eso es
 * del límite de frecuencia y del Firewall de Vercel.
 */
export function esMismoOrigen(req: Request): boolean {
  const origin = req.headers.get("origin")
  if (!origin) return false
  const fetchSite = req.headers.get("sec-fetch-site")
  if (fetchSite && fetchSite !== "same-origin") return false
  let host: string
  try {
    host = new URL(origin).host
  } catch {
    return false
  }
  const propios = new Set(SITE_HOSTS)
  for (const h of [new URL(req.url).host, req.headers.get("host"), req.headers.get("x-forwarded-host")]) {
    if (h) propios.add(h.split(",")[0].trim())
  }
  return propios.has(host)
}

export function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for")
  if (fwd) return fwd.split(",")[0].trim()
  return req.headers.get("x-real-ip")?.trim() || "unknown"
}

/**
 * Límite de frecuencia por instancia (ventana deslizante en memoria). Serverless:
 * NO es global, solo frena el goteo desde un mismo script contra una instancia
 * caliente. El límite que dura es una regla en el Firewall de Vercel. La IP no
 * pasa de la ventana en memoria y se purga en cada llamada.
 */
export function crearLimitador(max: number, ventanaMs: number) {
  const hits = new Map<string, number[]>()
  return function limitar(key: string, ahora = Date.now()) {
    const desde = ahora - ventanaMs
    for (const [k, stamps] of hits) {
      if (stamps.every((t) => t <= desde)) hits.delete(k)
    }
    const recientes = (hits.get(key) ?? []).filter((t) => t > desde)
    if (recientes.length >= max) {
      hits.set(key, recientes)
      return { ok: false as const, retryAfter: Math.max(Math.ceil((recientes[0] + ventanaMs - ahora) / 1000), 1) }
    }
    recientes.push(ahora)
    hits.set(key, recientes)
    return { ok: true as const }
  }
}

/*
  Una sola dirección, nada más. No es RFC 5322: las clases excluyen coma, punto
  y coma, espacios, saltos de línea y paréntesis angulares, para que
  "lead@example.com,otro@evil.tld" no llegue a un reply_to.
*/
const EMAIL_RE =
  /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/
const FORBIDDEN_IN_EMAIL = /[,;<>\s"()[\]:\\]/
export const MAX_EMAIL_LENGTH = 254

export function esEmailValido(value: string): boolean {
  if (value.length === 0 || value.length > MAX_EMAIL_LENGTH) return false
  if (FORBIDDEN_IN_EMAIL.test(value)) return false
  if (!EMAIL_RE.test(value)) return false
  return value.split("@")[0].length <= 64
}
