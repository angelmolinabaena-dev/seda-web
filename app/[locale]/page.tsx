import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import type { LocaleParams } from "@/i18n/routing"
import { Hero } from "@/components/hero"
import { ValueProp } from "@/components/value-prop"
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
import { JsonLdScript } from "@/components/page-json-ld"
import { faqPortada } from "@/lib/faq"
import { faqPageJsonLd } from "@/lib/jsonld"
import { pageMetadata } from "@/lib/site-pages"

// Título, descripción, Open Graph y Twitter salen de `home.meta.*` de cada
// idioma (ver `pageMetadata` en lib/site-pages.ts), igual que el resto de páginas.
export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata(locale, "", await getTranslations({ locale }))
}

export default async function Page({ params }: LocaleParams) {
  const { locale } = await params
  setRequestLocale(locale)

  // FAQPage JSON-LD — the same `home.faq.items.q1..q7` list (lib/faq.ts)
  // that `FaqSection` renders as real DOM `<details>` elements (no new copy).
  const t = await getTranslations()

  return (
    <main id="main-content">
      <JsonLdScript data={faqPageJsonLd(faqPortada(t))} />
      <Hero />
      <ValueProp />
      {/* `ProjectsSection` (rejilla de las 4 villas + contador) retirada:
          las cuatro residencias no existen. Ver
          docs/audit/RETIRADA-COLECCION.md §2.3 — no se sustituye por nada,
          `ValueProp` → `EditorialBreak` enlaza sin bloque intermedio. */}
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
