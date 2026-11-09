"use client"

import { useCallback, useEffect, useId, useRef, useState, useTransition } from "react"
import { ArrowUpRight, Building2, ChevronDown, KeyRound, MessageCircle, Smartphone } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { Link, usePathname, useRouter } from "@/i18n/navigation"
import { routing, type Locale } from "@/i18n/routing"
import { LanguageSwitcher } from "@/components/language-switcher"
import { TarjetasPortal } from "@/components/cabecera-franja"
import { abrirAsistente, useAsistenteMontado } from "@/lib/asistente/montaje"
import { reservaDe } from "@/lib/cabecera-movil"
import { DESTINO_PROPIETARIOS, DESTINO_VIAJEROS, URL_GUEST_APP, URL_PORTAL_PROPIETARIO, type TipoPagina } from "@/lib/franja-cabecera"

/*
  Cabecera de móvil y de tablet (< 1.280 px, propuesta A2). Ver lib/cabecera-movil.ts.
  Todo lo de aquí vive en la barra de arriba o en el menú; en escritorio no existe.
*/

const OLIVA = "#536043"

/**
 * Llamadas de atención de la barra (31e). Al cargar, el CSS corre `alCargar` repeticiones (`--pulsos`); después, `disparar()`
 * las reinicia con 1 repetición (sin volver a montar nada: así no se pierde un clic). Se llama al volver arriba del todo
 * tras haber bajado más de 200 px, y desde los manejadores de ratón y foco. El elemento con `ref` lleva `--pulsos`; los
 * elementos animados llevan `data-anima`.
 */
function usePulso<T extends HTMLElement>(alCargar: number) {
  const ref = useRef<T>(null)
  const disparar = useCallback(() => {
    const raiz = ref.current
    if (!raiz) return
    raiz.style.setProperty("--pulsos", "1")
    const animados = [raiz, ...Array.from(raiz.querySelectorAll<HTMLElement | SVGElement>("[data-anima]"))].filter((e) => e.hasAttribute("data-anima"))
    for (const e of animados) e.style.animation = "none"
    void raiz.offsetWidth // reflujo: el navegador ve «sin animación» antes de que vuelva la de la hoja de estilos
    for (const e of animados) e.style.animation = ""
  }, [])
  useEffect(() => {
    let bajo = window.scrollY > 200
    const alDesplazar = () => {
      const y = window.scrollY
      if (y > 200) bajo = true
      else if (y <= 2 && bajo) {
        bajo = false
        disparar()
      }
    }
    window.addEventListener("scroll", alDesplazar, { passive: true })
    return () => window.removeEventListener("scroll", alDesplazar)
  }, [disparar])
  return { ref, disparar, alCargar }
}

/** «Reservar» (crema sobre la foto, tinta sobre la barra clara) → reserva; en páginas de propietarios, «Valorar» → propietarios. Halo dorado. */
export function BotonReservar({ tipo, solido }: { tipo: TipoPagina; solido: boolean }) {
  const t = useTranslations()
  const r = reservaDe(tipo)
  const { ref, disparar, alCargar } = usePulso<HTMLSpanElement>(3)
  return (
    <Link
      href={r.href}
      data-barra-reservar={r.clave}
      onMouseEnter={disparar}
      onFocus={disparar}
      className={`reservar-halo inline-flex h-[38px] shrink-0 items-center justify-center whitespace-nowrap rounded-full px-[18px] text-[13.5px] font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2 ${
        solido ? "bg-foreground text-background hover:opacity-90" : "bg-background text-foreground hover:opacity-90"
      }`}
    >
      <span ref={ref} aria-hidden data-halo-reservar data-anima className="halo-reservar" style={{ "--pulsos": alCargar } as React.CSSProperties} />
      {t(`movil.${r.clave}`)}
    </Link>
  )
}

/** Candado que se abre y línea dorada que se dibuja bajo el texto, a la vez; y la flecha ▾ que solo gira con el panel abierto. */
function ContenidoPortal({ texto, abierto, ref, alCargar }: { texto: string; abierto: boolean; ref: React.Ref<HTMLSpanElement>; alCargar: number }) {
  return (
    <>
      <span ref={ref} data-portal-secuencia className="portal-contenido" style={{ "--pulsos": alCargar } as React.CSSProperties}>
        <svg viewBox="0 0 24 24" className="portal-candado h-[13px] w-[13px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path className="portal-arco" data-anima d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span className="portal-texto">
          {texto}
          <span aria-hidden data-portal-linea data-anima className="portal-linea" />
        </span>
      </span>
      <span aria-hidden className="inline-flex">
        <ChevronDown data-flecha-portal data-abierta={abierto ? "si" : "no"} className={`flecha-portal-giro h-2.5 w-2.5 transition-transform duration-200 ${abierto ? "rotate-180" : ""}`} strokeWidth={2} />
      </span>
    </>
  )
}

/** Las dos tarjetas horizontales (icono, etiqueta, nombre y una línea) del panel de Portal del móvil. */
function TarjetaAcceso({ clave, href, Icono, etiqueta, nombre, linea, entrar }: { clave: string; href: string; Icono: typeof Smartphone; etiqueta: string; nombre: string; linea: string; entrar: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-portal-movil-tarjeta={clave}
      className="box-border flex w-full min-w-0 items-center gap-3 rounded-2xl border border-border px-3.5 py-3 transition-colors hover:border-foreground/30 hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground">
        <Icono className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 break-words">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{etiqueta}</span>
        <span className="text-[0.9rem] font-semibold leading-tight text-foreground">{nombre}</span>
        <span className="text-[0.75rem] leading-snug text-muted-foreground">{linea}</span>
      </span>
      <span className="shrink-0 text-[0.75rem] font-semibold text-foreground">
        {entrar} <span aria-hidden>→</span>
      </span>
    </a>
  )
}

/**
 * «Portal» de la barra del móvil: botón de contorno con candado que abre, bajo la barra y a 10 px de cada lado,
 * un panel crema con las dos tarjetas. Escape, tocar fuera o el mismo botón lo cierran. El estado vive en la
 * cabecera (el menú y el panel no pueden estar abiertos a la vez, y el asistente se oculta con cualquiera de los dos).
 */
export function PortalMovil({ abierto, setAbierto, solido }: { abierto: boolean; setAbierto: (v: boolean) => void; solido: boolean }) {
  const t = useTranslations()
  const raiz = useRef<HTMLDivElement>(null)
  const boton = useRef<HTMLButtonElement>(null)
  const id = useId()
  const { ref: refPulso, disparar, alCargar } = usePulso<HTMLSpanElement>(2)

  useEffect(() => {
    if (!abierto) return
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAbierto(false)
        boton.current?.focus()
      }
    }
    const alTocar = (e: Event) => {
      if (!raiz.current?.contains(e.target as Node)) setAbierto(false)
    }
    document.addEventListener("keydown", alPulsar)
    document.addEventListener("pointerdown", alTocar)
    return () => {
      document.removeEventListener("keydown", alPulsar)
      document.removeEventListener("pointerdown", alTocar)
    }
  }, [abierto, setAbierto])

  return (
    <div ref={raiz} data-portal-movil>
      <button
        ref={boton}
        type="button"
        onClick={() => setAbierto(!abierto)}
        aria-expanded={abierto}
        aria-controls={id}
        aria-haspopup="dialog"
        onMouseEnter={disparar}
        onFocus={disparar}
        className={`boton-portal inline-flex h-11 shrink-0 items-center gap-1 whitespace-nowrap rounded-sm px-1.5 font-mono text-[10px] uppercase tracking-[0.18em] opacity-90 transition-colors duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current ${
          solido ? "text-foreground" : "text-background"
        }`}
      >
        <ContenidoPortal texto={t("movil.portal")} abierto={abierto} ref={refPulso} alCargar={alCargar} />
      </button>
      {abierto && (
        <div
          id={id}
          role="dialog"
          aria-label={t("movil.portal_aria")}
          data-portal-movil-panel
          className="absolute inset-x-2.5 top-[calc(56px+10px)] z-10 box-border rounded-[22px] border border-border bg-background p-2.5 text-foreground shadow-2xl md:hidden"
        >
          <div className="grid grid-cols-[minmax(0,1fr)] gap-2">
            <TarjetaAcceso clave="huespedes" href={URL_GUEST_APP} Icono={Smartphone} etiqueta={t("movil.huespedes_etiqueta")} nombre={t("movil.huespedes_nombre")} linea={t("franja.huespedes_linea")} entrar={t("franja.entrar")} />
            <TarjetaAcceso clave="propietarios" href={URL_PORTAL_PROPIETARIO} Icono={KeyRound} etiqueta={t("movil.propietarios_etiqueta")} nombre={t("movil.propietarios_nombre")} linea={t("franja.propietarios_linea")} entrar={t("franja.entrar")} />
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Tablet: los mismos desplegables que el escritorio, con estado propio, dentro de la ventana ── */

const sedaOsItems = [
  { tKey: "nav.guestapp", href: "/guestapp" },
  { tKey: "nav.ecosistema", href: "/ecosistema" },
  { tKey: "nav.propietarios", href: "/propietarios" },
]

export function SedaOsMenu({ solido }: { solido: boolean }) {
  const t = useTranslations()
  const pathname = usePathname()
  const [abierto, setAbierto] = useState(false)
  const raiz = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!abierto) return
    const alPulsar = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false)
    const alTocar = (e: Event) => !raiz.current?.contains(e.target as Node) && setAbierto(false)
    document.addEventListener("keydown", alPulsar)
    document.addEventListener("pointerdown", alTocar)
    return () => {
      document.removeEventListener("keydown", alPulsar)
      document.removeEventListener("pointerdown", alTocar)
    }
  }, [abierto])
  return (
    <div ref={raiz} className="relative" data-tablet-sedaos>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={abierto}
        className={`inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-sm font-mono text-[11px] uppercase tracking-[0.18em] transition-colors duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current ${
          solido ? (abierto ? "text-foreground" : "text-muted-foreground hover:text-foreground") : abierto ? "text-background" : "text-background/85 hover:text-background"
        }`}
      >
        {t("nav.seda_os")}
        <span className={`inline-block text-[8px] opacity-70 transition-transform duration-200 ${abierto ? "rotate-180" : ""}`}>▼</span>
      </button>
      <div role="menu" className={`absolute left-0 top-full z-10 min-w-[220px] pt-2 transition-all duration-200 ${abierto ? "visible opacity-100" : "pointer-events-none invisible opacity-0"}`}>
        <div className="border border-border bg-background py-2 shadow-xl">
          {sedaOsItems.map((item) => {
            const activo = pathname === item.href
            return (
              <Link
                key={item.tKey}
                href={item.href}
                role="menuitem"
                onClick={() => setAbierto(false)}
                className={`flex items-center justify-between gap-3 whitespace-nowrap px-5 py-3 font-mono text-[10px] uppercase tracking-[0.22em] transition-colors ${
                  activo ? "bg-secondary/60 text-foreground" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                }`}
              >
                {t(item.tKey)}
                {activo && <span className="h-1 w-1 shrink-0 rounded-full bg-[hsl(var(--gold))]" />}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function PortalMenu({ solido }: { solido: boolean }) {
  const t = useTranslations()
  const [abierto, setAbierto] = useState(false)
  const raiz = useRef<HTMLDivElement>(null)
  const { ref: refPulso, disparar, alCargar } = usePulso<HTMLSpanElement>(2)
  useEffect(() => {
    if (!abierto) return
    const alPulsar = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false)
    const alTocar = (e: Event) => !raiz.current?.contains(e.target as Node) && setAbierto(false)
    document.addEventListener("keydown", alPulsar)
    document.addEventListener("pointerdown", alTocar)
    return () => {
      document.removeEventListener("keydown", alPulsar)
      document.removeEventListener("pointerdown", alTocar)
    }
  }, [abierto])
  return (
    <div ref={raiz} className="relative" data-tablet-portal>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={abierto}
        onMouseEnter={disparar}
        onFocus={disparar}
        className={`boton-portal inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-sm px-1 font-mono text-[10px] uppercase tracking-[0.18em] opacity-90 transition-colors duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current ${
          solido ? "text-foreground" : "text-background"
        }`}
      >
        <ContenidoPortal texto={t("nav.portal")} abierto={abierto} ref={refPulso} alCargar={alCargar} />
      </button>
      <div role="menu" className={`absolute right-0 top-full z-10 w-[22rem] max-w-[calc(100vw-2rem)] whitespace-normal pt-2 transition-all duration-200 ${abierto ? "visible opacity-100" : "pointer-events-none invisible opacity-0"}`}>
        <div data-portal-panel className="box-border w-full border border-border bg-background shadow-xl">
          <TarjetasPortal />
        </div>
      </div>
    </div>
  )
}

/* ── El menú del móvil (la hoja crema), ordenado para que quepa en una pantalla a 390 × 844 ── */

type Grupo = { titleKey: string; links: { tKey: string; href: string }[] }

export function MenuMovil({ grupos, cerrar, onNavegar }: { grupos: Grupo[]; cerrar: () => void; onNavegar: (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => void }) {
  const t = useTranslations()
  const pathname = usePathname()
  const asistente = useAsistenteMontado()
  const [huespedes, propietarios, seda] = grupos
  const enlaceGrande = (href: string) => `flex h-12 items-center break-words font-serif text-[30px] leading-none text-foreground transition-colors hover:text-foreground/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current ${pathname === href ? "font-semibold" : "font-medium"}`
  const enlace = (href: string) => `block py-1 text-[17px] leading-snug text-foreground transition-colors hover:text-foreground/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current ${pathname === href ? "font-semibold" : ""}`
  const eyebrow = "font-mono text-[11px] uppercase tracking-[0.26em] text-muted-foreground"
  return (
    // Alto completo de la hoja, con el contenido repartido en vertical (los idiomas quedan pegados abajo);
    // en pantallas más bajas crece y la hoja desplaza.
    <div data-menu-movil className="flex min-h-full flex-col justify-between gap-4">
      {/* 1 · Los dos perfiles: Reservar (tinta) y Valorar mi propiedad (contorno) */}
      <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-2">
        <Link
          href={DESTINO_VIAJEROS}
          onClick={onNavegar(DESTINO_VIAJEROS)}
          data-menu-cta="reservar"
          className="inline-flex h-14 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-foreground px-2.5 text-[15px] font-semibold text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2"
        >
          {t("cta.reservar")} <span aria-hidden>→</span>
        </Link>
        <Link
          href={DESTINO_PROPIETARIOS}
          onClick={onNavegar(DESTINO_PROPIETARIOS)}
          data-menu-cta="valorar"
          className="inline-flex h-14 items-center justify-center rounded-full border border-foreground/35 px-3 text-center text-[15px] font-semibold leading-tight text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
        >
          {t("cta.valorar_propiedad")}
        </Link>
      </div>

      {/* 2 · Portal: dos tarjetas en dos columnas */}
      <section data-menu-portal>
        <p className={`${eyebrow} mb-2`}>— {t("movil.portal_seccion")}</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { clave: "huespedes", href: URL_GUEST_APP, Icono: Smartphone, etiqueta: t("movil.huespedes_etiqueta"), nombre: t("movil.huespedes_nombre") },
            { clave: "propietarios", href: URL_PORTAL_PROPIETARIO, Icono: Building2, etiqueta: t("movil.propietarios_etiqueta"), nombre: t("movil.propietarios_nombre") },
          ].map(({ clave, href, Icono, etiqueta, nombre }) => (
            <a
              key={clave}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={cerrar}
              data-menu-portal-tarjeta={clave}
              className="box-border flex min-w-0 flex-col gap-1 rounded-2xl border border-border px-3 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
            >
              <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                <Icono className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
                <span className="min-w-0 break-words">{etiqueta}</span>
              </span>
              <span data-menu-portal-nombre className="break-words font-serif text-[24px] font-medium leading-[1.05] text-foreground">{nombre}</span>
              <span className="text-[0.72rem] font-semibold text-foreground">
                {t("franja.entrar")} <span aria-hidden>→</span>
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* 3 · El asistente, donde está montado */}
      {asistente && (
        <button
          type="button"
          data-menu-asistente
          onClick={() => {
            cerrar()
            // Tras cerrar el menú, el asistente se abre (en el siguiente fotograma, con el menú ya fuera).
            requestAnimationFrame(() => abrirAsistente())
          }}
          className="flex h-12 w-full items-center gap-3 rounded-2xl px-4 text-left text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2"
          style={{ background: OLIVA }}
        >
          <MessageCircle className="h-5 w-5 shrink-0 text-[hsl(var(--gold-light))]" strokeWidth={1.75} aria-hidden />
          <span className="min-w-0 flex-1 text-[0.85rem] font-semibold leading-tight">
            {t("movil.asistente_titulo")} <span className="font-normal opacity-90">· {t("movil.asistente_texto")}</span>
          </span>
          <ArrowUpRight className="h-4 w-4 shrink-0 opacity-80" strokeWidth={1.75} aria-hidden />
        </button>
      )}

      {/* 4 · Navegación: Huéspedes y Propietarios, una columna cada uno */}
      <div className="flex flex-col gap-3">
        {[huespedes, propietarios].map((g, i) => (
          <section key={g.titleKey} data-menu-grupo={i}>
            <p data-menu-etiqueta className={`${eyebrow} mb-0.5`}>{t(g.titleKey)}</p>
            <ul>
              {g.links.map((l) => (
                <li key={l.tKey}>
                  <Link href={l.href} onClick={onNavegar(l.href)} data-menu-enlace-grande aria-current={pathname === l.href ? "page" : undefined} className={enlaceGrande(l.href)}>
                    {t(l.tKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {/* 5 · SEDA */}
      <section data-menu-grupo="seda">
        <p className={`${eyebrow} mb-0.5`}>— {t("movil.menu_seda")}</p>
        <ul className="flex flex-wrap gap-x-5 gap-y-0">
          {seda.links.map((l) => (
            <li key={l.tKey}>
              <Link href={l.href} onClick={onNavegar(l.href)} data-menu-enlace-seda aria-current={pathname === l.href ? "page" : undefined} className={enlace(l.href)}>
                {t(l.tKey)}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 6 · Idiomas */}
      <div className="border-t border-border pt-3" data-menu-idiomas>
        <LanguageSwitcher darkOnLight onAfterChange={cerrar} />
      </div>
    </div>
  )
}

/* ── Idioma compacto «ES ▾» de la barra (< 1.280 px): abre ES / EN / FR / DE. Misma ruta, otro idioma. ── */

export function SelectorIdiomaCompacto({ solido }: { solido: boolean }) {
  const locale = useLocale() as Locale
  const t = useTranslations()
  const router = useRouter()
  const pathname = usePathname()
  const [abierto, setAbierto] = useState(false)
  const [, startTransition] = useTransition()
  const raiz = useRef<HTMLDivElement>(null)
  const boton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!abierto) return
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAbierto(false)
        boton.current?.focus()
      }
    }
    const alTocar = (e: Event) => !raiz.current?.contains(e.target as Node) && setAbierto(false)
    document.addEventListener("keydown", alPulsar)
    document.addEventListener("pointerdown", alTocar)
    return () => {
      document.removeEventListener("keydown", alPulsar)
      document.removeEventListener("pointerdown", alTocar)
    }
  }, [abierto])

  const cambiar = (next: Locale) => {
    setAbierto(false)
    if (next === locale) return
    startTransition(() => router.replace(pathname, { locale: next }))
  }

  return (
    <div ref={raiz} className="relative" data-idioma-compacto>
      <button
        ref={boton}
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={abierto}
        aria-label={t("movil.idioma_actual", { idioma: locale.toUpperCase() })}
        className={`inline-flex h-11 shrink-0 items-center gap-0.5 rounded-sm px-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current ${
          solido ? "text-foreground" : "text-background"
        }`}
      >
        {locale}
        <ChevronDown className={`h-2.5 w-2.5 transition-transform ${abierto ? "rotate-180" : ""}`} strokeWidth={2} aria-hidden />
      </button>
      {abierto && (
        <div role="menu" aria-label={t("movil.idioma")} className="absolute left-1/2 top-full z-10 mt-2 w-24 -translate-x-1/2 border border-border bg-background py-1 text-foreground shadow-xl">
          {routing.locales.map((l) => (
            <button
              key={l}
              type="button"
              role="menuitem"
              onClick={() => cambiar(l)}
              aria-current={l === locale ? "true" : undefined}
              className={`block w-full px-4 py-2.5 text-left font-mono text-[11px] uppercase tracking-[0.2em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-current ${
                l === locale ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Botón del menú: solo el icono (44 × 44, sin borde). Es el mismo botón en los dos estados: las dos líneas giran ±45° y
 * se cruzan en una X al abrir (250 ms) y vuelven al cerrar; `aria-expanded` y `aria-label` van al día.
 */
export function BotonMenu({ abierto, solido, onClick }: { abierto: boolean; solido: boolean; onClick: () => void }) {
  const t = useTranslations()
  return (
    <button
      type="button"
      onClick={onClick}
      data-boton-menu
      aria-label={abierto ? t("nav.close_menu") : t("nav.open_menu")}
      aria-expanded={abierto}
      className={`boton-menu inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm transition-colors duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current ${
        solido || abierto ? "text-foreground" : "text-background"
      }`}
    >
      <svg viewBox="0 0 20 20" className="menu-icono h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
        <line className="menu-linea-1" x1="3" y1="7" x2="17" y2="7" />
        <line className="menu-linea-2" x1="3" y1="13" x2="17" y2="13" />
      </svg>
    </button>
  )
}
