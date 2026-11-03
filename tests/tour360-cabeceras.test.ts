import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { join } from "node:path"
import { NextRequest } from "next/server"
import { proxy } from "../proxy"
import { ORIGENES_EMBEBIDO, ORIGENES_TILES_EXTERNOS } from "@/lib/tour360/origenes"

/*
  Cabeceras del visor 360 (/tour/*) en vercel.json.

  Reglas de fondo:
    · El visor SOLO puede incrustarse desde la guest-app, beds24.com y la propia web.
      Se hace con `frame-ancestors` (CSP); no hay X-Frame-Options en /tour/, que
      contradiría la lista (un navegador con ambos obedece a frame-ancestors, pero
      uno viejo obedecería a XFO y bloquearía a la guest-app).
    · La CSP global (`frame-ancestors 'none'`) NO debe aplicarse a /tour/: dos CSP sobre
      una respuesta se INTERSECAN, y 'none' ∩ lista = nadie. Por eso la regla global
      excluye /tour/ con un lookahead, y aquí se prueba con el mismo matcher de rutas
      (path-to-regexp) que usan Next y Vercel para `source`.
    · El visor no abre más que lo que usa: scripts y estilos propios, imágenes y
      peticiones propias. Sin data:, sin blob:, sin terceros.
*/

type Cabecera = { key: string; value: string }
type Regla = { source: string; headers: Cabecera[] }
const vercel = JSON.parse(readFileSync(join(process.cwd(), "vercel.json"), "utf8")) as { headers: Regla[] }

const reglaGlobal = vercel.headers.find((r) => r.source === "/((?!tour/).*)")!
const reglaTour = vercel.headers.find((r) => r.source === "/tour/(.*)")!
const reglaTiles = vercel.headers.find((r) => r.source === "/tours/(.*)")
const cabecera = (r: Regla, k: string) => r.headers.find((h) => h.key === k)?.value

function directivas(politica: string): Map<string, string[]> {
  return new Map(
    politica
      .split(";")
      .map((d) => d.trim())
      .filter(Boolean)
      .map((d) => {
        const [nombre, ...valores] = d.split(/\s+/)
        return [nombre, valores] as const
      }),
  )
}

const csp = directivas(cabecera(reglaTour, "Content-Security-Policy") ?? "")

// El matcher de rutas de Next (el mismo path-to-regexp 6 que documenta Vercel para `source`).
const require = createRequire(import.meta.url)
const { pathToRegexp } = require("next/dist/compiled/path-to-regexp") as { pathToRegexp: (s: string) => RegExp }
const casa = (regla: Regla, ruta: string) => pathToRegexp(regla.source).test(ruta)

describe("CSP del visor 360 (/tour/*)", () => {
  it("existe la regla /tour/(.*) con CSP", () => {
    expect(reglaTour).toBeDefined()
    expect(csp.size).toBeGreaterThan(0)
  })

  it("frame-ancestors: la propia web, la guest-app y beds24.com — exactamente esos", () => {
    const fa = csp.get("frame-ancestors")!
    expect(fa[0]).toBe("'self'")
    expect([...fa.slice(1)].sort()).toEqual([...ORIGENES_EMBEBIDO].sort())
    expect(fa).toContain("https://guests.sedaprivatehomes.com")
    expect(fa).toContain("https://beds24.com")
  })

  it("los orígenes de embebido son https, exactos (sin comodines, rutas ni puertos) y no hay 'none' ni '*'", () => {
    for (const o of ORIGENES_EMBEBIDO) {
      expect(o).toMatch(/^https:\/\/[a-z0-9.-]+$/)
      expect(o).not.toContain("*")
    }
    const fa = csp.get("frame-ancestors")!
    expect(fa).not.toContain("'none'")
    expect(fa.join(" ")).not.toContain("*")
  })

  it("no lleva X-Frame-Options (contradiría a frame-ancestors)", () => {
    expect(cabecera(reglaTour, "X-Frame-Options")).toBeUndefined()
  })

  it("solo 'self' como origen de script, estilo, imagen, fuente y conexión (más los tiles externos declarados)", () => {
    expect(csp.get("default-src")).toEqual(["'self'"])
    expect(csp.get("script-src")).toEqual(["'self'", "'unsafe-inline'"]) // 'unsafe-inline': el arranque estático de Next, como en la CSP global
    expect(csp.get("style-src")).toEqual(["'self'", "'unsafe-inline'"])
    expect(csp.get("font-src")).toEqual(["'self'"])
    for (const d of ["img-src", "connect-src"]) {
      expect(csp.get(d)!.filter((v) => v !== "'self'").sort(), d).toEqual([...ORIGENES_TILES_EXTERNOS].sort())
    }
  })

  it("sin unsafe-eval, sin data:, sin blob:, sin comodines, sin frames ni objetos ni formularios", () => {
    const todo = [...csp.values()].flat()
    expect(todo).not.toContain("'unsafe-eval'")
    for (const v of todo) {
      expect(v).not.toMatch(/^(data|blob|ws|wss|http|https):$/)
      if (!v.startsWith("https://guests") && !v.startsWith("https://beds24") && !v.startsWith("https://www.beds24")) expect(v).not.toMatch(/\*/)
    }
    expect(csp.get("object-src")).toEqual(["'none'"])
    expect(csp.get("frame-src")).toEqual(["'none'"])
    expect(csp.get("form-action")).toEqual(["'none'"])
    expect(csp.get("base-uri")).toEqual(["'self'"])
    expect(csp.get("media-src")).toEqual(["'none'"])
  })

  it("conserva el resto de cabeceras de seguridad de la regla global", () => {
    for (const k of ["X-Content-Type-Options", "Referrer-Policy", "Permissions-Policy", "Strict-Transport-Security"]) {
      expect(cabecera(reglaTour, k), k).toBeDefined()
      expect(cabecera(reglaTour, k), k).toBe(cabecera(reglaGlobal, k))
    }
    // La política de permisos no bloquea giroscopio ni pantalla completa para el propio visor.
    const pp = cabecera(reglaTour, "Permissions-Policy")!
    expect(pp).not.toMatch(/gyroscope|accelerometer|fullscreen/)
  })
})

describe("las dos CSP no se solapan", () => {
  const rutas = [
    "/", "/coleccion", "/en/coleccion", "/villa/bay-side", "/en/tour/bay-side", "/tours/bay-side/v1/salon/1/f0_0.jpg",
    "/vendor/pannellum/pannellum.js", "/tour", "/tour/", "/tour/bay-side", "/tour/bay-side/", "/tour/x/y/z", "/api/contact",
  ]

  it("cada ruta recibe UNA sola CSP: la global o la del visor, nunca las dos ni ninguna", () => {
    for (const r of rutas) {
      const n = Number(casa(reglaGlobal, r)) + Number(casa(reglaTour, r))
      // «/tour» a secas no es una ruta del visor (da 404); basta con que la global la cubra.
      expect(n, r).toBe(1)
    }
  })

  it("/tour/<slug> es del visor y NO de la global", () => {
    expect(casa(reglaTour, "/tour/bay-side")).toBe(true)
    expect(casa(reglaGlobal, "/tour/bay-side")).toBe(false)
  })

  it("lo parecido a /tour/ sigue con la CSP global (frame-ancestors 'none')", () => {
    for (const r of ["/tours/bay-side/v1/salon/1/f0_0.jpg", "/en/tour/bay-side", "/tourism"]) {
      expect(casa(reglaGlobal, r), r).toBe(true)
      expect(casa(reglaTour, r), r).toBe(false)
    }
  })

  it("los tiles (/tours/*) llevan caché larga e inmutable: la versión va en la ruta (tiles.base)", () => {
    expect(reglaTiles).toBeDefined()
    expect(cabecera(reglaTiles!, "Cache-Control")).toBe("public, max-age=31536000, immutable")
    expect(casa(reglaTiles!, "/tours/bay-side/v1/salon/1/f0_0.jpg")).toBe(true)
  })
})

describe("proxy.ts: /tour/ queda fuera de next-intl", () => {
  const llamar = (ruta: string) => proxy(new NextRequest(`https://sedaprivatehomes.com${ruta}`))

  it("/tour/<slug>, con o sin ?lang=, pasa tal cual: ni reescritura ni redirección de idioma", () => {
    for (const ruta of ["/tour/bay-side", "/tour/bay-side?lang=it", "/tour/bay-side/", "/tour"]) {
      const res = llamar(ruta)
      expect(res.headers.get("x-middleware-next"), ruta).toBe("1")
      expect(res.headers.get("x-middleware-rewrite"), ruta).toBeNull()
      expect(res.headers.get("location"), ruta).toBeNull()
    }
  })

  it("el resto sigue pasando por next-intl (control: /coleccion se reescribe a /es/coleccion)", () => {
    const res = llamar("/coleccion")
    expect(res.headers.get("x-middleware-rewrite")).toContain("/es/coleccion")
  })

  it("y las villas retiradas siguen dando 410", () => {
    expect(llamar("/villa/villa-alboran").status).toBe(410)
  })
})
