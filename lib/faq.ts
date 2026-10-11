/*
  Preguntas frecuentes — qué claves de messages/<locale>.json forman cada
  lista. La misma lista alimenta lo que se ve (FaqContent, FaqSection), el
  JSON-LD `FAQPage` y /llms.txt, así que no pueden divergir.
*/

/** Un traductor de next-intl sin namespace: clave completa → texto. */
export type Translate = (key: string) => string

export type FaqEntry = { q: string; a: string }

const GUEST_KEYS = ["q1", "q2", "q3", "q4", "q5"] as const
const OWNER_KEYS = ["q1", "q2", "q3", "q4", "q5", "q6"] as const
const HOME_KEYS = ["q1", "q2", "q3", "q4", "q5", "q6", "q7"] as const

const entries = (t: Translate, base: string, keys: readonly string[]): FaqEntry[] =>
  keys.map((k) => ({ q: t(`${base}.${k}.q`), a: t(`${base}.${k}.a`) }))

/** /faq — pestaña «Huéspedes». */
export const faqHuespedes = (t: Translate) => entries(t, "faq.guests_items", GUEST_KEYS)
/** /faq — pestaña «Propietarios». */
export const faqPropietarios = (t: Translate) => entries(t, "faq.owners_items", OWNER_KEYS)
/** Portada — bloque de preguntas (q1–q4 huéspedes, q5–q7 propietarios). */
export const faqPortada = (t: Translate) => entries(t, "home.faq.items", HOME_KEYS)
