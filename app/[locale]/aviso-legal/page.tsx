import type { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"
import { LegalDocument } from "@/components/legal-document"
import type { Locale } from "@/i18n/routing"
import { AVISO_LEGAL } from "@/lib/legal/aviso-legal"
import { exigirIdentidad } from "@/lib/legal/entity"
import { buildAlternates, localeUrl } from "@/lib/seo-urls"

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale
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

export default async function AvisoLegalPage() {
  const locale = (await getLocale()) as Locale
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
