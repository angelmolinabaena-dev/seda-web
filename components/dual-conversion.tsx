"use client"

import { ArrowUpRight } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

export function DualConversion() {
  const t = useTranslations()
  const { ref: leftRef, isVisible: leftVisible } = useScrollReveal(0.12)
  const { ref: rightRef, isVisible: rightVisible } = useScrollReveal(0.12)
  const reduced = usePrefersReducedMotion()
  const leftShown = reduced || leftVisible
  const rightShown = reduced || rightVisible

  return (
    <section className="px-6 py-24 md:px-12 lg:px-20 md:py-32 bg-secondary/40">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        {/* Para huéspedes - light card */}
        <div
          ref={leftRef}
          className={`bg-background border border-border overflow-hidden ${
            reduced ? "" : "transition-all duration-1000"
          } ${leftShown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <div className="aspect-square overflow-hidden">
            {/* IA photo — woman with iPhone showing the SEDA Guest App welcome */}
            <img
              src="/villas/guest-app-hand.jpg"
              alt={t("home.dual.guest_image_alt")}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-9 md:p-12">
            <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-5">
              {t("home.dual.guest_eyebrow")}
            </p>
            <h3 className="font-serif font-light text-2xl md:text-3xl lg:text-[2.25rem] leading-[1.1] tracking-tight text-foreground mb-7">
              {t("home.dual.guest_h3")}
            </h3>
            <p className="text-sm leading-[1.75] text-muted-foreground max-w-sm mb-10">
              {t("home.dual.guest_body")}
            </p>
            <Link
              href="/guestapp"
              className="group inline-flex items-center gap-3 font-mono text-[11px] tracking-[0.25em] uppercase text-foreground border-b border-foreground/30 hover:border-foreground pb-1 transition-colors"
            >
              {t("home.dual.guest_cta")}
              <ArrowUpRight
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                strokeWidth={1.75}
              />
            </Link>
          </div>
        </div>

        {/* Para propietarios - olive card */}
        <div
          ref={rightRef}
          className={`bg-[hsl(var(--olive))] text-background overflow-hidden ${
            reduced ? "" : "transition-all duration-1000 delay-150"
          } ${rightShown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <div className="aspect-square overflow-hidden">
            {/* IA photo — man with iPad showing the SEDA Portal de Propietarios */}
            <img
              src="/villas/portal-tablet.jpg"
              alt={t("home.dual.owner_image_alt")}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-9 md:p-12">
            <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-[hsl(var(--gold))] mb-5">
              {t("home.dual.owner_eyebrow")}
            </p>
            <h3 className="font-serif font-light text-2xl md:text-3xl lg:text-[2.25rem] leading-[1.1] tracking-tight mb-7">
              {t("home.dual.owner_h3")}
            </h3>
            <p className="text-sm leading-[1.75] text-background/75 max-w-sm mb-10">
              {t("home.dual.owner_body")}
            </p>
            <Link
              href="/propietarios"
              className="group inline-flex items-center gap-3 font-mono text-[11px] tracking-[0.25em] uppercase text-background/85 hover:text-background border-b border-background/30 hover:border-background/85 pb-1 transition-colors"
            >
              {t("home.dual.owner_cta")}
              <ArrowUpRight
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                strokeWidth={1.75}
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
