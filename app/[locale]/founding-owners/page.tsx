import { ArrowRight, Activity, Euro, Shield } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Propietarios Fundadores | Seda Private Homes",
  robots: { index: false, follow: false },
}

const CALENDLY_URL = "https://calendly.com/sedaprivatehomes"

type Locale = "es" | "en" | "fr" | "de"

const COPY: Record<
  Locale,
  {
    badge: string
    seatsLeft: string
    h1: [string, string]
    body: string
    trust: string[]
    cta: string
    diffs: { title: string; body: string }[]
    founderTitle: string
    founderBio: string
    ctaEyebrow: string
    ctaH2: [string, string]
    ctaBody: string
    ctaBtn: string
  }
> = {
  es: {
    badge: "PROPIETARIOS FUNDADORES · PLAZAS LIMITADAS",
    seatsLeft: "Quedan 3 plazas fundadoras",
    h1: ["El estándar hotelero", "para tu villa."],
    body: "Somos Ángel Molina (8 años en Iberostar + Les Roches MHM) y equipo. En la Costa del Sol construimos la primera gestión de villas al nivel de un hotel de lujo: transparencia total, tecnología propia y cumplimiento legal 100%.",
    trust: ["8 años Iberostar", "Les Roches MHM", "2 propietarios en programa"],
    cta: "Reservar reunión privada",
    diffs: [
      {
        title: "Transparencia total",
        body: "Dashboard propio 24/7 con reservas, ingresos y gastos en tiempo real. Sin sorpresas en la liquidación mensual. Acceso directo a cada número.",
      },
      {
        title: "Comisión justa y clara",
        body: "Una comisión fija sobre ingresos netos. Sin letra pequeña ni costes ocultos de gestión. Sabes exactamente cuánto cobras cada mes.",
      },
      {
        title: "Cumplimiento legal 100%",
        body: "RD 933/2021, Modelo 179, IRNR para no residentes. Lo gestionamos todo. Cero multas y cero sorpresas con Hacienda o Interior.",
      },
    ],
    founderTitle: "Quiénes somos",
    founderBio:
      "Ángel Molina combina 8 años de operaciones hoteleras en Iberostar con formación en gestión de hoteles de lujo (Les Roches MHM). Seda Private Homes es la gestora que quería que existiera: el rigor de un gran hotel aplicado a villas privadas en la Costa del Sol.",
    ctaEyebrow: "PROGRAMA PROPIETARIOS FUNDADORES",
    ctaH2: ["15 minutos bastan", "para saber si encajamos."],
    ctaBody:
      "Cuéntanos tu propiedad. Si vemos el encaje, te enviamos la propuesta completa en 24 horas.",
    ctaBtn: "Reservar llamada privada",
  },
  en: {
    badge: "FOUNDING OWNERS · LIMITED SEATS",
    seatsLeft: "3 founding seats remaining",
    h1: ["Hotel standards", "for your villa."],
    body: "We're Ángel Molina (8 years at Iberostar + Les Roches MHM) and team. On the Costa del Sol we're building the first villa management at true luxury-hotel level: full transparency, proprietary technology, and 100% legal compliance.",
    trust: ["8 years Iberostar", "Les Roches MHM", "2 owners in programme"],
    cta: "Book a private call",
    diffs: [
      {
        title: "Full transparency",
        body: "Your own 24/7 dashboard with real-time bookings, revenue, and expenses. No surprises on your monthly settlement. Direct access to every number.",
      },
      {
        title: "Fair, clear commission",
        body: "One fixed commission on net revenue. No fine print, no hidden management fees. You always know exactly what you earn each month.",
      },
      {
        title: "100% legal compliance",
        body: "RD 933/2021, Modelo 179, IRNR for non-residents. We handle everything. Zero fines and zero surprises with Spanish authorities.",
      },
    ],
    founderTitle: "Who we are",
    founderBio:
      "Ángel Molina combines 8 years of hotel operations at Iberostar with luxury hotel management training (Les Roches MHM). Seda Private Homes is the management company I always wanted to exist: hotel-grade rigour applied to private villas on the Costa del Sol.",
    ctaEyebrow: "FOUNDING OWNERS PROGRAMME",
    ctaH2: ["15 minutes is all", "it takes to know."],
    ctaBody:
      "Tell us about your property. If it's a fit, we'll send you the full proposal within 24 hours.",
    ctaBtn: "Book a private call",
  },
  fr: {
    badge: "PROPRIÉTAIRES FONDATEURS · PLACES LIMITÉES",
    seatsLeft: "Il reste 3 places fondatrices",
    h1: ["Les standards hôteliers", "pour votre villa."],
    body: "Nous sommes Ángel Molina (8 ans chez Iberostar + Les Roches MHM) et notre équipe. Sur la Costa del Sol, nous construisons la première gestion de villas au niveau d'un hôtel de luxe : transparence totale et conformité légale à 100%.",
    trust: ["8 ans Iberostar", "Les Roches MHM", "2 propriétaires dans le programme"],
    cta: "Réserver un entretien",
    diffs: [
      {
        title: "Transparence totale",
        body: "Votre propre tableau de bord 24/7 avec réservations, revenus et dépenses en temps réel. Aucune surprise lors du règlement mensuel.",
      },
      {
        title: "Commission juste et claire",
        body: "Une commission fixe sur les revenus nets. Sans clause cachée ni frais dissimulés. Vous savez exactement ce que vous percevez chaque mois.",
      },
      {
        title: "Conformité légale 100%",
        body: "RD 933/2021, Modèle 179, IRNR pour les non-résidents. Nous gérons tout. Zéro amende avec les autorités espagnoles.",
      },
    ],
    founderTitle: "Qui sommes-nous",
    founderBio:
      "Ángel Molina combine 8 ans d'opérations hôtelières chez Iberostar avec une formation en gestion hôtelière de luxe (Les Roches MHM). Seda Private Homes est la société de gestion que j'aurais voulu voir exister : la rigueur d'un grand hôtel appliquée aux villas privées de la Costa del Sol.",
    ctaEyebrow: "PROGRAMME PROPRIÉTAIRES FONDATEURS",
    ctaH2: ["15 minutes suffisent", "pour savoir si ça correspond."],
    ctaBody:
      "Parlez-nous de votre propriété. Si c'est un bon match, nous vous enverrons la proposition complète sous 24 heures.",
    ctaBtn: "Réserver un appel",
  },
  de: {
    badge: "GRÜNDUNGS-EIGENTÜMER · BEGRENZTE PLÄTZE",
    seatsLeft: "Noch 3 Gründerplätze verfügbar",
    h1: ["Hotelstandards", "für Ihre Villa."],
    body: "Wir sind Ángel Molina (8 Jahre bei Iberostar + Les Roches MHM) und unser Team. An der Costa del Sol bauen wir das erste Villenmanagement auf echtem Luxushotel-Niveau: vollständige Transparenz und 100% rechtliche Konformität.",
    trust: ["8 Jahre Iberostar", "Les Roches MHM", "2 Eigentümer im Programm"],
    cta: "Privates Gespräch buchen",
    diffs: [
      {
        title: "Vollständige Transparenz",
        body: "Ihr eigenes 24/7-Dashboard mit Buchungen, Einnahmen und Ausgaben in Echtzeit. Keine Überraschungen bei der monatlichen Abrechnung.",
      },
      {
        title: "Faire, klare Provision",
        body: "Eine feste Provision auf den Nettoumsatz. Kein Kleingedrucktes, keine versteckten Kosten. Sie wissen genau, was Sie verdienen.",
      },
      {
        title: "100% Rechtskonformität",
        body: "RD 933/2021, Modell 179, IRNR für Nichtansässige. Wir übernehmen alles. Null Bußgelder mit den spanischen Behörden.",
      },
    ],
    founderTitle: "Wer wir sind",
    founderBio:
      "Ángel Molina verbindet 8 Jahre Hotelbetrieb bei Iberostar mit Luxushotelmanagement-Ausbildung (Les Roches MHM). Seda Private Homes ist die Verwaltungsgesellschaft, die ich immer aufbauen wollte: Hotelqualität auf private Villen an der Costa del Sol angewendet.",
    ctaEyebrow: "GRÜNDUNGS-EIGENTÜMER-PROGRAMM",
    ctaH2: ["15 Minuten reichen", "um zu wissen ob es passt."],
    ctaBody:
      "Erzählen Sie uns von Ihrer Immobilie. Wenn es passt, erhalten Sie innerhalb von 24 Stunden ein vollständiges Angebot.",
    ctaBtn: "Privaten Anruf buchen",
  },
}

const DIFF_ICONS = [Activity, Euro, Shield] as const

export default async function FoundingOwnersPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const c = COPY[(locale as Locale)] ?? COPY.es

  return (
    <main id="main-content">
      {/* HERO — dark */}
      <section className="relative bg-foreground text-background overflow-hidden pt-40 pb-28 md:pt-48 md:pb-36">
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 72% 48%, hsl(var(--olive)) 0%, transparent 58%)",
          }}
          aria-hidden
        />

        <div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          {/* Badge row */}
          <div className="flex flex-wrap items-center gap-4 mb-12">
            <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-[hsl(var(--gold))]">
              {c.badge}
            </p>
            <span className="font-mono text-[9px] tracking-[0.16em] uppercase bg-[hsl(var(--gold))]/12 text-[hsl(var(--gold))] px-3 py-1 border border-[hsl(var(--gold))]/25 rounded-full">
              {c.seatsLeft}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-14 lg:gap-16 items-start">
            {/* Left — pitch */}
            <div>
              <h1 className="font-serif font-light text-[clamp(3rem,7vw,5.5rem)] leading-[1.01] tracking-[-0.02em]">
                {c.h1[0]}
                <br />
                <span className="italic">{c.h1[1]}</span>
              </h1>

              <p className="text-base md:text-[1.05rem] leading-[1.65] text-background/72 max-w-[50ch] mt-8">
                {c.body}
              </p>

              {/* Trust signals */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-8">
                {c.trust.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] uppercase text-background/50"
                  >
                    <span
                      className="w-1 h-1 bg-[hsl(var(--gold))] rounded-full shrink-0"
                      aria-hidden
                    />
                    {item}
                  </span>
                ))}
              </div>

              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-10 inline-flex items-center gap-3 px-7 py-4 bg-[hsl(var(--gold))] text-foreground font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-[hsl(var(--gold))]/90 transition-colors"
              >
                {c.cta}
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                  strokeWidth={1.75}
                />
              </a>
            </div>

            {/* Right — founder card */}
            <div className="bg-background/[0.06] border border-background/10 rounded-2xl p-8">
              <div className="w-14 h-14 rounded-full bg-[hsl(var(--olive))]/20 border border-[hsl(var(--olive))]/30 flex items-center justify-center mb-5">
                <span className="font-serif italic text-[hsl(var(--gold))] text-xl leading-none">
                  Á
                </span>
              </div>

              <p className="font-mono text-[9.5px] tracking-[0.2em] uppercase text-[hsl(var(--gold))] mb-2">
                {c.founderTitle}
              </p>
              <p className="font-serif font-light text-[1.35rem] leading-snug mb-4">
                Ángel Molina
              </p>
              <p className="text-[0.875rem] leading-[1.65] text-background/62">
                {c.founderBio}
              </p>

              <div className="mt-6 space-y-2">
                {["Iberostar Hotels · 8 años", "Les Roches MHM", "Fundador, Seda Private Homes"].map(
                  (line) => (
                    <div
                      key={line}
                      className="flex items-center gap-2.5 font-mono text-[9.5px] tracking-[0.14em] uppercase text-background/40"
                    >
                      <span className="w-1 h-1 bg-[hsl(var(--gold))] rounded-full shrink-0" />
                      {line}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DIFFERENTIATORS — 3-col gap-px grid */}
      <section className="px-6 md:px-12 lg:px-20 py-24 md:py-32 bg-secondary/40">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden">
            {c.diffs.map((d, i) => {
              const Icon = DIFF_ICONS[i]
              return (
                <div key={d.title} className="bg-background p-10 md:p-12">
                  <Icon
                    className="h-5 w-5 text-[hsl(var(--olive))] mb-6"
                    strokeWidth={1.5}
                  />
                  <h3 className="font-serif font-light text-2xl md:text-[1.75rem] leading-tight tracking-tight text-foreground mb-4">
                    {d.title}
                  </h3>
                  <p className="text-[0.9375rem] leading-[1.7] text-muted-foreground">
                    {d.body}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FINAL CTA — olive band */}
      <section className="px-6 md:px-12 lg:px-20 py-28 md:py-36 bg-[hsl(var(--olive))] text-background">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-[hsl(var(--gold))] mb-5">
            {c.ctaEyebrow}
          </p>
          <h2 className="font-serif font-light text-[clamp(2.25rem,5vw,4rem)] leading-[1.04] tracking-[-0.02em]">
            {c.ctaH2[0]}
            <br />
            <span className="italic text-[hsl(var(--gold))]">{c.ctaH2[1]}</span>
          </h2>
          <p className="text-base md:text-lg leading-[1.6] text-background/72 max-w-xl mx-auto mt-6">
            {c.ctaBody}
          </p>

          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-10 inline-flex items-center gap-3 px-8 py-4 bg-[hsl(var(--gold))] text-foreground font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-[hsl(var(--gold))]/90 transition-colors"
          >
            {c.ctaBtn}
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
              strokeWidth={1.75}
            />
          </a>

          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-background/40 mt-7">
            {c.seatsLeft}
          </p>
        </div>
      </section>
    </main>
  )
}
