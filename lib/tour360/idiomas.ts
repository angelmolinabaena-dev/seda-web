/*
  Idiomas del visor 360. Son CINCO (es, en, de, fr, it), uno más que la web:
  el visor se incrusta también en la guest-app y en la descripción de Beds24,
  donde llegan huéspedes italianos. Por eso la ruta /tour/[slug] vive FUERA de
  app/[locale]: el idioma lo decide `?lang=` (o el navegador), no el prefijo de
  URL de next-intl, y `it` no obliga a abrir un quinto idioma en toda la web.
*/

export const IDIOMAS_TOUR = ["es", "en", "de", "fr", "it"] as const
export type IdiomaTour = (typeof IDIOMAS_TOUR)[number]
export const IDIOMA_TOUR_POR_DEFECTO: IdiomaTour = "es"

/** Etiqueta corta para el selector (el propio nombre del idioma, no el código). */
export const NOMBRE_IDIOMA_TOUR: Record<IdiomaTour, string> = {
  es: "Español",
  en: "English",
  de: "Deutsch",
  fr: "Français",
  it: "Italiano",
}

export function esIdiomaTour(valor: unknown): valor is IdiomaTour {
  return typeof valor === "string" && (IDIOMAS_TOUR as readonly string[]).includes(valor)
}

/** «en-GB», «EN», «de_AT» → «en», «en», «de». Lo que no es uno de los cinco → undefined. */
export function normalizarIdioma(valor: string | null | undefined): IdiomaTour | undefined {
  if (!valor) return undefined
  const base = valor.trim().toLowerCase().split(/[-_]/)[0]
  return esIdiomaTour(base) ? base : undefined
}

/**
 * Prioridad: `?lang=` explícito > preferencias del navegador (en orden) > español.
 * Un `?lang=` desconocido (p. ej. `pt`) no cuenta: se mira el navegador.
 */
export function resolverIdioma({
  parametro,
  navegador = [],
}: {
  parametro?: string | null
  navegador?: readonly string[]
}): IdiomaTour {
  const explicito = normalizarIdioma(parametro)
  if (explicito) return explicito
  for (const preferido of navegador) {
    const n = normalizarIdioma(preferido)
    if (n) return n
  }
  return IDIOMA_TOUR_POR_DEFECTO
}
