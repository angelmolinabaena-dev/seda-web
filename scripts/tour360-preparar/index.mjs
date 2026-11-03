#!/usr/bin/env node
// tour360-preparar — de las equirectangulares de la Insta360 X4 a los tiles de Pannellum.
//
//   node scripts/tour360-preparar --slug bay-side --entrada ~/tomas/bay-side
//   node scripts/tour360-preparar --slug bay-side --entrada salon.jpg --escena salon
//
// Por cada foto `<escena>.jpg` genera, en tours-salida/<slug>/<escena>/:
//   <nivel>/<cara><fila>_<col>.jpg   tiles multirresolución (formato de generate.py)
//   fallback/<cara>.jpg              base de baja resolución
//   preview.jpg                      equirectangular pequeña (marcador mientras carga)
//   multires.json                    parámetros que Pannellum necesita
// y escribe esos parámetros en tours/<slug>/tour.json (campo `multires` de cada escena).
//
// NO sube nada a ningún sitio. NO pone `publicado: true`: eso es una decisión de
// Ángel tras la checklist de privacidad (docs/TOUR-360.md §Privacidad).

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs"
import { basename, dirname, extname, join, resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { generarMultires } from "./tiler.mjs"

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..")
const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/
const EXTENSIONES = new Set([".jpg", ".jpeg"])

export const AYUDA = `
tour360-preparar — tiles multirresolución de Pannellum desde equirectangulares

Uso:
  node scripts/tour360-preparar --slug <casa> --entrada <carpeta|foto.jpg> [opciones]

Obligatorios:
  --slug <casa>          slug de la casa (= carpeta tours/<slug>)
  --entrada <ruta>       carpeta con <escena>.jpg, o una sola foto

Opciones:
  --escena <id>          id de la escena (solo si --entrada es un fichero; por defecto, el nombre del fichero)
  --salida <carpeta>     dónde escribir (por defecto ./tours-salida, ignorada por git)
  --manifiesto <ruta>    tour.json a actualizar (por defecto tours/<slug>/tour.json)
  --sin-manifiesto       no tocar ningún tour.json
  --calidad <1-100>      calidad JPEG de los tiles (80)
  --tile <px>            lado del tile (512)
  --fallback <px>        lado de las imágenes de fallback (512)
  --cubo <px>            lado de la cara a máxima resolución (0 = todo el detalle de la foto)
  --sobrescribir         permite reescribir una escena ya generada
  --ayuda                esta ayuda

Los nombres de fichero son los ids de escena: salon.jpg, cocina.jpg, dormitorio-1.jpg,
pasillo-1.jpg… (minúsculas, dígitos y guiones). Ver docs/TOUR-360-GUIA-RODAJE.md.
`

/** Parseo mínimo de argumentos; sin dependencias. Lanza con un mensaje claro ante lo desconocido. */
export function parsearArgumentos(argv) {
  const o = {
    slug: undefined,
    entrada: undefined,
    escena: undefined,
    salida: "tours-salida",
    manifiesto: undefined,
    sinManifiesto: false,
    calidad: 80,
    tile: 512,
    fallback: 512,
    cubo: 0,
    sobrescribir: false,
    ayuda: false,
  }
  const numeros = new Set(["calidad", "tile", "fallback", "cubo"])
  const claves = {
    "--slug": "slug",
    "--entrada": "entrada",
    "--escena": "escena",
    "--salida": "salida",
    "--manifiesto": "manifiesto",
    "--calidad": "calidad",
    "--tile": "tile",
    "--fallback": "fallback",
    "--cubo": "cubo",
  }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === "--ayuda" || a === "-h" || a === "--help") o.ayuda = true
    else if (a === "--sin-manifiesto") o.sinManifiesto = true
    else if (a === "--sobrescribir") o.sobrescribir = true
    else if (a in claves) {
      const v = argv[++i]
      if (v === undefined || v.startsWith("--")) throw new Error(`${a} necesita un valor`)
      const k = claves[a]
      if (numeros.has(k)) {
        const n = Number(v)
        if (!Number.isFinite(n) || n < 0) throw new Error(`${a} debe ser un número, no «${v}»`)
        o[k] = n
      } else o[k] = v
    } else throw new Error(`Opción desconocida: ${a}\n${AYUDA}`)
  }
  return o
}

/**
 * Fotos a procesar: [{ id, ruta }].
 * @param {{entrada: string, escena?: string}} p
 * @returns {{id: string, ruta: string}[]}
 */
export function listarEntradas({ entrada, escena }) {
  if (!existsSync(entrada)) throw new Error(`No existe la entrada: ${entrada}`)
  if (statSync(entrada).isFile()) {
    const id = escena ?? basename(entrada, extname(entrada)).toLowerCase()
    return [{ id, ruta: resolve(entrada) }]
  }
  if (escena) throw new Error("--escena solo se usa con una foto suelta, no con una carpeta")
  const fotos = readdirSync(entrada)
    .filter((f) => EXTENSIONES.has(extname(f).toLowerCase()))
    .sort()
  if (fotos.length === 0) throw new Error(`No hay ningún .jpg en ${entrada}`)
  return fotos.map((f) => ({ id: basename(f, extname(f)).toLowerCase(), ruta: resolve(entrada, f) }))
}

/**
 * Lo que puede fallar ANTES de empezar (minutos de proceso por foto): ids mal formados,
 * repetidos, o que no existen en el manifiesto.
 */
export function comprobarPrevio({ entradas, manifiesto }) {
  const problemas = []
  const vistos = new Set()
  for (const { id, ruta } of entradas) {
    if (!ID.test(id)) {
      problemas.push(`«${basename(ruta)}» da el id «${id}», que no es válido (minúsculas, dígitos y guiones: salon, dormitorio-1)`)
    }
    if (vistos.has(id)) problemas.push(`id repetido: «${id}»`)
    vistos.add(id)
  }
  if (manifiesto) {
    const existentes = new Set(manifiesto.escenas.map((e) => e.id))
    for (const { id } of entradas) {
      if (!existentes.has(id)) {
        problemas.push(
          `la escena «${id}» no está en el manifiesto (escenas: ${[...existentes].join(", ")}). ` +
            `Añádela a tour.json o corrige el nombre de la foto.`,
        )
      }
    }
  }
  return problemas
}

const mb = (bytes) => (bytes / 1e6).toFixed(1)

/**
 * Ejecuta todo el proceso. `log` recibe cada línea (la CLI usa console.log).
 * @param {Record<string, any>} opciones  las de parsearArgumentos()
 * @param {(linea: string) => void | unknown} [log]
 */
export async function preparar(opciones, log = () => {}) {
  const o = { ...opciones }
  if (!o.slug || !ID.test(o.slug)) throw new Error("Falta --slug o no es válido (minúsculas, dígitos y guiones)")
  if (!o.entrada) throw new Error("Falta --entrada")

  const entradas = listarEntradas(o)
  const rutaManifiesto = o.sinManifiesto ? undefined : resolve(o.manifiesto ?? join(RAIZ, "tours", o.slug, "tour.json"))
  let manifiesto
  if (rutaManifiesto) {
    if (!existsSync(rutaManifiesto)) {
      throw new Error(
        `No existe ${rutaManifiesto}. Copia tours/_plantilla a tours/${o.slug} y edítalo, o usa --sin-manifiesto.`,
      )
    }
    manifiesto = JSON.parse(readFileSync(rutaManifiesto, "utf8"))
  }

  const problemas = comprobarPrevio({ entradas, manifiesto })
  if (problemas.length) throw new Error("No se ha empezado:\n" + problemas.map((p) => `  · ${p}`).join("\n"))

  const base = resolve(o.salida, o.slug)
  const yaHechas = entradas.filter(({ id }) => existsSync(join(base, id)))
  if (yaHechas.length && !o.sobrescribir) {
    throw new Error(
      `Ya existe salida para: ${yaHechas.map((e) => e.id).join(", ")} en ${base}. ` +
        `Usa --sobrescribir para regenerar (o una carpeta --salida nueva).`,
    )
  }

  const resultados = []
  for (const { id, ruta } of entradas) {
    log(`\n▸ ${id}  (${basename(ruta)})`)
    const t0 = Date.now()
    const r = await generarMultires({
      entrada: ruta,
      salida: join(base, id),
      calidad: o.calidad,
      tile: o.tile,
      cubo: o.cubo,
      fallback: o.fallback,
      log,
    })
    log(`  ✓ ${r.ficheros} ficheros, ${mb(r.bytes)} MB, ${((Date.now() - t0) / 1000).toFixed(0)} s`)
    resultados.push({ id, ...r })
  }

  mkdirSync(base, { recursive: true })
  const informe = {
    slug: o.slug,
    generado: new Date().toISOString(),
    escenas: Object.fromEntries(
      resultados.map((r) => [r.id, { ficheros: r.ficheros, bytes: r.bytes, origen: `${r.ancho}×${r.alto}`, multires: r.multires }]),
    ),
  }
  writeFileSync(join(base, "informe.json"), JSON.stringify(informe, null, 2) + "\n")

  if (rutaManifiesto && manifiesto) {
    for (const r of resultados) {
      manifiesto.escenas.find((e) => e.id === r.id).multires = r.multires
    }
    writeFileSync(rutaManifiesto, JSON.stringify(manifiesto, null, 2) + "\n")
    log(`\n✎ ${rutaManifiesto}: multires actualizado en ${resultados.length} escena(s)`)
  }

  const totalBytes = resultados.reduce((s, r) => s + r.bytes, 0)
  const totalFicheros = resultados.reduce((s, r) => s + r.ficheros, 0)
  log(`\nTotal: ${resultados.length} escena(s), ${totalFicheros} ficheros, ${mb(totalBytes)} MB en ${base}`)
  log(`
Siguiente:
  1. Revisa las fotos con la checklist de privacidad (docs/TOUR-360.md §Privacidad).
  2. Sube ${base}  →  ${manifiesto?.tiles?.base ?? "<tiles.base>"}  (docs/TOUR-360.md §Alojamiento). Este script no sube nada.
  3. Coloca los hotspots con /tour/${o.slug}?debug=1 y pon "publicado": true en tour.json.`)
  return { resultados, totalBytes, totalFicheros, base }
}

// Ejecución directa (no al importar desde los tests).
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const o = parsearArgumentos(process.argv.slice(2))
    if (o.ayuda || process.argv.length <= 2) {
      console.log(AYUDA)
    } else {
      await preparar(o, (l) => console.log(l))
    }
  } catch (e) {
    console.error(`\n✗ ${e.message}`)
    process.exit(1)
  }
}
