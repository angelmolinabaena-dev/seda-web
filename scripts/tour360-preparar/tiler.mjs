// Tiler multirresolución para Pannellum — equivalente de `generate.py`.
//
// Por qué no se usa `utils/multires/generate.py` de Pannellum tal cual: necesita
// Python + Pillow + `nona` (Hugin) instalados, y en el equipo donde se procesan
// las fotos (Cowork) no hay garantía de tenerlos. Este módulo hace lo mismo con
// `sharp`, que ya viaja con Next.js. El FORMATO de salida es el de generate.py
// (mismas caras f/b/u/d/l/r, mismos niveles, mismas rutas `/%l/%s%y_%x` y
// `/fallback/%s`, mismo cálculo de cubeResolution), de modo que Pannellum no
// distingue un juego de tiles de otro. La conformidad se comprueba contra el
// propio Pannellum, no contra este código: ver docs/TOUR-360.md §Verificación.
//
// Convención de caras (la de Pannellum y nona, con la cámara en el centro):
//   x = derecha (yaw +90), y = arriba, z = delante (yaw 0).
//   f delante · b detrás · l izquierda (yaw −90) · r derecha (yaw +90)
//   u arriba: su borde superior mira hacia ATRÁS; su borde inferior toca el
//             borde superior de f.
//   d abajo:  su borde superior mira hacia DELANTE.
// El centro de la equirectangular es yaw 0 / pitch 0 (cara f).

import { mkdirSync, writeFileSync, statSync } from "node:fs"
import { join } from "node:path"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)
// `sharp` llega con Next.js como dependencia OPCIONAL suya (la instala `npm ci`
// en cualquier plataforma con binario precompilado). No se declara aparte en
// package.json a propósito: ver docs/TOUR-360.md §«sharp».
let sharp
try {
  sharp = require("sharp")
} catch {
  throw new Error(
    "No se encuentra «sharp». Ejecuta `npm ci` (Next lo instala como dependencia opcional) " +
      "o, si tu plataforma no tiene binario, `npm install --no-save sharp`.",
  )
}

/** Orden de caras de generate.py. */
export const LETRAS_CARA = ["f", "b", "u", "d", "l", "r"]

/** Vectores (delante, derecha, arriba-de-imagen) de cada cara. */
export const CARAS = {
  f: { fwd: [0, 0, 1], right: [1, 0, 0], up: [0, 1, 0] },
  b: { fwd: [0, 0, -1], right: [-1, 0, 0], up: [0, 1, 0] },
  l: { fwd: [-1, 0, 0], right: [0, 0, 1], up: [0, 1, 0] },
  r: { fwd: [1, 0, 0], right: [0, 0, -1], up: [0, 1, 0] },
  u: { fwd: [0, 1, 0], right: [1, 0, 0], up: [0, 0, -1] },
  d: { fwd: [0, -1, 0], right: [1, 0, 0], up: [0, 0, 1] },
}

/**
 * Niveles y resolución de cubo, igual que generate.py:
 *   cubeSize = 8·⌊ancho/π/8⌋ (360° → ancho/π), tile = min(tile, cubeSize),
 *   niveles = ⌈log2(cubeSize / tile)⌉ + 1.
 * @param {{ancho: number, tile?: number, cubo?: number}} p
 */
export function calcularNiveles({ ancho, tile = 512, cubo = 0 }) {
  const cubeResolution = cubo > 0 ? cubo : 8 * Math.floor(ancho / Math.PI / 8)
  const tileResolution = Math.min(tile, cubeResolution)
  const maxLevel = Math.ceil(Math.log2(cubeResolution / tileResolution)) + 1
  return { cubeResolution, tileResolution, maxLevel }
}

/** Tamaño de la cara en el nivel `nivel` (1..maxLevel): se divide entre 2 por nivel, como generate.py. */
export function tamanoNivel(cubeResolution, maxLevel, nivel) {
  let size = cubeResolution
  for (let l = maxLevel; l > nivel; l--) size = Math.trunc(size / 2)
  return size
}

/**
 * Renderiza una cara del cubo (RGB, 3 bytes/píxel) muestreando la equirectangular
 * con interpolación bilineal (horizontal circular, vertical acotada).
 *
 * @param {{data: Uint8Array, width: number, height: number}} eq  RGB sin canal alfa
 * @param {"f"|"b"|"u"|"d"|"l"|"r"} letra
 * @param {number} n  lado de la cara en píxeles
 * @returns {Buffer}
 */
export function renderizarCara(eq, letra, n) {
  const { fwd, right, up } = CARAS[letra]
  const { data, width: W, height: H } = eq
  const out = Buffer.allocUnsafe(n * n * 3)
  const dosPi = 2 * Math.PI
  let o = 0
  for (let i = 0; i < n; i++) {
    const b = 1 - (2 * (i + 0.5)) / n
    for (let j = 0; j < n; j++) {
      const a = (2 * (j + 0.5)) / n - 1
      const x = fwd[0] + a * right[0] + b * up[0]
      const y = fwd[1] + a * right[1] + b * up[1]
      const z = fwd[2] + a * right[2] + b * up[2]
      const yaw = Math.atan2(x, z)
      const pitch = Math.asin(y / Math.sqrt(x * x + y * y + z * z))
      const sx = (yaw / dosPi + 0.5) * W - 0.5
      const sy = (0.5 - pitch / Math.PI) * H - 0.5
      let x0 = Math.floor(sx)
      let y0 = Math.floor(sy)
      const fx = sx - x0
      const fy = sy - y0
      let x1 = x0 + 1
      let y1 = y0 + 1
      if (x0 < 0) x0 += W
      if (x1 >= W) x1 -= W
      if (x1 < 0) x1 += W
      if (x0 >= W) x0 -= W
      if (y0 < 0) y0 = 0
      if (y1 < 0) y1 = 0
      if (y0 >= H) y0 = H - 1
      if (y1 >= H) y1 = H - 1
      const i00 = (y0 * W + x0) * 3
      const i10 = (y0 * W + x1) * 3
      const i01 = (y1 * W + x0) * 3
      const i11 = (y1 * W + x1) * 3
      const w00 = (1 - fx) * (1 - fy)
      const w10 = fx * (1 - fy)
      const w01 = (1 - fx) * fy
      const w11 = fx * fy
      out[o++] = data[i00] * w00 + data[i10] * w10 + data[i01] * w01 + data[i11] * w11 + 0.5
      out[o++] = data[i00 + 1] * w00 + data[i10 + 1] * w10 + data[i01 + 1] * w01 + data[i11 + 1] * w11 + 0.5
      out[o++] = data[i00 + 2] * w00 + data[i10 + 2] * w10 + data[i01 + 2] * w01 + data[i11 + 2] * w11 + 0.5
    }
  }
  return out
}

/** Lee una imagen (ruta o Buffer) como RGB crudo, sin límite de píxeles (una X4 saca 72 MP). */
export async function leerEquirectangular(entrada) {
  const { data, info } = await sharp(entrada, { limitInputPixels: false })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  return { data, width: info.width, height: info.height }
}

function tamanoRuta(ruta) {
  return statSync(ruta).size
}

/**
 * Genera el juego completo de una escena.
 *
 * Salida en `salida/`:
 *   <nivel>/<cara><fila>_<col>.jpg   tiles (nivel 1 = el más pequeño)
 *   fallback/<cara>.jpg              una imagen por cara, `fallback` px de lado
 *   preview.jpg                      equirectangular pequeña (marcador mientras carga)
 *
 * Los JPEG se escriben SIN metadatos: ni EXIF ni GPS ni XMP de la toma original.
 *
 * @param {object} p
 * @param {string|Buffer} p.entrada  ruta o contenido de la equirectangular
 * @param {string} p.salida          carpeta de la escena
 * @param {number} [p.calidad=80]    calidad JPEG de los tiles
 * @param {number} [p.tile=512]
 * @param {number} [p.cubo=0]        0 = derivar del ancho (todo el detalle)
 * @param {number} [p.fallback=512]  lado de las imágenes de fallback
 * @param {number} [p.previewAncho=1024]
 * @param {(msg: string) => void} [p.log]
 * @returns {Promise<{multires: object, ficheros: number, bytes: number, ancho: number, alto: number}>}
 */
export async function generarMultires({
  entrada,
  salida,
  calidad = 80,
  tile = 512,
  cubo = 0,
  fallback = 512,
  previewAncho = 1024,
  log = () => {},
}) {
  const eq = await leerEquirectangular(entrada)
  const proporcion = eq.width / eq.height
  if (Math.abs(proporcion - 2) > 0.01) {
    throw new Error(
      `La imagen no es una equirectangular completa: ${eq.width}×${eq.height} (proporción ${proporcion.toFixed(3)}, debe ser 2:1). ` +
        `Exporta de Insta360 Studio en «Panorámico 360 / equirectangular», sin recortar.`,
    )
  }
  const { cubeResolution, tileResolution, maxLevel } = calcularNiveles({ ancho: eq.width, tile, cubo })
  log(`  entrada ${eq.width}×${eq.height} → cubo ${cubeResolution}, tiles ${tileResolution}, ${maxLevel} niveles`)

  let ficheros = 0
  let bytes = 0
  const registrar = (ruta) => {
    ficheros++
    bytes += tamanoRuta(ruta)
  }
  const jpg = { quality: calidad, mozjpeg: true }

  mkdirSync(join(salida, "fallback"), { recursive: true })
  for (let nivel = 1; nivel <= maxLevel; nivel++) mkdirSync(join(salida, String(nivel)), { recursive: true })

  for (const letra of LETRAS_CARA) {
    let cara = renderizarCara(eq, letra, cubeResolution)
    let lado = cubeResolution
    // Fallback: la cara a `fallback` px, desde la de máxima resolución.
    const rutaFb = join(salida, "fallback", `${letra}.jpg`)
    await sharp(cara, { raw: { width: lado, height: lado, channels: 3 } })
      .resize(Math.min(fallback, lado), Math.min(fallback, lado), { kernel: "lanczos3" })
      .jpeg({ quality: calidad, mozjpeg: true })
      .toFile(rutaFb)
    registrar(rutaFb)

    for (let nivel = maxLevel; nivel >= 1; nivel--) {
      const size = tamanoNivel(cubeResolution, maxLevel, nivel)
      if (size !== lado) {
        cara = await sharp(cara, { raw: { width: lado, height: lado, channels: 3 } })
          .resize(size, size, { kernel: "lanczos3" })
          .raw()
          .toBuffer()
        lado = size
      }
      const n = Math.ceil(size / tileResolution)
      for (let fila = 0; fila < n; fila++) {
        for (let col = 0; col < n; col++) {
          const left = col * tileResolution
          const top = fila * tileResolution
          const width = Math.min(tileResolution, size - left)
          const height = Math.min(tileResolution, size - top)
          const ruta = join(salida, String(nivel), `${letra}${fila}_${col}.jpg`)
          await sharp(cara, { raw: { width: lado, height: lado, channels: 3 } })
            .extract({ left, top, width, height })
            .jpeg(jpg)
            .toFile(ruta)
          registrar(ruta)
        }
      }
    }
    log(`  cara ${letra} lista`)
  }

  const rutaPreview = join(salida, "preview.jpg")
  await sharp(eq.data, { raw: { width: eq.width, height: eq.height, channels: 3 } })
    .resize(previewAncho, Math.round(previewAncho / 2), { kernel: "lanczos3" })
    .jpeg({ quality: 60, mozjpeg: true })
    .toFile(rutaPreview)
  registrar(rutaPreview)

  const multires = {
    tileResolution,
    maxLevel,
    cubeResolution,
    extension: "jpg",
  }
  writeFileSync(join(salida, "multires.json"), JSON.stringify(multires, null, 2) + "\n")
  return { multires, ficheros, bytes, ancho: eq.width, alto: eq.height }
}
