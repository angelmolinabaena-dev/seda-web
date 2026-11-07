import { tool } from "ai"
import { z } from "zod"
import type { Locale } from "@/i18n/routing"
import {
  OCUPACION_MAX,
  OCUPACION_MIN,
  PRECIO_NOCHE_MAX,
  RUTA_CALCULADORA,
  estimar,
  hoyMadrid,
  precioConIvaAlojamiento,
} from "@/lib/calculadora-propietarios"
import { ESTRUCTURA, formatearRef, requisitosDe, type GrupoId } from "@/lib/guias-contenido/vut-andalucia"
import { esPublicable, getGuiaBySlug } from "@/lib/guias"
import { TARIFA, euros, tokensTarifa } from "@/lib/tarifa"
import { enlaceLlamada } from "./config"
import { CLAVE_IVA_ALOJAMIENTO, faqPropietarios, textoWeb } from "./fuentes"

/*
  Herramientas del asistente. Cada una envuelve datos REALES de la web para que
  el modelo no invente: la calculadora (`estimar`, el mismo código que
  /propietarios/calculadora), la tarifa (lib/tarifa → tarifa.json), la guía de
  normativa (lib/guias-contenido/vut-andalucia.ts, con su artículo), las
  preguntas frecuentes de /propietarios y el texto del IVA de la calculadora.

  Las funciones `datos*` son puras y se prueban solas (tests/asistente-*.test.ts);
  `herramientasAsistente` las envuelve con `tool()` del AI SDK. Nada aquí sabe
  de React ni de la petición HTTP.

  Ninguna herramienta recibe datos de contacto: `ofrecer_solicitud` no tiene
  entrada. El formulario lo rellena la persona en pantalla y marca ella misma el
  consentimiento; el modelo no lo rellena ni lo decide.
*/

const fmt = (locale: Locale) => (n: number) => euros(n, locale)

/* ── tarifa ──────────────────────────────────────────────────────────────── */

export function datosTarifa(locale: Locale) {
  const tk = tokensTarifa(locale)
  return {
    version: TARIFA.version,
    comisionGestion: `${tk.comision} + IVA (${tk.iva})`,
    base: textoWeb(locale, "prop.faq.items.q1.a"),
    tope: tk.tope,
    ivaDeLaComision: tk.iva,
    ejemplo: {
      alojamiento: tk.ejAlojamiento,
      comisionReservaDirecta: tk.ejDirecta,
      canalPct: tk.ejCanalPct,
      comisionConCanal: tk.ejAirbnb,
    },
    alta: {
      primerasFirmasGratis: TARIFA.alta.gratisPrimerasFirmas,
      reducidaHastaLaFirma: TARIFA.alta.reducidaHastaFirma,
      reducida: tk.alta490,
      estandar: tk.altaEstandar,
      nota: "sin IVA",
    },
    mantenimiento: { margen: tk.margen, soloSobreLoQueExcedaDe: tk.umbral },
    preavisoMeses: TARIFA.preavisoMeses,
    permanencia: TARIFA.permanencia,
  }
}

/* ── estimar (la calculadora) ────────────────────────────────────────────── */

export const entradaEstimar = z.object({
  precioNoche: z
    .number()
    .describe(
      "Precio medio por noche del alojamiento, en euros, tal como lo dice la persona (sin limpieza). Lo que la web dice del IVA de ese precio lo devuelve iva_alojamiento.",
    ),
  ocupacionPct: z.number().describe(`Ocupación anual en %, entre ${OCUPACION_MIN} y ${OCUPACION_MAX}, la que diga la persona.`),
})

export function datosEstimacion(locale: Locale, precioNoche: number, ocupacionPct: number, hoy: string = hoyMadrid()) {
  if (!Number.isFinite(ocupacionPct) || ocupacionPct < OCUPACION_MIN || ocupacionPct > OCUPACION_MAX) {
    return { error: "ocupacion_fuera_de_rango", rango: `${OCUPACION_MIN}–${OCUPACION_MAX} %` }
  }
  const est = estimar(precioNoche, ocupacionPct, hoy)
  if (!est) return { error: "precio_no_valido", maximo: fmt(locale)(PRECIO_NOCHE_MAX) }
  const e = fmt(locale)
  return {
    tipo: "estimación, no promesa ni previsión de rentabilidad",
    entrada: { precioNoche: e(precioNoche), ocupacionPct },
    tarifa: est.tarifa,
    ingresosBrutosAlojamiento: e(est.alojamientoAnual),
    ...(est.ivaAlojamientoIncluido
      ? {
          pagadoPorHuespedes: e(est.pagadoHuespedes),
          ivaAlojamientoDentroDelPrecio: e(est.cuotaIvaAlojamiento),
        }
      : {}),
    reservaDirecta: {
      comisionCanal: e(est.directa.canal),
      comisionSeda: e(est.directa.comision),
      ivaComisionAparte: e(est.directa.iva),
      netoAntesDeImpuestos: e(est.directa.neto),
    },
    porUnCanal: {
      canalPct: est.canalPct,
      comisionCanal: e(est.conCanal.canal),
      comisionSeda: e(est.conCanal.comision),
      ivaComisionAparte: e(est.conCanal.iva),
      netoAntesDeImpuestos: e(est.conCanal.neto),
    },
    limpieza: textoWeb(locale, "calculadora.results.table.limpieza_value"),
    comoSeCalcula: textoWeb(locale, "calculadora.results.como_body"),
    aviso: textoWeb(locale, "calculadora.aviso.body"),
    calculadora: RUTA_CALCULADORA,
  }
}

/* ── normativa (la guía) ─────────────────────────────────────────────────── */

export const GRUPOS_NORMATIVA = ESTRUCTURA.map((g) => g.id) as [GrupoId, ...GrupoId[]]

export const entradaNormativa = z.object({
  grupo: z
    .enum(GRUPOS_NORMATIVA)
    .optional()
    .describe("Parte de la guía. Sin él, la herramienta devuelve la lista de partes."),
})

/** Enlace a la guía solo si está publicada; si no, ningún enlace (no se manda a un 404). */
function rutaGuia(): string | null {
  const g = getGuiaBySlug("requisitos-vivienda-turistica-andalucia")
  return g && esPublicable(g) ? `/guias/${g.slug}` : null
}

export function datosNormativa(locale: Locale, grupo?: GrupoId) {
  const grupos = requisitosDe(locale)
  const fuente = {
    norma: "Decreto 28/2016, de 2 de febrero (Junta de Andalucía), texto consolidado",
    guia: rutaGuia(),
    alcance:
      "Solo lo que recoge la guía de SEDA. Ordenanzas municipales, licencias urbanísticas concretas, fiscalidad y sanciones no están en ella.",
  }
  if (!grupo) return { fuente, partes: grupos.map((g) => ({ grupo: g.id, titulo: g.titulo })) }
  const g = grupos.find((x) => x.id === grupo)
  if (!g) return { fuente, error: "grupo_desconocido" }
  return {
    fuente,
    grupo: g.id,
    titulo: g.titulo,
    requisitos: g.items.map((i) => ({ texto: i.texto, articulo: formatearRef(i.ref, locale) })),
  }
}

/* ── IVA del alojamiento ─────────────────────────────────────────────────── */

// Solo lo que dice la web y lo que calcula la calculadora, de sus mismas fuentes:
// el texto `calculadora.inputs.precio.hint` y `precioConIvaAlojamiento` (la fecha
// de corte de lib/calculadora-propietarios.ts). Ni una frase propia sobre el RDL
// 29/2026: si la votación de convalidación lo cambia, se cambia la web (texto y
// fecha) y el asistente dice lo nuevo sin tocar este fichero.

export function datosIvaAlojamiento(locale: Locale, hoy: string = hoyMadrid()) {
  return {
    loQueDiceLaWeb: textoWeb(locale, CLAVE_IVA_ALOJAMIENTO),
    hoy,
    elPrecioYaLlevaIva: precioConIvaAlojamiento(hoy),
  }
}

/* ── El servicio (preguntas frecuentes de /propietarios) ─────────────────── */

export function datosServicio(locale: Locale) {
  return { pagina: "/propietarios", preguntasFrecuentes: faqPropietarios(locale) }
}

/* ── Llamada y solicitud ─────────────────────────────────────────────────── */

export function datosLlamada() {
  return { mostrado: "botón para reservar una llamada", ...enlaceLlamada() }
}

export function datosSolicitud() {
  return { mostrado: "formulario de solicitud en pantalla (nombre, correo, teléfono opcional y consentimiento)" }
}

/* ── El conjunto ─────────────────────────────────────────────────────────── */

export const NOMBRES_HERRAMIENTAS = [
  "tarifa",
  "estimar",
  "normativa",
  "iva_alojamiento",
  "servicio",
  "ofrecer_llamada",
  "ofrecer_solicitud",
] as const
export type NombreHerramienta = (typeof NOMBRES_HERRAMIENTAS)[number]

const sinEntrada = z.object({})

export function herramientasAsistente(locale: Locale, hoy: string = hoyMadrid()) {
  return {
    tarifa: tool({
      description:
        "Tarifa vigente de SEDA: comisión de gestión, tope, IVA de la comisión, alta, mantenimiento, preaviso y permanencia. Úsela para cualquier pregunta de precio o comisión.",
      inputSchema: sinEntrada,
      execute: async () => datosTarifa(locale),
    }),
    estimar: tool({
      description:
        "Estimación anual con el mismo cálculo que la calculadora de la web, a partir del precio por noche y la ocupación que diga la persona. Devuelve cifras ya formateadas: cópielas tal cual.",
      inputSchema: entradaEstimar,
      execute: async ({ precioNoche, ocupacionPct }) => datosEstimacion(locale, precioNoche, ocupacionPct, hoy),
    }),
    normativa: tool({
      description:
        "Requisitos de una vivienda turística en Andalucía según la guía de SEDA (Decreto 28/2016), con el artículo de cada uno. Si lo que se pregunta no está en lo que devuelve, no se afirma.",
      inputSchema: entradaNormativa,
      execute: async ({ grupo }) => datosNormativa(locale, grupo),
    }),
    iva_alojamiento: tool({
      description: "Lo que dice la web (la calculadora) sobre el IVA del precio por noche que paga el huésped.",
      inputSchema: sinEntrada,
      execute: async () => datosIvaAlojamiento(locale, hoy),
    }),
    servicio: tool({
      description:
        "Preguntas frecuentes de propietarios publicadas en la web: qué hace SEDA, quién atiende a los huéspedes, fiscalidad, cómo es el proceso, uso de la propia casa, qué propiedades acepta y la baja.",
      inputSchema: sinEntrada,
      execute: async () => datosServicio(locale),
    }),
    ofrecer_llamada: tool({
      description: "Muestra a la persona un botón para reservar una llamada con el equipo de SEDA.",
      inputSchema: sinEntrada,
      execute: async () => datosLlamada(),
    }),
    ofrecer_solicitud: tool({
      description:
        "Muestra en pantalla el formulario para que la persona deje su solicitud y SEDA la contacte. La persona lo rellena y da su consentimiento; usted no pide esos datos en el chat.",
      inputSchema: sinEntrada,
      execute: async () => datosSolicitud(),
    }),
  } satisfies Record<NombreHerramienta, unknown>
}
