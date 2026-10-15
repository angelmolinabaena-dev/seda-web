import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { spawn, type ChildProcess } from 'node:child_process'
import { existsSync } from 'node:fs'
import { createServer } from 'node:net'
import { join } from 'node:path'

/**
 * Lo que no existe da 404 (15-oct-2026, fix/rutas-con-extension-404).
 *
 * Contra un `next start` de verdad sobre el build de producción, no contra un
 * mock: el fallo solo aparecía ahí. `/foo.png`, `/wp-login.php`, `/.env` (y
 * cualquier ruta con extensión que no sea un fichero de public/) respondían
 * 500 «Page changed from static to dynamic at runtime, reason: headers»: el
 * `generateMetadata` de app/[locale]/not-found.tsx llamaba a next-intl sin
 * locale y next-intl lo buscaba en las cabeceras. Igual con un `notFound()` de
 * ficha, p. ej. `/en/guias/<slug-que-no-existe>`.
 *
 * Necesita el build: `npm run build && npm run test:integracion`. Por eso no
 * está en `npm test`, que en CI corre antes de `next build`.
 */
const raiz = process.cwd()
let servidor: ChildProcess
let base = ''
let log = ''

function puertoLibre(): Promise<number> {
  return new Promise((resolve, reject) => {
    const s = createServer()
    s.once('error', reject)
    s.listen(0, () => {
      const dir = s.address()
      const puerto = typeof dir === 'object' && dir ? dir.port : 0
      s.close(() => resolve(puerto))
    })
  })
}

async function esperarListo(url: string, ms: number) {
  const fin = Date.now() + ms
  while (Date.now() < fin) {
    try {
      await fetch(url)
      return
    } catch {
      await new Promise((r) => setTimeout(r, 250))
    }
  }
  throw new Error(`next start no respondió en ${ms} ms. Log:\n${log}`)
}

async function estado(ruta: string) {
  const res = await fetch(base + ruta, { redirect: 'manual' })
  await res.arrayBuffer()
  return res.status
}

beforeAll(async () => {
  if (!existsSync(join(raiz, '.next', 'BUILD_ID'))) {
    throw new Error('No hay build de producción: ejecuta `npm run build` antes de `npm run test:integracion`.')
  }
  const puerto = await puertoLibre()
  base = `http://localhost:${puerto}`
  servidor = spawn(process.execPath, [join(raiz, 'node_modules', 'next', 'dist', 'bin', 'next'), 'start', '-p', String(puerto)], {
    cwd: raiz,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  servidor.stdout?.on('data', (b) => (log += b))
  servidor.stderr?.on('data', (b) => (log += b))
  await esperarListo(`${base}/robots.txt`, 30_000)
}, 40_000)

afterAll(() => {
  servidor?.kill()
})

describe('rutas que no existen → 404, no 500', () => {
  it.each(['/foo.png', '/wp-login.php', '/.env', '/nonexistent', '/en/guias/no-existe'])('%s → 404', async (ruta) => {
    expect(await estado(ruta)).toBe(404)
  })

  it('el servidor no registra «static to dynamic» al servirlas', () => {
    expect(log).not.toMatch(/static to dynamic/i)
  })
})

describe('ficheros reales de public/ y páginas → 200', () => {
  it.each([
    '/',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '/brand/favicon/favicon.svg',
    '/images/nosotros/tripadvisor-travellers-choice-2024.webp',
  ])('%s → 200', async (ruta) => {
    expect(await estado(ruta)).toBe(200)
  })
})
