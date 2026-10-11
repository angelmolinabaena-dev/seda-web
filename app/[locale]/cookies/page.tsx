import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { LegalDocument } from "@/components/legal-document"
import type { Locale, LocaleParams } from "@/i18n/routing"
import { COOKIES } from "@/lib/legal/cookies"
import { exigirIdentidad } from "@/lib/legal/entity"
import { buildAlternates, localeUrl } from "@/lib/seo-urls"

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = (await params).locale as Locale
  const doc = COOKIES.traducciones[locale]
  return {
    title: doc.titulo,
    description: doc.entradilla,
    alternates: {
      canonical: localeUrl(locale, COOKIES.ruta),
      languages: buildAlternates(COOKIES.ruta),
    },
  }
}

export default async function CookiesPage({ params }: LocaleParams) {
  const locale = (await params).locale as Locale
  setRequestLocale(locale)
  const t = await getTranslations("legal")
  const pendientes = exigirIdentidad("cookies")

  return (
    <LegalDocument
      documento={COOKIES}
      locale={locale}
      pendientes={pendientes}
      etiquetaActualizado={t("actualizado")}
      etiquetaIndice={t("indice")}
    />
  )
}
