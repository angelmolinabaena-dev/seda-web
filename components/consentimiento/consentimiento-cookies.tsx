"use client"

import { useEffect, useId, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { Link } from "@/i18n/navigation"
import { capturarCarta } from "@/lib/carta-qr"
import {
  ControladorConsentimiento,
  ESTADO_INICIAL,
  mostrarAviso,
  type EstadoConsentimiento,
} from "@/lib/consentimiento-controlador"
import type { TextosConsentimiento } from "@/lib/consentimiento-textos"
import { ACTUALIZADO_CON_META } from "@/lib/legal/meta-version"
import { crearPixel, registrarPixelActual, type DocumentoMeta, type PixelMeta, type VentanaMeta } from "@/lib/meta-pixel-cliente"

/*
  Aviso de cookies + píxel de Meta con consentimiento.

  Este componente SOLO se monta si SEDA_FLAG_META_PIXEL está encendido
  (app/[locale]/layout.tsx). Apagado, no existe: ni aviso, ni script, ni
  estado.

  Qué hace, por capas:
    · Servidor / primer pintado: no pinta nada. El aviso aparece tras leer el
      almacenamiento del navegador (no se puede saber antes), y si ya hay una
      elección vigente no aparece nunca. `position: fixed`, sin empujar el
      contenido: no hay salto de maquetación.
    · Primera capa: «Aceptar», «Rechazar», «Configurar» — la MISMA clase CSS en
      los tres (mismo tamaño, borde, fondo y peso: guía de la AEPD, 2023).
    · Segunda capa («Configurar» o el enlace del pie): una sola casilla,
      «Marketing», sin marcar de antemano la primera vez.
    · Sin muro: nada bloquea la página ni se oculta tras el aviso.
    · PageView en cada página, solo con consentimiento de marketing vigente.

  La lógica (cuándo se activa el píxel, cuándo se borra _fbp/_fbc) está en
  lib/consentimiento-controlador.ts y lib/meta-pixel-cliente.ts, que se prueban
  sin navegador; aquí solo hay presentación.
*/

type Instancia = { controlador: ControladorConsentimiento; pixel: PixelMeta }
let instancia: Instancia | null = null

function obtenerInstancia(pixelId: string): Instancia {
  if (!instancia) {
    const pixel = crearPixel({
      id: pixelId,
      win: window as unknown as VentanaMeta,
      doc: document as unknown as DocumentoMeta,
      host: window.location.hostname,
    })
    const controlador = new ControladorConsentimiento({
      almacen: () => window.localStorage,
      pixel,
      version: ACTUALIZADO_CON_META,
    })
    instancia = { controlador, pixel }
  }
  return instancia
}

/** Para el enlace «Configurar cookies» del pie. */
export function abrirConfiguracionCookies(): void {
  instancia?.controlador.abrirPanel()
}

// Una sola clase para los tres botones de la primera capa: mismo peso visual. `w-full`
// dentro de una rejilla de columnas iguales: el mismo ancho también, sea cual sea la
// longitud de la etiqueta en cada idioma (Konfigurieren ≠ Accept).
export const CLASE_BOTON =
  "inline-flex w-full items-center justify-center border border-foreground bg-background px-6 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-foreground transition-colors hover:bg-foreground hover:text-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"

export function ConsentimientoCookies({ pixelId, textos }: { pixelId: string; textos: TextosConsentimiento }) {
  const [estado, setEstado] = useState<EstadoConsentimiento>(ESTADO_INICIAL)
  const pathname = usePathname()
  const ultimaRuta = useRef<string | null>(null)

  useEffect(() => {
    // El código de la carta (?carta=) sale de la URL ANTES de que el píxel cargue o haga PageView.
    capturarCarta()
    const { controlador, pixel } = obtenerInstancia(pixelId)
    registrarPixelActual({ pixel, marketing: () => controlador.marketingConcedido() })
    const baja = controlador.suscribir(() => setEstado(controlador.instantanea()))
    controlador.iniciar()
    return () => {
      baja()
      registrarPixelActual(null)
    }
  }, [pixelId])

  // PageView: al activarse y en cada cambio de ruta, solo con marketing concedido.
  useEffect(() => {
    if (!estado.marketing) {
      ultimaRuta.current = null
      return
    }
    if (ultimaRuta.current === pathname) return
    ultimaRuta.current = pathname
    capturarCarta()
    instancia?.pixel.pageView()
  }, [estado.marketing, pathname])

  const controlador = instancia?.controlador
  if (!controlador) return null

  if (estado.panelAbierto) return <Panel textos={textos} marketingInicial={estado.marketing} controlador={controlador} />
  if (mostrarAviso(estado)) return <Aviso textos={textos} controlador={controlador} />
  return null
}

export function Aviso({ textos, controlador }: { textos: TextosConsentimiento; controlador: ControladorConsentimiento }) {
  const titulo = useId()
  return (
    <section
      role="region"
      aria-label={textos.region}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background px-6 py-5 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] md:px-12 lg:px-20"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-10">
        <div className="max-w-3xl">
          <p id={titulo} className="mb-2 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            {textos.titulo}
          </p>
          <p className="text-[0.9rem] leading-relaxed text-foreground/85">
            {textos.cuerpo}{" "}
            <Link href="/cookies" className="underline underline-offset-4 decoration-foreground/40 hover:decoration-foreground">
              {textos.politica}
            </Link>
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:w-[34rem] md:shrink-0">
          <button type="button" className={CLASE_BOTON} onClick={() => controlador.aceptar()}>
            {textos.aceptar}
          </button>
          <button type="button" className={CLASE_BOTON} onClick={() => controlador.rechazar()}>
            {textos.rechazar}
          </button>
          <button type="button" className={CLASE_BOTON} onClick={() => controlador.abrirPanel()}>
            {textos.configurar}
          </button>
        </div>
      </div>
    </section>
  )
}

export function Panel({
  textos,
  marketingInicial,
  controlador,
}: {
  textos: TextosConsentimiento
  marketingInicial: boolean
  controlador: ControladorConsentimiento
}) {
  const titulo = useId()
  const casilla = useId()
  const cabecera = useRef<HTMLHeadingElement>(null)
  const [marketing, setMarketing] = useState(marketingInicial)
  const p = textos.panel

  useEffect(() => {
    cabecera.current?.focus()
    const alPulsar = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") controlador.cerrarPanel()
    }
    window.addEventListener("keydown", alPulsar)
    return () => window.removeEventListener("keydown", alPulsar)
  }, [controlador])

  return (
    <section
      role="dialog"
      aria-modal="false"
      aria-labelledby={titulo}
      className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto border-t border-border bg-background px-6 py-6 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] md:px-12 lg:px-20"
    >
      <div className="mx-auto max-w-3xl">
        <h2
          id={titulo}
          ref={cabecera}
          tabIndex={-1}
          className="font-serif text-xl font-light focus:outline-none"
        >
          {p.titulo}
        </h2>
        <p className="mt-2 text-[0.9rem] leading-relaxed text-muted-foreground">{p.intro}</p>

        <div className="mt-6 divide-y divide-border border-y border-border">
          <div className="py-4">
            <div className="flex items-baseline justify-between gap-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-foreground">{p.tecnicas.titulo}</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{p.tecnicas.estado}</p>
            </div>
            <p className="mt-2 text-[0.85rem] leading-relaxed text-muted-foreground">{p.tecnicas.descripcion}</p>
          </div>
          <div className="py-4">
            {/* Sin marcar de antemano: arranca en lo que el visitante eligió (false la primera vez). */}
            <label htmlFor={casilla} className="flex cursor-pointer items-start gap-3">
              <input
                id={casilla}
                type="checkbox"
                checked={marketing}
                onChange={(ev) => setMarketing(ev.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 accent-[hsl(var(--olive))]"
              />
              <span>
                <span className="block font-mono text-[11px] uppercase tracking-[0.22em] text-foreground">{p.marketing.titulo}</span>
                <span className="mt-2 block text-[0.85rem] leading-relaxed text-muted-foreground">{p.marketing.descripcion}</span>
              </span>
            </label>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:max-w-md sm:grid-cols-2">
          <button type="button" className={CLASE_BOTON} onClick={() => controlador.guardar(marketing)}>
            {p.guardar}
          </button>
          <button type="button" className={CLASE_BOTON} onClick={() => controlador.cerrarPanel()}>
            {p.cerrar}
          </button>
        </div>
        <p className="mt-4">
          <Link href="/cookies" className="text-[0.85rem] underline underline-offset-4 decoration-foreground/40 hover:decoration-foreground">
            {textos.politica}
          </Link>
        </p>
      </div>
    </section>
  )
}
