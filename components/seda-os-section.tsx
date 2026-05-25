"use client"

import { ArrowUpRight } from "lucide-react"
import { useTranslations } from "next-intl"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { DashboardMockup } from "@/components/dashboard-mockup"

export function SedaOSSection() {
  const t = useTranslations()
  const { ref: textRef, isVisible: textVisible } = useScrollReveal(0.1)
  const { ref: dashRef, isVisible: dashVisible } = useScrollReveal(0.05)
  const reduced = usePrefersReducedMotion()
  const textShown = reduced || textVisible
  const dashShown = reduced || dashVisible

  const modules = [
    t("home.os.modules.reservas"),
    t("home.os.modules.checkin"),
    t("home.os.modules.mantenimiento"),
    t("home.os.modules.guestapp"),
    t("home.os.modules.reporting"),
    t("home.os.modules.liquidaciones"),
  ]

  return (
    <section
      id="seda-os"
      className="px-6 py-28 md:px-12 lg:px-20 md:py-36 bg-foreground text-background overflow-hidden"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 max-w-7xl mx-auto items-start">
        <div
          ref={textRef}
          className={`lg:col-span-5 ${
            reduced ? "" : "transition-all duration-1000"
          } ${textShown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-background/50 mb-6">
            {t("home.os.eyebrow")}
          </p>
          <h2 className="font-serif font-light text-3xl md:text-4xl lg:text-[2.75rem] leading-[1.1] tracking-[-0.015em] text-balance mb-8">
            {t("home.os.h2.line1")} <span className="italic text-[hsl(var(--gold))]">{t("home.os.h2.italic")}</span>{t("home.os.h2.line2")}
          </h2>
          <p className="text-sm leading-[1.75] text-background/70 max-w-md mb-10">
            {t("home.os.body")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-12 max-w-md">
            {modules.map((m) => (
              <div
                key={m}
                className="flex items-center gap-2.5 border border-background/15 rounded-sm px-3 py-2.5 font-mono text-[10px] tracking-[0.1em] uppercase text-background/85"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--gold))] flex-none" />
                {m}
              </div>
            ))}
          </div>
          <a
            href="/propietarios"
            className="group inline-flex items-center gap-3 font-mono text-[11px] tracking-[0.25em] uppercase text-background/85 hover:text-background border-b border-background/30 hover:border-background/85 pb-1 transition-colors"
          >
            {t("home.os.cta")}
            <ArrowUpRight
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              strokeWidth={1.75}
            />
          </a>
        </div>

        <div
          ref={dashRef}
          className={`lg:col-span-7 ${
            reduced ? "" : "transition-all duration-1000 delay-200"
          } ${dashShown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <DashboardMockup />
        </div>
      </div>
    </section>
  )
}
