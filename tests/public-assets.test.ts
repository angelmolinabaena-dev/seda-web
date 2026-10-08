import { describe, expect, it } from 'vitest'
import { closeSync, openSync, readdirSync, readSync, statSync } from 'node:fs'
import { join, extname, relative, sep } from 'node:path'

/**
 * Guardarraíl de peso para `public/` (8-oct-2026, perf/la-web-que-carga-en-el-movil).
 *
 * Por qué existe: `public/` llegó a 218,6 MB con 82 PNG de más de 1 MB que
 * salían de generadores de imagen sin convertir, y dos «.jpg» servidos en
 * producción eran PNG por dentro (experiencias-hero.jpg pesaba 2 MB, ahora
 * 155 KB). Nada lo señalaba: Lighthouse móvil estaba en 69.
 *
 * Los límites salen de lo medido tras la limpieza, con margen: la foto en uso
 * más pesada ocupa 199 KB y hero.mp4 1,2 MB.
 */
const MAX_IMAGEN = 300 * 1024 // cualquier jpg/png/jpeg
const MAX_PNG = 100 * 1024 // un PNG grande es casi siempre una foto: va a JPEG
const MAX_VIDEO = 2 * 1024 * 1024

const raiz = join(process.cwd(), 'public')

function recorrer(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? recorrer(join(dir, e.name)) : [join(dir, e.name)],
  )
}

function cabecera(f: string): Buffer {
  const fd = openSync(f, 'r')
  try {
    const b = Buffer.alloc(8)
    readSync(fd, b, 0, 8, 0)
    return b
  } finally {
    closeSync(fd)
  }
}

const esPng = (b: Buffer) => b[0] === 0x89 && b.toString('latin1', 1, 4) === 'PNG'
const esJpeg = (b: Buffer) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff

const ficheros = recorrer(raiz).map((abs) => ({
  abs,
  rel: relative(raiz, abs).split(sep).join('/'),
  ext: extname(abs).toLowerCase(),
  size: statSync(abs).size,
}))
const imagenes = ficheros.filter((f) => ['.jpg', '.jpeg', '.png'].includes(f.ext))
const videos = ficheros.filter((f) => ['.mp4', '.webm', '.mov'].includes(f.ext))

describe('public/ no admite peso muerto', () => {
  it.each(imagenes.map((f) => [f.rel, f] as const))('%s: pesa menos de 300 KB', (_n, f) => {
    expect(f.size, `${f.rel}: ${Math.round(f.size / 1024)} KB`).toBeLessThanOrEqual(MAX_IMAGEN)
  })

  it.each(imagenes.map((f) => [f.rel, f] as const))('%s: el formato real coincide con la extensión', (_n, f) => {
    const b = cabecera(f.abs)
    if (f.ext === '.png') expect(esPng(b), `${f.rel} dice PNG y no lo es`).toBe(true)
    else expect(esJpeg(b), `${f.rel} dice JPEG pero sus bytes no lo son (¿un PNG renombrado?)`).toBe(true)
  })

  it.each(imagenes.filter((f) => f.ext === '.png').map((f) => [f.rel, f] as const))(
    '%s: un PNG de más de 100 KB es una foto, va a JPEG',
    (_n, f) => {
      expect(f.size, `${f.rel}: ${Math.round(f.size / 1024)} KB`).toBeLessThanOrEqual(MAX_PNG)
    },
  )

  it.each(videos.map((f) => [f.rel, f] as const))('%s: el vídeo pesa menos de 2 MB', (_n, f) => {
    expect(f.size, `${f.rel}: ${(f.size / 1048576).toFixed(1)} MB`).toBeLessThanOrEqual(MAX_VIDEO)
  })
})
