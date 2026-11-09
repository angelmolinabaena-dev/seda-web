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
    // «Reservar» recorta su brillo (overflow: hidden): su scrollWidth cuenta el brillo fuera de la caja, no el texto.
    if (e.hasAttribute("data-barra-reservar")) {
      const rg = document.createRange()
      rg.selectNodeContents(e)
      const tr = rg.getBoundingClientRect()
      if (tr.left < r.left - 0.5 || tr.right > r.right + 0.5) problemas.push(`«${t}» tiene la etiqueta cortada`)
    } else if (e.scrollWidth > e.clientWidth + 0.5) problemas.push(`«${t}» tiene la etiqueta cortada (${e.scrollWidth} > ${e.clientWidth})`)
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
  const centro = nav.querySelector<HTMLElement>("[data-grupo-central]")!.getBoundingClientRect()
  const pildora = [...document.querySelectorAll<HTMLElement>("[data-boton-menu]")].find((b) => b.getBoundingClientRect().width > 0)
  const txt = pildora?.querySelector<HTMLElement>("[data-boton-menu-texto]")
  const logo = nav.querySelector("a")!.getBoundingClientRect()
  const barra = nav.getBoundingClientRect()
  return {
    problemas,
    n: items.length,
    reservarVisible: visible("[data-barra-reservar]"),
    portalVisible: visible("[data-portal-movil] > button, [data-tablet-portal] > button"),
    reservar: reservar ? { clave: reservar.dataset.barraReservar, href: reservar.getAttribute("href"), alto: Math.round(reservar.getBoundingClientRect().height) } : null,
    portalTexto: (portal?.textContent || "").trim(),
    letras: !!nav.querySelector("[data-logo-letras]") || (nav.querySelector("a")?.textContent || "").trim().length > 0,
    centroDesplazamiento: Math.round(Math.abs((centro.left + centro.right) / 2 - innerWidth / 2) * 10) / 10,
    logoIzq: Math.round(logo.left),
    estilos: (() => {
      const bg = (e: Element) => getComputedStyle(e).backgroundColor
      const lleno = (e: Element) => !/rgba?\(0, 0, 0, 0\)|transparent/.test(bg(e)) && !/rgba\([^)]*, 0\)$/.test(bg(e))
      const botones = [...nav.querySelectorAll<HTMLElement>("a, button")].filter((e) => !e.closest("[role=menu]") && !e.closest("[role=dialog]") && e.getBoundingClientRect().width > 0)
      const sinCaja = (e: Element | null | undefined) => !!e && getComputedStyle(e).borderTopWidth === "0px" && !lleno(e)
      const portal = nav.querySelector<HTMLElement>("[data-portal-movil] > button, [data-tablet-portal] > button")
      const portalVis = [...nav.querySelectorAll<HTMLElement>("[data-portal-movil] > button, [data-tablet-portal] > button")].find((b) => b.getBoundingClientRect().width > 0) ?? portal
      const idioma = nav.querySelector<HTMLElement>("[data-idioma-compacto] > button")
      const res = [...nav.querySelectorAll<HTMLElement>("[data-barra-reservar]")].find((b) => b.getBoundingClientRect().width > 0)
      const menu = [...nav.querySelectorAll<HTMLElement>("[data-boton-menu]")].find((b) => b.getBoundingClientRect().width > 0)
      return {
        rellenos: botones.filter(lleno).map((e) => (e.textContent || e.getAttribute("aria-label") || "").trim()),
        portalSinCaja: sinCaja(portalVis),
        idiomaSinCaja: sinCaja(idioma),
        menuSinCaja: sinCaja(menu),
        portalLetra: portalVis ? getComputedStyle(portalVis).fontSize : "",
        portalOpacidad: portalVis ? getComputedStyle(portalVis).opacity : "",
        portalAlto: Math.round(portalVis?.getBoundingClientRect().height ?? 0),
        candado: Math.round(portalVis?.querySelector("svg")?.getBoundingClientRect().width ?? 0),
        idiomaLetra: idioma ? getComputedStyle(idioma).fontSize : "",
        idiomaAlto: Math.round(idioma?.getBoundingClientRect().height ?? 0),
        menuTam: menu ? [Math.round(menu.getBoundingClientRect().width), Math.round(menu.getBoundingClientRect().height)] : [],
        resLetra: res ? getComputedStyle(res).fontSize : "",
        resPeso: res ? getComputedStyle(res).fontWeight : "",
        resRelleno: res ? getComputedStyle(res).paddingLeft + "/" + getComputedStyle(res).paddingRight : "",
        resFondo: res ? bg(res) : "",
      }
    })(),
    pildora: pildora ? { texto: txt && getComputedStyle(txt).display !== "none" ? txt.innerText.trim() : "", aria: pildora.getAttribute("aria-label"), derecha: Math.round(innerWidth - pildora.getBoundingClientRect().right) } : null,
    idiomaCompacto: (() => {
      const b = nav.querySelector<HTMLElement>("[data-idioma-compacto] > button")
      return b && b.getBoundingClientRect().width > 0 ? b.innerText.trim() : null
    })(),
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
          expect(arriba.altoBarra, "alto de la barra").toBe(ancho < 768 ? 56 : 72)
          expect(arriba.reservar?.alto, "alto del botón Reservar").toBe(38)
          // Logo: solo el isotipo, sin la palabra «SEDA».
          expect(arriba.letras, "sin letras junto al logo").toBe(false)
          // Grupo central centrado de verdad en la pantalla (±4 px).
          // (a 360 px el idioma y el menú de la derecha ocupan más que el logo y empujan el centro unos píxeles)
          expect(arriba.centroDesplazamiento, `${idioma} ${ancho}px: grupo central descentrado`).toBeLessThanOrEqual(ancho >= 390 ? 4 : 20)
          // «Silenciosa» (31c): un solo botón relleno, «Reservar»; Portal, idioma y menú, sin borde ni fondo.
          expect(arriba.estilos.rellenos, "un solo botón relleno en la barra").toHaveLength(1)
          expect(arriba.estilos.rellenos[0]).toBe(arriba.reservar?.clave === "reservar" ? (await import(`@/messages/${idioma}.json`)).default.movil.reservar : "")
          expect([arriba.estilos.portalSinCaja, arriba.estilos.idiomaSinCaja, arriba.estilos.menuSinCaja]).toEqual([true, true, true])
          expect(arriba.estilos.portalLetra).toBe("10px")
          expect(arriba.estilos.portalOpacidad).toBe("0.9")
          expect(arriba.estilos.portalAlto, "zona táctil de Portal").toBeGreaterThanOrEqual(44)
          expect(arriba.estilos.candado).toBe(13)
          expect(arriba.estilos.idiomaLetra).toBe("10px")
          expect(arriba.estilos.idiomaAlto).toBeGreaterThanOrEqual(44)
          expect(arriba.estilos.menuTam, "icono del menú de 44 × 44").toEqual([44, 44])
          expect([arriba.estilos.resLetra, arriba.estilos.resPeso, arriba.estilos.resRelleno]).toEqual(["13.5px", "700", "18px/18px"])
          // Tablet: SEDA OS ▾ en el grupo; idioma como botón compacto «ES ▾» (nunca los cuatro en línea).
          expect(arriba.sedaOs).toBe(ancho >= 768)
          expect(arriba.idiomas, "los cuatro idiomas en línea no están en la barra").toBe(0)
          expect(arriba.idiomaCompacto?.toLowerCase()).toBe(idioma)
          // Píldora del menú: «MENÚ» en cada idioma; por debajo de 390 px, solo el icono, con aria-label.
          expect(arriba.pildora?.aria).toBeTruthy()
          expect(arriba.pildora?.texto, "el menú es solo el icono").toBe("")
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
        idiomaCompacto: [...document.querySelectorAll<HTMLElement>("[data-idioma-compacto]")].some((b) => b.getBoundingClientRect().width > 0),
        isotipoSolo: (document.querySelector("header nav a")?.textContent || "").trim() === "",
        franja: Math.round(document.querySelector("[data-franja]")!.getBoundingClientRect().height),
        barra: Math.round(document.querySelector("header nav")!.getBoundingClientRect().height),
        hoja: getComputedStyle(document.querySelector("[data-hoja-menu]")!).display,
      }))
      expect(r).toEqual({ escritorio: true, burger: false, portalMovil: false, reservarMovil: false, idiomaCompacto: false, isotipoSolo: true, franja: 36, barra: 84, hoja: "none" })
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
    // Letras y filas (MOVIL-A2 31b)
    ctas: [...hoja.querySelectorAll<HTMLElement>("[data-menu-cta]")].map((e) => ({ alto: Math.round(e.getBoundingClientRect().height), letra: getComputedStyle(e).fontSize })),
    nombresPortal: [...hoja.querySelectorAll<HTMLElement>("[data-menu-portal-nombre]")].map((e) => ({ letra: getComputedStyle(e).fontSize, fuente: getComputedStyle(e).fontFamily })),
    enlacesGrandes: [...hoja.querySelectorAll<HTMLElement>("[data-menu-enlace-grande]")].map((e) => ({ letra: getComputedStyle(e).fontSize, alto: Math.round(e.getBoundingClientRect().height), x: Math.round(e.getBoundingClientRect().left), fuente: getComputedStyle(e).fontFamily })),
    etiquetas: [...hoja.querySelectorAll<HTMLElement>("[data-menu-etiqueta]")].map((e) => ({ letra: getComputedStyle(e).fontSize, fuente: getComputedStyle(e).fontFamily })),
    enlacesSeda: [...hoja.querySelectorAll<HTMLElement>("[data-menu-enlace-seda]")].map((e) => getComputedStyle(e).fontSize),
    scrollV: interior.scrollHeight - interior.clientHeight,
    cerrar: (document.querySelector("[data-boton-menu]:not([hidden])") as HTMLElement | null)?.getAttribute("aria-label"),
    pildora: [...document.querySelectorAll<HTMLElement>("[data-boton-menu]")].filter((b) => b.getBoundingClientRect().width > 0).map((b) => b.getAttribute("aria-label"))[0],
    barraAbierta: (() => {
      const nav = document.querySelector("header nav")!
      const bg = getComputedStyle(nav.parentElement!).backgroundColor
      const res = [...nav.querySelectorAll<HTMLElement>("[data-barra-reservar]")].find((b) => b.getBoundingClientRect().width > 0)
      const lleno = [...nav.querySelectorAll<HTMLElement>("a, button")].filter((e) => !e.closest("[role=menu]") && e.getBoundingClientRect().width > 0 && !/rgba\(0, 0, 0, 0\)/.test(getComputedStyle(e).backgroundColor)).length
      return { fondo: bg, reservarFondo: res ? getComputedStyle(res).backgroundColor : "", reservarTexto: res ? getComputedStyle(res).color : "", rellenos: lleno, menuColor: getComputedStyle(document.querySelector("[data-boton-menu]")!).color }
    })(),
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
        // Letras grandes (31b)
        expect(r.ctas).toEqual([{ alto: 56, letra: "15px" }, { alto: 56, letra: "15px" }])
        expect(r.nombresPortal.map((n) => n.letra)).toEqual(["24px", "24px"])
        expect(r.nombresPortal[0].fuente).toMatch(/Cormorant|serif/i)
        expect(r.enlacesGrandes.map((e) => e.letra)).toEqual(Array(5).fill("30px"))
        expect(r.enlacesGrandes.map((e) => e.alto)).toEqual(Array(5).fill(48))
        expect(new Set(r.enlacesGrandes.map((e) => e.x)).size, "Huéspedes y Propietarios, en una sola columna").toBe(1)
        expect(r.enlacesGrandes[0].fuente).toBe(r.nombresPortal[0].fuente)
        expect(r.etiquetas.map((e) => e.letra)).toEqual(["11px", "11px"])
        expect(r.etiquetas[0].fuente).toMatch(/mono/i)
        expect(r.enlacesSeda.every((x) => x === "17px")).toBe(true)
        // Llega hasta abajo: los idiomas pegados al borde inferior, sin scroll.
        expect(r.scrollV, "sin scroll").toBeLessThanOrEqual(0)
        expect(r.alto - r.ultimo, "idiomas pegados abajo").toBeLessThanOrEqual(40)
        expect(r.pildora, "con el menú abierto el botón se llama «Cerrar menú»").toBe((await import(`@/messages/${idioma}.json`)).default.nav.close_menu)
        // La misma barra en tinta sobre crema, con un solo botón relleno («Reservar», en tinta).
        const [br, bgc, bb] = (r.barraAbierta.fondo.match(/\d+(\.\d+)?/g) || []).map(Number)
        expect(br + bgc + bb, "barra crema con el menú abierto").toBeGreaterThan(600)
        expect(r.barraAbierta.rellenos).toBe(1)
        expect(r.barraAbierta.reservarFondo).toBe(r.barraAbierta.menuColor) // el relleno es de la misma tinta que el icono
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
      for (const e of [r, ...r.querySelectorAll<HTMLElement>("*")]) {
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

/* ── «Silenciosa» (31c): rótulo discreto y logo del hero ─────────────────────── */

describe("rótulo «Imagen ilustrativa» discreto por debajo de 1.280 px", () => {
  for (const ruta of ["/", "/propietarios"]) {
    for (const ancho of [360, 390, 820, 1024]) {
      it(`${ruta} ${ancho}px: fondo tinta al 70 %, texto al 90 %, mono de 8,5 px, relleno 3 × 7 px, radio 3 px, y contraste ≥ 4,5:1`, async (ctx) => {
        if (!navegador) return ctx.skip()
        await conPagina(ancho, alto(ancho), ruta, async (p) => {
          const r = await p.evaluate(() => {
            const e = [...document.querySelectorAll<HTMLElement>("[data-rotulo-ilustrativo]")].find((x) => x.getBoundingClientRect().width > 0 && x.closest("#hero, header"))
            if (!e) return null
            const c = getComputedStyle(e)
            return { fondo: c.backgroundColor, color: c.color, letra: c.fontSize, relleno: `${c.paddingTop} ${c.paddingRight}`, radio: c.borderTopLeftRadius, fuente: c.fontFamily }
          })
          expect(r, "hay un rótulo en el hero").not.toBeNull()
          if (!r) return
          expect(r.fondo).toMatch(/^rgba\(20, 16, 14, 0\.7\)$/)
          expect(r.color).toMatch(/0\.9\)$/)
          expect([r.letra, r.relleno, r.radio]).toEqual(["8.5px", "3px 7px", "3px"])
          expect(r.fuente).toMatch(/mono/i)
          const k = await p.evaluate(medirContraste, ["[data-rotulo-ilustrativo]"])
          expect(k.n).toBeGreaterThan(0)
          expect(k.peor, "contraste del rótulo, sobre foto blanca").toBeGreaterThanOrEqual(4.5)
        })
      })
    }
  }
  it("1.280 px: en escritorio el rótulo no cambia (fondo crema, 10 px)", async (ctx) => {
    if (!navegador) return ctx.skip()
    await conPagina(1280, 900, "/", async (p) => {
      const r = await p.evaluate(() => {
        const e = document.querySelector<HTMLElement>("#hero [data-rotulo-ilustrativo]")!
        const c = getComputedStyle(e)
        return { letra: c.fontSize, relleno: `${c.paddingTop} ${c.paddingRight}`, radio: c.borderTopLeftRadius }
      })
      expect(r).toEqual({ letra: "10px", relleno: "4px 10px", radio: "0px" })
    })
  })
})

describe("hero: logo grande más pequeño en móvil", () => {
  for (const [ancho, esperado] of [
    [360, 150],
    [390, 150],
    [820, 260],
    [1280, 260],
  ] as const) {
    it(`${ancho}px: el logo «SEDA Private Homes» del hero mide ${esperado} px de ancho`, async (ctx) => {
      if (!navegador) return ctx.skip()
      await conPagina(ancho, alto(ancho), "/", async (p) => {
        const w = await p.evaluate(() => Math.round(document.querySelector<HTMLElement>("#hero img[src*='wordmark']")!.getBoundingClientRect().width))
        expect(w).toBe(esperado)
      })
    })
  }
})

/* ── Animaciones de la barra (31d) ─────────────────────────────────────────── */

const NUESTRAS = ["flecha-vaiven", "brillo-dos-pasadas", "brillo-una-pasada"]

/** Animaciones CSS de la barra que corren ahora, con su duración total (retraso + duración × repeticiones). */
function animacionesDeLaBarra(nombres: string[]) {
  return document
    .getAnimations()
    .filter((a) => a instanceof CSSAnimation && nombres.includes(a.animationName))
    .map((a) => {
      const t = a.effect!.getComputedTiming()
      return { nombre: (a as CSSAnimation).animationName, total: Number(t.endTime), iteraciones: t.iterations, estado: a.playState }
    })
}

async function conMovimiento(ancho: number, reducido: boolean, url: string, f: (p: P) => Promise<void>) {
  const p = await navegador!.newPage({ viewport: { width: ancho, height: alto(ancho) }, reducedMotion: reducido ? "reduce" : "no-preference" })
  try {
    await p.goto(servidor.base + url, { waitUntil: "networkidle" })
    await f(p)
  } finally {
    await p.close()
  }
}

describe("animaciones de la barra: con movimiento", () => {
  for (const ancho of [390, 820]) {
    it(`${ancho}px: al cargar corren el vaivén de la flecha y las dos pasadas del brillo, y ninguna dura más de 5 s`, async (ctx) => {
      if (!navegador) return ctx.skip()
      const p = await navegador.newPage({ viewport: { width: ancho, height: alto(ancho) }, reducedMotion: "no-preference" })
      try {
        // Sin esperar a networkidle: las animaciones de carga duran pocos segundos.
        await p.goto(servidor.base + "/", { waitUntil: "networkidle" }).catch(() => undefined)
        await p.evaluate(() => {
          // Reinicia las animaciones de carga para medirlas desde el principio (la página ya pasó su networkidle).
          document.querySelectorAll<HTMLElement>("[data-carga]").forEach((e) => {
            e.setAttribute("data-carga", "no")
            void e.offsetWidth
            e.setAttribute("data-carga", "si")
          })
        })
        const anims = await p.evaluate(animacionesDeLaBarra, NUESTRAS)
        const nombres = new Set(anims.map((a) => a.nombre))
        expect(nombres.has("flecha-vaiven"), "vaivén de la flecha").toBe(true)
        expect(nombres.has("brillo-dos-pasadas"), "brillo de Reservar").toBe(true)
        for (const a of anims) expect(a.total, `${a.nombre} dura ${a.total} ms`).toBeLessThanOrEqual(5000)
        expect(anims.find((a) => a.nombre === "flecha-vaiven")!.iteraciones).toBe(3)
        // Y se paran solas: pasados 5,5 s no queda ninguna automática.
        await p.waitForTimeout(5500)
        expect(await p.evaluate(animacionesDeLaBarra, NUESTRAS)).toEqual([])
      } finally {
        await p.close()
      }
    }, 20_000)
  }

  it("390px: al pasar el ratón por Portal vuelve el vaivén, y por Reservar, una pasada del brillo", async (ctx) => {
    if (!navegador) return ctx.skip()
    await conMovimiento(390, false, "/", async (p) => {
      await p.waitForTimeout(5500)
      expect(await p.evaluate(animacionesDeLaBarra, NUESTRAS)).toEqual([])
      await p.hover("[data-portal-movil] > button")
      await p.waitForTimeout(200)
      expect((await p.evaluate(animacionesDeLaBarra, NUESTRAS)).map((a) => a.nombre)).toContain("flecha-vaiven")
      await p.hover("[data-barra-reservar]")
      await p.waitForTimeout(200)
      const a = await p.evaluate(animacionesDeLaBarra, NUESTRAS)
      expect(a.map((x) => x.nombre)).toContain("brillo-una-pasada")
      for (const x of a) expect(x.total).toBeLessThanOrEqual(5000)
    })
  }, 20_000)
})

describe("animaciones de la barra: prefers-reduced-motion: reduce", () => {
  for (const [idioma, ruta] of Object.entries(IDIOMAS)) {
    for (const ancho of [360, 820]) {
      it(`${idioma} ${ancho}px: no hay ninguna animación automática ni transición en la flecha y la X`, async (ctx) => {
        if (!navegador) return ctx.skip()
        await conMovimiento(ancho, true, ruta, async (p) => {
          expect(await p.evaluate(animacionesDeLaBarra, NUESTRAS), "ninguna animación corre").toEqual([])
          const r = await p.evaluate(() => {
            const nav = document.querySelector("header nav")!
            const vis = (s: string) => [...nav.querySelectorAll<HTMLElement>(s)].find((e) => e.getBoundingClientRect().width > 0)
            const flecha = vis("[data-flecha-portal]")
            const linea = vis(".menu-linea-1") ?? nav.querySelector<SVGElement>(".menu-linea-1")
            const brillo = vis("[data-barra-reservar]")
            return {
              flechaTransicion: flecha ? getComputedStyle(flecha).transitionDuration : "",
              lineaTransicion: linea ? getComputedStyle(linea).transitionDuration : "",
              brilloAnimacion: brillo ? getComputedStyle(brillo, "::after").animationName : "",
              vaiven: (() => {
                const e = vis("[data-flecha-portal-vaiven]")
                return e ? getComputedStyle(e).animationName : ""
              })(),
            }
          })
          expect(r.flechaTransicion).toMatch(/^0s$/)
          expect(r.lineaTransicion).toMatch(/^0s$/)
          expect(r.brilloAnimacion).toBe("none")
          expect(r.vaiven).toBe("none")
          // El estado cambia igual, sin transición.
          await p.click("[data-boton-menu]:visible")
          await p.waitForTimeout(100)
          const lineas = await p.evaluate(() => getComputedStyle(document.querySelector(".menu-linea-1")!).transform)
          expect(lineas, "la X se forma al instante").not.toBe("none")
        })
      })
    }
  }
})

describe("el botón del menú y la flecha de Portal", () => {
  for (const [idioma, ruta] of Object.entries(IDIOMAS)) {
    it(`${idioma} 390px: el botón del menú cambia aria-expanded y aria-label, y las líneas forman una X (±45°); al cerrar vuelven`, async (ctx) => {
      if (!navegador) return ctx.skip()
      const m = (await import(`@/messages/${idioma}.json`)).default.nav
      await conMovimiento(390, false, ruta, async (p) => {
        const leer = () =>
          p.evaluate(() => {
            const b = [...document.querySelectorAll<HTMLElement>("[data-boton-menu]")].find((x) => x.getBoundingClientRect().width > 0)!
            const ang = (sel: string) => {
              const mt = new DOMMatrix(getComputedStyle(b.querySelector(sel)!).transform)
              return Math.round((Math.atan2(mt.b, mt.a) * 180) / Math.PI)
            }
            return { expanded: b.getAttribute("aria-expanded"), label: b.getAttribute("aria-label"), l1: ang(".menu-linea-1"), l2: ang(".menu-linea-2"), n: document.querySelectorAll("[data-boton-menu]").length }
          })
        const a = await leer()
        expect([a.expanded, a.label, a.l1, a.l2, a.n]).toEqual(["false", m.open_menu, 0, 0, 1])
        await p.click("[data-boton-menu]:visible")
        await p.waitForTimeout(450)
        const b = await leer()
        expect([b.expanded, b.label, b.l1, b.l2, b.n], "abierto: es el mismo botón, ya en X").toEqual(["true", m.close_menu, 45, -45, 1])
        await p.click("[data-boton-menu]:visible")
        await p.waitForTimeout(450)
        const c = await leer()
        expect([c.expanded, c.label, c.l1, c.l2]).toEqual(["false", m.open_menu, 0, 0])
      })
    })
  }

  it("390px: al pasar el ratón por el menú cerrado las líneas se separan un poco (±1,5 px)", async (ctx) => {
    if (!navegador) return ctx.skip()
    await conMovimiento(390, false, "/", async (p) => {
      await p.hover("[data-boton-menu]")
      await p.waitForTimeout(400)
      const d = await p.evaluate(() => [new DOMMatrix(getComputedStyle(document.querySelector(".menu-linea-1")!).transform).f, new DOMMatrix(getComputedStyle(document.querySelector(".menu-linea-2")!).transform).f])
      expect(d).toEqual([-1.5, 1.5])
    })
  })

  for (const [ancho, selector] of [
    [390, "[data-portal-movil] > button"],
    [820, "[data-tablet-portal] > button"],
  ] as const) {
    it(`${ancho}px: la flecha de Portal gira 180° con el panel abierto y vuelve al cerrarlo (10 px, trazo 2)`, async (ctx) => {
      if (!navegador) return ctx.skip()
      await conMovimiento(ancho, false, "/", async (p) => {
        const leer = () =>
          p.evaluate((sel) => {
            const f = [...document.querySelectorAll<SVGElement>(`${sel} [data-flecha-portal]`)].find((e) => e.getBoundingClientRect().width > 0)!
            const mt = new DOMMatrix(getComputedStyle(f).transform)
            return { giro: Math.round((Math.atan2(mt.b, mt.a) * 180) / Math.PI), ancho: Math.round(f.getBoundingClientRect().width), trazo: f.getAttribute("stroke-width"), expanded: f.closest("button")!.getAttribute("aria-expanded") }
          }, selector)
        const a = await leer()
        expect([a.giro, a.ancho, a.trazo, a.expanded]).toEqual([0, 10, "2", "false"])
        await p.click(selector)
        await p.waitForTimeout(450)
        const b = await leer()
        expect(Math.abs(b.giro), "girada 180°").toBe(180)
        expect(b.expanded).toBe("true")
        await p.keyboard.press("Escape")
        await p.waitForTimeout(450)
        expect((await leer()).giro).toBe(0)
      })
    })
  }
})

describe("las animaciones no mueven el diseño", () => {
  for (const ancho of [360, 390, 820]) {
    it(`${ancho}px: ningún desplazamiento de diseño en la cabecera durante la carga, y los botones no se mueven mientras animan`, async (ctx) => {
      if (!navegador) return ctx.skip()
      const p = await navegador.newPage({ viewport: { width: ancho, height: alto(ancho) }, reducedMotion: "no-preference" })
      try {
        await p.goto(servidor.base + "/", { waitUntil: "networkidle" })
        const r = await p.evaluate(async () => {
          const botones = () => [...document.querySelectorAll<HTMLElement>("header nav a, header nav button")].filter((e) => e.getBoundingClientRect().width > 0 && !e.closest("[role=menu]")).map((e) => e.getBoundingClientRect()).map((b) => [b.left, b.top, b.width, b.height].map((n) => Math.round(n * 100) / 100))
          let cls = 0
          const po = new PerformanceObserver((l) => {
            for (const en of l.getEntries() as unknown as { value: number; hadRecentInput: boolean; sources?: { node?: Node }[] }[]) {
              if (!en.hadRecentInput && (en.sources ?? []).some((s) => s.node && document.querySelector("header")?.contains(s.node))) cls += en.value
            }
          })
          po.observe({ type: "layout-shift", buffered: true })
          // Reinicia las animaciones de carga y compara las cajas de los botones a lo largo de ellas.
          document.querySelectorAll<HTMLElement>("[data-carga]").forEach((e) => {
            e.setAttribute("data-carga", "no")
            void e.offsetWidth
            e.setAttribute("data-carga", "si")
          })
          const antes = botones()
          const muestras: number[][][] = []
          for (let i = 0; i < 8; i++) {
            await new Promise((res) => setTimeout(res, 500))
            muestras.push(botones())
          }
          await new Promise((res) => setTimeout(res, 100))
          po.disconnect()
          return { cls, antes, muestras }
        })
        expect(r.cls, "desplazamiento de diseño en la cabecera").toBe(0)
        for (const m of r.muestras) expect(m, "cajas de los botones de la barra").toEqual(r.antes)
      } finally {
        await p.close()
      }
    }, 30_000)
  }
})

describe("contraste de «Reservar» durante el brillo", () => {
  for (const [idioma, ruta] of Object.entries(IDIOMAS)) {
    it(`${idioma} 390px: el texto de Reservar ≥ 4,5:1 en reposo y con el brillo en su punto más claro, en la barra sobre la foto y en la barra clara`, async (ctx) => {
      if (!navegador) return ctx.skip()
      await conMovimiento(390, true, ruta, async (p) => {
        const medir = () =>
          p.evaluate(() => {
            const e = [...document.querySelectorAll<HTMLElement>("[data-barra-reservar]")].find((x) => x.getBoundingClientRect().width > 0)!
            const n = (c: string) => (c.match(/-?\d*\.?\d+/g) || []).map(Number)
            const lin = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
            const L = (c: number[]) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2])
            const k = (a: number[], b: number[]) => {
              const [h, l] = [L(a), L(b)].sort((x, y) => y - x)
              return (h + 0.05) / (l + 0.05)
            }
            const bg = n(getComputedStyle(e).backgroundColor).slice(0, 3)
            const tx = n(getComputedStyle(e).color).slice(0, 3)
            const alfa = Number(getComputedStyle(e).getPropertyValue("--brillo-alfa"))
            // El brillo es blanco con esa opacidad por encima del texto y del fondo (peor caso: el centro del degradado).
            const mezcla = (c: number[]) => c.map((v) => v * (1 - alfa) + 255 * alfa)
            return { reposo: k(tx, bg), brillo: k(mezcla(tx), mezcla(bg)), alfa }
          })
        const foto = await medir()
        expect(foto.alfa).toBeGreaterThan(0)
        expect(foto.reposo).toBeGreaterThanOrEqual(4.5)
        expect(foto.brillo, "con el brillo, sobre la foto").toBeGreaterThanOrEqual(4.5)
        await p.evaluate(() => window.scrollTo(0, 900))
        await p.waitForTimeout(900)
        await p.evaluate(() => window.scrollTo(0, 860))
        await p.waitForTimeout(900)
        const clara = await medir()
        expect(clara.reposo).toBeGreaterThanOrEqual(4.5)
        expect(clara.brillo, "con el brillo, en la barra clara").toBeGreaterThanOrEqual(4.5)
      })
    })
  }
})

describe("animaciones: el escritorio no cambia", () => {
  it("1.280 px: ninguna animación ni elemento nuevo de la barra de móvil", async (ctx) => {
    if (!navegador) return ctx.skip()
    await conMovimiento(1280, false, "/", async (p) => {
      const r = await p.evaluate((nombres) => ({
        animaciones: document.getAnimations().filter((a) => a instanceof CSSAnimation && nombres.includes(a.animationName)).length,
        visibles: [...document.querySelectorAll<HTMLElement>(".reservar-brillo, .boton-portal, .boton-menu, [data-flecha-portal]")].filter((e) => e.getBoundingClientRect().width > 0).length,
      }), NUESTRAS)
      expect(r).toEqual({ animaciones: 0, visibles: 0 })
    })
  })
})
