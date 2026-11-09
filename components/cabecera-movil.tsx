"use client"

import { useEffect, useId, useRef, useState } from "react"
import { ArrowUpRight, Building2, KeyRound, Lock, MessageCircle, Smartphone } from "lucide-react"
import { useTranslations } from "next-intl"
import { Link, usePathname } from "@/i18n/navigation"
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

/** «Reservar» (crema sobre la foto, tinta sobre la barra clara) → reserva; en páginas de propietarios, «Valorar» → propietarios. */
export function BotonReservar({ tipo, solido }: { tipo: TipoPagina; solido: boolean }) {
  const t = useTranslations()
  const r = reservaDe(tipo)
  return (
    <Link
      href={r.href}
      data-barra-reservar={r.clave}
      className={`inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-full px-3.5 text-[12px] font-semibold transition-colors duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2 md:h-11 md:px-5 ${
        solido ? "bg-foreground text-background hover:opacity-90" : "bg-background text-foreground hover:opacity-90"
      }`}
    >
      {t(`movil.${r.clave}`)}
    </Link>
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
        className={`inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current ${
          solido
            ? abierto
              ? "border-foreground/40 bg-foreground/[0.06] text-foreground"
              : "border-foreground/30 text-foreground"
            : abierto
              ? "border-background/50 bg-background/[0.1] text-background"
              : "border-background/35 text-background"
        }`}
      >
        <Lock className="h-3 w-3 shrink-0" strokeWidth={1.5} aria-hidden />
        {t("movil.portal")}
      </button>
      {abierto && (
        <div
          id={id}
          role="dialog"
          aria-label={t("movil.portal_aria")}
          data-portal-movil-panel
          className="absolute inset-x-2.5 top-[calc(60px+10px)] z-10 box-border rounded-[22px] border border-border bg-background p-2.5 text-foreground shadow-2xl md:hidden"
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
        className={`inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-full border px-4 font-mono text-[10px] uppercase tracking-[0.22em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current ${
          solido
            ? abierto
              ? "border-foreground/40 bg-foreground/[0.04] text-foreground"
              : "border-foreground/25 text-foreground hover:border-foreground/45 hover:bg-foreground/[0.04]"
            : abierto
              ? "border-background/40 bg-background/[0.06] text-background"
              : "border-background/25 text-background hover:border-background/45 hover:bg-background/[0.06]"
        }`}
      >
        <Lock className="h-3 w-3 shrink-0" strokeWidth={1.5} aria-hidden />
        {t("nav.portal")}
        <span className={`ml-0.5 inline-block text-[8px] opacity-70 transition-transform duration-200 ${abierto ? "rotate-180" : ""}`}>▼</span>
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
  const enlace = (href: string) => `block py-1 text-[0.95rem] leading-snug text-foreground transition-colors hover:text-foreground/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current ${pathname === href ? "font-semibold" : ""}`
  const eyebrow = "font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground"
  return (
    <div data-menu-movil className="flex h-full min-h-0 flex-col gap-3.5">
      {/* 1 · Los dos perfiles: Reservar (tinta) y Valorar mi propiedad (contorno) */}
      <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-2">
        <Link
          href={DESTINO_VIAJEROS}
          onClick={onNavegar(DESTINO_VIAJEROS)}
          className="inline-flex h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-foreground px-2.5 text-[0.82rem] font-semibold text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2"
        >
          {t("cta.reservar")} <span aria-hidden>→</span>
        </Link>
        <Link
          href={DESTINO_PROPIETARIOS}
          onClick={onNavegar(DESTINO_PROPIETARIOS)}
          className="inline-flex h-11 items-center justify-center whitespace-nowrap rounded-full border border-foreground/35 px-2.5 text-[0.82rem] font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
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
              <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                <Icono className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
                <span className="min-w-0 break-words">{etiqueta}</span>
              </span>
              <span className="break-words font-serif text-[1.15rem] font-medium leading-[1.05] text-foreground">{nombre}</span>
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

      {/* 4 · Navegación en dos columnas */}
      <div className="grid grid-cols-2 gap-x-6">
        {[huespedes, propietarios].map((g, i) => (
          <section key={g.titleKey} data-menu-grupo={i}>
            <p className={`${eyebrow} mb-1`}>{t(g.titleKey)}</p>
            <ul>
              {g.links.map((l) => (
                <li key={l.tKey}>
                  <Link href={l.href} onClick={onNavegar(l.href)} aria-current={pathname === l.href ? "page" : undefined} className={enlace(l.href)}>
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
        <p className={`${eyebrow} mb-1`}>— {t("movil.menu_seda")}</p>
        <ul className="flex flex-wrap gap-x-5 gap-y-0">
          {seda.links.map((l) => (
            <li key={l.tKey}>
              <Link href={l.href} onClick={onNavegar(l.href)} aria-current={pathname === l.href ? "page" : undefined} className={enlace(l.href)}>
                {t(l.tKey)}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 6 · Idiomas */}
      <div className="mt-auto border-t border-border pt-3">
        <LanguageSwitcher darkOnLight onAfterChange={cerrar} />
      </div>
    </div>
  )
}
