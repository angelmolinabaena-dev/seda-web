import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import type { LocaleParams } from "@/i18n/routing"
import { JsonLdScript, PageJsonLd } from "@/components/page-json-ld"
import { faqHuespedes, faqPropietarios } from "@/lib/faq"
import { faqPageJsonLd } from "@/lib/jsonld"
import { pageMetadata } from "@/lib/site-pages"
import { FaqContent } from "./FaqContent"

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata(locale, "/faq", await getTranslations({ locale }))
}

export default async function FaqPage({ params }: LocaleParams) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations()

  // FAQPage JSON-LD — exactly what `FaqContent` renders (both the guest and
  // owner lists, both always in the DOM), from the same lib/faq.ts lists.
  // No new copy: every question/answer is the translated string on the page.
  return (
    <>
      <PageJsonLd locale={locale} path="/faq" />
      <JsonLdScript data={faqPageJsonLd([...faqHuespedes(t), ...faqPropietarios(t)])} />
      <FaqContent />
    </>
  )
}
