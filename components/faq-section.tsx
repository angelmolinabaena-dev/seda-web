"use client"

import { useTranslations } from "next-intl"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

type Faq = { audience: string; question: string; answer: string }

function FaqItem({ faq, index }: { faq: Faq; index: number }) {
  const { ref, isVisible } = useScrollReveal(0.1)
  const reduced = usePrefersReducedMotion()
  const shown = reduced || isVisible

  return (
    <div
      ref={ref}
      className={`${
        reduced ? "" : "transition-all duration-700"
      } ${shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      style={reduced ? undefined : { transitionDelay: `${index * 60}ms` }}
    >
      <details
        open={index === 0}
        className="group border-b border-border py-6 md:py-7"
      >
        <summary className="flex items-start md:items-center justify-between gap-6 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-10 flex-1">
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60 shrink-0 w-24">
              {faq.audience}
            </span>
            <h3 className="font-serif font-light text-lg md:text-xl leading-snug tracking-tight text-foreground text-balance">
              {faq.question}
            </h3>
          </div>
          <span
            aria-hidden
            className="font-serif text-2xl leading-none text-muted-foreground/50 group-open:rotate-45 transition-transform duration-300 shrink-0"
          >
            +
          </span>
        </summary>
        <div className="grid grid-cols-1 md:grid-cols-[24rem_1fr] md:gap-10 mt-5 md:pl-0">
          <div className="hidden md:block" />
          <p className="text-sm md:text-[0.95rem] leading-[1.75] text-muted-foreground max-w-2xl">
            {faq.answer}
          </p>
        </div>
      </details>
    </div>
  )
}

export function FaqSection() {
  const t = useTranslations()
  const { ref, isVisible } = useScrollReveal(0.05)
  const reduced = usePrefersReducedMotion()
  const shown = reduced || isVisible

  const guests = t("home.faq.guests")
  const owners = t("home.faq.owners")
  const faqs: Faq[] = [
    { audience: guests, question: t("home.faq.items.q1.q"), answer: t("home.faq.items.q1.a") },
    { audience: guests, question: t("home.faq.items.q2.q"), answer: t("home.faq.items.q2.a") },
    { audience: guests, question: t("home.faq.items.q3.q"), answer: t("home.faq.items.q3.a") },
    { audience: guests, question: t("home.faq.items.q4.q"), answer: t("home.faq.items.q4.a") },
    { audience: owners, question: t("home.faq.items.q5.q"), answer: t("home.faq.items.q5.a") },
    { audience: owners, question: t("home.faq.items.q6.q"), answer: t("home.faq.items.q6.a") },
    { audience: owners, question: t("home.faq.items.q7.q"), answer: t("home.faq.items.q7.a") },
  ]

  return (
    <section id="faq" className="px-6 py-28 md:px-12 lg:px-20 md:py-36">
      <div
        ref={ref}
        className={`mb-16 md:mb-20 pb-6 border-b border-border max-w-4xl ${
          reduced ? "" : "transition-all duration-700"
        } ${shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-4">
          {t("home.faq.eyebrow")}
        </p>
        <h2 className="font-serif font-light text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-foreground text-balance">
          {t("home.faq.h2.line1")} <span className="italic">{t("home.faq.h2.italic")}</span>
        </h2>
      </div>

      <div>
        {faqs.map((faq, index) => (
          <FaqItem key={faq.question} faq={faq} index={index} />
        ))}
      </div>
    </section>
  )
}
