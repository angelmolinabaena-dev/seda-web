"use client"

import { useTranslations } from "next-intl"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

type Commitment = { num: string; title: string; body: string }

function Commitment({
  c,
  index,
  isLast,
}: {
  c: Commitment
  index: number
  isLast: boolean
}) {
  const { ref, isVisible } = useScrollReveal(0.12)
  const reduced = usePrefersReducedMotion()
  const shown = reduced || isVisible

  return (
    <div
      ref={ref}
      className={`flex flex-col gap-4 py-8 lg:py-0 lg:pr-6 ${
        isLast ? "" : "lg:border-r border-border"
      } ${reduced ? "" : "transition-all duration-1000"} ${
        shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={reduced ? undefined : { transitionDelay: `${index * 80}ms` }}
    >
      <p className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground tabular-nums">
        {c.num}
      </p>
      <h3 className="font-serif font-light text-2xl md:text-[1.625rem] leading-tight tracking-tight text-foreground">
        {c.title}
      </h3>
      <p className="text-sm leading-[1.7] text-muted-foreground max-w-xs">{c.body}</p>
    </div>
  )
}

export function CommitmentsSection() {
  const t = useTranslations()
  const { ref, isVisible } = useScrollReveal(0.08)
  const reduced = usePrefersReducedMotion()
  const shown = reduced || isVisible

  const commitments: Commitment[] = [
    { num: "01", title: t("home.commitments.items.privacy.title"), body: t("home.commitments.items.privacy.body") },
    { num: "02", title: t("home.commitments.items.precision.title"), body: t("home.commitments.items.precision.body") },
    { num: "03", title: t("home.commitments.items.transparency.title"), body: t("home.commitments.items.transparency.body") },
    { num: "04", title: t("home.commitments.items.personalization.title"), body: t("home.commitments.items.personalization.body") },
    { num: "05", title: t("home.commitments.items.calm.title"), body: t("home.commitments.items.calm.body") },
  ]

  return (
    <section id="commitments" className="bg-secondary/30 px-6 py-28 md:px-12 lg:px-20 md:py-36">
      <div className="max-w-7xl mx-auto">
        <div
          ref={ref}
          className={`max-w-3xl mb-16 md:mb-20 ${
            reduced ? "" : "transition-all duration-1000"
          } ${shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-6">
            {t("home.commitments.eyebrow")}
          </p>
          <h2 className="font-serif font-light text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.05] tracking-[-0.02em] text-foreground text-balance mb-8">
            {t("home.commitments.h2.line1")} <span className="italic">{t("home.commitments.h2.italic")}</span>
          </h2>
          <p className="text-base leading-[1.7] text-muted-foreground max-w-xl">
            {t("home.commitments.body")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-2 border-t border-border divide-y sm:divide-y-0 divide-border pt-10 lg:pt-12">
          {commitments.map((c, i) => (
            <Commitment
              key={c.num}
              c={c}
              index={i}
              isLast={i === commitments.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
