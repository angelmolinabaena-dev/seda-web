import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import type { LocaleParams } from "@/i18n/routing"
import { localeUrl, buildAlternates } from "@/lib/seo-urls"
import { EcosistemaContent } from "./EcosistemaContent"

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "eco" })
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
