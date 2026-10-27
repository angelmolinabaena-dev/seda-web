import { ArrowRight, Activity, Euro, Shield } from "lucide-react"
import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import type { LocaleParams } from "@/i18n/routing"
import { localizedMetadata } from "@/lib/site-pages"

// Title and description in the URL's language (messages/<locale>.json,
// `founding.meta`). The root layout appends « · SEDA Private Homes».
export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "founding.meta" })
  return {
    ...localizedMetadata(locale, "/founding-owners", { title: t("title"), description: t("description") }),
    robots: { index: false, follow: false },
  }
}

const CALENDLY_URL = "https://calendly.com/sedaprivatehomes-info"

/*
  Los textos viven en messages/<locale>.json, namespace `founding.copy`: así los
  cubren messages-parity.test.ts y los tests de tarifa, y las cifras de precio
  salen de lib/tarifa (`[[tarifa.<nombre>]]`), no de un número escrito aquí.
*/

const DIFF_ICONS = [Activity, Euro, Shield] as const

export default async function FoundingOwnersPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: "founding.copy" })
  const c = {
    badge: t("badge"),
    seatsLeft: t("seatsLeft"),
    h1: [t("h1.l1"), t("h1.l2")],
    body: t("body"),
    trust: [t("trust.t1"), t("trust.t2")],
    cta: t("cta"),
    diffs: (["d1", "d2", "d3"] as const).map((k) => ({ title: t(`diffs.${k}.title`), body: t(`diffs.${k}.body`) })),
    founderTitle: t("founderTitle"),
    founderBio: t("founderBio"),
    ctaEyebrow: t("ctaEyebrow"),
    ctaH2: [t("ctaH2.l1"), t("ctaH2.l2")],
    ctaBody: t("ctaBody"),
    ctaBtn: t("ctaBtn"),
  }

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
