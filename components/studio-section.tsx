"use client"

import { ArrowUpRight } from "lucide-react"
import { useTranslations } from "next-intl"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

export function StudioSection() {
  const t = useTranslations()
  const { ref, isVisible } = useScrollReveal(0.12)
  const reduced = usePrefersReducedMotion()
  const shown = reduced || isVisible

  return (
    <section
      id="studio"
      className="px-6 py-28 md:px-12 lg:px-20 md:py-36 bg-foreground text-background"
    >
      <div
        ref={ref}
        className={`max-w-4xl mx-auto text-center ${
          reduced ? "" : "transition-all duration-1000"
        } ${shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-background/50 mb-8">
          {t("home.studio.eyebrow")}
        </p>
        <h2 className="font-serif font-light text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-[-0.02em] text-balance mb-10">
          {t("home.studio.h2.line1")}{" "}
          <span className="italic text-[hsl(var(--gold))]">{t("home.studio.h2.italic")}</span>
        </h2>
        <p className="text-base md:text-lg leading-[1.7] text-background/70 max-w-2xl mx-auto mb-14">
          {t("home.studio.body")}
        </p>
        <a
          href="/propietarios"
          className="group inline-flex items-center gap-3 font-mono text-[11px] tracking-[0.25em] uppercase text-background/85 hover:text-background border-b border-background/30 hover:border-background/85 pb-1 transition-colors"
        >
          {t("home.studio.cta")}
          <ArrowUpRight
            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            strokeWidth={1.75}
          />
        </a>
      </div>
    </section>
  )
}
