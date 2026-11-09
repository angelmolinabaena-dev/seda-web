/*
  Dock móvil y de tablet (propuesta C): por debajo de 1.280 px los accesos bajan a un dock
  fijo al alcance del pulgar. Aquí, sin React: medidas, colores y los elementos del dock, para
  probarlos sin navegador (tests/dock-movil.test.ts).
*/
import { DESTINO_PROPIETARIOS, DESTINO_VIAJEROS, type TipoPagina } from "@/lib/franja-cabecera"

/** El dock existe por debajo de esta anchura; desde aquí, la barra de escritorio. */
export const ANCHO_ESCRITORIO = 1280
/** Desde aquí (tablet) el dock lleva Experiencias y la llamada de la página, y la barra los cuatro idiomas. */
export const ANCHO_TABLET = 768

/* ── Medidas (px) ── */
export const DOCK_ALTO = 66
export const DOCK_LADOS = 12
export const DOCK_ABAJO = 14
export const DOCK_RADIO = 24
export const DOCK_SEPARACION_HOJA = 10
export const ASISTENTE_ANCHO = 64
export const ASISTENTE_SEPARACION = 8

/* ── Colores ── */
/** Fondo del dock sobre la foto: rgba(20,16,14,0.72) con blur. */
export const DOCK_VELO_RGB = [20, 16, 14] as const
export const DOCK_VELO_ALFA = 0.72
/** Crema de la web: `--background`, hsl(36 38% 97%) → rgb(250,248,244). */
export const CREMA_RGB = [250, 248, 244] as const
/** Etiqueta del dock: crema al 86 %. */
export const DOCK_ALFA_ETIQUETA = 0.86
/** Borde del dock: crema al 14 %. */
export const DOCK_ALFA_BORDE = 0.14
/** Elemento activo (página actual u hoja abierta): oro claro (#ebd4ad) sobre un relleno crema. */
export const ORO_CLARO_HEX = "#ebd4ad"
export const ORO_CLARO_RGB = [235, 212, 173] as const
/**
 * Relleno del elemento activo. El diseño pedía 0,14, pero el oro claro sobre ese relleno queda en
 * 3,72:1 en el peor caso (foto blanca bajo el dock): 0,06 es el relleno más alto con el que el oro
 * claro sigue pasando 4,5:1 (4,54:1).
 */
export const DOCK_ALFA_RELLENO_ACTIVO = 0.06
/** Botón del asistente: verde oliva (`--olive`, hsl(88 18% 32%)) = #536043. */
export const OLIVA_HEX = "#536043"
/** Fondo oscurecido tras una hoja. */
export const SCRIM_RGBA = "rgba(20,16,14,0.55)"

/** `bottom` del dock: 14 px + zona segura + el aviso de cookies si está a la vista. */
export const DOCK_BOTTOM_CSS = `calc(${DOCK_ABAJO}px + env(safe-area-inset-bottom) + var(--banner-cookies-h, 0px))`
/** Hueco que la página deja abajo para que el último enlace del pie quede por encima del dock. */
export const DOCK_HUECO_PAGINA_CSS = `calc(${DOCK_ABAJO}px + ${DOCK_ALTO}px + env(safe-area-inset-bottom) + 14px)`

export type HojaDock = "portal" | "menu"

export type ElementoDock =
  | { tipo: "enlace"; clave: "coleccion" | "experiencias" | "propietarios"; href: string; solo?: "tablet" }
  | { tipo: "hoja"; clave: HojaDock }

/** Elementos del dock, en orden. Móvil: Colección, Propietarios, Portal, Menú; tablet suma Experiencias. */
export function elementosDock(): ElementoDock[] {
  return [
    { tipo: "enlace", clave: "coleccion", href: "/coleccion" },
    { tipo: "enlace", clave: "experiencias", href: "/experiencias", solo: "tablet" },
    { tipo: "enlace", clave: "propietarios", href: "/propietarios" },
    { tipo: "hoja", clave: "portal" },
    { tipo: "hoja", clave: "menu" },
  ]
}

/** La llamada del dock en tablet, según el tipo de página (mismos destinos que la franja). */
export function llamadaDock(tipo: TipoPagina): { clave: "solicitar_estancia" | "valorar_propiedad"; href: string } {
  return tipo === "propietarios"
    ? { clave: "valorar_propiedad", href: DESTINO_PROPIETARIOS }
    : { clave: "solicitar_estancia", href: DESTINO_VIAJEROS }
}

/** ¿Está activo este enlace del dock en esta ruta (sin prefijo de idioma)? */
export function enlaceActivo(href: string, pathname: string | null | undefined): boolean {
  if (!pathname) return false
  const ruta = pathname.replace(/\/+$/, "") || "/"
  if (ruta === href || ruta.startsWith(`${href}/`)) return true
  // Las fichas de villa cuelgan de la Colección.
  return href === "/coleccion" && (ruta === "/villa" || ruta.startsWith("/villa/"))
}
