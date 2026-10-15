"use client"

import { useState } from "react"
import { Calendar, ExternalLink } from "lucide-react"
import { Link } from "@/i18n/navigation"

/*
  Fachada del calendario de Calendly.

  El iframe NO se monta hasta que el visitante pulsa «Ver calendario». Al
  cargarse, calendly.com fija cookies propias (`_calendly_session`,
  `__cf_bm`, `_cfuvid`); así solo ocurre cuando el visitante lo pide, y
  después de haber leído el aviso. La política de cookies
  (`lib/legal/cookies.ts`) y la de privacidad (`lib/legal/privacidad.ts`,
  sección «calendly») describen exactamente este comportamiento: si cambia,
  cambian ellas.

  Sin `hide_gdpr_banner`: una vez abierto, Calendly muestra su propio aviso
  de cookies.
*/

export type CalendlyFachadaCopy = {
  aviso: string
  verCalendario: string
  enlaceDirecto: string
  politicaCookies: string
}

export function CalendlyFachada({
  calendlyUrl,
  embedUrl,
  copy,
}: {
  calendlyUrl: string
  embedUrl: string
  copy: CalendlyFachadaCopy
}) {
  const [abierto, setAbierto] = useState(false)

  if (abierto) {
    return (
      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <iframe
          src={embedUrl}
          title="Calendly — Seda Private Homes booking"
          className="w-full"
          style={{ height: "720px", border: "0" }}
        />
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-background px-6 py-12 md:px-12 md:py-16 text-center">
      <p className="mx-auto max-w-md text-sm leading-relaxed text-foreground/65">
        {copy.aviso}{" "}
        <Link href="/cookies" className="underline underline-offset-4 hover:text-foreground">
          {copy.politicaCookies}
        </Link>
      </p>

      <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
        <button
          type="button"
          onClick={() => setAbierto(true)}
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          <Calendar size={16} aria-hidden />
          {copy.verCalendario}
        </button>

        <a
          href={calendlyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-foreground/60 underline underline-offset-4 hover:text-foreground"
        >
          {copy.enlaceDirecto}
          <ExternalLink size={14} aria-hidden />
        </a>
      </div>
    </div>
  )
}
