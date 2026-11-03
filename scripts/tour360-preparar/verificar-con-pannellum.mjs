#!/usr/bin/env node
// Comprueba el tiler CONTRA PANNELLUM, no contra sí mismo.
//
// Renderiza una cuadrícula sintética (tests/helpers/equirect-sintetica.mjs) de dos
// maneras en el Pannellum alojado en public/vendor/pannellum:
//   A) la equirectangular directa (la referencia: lo hace Pannellum)
//   B) el multires que genera scripts/tour360-preparar/tiler.mjs
// y las compara vista a vista (4 horizontales, 2 oblicuas, cénit y nadir en varios yaw).
// Si una cara saliera girada, espejada o cambiada de sitio, la diferencia se dispara
// (medido con controles negativos: <1/255 bien, 26–63/255 con una cara girada).
//
// Cuándo ejecutarlo: al cambiar tiler.mjs, al actualizar Pannellum o `sharp`.
// No corre en CI: necesita Chromium. Requiere `playwright` (no es dependencia del repo):
//   npm i --no-save playwright && npx playwright install chromium   (o el Chromium ya instalado)
//
//   node scripts/tour360-preparar/verificar-con-pannellum.mjs
//
// Sale con código 1 si alguna vista supera UMBRAL.

import { createServer } from "node:http"
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, extname, join, resolve } from "node:path"
import { createRequire } from "node:module"
import { fileURLToPath } from "node:url"
import { generarMultires } from "./tiler.mjs"
import { equirectSintetica } from "../../tests/helpers/equirect-sintetica.mjs"

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..")
const VENDOR = join(RAIZ, "public", "vendor", "pannellum")
const UMBRAL = 5 // diferencia media máxima admitida, sobre 255
const require = createRequire(import.meta.url)
const sharp = require("sharp")

let chromium
try {
  ;({ chromium } = require("playwright"))
} catch {
  console.error("Falta `playwright`. Instálalo con: npm i --no-save playwright")
  process.exit(2)
}

const trabajo = mkdtempSync(join(tmpdir(), "tour360-verif-"))
mkdirSync(join(trabajo, "out"))
const eq = equirectSintetica(4096)
await sharp(eq.data, { raw: { width: eq.width, height: eq.height, channels: 3 } }).jpeg({ quality: 95 }).toFile(join(trabajo, "eq.jpg"))
const { multires: m } = await generarMultires({ entrada: join(trabajo, "eq.jpg"), salida: join(trabajo, "out") })

writeFileSync(
  join(trabajo, "index.html"),
  `<!doctype html><meta charset=utf-8><link rel=stylesheet href=/pn/pannellum.css>
<style>body{margin:0;background:#222}#a,#b{width:640px;height:400px;display:inline-block}</style>
<div id=a></div><div id=b></div><script src=/pn/pannellum.js></script><script>
const m=${JSON.stringify(m)};
window.va=pannellum.viewer('a',{type:'equirectangular',panorama:'/eq.jpg',autoLoad:true,showControls:false,ignoreGPanoXMP:true,hfov:90,minHfov:30,maxHfov:120});
window.vb=pannellum.viewer('b',{type:'multires',multiRes:{basePath:'/out',path:'/%l/%s%y_%x',fallbackPath:'/fallback/%s',extension:'jpg',tileResolution:m.tileResolution,maxLevel:m.maxLevel,cubeResolution:m.cubeResolution},autoLoad:true,showControls:false,hfov:90,minHfov:30,maxHfov:120});
</script>`,
)

const tipos = { ".js": "text/javascript", ".css": "text/css", ".jpg": "image/jpeg", ".html": "text/html", ".svg": "image/svg+xml" }
const servidor = createServer((req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0])
  const f = url.startsWith("/pn/") ? join(VENDOR, url.slice(4)) : join(trabajo, url === "/" ? "index.html" : url)
  if (!f.startsWith(trabajo) && !f.startsWith(VENDOR)) return res.writeHead(403).end()
  if (!existsSync(f) || !statSync(f).isFile()) return res.writeHead(404).end()
  res.writeHead(200, { "content-type": tipos[extname(f)] ?? "application/octet-stream" }).end(readFileSync(f))
})
await new Promise((r) => servidor.listen(0, r))

const navegador = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] })
let fallos = 0
try {
  const page = await navegador.newPage({ viewport: { width: 1300, height: 420 } })
  await page.goto(`http://localhost:${servidor.address().port}/`)
  await page.waitForFunction(() => window.va?.isLoaded() && window.vb?.isLoaded(), null, { timeout: 60000 })
  const vistas = [
    [0, 0], [90, 0], [180, 0], [-90, 0], [45, 30], [-135, -30],
    [0, 60], [0, 85], [180, 85], [90, 80], [0, -60], [0, -85], [180, -85], [-90, -80],
  ]
  for (const [yaw, pitch] of vistas) {
    await page.evaluate(([y, p]) => {
      for (const v of [window.va, window.vb]) { v.setYaw(y, false); v.setPitch(p, false); v.setHfov(90, false) }
    }, [yaw, pitch])
    await page.waitForTimeout(2500) // deja que el multires cargue el nivel que toca
    const [a, b] = await Promise.all(
      ["#a", "#b"].map(async (s) => sharp(await page.locator(s).screenshot()).resize(80, 50, { fit: "fill" }).removeAlpha().raw().toBuffer()),
    )
    let suma = 0
    for (let i = 0; i < a.length; i++) suma += Math.abs(a[i] - b[i])
    const dif = suma / a.length
    const bien = dif <= UMBRAL
    if (!bien) fallos++
    console.log(`${bien ? "✓" : "✗"} yaw ${String(yaw).padStart(5)} pitch ${String(pitch).padStart(4)}  diferencia media ${dif.toFixed(2)}/255`)
  }
} finally {
  await navegador.close()
  servidor.close()
  rmSync(trabajo, { recursive: true, force: true })
}
console.log(fallos ? `\n✗ ${fallos} vista(s) por encima de ${UMBRAL}/255: las caras no coinciden con Pannellum.` : `\n✓ Todas las vistas coinciden con Pannellum (umbral ${UMBRAL}/255).`)
process.exit(fallos ? 1 : 0)
