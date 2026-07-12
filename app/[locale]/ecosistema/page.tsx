import type { Metadata } from "next"
import { getTranslations, getLocale } from "next-intl/server"
import { localeUrl, buildAlternates } from "@/lib/seo-urls"
import { EcosistemaContent } from "./EcosistemaContent"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getTranslations("eco")
  return {
    title: `${t("h1.line1")} ${t("h1.italic")}`,
    description: t("body"),
    alternates: {
      canonical: localeUrl(locale, "/ecosistema"),
      languages: buildAlternates("/ecosistema"),
    },
  }
}

export default function EcosistemaPage() {
  return <EcosistemaContent />
}
