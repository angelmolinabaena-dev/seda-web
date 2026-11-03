"use client"

import { useEffect, useRef, useState } from "react"
import { useLocale, useTranslations } from "next-intl"

/*
  «Ver en 360°» en la ficha de una casa.

  CARGA DIFERIDA, que es lo que protege el LCP de la ficha: hasta que se pulsa,
  este componente no pide NADA al visor. No hay <iframe> en el HTML, ni
  `<link rel="preload">`, ni imagen de portada del tour, ni Pannellum. Lo único
  que viaja con la ficha es este botón (texto) y unas líneas de JS. El <iframe>
  a /tour/<slug> se monta al pulsar y se desmonta al cerrar (se libera WebGL).

  El botón es un enlace a /tour/<slug>: sin JavaScript, o con Ctrl/⌘/clic central,
  se abre el visor en otra pestaña. Con JavaScript se abre aquí, a pantalla completa,
  en un <dialog> modal (Esc cierra, el foco vuelve al botón, el fondo queda inerte).

  `allow="fullscreen; gyroscope; accelerometer"`: sin ello, el iframe no puede
  ponerse a pantalla completa ni leer el giroscopio.
*/
export function Tour360Lanzador({ slug, nombre }: { slug: string; nombre: string }) {
  const t = useTranslations()
  const locale = useLocale()
  const [abierto, setAbierto] = useState(false)
  const dialogo = useRef<HTMLDialogElement>(null)
  const href = `/tour/${slug}?lang=${locale}`

  useEffect(() => {
    if (!abierto) return
    const d = dialogo.current
    if (d && !d.open) d.showModal()
    const overflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = overflow
    }
  }, [abierto])

  return (
    <>
      <a
        href={href}
        target="_blank"
        rel="noopener"
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
          e.preventDefault()
          setAbierto(true)
        }}
        className="inline-flex min-h-12 items-center gap-3 border border-foreground/30 px-6 font-mono text-[11px] uppercase tracking-[0.22em] text-foreground transition-colors hover:bg-foreground hover:text-background"
      >
        {t("tour360.ver")}
      </a>

      {abierto && (
        <dialog
          ref={dialogo}
          onClose={() => setAbierto(false)}
          aria-label={t("tour360.titulo", { nombre })}
          className="m-0 h-[100dvh] max-h-none w-screen max-w-none border-0 bg-[#1c1d1b] p-0 text-[#f8f4ee] backdrop:bg-black/80"
        >
          <div className="flex h-full flex-col">
            <div className="flex min-h-14 items-center justify-between gap-4 px-4">
              <p className="truncate font-mono text-[11px] uppercase tracking-[0.2em]">{t("tour360.titulo", { nombre })}</p>
              <button
                type="button"
                onClick={() => dialogo.current?.close()}
                className="min-h-12 border border-[#f8f4ee]/40 px-5 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors hover:bg-[#f8f4ee] hover:text-[#1c1d1b]"
              >
                {t("tour360.cerrar")}
              </button>
            </div>
            <iframe
              src={href}
              title={t("tour360.titulo", { nombre })}
              allow="fullscreen; gyroscope; accelerometer"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              className="block min-h-0 w-full flex-1 border-0"
            />
          </div>
        </dialog>
      )}
    </>
  )
}
