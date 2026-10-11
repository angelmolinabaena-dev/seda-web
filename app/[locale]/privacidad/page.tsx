import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { LegalDocument } from "@/components/legal-document"
import { PageJsonLd } from "@/components/page-json-ld"
import type { Locale, LocaleParams } from "@/i18n/routing"
import { exigirIdentidad } from "@/lib/legal/entity"
import { PRIVACIDAD } from "@/lib/legal/privacidad"
import { pageMetadata } from "@/lib/site-pages"

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata(locale, PRIVACIDAD.ruta, await getTranslations({ locale }))
}

export default async function PrivacidadPage({ params }: LocaleParams) {
  const locale = (await params).locale as Locale
  setRequestLocale(locale)
  const t = await getTranslations("legal")
  // Sin el nombre del responsable (art. 13.1.a RGPD) ni el proveedor del
  // buzón que aparece en la tabla de destinatarios, esta página no puede
  // publicarse: `next build` falla aquí.
  const pendientes = exigirIdentidad("privacidad")

  return (
    <>
      <PageJsonLd locale={locale} path={PRIVACIDAD.ruta} />
      <LegalDocument
        documento={PRIVACIDAD}
        locale={locale}
        pendientes={pendientes}
        etiquetaActualizado={t("actualizado")}
        etiquetaIndice={t("indice")}
      />
    </>
  )
}
