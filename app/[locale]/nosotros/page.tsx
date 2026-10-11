import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import type { LocaleParams } from "@/i18n/routing"
import { localeUrl, buildAlternates } from "@/lib/seo-urls"
import { NosotrosContent } from "./NosotrosContent"

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "nosotros" })
  return {
    title: "Ángel Molina",
    description: t("meta_description"),
    alternates: {
      canonical: localeUrl(locale, "/nosotros"),
      languages: buildAlternates("/nosotros"),
    },
  }
}

export default function NosotrosPage() {
  return <NosotrosContent />
}
