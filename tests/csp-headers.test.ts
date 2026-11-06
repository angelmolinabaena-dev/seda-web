import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { SOURCE_CSP_GLOBAL, cspGlobal } from '../lib/csp.mjs'
import nextConfig from '../next.config.mjs'

/**
 * Guardarraíl de la Content-Security-Policy (15-oct-2026, fix/csp-seda-web).
 *
 * Por qué existe: la auditoría de seda_os (REA-SECRETOS-Y-PUERTAS-2026-10)
 * encontró que sedaprivatehomes.com no enviaba CSP. Este test falla si la CSP
 * desaparece o se debilita.
 *
 * Desde el píxel de Meta (plan «Motor SEDA», fase 1) la CSP GLOBAL ya no es una
 * cadena fija en vercel.json: la genera lib/csp.mjs y la publica next.config.mjs,
 * porque los dominios de Meta solo pueden estar con SEDA_FLAG_META_PIXEL
 * encendido. Las aserciones de abajo se ejecutan sobre la CSP con TODO APAGADO
 * (la de producción hoy), igual que antes; los dominios de Meta, más abajo.
 *
 * Es un test de la política escrita, no de lo que el navegador acepta: lo
 * segundo se mide recorriendo el sitio con la CSP real (ver la descripción del PR).
 */
const raiz = process.cwd()

type Cabecera = { key: string; value: string }
type Regla = { source: string; headers: Cabecera[] }

const vercel = JSON.parse(readFileSync(join(raiz, 'vercel.json'), 'utf8')) as { headers: Regla[] }

// La regla de vercel.json que cubre todas las rutas SALVO /tour/ (visor 360 incrustable,
// con su propia CSP: se prueba en tests/tour360-cabeceras.test.ts). El `(?!tour/)` existe
// para que la CSP global (`frame-ancestors 'none'`) y la del visor no se solapen:
// dos CSP sobre una misma respuesta se INTERSECAN y el visor no podría incrustarse.
// Sigue llevando las demás cabeceras de seguridad, pero YA NO la CSP (ver abajo).
const reglaGlobal = vercel.headers.find((r) => r.source === '/((?!tour/).*)')
// La CSP global, con todos los interruptores de Meta apagados.
const csp = cspGlobal({})

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

/**
 * La CSP que producción envía HOY, copiada literalmente de vercel.json en el
 * commit 6cdfaa7 (antes de este cambio). Con todo apagado, la generada tiene que
 * ser IDÉNTICA carácter por carácter: «apagado = la web exactamente como hoy».
 */
const CSP_DE_PRODUCCION_HOY =
  "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self'; font-src 'self'; connect-src 'self'; media-src 'self'; frame-src 'self' https://calendly.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'"

describe('Content-Security-Policy global (lib/csp.mjs → next.config.mjs)', () => {
  it('existe y se aplica a todas las rutas', () => {
    expect(reglaGlobal, 'falta la regla source "/((?!tour/).*)" en vercel.json').toBeDefined()
    expect(csp).not.toBe('')
  })

  it('con todo apagado es EXACTAMENTE la cadena que había en vercel.json', () => {
    expect(csp).toBe(CSP_DE_PRODUCCION_HOY)
  })

  it('next.config.mjs la publica en el mismo source que usaba vercel.json', async () => {
    const reglas = (await nextConfig.headers!()) as { source: string; headers: Cabecera[] }[]
    expect(reglas).toHaveLength(1)
    expect(reglas[0].source).toBe('/((?!tour/).*)')
    expect(reglas[0].source).toBe(SOURCE_CSP_GLOBAL)
    expect(reglas[0].source).toBe(reglaGlobal?.source)
    expect(reglas[0].headers).toEqual([{ key: 'Content-Security-Policy', value: cspGlobal() }])
  })

  it('vercel.json NO lleva CSP en la regla global: dos CSP se intersecan y la de vercel.json anularía a Meta', () => {
    expect(reglaGlobal?.headers.map((h) => h.key)).not.toContain('Content-Security-Policy')
  })

  it('no lleva unsafe-eval', () => {
    expect(csp).not.toContain("'unsafe-eval'")
  })

  it("prohíbe que otros la enmarquen (frame-ancestors 'none')", () => {
    expect(d.get('frame-ancestors')).toEqual(["'none'"])
  })

  it("permite el iframe de Calendly (/meet), el del visor 360 propio ('self') y ningún otro origen de frame", () => {
    // 'self' lo necesita «Ver en 360°» (components/tour360): la ficha enmarca /tour/<slug>.
    expect(d.get('frame-src')).toEqual(["'self'", 'https://calendly.com'])
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

  it("img-src solo admite el propio dominio (ni orígenes externos, ni data: ni blob:)", () => {
    // Las fotos de /nosotros viven en public/images/nosotros. Si vuelve un
    // origen externo, alguna imagen se carga de fuera: se arregla la imagen, no la CSP.
    expect(d.get('img-src')).toEqual(["'self'"])
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

  it('no hay una segunda CSP global en otro sitio (una sola fuente: lib/csp.mjs)', async () => {
    const proxy = readFileSync(join(raiz, 'proxy.ts'), 'utf8')
    expect(proxy).not.toMatch(/Content-Security-Policy/i)
    // next.config.mjs solo la publica: la política en sí no se escribe allí.
    const next = readFileSync(join(raiz, 'next.config.mjs'), 'utf8')
    expect(next).not.toMatch(/default-src/)
  })
})

describe('CSP y Meta: los dominios del píxel solo con el interruptor encendido', () => {
  const ID = '123456789012345'
  const ENCENDIDO = { SEDA_FLAG_META_PIXEL: '1', NEXT_PUBLIC_META_PIXEL_ID: ID }
  const dMeta = directivas(cspGlobal(ENCENDIDO))

  it.each([
    [{}],
    [{ SEDA_FLAG_META_PIXEL: '0', NEXT_PUBLIC_META_PIXEL_ID: ID }],
    [{ SEDA_FLAG_META_PIXEL: 'true', NEXT_PUBLIC_META_PIXEL_ID: ID }],
    [{ SEDA_FLAG_META_PIXEL: '1' }], // encendido pero sin ID: no hay píxel, no se abre la CSP
    [{ SEDA_FLAG_META_PIXEL: '1', NEXT_PUBLIC_META_PIXEL_ID: 'abc' }],
    [{ SEDA_FLAG_META_CAPI: '1', NEXT_PUBLIC_META_PIXEL_ID: ID }], // la CAPI sola no abre nada
  ])('interruptores %j → la CSP de siempre, sin ni un dominio de Meta', (env) => {
    expect(cspGlobal(env)).toBe(CSP_DE_PRODUCCION_HOY)
    expect(cspGlobal(env)).not.toMatch(/facebook|fbcdn|meta\.com/)
  })

  it('encendido, añade solo lo que el píxel necesita, directiva por directiva', () => {
    expect(dMeta.get('script-src')).toEqual(["'self'", "'unsafe-inline'", 'https://connect.facebook.net'])
    expect(dMeta.get('img-src')).toEqual(["'self'", 'https://www.facebook.com'])
    expect(dMeta.get('connect-src')).toEqual(["'self'", 'https://www.facebook.com', 'https://connect.facebook.net'])
  })

  it('encendido, el resto de directivas no cambia ni un carácter', () => {
    const base = directivas(CSP_DE_PRODUCCION_HOY)
    for (const nombre of ['default-src', 'style-src', 'font-src', 'media-src', 'frame-src', 'frame-ancestors', 'base-uri', 'form-action', 'object-src']) {
      expect(dMeta.get(nombre), nombre).toEqual(base.get(nombre))
    }
  })

  it('encendido, sigue sin unsafe-eval, sin comodines y sin esquemas enteros', () => {
    const politica = cspGlobal(ENCENDIDO)
    expect(politica).not.toContain("'unsafe-eval'")
    for (const [nombre, valores] of dMeta) {
      for (const v of valores) {
        expect(v, `${nombre} ${v}`).not.toMatch(/\*/)
        expect(v, `${nombre} ${v}`).not.toMatch(/^(https?|data|blob|wss?):$/)
      }
    }
  })

  it('la API de conversiones va servidor→Meta: graph.facebook.com no entra en la CSP del navegador', () => {
    expect(cspGlobal({ ...ENCENDIDO, SEDA_FLAG_META_CAPI: '1', META_CAPI_TOKEN: 'x'.repeat(40) })).not.toContain('graph.facebook.com')
  })
})

describe('X-Powered-By', () => {
  it('next.config.mjs lo desactiva (poweredByHeader: false)', () => {
    const next = readFileSync(join(raiz, 'next.config.mjs'), 'utf8')
    expect(next).toMatch(/poweredByHeader:\s*false/)
  })
})
