import { routing } from "@/i18n/routing"

/*
  Shared canonical/hreflang URL helpers — single source of truth for building
  locale-aware absolute URLs. Used by `app/sitemap.ts` and by every route's
  `generateMetadata` (`alternates.canonical` + `alternates.languages`).

  With `localePrefix: 'as-needed'`, the default locale (es) renders at the
  bare path — no `/es` prefix — while every other locale gets `/{locale}/...`.
*/

export const SITE_URL = "https://sedaprivatehomes.com"

/** Absolute URL for `path` (must start with "/", or "" for the home page) in `locale`. */
export function localeUrl(locale: string, path: string) {
  if (locale === routing.defaultLocale) {
    return `${SITE_URL}${path || "/"}`
  }
  return `${SITE_URL}/${locale}${path}`
}

/** hreflang map for `path` — one entry per configured locale, plus x-default. */
export function buildAlternates(path: string) {
  const languages: Record<string, string> = {}
  for (const loc of routing.locales) {
    languages[loc] = localeUrl(loc, path)
  }
  languages["x-default"] = localeUrl(routing.defaultLocale, path)
  return languages
}
