/*
  El IVA del alojamiento (RDL 29/2026) — el ÚNICO sitio de la web donde están
  la fecha de corte, el tipo y el tope de noches (MOT-09, REA-MOTOR).

  Lo leen la calculadora (lib/calculadora-propietarios.ts), el asistente (que
  usa la misma `estimar`) y los textos: messages/*.json no llevan la fecha ni el
  porcentaje escritos, llevan `[[iva.fechaCorte]]`, `[[iva.pct]]`… y lib/tarifa
  los resuelve con estos valores (`tokensIvaAlojamiento`). Módulo sin imports a
  propósito: lo carga el componente de cliente de la calculadora.

  ── Los valores ─────────────────────────────────────────────────────────────
  Los mismos que seda_os: `FECHA_CORTE_IVA_VUT = '2026-12-01'`
  (lib/factura-iva-regla.ts), 10 % y estancias de 30 noches o menos
  (`MAX_NOCHES_IVA_VUT`). tests/iva-alojamiento-contrato.test.ts los fija con el
  valor escrito a mano, como el vector de la firma (tests/lead-firma-contrato).

  ── El interruptor ──────────────────────────────────────────────────────────
  `SEDA_IVA_ALOJAMIENTO_RDL29`: sin definir (o con cualquier valor) el RDL se
  aplica; con "0" no se aplica en ningún día y la web dice la variante «sin RDL»
  de sus textos (`*_sin_rdl`). Es para el caso de que el RDL no se convalide.
  next.config.mjs lo inlina (`process.env.SEDA_IVA_ALOJAMIENTO_RDL29` literal),
  así el servidor y el navegador dicen lo mismo, y por eso el cambio exige un
  redeploy. Por defecto APLICA: es la norma publicada.

  ── Una proyección aplica el régimen de los días que proyecta (D-12) ────────
  La estimación anual proyecta 365 días desde hoy (incluido). Con el RDL, la
  cuota del 10 % se quita solo de los días desde el corte: una estimación hecha
  el 15-nov-2026 quita la cuota de 349 de sus 365 días (16 días, del 15 al 30 de
  noviembre, siguen exentos). Antes de D-12 se miraba solo el día de hoy, y la
  misma estimación salía ~9 % más alta en noviembre que el 1-dic (MOT-08).

  Las fechas son texto `YYYY-MM-DD` (hora de Madrid). Para contar días se pasan
  a días UTC enteros (`Date.UTC`), sin hora ni zona: no hay cambio de hora que
  mueva un día.
*/

export const RDL29_IVA_ALOJAMIENTO = {
  norma: "RDL 29/2026",
  /** Primer día con IVA en el alojamiento. Mismo valor que `FECHA_CORTE_IVA_VUT` de seda_os. */
  fechaCorte: "2026-12-01",
  /** Tipo del IVA del alojamiento desde el corte, en %. */
  pct: 10,
  /** Estancias de hasta estas noches, incluida, llevan el IVA («no superior a 30 noches»). Mismo valor que `MAX_NOCHES_IVA_VUT`. */
  maxNoches: 30,
} as const

/** Días que proyecta la estimación anual (la fórmula usa ocupación × 365). */
export const DIAS_PROYECCION = 365

/**
 * ¿Se aplica el RDL 29/2026? Solo "0" lo apaga: sin la variable, se aplica.
 * El valor por defecto es el literal que inlina next.config.mjs.
 */
export function rdl29Aplicado(valor: string | undefined = process.env.SEDA_IVA_ALOJAMIENTO_RDL29): boolean {
  return (valor ?? "").trim() !== "0"
}

const FECHA = /^\d{4}-\d{2}-\d{2}$/

/** `YYYY-MM-DD` → número de día (días desde 1970-01-01, UTC). Lanza con otro formato. */
export function numeroDeDia(fecha: string): number {
  if (!FECHA.test(fecha)) throw new Error(`iva-alojamiento: fecha «${fecha}» no es YYYY-MM-DD`)
  const [a, m, d] = fecha.split("-").map(Number)
  return Date.UTC(a, m - 1, d) / 86_400_000
}

/** El día anterior a `fecha`, `YYYY-MM-DD`. */
export function diaAnterior(fecha: string): string {
  return new Date((numeroDeDia(fecha) - 1) * 86_400_000).toISOString().slice(0, 10)
}

/** ¿Lleva IVA el alojamiento de ese día? Solo con el RDL aplicado y desde el corte. */
export function diaConIvaAlojamiento(dia: string, aplicado: boolean = rdl29Aplicado()): boolean {
  numeroDeDia(dia)
  return aplicado && dia >= RDL29_IVA_ALOJAMIENTO.fechaCorte
}

/**
 * D-12 · De los `dias` que proyecta una estimación que empieza `desde` (incluido),
 * cuántos llevan el IVA del alojamiento. 0 sin el RDL; todos si `desde` ≥ corte.
 */
export function diasConIvaEnProyeccion(desde: string, aplicado: boolean = rdl29Aplicado(), dias: number = DIAS_PROYECCION): number {
  const exentosAntesDelCorte = numeroDeDia(RDL29_IVA_ALOJAMIENTO.fechaCorte) - numeroDeDia(desde)
  if (!aplicado) return 0
  return Math.min(dias, Math.max(0, dias - exentosAntesDelCorte))
}

/** La clave de un texto que tiene variante «sin RDL» (`<clave>_sin_rdl`). */
export function claveSegunRdl29<C extends string>(clave: C, aplicado: boolean = rdl29Aplicado()): C | `${C}_sin_rdl` {
  return aplicado ? clave : `${clave}_sin_rdl`
}
