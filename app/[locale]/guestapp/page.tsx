"use client"

import { useEffect, useRef, useState } from "react"
import { Link } from "@/i18n/navigation"
import {
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  Key,
  Bell,
  FileText,
  Map as MapIcon,
  Wifi,
  Globe,
  ChefHat,
  Shield,
  Lock,
  Star,
  Car,
  Wine,
  Flower2,
} from "lucide-react"
import { useTranslations } from "next-intl"

const URL_HUESPED = "https://guests.sedaprivatehomes.com/villa/apartamento-torremolinos/d1389271-1fbc-4d8a-8bb1-bfc0464d3bfc"

/* ========== PHONE FRAME ========== */
function PhoneFrame({
  children,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode
  variant?: "compact" | "default" | "featured"
  className?: string
}) {
  const sizes = {
    compact:  { w: "w-[200px]",  h: "h-[400px]" },
    default:  { w: "w-[240px]",  h: "h-[480px]" },
    featured: { w: "w-[280px] md:w-[320px]", h: "h-[560px] md:h-[640px]" },
  }
  const { w, h } = sizes[variant]
  return (
    <div className={`relative ${w} bg-[#1c1b1b] p-2 rounded-[44px] shadow-2xl ${className}`}>
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-10" />
      <div className={`bg-background rounded-[36px] overflow-hidden ${h} pt-10 px-3 pb-3 flex flex-col`}>
        {children}
      </div>
    </div>
  )
}

function PhoneStatusBar() {
  return (
    <div className="flex justify-between items-center px-1 text-[10px] font-bold text-foreground">
      <span>9:41</span>
      <div className="flex gap-1 items-center">
        <Wifi className="h-3 w-3" strokeWidth={1.5} />
        <span className="w-4 h-2 rounded-sm border border-foreground/60 inline-block relative">
          <span className="absolute inset-0.5 bg-foreground rounded-[1px]" />
        </span>
      </div>
    </div>
  )
}

function TabBar({ active }: { active: "Today" | "Arrival" | "Ask" | "Stay" | "Discover" }) {
  const items: { id: string; label: string; Icon?: React.ComponentType<{ className?: string; strokeWidth?: number }> }[] = [
    { id: "Today",    label: "Today",    Icon: Sparkles },
    { id: "Arrival",  label: "Arrival",  Icon: Key },
    { id: "Ask",      label: "Ask" },
    { id: "Stay",     label: "Stay",     Icon: FileText },
    { id: "Discover", label: "Discover", Icon: MapIcon },
  ]
  return (
    <div className="mt-auto pt-2 border-t border-border flex justify-between items-center px-1 pb-1">
      {items.map((it) => {
        if (it.id === "Ask") {
          return (
            <div key={it.id} className="w-9 h-9 -mt-4 rounded-full bg-[hsl(var(--olive))] text-[hsl(var(--gold))] grid place-items-center font-serif italic text-[13px] font-medium shadow-md">
              S
            </div>
          )
        }
        const Icon = it.Icon!
        const isActive = active === it.id
        return (
          <div key={it.id} className={`flex flex-col items-center gap-0.5 ${isActive ? "text-[hsl(var(--olive))]" : "text-muted-foreground"}`}>
            <Icon className="h-3 w-3" strokeWidth={1.5} />
            <span className={`text-[7px] ${isActive ? "font-bold" : "font-medium"}`}>{it.label}</span>
          </div>
        )
      })}
    </div>
  )
}

/* ========== Mini phone screens ========== */
function ScreenToday() {
  const t = useTranslations()
  return (
    <div className="flex flex-col gap-2.5 flex-1">
      <PhoneStatusBar />
      <div className="flex justify-between mt-1">
        <div>
          <p className="font-mono text-[8px] tracking-[0.18em] text-[hsl(var(--olive))]">{t("guestapp.screens.today_tag")}</p>
          <p className="font-serif text-[18px] leading-tight mt-0.5">{t("guestapp.screens.today_greeting_line1")} <span className="italic">Andersen</span>.</p>
        </div>
        <div className="w-7 h-7 rounded-full bg-[hsl(var(--olive))] text-[hsl(var(--gold))] grid place-items-center font-serif italic text-xs">A</div>
      </div>
      <div className="bg-[hsl(var(--olive))] text-background rounded-2xl p-3">
        <p className="font-mono text-[8px] tracking-[0.18em] text-[hsl(var(--gold))]">{t("guestapp.screens.today_event_tag")}</p>
        <p className="font-serif text-[15px] mt-1">{t("guestapp.screens.today_event_title")}</p>
        <p className="text-[9px] opacity-75 mt-0.5">{t("guestapp.screens.today_event_sub")}</p>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {[[Key, t("guestapp.screens.today_quick_open")], [Bell, t("guestapp.screens.today_quick_ask")], [Flower2, t("guestapp.screens.today_quick_spa")], [Car, t("guestapp.screens.today_quick_transfer")]].map(([Ic, label], i) => {
          const Comp = Ic as React.ComponentType<{ className?: string; strokeWidth?: number }>
          return (
            <div key={i} className="bg-white border border-border rounded-lg p-2 flex flex-col gap-1.5">
              <span className="w-5 h-5 rounded bg-[hsl(var(--olive))]/15 text-[hsl(var(--olive))] grid place-items-center">
                <Comp className="h-3 w-3" strokeWidth={1.5} />
              </span>
              <span className="text-[9px] font-bold">{label as string}</span>
            </div>
          )
        })}
      </div>
      <div className="bg-white border border-border rounded-lg p-2">
        <p className="font-mono text-[8px] text-muted-foreground tracking-[0.14em]">{t("guestapp.screens.today_discover_tag")}</p>
        <p className="font-serif text-[12px] mt-0.5">{t("guestapp.screens.today_discover_title")}</p>
        <p className="text-[9px] text-muted-foreground">{t("guestapp.screens.today_discover_sub")}</p>
      </div>
      <div className="flex-1" />
      <TabBar active="Today" />
    </div>
  )
}

function ScreenArrival() {
  const t = useTranslations()
  const steps = [
    t("guestapp.screens.arrival_step1"),
    t("guestapp.screens.arrival_step2"),
    t("guestapp.screens.arrival_step3"),
  ]
  return (
    <div className="flex flex-col gap-2 flex-1">
      <PhoneStatusBar />
      <div className="mt-1">
        <p className="font-mono text-[8px] tracking-[0.18em] text-[hsl(var(--olive))]">{t("guestapp.screens.arrival_tag")}</p>
        <p className="font-serif text-[18px] leading-tight mt-0.5">{t("guestapp.screens.arrival_title_line1")} <span className="italic">{t("guestapp.screens.arrival_title_italic")}</span></p>
      </div>
      <div className="bg-white border border-border rounded-xl p-3">
        <p className="font-mono text-[8px] text-muted-foreground tracking-[0.14em]">{t("guestapp.screens.arrival_address_label")}</p>
        <p className="font-serif text-[12px] mt-0.5">{t("guestapp.screens.arrival_address")}</p>
        <div className="flex gap-1.5 mt-2">
          <button className="flex-1 px-2 py-1.5 rounded-full bg-[hsl(var(--olive))] text-background text-[9px] font-bold tracking-[0.12em] uppercase">{t("guestapp.screens.arrival_map")}</button>
          <button className="flex-1 px-2 py-1.5 rounded-full bg-[hsl(var(--olive))]/15 text-[hsl(var(--olive))] text-[9px] font-bold tracking-[0.12em] uppercase">{t("guestapp.screens.arrival_directions")}</button>
        </div>
      </div>
      <div className="bg-[hsl(var(--olive))] text-background rounded-xl p-3">
        <p className="font-mono text-[8px] text-[hsl(var(--gold))] tracking-[0.14em]">{t("guestapp.screens.arrival_gate_label")}</p>
        <p className="font-mono text-2xl mt-1 tracking-[0.3em]">4829#</p>
        <p className="text-[9px] opacity-70 mt-0.5">{t("guestapp.screens.arrival_gate_validity")}</p>
      </div>
      {steps.map((label, i) => (
        <div key={label} className="bg-white border border-border rounded-lg p-2 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-[hsl(var(--olive))]/15 text-[hsl(var(--olive))] grid place-items-center text-[9px] font-bold">{i + 1}</span>
          <span className="text-[10px] font-semibold flex-1">{label}</span>
        </div>
      ))}
      <div className="flex-1" />
      <TabBar active="Arrival" />
    </div>
  )
}

function ScreenAsk() {
  const t = useTranslations()
  return (
    <div className="flex flex-col gap-2 flex-1">
      <PhoneStatusBar />
      <div className="mt-1">
        <p className="font-mono text-[8px] tracking-[0.18em] text-[hsl(var(--olive))]">{t("guestapp.screens.ask_tag")}</p>
        <p className="font-serif text-[18px] leading-tight mt-0.5">{t("guestapp.screens.ask_title_line1")} <span className="italic">{t("guestapp.screens.ask_title_italic")}</span></p>
      </div>
      <div className="bg-[hsl(var(--olive))]/15 rounded-xl p-2.5 self-start max-w-[85%]">
        <p className="text-[10px] text-foreground/85">{t("guestapp.screens.ask_user_msg")}</p>
        <p className="text-[8px] text-muted-foreground mt-0.5">{t("guestapp.screens.ask_user_meta")}</p>
      </div>
      <div className="bg-[hsl(var(--olive))] text-background rounded-xl p-2.5 self-end max-w-[85%]">
        <p className="text-[10px]">{t("guestapp.screens.ask_reply")}</p>
        <p className="text-[8px] text-background/65 mt-0.5">{t("guestapp.screens.ask_reply_meta")}</p>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {[[ChefHat, t("guestapp.screens.ask_chip_chef")], [Car, t("guestapp.screens.ask_chip_transfer")], [Flower2, t("guestapp.screens.ask_chip_massage")], [Wine, t("guestapp.screens.ask_chip_restaurant")]].map(([Ic, label], i) => {
          const Comp = Ic as React.ComponentType<{ className?: string; strokeWidth?: number }>
          return (
            <div key={i} className="bg-white border border-border rounded-lg p-1.5 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-[hsl(var(--gold))] text-foreground grid place-items-center">
                <Comp className="h-3 w-3" strokeWidth={1.5} />
              </span>
              <span className="text-[9px] font-bold">{label as string}</span>
            </div>
          )
        })}
      </div>
      <div className="flex-1" />
      <div className="flex justify-center -mb-2">
        <div className="w-14 h-14 rounded-full bg-[hsl(var(--gold))] text-[hsl(var(--olive))] grid place-items-center font-serif italic text-2xl shadow-lg">S</div>
      </div>
      <TabBar active="Ask" />
    </div>
  )
}

function ScreenStay() {
  const t = useTranslations()
  return (
    <div className="flex flex-col gap-2 flex-1">
      <PhoneStatusBar />
      <div className="mt-1">
        <p className="font-mono text-[8px] tracking-[0.18em] text-[hsl(var(--olive))]">{t("guestapp.screens.stay_tag")}</p>
        <p className="font-serif text-[18px] leading-tight mt-0.5">{t("guestapp.screens.stay_title_line1")} <span className="italic">{t("guestapp.screens.stay_title_italic")}</span></p>
      </div>
      <div className="bg-[hsl(var(--olive))]/15 rounded-xl p-2.5">
        <p className="font-mono text-[8px] text-[hsl(var(--olive))] tracking-[0.14em]">{t("guestapp.screens.stay_wifi_label")}</p>
        <p className="font-mono text-xs mt-1 text-foreground">SEDA_GUEST</p>
        <p className="font-mono text-[10px] text-muted-foreground mt-0.5">{t("guestapp.screens.stay_wifi_copy_hint")}</p>
      </div>
      <div className="bg-white border border-border rounded-xl p-2.5">
        <p className="font-mono text-[8px] text-muted-foreground tracking-[0.14em]">{t("guestapp.screens.stay_code_label")}</p>
        <p className="font-mono text-xl mt-1 text-[hsl(var(--olive))] tracking-[0.2em]">4829</p>
      </div>
      {[
        [t("guestapp.screens.stay_item1"), FileText],
        [t("guestapp.screens.stay_item2"), Shield],
        [t("guestapp.screens.stay_item3"), Bell],
        [t("guestapp.screens.stay_item4"), ArrowRight],
      ].map(([label, Ic], i) => {
        const Comp = Ic as React.ComponentType<{ className?: string; strokeWidth?: number }>
        return (
          <div key={i} className="bg-white border border-border rounded-lg p-2 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-[hsl(var(--olive))]/15 text-[hsl(var(--olive))] grid place-items-center">
              <Comp className="h-3 w-3" strokeWidth={1.5} />
            </span>
            <span className="text-[10px] font-semibold flex-1">{label as string}</span>
          </div>
        )
      })}
      <div className="flex-1" />
      <TabBar active="Stay" />
    </div>
  )
}

function ScreenDiscover() {
  const t = useTranslations()
  const chips = [
    t("guestapp.screens.discover_chip1"),
    t("guestapp.screens.discover_chip2"),
    t("guestapp.screens.discover_chip3"),
    t("guestapp.screens.discover_chip4"),
  ]
  const places = [
    { t: t("guestapp.screens.discover_place1_t"), s: t("guestapp.screens.discover_place1_s"), grad: "from-[#5a7a6e] to-[#44665c]" },
    { t: t("guestapp.screens.discover_place2_t"), s: t("guestapp.screens.discover_place2_s"), grad: "from-[#d4b896] to-[#c9a87c]" },
    { t: t("guestapp.screens.discover_place3_t"), s: t("guestapp.screens.discover_place3_s"), grad: "from-[#a39580] to-[#806d5a]" },
  ]
  return (
    <div className="flex flex-col gap-2 flex-1">
      <PhoneStatusBar />
      <div className="mt-1">
        <p className="font-mono text-[8px] tracking-[0.18em] text-[hsl(var(--olive))]">{t("guestapp.screens.discover_tag")}</p>
        <p className="font-serif text-[18px] leading-tight mt-0.5">{t("guestapp.screens.discover_title_line1")} <span className="italic">{t("guestapp.screens.discover_title_italic")}</span></p>
      </div>
      <div className="flex flex-wrap gap-1">
        {chips.map((c, i) => (
          <span key={c} className={`px-2 py-0.5 rounded-full text-[8px] font-bold tracking-[0.1em] uppercase ${i === 0 ? "bg-[hsl(var(--olive))] text-background" : "bg-[hsl(var(--olive))]/15 text-[hsl(var(--olive))]"}`}>
            {c}
          </span>
        ))}
      </div>
      {places.map((p) => (
        <div key={p.t} className="bg-white border border-border rounded-xl overflow-hidden">
          <div className={`h-12 bg-gradient-to-br ${p.grad}`} />
          <div className="p-2">
            <p className="text-[10px] font-bold">{p.t}</p>
            <p className="text-[8.5px] text-muted-foreground">{p.s}</p>
          </div>
        </div>
      ))}
      <div className="flex-1" />
      <TabBar active="Discover" />
    </div>
  )
}

function ScreenCheckout() {
  const t = useTranslations()
  return (
    <div className="flex flex-col gap-2 flex-1">
      <PhoneStatusBar />
      <div className="mt-1">
        <p className="font-mono text-[8px] tracking-[0.18em] text-[hsl(var(--olive))]">{t("guestapp.screens.checkout_tag")}</p>
        <p className="font-serif text-[18px] leading-tight mt-0.5">{t("guestapp.screens.checkout_title_line1")} <span className="italic">{t("guestapp.screens.checkout_title_italic")}</span></p>
      </div>
      <div className="bg-[hsl(var(--olive))] text-background rounded-xl p-3">
        <p className="font-mono text-[8px] text-[hsl(var(--gold))] tracking-[0.14em]">{t("guestapp.screens.checkout_event_tag")}</p>
        <p className="font-serif text-base mt-0.5">{t("guestapp.screens.checkout_event_title")}</p>
        <p className="text-[9px] opacity-75 mt-0.5">{t("guestapp.screens.checkout_event_sub")}</p>
      </div>
      {[
        [t("guestapp.screens.checkout_item1_t"), t("guestapp.screens.checkout_item1_s"), Bell],
        [t("guestapp.screens.checkout_item2_t"), t("guestapp.screens.checkout_item2_s"), Star],
        [t("guestapp.screens.checkout_item3_t"), t("guestapp.screens.checkout_item3_s"), FileText],
      ].map(([title, sub, Ic], i) => {
        const Comp = Ic as React.ComponentType<{ className?: string; strokeWidth?: number }>
        return (
          <div key={i} className="bg-white border border-border rounded-xl p-2.5 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-[hsl(var(--olive))]/15 text-[hsl(var(--olive))] grid place-items-center">
              <Comp className="h-3 w-3" strokeWidth={1.5} />
            </span>
            <div className="flex-1">
              <p className="text-[10px] font-semibold">{title as string}</p>
              <p className="text-[9px] text-muted-foreground">{sub as string}</p>
            </div>
          </div>
        )
      })}
      <div className="bg-[hsl(var(--gold))] text-foreground rounded-xl p-3 text-center mt-1">
        <p className="font-serif italic text-base">{t("guestapp.screens.checkout_thanks")}</p>
      </div>
      <div className="flex-1" />
      <TabBar active="Today" />
    </div>
  )
}

/* ========== Sticky scroll story ========== */
type Step = { tag: string; t: string; b: string; Screen: React.ComponentType }

function StickyScrollStory() {
  const tns = useTranslations()
  const STEPS: Step[] = [
    { tag: tns("guestapp.journey.steps.s1.tag"), t: tns("guestapp.journey.steps.s1.t"), b: tns("guestapp.journey.steps.s1.b"), Screen: ScreenArrival  },
    { tag: tns("guestapp.journey.steps.s2.tag"), t: tns("guestapp.journey.steps.s2.t"), b: tns("guestapp.journey.steps.s2.b"), Screen: ScreenStay     },
    { tag: tns("guestapp.journey.steps.s3.tag"), t: tns("guestapp.journey.steps.s3.t"), b: tns("guestapp.journey.steps.s3.b"), Screen: ScreenAsk      },
    { tag: tns("guestapp.journey.steps.s4.tag"), t: tns("guestapp.journey.steps.s4.t"), b: tns("guestapp.journey.steps.s4.b"), Screen: ScreenDiscover },
    { tag: tns("guestapp.journey.steps.s5.tag"), t: tns("guestapp.journey.steps.s5.t"), b: tns("guestapp.journey.steps.s5.b"), Screen: ScreenCheckout },
  ]
  const [active, setActive] = useState(0)
  const refs = useRef<(HTMLDivElement | null)[]>([])

  // Track which step's center is closest to viewport center — more reliable
  // than IntersectionObserver thresholds when steps overlap or are tall.
  useEffect(() => {
    const onScroll = () => {
      const viewportCenter = window.innerHeight / 2
      let bestIdx = 0
      let bestDist = Number.POSITIVE_INFINITY
      refs.current.forEach((el, i) => {
        if (!el) return
        const rect = el.getBoundingClientRect()
        const stepCenter = rect.top + rect.height / 2
        const dist = Math.abs(stepCenter - viewportCenter)
        if (dist < bestDist) {
          bestDist = dist
          bestIdx = i
        }
      })
      setActive((prev) => (prev === bestIdx ? prev : bestIdx))
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [])

  const ActiveScreen = STEPS[active].Screen
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[40px_1fr_1.05fr] gap-6 lg:gap-10 items-start">
      {/* Progress rail — sticky desktop only */}
      <div className="hidden lg:flex flex-col items-center sticky top-32 self-start h-fit">
        {STEPS.map((_, i) => (
          <div key={i} className="flex flex-col items-center">
            <div
              className={`rounded-full transition-all duration-300 ${
                i === active
                  ? "w-3 h-3 bg-[hsl(var(--gold))] shadow-[0_0_0_4px_hsl(var(--gold)/0.18)]"
                  : i < active
                  ? "w-2 h-2 bg-[hsl(var(--olive))]"
                  : "w-2 h-2 bg-border"
              }`}
            />
            {i < STEPS.length - 1 && (
              <div className={`w-px h-28 transition-colors ${i < active ? "bg-[hsl(var(--olive))]/40" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Left: scrolling steps */}
      <div>
        {STEPS.map((s, i) => (
          <div
            key={i}
            ref={(el) => {
              refs.current[i] = el
            }}
            data-idx={i}
            className="min-h-[80vh] flex flex-col justify-center py-10"
          >
            <p
              className={`font-mono text-[11px] tracking-[0.22em] transition-colors duration-300 ${
                i === active ? "text-[hsl(var(--gold))]" : "text-muted-foreground"
              }`}
            >
              {s.tag}
            </p>
            <h3
              className={`font-serif font-light text-3xl md:text-4xl lg:text-[3rem] leading-tight italic mt-3 transition-opacity duration-300 ${
                i === active ? "opacity-100" : "opacity-50"
              }`}
            >
              {s.t}
            </h3>
            <p
              className={`text-base md:text-lg leading-[1.6] max-w-md mt-4 transition-opacity duration-300 ${
                i === active ? "text-muted-foreground opacity-100" : "text-muted-foreground opacity-60"
              }`}
            >
              {s.b}
            </p>

            {/* Mobile: phone inline below each step text */}
            <div className="lg:hidden mt-8 flex justify-center">
              <PhoneFrame variant="default">
                <s.Screen />
              </PhoneFrame>
            </div>
          </div>
        ))}
      </div>

      {/* Right: sticky phone — desktop only */}
      <div className="hidden lg:block sticky top-32 self-start h-fit">
        <div className="flex justify-center">
          <PhoneFrame variant="featured">
            <ActiveScreen />
          </PhoneFrame>
        </div>
      </div>
    </div>
  )
}

/* ========== Anatomy bento ========== */
function AnatomyTab({ Icon, t, b, highlight }: { Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; t: string; b: string; highlight?: boolean }) {
  return (
    <article className={`relative overflow-hidden rounded-2xl p-6 h-full transition-colors ${
      highlight ? "bg-[hsl(var(--olive))] text-background" : "bg-background border border-border text-foreground"
    }`}>
      {highlight && (
        <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[hsl(var(--gold))] text-[hsl(var(--olive))] grid place-items-center">
          <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
        </div>
      )}
      <Icon className={`h-5 w-5 ${highlight ? "text-[hsl(var(--gold))]" : "text-[hsl(var(--olive))]"}`} strokeWidth={1.5} />
      <h3 className={`font-serif text-2xl mt-4 ${highlight ? "text-background" : ""}`}>{t}</h3>
      <p className={`text-[12px] leading-[1.55] mt-1.5 ${highlight ? "text-background/70" : "text-muted-foreground"}`}>{b}</p>
    </article>
  )
}

/* ========== Marquee strip ========== */
function MarqueeStrip() {
  const t = useTranslations()
  const items = [
    t("guestapp.marquee.i1"), t("guestapp.marquee.i2"), t("guestapp.marquee.i3"),
    t("guestapp.marquee.i4"), t("guestapp.marquee.i5"), t("guestapp.marquee.i6"),
    t("guestapp.marquee.i7"), t("guestapp.marquee.i8"),
  ]
  const loop = [...items, ...items, ...items]
  return (
    <div className="overflow-hidden">
      <div className="flex gap-10 animate-marquee whitespace-nowrap" style={{ width: "max-content" }}>
        {loop.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-7 font-serif italic font-light text-2xl md:text-3xl text-background/55">
            {t}
            <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--gold))]" />
          </span>
        ))}
      </div>
    </div>
  )
}

/* ================ PAGE ================ */
export default function GuestAppPage() {
  const t = useTranslations()
  return (
    <main id="main-content">
      {/* HERO — radial gradients + phone stack */}
      <header className="relative min-h-[92vh] overflow-hidden flex items-center pt-40 pb-24">
        <div
          aria-hidden
          className="absolute inset-0 bg-background"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 30%, hsl(var(--gold) / 0.18), transparent 50%), radial-gradient(circle at 80% 70%, hsl(var(--olive) / 0.18), transparent 50%)`,
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-[hsl(var(--olive))]/10 font-mono text-[10px] tracking-[0.18em] uppercase font-semibold text-[hsl(var(--olive))]">
              <span className="w-1.5 h-1.5 bg-[#5fbf8e] rounded-full" />
              {t("guestapp.hero.badge")}
            </div>
            <h1 className="font-serif font-light text-[clamp(3rem,6.4vw,5.5rem)] leading-[1.02] tracking-[-0.02em] text-foreground text-balance mt-7">
              {t("guestapp.hero.h1.line1")} <span className="italic">{t("guestapp.hero.h1.italic")}</span> {t("guestapp.hero.h1.line2")}
            </h1>
            <p className="text-base md:text-lg leading-[1.6] text-muted-foreground max-w-[48ch] mt-7">
              {t("guestapp.hero.body")}
            </p>
            <div className="flex flex-wrap gap-3 mt-10">
              <a href={URL_HUESPED} target="_blank" rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 px-6 py-3 bg-foreground text-background font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-foreground/90 transition-colors">
                {t("nav.acceso_huespedes")} <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
              </a>
              <Link href="/coleccion"
                className="group inline-flex items-center gap-3 px-6 py-3 border border-foreground/30 text-foreground font-mono text-[11px] tracking-[0.22em] uppercase hover:border-foreground transition-colors">
                {t("guestapp.hero.cta.explorar")} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={1.75} />
              </Link>
            </div>
            <div className="flex items-center gap-4 mt-10">
              <div className="flex">
                {["AGP", "MJ", "T", "L"].map((c, i) => (
                  <span key={i} className={`w-8 h-8 rounded-full ${i % 2 ? "bg-[hsl(var(--gold))]" : "bg-[hsl(var(--olive))]"} text-background grid place-items-center text-[10px] font-bold border-2 border-background ${i ? "-ml-2" : ""}`}>
                    {c}
                  </span>
                ))}
              </div>
              <p className="text-[12px] text-muted-foreground">{t("guestapp.hero.stat")}</p>
            </div>
          </div>

          {/* Phone stack — 3 phones offset (desktop) */}
          <div className="relative h-[560px] hidden lg:flex justify-center" style={{ perspective: 1400 }}>
            <div className="absolute left-[10%] top-[8%]" style={{ transform: "rotate(-6deg) scale(0.85)", opacity: 0.55, zIndex: 0 }}>
              <PhoneFrame variant="compact"><ScreenArrival /></PhoneFrame>
            </div>
            <div className="absolute right-[8%] top-[12%]" style={{ transform: "rotate(6deg) scale(0.85)", opacity: 0.55, zIndex: 0 }}>
              <PhoneFrame variant="compact"><ScreenDiscover /></PhoneFrame>
            </div>
            <div className="relative z-10">
              <PhoneFrame variant="featured"><ScreenToday /></PhoneFrame>
            </div>
          </div>
          <div className="lg:hidden flex justify-center">
            <PhoneFrame variant="featured"><ScreenToday /></PhoneFrame>
          </div>
        </div>
      </header>

      {/* ANATOMY — 5 tabs */}
      <section className="px-6 md:px-12 lg:px-20 py-24 md:py-32 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-4">{t("guestapp.anatomy.eyebrow")}</p>
            <h2 className="font-serif font-light text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.05] tracking-[-0.02em] text-foreground text-balance">
              {t("guestapp.anatomy.h2.line1")} <span className="italic">{t("guestapp.anatomy.h2.italic")}</span>
            </h2>
            <p className="text-base md:text-lg leading-[1.6] text-muted-foreground mt-5">
              {t("guestapp.anatomy.body")}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <AnatomyTab Icon={Sparkles} t="Today"    b={t("guestapp.anatomy.today_body")} />
            <AnatomyTab Icon={Key}      t="Arrival"  b={t("guestapp.anatomy.arrival_body")} />
            <AnatomyTab Icon={Bell}     t="Ask SEDA" b={t("guestapp.anatomy.ask_body")} highlight />
            <AnatomyTab Icon={FileText} t="Stay"     b={t("guestapp.anatomy.stay_body")} />
            <AnatomyTab Icon={MapIcon}  t="Discover" b={t("guestapp.anatomy.discover_body")} />
          </div>
        </div>
      </section>

      {/* JOURNEY — sticky scroll. overflow-visible is critical for sticky descendants */}
      <section
        className="px-6 md:px-12 lg:px-20 py-24 md:py-32 bg-secondary/40"
        style={{ overflow: "visible" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-12 md:mb-16">
            <div>
              <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-4">
                {t("guestapp.journey.eyebrow")}
              </p>
              <h2 className="font-serif font-light text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.05] tracking-[-0.02em] text-foreground text-balance">
                {t("guestapp.journey.h2.line1")} <span className="italic">{t("guestapp.journey.h2.italic")}</span>
              </h2>
            </div>
            <p className="text-base leading-[1.6] text-muted-foreground max-w-md">
              {t("guestapp.journey.body")}
            </p>
          </div>
          <StickyScrollStory />
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-6 md:px-12 lg:px-20 py-24 md:py-32 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-4">{t("guestapp.features.eyebrow")}</p>
            <h2 className="font-serif font-light text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.05] tracking-[-0.02em] text-foreground text-balance">
              {t("guestapp.features.h2.line1")} <span className="italic">{t("guestapp.features.h2.italic")}</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { Icon: Key,       title: t("guestapp.features.items.lock_t"),       body: t("guestapp.features.items.lock_b") },
              { Icon: Wifi,      title: t("guestapp.features.items.wifi_t"),       body: t("guestapp.features.items.wifi_b") },
              { Icon: Bell,      title: t("guestapp.features.items.concierge_t"),  body: t("guestapp.features.items.concierge_b") },
              { Icon: Globe,     title: t("guestapp.features.items.lang_t"),       body: t("guestapp.features.items.lang_b") },
              { Icon: ChefHat,   title: t("guestapp.features.items.exp_t"),        body: t("guestapp.features.items.exp_b") },
              { Icon: FileText,  title: t("guestapp.features.items.manual_t"),     body: t("guestapp.features.items.manual_b") },
              { Icon: Shield,    title: t("guestapp.features.items.privacy_t"),    body: t("guestapp.features.items.privacy_b") },
              { Icon: Lock,      title: t("guestapp.features.items.compliance_t"), body: t("guestapp.features.items.compliance_b") },
            ].map(({ Icon, title, body }) => (
              <article key={title} className="bg-background border border-border rounded-2xl p-6">
                <Icon className="h-5 w-5 text-[hsl(var(--olive))]" strokeWidth={1.5} />
                <h3 className="font-serif text-xl mt-4">{title}</h3>
                <p className="text-[12.5px] leading-[1.6] text-muted-foreground mt-1.5">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* MARQUEE dark */}
      <section className="py-14 bg-foreground text-background overflow-hidden">
        <MarqueeStrip />
      </section>

      {/* FINAL CTA olive */}
      <section className="px-6 md:px-12 lg:px-20 py-28 md:py-36 bg-[hsl(var(--olive))] text-background">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-[hsl(var(--gold))] mb-5">
            {t("guestapp.final.eyebrow")}
          </p>
          <h2 className="font-serif font-light text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.02] tracking-[-0.02em] max-w-[16ch] mx-auto">
            {t("guestapp.final.h2.line1")} <span className="italic text-[hsl(var(--gold))]">{t("guestapp.final.h2.italic")}</span>
          </h2>
          <p className="text-base md:text-lg leading-[1.6] text-background/78 max-w-xl mx-auto mt-6">
            {t("guestapp.final.body")}
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-10">
            <a href={URL_HUESPED} target="_blank" rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 px-7 py-3.5 bg-[hsl(var(--gold))] text-foreground font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-[hsl(var(--gold))]/90 transition-colors">
              {t("guestapp.final.cta_acceso")} <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </a>
            <Link href="/coleccion"
              className="group inline-flex items-center gap-3 px-7 py-3.5 border border-background/40 text-background font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-background/10 transition-colors">
              {t("guestapp.hero.cta.explorar")} <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </Link>
          </div>
          <p className="font-mono text-[10.5px] tracking-[0.16em] text-background/50 mt-8 break-all">
            guests.sedaprivatehomes.com/villa/apartamento-torremolinos
          </p>
        </div>
      </section>
    </main>
  )
}
