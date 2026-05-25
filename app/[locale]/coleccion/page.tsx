"use client"

import { Link } from "@/i18n/navigation"
import { ArrowUpRight } from "lucide-react"
import { VILLAS } from "@/lib/villas"
import { useTranslations } from "next-intl"

// NOTE: metadata moved to layout / route metadata.ts when needed — client
// components can't export `metadata`. The page-level title still resolves via
// the root layout template.

type StandardItem = { t: string; b: string }

export default function ColeccionPage() {
  const t = useTranslations()
  const sedaStandard: StandardItem[] = [
    { t: t("coleccion.standard.items.checkin.t"), b: t("coleccion.standard.items.checkin.b") },
    { t: t("coleccion.standard.items.support.t"), b: t("coleccion.standard.items.support.b") },
    { t: t("coleccion.standard.items.standard.t"), b: t("coleccion.standard.items.standard.b") },
    { t: t("coleccion.standard.items.guestapp.t"), b: t("coleccion.standard.items.guestapp.b") },
    { t: t("coleccion.standard.items.services.t"), b: t("coleccion.standard.items.services.b") },
    { t: t("coleccion.standard.items.privacy.t"), b: t("coleccion.standard.items.privacy.b") },
  ]
  const PREFIX_KEYS: Record<string, "villa" | "atico" | "finca" | "residencia"> = {
    Villa: "villa",
    "Ático": "atico",
    Finca: "finca",
    Residencia: "residencia",
  }
  return (
    <main id="main-content">
      {/* Hero */}
      <section className="px-6 md:px-12 lg:px-20 pt-40 md:pt-48 pb-12 md:pb-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 items-end">
          <div className="md:col-span-7">
            <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-8">
              {t("coleccion.eyebrow")}
            </p>
            <h1 className="font-serif font-light text-[clamp(2.5rem,6vw,5.5rem)] leading-[1.05] tracking-[-0.02em] text-foreground text-balance">
              {t("coleccion.h1.line1")} <span className="italic">{t("coleccion.h1.italic")}</span>
              <br />
              {t("coleccion.h1.line2")}
            </h1>
          </div>
          <div className="md:col-span-5">
            <p className="text-base md:text-lg leading-[1.7] text-muted-foreground">
              {t("coleccion.body")}
            </p>
          </div>
        </div>
      </section>

      {/* Grid de villas — meta inline (no sticky), grid 2-col en lg para no
          dejar huérfanos con 4 villas. Sticky strip eliminada por causar
          contexto incorrecto al persistir en secciones no relacionadas. */}
      <section className="px-6 md:px-12 lg:px-20 py-16 md:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 pb-10 mb-12 md:mb-14 border-b border-border">
            <div className="flex items-baseline gap-8">
              <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
                {t("coleccion.meta.tag")}
              </p>
              <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
                {VILLAS.length} {t("coleccion.meta.count")}
              </p>
            </div>
            <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
              {t("coleccion.meta.geo")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-14 md:gap-y-20">
            {VILLAS.map((villa, i) => {
              const localizedPrefix = t(`villa.prefix.${PREFIX_KEYS[villa.prefix] ?? "villa"}`)
              const localizedSublocation = t(`villa.items.${villa.slug}.sublocation`)
              const localizedCapacity = t(`villa.items.${villa.slug}.capacity`)
              return (
                <Link
                  key={villa.slug}
                  href={`/villa/${villa.slug}`}
                  className="group block"
                >
                  <div className="relative aspect-[4/5] overflow-hidden mb-6">
                    <img
                      src={villa.image}
                      alt={`${localizedPrefix} ${villa.italic} — ${localizedSublocation}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                    />
                    <span className="absolute top-4 left-4 px-3 py-1.5 bg-background/90 font-mono text-[9px] tracking-[0.22em] uppercase text-foreground">
                      {t("coleccion.managed_badge")}
                    </span>
                    <span className="absolute bottom-4 right-4 px-3 py-1.5 bg-foreground/90 font-mono text-[9px] tracking-[0.22em] uppercase text-background">
                      {t("coleccion.price_badge")}
                    </span>
                  </div>
                  <p className="font-mono text-[11px] tracking-[0.22em] text-muted-foreground/70 tabular-nums mb-2">
                    — {String(i + 1).padStart(2, "0")}
                  </p>
                  <h2 className="font-serif font-light text-2xl md:text-[1.75rem] leading-tight tracking-[-0.01em] text-foreground mb-1.5">
                    {localizedPrefix} <span className="italic">{villa.italic}</span>
                  </h2>
                  <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground mb-3">
                    {localizedSublocation}
                  </p>
                  <p className="text-[0.9rem] leading-[1.7] text-muted-foreground">
                    {localizedCapacity}
                  </p>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* SEDA Standard — Todas las residencias incluyen */}
      <section className="px-6 md:px-12 lg:px-20 py-24 md:py-32 bg-secondary/40">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12">
          <div className="md:col-span-4">
            <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-6">
              {t("coleccion.standard.eyebrow")}
            </p>
            <h2 className="font-serif font-light text-4xl md:text-5xl lg:text-[3.25rem] leading-[1.05] tracking-[-0.02em] text-foreground text-balance">
              {t("coleccion.standard.h2.line1")} <span className="italic">{t("coleccion.standard.h2.italic")}</span>
            </h2>
          </div>
          <div className="md:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-border">
              {sedaStandard.map((s, i) => (
                <div
                  key={s.t}
                  className={`py-7 px-0 ${i % 2 === 0 ? "sm:pr-6 sm:border-r sm:border-border" : "sm:pl-6"} border-b border-border`}
                >
                  <p className="font-mono text-[11px] tracking-[0.25em] text-muted-foreground tabular-nums mb-2">
                    — 0{i + 1}
                  </p>
                  <h3 className="font-serif font-light text-xl md:text-[1.4rem] leading-tight tracking-tight text-foreground mb-2">
                    {s.t}
                  </h3>
                  <p className="text-[0.9rem] leading-[1.7] text-muted-foreground">
                    {s.b}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 lg:px-20 py-24 md:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-8">
            {t("coleccion.cta.eyebrow")}
          </p>
          <h2 className="font-serif font-light text-3xl md:text-4xl lg:text-5xl leading-[1.1] tracking-[-0.015em] text-foreground text-balance mb-8">
            {t("coleccion.cta.h2.line1")} <span className="italic">{t("coleccion.cta.h2.italic")}</span>
          </h2>
          <p className="text-base leading-[1.7] text-muted-foreground max-w-xl mx-auto mb-12">
            {t("coleccion.cta.body")}
          </p>
          <Link
            href="/contacto?type=guest"
            className="group inline-flex items-center justify-center gap-3 px-7 py-3.5 bg-foreground text-background font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-foreground/90 transition-colors"
          >
            {t("coleccion.cta.button")}
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
          </Link>
        </div>
      </section>
    </main>
  )
}
