/*
  Escaparate de villas: la ficha pública de cada casa que SEDA gestiona y su
  enlace a la booking page de Beds24. Beds24 es la única fuente de verdad de
  las reservas: la web no crea reservas, no calcula precios y no cobra. Solo
  enlaza, con las fechas ya puestas si el visitante las ha elegido.

  ── Puerta: SEDA_FLAG_ESCAPARATE_VILLAS ─────────────────────────────────

  En Andalucía un anuncio de vivienda turística tiene que mostrar su número
  de inscripción en el Registro de Turismo (VFT). El escaparate lleva DOS
  cerraduras y las dos tienen que estar abiertas:

    · el flag, APAGADO salvo que valga exactamente "1". Se lee en build (las
      fichas son estáticas): cambiarlo en Vercel exige un nuevo despliegue;
    · la casa: número de registro turístico informado Y arrendador (el
      propietario) informado, porque la ficha pinta los dos. Sin alguno de
      ellos la casa no se publica, con el flag que sea.

  El flag solo no basta (REA seda-web 2026-10, B-1): era una cerradura sin
  llave. Una ficha sin VFT con un botón «Reservar» es un anuncio ilegal aunque
  lleve noindex, porque la URL circula.

    · Flag apagado, o casa sin VFT / sin arrendador → /villa/<slug> da 404,
      fuera del sitemap, sin enlaces internos, y /coleccion dice «Próxima
      apertura».
    · Flag encendido y casa completa → ficha visible e indexable.

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
   * `null` mientras no exista: sin él la casa no se publica (ver `esPublicable`).
   */
  registroTuristico: string | null
  /**
   * Arrendador: el propietario, tal y como figura en el contrato de gestión
   * (nombre o razón social). SEDA gestiona «en nombre y por cuenta» suya (DGT
   * V0367-18) y la ficha lo dice: «Arrendador: … · gestiona SEDA Private
   * Homes». `null` mientras Ángel no lo dé: sin él la casa no se publica. No se
   * inventa.
   */
  arrendador: string | null
  /**
   * ¿La casa tiene cerradura conectada con acceso autónomo? Solo entonces la
   * ficha promete «llegada sin llaves». `false` = no consta (por defecto).
   */
  cerradura: boolean
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
    arrendador: null,
    // Bay Side no tiene nuki_id ni nuki_code en la base (REA-GLOBAL-PLATAFORMA
    // 2026-10 §1): no se promete llegada sin llaves hasta que lo tenga.
    cerradura: false,
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

/**
 * ¿Puede esta casa anunciarse? Número de registro turístico Y arrendador
 * informados (la ficha pinta los dos). Es la llave; el flag, la cerradura.
 */
export function esPublicable(villa: FichaVilla): boolean {
  return Boolean(villa.registroTuristico?.trim()) && Boolean(villa.arrendador?.trim())
}

/** Las fichas que existen como ruta: flag encendido Y casa publicable. Si no, ninguna. */
export function villasVisibles(env: Env = process.env): FichaVilla[] {
  return escaparateActivo(env) ? VILLAS.filter(esPublicable) : []
}

export function getVillaVisible(slug: string, env: Env = process.env): FichaVilla | undefined {
  return villasVisibles(env).find((v) => v.slug === slug)
}

/**
 * Indexable = visible. Ya no hay rama intermedia «visible pero noindex»: lo que
 * se ve, con su botón de reserva, es lo que se anuncia, y se anuncia con VFT.
 */
export function esIndexable(villa: FichaVilla, env: Env = process.env): boolean {
  return escaparateActivo(env) && esPublicable(villa)
}

export function villasIndexables(env: Env = process.env): FichaVilla[] {
  return villasVisibles(env).filter((v) => esIndexable(v, env))
}

/** Claves de `escaparate.incluye.*` que esta casa puede prometer. «Llegada sin llaves» solo con cerradura. */
export function incluyeVilla(villa: FichaVilla): ("llegada" | "concierge" | "limpieza")[] {
  return [...(villa.cerradura ? (["llegada"] as const) : []), "concierge", "limpieza"]
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
