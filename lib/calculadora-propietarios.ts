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
  /** Ingresos brutos anuales por alojamiento, en euros. */
  alojamientoAnual: number
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
 */
export function estimar(precioNoche: number, ocupacionPct: number): Estimacion | null {
  if (!Number.isFinite(precioNoche) || !Number.isFinite(ocupacionPct)) return null
  if (precioNoche <= 0 || precioNoche > PRECIO_NOCHE_MAX) return null
  if (ocupacionPct <= 0 || ocupacionPct > 100) return null

  const alojamientoAnual = Math.round((ocupacionPct / 100) * 365 * precioNoche)
  const canalPct = TARIFA.ejemplos.canalPct
  return {
    tarifa: TARIFA.version,
    alojamientoAnual,
    canalPct,
    directa: escenario(alojamientoAnual, 0),
    conCanal: escenario(alojamientoAnual, (alojamientoAnual * canalPct) / 100),
  }
}
