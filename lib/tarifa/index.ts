import datos from "./tarifa.json"

/*
  Tarifa v6 — el único sitio donde la web calcula y formatea sus cifras.

  Las cifras viven en `tarifa.json`. Aquí solo hay (1) la fórmula, (2) el
  formato por idioma y (3) la sustitución de `[[tarifa.<nombre>]]` en los
  textos de messages/*.json. Los textos no llevan «21%» escrito: llevan
  `[[tarifa.comision]]`, y `i18n/request.ts` los resuelve al cargar el idioma.
  Todo lo que lee mensajes por next-intl (la web, el JSON-LD FAQPage, /llms.txt,
  /llms-full.txt) hereda la cifra sin tocarlo.

  La fórmula (decisión de Ángel, 25–26-oct-2026):

    comisión = la menor de   21 % × (alojamiento − comisión del canal)
                       y     20 % × alojamiento
    alojamiento = bruto de la reserva − limpieza (la limpieza no cuenta)
    IVA 21 % aparte, sobre la comisión. El tope es sobre la comisión sin IVA.

  Aritmética en céntimos enteros, redondeo al céntimo hacia arriba en la
  mitad: 178,50 € × 21 % = 37,485 € → 37,49 €.
*/

export const TARIFA = datos

export type Idioma = "es" | "en" | "fr" | "de"

const cent = (euros: number) => Math.round(euros * 100)
/** a × pct / 100 en céntimos, redondeado al céntimo. */
const pct = (centimos: number, porcentaje: number) => Math.round((centimos * porcentaje) / 100)

export type Comision = {
  /** 21 % de (alojamiento − comisión del canal), en céntimos. */
  porBase: number
  /** 20 % del alojamiento, en céntimos. */
  tope: number
  /** La menor de las dos, en céntimos. Sin IVA. */
  comision: number
  /** IVA de la comisión, en céntimos. */
  iva: number
  /** ¿Manda el tope? */
  aplicaTope: boolean
}

/**
 * Comisión de gestión de una reserva. `alojamiento` y `comisionCanal` en euros;
 * el alojamiento es el bruto menos la limpieza.
 */
export function comisionGestion(alojamiento: number, comisionCanal = 0): Comision {
  const a = cent(alojamiento)
  const porBase = pct(a - cent(comisionCanal), TARIFA.gestion.comisionPct)
  const tope = pct(a, TARIFA.gestion.topePct)
  const comision = Math.min(porBase, tope)
  return { porBase, tope, comision, iva: pct(comision, TARIFA.gestion.ivaPct), aplicaTope: tope < porBase }
}

/**
 * Neto anual del propietario (euros, sin IVA) sobre `alojamientoAnual`, en los dos
 * extremos honestos: reserva directa (canal 0 %) y OTA tipo Airbnb (`canalPct`).
 * El neto es lo que queda tras el canal y la comisión; el IVA de la comisión va
 * aparte y se devuelve en `iva*` (no está restado del neto).
 */
export function netoAnual(alojamientoAnual: number, canalPct: number = TARIFA.ejemplos.canalPct) {
  const g = alojamientoAnual
  const canal = (g * canalPct) / 100
  const directa = comisionGestion(g, 0)
  const ota = comisionGestion(g, canal)
  return {
    directa: Math.round(g - directa.comision / 100),
    ota: Math.round(g - canal - ota.comision / 100),
    ivaDirecta: Math.round(directa.iva / 100),
    ivaOta: Math.round(ota.iva / 100),
  }
}

/** La liquidación de ejemplo de las maquetas (reserva directa, limpieza dentro del bruto). */
export function liquidacionEjemplo() {
  const { bruto, limpieza } = TARIFA.ejemplos.liquidacion
  const base = bruto - limpieza
  const c = comisionGestion(base, 0)
  return {
    bruto,
    base,
    comision: c.comision / 100,
    iva: c.iva / 100,
    neto: bruto - c.comision / 100,
    aplicaTope: c.aplicaTope,
  }
}

/* ── Formato por idioma ─────────────────────────────────────────────────── */

const SEPARADOR: Record<Idioma, { miles: string; decimal: string }> = {
  es: { miles: ".", decimal: "," },
  en: { miles: ",", decimal: "." },
  fr: { miles: " ", decimal: "," },
  de: { miles: ".", decimal: "," },
}

/** 1290 → «1.290» (es, de), «1,290» (en), «1 290» (fr). Decimales solo si hay céntimos. */
export function numero(centimos: number, locale: Idioma): string {
  const { miles, decimal } = SEPARADOR[locale]
  const negativo = centimos < 0
  const abs = Math.abs(centimos)
  const enteros = Math.floor(abs / 100)
  const cents = abs % 100
  const agrupado = String(enteros).replace(/\B(?=(\d{3})+(?!\d))/g, miles)
  const out = cents === 0 ? agrupado : `${agrupado}${decimal}${String(cents).padStart(2, "0")}`
  return negativo ? `−${out}` : out
}

/** 1290 → «1.290 €» (es, fr, de) · «€1,290» (en). */
export function euros(valor: number, locale: Idioma): string {
  const n = numero(cent(valor), locale)
  return locale === "en" ? `€${n}` : `${n} €`
}

const porcentaje = (n: number) => `${n}%`

/* ── Tokens de los textos ───────────────────────────────────────────────── */

/** Los tokens `[[tarifa.<nombre>]]` disponibles, ya formateados para `locale`. */
export function tokensTarifa(locale: Idioma): Record<string, string> {
  const e = (v: number) => euros(v, locale)
  const ej = TARIFA.ejemplos
  const directa = comisionGestion(ej.alojamiento, 0)
  const canalEur = (ej.alojamiento * ej.canalPct) / 100
  const ota = comisionGestion(ej.alojamiento, canalEur)
  const r = ej.reserva
  const resAloj = r.bruto - r.limpieza
  const resCom = comisionGestion(resAloj, r.comisionCanal)
  const liq = liquidacionEjemplo()
  return {
    // Reglas
    comision: porcentaje(TARIFA.gestion.comisionPct),
    tope: porcentaje(TARIFA.gestion.topePct),
    iva: porcentaje(TARIFA.gestion.ivaPct),
    margen: porcentaje(TARIFA.mantenimiento.margenPct),
    umbral: e(TARIFA.mantenimiento.umbralEur),
    alta490: e(TARIFA.alta.reducidaEur),
    altaEstandar: e(TARIFA.alta.estandarEur),
    // Ejemplo de 1.000 € de alojamiento: directa y canal al 15 %
    ejAlojamiento: e(ej.alojamiento),
    ejCanalPct: porcentaje(ej.canalPct),
    ejCanal: e(canalEur),
    ejBase: e(ej.alojamiento - canalEur),
    ejDirecta21: e(directa.porBase / 100),
    ejDirecta: e(directa.comision / 100),
    ejDirectaIva: e(directa.iva / 100),
    ejAirbnb: e(ota.comision / 100),
    ejAirbnbIva: e(ota.iva / 100),
    // Ejemplo de /founding-owners: reserva de 1.200 € con 120 € de limpieza y 180 € de canal
    resBruto: e(r.bruto),
    resLimpieza: e(r.limpieza),
    resAlojamiento: e(resAloj),
    resCanal: e(r.comisionCanal),
    resBase: e(resAloj - r.comisionCanal),
    resTope: e(resCom.tope / 100),
    resComision: e(resCom.comision / 100),
    resIva: e(resCom.iva / 100),
    // Liquidación de ejemplo de las maquetas
    liqIva: e(liq.iva),
  }
}

const TOKEN = /\[\[tarifa\.([A-Za-z0-9]+)\]\]/g

/** Sustituye los tokens de una cadena. Un token desconocido lanza: nunca llega a la web un `[[…]]`. */
export function resolverTexto(texto: string, locale: Idioma, tokens = tokensTarifa(locale)): string {
  return texto.replace(TOKEN, (_, nombre: string) => {
    const valor = tokens[nombre]
    if (valor === undefined) throw new Error(`messages: token [[tarifa.${nombre}]] sin definir en lib/tarifa`)
    return valor
  })
}

type Arbol = { [k: string]: Arbol | string }

/** Resuelve los tokens de todo un árbol de mensajes (el que next-intl recibe). */
export function resolverMensajes<T extends Arbol>(mensajes: T, locale: Idioma): T {
  const tokens = tokensTarifa(locale)
  const recorrer = (nodo: Arbol | string): Arbol | string => {
    if (typeof nodo === "string") return resolverTexto(nodo, locale, tokens)
    return Object.fromEntries(Object.entries(nodo).map(([k, v]) => [k, recorrer(v)]))
  }
  return recorrer(mensajes) as T
}
