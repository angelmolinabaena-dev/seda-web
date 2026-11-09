"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { ChevronDown } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { usePathname, useRouter } from "@/i18n/navigation"
import { routing, type Locale } from "@/i18n/routing"

/*
  Idioma en la barra de arriba del móvil (< 768 px): un botón «ES ▾» que abre ES / EN / FR / DE.
  Misma lógica que el selector en línea (components/language-switcher.tsx): misma ruta, otro idioma.
*/
export function SelectorIdiomaCompacto({ oscuro }: { oscuro: boolean }) {
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
    const alTocar = (e: MouseEvent) => {
      if (!raiz.current?.contains(e.target as Node)) setAbierto(false)
    }
    document.addEventListener("keydown", alPulsar)
    document.addEventListener("mousedown", alTocar)
    return () => {
      document.removeEventListener("keydown", alPulsar)
      document.removeEventListener("mousedown", alTocar)
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
        aria-label={t("dock.idioma_actual", { idioma: locale.toUpperCase() })}
        className={`inline-flex min-h-[44px] items-center gap-1 rounded-sm px-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current ${
          oscuro ? "text-foreground" : "text-background"
        }`}
      >
        {locale}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${abierto ? "rotate-180" : ""}`} strokeWidth={1.75} aria-hidden />
      </button>
      {abierto && (
        <div role="menu" aria-label={t("dock.idioma")} className="absolute right-0 top-full z-10 mt-1 w-24 border border-border bg-background py-1 shadow-xl">
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
