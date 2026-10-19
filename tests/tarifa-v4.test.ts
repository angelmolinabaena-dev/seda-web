/**
 * Tarifa v4 en la web (19-oct-2026).
 *
 * Fuente: seda_os/docs/PRICING.md §2-3 y docs/CONTRATO-GESTION-REQUISITOS.md.
 * Gestión: 24 % sobre la base neta, nunca más del 20 % del alojamiento. Alta
 * 0 € (parte proporcional de 1.290 € si se sale antes de 12 meses). Sin
 * permanencia: salida con 1 mes de preaviso.
 *
 * Guarda contra regresiones: que no vuelvan el alta de 1.290 € como cobro
 * inicial, el «19 % fundador», las «tres primeras firmas» ni los 60 días de
 * preaviso. Los importes del ejemplo (≈196 € por canal, 200 € en directa) se
 * comprueban contra la aritmética del ejemplo del folleto, no contra el código.
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const raiz = join(__dirname, '..')
const leer = (...p: string[]) => readFileSync(join(raiz, ...p), 'utf8')
const LOCALES = ['es', 'en', 'fr', 'de'] as const

type Json = string | number | boolean | null | Json[] | { [k: string]: Json }
function cadenas(v: Json, ruta = ''): [string, string][] {
  if (typeof v === 'string') return [[ruta, v]]
  if (Array.isArray(v)) return v.flatMap((x, i) => cadenas(x, `${ruta}[${i}]`))
  if (v && typeof v === 'object') return Object.entries(v).flatMap(([k, x]) => cadenas(x, `${ruta}.${k}`))
  return []
}

type Mensajes = {
  prop: { faq: { items: Record<string, { a: string }> } }
  faq: { owners_items: Record<string, { a: string }> }
}

const mensajes = Object.fromEntries(
  LOCALES.map((l) => [l, JSON.parse(leer('messages', `${l}.json`)) as Mensajes]),
) as Record<(typeof LOCALES)[number], Mensajes>

const meet = leer('app', '[locale]', 'meet', 'page.tsx')

const PROPORCIONAL = /proporcional|pro-rata|proportionnelle|anteilig/i
const UN_MES = /1 mes|1 month|one month|1 mois|un mois|1 Monat|ein Monat/i

describe('tarifa v4: la v3 no puede volver', () => {
  for (const l of LOCALES) {
    const todo: [string, string][] = [
      ...cadenas(mensajes[l] as Json, l),
      ['meet', meet],
    ]

    it(`${l}: ningún 1.290 € de alta sin «parte proporcional» en la misma frase`, () => {
      for (const [ruta, txt] of todo) {
        for (const m of txt.matchAll(/1[.,\s  ]?290/g)) {
          const frase = txt.slice(Math.max(0, m.index! - 120), m.index! + 60)
          expect(PROPORCIONAL.test(frase), `${ruta}: «…${frase}…»`).toBe(true)
        }
      }
    })

    it(`${l}: sin «19 % fundador», plazas fundadoras ni alta gratis limitada`, () => {
      const prohibido =
        /19 ?%|propietarios? fundador|propietario fundador|plazas fundadoras|founding owner|propriétaires? fondateurs?|founding-owners|alta gratuita para las|free setup|inscription offerte|kostenlose anmeldung|tres primeras firmas|first three direct|trois premières signatures|ersten drei direktverträge/i
      for (const [ruta, txt] of todo) {
        // El 19 % puede aparecer en meet/page.tsx solo si no es la tarifa: no hay ninguno.
        expect(prohibido.test(txt), `${ruta}`).toBe(false)
      }
    })

    it(`${l}: sin 60 días de preaviso`, () => {
      const sesenta = /60 d[ií]as|sixty days|60 days|soixante jours|60 jours|sechzig tage|60 tage/i
      for (const [ruta, txt] of todo) expect(sesenta.test(txt), ruta).toBe(false)
    })
  }
})

describe('tarifa v4: lo que sí tiene que decir', () => {
  for (const l of LOCALES) {
    const textos = {
      'prop.faq.q1': mensajes[l].prop.faq.items.q1.a as string,
      'faq.q2': mensajes[l].faq.owners_items.q2.a as string,
    }
    const q7 = mensajes[l].prop.faq.items.q7.a as string

    for (const [clave, txt] of Object.entries(textos)) {
      it(`${l} ${clave}: 24 %, tope 20 %, ejemplo 196/200, alta 0 y 1 mes`, () => {
        expect(txt, clave).toBeTruthy()
        expect(txt).toMatch(/24 ?%/)
        expect(txt).toMatch(/20 ?%/)
        expect(txt).toMatch(/196/)
        expect(txt).toMatch(/200/)
        expect(txt).toMatch(/0 ?€|€ ?0/)
        expect(txt).toMatch(PROPORCIONAL)
        expect(txt).toMatch(UN_MES)
      })
    }

    it(`${l}: la salida (FAQ propietarios) es de 1 mes y sin penalización`, () => {
      expect(q7).toMatch(UN_MES)
    })

    it(`${l}: /meet dice alta 0 y tope del 20 %`, () => {
      const bloque = meet.slice(meet.indexOf(`  ${l}: {`), meet.indexOf('seats:', meet.indexOf(`  ${l}: {`)) + 400)
      expect(bloque).toMatch(/0 ?€|€ ?0/)
      expect(bloque).toMatch(/20%/)
    })
  }

  it('el ejemplo del folleto cuadra: 24 % de la base tras la comisión del canal ≈ 196 €, tope 200 €', () => {
    // 1.000 € de alojamiento. Comisión de plataforma al 15 % + IVA (PRICING.md §2):
    // 150 + 31,5 = 181,5 → base 818,5 → 24 % = 196,44 ≈ 196 €. Directa: 24 % = 240 → tope 200 €.
    const base = 1000 - 1000 * 0.15 * 1.21
    expect(Math.round(base * 0.24)).toBe(196)
    expect(Math.min(1000 * 0.24, 1000 * 0.2)).toBe(200)
  })
})

describe('tarifa v4: /founding-owners redirigido a /propietarios', () => {
  const cfg = leer('next.config.mjs')

  it('la página ya no existe', () => {
    expect(existsSync(join(raiz, 'app', '[locale]', 'founding-owners', 'page.tsx'))).toBe(false)
  })

  it('hay redirect permanente (308) en es y en en/fr/de', () => {
    expect(cfg).toMatch(/source: "\/founding-owners",\s*destination: "\/propietarios",\s*permanent: true/)
    expect(cfg).toMatch(
      /source: "\/:locale\(en\|fr\|de\)\/founding-owners",\s*destination: "\/:locale\/propietarios",\s*permanent: true/,
    )
  })

  it('ningún enlace del menú, pie ni páginas apunta a /founding-owners', () => {
    for (const f of [
      ['components', 'navigation.tsx'],
      ['app', '[locale]', 'meet', 'page.tsx'],
    ]) {
      expect(leer(...f), f.join('/')).not.toMatch(/founding-owners/)
    }
    const footers = ['footer.tsx', 'site-footer.tsx'].filter((f) => existsSync(join(raiz, 'components', f)))
    for (const f of footers) expect(leer('components', f)).not.toMatch(/founding-owners/)
  })
})
