import type { IdiomaTour } from "./idiomas"
import type { EscenaTour, TourManifiesto } from "./manifiesto"
import { TEXTOS_VISOR } from "./textos"

/*
  tour.json + idioma → configuración de tour de Pannellum (`default` + `scenes`).
  Función PURA y sin DOM: se puede probar sin navegador. Los comportamientos
  que necesitan funciones (accesibilidad del hotspot, cierres) los añade el
  componente del visor después.

  Decisiones:
    · multires + autoLoad: el visor no pide nada hasta que la página existe, y
      la página (/tour/[slug]) solo se carga cuando alguien pulsa «Ver en 360°»
      en la ficha. La carga diferida está en la ficha, no aquí.
    · showControls:false → los controles son propios (grandes en móvil); la
      brújula de Pannellum se mantiene, y solo si hay `norte` medido.
    · escapeHTML:true → ningún título del manifiesto se interpreta como HTML.
    · SIN `sceneFadeDuration` (sin fundido entre estancias): Pannellum hace el fundido
      pintando el canvas en una imagen `data:`, y la CSP del visor no abre `img-src data:`
      (medido: con fundido, la escena de destino se queda colgada). Corte directo.
    · Sin `author`/`authorURL`: Pannellum los pinta con enlace y no hay nada que atribuir.
*/

export const PATH_TILES = "/%l/%s%y_%x"
export const PATH_FALLBACK = "/fallback/%s"

export type OpcionesConfig = {
  /** Escena con la que abrir; por defecto, la `escenaInicial` del manifiesto. */
  escena?: string
  /** Vista de la escena de arranque (al cambiar de idioma se conserva la actual). */
  vista?: { yaw?: number; pitch?: number; hfov?: number }
  /** Muestra el panel de coordenadas para colocar hotspots (`?debug=1`). */
  depurar?: boolean
}

function norteDe(tour: TourManifiesto, escena: EscenaTour): number | undefined {
  return escena.norte ?? tour.norte
}

export function construirConfig(
  tour: TourManifiesto,
  idioma: IdiomaTour,
  { escena, vista, depurar = false }: OpcionesConfig = {},
): Record<string, unknown> {
  const textos = TEXTOS_VISOR[idioma]
  const porId = new Map(tour.escenas.map((e) => [e.id, e]))
  const inicial = escena && porId.has(escena) ? escena : tour.escenaInicial
  const hayNorte = tour.norte !== undefined || tour.escenas.some((e) => e.norte !== undefined)

  const scenes: Record<string, Record<string, unknown>> = {}
  for (const e of tour.escenas) {
    if (!e.multires) continue // un recorrido sin publicar puede tener escenas sin procesar; no se dibujan
    const base = `${tour.tiles.base}/${e.id}`
    const norte = norteDe(tour, e)
    const arranque = e.id === inicial ? vista : undefined
    const v = { ...e.vistaInicial, ...arranque }
    scenes[e.id] = {
      type: "multires",
      title: e.titulos[idioma],
      multiRes: {
        basePath: base,
        path: PATH_TILES,
        fallbackPath: PATH_FALLBACK,
        extension: e.multires.extension,
        tileResolution: e.multires.tileResolution,
        maxLevel: e.multires.maxLevel,
        cubeResolution: e.multires.cubeResolution,
      },
      preview: `${base}/preview.jpg`,
      ...(norte !== undefined ? { northOffset: norte } : {}),
      ...(v.yaw !== undefined ? { yaw: v.yaw } : {}),
      ...(v.pitch !== undefined ? { pitch: v.pitch } : {}),
      ...(v.hfov !== undefined ? { hfov: v.hfov } : {}),
      hotSpots: e.hotspots
        .filter((h) => porId.get(h.escena)?.multires)
        .map((h) => ({
          type: "scene",
          pitch: h.pitch,
          yaw: h.yaw,
          sceneId: h.escena,
          text: (h.titulos ?? porId.get(h.escena)!.titulos)[idioma],
          ...(h.destinoYaw !== undefined ? { targetYaw: h.destinoYaw } : {}),
          ...(h.destinoPitch !== undefined ? { targetPitch: h.destinoPitch } : {}),
        })),
    }
  }

  return {
    default: {
      firstScene: scenes[inicial] ? inicial : Object.keys(scenes)[0],
      autoLoad: true,
      showControls: false,
      compass: hayNorte,
      escapeHTML: true,
      hfov: 100,
      minHfov: 50,
      maxHfov: 120,
      // Un recorrido es para mirar: nada se mueve solo (accesibilidad y batería).
      autoRotate: false,
      orientationOnByDefault: false,
      hotSpotDebug: depurar,
      crossOrigin: "anonymous",
      strings: { ...textos.pannellum },
    },
    scenes,
  }
}
