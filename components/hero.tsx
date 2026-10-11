"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { ArrowRight } from "lucide-react"
import { useTranslations } from "next-intl"
import { IllustrativeTag } from "@/components/illustrative-tag"
import { Link } from "@/i18n/navigation"

export function Hero() {
  const t = useTranslations()
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

  // The video (1.2 MB) is only attached once the page has finished loading.
  // The poster paints from the first frame either way, so nothing changes to
  // the eye; what changes is that the MP4 no longer competes for bandwidth
  // with the HTML, CSS, fonts and JS that the first paint actually needs.
  // With `src` in the markup it started downloading at ~160 ms and was the
  // single largest request of the critical path (Lighthouse mobile LCP).
  const [videoSrc, setVideoSrc] = useState<string | undefined>(undefined)
  useEffect(() => {
    if (reduced) return
    const attach = () => setVideoSrc("/hero.mp4")
    if (document.readyState === "complete") {
      attach()
      return
    }
    window.addEventListener("load", attach, { once: true })
    return () => window.removeEventListener("load", attach)
  }, [reduced])

  // The entrance (fade/rise of the text, zoom-out of the video) is pure CSS
  // — `.hero-rise` / `.hero-zoom` in app/globals.css — so it runs from the
  // first paint, not after hydration, and is skipped by the
  // `prefers-reduced-motion` media query without any state here.

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
    <section id="hero" ref={ref} className="relative min-h-[100dvh] flex flex-col overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <IllustrativeTag className="bottom-4 right-6" />
        <div ref={parallaxRef} className="absolute inset-0 will-change-transform bg-foreground">
          {/* The poster is a real <Image priority> under the video, not the
              video's `poster` attribute: Chrome never took the poster as LCP
              candidate, so the LCP fell on the animated headline (painted late,
              after the JS) and the mobile LCP sat at 4.7–6 s. As an <Image> it
              is the LCP at first paint, preloaded with high priority and served
              as AVIF/WebP at the screen's width. The video, with no poster of
              its own, is transparent until its first frame and then covers it:
              same picture, same moment. Reduced motion: the image alone. */}
          {/* PLACEHOLDER (poster): sustituir por frame extraído del vídeo */}
          <div className="hero-zoom absolute inset-0">
            <Image
              src="/villas/hero-poster.jpg"
              width={1376}
              height={768}
              sizes="100vw"
              priority
              alt={reduced ? t("home.hero.hero_poster_alt") : ""}
              className="w-full h-full object-cover"
            />
            {!reduced && (
              <video
                src={videoSrc}
                autoPlay
                loop
                muted
                playsInline
                preload="none"
                aria-label={t("home.hero.hero_video_alt")}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/20 via-foreground/40 to-foreground/70" />
        {/* Header backdrop — pequeño degradado oscuro detrás de la nav para garantizar contraste */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-foreground/45 to-transparent pointer-events-none" />
      </div>

      {/* Top meta strip (coords left + SEDA · 2026 right) */}
      <div
        className="hero-rise relative z-10 flex items-center justify-between px-6 md:px-12 lg:px-20 pt-24 md:pt-28 font-mono text-[11px] tracking-[0.25em] uppercase text-background/90 [--hero-rise-from:0] [animation-delay:500ms]"
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
          <div className="hero-rise [animation-delay:900ms]">
            <img
              src="/brand/svg/seda-wordmark-white.svg"
              alt=""
              aria-hidden="true"
              width={205}
              height={95}
              loading="eager"
              className="w-[205px] h-[95px] md:w-[260px] md:h-[120px]"
            />
            <div className="w-[26px] md:w-[36px] h-px bg-[rgba(255,249,240,0.40)] mt-[26px] md:mt-[30px]" />
            <h1 className="mt-[24px] md:mt-[28px] font-serif font-light text-[clamp(2.5rem,7vw,6rem)] leading-[1.02] tracking-[-0.015em] text-background text-balance">
              {t("home.hero.h1.line1")}
              <br className="hidden md:block" />
              <span className="italic">{t("home.hero.h1.line2")}</span>
            </h1>
          </div>

          <div className="hero-rise mt-10 md:mt-14 flex flex-col sm:flex-row gap-3 [--hero-rise-from:1rem] [animation-delay:1200ms]">
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
