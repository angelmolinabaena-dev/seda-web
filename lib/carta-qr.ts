/*
  Código de la carta postal (?carta= del QR) — lado navegador.

  Cada carta lleva un QR a /propietarios/calculadora?carta=CODIGO. El código es
  aleatorio (no es un dato personal), pero vincularlo al lead dice que esa
  persona respondió a esa carta. Reglas:

  · Se lee UNA vez al entrar y se quita de la URL con history.replaceState en el
    mismo momento. Así no llega a Meta: ni en el Referer, ni en la URL que lee
    fbevents.js al cargar o al hacer PageView, ni en la `event_source_url` de la
    API de conversiones (que además se construye sin query, ver la ruta).
  · Vive solo en memoria de la página: sin cookie, sin localStorage, sin
    sessionStorage, y nunca en un evento de analítica.
  · `capturarCarta()` la llama también el aviso de cookies ANTES de cargar el
    píxel o de hacer PageView, para que gane la carrera aunque el consentimiento
    ya estuviera dado de una visita anterior.
*/

/** Más de 40 caracteres no se manda (la regla es de seda_os). */
export const CARTA_MAX = 40

const RUTA_CALCULADORA = /\/propietarios\/calculadora\/?$/

/**
 * Separa `carta` del resto de la query. `url` es la query sin `?` inicial
 * resultante (vacía si no queda nada) o null si no había `carta`. El valor es
 * el que la URL decodifica, sin recortar ni limpiar.
 */
export function separarCarta(search: string): { carta: string | null; searchSinCarta: string | null } {
  const sp = new URLSearchParams(search)
  if (!sp.has("carta")) return { carta: null, searchSinCarta: null }
  const valor = sp.get("carta")
  sp.delete("carta")
  const resto = sp.toString()
  return { carta: valor === null || valor === "" ? null : valor, searchSinCarta: resto ? `?${resto}` : "" }
}

/** Lo que se manda a seda_os: el código tal cual, o nada si está vacío o mide más de 40. */
export function cartaParaEnviar(carta: unknown): string | undefined {
  if (typeof carta !== "string" || carta.length === 0 || carta.length > CARTA_MAX) return undefined
  return carta
}

type Pantalla = {
  location: { pathname: string; search: string; hash: string }
  history: { state: unknown; replaceState(data: unknown, unused: string, url?: string | null): void }
}

// Código leído y aún no recogido por la calculadora. Una sola lectura: al
// recogerlo se vacía, para que no se pegue a otra visita de la misma sesión.
let pendiente: string | null = null

/**
 * Si la URL es la de la calculadora y trae ?carta=, lo guarda en memoria y lo
 * quita de la URL. Idempotente: sin ?carta= no toca nada.
 */
export function capturarCarta(win: Pantalla = window): void {
  const { pathname, search, hash } = win.location
  if (!RUTA_CALCULADORA.test(pathname)) return
  const { carta, searchSinCarta } = separarCarta(search)
  if (searchSinCarta === null) return
  if (carta !== null) pendiente = carta
  win.history.replaceState(win.history.state, "", `${pathname}${searchSinCarta}${hash}`)
}

/** La calculadora recoge el código (una vez). */
export function tomarCarta(): string | null {
  const c = pendiente
  pendiente = null
  return c
}
