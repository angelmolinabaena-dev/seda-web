import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { arrancarNext, type ServidorNext } from './next-start'

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
let srv: ServidorNext
let base = ''

async function estado(ruta: string) {
  const res = await fetch(base + ruta, { redirect: 'manual' })
  await res.arrayBuffer()
  return res.status
}

beforeAll(async () => {
  srv = await arrancarNext()
  base = srv.base
}, 40_000)

afterAll(() => {
  srv?.parar()
})

describe('rutas que no existen → 404, no 500', () => {
  it.each(['/foo.png', '/wp-login.php', '/.env', '/nonexistent', '/en/guias/no-existe'])('%s → 404', async (ruta) => {
    expect(await estado(ruta)).toBe(404)
  })

  it('el servidor no registra «static to dynamic» al servirlas', () => {
    expect(srv.log()).not.toMatch(/static to dynamic/i)
  })
})

/*
  Escaparate de villas (lib/escaparate.ts). Este build se hace SIN
  SEDA_FLAG_ESCAPARATE_VILLAS (así corre en CI y así está producción): la
  ficha no existe, no sale en el sitemap y /coleccion no enlaza a ninguna.
  Las cuatro villas ficticias retiradas en agosto siguen en 410.
*/
describe('escaparate con el flag apagado', () => {
  it.each(['/villa/bay-side', '/en/villa/bay-side', '/de/villa/bay-side'])('%s → 404', async (ruta) => {
    expect(await estado(ruta)).toBe(404)
  })

  it('el sitemap no lista ninguna /villa/', async () => {
    const xml = await (await fetch(`${base}/sitemap.xml`)).text()
    expect(xml).toContain('<urlset')
    expect(xml).not.toContain('/villa/')
  })

  it('/coleccion no enlaza a ninguna /villa/', async () => {
    const html = await (await fetch(`${base}/coleccion`)).text()
    expect(html).not.toMatch(/href="[^"]*\/villa\//)
  })

  it('las villas ficticias retiradas siguen en 410', async () => {
    expect(await estado('/villa/villa-alboran')).toBe(410)
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
