"use client"

import { ArrowUpRight } from "lucide-react"
import { useTranslations } from "next-intl"

// Metadata moved out — client components can't export metadata. The title
// falls back to the root layout template at /app/layout.tsx.

const accessCol1 = ["Marbella Club", "Sotogrande", "Finca Cortesín"]
const accessCol2 = ["Skina · Larumbe", "Trocadero", "El Lago"]

export default function ExperienciasPage() {
  const t = useTranslations()

  const experiences = [
    { id: "chef",     title: t("exp.catalog.items.chef.title"),     line: t("exp.catalog.items.chef.line"),     image: "/villas/services/chef.jpg" },
    { id: "beach",    title: t("exp.catalog.items.beach.title"),    line: t("exp.catalog.items.beach.line"),    image: "/villas/services/beach-clubs.jpg" },
    { id: "wellness", title: t("exp.catalog.items.wellness.title"), line: t("exp.catalog.items.wellness.line"), image: "/villas/services/wellness.jpg" },
    { id: "transfer", title: t("exp.catalog.items.transfer.title"), line: t("exp.catalog.items.transfer.line"), image: "/villas/services/transfer.jpg" },
    { id: "golf",     title: t("exp.catalog.items.golf.title"),     line: t("exp.catalog.items.golf.line"),     image: "/villas/services/limpieza.jpg" },
    { id: "yates",    title: t("exp.catalog.items.yates.title"),    line: t("exp.catalog.items.yates.line"),    image: "/villas/services/actividades.jpg" },
    { id: "familias", title: t("exp.catalog.items.familias.title"), line: t("exp.catalog.items.familias.line"), image: "/villas/journey-antes.jpg" },
    { id: "cultura",  title: t("exp.catalog.items.cultura.title"),  line: t("exp.catalog.items.cultura.line"),  image: "/villas/journey-durante.jpg" },
    { id: "reservas", title: t("exp.catalog.items.reservas.title"), line: t("exp.catalog.items.reservas.line"), image: "/villas/services/experiencias.jpg" },
  ]

  const steps = [
    { num: "01", t: t("exp.how.steps.s1.t"), b: t("exp.how.steps.s1.b") },
    { num: "02", t: t("exp.how.steps.s2.t"), b: t("exp.how.steps.s2.b") },
    { num: "03", t: t("exp.how.steps.s3.t"), b: t("exp.how.steps.s3.b") },
    { num: "04", t: t("exp.how.steps.s4.t"), b: t("exp.how.steps.s4.b") },
  ]

  return (
    <main id="main-content">
      {/* Hero */}
      <section className="px-6 md:px-12 lg:px-20 pt-40 md:pt-48 pb-12 md:pb-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 items-end">
          <div className="md:col-span-7">
            <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-8">
              {t("exp.eyebrow")}
            </p>
            <h1 className="font-serif font-light text-[clamp(2.5rem,6vw,5.5rem)] leading-[1.05] tracking-[-0.02em] text-foreground text-balance">
              {t("exp.h1.line1")}{" "}
              <span className="italic">{t("exp.h1.italic")}</span>
            </h1>
          </div>
          <div className="md:col-span-5">
            <p className="text-base md:text-lg leading-[1.7] text-muted-foreground">
              {t("exp.body")}
            </p>
          </div>
        </div>
      </section>

      {/* Wide editorial hero. User-selected hyperreal scene: couple at
          a private breakfast on a terrace, infinity pool + palm tree +
          Mediterranean view. Sourced from ChatGPT 2026-05-06 generation,
          chosen explicitly over fallback assets. */}
      <section className="px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <img
            src="/villas/experiencias-hero.jpg"
            alt={t("exp.image_alt")}
            className="w-full aspect-[21/9] object-cover"
            // Hint the browser to prioritise this image — it's above
            // the fold on /experiencias and drives the LCP metric.
            fetchPriority="high"
          />
        </div>
      </section>

      {/* Catálogo activable — 9 categorías */}
      <section className="px-6 md:px-12 lg:px-20 py-24 md:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-16">
            <h2 className="font-serif font-light text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.05] tracking-[-0.02em] text-foreground text-balance max-w-3xl">
              {t("exp.catalog.h2.line1")} <span className="italic">{t("exp.catalog.h2.italic")}</span>
              <br />
              {t("exp.catalog.h2.line2")}
            </h2>
            <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-muted-foreground">
              {t("exp.catalog.meta")}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-7 gap-y-10">
            {experiences.map((e, i) => (
              <article
                key={e.id}
                className="bg-background border border-border overflow-hidden group/card transition-transform hover:-translate-y-1 duration-500"
              >
                <div className="aspect-[5/4] overflow-hidden">
                  <img
                    src={e.image}
                    alt={e.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-[1.03]"
                  />
                </div>
                <div className="p-7">
                  <p className="font-mono text-[11px] tracking-[0.25em] text-muted-foreground tabular-nums mb-2">
                    — 0{i + 1}
                  </p>
                  <h3 className="font-serif font-light text-xl md:text-[1.5rem] leading-tight tracking-tight text-foreground mb-3">
                    {e.title}
                  </h3>
                  <p className="text-[0.9rem] leading-[1.7] text-muted-foreground">
                    {e.line}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona — 4 pasos (dark) */}
      <section className="px-6 md:px-12 lg:px-20 py-24 md:py-32 bg-foreground text-background">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-16 md:mb-20">
            <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-background/50 mb-6">
              {t("exp.how.eyebrow")}
            </p>
            <h2 className="font-serif font-light text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.05] tracking-[-0.02em] text-balance">
              {t("exp.how.h2.line1")}{" "}
              <span className="italic text-[hsl(var(--gold))]">{t("exp.how.h2.italic")}</span>
            </h2>
            <p className="text-base md:text-lg leading-[1.7] text-background/70 max-w-xl mt-8">
              {t("exp.how.body")}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 border-t border-background/15 pt-10">
            {steps.map((s) => (
              <article key={s.num}>
                <p className="font-mono text-[11px] tracking-[0.25em] text-[hsl(var(--gold))] tabular-nums mb-5">
                  — {s.num}
                </p>
                <h3 className="font-serif font-light text-xl md:text-[1.4rem] leading-tight tracking-tight mb-3">
                  {s.t}
                </h3>
                <p className="text-[0.9rem] leading-[1.7] text-background/70">
                  {s.b}
                </p>
              </article>
            ))}
          </div>
          <div className="flex justify-center mt-16 md:mt-20">
            <a
              href="mailto:info@sedaprivatehomes.com?subject=Diseñar mi estancia SEDA"
              className="group inline-flex items-center gap-3 px-7 py-3.5 bg-[hsl(var(--gold))] text-foreground font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-[hsl(var(--gold))]/90 transition-colors"
            >
              {t("exp.how.cta")}
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </a>
          </div>
        </div>
      </section>

      {/* Acceso real — editorial pair */}
      <section className="px-6 md:px-12 lg:px-20 py-24 md:py-32">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 items-center">
          <div className="md:col-span-6 overflow-hidden">
            <img
              src="/villas/journey-despues.jpg"
              alt={t("exp.access.image_alt")}
              className="w-full aspect-[4/5] object-cover"
            />
          </div>
          <div className="md:col-span-6">
            <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-6">
              {t("exp.access.eyebrow")}
            </p>
            <h2 className="font-serif font-light text-4xl md:text-5xl lg:text-[3.25rem] leading-[1.05] tracking-[-0.02em] text-foreground text-balance">
              {t("exp.access.h2.line1")}{" "}
              <span className="italic">{t("exp.access.h2.italic")}</span>
            </h2>
            <p className="text-base md:text-lg leading-[1.7] text-muted-foreground mt-8 max-w-xl">
              {t("exp.access.body")}
            </p>
            <div className="grid grid-cols-2 gap-6 mt-10">
              <ul className="space-y-2.5">
                {accessCol1.map((x) => (
                  <li key={x} className="flex items-baseline gap-2 text-[0.95rem] text-foreground/85">
                    <span className="w-1 h-1 rounded-full bg-[hsl(var(--gold))]" />
                    {x}
                  </li>
                ))}
              </ul>
              <ul className="space-y-2.5">
                {accessCol2.map((x) => (
                  <li key={x} className="flex items-baseline gap-2 text-[0.95rem] text-foreground/85">
                    <span className="w-1 h-1 rounded-full bg-[hsl(var(--gold))]" />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
