"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowRight } from "lucide-react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"

export function Hero() {
  const t = useTranslations()
  const [visible, setVisible] = useState(false)
  const [reduced, setReduced] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const parallaxRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const apply = () => setReduced(mq.matches)
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [])

  useEffect(() => {
    if (reduced) {
      setVisible(true)
      return
    }
    const timer = setTimeout(() => setVisible(true), 200)
    return () => clearTimeout(timer)
  }, [reduced])

  useEffect(() => {
    if (reduced) {
      if (parallaxRef.current) parallaxRef.current.style.transform = ""
      if (contentRef.current) {
        contentRef.current.style.transform = ""
        contentRef.current.style.opacity = ""
      }
      return
    }

    let rafId = 0
    let ticking = false

    const update = () => {
      ticking = false
      const y = window.scrollY
      const vh = window.innerHeight || 1
      if (y > vh) return
      if (parallaxRef.current) {
        parallaxRef.current.style.transform = `translate3d(0, ${y * 0.3}px, 0)`
      }
      if (contentRef.current) {
        const fade = Math.max(0, 1 - y / (vh * 0.6))
        contentRef.current.style.transform = `translate3d(0, ${y * -0.15}px, 0)`
        contentRef.current.style.opacity = String(fade)
      }
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true
        rafId = requestAnimationFrame(update)
      }
    }

    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(rafId)
    }
  }, [reduced])

  return (
    <section ref={ref} className="relative h-screen flex flex-col overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div ref={parallaxRef} className="absolute inset-0 will-change-transform bg-foreground">
          {reduced ? (
            <img
              src="/villas/hero-poster.jpg"
              alt={t("home.hero.hero_poster_alt")}
              className="w-full h-full object-cover scale-100"
            />
          ) : (
            /* PLACEHOLDER (poster): sustituir por frame extraído del vídeo */
            <video
              src="/hero.mp4"
              poster="/villas/hero-poster.jpg"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              aria-label={t("home.hero.hero_video_alt")}
              className={`w-full h-full object-cover transition-transform duration-[2s] ease-out ${
                visible ? "scale-100" : "scale-110"
              }`}
            />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/20 via-foreground/40 to-foreground/70" />
        {/* Header backdrop — pequeño degradado oscuro detrás de la nav para garantizar contraste */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-foreground/45 to-transparent pointer-events-none" />
      </div>

      {/* Top meta strip (coords left + SEDA · 2026 right) */}
      <div
        className={`relative z-10 flex items-center justify-between px-6 md:px-12 lg:px-20 pt-24 md:pt-28 font-mono text-[11px] tracking-[0.25em] uppercase text-background/65 ${
          reduced ? "" : "transition-opacity duration-1000 delay-300"
        } ${visible ? "opacity-100" : "opacity-0"}`}
      >
        <span>36°30&apos;N · 04°53&apos;W</span>
        <span className="hidden sm:inline">SEDA · {new Date().getFullYear()}</span>
      </div>

      <div className="flex-1" />

      {/* Content (bottom-anchored) */}
      <div
        ref={contentRef}
        className="relative z-10 px-6 pb-16 md:px-12 lg:px-20 md:pb-20 will-change-transform"
      >
        <div className="max-w-5xl">
          <div
            className={`${
              reduced ? "" : "transition-all duration-1000 delay-700"
            } ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <h1 className="font-serif font-light text-[clamp(2.5rem,7vw,6rem)] leading-[1.02] tracking-[-0.015em] text-background text-balance">
              {t("home.hero.h1.line1")}
              <br className="hidden md:block" />
              <span className="italic">{t("home.hero.h1.line2")}</span>
            </h1>
          </div>

          <div
            className={`mt-10 md:mt-14 flex flex-col sm:flex-row gap-3 ${
              reduced ? "" : "transition-all duration-1000 delay-1000"
            } ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <Link
              href="/coleccion"
              className="group inline-flex items-center justify-center gap-3 px-7 py-3.5 bg-background text-foreground font-mono text-[11px] tracking-[0.25em] uppercase hover:bg-background/90 transition-colors"
            >
              {t("home.hero.cta_explorar")}
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                strokeWidth={1.75}
              />
            </Link>
            <Link
              href="/propietarios"
              className="group inline-flex items-center justify-center gap-3 px-7 py-3.5 border border-background/40 text-background font-mono text-[11px] tracking-[0.25em] uppercase hover:bg-background/10 hover:border-background/70 transition-colors"
            >
              {t("home.hero.cta_propietario")}
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                strokeWidth={1.75}
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
