import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { LegalDocument } from "@/components/legal-document"
import { PageJsonLd } from "@/components/page-json-ld"
import type { Locale, LocaleParams } from "@/i18n/routing"
import { COOKIES } from "@/lib/legal/cookies"
import { exigirIdentidad } from "@/lib/legal/entity"
import { pageMetadata } from "@/lib/site-pages"

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata(locale, COOKIES.ruta, await getTranslations({ locale }))
}

export default async function CookiesPage({ params }: LocaleParams) {
  const locale = (await params).locale as Locale
  setRequestLocale(locale)
  const t = await getTranslations("legal")
  const pendientes = exigirIdentidad("cookies")

  return (
    <>
      <PageJsonLd locale={locale} path={COOKIES.ruta} />
      <LegalDocument
        documento={COOKIES}
        locale={locale}
        pendientes={pendientes}
        etiquetaActualizado={t("actualizado")}
        etiquetaIndice={t("indice")}
      />
    </>
  )
}
