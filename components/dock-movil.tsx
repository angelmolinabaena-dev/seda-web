"use client"

import { useEffect, useId, useRef, useState } from "react"
import { ArrowUpRight, Building2, KeyRound, LayoutGrid, Lock, Menu, Smartphone, Sparkles, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { Link, usePathname } from "@/i18n/navigation"
import { LanguageSwitcher } from "@/components/language-switcher"
import {
  ANCHO_ESCRITORIO,
  CREMA_RGB,
  DOCK_ALFA_BORDE,
  DOCK_ALFA_ETIQUETA,
  DOCK_ALFA_RELLENO_ACTIVO,
  DOCK_ALTO,
  DOCK_BOTTOM_CSS,
  DOCK_RADIO,
  DOCK_SEPARACION_HOJA,
  DOCK_VELO_ALFA,
  DOCK_VELO_RGB,
  ORO_CLARO_HEX,
  SCRIM_RGBA,
  elementosDock,
  enlaceActivo,
  llamadaDock,
  type HojaDock,
} from "@/lib/dock-movil"
import { DESTINO_PROPIETARIOS, DESTINO_VIAJEROS, URL_GUEST_APP, URL_PORTAL_PROPIETARIO, type TipoPagina } from "@/lib/franja-cabecera"

/*
  Dock fijo abajo (< 1.280 px), propuesta C: los accesos al alcance del pulgar.

  · Móvil: Colección, Propietarios, Portal (hoja) y Menú (hoja). Tablet (≥ 768): suma Experiencias y,
    dentro del dock, la llamada de la página («Solicitar estancia» o «Valorar mi propiedad»).
  · Las dos hojas (Portal y Menú) son diálogos: role="dialog" aria-modal, con título; el foco entra al
    abrir y vuelve al botón del dock al cerrar; Escape y tocar el fondo oscurecido cierran; la página de
    detrás no hace scroll. El botón de la hoja abierta dice «Cerrar» con una X.
  · Capas: fondo oscurecido z-44 < hoja z-45 < dock y botón del asistente z-46 < cabecera y panel del
    asistente z-50. El dock se apoya sobre el aviso de cookies (--banner-cookies-h).
  · A 1.280 px o más no existe (`min-[1280px]:hidden`).
*/

const crema = (a: number) => `rgba(${CREMA_RGB.join(",")},${a})`
const ICONOS = { coleccion: LayoutGrid, experiencias: Sparkles, propietarios: Building2, portal: Lock, menu: Menu } as const
const BOTTOM_HOJA = `calc(${DOCK_BOTTOM_CSS} + ${DOCK_ALTO}px + ${DOCK_SEPARACION_HOJA}px)`
const MAX_ALTO_HOJA = `min(85dvh, calc(100dvh - ${BOTTOM_HOJA} - 6rem))`

type Grupo = { titleKey: string; links: { tKey: string; href: string }[] }

export function DockMovil({
  tipo,
  hoja,
  setHoja,
  grupos,
}: {
  tipo: TipoPagina
  hoja: HojaDock | null
  setHoja: (h: HojaDock | null) => void
  grupos: Grupo[]
}) {
  const t = useTranslations()
  const pathname = usePathname()
  const dock = useRef<HTMLElement>(null)
  const hojaRef = useRef<HTMLDivElement>(null)
  const anterior = useRef<HojaDock | null>(null)
  const [entrada, setEntrada] = useState(false)
  const idBase = useId()
  const llamada = llamadaDock(tipo)

  // Entrada: sube desde abajo (sin animación con prefers-reduced-motion: la clase lo anula).
  useEffect(() => {
    if (!hoja) return
    const id = requestAnimationFrame(() => setEntrada(true))
    return () => {
      cancelAnimationFrame(id)
      setEntrada(false)
    }
  }, [hoja])

  // El foco entra en la hoja al abrir y vuelve al botón del dock al cerrar.
  useEffect(() => {
    if (hoja) {
      const id = requestAnimationFrame(() => hojaRef.current?.focus())
      anterior.current = hoja
      return () => cancelAnimationFrame(id)
    }
    if (anterior.current) {
      dock.current?.querySelector<HTMLElement>(`[data-dock-item="${anterior.current}"]`)?.focus()
      anterior.current = null
    }
  }, [hoja])

  // Escape cierra; Tab no sale de la hoja y el dock; la página de detrás no hace scroll.
  useEffect(() => {
    if (!hoja) return
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        setHoja(null)
        return
      }
      if (e.key !== "Tab") return
      const foco = [...(hojaRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []), ...(dock.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? [])].filter(
        (el) => el.offsetParent !== null,
      )
      if (foco.length === 0) return
      const primero = foco[0]
      const ultimo = foco[foco.length - 1]
      if (e.shiftKey && (document.activeElement === primero || document.activeElement === hojaRef.current)) {
        e.preventDefault()
        ultimo.focus()
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault()
        primero.focus()
      }
    }
    document.addEventListener("keydown", alPulsar)
    const overflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", alPulsar)
      document.body.style.overflow = overflow
    }
  }, [hoja, setHoja])

  // Al pasar a escritorio (≥ 1.280 px) el dock desaparece: no puede quedar una hoja abierta.
  useEffect(() => {
    if (!hoja) return
    const mq = window.matchMedia(`(min-width: ${ANCHO_ESCRITORIO}px)`)
    const alCambiar = () => {
      if (mq.matches) setHoja(null)
    }
    mq.addEventListener("change", alCambiar)
    return () => mq.removeEventListener("change", alCambiar)
  }, [hoja, setHoja])

  const cerrar = () => setHoja(null)
  const idHoja = (h: HojaDock) => `${idBase}-hoja-${h}`

  return (
    <>
      {hoja && <div data-dock-scrim className="fixed inset-0 z-[44] min-[1280px]:hidden" style={{ background: SCRIM_RGBA }} onClick={cerrar} aria-hidden="true" />}

      {hoja && (
        <div
          ref={hojaRef}
          id={idHoja(hoja)}
          data-dock-hoja={hoja}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${idHoja(hoja)}-titulo`}
          tabIndex={-1}
          style={{ bottom: BOTTOM_HOJA, maxHeight: MAX_ALTO_HOJA }}
          className={`fixed inset-x-3 z-[45] overflow-y-auto overscroll-contain rounded-[28px] bg-background text-foreground shadow-2xl outline-none transition duration-300 ease-out motion-reduce:transition-none min-[1280px]:hidden md:inset-x-auto md:left-1/2 md:-translate-x-1/2 ${
            hoja === "menu" ? "md:w-[min(56rem,calc(100vw-24px))]" : "md:w-[min(34rem,calc(100vw-24px))]"
          } ${entrada ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100"}`}
        >
          <button type="button" onClick={cerrar} aria-label={t("dock.asa")} className="flex h-6 w-full items-center justify-center md:hidden">
            <span aria-hidden className="block h-1 w-[38px] rounded-full bg-foreground/25" />
          </button>
          {hoja === "portal" ? <HojaPortal idTitulo={`${idHoja(hoja)}-titulo`} cerrar={cerrar} /> : <HojaMenu idTitulo={`${idHoja(hoja)}-titulo`} grupos={grupos} cerrar={cerrar} />}
        </div>
      )}

      <nav
        ref={dock}
        data-dock
        aria-label={t("dock.aria")}
        style={{
          bottom: DOCK_BOTTOM_CSS,
          height: DOCK_ALTO,
          borderRadius: DOCK_RADIO,
          background: `rgba(${DOCK_VELO_RGB.join(",")},${DOCK_VELO_ALFA})`,
          backdropFilter: "blur(16px) saturate(140%)",
          WebkitBackdropFilter: "blur(16px) saturate(140%)",
          border: `1px solid ${crema(DOCK_ALFA_BORDE)}`,
          boxShadow: "0 10px 30px rgba(20,16,14,0.28)",
        }}
        className="fixed left-3 right-[calc(12px+var(--dock-asistente,0px))] z-[46] flex items-center gap-0.5 p-1.5 min-[1280px]:hidden md:left-1/2 md:right-auto md:w-max md:max-w-[calc(100vw-24px-2*var(--dock-asistente,0px))] md:-translate-x-1/2"
      >
        {elementosDock().map((el) => {
          const Icono = ICONOS[el.clave]
          const etiqueta = t(`dock.${el.clave}`)
          const solo = el.tipo === "enlace" && el.solo === "tablet" ? "hidden md:flex" : "flex"
          const base = `${solo} h-[54px] min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[18px] px-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ebd4ad] md:w-[4.5rem] md:flex-none`
          if (el.tipo === "enlace") {
            const activo = enlaceActivo(el.href, pathname)
            return (
              <Link
                key={el.clave}
                href={el.href}
                data-dock-item={el.clave}
                aria-current={activo ? "page" : undefined}
                onClick={cerrar}
                className={base}
                style={{ color: activo ? ORO_CLARO_HEX : crema(DOCK_ALFA_ETIQUETA), background: activo ? crema(DOCK_ALFA_RELLENO_ACTIVO) : undefined }}
              >
                <Icono className="h-[22px] w-[22px] shrink-0" strokeWidth={1.5} aria-hidden />
                <Etiqueta>{etiqueta}</Etiqueta>
              </Link>
            )
          }
          const abierta = hoja === el.clave
          return (
            <button
              key={el.clave}
              type="button"
              data-dock-item={el.clave}
              aria-expanded={abierta}
              aria-controls={idHoja(el.clave)}
              aria-haspopup="dialog"
              onClick={() => setHoja(abierta ? null : el.clave)}
              className={base}
              style={{ color: abierta ? ORO_CLARO_HEX : crema(DOCK_ALFA_ETIQUETA), background: abierta ? crema(DOCK_ALFA_RELLENO_ACTIVO) : undefined }}
            >
              {abierta ? <X className="h-[22px] w-[22px] shrink-0" strokeWidth={1.5} aria-hidden /> : <Icono className="h-[22px] w-[22px] shrink-0" strokeWidth={1.5} aria-hidden />}
              <Etiqueta>{abierta ? t("dock.cerrar") : etiqueta}</Etiqueta>
            </button>
          )
        })}
        <Link
          href={llamada.href}
          data-dock-llamada
          onClick={cerrar}
          className="ml-1 hidden h-[54px] shrink-0 items-center justify-center whitespace-nowrap rounded-[18px] bg-background px-5 text-[12px] font-semibold text-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ebd4ad] md:inline-flex"
        >
          {t(`cta.${llamada.clave}`)}
        </Link>
      </nav>
    </>
  )
}

/** Etiqueta de 10 px seminegrita (9 px por debajo de 380 px: nunca puntos suspensivos). */
function Etiqueta({ children }: { children: React.ReactNode }) {
  return <span className="block max-w-full whitespace-nowrap text-[9px] font-semibold leading-none min-[380px]:text-[10px]">{children}</span>
}

function HojaPortal({ idTitulo, cerrar }: { idTitulo: string; cerrar: () => void }) {
  const t = useTranslations()
  const tarjetas = [
    { clave: "huespedes", Icono: Smartphone, etiqueta: t("dock.huespedes_etiqueta"), nombre: t("dock.huespedes_nombre"), linea: t("franja.huespedes_linea"), href: URL_GUEST_APP },
    { clave: "propietarios", Icono: KeyRound, etiqueta: t("dock.propietarios_etiqueta"), nombre: t("dock.propietarios_nombre"), linea: t("franja.propietarios_linea"), href: URL_PORTAL_PROPIETARIO },
  ]
  return (
    <div className="px-5 pb-5 pt-1 md:pt-5">
      <h2 id={idTitulo} className="font-serif text-[1.9rem] font-light leading-none tracking-tight">
        {t("dock.portal_titulo")}
      </h2>
      <p className="mt-2 text-[0.9rem] leading-snug text-muted-foreground">{t("dock.portal_texto")}</p>
      <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-2.5">
        {tarjetas.map(({ clave, Icono, etiqueta, nombre, linea, href }) => (
          <a
            key={clave}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            data-dock-portal-tarjeta={clave}
            className="box-border flex w-full min-w-0 items-center gap-3.5 rounded-2xl border border-border px-4 py-3.5 transition-colors hover:border-foreground/30 hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground">
              <Icono className="h-5 w-5" strokeWidth={1.5} aria-hidden />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5 break-words">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{etiqueta}</span>
              <span className="text-[0.95rem] font-semibold leading-tight text-foreground">{nombre}</span>
              <span className="text-[0.8rem] leading-snug text-muted-foreground">{linea}</span>
            </span>
            <span className="shrink-0 text-[0.8rem] font-semibold text-foreground">
              {t("franja.entrar")} <span aria-hidden>→</span>
            </span>
          </a>
        ))}
      </div>
      <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.85rem] text-muted-foreground">
        <span>{t("dock.aun_no_cliente")}</span>
        <Link href={DESTINO_VIAJEROS} onClick={cerrar} className="font-semibold text-foreground underline underline-offset-4">
          {t("cta.solicitar_estancia")}
        </Link>
        <span aria-hidden>·</span>
        <Link href={DESTINO_PROPIETARIOS} onClick={cerrar} className="font-semibold text-foreground underline underline-offset-4">
          {t("cta.valorar_propiedad")}
        </Link>
      </p>
    </div>
  )
}

function HojaMenu({ idTitulo, grupos, cerrar }: { idTitulo: string; grupos: Grupo[]; cerrar: () => void }) {
  const t = useTranslations()
  const pathname = usePathname()
  const clase = "block py-1.5 text-[1.05rem] leading-snug text-foreground hover:text-foreground/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
  return (
    <div className="px-5 pb-5 pt-1 md:pt-5">
      <h2 id={idTitulo} className="font-serif text-[1.9rem] font-light leading-none tracking-tight">
        {t("dock.menu_titulo")}
      </h2>
      <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-x-8 gap-y-5 md:grid-cols-3">
        {grupos.map((g, i) => (
          <section key={g.titleKey} data-dock-menu-grupo={i}>
            <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{t(g.titleKey)}</p>
            <ul>
              {g.links.map((l) => (
                <li key={l.tKey}>
                  <Link href={l.href} onClick={cerrar} aria-current={pathname === l.href ? "page" : undefined} className={clase}>
                    {t(l.tKey)}
                  </Link>
                </li>
              ))}
              {i === 1 && (
                <li>
                  <a href={URL_PORTAL_PROPIETARIO} target="_blank" rel="noopener noreferrer" className={`${clase} inline-flex items-center gap-1.5`}>
                    {t("dock.portal_propietario")}
                    <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                  </a>
                </li>
              )}
            </ul>
          </section>
        ))}
      </div>
      <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 md:flex-row md:items-center md:justify-between">
        <LanguageSwitcher darkOnLight onAfterChange={cerrar} />
        <div className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-2 md:flex">
          <Link href={DESTINO_PROPIETARIOS} onClick={cerrar} className="inline-flex min-h-[44px] items-center justify-center whitespace-nowrap rounded-full border border-foreground/30 px-5 text-[0.8rem] font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current">
            {t("cta.valorar_propiedad")}
          </Link>
          <Link href={DESTINO_VIAJEROS} onClick={cerrar} className="inline-flex min-h-[44px] items-center justify-center whitespace-nowrap rounded-full bg-foreground px-5 text-[0.8rem] font-semibold text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2">
            {t("cta.solicitar_estancia")}
          </Link>
        </div>
      </div>
    </div>
  )
}
