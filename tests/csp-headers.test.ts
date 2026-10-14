import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Guardarraíl de la Content-Security-Policy (15-oct-2026, fix/csp-seda-web).
 *
 * Por qué existe: la auditoría de seda_os (REA-SECRETOS-Y-PUERTAS-2026-10)
 * encontró que sedaprivatehomes.com no enviaba CSP. Las cabeceras de seguridad
 * viven en vercel.json; este test lee ese fichero y falla si la CSP desaparece
 * o se debilita.
 *
 * Es un test de la política escrita, no de lo que el navegador acepta: lo
 * segundo se mide recorriendo el sitio con la CSP real (ver la descripción del PR).
 */
const raiz = process.cwd()

type Cabecera = { key: string; value: string }
type Regla = { source: string; headers: Cabecera[] }

const vercel = JSON.parse(readFileSync(join(raiz, 'vercel.json'), 'utf8')) as { headers: Regla[] }

// La regla que cubre todas las rutas.
const reglaGlobal = vercel.headers.find((r) => r.source === '/(.*)')
const csp = reglaGlobal?.headers.find((h) => h.key === 'Content-Security-Policy')?.value ?? ''

function directivas(politica: string): Map<string, string[]> {
  return new Map(
    politica
      .split(';')
      .map((d) => d.trim())
      .filter(Boolean)
      .map((d) => {
        const [nombre, ...valores] = d.split(/\s+/)
        return [nombre, valores] as const
      }),
  )
}

const d = directivas(csp)

describe('Content-Security-Policy en vercel.json', () => {
  it('existe y se aplica a todas las rutas', () => {
    expect(reglaGlobal, 'falta la regla source "/(.*)"').toBeDefined()
    expect(csp).not.toBe('')
  })

  it('no lleva unsafe-eval', () => {
    expect(csp).not.toContain("'unsafe-eval'")
  })

  it("prohíbe que otros la enmarquen (frame-ancestors 'none')", () => {
    expect(d.get('frame-ancestors')).toEqual(["'none'"])
  })

  it('permite el iframe de Calendly (/meet) y ningún otro origen de frame', () => {
    expect(d.get('frame-src')).toEqual(['https://calendly.com'])
  })

  it("cierra base-uri, object-src y form-action", () => {
    expect(d.get('base-uri')).toEqual(["'self'"])
    expect(d.get('object-src')).toEqual(["'none'"])
    expect(d.get('form-action')).toEqual(["'self'"])
  })

  it("parte de default-src 'self'", () => {
    expect(d.get('default-src')).toEqual(["'self'"])
  })

  it('declara cada directiva que el inventario de orígenes necesita', () => {
    for (const nombre of ['script-src', 'style-src', 'img-src', 'font-src', 'connect-src', 'media-src', 'frame-src']) {
      expect(d.has(nombre), `falta ${nombre}`).toBe(true)
    }
  })

  it('no usa comodines ni esquemas enteros como origen', () => {
    for (const [nombre, valores] of d) {
      for (const v of valores) {
        expect(v, `${nombre} ${v}`).not.toMatch(/\*/)
        expect(v, `${nombre} ${v}`).not.toMatch(/^(https?|data|blob|wss?):$/)
      }
    }
  })

  it("'unsafe-inline' solo en script-src y style-src (las páginas son estáticas, sin nonces)", () => {
    for (const [nombre, valores] of d) {
      if (nombre === 'script-src' || nombre === 'style-src') continue
      expect(valores, nombre).not.toContain("'unsafe-inline'")
    }
  })

  it('las cabeceras de seguridad previas siguen ahí', () => {
    const claves = reglaGlobal?.headers.map((h) => h.key) ?? []
    for (const k of ['X-Frame-Options', 'X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy', 'Strict-Transport-Security']) {
      expect(claves, k).toContain(k)
    }
  })

  it('no hay una segunda CSP en otro sitio (una sola fuente: vercel.json)', async () => {
    const next = readFileSync(join(raiz, 'next.config.mjs'), 'utf8')
    expect(next).not.toMatch(/Content-Security-Policy/i)
    const proxy = readFileSync(join(raiz, 'proxy.ts'), 'utf8')
    expect(proxy).not.toMatch(/Content-Security-Policy/i)
  })
})

describe('X-Powered-By', () => {
  it('next.config.mjs lo desactiva (poweredByHeader: false)', () => {
    const next = readFileSync(join(raiz, 'next.config.mjs'), 'utf8')
    expect(next).toMatch(/poweredByHeader:\s*false/)
  })
})
