import { TARIFA, comisionGestion } from "@/lib/tarifa"

/*
  Calculadora de propietarios — «¿Cuánto ganaría su casa con SEDA?»
  (/propietarios/calculadora).

  Este módulo es ligero a propósito (lo importa el componente de cliente): el
  flag y el cálculo. La validación del lead y el cuerpo que viaja al portal
  están en `lib/lead-propietario.ts`, que solo se usa en el servidor.

  ── El flag ─────────────────────────────────────────────────────────────────
  `SEDA_FLAG_CALCULADORA_PROPIETARIOS=1` enciende la página, el POST de la
  ruta `/api/leads/propietario`, la entrada del sitemap y los enlaces desde la
  portada y /propietarios. Apagado (o con cualquier otro valor) no hay nada:
  la página es un 404 y la ruta responde 404 sin llamar a nadie. Fail closed,
  igual que `escaparateActivo` (lib/escaparate.ts).

  ── El cálculo ──────────────────────────────────────────────────────────────
  Ninguna cifra de la tarifa está escrita aquí: la comisión sale de
  `comisionGestion` (lib/tarifa), que lee lib/tarifa/tarifa.json (v6).

    alojamiento anual = ocupación × 365 × precio medio por noche
    comisión SEDA     = la menor de  21 % × (alojamiento − comisión del canal)
                                 y   20 % × alojamiento
    neto              = alojamiento − comisión del canal − comisión SEDA
    IVA de la comisión: aparte, no está restado del neto.

  La limpieza NO entra: la paga el huésped y es íntegra del propietario
  (prop.sim.net_note), y el precio por noche que se pide es tarifa de
  alojamiento, sin limpieza. Por eso no hay una línea con cifra de limpieza:
  no hay ningún dato (ni un campo) del que sacarla.

  No hay mix de canal por defecto en el repo, así que se enseñan los dos
  extremos honestos, como el simulador de /propietarios: reserva directa (0 %
  de canal) y un canal que cobra `TARIFA.ejemplos.canalPct` (el ejemplo de la
  tarifa, no una media de mercado).

  ── El IVA del alojamiento, desde el 1-dic-2026 (V4-04) ───────────────────
  Con el RDL 29/2026 (efectos 1-dic-2026), el alojamiento de una estancia de
  30 noches o menos tributa al 10 % y el precio al huésped es IVA INCLUIDO: la
  cuota va dentro del precio. Esa cuota no es ingreso de la propietaria ni base
  de la comisión: seda_os la quita antes de calcular (D-3, #1129;
  docs/REGLAS-NEGOCIO.md de seda_os, «estancia de 30 noches o menos»).

  seda_os saca la cuota con `ivaAlojamientoPorCobro`, que reparte por COBROS.
  La web no tiene cobros ni estancias: tiene un precio por noche y una
  ocupación. Así que aquí va la regla del precio, tal cual: desde el 1-dic, el
  precio por noche es IVA incluido y la cuota es precio × 10 / 110, como si
  todas las estancias fueran de 30 noches o menos (lo normal en un piso
  turístico; la ayuda del precio lo dice). Antes del 1-dic el alojamiento está
  exento y el precio es todo alojamiento.

    lo que pagan los huéspedes = ocupación × 365 × precio por noche
    cuota del 10 %             = lo que pagan × 10 / 110   (0 antes del 1-dic)
    alojamiento anual          = lo que pagan − cuota
    comisión del canal         = % del canal × lo que pagan (el canal cobra sobre el precio)
    comisión SEDA              = la de arriba, sobre el alojamiento SIN la cuota

  110 €/noche IVA incluido ⇒ 100 € de alojamiento y 10 € de cuota.

  La fecha se compara como texto `YYYY-MM-DD` (hora de Madrid), nunca como Date.

  Todo en euros enteros. Cada componente se redondea al euro y el neto se
  calcula con los componentes ya redondeados, de modo que lo que se ve suma
  exactamente (bruto − canal − comisión = neto). Con un redondeo al final como
  el de `netoAnual` la diferencia sería de ≤ 1 €; aquí manda que la cuenta cuadre.
*/

type Env = Record<string, string | undefined>

/** ¿Está encendida la calculadora? Solo con el valor exacto "1": fail closed. */
export function calculadoraPropietariosActiva(env: Env = process.env): boolean {
  return env.SEDA_FLAG_CALCULADORA_PROPIETARIOS === "1"
}

/** Ruta pública de la calculadora, sin prefijo de idioma. */
export const RUTA_CALCULADORA = "/propietarios/calculadora"

/** Rango del deslizador de ocupación y tope del precio por noche (el servidor valida los mismos). */
export const OCUPACION_MIN = 10
export const OCUPACION_MAX = 95
export const PRECIO_NOCHE_MAX = 100_000

/** Primer día con el 10 % de IVA en el alojamiento (RDL 29/2026). Mismo valor que `FECHA_CORTE_IVA_VUT` de seda_os. */
export const FECHA_CORTE_IVA_ALOJAMIENTO = "2026-12-01"
/** Tipo del IVA del alojamiento desde el corte. */
export const IVA_ALOJAMIENTO_PCT = 10
/** Estancias de hasta estas noches, incluida, llevan el 10 % («no superior a 30 noches»). Mismo valor que `MAX_NOCHES_IVA_VUT`. */
export const MAX_NOCHES_IVA_ALOJAMIENTO = 30

/** Hoy en Madrid, `YYYY-MM-DD`. */
export function hoyMadrid(ahora: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit" }).format(ahora)
}

/** ¿Lleva el precio por noche el 10 % de IVA dentro? Desde el corte, sí. Comparación de texto `YYYY-MM-DD`. */
export function precioConIvaAlojamiento(hoy: string): boolean {
  return hoy >= FECHA_CORTE_IVA_ALOJAMIENTO
}

/** Precio por noche sin la cuota del 10 %, al céntimo. Antes del corte, el mismo precio. */
export function precioNocheSinIva(precioNoche: number, hoy: string): number {
  if (!precioConIvaAlojamiento(hoy)) return precioNoche
  return Math.round((precioNoche * 100 * 100) / (100 + IVA_ALOJAMIENTO_PCT)) / 100
}

export type Escenario = {
  /** Comisión que se queda el canal (OTA), en euros. 0 en reserva directa. */
  canal: number
  /** Comisión de SEDA sin IVA, en euros. */
  comision: number
  /** IVA de la comisión, en euros. Aparte: no está restado del neto. */
  iva: number
  /** Neto antes de IVA de la comisión y de los impuestos del propietario, en euros. */
  neto: number
}

export type Estimacion = {
  tarifa: string
  /** Ingresos brutos anuales por alojamiento, en euros. Desde el 1-dic, SIN la cuota del 10 % de IVA. */
  alojamientoAnual: number
  /** Lo que pagan los huéspedes en el año por el alojamiento, en euros (IVA incluido desde el 1-dic). */
  pagadoHuespedes: number
  /** Cuota del 10 % de IVA del alojamiento que va dentro de lo pagado, en euros. 0 antes del 1-dic. */
  cuotaIvaAlojamiento: number
  /** ¿Se ha quitado la cuota? (fecha de cálculo ≥ 1-dic-2026). */
  ivaAlojamientoIncluido: boolean
  /** % de comisión del canal del escenario «por un canal» (ejemplo de la tarifa). */
  canalPct: number
  directa: Escenario
  conCanal: Escenario
}

function escenario(alojamiento: number, canalEur: number): Escenario {
  const c = comisionGestion(alojamiento, canalEur)
  const canal = Math.round(canalEur)
  const comision = Math.round(c.comision / 100)
  return { canal, comision, iva: Math.round(c.iva / 100), neto: alojamiento - canal - comision }
}

/**
 * Estimación anual. `null` si el precio o la ocupación no son un número
 * utilizable: no se calcula nada con la entrada a medias.
 *
 * `hoy` (`YYYY-MM-DD`) decide si el precio lleva dentro el 10 % de IVA del
 * alojamiento; por defecto, hoy en Madrid.
 */
export function estimar(precioNoche: number, ocupacionPct: number, hoy: string = hoyMadrid()): Estimacion | null {
  if (!Number.isFinite(precioNoche) || !Number.isFinite(ocupacionPct)) return null
  if (precioNoche <= 0 || precioNoche > PRECIO_NOCHE_MAX) return null
  if (ocupacionPct <= 0 || ocupacionPct > 100) return null

  const conIva = precioConIvaAlojamiento(hoy)
  const pagadoHuespedes = Math.round((ocupacionPct / 100) * 365 * precioNoche)
  const cuotaIvaAlojamiento = conIva ? Math.round((pagadoHuespedes * IVA_ALOJAMIENTO_PCT) / (100 + IVA_ALOJAMIENTO_PCT)) : 0
  const alojamientoAnual = pagadoHuespedes - cuotaIvaAlojamiento
  const canalPct = TARIFA.ejemplos.canalPct
  return {
    tarifa: TARIFA.version,
    alojamientoAnual,
    pagadoHuespedes,
    cuotaIvaAlojamiento,
    ivaAlojamientoIncluido: conIva,
    canalPct,
    directa: escenario(alojamientoAnual, 0),
    // El canal cobra sobre lo que paga el huésped, con la cuota dentro (como `comision_plataforma` en seda_os).
    conCanal: escenario(alojamientoAnual, (pagadoHuespedes * canalPct) / 100),
  }
}

/* ── El formulario: qué hace con la respuesta de la ruta (V4-04) ─────────── */

export type EstadoFormulario = "reposo" | "enviando" | "ok" | "error" | "limite" | "datos"

/**
 * Lo que el formulario hace con la respuesta de /api/leads/propietario.
 * Un dato que el portal no aceptaría NO es «inténtelo en unos minutos»:
 *   · 400 `phone_needs_prefix` → «telefono»: el campo pide el prefijo internacional;
 *   · 422 `rejected_data` (el portal dijo 400) → «datos»: revise sus datos;
 *   · 429 → límite; cualquier otro fallo (5xx, 502, red) → error genérico.
 */
export function estadoTrasRespuesta(status: number, error: string | undefined): EstadoFormulario | "telefono" {
  if (status >= 200 && status < 300) return "ok"
  if (status === 400 && error === "phone_needs_prefix") return "telefono"
  if (status === 422) return "datos"
  if (status === 429) return "limite"
  return "error"
}
