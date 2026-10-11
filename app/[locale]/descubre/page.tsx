import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import type { LocaleParams } from "@/i18n/routing"
import { PageJsonLd } from "@/components/page-json-ld"
import { JsonLdScript } from "@/components/page-json-ld"
import { zonasJsonLd } from "@/lib/jsonld"
import { pageMetadata } from "@/lib/site-pages"
import { DescubreContent } from "./DescubreContent"

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata(locale, "/descubre", await getTranslations({ locale }))
}

export default async function DescubrePage({ params }: LocaleParams) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("descubre.presence.h2")
  return (
    <>
      <PageJsonLd locale={locale} path="/descubre" />
      {/* Las zonas de «Presencia» (lib/zonas.ts), con el título de esa sección. */}
      <JsonLdScript data={zonasJsonLd(locale, `${t("line1")} ${t("italic")}`)} />
      <DescubreContent />
    </>
  )
}
