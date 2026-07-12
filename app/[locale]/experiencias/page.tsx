import type { Metadata } from "next"
import { getTranslations, getLocale } from "next-intl/server"
import { localeUrl, buildAlternates } from "@/lib/seo-urls"
import { ExperienciasContent } from "./ExperienciasContent"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getTranslations("exp")
  return {
    title: `${t("h1.line1")} ${t("h1.italic")}`,
    description: t("body"),
    alternates: {
      canonical: localeUrl(locale, "/experiencias"),
      languages: buildAlternates("/experiencias"),
    },
  }
}

export default function ExperienciasPage() {
  return <ExperienciasContent />
}
