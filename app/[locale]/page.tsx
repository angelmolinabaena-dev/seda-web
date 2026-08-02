import type { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"
import { Hero } from "@/components/hero"
import { ValueProp } from "@/components/value-prop"
import { ProjectsSection } from "@/components/projects-section"
import { EditorialBreak } from "@/components/editorial-break"
import { JourneySection } from "@/components/journey-section"
import { DualConversion } from "@/components/dual-conversion"
import { GuestAppSection } from "@/components/guest-app-section"
import { ServicesSlider } from "@/components/services-slider"
import { SedaOSSection } from "@/components/seda-os-section"
import { CommitmentsSection } from "@/components/commitments-section"
import { StudioSection } from "@/components/studio-section"
import { FaqSection } from "@/components/faq-section"
import { ContactSection } from "@/components/contact-section"
import { localeUrl, buildAlternates } from "@/lib/seo-urls"

// Only `alternates` is set here — title/description/openGraph/twitter are
// inherited from the root `app/layout.tsx` metadata (Next.js merges parent
// + child metadata per top-level key). Root layout no longer ships a
// canonical (see app/layout.tsx comment), so without this every locale of
// "/" would render with NO canonical at all — this restores a correct,
// per-locale one (es → bare domain, en/fr/de → /en, /fr, /de).
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  return {
    alternates: {
      canonical: localeUrl(locale, ""),
      languages: buildAlternates(""),
    },
  }
}

export default async function Page() {
  // FAQPage JSON-LD — reuses the exact `home.faq.items.q1..q7` keys that
  // `FaqSection` already renders as real DOM `<details>` elements (no new
  // copy). Optional per the SEO/GEO audit; added since FaqSection already
  // does the hard part correctly (unlike the old /faq page — see FaqContent).
  const t = await getTranslations("home.faq")
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: (["q1", "q2", "q3", "q4", "q5", "q6", "q7"] as const).map((k) => ({
      "@type": "Question",
      name: t(`items.${k}.q`),
      acceptedAnswer: { "@type": "Answer", text: t(`items.${k}.a`) },
    })),
  }

  return (
    <main id="main-content">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Hero />
      <ValueProp />
      <ProjectsSection />
      <EditorialBreak />
      <JourneySection />
      <DualConversion />
      <GuestAppSection />
      <ServicesSlider />
      <SedaOSSection />
      <CommitmentsSection />
      <StudioSection />
      <FaqSection />
      <ContactSection />
    </main>
  )
}
