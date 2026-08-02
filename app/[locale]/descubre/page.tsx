import type { Metadata } from "next"
import { getTranslations, getLocale } from "next-intl/server"
import { localeUrl, buildAlternates } from "@/lib/seo-urls"
import { DescubreContent } from "./DescubreContent"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getTranslations("descubre")
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
