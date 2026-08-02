import type { Metadata } from "next"
import { getTranslations, getLocale } from "next-intl/server"
import { localeUrl, buildAlternates } from "@/lib/seo-urls"
import { FaqContent } from "./FaqContent"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getTranslations("faq")
  return {
    title: `${t("h1.line1")} ${t("h1.italic")} ${t("h1.line2")}`,
    description: t("intro"),
    alternates: {
      canonical: localeUrl(locale, "/faq"),
      languages: buildAlternates("/faq"),
    },
  }
}

export default async function FaqPage() {
  const t = await getTranslations("faq")

  // FAQPage JSON-LD — mirrors exactly what `FaqContent` renders (both the
  // guest and owner lists, same `faq.guests_items`/`faq.owners_items` keys),
  // now that both are always in the DOM (see FaqContent.tsx). No new copy:
  // every question/answer here is the same translated string shown on page.
  const guestKeys = ["q1", "q2", "q3", "q4", "q5"] as const
  const ownerKeys = ["q1", "q2", "q3", "q4", "q5", "q6"] as const
  const mainEntity = [
    ...guestKeys.map((k) => ({
      "@type": "Question",
      name: t(`guests_items.${k}.q`),
      acceptedAnswer: { "@type": "Answer", text: t(`guests_items.${k}.a`) },
    })),
    ...ownerKeys.map((k) => ({
      "@type": "Question",
      name: t(`owners_items.${k}.q`),
      acceptedAnswer: { "@type": "Answer", text: t(`owners_items.${k}.a`) },
    })),
  ]
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <FaqContent />
    </>
  )
}
