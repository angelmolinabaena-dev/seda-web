import type { Metadata } from "next"
import { getTranslations, getLocale } from "next-intl/server"
import { localeUrl, buildAlternates } from "@/lib/seo-urls"
import { PropietariosContent } from "./PropietariosContent"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getTranslations("prop")
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
