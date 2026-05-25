"use client"

import {
  ArrowRight,
  Bed,
  Briefcase,
  Calendar,
  Car,
  Check,
  Compass,
  MapPin,
  Menu,
  MessageCircle,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

type Feature = { title: string; description: string }

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[260px]">
      {/* iPhone frame — aspect 9:19.5 enforced for real device proportions */}
      <div
        className="relative rounded-[3rem] border border-foreground/15 bg-foreground p-[6px] shadow-[0_40px_100px_-30px_rgba(28,29,27,0.5),0_15px_40px_-15px_rgba(28,29,27,0.3)]"
        style={{ aspectRatio: "9 / 19.5" }}
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 h-5 w-24 rounded-b-2xl bg-foreground" />
        {/* Screen */}
        <div className="rounded-[2.5rem] bg-accent overflow-hidden h-full flex flex-col">
          {/* Status bar */}
          <div className="flex items-center justify-between px-6 pt-3 pb-1.5 font-mono text-[9px] tracking-wide text-foreground shrink-0">
            <span>9:41</span>
            <span>•••</span>
          </div>

          {/* Top bar: 3 equal flex columns — menu (left) · SEDA (center) · language (right) */}
          <div className="flex items-center px-3 pt-2.5 pb-2 shrink-0">
            {/* Left: menu */}
            <div className="flex-1 flex justify-start">
              <Menu className="h-3.5 w-3.5 text-foreground" strokeWidth={1.5} />
            </div>
            {/* Center: SEDA wordmark */}
            <div className="flex-1 flex justify-center">
              <p className="font-serif italic text-foreground text-lg leading-none">
                SEDA
              </p>
            </div>
            {/* Right: language pill with UK flag */}
            <div className="flex-1 flex justify-end">
              <div className="inline-flex items-center gap-1 border border-foreground/15 rounded-full px-1.5 py-0.5">
                <span
                  aria-hidden
                  className="block h-[10px] w-[16px] rounded-[1px] overflow-hidden relative shrink-0 bg-[#012169]"
                >
                  {/* white diagonals */}
                  <span
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(45deg, transparent 42%, #FFF 42%, #FFF 58%, transparent 58%), linear-gradient(-45deg, transparent 42%, #FFF 42%, #FFF 58%, transparent 58%)",
                    }}
                  />
                  {/* white cross */}
                  <span
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(0deg, transparent 35%, #FFF 35%, #FFF 65%, transparent 65%), linear-gradient(90deg, transparent 40%, #FFF 40%, #FFF 60%, transparent 60%)",
                    }}
                  />
                  {/* red cross */}
                  <span
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(0deg, transparent 42%, #C8102E 42%, #C8102E 58%, transparent 58%), linear-gradient(90deg, transparent 46%, #C8102E 46%, #C8102E 54%, transparent 54%)",
                    }}
                  />
                </span>
                <span className="font-mono text-[8px] tracking-wide text-foreground">
                  EN
                </span>
              </div>
            </div>
          </div>

          {/* Scrollable inner content */}
          <div className="flex-1 overflow-hidden relative">
            <div className="px-3 pt-1 pb-2 space-y-3">
              {/* Title */}
              <div className="px-2">
                <h3 className="font-serif font-light italic text-[20px] leading-tight text-foreground">
                  Arrival Guide
                </h3>
                <p className="font-sans text-[9px] text-muted-foreground mt-0.5">
                  Costa del Sol, Málaga
                </p>
              </div>

              {/* Map block */}
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-gradient-to-br from-[hsl(180,35%,55%)] via-[hsl(190,40%,65%)] to-[hsl(200,30%,75%)]">
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, transparent 49%, hsl(40, 30%, 90%) 49%, hsl(40, 30%, 90%) 51%, transparent 51%), linear-gradient(0deg, transparent 49%, hsl(40, 30%, 90%) 49%, hsl(40, 30%, 90%) 51%, transparent 51%)",
                    backgroundSize: "26px 26px, 18px 18px",
                  }}
                  aria-hidden
                />
                <div
                  className="absolute right-0 top-0 bottom-0 w-[55%] bg-[hsl(40,30%,92%)]/80"
                  style={{
                    clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0 100%)",
                  }}
                  aria-hidden
                />
                <div className="absolute top-1/2 left-[55%] -translate-x-1/2 -translate-y-full">
                  <MapPin
                    className="h-4 w-4 text-foreground"
                    strokeWidth={2}
                    fill="currentColor"
                  />
                </div>
                <div className="absolute bottom-1.5 right-1.5">
                  <button className="flex items-center gap-1 bg-background/95 text-foreground px-2 py-0.5 rounded-full font-sans text-[7px]">
                    <Compass className="h-2 w-2" strokeWidth={1.75} />
                    Get Directions
                  </button>
                </div>
              </div>

              {/* Step 01 */}
              <div className="px-2">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-mono text-[7.5px] tracking-wide text-muted-foreground/70 tabular-nums border border-foreground/15 rounded-full w-4 h-4 inline-flex items-center justify-center shrink-0">
                    01
                  </span>
                  <h4 className="font-serif text-[13px] text-foreground">
                    Find the building
                  </h4>
                </div>
                <p className="text-[8.5px] leading-[1.5] text-muted-foreground pl-6 mb-1.5">
                  Look for the white facade with the arched entrance. The code
                  for the main gate is{" "}
                  <span className="font-semibold text-foreground">1234</span>.
                </p>
                <img
                  src="/villas/door.jpg"
                  alt=""
                  className="ml-6 w-[calc(100%-1.5rem)] aspect-[16/9] object-cover rounded-lg"
                />
              </div>

              {/* Step 02 */}
              <div className="px-2">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-mono text-[7.5px] tracking-wide text-muted-foreground/70 tabular-nums border border-foreground/15 rounded-full w-4 h-4 inline-flex items-center justify-center shrink-0">
                    02
                  </span>
                  <h4 className="font-serif text-[13px] text-foreground">
                    Open access
                  </h4>
                </div>
                <p className="text-[8.5px] leading-[1.5] text-muted-foreground pl-6 mb-1.5">
                  Proceed to the second floor, door B. Parking is in the
                  basement.
                </p>
                <div className="ml-6 flex items-center gap-2 bg-background/70 border border-foreground/10 rounded-lg px-2.5 py-1.5">
                  <Car
                    className="h-3 w-3 text-muted-foreground shrink-0"
                    strokeWidth={1.5}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-[8.5px] text-foreground leading-tight">
                      Parking bay
                    </p>
                    <p className="font-sans text-[7px] text-muted-foreground leading-tight mt-0.5">
                      Use main gate code
                    </p>
                  </div>
                </div>
              </div>

              {/* Glimpse of Step 03 */}
              <div className="px-2 pt-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[7.5px] tracking-wide text-muted-foreground/70 tabular-nums border border-foreground/15 rounded-full w-4 h-4 inline-flex items-center justify-center shrink-0">
                    03
                  </span>
                  <h4 className="font-serif text-[13px] text-foreground/70">
                    Enter the apartment
                  </h4>
                </div>
              </div>
            </div>
            {/* Fade-out gradient at bottom indicates more scroll content */}
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-accent to-transparent pointer-events-none" />
          </div>

          {/* Bottom tab navigation */}
          <div className="bg-background/95 backdrop-blur border-t border-foreground/10 px-3 pt-2 pb-1 shrink-0">
            <div className="flex items-end justify-between">
              <button className="flex flex-col items-center gap-0.5 text-muted-foreground/70 flex-1">
                <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />
                <span className="font-sans text-[7px] tracking-wide uppercase">
                  Today
                </span>
              </button>
              <button className="flex flex-col items-center gap-0.5 text-foreground flex-1">
                <Briefcase className="h-3.5 w-3.5" strokeWidth={2} />
                <span className="font-sans text-[7px] tracking-wide uppercase font-medium">
                  Arrival
                </span>
              </button>
              {/* ASK SEDA — prominent center button */}
              <div className="flex flex-col items-center gap-0.5 flex-1 -mt-3">
                <button className="h-9 w-9 rounded-full bg-foreground flex items-center justify-center shadow-md">
                  <MessageCircle
                    className="h-3.5 w-3.5 text-background"
                    strokeWidth={2}
                  />
                </button>
                <span className="font-sans text-[7px] tracking-wide uppercase text-foreground font-medium">
                  Ask SEDA
                </span>
              </div>
              <button className="flex flex-col items-center gap-0.5 text-muted-foreground/70 flex-1">
                <Bed className="h-3.5 w-3.5" strokeWidth={1.5} />
                <span className="font-sans text-[7px] tracking-wide uppercase">
                  Stay
                </span>
              </button>
              <button className="flex flex-col items-center gap-0.5 text-muted-foreground/70 flex-1">
                <Compass className="h-3.5 w-3.5" strokeWidth={1.5} />
                <span className="font-sans text-[7px] tracking-wide uppercase">
                  Discover
                </span>
              </button>
            </div>
            {/* Home indicator */}
            <div className="pt-1.5 pb-1 flex justify-center">
              <div className="h-[3px] w-[80px] rounded-full bg-foreground/30" />
            </div>
          </div>
        </div>
      </div>
      {/* Subtle ground glow */}
      <div
        aria-hidden
        className="absolute inset-x-8 bottom-[-4rem] h-16 bg-[hsl(var(--olive))]/15 blur-3xl rounded-full"
      />
    </div>
  )
}

export function GuestAppSection() {
  const t = useTranslations()
  const { ref: textRef, isVisible: textVisible } = useScrollReveal(0.12)
  const { ref: phoneRef, isVisible: phoneVisible } = useScrollReveal(0.12)
  const reduced = usePrefersReducedMotion()
  const textShown = reduced || textVisible
  const phoneShown = reduced || phoneVisible

  const features: Feature[] = [
    { title: t("home.guestapp_section.feat.acceso.title"), description: t("home.guestapp_section.feat.acceso.desc") },
    { title: t("home.guestapp_section.feat.guia.title"), description: t("home.guestapp_section.feat.guia.desc") },
    { title: t("home.guestapp_section.feat.concierge.title"), description: t("home.guestapp_section.feat.concierge.desc") },
    { title: t("home.guestapp_section.feat.incidencias.title"), description: t("home.guestapp_section.feat.incidencias.desc") },
    { title: t("home.guestapp_section.feat.experiencias.title"), description: t("home.guestapp_section.feat.experiencias.desc") },
    { title: t("home.guestapp_section.feat.comunicacion.title"), description: t("home.guestapp_section.feat.comunicacion.desc") },
  ]

  return (
    <section id="guest-app" className="px-6 py-28 md:px-12 lg:px-20 md:py-40">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center max-w-6xl mx-auto">
        {/* Text column */}
        <div
          ref={textRef}
          className={`${
            reduced ? "" : "transition-all duration-1000"
          } ${textShown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-6">
            {t("home.guestapp_section.eyebrow")}
          </p>
          <h2 className="font-serif font-light text-[clamp(2rem,4.5vw,3.75rem)] leading-[1.05] tracking-[-0.02em] text-foreground text-balance mb-10">
            {t("home.guestapp_section.h2.line1")} <span className="italic">{t("home.guestapp_section.h2.italic")}</span>
          </h2>
          <p className="text-[0.95rem] leading-[1.75] text-muted-foreground max-w-md mb-10">
            {t("home.guestapp_section.body")}
          </p>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 max-w-2xl mb-12">
            {features.map((f) => (
              <li key={f.title} className="flex items-start gap-4">
                <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[hsl(var(--olive))]/12">
                  <Check
                    className="h-3 w-3 text-[hsl(var(--olive))]"
                    strokeWidth={2.5}
                  />
                </span>
                <div>
                  <p className="font-serif text-base leading-tight text-foreground">
                    {f.title}
                  </p>
                  <p className="font-mono text-[10.5px] tracking-wide leading-snug text-muted-foreground mt-1">
                    {f.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <a
            href="/guestapp"
            className="group inline-flex items-center gap-3 font-mono text-[11px] tracking-[0.25em] uppercase text-foreground border-b border-foreground/30 hover:border-foreground transition-colors pb-1"
          >
            {t("home.guestapp_section.cta")}
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
              strokeWidth={1.75}
            />
          </a>
        </div>

        {/* Phone column */}
        <div
          ref={phoneRef}
          className={`${
            reduced ? "" : "transition-all duration-1000 delay-200"
          } ${phoneShown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <PhoneMockup />
        </div>
      </div>
    </section>
  )
}
