"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { MessageCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import { capturarCarta, tomarCartaAsistente } from "@/lib/carta-qr"

/*
  Botón del asistente de propietarios (/propietarios y la calculadora).

  Solo se pinta si la página lo decide en el servidor con
  `asistentePropietariosActivo()` (SEDA_FLAG_ASISTENTE_PROPIETARIOS); sin el
  interruptor, este componente ni se incluye.

  Ligero a propósito: el panel, con el AI SDK, se descarga al pulsar el botón
  (next/dynamic), no al cargar la página.

  Carta del QR: en la calculadora, el código de ?carta= se lee al entrar
  (lib/carta-qr.ts) y el asistente recoge su copia en memoria para mandarla con
  la solicitud, sin quitársela al formulario de la calculadora.
*/

const AsistentePanel = dynamic(() => import("./asistente-panel"), { ssr: false })

export function AsistentePropietarios() {
  const t = useTranslations("asistente")
  const [abierto, setAbierto] = useState(false)
  const [cargado, setCargado] = useState(false)
  const boton = useRef<HTMLButtonElement>(null)
  const carta = useRef<string | null>(null)

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
          className="fixed z-40 right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] md:right-6 md:bottom-6 inline-flex items-center gap-2.5 pl-4 pr-5 py-3 rounded-full bg-[hsl(var(--olive))] text-background shadow-xl font-mono text-[10px] tracking-[0.2em] uppercase hover:bg-[hsl(var(--olive))]/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--gold))] focus-visible:ring-offset-2"
        >
          <MessageCircle className="h-4 w-4 text-[hsl(var(--gold-light))]" strokeWidth={1.75} aria-hidden />
          {t("abrir")}
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
