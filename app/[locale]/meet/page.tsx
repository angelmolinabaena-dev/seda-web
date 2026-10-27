import type { Metadata } from "next"
import { Link } from "@/i18n/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"
import type { Locale, LocaleParams } from "@/i18n/routing"
import { pieLegal } from "@/lib/legal/entity"
import { localizedMetadata } from "@/lib/site-pages"
import { Calendar, Shield, Mail, ArrowRight } from "lucide-react"
import { CalendlyFachada, type CalendlyFachadaCopy } from "./CalendlyFachada"

/*
  /meet — Booking-focused landing page.

  Target audience: cold-outreach leads who clicked the calendar link in
  their email/InMail. They've already self-selected as interested; the
  page's only job is to convert "curious owner" into "30-min call booked".

  Differs from /founding-owners by intent:
    /founding-owners → educational, full programme description, soft CTA
    /meet            → booking-only, minimal copy, Calendly embed inline

  Pattern:
    - Copy in messages/<locale>.json (`meet.copy`, same as /founding-owners)
    - noindex (this is a conversion landing, not for organic search)
    - Calendly behind a facade (CalendlyFachada): the iframe only loads when
      the visitor clicks «Ver calendario», after a notice that Calendly sets
      its own cookies; the direct calendly.com link sits next to the button
    - Link to /founding-owners for those who want more context before booking
*/

const CALENDLY_URL = "https://calendly.com/sedaprivatehomes-info"
const CONTACT_EMAIL = "angel@sedaprivatehomes.com"

// Calendly embed URL. No `hide_gdpr_banner`: Calendly shows its own cookie notice.
const CALENDLY_EMBED =
  `${CALENDLY_URL}?hide_event_type_details=1&primary_color=4a5340`

// Title and description in the URL's language (messages/<locale>.json,
// `meet.meta`). The root layout appends « · SEDA Private Homes».
export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "meet.meta" })
  return {
    ...localizedMetadata(locale, "/meet", { title: t("title"), description: t("description") }),
    // noindex — landing for cold-outreach conversion, not for organic
    robots: { index: false, follow: false },
  }
}

/*
  Los textos viven en messages/<locale>.json, namespace `meet.copy` (REA M-8: antes
  estaban en un objeto COPY de este fichero, fuera de los tests de idioma y de
  la guarda de tarifa). Las cifras de precio salen de lib/tarifa.
*/

export default async function MeetPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  setRequestLocale(locale)

  const m = await getTranslations({ locale, namespace: "meet.copy" })
  const t = {
    eyebrow: m("eyebrow"),
    h1: [m("h1.l1"), m("h1.l2")],
    sub: m("sub"),
    cta: m("cta"),
    coverTitle: m("coverTitle"),
    coverBullets: [m("cover.b1"), m("cover.b2"), m("cover.b3")],
    diffsTitle: m("diffsTitle"),
    diffs: (["d1", "d2", "d3"] as const).map((k) => ({ title: m(`diffs.${k}.title`), body: m(`diffs.${k}.body`) })),
    seats: m("seats"),
    calendly: {
      aviso: m("calendly.aviso"),
      verCalendario: m("calendly.verCalendario"),
      enlaceDirecto: m("calendly.enlaceDirecto"),
      politicaCookies: m("calendly.politicaCookies"),
      tituloIframe: m("calendly.tituloIframe"),
    } satisfies CalendlyFachadaCopy,
    fallbackTitle: m("fallbackTitle"),
    fallbackBody: m("fallbackBody"),
    fallbackLink: CONTACT_EMAIL,
    contextLink: "/founding-owners",
    contextLinkLabel: m("contextLinkLabel"),
    // Sale de los mismos datos que el aviso legal (lib/legal/entity.ts): no nombra una sociedad que el aviso dice que no existe.
    footer: pieLegal(locale as Locale),
  }

  return (
    <main id="main-content" className="min-h-screen bg-background">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="px-6 pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-foreground/50 mb-6">
            {t.eyebrow}
          </p>

          <h1 className="font-serif text-balance text-4xl leading-[1.1] tracking-tight text-foreground md:text-6xl">
            <span className="block">{t.h1[0]}</span>
            <span className="block opacity-70">{t.h1[1]}</span>
          </h1>

          <p className="mt-8 max-w-xl text-base md:text-lg leading-relaxed text-foreground/70">
            {t.sub}
          </p>

          <a
            href="#book"
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            <Calendar size={16} aria-hidden />
            {t.cta}
          </a>
        </div>
      </section>

      {/* ── Cover (what we'll discuss) ───────────────────────────── */}
      <section className="px-6 py-12 md:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-8">
            {t.coverTitle}
          </h2>
          <ul className="space-y-4">
            {t.coverBullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-3 text-base md:text-lg text-foreground/80">
                <span
                  className="mt-2 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-foreground/40"
                  aria-hidden
                />
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Three differentiators ────────────────────────────────── */}
      <section className="px-6 py-12 md:py-20 bg-foreground/[0.02]">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-10 md:mb-14">
            {t.diffsTitle}
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {t.diffs.map((d, i) => (
              <article
                key={i}
                className="seda-card"
              >
                <div className="mb-4 flex items-center gap-3">
                  <span className="font-serif text-2xl text-foreground/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <Shield size={16} className="text-foreground/30" aria-hidden />
                </div>
                <h3 className="font-serif text-lg md:text-xl text-foreground mb-3">
                  {d.title}
                </h3>
                <p className="text-sm md:text-base leading-relaxed text-foreground/65">
                  {d.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Calendly (fachada) ────────────────────────────────────── */}
      <section id="book" className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-foreground/50 mb-3">
            {t.eyebrow}
          </p>
          <p className="text-sm text-foreground/60 mb-8">{t.seats}</p>

          <CalendlyFachada
            calendlyUrl={CALENDLY_URL}
            embedUrl={CALENDLY_EMBED}
            copy={t.calendly}
          />
        </div>
      </section>

      {/* ── Fallback contact + context link ──────────────────────── */}
      <section className="px-6 py-16 md:py-20 border-t border-border">
        <div className="mx-auto max-w-3xl grid gap-10 md:grid-cols-2">
          <div>
            <h3 className="font-serif text-xl text-foreground mb-3">
              {t.fallbackTitle}
            </h3>
            <p className="text-sm text-foreground/65 mb-4">{t.fallbackBody}</p>
            <a
              href={`mailto:${t.fallbackLink}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground underline underline-offset-4 hover:opacity-70"
            >
              <Mail size={14} aria-hidden />
              {t.fallbackLink}
            </a>
          </div>

          <div>
            <Link
              href={t.contextLink}
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
            >
              {t.contextLinkLabel}
              <ArrowRight size={14} aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="px-6 py-10 text-center text-xs text-foreground/50">
        {t.footer}
      </footer>
    </main>
  )
}
