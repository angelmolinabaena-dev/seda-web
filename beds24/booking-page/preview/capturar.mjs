// Capturas de las INSTANTÁNEAS REALES (preview/real/) con un CSS, a 375 y 1440 px. Uso, desde la raíz del repo:
//   node beds24/booking-page/preview/capturar.mjs [css] [carpeta-de-salida]
// Por defecto prueba pegado/custom.min.css (lo que se pega en el panel) y escribe en preview/capturas/.
// Necesita playwright (global en el entorno de Claude Code). Mide también el scroll horizontal.
import { createRequire } from "node:module"
import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { pagina } from "./instantanea.mjs"

const { chromium } = createRequire(import.meta.url)("playwright")
const aqui = dirname(fileURLToPath(import.meta.url))
const css = readFileSync(resolve(process.argv[2] ?? join(aqui, "../pegado/custom.min.css")), "utf8")
const salida = resolve(process.argv[3] ?? join(aqui, "capturas"))
mkdirSync(salida, { recursive: true })

const PAGINAS = [
  { id: "portada", fichero: "real/booking2-es-v2-2026-11-03.html" },
  { id: "formulario", fichero: "real/book3-formulario-es-2026-11-03.html" },
]
const ANCHOS = [375, 1440]

const browser = await chromium.launch()
for (const { id, fichero } of PAGINAS) {
  const html = pagina(fichero, css)
  const tmp = join(aqui, `_${id}.html`) // junto a vendor/ para que bootstrap cargue por ruta relativa
  writeFileSync(tmp, html)
  for (const w of ANCHOS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1 })
    const p = await ctx.newPage()
    await p.goto(`file://${tmp}`, { waitUntil: "load" })
    await p.evaluate(() => document.fonts.ready)
    const m = await p.evaluate(() => ({ scrollW: document.documentElement.scrollWidth, innerW: window.innerWidth }))
    console.log(`${id} ${w}px · scrollWidth=${m.scrollW} innerWidth=${m.innerW} · ${m.scrollW > m.innerW ? "SCROLL HORIZONTAL" : "sin scroll horizontal"}`)
    await p.screenshot({ path: join(salida, `${id}-${w}.png`), fullPage: true })
    await ctx.close()
  }
}
await browser.close()
