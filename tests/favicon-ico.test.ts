import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * `/favicon.ico` (15-oct-2026, fix/favicon-500).
 *
 * Los navegadores piden `/favicon.ico` en la raíz con independencia de lo que
 * declare `<link rel="icon">`. Los iconos de la marca viven en
 * `/brand/favicon/*` y la raíz no tenía fichero: la petición caía al 404 raíz
 * de Next, que para cualquier ruta con extensión que no sea un fichero real
 * (el proxy las deja pasar) acababa en 500 «Page changed from static to
 * dynamic at runtime, reason: headers». Cada visita registraba un 500 en la
 * consola del navegador y en los logs.
 *
 * Next sirve `public/` antes de enrutar, así que basta con que el fichero
 * exista y sea un ICO de verdad. Se comprueba contra la especificación del
 * formato (cabecera ICONDIR + entradas ICONDIRENTRY que apuntan dentro del
 * fichero), no contra otro artefacto del repo.
 */
const ruta = join(process.cwd(), 'public', 'favicon.ico')

describe('public/favicon.ico', () => {
  it('existe: sin él, /favicon.ico responde 500', () => {
    expect(existsSync(ruta)).toBe(true)
  })

  it('es un ICO válido: ICONDIR reservado=0, tipo=1 (icono), con imágenes dentro del fichero', () => {
    const b = readFileSync(ruta)
    expect(b.readUInt16LE(0), 'reservado').toBe(0)
    expect(b.readUInt16LE(2), 'tipo 1 = ICO').toBe(1)
    const n = b.readUInt16LE(4)
    expect(n).toBeGreaterThan(0)
    for (let i = 0; i < n; i++) {
      const e = 6 + i * 16
      const tam = b.readUInt32LE(e + 8)
      const off = b.readUInt32LE(e + 12)
      expect(off, `imagen ${i}: offset`).toBeGreaterThanOrEqual(6 + n * 16)
      expect(off + tam, `imagen ${i} sale del fichero`).toBeLessThanOrEqual(b.length)
    }
  })

  it('incluye 16, 32 y 48 px (los tamaños que piden pestañas y marcadores)', () => {
    const b = readFileSync(ruta)
    const n = b.readUInt16LE(4)
    const lados = Array.from({ length: n }, (_, i) => b[6 + i * 16] || 256)
    expect(lados).toEqual(expect.arrayContaining([16, 32, 48]))
  })

  it('pesa menos de 10 KB', () => {
    expect(readFileSync(ruta).length).toBeLessThanOrEqual(10 * 1024)
  })
})
