import type { MetadataRoute } from "next"
import { routing } from "@/i18n/routing"
import { localeUrl, buildAlternates } from "@/lib/seo-urls"
import { getGuiasPublicadas, haySeccionGuias } from "@/lib/guias"
import { SITE_PAGES } from "@/lib/site-pages"
import { villasIndexables } from "@/lib/escaparate"

/*
  Multilingual sitemap with hreflang alternates.
  - ES URLs render at the root (no /es prefix per `localePrefix: 'as-needed'`).
  - EN URLs render at /en/<path>.
  Each entry exposes `alternates.languages` so Google + Bing can correctly
  associate language variants and avoid duplicate-content penalties.

  `localeUrl`/`buildAlternates` live in `@/lib/seo-urls` so every page's
  `generateMetadata` can build the exact same canonical/hreflang URLs as
  this sitemap — one source of truth, no drift. The page list, with its
  priority and change frequency, is `SITE_PAGES` (`@/lib/site-pages`), the
  same catalogue that feeds /llms.txt.
*/

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  // Static routes — emit one entry per (path × locale), with hreflang links.
  const staticRoutes: MetadataRoute.Sitemap = SITE_PAGES.flatMap((entry) =>
    routing.locales.map((locale) => ({
      url: localeUrl(locale, entry.path),
      lastModified: now,
      changeFrequency: entry.changeFrequency,
      priority: entry.priority,
      alternates: { languages: buildAlternates(entry.path) },
    })),
  )

  // Las 16 entradas `/villa/<slug>` (4 slugs × 4 locales) se retiraron con
  // las cuatro residencias ficticias. Esas URLs ya no se listan aquí y
  // responden 410 desde `proxy.ts` — ver docs/audit/RETIRADA-COLECCION.md §3.

  // Las fichas del escaparate (lib/escaparate.ts) entran SOLO si son
  // indexables: flag SEDA_FLAG_ESCAPARATE_VILLAS encendido Y número de
  // registro turístico. Flag apagado, o sin VFT → ninguna. Fail closed.
  const villaRoutes: MetadataRoute.Sitemap = villasIndexables().flatMap((villa) =>
    routing.locales.map((locale) => ({
      url: localeUrl(locale, `/villa/${villa.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      alternates: { languages: buildAlternates(`/villa/${villa.slug}`) },
    })),
  )

  // `/guias` — índice y fichas individuales, SOLO si hay al menos una guía
  // publicada (mismo criterio que el enlace de navegación, `haySeccionGuias`).
  // Cada guía publicada usa `esPublicable` vía `getGuiasPublicadas` — una
  // guía en borrador nunca aparece aquí, fail closed.
  const guiaRoutes: MetadataRoute.Sitemap = haySeccionGuias()
    ? [
        ...routing.locales.map((locale) => ({
          url: localeUrl(locale, "/guias"),
          lastModified: now,
          changeFrequency: "weekly" as const,
          priority: 0.7,
          alternates: { languages: buildAlternates("/guias") },
        })),
        ...getGuiasPublicadas().flatMap((guia) =>
          routing.locales.map((locale) => ({
            url: localeUrl(locale, `/guias/${guia.slug}`),
            lastModified: guia.fechaRevision ?? guia.fechaPublicacion ?? now,
            changeFrequency: "monthly" as const,
            priority: 0.6,
            alternates: { languages: buildAlternates(`/guias/${guia.slug}`) },
          })),
        ),
      ]
    : []

  return [...staticRoutes, ...villaRoutes, ...guiaRoutes]
}
