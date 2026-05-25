"use client"

import { useTranslations } from "next-intl"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

/*
  Continuous marquee slider for "Servicios que puedes activar".
  - Auto-scrolls horizontally via CSS keyframes (animate-marquee in globals.css)
  - Cards duplicated 2x in DOM so translate(-50%) wraps seamlessly
  - Pauses on hover (desktop)
  - Disabled entirely on prefers-reduced-motion
  - Titles are CSS-overlaid (Cormorant Garamond) on cropped background images
    for sharper rendering than burned-in JPEG text.
*/

type Service = {
  slug: string
  title: string
  italic: string
  line: string
  image: string
}

function Card({ s, altSuffix }: { s: Service; altSuffix: string }) {
  return (
    <article
      className="
        relative shrink-0 overflow-hidden
        w-[78vw] sm:w-[58vw] md:w-[34vw] lg:w-[24vw] xl:w-[22rem]
        aspect-[4/5]
        group/card
      "
    >
      <img
        src={s.image}
        alt={`${s.title} ${s.italic} — ${altSuffix}`}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-[1.03]"
      />
      {/* Bottom gradient for legibility */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none"
      />
      {/* Title overlay */}
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-7 text-background">
        <h3 className="font-serif font-light text-2xl md:text-[1.75rem] leading-[1.05] tracking-[-0.01em]">
          {s.title} <span className="italic">{s.italic}</span>
        </h3>
        <div className="w-10 h-px bg-[hsl(var(--gold))] mt-3 mb-3" />
        <p className="text-[11px] leading-[1.55] text-background/80 max-w-[18ch]">
          {s.line}
        </p>
      </div>
    </article>
  )
}

export function ServicesSlider() {
  const t = useTranslations()
  const { ref: headRef, isVisible: headVisible } = useScrollReveal(0.15)
  const reduced = usePrefersReducedMotion()
  const headShown = reduced || headVisible

  const services: Service[] = [
    {
      slug: "chef",
      title: t("home.services.chef.title"),
      italic: t("home.services.chef.italic"),
      line: t("home.services.chef.line"),
      image: "/villas/services/chef.jpg",
    },
    {
      slug: "transfer",
      title: t("home.services.transfer.title"),
      italic: t("home.services.transfer.italic"),
      line: t("home.services.transfer.line"),
      image: "/villas/services/transfer.jpg",
    },
    {
      slug: "experiencias",
      title: t("home.services.experiencias.title"),
      italic: t("home.services.experiencias.italic"),
      line: t("home.services.experiencias.line"),
      image: "/villas/services/experiencias.jpg",
    },
    {
      slug: "actividades",
      title: t("home.services.actividades.title"),
      italic: t("home.services.actividades.italic"),
      line: t("home.services.actividades.line"),
      image: "/villas/services/actividades.jpg",
    },
    {
      slug: "beach-clubs",
      title: t("home.services.beach_clubs.title"),
      italic: t("home.services.beach_clubs.italic"),
      line: t("home.services.beach_clubs.line"),
      image: "/villas/services/beach-clubs.jpg",
    },
    {
      slug: "wellness",
      title: t("home.services.wellness.title"),
      italic: t("home.services.wellness.italic"),
      line: t("home.services.wellness.line"),
      image: "/villas/services/wellness.jpg",
    },
    {
      slug: "limpieza",
      title: t("home.services.limpieza.title"),
      italic: t("home.services.limpieza.italic"),
      line: t("home.services.limpieza.line"),
      image: "/villas/services/limpieza.jpg",
    },
  ]

  // Duplicate the array twice so the -50% translate loops seamlessly
  const loop = [...services, ...services]
  const altSuffix = t("home.services.alt_suffix")

  return (
    <section
      id="services"
      className="px-0 py-24 md:py-32 bg-foreground text-background overflow-hidden"
    >
      {/* Section head */}
      <div
        ref={headRef}
        className={`max-w-7xl mx-auto px-6 md:px-12 lg:px-20 mb-14 md:mb-20 ${
          reduced ? "" : "transition-all duration-1000"
        } ${headShown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-background/50 mb-6">
          {t("home.services.eyebrow")}
        </p>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <h2 className="font-serif font-light text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.05] tracking-[-0.02em] text-balance max-w-3xl">
            {t("home.services.h2.line1")}{" "}
            <span className="italic text-[hsl(var(--gold))]">{t("home.services.h2.italic")}</span>
          </h2>
          <p className="text-sm leading-[1.7] text-background/65 max-w-sm">
            {t("home.services.body")}
          </p>
        </div>
      </div>

      {/* Marquee viewport */}
      <div className="relative pause-on-hover">
        {/* Edge fade masks */}
        <div
          aria-hidden
          className="hidden md:block absolute left-0 top-0 bottom-0 w-24 lg:w-40 z-10 bg-gradient-to-r from-foreground to-transparent pointer-events-none"
        />
        <div
          aria-hidden
          className="hidden md:block absolute right-0 top-0 bottom-0 w-24 lg:w-40 z-10 bg-gradient-to-l from-foreground to-transparent pointer-events-none"
        />

        <div
          className="
            flex gap-4 md:gap-6
            animate-marquee
            w-max
          "
        >
          {loop.map((s, i) => (
            <Card key={`${s.slug}-${i}`} s={s} altSuffix={altSuffix} />
          ))}
        </div>
      </div>
    </section>
  )
}
