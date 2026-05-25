"use client"

import { Link } from "@/i18n/navigation"
import { ArrowUpRight } from "lucide-react"
import { useTranslations } from "next-intl"

// Metadata moved out — client components can't export metadata.

type Node = { x: number; y: number; label: string }

function SystemMap({ outerNodes, title }: { outerNodes: Node[]; title: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full"
      aria-label={title}
    >
      {/* Líneas de conexión */}
      {outerNodes.map((n, i) => (
        <line
          key={`l-${i}`}
          x1="50"
          y1="50"
          x2={n.x}
          y2={n.y}
          stroke="rgba(251,249,246,0.20)"
          strokeWidth="0.18"
          strokeDasharray="0.8 0.6"
        />
      ))}

      {/* Nodos exteriores */}
      {outerNodes.map((n) => (
        <g key={n.label}>
          <circle
            cx={n.x}
            cy={n.y}
            r="3"
            fill="rgba(251,249,246,0.04)"
            stroke="hsl(var(--gold))"
            strokeWidth="0.22"
          />
          <circle cx={n.x} cy={n.y} r="1" fill="hsl(var(--gold))" />
          <text
            x={n.x}
            y={n.y + 6}
            textAnchor="middle"
            fontSize="2.2"
            fontFamily="JetBrains Mono, monospace"
            fill="rgba(251,249,246,0.7)"
            letterSpacing="0.08em"
          >
            {n.label.toUpperCase()}
          </text>
        </g>
      ))}

      {/* Nodo central SEDA OS */}
      <circle cx="50" cy="50" r="8" fill="hsl(var(--gold) / 0.12)" stroke="hsl(var(--gold))" strokeWidth="0.3" />
      <circle cx="50" cy="50" r="4.2" fill="hsl(var(--gold))" />
      <text
        x="50"
        y="51.6"
        textAnchor="middle"
        fontSize="2.6"
        fontFamily="Cormorant Garamond, serif"
        fontStyle="italic"
        fill="hsl(var(--foreground))"
      >
        SEDA OS
      </text>
    </svg>
  )
}

export default function EcosistemaPage() {
  const t = useTranslations()

  const outerNodes: Node[] = [
    { x: 50, y:  8, label: t("eco.map.node_guest") },
    { x: 86, y: 22, label: t("eco.map.node_app") },
    { x: 94, y: 50, label: t("eco.map.node_team") },
    { x: 80, y: 80, label: t("eco.map.node_maint") },
    { x: 50, y: 92, label: t("eco.map.node_owner") },
    { x: 20, y: 80, label: t("eco.map.node_admin") },
    { x:  6, y: 50, label: t("eco.map.node_reservations") },
    { x: 14, y: 22, label: t("eco.map.node_finance") },
  ]

  const ring = outerNodes.map((n) => n.label)

  const modules: { num: string; t: string; b: string }[] = [
    { num: "01", t: t("eco.modules.items.m1.t"), b: t("eco.modules.items.m1.b") },
    { num: "02", t: t("eco.modules.items.m2.t"), b: t("eco.modules.items.m2.b") },
    { num: "03", t: t("eco.modules.items.m3.t"), b: t("eco.modules.items.m3.b") },
    { num: "04", t: t("eco.modules.items.m4.t"), b: t("eco.modules.items.m4.b") },
    { num: "05", t: t("eco.modules.items.m5.t"), b: t("eco.modules.items.m5.b") },
    { num: "06", t: t("eco.modules.items.m6.t"), b: t("eco.modules.items.m6.b") },
    { num: "07", t: t("eco.modules.items.m7.t"), b: t("eco.modules.items.m7.b") },
    { num: "08", t: t("eco.modules.items.m8.t"), b: t("eco.modules.items.m8.b") },
  ]

  const benefits = [
    {
      who: t("eco.benefits.items.guests.who"),
      title: t("eco.benefits.items.guests.title"),
      italic: t("eco.benefits.items.guests.italic"),
      body: t("eco.benefits.items.guests.body"),
      light: true,
    },
    {
      who: t("eco.benefits.items.owners.who"),
      title: t("eco.benefits.items.owners.title"),
      italic: t("eco.benefits.items.owners.italic"),
      body: t("eco.benefits.items.owners.body"),
      light: false,
      bg: "olive" as const,
    },
    {
      who: t("eco.benefits.items.seda.who"),
      title: t("eco.benefits.items.seda.title"),
      italic: t("eco.benefits.items.seda.italic"),
      body: t("eco.benefits.items.seda.body"),
      light: false,
      bg: "dark" as const,
    },
  ]

  return (
    <main id="main-content">
      {/* Hero dark */}
      <section className="px-6 md:px-12 lg:px-20 pt-40 md:pt-48 pb-12 md:pb-16 bg-foreground text-background">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 items-end">
          <div className="md:col-span-7">
            <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-[hsl(var(--gold))] mb-8">
              {t("eco.eyebrow")}
            </p>
            <h1 className="font-serif font-light text-[clamp(2.5rem,6vw,5.5rem)] leading-[1.05] tracking-[-0.02em] text-balance">
              {t("eco.h1.line1")}{" "}
              <span className="italic text-[hsl(var(--gold))]">{t("eco.h1.italic")}</span>
            </h1>
          </div>
          <div className="md:col-span-5">
            <p className="text-base md:text-lg leading-[1.7] text-background/75">
              {t("eco.body")}
            </p>
          </div>
        </div>
      </section>

      {/* System map */}
      <section className="px-6 md:px-12 lg:px-20 pb-16 md:pb-24 bg-foreground text-background">
        <div className="max-w-7xl mx-auto">
          <div className="aspect-[16/10] bg-[hsl(var(--olive))]/40 border border-background/15">
            <SystemMap outerNodes={outerNodes} title={t("eco.map.title")} />
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-10">
            {ring.map((n) => (
              <span
                key={n}
                className="px-4 py-2 font-mono text-[10px] tracking-[0.22em] uppercase border border-background/20 text-background/80"
              >
                {n}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Módulos — 8 grid */}
      <section className="px-6 md:px-12 lg:px-20 py-24 md:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-16 md:mb-20">
            <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-6">
              {t("eco.modules.eyebrow")}
            </p>
            <h2 className="font-serif font-light text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.05] tracking-[-0.02em] text-foreground text-balance">
              {t("eco.modules.h2.line1")}{" "}
              <span className="italic">{t("eco.modules.h2.italic")}</span>
            </h2>
            <p className="text-base md:text-lg leading-[1.7] text-muted-foreground max-w-xl mt-8">
              {t("eco.modules.intro")}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-border">
            {modules.map((m, i) => (
              <article
                key={m.num}
                className={`p-7 border-b border-border ${
                  (i % 4) < 3 ? "lg:border-r lg:border-border" : ""
                } ${i % 2 === 0 ? "sm:border-r sm:border-border lg:border-r" : ""}`}
              >
                <p className="font-mono text-[11px] tracking-[0.25em] text-muted-foreground tabular-nums mb-4">
                  — {m.num}
                </p>
                <h3 className="font-serif font-light text-xl md:text-[1.4rem] leading-tight tracking-tight text-foreground mb-3">
                  {m.t}
                </h3>
                <p className="text-[0.9rem] leading-[1.7] text-muted-foreground">
                  {m.b}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Beneficios — 3 cards */}
      <section className="px-6 md:px-12 lg:px-20 py-24 md:py-32 bg-secondary/40">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-16 md:mb-20">
            <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-6">
              {t("eco.benefits.eyebrow")}
            </p>
            <h2 className="font-serif font-light text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.05] tracking-[-0.02em] text-foreground text-balance">
              {t("eco.benefits.h2.line1")}{" "}
              <span className="italic">{t("eco.benefits.h2.italic")}</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {benefits.map((b) => {
              const isLight = !!b.light
              const isOlive = b.bg === "olive"
              return (
                <article
                  key={b.who}
                  className={`p-9 md:p-10 flex flex-col gap-6 ${
                    isLight
                      ? "bg-background border border-border text-foreground"
                      : isOlive
                      ? "bg-[hsl(var(--olive))] text-background"
                      : "bg-foreground text-background"
                  }`}
                >
                  <p
                    className={`font-mono text-[11px] tracking-[0.3em] uppercase ${
                      isLight ? "text-[hsl(var(--olive))]" : "text-[hsl(var(--gold))]"
                    }`}
                  >
                    {b.who}
                  </p>
                  <h3
                    className={`font-serif font-light text-[clamp(1.5rem,2.4vw,2.25rem)] leading-[1.1] tracking-tight ${
                      isLight ? "text-foreground" : "text-background"
                    }`}
                  >
                    {b.title}{" "}
                    <span
                      className={`italic ${
                        isLight ? "text-[hsl(var(--olive))]" : "text-[hsl(var(--gold))]"
                      }`}
                    >
                      {b.italic}
                    </span>
                    .
                  </h3>
                  <p
                    className={`text-[0.9rem] leading-[1.7] ${
                      isLight ? "text-muted-foreground" : "text-background/75"
                    }`}
                  >
                    {b.body}
                  </p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* Filosofía closing — dark */}
      <section className="px-6 md:px-12 lg:px-20 py-28 md:py-36 bg-foreground text-background">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-[hsl(var(--gold))] mb-8">
            {t("eco.closing.eyebrow")}
          </p>
          <h2 className="font-serif font-light text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.05] tracking-[-0.02em] text-balance max-w-[22ch] mx-auto">
            {t("eco.closing.h2.line1")}{" "}
            <span className="italic text-[hsl(var(--gold))]">{t("eco.closing.h2.italic")}</span>
          </h2>
          <Link
            href="/propietarios"
            className="group inline-flex items-center justify-center gap-3 px-7 py-3.5 mt-12 bg-[hsl(var(--gold))] text-foreground font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-[hsl(var(--gold))]/90 transition-colors"
          >
            {t("eco.closing.cta")}
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
          </Link>
        </div>
      </section>
    </main>
  )
}
