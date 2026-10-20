import type { Metadata } from "next"
import { Link } from "@/i18n/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"
import type { LocaleParams } from "@/i18n/routing"
import { localizedMetadata } from "@/lib/site-pages"
import { Calendar, Shield, Mail, ArrowRight } from "lucide-react"
import { CalendlyFachada, type CalendlyFachadaCopy } from "./CalendlyFachada"

/*
  /meet — Booking-focused landing page.

  Target audience: cold-outreach leads who clicked the calendar link in
  their email/InMail. They've already self-selected as interested; the
  page's only job is to convert "curious owner" into "30-min call booked".

  Differs from /propietarios by intent:
    /propietarios → educational, full description of the service, soft CTA
    /meet         → booking-only, minimal copy, Calendly embed inline

  Pattern:
    - Inline per-locale COPY object
    - noindex (this is a conversion landing, not for organic search)
    - Calendly behind a facade (CalendlyFachada): the iframe only loads when
      the visitor clicks «Ver calendario», after a notice that Calendly sets
      its own cookies; the direct calendly.com link sits next to the button
    - Link to /propietarios for those who want more context before booking
*/

const CALENDLY_URL = "https://calendly.com/sedaprivatehomes-info"

// Calendly embed URL. No `hide_gdpr_banner`: Calendly shows its own cookie notice.
const CALENDLY_EMBED =
  `${CALENDLY_URL}?hide_event_type_details=1&primary_color=4a5340`

type Locale = "es" | "en" | "fr" | "de"

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
    calendly: CalendlyFachadaCopy
    fallbackTitle: string
    fallbackBody: string
    fallbackLink: string
    contextLink: string
    contextLinkLabel: string
    footer: string
  }
> = {
  es: {
    eyebrow: "LLAMADA CON PROPIETARIOS",
    h1: ["Una conversación sobre tu residencia", "en la Costa del Sol."],
    sub: "Treinta minutos. Sin propuesta al final salvo que ambos queramos continuar.",
    cta: "Reservar una hora →",
    coverTitle: "Qué cubriremos en 30 minutos",
    coverBullets: [
      "Tu propiedad y tu situación actual",
      "Cómo funciona la tarifa: 24% sobre la base neta, nunca más del 20% del alojamiento",
      "Si somos los gestores adecuados para ti",
    ],
    diffsTitle: "Tres cosas que hacemos diferente",
    diffs: [
      {
        title: "Compliance automatizado",
        body: "Registro de viajeros (RD 933/2021) integrado y preparado para SES.HOSPEDAJES. Preparamos y documentamos la información fiscal para que tu asesor la presente.",
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
    seats: "Alta 0 € · Sin permanencia: salida con 1 mes de preaviso · 24% sobre la base neta (bruto menos comisión de canal y limpieza), nunca más del 20% del alojamiento · Importes sin IVA",
    calendly: {
      aviso: "El calendario lo sirve Calendly. Al pulsar «Ver calendario», tu navegador se conecta con calendly.com y Calendly pone sus propias cookies.",
      verCalendario: "Ver calendario",
      enlaceDirecto: "O ábrelo en calendly.com",
      politicaCookies: "Política de cookies",
    },
    fallbackTitle: "¿Prefieres escribir primero?",
    fallbackBody: "Escríbeme directamente a:",
    fallbackLink: "angel@sedaprivatehomes.com",
    contextLink: "/propietarios",
    contextLinkLabel: "Conocer las condiciones antes de reservar →",
    footer: "Seda Private Homes S.L. · Marbella · España",
  },
  en: {
    eyebrow: "CALL FOR PROPERTY OWNERS",
    h1: ["A conversation about your residence", "in the Costa del Sol."],
    sub: "Thirty minutes. No proposal at the end unless we both want one.",
    cta: "Choose a time →",
    coverTitle: "What we will cover in 30 minutes",
    coverBullets: [
      "Your residence and your situation",
      "How the fee works: 24% of the net base, never more than 20% of the accommodation",
      "Whether we are the right fit for you",
    ],
    diffsTitle: "Three things we do differently",
    diffs: [
      {
        title: "Compliance automation",
        body: "RD 933/2021 guest registration, integrated and ready for reporting to SES.HOSPEDAJES. We prepare and document the tax information so your accountant can file it.",
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
    seats: "Onboarding €0 · No lock-in: leave with 1 month's notice · 24% of the net base (gross minus channel commission and cleaning), never more than 20% of the accommodation · Amounts exclude VAT",
    calendly: {
      aviso: "The calendar is provided by Calendly. When you press “View calendar”, your browser connects to calendly.com and Calendly sets its own cookies.",
      verCalendario: "View calendar",
      enlaceDirecto: "Or open it on calendly.com",
      politicaCookies: "Cookie policy",
    },
    fallbackTitle: "Prefer to write first?",
    fallbackBody: "Email me directly at:",
    fallbackLink: "angel@sedaprivatehomes.com",
    contextLink: "/propietarios",
    contextLinkLabel: "Read the terms before booking →",
    footer: "Seda Private Homes S.L. · Marbella · Spain",
  },
  fr: {
    eyebrow: "APPEL AVEC LES PROPRIÉTAIRES",
    h1: ["Une conversation sur votre résidence", "sur la Costa del Sol."],
    sub: "Trente minutes. Aucune proposition à la fin sauf si nous le souhaitons tous les deux.",
    cta: "Choisir un horaire →",
    coverTitle: "Ce que nous aborderons en 30 minutes",
    coverBullets: [
      "Votre propriété et votre situation",
      "Comment fonctionne la tarification : 24% sur la base nette, jamais plus de 20% de l'hébergement",
      "Si nous sommes les bons gestionnaires pour vous",
    ],
    diffsTitle: "Trois choses que nous faisons différemment",
    diffs: [
      {
        title: "Conformité automatisée",
        body: "Enregistrement des voyageurs (RD 933/2021) intégré et prêt pour SES.HOSPEDAJES. Nous préparons et documentons les informations fiscales pour que votre conseiller les dépose.",
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
    seats: "Inscription 0 € · Sans durée minimale : sortie avec 1 mois de préavis · 24% sur la base nette (brut moins commission de canal et ménage), jamais plus de 20% de l'hébergement · Montants hors TVA",
    calendly: {
      aviso: "Le calendrier est fourni par Calendly. Lorsque vous appuyez sur « Voir le calendrier », votre navigateur se connecte à calendly.com et Calendly dépose ses propres cookies.",
      verCalendario: "Voir le calendrier",
      enlaceDirecto: "Ou ouvrez-le sur calendly.com",
      politicaCookies: "Politique de cookies",
    },
    fallbackTitle: "Préférez-vous écrire d'abord ?",
    fallbackBody: "Écrivez-moi directement à :",
    fallbackLink: "angel@sedaprivatehomes.com",
    contextLink: "/propietarios",
    contextLinkLabel: "Découvrir les conditions avant de réserver →",
    footer: "Seda Private Homes S.L. · Marbella · Espagne",
  },
  de: {
    eyebrow: "GESPRÄCH MIT EIGENTÜMERN",
    h1: ["Ein Gespräch über Ihre Residenz", "an der Costa del Sol."],
    sub: "Dreißig Minuten. Kein Angebot am Ende, es sei denn, wir beide wollen es.",
    cta: "Termin wählen →",
    coverTitle: "Was wir in 30 Minuten besprechen",
    coverBullets: [
      "Ihre Immobilie und Ihre Situation",
      "Wie die Vergütung funktioniert: 24% der Netto-Basis, nie mehr als 20% der Unterkunft",
      "Ob wir die richtige Verwaltung für Sie sind",
    ],
    diffsTitle: "Drei Dinge, die wir anders machen",
    diffs: [
      {
        title: "Automatisierte Compliance",
        body: "Gästeregistrierung (RD 933/2021) integriert und vorbereitet für SES.HOSPEDAJES. Wir bereiten die Steuerinformationen auf und dokumentieren sie, damit Ihr Steuerberater sie einreichen kann.",
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
    seats: "Anmeldung 0 € · Keine Mindestlaufzeit: Ausstieg mit 1 Monat Frist · 24% der Netto-Basis (brutto abzüglich Kanalprovision und Reinigung), nie mehr als 20% der Unterkunft · Beträge zzgl. MwSt.",
    calendly: {
      aviso: "Der Kalender wird von Calendly bereitgestellt. Wenn Sie auf „Kalender anzeigen“ klicken, verbindet sich Ihr Browser mit calendly.com, und Calendly setzt eigene Cookies.",
      verCalendario: "Kalender anzeigen",
      enlaceDirecto: "Oder auf calendly.com öffnen",
      politicaCookies: "Cookie-Richtlinie",
    },
    fallbackTitle: "Möchten Sie lieber zuerst schreiben?",
    fallbackBody: "Schreiben Sie mir direkt an:",
    fallbackLink: "angel@sedaprivatehomes.com",
    contextLink: "/propietarios",
    contextLinkLabel: "Konditionen vor der Buchung lesen →",
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
