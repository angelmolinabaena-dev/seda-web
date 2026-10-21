import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { routing, type Locale } from "@/i18n/routing"
import { autores } from "@/lib/autores"
import { guias } from "@/lib/guias"
import { OG_LOCALE, SITE_NAME, SITE_PAGES } from "@/lib/site-pages"
import { arrancarNext, type ServidorNext } from "./next-start"

/*
  Cada ruta, en su idioma (15-oct-2026, fix/meet-titulo-y-ci-rutas).

  Contra el HTML que sirve `next start`, no contra `pageMetadata`: lo que se
  hereda del layout raíz (en español) solo se ve en la página servida. /de/meet
  sacaba «Reserva una llamada» en la pestaña, y las páginas sin `openGraph`
  propio heredaban el og:title, el og:description y el og:locale es_ES del
  layout en los cuatro idiomas.

  Regla: en una misma ruta, ningún idioma puede llevar el mismo <title>,
  description, og:* o twitter:* que otro — salvo los nombres propios, que no
  se traducen. Y og:locale es el de la URL.

  Fuera: las páginas 404. Su metadata sale a propósito en el idioma por
  defecto (ver app/[locale]/not-found.tsx: leer el idioma ahí es un 500).
  Y /villa/<slug>, que con el flag apagado (CI, producción) es 404.
*/

/** Valores que son iguales en los cuatro idiomas porque no se traducen. */
const NEUTROS = new Set([SITE_NAME, "Ángel Molina", `Ángel Molina · ${SITE_NAME}`])

const CAMPOS = [
  ["title", /<title>([^<]*)<\/title>/],
  ["description", /<meta name="description" content="([^"]*)"/],
  ["og:title", /<meta property="og:title" content="([^"]*)"/],
  ["og:description", /<meta property="og:description" content="([^"]*)"/],
  ["twitter:title", /<meta name="twitter:title" content="([^"]*)"/],
  ["twitter:description", /<meta name="twitter:description" content="([^"]*)"/],
] as const

const RUTAS = [
  ...SITE_PAGES.map((p) => p.path),
  "/meet",
  "/founding-owners",
  "/guias",
  ...guias.map((g) => `/guias/${g.slug}`),
  ...Object.keys(autores).map((id) => `/guias/autores/${id}`),
]

const url = (locale: Locale, ruta: string) =>
  locale === routing.defaultLocale ? ruta || "/" : `/${locale}${ruta}`

function decodificar(s: string) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
}

function metas(html: string) {
  const head = html.slice(0, html.indexOf("</head>"))
  const out: Record<string, string | undefined> = {}
  for (const [campo, re] of CAMPOS) {
    const m = head.match(re)
    out[campo] = m ? decodificar(m[1]) : undefined
  }
  out["og:locale"] = head.match(/<meta property="og:locale" content="([^"]*)"/)?.[1]
  return out
}

let srv: ServidorNext

beforeAll(async () => {
  srv = await arrancarNext()
}, 40_000)

afterAll(() => srv?.parar())

describe("título, description y og:* en el idioma de la ruta", () => {
  it.each(RUTAS)("%s", async (ruta) => {
    const porIdioma = {} as Record<Locale, ReturnType<typeof metas>>
    for (const locale of routing.locales) {
      const res = await fetch(srv.base + url(locale, ruta))
      expect(res.status, url(locale, ruta)).toBe(200)
      porIdioma[locale] = metas(await res.text())
    }

    const problemas: string[] = []
    for (const locale of routing.locales) {
      const m = porIdioma[locale]
      if (m["og:locale"] !== OG_LOCALE[locale]) {
        problemas.push(`${url(locale, ruta)} og:locale = ${m["og:locale"]} (debe ser ${OG_LOCALE[locale]})`)
      }
      for (const [campo] of CAMPOS) {
        const v = m[campo]
        if (!v) {
          problemas.push(`${url(locale, ruta)} sin ${campo}`)
          continue
        }
        if (NEUTROS.has(v)) continue
        for (const otro of routing.locales) {
          if (otro !== locale && porIdioma[otro][campo] === v) {
            problemas.push(`${url(locale, ruta)} ${campo} = el de ${otro}: «${v}»`)
            break
          }
        }
      }
    }
    expect(problemas).toEqual([])
  })
})
