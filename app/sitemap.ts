import type { MetadataRoute } from "next"
import { routing } from "@/i18n/routing"
import { localeUrl, buildAlternates } from "@/lib/seo-urls"
import { getGuiasPublicadas, haySeccionGuias } from "@/lib/guias"

/*
  Multilingual sitemap with hreflang alternates.
  - ES URLs render at the root (no /es prefix per `localePrefix: 'as-needed'`).
  - EN URLs render at /en/<path>.
  Each entry exposes `alternates.languages` so Google + Bing can correctly
  associate language variants and avoid duplicate-content penalties.

  `localeUrl`/`buildAlternates` live in `@/lib/seo-urls` so every page's
  `generateMetadata` can build the exact same canonical/hreflang URLs as
  this sitemap — one source of truth, no drift.
*/

const STATIC_PATHS = [
  { path: "",              priority: 1.0,  changeFrequency: "weekly"  as const },
  { path: "/coleccion",    priority: 0.95, changeFrequency: "weekly"  as const },
  { path: "/propietarios", priority: 0.9,  changeFrequency: "monthly" as const },
  { path: "/guestapp",     priority: 0.9,  changeFrequency: "monthly" as const },
  { path: "/experiencias", priority: 0.85, changeFrequency: "monthly" as const },
  { path: "/ecosistema",   priority: 0.85, changeFrequency: "monthly" as const },
  { path: "/contacto",     priority: 0.85, changeFrequency: "monthly" as const },
  { path: "/nosotros",     priority: 0.75, changeFrequency: "monthly" as const },
  { path: "/descubre",     priority: 0.8,  changeFrequency: "monthly" as const },
  { path: "/faq",          priority: 0.7,  changeFrequency: "monthly" as const },
  // Páginas legales: indexables (son información pública obligatoria), pero
  // con la prioridad más baja del sitio — nadie llega a SEDA buscándolas.
  { path: "/aviso-legal",  priority: 0.2,  changeFrequency: "yearly"  as const },
  { path: "/privacidad",   priority: 0.2,  changeFrequency: "yearly"  as const },
  { path: "/cookies",      priority: 0.2,  changeFrequency: "yearly"  as const },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  // Static routes — emit one entry per (path × locale), with hreflang links.
  const staticRoutes: MetadataRoute.Sitemap = STATIC_PATHS.flatMap((entry) =>
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

  return [...staticRoutes, ...guiaRoutes]
}
