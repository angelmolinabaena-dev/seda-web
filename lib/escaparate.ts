/*
  Escaparate de villas: la ficha pública de cada casa que SEDA gestiona y su
  enlace a la booking page de Beds24. Beds24 es la única fuente de verdad de
  las reservas: la web no crea reservas, no calcula precios y no cobra. Solo
  enlaza, con las fechas ya puestas si el visitante las ha elegido.

  ── Puerta: SEDA_FLAG_ESCAPARATE_VILLAS ─────────────────────────────────

  En Andalucía un anuncio de vivienda turística tiene que mostrar su número
  de inscripción en el Registro de Turismo (VFT). Mientras no lo haya, el
  escaparate entero va detrás de este flag, APAGADO salvo que valga
  exactamente "1". Se lee en build (las fichas son estáticas): cambiarlo en
  Vercel exige un nuevo despliegue.

    · Flag apagado → /villa/<slug> da 404, fuera del sitemap, sin enlaces
      internos y con noindex.
    · Flag encendido sin número de registro → la ficha se ve (para revisarla
      en la preview) pero sigue con noindex y fuera del sitemap.
    · Flag encendido y número de registro → indexable.

  ── Datos ───────────────────────────────────────────────────────────────

  Solo datos con fuente. Un campo sin fuente se queda `undefined` y la ficha
  no lo pinta: nada de huéspedes, metros ni distancias inventados.
  `propId`/`roomId` NO viven aquí: vienen de SEDA_BEDS24_ESCAPARATE (ver
  `beds24Ids`), de modo que cambiar de habitación en Beds24 no exige tocar
  código.
*/

export type Foto = {
  src: string
  /** Clave en messages/<locale>.json con el texto alternativo. */
  altKey: string
  /**
   * PROVISIONAL: render ilustrativo, no foto de la casa. Lleva el rótulo
   * «Imagen ilustrativa» y la marca `data-provisional` en el HTML. Cambiar por
   * la fotografía real y poner `provisional: false`.
   */
  provisional: boolean
}

export type FichaVilla = {
  slug: string
  nombre: string
  /** Clave de tipo de alojamiento en `escaparate.tipo.*`. */
  tipo: "apartamento" | "villa"
  /** Fuente: Beds24, campo `city` de la propiedad (leído el 15-oct-2026). */
  municipio: string
  /**
   * Número de inscripción en el Registro de Turismo de Andalucía (VFT/…).
   * `null` mientras no exista: la ficha no se indexa ni entra en el sitemap.
   */
  registroTuristico: string | null
  /** Fuente: Beds24, `checkInStart`/`checkInEnd`/`checkOutEnd` (15-oct-2026). */
  horario: { entradaDesde: string; entradaHasta: string; salidaHasta: string }
  /** Lo esencial de un vistazo. Sin fuente en el repo → `undefined` → no se pinta. */
  esencial: {
    huespedes?: number
    dormitorios?: number
    banos?: number
    metros?: number
    piscina?: boolean
    terraza?: boolean
    /** Minutos a pie hasta la playa. */
    playaMinutos?: number
  }
  /** Claves en `escaparate.normas.*`. Vacío → la sección no se pinta. */
  normas: string[]
  fotos: Foto[]
}

export const VILLAS: FichaVilla[] = [
  {
    slug: "bay-side",
    nombre: "Bay Side",
    tipo: "apartamento",
    municipio: "Estepona",
    registroTuristico: null,
    horario: { entradaDesde: "16:00", entradaHasta: "24:00", salidaHasta: "10:00" },
    // Sin fuente en el repo para ninguno de estos datos. Beds24 dice
    // maxPeople = 4, pero no está entre los datos autorizados: lo confirma Ángel.
    esencial: {},
    normas: [],
    fotos: [
      // PROVISIONAL — renders ilustrativos, no son Bay Side.
      { src: "/villas/journey-durante.jpg", altKey: "escaparate.fotos.terraza", provisional: true },
      { src: "/villas/journey-antes.jpg", altKey: "escaparate.fotos.bienvenida", provisional: true },
      { src: "/villas/journey-despues.jpg", altKey: "escaparate.fotos.despedida", provisional: true },
    ],
  },
]

type Env = Record<string, string | undefined>

/** ¿Está encendido el escaparate? Solo con el valor exacto "1": fail closed. */
export function escaparateActivo(env: Env = process.env): boolean {
  return env.SEDA_FLAG_ESCAPARATE_VILLAS === "1"
}

/** Las fichas que existen como ruta. Flag apagado → ninguna. */
export function villasVisibles(env: Env = process.env): FichaVilla[] {
  return escaparateActivo(env) ? VILLAS : []
}

export function getVillaVisible(slug: string, env: Env = process.env): FichaVilla | undefined {
  return villasVisibles(env).find((v) => v.slug === slug)
}

/** Indexable = flag encendido Y número de registro turístico. Si no, noindex y fuera del sitemap. */
export function esIndexable(villa: FichaVilla, env: Env = process.env): boolean {
  return escaparateActivo(env) && Boolean(villa.registroTuristico?.trim())
}

export function villasIndexables(env: Env = process.env): FichaVilla[] {
  return villasVisibles(env).filter((v) => esIndexable(v, env))
}

export type Beds24Ids = { propId: number; roomId?: number }

/**
 * `propId`/`roomId` de cada ficha, desde SEDA_BEDS24_ESCAPARATE:
 *   {"bay-side":{"propId":348601,"roomId":719434}}
 * Sin variable, JSON roto o ids no numéricos → `undefined`, y la ficha cae a
 * «Solicitar estancia» por /contacto en vez de pintar un enlace roto.
 */
export function beds24Ids(slug: string, env: Env = process.env): Beds24Ids | undefined {
  const raw = env.SEDA_BEDS24_ESCAPARATE
  if (!raw) return undefined
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return undefined
  }
  const entrada = (parsed as Record<string, unknown> | null)?.[slug] as Record<string, unknown> | undefined
  const propId = Number(entrada?.propId)
  if (!Number.isInteger(propId) || propId <= 0) return undefined
  const roomId = entrada?.roomId === undefined ? undefined : Number(entrada.roomId)
  if (roomId !== undefined && (!Number.isInteger(roomId) || roomId <= 0)) return undefined
  return { propId, roomId }
}

export type Seleccion = { checkin?: string; checkout?: string; huespedes?: number }

const FECHA = /^\d{4}-\d{2}-\d{2}$/

/** "AAAA-MM-DD" que existe en el calendario (2026-02-30 no). */
function fechaValida(s: string | undefined): s is string {
  if (!s || !FECHA.test(s)) return false
  const d = new Date(`${s}T00:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s
}

export const BEDS24_BOOKING_URL = "https://beds24.com/booking2.php"

/**
 * URL de la booking page de Beds24 para una ficha.
 *
 * Parámetros documentados por Beds24 (wiki «Embedded Iframe», lista
 * `validParameters`): propid, roomid, checkin, checkout, numadult, lang,
 * referer. Fechas en AAAA-MM-DD — comprobado el 15-oct-2026 cargando la
 * booking page de Bay Side: `checkin=2026-11-10&checkout=2026-11-13` se lee
 * como llegada el 10 y 3 noches.
 *
 * Las fechas solo viajan si las dos son válidas y la salida es posterior a la
 * llegada; si no, Beds24 abre con su propio selector. UTM para medir desde
 * dónde llega la reserva.
 */
export function urlReservaBeds24(
  ids: Beds24Ids,
  seleccion: Seleccion,
  { locale, slug }: { locale: string; slug: string },
): string {
  const p = new URLSearchParams()
  p.set("propid", String(ids.propId))
  if (ids.roomId) p.set("roomid", String(ids.roomId))
  const { checkin, checkout, huespedes } = seleccion
  if (fechaValida(checkin) && fechaValida(checkout) && checkout > checkin) {
    p.set("checkin", checkin)
    p.set("checkout", checkout)
  }
  if (huespedes && Number.isInteger(huespedes) && huespedes > 0) p.set("numadult", String(huespedes))
  p.set("lang", locale)
  p.set("referer", "sedaprivatehomes.com")
  p.set("utm_source", "sedaprivatehomes.com")
  p.set("utm_medium", "referral")
  p.set("utm_campaign", "escaparate")
  p.set("utm_content", slug)
  return `${BEDS24_BOOKING_URL}?${p.toString()}`
}
