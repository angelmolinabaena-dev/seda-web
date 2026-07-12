"use client"

import { useState, useEffect, useRef, useTransition, useCallback } from "react"
import { Menu, X, ArrowUpRight, Lock } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { Link, usePathname, useRouter } from "@/i18n/navigation"
import { LanguageSwitcher } from "@/components/language-switcher"

// External app URLs — sourced from seda4/shared.jsx (Claude design reference)
const GUEST_APP_URL = "https://guests.sedaprivatehomes.com/villa/apartamento-torremolinos/d1389271-1fbc-4d8a-8bb1-bfc0464d3bfc"
// Owner PORTAL home — was pointing at the internal /admin panel (bounces a
// prospective owner to an admin login). "/" is the owner-facing portal home.
const OWNERS_PORTAL_URL = "https://portal.sedaprivatehomes.com/"

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
const navGroups: NavGroup[] = [
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
      { tKey: "nav.faq",       href: "/faq" },
      { tKey: "nav.contacto",  href: "/contacto" },
    ],
  },
]

// Desktop nav layout: Colección · Experiencias | SEDA OS ▼ | Nosotros · Contacto
// SEDA OS is an inline dropdown in the primary nav strip (not the utility cluster).
type DesktopGroup = { id: "estancia" | "general"; links: { tKey: string; href: string }[] }
const desktopGroups: DesktopGroup[] = [
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
      { tKey: "nav.contacto", href: "/contacto" },
    ],
  },
]

// SEDA OS dropdown — product/owner pages as an inline dropdown in the primary nav.
const sedaOsItems = [
  { tKey: "nav.guestapp",     href: "/guestapp" },
  { tKey: "nav.ecosistema",   href: "/ecosistema" },
  { tKey: "nav.propietarios", href: "/propietarios" },
]

// Portal dropdown — external sign-in portals only.
const portalItems = [
  { tKey: "nav.acceso_huespedes",    href: GUEST_APP_URL },
  { tKey: "nav.acceso_propietarios", href: OWNERS_PORTAL_URL },
]

// Routes where the visitor is in "owner intent" mode — primary CTA mirrors that.
// Anywhere else (home, /coleccion, /experiencias, /guestapp, /villa/*, /faq, /descubre)
// we assume guest intent and offer "Solicitar estancia" instead.
const OWNER_ROUTES = ["/propietarios", "/ecosistema"]

function isOwnerRoute(pathname: string | null) {
  if (!pathname) return false
  return OWNER_ROUTES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

export function Navigation() {
  const pathname = usePathname()
  const t = useTranslations()
  // Only the home page has a dark video hero. Every other route starts with
  // a light/cream hero — the nav must render its "solid" (light-bg, dark
  // text) state from the first paint or it goes white-on-white.
  // `usePathname` from next-intl strips the locale prefix, so `/` always
  // matches home regardless of whether we're on `/` or `/en`.
  const isHome = pathname === "/"
  // Adaptive primary CTA: speak owners' language on owner routes,
  // guests' language everywhere else.
  const ownerCtx = isOwnerRoute(pathname)
  const primaryCta = ownerCtx
    ? { label: t("cta.valorar_propiedad"), href: "/contacto?type=owner" }
    : { label: t("cta.solicitar_estancia"), href: "/contacto?type=guest" }

  const [isOpen, setIsOpen] = useState(false)
  const [pastHero, setPastHero] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [isAccessOpen, setIsAccessOpen] = useState(false)
  const accessRef = useRef<HTMLDivElement>(null)
  const [isSedaOsOpen, setIsSedaOsOpen] = useState(false)
  const sedaOsRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [, startTransition] = useTransition()
  // Mirrors `pathname` as of the last committed render, so the render-phase
  // reset below can detect a route change without a setState-in-effect.
  const [prevPathnameForVisibility, setPrevPathnameForVisibility] = useState(pathname)

  /**
   * Mobile nav-link click handler.
   *
   * Why this exists instead of just `<Link onClick={() => setIsOpen(false)}>`:
   * - Next.js App Router suspends during route navigation. If we let `<Link>`
   *   handle the navigation synchronously, the `setIsOpen(false)` update can
   *   get held up inside that suspense — the user sees the drawer "stuck open"
   *   for the duration of the new route's data fetching.
   * - By preventing the link's default behaviour and doing it ourselves we:
   *     1. Close the drawer (urgent state update — happens immediately)
   *     2. Defer the navigation inside `startTransition` so it doesn't
   *        block the close render.
   * - We still pass through normal anchor behaviour (Cmd/Ctrl/middle-click,
   *   modifiers) so power users can open in a new tab.
   */
  const handleNavTap = useCallback(
    (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Respect modifier clicks → let the browser handle them.
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
        // Still close the drawer — they're navigating away.
        setIsOpen(false)
        return
      }
      e.preventDefault()
      setIsOpen(false)
      startTransition(() => {
        router.push(href)
      })
    },
    // `setIsOpen`'s identity is guaranteed stable by React, so listing it is a
    // no-op for how often this callback is recreated (still gated by `router`);
    // it's required only to satisfy react-hooks/preserve-manual-memoization,
    // which does literal dependency-list matching rather than stability reasoning.
    [router, setIsOpen]
  )
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
    setIsOpen(false)
  }

  // Lock body scroll when mega-menu is open
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = prevOverflow
      }
    }
  }, [isOpen])

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

  // Ripple effect — contextual color per drawer group
  const ripple = useCallback((e: React.PointerEvent<HTMLAnchorElement>, color: string) => {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    const d = Math.max(el.offsetWidth, el.offsetHeight)
    const span = document.createElement("span")
    span.className = "ripple-wave"
    span.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - rect.left - d / 2}px;top:${e.clientY - rect.top - d / 2}px;background:${color};`
    el.appendChild(span)
    span.addEventListener("animationend", () => span.remove(), { once: true })
  }, [])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          hidden && !isOpen ? "-translate-y-full" : "translate-y-0"
        } ${
          scrolled || isOpen
            ? "bg-background/95 backdrop-blur-md border-b border-border"
            : "bg-[rgba(20,16,14,0.72)] backdrop-blur-md"
        }`}
      >
        <nav className="flex items-center justify-between px-6 py-5 md:px-12 lg:px-20">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            aria-label="SEDA Private Homes — inicio"
            className="relative block shrink-0"
          >
            {/* Isotipo (todos los breakpoints) — sello discreto; el lockup completo ya vive en el hero.
                Crossfade blanco (hero) <-> ink (secciones claras). Ratio 1.4948:1. */}
            <span className="relative block h-[30px] w-[45px] md:h-[34px] md:w-[51px]">
              <img
                src="/brand/svg/seda-isotipo-white.svg"
                alt={scrolled || isOpen ? "" : "SEDA Private Homes"}
                aria-hidden={scrolled || isOpen ? "true" : undefined}
                width={45}
                height={30}
                className={`absolute inset-0 h-[30px] w-[45px] md:h-[34px] md:w-[51px] transition-opacity duration-500 motion-reduce:transition-none ${
                  scrolled || isOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <img
                src="/brand/svg/seda-isotipo-ink.svg"
                alt={scrolled || isOpen ? "SEDA Private Homes" : ""}
                aria-hidden={scrolled || isOpen ? undefined : "true"}
                width={45}
                height={30}
                className={`absolute inset-0 h-[30px] w-[45px] md:h-[34px] md:w-[51px] transition-opacity duration-500 motion-reduce:transition-none ${
                  scrolled || isOpen ? "opacity-100" : "opacity-0"
                }`}
              />
            </span>
          </Link>

          {/* Desktop nav: Colección · Experiencias | SEDA OS ▼ | Nosotros · Contacto */}
          <div className="hidden lg:flex items-center gap-5 xl:gap-7">
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

          <div className="hidden lg:flex items-center gap-2 xl:gap-3 flex-shrink-0">
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
                className={`absolute right-0 top-full pt-2 transition-all duration-200 min-w-[240px] z-10 ${
                  isAccessOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
                }`}
              >
                <div className="bg-background border border-border shadow-xl py-2">
                  {portalItems.map((item) => (
                    <a
                      key={item.tKey}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      role="menuitem"
                      className="flex items-center justify-between gap-3 px-5 py-3 font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                    >
                      {t(item.tKey)}
                      <ArrowUpRight className="h-3 w-3 shrink-0" strokeWidth={1.5} />
                    </a>
                  ))}
                </div>
              </div>
            </div>

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

          {/* Mobile right cluster — language switcher + burger.
              Switcher lives in the header (visible at all times) rather
              than inside the drawer so that the locale decision is a
              top-level affordance, not buried behind a menu tap. The
              divider mirrors the desktop spacing on the right side of
              `lg:flex` (border-r → mr-1 pr-3). */}
          <div className="lg:hidden flex items-center gap-3">
            <div
              className={`pr-3 border-r transition-colors duration-500 ${
                scrolled || isOpen ? "border-border" : "border-background/25"
              }`}
            >
              <LanguageSwitcher darkOnLight={scrolled || isOpen} />
            </div>
            {/* Hamburger → X morph: both icons layered, cross-fade
                with counter-rotation so the transition reads as a single
                continuous gesture. cubic-bezier matches the CTA pill. */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`relative -mr-2 w-10 h-10 flex items-center justify-center transition-colors duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current rounded-sm ${
                scrolled || isOpen ? "text-foreground" : "text-background"
              }`}
              aria-label={isOpen ? t("nav.close_menu") : t("nav.open_menu")}
              aria-expanded={isOpen}
            >
              <Menu
                className={`absolute h-5 w-5 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  isOpen ? "opacity-0 rotate-45 scale-75" : "opacity-100 rotate-0 scale-100"
                }`}
                strokeWidth={1.5}
              />
              <X
                className={`absolute h-5 w-5 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  isOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-45 scale-75"
                }`}
                strokeWidth={1.5}
              />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile mega-menu — fullscreen overlay.
          Architecture rationale:
          - Full-height flex column with `overflow-y-auto`.
          - The footer uses `mt-auto`, NOT `sticky bottom-0`. The sticky
            version jittered on iOS Safari when momentum scroll bounced
            past the bottom edge. With `mt-auto` the footer simply lives
            below the scrollable content and reaches the viewport bottom
            naturally when content fits — short menus pin it; long menus
            scroll past it. Either way: no jitter.
          - Container uses opacity transition for the overlay itself,
            but the interior children get a staggered slide+fade via
            per-element transition-delay (see below). The combined
            effect reads like an editorial curtain reveal. */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-background/[0.98] backdrop-blur-md ${
          isOpen
            ? "opacity-100 pointer-events-auto transition-opacity duration-200 ease-out"
            : "opacity-0 pointer-events-none transition-opacity duration-150 ease-in"
        }`}
        aria-hidden={!isOpen}
        // `inert` would be ideal here but support is uneven on older Safari;
        // pointer-events + aria-hidden cover the same intent.
        // Transition shortened from 400ms → 200ms so taps feel snappy:
        // user perceives "closed" within a single frame after their tap.
      >
        <div className="h-full flex flex-col pt-20 pb-6 px-6 md:px-12 overflow-y-auto overscroll-contain">
          {/* Three differentiated sections — each group has its own visual
              identity, not just spatial separation:
              - HUÉSPEDES (primary audience, warm): default cream bg, gold
                accent, bold serif large.
              - PROPIETARIOS (B2B-leaning, professional): full-width olive-
                tinted bleed section that breaks the rhythm. Olive accent
                on eyebrow + active dot. Same bold serif size.
              - SEDA (utility, brand): no special bg, neutral muted eyebrow,
                font-medium (not bold) + smaller serif. Reads as quieter
                tier — "the rest" — without losing editorial register.

              Stagger across all 3 sections is preserved via a manual
              flat index (eyebrow1, item1.1, 1.2, 1.3, eyebrow2, item2.1,
              2.2, eyebrow3, item3.1, 3.2, 3.3 — 12 positions). */}

          {/* GROUP 1 — Huéspedes (warm primary) */}
          <section>
            <p
              className={`font-mono text-[10px] tracking-[0.3em] uppercase text-[hsl(var(--gold))] mb-4 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
              style={{ transitionDelay: isOpen ? "120ms" : "0ms" }}
            >
              — {t(navGroups[0].titleKey)}
            </p>
            <ul className="space-y-2.5">
              {navGroups[0].links.map((link, idx) => {
                const isActive = pathname === link.href
                const delay = 165 + idx * 45
                return (
                  <li
                    key={link.tKey}
                    className={`transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                    }`}
                    style={{ transitionDelay: isOpen ? `${delay}ms` : "0ms" }}
                  >
                    <Link
                      href={link.href}
                      onClick={handleNavTap(link.href)}
                      onPointerDown={(e) => ripple(e, "hsl(38 50% 50% / 0.2)")}
                      aria-current={isActive ? "page" : undefined}
                      className={`group relative overflow-hidden flex items-baseline gap-2.5 -mx-2 px-2 py-0.5 transition-colors ${
                        isActive
                          ? "bg-gradient-to-r from-[hsl(var(--gold))]/12 via-transparent to-transparent"
                          : ""
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 translate-y-[-0.3em] transition-colors ${
                          isActive ? "bg-[hsl(var(--gold))]" : "bg-transparent"
                        }`}
                      />
                      <span className="font-serif font-bold text-[1.55rem] md:text-[1.7rem] leading-[1.1] tracking-tight text-foreground group-hover:text-foreground/65 transition-colors">
                        {t(link.tKey)}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>

          {/* GROUP 2 — Propietarios (olive bleed section, distinct).
              `-mx-6 px-6` extends the tint to the full viewport width
              (cancels the parent's px-6) for a magazine-spread feel. */}
          <section className="mt-8 -mx-6 px-6 md:-mx-12 md:px-12 py-7 bg-[hsl(var(--olive))]/[0.07] border-y border-[hsl(var(--olive))]/20">
            <p
              className={`font-mono text-[10px] tracking-[0.3em] uppercase text-[hsl(var(--gold))] mb-4 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
              style={{ transitionDelay: isOpen ? "300ms" : "0ms" }}
            >
              — {t(navGroups[1].titleKey)}
            </p>
            <ul className="space-y-2.5">
              {navGroups[1].links.map((link, idx) => {
                const isActive = pathname === link.href
                const delay = 345 + idx * 45
                return (
                  <li
                    key={link.tKey}
                    className={`transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                    }`}
                    style={{ transitionDelay: isOpen ? `${delay}ms` : "0ms" }}
                  >
                    <Link
                      href={link.href}
                      onClick={handleNavTap(link.href)}
                      onPointerDown={(e) => ripple(e, "hsl(88 18% 32% / 0.18)")}
                      aria-current={isActive ? "page" : undefined}
                      className={`group relative overflow-hidden flex items-baseline gap-2.5 -mx-2 px-2 py-0.5 transition-colors ${
                        isActive
                          ? "bg-gradient-to-r from-[hsl(var(--olive))]/15 via-transparent to-transparent"
                          : ""
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 translate-y-[-0.3em] transition-colors ${
                          isActive ? "bg-[hsl(var(--olive))]" : "bg-transparent"
                        }`}
                      />
                      <span className="font-serif font-bold text-[1.55rem] md:text-[1.7rem] leading-[1.1] tracking-tight text-foreground group-hover:text-foreground/65 transition-colors">
                        {t(link.tKey)}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>

          {/* GROUP 3 — SEDA (utility tier, quieter).
              Smaller, font-medium serif, neutral eyebrow — reads as the
              support layer ("acerca de" + "ayuda") rather than a primary
              destination. */}
          <section className="mt-8">
            <p
              className={`font-mono text-[10px] tracking-[0.3em] uppercase text-[hsl(var(--gold))] mb-3 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
              style={{ transitionDelay: isOpen ? "440ms" : "0ms" }}
            >
              — {t(navGroups[2].titleKey)}
            </p>
            <ul className="space-y-1.5">
              {navGroups[2].links.map((link, idx) => {
                const isActive = pathname === link.href
                const delay = 485 + idx * 40
                return (
                  <li
                    key={link.tKey}
                    className={`transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                    }`}
                    style={{ transitionDelay: isOpen ? `${delay}ms` : "0ms" }}
                  >
                    <Link
                      href={link.href}
                      onClick={handleNavTap(link.href)}
                      onPointerDown={(e) => ripple(e, "hsl(36 8% 12% / 0.1)")}
                      aria-current={isActive ? "page" : undefined}
                      className={`group relative overflow-hidden flex items-baseline gap-2 -mx-2 px-2 py-0.5 transition-colors ${
                        isActive
                          ? "bg-gradient-to-r from-foreground/8 via-transparent to-transparent"
                          : ""
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`inline-block w-1 h-1 rounded-full shrink-0 translate-y-[-0.35em] transition-colors ${
                          isActive ? "bg-foreground" : "bg-transparent"
                        }`}
                      />
                      <span className="font-serif font-bold text-[1.55rem] md:text-[1.7rem] leading-[1.1] tracking-tight text-muted-foreground group-hover:text-foreground transition-colors">
                        {t(link.tKey)}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>

          {/* Footer block — pushed to the bottom by mt-auto without sticky.
              Animates in with a single block delay (after all items have
              landed). Secondary buttons upgraded from ghost-border to
              solid `bg-secondary` so they read as confident affordances
              rather than tertiary placeholders.
              Tightened to fit iPhone SE (375×667) without scroll. */}
          <div
            className={`mt-auto pt-5 border-t border-border space-y-2.5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
            style={{ transitionDelay: isOpen ? "560ms" : "0ms" }}
          >
            {/* Primary CTA — taller (py-5 → ~56px height), bigger label
                (text-[13px]), and font-semibold for stronger presence.
                Requires weight 600 loaded in JetBrains_Mono (see layout.tsx). */}
            <Link
              href={primaryCta.href}
              onClick={handleNavTap(primaryCta.href)}
              className="group flex items-center justify-between px-5 py-5 bg-foreground text-background font-mono font-semibold text-[13px] tracking-[0.22em] uppercase hover:bg-foreground/90 transition-colors"
            >
              <span>{primaryCta.label}</span>
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.75} />
            </Link>
            <div className="flex items-center gap-4 pt-1 font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
              <a
                href={GUEST_APP_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="hover:text-foreground transition-colors"
              >
                {t("nav.acceso_huespedes")}
              </a>
              <span aria-hidden className="text-border">·</span>
              <a
                href={OWNERS_PORTAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="hover:text-foreground transition-colors"
              >
                {t("nav.acceso_propietarios")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
