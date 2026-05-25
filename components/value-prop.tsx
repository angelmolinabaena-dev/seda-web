"use client"

import { useTranslations } from "next-intl"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

export function ValueProp() {
  const t = useTranslations()
  const { ref, isVisible } = useScrollReveal(0.2)
  const reduced = usePrefersReducedMotion()
  const shown = reduced || isVisible

  return (
    <section className="px-6 py-20 md:px-12 lg:px-20 md:py-28 bg-secondary/30">
      <div
        ref={ref}
        className={`max-w-4xl mx-auto text-center ${
          reduced ? "" : "transition-all duration-1000"
        } ${shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      >
        <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-8">
          {t("home.value.eyebrow")}
        </p>
        <p className="font-serif font-light italic text-2xl md:text-3xl lg:text-[2.25rem] leading-[1.25] tracking-[-0.01em] text-foreground text-balance">
          {t("home.value.body")}
        </p>
      </div>
    </section>
  )
}
