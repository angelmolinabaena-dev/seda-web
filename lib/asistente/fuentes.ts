import type { Locale } from "@/i18n/routing"
import de from "@/messages/de.json"
import en from "@/messages/en.json"
import es from "@/messages/es.json"
import fr from "@/messages/fr.json"
import { resolverTexto } from "@/lib/tarifa"

/*
  Lo que la WEB dice, leído de messages/<locale>.json — la única fuente de los
  textos que el asistente puede repetir. No se redacta aquí ningún hecho nuevo:
  si la web cambia (la tarifa v7, el IVA tras la votación del RDL 29/2026), el
  asistente cambia con ella sin tocar este código.

  Los textos llevan tokens `[[tarifa.…]]`; se resuelven con lib/tarifa igual que
  hace i18n/request.ts al cargar el idioma.
*/

type Arbol = { [k: string]: Arbol | string }

const MENSAJES: Record<Locale, Arbol> = { es, en, fr, de } as unknown as Record<Locale, Arbol>

/** Texto de la web en `locale`, con los tokens de la tarifa resueltos. Lanza si la clave no existe. */
export function textoWeb(locale: Locale, clave: string): string {
  let nodo: Arbol | string | undefined = MENSAJES[locale]
  for (const parte of clave.split(".")) {
    if (typeof nodo !== "object" || nodo === null) break
    nodo = nodo[parte]
  }
  if (typeof nodo !== "string") throw new Error(`asistente: falta la clave «${clave}» en messages/${locale}.json`)
  return resolverTexto(nodo, locale)
}

/** Preguntas frecuentes de /propietarios (`prop.faq.items`), las mismas que publica la página. */
export const CLAVES_FAQ_PROPIETARIOS = ["q1", "q2", "q3", "q4", "q5", "q6", "q7"] as const

export function faqPropietarios(locale: Locale): { pregunta: string; respuesta: string }[] {
  return CLAVES_FAQ_PROPIETARIOS.map((k) => ({
    pregunta: textoWeb(locale, `prop.faq.items.${k}.q`),
    respuesta: textoWeb(locale, `prop.faq.items.${k}.a`),
  }))
}

/**
 * El IVA del alojamiento — UNA sola fuente: lo que dice la calculadora junto al
 * campo del precio (`calculadora.inputs.precio.hint`). La votación de
 * convalidación del RDL 29/2026 (~12-nov-2026) puede cambiarlo; cuando cambie
 * la web, cambia esto.
 */
export const CLAVE_IVA_ALOJAMIENTO = "calculadora.inputs.precio.hint"
