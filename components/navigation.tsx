"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowUpRight, Lock } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { Link, usePathname } from "@/i18n/navigation"
import { LanguageSwitcher } from "@/components/language-switcher"
import { haySeccionGuias } from "@/lib/guias"
import { FranjaCabecera, TarjetasPortal } from "@/components/cabecera-franja"
import { DockMovil } from "@/components/dock-movil"
import { SelectorIdiomaCompacto } from "@/components/selector-idioma-compacto"
import type { HojaDock } from "@/lib/dock-movil"
import { DESTINO_PROPIETARIOS, DESTINO_VIAJEROS, tipoDePagina } from "@/lib/franja-cabecera"

// Los destinos externos (Guest App y Portal del propietario) viven en lib/franja-cabecera.ts.

// Mobile mega-menu IA — reorganised to match professional luxury
// hospitality patterns (Aman, Belmond, Le Collectionist, Oku).
// Three logical groups in journey order:
//
//   1. ESTANCIA — what a guest wants to see first: properties, curated
//      experiences, the digital companion. Largest group.
//   2. PROPIETARIOS — owner journey, kept separate so a guest never
//      mistakes B2B copy for guest-facing content.
//   3. SEDA — brand & utility, shown last: philosophy, FAQ, contact.
//
// Labels are now i18n keys so EN visitors get translated nav. Group
// titles are intentionally absent in the rendered drawer (gold rules
// do the separation visually) but kept here as comments for clarity.
type NavGroup = {
  /** Identifier — semantic only, not rendered. */
  group: "estancia" | "propietarios" | "seda"
  /** i18n key for the eyebrow label rendered above each group. */
  titleKey: string
  links: { tKey: string; href: string }[]
}
// `guias` link is spliced in conditionally (see `buildNavGroups`/
// `buildDesktopGroups` below) — only rendered once `haySeccionGuias()` is
// true (at least one published guide). Per docs/prompts/SUPERFICIE-CONTENIDO.md
// §5: zero guides published ⇒ the section is not linked anywhere.
function buildNavGroups(showGuias: boolean): NavGroup[] {
  return [
    {
      group: "estancia",
      titleKey: "mobile.huespedes",
      links: [
        { tKey: "nav.coleccion",    href: "/coleccion" },
        { tKey: "nav.experiencias", href: "/experiencias" },
        { tKey: "nav.guestapp",     href: "/guestapp" },
      ],
    },
    {
      group: "propietarios",
      titleKey: "mobile.propietarios",
      links: [
        { tKey: "nav.modelo",     href: "/propietarios" },
        { tKey: "nav.ecosistema", href: "/ecosistema" },
      ],
    },
    {
      group: "seda",
      titleKey: "mobile.seda",
      links: [
        { tKey: "nav.nosotros",  href: "/nosotros" },
        { tKey: "nav.filosofia", href: "/descubre" },
        ...(showGuias ? [{ tKey: "nav.guias", href: "/guias" }] : []),
        { tKey: "nav.faq",       href: "/faq" },
        { tKey: "nav.contacto",  href: "/contacto" },
      ],
    },
  ]
}

// Desktop nav layout: Colección · Experiencias | SEDA OS ▼ | Nosotros · Contacto
// SEDA OS is an inline dropdown in the primary nav strip (not the utility cluster).
type DesktopGroup = { id: "estancia" | "general"; links: { tKey: string; href: string }[] }
function buildDesktopGroups(showGuias: boolean): DesktopGroup[] {
  return [
    {
      id: "estancia",
      links: [
        { tKey: "nav.coleccion",    href: "/coleccion" },
        { tKey: "nav.experiencias", href: "/experiencias" },
      ],
    },
    {
      id: "general",
      links: [
        { tKey: "nav.nosotros", href: "/nosotros" },
        ...(showGuias ? [{ tKey: "nav.guias", href: "/guias" }] : []),
        { tKey: "nav.contacto", href: "/contacto" },
      ],
    },
  ]
}

// SEDA OS dropdown — product/owner pages as an inline dropdown in the primary nav.
const sedaOsItems = [
  { tKey: "nav.guestapp",     href: "/guestapp" },
  { tKey: "nav.ecosistema",   href: "/ecosistema" },
  { tKey: "nav.propietarios", href: "/propietarios" },
]

export function Navigation() {
  const pathname = usePathname()
  const t = useTranslations()
  // Recomputed per render (cheap — filters a small in-memory array), so a
  // guide published mid-session doesn't need a nav code change to appear.
  const showGuias = haySeccionGuias()
  const navGroups = buildNavGroups(showGuias)
  const desktopGroups = buildDesktopGroups(showGuias)
  // Only the home page has a dark video hero. Every other route starts with
  // a light/cream hero — the nav must render its "solid" (light-bg, dark
  // text) state from the first paint or it goes white-on-white.
  // `usePathname` from next-intl strips the locale prefix, so `/` always
  // matches home regardless of whether we're on `/` or `/en`.
  const isHome = pathname === "/"
  // Adaptive primary CTA: speak owners' language on owner routes,
  // guests' language everywhere else.
  // Tipo de cliente de la página (lib/franja-cabecera.ts): propietarios → «Valorar mi propiedad»; el resto → «Solicitar estancia».
  const tipo = tipoDePagina(pathname)
  const primaryCta =
    tipo === "propietarios"
      ? { label: t("cta.valorar_propiedad"), href: DESTINO_PROPIETARIOS }
      : { label: t("cta.solicitar_estancia"), href: DESTINO_VIAJEROS }

  // Hoja abierta del dock móvil (Portal o Menú): null = ninguna.
  const [hoja, setHoja] = useState<HojaDock | null>(null)
  const isOpen = hoja !== null
  const [pastHero, setPastHero] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [isAccessOpen, setIsAccessOpen] = useState(false)
  const accessRef = useRef<HTMLDivElement>(null)
  const [isSedaOsOpen, setIsSedaOsOpen] = useState(false)
  const sedaOsRef = useRef<HTMLDivElement>(null)
  // Mirrors `pathname` as of the last committed render, so the render-phase
  // reset below can detect a route change without a setState-in-effect.
  const [prevPathnameForVisibility, setPrevPathnameForVisibility] = useState(pathname)

  // `lastScrollY` is a transient frequent value (updated on every scroll).
  // Keeping it in a ref avoids re-rendering Navigation on every pixel of
  // scroll — only `pastHero` / `hidden` flips trigger a render now.
  // Per react-best-practices rule `rerender-use-ref-transient-values`.
  const lastScrollYRef = useRef(0)

  // Treat any non-home route, mega-menu-open, or "scrolled past the hero"
  // as the same UI state for the rest of the component (solid bg + dark text).
  const scrolled = pastHero || !isHome

  useEffect(() => {
    // Pause the scroll listener entirely while the drawer is open. The body
    // is `overflow: hidden` so window.scrollY can't legitimately change, but
    // momentum-scroll on iOS Safari occasionally fires phantom events that
    // would otherwise flip `hidden` to true — causing the header to slide
    // out of view as the user closes the menu. ("la barra se mueve.")
    if (isOpen) return

    const handleScroll = () => {
      const currentY = window.scrollY
      const lastY = lastScrollYRef.current
      setPastHero(currentY > 60)
      setHidden(currentY > lastY && currentY > 400)
      lastScrollYRef.current = currentY
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isOpen])

  // Reset visibility/scroll-derived state on route change so a stale "hidden"
  // from the previous page doesn't carry over and hide the nav on arrival.
  //
  // Render-phase adjustment (React docs: "Adjusting some state when a prop
  // changes") instead of an effect that unconditionally calls setState: when
  // `pathname` differs from the last committed value we correct hidden/pastHero
  // in this same render pass, before it commits, rather than one paint later.
  // The header element never unmounts across a route change, so the browser's
  // CSS transition still animates between its last painted frame and the next
  // committed one — the discarded intermediate render is never painted.
  if (pathname !== prevPathnameForVisibility) {
    setPrevPathnameForVisibility(pathname)
    setHidden(false)
    setPastHero(false)
  }
  // `lastScrollYRef` is a ref, not state, so resetting it never trips
  // set-state-in-effect. Kept in a post-commit effect (unchanged [pathname]
  // trigger) rather than the render body to avoid mutating a ref during render.
  useEffect(() => {
    lastScrollYRef.current = 0
  }, [pathname])

  // ALWAYS close the mobile drawer on any route or locale change. This is
  // the bulletproof safety net behind the inline `onClick` handlers on
  // every nav link — covers edge cases where the Link's click event
  // doesn't fire its onClick (notably: tapping a link to the route you
  // are already on, where next-intl shortcircuits navigation, and
  // switching language from the always-visible header switcher while the
  // drawer is open, which doesn't change `pathname` since next-intl's
  // `usePathname` strips the locale prefix).
  //
  // Render-phase adjustment with its OWN prev-trackers (distinct from
  // `prevPathnameForVisibility` above) so this [pathname, locale] trigger
  // stays independent from the [pathname]-only visibility reset — a same-route
  // locale switch must close the drawer without touching header visibility.
  // `setIsOpen(false)` still bails out cheaply when isOpen is already false
  // (React skips the re-render for a same-value update), same as before.
  const locale = useLocale()
  const [prevPathnameForDrawer, setPrevPathnameForDrawer] = useState(pathname)
  const [prevLocaleForDrawer, setPrevLocaleForDrawer] = useState(locale)
  if (pathname !== prevPathnameForDrawer || locale !== prevLocaleForDrawer) {
    setPrevPathnameForDrawer(pathname)
    setPrevLocaleForDrawer(locale)
    setHoja(null)
  }

  // Close Acceso dropdown on outside click or Escape key
  useEffect(() => {
    if (!isAccessOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsAccessOpen(false) }
    const onDown = (e: MouseEvent) => {
      if (!accessRef.current?.contains(e.target as Node)) setIsAccessOpen(false)
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("mousedown", onDown)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("mousedown", onDown)
    }
  }, [isAccessOpen])

  // Close SEDA OS dropdown on outside click or Escape key
  useEffect(() => {
    if (!isSedaOsOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsSedaOsOpen(false) }
    const onDown = (e: MouseEvent) => {
      if (!sedaOsRef.current?.contains(e.target as Node)) setIsSedaOsOpen(false)
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("mousedown", onDown)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("mousedown", onDown)
    }
  }, [isSedaOsOpen])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-500 ${
          hidden && !isOpen ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        {/* Franja fina encima de la barra; se recoge al bajar (pastHero). Solo desde 1.280 px. */}
        <FranjaCabecera tipo={tipo} recogida={pastHero} />
        <div
          className={`transition-[background-color,border-color,backdrop-filter] duration-500 ${
            scrolled
              ? "bg-background/95 backdrop-blur-md border-b border-border"
              : "bg-[rgba(20,16,14,0.68)] backdrop-blur-md"
          }`}
        >
        <nav className="flex items-center justify-between px-6 py-5 md:px-12 lg:px-20 min-[1280px]:px-12 min-[1340px]:px-20">
          <Link
            href="/"
            onClick={() => setHoja(null)}
            aria-label="SEDA Private Homes — inicio"
            className="relative flex shrink-0 items-center"
          >
            {/* Isotipo (todos los breakpoints) — sello discreto; el lockup completo ya vive en el hero.
                Crossfade blanco (hero) <-> ink (secciones claras). Ratio 1.4948:1. */}
            <span className="relative block h-[30px] w-[45px] md:h-[34px] md:w-[51px]">
              <img
                src="/brand/svg/seda-isotipo-white.svg"
                alt={scrolled ? "" : "SEDA Private Homes"}
                aria-hidden={scrolled ? "true" : undefined}
                width={45}
                height={30}
                className={`absolute inset-0 h-[30px] w-[45px] md:h-[34px] md:w-[51px] transition-opacity duration-500 motion-reduce:transition-none ${
                  scrolled ? "opacity-0" : "opacity-100"
                }`}
              />
              <img
                src="/brand/svg/seda-isotipo-ink.svg"
                alt={scrolled ? "SEDA Private Homes" : ""}
                aria-hidden={scrolled ? undefined : "true"}
                width={45}
                height={30}
                className={`absolute inset-0 h-[30px] w-[45px] md:h-[34px] md:w-[51px] transition-opacity duration-500 motion-reduce:transition-none ${
                  scrolled ? "opacity-100" : "opacity-0"
                }`}
              />
            </span>
            {/* Por debajo de 1.280 px el logo lleva también el nombre: isotipo + SEDA. */}
            <span
              data-logo-nombre
              className={`ml-3 font-serif text-[1.45rem] font-medium leading-none tracking-[0.22em] transition-colors duration-500 min-[1280px]:hidden ${
                scrolled ? "text-foreground" : "text-background"
              }`}
            >
              SEDA
            </span>
          </Link>

          {/* Barra completa (cuatro enlaces + SEDA OS + idiomas + Portal + reservar) desde 1.280 px.
              Entre 1.280 y 1.439 px, la misma barra más ceñida (gap-5 / gap-2 en vez de gap-7 / gap-3);
              el margen lateral baja a 3rem solo de 1.280 a 1.339 px y desde 1.340 vuelve a 5rem, el del
              contenido de la página (el logo queda alineado con el texto de debajo). En alemán y
              francés la barra mide ~1.190 px con los huecos de 1.440. Por debajo de 1.280, hamburguesa (los idiomas siguen visibles en la
              cabecera). Nada se parte (whitespace-nowrap) ni se encoge (shrink-0). */}
          {/* Desktop nav: Colección · Experiencias | SEDA OS ▼ | Nosotros · Contacto */}
          <div data-barra-escritorio className="hidden min-[1280px]:flex items-center gap-5 min-[1440px]:gap-7 shrink-0 whitespace-nowrap">
            {/* Group 1: Estancia */}
            {desktopGroups[0].links.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.tKey}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`group relative inline-flex items-center min-h-[44px] text-[11px] tracking-[0.18em] uppercase transition-colors duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current rounded-sm ${
                    scrolled
                      ? isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                      : isActive ? "text-background" : "text-background/85 hover:text-background"
                  } ${isActive ? "font-medium" : ""}`}
                >
                  {t(link.tKey)}
                  <span className={`absolute inset-x-0 -bottom-px h-px origin-left bg-current transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
                </Link>
              )
            })}

            <span aria-hidden className={`h-3.5 w-px transition-colors duration-500 ${scrolled ? "bg-[hsl(var(--gold))]/45" : "bg-background/35"}`} />

            {/* SEDA OS inline dropdown */}
            <div
              ref={sedaOsRef}
              className="relative"
              onMouseEnter={() => setIsSedaOsOpen(true)}
              onMouseLeave={() => setIsSedaOsOpen(false)}
            >
              <button
                type="button"
                onClick={() => setIsSedaOsOpen(v => !v)}
                className={`inline-flex items-center gap-1.5 min-h-[44px] font-mono text-[11px] tracking-[0.18em] uppercase transition-colors duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current rounded-sm ${
                  scrolled
                    ? isSedaOsOpen ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    : isSedaOsOpen ? "text-background" : "text-background/85 hover:text-background"
                }`}
                aria-haspopup="menu"
                aria-expanded={isSedaOsOpen}
              >
                {t("nav.seda_os")}
                <span className={`text-[8px] opacity-70 transition-transform duration-200 inline-block ${isSedaOsOpen ? "rotate-180" : ""}`}>▼</span>
              </button>
              <div
                role="menu"
                className={`absolute left-0 top-full pt-2 transition-all duration-200 min-w-[220px] z-10 ${
                  isSedaOsOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
                }`}
              >
                <div className="bg-background border border-border shadow-xl py-2">
                  {sedaOsItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.tKey}
                        href={item.href}
                        role="menuitem"
                        onClick={() => setIsSedaOsOpen(false)}
                        className={`flex items-center justify-between gap-3 px-5 py-3 font-mono text-[10px] tracking-[0.22em] uppercase transition-colors ${
                          isActive
                            ? "text-foreground bg-secondary/60"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                        }`}
                      >
                        {t(item.tKey)}
                        {isActive && <span className="w-1 h-1 rounded-full bg-[hsl(var(--gold))] shrink-0" />}
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>

            <span aria-hidden className={`h-3.5 w-px transition-colors duration-500 ${scrolled ? "bg-[hsl(var(--gold))]/45" : "bg-background/35"}`} />

            {/* Group 2: General */}
            {desktopGroups[1].links.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.tKey}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`group relative inline-flex items-center min-h-[44px] text-[11px] tracking-[0.18em] uppercase transition-colors duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current rounded-sm ${
                    scrolled
                      ? isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                      : isActive ? "text-background" : "text-background/85 hover:text-background"
                  } ${isActive ? "font-medium" : ""}`}
                >
                  {t(link.tKey)}
                  <span className={`absolute inset-x-0 -bottom-px h-px origin-left bg-current transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
                </Link>
              )
            })}
          </div>

          <div className="hidden min-[1280px]:flex items-center gap-2 min-[1440px]:gap-3 shrink-0 whitespace-nowrap">
            {/* Language switcher — ES/EN, persists in localStorage */}
            <div className={`pr-3 mr-1 border-r transition-colors duration-500 ${
              scrolled ? "border-border" : "border-background/25"
            }`}>
              <LanguageSwitcher darkOnLight={scrolled} />
            </div>

            {/* Portal dropdown — houses Guest App + Ecosistema (discover)
                and the two external sign-in portals (access), separated by
                a hairline rule so the two audiences read as distinct tiers.
                Keyboard-accessible: Enter/Space toggles, Escape closes.
                Mouse: opens on hover via onMouseEnter/Leave on the container. */}
            <div
              ref={accessRef}
              className="relative"
              onMouseEnter={() => setIsAccessOpen(true)}
              onMouseLeave={() => setIsAccessOpen(false)}
            >
              <button
                type="button"
                onClick={() => setIsAccessOpen(v => !v)}
                className={`inline-flex items-center gap-1.5 px-4 min-h-[44px] rounded-full border font-mono text-[10px] tracking-[0.22em] uppercase transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current ${
                  scrolled
                    ? isAccessOpen
                      ? "text-foreground border-foreground/40 bg-foreground/[0.04]"
                      : "text-foreground border-foreground/25 hover:border-foreground/45 hover:bg-foreground/[0.04]"
                    : isAccessOpen
                      ? "text-background border-background/40 bg-background/[0.06]"
                      : "text-background border-background/25 hover:border-background/45 hover:bg-background/[0.06]"
                }`}
                aria-haspopup="menu"
                aria-expanded={isAccessOpen}
              >
                <Lock className="h-3 w-3 shrink-0" strokeWidth={1.5} />
                {t("nav.portal")}
                <span className={`ml-0.5 text-[8px] opacity-70 transition-transform duration-200 inline-block ${isAccessOpen ? "rotate-180" : ""}`}>▼</span>
              </button>
              <div
                role="menu"
                className={`absolute right-0 top-full pt-2 transition-all duration-200 w-[22rem] max-w-[calc(100vw-2rem)] whitespace-normal z-10 ${
                  isAccessOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
                }`}
              >
                <div data-portal-panel className="box-border w-full bg-background border border-border shadow-xl">
                  <TarjetasPortal />
                </div>
              </div>
            </div>

            {/* Un solo botón en la barra, según el tipo de página; aparece cuando la franja se recoge (pastHero).
                El margen negativo cancela el gap del bloque mientras el botón está oculto. */}
            <div
              data-barra-cta={pastHero ? "visible" : "oculto"}
              aria-hidden={pastHero ? undefined : true}
              inert={!pastHero}
              className={`shrink-0 overflow-hidden transition-[max-width,margin,opacity] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${
                pastHero ? "ml-0 max-w-[22rem] opacity-100" : "-ml-2 max-w-0 opacity-0 min-[1440px]:-ml-3"
              }`}
            >
              <Link
                href={primaryCta.href}
                className={`group inline-flex items-center gap-3 pl-5 pr-1.5 py-1.5 rounded-full font-mono text-[10px] tracking-[0.22em] uppercase transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2 ${
                  scrolled
                    ? "bg-foreground text-background hover:opacity-90"
                    : "bg-background text-foreground hover:opacity-90"
                }`}
              >
                {primaryCta.label}
                {/* Arrow circle — w-8 h-8 makes the overall button ~44px tall */}
                <span className="w-8 h-8 rounded-full bg-current/[0.12] flex items-center justify-center transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-110">
                  <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                </span>
              </Link>
            </div>
          </div>

          {/* Barra de arriba por debajo de 1.280 px: solo el idioma. Móvil (< 768): botón «ES ▾» que abre
              ES/EN/FR/DE; tablet: los cuatro idiomas en línea. Los accesos viven en el dock de abajo. */}
          <div className="min-[1280px]:hidden flex items-center shrink-0 whitespace-nowrap">
            <div className="hidden md:block">
              <LanguageSwitcher darkOnLight={scrolled} />
            </div>
            <div className="md:hidden">
              <SelectorIdiomaCompacto oscuro={scrolled} />
            </div>
          </div>
        </nav>
        </div>
      </header>

      {/* Dock fijo abajo (< 1.280 px) con las hojas de Portal y de Menú; en escritorio no existe. */}
      <DockMovil tipo={tipo} hoja={hoja} setHoja={setHoja} grupos={navGroups} />
    </>
  )
}
