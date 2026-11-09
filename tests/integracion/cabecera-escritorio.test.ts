import { execSync } from "node:child_process"
import { createRequire } from "node:module"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { arrancarNext, type ServidorNext } from "./next-start"

/*
  Cabecera en escritorio (CABECERA-ESCRITORIO). Ángel la veía mal a ~1.730 px:
  «SEDA OS» en dos líneas y «CONTACTO» pegado a «ES / EN / FR / DE». El menú
  completo mide ~1.190 px en alemán y francés más 160 de márgenes, así que el
  menú de escritorio empieza en 1.440 px y por debajo hay hamburguesa.

  CABECERA-COMPACTA: la barra completa vuelve desde 1.280 px (entre 1.280 y 1.439, más ceñida)
  y la hamburguesa queda por debajo de 1.280. Además, entre los tres bloques de la barra
  (logo, enlaces, idiomas/Portal/reservar) hay siempre al menos 16 px.

  Abre la página en un Chromium real, en los cuatro idiomas y en las anchuras de
  la tabla del PR, arriba y con scroll, y falla si: dos elementos de primer nivel
  de la cabecera se solapan o quedan a menos de 8 px, alguno ocupa dos líneas, o
  algo se sale por la derecha. Necesita Playwright y Chromium; si no están en la
  máquina, se salta (CI de GitHub/Ubicloud no los lleva).
*/

const ANCHURAS = [1024, 1100, 1279, 1280, 1366, 1439, 1440, 1536, 1728, 1920]
const ANCHO_MENU = 1280 // desde aquí, barra completa; por debajo, hamburguesa
const IDIOMAS: Record<string, string> = { es: "/", en: "/en", fr: "/fr", de: "/de" }

// Playwright no es dependencia del proyecto: tipos mínimos de lo que se usa.
type Pagina = {
  goto(url: string, o: { waitUntil: "networkidle" }): Promise<unknown>
  evaluate<T>(f: (() => T) | string): Promise<T>
  waitForTimeout(ms: number): Promise<void>
  close(): Promise<void>
}
type Navegador = { newPage(o: { viewport: { width: number; height: number } }): Promise<Pagina>; close(): Promise<void> }
type Pw = { chromium: { launch(): Promise<Navegador> } }
function cargarPlaywright(): Pw | null {
  const intentos = [() => createRequire(import.meta.url)("playwright"), () => createRequire(`${execSync("npm root -g").toString().trim()}/`)("playwright")]
  for (const f of intentos) {
    try {
      return f() as Pw
    } catch {}
  }
  return null
}

function medir() {
  const nav = document.querySelector("header nav")!
  const visibles = [...nav.querySelectorAll<HTMLElement>("a,button")].filter(
    (e) => !e.closest("[role=menu]") && e.offsetParent !== null && e.getBoundingClientRect().width > 0,
  )
  const lineas = (e: HTMLElement) => {
    const medios: number[] = []
    const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT)
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      if (!n.textContent?.trim()) continue
      const r = document.createRange()
      r.selectNodeContents(n)
      for (const c of r.getClientRects()) medios.push((c.top + c.bottom) / 2)
    }
    // Una línea = centros verticales a menos de 6 px (la flecha ▼ es más pequeña y baja un poco).
    medios.sort((a, b) => a - b)
    return medios.filter((m, i) => i === 0 || m - medios[i - 1] > 6).length
  }
  const items = visibles.map((e) => ({ t: (e.textContent || e.getAttribute("aria-label") || "").trim().slice(0, 16), r: e.getBoundingClientRect(), lineas: lineas(e) }))
  const problemas: string[] = []
  for (const a of items) if (a.lineas > 1) problemas.push(`«${a.t}» ocupa ${a.lineas} líneas`)
  for (const a of items) if (a.r.right > innerWidth + 0.5) problemas.push(`«${a.t}» se sale por la derecha (${Math.round(a.r.right)} > ${innerWidth})`)
  if (document.documentElement.scrollWidth > innerWidth) problemas.push("scroll horizontal")
  for (let i = 0; i < items.length; i++)
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i].r
      const b = items[j].r
      const h = Math.max(a.left, b.left) - Math.min(a.right, b.right) // <0: se cruzan en horizontal
      const v = Math.max(a.top, b.top) - Math.min(a.bottom, b.bottom)
      if (v < 0 && h < 0) problemas.push(`«${items[i].t}» y «${items[j].t}» se solapan`)
      else if (v < 0 && h < 8) problemas.push(`«${items[i].t}» y «${items[j].t}» a ${Math.round(h)} px`)
    }
  // Modo: la barra completa tiene los desplegables (SEDA OS, Portal); la hamburguesa, no.
  const modo = visibles.some((e) => e.getAttribute("aria-haspopup") === "menu") ? "menu" : "burger"
  // Huecos entre los tres bloques de la barra (logo | enlaces | idiomas+Portal+reservar): al menos 16 px.
  const bloques = [...nav.children].map((c) => c.getBoundingClientRect()).filter((r) => r.width > 0).sort((a, b) => a.left - b.left)
  const huecos = bloques.slice(1).map((r, i) => Math.round(r.left - bloques[i].right))
  if (modo === "menu") for (const h of huecos) if (h < 16) problemas.push(`hueco entre bloques de ${h} px (mínimo 16)`)
  return { problemas, n: items.length, modo, huecos }
}

const pw = cargarPlaywright()
let servidor: ServidorNext
let navegador: Navegador | null = null

beforeAll(async () => {
  if (!pw) return
  try {
    navegador = await pw.chromium.launch()
  } catch {
    navegador = null
    return
  }
  servidor = await arrancarNext()
}, 60_000)
afterAll(async () => {
  await navegador?.close()
  servidor?.parar()
})

describe("cabecera de escritorio: nada se parte ni se solapa", () => {
  for (const [idioma, ruta] of Object.entries(IDIOMAS)) {
    for (const ancho of ANCHURAS) {
      for (const scroll of [false, true]) {
        it(`${idioma} ${ancho}px ${scroll ? "con scroll" : "arriba"}`, async (ctx) => {
          if (!navegador) return ctx.skip()
          const p = await navegador.newPage({ viewport: { width: ancho, height: 900 } })
          try {
            await p.goto(servidor.base + ruta, { waitUntil: "networkidle" })
            if (scroll) {
              await p.evaluate(() => window.scrollTo(0, 900))
              await p.waitForTimeout(700)
            }
            const r = await p.evaluate(medir)
            expect(r.problemas, `${idioma} ${ancho}px`).toEqual([])
            expect(r.n).toBeGreaterThan(3)
            expect(r.modo, `${idioma} ${ancho}px`).toBe(ancho >= ANCHO_MENU ? "menu" : "burger")
            if (process.env.CABECERA_HUECOS) console.log(`HUECOS ${idioma} ${ancho} ${r.modo} ${r.huecos.join("/")}`)
          } finally {
            await p.close()
          }
        })
      }
    }
  }
})
