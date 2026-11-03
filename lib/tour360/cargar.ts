import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { validarTour, type TourManifiesto } from "./manifiesto"

/*
  Lectura de tours/<slug>/tour.json en BUILD (las páginas son estáticas).
  Solo para componentes de servidor: usa `fs`.

  · Un manifiesto inválido ROMPE el build con todos sus problemas. Mejor un
    despliegue que no sale que un recorrido roto en la ficha de una casa.
  · Las carpetas que empiezan por «_» (la plantilla) o «.» no son casas.
  · Un recorrido solo existe como ruta si `publicado: true`.
*/

export const DIR_TOURS = join(process.cwd(), "tours")

export function leerTour(slug: string, dir = DIR_TOURS): TourManifiesto | undefined {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return undefined
  const fichero = join(dir, slug, "tour.json")
  if (!existsSync(fichero)) return undefined
  const tour = validarTour(JSON.parse(readFileSync(fichero, "utf8")), `tours/${slug}/tour.json`)
  if (tour.slug !== slug) {
    throw new Error(`tours/${slug}/tour.json declara slug «${tour.slug}»: la carpeta y el slug tienen que coincidir`)
  }
  return tour
}

export function listarTours(dir = DIR_TOURS): TourManifiesto[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith("_") && !e.name.startsWith("."))
    .map((e) => leerTour(e.name, dir))
    .filter((t): t is TourManifiesto => t !== undefined)
}

export function toursPublicados(dir = DIR_TOURS): TourManifiesto[] {
  return listarTours(dir).filter((t) => t.publicado)
}

export function getTourPublicado(slug: string, dir = DIR_TOURS): TourManifiesto | undefined {
  const tour = leerTour(slug, dir)
  return tour?.publicado ? tour : undefined
}
