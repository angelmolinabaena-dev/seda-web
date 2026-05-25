"use client"

import { useState } from "react"
import { Link } from "@/i18n/navigation"
import { ArrowUpRight, Plus, Minus } from "lucide-react"
import { useTranslations } from "next-intl"

type FaqEntry = { q: string; a: string }

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <li className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-6 py-7 md:py-8 text-left group"
        aria-expanded={open}
      >
        <span className="font-serif font-light text-lg md:text-xl leading-tight tracking-tight text-foreground group-hover:text-foreground/70 transition-colors">
          {q}
        </span>
        <span className="shrink-0 mt-1">
          {open ? (
            <Minus className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          ) : (
            <Plus className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          )}
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 ease-out ${
          open ? "max-h-96 opacity-100 pb-8" : "max-h-0 opacity-0"
        }`}
      >
        <p className="text-[0.95rem] leading-[1.7] text-muted-foreground max-w-2xl">
          {a}
        </p>
      </div>
    </li>
  )
}

export default function FaqPage() {
  const t = useTranslations()
  const [tab, setTab] = useState<"guests" | "owners">("guests")

  const FAQ_GUESTS: FaqEntry[] = [
    { q: t("faq.guests_items.q1.q"), a: t("faq.guests_items.q1.a") },
    { q: t("faq.guests_items.q2.q"), a: t("faq.guests_items.q2.a") },
    { q: t("faq.guests_items.q3.q"), a: t("faq.guests_items.q3.a") },
    { q: t("faq.guests_items.q4.q"), a: t("faq.guests_items.q4.a") },
    { q: t("faq.guests_items.q5.q"), a: t("faq.guests_items.q5.a") },
  ]
  const FAQ_OWNERS: FaqEntry[] = [
    { q: t("faq.owners_items.q1.q"), a: t("faq.owners_items.q1.a") },
    { q: t("faq.owners_items.q2.q"), a: t("faq.owners_items.q2.a") },
    { q: t("faq.owners_items.q3.q"), a: t("faq.owners_items.q3.a") },
    { q: t("faq.owners_items.q4.q"), a: t("faq.owners_items.q4.a") },
    { q: t("faq.owners_items.q5.q"), a: t("faq.owners_items.q5.a") },
    { q: t("faq.owners_items.q6.q"), a: t("faq.owners_items.q6.a") },
  ]
  const items = tab === "guests" ? FAQ_GUESTS : FAQ_OWNERS

  return (
    <main id="main-content">
      {/* Hero */}
      <section className="px-6 md:px-12 lg:px-20 pt-40 md:pt-48 pb-12 md:pb-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 items-end">
          <div className="md:col-span-7">
            <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-8">
              {t("faq.eyebrow")}
            </p>
            <h1 className="font-serif font-light text-[clamp(2.5rem,6vw,5.5rem)] leading-[1.05] tracking-[-0.02em] text-foreground text-balance">
              {t("faq.h1.line1")} <span className="italic">{t("faq.h1.italic")}</span> {t("faq.h1.line2")}
            </h1>
          </div>
          <div className="md:col-span-5">
            <p className="text-base md:text-lg leading-[1.7] text-muted-foreground mb-6">
              {t("faq.intro")}
            </p>
            <Link
              href="/contacto"
              className="group inline-flex items-center gap-3 font-mono text-[11px] tracking-[0.22em] uppercase text-foreground border-b border-foreground/30 hover:border-foreground pb-1 transition-colors"
            >
              {t("faq.cta.contact")}
              <ArrowUpRight className="h-3 w-3" strokeWidth={1.75} />
            </Link>
          </div>
        </div>
      </section>

      {/* Tabs + accordion */}
      <section className="px-6 md:px-12 lg:px-20 py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center mb-12 md:mb-16">
            <div className="inline-flex border border-border">
              <button
                onClick={() => setTab("guests")}
                className={`px-7 py-3 font-mono text-[11px] tracking-[0.22em] uppercase transition-colors ${
                  tab === "guests"
                    ? "bg-foreground text-background"
                    : "bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("faq.tab.guests")}
              </button>
              <button
                onClick={() => setTab("owners")}
                className={`px-7 py-3 font-mono text-[11px] tracking-[0.22em] uppercase transition-colors ${
                  tab === "owners"
                    ? "bg-foreground text-background"
                    : "bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("faq.tab.owners")}
              </button>
            </div>
          </div>
          <ul className="border-t border-border">
            {items.map((item) => (
              <AccordionItem key={item.q} q={item.q} a={item.a} />
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 lg:px-20 py-24 md:py-32 bg-secondary/40">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif font-light text-3xl md:text-4xl lg:text-5xl leading-[1.1] tracking-[-0.015em] text-foreground text-balance mb-10 max-w-[22ch] mx-auto">
            {t("faq.cta.bottom.h2.line1")} <span className="italic">{t("faq.cta.bottom.h2.italic")}</span>
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contacto?type=guest"
              className="group inline-flex items-center justify-center gap-3 px-7 py-3.5 bg-foreground text-background font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-foreground/90 transition-colors"
            >
              {t("faq.cta.bottom.guest")}
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </Link>
            <Link
              href="/propietarios"
              className="group inline-flex items-center justify-center gap-3 px-7 py-3.5 border border-foreground/30 text-foreground font-mono text-[11px] tracking-[0.22em] uppercase hover:border-foreground transition-colors"
            >
              {t("faq.cta.bottom.owner")}
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
