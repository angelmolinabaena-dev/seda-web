import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import type { LocaleParams } from "@/i18n/routing"
import { localeUrl, buildAlternates } from "@/lib/seo-urls"
import { ContactoContent } from "./ContactoContent"

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "contacto" })
  return {
    title: `${t("hero.h1.line1")} ${t("hero.h1.italic")}`,
    // No single existing "intro" paragraph for this page — composed from
    // the two existing `type.guest.desc` / `type.owner.desc` strings
    // already shown on the page's own contact-type selector cards.
    description: `${t("type.guest.desc")} ${t("type.owner.desc")}`,
    alternates: {
      canonical: localeUrl(locale, "/contacto"),
      languages: buildAlternates("/contacto"),
    },
  }
}

export default function ContactoPage() {
  return <ContactoContent />
}
