"use client"

import { abrirConfiguracionCookies } from "./consentimiento-cookies"

/*
  «Configurar cookies» en el pie: cambiar o retirar la elección en cualquier
  momento, desde cualquier página (guía de la AEPD, 2023: retirar el
  consentimiento tiene que ser tan fácil como darlo). Solo se monta con
  SEDA_FLAG_META_PIXEL encendido; el pie lo recibe como `enlaceCookies`.
*/
export function EnlaceConfigurarCookies({ etiqueta }: { etiqueta: string }) {
  return (
    <button
      type="button"
      onClick={abrirConfiguracionCookies}
      className="font-mono text-[11px] tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
    >
      {etiqueta}
    </button>
  )
}
