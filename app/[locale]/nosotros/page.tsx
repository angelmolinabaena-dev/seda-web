import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import type { LocaleParams } from "@/i18n/routing"
import { PageJsonLd } from "@/components/page-json-ld"
import { pageMetadata } from "@/lib/site-pages"
import { NosotrosContent } from "./NosotrosContent"

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata(locale, "/nosotros", await getTranslations({ locale }))
}

export default async function NosotrosPage({ params }: LocaleParams) {
  const { locale } = await params
  setRequestLocale(locale)
  return (
    <>
      <PageJsonLd locale={locale} path="/nosotros" />
      <NosotrosContent />
    </>
  )
}
