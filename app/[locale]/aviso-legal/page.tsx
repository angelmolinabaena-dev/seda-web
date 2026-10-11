import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { LegalDocument } from "@/components/legal-document"
import type { Locale, LocaleParams } from "@/i18n/routing"
import { AVISO_LEGAL } from "@/lib/legal/aviso-legal"
import { exigirIdentidad } from "@/lib/legal/entity"
import { buildAlternates, localeUrl } from "@/lib/seo-urls"

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = (await params).locale as Locale
  const doc = AVISO_LEGAL.traducciones[locale]
  return {
    title: doc.titulo,
    description: doc.entradilla,
    alternates: {
      canonical: localeUrl(locale, AVISO_LEGAL.ruta),
      languages: buildAlternates(AVISO_LEGAL.ruta),
    },
  }
}

export default async function AvisoLegalPage({ params }: LocaleParams) {
  const locale = (await params).locale as Locale
  setRequestLocale(locale)
  const t = await getTranslations("legal")
  // Detiene `next build` si falta cualquier dato que la LSSI obliga a
  // publicar. Ver el encabezado de `lib/legal/entity.ts`.
  const pendientes = exigirIdentidad("aviso-legal")

  return (
    <LegalDocument
      documento={AVISO_LEGAL}
      locale={locale}
      pendientes={pendientes}
      etiquetaActualizado={t("actualizado")}
      etiquetaIndice={t("indice")}
    />
  )
}
