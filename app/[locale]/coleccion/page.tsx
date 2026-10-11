import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import type { LocaleParams } from "@/i18n/routing"
import { localeUrl, buildAlternates } from "@/lib/seo-urls"
import { ColeccionContent } from "./ColeccionContent"

/*
  Server component wrapper — mirrors the pattern used by `app/[locale]/page.tsx`
  (home) and `app/[locale]/villa/[slug]/page.tsx`. The actual UI is a client
  component (`ColeccionContent`) because it needs interactivity; only a
  server component can export `generateMetadata`, so the page is split in two.
  Title/description reuse the EXISTING translated `coleccion.h1`/`coleccion.body`
  keys (no new copy) — same text already rendered in the page's own hero.
*/
export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "coleccion" })
  return {
    title: `${t("h1.line1")} ${t("h1.italic")} ${t("h1.line2")}`,
    description: t("body"),
    alternates: {
      canonical: localeUrl(locale, "/coleccion"),
      languages: buildAlternates("/coleccion"),
    },
  }
}

export default function ColeccionPage() {
  return <ColeccionContent />
}
