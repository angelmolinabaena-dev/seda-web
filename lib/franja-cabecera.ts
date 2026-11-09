/*
  Franja fina de la cabecera (propuesta D del lienzo de diseño, ronda 2): habla a
  los dos públicos, viajeros y propietarios, encima de la barra.

  Aquí, sin React: el tipo de página por ruta (qué mitad se destaca), los destinos
  de los enlaces y los colores, para poder probarlos sin navegador.
*/

export type TipoPagina = "propietarios" | "viajeros" | "neutro"

/** Páginas pensadas para quien tiene una vivienda. */
const RUTAS_PROPIETARIOS = ["/propietarios", "/founding-owners", "/ecosistema"] as const
/** Páginas pensadas para quien viaja. */
const RUTAS_VIAJEROS = ["/coleccion", "/villa", "/experiencias", "/guias", "/descubre", "/guestapp"] as const

const cuelga = (ruta: string, base: string) => ruta === base || ruta.startsWith(`${base}/`)

/**
 * Tipo de cliente de una página, por su ruta SIN prefijo de idioma (la que da
 * `usePathname` de next-intl). La portada y el resto (FAQ, contacto, nosotros,
 * legales, 404…) son neutros. Ignora una barra final, la query y el hash.
 */
export function tipoDePagina(pathname: string | null | undefined): TipoPagina {
  if (!pathname) return "neutro"
  const ruta = (pathname.split(/[?#]/)[0] || "/").replace(/\/+$/, "") || "/"
  if (RUTAS_PROPIETARIOS.some((p) => cuelga(ruta, p))) return "propietarios"
  if (RUTAS_VIAJEROS.some((p) => cuelga(ruta, p))) return "viajeros"
  return "neutro"
}

/** Destinos: los mismos que tenía el botón de la barra. */
export const DESTINO_VIAJEROS = "/contacto?type=guest"
export const DESTINO_PROPIETARIOS = "/contacto?type=owner"

/** Los mismos destinos externos que el desplegable «Portal» de hoy. */
export const URL_GUEST_APP = "https://guests.sedaprivatehomes.com/acceso"
export const URL_PORTAL_PROPIETARIO = "https://portal.sedaprivatehomes.com/"

/* ── Colores ─────────────────────────────────────────────────────────────
   El velo es EL MISMO en la franja y en la barra sobre la foto (rgba(20,16,14,0.68)): 0,68 es
   el valor más bajo con el que TODO el texto pasa 4,5:1 sobre la foto más clara (blanco). Con 0,64
   y 0,66 el enlace de propietarios (oro claro, ya al 100 %) se queda en 3,95:1 y 4,24:1.
   El texto sube de opacidad lo necesario (tests/franja-cabecera.test.ts y la medición en el
   navegador de tests/integracion/cabecera-escritorio.test.ts).                       */
export const VELO_RGB = [20, 16, 14] as const
export const VELO_ALFA = 0.68
/** Crema de la web: `--background` (app/globals.css), hsl(36 38% 97%). */
export const CREMA_HSL = [36, 38, 97] as const
/** `--gold-light` (app/globals.css), hsl(38 60% 80%). */
export const ORO_CLARO_HSL = [38, 60, 80] as const

/**
 * Opacidad del texto de la franja sobre el velo (crema). Nada se apaga: todo el texto de la
 * franja pasa 4,5:1 sobre la foto más clara. La mitad que corresponde al tipo de página se
 * distingue DESTACÁNDOLA (punto dorado, etiqueta en oro claro y frase algo más clara), no apagando la otra.
 */
export const ALFA = {
  etiqueta: 0.84,
  frase: 0.88,
  enlace: 1,
  /** Mitad destacada: la etiqueta va en `--gold-light` (opaco) y la frase sube. */
  fraseDestacada: 0.94,
} as const

/**
 * Opacidad (crema) de los textos de la barra sobre la foto, en su estado transparente (portada, arriba).
 * Los pone Tailwind (`text-background/85`, `text-background/85` en el selector de idiomas): el test los
 * ata a estos valores leyendo el código.
 */
export const ALFA_BARRA = {
  enlaceInactivo: 0.85,
  idiomaInactivo: 0.85,
} as const
