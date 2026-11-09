"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { MessageCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import { iniciarBotIdUnaVez } from "@/lib/asistente/botid-cliente"
import { ANCHO_ESCRITORIO, ASISTENTE_ANCHO, ASISTENTE_SEPARACION } from "@/lib/dock-movil"
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
  asistente y solo con el interruptor encendido; y no al montar el botón sino la primera vez
  que la persona lo apunta, le da el foco o lo pulsa (lib/asistente/botid-cliente.ts): quien no
  toca el botón no carga nada de BotID. Firma las peticiones a /api/asistente y
  /api/asistente/solicitud; en desarrollo no hace nada.
*/

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
  // Portada, en escritorio (≥ 1.280 px): mientras el hero está en pantalla y el aviso de cookies está a la vista, el
  // botón se aparta (subiría hasta el titular). Arranca oculto (también en el HTML del servidor) para no parpadear.
  // Por debajo de 1.280 px el botón es un cuadrado junto al dock y nunca se aparta.
  const [apartado, setApartado] = useState(portada)

  // Deja sitio al botón junto al dock: el dock se estrecha ese ancho (+ la separación) por la derecha.
  useEffect(() => {
    const raiz = document.documentElement
    raiz.style.setProperty("--dock-asistente", `${ASISTENTE_ANCHO + ASISTENTE_SEPARACION}px`)
    return () => {
      raiz.style.removeProperty("--dock-asistente")
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
      setApartado(heroVisible && bannerPx > 0 && window.innerWidth >= ANCHO_ESCRITORIO)
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
            iniciarBotIdUnaVez()
            setCargado(true)
            setAbierto(true)
          }}
          // Precarga del panel al acercarse al botón: abre sin espera.
          onPointerEnter={() => {
            iniciarBotIdUnaVez()
            void import("./asistente-panel")
          }}
          onFocus={() => {
            iniciarBotIdUnaVez()
            void import("./asistente-panel")
          }}
          aria-expanded={false}
          aria-controls="asistente-propietarios"
          aria-label={portada ? t("abrir_portada_aria") : undefined}
          data-asistente-boton={variante}
          // < 1.280 px: cuadrado verde oliva de 64 × 66 junto al dock (a su derecha, misma altura, 8 px de separación),
          // solo con el icono; el nombre accesible sigue siendo el de siempre. ≥ 1.280 px: la píldora de siempre.
          // --banner-cookies-h: altura del aviso de cookies cuando está en pantalla (0 si no); el botón se sube sobre él.
          // En la portada (escritorio), además, 3 rem más: el rótulo «Imagen ilustrativa» del hero ocupa esa esquina.
          className={`fixed z-[46] right-3 bottom-[calc(14px+env(safe-area-inset-bottom)+var(--banner-cookies-h,0px))] h-[66px] w-16 items-center justify-center rounded-3xl bg-[#536043] text-background shadow-xl hover:bg-[#536043]/90 min-[1280px]:z-40 min-[1280px]:right-6 min-[1280px]:h-auto min-[1280px]:w-auto min-[1280px]:gap-2.5 min-[1280px]:rounded-full min-[1280px]:py-3 min-[1280px]:pl-4 min-[1280px]:pr-5 min-[1280px]:bg-[hsl(var(--olive))] min-[1280px]:hover:bg-[hsl(var(--olive))]/90 ${
            portada
              ? "min-[1280px]:bottom-[calc(1.5rem+3rem+var(--banner-cookies-h,0px))]"
              : "min-[1280px]:bottom-[calc(1.5rem+var(--banner-cookies-h,0px))]"
          } ${apartado ? "inline-flex min-[1280px]:hidden" : "inline-flex"} font-mono text-[10px] tracking-[0.2em] uppercase whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--gold))] focus-visible:ring-offset-2`}
        >
          <MessageCircle className="h-6 w-6 text-[hsl(var(--gold-light))] min-[1280px]:h-4 min-[1280px]:w-4" strokeWidth={1.75} aria-hidden />
          <span className="sr-only min-[1280px]:not-sr-only">{portada ? t("abrir_portada") : t("abrir")}</span>
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
