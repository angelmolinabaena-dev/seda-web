import type { Metadata, MetadataRoute } from "next"
import { routing, type Locale } from "@/i18n/routing"
import { AVISO_LEGAL } from "@/lib/legal/aviso-legal"
import { COOKIES } from "@/lib/legal/cookies"
import { PRIVACIDAD } from "@/lib/legal/privacidad"
import type { DocumentoLegalMultilingue } from "@/lib/legal/types"
import type { Translate } from "@/lib/faq"
import { buildAlternates, localeUrl } from "@/lib/seo-urls"

/*
  Catálogo de las páginas públicas. Una sola fuente para:
    · el `<title>`/description de cada página (`pageMetadata`),
    · el sitemap (`app/sitemap.ts`),
    · el BreadcrumbList de cada página (`components/page-json-ld.tsx`),
    · /llms.txt y /llms-full.txt (`lib/llms.ts`).
  Título y descripción salen de los mismos textos que pinta la página
  (messages/<locale>.json o lib/legal): ningún texto nuevo.

  Puro a propósito (recibe el traductor, no lo crea): así lo pueden usar los
  tests sin el runtime de Next.
*/

export const SITE_NAME = "SEDA Private Homes"
export const SITE_TITLE = "SEDA Private Homes — Villas privadas en la Costa del Sol"
export const SITE_DESCRIPTION =
  "Gestión de villas privadas en la Costa del Sol, operada sobre software propio. Hospitalidad mediterránea para huéspedes, transparencia total para propietarios."

export type PageCopy = { title: string; description: string }

export type SitePage = {
  /** "" para la portada; si no, empieza por "/". */
  path: string
  priority: number
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>
  /** Información legal: va al final de llms.txt, en «Optional». */
  legal?: boolean
  copy: (t: Translate, locale: Locale) => PageCopy
}

const legal = (doc: DocumentoLegalMultilingue) => (_t: Translate, locale: Locale): PageCopy => ({
  title: doc.traducciones[locale].titulo,
  description: doc.traducciones[locale].entradilla,
})

export const SITE_PAGES: SitePage[] = [
  {
    path: "",
    priority: 1.0,
    changeFrequency: "weekly",
    // La portada hereda title/description del layout raíz (en español en los
    // cuatro idiomas, como hasta ahora).
    copy: () => ({ title: SITE_TITLE, description: SITE_DESCRIPTION }),
  },
  {
    path: "/coleccion",
    priority: 0.95,
    changeFrequency: "weekly",
    copy: (t) => ({
      title: `${t("coleccion.h1.line1")} ${t("coleccion.h1.italic")} ${t("coleccion.h1.line2")}`,
      description: t("coleccion.body"),
    }),
  },
  {
    path: "/propietarios",
    priority: 0.9,
    changeFrequency: "monthly",
    copy: (t) => ({
      title: `${t("prop.hero.h1.line1")} ${t("prop.hero.h1.italic")}`,
      description: t("prop.hero.body"),
    }),
  },
  {
    path: "/guestapp",
    priority: 0.9,
    changeFrequency: "monthly",
    copy: (t) => ({
      title: `${t("guestapp.hero.h1.line1")} ${t("guestapp.hero.h1.italic")} ${t("guestapp.hero.h1.line2")}`,
      description: t("guestapp.hero.body"),
    }),
  },
  {
    path: "/experiencias",
    priority: 0.85,
    changeFrequency: "monthly",
    copy: (t) => ({
      title: `${t("exp.h1.line1")} ${t("exp.h1.italic")}`,
      description: t("exp.body"),
    }),
  },
  {
    path: "/ecosistema",
    priority: 0.85,
    changeFrequency: "monthly",
    copy: (t) => ({
      title: `${t("eco.h1.line1")} ${t("eco.h1.italic")}`,
      description: t("eco.body"),
    }),
  },
  {
    path: "/contacto",
    priority: 0.85,
    changeFrequency: "monthly",
    copy: (t) => ({
      title: `${t("contacto.hero.h1.line1")} ${t("contacto.hero.h1.italic")}`,
      // No single existing "intro" paragraph for this page — composed from
      // the two existing `type.guest.desc` / `type.owner.desc` strings
      // already shown on the page's own contact-type selector cards.
      description: `${t("contacto.type.guest.desc")} ${t("contacto.type.owner.desc")}`,
    }),
  },
  {
    path: "/nosotros",
    priority: 0.75,
    changeFrequency: "monthly",
    copy: (t) => ({ title: "Ángel Molina", description: t("nosotros.meta_description") }),
  },
  {
    path: "/descubre",
    priority: 0.8,
    changeFrequency: "monthly",
    copy: (t) => ({
      title: `${t("descubre.h1.line1")} ${t("descubre.h1.italic1")} ${t("descubre.h1.line2")}`,
      description: t("descubre.manifesto.body"),
    }),
  },
  {
    path: "/faq",
    priority: 0.7,
    changeFrequency: "monthly",
    copy: (t) => ({
      title: `${t("faq.h1.line1")} ${t("faq.h1.italic")} ${t("faq.h1.line2")}`,
      description: t("faq.intro"),
    }),
  },
  // Páginas legales: indexables (son información pública obligatoria), pero
  // con la prioridad más baja del sitio — nadie llega a SEDA buscándolas.
  { path: AVISO_LEGAL.ruta, priority: 0.2, changeFrequency: "yearly", legal: true, copy: legal(AVISO_LEGAL) },
  { path: PRIVACIDAD.ruta, priority: 0.2, changeFrequency: "yearly", legal: true, copy: legal(PRIVACIDAD) },
  { path: COOKIES.ruta, priority: 0.2, changeFrequency: "yearly", legal: true, copy: legal(COOKIES) },
]

export function getSitePage(path: string): SitePage {
  const page = SITE_PAGES.find((p) => p.path === path)
  if (!page) throw new Error(`site-pages: ${path} no está en SITE_PAGES`)
  return page
}

export function asLocale(locale: string): Locale {
  return (routing.locales as readonly string[]).includes(locale) ? (locale as Locale) : routing.defaultLocale
}

/** `generateMetadata` de una página del catálogo: title, description, canonical y hreflang. */
export function pageMetadata(locale: string, path: string, t: Translate): Metadata {
  const { title, description } = getSitePage(path).copy(t, asLocale(locale))
  return {
    title,
    description,
    alternates: {
      canonical: localeUrl(locale, path),
      languages: buildAlternates(path),
    },
  }
}
