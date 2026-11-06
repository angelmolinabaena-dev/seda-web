"use client"

/*
  Botón «Imprimir» de las guías. Un `onClick` de React, no un atributo
  de evento escrito en el HTML ni un script en línea: la CSP (vercel.json) no admite `unsafe-inline`
  en script-src y esto no la necesita.
*/
export function BotonImprimir({ etiqueta }: { etiqueta: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center border border-foreground/30 px-4 py-2 font-mono text-[11px] tracking-[0.15em] uppercase text-foreground hover:bg-foreground hover:text-background transition-colors print:hidden"
    >
      {etiqueta}
    </button>
  )
}
