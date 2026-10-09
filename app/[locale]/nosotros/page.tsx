import type { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"
import { localeUrl, buildAlternates } from "@/lib/seo-urls"
import { NosotrosContent } from "./NosotrosContent"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getTranslations("nosotros")
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
