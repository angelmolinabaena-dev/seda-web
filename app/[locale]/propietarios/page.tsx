"use client"

import { useState } from "react"
import { Link } from "@/i18n/navigation"
import {
  ArrowUpRight,
  ArrowRight,
  Globe,
  FileText,
  TrendingUp,
  Euro,
  Star,
  Search,
  User,
  Shield,
  Key,
  Activity,
  List,
  Building2,
  Minus,
  Plus,
  Bell,
} from "lucide-react"
import { useTranslations } from "next-intl"
import Image from "next/image"

const URL_PROPIETARIO = "https://portal.sedaprivatehomes.com/admin/reservas"

/* -------- SEDA OS Window: hero overlay con dashboard fake --------
   Las "tabs" de Resumen/Reservas/Finanzas/etc. son ESTÁTICAS — la mostrada
   activa es siempre "Resumen". No tiene state ni onClick para evitar el AI
   slop de "tabs decorativas que no responden al click" (critique #6 fail).
   Cuando se conecte el dashboard real al PMS, se reactivarán con useState. */
function SedaOSWindow() {
  const t = useTranslations()
  const tabs = [
    t("prop.os.tabs.resumen"),
    t("prop.os.tabs.reservas"),
    t("prop.os.tabs.finanzas"),
    t("prop.os.tabs.operacion"),
    t("prop.os.tabs.resenas"),
    t("prop.os.tabs.propietario"),
  ]
  const activeTab = tabs[0]

  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl bg-[#fcf9f8] text-foreground border border-background/10">
      {/* Title bar */}
      <div className="bg-[#1c1b1b] text-background/85 px-5 py-3 flex items-center gap-3">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 flex items-center justify-center gap-2">
          <span className="w-4 h-4 rounded-md bg-[hsl(var(--olive))] text-[hsl(var(--gold))] grid place-items-center font-serif italic text-[10px]">S</span>
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase">{t("prop.os.live")}</span>
          <span className="text-[10px] opacity-55">· app.sedaprivatehomes.com/os</span>
        </div>
        <span className="font-mono text-[10px] opacity-55">v4.2.1</span>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-border flex items-center px-4 overflow-x-auto scrollbar-none">
        {tabs.map((label) => (
          <span
            key={label}
            aria-current={label === activeTab ? "true" : undefined}
            className={`px-4 py-3.5 font-mono text-[10px] tracking-[0.14em] uppercase font-semibold whitespace-nowrap border-b-2 ${
              label === activeTab
                ? "text-[hsl(var(--olive))] border-[hsl(var(--olive))]"
                : "text-muted-foreground border-transparent"
            }`}
          >
            {label}
          </span>
        ))}
        <span className="ml-auto inline-flex items-center gap-1.5 text-[10px] text-[#3a9a64] font-semibold whitespace-nowrap pr-3">
          <span className="w-1.5 h-1.5 bg-[#3a9a64] rounded-full" />
          {t("prop.os.operative")}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-3 bg-white">
        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {[
            { l: t("prop.os.kpi.ingresos"), v: "€45.000", d: t("prop.os.kpi.ingresos_d"), up: true },
            { l: t("prop.os.kpi.ocupacion"), v: "78%",    d: t("prop.os.kpi.ocupacion_d"), up: true },
            { l: t("prop.os.kpi.llegadas"),  v: "3",      d: t("prop.os.kpi.llegadas_d"),  avatars: true },
            { l: t("prop.os.kpi.mant"),      v: "1",      d: t("prop.os.kpi.mant_d"),      warn: true },
          ].map((k) => (
            <div key={k.l} className="bg-white border border-border rounded-xl p-3">
              <p className="font-mono text-[8.5px] tracking-[0.18em] uppercase text-muted-foreground">{k.l}</p>
              <div className="flex justify-between items-end mt-1.5">
                <p className="font-serif text-2xl">{k.v}</p>
                {k.warn && <Bell className="h-3.5 w-3.5 text-[hsl(var(--gold))]" strokeWidth={1.5} />}
                {k.avatars && (
                  <div className="flex">
                    {["bg-[hsl(var(--olive))]", "bg-[hsl(var(--gold))]", "bg-foreground"].map((c, i) => (
                      <span key={i} className={`w-4 h-4 rounded-full ${c} border-2 border-white ${i ? "-ml-1.5" : ""}`} />
                    ))}
                  </div>
                )}
              </div>
              <p className={`text-[10px] mt-1.5 ${k.up ? "text-[#3a9a64]" : k.warn ? "text-[hsl(var(--gold))]" : "text-muted-foreground"}`}>
                {k.up && "↗ "}{k.d}
              </p>
            </div>
          ))}
        </div>

        {/* Liquidación + Guest App row */}
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-2.5">
          <div className="bg-white border border-border rounded-xl p-4">
            <p className="font-mono text-[9px] tracking-[0.18em] uppercase text-muted-foreground">{t("prop.os.liq_title")}</p>
            <div className="flex justify-between items-end mt-1.5">
              <p className="font-serif text-2xl">€ 8.420</p>
              <span className="inline-flex items-center gap-1 text-[10px] text-[hsl(var(--olive))]">
                <Building2 className="h-3 w-3" strokeWidth={1.5} /> {t("prop.os.liq_sepa")}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {[[t("prop.os.liq_ingresos"), "€ 10.890"], [t("prop.os.liq_comision"), "− € 1.960"], [t("prop.os.liq_servicios"), "− € 510"]].map(([k, v]) => (
                <div key={k} className="bg-secondary/60 rounded-md px-2.5 py-2">
                  <p className="text-[9px] text-muted-foreground">{k}</p>
                  <p className="font-mono text-[11px] font-semibold mt-0.5">{v}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[hsl(var(--olive))] text-background rounded-xl p-4 flex flex-col justify-between">
            <div>
              <p className="font-mono text-[9px] tracking-[0.18em] uppercase text-[hsl(var(--gold))]">{t("prop.os.ga_title")}</p>
              <div className="mt-2 space-y-1.5">
                {[[t("prop.os.ga_app"), t("prop.os.ga_app_state"), "good"], [t("prop.os.ga_lock"), t("prop.os.ga_lock_state"), "good"], [t("prop.os.ga_clima"), t("prop.os.ga_clima_state"), "warn"]].map(([k, v, kind]) => (
                  <div key={k} className="flex justify-between items-center text-[11px]">
                    <span className="text-background/75">{k}</span>
                    <span className="inline-flex items-center gap-1.5 font-semibold">
                      <span className={`w-1.5 h-1.5 rounded-full ${kind === "warn" ? "bg-[hsl(var(--gold))]" : "bg-[#5fbf8e]"}`} />
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-3">
              <p className="font-mono text-[8.5px] tracking-[0.18em] uppercase text-background/60">{t("prop.os.session")}</p>
              <p className="text-[10.5px] text-background/85 mt-0.5">{t("prop.os.session_detail")}</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white border border-border rounded-xl p-4">
          <div className="flex justify-between items-center">
            <p className="font-mono text-[9px] tracking-[0.18em] uppercase text-muted-foreground">{t("prop.os.timeline")}</p>
            <span className="font-mono text-[9px] tracking-[0.14em] uppercase text-[hsl(var(--olive))] cursor-default">
              {t("prop.os.see_calendar")}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-14 gap-1" style={{ gridTemplateColumns: "repeat(14, 1fr)" }}>
            {Array.from({ length: 14 }).map((_, i) => {
              const a = i >= 0 && i <= 5
              const b = i >= 7 && i <= 9
              const c = i === 12
              const bg = a ? "bg-[hsl(var(--olive))] text-background" : b ? "bg-[hsl(var(--gold))]" : c ? "bg-foreground text-background" : "bg-secondary"
              return (
                <div key={i} className={`h-9 rounded grid place-items-center text-[9px] font-semibold ${bg}`}>
                  {i + 1}
                </div>
              )
            })}
          </div>
          <div className="flex justify-between font-mono text-[8.5px] tracking-[0.14em] uppercase text-muted-foreground mt-2">
            <span>{t("prop.os.today")}</span><span>+7d</span><span>+14d</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* -------- Compset 3-line spark -------- */
function CompsetSpark() {
  const W = 220, H = 56
  const pts = (arr: number[]) => arr.map((v, i) => `${(i / (arr.length - 1)) * W},${H - v}`).join(" ")
  return (
    <svg width="100%" height={H + 10} viewBox={`0 0 ${W} ${H + 10}`} preserveAspectRatio="none" className="overflow-visible">
      <polyline points={pts([20, 24, 28, 32, 38, 42, 48, 52])} fill="none" stroke="hsl(var(--olive))" strokeWidth="2" />
      <polyline points={pts([24, 26, 28, 30, 32, 34, 36, 38])} fill="none" stroke="hsl(var(--gold))" strokeWidth="1.5" strokeDasharray="3 3" />
      <polyline points={pts([28, 30, 28, 32, 30, 34, 32, 34])} fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="1" opacity="0.5" />
      <text x="0" y={H + 8} fill="hsl(var(--muted-foreground))" fontFamily="JetBrains Mono, monospace" fontSize="8" letterSpacing="1">ENE</text>
      <text x={W - 20} y={H + 8} fill="hsl(var(--muted-foreground))" fontFamily="JetBrains Mono, monospace" fontSize="8" letterSpacing="1">AGO</text>
    </svg>
  )
}

/* -------- FAQ Item -------- */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`border-b border-border transition-colors ${open ? "bg-secondary/30" : ""}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-6 py-7 text-left group"
      >
        <span className="font-serif font-light text-lg md:text-[1.35rem] leading-tight tracking-tight text-foreground">{q}</span>
        <span className={`shrink-0 w-9 h-9 rounded-full border border-foreground/30 grid place-items-center transition-transform ${open ? "rotate-45" : ""}`}>
          <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-500 ${open ? "max-h-96 pb-7" : "max-h-0"}`}>
        <p className="text-[0.95rem] leading-[1.7] text-muted-foreground max-w-3xl">{a}</p>
      </div>
    </div>
  )
}

/* -------- Simulador de ingresos -------- */
function Projection() {
  const t = useTranslations()
  const locOpts = [
    t("prop.sim.opts.loc1"), t("prop.sim.opts.loc2"), t("prop.sim.opts.loc3"),
    t("prop.sim.opts.loc4"), t("prop.sim.opts.loc5"), t("prop.sim.opts.loc6"),
  ]
  const typeOpts = [t("prop.sim.opts.type1"), t("prop.sim.opts.type2"), t("prop.sim.opts.type3"), t("prop.sim.opts.type4")]
  const availOpts = [t("prop.sim.opts.avail1"), t("prop.sim.opts.avail2"), t("prop.sim.opts.avail3"), t("prop.sim.opts.avail4")]
  const [beds, setBeds] = useState(4)
  const [occ, setOcc] = useState(72)
  const [adr, setAdr] = useState(1450)
  const [loc, setLoc] = useState(locOpts[0])
  const [propType, setPropType] = useState(typeOpts[0])
  const [avail, setAvail] = useState(availOpts[0])

  const annualGross = Math.round((occ / 100) * 365 * adr)
  const annualNet = Math.round(annualGross * 0.75)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Inputs */}
      <div className="bg-background border border-border rounded-2xl p-8 md:p-10">
        <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground">{t("prop.sim.configure")}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6">
          <SimSelect label={t("prop.sim.location")} value={loc} onChange={setLoc}
            options={locOpts} />
          <SimSelect label={t("prop.sim.type")} value={propType} onChange={setPropType}
            options={typeOpts} />
          <SimCounter label={t("prop.sim.bedrooms")} value={beds} onChange={setBeds} min={1} max={10} />
          <SimSelect label={t("prop.sim.availability")} value={avail} onChange={setAvail}
            options={availOpts} />
        </div>

        <SimSlider label={t("prop.sim.occupancy")} value={occ} min={20} max={95} suffix="%"
          ticks={[t("prop.sim.occupancy_tick_low"), t("prop.sim.occupancy_tick_high")]} onChange={setOcc} />
        <SimSlider label={t("prop.sim.adr")} value={adr} min={300} max={5000} step={50} prefix="€"
          ticks={[t("prop.sim.adr_tick_low"), t("prop.sim.adr_tick_high")]} onChange={setAdr} />

        <Link href="/contacto"
          className="inline-flex items-center gap-2 mt-7 font-mono text-[11px] tracking-[0.22em] uppercase text-foreground border-b border-foreground/30 hover:border-foreground pb-1">
          {t("prop.sim.cta")} <ArrowRight className="h-3 w-3" strokeWidth={1.75} />
        </Link>
      </div>

      {/* Output */}
      <div className="bg-secondary/40 border border-border rounded-2xl p-8 md:p-10">
        <div className="flex justify-between items-center">
          <div className="inline-flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-md bg-[hsl(var(--olive))] text-[hsl(var(--gold))] grid place-items-center">
              <TrendingUp className="h-4 w-4" strokeWidth={1.5} />
            </span>
            <span className="font-serif text-xl">{t("prop.sim.projection")}</span>
          </div>
        </div>

        <div className="mt-8">
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted-foreground">{t("prop.sim.gross")}</p>
          <p className="font-serif font-light text-5xl md:text-[3.5rem] leading-none mt-1.5 tabular-nums">€{annualGross.toLocaleString("es")}</p>
        </div>

        <div className="mt-8">
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted-foreground">{t("prop.sim.net")}</p>
          <p className="font-serif font-light text-5xl md:text-[3.5rem] leading-none mt-1.5 tabular-nums text-[hsl(var(--olive))]">€{annualNet.toLocaleString("es")}</p>
        </div>

        <div className="mt-8 bg-[hsl(var(--olive))] text-background rounded-xl p-5 flex justify-between items-center">
          <div>
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-[hsl(var(--gold))]">{t("prop.sim.improvement")}</p>
            <p className="font-serif text-2xl mt-0.5">+24% RevPAR</p>
          </div>
          <svg width="64" height="22">
            <polyline points="0,18 8,15 16,15 24,12 32,10 40,9 48,6 56,4 64,2" fill="none" stroke="hsl(var(--gold))" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground mt-4">
          {t("prop.sim.disclaimer")}
        </p>
      </div>
    </div>
  )
}

function SimSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted-foreground">{label}</p>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full border border-border rounded-lg px-3 py-2.5 mt-1.5 text-sm bg-background appearance-none">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  )
}

function SimCounter({ label, value, onChange, min, max }: { label: string; value: number; onChange: (n: number) => void; min: number; max: number }) {
  return (
    <div>
      <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted-foreground">{label}</p>
      <div className="flex items-center justify-between border border-border rounded-lg px-3 py-2 mt-1.5">
        <button onClick={() => onChange(Math.max(min, value - 1))} className="text-[hsl(var(--olive))]" aria-label="-1">
          <Minus className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <span className="font-serif text-xl">{value}</span>
        <button onClick={() => onChange(Math.min(max, value + 1))} className="text-[hsl(var(--olive))]" aria-label="+1">
          <Plus className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}

function SimSlider({ label, value, min, max, step = 1, prefix, suffix, ticks, onChange }: { label: string; value: number; min: number; max: number; step?: number; prefix?: string; suffix?: string; ticks: string[]; onChange: (n: number) => void }) {
  return (
    <div className="mt-5">
      <div className="flex justify-between items-baseline">
        <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted-foreground">{label}</p>
        <p className="font-serif text-xl">{prefix}{Number(value).toLocaleString("es")}{suffix}</p>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full mt-2 accent-[hsl(var(--olive))]" />
      <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
        {ticks.map((t) => <span key={t}>{t}</span>)}
      </div>
    </div>
  )
}

/* -------- Product tabs (Marketing / Arquitectura / Simulador) -------- */
type ProductTab = "marketing" | "arquitectura" | "simulador"

function ProductTabSwitcher({
  value,
  onChange,
}: {
  value: ProductTab
  onChange: (v: ProductTab) => void
}) {
  const t = useTranslations()
  const PRODUCT_TABS: { id: ProductTab; label: string; sub: string }[] = [
    { id: "marketing",    label: t("prop.tabs.marketing.label"),    sub: t("prop.tabs.marketing.sub") },
    { id: "arquitectura", label: t("prop.tabs.arquitectura.label"), sub: t("prop.tabs.arquitectura.sub") },
    { id: "simulador",    label: t("prop.tabs.simulador.label"),    sub: t("prop.tabs.simulador.sub") },
  ]
  // WAI-ARIA Tabs pattern keyboard support: ←/→ cycle, Home/End jump to ends.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const ids = PRODUCT_TABS.map((t) => t.id)
    const idx = ids.indexOf(value)
    let nextIdx: number | null = null
    switch (e.key) {
      case "ArrowRight": nextIdx = (idx + 1) % ids.length; break
      case "ArrowLeft":  nextIdx = (idx - 1 + ids.length) % ids.length; break
      case "Home":       nextIdx = 0; break
      case "End":        nextIdx = ids.length - 1; break
      default: return
    }
    e.preventDefault()
    onChange(ids[nextIdx])
    // Move focus to the newly-activated tab — matches MDN tabs pattern.
    const target = e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
    target?.[nextIdx]?.focus()
  }

  return (
    <section className="px-6 md:px-12 lg:px-20 pt-24 md:pt-28 pb-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-4">
            {t("prop.tabs.section_eyebrow")}
          </p>
          <h2 className="font-serif font-light text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.05] tracking-[-0.02em] text-foreground text-balance">
            {t("prop.tabs.section_h2.line1")} <span className="italic">{t("prop.tabs.section_h2.italic")}</span>
          </h2>
        </div>
        <div
          role="tablist"
          aria-label={t("prop.tabs.aria_label")}
          className="flex flex-col sm:flex-row sm:justify-center gap-1.5 sm:gap-0 border-t border-border max-w-3xl mx-auto"
        >
          {PRODUCT_TABS.map((t) => {
            const active = t.id === value
            return (
              <button
                key={t.id}
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={active}
                aria-controls={`panel-${t.id}`}
                tabIndex={active ? 0 : -1}
                onClick={() => onChange(t.id)}
                onKeyDown={handleKeyDown}
                className={`flex-1 px-5 py-5 text-left sm:text-center border-b-2 transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--olive))] focus-visible:ring-offset-2 ${
                  active
                    ? "border-foreground"
                    : "border-transparent hover:border-foreground/30"
                }`}
              >
                <p
                  className={`font-mono text-[10px] tracking-[0.25em] uppercase ${
                    active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground/70"
                  }`}
                >
                  {t.label}
                </p>
                <p className={`font-serif text-base md:text-[1.05rem] leading-tight tracking-tight mt-1.5 ${
                  active ? "text-foreground" : "text-muted-foreground/85"
                }`}>
                  {t.sub}
                </p>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ================ PAGE ================ */
export default function PropietariosPage() {
  const [productTab, setProductTab] = useState<ProductTab>("marketing")
  const t = useTranslations()
  return (
    <main id="main-content">
      {/* HERO con SedaOS dashboard overlay */}
      <header className="relative overflow-hidden text-background min-h-[760px] flex items-center pt-40 pb-24">
        <div className="absolute inset-0 z-0">
          <img
            src="/villas/portal-tablet.jpg"
            alt={t("prop.hero.image_alt")}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-foreground/85 via-[hsl(var(--olive))]/60 to-black/30" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 grid grid-cols-1 lg:grid-cols-[1fr_1.35fr] gap-10 lg:gap-14 items-center">
          <div>
            <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-[hsl(var(--gold))] mb-5">
              {t("prop.hero.eyebrow")}
            </p>
            <h1 className="font-serif font-light text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.02] tracking-[-0.02em] text-balance">
              {t("prop.hero.h1.line1")}
              <br />
              <span className="italic">{t("prop.hero.h1.italic")}</span>
            </h1>
            <p className="text-base md:text-lg leading-[1.55] text-background/85 max-w-[44ch] mt-6">
              {t("prop.hero.body")}
            </p>
            <div className="flex flex-wrap gap-3 mt-9">
              <Link href="/contacto?type=owner"
                className="group inline-flex items-center gap-3 px-6 py-3 bg-[hsl(var(--gold))] text-foreground font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-[hsl(var(--gold))]/90 transition-colors">
                {t("cta.valorar_propiedad")} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={1.75} />
              </Link>
              <a href={URL_PROPIETARIO} target="_blank" rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 px-6 py-3 border border-background/40 text-background font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-background/10 transition-colors">
                {t("nav.acceso_propietarios")} <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
              </a>
            </div>
            <div className="flex gap-6 mt-8 font-mono text-[11px] tracking-[0.14em] text-background/65">
              <span>{t("prop.hero.stat.revpar")}</span>
              <span>{t("prop.hero.stat.props")}</span>
            </div>
            {/* Citation: turns the stat from marketing claim into a verifiable number */}
            <p className="font-mono text-[9.5px] tracking-[0.18em] uppercase text-background/45 mt-3 max-w-[44ch] leading-relaxed">
              {t("prop.hero.citation")}
            </p>
          </div>
          <SedaOSWindow />
        </div>
      </header>

      {/* PRODUCT TAB SWITCHER — anchor before Marketing/Arquitectura/Simulador */}
      <ProductTabSwitcher value={productTab} onChange={setProductTab} />

      {/* MARKETING INTELLIGENCE BENTO */}
      <section className={`px-6 md:px-12 lg:px-20 pb-24 md:pb-32 bg-background ${productTab === "marketing" ? "" : "hidden"}`}>
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-4">
              {t("prop.marketing.eyebrow")}
            </p>
            <h2 className="font-serif font-light text-3xl md:text-4xl leading-[1.1] tracking-[-0.02em] text-foreground text-balance">
              {t("prop.marketing.h2.line1")} <span className="italic">{t("prop.marketing.h2.italic")}</span>
            </h2>
            <p className="text-base md:text-lg leading-[1.6] text-muted-foreground mt-5">
              {t("prop.marketing.body")}
            </p>
          </div>

          {/* 12-col bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-3.5">
            {/* Conversión +42% — tall */}
            <article className="md:row-span-2 bg-background border border-border rounded-2xl p-7 flex flex-col">
              <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-[hsl(var(--olive))]">{t("prop.marketing.conv_label")}</p>
              <p className="font-serif font-light text-[clamp(3.5rem,5vw,5rem)] leading-none text-[hsl(var(--olive))] mt-5">
                +42<span className="text-[hsl(var(--gold))]">%</span>
              </p>
              <p className="text-[0.85rem] leading-[1.65] text-muted-foreground mt-3 max-w-[30ch]">
                {t("prop.marketing.conv_body")}
              </p>
              <div className="mt-auto pt-6">
                <div className="flex items-end gap-1 h-12">
                  {[20, 28, 24, 32, 38, 35, 42, 48].map((h, i) => (
                    <div key={i} style={{ height: `${h}%` }}
                      className={`flex-1 ${i % 2 === 0 ? "bg-[hsl(var(--gold))]" : "bg-[hsl(var(--olive))]"} rounded-sm`} />
                  ))}
                </div>
                <p className="font-mono text-[9px] tracking-[0.14em] uppercase text-muted-foreground mt-2">{t("prop.marketing.conv_range")}</p>
              </div>
            </article>

            {/* Campañas multilingües */}
            <article className="bg-background border border-border rounded-2xl p-7">
              <div className="flex justify-between items-start">
                <Globe className="h-5 w-5 text-[hsl(var(--olive))]" strokeWidth={1.5} />
                <div className="flex gap-1">
                  {["ES", "EN", "DE", "NL"].map((c) => (
                    <span key={c} className="font-mono text-[9px] tracking-[0.14em] font-bold px-1.5 py-0.5 rounded-full bg-[hsl(var(--olive))]/10 text-[hsl(var(--olive))]">{c}</span>
                  ))}
                </div>
              </div>
              <h3 className="font-serif text-[1.35rem] mt-4">{t("prop.marketing.campaign_h3")}</h3>
              <p className="text-[0.85rem] leading-[1.65] text-muted-foreground mt-2">
                {t("prop.marketing.campaign_body")}
              </p>
            </article>

            {/* Descripciones premium */}
            <article className="bg-background border border-border rounded-2xl p-7">
              <FileText className="h-5 w-5 text-[hsl(var(--olive))]" strokeWidth={1.5} />
              <h3 className="font-serif text-[1.35rem] mt-4">{t("prop.marketing.desc_h3")}</h3>
              <p className="text-[0.85rem] leading-[1.65] text-muted-foreground mt-2">
                {t("prop.marketing.desc_body")}
              </p>
              <blockquote className="mt-4 p-3 bg-secondary/60 rounded-lg font-serif italic text-[0.85rem] leading-snug text-foreground/85">
                {t("prop.marketing.desc_quote")}
              </blockquote>
            </article>

            {/* Análisis competencia */}
            <article className="bg-background border border-border rounded-2xl p-7">
              <TrendingUp className="h-5 w-5 text-[hsl(var(--olive))]" strokeWidth={1.5} />
              <h3 className="font-serif text-[1.35rem] mt-4">{t("prop.marketing.compset_h3")}</h3>
              <p className="text-[0.85rem] leading-[1.65] text-muted-foreground mt-2">
                {t("prop.marketing.compset_body")}
              </p>
              <div className="mt-4"><CompsetSpark /></div>
            </article>

            {/* Pricing dinámico — DARK */}
            <article className="bg-foreground text-background rounded-2xl p-7">
              <Euro className="h-5 w-5 text-[hsl(var(--gold))]" strokeWidth={1.5} />
              <h3 className="font-serif text-[1.35rem] mt-4">{t("prop.marketing.pricing_h3")}</h3>
              <p className="text-[0.8rem] text-background/65 mt-2">{t("prop.marketing.pricing_body")}</p>
              <div className="mt-4 p-3 bg-[hsl(var(--gold))]/10 border border-[hsl(var(--gold))]/30 rounded-lg">
                <p className="font-mono text-[8.5px] tracking-[0.18em] text-[hsl(var(--gold))]">{t("prop.marketing.pricing_suggested")}</p>
                <div className="flex justify-between items-baseline mt-1">
                  <span className="font-serif text-2xl">€2.890</span>
                  <span className="text-[10.5px] text-[#5fbf8e]">{t("prop.marketing.pricing_delta")}</span>
                </div>
              </div>
            </article>

            {/* Reputación premium */}
            <article className="bg-background border border-border rounded-2xl p-7">
              <div className="flex justify-between items-start">
                <Star className="h-5 w-5 text-[hsl(var(--olive))]" strokeWidth={1.5} />
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 text-[hsl(var(--gold))]" fill="currentColor" strokeWidth={1} />
                  ))}
                </div>
              </div>
              <h3 className="font-serif text-[1.35rem] mt-4">{t("prop.marketing.reputation_h3")}</h3>
              <p className="text-[0.85rem] leading-[1.65] text-muted-foreground mt-2">
                {t("prop.marketing.reputation_body")}
              </p>
            </article>

            {/* SEO alta intención — wide (2 cols) */}
            <article className="md:col-span-2 bg-background border border-border rounded-2xl p-7">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <Search className="h-5 w-5 text-[hsl(var(--olive))]" strokeWidth={1.5} />
                  <h3 className="font-serif text-[1.35rem]">{t("prop.marketing.seo_h3")}</h3>
                </div>
                <span className="font-mono text-[9px] tracking-[0.16em] uppercase text-muted-foreground">{t("prop.marketing.seo_meta")}</span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                {[[t("prop.marketing.seo_kw1"), "#2"], [t("prop.marketing.seo_kw2"), "#4"], [t("prop.marketing.seo_kw3"), "#1"], [t("prop.marketing.seo_kw4"), "#3"]].map(([k, p]) => (
                  <div key={k} className="p-3 bg-secondary/60 rounded-lg">
                    <p className="text-[10.5px] text-foreground/75">{k}</p>
                    <p className="font-serif text-2xl text-[hsl(var(--olive))] mt-1">{p}</p>
                  </div>
                ))}
              </div>
            </article>

            {/* Non-Resident */}
            <article className="bg-background border border-border rounded-2xl p-7">
              <User className="h-5 w-5 text-[hsl(var(--olive))]" strokeWidth={1.5} />
              <h3 className="font-serif text-[1.35rem] mt-4">{t("prop.marketing.non_resident_h3")}</h3>
              <p className="text-[0.85rem] leading-[1.65] text-muted-foreground mt-2">
                {t("prop.marketing.non_resident_body")}
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* CENTRO DE CONFIANZA & CUMPLIMIENTO */}
      <section className="px-6 md:px-12 lg:px-20 py-24 md:py-32 bg-secondary/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-[hsl(var(--olive))] text-[hsl(var(--olive))] mb-5">
              <Shield className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-4">
              {t("prop.trust.eyebrow")}
            </p>
            <h2 className="font-serif font-light text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.05] tracking-[-0.02em] text-foreground text-balance">
              <span className="italic">{t("prop.trust.h2.italic")}</span> {t("prop.trust.h2.after")}
            </h2>
            <p className="text-base md:text-lg leading-[1.6] text-muted-foreground mt-5">
              {t("prop.trust.body")}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { Icon: FileText,  title: t("prop.trust.items.rd.t"),     body: t("prop.trust.items.rd.b") },
              { Icon: Shield,    title: t("prop.trust.items.ses.t"),    body: t("prop.trust.items.ses.b") },
              { Icon: List,      title: t("prop.trust.items.m179.t"),   body: t("prop.trust.items.m179.b") },
              { Icon: Building2, title: t("prop.trust.items.irnr.t"),   body: t("prop.trust.items.irnr.b") },
              { Icon: Shield,    title: t("prop.trust.items.rgpd.t"),   body: t("prop.trust.items.rgpd.b") },
              { Icon: Key,       title: t("prop.trust.items.access.t"), body: t("prop.trust.items.access.b") },
              { Icon: Activity,  title: t("prop.trust.items.trace.t"),  body: t("prop.trust.items.trace.b") },
              { Icon: User,      title: t("prop.trust.items.docs.t"),   body: t("prop.trust.items.docs.b") },
            ].map(({ Icon, title, body }) => (
              <article key={title} className="bg-background border border-border rounded-2xl p-6 text-center">
                <div className="inline-flex items-center justify-center text-[hsl(var(--olive))] mb-4">
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <p className="font-mono text-[11px] tracking-[0.16em] uppercase font-bold text-foreground mb-2">{title}</p>
                <p className="text-[0.85rem] leading-[1.6] text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FUNDADOR */}
      <section className="px-6 md:px-12 lg:px-20 py-24 md:py-32 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-12 lg:gap-20 items-start">

            {/* Foto */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl aspect-[3/4]">
                <Image
                  src="/angel-molina.jpg"
                  alt="Ángel Molina Baena, fundador de Seda Private Homes"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 42vw"
                />
              </div>
              <div className="absolute bottom-5 left-5 right-5 bg-foreground/92 px-4 py-3.5 rounded-xl">
                <p className="font-mono text-[9px] tracking-[0.22em] uppercase text-[hsl(var(--gold))]">Propietario</p>
                <p className="font-serif text-[1.05rem] text-background mt-0.5 leading-tight">Hotel Estepona Plaza ★★★</p>
                <a
                  href="https://hotelesteponaplaza.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[9px] tracking-[0.14em] uppercase text-background/45 hover:text-background/70 transition-colors mt-1 inline-flex items-center gap-1"
                >
                  hotelesteponaplaza.com <ArrowUpRight className="h-2.5 w-2.5" strokeWidth={1.5} />
                </a>
              </div>
            </div>

            {/* Bio */}
            <div className="flex flex-col justify-start lg:pt-3">
              <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-[hsl(var(--gold))] mb-5">
                Fundador
              </p>
              <h2 className="font-serif font-light text-4xl md:text-5xl leading-[1.05] tracking-[-0.02em]">
                Ángel Molina <span className="italic">Baena</span>
              </h2>
              <p className="text-base leading-[1.7] text-muted-foreground mt-6 max-w-[52ch]">
                Hotelero de formación (Les Roches School of Hotel Management) y de oficio durante más de una
                década en Iberostar. Fundé el Hotel Estepona Plaza como propietario-operador y aprendí que
                la diferencia entre una propiedad que rinde y una que decepciona no es la ubicación: es la
                gestión. Seda es esa gestión, trasladada a las villas de lujo de la Costa del Sol.
              </p>

              {/* Credentials */}
              <div className="mt-7 flex flex-wrap gap-2">
                {[
                  "Les Roches · Hotellerie",
                  "Iberostar · 8+ años",
                  "Hotel Estepona Plaza · Fundador",
                  "Hotel Estepona Patio · Próxima apertura",
                ].map((c) => (
                  <span
                    key={c}
                    className="font-mono text-[10px] tracking-[0.1em] uppercase px-3 py-1.5 border border-border rounded-full text-foreground/60"
                  >
                    {c}
                  </span>
                ))}
              </div>

              {/* Awards */}
              <div className="mt-10 pt-8 border-t border-border">
                <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-5">
                  Premios & Reconocimientos
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                  {[
                    ["TripAdvisor",       "Certificado de Excelencia 2024"],
                    ["Booking.com",       "Traveller Award 2026"],
                    ["Core Masters",      "Hotel del Año España"],
                    ["Expedia · Orbitz",  "Traveler Award"],
                  ].map(([org, award]) => (
                    <div key={award} className="flex items-start gap-3">
                      <Star
                        className="h-3.5 w-3.5 text-[hsl(var(--gold))] mt-0.5 shrink-0"
                        fill="currentColor"
                        strokeWidth={0}
                      />
                      <div>
                        <p className="font-mono text-[9.5px] tracking-[0.14em] uppercase text-foreground/45 leading-none mb-0.5">
                          {org}
                        </p>
                        <p className="text-[0.875rem] text-foreground/85 leading-snug">{award}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* External links */}
              <div className="mt-9 flex flex-wrap gap-6">
                <a
                  href="https://www.linkedin.com/in/angel-molina-119aa352/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] uppercase text-foreground/65 hover:text-foreground transition-colors"
                >
                  LinkedIn
                  <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.75} />
                </a>
                <a
                  href="https://hotelesteponaplaza.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] uppercase text-foreground/65 hover:text-foreground transition-colors"
                >
                  Hotel Estepona Plaza
                  <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.75} />
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SEDA OS — 6 módulos dark */}
      <section className={`px-6 md:px-12 lg:px-20 pb-24 md:pb-32 pt-12 md:pt-16 bg-foreground text-background ${productTab === "arquitectura" ? "" : "hidden"}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-12">
            <div>
              <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-[hsl(var(--gold))] mb-4">
                {t("prop.arch.eyebrow")}
              </p>
              <h2 className="font-serif font-light text-3xl md:text-4xl leading-[1.1] tracking-[-0.02em] text-balance">
                {t("prop.arch.h2.line1")} <span className="italic text-[hsl(var(--gold))]">{t("prop.arch.h2.italic")}</span>
              </h2>
            </div>
            <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-background/55">{t("prop.arch.version")}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { k: "01", n: t("prop.arch.mod.reservas.name"),    l: t("prop.arch.mod.reservas.label"),    b: t("prop.arch.mod.reservas.body") },
              { k: "02", n: t("prop.arch.mod.huespedes.name"),   l: t("prop.arch.mod.huespedes.label"),   b: t("prop.arch.mod.huespedes.body") },
              { k: "03", n: t("prop.arch.mod.operacion.name"),   l: t("prop.arch.mod.operacion.label"),   b: t("prop.arch.mod.operacion.body") },
              { k: "04", n: t("prop.arch.mod.marketing.name"),   l: t("prop.arch.mod.marketing.label"),   b: t("prop.arch.mod.marketing.body") },
              { k: "05", n: t("prop.arch.mod.finanzas.name"),    l: t("prop.arch.mod.finanzas.label"),    b: t("prop.arch.mod.finanzas.body") },
              { k: "06", n: t("prop.arch.mod.propietario.name"), l: t("prop.arch.mod.propietario.label"), b: t("prop.arch.mod.propietario.body") },
            ].map((m) => (
              <article key={m.k} className="bg-background/5 border border-background/10 rounded-2xl p-7 hover:border-[hsl(var(--gold))]/60 transition-colors">
                <div className="flex justify-between items-start">
                  <p className="font-mono text-[10.5px] tracking-[0.2em] text-[hsl(var(--gold))]">{t("prop.arch.module_prefix")} {m.k}</p>
                  <p className="font-mono text-[9.5px] tracking-[0.14em] uppercase text-background/45">{m.l}</p>
                </div>
                <h3 className="font-serif text-3xl mt-3">{m.n}</h3>
                <p className="text-[0.85rem] leading-[1.6] text-background/65 mt-3">{m.b}</p>
              </article>
            ))}
          </div>

          {/* stats strip */}
          <div className="mt-12 p-8 border border-background/10 rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              [t("prop.arch.stats.uptime"),   t("prop.arch.stats.uptime_v")],
              [t("prop.arch.stats.rt"),       t("prop.arch.stats.rt_v")],
              [t("prop.arch.stats.bookings"), t("prop.arch.stats.bookings_v")],
              [t("prop.arch.stats.langs"),    t("prop.arch.stats.langs_v")],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-background/55">{k}</p>
                <p className="font-serif text-2xl mt-1.5">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SIMULADOR DE INGRESOS */}
      <section className={`px-6 md:px-12 lg:px-20 pb-24 md:pb-32 bg-background ${productTab === "simulador" ? "" : "hidden"}`}>
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-12">
            <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-4">
              {t("prop.sim.eyebrow")}
            </p>
            <h2 className="font-serif font-light text-3xl md:text-4xl leading-[1.1] tracking-[-0.02em] text-foreground text-balance">
              {t("prop.sim.h2.line1")} <span className="italic">{t("prop.sim.h2.italic")}</span>
            </h2>
            <p className="text-base md:text-lg leading-[1.6] text-muted-foreground mt-5">
              {t("prop.sim.body")}
            </p>
          </div>
          <Projection />
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 md:px-12 lg:px-20 py-24 md:py-32 bg-secondary/40">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-4">
              {t("prop.faq.eyebrow")}
            </p>
            <h2 className="font-serif font-light text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.05] tracking-[-0.02em] text-foreground text-balance">
              {t("prop.faq.h2.line1")} <span className="italic">{t("prop.faq.h2.italic")}</span> {t("prop.faq.h2.line2")}
            </h2>
          </div>
          <div className="border-t border-border">
            {[
              { q: t("prop.faq.items.q1.q"), a: t("prop.faq.items.q1.a") },
              { q: t("prop.faq.items.q2.q"), a: t("prop.faq.items.q2.a") },
              { q: t("prop.faq.items.q3.q"), a: t("prop.faq.items.q3.a") },
              { q: t("prop.faq.items.q4.q"), a: t("prop.faq.items.q4.a") },
              { q: t("prop.faq.items.q5.q"), a: t("prop.faq.items.q5.a") },
              { q: t("prop.faq.items.q6.q"), a: t("prop.faq.items.q6.a") },
              { q: t("prop.faq.items.q7.q"), a: t("prop.faq.items.q7.a") },
            ].map((item) => <FaqItem key={item.q} {...item} />)}
          </div>
        </div>
      </section>

      {/* FINAL CTA — olive band */}
      <section className="px-6 md:px-12 lg:px-20 py-28 md:py-32 bg-[hsl(var(--olive))] text-background">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-[hsl(var(--gold))] mb-5">
            {t("prop.final.eyebrow")}
          </p>
          <h2 className="font-serif font-light text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.02] tracking-[-0.02em] max-w-[16ch] mx-auto">
            {t("prop.final.h2.line1")} <span className="italic text-[hsl(var(--gold))]">{t("prop.final.h2.italic")}</span>
          </h2>
          <p className="text-base md:text-lg leading-[1.6] text-background/78 max-w-xl mx-auto mt-6">
            {t("prop.final.body")}
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-10">
            <Link href="/contacto"
              className="group inline-flex items-center gap-3 px-7 py-3.5 bg-[hsl(var(--gold))] text-foreground font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-[hsl(var(--gold))]/90 transition-colors">
              {t("prop.final.valorar")} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={1.75} />
            </Link>
            <a href={URL_PROPIETARIO} target="_blank" rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 px-7 py-3.5 border border-background/40 text-background font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-background/10 transition-colors">
              {t("prop.final.acceso")} <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </a>
          </div>

          {/* 4 stats al pie */}
          <div className="mt-16 pt-8 border-t border-background/18 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              ["48h",  t("prop.final.stats.h_label")],
              ["0€",   t("prop.final.stats.cost_label")],
              ["+24%", t("prop.final.stats.revpar_label")],
              ["100%", t("prop.final.stats.compliance_label")],
            ].map(([v, k]) => (
              <div key={k}>
                <p className="font-serif text-4xl text-[hsl(var(--gold))]">{v}</p>
                <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-background/70 mt-1.5">{k}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
