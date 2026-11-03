import { describe, expect, it } from "vitest"
import { createHash } from "node:crypto"
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative } from "node:path"

/*
  Privacidad y procedencia del visor 360.

  Compromiso: el visor no lleva analítica ni cookies, no habla con terceros y no
  guarda nada en el navegador del visitante. Esto lo hace cumplir de forma
  mecánica (escaneando el código propio y el de Pannellum), no por buena fe.

  Pannellum se aloja en el repo (public/vendor/pannellum); su procedencia y sus
  huellas están en ORIGEN.txt. Si alguien edita el fichero a mano, esto falla.
*/

const raiz = process.cwd()
const vendor = join(raiz, "public", "vendor", "pannellum")
const sha256 = (ruta: string) => createHash("sha256").update(readFileSync(ruta)).digest("hex")

const OMITIR = new Set(["node_modules", ".next", ".git", ".claude", "tours-entrada", "tours-salida"])

function ficheros(dir: string, ext: RegExp): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? (OMITIR.has(e.name) ? [] : ficheros(join(dir, e.name), ext)) : ext.test(e.name) ? [join(dir, e.name)] : [],
  )
}

describe("Pannellum alojado en el propio repo", () => {
  const origen = readFileSync(join(vendor, "ORIGEN.txt"), "utf8")

  it.each([
    ["pannellum.js", "pannellum.js"],
    ["pannellum.css", "pannellum.css"],
    ["LICENSE.txt", "LICENSE.txt"],
  ])("%s coincide con la huella anotada en ORIGEN.txt", (nombre) => {
    const linea = origen.split("\n").find((l) => l.trim().startsWith(nombre))
    expect(linea, `ORIGEN.txt no anota ${nombre}`).toBeDefined()
    const anotada = linea!.match(/\b[0-9a-f]{64}\b/)?.[0]
    expect(anotada, `sin sha256 para ${nombre}`).toBeDefined()
    expect(sha256(join(vendor, nombre))).toBe(anotada)
  })

  it("es la versión 2.5.7 y lleva su licencia MIT", () => {
    expect(readFileSync(join(vendor, "pannellum.js"), "utf8").startsWith("// Pannellum 2.5.7,")).toBe(true)
    const licencia = readFileSync(join(vendor, "LICENSE.txt"), "utf8")
    expect(licencia).toContain("Matthew Petroff")
    expect(licencia).toMatch(/Permission is hereby granted, free of charge/)
  })

  it("el CSS referencia solo SVG propios (img/…): nada de data: ni de URLs externas", () => {
    const css = readFileSync(join(vendor, "pannellum.css"), "utf8")
    const urls = [...css.matchAll(/url\(\s*['"]?([^'")]+)/g)].map((m) => m[1])
    expect(urls.length).toBeGreaterThan(0)
    for (const u of urls) {
      expect(u, u).toMatch(/^img\/[a-z]+\.svg$/)
      expect(existsSync(join(vendor, u)), `${u} no está en public/vendor/pannellum`).toBe(true)
    }
  })

  it("el JS de Pannellum no usa cookies, almacenamiento, beacons ni eval, y solo nombra dos URLs (sus créditos)", () => {
    const js = readFileSync(join(vendor, "pannellum.js"), "utf8")
    for (const prohibido of [/document\.cookie/, /localStorage/, /sessionStorage/, /indexedDB/, /sendBeacon/, /\beval\s*\(/, /new Function/, /google-analytics|googletagmanager/]) {
      expect(js, String(prohibido)).not.toMatch(prohibido)
    }
    expect([...js.matchAll(/https?:\/\/[A-Za-z0-9./_-]+/g)].map((m) => m[0]).sort()).toEqual([
      "https://github.com/mpetroff/pannellum",
      "https://pannellum.org/",
    ])
  })
})

describe("el código propio del visor no lleva analítica, cookies ni terceros", () => {
  const codigo = [
    ...ficheros(join(raiz, "app", "tour"), /\.(tsx?|css)$/),
    ...ficheros(join(raiz, "components", "tour360"), /\.tsx?$/),
    ...ficheros(join(raiz, "lib", "tour360"), /\.ts$/).filter((f) => !f.endsWith("origenes.ts")),
  ]

  it("hay código que escanear", () => {
    expect(codigo.length).toBeGreaterThanOrEqual(8)
  })

  it.each([
    ["cookies / almacenamiento del navegador", /document\.cookie|localStorage|sessionStorage|indexedDB|cookies\(\)/],
    ["analítica y medición", /@vercel\/analytics|speed-insights|gtag|dataLayer|google-analytics|googletagmanager|plausible|posthog|mixpanel|segment|fbq|hotjar|clarity|matomo|sentry/i],
    ["red iniciada por el código propio", /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/],
    ["URLs absolutas (todo es del propio dominio)", /https?:\/\//],
  ])("ningún fichero usa %s", (_nombre, patron) => {
    for (const f of codigo) {
      const texto = readFileSync(f, "utf8")
      // Los comentarios pueden NOMBRAR cosas prohibidas para explicar que no se usan; el código, no.
      const sinComentarios = texto.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1")
      expect(sinComentarios, relative(raiz, f)).not.toMatch(patron)
    }
  })

  it("el layout del visor no monta analítica, ni <Script> de terceros, ni fuentes remotas", () => {
    const layout = readFileSync(join(raiz, "app", "tour", "[slug]", "layout.tsx"), "utf8")
    expect(layout).not.toMatch(/next\/font|next\/script|Analytics|SpeedInsights/)
  })
})

describe("los tiles y las fotos originales no entran en el repo", () => {
  const gitignore = readFileSync(join(raiz, ".gitignore"), "utf8").split("\n").map((l) => l.trim())

  it("las carpetas de trabajo están en .gitignore", () => {
    expect(gitignore).toContain("/tours-entrada/") // originales con EXIF/GPS
    expect(gitignore).toContain("/tours-salida/") // tiles generados
  })

  it("no hay tiles dentro de public/ (peso de repo y despliegue: ver docs/TOUR-360.md §Alojamiento)", () => {
    const dir = join(raiz, "public", "tours")
    const peso = (d: string): number =>
      existsSync(d) ? readdirSync(d, { withFileTypes: true }).reduce((s, e) => s + (e.isDirectory() ? peso(join(d, e.name)) : statSync(join(d, e.name)).size), 0) : 0
    // 20 MB: caben un par de escenas de prueba, no un recorrido de verdad. Pasarse es una decisión de alojamiento, no un descuido.
    expect(peso(dir), "public/tours pesa demasiado").toBeLessThanOrEqual(20 * 1024 * 1024)
  })

  it("no se ha colado ninguna foto original (imagen de más de 3 MB) fuera de las carpetas ignoradas", () => {
    // Defensa barata: una imagen de más de 3 MB en el árbol es casi seguro una toma de 72 MP de la X4 (35–40 MB).
    const grandes = ficheros(raiz, /\.(jpe?g|png|tiff?)$/i).filter((f) => statSync(f).size > 3 * 1024 * 1024)
    expect(grandes.map((f) => relative(raiz, f))).toEqual([])
  })
})
