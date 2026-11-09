import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { arrancarNext, type ServidorNext } from "./next-start"
import { cargarPlaywright, type Navegador } from "./playwright-util"

/*
  Cabecera de móvil y de tablet (CABECERA-MOVIL-A2). Chromium real, a 360, 390, 768, 820 y 1.024 px en
  es/en/fr/de, y a 1.280 px para comprobar que el escritorio no cambia. Se salta si no hay Playwright/Chromium.

  Lo que depende del asistente (su botón, sus huecos) solo se puede probar en una compilación con
  SEDA_FLAG_ASISTENTE_PROPIETARIOS=1; sin él, esas pruebas se saltan y el PR dice con qué compilación se corrieron.
*/

const IDIOMAS: Record<string, string> = { es: "/", en: "/en", fr: "/fr", de: "/de" }
const ANCHOS = [360, 390, 768, 820, 1024]
const alto = (ancho: number) => (ancho < 500 ? 800 : 1100)

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

type P = Awaited<ReturnType<Navegador["newPage"]>>
async function conPagina(ancho: number, alt: number, url: string, f: (p: P) => Promise<void>) {
  const p = await navegador!.newPage({ viewport: { width: ancho, height: alt } })
  try {
    await p.goto(servidor.base + url, { waitUntil: "networkidle" })
    await f(p)
  } finally {
    await p.close()
  }
}

/** Baja y sube un poco: por debajo de 1.280 px la cabecera no se recoge al subir, y debajo de 768 nunca. */
async function bajarYSubirUnPoco(p: P) {
  await p.evaluate(() => window.scrollTo(0, 900))
  await p.waitForTimeout(700)
  await p.evaluate(() => window.scrollTo(0, 860))
  await p.waitForTimeout(900)
}

/* ── La barra: visible, sin etiquetas cortadas, sin solapes ─────────────────── */

function medirBarra() {
  const nav = document.querySelector("header nav")!
  const visibles = [...nav.querySelectorAll<HTMLElement>("a,button")].filter(
    (e) => !e.closest("[role=menu]") && !e.closest("[role=dialog]") && !e.closest("[inert]") && getComputedStyle(e).visibility !== "hidden" && e.getBoundingClientRect().width > 0,
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
    medios.sort((a, b) => a - b)
    return medios.filter((m, i) => i === 0 || m - medios[i - 1] > 6).length
  }
  const items = visibles.map((e) => ({ e, t: (e.textContent || e.getAttribute("aria-label") || "").trim().slice(0, 18), r: e.getBoundingClientRect() }))
  const problemas: string[] = []
  for (const { e, t, r } of items) {
    if (lineas(e) > 1) problemas.push(`«${t}» ocupa varias líneas`)
    if (e.scrollWidth > e.clientWidth + 0.5) problemas.push(`«${t}» tiene la etiqueta cortada (${e.scrollWidth} > ${e.clientWidth})`)
    if (r.left < -0.5 || r.right > innerWidth + 0.5) problemas.push(`«${t}» se sale de la ventana (${Math.round(r.left)}–${Math.round(r.right)} de ${innerWidth})`)
    if (r.top < -0.5 || r.bottom > innerHeight + 0.5) problemas.push(`«${t}» queda fuera de la ventana por arriba o abajo`)
    for (const hijo of e.querySelectorAll<HTMLElement>("span")) {
      const rh = hijo.getBoundingClientRect()
      if (rh.width > 0 && (rh.left < r.left - 0.5 || rh.right > r.right + 0.5)) problemas.push(`«${(hijo.textContent || "").trim()}» desborda su botón`)
    }
  }
  for (let i = 0; i < items.length; i++)
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i].r
      const b = items[j].r
      const h = Math.max(a.left, b.left) - Math.min(a.right, b.right)
      const v = Math.max(a.top, b.top) - Math.min(a.bottom, b.bottom)
      if (v < 0 && h < 0) problemas.push(`«${items[i].t}» y «${items[j].t}» se solapan`)
      else if (v < 0 && h < 4) problemas.push(`«${items[i].t}» y «${items[j].t}» a ${Math.round(h)} px`)
    }
  if (document.documentElement.scrollWidth > innerWidth) problemas.push("scroll horizontal")
  // ¿Se ve de verdad (no tapado)? El centro del botón debe ser del botón.
  const visible = (sel: string) => {
    const e = [...document.querySelectorAll<HTMLElement>(sel)].find((x) => x.getBoundingClientRect().width > 0)
    if (!e) return false
    const r = e.getBoundingClientRect()
    if (r.top < -0.5 || r.bottom > innerHeight + 0.5 || r.left < -0.5 || r.right > innerWidth + 0.5) return false
    const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    return !!el && (e === el || e.contains(el))
  }
  const reservar = [...document.querySelectorAll<HTMLElement>("[data-barra-reservar]")].find((x) => x.getBoundingClientRect().width > 0)
  const portal = [...nav.querySelectorAll<HTMLElement>("[data-portal-movil] > button, [data-tablet-portal] > button")].find((x) => x.getBoundingClientRect().width > 0)
  const letras = nav.querySelector<HTMLElement>("[data-logo-letras]")
  const barra = nav.getBoundingClientRect()
  return {
    problemas,
    n: items.length,
    reservarVisible: visible("[data-barra-reservar]"),
    portalVisible: visible("[data-portal-movil] > button, [data-tablet-portal] > button"),
    reservar: reservar ? { clave: reservar.dataset.barraReservar, href: reservar.getAttribute("href"), alto: Math.round(reservar.getBoundingClientRect().height) } : null,
    portalTexto: (portal?.textContent || "").trim(),
    letras: letras ? getComputedStyle(letras).display !== "none" : false,
    altoBarra: Math.round(barra.height),
    sedaOs: !!nav.querySelector("[data-tablet-sedaos]") && (nav.querySelector("[data-tablet-sedaos]") as HTMLElement).getBoundingClientRect().width > 0,
    idiomas: [...nav.querySelectorAll<HTMLElement>("[role=group] button")].filter((b) => b.getBoundingClientRect().width > 0).length,
    burger: [...document.querySelectorAll<HTMLElement>("[data-boton-menu]")].some((b) => b.getBoundingClientRect().width > 0),
    portalDesplegableEscritorio: (() => {
      const e = nav.querySelector<HTMLElement>("[data-barra-escritorio]")
      return !!e && getComputedStyle(e).display !== "none"
    })(),
  }
}

describe("la barra de móvil y de tablet", () => {
  for (const [idioma, ruta] of Object.entries(IDIOMAS)) {
    for (const ancho of ANCHOS) {
      it(`${idioma} ${ancho}px: Portal y Reservar a la vista arriba y tras bajar; nada cortado, solapado ni con scroll horizontal`, async (ctx) => {
        if (!navegador) return ctx.skip()
        await conPagina(ancho, alto(ancho), ruta, async (p) => {
          const arriba = await p.evaluate(medirBarra)
          expect(arriba.problemas, `${idioma} ${ancho}px arriba`).toEqual([])
          expect(arriba.reservarVisible, "Reservar a la vista").toBe(true)
          expect(arriba.portalVisible, "Portal a la vista").toBe(true)
          expect(arriba.reservar?.clave).toBe("reservar")
          expect(arriba.reservar?.href).toMatch(/\/contacto\?type=guest$/)
          expect(arriba.burger).toBe(true)
          expect(arriba.altoBarra, "alto de la barra").toBe(ancho < 768 ? 60 : 72)
          expect(arriba.reservar?.alto, "alto del botón Reservar").toBe(ancho < 768 ? 40 : 44)
          // Letras «SEDA» junto al isotipo por debajo de 1.280 px; se esconden por debajo de 375 px.
          expect(arriba.letras).toBe(ancho >= 375)
          // Tablet: SEDA OS ▾ y los idiomas en la barra; móvil: ninguno de los dos (los idiomas van en el menú).
          expect(arriba.sedaOs).toBe(ancho >= 768)
          expect(arriba.idiomas).toBe(ancho >= 768 ? 4 : 0)
          expect(arriba.portalDesplegableEscritorio).toBe(false)

          await bajarYSubirUnPoco(p)
          const abajo = await p.evaluate(medirBarra)
          expect(abajo.problemas, `${idioma} ${ancho}px tras bajar`).toEqual([])
          expect(abajo.reservarVisible, "Reservar a la vista tras bajar").toBe(true)
          expect(abajo.portalVisible, "Portal a la vista tras bajar").toBe(true)
        })
      })
    }
  }

  for (const ancho of [360, 390]) {
    it(`${ancho}px: bajando sin parar (sin subir) la barra no se esconde: Portal y Reservar siguen ahí`, async (ctx) => {
      if (!navegador) return ctx.skip()
      await conPagina(ancho, 800, "/", async (p) => {
        for (const y of [300, 700, 1200, 1800]) {
          await p.evaluate((yy) => window.scrollTo(0, yy), y)
          await p.waitForTimeout(250)
        }
        await p.waitForTimeout(800)
        const r = await p.evaluate(medirBarra)
        expect(r.reservarVisible).toBe(true)
        expect(r.portalVisible).toBe(true)
        expect(r.problemas).toEqual([])
      })
    })
  }

  it("1.280 px: el escritorio no cambia (barra completa, sin botón de menú, sin Portal móvil, franja de 36 px)", async (ctx) => {
    if (!navegador) return ctx.skip()
    await conPagina(1280, 900, "/", async (p) => {
      const r = await p.evaluate(() => ({
        escritorio: getComputedStyle(document.querySelector("[data-barra-escritorio]")!).display !== "none",
        burger: [...document.querySelectorAll<HTMLElement>("[data-boton-menu]")].some((b) => b.getBoundingClientRect().width > 0),
        portalMovil: [...document.querySelectorAll<HTMLElement>("[data-portal-movil], [data-tablet-portal], [data-tablet-sedaos]")].some((b) => b.getBoundingClientRect().width > 0),
        reservarMovil: [...document.querySelectorAll<HTMLElement>("[data-barra-reservar]")].some((b) => b.getBoundingClientRect().width > 0),
        letras: [...document.querySelectorAll<HTMLElement>("[data-logo-letras]")].some((b) => b.getBoundingClientRect().width > 0),
        franja: Math.round(document.querySelector("[data-franja]")!.getBoundingClientRect().height),
        barra: Math.round(document.querySelector("header nav")!.getBoundingClientRect().height),
        hoja: getComputedStyle(document.querySelector("[data-hoja-menu]")!).display,
      }))
      expect(r).toEqual({ escritorio: true, burger: false, portalMovil: false, reservarMovil: false, letras: false, franja: 36, barra: 84, hoja: "none" })
    })
  })
})

describe("Reservar / Valorar según la página", () => {
  const RUTAS: [string, "reservar" | "valorar", string][] = [
    ["/", "reservar", "guest"],
    ["/coleccion", "reservar", "guest"],
    ["/faq", "reservar", "guest"],
    ["/propietarios", "valorar", "owner"],
    ["/founding-owners", "valorar", "owner"],
    ["/ecosistema", "valorar", "owner"],
  ]
  for (const ancho of [360, 820]) {
    for (const [ruta, clave, tipo] of RUTAS) {
      it(`${ancho}px ${ruta}: el botón de la barra es «${clave}» y va a ${tipo}`, async (ctx) => {
        if (!navegador) return ctx.skip()
        await conPagina(ancho, alto(ancho), ruta, async (p) => {
          const r = await p.evaluate(medirBarra)
          expect(r.reservar?.clave).toBe(clave)
          expect(r.reservar?.href).toMatch(new RegExp(`/contacto\\?type=${tipo}$`))
          expect(r.problemas).toEqual([])
        })
      })
    }
  }
  for (const [idioma, rutaOwner, esperado] of [
    ["es", "/propietarios", "Valorar"],
    ["en", "/en/propietarios", "Value"],
    ["fr", "/fr/propietarios", "Estimer"],
    ["de", "/de/propietarios", "Bewerten"],
  ] as const) {
    it(`${idioma} 390px: en la página de propietarios la etiqueta es «${esperado}»`, async (ctx) => {
      if (!navegador) return ctx.skip()
      await conPagina(390, 800, rutaOwner, async (p) => {
        const t = await p.evaluate(() => (document.querySelector("[data-barra-reservar]")?.textContent || "").trim())
        expect(t).toBe(esperado)
      })
    })
  }
})

/* ── Panel de Portal ──────────────────────────────────────────────────────── */

function medirPanelPortal(movil: boolean) {
  const panel = document.querySelector<HTMLElement>(movil ? "[data-portal-movil-panel]" : "[data-tablet-portal] [data-portal-panel]")
  if (!panel) return { hay: false as const }
  const r = panel.getBoundingClientRect()
  const visible = r.width > 0 && getComputedStyle(panel.closest("[role=menu]") || panel).visibility !== "hidden"
  const tarjetas = [...panel.querySelectorAll<HTMLAnchorElement>("a")]
  const problemas: string[] = []
  if (r.left < -0.5 || r.right > innerWidth + 0.5 || r.top < -0.5 || r.bottom > innerHeight + 0.5) problemas.push(`el panel se sale de la ventana (${Math.round(r.left)}–${Math.round(r.right)} de ${innerWidth}; abajo ${Math.round(r.bottom)} de ${innerHeight})`)
  for (const t of tarjetas) {
    const rt = t.getBoundingClientRect()
    if (rt.left < r.left - 0.5 || rt.right > r.right + 0.5) problemas.push(`la tarjeta «${(t.textContent || "").trim().slice(0, 20)}» se sale del panel`)
    if (t.scrollWidth > t.clientWidth + 0.5) problemas.push("tarjeta con desborde")
    for (const h of t.querySelectorAll<HTMLElement>("*")) {
      const rh = h.getBoundingClientRect()
      if (rh.width > 0 && (rh.left < rt.left - 1 || rh.right > rt.right + 1)) problemas.push(`el texto «${(h.textContent || "").trim().slice(0, 20)}» se sale de su tarjeta`)
    }
  }
  return {
    hay: true as const,
    visible,
    problemas,
    izquierda: Math.round(r.left),
    derecha: Math.round(innerWidth - r.right),
    arriba: Math.round(r.top),
    hrefs: tarjetas.map((a) => a.getAttribute("href")),
    textos: tarjetas.map((a) => (a.textContent || "").replace(/\s+/g, " ").trim()),
  }
}

const GUEST = "https://guests.sedaprivatehomes.com/acceso"
const PORTAL = "https://portal.sedaprivatehomes.com/"

describe("Portal: el panel del móvil", () => {
  for (const [idioma, ruta] of Object.entries(IDIOMAS)) {
    for (const ancho of [360, 390]) {
      it(`${idioma} ${ancho}px: abre bajo la barra a 10 px de cada lado con dos tarjetas dentro de la ventana; Escape lo cierra`, async (ctx) => {
        if (!navegador) return ctx.skip()
        await conPagina(ancho, 800, ruta, async (p) => {
          await p.click("[data-portal-movil] > button")
          await p.waitForTimeout(300)
          const r = await p.evaluate(medirPanelPortal, true)
          expect(r.hay).toBe(true)
          if (!r.hay) return
          expect(r.visible).toBe(true)
          expect(r.problemas, `${idioma} ${ancho}px`).toEqual([])
          expect([r.izquierda, r.derecha]).toEqual([10, 10])
          expect(r.arriba, "bajo la barra de 60 px").toBeGreaterThanOrEqual(60)
          expect(r.hrefs).toEqual([GUEST, PORTAL])
          expect(r.textos[0]).toContain("Guest App")
          expect(r.textos[1]).toMatch(/Portal|Portail/)
          await p.keyboard.press("Escape")
          await p.waitForTimeout(200)
          expect(await p.evaluate(() => !!document.querySelector("[data-portal-movil-panel]")), "Escape cierra el panel").toBe(false)
        })
      })
    }
  }

  it("tocar fuera lo cierra; el mismo botón lo abre y lo cierra; y con él abierto, el menú no se abre a la vez", async (ctx) => {
    if (!navegador) return ctx.skip()
    await conPagina(390, 800, "/", async (p) => {
      const abierto = () => p.evaluate(() => !!document.querySelector("[data-portal-movil-panel]"))
      await p.click("[data-portal-movil] > button")
      await p.waitForTimeout(200)
      expect(await abierto()).toBe(true)
      await p.click("[data-portal-movil] > button")
      await p.waitForTimeout(200)
      expect(await abierto(), "el mismo botón lo cierra").toBe(false)
      await p.click("[data-portal-movil] > button")
      await p.waitForTimeout(200)
      await p.mouse.click(195, 700) // fuera del panel
      await p.waitForTimeout(200)
      expect(await abierto(), "tocar fuera lo cierra").toBe(false)
      await p.click("[data-portal-movil] > button")
      await p.waitForTimeout(200)
      await p.click("[data-boton-menu]:visible")
      await p.waitForTimeout(500)
      expect(await abierto(), "abrir el menú cierra el panel").toBe(false)
      expect(await p.evaluate(() => document.querySelector("[data-hoja-menu]")?.getAttribute("data-hoja-menu"))).toBe("abierta")
    })
  })
})

describe("Portal ▾ y SEDA OS ▾ en tablet: mismos desplegables que el escritorio, dentro de la ventana", () => {
  for (const [idioma, ruta] of Object.entries(IDIOMAS)) {
    for (const ancho of [768, 820, 1024]) {
      it(`${idioma} ${ancho}px: el panel de Portal queda dentro de la ventana y Escape lo cierra`, async (ctx) => {
        if (!navegador) return ctx.skip()
        await conPagina(ancho, 1000, ruta, async (p) => {
          await p.click("[data-tablet-portal] > button")
          await p.waitForTimeout(400)
          const r = await p.evaluate(medirPanelPortal, false)
          expect(r.hay).toBe(true)
          if (!r.hay) return
          expect(r.visible).toBe(true)
          expect(r.problemas, `${idioma} ${ancho}px`).toEqual([])
          expect(r.hrefs).toEqual([GUEST, PORTAL])
          await p.keyboard.press("Escape")
          await p.waitForTimeout(400)
          const cerrado = await p.evaluate(() => getComputedStyle(document.querySelector("[data-tablet-portal] [role=menu]")!).visibility)
          expect(cerrado).toBe("hidden")
        })
      })
    }
  }
  it("768 px: el desplegable SEDA OS ▾ queda dentro de la ventana", async (ctx) => {
    if (!navegador) return ctx.skip()
    await conPagina(768, 1000, "/", async (p) => {
      await p.click("[data-tablet-sedaos] > button")
      await p.waitForTimeout(400)
      const r = await p.evaluate(() => {
        const m = document.querySelector<HTMLElement>("[data-tablet-sedaos] [role=menu]")!.getBoundingClientRect()
        return { visible: getComputedStyle(document.querySelector("[data-tablet-sedaos] [role=menu]")!).visibility, izq: m.left, der: m.right, ancho: innerWidth, items: document.querySelectorAll("[data-tablet-sedaos] [role=menuitem]").length }
      })
      expect(r.visible).toBe("visible")
      expect(r.izq).toBeGreaterThanOrEqual(0)
      expect(r.der).toBeLessThanOrEqual(r.ancho)
      expect(r.items).toBe(3)
    })
  })
})

/* ── El menú ──────────────────────────────────────────────────────────────── */

function medirMenu() {
  const hoja = document.querySelector<HTMLElement>("[data-hoja-menu]")!
  const interior = hoja.firstElementChild as HTMLElement
  const menu = hoja.querySelector<HTMLElement>("[data-menu-movil]")!
  const enlaces = [...hoja.querySelectorAll<HTMLElement>("a, button")].filter((e) => e.getBoundingClientRect().width > 0)
  const problemas: string[] = []
  if (interior.scrollHeight > interior.clientHeight + 0.5) problemas.push(`el menú tiene scroll (${interior.scrollHeight} > ${interior.clientHeight})`)
  for (const e of enlaces) {
    const r = e.getBoundingClientRect()
    const t = (e.textContent || e.getAttribute("aria-label") || "").trim().slice(0, 22)
    if (r.left < -0.5 || r.right > innerWidth + 0.5 || r.bottom > innerHeight + 0.5 || r.top < 0) problemas.push(`«${t}» queda fuera de la ventana`)
    if (e.scrollWidth > e.clientWidth + 0.5) problemas.push(`«${t}» desborda su caja`)
  }
  if (document.documentElement.scrollWidth > innerWidth) problemas.push("scroll horizontal")
  const idiomas = [...hoja.querySelectorAll<HTMLElement>("[role=group] button")].filter((b) => b.getBoundingClientRect().width > 0)
  return {
    problemas,
    nEnlaces: enlaces.length,
    portal: [...hoja.querySelectorAll<HTMLAnchorElement>("[data-menu-portal-tarjeta]")].map((a) => ({ href: a.getAttribute("href"), texto: (a.textContent || "").replace(/\s+/g, " ").trim(), x: Math.round(a.getBoundingClientRect().left) })),
    grupos: [...hoja.querySelectorAll<HTMLElement>("[data-menu-grupo]")].map((g) => [...g.querySelectorAll("a")].map((a) => a.getAttribute("href"))),
    idiomas: idiomas.map((b) => (b.textContent || "").trim()),
    asistente: !!hoja.querySelector("[data-menu-asistente]"),
    botones: [...menu.querySelectorAll<HTMLAnchorElement>(":scope > div:first-child a")].map((a) => ({ href: a.getAttribute("href"), texto: (a.textContent || "").replace(/\s+/g, " ").trim() })),
    scrollW: document.documentElement.scrollWidth,
    ancho: innerWidth,
    alturaContenido: Math.round(menu.getBoundingClientRect().height),
    ultimo: Math.round(idiomas[0]?.getBoundingClientRect().bottom ?? 0),
    alto: innerHeight,
  }
}

async function abrirMenu(p: P) {
  await p.click("[data-boton-menu]:visible")
  await p.waitForTimeout(900)
}

describe("el menú del móvil: cabe en una pantalla", () => {
  for (const [idioma, ruta] of Object.entries(IDIOMAS)) {
    it(`${idioma} 390×844: sin scroll, con Reservar/Valorar, dos tarjetas de Portal, dos columnas de navegación, SEDA e idiomas`, async (ctx) => {
      if (!navegador) return ctx.skip()
      await conPagina(390, 844, ruta, async (p) => {
        await abrirMenu(p)
        const r = await p.evaluate(medirMenu)
        expect(r.problemas, `${idioma} 390×844`).toEqual([])
        expect(r.botones.map((b) => b.href?.replace(/^\/(en|fr|de)(?=\/)/, ""))).toEqual(["/contacto?type=guest", "/contacto?type=owner"])
        expect(r.portal.map((t) => t.href)).toEqual([GUEST, PORTAL])
        expect(r.portal[1].x, "las tarjetas de Portal, en dos columnas").toBeGreaterThan(r.portal[0].x + 100)
        expect(r.grupos.length).toBe(3)
        expect(r.grupos[0].length).toBe(3) // Colección, Experiencias, Guest App
        expect(r.grupos[1].length).toBe(2) // Modelo de gestión, Ecosistema SEDA OS
        expect(r.grupos[2].length).toBeGreaterThanOrEqual(4) // Nosotros, Filosofía, FAQ, Contacto (+ Guías)
        expect(r.idiomas).toEqual(["ES", "EN", "FR", "DE"])
        expect(r.scrollW).toBeLessThanOrEqual(r.ancho)
      })
    })
  }
  for (const [ancho, alt] of [
    [360, 740],
    [375, 667],
    [820, 1180],
    [1024, 768],
  ] as const) {
    it(`${ancho}×${alt}: el menú no se sale por los lados ni da scroll horizontal; ${alt >= 800 ? "cabe sin scroll" : "con el contenido recortado, solo desplaza en vertical"}`, async (ctx) => {
      if (!navegador) return ctx.skip()
      await conPagina(ancho, alt, "/de", async (p) => {
        await abrirMenu(p)
        const r = await p.evaluate(medirMenu)
        const sinScrollV = r.problemas.filter((x) => !x.startsWith("el menú tiene scroll") && !x.includes("queda fuera de la ventana"))
        expect(sinScrollV).toEqual([])
        if (alt >= 800) expect(r.problemas).toEqual([])
      })
    })
  }
  it("Escape cierra el menú, y el menú abierto esconde la página (aria)", async (ctx) => {
    if (!navegador) return ctx.skip()
    await conPagina(390, 844, "/", async (p) => {
      await abrirMenu(p)
      expect(await p.evaluate(() => document.documentElement.hasAttribute("data-hoja-abierta"))).toBe(true)
      await p.keyboard.press("Escape")
      await p.waitForTimeout(400)
      expect(await p.evaluate(() => document.querySelector("[data-hoja-menu]")?.getAttribute("data-hoja-menu"))).toBe("cerrada")
      expect(await p.evaluate(() => document.documentElement.hasAttribute("data-hoja-abierta"))).toBe(false)
    })
  })
})

/* ── Contraste (≥ 4,5:1 en el peor caso: la barra sobre una foto blanca) ──────── */

function medirContraste(raices: string[]) {
  const num = (c: string) => (c.match(/-?\d*\.?\d+/g) || []).map(Number)
  const rgba = (c: string): [number, number, number, number] => {
    const n = num(c)
    const f = c.startsWith("color(") ? 255 : 1
    return [n[0] * f, n[1] * f, n[2] * f, n.length > 3 ? n[3] : 1]
  }
  const lin = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
  const lum = (c: number[]) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2])
  // Fondo real: se compone de dentro afuera hasta encontrar uno opaco; si no lo hay, sobre una foto blanca.
  const fondoDe = (e: HTMLElement) => {
    const capas: [number, number, number, number][] = []
    for (let n: HTMLElement | null = e; n; n = n.parentElement) {
      const c = rgba(getComputedStyle(n).backgroundColor)
      if (c[3] > 0) capas.push(c)
      if (c[3] >= 1) break
    }
    let f = [255, 255, 255]
    for (const c of capas.reverse()) f = [0, 1, 2].map((i) => c[i] * c[3] + f[i] * (1 - c[3]))
    return f
  }
  let peor = Infinity
  let cual = ""
  let n = 0
  for (const raiz of raices) {
    for (const r of document.querySelectorAll<HTMLElement>(raiz)) {
      for (const e of r.querySelectorAll<HTMLElement>("*")) {
        const propio = [...e.childNodes].some((x) => x.nodeType === 3 && (x.textContent || "").trim().length > 0)
        if (!propio) continue
        const b = e.getBoundingClientRect()
        if (b.width === 0 || getComputedStyle(e).visibility === "hidden") continue
        const t = (e.textContent || "").trim()
        if (/^[·/→▼]+$/.test(t)) continue // separadores y flechas
        const fondo = fondoDe(e)
        const c = rgba(getComputedStyle(e).color)
        const op = Number(getComputedStyle(e).opacity)
        const a = c[3] * op
        const tx = [0, 1, 2].map((i) => c[i] * a + fondo[i] * (1 - a))
        const [hi, lo] = [lum(tx), lum(fondo)].sort((x, y) => y - x)
        const k = (hi + 0.05) / (lo + 0.05)
        n++
        if (k < peor) {
          peor = k
          cual = t.slice(0, 24)
        }
      }
    }
  }
  return { peor, cual, n }
}

describe("contraste de lo nuevo: todo el texto ≥ 4,5:1 en el peor caso", () => {
  for (const [idioma, ruta] of Object.entries(IDIOMAS)) {
    for (const ancho of [360, 820]) {
      it(`${idioma} ${ancho}px: la barra sobre la foto (portada, arriba)`, async (ctx) => {
        if (!navegador) return ctx.skip()
        await conPagina(ancho, alto(ancho), ruta, async (p) => {
          const r = await p.evaluate(medirContraste, ["header nav", "[data-franja]"])
          expect(r.n).toBeGreaterThanOrEqual(ancho < 768 ? 2 : 5)
          expect(r.peor, `peor texto: «${r.cual}»`).toBeGreaterThanOrEqual(4.5)
        })
      })
    }
    it(`${idioma} 390px: el panel de Portal y el menú abierto`, async (ctx) => {
      if (!navegador) return ctx.skip()
      await conPagina(390, 844, ruta, async (p) => {
        await p.click("[data-portal-movil] > button")
        await p.waitForTimeout(300)
        const a = await p.evaluate(medirContraste, ["[data-portal-movil-panel]"])
        expect(a.peor, `Portal: «${a.cual}»`).toBeGreaterThanOrEqual(4.5)
        await p.click("[data-boton-menu]:visible")
        await p.waitForTimeout(900)
        const m = await p.evaluate(medirContraste, ["[data-hoja-menu]"])
        expect(m.n).toBeGreaterThan(10)
        expect(m.peor, `menú: «${m.cual}»`).toBeGreaterThanOrEqual(4.5)
      })
    })
  }
})

/* ── El rótulo «Imagen ilustrativa» ─────────────────────────────────────────── */

describe("«Imagen ilustrativa» arriba a la derecha, bajo la cabecera, por debajo de 1.280 px", () => {
  for (const ruta of ["/", "/propietarios", "/founding-owners"]) {
    for (const ancho of [360, 390, 820, 1024]) {
      it(`${ruta} ${ancho}px: el rótulo cae bajo la cabecera y pegado a la derecha`, async (ctx) => {
        if (!navegador) return ctx.skip()
        await conPagina(ancho, alto(ancho), ruta, async (p) => {
          const r = await p.evaluate(() => {
            const tag = [...document.querySelectorAll<HTMLElement>("span")].find((s) => /Imagen ilustrativa/i.test(s.textContent || "") && s.getBoundingClientRect().width > 0)
            if (!tag) return null
            const t = tag.getBoundingClientRect()
            const h = document.querySelector("header")!.getBoundingClientRect()
            return { arriba: Math.round(t.top), cabecera: Math.round(h.bottom), derecha: Math.round(innerWidth - t.right) }
          })
          if (!r) return // esta ruta no lleva rótulo
          expect(r.arriba, "bajo la cabecera").toBeGreaterThanOrEqual(r.cabecera)
          expect(r.derecha).toBe(ancho >= 768 ? 24 : 16)
        })
      })
    }
  }
  it("1.280 px: en escritorio el rótulo sigue abajo a la derecha (no cambia)", async (ctx) => {
    if (!navegador) return ctx.skip()
    await conPagina(1280, 900, "/", async (p) => {
      const r = await p.evaluate(() => {
        const tag = [...document.querySelectorAll<HTMLElement>("span")].find((s) => /Imagen ilustrativa/i.test(s.textContent || ""))!
        const t = tag.getBoundingClientRect()
        return { abajo: Math.round(innerHeight - t.bottom), derecha: Math.round(innerWidth - t.right) }
      })
      expect(r).toEqual({ abajo: 16, derecha: 24 })
    })
  })
})

/* ── El asistente (solo si la compilación lo lleva) ───────────────────────────── */


function medirAsistente() {
  const b = document.querySelector<HTMLElement>("[data-asistente-boton]")
  if (!b) return { hay: false as const }
  const r = b.getBoundingClientRect()
  const visible = getComputedStyle(b).display !== "none" && r.width > 0
  const heroEnlaces = [...document.querySelectorAll<HTMLElement>("#hero a, #hero button")].filter((e) => e.getBoundingClientRect().width > 0 && getComputedStyle(e).visibility !== "hidden")
  const solapa = heroEnlaces.filter((e) => {
    const q = e.getBoundingClientRect()
    return r.left < q.right - 0.5 && q.left < r.right - 0.5 && r.top < q.bottom - 0.5 && q.top < r.bottom - 0.5 && q.bottom > 0 && q.top < innerHeight
  })
  return {
    hay: true as const,
    visible,
    derecha: Math.round(innerWidth - r.right),
    abajo: Math.round(innerHeight - r.bottom - (parseFloat(document.documentElement.style.getPropertyValue("--banner-cookies-h")) || 0)),
    texto: b.innerText.trim(),
    alto: Math.round(r.height),
    solapaHero: solapa.map((e) => (e.textContent || "").trim().slice(0, 20)),
  }
}

describe("el asistente por debajo de 1.280 px (con la compilación del asistente)", () => {
  for (const [idioma, ruta] of Object.entries(IDIOMAS)) {
    for (const ancho of [360, 390, 820]) {
      it(`${idioma} ${ancho}px: abajo a la derecha (16 / 22 px), sin tapar los botones del hero; con el menú o el Portal abiertos se oculta`, async (ctx) => {
        if (!navegador) return ctx.skip()
        await conPagina(ancho, alto(ancho), ruta, async (p) => {
          const r = await p.evaluate(medirAsistente)
          if (!r.hay) return ctx.skip()
          expect(r.visible).toBe(true)
          expect(r.derecha).toBe(16)
          expect(r.abajo).toBe(22)
          expect(r.alto).toBe(44)
          expect(r.solapaHero, "botones del hero tapados por el asistente").toEqual([])
          const m = await import(`@/messages/${idioma}.json`)
          expect(r.texto.toLowerCase()).toBe((ancho < 768 ? m.default.asistente.corto : m.default.asistente.abrir_portada).toLowerCase())
          if (ancho < 768) {
            await p.click("[data-portal-movil] > button")
            await p.waitForTimeout(300)
            expect((await p.evaluate(medirAsistente)).hay && (await p.evaluate(medirAsistente)).visible, "oculto con el Portal abierto").toBe(false)
            await p.keyboard.press("Escape")
            await p.waitForTimeout(200)
          }
          await abrirMenu(p)
          const con = await p.evaluate(medirAsistente)
          expect(con.hay && con.visible, "oculto con el menú abierto").toBe(false)
          // Con el menú abierto, la tarjeta del asistente está en el menú y lo abre.
          expect(await p.evaluate(() => !!document.querySelector("[data-menu-asistente]"))).toBe(true)
        })
      })
    }
  }
  it("390px: la tarjeta «Asistente SEDA» del menú cierra el menú y abre el asistente", async (ctx) => {
    if (!navegador) return ctx.skip()
    await conPagina(390, 844, "/", async (p) => {
      if (!(await p.evaluate(medirAsistente)).hay) return ctx.skip()
      await abrirMenu(p)
      await p.click("[data-menu-asistente]")
      await p.waitForTimeout(1500)
      const r = await p.evaluate(() => ({
        menu: document.querySelector("[data-hoja-menu]")?.getAttribute("data-hoja-menu"),
        panel: [...document.querySelectorAll<HTMLElement>("#asistente-propietarios, [role=dialog]")].some((e) => e.getBoundingClientRect().width > 0 && !e.closest("[data-portal-movil]")),
      }))
      expect(r.menu).toBe("cerrada")
      expect(r.panel, "el panel del asistente está abierto").toBe(true)
    })
  })
  it("390px: el último enlace del pie queda libre del botón del asistente", async (ctx) => {
    if (!navegador) return ctx.skip()
    await conPagina(390, 800, "/", async (p) => {
      if (!(await p.evaluate(medirAsistente)).hay) return ctx.skip()
      await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await p.waitForTimeout(900)
      const r = await p.evaluate(() => {
        const b = document.querySelector<HTMLElement>("[data-asistente-boton]")!.getBoundingClientRect()
        const enlaces = [...document.querySelectorAll<HTMLElement>("footer a")].filter((e) => e.getBoundingClientRect().width > 0)
        const solapados = enlaces.filter((e) => {
          const q = e.getBoundingClientRect()
          return b.left < q.right - 0.5 && q.left < b.right - 0.5 && b.top < q.bottom - 0.5 && q.top < b.bottom - 0.5
        })
        return { n: enlaces.length, solapados: solapados.map((e) => (e.textContent || "").trim().slice(0, 24)), scroll: scrollY + innerHeight >= document.body.scrollHeight - 2 }
      })
      expect(r.n).toBeGreaterThan(5)
      expect(r.scroll, "se llegó al final de la página").toBe(true)
      expect(r.solapados).toEqual([])
    })
  })
  it("el contraste del botón del asistente (crema sobre oliva) es ≥ 4,5:1", async (ctx) => {
    if (!navegador) return ctx.skip()
    await conPagina(390, 800, "/", async (p) => {
      if (!(await p.evaluate(medirAsistente)).hay) return ctx.skip()
      const r = await p.evaluate(medirContraste, ["[data-asistente-boton]"])
      expect(r.n).toBeGreaterThan(0)
      expect(r.peor).toBeGreaterThanOrEqual(4.5)
    })
  })
  it("1.280 px: en escritorio el botón no cambia (derecha 24 px, sin hoja de menú)", async (ctx) => {
    if (!navegador) return ctx.skip()
    await conPagina(1280, 900, "/", async (p) => {
      const r = await p.evaluate(medirAsistente)
      if (!r.hay) return ctx.skip()
      expect(r.derecha).toBe(24)
    })
  })
})
