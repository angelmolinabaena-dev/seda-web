import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { COOKIES } from '../lib/legal/cookies'

/**
 * Calendly detrás de una fachada en /meet (15-oct-2026, fix/meet-calendly-fachada).
 *
 * Al cargarse, el iframe de Calendly hace que calendly.com fije
 * `_calendly_session`, `__cf_bm` y `_cfuvid` (medido con `curl -D -` sobre la
 * URL del iframe). Antes se cargaba al abrir /meet, con `hide_gdpr_banner=1`,
 * mientras la política de cookies decía «Cookies de terceros: ninguna».
 *
 * Ahora el iframe solo se monta al pulsar «Ver calendario», y la política
 * de cookies lo cuenta en los cuatro idiomas. Este test vigila que nadie
 * vuelva a poner el iframe directamente en la página ni a ocultar el aviso
 * de Calendly, y que la política no pierda la sección. Que el navegador no
 * contacte con calendly.com antes del clic se comprobó en el navegador
 * (ver la descripción del PR).
 */
const raiz = process.cwd()
const pagina = readFileSync(join(raiz, 'app', '[locale]', 'meet', 'page.tsx'), 'utf8')
const fachada = readFileSync(join(raiz, 'app', '[locale]', 'meet', 'CalendlyFachada.tsx'), 'utf8')

describe('/meet: Calendly tras la fachada', () => {
  it('la página no inserta el iframe por sí misma', () => {
    expect(pagina).not.toMatch(/<iframe/)
    expect(pagina).toContain('<CalendlyFachada')
  })

  it('no oculta el aviso de cookies de Calendly', () => {
    expect(pagina).not.toContain('hide_gdpr_banner=')
    expect(fachada).not.toContain('hide_gdpr_banner=')
  })

  it('la fachada solo monta el iframe tras el clic', () => {
    expect(fachada).toMatch(/useState\(false\)/)
    expect(fachada.indexOf('if (abierto)')).toBeGreaterThan(-1)
    expect(fachada.indexOf('<iframe')).toBeGreaterThan(fachada.indexOf('if (abierto)'))
  })
})

describe('Política de cookies: Calendly en los cuatro idiomas', () => {
  for (const [idioma, doc] of Object.entries(COOKIES.traducciones)) {
    it(`${idioma}: sección calendly con las tres cookies medidas`, () => {
      const seccion = doc.secciones.find((s) => s.id === 'calendly')
      expect(seccion, 'falta la sección calendly').toBeDefined()
      const texto = JSON.stringify(seccion)
      for (const cookie of ['_calendly_session', '__cf_bm', '_cfuvid']) {
        expect(texto).toContain(cookie)
      }
    })
  }
})
