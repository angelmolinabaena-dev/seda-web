import { readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { routing } from "@/i18n/routing"

/*
  Guarda de traducciones: es.json es la fuente; en, fr y de tienen que tener
  exactamente sus claves, ningún valor puede ser la propia clave, y toda clave
  literal que el código pide con t("…") tiene que existir en los cuatro idiomas.

  Origen: en de.json las claves de «transfer» estaban escritas «Transfer»
  (mayúscula) y la web alemana enseñaba `home.services.transfer.title` tal cual.
*/

type Tree = { [k: string]: string | string[] | Tree }

const ROOT = path.resolve(__dirname, "..")
const load = (l: string): Tree => JSON.parse(readFileSync(path.join(ROOT, "messages", `${l}.json`), "utf8"))

function flat(o: Tree, prefix = "", out: Record<string, unknown> = {}) {
  for (const [k, v] of Object.entries(o)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === "object" && !Array.isArray(v)) flat(v as Tree, key, out)
    else out[key] = v
  }
  return out
}

const LOCALES = [...routing.locales] as string[]
const bundles = Object.fromEntries(LOCALES.map((l) => [l, flat(load(l))]))
const es = bundles.es
const OTHERS = LOCALES.filter((l) => l !== "es")

// Forma de clave: algo.algo.algo, sin espacios.
const KEY_SHAPE = /^[A-Za-z][\w-]*(\.[A-Za-z_][\w-]*){2,}$/

function walk(dir: string, out: string[] = []) {
  for (const f of readdirSync(dir)) {
    if (["node_modules", ".next", ".git", "tests"].includes(f)) continue
    const p = path.join(dir, f)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (/\.(ts|tsx)$/.test(f)) out.push(p)
  }
  return out
}

describe("traducciones", () => {
  it("hay cuatro idiomas con es como fuente", () => {
    expect(LOCALES).toEqual(expect.arrayContaining(["es", "en", "fr", "de"]))
  })

  for (const l of OTHERS) {
    it(`${l}: mismas claves que es, ni una más ni una menos`, () => {
      const t = bundles[l]
      expect(Object.keys(es).filter((k) => !(k in t))).toEqual([])
      expect(Object.keys(t).filter((k) => !(k in es))).toEqual([])
    })

    it(`${l}: ningún valor es la propia clave ni tiene forma de clave`, () => {
      const bad = Object.entries(bundles[l]).filter(
        ([k, v]) => typeof v === "string" && (v === k || KEY_SHAPE.test(v)),
      )
      expect(bad).toEqual([])
    })
  }

  it("toda clave literal t(\"…\") del código existe en todos los idiomas", () => {
    const re = /\bt(?:\.rich|\.raw|\.markup)?\(\s*["'`]([A-Za-z][\w-]*(?:\.[\w-]+)+)["'`]/g
    const missing: string[] = []
    for (const file of walk(ROOT)) {
      const src = readFileSync(file, "utf8")
      // Con traductor de namespace, t("x.y") es relativo: no se resuelve a ojo.
      if (/(?:useTranslations|getTranslations)\(\s*["'{\w]/.test(src)) continue
      for (const m of src.matchAll(re)) {
        for (const l of LOCALES) {
          const k = m[1]
          const exists = k in bundles[l] || Object.keys(bundles[l]).some((x) => x.startsWith(`${k}.`))
          if (!exists) missing.push(`${l}: ${k} (${path.relative(ROOT, file)})`)
        }
      }
    }
    expect(missing).toEqual([])
  })
})
