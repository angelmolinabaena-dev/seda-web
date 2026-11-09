"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { MessageCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import { initBotId } from "botid/client/core"
import { RUTAS_BOTID } from "@/lib/asistente/config"
import { capturarCarta, tomarCartaAsistente } from "@/lib/carta-qr"

/*
  Botón del asistente de propietarios (/propietarios, la calculadora, la portada y founding-owners).

  Solo se pinta si la página lo decide en el servidor con
  `asistentePropietariosActivo()` (SEDA_FLAG_ASISTENTE_PROPIETARIOS); sin el
  interruptor, este componente ni se incluye.

  Ligero a propósito: el panel, con el AI SDK, se descarga al pulsar el botón
  (next/dynamic), no al cargar la página.

  Carta del QR: en la calculadora, el código de ?carta= se lee al entrar
  (lib/carta-qr.ts) y el asistente recoge su copia en memoria para mandarla con
  la solicitud, sin quitársela al formulario de la calculadora.

  Vercel BotID (lib/asistente/bots.ts): se inicia aquí, y no en
  instrumentation-client.ts, para que solo lo carguen las páginas que tienen el
  asistente y solo con el interruptor encendido. Firma las peticiones a
  /api/asistente y /api/asistente/solicitud; en desarrollo no hace nada.
*/

/* BotID: `botIdIniciado` es del módulo, así que se inicia una sola vez por carga aunque cambie de página. */
let botIdIniciado = false

const AsistentePanel = dynamic(() => import("./asistente-panel"), { ssr: false })

/**
 * `portada`: la portada (y founding-owners) la ve gente que aún no sabe que el asistente es de propietarios:
 * el botón dice para quién es y se sube por encima del rótulo «Imagen ilustrativa» del hero.
 * `propietarios`: /propietarios y la calculadora, como hasta ahora.
 */
export type VarianteAsistente = "propietarios" | "portada"

export function AsistentePropietarios({ variante = "propietarios" }: { variante?: VarianteAsistente }) {
  const t = useTranslations("asistente")
  const portada = variante === "portada"
  const [abierto, setAbierto] = useState(false)
  const [cargado, setCargado] = useState(false)
  const boton = useRef<HTMLButtonElement>(null)
  const carta = useRef<string | null>(null)
  // Portada: mientras el hero está en pantalla, el botón se aparta si taparía algo: en móvil, los CTA del hero
  // (ocupan todo el ancho abajo) y, en cualquier ancho, el titular cuando el aviso de cookies empuja el botón hacia arriba.
  // Arranca oculto (también en el HTML del servidor) para no parpadear sobre los CTA antes de hidratar.
  const [apartado, setApartado] = useState(portada)

  useEffect(() => {
    if (!botIdIniciado) {
      botIdIniciado = true
      initBotId({ protect: RUTAS_BOTID })
    }
  }, [])

  useEffect(() => {
    if (!portada) return
    const hero = document.getElementById("hero")
    if (!hero || typeof IntersectionObserver === "undefined") {
      const id = requestAnimationFrame(() => setApartado(false)) // sin hero que vigilar: visible
      return () => cancelAnimationFrame(id)
    }
    let heroVisible = true
    const evaluar = () => {
      const bannerPx = parseFloat(document.documentElement.style.getPropertyValue("--banner-cookies-h")) || 0
      const movil = window.matchMedia("(max-width: 767px)").matches
      setApartado(heroVisible && (movil || bannerPx > 0))
    }
    const io = new IntersectionObserver(([e]) => {
      heroVisible = e.isIntersecting
      evaluar()
    })
    io.observe(hero)
    const mo = new MutationObserver(evaluar) // el aviso de cookies publica su altura en el estilo de <html>
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["style"] })
    window.addEventListener("resize", evaluar)
    return () => {
      io.disconnect()
      mo.disconnect()
      window.removeEventListener("resize", evaluar)
    }
  }, [portada])

  useEffect(() => {
    capturarCarta()
    const c = tomarCartaAsistente()
    if (c !== null) carta.current = c
  }, [])

  // Al cerrar, el foco vuelve al botón (que se vuelve a pintar en ese render).
  useEffect(() => {
    if (!abierto && cargado) boton.current?.focus()
  }, [abierto, cargado])

  const cerrar = () => setAbierto(false)

  return (
    <>
      {!abierto && (
        <button
          ref={boton}
          type="button"
          onClick={() => {
            setCargado(true)
            setAbierto(true)
          }}
          // Precarga del panel al acercarse al botón: abre sin espera.
          onPointerEnter={() => void import("./asistente-panel")}
          onFocus={() => void import("./asistente-panel")}
          aria-expanded={false}
          aria-controls="asistente-propietarios"
          aria-label={portada ? t("abrir_portada_aria") : undefined}
          data-asistente-boton={variante}
          // --banner-cookies-h: altura del aviso de cookies cuando está en pantalla (0 si no); el botón se sube sobre él.
          // En la portada, además, 3,5 rem más: el rótulo «Imagen ilustrativa» del hero ocupa la esquina inferior derecha.
          className={`fixed z-40 right-4 md:right-6 ${
            portada
              ? "bottom-[calc(max(1rem,env(safe-area-inset-bottom))+3.5rem+var(--banner-cookies-h,0px))] md:bottom-[calc(1.5rem+3rem+var(--banner-cookies-h,0px))]"
              : "bottom-[calc(max(1rem,env(safe-area-inset-bottom))+var(--banner-cookies-h,0px))] md:bottom-[calc(1.5rem+var(--banner-cookies-h,0px))]"
          } ${apartado ? "hidden" : "inline-flex"} items-center gap-2.5 pl-4 pr-5 py-3 rounded-full bg-[hsl(var(--olive))] text-background shadow-xl font-mono text-[10px] tracking-[0.2em] uppercase whitespace-nowrap hover:bg-[hsl(var(--olive))]/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--gold))] focus-visible:ring-offset-2`}
        >
          <MessageCircle className="h-4 w-4 text-[hsl(var(--gold-light))]" strokeWidth={1.75} aria-hidden />
          {portada ? t("abrir_portada") : t("abrir")}
        </button>
      )}
      {/* Una vez abierto, el panel sigue montado aunque se cierre: la conversación no se pierde al cerrarlo. */}
      {cargado && (
        <div hidden={!abierto}>
          <AsistentePanel carta={() => carta.current} abierto={abierto} onCerrar={cerrar} />
        </div>
      )}
    </>
  )
}
