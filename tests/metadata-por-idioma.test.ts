import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { routing } from "@/i18n/routing"
import { SITE_NAME, SITE_PAGES, pageMetadata } from "@/lib/site-pages"

/*
  Guarda de metadatos: para cada página y cada idioma que no sea `es`, el
  `<title>`, la `description` y el `og:title` no pueden ser los del español
  (salvo la marca sola). Origen: la portada servía el título y la descripción
  en español en /en, /fr y /de — lo que Google y las IA enseñaban como resultado.
*/

type Tree = { [k: string]: string | string[] | Tree }
const ROOT = path.resolve(__dirname, "..")
const bundle = (l: string): Tree => JSON.parse(readFileSync(path.join(ROOT, "messages", `${l}.json`), "utf8"))

function translator(l: string) {
  const tree = bundle(l)
  return (key: string): string => {
    let cur: unknown = tree
    for (const part of key.split(".")) cur = (cur as Tree | undefined)?.[part]
    if (typeof cur !== "string") throw new Error(`${l}: falta ${key}`)
    return cur
  }
}

const str = (v: unknown): string => (typeof v === "string" ? v : "")
const titleOf = (m: ReturnType<typeof pageMetadata>) =>
  typeof m.title === "object" && m.title && "absolute" in m.title ? str(m.title.absolute) : str(m.title)
const ogTitleOf = (m: ReturnType<typeof pageMetadata>) => str((m.openGraph as { title?: unknown } | null | undefined)?.title)
const ogDescOf = (m: ReturnType<typeof pageMetadata>) =>
  str((m.openGraph as { description?: unknown } | null | undefined)?.description)

const others = routing.locales.filter((l) => l !== "es")

describe("metadatos por idioma", () => {
  for (const page of SITE_PAGES) {
    const es = pageMetadata("es", page.path, translator("es"))
    for (const locale of others) {
      it(`${page.path || "/"} en ${locale} no repite el español`, () => {
        const m = pageMetadata(locale, page.path, translator(locale))
        const distinto = (a: string, b: string) => a === SITE_NAME || a === "Ángel Molina" || a !== b
        expect(titleOf(m)).not.toBe("")
        expect(m.description).toBeTruthy()
        expect(distinto(titleOf(m), titleOf(es))).toBe(true)
        expect(distinto(str(m.description), str(es.description))).toBe(true)
        expect(distinto(ogTitleOf(m), ogTitleOf(es))).toBe(true)
        expect(distinto(ogDescOf(m), ogDescOf(es))).toBe(true)
      })
    }
  }

  it("la portada lleva og:locale propio por idioma", () => {
    const loc = (l: string) => (pageMetadata(l, "", translator(l)).openGraph as { locale?: string }).locale
    expect(loc("es")).toBe("es_ES")
    expect(loc("en")).toBe("en_GB")
    expect(loc("fr")).toBe("fr_FR")
    expect(loc("de")).toBe("de_DE")
  })

  it("el español de la portada no cambia", () => {
    const m = pageMetadata("es", "", translator("es"))
    expect(titleOf(m)).toBe("SEDA Private Homes — Villas privadas en la Costa del Sol")
    expect(m.description).toBe(
      "Gestión de villas privadas en la Costa del Sol, operada sobre software propio. Hospitalidad mediterránea para huéspedes, transparencia total para propietarios.",
    )
  })
})
