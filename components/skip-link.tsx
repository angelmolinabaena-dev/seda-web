"use client"

import { useTranslations } from "next-intl"

/*
  Locale-aware skip-to-content link rendered at the top of the locale layout.
*/
export function SkipLink() {
  const t = useTranslations()
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-foreground focus:text-background focus:font-mono focus:text-[11px] focus:tracking-[0.2em] focus:uppercase focus:outline-none focus:ring-2 focus:ring-[hsl(var(--olive))]"
    >
      {t("skip.to_content")}
    </a>
  )
}
