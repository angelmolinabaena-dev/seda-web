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
})

export type Locale = (typeof routing.locales)[number]
