import type { Metadata } from "next"
import { getTranslations, getLocale } from "next-intl/server"
import { localeUrl, buildAlternates } from "@/lib/seo-urls"
import { GuestappContent } from "./GuestappContent"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getTranslations("guestapp")
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
