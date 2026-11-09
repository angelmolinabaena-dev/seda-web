import type { ReactNode } from "react"
import type { VarianteAsistente } from "./asistente-propietarios"

/*
  El botón del asistente para las páginas de propietarios (portada, founding-owners).
  `process.env.…` literal e `import()` condicionado, como en /propietarios y en el
  layout: next.config.mjs inlina el flag y, apagado, el botón no entra en el bundle
  y la página queda exactamente como antes (devuelve null).
*/
export async function montarAsistente(variante: VarianteAsistente): Promise<ReactNode> {
  if (process.env.SEDA_FLAG_ASISTENTE_PROPIETARIOS !== "1") return null
  const { AsistentePropietarios } = await import("./asistente-propietarios")
  return <AsistentePropietarios variante={variante} />
}
