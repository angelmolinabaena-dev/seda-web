import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { routing, type Locale } from "@/i18n/routing"
import { autores } from "@/lib/autores"
import { esPublicable, getGuiaBySlug, guias } from "@/lib/guias"
import { ESTRUCTURA, TEXTOS, formatearRef, requisitosDe } from "@/lib/guias-contenido/vut-andalucia"

/*
  Guía «Requisitos de una vivienda turística en Andalucía».

  Regla del proyecto (CLAUDE.md, «Un test en verde no demuestra corrección»): una
  guía legal no se prueba contra otro texto escrito en la misma sesión, sino contra
  la norma. Por eso lo central de este fichero es confrontar CADA requisito con la
  copia del texto consolidado oficial del Decreto 28/2016 (docs/fuentes/…): la cita
  literal que lleva cada requisito tiene que estar en el artículo — y en el
  apartado y la letra — que el requisito dice citar.
*/

const raiz = process.cwd()
const SLUG = "requisitos-vivienda-turistica-andalucia"
const OFICIAL = readFileSync(join(raiz, "docs/fuentes/DECRETO-28-2016-consolidado.txt"), "utf8")
// El texto oficial empieza tras la cabecera de procedencia (hasta la línea de «=»).
const TEXTO = OFICIAL.slice(OFICIAL.indexOf("DECRETO 28/2016, DE 2 DE FEBRERO"))

const norm = (s: string) => s.replace(/ /g, " ").replace(/\s+/g, " ").trim()

/** Texto de un artículo (sin acento en algunos encabezados del PDF oficial: «Articulo 3»). */
function articulo(n: string): string {
  const cab = new RegExp(`^[ \\t\\f]*Art[ií]culo ${n}\\.[^\\n]*\\n`, "m").exec(TEXTO)
  if (!cab) throw new Error(`no encuentro el artículo ${n} en el texto oficial`)
  const resto = TEXTO.slice(cab.index + cab[0].length)
  const fin = resto.search(/^[ \t\f]*(Art[ií]culo \d+\.|Disposici[oó]n (adicional|transitoria|final)|CAP[IÍ]TULO)/m)
  return fin < 0 ? resto : resto.slice(0, fin)
}

/** Trozo que empieza en una línea que casa `inicio` y acaba justo antes de la siguiente que casa `siguiente`. */
function tramo(texto: string, inicio: RegExp, siguiente: RegExp): string {
  const m = inicio.exec(texto)
  if (!m) return ""
  const desde = m.index + m[0].length
  const resto = texto.slice(desde)
  const fin = resto.search(siguiente)
  return m[0] + (fin < 0 ? resto : resto.slice(0, fin))
}

/** El fragmento del texto oficial que corresponde a un `ref` («6.1.d», «anexo.c», «11»). */
function fragmentoOficial(ref: string): string {
  if (ref.startsWith("anexo.")) {
    const anexo = TEXTO.slice(TEXTO.search(/Anexo\. Requisitos adicionales/))
    const letra = ref.slice(6)
    return tramo(anexo, new RegExp(`^[ \\t\\f]*${letra}\\)[ \\t\\f]`, "m"), /^[ \t\f]*[a-f]\)[ \t\f]/m)
  }
  const [art, apartado, letra] = ref.split(".")
  let txt = articulo(art)
  if (apartado) {
    const sig = String(Number(apartado) + 1)
    txt = tramo(txt, new RegExp(`^[ \\t\\f]*${apartado}\\.[ \\t\\f]`, "m"), new RegExp(`^[ \\t\\f]*${sig}\\.[ \\t\\f]`, "m"))
  }
  if (letra) txt = tramo(txt, new RegExp(`^[ \\t\\f]*${letra}\\)[ \\t\\f]`, "m"), /^[ \t\f]*[a-h]\)[ \t\f]/m)
  return txt
}

const items = ESTRUCTURA.flatMap((g) => g.items.map((i) => ({ ...i, grupo: g.id })))

describe("cada requisito está en el texto oficial, en el apartado que cita", () => {
  it("el texto oficial copiado es el del Decreto 28/2016 consolidado (no un texto cualquiera)", () => {
    expect(TEXTO).toContain("POR EL QUE SE REGULAN LAS VIVIENDAS DE USO TURÍSTICO")
    expect(TEXTO).toContain("Modificado por el Decreto-ley 1/2025, de 24 de febrero")
    expect(TEXTO).toContain("Modificado por el Decreto 31/2024, de 29 de enero")
  })

  it("control negativo: una cita inventada NO se encuentra, y un apartado equivocado tampoco", () => {
    expect(norm(fragmentoOficial("6.1.b"))).not.toContain("exigir una fianza")
    // La cita de superficie existe, pero no está en el art. 7.
    expect(norm(fragmentoOficial("7.1"))).not.toContain("14 m² por plaza")
    // Y los tramos no están vacíos (un tramo vacío haría pasar cualquier cosa por «no contiene»).
    for (const ref of ["6.1.b", "6.2.c", "7.4", "9.1.h", "anexo.d", "1.3", "11"]) {
      expect(fragmentoOficial(ref).length, ref).toBeGreaterThan(40)
    }
  })

  it.each(items.map((i) => [i.id, i] as const))("%s", (_id, item) => {
    const tramoOficial = norm(fragmentoOficial(item.ref))
    expect(tramoOficial.length, `no se pudo aislar ${item.ref}`).toBeGreaterThan(0)
    expect(item.cita.length, "un requisito sin cita no se publica").toBeGreaterThan(0)
    for (const cita of item.cita) {
      expect(tramoOficial, `«${cita}» no está en ${item.ref} del texto oficial`).toContain(norm(cita))
    }
  })
})

describe("los cuatro idiomas dicen lo mismo", () => {
  const idsEstructura = items.map((i) => i.id).sort()

  it.each(routing.locales)("%s: cubre exactamente los mismos requisitos y grupos, sin textos vacíos", (loc) => {
    expect(Object.keys(TEXTOS[loc].items).sort()).toEqual(idsEstructura)
    expect(Object.keys(TEXTOS[loc].grupos).sort()).toEqual(ESTRUCTURA.map((g) => g.id).sort())
    for (const [id, t] of Object.entries(TEXTOS[loc].items)) expect(t.trim().length, id).toBeGreaterThan(10)
  })

  const cifras = (s: string) => (s.match(/\d+/g) ?? []).sort().join(",")
  it.each(routing.locales.filter((l) => l !== "es"))(
    "%s: ninguna cifra (plazas, m², cm, horas, apartados) difiere de la versión en español",
    (loc) => {
      const dif: string[] = []
      for (const i of items) {
        if (cifras(TEXTOS[loc].items[i.id]) !== cifras(TEXTOS.es.items[i.id])) {
          dif.push(`${i.id}: es[${cifras(TEXTOS.es.items[i.id])}] ≠ ${loc}[${cifras(TEXTOS[loc].items[i.id])}]`)
        }
      }
      expect(dif).toEqual([])
    },
  )

  it("las cifras del español coinciden con las del texto oficial (14 m², 25 m², 15 y 6 plazas, 80/135 × 190, 18 cm, 15:00/11:00)", () => {
    const oficial = norm(TEXTO)
    expect(oficial).toContain("14 m² por plaza")
    expect(oficial).toContain("25 m²")
    expect(oficial).toContain("quince plazas")
    expect(oficial).toContain("seis plazas")
    expect(oficial).toContain("80* 190 cm")
    expect(oficial).toContain("135* 190 cm")
    expect(oficial).toContain("grosor mínimo de 18 cm")
    expect(oficial).toContain("desde las 15 horas")
    expect(oficial).toContain("hasta las 11:00 horas")
    const es = TEXTOS.es.items
    expect(es["g-superficie"]).toContain("14 m²")
    expect(es["g-superficie"]).toContain("25 m²")
    expect(es["g-capacidad"]).toMatch(/15 plazas.*6/)
    expect(es["d-camas"]).toContain("80 × 190")
    expect(es["d-camas"]).toContain("135 × 190")
    expect(es["d-colchones"]).toContain("18 cm")
    expect(es["i-horario"]).toContain("15:00")
    expect(es["i-horario"]).toContain("11:00")
  })

  it("no se publica ningún importe, tasa ni plazo que el texto oficial no recoja", () => {
    for (const loc of routing.locales) {
      for (const [id, t] of Object.entries(TEXTOS[loc].items)) {
        expect(t, `${loc}/${id}`).not.toMatch(/€|\beuros?\b|\bEUR\b|\bmultas?\b|\bfines?\b|Bußgeld|\bamendes?\b|\btasas?\b|\bfees?\b/i)
      }
    }
  })
})

describe("la ficha de la guía", () => {
  const guia = getGuiaBySlug(SLUG)!

  it("existe, está publicada y la guía de prueba interna ya no está en el catálogo", () => {
    expect(guia).toBeDefined()
    expect(esPublicable(guia)).toBe(true)
    expect(guias.map((g) => g.slug)).not.toContain("guia-de-prueba-interna")
  })

  it("título en cada idioma: el de es es el pedido y ningún otro idioma lo repite", () => {
    expect(guia.traducciones.es.titulo).toBe("Requisitos de una vivienda turística en Andalucía")
    const titulos = routing.locales.map((l) => guia.traducciones[l].titulo)
    expect(new Set(titulos).size).toBe(routing.locales.length)
    const entradillas = routing.locales.map((l) => guia.traducciones[l].entradilla)
    expect(new Set(entradillas).size).toBe(routing.locales.length)
  })

  it("autor Ángel (entidad existente), fecha de revisión válida y no futura, fuentes oficiales", () => {
    expect(guia.autorId).toBe("angel-molina")
    expect(autores["angel-molina"]).toBeDefined()
    for (const f of [guia.fechaPublicacion, guia.fechaRevision]) {
      expect(f).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(Number.isNaN(Date.parse(f!))).toBe(false)
      expect(Date.parse(f!)).toBeLessThanOrEqual(Date.now())
    }
    expect(guia.fechaRevision! >= guia.fechaPublicacion!).toBe(true)
    expect(guia.fuentes.length).toBeGreaterThanOrEqual(3)
    for (const f of guia.fuentes) {
      const u = new URL(f.url)
      expect(u.protocol).toBe("https:")
      expect(["www.juntadeandalucia.es", "www.boe.es"]).toContain(u.hostname)
    }
  })

  it.each(routing.locales)("%s: lleva los 8 grupos en orden, y cada requisito con su artículo", (loc: Locale) => {
    const reqs = guia.traducciones[loc].requisitos!
    expect(reqs.map((g) => g.id)).toEqual([
      "general", "dormitorios", "banos", "cocina", "salon", "seguridad", "informacion", "alta",
    ])
    expect(reqs).toEqual(requisitosDe(loc))
    for (const g of reqs) {
      for (const i of g.items) {
        expect(formatearRef(i.ref, loc), i.id).toMatch(/\d|letra|letter|Buchstabe|lettre/)
      }
    }
  })

  it("las referencias se rotulan en el idioma de la página", () => {
    expect(formatearRef("6.1.d", "es")).toBe("art. 6.1.d")
    expect(formatearRef("6.1.d", "de")).toBe("Art. 6.1.d")
    expect(formatearRef("9.1", "fr")).toBe("art. 9.1")
    expect(formatearRef("11", "en")).toBe("art. 11")
    expect(formatearRef("anexo.c", "es")).toBe("anexo, letra c")
    expect(formatearRef("anexo.c", "en")).toBe("annex, letter c")
    expect(formatearRef("anexo.c", "de")).toBe("Anhang, Buchstabe c")
    expect(formatearRef("anexo.c", "fr")).toBe("annexe, lettre c")
  })

  it("el catálogo lleva calculadora: true y el cuerpo de cada idioma declara la fuente única", () => {
    expect(guia.calculadora).toBe(true)
    for (const loc of routing.locales) {
      const cuerpo = guia.traducciones[loc].cuerpo.join(" ")
      expect(cuerpo, loc).toContain("28/2016")
      expect(cuerpo, loc).toContain("31/2024")
      expect(cuerpo, loc).toContain("1/2025")
    }
  })
})

describe("estado de publicación: falla cerrado", () => {
  it("solo «publicada» se publica", () => {
    expect(esPublicable({ estado: "publicada" })).toBe(true)
    expect(esPublicable({ estado: "borrador" })).toBe(false)
    expect(esPublicable({ estado: "Publicada" as never })).toBe(false)
    expect(esPublicable({ estado: undefined as never })).toBe(false)
    expect(esPublicable(null)).toBe(false)
    expect(esPublicable(undefined)).toBe(false)
  })
})

describe("la versión para imprimir y la CSP", () => {
  const page = readFileSync(join(raiz, "app/[locale]/guias/[slug]/page.tsx"), "utf8")
  const boton = readFileSync(join(raiz, "components/boton-imprimir.tsx"), "utf8")
  const css = readFileSync(join(raiz, "app/globals.css"), "utf8")

  it("imprime con un onClick de React: ni script en línea ni onclick en el HTML (la CSP no admite unsafe-inline)", () => {
    expect(boton).toContain("window.print()")
    expect(boton).toContain('"use client"')
    for (const f of [page, boton]) {
      expect(f).not.toMatch(/\sonclick\s*=/)
      expect(f).not.toMatch(/javascript:/i)
    }
    // Único <script> de la ficha: JSON-LD (datos, no código).
    expect([...page.matchAll(/<script[^>]*>/g)].map((m) => m[0]).every((s) => s.includes("application/ld+json"))).toBe(true)
  })

  it("al imprimir se esconden cabecera y pie solo en las guías imprimibles", () => {
    expect(css).toMatch(/@media print[\s\S]*body:has\(\[data-guia-imprimible\]\) header/)
    expect(page).toContain("data-guia-imprimible")
  })

  it("la calculadora solo se enlaza con su flag encendido (la ruta es 404 con el flag apagado)", () => {
    expect(page).toContain("calculadoraPropietariosActiva()")
    expect(page).toMatch(/mostrarCalculadora\s*&&/)
  })
})
