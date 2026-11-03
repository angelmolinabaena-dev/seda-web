// Equirectangular SINTÉTICA para los tests y las capturas del visor 360.
//
// No es una foto ni imita una casa: es una cuadrícula generada por fórmula. Un
// test que usara una foto "de ejemplo" ratificaría lo que se ve a ojo; una
// cuadrícula con marcadores asimétricos falla ruidosamente si una cara sale
// girada, espejada o cambiada de sitio.
//
// Contenido (lon = yaw, −180..180, 0 = centro de la imagen; lat = pitch):
//   · matiz según lon, brillo según lat
//   · líneas finas cada 15° y gruesas cada 90°
//   · disco rojo en (lon 30, lat 20) y cuadrado azul en (lon −60, lat −10)
//   · disco magenta cerca del cénit, hacia atrás (lon 180, lat 75)
//   · disco verde cerca del nadir, hacia delante (lon 0, lat −75)
//   · casquete amarillo (lat > 85) y cian (lat < −85)

import { createRequire } from "node:module"
const require = createRequire(import.meta.url)
const sharp = require("sharp")

function hsv(h, s, v) {
  const i = Math.floor(h * 6)
  const f = h * 6 - i
  const p = v * (1 - s)
  const q = v * (1 - f * s)
  const t = v * (1 - (1 - f) * s)
  const [r, g, b] = [
    [v, t, p],
    [q, v, p],
    [p, v, t],
    [p, q, v],
    [t, p, v],
    [v, p, q],
  ][i % 6]
  return [r * 255, g * 255, b * 255]
}

/** Distancia angular (grados) entre dos puntos (lon, lat) sobre la esfera. */
function distanciaAngular(lon1, lat1, lon2, lat2) {
  const r = Math.PI / 180
  const c =
    Math.sin(lat1 * r) * Math.sin(lat2 * r) + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.cos((lon1 - lon2) * r)
  return Math.acos(Math.min(1, Math.max(-1, c))) / r
}

/**
 * @param {number} ancho  el alto es ancho/2
 * @returns {{data: Buffer, width: number, height: number}} RGB crudo
 */
export function equirectSintetica(ancho = 1024) {
  const W = ancho
  const H = ancho / 2
  const data = Buffer.alloc(W * H * 3)
  const grado = 360 / W
  const ancho15 = 0.6 // semianchura de las líneas finas, en grados
  const ancho90 = 1.4 // y de las gruesas
  let o = 0
  for (let y = 0; y < H; y++) {
    const lat = 90 - (y + 0.5) * grado
    for (let x = 0; x < W; x++) {
      const lon = (x + 0.5) * grado - 180
      let [r, g, b] = hsv((lon + 180) / 360, 0.55, 0.35 + 0.45 * ((lat + 90) / 180))

      // Cuadrícula (las líneas de longitud se estrechan hacia los polos: se escalan con cos(lat)).
      const cosLat = Math.max(0.05, Math.cos((lat * Math.PI) / 180))
      const dLon = Math.abs(((lon % 15) + 15) % 15)
      const dLat = Math.abs(((lat % 15) + 15) % 15)
      const cercaLon = Math.min(dLon, 15 - dLon) * cosLat
      const cercaLat = Math.min(dLat, 15 - dLat)
      const dLon90 = Math.abs(((lon % 90) + 90) % 90)
      const dLat90 = Math.abs(((lat % 90) + 90) % 90)
      const gruesa = Math.min(dLon90, 90 - dLon90) * cosLat < ancho90 || Math.min(dLat90, 90 - dLat90) < ancho90
      if (gruesa) [r, g, b] = [20, 20, 20]
      else if (cercaLon < ancho15 || cercaLat < ancho15) [r, g, b] = [245, 245, 245]

      if (distanciaAngular(lon, lat, 30, 20) < 8) [r, g, b] = [230, 30, 30]
      if (Math.abs(lon + 60) < 7 && Math.abs(lat + 10) < 7) [r, g, b] = [30, 60, 230]
      if (distanciaAngular(lon, lat, 180, 75) < 9) [r, g, b] = [220, 30, 220]
      if (distanciaAngular(lon, lat, 0, -75) < 9) [r, g, b] = [30, 200, 60]
      if (lat > 85) [r, g, b] = [240, 220, 40]
      if (lat < -85) [r, g, b] = [40, 220, 230]

      data[o++] = r
      data[o++] = g
      data[o++] = b
    }
  }
  return { data, width: W, height: H }
}

/** La misma imagen como PNG (Buffer), por si un test o una captura necesita un fichero. */
export async function equirectSinteticaPng(ancho = 1024) {
  const { data, width, height } = equirectSintetica(ancho)
  return sharp(data, { raw: { width, height, channels: 3 } }).png().toBuffer()
}
