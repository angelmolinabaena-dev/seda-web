import { defineRouting } from "next-intl/routing"

/*
  SEDA locale routing.
  - Default `es` renders at `/`, `/coleccion`, etc. — no prefix.
  - `en` renders at `/en`, `/en/coleccion`, etc.
  This `as-needed` prefix preserves existing Spanish URLs (no SEO regression)
  while giving English its own indexable, hreflang-able URL space.
*/
export const routing = defineRouting({
  locales: ["es", "en", "fr", "de"],
  defaultLocale: "es",
  localePrefix: "as-needed",
  // No `Link: …; rel="alternate"; hreflang=…` response header. The hreflang
  // set lives in each page's `<head>` (`alternates.languages`, built by
  // `@/lib/seo-urls`) and in the sitemap. The middleware's header was a second,
  // independent copy built from the REQUEST host: on any host other than
  // sedaprivatehomes.com (a preview, localhost) it contradicted the `<head>`,
  // and Lighthouse failed `canonical` with «points to another hreflang
  // location». One source, not two.
  alternateLinks: false,
})

export type Locale = (typeof routing.locales)[number]

/*
  Props of every `[locale]` page and its `generateMetadata`. The locale comes
  from the URL segment, never from `getLocale()`: without `setRequestLocale`
  that helper falls back to the request headers, and reading headers turns
  the whole route into a per-request (dynamic) render — no CDN cache.
*/
export type LocaleParams = { params: Promise<{ locale: string }> }
