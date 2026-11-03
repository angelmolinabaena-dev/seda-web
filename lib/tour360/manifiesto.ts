import { z } from "zod"
import { IDIOMAS_TOUR } from "./idiomas"
import { ORIGENES_TILES_EXTERNOS } from "./origenes"

/*
  Manifiesto de un recorrido: tours/<slug>/tour.json (uno por casa).

  El manifiesto describe ESTRUCTURA (estancias, títulos, enlaces entre ellas,
  escena inicial, norte). Las fotos no viven aquí: los tiles se generan con
  scripts/tour360-preparar y se alojan aparte (docs/TOUR-360.md §3); el manifiesto
  solo guarda dónde (`tiles.base`) y los parámetros de cada escena (`multires`).

  Un recorrido SOLO se publica con `publicado: true` y exige que cada escena
  tenga su `multires` (es decir, que sus fotos reales ya se hayan procesado).
  Con `publicado: false` /tour/<slug> da 404: no hay fotos inventadas ni de ejemplo.
*/

const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/

const texto = z.string().trim().min(1)

/** Un texto por cada idioma del visor; ninguno puede faltar ni estar vacío. */
export const titulosSchema = z.object(
  Object.fromEntries(IDIOMAS_TOUR.map((i) => [i, texto])) as Record<(typeof IDIOMAS_TOUR)[number], typeof texto>,
)
export type Titulos = z.infer<typeof titulosSchema>

export const multiresSchema = z.object({
  tileResolution: z.number().int().min(64).max(2048),
  maxLevel: z.number().int().min(1).max(8),
  cubeResolution: z.number().int().min(64).max(16384),
  extension: z.literal("jpg"),
})
export type MultiresEscena = z.infer<typeof multiresSchema>

export const hotspotSchema = z.object({
  /** id de la escena a la que lleva. */
  escena: z.string().regex(ID),
  /** Dónde está el punto dentro de ESTA escena, en grados. */
  pitch: z.number().min(-90).max(90),
  yaw: z.number().min(-180).max(180),
  /** Etiqueta propia; si falta, se usa el título de la escena de destino. */
  titulos: titulosSchema.optional(),
  /** Hacia dónde mira el visitante al llegar a la escena de destino (opcional). */
  destinoYaw: z.number().min(-180).max(180).optional(),
  destinoPitch: z.number().min(-90).max(90).optional(),
})
export type HotspotTour = z.infer<typeof hotspotSchema>

export const escenaSchema = z.object({
  id: z.string().regex(ID, "id en minúsculas, dígitos y guiones: salon, dormitorio-1"),
  titulos: titulosSchema,
  multires: multiresSchema.optional(),
  /**
   * Grados horarios desde el norte hasta el CENTRO de la imagen (Pannellum:
   * `northOffset`). Solo se pone si se ha medido; sin él no hay brújula.
   * Se hereda del recorrido si la escena no lo fija.
   */
  norte: z.number().min(-360).max(360).optional(),
  /** Vista con la que se entra en la escena si se llega sin hotspot dirigido. */
  vistaInicial: z
    .object({
      yaw: z.number().min(-180).max(180).optional(),
      pitch: z.number().min(-90).max(90).optional(),
      hfov: z.number().min(30).max(120).optional(),
    })
    .optional(),
  hotspots: z.array(hotspotSchema).default([]),
})
export type EscenaTour = z.infer<typeof escenaSchema>

/** `tiles.base`: ruta del propio dominio (`/tours/…`) o https de un origen de la lista blanca. */
export function baseTilesValida(base: string): boolean {
  if (base.startsWith("/")) {
    return !base.startsWith("//") && !base.includes("..") && !base.includes("\\") && !/[?#]/.test(base)
  }
  try {
    const u = new URL(base)
    return u.protocol === "https:" && ORIGENES_TILES_EXTERNOS.includes(u.origin) && !/[?#]/.test(base)
  } catch {
    return false
  }
}

export const tourSchema = z
  .object({
    version: z.literal(1),
    slug: z.string().regex(ID),
    /** Nombre de la casa tal cual (no se traduce). */
    nombre: texto,
    publicado: z.boolean(),
    escenaInicial: z.string().regex(ID),
    /** Norte por defecto de todas las escenas (ver `EscenaTour.norte`). */
    norte: z.number().min(-360).max(360).optional(),
    tiles: z.object({
      base: z.string().refine(baseTilesValida, {
        message: "tiles.base: ruta que empiece por «/» (sin «..» ni «//») o https de un origen de ORIGENES_TILES_EXTERNOS",
      }),
    }),
    escenas: z.array(escenaSchema).min(1),
  })
  .superRefine((tour, ctx) => {
    const ids = tour.escenas.map((e) => e.id)
    const vistos = new Set<string>()
    ids.forEach((id, i) => {
      if (vistos.has(id)) ctx.addIssue({ code: "custom", path: ["escenas", i, "id"], message: `id repetido: ${id}` })
      vistos.add(id)
    })
    if (!vistos.has(tour.escenaInicial)) {
      ctx.addIssue({ code: "custom", path: ["escenaInicial"], message: `escenaInicial «${tour.escenaInicial}» no existe` })
    }
    tour.escenas.forEach((escena, i) => {
      escena.hotspots.forEach((h, j) => {
        if (!vistos.has(h.escena)) {
          ctx.addIssue({ code: "custom", path: ["escenas", i, "hotspots", j, "escena"], message: `lleva a «${h.escena}», que no existe` })
        }
        if (h.escena === escena.id) {
          ctx.addIssue({ code: "custom", path: ["escenas", i, "hotspots", j, "escena"], message: "un hotspot no puede llevar a su propia escena" })
        }
      })
      if (tour.publicado && !escena.multires) {
        ctx.addIssue({
          code: "custom",
          path: ["escenas", i, "multires"],
          message: `publicado: true exige multires en «${escena.id}» (¿falta ejecutar scripts/tour360-preparar?)`,
        })
      }
    })
    if (tour.publicado && tour.escenas.length > 1) {
      // Un recorrido publicado de varias estancias tiene que poder recorrerse: cada escena es alcanzable.
      const alcanzables = new Set<string>([tour.escenaInicial])
      let creciendo = true
      while (creciendo) {
        creciendo = false
        for (const e of tour.escenas) {
          if (!alcanzables.has(e.id)) continue
          for (const h of e.hotspots) {
            if (!alcanzables.has(h.escena)) {
              alcanzables.add(h.escena)
              creciendo = true
            }
          }
        }
      }
      tour.escenas.forEach((e, i) => {
        if (!alcanzables.has(e.id)) {
          ctx.addIssue({
            code: "custom",
            path: ["escenas", i, "id"],
            message: `«${e.id}» no se alcanza desde la escena inicial por ningún hotspot`,
          })
        }
      })
    }
  })

export type TourManifiesto = z.infer<typeof tourSchema>

/** Valida un JSON ya parseado; lanza con TODOS los problemas y la ruta del fichero. */
export function validarTour(datos: unknown, origen = "tour.json"): TourManifiesto {
  const r = tourSchema.safeParse(datos)
  if (r.success) return r.data
  const problemas = r.error.issues.map((i) => `  · ${i.path.join(".") || "(raíz)"}: ${i.message}`).join("\n")
  throw new Error(`${origen} no es un manifiesto de recorrido válido:\n${problemas}`)
}
