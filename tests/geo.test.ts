import { describe, expect, it } from "vitest"
import { createTranslator } from "use-intl/core"
import robots from "@/app/robots"
import sitemap from "@/app/sitemap"
import { routing, type Locale } from "@/i18n/routing"
import { EXPERIENCIAS } from "@/lib/experiencias"
import { faqHuespedes, faqPortada, faqPropietarios, type Translate } from "@/lib/faq"
import { getGuiasPublicadas } from "@/lib/guias"
import { breadcrumbJsonLd, businessJsonLd, faqPageJsonLd, zonasJsonLd, type JsonLd } from "@/lib/jsonld"
import { buildLlmsTxt } from "@/lib/llms"
import { asLocale, pageMetadata, SITE_PAGES } from "@/lib/site-pages"
import { ZONAS } from "@/lib/zonas"
import de from "@/messages/de.json"
import en from "@/messages/en.json"
import es from "@/messages/es.json"
import fr from "@/messages/fr.json"

/*
  Guarda del SEO/GEO generado: JSON-LD por tipo de página, llms.txt,
  robots.txt, sitemap y canonical/hreflang.

  Los campos obligatorios NO salen de lib/jsonld.ts sino de la documentación
  de datos estructurados de Google (developers.google.com/search/docs/
  appearance/structured-data): BreadcrumbList → itemListElement con
  ListItem{position, name, item}; FAQPage → mainEntity con
  Question{name, acceptedAnswer: Answer{text}}; Organization → name, url.
  Los nombres de los rastreadores de IA son los del encargo
  (docs/prompts/LA-WEB-AL-100.md), escritos aquí a mano.

  El traductor lanza si falta una clave: un texto sin traducir en cualquiera
  de los cuatro idiomas rompe el test en vez de colarse en el JSON-LD como
  «faq.items.q1.q».
*/

const MESSAGES = { es, en, fr, de } as const
const SITE = "https://sedaprivatehomes.com"

function translator(locale: Locale): Translate {
  const t = createTranslator({
    locale,
    messages: MESSAGES[locale],
    onError: (e) => {
      throw e
    },
  })
  return (key: string) => t(key as never)
}

/** Recorre el objeto: ningún undefined, null, NaN ni cadena vacía o en blanco. */
function huecos(value: unknown, path = "$"): string[] {
  if (value === undefined || value === null) return [`${path} es ${value}`]
  if (typeof value === "number" && Number.isNaN(value)) return [`${path} es NaN`]
  if (typeof value === "string") return value.trim() === "" ? [`${path} está vacío`] : []
  if (Array.isArray(value))
    return value.length === 0 ? [`${path} es una lista vacía`] : value.flatMap((v, i) => huecos(v, `${path}[${i}]`))
  if (typeof value === "object") return Object.entries(value).flatMap(([k, v]) => huecos(v, `${path}.${k}`))
  return []
}

const expectSinHuecos = (data: JsonLd) => expect(huecos(data)).toEqual([])
const esUrlDelSitio = (s: unknown) => typeof s === "string" && s.startsWith(SITE)

describe.each(routing.locales)("JSON-LD en %s", (locale) => {
  const t = translator(locale)

  it("Organization y LodgingBusiness del sitio: name, url, address; sin huecos", () => {
    const data = businessJsonLd()
    expectSinHuecos(data)
    const graph = data["@graph"] as JsonLd[]
    const org = graph.find((n) => n["@type"] === "Organization")!
    const lodging = graph.find((n) => n["@type"] === "LodgingBusiness")!
    expect(org.name).toBe("SEDA Private Homes")
    expect(org.url).toBe(SITE)
    expect(lodging.address).toMatchObject({ "@type": "PostalAddress", addressCountry: "ES" })
    // Ningún campo inventado: los que el sitio decidió no publicar siguen fuera.
    expect(lodging).not.toHaveProperty("priceRange")
    expect(lodging).not.toHaveProperty("identifier")
  })

  it.each(SITE_PAGES.filter((p) => p.path !== ""))("BreadcrumbList de $path", (page) => {
    const name = page.copy(t, locale).title
    const data = breadcrumbJsonLd(locale, [
      { name: t("breadcrumb.home"), path: "" },
      { name, path: page.path },
    ])
    expectSinHuecos(data)
    expect(data["@type"]).toBe("BreadcrumbList")
    const items = data.itemListElement as JsonLd[]
    expect(items.map((i) => i.position)).toEqual([1, 2])
    for (const item of items) {
      expect(item["@type"]).toBe("ListItem")
      expect(esUrlDelSitio(item.item)).toBe(true)
    }
  })

  it.each([
    ["portada", faqPortada],
    ["/faq", (tr: Translate) => [...faqHuespedes(tr), ...faqPropietarios(tr)]],
  ] as const)("FAQPage de %s: cada pregunta con su respuesta", (_where, lista) => {
    const data = faqPageJsonLd(lista(t))
    expectSinHuecos(data)
    for (const q of data.mainEntity as JsonLd[]) {
      expect(q["@type"]).toBe("Question")
      expect((q.acceptedAnswer as JsonLd)["@type"]).toBe("Answer")
    }
  })

  it("las zonas de /descubre como Place", () => {
    const data = zonasJsonLd(locale, `${t("descubre.presence.h2.line1")} ${t("descubre.presence.h2.italic")}`)
    expectSinHuecos(data)
    const places = (data.itemListElement as JsonLd[]).map((i) => i.item as JsonLd)
    expect(places.map((p) => p.name)).toEqual(ZONAS.map((z) => z.name))
    for (const p of places) expect(p["@type"]).toBe("Place")
  })
})

describe("canonical y hreflang en el <head> de cada página", () => {
  it.each(SITE_PAGES.flatMap((p) => routing.locales.map((l) => [l, p.path] as const)))(
    "%s %s",
    (locale, path) => {
      const meta = pageMetadata(locale, path, translator(locale))
      expect(meta.alternates?.canonical).toBe(locale === "es" ? `${SITE}${path || "/"}` : `${SITE}/${locale}${path}`)
      expect(Object.keys(meta.alternates?.languages ?? {}).sort()).toEqual(["de", "en", "es", "fr", "x-default"])
      expect(meta.title).toBeTruthy()
      expect(meta.description).toBeTruthy()
    },
  )

  it("un caso a mano: /en/propietarios", () => {
    const meta = pageMetadata("en", "/propietarios", translator("en"))
    expect(meta.alternates?.canonical).toBe("https://sedaprivatehomes.com/en/propietarios")
    expect(meta.alternates?.languages).toMatchObject({
      es: "https://sedaprivatehomes.com/propietarios",
      "x-default": "https://sedaprivatehomes.com/propietarios",
    })
  })
})

describe("llms.txt", () => {
  const t = translator(asLocale("es"))
  const txt = buildLlmsTxt(t)
  const full = buildLlmsTxt(t, { full: true })

  it("empieza como pide llmstxt.org: H1 y resumen en cita", () => {
    expect(txt.startsWith("# SEDA Private Homes\n\n> ")).toBe(true)
  })

  it("lista todas las páginas del catálogo con su URL", () => {
    for (const p of SITE_PAGES) expect(txt).toContain(`(${SITE}${p.path || "/"})`)
  })

  it("lista las zonas, las experiencias y las preguntas frecuentes", () => {
    for (const z of ZONAS) expect(txt).toContain(z.name)
    for (const { id } of EXPERIENCIAS) expect(txt).toContain(t(`exp.catalog.items.${id}.title`))
    for (const { q } of [...faqHuespedes(t), ...faqPropietarios(t)]) expect(txt).toContain(q)
  })

  it("lista todas las guías publicadas (y ningún borrador)", () => {
    for (const g of getGuiasPublicadas()) expect(txt).toContain(`${SITE}/guias/${g.slug}`)
    expect(txt).not.toContain("guia-de-prueba-interna")
  })

  it("la versión completa trae las respuestas", () => {
    for (const { a } of [...faqHuespedes(t), ...faqPropietarios(t), ...faqPortada(t)]) expect(full).toContain(a)
  })

  it("no se cuela ningún hueco", () => {
    for (const s of [txt, full]) expect(s).not.toMatch(/undefined|null|NaN|\]\(\)|: $/m)
  })
})

describe("robots.txt y sitemap", () => {
  it("permite los rastreadores de IA del encargo y apunta al sitemap", () => {
    const r = robots()
    const rules = Array.isArray(r.rules) ? r.rules : [r.rules]
    for (const bot of ["GPTBot", "OAI-SearchBot", "ClaudeBot", "Claude-SearchBot", "PerplexityBot", "Google-Extended"]) {
      const rule = rules.find((x) => [x.userAgent].flat().includes(bot))
      expect(rule, bot).toBeDefined()
      expect(rule!.allow).toBe("/")
      expect([rule!.disallow].flat()).not.toContain("/")
    }
    expect(rules.find((x) => x.userAgent === "*")?.allow).toBe("/")
    expect(r.sitemap).toBe(`${SITE}/sitemap.xml`)
  })

  it("el sitemap lleva cada página en los cuatro idiomas, con hreflang", () => {
    const urls = sitemap()
    for (const p of SITE_PAGES)
      for (const l of routing.locales) {
        const url = l === "es" ? `${SITE}${p.path || "/"}` : `${SITE}/${l}${p.path}`
        const entry = urls.find((u) => u.url === url)
        expect(entry, url).toBeDefined()
        expect(Object.keys(entry!.alternates?.languages ?? {})).toHaveLength(5)
      }
  })
})
