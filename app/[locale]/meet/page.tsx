import type { Metadata } from "next"
import Link from "next/link"
import { setRequestLocale } from "next-intl/server"
import { Calendar, Shield, Mail, ArrowRight } from "lucide-react"

/*
  /meet — Booking-focused landing page.

  Target audience: cold-outreach leads who clicked the calendar link in
  their email/InMail. They've already self-selected as interested; the
  page's only job is to convert "curious owner" into "30-min call booked".

  Differs from /founding-owners by intent:
    /founding-owners → educational, full programme description, soft CTA
    /meet            → booking-only, minimal copy, Calendly embed inline

  Pattern:
    - Inline per-locale COPY object (same convention as /founding-owners)
    - noindex (this is a conversion landing, not for organic search)
    - Calendly iframe embedded so the user never leaves the domain
    - Fallback direct Calendly link for users who block iframes
    - Link to /founding-owners for those who want more context before booking
*/

const CALENDLY_URL = "https://calendly.com/sedaprivatehomes"

// Calendly embed URL — hides cookie banner + branding for cleaner UX
const CALENDLY_EMBED =
  `${CALENDLY_URL}?hide_gdpr_banner=1&hide_event_type_details=1&primary_color=4a5340`

type Locale = "es" | "en" | "fr" | "de"

export const metadata: Metadata = {
  title: "Reserva una llamada | Seda Private Homes",
  description: "Treinta minutos. Sin propuesta al final salvo que ambos queramos una.",
  // noindex — landing for cold-outreach conversion, not for organic
  robots: { index: false, follow: false },
}

const COPY: Record<
  Locale,
  {
    eyebrow: string
    h1: [string, string]
    sub: string
    cta: string
    coverTitle: string
    coverBullets: string[]
    diffsTitle: string
    diffs: { title: string; body: string }[]
    seats: string
    fallbackTitle: string
    fallbackBody: string
    fallbackLink: string
    contextLink: string
    contextLinkLabel: string
    footer: string
  }
> = {
  es: {
    eyebrow: "PROGRAMA PROPIETARIOS FUNDADORES",
    h1: ["Una conversación sobre tu residencia", "en la Costa del Sol."],
    sub: "Treinta minutos. Sin propuesta al final salvo que ambos queramos continuar.",
    cta: "Reservar una hora →",
    coverTitle: "Qué cubriremos en 30 minutos",
    coverBullets: [
      "Tu propiedad y tu situación actual",
      "Cómo funcionan las condiciones de Propietario Fundador",
      "Si somos los gestores adecuados para ti",
    ],
    diffsTitle: "Tres cosas que hacemos diferente",
    diffs: [
      {
        title: "Compliance automatizado",
        body: "RD 933/2021, Modelo 210 trimestral y SES.HOSPEDAJES — gestionados, documentados y listos para tu asesor fiscal.",
      },
      {
        title: "Informe mensual en tu idioma",
        body: "Un estado financiero de dos páginas el día 5 de cada mes. Estructura de comisión fiscalmente deducible documentada.",
      },
      {
        title: "Gestionado por el fundador",
        body: "Contactas directamente conmigo. Tres personas conocerán tu casa personalmente. Nunca habrá una cola de tickets.",
      },
    ],
    seats: "5 plazas · 3 disponibles · 19% comisión durante 24 meses",
    fallbackTitle: "¿Prefieres escribir primero?",
    fallbackBody: "Escríbeme directamente a:",
    fallbackLink: "angel@sedaprivatehomes.com",
    contextLink: "/founding-owners",
    contextLinkLabel: "Conocer el programa antes de reservar →",
    footer: "Seda Private Homes S.L. · Marbella · España",
  },
  en: {
    eyebrow: "FOUNDING OWNERS PROGRAMME",
    h1: ["A conversation about your residence", "in the Costa del Sol."],
    sub: "Thirty minutes. No proposal at the end unless we both want one.",
    cta: "Choose a time →",
    coverTitle: "What we will cover in 30 minutes",
    coverBullets: [
      "Your residence and your situation",
      "How Founding Owner terms work",
      "Whether we are the right fit for you",
    ],
    diffsTitle: "Three things we do differently",
    diffs: [
      {
        title: "Compliance automation",
        body: "RD 933/2021 traveler registration, quarterly Modelo 210 documentation and SES.HOSPEDAJES — handled, documented and ready for your accountant.",
      },
      {
        title: "Monthly P&L in your language",
        body: "A two-page statement on the 5th of every month. Tax-deductible operating-fee structure documented.",
      },
      {
        title: "Founder-led, not a call center",
        body: "You always reach me directly. Three people will know your home personally. There will never be a ticket queue.",
      },
    ],
    seats: "5 places · 3 remaining · 19% operating fee locked for 24 months",
    fallbackTitle: "Prefer to write first?",
    fallbackBody: "Email me directly at:",
    fallbackLink: "angel@sedaprivatehomes.com",
    contextLink: "/en/founding-owners",
    contextLinkLabel: "Read about the programme before booking →",
    footer: "Seda Private Homes S.L. · Marbella · Spain",
  },
  fr: {
    eyebrow: "PROGRAMME PROPRIÉTAIRES FONDATEURS",
    h1: ["Une conversation sur votre résidence", "sur la Costa del Sol."],
    sub: "Trente minutes. Aucune proposition à la fin sauf si nous le souhaitons tous les deux.",
    cta: "Choisir un horaire →",
    coverTitle: "Ce que nous aborderons en 30 minutes",
    coverBullets: [
      "Votre propriété et votre situation",
      "Comment fonctionnent les conditions Propriétaire Fondateur",
      "Si nous sommes les bons gestionnaires pour vous",
    ],
    diffsTitle: "Trois choses que nous faisons différemment",
    diffs: [
      {
        title: "Conformité automatisée",
        body: "RD 933/2021, Modèle 210 trimestriel et SES.HOSPEDAJES — gérés, documentés et prêts pour votre conseiller fiscal.",
      },
      {
        title: "Rapport mensuel dans votre langue",
        body: "Un état financier de deux pages le 5 de chaque mois. Structure de commission fiscalement déductible documentée.",
      },
      {
        title: "Géré par le fondateur",
        body: "Vous me contactez directement. Trois personnes connaîtront votre maison personnellement. Jamais de file d'attente de tickets.",
      },
    ],
    seats: "5 places · 3 disponibles · 19% de commission pendant 24 mois",
    fallbackTitle: "Préférez-vous écrire d'abord ?",
    fallbackBody: "Écrivez-moi directement à :",
    fallbackLink: "angel@sedaprivatehomes.com",
    contextLink: "/fr/founding-owners",
    contextLinkLabel: "En savoir plus sur le programme avant de réserver →",
    footer: "Seda Private Homes S.L. · Marbella · Espagne",
  },
  de: {
    eyebrow: "FOUNDING-OWNERS-PROGRAMM",
    h1: ["Ein Gespräch über Ihre Residenz", "an der Costa del Sol."],
    sub: "Dreißig Minuten. Kein Angebot am Ende, es sei denn, wir beide wollen es.",
    cta: "Termin wählen →",
    coverTitle: "Was wir in 30 Minuten besprechen",
    coverBullets: [
      "Ihre Immobilie und Ihre Situation",
      "Wie die Founding-Owner-Konditionen funktionieren",
      "Ob wir die richtige Verwaltung für Sie sind",
    ],
    diffsTitle: "Drei Dinge, die wir anders machen",
    diffs: [
      {
        title: "Automatisierte Compliance",
        body: "RD 933/2021, Modelo 210 quartalsweise und SES.HOSPEDAJES — abgewickelt, dokumentiert und bereit für Ihren Steuerberater.",
      },
      {
        title: "Monatlicher Bericht in Ihrer Sprache",
        body: "Eine zweiseitige Finanzaufstellung am 5. jedes Monats. Steuerlich absetzbare Provisionsstruktur dokumentiert.",
      },
      {
        title: "Vom Gründer geführt",
        body: "Sie erreichen mich direkt. Drei Personen werden Ihr Haus persönlich kennen. Es wird nie eine Ticket-Warteschlange geben.",
      },
    ],
    seats: "5 Plätze · 3 verfügbar · 19% Provision für 24 Monate",
    fallbackTitle: "Möchten Sie lieber zuerst schreiben?",
    fallbackBody: "Schreiben Sie mir direkt an:",
    fallbackLink: "angel@sedaprivatehomes.com",
    contextLink: "/de/founding-owners",
    contextLinkLabel: "Mehr über das Programm vor der Buchung lesen →",
    footer: "Seda Private Homes S.L. · Marbella · Spanien",
  },
}

export default async function MeetPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: rawLocale } = await params
  const locale = (
    (["es", "en", "fr", "de"] as const).includes(rawLocale as Locale)
      ? rawLocale
      : "es"
  ) as Locale

  setRequestLocale(locale)

  const t = COPY[locale]

  return (
    <main className="min-h-screen bg-background">
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

      {/* ── Calendly embed ───────────────────────────────────────── */}
      <section id="book" className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-foreground/50 mb-3">
            {t.eyebrow}
          </p>
          <p className="text-sm text-foreground/60 mb-8">{t.seats}</p>

          <div className="rounded-2xl border border-border bg-background overflow-hidden">
            {/*
              Calendly iframe embed.
              - height=720 fits one month view on most screens
              - sandbox is permissive (Calendly is trusted, owned by Vercel-class infra)
              - loading=lazy so the embed doesn't block above-the-fold paint
              - title for screen-readers
            */}
            <iframe
              src={CALENDLY_EMBED}
              title="Calendly — Seda Private Homes booking"
              loading="lazy"
              className="w-full"
              style={{ height: "720px", border: "0" }}
            />
          </div>

          {/* Fallback for users with iframe blocked */}
          <p className="mt-6 text-center text-sm text-foreground/60">
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-foreground"
            >
              {t.cta}
            </a>
          </p>
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
