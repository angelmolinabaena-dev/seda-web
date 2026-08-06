import type { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"
import { LegalDocument } from "@/components/legal-document"
import type { Locale } from "@/i18n/routing"
import { COOKIES } from "@/lib/legal/cookies"
import { exigirIdentidad } from "@/lib/legal/entity"
import { buildAlternates, localeUrl } from "@/lib/seo-urls"

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale
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

export default async function CookiesPage() {
  const locale = (await getLocale()) as Locale
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
