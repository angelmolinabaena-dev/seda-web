import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import type { LocaleParams } from "@/i18n/routing"
import { localeUrl, buildAlternates } from "@/lib/seo-urls"
import { PropietariosContent } from "./PropietariosContent"

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "prop" })
  return {
    title: `${t("hero.h1.line1")} ${t("hero.h1.italic")}`,
    description: t("hero.body"),
    alternates: {
      canonical: localeUrl(locale, "/propietarios"),
      languages: buildAlternates("/propietarios"),
    },
  }
}

export default function PropietariosPage() {
  return <PropietariosContent />
}
