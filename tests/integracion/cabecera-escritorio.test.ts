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

  Alineación: el logo está en el mismo margen que el texto del hero (5rem) en todas las anchuras, salvo de
  1.280 a 1.339 px, donde el margen baja a 3rem para que el alemán quepa con holgura (ver la tabla del PR).

  Abre la página en un Chromium real, en los cuatro idiomas y en las anchuras de
  la tabla del PR, arriba y con scroll, y falla si: dos elementos de primer nivel
  de la cabecera se solapan o quedan a menos de 8 px, alguno ocupa dos líneas, o
  algo se sale por la derecha. Necesita Playwright y Chromium; si no están en la
  máquina, se salta (CI de GitHub/Ubicloud no los lleva).
*/

const ANCHURAS = [1024, 1100, 1279, 1280, 1339, 1340, 1356, 1366, 1439, 1440, 1536, 1728, 1920]
const ANCHO_MENU = 1280 // desde aquí, barra completa; por debajo, hamburguesa
const IDIOMAS: Record<string, string> = { es: "/", en: "/en", fr: "/fr", de: "/de" }

// Playwright no es dependencia del proyecto: tipos mínimos de lo que se usa.
type Pagina = {
  goto(url: string, o: { waitUntil: "networkidle" }): Promise<unknown>
  evaluate<T>(f: (() => T) | string): Promise<T>
  waitForTimeout(ms: number): Promise<void>
  click(selector: string): Promise<void>
  hover(selector: string): Promise<void>
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
    (e) => !e.closest("[role=menu]") && !e.closest("[inert]") && e.offsetParent !== null && e.getBoundingClientRect().width > 0,
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
  // Alineación con el contenido: izquierda del logo frente a la del primer texto del hero.
  const logo = nav.firstElementChild!.getBoundingClientRect().left
  const texto = [...document.querySelectorAll<HTMLElement>("#hero h1, #hero p")].find((e) => e.getBoundingClientRect().width > 0)
  const desalineado = texto ? Math.round(logo - texto.getBoundingClientRect().left) : null
  return { problemas, n: items.length, modo, huecos, desalineado }
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
              await p.waitForTimeout(1000)
            }
            const r = await p.evaluate(medir)
            expect(r.problemas, `${idioma} ${ancho}px`).toEqual([])
            expect(r.n).toBeGreaterThan(3)
            expect(r.desalineado, "hay un texto de hero con el que comparar").not.toBeNull()
            // El logo cae sobre el margen del contenido salvo en la franja ceñida (1.280–1.339 px).
            if (ancho < 1280 || ancho >= 1340) expect(r.desalineado, `${idioma} ${ancho}px: logo desalineado con el hero`).toBe(0)
            else expect(r.desalineado).toBe(-32)
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


/* ── La franja fina (CABECERA-FRANJA) ──────────────────────────────────────── */

function medirFranja() {
  const franja = document.querySelector<HTMLElement>("[data-franja]")!
  const visible = (e: HTMLElement) => e.offsetParent !== null && e.getBoundingClientRect().width > 0
  const hijos = [...franja.querySelectorAll<HTMLElement>("[data-franja-mitad] > *")].filter(visible)
  const lineas = (e: HTMLElement) => {
    const medios: number[] = []
    const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT)
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      if (!n.textContent?.trim()) continue
      const r = document.createRange()
      r.selectNodeContents(n)
      for (const c of r.getClientRects()) medios.push((c.top + c.bottom) / 2)
    }
    medios.sort((a, b) => a - b)
    return medios.filter((m, i) => i === 0 || m - medios[i - 1] > 6).length
  }
  const problemas: string[] = []
  const caja = hijos.map((e) => ({ t: (e.textContent || "").trim().slice(0, 22), r: e.getBoundingClientRect(), l: lineas(e) }))
  for (const c of caja) if (c.l > 1) problemas.push(`«${c.t}» ocupa ${c.l} líneas`)
  for (let i = 0; i < caja.length; i++)
    for (let j = i + 1; j < caja.length; j++) {
      const a = caja[i].r
      const b = caja[j].r
      if (a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5) problemas.push(`«${caja[i].t}» y «${caja[j].t}» se solapan`)
    }
  const mitades = [...franja.querySelectorAll<HTMLElement>("[data-franja-mitad]")]
  for (const m of mitades) if (m.scrollWidth > m.clientWidth + 0.5) problemas.push(`la mitad «${m.dataset.franjaMitad}» desborda ${m.scrollWidth - m.clientWidth} px`)
  const [m1, m2] = mitades.map((m) => m.getBoundingClientRect())
  if (m1 && m2 && m1.right > m2.left + 1) problemas.push("las dos mitades se solapan")
  // Contraste del texto REAL que pinta el navegador sobre el velo con la foto más clara posible (blanco),
  // calculado con la fórmula WCAG (no con las constantes del código).
  const num = (c: string) => (c.match(/-?\d*\.?\d+/g) || []).map(Number)
  const rgba = (c: string): [number, number, number, number] => {
    const n = num(c)
    const f = c.startsWith("color(") ? 255 : 1
    return [n[0] * f, n[1] * f, n[2] * f, n.length > 3 ? n[3] : 1]
  }
  const lin = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
  const lum = (c: number[]) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2])
  const veloC = rgba(getComputedStyle(franja.firstElementChild as HTMLElement).backgroundColor)
  const fondo = [0, 1, 2].map((i) => veloC[i] * veloC[3] + 255 * (1 - veloC[3]))
  let peorContraste = Infinity
  const textos = [...franja.querySelectorAll<HTMLElement>("[data-franja-mitad] > *")].filter((e) => visible(e) && (e.textContent || "").trim().length > 1)
  for (const e of textos) {
    const c = rgba(getComputedStyle(e).color)
    const t = [0, 1, 2].map((i) => c[i] * c[3] + fondo[i] * (1 - c[3]))
    const [hi, lo] = [lum(t), lum(fondo)].sort((a, b) => b - a)
    peorContraste = Math.min(peorContraste, (hi + 0.05) / (lo + 0.05))
  }
  const frase = !![...franja.querySelectorAll<HTMLElement>("[data-franja-mitad] span")].find((e) => e.className.includes("text-[12.5px]") && visible(e))
  const interior = franja.firstElementChild as HTMLElement
  return {
    problemas,
    frase,
    peorContraste,
    nTextos: textos.length,
    alto: Math.round(franja.getBoundingClientRect().height),
    altoInterior: Math.round(interior.getBoundingClientRect().height),
    visible: visible(franja),
    recogida: franja.dataset.franjaRecogida,
    inert: franja.hasAttribute("inert"),
    estados: Object.fromEntries(mitades.map((m) => [m.dataset.franjaMitad, m.dataset.franjaEstado])),
    tipo: franja.dataset.franjaTipo,
    cta: (() => {
      const c = document.querySelector<HTMLElement>("[data-barra-cta]")
      return c ? { estado: c.dataset.barraCta, texto: (c.textContent || "").trim(), href: c.querySelector("a")?.getAttribute("href") } : null
    })(),
    enlaces: [...franja.querySelectorAll("a")].map((a) => a.getAttribute("href")),
  }
}

const ANCHURAS_FRANJA = [1280, 1356, 1440, 1920]

describe("la franja fina: sin solapes, una línea, y se recoge al bajar", () => {
  for (const [idioma, ruta] of Object.entries(IDIOMAS)) {
    for (const ancho of ANCHURAS_FRANJA) {
      it(`${idioma} ${ancho}px: arriba (36 px, sin solapes, frase solo desde 1.440) y recogida al bajar`, async (ctx) => {
        if (!navegador) return ctx.skip()
        const p = await navegador.newPage({ viewport: { width: ancho, height: 900 } })
        try {
          await p.goto(servidor.base + ruta, { waitUntil: "networkidle" })
          const arriba = await p.evaluate(medirFranja)
          expect(arriba.problemas, `${idioma} ${ancho}px arriba`).toEqual([])
          expect(arriba.visible).toBe(true)
          expect(arriba.alto, "alto de la franja").toBe(36)
          expect(arriba.altoInterior).toBe(36)
          expect(arriba.frase, "la frase se ve solo desde 1.440 px").toBe(ancho >= 1440)
          expect(arriba.nTextos, "etiquetas y enlaces (y frases desde 1.440)").toBeGreaterThanOrEqual(4)
          expect(arriba.peorContraste, "todo el texto de la franja ≥ 4,5:1 sobre la foto más clara").toBeGreaterThanOrEqual(4.5)
          expect(arriba.recogida).toBe("no")
          expect(arriba.inert).toBe(false)
          expect(arriba.cta?.estado, "sin botón en la barra mientras la franja está").toBe("oculto")
          // Con prefijo de idioma (`/en/…`, `/fr/…`, `/de/…`); en español, sin él.
          expect(arriba.enlaces.map((h) => h?.replace(/^\/(en|fr|de)(?=\/)/, ""))).toEqual(["/contacto?type=guest", "/contacto?type=owner"])

          await p.evaluate(() => window.scrollTo(0, 900))
          await p.waitForTimeout(1000)
          const abajo = await p.evaluate(medirFranja)
          expect(abajo.recogida).toBe("si")
          expect(abajo.alto, "la franja se recoge").toBe(0)
          expect(abajo.inert, "recogida, sin foco").toBe(true)
          expect(abajo.cta?.estado, "un solo botón en la barra").toBe("visible")
        } finally {
          await p.close()
        }
      })
    }
  }

  // Mitad destacada y botón de la barra según la ruta.
  const RUTAS: [string, "propietarios" | "viajeros" | "neutro", string][] = [
    ["/", "neutro", "Solicitar estancia"],
    ["/propietarios", "propietarios", "Valorar mi propiedad"],
    ["/founding-owners", "propietarios", "Valorar mi propiedad"],
    ["/ecosistema", "propietarios", "Valorar mi propiedad"],
    ["/coleccion", "viajeros", "Solicitar estancia"],
    ["/experiencias", "viajeros", "Solicitar estancia"],
    ["/guestapp", "viajeros", "Solicitar estancia"],
    ["/descubre", "viajeros", "Solicitar estancia"],
    ["/faq", "neutro", "Solicitar estancia"],
  ]
  for (const [ruta, tipo, boton] of RUTAS) {
    it(`${ruta}: ${tipo} → mitades ${tipo === "neutro" ? "iguales" : "con " + tipo + " destacada"}; botón «${boton}» tras bajar`, async (ctx) => {
      if (!navegador) return ctx.skip()
      const p = await navegador.newPage({ viewport: { width: 1440, height: 900 } })
      try {
        await p.goto(servidor.base + ruta, { waitUntil: "networkidle" })
        const r = await p.evaluate(medirFranja)
        expect(r.tipo).toBe(tipo)
        const esperado = {
          propietarios: { propietarios: "destacada", viajeros: "igual" },
          viajeros: { propietarios: "igual", viajeros: "destacada" },
          neutro: { propietarios: "igual", viajeros: "igual" },
        }[tipo]
        expect(r.estados).toEqual(esperado)
        expect(r.peorContraste, `${ruta}: todo el texto ≥ 4,5:1`).toBeGreaterThanOrEqual(4.5)
        await p.evaluate(() => window.scrollTo(0, 900))
        await p.waitForTimeout(1000)
        const abajo = await p.evaluate(medirFranja)
        expect(abajo.cta?.texto).toBe(boton)
        expect(abajo.cta?.href).toBe(tipo === "propietarios" ? "/contacto?type=owner" : "/contacto?type=guest")
      } finally {
        await p.close()
      }
    })
  }

  // La mitad destacada lleva un punto dorado delante (+16 px): el alemán a 1.440 px es el caso más justo.
  for (const ruta of ["/de/propietarios", "/de/coleccion", "/fr/propietarios", "/fr/coleccion"]) it(`${ruta} a 1.440 px: con la mitad destacada tampoco hay desbordes ni solapes`, async (ctx) => {
    if (!navegador) return ctx.skip()
    const p = await navegador.newPage({ viewport: { width: 1440, height: 900 } })
    try {
      await p.goto(servidor.base + ruta, { waitUntil: "networkidle" })
      const r = await p.evaluate(medirFranja)
      expect(r.problemas).toEqual([])
      expect(r.peorContraste, "también la mitad destacada ≥ 4,5:1").toBeGreaterThanOrEqual(4.5)
      expect(Object.values(r.estados)).toContain("destacada")
    } finally {
      await p.close()
    }
  })

  it("por debajo de 1.280 px la franja no se ve y sus dos enlaces van arriba del menú móvil, como dos tarjetas", async (ctx) => {
    if (!navegador) return ctx.skip()
    const p = await navegador.newPage({ viewport: { width: 1100, height: 900 } })
    try {
      await p.goto(servidor.base, { waitUntil: "networkidle" })
      expect((await p.evaluate(medirFranja)).visible).toBe(false)
      await p.click("button[aria-label][aria-expanded]")
      await p.waitForTimeout(600)
      const tarjetas = await p.evaluate(() => {
        const t = document.querySelector("[data-franja-movil]")
        const r = t?.getBoundingClientRect()
        return { n: t?.querySelectorAll("a").length ?? 0, hrefs: [...(t?.querySelectorAll("a") ?? [])].map((a) => a.getAttribute("href")), visible: !!r && r.width > 0 && r.height > 0, arriba: r ? Math.round(r.top) : null }
      })
      expect(tarjetas.n).toBe(2)
      expect(tarjetas.hrefs).toEqual(["/contacto?type=guest", "/contacto?type=owner"])
      expect(tarjetas.visible).toBe(true)
      expect(tarjetas.arriba as number).toBeLessThan(200)
    } finally {
      await p.close()
    }
  })

  it("Portal ▾: dos tarjetas («Huéspedes · Guest App» y «Propietarios · Portal del propietario») con «Entrar →», a los destinos de siempre", async (ctx) => {
    if (!navegador) return ctx.skip()
    const p = await navegador.newPage({ viewport: { width: 1440, height: 900 } })
    try {
      await p.goto(servidor.base, { waitUntil: "networkidle" })
      await p.hover("button[aria-haspopup='menu']:has-text('Portal')")
      await p.waitForTimeout(400)
      const t = await p.evaluate(() =>
        [...document.querySelectorAll<HTMLAnchorElement>("[data-portal-tarjeta]")].map((a) => ({
          clave: a.dataset.portalTarjeta,
          href: a.getAttribute("href"),
          texto: (a.textContent || "").replace(/\s+/g, " ").trim(),
          visible: a.getBoundingClientRect().width > 0 && getComputedStyle(a.closest("[role=menu]")!).visibility === "visible",
        })),
      )
      expect(t.map((x) => x.clave)).toEqual(["huespedes", "propietarios"])
      expect(t.map((x) => x.href)).toEqual(["https://guests.sedaprivatehomes.com/acceso", "https://portal.sedaprivatehomes.com/"])
      expect(t[0].texto).toContain("Huéspedes · Guest App")
      expect(t[1].texto).toContain("Propietarios · Portal del propietario")
      for (const x of t) {
        expect(x.texto).toContain("Entrar →")
        expect(x.visible).toBe(true)
      }
    } finally {
      await p.close()
    }
  })

  // La barra sobre la foto (portada, arriba): su velo y TODOS sus textos, medidos en el navegador sobre la foto más clara.
  for (const [idioma, ruta] of Object.entries(IDIOMAS)) {
    for (const ancho of [1280, 1440]) {
      it(`${idioma} ${ancho}px: la barra transparente de la portada, todo su texto ≥ 4,5:1 sobre foto blanca`, async (ctx) => {
        if (!navegador) return ctx.skip()
        const p = await navegador.newPage({ viewport: { width: ancho, height: 900 } })
        try {
          await p.goto(servidor.base + ruta, { waitUntil: "networkidle" })
          const r = await p.evaluate(() => {
            const nav = document.querySelector("header nav")!
            const num = (c: string) => (c.match(/-?\d*\.?\d+/g) || []).map(Number)
            const rgba = (c: string): [number, number, number, number] => {
              const n = num(c)
              const f = c.startsWith("color(") ? 255 : 1
              return [n[0] * f, n[1] * f, n[2] * f, n.length > 3 ? n[3] : 1]
            }
            const lin = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
            const lum = (c: number[]) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2])
            const veloC = rgba(getComputedStyle(nav.parentElement!).backgroundColor)
            const fondo = [0, 1, 2].map((i) => veloC[i] * veloC[3] + 255 * (1 - veloC[3]))
            const textos = [...nav.querySelectorAll<HTMLElement>("a, button")].filter(
              (e) => !e.closest("[role=menu]") && !e.closest("[inert]") && e.offsetParent !== null && e.getBoundingClientRect().width > 0 && (e.textContent || "").trim().length > 1,
            )
            let peor = Infinity
            let cual = ""
            for (const e of textos) {
              const c = rgba(getComputedStyle(e).color)
              const t = [0, 1, 2].map((i) => c[i] * c[3] + fondo[i] * (1 - c[3]))
              const [hi, lo] = [lum(t), lum(fondo)].sort((a, b) => b - a)
              const k = (hi + 0.05) / (lo + 0.05)
              if (k < peor) {
                peor = k
                cual = (e.textContent || "").trim().slice(0, 18)
              }
            }
            return { velo: veloC[3], n: textos.length, peor, cual }
          })
          expect(r.velo, "velo de la barra sobre la foto").toBeCloseTo(0.68, 2)
          expect(r.n).toBeGreaterThan(8)
          expect(r.peor, `peor texto de la barra: «${r.cual}»`).toBeGreaterThanOrEqual(4.5)
        } finally {
          await p.close()
        }
      })
    }
  }
})
