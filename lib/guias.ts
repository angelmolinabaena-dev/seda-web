import type { Locale } from "@/i18n/routing"

/*
  Catálogo de guías — modelo de contenido para `/guias`.

  DECISIÓN: datos estructurados en TypeScript (este fichero), no MDX.
  Ver razonamiento completo en la descripción del PR. Resumen: el repo no
  tiene pipeline MDX (ninguna dependencia `@next/mdx` / `next-mdx-remote`
  en package.json), y el patrón ya existente para catálogos (`lib/*.ts`
  exportando datos tipados, consumidos por `app/[locale]/...`) es el mismo
  que usa `lib/seo-urls.ts` y las páginas server-component del sitio.
  Ángel escribe primero en español: con este modelo añade una guía nueva
  como un objeto, rellena `es` y deja el resto de idiomas con el mismo
  cuerpo provisional o vacío hasta traducir — sin instalar un pipeline de
  build nuevo ni aprender sintaxis MDX.

  ESTADO Y PUERTA DE INDEXACIÓN (fail closed):
  `estado !== "publicada"` (incluido cualquier valor inesperado o ausente)
  se trata como borrador: `noindex` + fuera del sitemap. Ver `esPublicable`.
*/

export type EstadoGuia = "borrador" | "publicada"

export type Fuente = {
  label: string
  url: string
}

export type GuiaTraduccion = {
  titulo: string
  entradilla: string
  /** Cuerpo como lista de párrafos — evita HTML/MDX embebido en el catálogo. */
  cuerpo: string[]
}

export type Guia = {
  slug: string
  estado: EstadoGuia
  /** `null` mientras no haya autor asignado (ej. la guía de prueba). */
  autorId: string | null
  /** ISO 8601 (YYYY-MM-DD). `null` si aún no se ha publicado. */
  fechaPublicacion: string | null
  /** ISO 8601 (YYYY-MM-DD). `null` si no ha habido revisión posterior. */
  fechaRevision: string | null
  fuentes: Fuente[]
  traducciones: Record<Locale, GuiaTraduccion>
}

export const guias: Guia[] = [
  {
    // Guía de prueba — NUNCA contenido real. Sirve solo para validar que
    // `estado: "borrador"` produce noindex + exclusión de sitemap, y que
    // el JSON-LD se emite correctamente en modo borrador/publicada.
    // Ángel escribirá el contenido real; este registro se retira antes de
    // publicar la primera guía de verdad.
    slug: "guia-de-prueba-interna",
    estado: "borrador",
    autorId: null, // pendiente — ver docs/prompts/SUPERFICIE-CONTENIDO.md
    fechaPublicacion: null,
    fechaRevision: null,
    fuentes: [],
    traducciones: {
      es: {
        titulo: "[PRUEBA INTERNA — NO ES CONTENIDO REAL]",
        entradilla: "Texto de relleno evidente para validar el sistema de guías. Pendiente de contenido real.",
        cuerpo: [
          "AAAA BBBB CCCC — párrafo de relleno de prueba, no es una guía real. Fecha, autor y fuentes: pendientes.",
          "Este registro existe únicamente para verificar noindex, exclusión de sitemap.xml y el marcado JSON-LD Article. Se retira antes de publicar contenido real.",
        ],
      },
      en: {
        titulo: "[INTERNAL TEST — NOT REAL CONTENT]",
        entradilla: "Obvious placeholder text to validate the guides system. Real content pending.",
        cuerpo: [
          "AAAA BBBB CCCC — test filler paragraph, not a real guide. Date, author and sources: pending.",
          "This entry exists only to verify noindex, sitemap.xml exclusion and the Article JSON-LD markup. Removed before publishing real content.",
        ],
      },
      fr: {
        titulo: "[TEST INTERNE — PAS DE CONTENU RÉEL]",
        entradilla: "Texte de remplissage manifeste pour valider le système de guides. Contenu réel en attente.",
        cuerpo: [
          "AAAA BBBB CCCC — paragraphe de remplissage de test, ce n'est pas un vrai guide. Date, auteur et sources : en attente.",
          "Cette entrée existe uniquement pour vérifier le noindex, l'exclusion du sitemap.xml et le balisage JSON-LD Article. Retirée avant la publication de contenu réel.",
        ],
      },
      de: {
        titulo: "[INTERNER TEST — KEIN ECHTER INHALT]",
        entradilla: "Offensichtlicher Platzhaltertext zur Validierung des Leitfaden-Systems. Echter Inhalt ausstehend.",
        cuerpo: [
          "AAAA BBBB CCCC — Test-Füllabsatz, kein echter Leitfaden. Datum, Autor und Quellen: ausstehend.",
          "Dieser Eintrag dient ausschließlich zur Überprüfung von noindex, dem Ausschluss aus sitemap.xml und dem Article-JSON-LD-Markup. Wird vor der Veröffentlichung echter Inhalte entfernt.",
        ],
      },
    },
  },
]

/**
 * Fail-closed: cualquier cosa que no sea exactamente `estado === "publicada"`
 * se trata como borrador (noindex + fuera de sitemap). Cubre valores
 * ausentes, `undefined`/`null`, o cualquier estado no reconocido si en el
 * futuro esta función recibe datos no tipados (ej. de un CMS externo).
 */
export function esPublicable(guia: Pick<Guia, "estado"> | null | undefined): boolean {
  if (!guia) return false
  return guia.estado === "publicada"
}

export function getGuiaBySlug(slug: string): Guia | undefined {
  return guias.find((g) => g.slug === slug)
}

export function getGuiasPublicadas(): Guia[] {
  return guias.filter(esPublicable)
}

export function haySeccionGuias(): boolean {
  return getGuiasPublicadas().length > 0
}
