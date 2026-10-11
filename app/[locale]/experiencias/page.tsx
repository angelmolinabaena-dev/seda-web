import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import type { LocaleParams } from "@/i18n/routing"
import { localeUrl, buildAlternates } from "@/lib/seo-urls"
import { ExperienciasContent } from "./ExperienciasContent"

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "exp" })
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
