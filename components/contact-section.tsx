"use client"

import { ArrowRight, ArrowUpRight } from "lucide-react"
import { useTranslations } from "next-intl"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

export function ContactSection() {
  const t = useTranslations()
  const { ref: headRef, isVisible: headVisible } = useScrollReveal(0.15)
  const { ref: leftRef, isVisible: leftVisible } = useScrollReveal(0.1)
  const { ref: rightRef, isVisible: rightVisible } = useScrollReveal(0.1)
  const reduced = usePrefersReducedMotion()
  const headShown = reduced || headVisible
  const leftShown = reduced || leftVisible
  const rightShown = reduced || rightVisible

  return (
    <section
      id="contact"
      className="px-6 py-28 md:px-12 lg:px-20 md:py-36 bg-foreground text-background"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section head */}
        <div
          ref={headRef}
          className={`mb-20 md:mb-24 max-w-3xl ${
            reduced ? "" : "transition-all duration-1000"
          } ${headShown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-background/50 mb-6">
            {t("home.contactsec.eyebrow")}
          </p>
          <h2 className="font-serif font-light text-3xl md:text-4xl lg:text-[2.75rem] leading-[1.1] tracking-[-0.015em] text-balance">
            {t("home.contactsec.h2")}
          </h2>
          <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-background/60 mt-8">
            {t("home.contactsec.meta")}
          </p>
        </div>

        {/* Dual conversion grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 border-t border-background/15 border-b">
          {/* Huésped */}
          <div
            ref={leftRef}
            className={`flex flex-col gap-8 py-16 md:py-20 md:pr-12 md:border-r border-background/15 ${
              reduced ? "" : "transition-all duration-1000"
            } ${leftShown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-[hsl(var(--gold))]">
              {t("home.contactsec.guest_eyebrow")}
            </p>
            <h3 className="font-serif font-light text-3xl md:text-4xl lg:text-[2.5rem] leading-[1.05] tracking-[-0.015em] text-balance">
              {t("home.contactsec.guest_h3")}
            </h3>
            <p className="text-sm leading-[1.75] text-background/65 max-w-sm">
              {t("home.contactsec.guest_body")}
            </p>
            <a
              href="mailto:info@sedaprivatehomes.com"
              className="group inline-flex items-center self-start gap-3 px-7 py-3.5 bg-background text-foreground font-mono text-[11px] tracking-[0.25em] uppercase hover:bg-background/90 transition-colors"
            >
              {t("home.contactsec.guest_cta")}
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                strokeWidth={1.75}
              />
            </a>
            <div className="pt-2 space-y-1.5">
              <a
                href="mailto:info@sedaprivatehomes.com"
                className="group inline-flex items-center gap-2 font-mono text-[11px] tracking-wide text-background/65 hover:text-background transition-colors"
              >
                <span className="border-b border-background/20 pb-0.5 group-hover:border-background/60 transition-colors">
                  info@sedaprivatehomes.com
                </span>
                <ArrowUpRight className="h-3 w-3" strokeWidth={1.75} />
              </a>
              <a
                href="tel:+34686980798"
                className="font-mono text-[11px] tracking-wide text-background/55 hover:text-background transition-colors"
              >
                +34 686 980 798
              </a>
            </div>
          </div>

          {/* Propietario */}
          <div
            ref={rightRef}
            className={`flex flex-col gap-8 py-16 md:py-20 md:pl-12 ${
              reduced ? "" : "transition-all duration-1000 delay-200"
            } ${rightShown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-[hsl(var(--gold))]">
              {t("home.contactsec.owner_eyebrow")}
            </p>
            <h3 className="font-serif font-light text-3xl md:text-4xl lg:text-[2.5rem] leading-[1.05] tracking-[-0.015em] text-balance">
              {t("home.contactsec.owner_h3")}
            </h3>
            <p className="text-sm leading-[1.75] text-background/65 max-w-sm">
              {t("home.contactsec.owner_body")}
            </p>
            <a
              href="mailto:info@sedaprivatehomes.com"
              className="group inline-flex items-center self-start gap-3 px-7 py-3.5 border border-background/40 text-background font-mono text-[11px] tracking-[0.25em] uppercase hover:bg-background/10 hover:border-background/70 transition-colors"
            >
              {t("home.contactsec.owner_cta")}
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                strokeWidth={1.75}
              />
            </a>
            <div className="pt-2 space-y-1.5">
              <a
                href="mailto:info@sedaprivatehomes.com"
                className="group inline-flex items-center gap-2 font-mono text-[11px] tracking-wide text-background/65 hover:text-background transition-colors"
              >
                <span className="border-b border-background/20 pb-0.5 group-hover:border-background/60 transition-colors">
                  info@sedaprivatehomes.com
                </span>
                <ArrowUpRight className="h-3 w-3" strokeWidth={1.75} />
              </a>
              <a
                href="tel:+34686980798"
                className="font-mono text-[11px] tracking-wide text-background/55 hover:text-background transition-colors"
              >
                +34 686 980 798
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
