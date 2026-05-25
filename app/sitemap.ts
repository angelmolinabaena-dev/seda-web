import type { MetadataRoute } from "next"
import { VILLAS } from "@/lib/villas"
import { routing } from "@/i18n/routing"

const BASE_URL = "https://sedaprivatehomes.com"

/*
  Multilingual sitemap with hreflang alternates.
  - ES URLs render at the root (no /es prefix per `localePrefix: 'as-needed'`).
  - EN URLs render at /en/<path>.
  Each entry exposes `alternates.languages` so Google + Bing can correctly
  associate language variants and avoid duplicate-content penalties.
*/

const STATIC_PATHS = [
  { path: "",              priority: 1.0,  changeFrequency: "weekly"  as const },
  { path: "/coleccion",    priority: 0.95, changeFrequency: "weekly"  as const },
  { path: "/propietarios", priority: 0.9,  changeFrequency: "monthly" as const },
  { path: "/guestapp",     priority: 0.9,  changeFrequency: "monthly" as const },
  { path: "/experiencias", priority: 0.85, changeFrequency: "monthly" as const },
  { path: "/ecosistema",   priority: 0.85, changeFrequency: "monthly" as const },
  { path: "/contacto",     priority: 0.85, changeFrequency: "monthly" as const },
  { path: "/descubre",     priority: 0.8,  changeFrequency: "monthly" as const },
  { path: "/faq",          priority: 0.7,  changeFrequency: "monthly" as const },
]

function localeUrl(locale: string, path: string) {
  // With `localePrefix: 'as-needed'`, default locale (es) drops the prefix.
  if (locale === routing.defaultLocale) {
    return `${BASE_URL}${path || "/"}`
  }
  return `${BASE_URL}/${locale}${path}`
}

function buildAlternates(path: string) {
  const languages: Record<string, string> = {}
  for (const loc of routing.locales) {
    languages[loc] = localeUrl(loc, path)
  }
  languages["x-default"] = localeUrl(routing.defaultLocale, path)
  return languages
}

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
