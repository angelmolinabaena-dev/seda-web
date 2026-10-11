import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import type { LocaleParams } from "@/i18n/routing"
import { localeUrl, buildAlternates } from "@/lib/seo-urls"
import { DescubreContent } from "./DescubreContent"

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "descubre" })
  return {
    title: `${t("h1.line1")} ${t("h1.italic1")} ${t("h1.line2")}`,
    description: t("manifesto.body"),
    alternates: {
      canonical: localeUrl(locale, "/descubre"),
      languages: buildAlternates("/descubre"),
    },
  }
}

export default function DescubrePage() {
  return <DescubreContent />
}
