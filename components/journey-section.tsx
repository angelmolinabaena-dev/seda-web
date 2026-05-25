"use client"

import { useTranslations } from "next-intl"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

type Phase = {
  num: string
  title: string
  body: string
  image: string
  alt: string
}

function Phase({ phase, index }: { phase: Phase; index: number }) {
  const { ref, isVisible } = useScrollReveal(0.12)
  const reduced = usePrefersReducedMotion()
  const shown = reduced || isVisible

  return (
    <div
      ref={ref}
      className={`flex flex-col gap-5 ${
        reduced ? "" : "transition-all duration-1000"
      } ${shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={reduced ? undefined : { transitionDelay: `${index * 140}ms` }}
    >
      <div className="overflow-hidden mb-2">
        <img
          src={phase.image}
          alt={phase.alt}
          className="w-full aspect-[4/3] object-cover"
        />
      </div>
      <p className="font-mono text-[11px] tracking-[0.25em] text-muted-foreground/70 tabular-nums">
        — {phase.num}
      </p>
      <h3 className="font-serif font-light text-2xl md:text-[1.75rem] leading-tight tracking-[-0.01em] text-foreground">
        {phase.title}
      </h3>
      <p className="text-[0.95rem] leading-[1.7] text-muted-foreground max-w-sm">
        {phase.body}
      </p>
    </div>
  )
}

export function JourneySection() {
  const { ref, isVisible } = useScrollReveal(0.08)
  const reduced = usePrefersReducedMotion()
  const t = useTranslations()
  const shown = reduced || isVisible

  const phases: Phase[] = [
    {
      num: "01",
      title: t("home.journey.phase1.title"),
      body: t("home.journey.phase1.body"),
      image: "/villas/journey-antes.jpg",
      alt: t("home.journey.phase1.alt"),
    },
    {
      num: "02",
      title: t("home.journey.phase2.title"),
      body: t("home.journey.phase2.body"),
      image: "/villas/journey-durante.jpg",
      alt: t("home.journey.phase2.alt"),
    },
    {
      num: "03",
      title: t("home.journey.phase3.title"),
      body: t("home.journey.phase3.body"),
      image: "/villas/journey-despues.jpg",
      alt: t("home.journey.phase3.alt"),
    },
  ]

  return (
    <section id="journey" className="px-6 py-28 md:px-12 lg:px-20 md:py-36">
      <div className="max-w-6xl mx-auto">
        <div
          ref={ref}
          className={`max-w-3xl mb-16 md:mb-20 ${
            reduced ? "" : "transition-all duration-1000"
          } ${shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-6">
            {t("home.journey.eyebrow")}
          </p>
          <h2 className="font-serif font-light text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.05] tracking-[-0.02em] text-foreground text-balance">
            {t("home.journey.h2.line1")} <span className="italic">{t("home.journey.h2.italic")}</span>.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-10 border-t border-border pt-12 md:pt-14">
          {phases.map((p, i) => (
            <Phase key={p.num} phase={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
