"use client"

import { useState } from "react"
import { Link } from "@/i18n/navigation"
import { ArrowUpRight } from "lucide-react"
import { useTranslations } from "next-intl"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { VILLAS, type Villa } from "@/lib/villas"

function VillaCard({ villa, index }: { villa: Villa; index: number }) {
  const [hovered, setHovered] = useState(false)
  const { ref, isVisible } = useScrollReveal(0.1)
  const reduced = usePrefersReducedMotion()
  const t = useTranslations()
  const shown = reduced || isVisible

  const PREFIX_KEYS: Record<string, "villa" | "atico" | "finca" | "residencia"> = {
    Villa: "villa",
    "Ático": "atico",
    Finca: "finca",
    Residencia: "residencia",
  }
  const localizedPrefix = t(`villa.prefix.${PREFIX_KEYS[villa.prefix] ?? "villa"}`)
  const localizedSublocation = t(`villa.items.${villa.slug}.sublocation`)
  const localizedCapacity = t(`villa.items.${villa.slug}.capacity`)

  return (
    <div
      ref={ref}
      className={`bg-background ${
        reduced ? "" : "transition-all duration-700"
      } ${shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
      style={reduced ? undefined : { transitionDelay: `${(index % 2) * 150}ms` }}
    >
      <Link
        href={`/villa/${villa.slug}`}
        className="group block"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="overflow-hidden">
          {/* PLACEHOLDER: sustituir por foto real de la villa */}
          <img
            src={villa.image || "/placeholder.svg"}
            alt={`${localizedPrefix} ${villa.italic} — ${localizedSublocation}`}
            className={`w-full aspect-[4/3] object-cover transition-all duration-[800ms] ease-out ${
              hovered ? "scale-[1.04]" : "scale-100"
            }`}
          />
        </div>
        <div className="p-6 md:p-8 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-serif font-light text-xl md:text-2xl tracking-tight text-foreground mb-2">
              {localizedPrefix} <span className="italic">{villa.italic}</span>
            </h3>
            <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-muted-foreground mb-1">
              {localizedSublocation}
            </p>
            <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-muted-foreground/60">
              {localizedCapacity}
            </p>
          </div>
          <ArrowUpRight
            className={`h-4 w-4 flex-none text-muted-foreground/40 transition-all duration-300 mt-1.5 ${
              hovered ? "translate-x-0.5 -translate-y-0.5 text-foreground" : ""
            }`}
          />
        </div>
      </Link>
    </div>
  )
}

export function ProjectsSection() {
  const { ref, isVisible } = useScrollReveal(0.05)
  const reduced = usePrefersReducedMotion()
  const t = useTranslations()
  const shown = reduced || isVisible

  return (
    <section id="projects" className="px-6 py-28 md:px-12 lg:px-20 md:py-36">
      <div
        ref={ref}
        className={`flex flex-col md:flex-row md:items-end justify-between mb-20 pb-6 border-b border-border ${
          reduced ? "" : "transition-all duration-700"
        } ${shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-4">
            {t("home.projects.eyebrow")}
          </p>
          <h2 className="font-serif font-light text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-foreground text-balance">
            {t("home.projects.h2.line1")} <span className="italic">{t("home.projects.h2.italic")}</span> {t("home.projects.h2.line2")}
          </h2>
        </div>
        <span className="font-mono text-[11px] tracking-[0.15em] text-muted-foreground/50 mt-4 md:mt-0">
          ({String(VILLAS.length).padStart(2, "0")}) {t("home.projects.villas_count_label")}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
        {VILLAS.map((villa, index) => (
          <VillaCard key={villa.slug} villa={villa} index={index} />
        ))}
      </div>
    </section>
  )
}
