import { DIAS_PROYECCION, RDL29_IVA_ALOJAMIENTO, diaConIvaAlojamiento, diasConIvaEnProyeccion, rdl29Aplicado } from "@/lib/iva-alojamiento"
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

  ── El IVA del alojamiento (V4-04, D-12) ─────────────────────────────────
  La fecha, el tipo y las noches del RDL 29/2026, y su interruptor
  `SEDA_IVA_ALOJAMIENTO_RDL29`, viven en lib/iva-alojamiento.ts: aquí no hay
  ninguno escrito. Con el RDL, el alojamiento de una estancia de 30 noches o
  menos tributa al 10 % y el precio al huésped es IVA INCLUIDO: la cuota va
  dentro del precio. Esa cuota no es ingreso de la propietaria ni base de la
  comisión: seda_os la quita antes de calcular (D-3, #1129; docs/REGLAS-NEGOCIO.md
  de seda_os, «estancia de 30 noches o menos»).

  seda_os saca la cuota con `ivaAlojamientoPorCobro`, que reparte por COBROS.
  La web no tiene cobros ni estancias: tiene un precio por noche y una
  ocupación. Así que aquí va la regla del precio: en los días con IVA, el precio
  por noche es IVA incluido y la cuota es precio × 10 / 110, como si todas las
  estancias fueran de 30 noches o menos (lo normal en un piso turístico; la
  ayuda del precio lo dice).

  D-12: la estimación proyecta 365 días desde `desde` (hoy en Madrid) y aplica
  el régimen de los días que proyecta, no el de hoy. La cuota sale solo de la
  parte de lo pagado que cae en días con IVA:

    lo que pagan los huéspedes = ocupación × 365 × precio por noche
    días con IVA               = de los 365 desde `desde`, los que son ≥ corte (0 sin el RDL)
    cuota del 10 %             = lo que pagan × días con IVA / 365 × 10 / 110
    alojamiento anual          = lo que pagan − cuota
    comisión del canal         = % del canal × lo que pagan (el canal cobra sobre el precio)
    comisión SEDA              = la de arriba, sobre el alojamiento SIN la cuota

  110 €/noche IVA incluido ⇒ 100 € de alojamiento y 10 € de cuota. Desde el
  15-nov-2026, con 60 % de ocupación: 24.090 € pagados, 349 días con IVA,
  cuota 2.094 €, alojamiento 21.996 € (tests/calculadora-propietarios.test.ts).

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

/** Re-exportados de lib/iva-alojamiento.ts (la única fuente), para quien ya los importaba de aquí. */
export const FECHA_CORTE_IVA_ALOJAMIENTO = RDL29_IVA_ALOJAMIENTO.fechaCorte
export const IVA_ALOJAMIENTO_PCT = RDL29_IVA_ALOJAMIENTO.pct
export const MAX_NOCHES_IVA_ALOJAMIENTO = RDL29_IVA_ALOJAMIENTO.maxNoches

/** Hoy en Madrid, `YYYY-MM-DD`. */
export function hoyMadrid(ahora: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit" }).format(ahora)
}

/** ¿Lleva el precio por noche de ESE día el 10 % de IVA dentro? Con el RDL y desde el corte, sí. */
export function precioConIvaAlojamiento(dia: string, rdl29: boolean = rdl29Aplicado()): boolean {
  return diaConIvaAlojamiento(dia, rdl29)
}

/** Precio por noche de ese día sin la cuota del 10 %, al céntimo. En un día exento, el mismo precio. */
export function precioNocheSinIva(precioNoche: number, dia: string, rdl29: boolean = rdl29Aplicado()): number {
  if (!precioConIvaAlojamiento(dia, rdl29)) return precioNoche
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
  /** Ingresos brutos anuales por alojamiento, en euros. SIN la cuota de IVA de los días con IVA. */
  alojamientoAnual: number
  /** Lo que pagan los huéspedes en el año por el alojamiento, en euros (IVA incluido en los días con IVA). */
  pagadoHuespedes: number
  /** Cuota de IVA del alojamiento que va dentro de lo pagado, en euros. 0 si ningún día proyectado lleva IVA. */
  cuotaIvaAlojamiento: number
  /** Primer día de la proyección, `YYYY-MM-DD`. */
  desde: string
  /** De los 365 días proyectados, cuántos llevan IVA en el alojamiento (D-12). */
  diasConIva: number
  /** ¿Se ha quitado alguna cuota? (algún día proyectado lleva IVA). */
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
 * `desde` (`YYYY-MM-DD`, por defecto hoy en Madrid) es el primer día de los 365
 * que proyecta; `rdl29` (por defecto, el interruptor de lib/iva-alojamiento.ts)
 * dice si se aplica el RDL 29/2026. La cuota sale de los días proyectados con
 * IVA, en proporción (D-12).
 */
export function estimar(
  precioNoche: number,
  ocupacionPct: number,
  desde: string = hoyMadrid(),
  rdl29: boolean = rdl29Aplicado(),
): Estimacion | null {
  if (!Number.isFinite(precioNoche) || !Number.isFinite(ocupacionPct)) return null
  if (precioNoche <= 0 || precioNoche > PRECIO_NOCHE_MAX) return null
  if (ocupacionPct <= 0 || ocupacionPct > 100) return null

  const diasConIva = diasConIvaEnProyeccion(desde, rdl29)
  const pagadoHuespedes = Math.round((ocupacionPct / 100) * DIAS_PROYECCION * precioNoche)
  // Una sola división al final: pagado × días / 365 × pct / (100 + pct).
  const cuotaIvaAlojamiento = Math.round(
    (pagadoHuespedes * diasConIva * IVA_ALOJAMIENTO_PCT) / (DIAS_PROYECCION * (100 + IVA_ALOJAMIENTO_PCT)),
  )
  const alojamientoAnual = pagadoHuespedes - cuotaIvaAlojamiento
  const canalPct = TARIFA.ejemplos.canalPct
  return {
    tarifa: TARIFA.version,
    alojamientoAnual,
    pagadoHuespedes,
    cuotaIvaAlojamiento,
    desde,
    diasConIva,
    ivaAlojamientoIncluido: diasConIva > 0,
    canalPct,
    directa: escenario(alojamientoAnual, 0),
    // El canal cobra sobre lo que paga el huésped, con la cuota dentro (como `comision_plataforma` en seda_os).
    conCanal: escenario(alojamientoAnual, (pagadoHuespedes * canalPct) / 100),
  }
}

/* ── El formulario: qué hace con la respuesta de la ruta (V4-04) ─────────── */

export type EstadoFormulario = "reposo" | "enviando" | "ok" | "error" | "limite" | "limite_minuto" | "datos"

/**
 * Lo que el formulario hace con la respuesta de /api/leads/propietario.
 * Un dato que el portal no aceptaría NO es «inténtelo en unos minutos»:
 *   · 400 `phone_needs_prefix` → «telefono»: el campo pide el prefijo internacional;
 *   · 422 `rejected_data` (el portal dijo 400) → «datos»: revise sus datos;
 *   · 429 `demasiadas_solicitudes` (límite por visitante del portal) → «limite_minuto»: espere un minuto;
 *   · otro 429 → límite; cualquier otro fallo (5xx, 502, red) → error genérico.
 */
export function estadoTrasRespuesta(status: number, error: string | undefined): EstadoFormulario | "telefono" {
  if (status >= 200 && status < 300) return "ok"
  if (status === 400 && error === "phone_needs_prefix") return "telefono"
  if (status === 422) return "datos"
  if (status === 429) return error === "demasiadas_solicitudes" ? "limite_minuto" : "limite"
  return "error"
}
