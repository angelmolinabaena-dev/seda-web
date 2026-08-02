import type { Metadata } from "next"
import { getLocale } from "next-intl/server"
import { localeUrl, buildAlternates } from "@/lib/seo-urls"
import { NosotrosContent } from "./NosotrosContent"

// NOTE (flagged for Ángel, not decided here): unlike the other 8 converted
// pages, `/nosotros` has ZERO i18n infrastructure — no `useTranslations`
// import, no `nosotros.*` namespace in messages/*.json (only a one-off nav
// label). The page body is hardcoded Spanish. Title/description below are
// copied VERBATIM from that hardcoded copy (not translated, not reworded)
// per the "no new copy" constraint — so /en, /fr, /de still render a
// Spanish title/description, same as the Spanish body they wrap. This is
// still a strict improvement (real per-page metadata + correct canonical/
// hreflang instead of the homepage's generic Spanish default), but full
// i18n coverage for this page is a separate, larger effort (needs actual
// translated copy in 3 languages) that's out of scope for this fix.
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  return {
    title: "Ángel Molina",
    description:
      "Hostelero. Detrás de Hotel Estepona Plaza, premiado año tras año por Booking, TripAdvisor, Expedia y Core Hospitality. Fundador de Seda Private Homes — la misma disciplina hotelera aplicada a residencias privadas en la Costa del Sol.",
    alternates: {
      canonical: localeUrl(locale, "/nosotros"),
      languages: buildAlternates("/nosotros"),
    },
  }
}

export default function NosotrosPage() {
  return <NosotrosContent />
}
