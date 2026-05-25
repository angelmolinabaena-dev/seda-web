"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"

export function EditorialBreak() {
  const t = useTranslations()
  const { ref: imgRef, isVisible: imgVisible } = useScrollReveal(0.15)
  const { ref: textRef, isVisible: textVisible } = useScrollReveal(0.2)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const apply = () => setReduced(mq.matches)
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [])

  const imgShown = reduced || imgVisible
  const textShown = reduced || textVisible

  return (
    <section id="about" className="px-6 md:px-12 lg:px-20 py-20 md:py-32">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div
          ref={imgRef}
          className={`overflow-hidden ${
            reduced ? "" : "transition-all duration-1000"
          } ${imgShown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          {/* Imagen generada con fal.ai Nano Banana Pro (May 2026) — placeholder */}
          <img
            src="/villas/about.jpg"
            alt={t("home.editorial.image_alt")}
            className="w-full aspect-[16/10] object-cover"
          />
        </div>
        <div
          ref={textRef}
          className={`${
            reduced ? "" : "transition-all duration-1000 delay-200"
          } ${textShown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-6">
            {t("home.editorial.eyebrow")}
          </p>
          <div className="w-10 h-px bg-foreground/20 mb-10" />
          <h2 className="font-serif font-light text-2xl md:text-3xl lg:text-[2.25rem] leading-[1.18] tracking-[-0.01em] text-foreground text-balance mb-10">
            {t("home.editorial.h2")}
          </h2>
          <div className="space-y-5 text-[0.95rem] leading-[1.7] text-muted-foreground mb-10 max-w-md">
            <p>{t("home.editorial.body1")}</p>
            <p>{t("home.editorial.body2")}</p>
          </div>
          <p className="font-serif font-light italic text-lg md:text-xl leading-[1.4] text-foreground/85 max-w-md">
            {t("home.editorial.tagline")}
          </p>
        </div>
      </div>
    </section>
  )
}
