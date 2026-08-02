import type { MetadataRoute } from "next"
import { VILLAS } from "@/lib/villas"
import { routing } from "@/i18n/routing"
import { localeUrl, buildAlternates } from "@/lib/seo-urls"

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

  // Villa detail routes — same structure, per slug.
  const villaRoutes: MetadataRoute.Sitemap = VILLAS.flatMap((villa) => {
    const path = `/villa/${villa.slug}`
    return routing.locales.map((locale) => ({
      url: localeUrl(locale, path),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
      alternates: { languages: buildAlternates(path) },
    }))
  })

  return [...staticRoutes, ...villaRoutes]
}
