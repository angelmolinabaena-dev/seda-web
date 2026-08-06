import type { Locale } from "@/i18n/routing"
import type { DocumentoId } from "./entity"

/*
  Modelo de contenido de las páginas legales.

  Mismo criterio que `lib/guias.ts`: datos tipados en TypeScript, no MDX
  (el repo no tiene pipeline MDX). Aquí el tipado hace además un trabajo
  concreto: `Record<Locale, DocumentoLegal>` convierte «falta la versión
  alemana» en un error de compilación, en vez de en una página legal
  publicada sólo en español — que es exactamente lo que el artículo 12 del
  RGPD (información en lenguaje claro y comprensible) no admite en un sitio
  que se sirve en cuatro idiomas.

  Cualquier texto puede contener `{campo}` — se sustituye por el valor
  correspondiente de `lib/legal/entity.ts` al renderizar (`resolverTokens`).
*/

export type BloqueLegal =
  | { tipo: "parrafo"; texto: string }
  | { tipo: "lista"; items: string[] }
  | { tipo: "tabla"; cabeceras: string[]; filas: string[][] }
  /** Bloque de datos identificativos, pintado desde `legalEntity`. */
  | { tipo: "identificacion" }

export type EnlaceLegal = {
  /** Ruta interna (`/privacidad`) o URL absoluta. */
  href: string
  etiqueta: string
}

export type SeccionLegal = {
  /** Ancla estable — no se traduce, para que los enlaces sobrevivan al idioma. */
  id: string
  titulo: string
  bloques: BloqueLegal[]
  enlaces?: EnlaceLegal[]
}

export type DocumentoLegal = {
  titulo: string
  entradilla: string
  secciones: SeccionLegal[]
}

export type DocumentoLegalMultilingue = {
  id: DocumentoId
  /** Ruta pública, idéntica en los cuatro idiomas (con prefijo de locale). */
  ruta: string
  /** ISO 8601 — fecha de la última revisión del texto. */
  actualizado: string
  traducciones: Record<Locale, DocumentoLegal>
}
