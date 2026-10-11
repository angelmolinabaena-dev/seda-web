import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import type { LocaleParams } from "@/i18n/routing"
import { localeUrl, buildAlternates } from "@/lib/seo-urls"
import { GuestappContent } from "./GuestappContent"

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "guestapp" })
  return {
    title: `${t("hero.h1.line1")} ${t("hero.h1.italic")} ${t("hero.h1.line2")}`,
    description: t("hero.body"),
    alternates: {
      canonical: localeUrl(locale, "/guestapp"),
      languages: buildAlternates("/guestapp"),
    },
  }
}

export default function GuestAppPage() {
  return <GuestappContent />
}
