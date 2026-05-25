"use client"

import { Link } from "@/i18n/navigation"
import { ArrowUpRight } from "lucide-react"
import { useTranslations } from "next-intl"

// Metadata moved out — client components can't export metadata.

const cities: { name: string; image: string }[] = [
  { name: "Marbella",  image: "/villas/villa-liria.jpg" },
  { name: "Estepona",  image: "/villas/casa-almena.jpg" },
  { name: "Benahavís", image: "/villas/casa-almazara.jpg" },
  { name: "Casares",   image: "/villas/villa-sosiego.jpg" },
  { name: "Málaga",    image: "/villas/door.jpg" },
]

export default function DescubrePage() {
  const t = useTranslations()
  const whatIsItems = [
    { t: t("descubre.what.items.i1.t"), b: t("descubre.what.items.i1.b") },
    { t: t("descubre.what.items.i2.t"), b: t("descubre.what.items.i2.b") },
    { t: t("descubre.what.items.i3.t"), b: t("descubre.what.items.i3.b") },
  ]
  const pillars = [
    { t: t("descubre.philo.pillars.p1.t"), b: t("descubre.philo.pillars.p1.b") },
    { t: t("descubre.philo.pillars.p2.t"), b: t("descubre.philo.pillars.p2.b") },
    { t: t("descubre.philo.pillars.p3.t"), b: t("descubre.philo.pillars.p3.b") },
    { t: t("descubre.philo.pillars.p4.t"), b: t("descubre.philo.pillars.p4.b") },
    { t: t("descubre.philo.pillars.p5.t"), b: t("descubre.philo.pillars.p5.b") },
    { t: t("descubre.philo.pillars.p6.t"), b: t("descubre.philo.pillars.p6.b") },
  ]

  return (
    <main id="main-content">
      {/* Hero */}
      <section className="px-6 md:px-12 lg:px-20 pt-40 md:pt-48 pb-12 md:pb-16">
        <div className="max-w-7xl mx-auto">
          <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-8">
            {t("descubre.eyebrow")}
          </p>
          <h1 className="font-serif font-light text-[clamp(2.75rem,7vw,6rem)] leading-[1.02] tracking-[-0.02em] text-foreground text-balance max-w-[18ch]">
            {t("descubre.h1.line1")} <span className="italic">{t("descubre.h1.italic1")}</span> {t("descubre.h1.line2")}
          </h1>
        </div>
      </section>
      {/* Manifesto eyebrow */}
      <section style={{ display: "none" }} aria-hidden>{t("descubre.manifesto.eyebrow")}</section>

      {/* Wide editorial image */}
      <section className="px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <img
            src="/villas/about.jpg"
            alt={t("descubre.image_alt")}
            className="w-full aspect-[21/9] object-cover"
          />
        </div>
      </section>

      {/* Manifiesto */}
      <section className="px-6 md:px-12 lg:px-20 py-24 md:py-32 bg-secondary/40">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12">
          <div className="md:col-span-3">
            <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground">
              {t("descubre.manifesto.eyebrow")}
            </p>
            <p className="font-mono text-[11px] tracking-[0.25em] text-muted-foreground/70 tabular-nums mt-6">
              — 01
            </p>
          </div>
          <div className="md:col-span-9">
            <h2 className="font-serif font-light text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.05] tracking-[-0.02em] text-foreground text-balance">
              {t("descubre.manifesto.h2.line1")}
              <br />
              <span className="italic">{t("descubre.manifesto.h2.italic")}</span>
            </h2>
            <p className="text-lg md:text-[1.35rem] leading-[1.55] text-muted-foreground font-light mt-10 max-w-[60ch]">
              {t("descubre.manifesto.body")}
            </p>
          </div>
        </div>
      </section>

      {/* Qué es SEDA */}
      <section className="px-6 md:px-12 lg:px-20 py-24 md:py-32">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12">
          <div className="md:col-span-5">
            <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-6">
              {t("descubre.what.eyebrow")}
            </p>
            <h2 className="font-serif font-light text-4xl md:text-5xl lg:text-[3.25rem] leading-[1.05] tracking-[-0.02em] text-foreground text-balance">
              {t("descubre.what.h2.line1")} <span className="italic">{t("descubre.what.h2.italic")}</span>
            </h2>
          </div>
          <div className="md:col-span-7">
            <ul className="border-t border-border">
              {whatIsItems.map((it, i) => (
                <li key={it.t} className="py-8 border-b border-border">
                  <div className="grid grid-cols-[auto_1fr] gap-6">
                    <span className="font-mono text-[11px] tracking-[0.25em] text-muted-foreground tabular-nums">
                      — 0{i + 1}
                    </span>
                    <div>
                      <h3 className="font-serif font-light text-xl md:text-[1.5rem] leading-tight tracking-tight text-foreground">
                        {it.t}
                      </h3>
                      <p className="text-[0.95rem] leading-[1.7] text-muted-foreground mt-3">
                        {it.b}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Filosofía — 6 pilares (dark) */}
      <section className="px-6 md:px-12 lg:px-20 py-24 md:py-32 bg-foreground text-background">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-16 md:mb-20">
            <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-background/50 mb-6">
              {t("descubre.philo.eyebrow")}
            </p>
            <h2 className="font-serif font-light text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.05] tracking-[-0.02em] text-balance">
              {t("descubre.philo.h2.line1")}{" "}
              <span className="italic text-[hsl(var(--gold))]">{t("descubre.philo.h2.italic")}</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 border-t border-background/15">
            {pillars.map((p, i) => (
              <article
                key={p.t}
                className={`p-8 border-b border-background/15 ${
                  (i % 3) < 2 ? "md:border-r md:border-background/15" : ""
                }`}
              >
                <p className="font-mono text-[11px] tracking-[0.25em] text-[hsl(var(--gold))] tabular-nums mb-5">
                  — 0{i + 1}
                </p>
                <h3 className="font-serif font-light text-xl md:text-[1.5rem] leading-tight tracking-tight mb-3">
                  {p.t}
                </h3>
                <p className="text-[0.9rem] leading-[1.7] text-background/70">
                  {p.b}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Presencia — 5 ciudades */}
      <section className="px-6 md:px-12 lg:px-20 py-24 md:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-16 md:mb-20">
            <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-6">
              {t("descubre.presence.eyebrow")}
            </p>
            <h2 className="font-serif font-light text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.05] tracking-[-0.02em] text-foreground text-balance">
              {t("descubre.presence.h2.line1")}{" "}
              <span className="italic">{t("descubre.presence.h2.italic")}</span>
            </h2>
            <p className="text-base md:text-lg leading-[1.7] text-muted-foreground max-w-xl mt-8">
              {t("descubre.presence.body")}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
            {cities.map((c) => (
              <div key={c.name} className="flex flex-col gap-4">
                <div className="aspect-[3/4] overflow-hidden">
                  <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-serif font-light text-xl md:text-[1.4rem] tracking-tight text-foreground">
                  {c.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA dual */}
      <section className="px-6 md:px-12 lg:px-20 py-24 md:py-32 bg-secondary/40">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-background border border-border p-10 md:p-12 flex flex-col gap-6">
            <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground">
              {t("descubre.cta.huesped.eyebrow")}
            </p>
            <h3 className="font-serif font-light text-3xl md:text-4xl leading-tight tracking-tight text-foreground">
              {t("descubre.cta.huesped.h3.line1")} <span className="italic">{t("descubre.cta.huesped.h3.italic")}</span>.
            </h3>
            <p className="text-[0.95rem] leading-[1.7] text-muted-foreground max-w-md">
              {t("descubre.cta.huesped.body")}
            </p>
            <Link
              href="/coleccion"
              className="group inline-flex items-center self-start gap-3 px-6 py-3 mt-2 bg-foreground text-background font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-foreground/90 transition-colors"
            >
              {t("descubre.cta.huesped.button")}
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </Link>
          </div>
          <div className="bg-[hsl(var(--olive))] text-background p-10 md:p-12 flex flex-col gap-6">
            <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-[hsl(var(--gold))]">
              {t("descubre.cta.prop.eyebrow")}
            </p>
            <h3 className="font-serif font-light text-3xl md:text-4xl leading-tight tracking-tight">
              {t("descubre.cta.prop.h3.line1")}{" "}
              <span className="italic text-[hsl(var(--gold))]">{t("descubre.cta.prop.h3.italic")}</span>.
            </h3>
            <p className="text-[0.95rem] leading-[1.7] text-background/75 max-w-md">
              {t("descubre.cta.prop.body")}
            </p>
            <a
              href="mailto:info@sedaprivatehomes.com?subject=Evaluación de mi propiedad"
              className="group inline-flex items-center self-start gap-3 px-6 py-3 mt-2 border border-background/40 text-background font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-background/10 transition-colors"
            >
              {t("descubre.cta.prop.button")}
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
