import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { arrancarNext, type ServidorNext } from "./next-start"
import { cargarPlaywright, type Navegador } from "./playwright-util"

/*
  Dock móvil y de tablet (MOVIL-DOCK, propuesta C). Chromium real, a 360, 390 y 820 px en es/en/fr/de, y a
  1.280 px para comprobar que en escritorio no hay dock. Se salta si no hay Playwright/Chromium.
*/

const IDIOMAS: Record<string, string> = { es: "/", en: "/en", fr: "/fr", de: "/de" }
const ANCHOS = [360, 390, 820]

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

const alto = (ancho: number) => (ancho < 500 ? 800 : 1100)

function medirDock() {
  const dock = document.querySelector<HTMLElement>("[data-dock]")
  if (!dock) return { hay: false as const }
  const visible = dock.offsetParent !== null || getComputedStyle(dock).position === "fixed"
  const r = dock.getBoundingClientRect()
  const visibleReal = getComputedStyle(dock).display !== "none" && r.width > 0
  const problemas: string[] = []
  if (r.left < -0.5 || r.right > innerWidth + 0.5) problemas.push(`el dock se sale de la ventana (${Math.round(r.left)}–${Math.round(r.right)} de ${innerWidth})`)
  if (document.documentElement.scrollWidth > innerWidth) problemas.push("scroll horizontal")
  const items = [...dock.querySelectorAll<HTMLElement>("[data-dock-item], [data-dock-llamada]")].filter((e) => e.getBoundingClientRect().width > 0)
  for (const it of items) {
    const ri = it.getBoundingClientRect()
    const nombre = (it.textContent || "").trim()
    if (ri.left < r.left - 0.5 || ri.right > r.right + 0.5) problemas.push(`«${nombre}» se sale del dock`)
    for (const hijo of it.querySelectorAll<HTMLElement>("span")) {
      if (hijo.scrollWidth > hijo.clientWidth + 0.5) problemas.push(`la etiqueta «${hijo.textContent}» está cortada (${hijo.scrollWidth} > ${hijo.clientWidth})`)
      const rh = hijo.getBoundingClientRect()
      if (rh.width > 0 && (rh.left < ri.left - 0.5 || rh.right > ri.right + 0.5)) problemas.push(`la etiqueta «${hijo.textContent}» desborda su botón (${Math.round(rh.left)}–${Math.round(rh.right)} frente a ${Math.round(ri.left)}–${Math.round(ri.right)})`)
      if (getComputedStyle(hijo).textOverflow === "ellipsis") problemas.push(`puntos suspensivos en «${hijo.textContent}»`)
    }
  }
  for (let i = 0; i < items.length; i++)
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i].getBoundingClientRect()
      const b = items[j].getBoundingClientRect()
      if (a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5) problemas.push(`«${(items[i].textContent || "").trim()}» y «${(items[j].textContent || "").trim()}» se solapan`)
    }
  const etiquetas = items.map((e) => (e.textContent || "").trim())
  return {
    hay: true as const,
    visible: visible && visibleReal,
    problemas,
    etiquetas,
    alto: Math.round(r.height),
    // 14 px del borde de abajo; con el aviso de cookies a la vista, el dock va encima de él (--banner-cookies-h).
    abajo: Math.round(innerHeight - r.bottom - (parseFloat(document.documentElement.style.getPropertyValue("--banner-cookies-h")) || 0)),
    lados: [Math.round(r.left), Math.round(innerWidth - r.right)],
    tamanoEtiqueta: items[0] ? getComputedStyle(items[0].querySelector("span")!).fontSize : "",
  }
}

describe("dock móvil: visible por debajo de 1.280 px, sin etiquetas cortadas ni desbordes", () => {
  for (const [idioma, ruta] of Object.entries(IDIOMAS)) {
    for (const ancho of ANCHOS) {
      it(`${idioma} ${ancho}px: el dock se ve, mide 66 px, a 14 px del borde, y ninguna etiqueta se corta`, async (ctx) => {
        if (!navegador) return ctx.skip()
        const p = await navegador.newPage({ viewport: { width: ancho, height: alto(ancho) } })
        try {
          await p.goto(servidor.base + ruta, { waitUntil: "networkidle" })
          const r = await p.evaluate(medirDock)
          expect(r.hay).toBe(true)
          if (!r.hay) return
          expect(r.visible).toBe(true)
          expect(r.problemas, `${idioma} ${ancho}px`).toEqual([])
          expect(r.alto).toBe(66)
          expect(r.abajo).toBe(14)
          expect(r.etiquetas.length).toBe(ancho >= 768 ? 6 : 4) // móvil: 4; tablet: 5 elementos + la llamada
          // A 12 px de los lados; con el botón del asistente en la página, el dock deja 64 + 8 px a la derecha.
          const conAsistente = await p.evaluate(() => !!document.querySelector("[data-asistente-boton]"))
          if (ancho < 768) expect(r.lados).toEqual([12, conAsistente ? 84 : 12])
        } finally {
          await p.close()
        }
      })
    }
    it(`${idioma} 1.280px: en escritorio no hay dock`, async (ctx) => {
      if (!navegador) return ctx.skip()
      const p = await navegador.newPage({ viewport: { width: 1280, height: 900 } })
      try {
        await p.goto(servidor.base + ruta, { waitUntil: "networkidle" })
        const r = await p.evaluate(medirDock)
        expect(r.hay && r.visible, "el dock no se ve a 1.280 px").toBe(false)
        const body = await p.evaluate(() => getComputedStyle(document.body).paddingBottom)
        expect(body, "sin hueco del dock en escritorio").toBe("0px")
      } finally {
        await p.close()
      }
    })
  }
})

/** Abre una hoja desde el dock y devuelve lo que se ve. */
async function abrir(p: Awaited<ReturnType<Navegador["newPage"]>>, clave: "portal" | "menu") {
  await p.click(`[data-dock-item="${clave}"]`)
  await p.waitForTimeout(450)
}

function estadoHoja(clave: string) {
  const h = document.querySelector<HTMLElement>(`[data-dock-hoja="${clave}"]`)
  const boton = document.querySelector<HTMLElement>(`[data-dock-item="${clave}"]`)!
  const dock = document.querySelector<HTMLElement>("[data-dock]")!.getBoundingClientRect()
  if (!h) return { abierta: false as const, expanded: boton.getAttribute("aria-expanded"), foco: document.activeElement === boton, etiqueta: (boton.textContent || "").trim() }
  const r = h.getBoundingClientRect()
  const titulo = document.getElementById(h.getAttribute("aria-labelledby") || "")
  const dentro = !!document.activeElement && h.contains(document.activeElement)
  // El dock sigue a la vista: el centro del dock no está tapado por la hoja ni por el fondo oscurecido.
  const el = document.elementFromPoint(dock.left + 20, dock.top + dock.height / 2)
  return {
    abierta: true as const,
    role: h.getAttribute("role"),
    modal: h.getAttribute("aria-modal"),
    titulo: titulo?.textContent?.trim() ?? null,
    foco: dentro || document.activeElement === h,
    expanded: boton.getAttribute("aria-expanded"),
    controls: boton.getAttribute("aria-controls") === h.id,
    etiqueta: (boton.textContent || "").trim(),
    bottom: Math.round(r.bottom),
    dockTop: Math.round(dock.top),
    left: Math.round(r.left),
    right: Math.round(r.right),
    top: Math.round(r.top),
    dockVisible: !!el && !!el.closest("[data-dock]"),
    bodyOverflow: getComputedStyle(document.body).overflow,
    ancho: Math.round(r.width),
    scrim: !!document.querySelector("[data-dock-scrim]"),
  }
}

describe("dock móvil: las hojas de Portal y de Menú abren y cierran, y el foco vuelve al dock", () => {
  for (const [idioma, ruta] of Object.entries(IDIOMAS)) {
    for (const ancho of ANCHOS) {
      for (const clave of ["portal", "menu"] as const) {
        it(`${idioma} ${ancho}px · ${clave}: abre como diálogo; se cierra con Escape, con el fondo y con su botón; el foco vuelve al botón`, async (ctx) => {
          if (!navegador) return ctx.skip()
          const p = await navegador.newPage({ viewport: { width: ancho, height: alto(ancho) } })
          try {
            await p.goto(servidor.base + ruta, { waitUntil: "networkidle" })
            await abrir(p, clave)
            const a = await p.evaluate(estadoHoja, clave)
            expect(a.abierta).toBe(true)
            if (!a.abierta) return
            expect(a.role).toBe("dialog")
            expect(a.modal).toBe("true")
            expect(a.titulo, "el diálogo tiene título").toBeTruthy()
            expect(a.foco, "el foco entra en la hoja").toBe(true)
            expect(a.expanded).toBe("true")
            expect(a.controls, "aria-controls apunta a la hoja").toBe(true)
            expect(a.etiqueta, "el botón de la hoja abierta dice «Cerrar»").toMatch(/Cerrar|Close|Fermer|Schlie/)
            expect(a.bodyOverflow, "la página de detrás no hace scroll").toBe("hidden")
            expect(a.scrim).toBe(true)
            expect(a.dockVisible, "el dock sigue a la vista").toBe(true)
            expect(a.left, "la hoja no se sale por la izquierda").toBeGreaterThanOrEqual(0)
            expect(a.right, "la hoja no se sale por la derecha").toBeLessThanOrEqual(ancho)
            expect(a.top, "la hoja no se sale por arriba").toBeGreaterThanOrEqual(0)
            // La hoja acaba 10 px por encima del dock.
            expect(a.dockTop - a.bottom).toBe(10)

            // Escape
            await p.keyboard.press("Escape")
            await p.waitForTimeout(250)
            let c = await p.evaluate(estadoHoja, clave)
            expect(c.abierta, "Escape cierra").toBe(false)
            expect(c.foco, "el foco vuelve al botón del dock").toBe(true)
            expect(c.expanded).toBe("false")

            // Fondo oscurecido
            await abrir(p, clave)
            await p.mouse.click(4, 120) // fuera de la hoja (queda a 12 px de los lados), bajo la barra de arriba y sobre el aviso de cookies
            await p.waitForTimeout(250)
            c = await p.evaluate(estadoHoja, clave)
            expect(c.abierta, "tocar el fondo cierra").toBe(false)
            expect(c.foco, "el foco vuelve al botón del dock tras tocar el fondo").toBe(true)

            // Su propio botón
            await abrir(p, clave)
            await p.click(`[data-dock-item="${clave}"]`)
            await p.waitForTimeout(250)
            c = await p.evaluate(estadoHoja, clave)
            expect(c.abierta, "el botón cierra").toBe(false)
            expect(c.foco, "el foco sigue en el botón").toBe(true)
          } finally {
            await p.close()
          }
        })
      }
    }
  }
})

describe("dock móvil: contenido de las hojas", () => {
  for (const [idioma, ruta] of Object.entries(IDIOMAS)) {
    for (const ancho of ANCHOS) {
      it(`${idioma} ${ancho}px: Portal con sus dos tarjetas dentro y destinos de siempre; Menú con todos sus enlaces`, async (ctx) => {
        if (!navegador) return ctx.skip()
        const p = await navegador.newPage({ viewport: { width: ancho, height: alto(ancho) } })
        try {
          await p.goto(servidor.base + ruta, { waitUntil: "networkidle" })
          await abrir(p, "portal")
          const portal = await p.evaluate(() => {
            const h = document.querySelector<HTMLElement>('[data-dock-hoja="portal"]')!
            const rh = h.getBoundingClientRect()
            const tarjetas = [...h.querySelectorAll<HTMLAnchorElement>("[data-dock-portal-tarjeta]")]
            const fuera = tarjetas.filter((t) => {
              const r = t.getBoundingClientRect()
              return r.left < rh.left - 0.5 || r.right > rh.right + 0.5 || t.scrollWidth > t.clientWidth + 0.5
            })
            const textoFuera: string[] = []
            for (const t of tarjetas) {
              const rt = t.getBoundingClientRect()
              for (const e of t.querySelectorAll<HTMLElement>("*")) {
                const r = e.getBoundingClientRect()
                if (r.width > 0 && (r.left < rt.left - 1 || r.right > rt.right + 1)) textoFuera.push((e.textContent || "").trim().slice(0, 20))
              }
            }
            return {
              hrefs: tarjetas.map((t) => t.getAttribute("href")),
              fuera: fuera.length,
              textoFuera,
              enlacesFinales: [...h.querySelectorAll("a")].filter((a) => !a.hasAttribute("data-dock-portal-tarjeta")).map((a) => a.getAttribute("href")?.replace(/^\/(en|fr|de)(?=\/)/, "")),
              titulo: h.querySelector("h2")?.textContent,
              scrollW: document.documentElement.scrollWidth,
            }
          })
          expect(portal.hrefs).toEqual(["https://guests.sedaprivatehomes.com/acceso", "https://portal.sedaprivatehomes.com/"])
          expect(portal.fuera, "tarjetas fuera del panel").toBe(0)
          expect(portal.textoFuera).toEqual([])
          expect(portal.enlacesFinales).toEqual(["/contacto?type=guest", "/contacto?type=owner"])
          expect(portal.scrollW).toBeLessThanOrEqual(ancho)

          await p.keyboard.press("Escape")
          await p.waitForTimeout(250)
          await abrir(p, "menu")
          const menu = await p.evaluate(() => {
            const h = document.querySelector<HTMLElement>('[data-dock-hoja="menu"]')!
            const rh = h.getBoundingClientRect()
            const enlaces = [...h.querySelectorAll<HTMLAnchorElement>("a")].map((a) => a.getAttribute("href")?.replace(/^\/(en|fr|de)(?=\/)/, "") ?? "")
            const grupos = h.querySelectorAll("[data-dock-menu-grupo]").length
            const botones = [...h.querySelectorAll("button")].length
            return { enlaces, grupos, botones, alto: Math.round(rh.height), altoVentana: innerHeight, scrollable: h.scrollHeight >= h.clientHeight, ancho: Math.round(rh.width) }
          })
          expect(menu.grupos).toBe(3)
          for (const href of ["/coleccion", "/experiencias", "/guestapp", "/propietarios", "/ecosistema", "https://portal.sedaprivatehomes.com/", "/nosotros", "/descubre", "/faq", "/contacto", "/contacto?type=owner", "/contacto?type=guest"]) {
            expect(menu.enlaces, href).toContain(href)
          }
          expect(menu.botones, "idiomas: ES/EN/FR/DE").toBeGreaterThanOrEqual(5)
          expect(menu.alto, "hasta el 85 % del alto").toBeLessThanOrEqual(Math.round(menu.altoVentana * 0.85) + 1)
          if (ancho >= 768) expect(menu.ancho, "en tablet, tarjeta ancha de tres columnas").toBeGreaterThan(640)
        } finally {
          await p.close()
        }
      })
    }
  }
})

describe("dock móvil: la página deja su hueco y nada se solapa", () => {
  for (const [idioma, ruta] of Object.entries(IDIOMAS)) {
    for (const ancho of ANCHOS) {
      it(`${idioma} ${ancho}px: el último enlace del pie queda por encima del dock; si hay botón del asistente, no se solapa con el dock`, async (ctx) => {
        if (!navegador) return ctx.skip()
        const p = await navegador.newPage({ viewport: { width: ancho, height: alto(ancho) } })
        try {
          await p.goto(servidor.base + ruta, { waitUntil: "networkidle" })
          // Con el aviso de cookies a la vista (build con el píxel) se elige «Rechazar» para ver el pie entero.
          await p.evaluate(() => (document.querySelectorAll<HTMLElement>("section[role=region] button")[1] as HTMLElement | undefined)?.click())
          await p.waitForTimeout(300)
          await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
          await p.waitForTimeout(700)
          const r = await p.evaluate(() => {
            const dock = document.querySelector<HTMLElement>("[data-dock]")!.getBoundingClientRect()
            const enlaces = [...document.querySelectorAll<HTMLAnchorElement>("footer a")].filter((a) => a.getBoundingClientRect().width > 0)
            const ultimo = enlaces.reduce((m, a) => (a.getBoundingClientRect().bottom > m.getBoundingClientRect().bottom ? a : m))
            const u = ultimo.getBoundingClientRect()
            const el = document.elementFromPoint(u.left + u.width / 2, u.top + u.height / 2)
            const asis = document.querySelector<HTMLElement>("[data-asistente-boton]")
            let asistente: null | { solapa: boolean; hueco: number; mismaAltura: boolean; ancho: number; alto: number } = null
            if (asis) {
              const a = asis.getBoundingClientRect()
              asistente = {
                solapa: a.left < dock.right && dock.left < a.right && a.top < dock.bottom && dock.top < a.bottom,
                hueco: Math.round(a.left - dock.right),
                mismaAltura: Math.abs(a.bottom - dock.bottom) <= 1,
                ancho: Math.round(a.width),
                alto: Math.round(a.height),
              }
            }
            return { bajoUltimo: Math.round(u.bottom), dockTop: Math.round(dock.top), tapado: !(el && (ultimo === el || ultimo.contains(el))), asistente }
          })
          expect(r.bajoUltimo, "el último enlace del pie acaba por encima del dock").toBeLessThanOrEqual(r.dockTop)
          expect(r.tapado, "el último enlace del pie se puede tocar").toBe(false)
          if (r.asistente) {
            expect(r.asistente.solapa, "el botón del asistente no se solapa con el dock").toBe(false)
            expect(r.asistente.mismaAltura).toBe(true)
            if (ancho < 768) {
              expect(r.asistente.hueco).toBe(8)
              expect([r.asistente.ancho, r.asistente.alto]).toEqual([64, 66])
            }
          }
        } finally {
          await p.close()
        }
      })
    }
  }
})

/* ── Contraste (peor caso: foto blanca bajo el dock), medido en el navegador con los colores reales ── */
function medirContrasteDock() {
  const num = (c: string) => (c.match(/-?\d*\.?\d+/g) || []).map(Number)
  const rgba = (c: string): [number, number, number, number] => {
    const n = num(c)
    const f = c.startsWith("color(") ? 255 : 1
    return [n[0] * f, n[1] * f, n[2] * f, n.length > 3 ? n[3] : 1]
  }
  const sobre = (c: [number, number, number, number], fondo: number[]) => [0, 1, 2].map((i) => c[i] * c[3] + fondo[i] * (1 - c[3]))
  const lin = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
  const lum = (c: number[]) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2])
  const ratio = (a: number[], b: number[]) => {
    const [h, l] = [lum(a), lum(b)].sort((x, y) => y - x)
    return (h + 0.05) / (l + 0.05)
  }
  const blanco = [255, 255, 255]
  const dock = document.querySelector<HTMLElement>("[data-dock]")!
  const fondoDock = sobre(rgba(getComputedStyle(dock).backgroundColor), blanco)
  let peor = Infinity
  let cual = ""
  const visto: string[] = []
  for (const el of dock.querySelectorAll<HTMLElement>("[data-dock-item], [data-dock-llamada]")) {
    if (el.getBoundingClientRect().width === 0) continue
    const cs = getComputedStyle(el)
    const fondo = sobre(rgba(cs.backgroundColor), fondoDock)
    const texto = sobre(rgba(cs.color), fondo)
    const k = ratio(texto, fondo)
    visto.push(`${(el.textContent || "").trim()}:${k.toFixed(2)}`)
    if (k < peor) {
      peor = k
      cual = (el.textContent || "").trim()
    }
  }
  return { peor, cual, visto, velo: rgba(getComputedStyle(dock).backgroundColor)[3] }
}

function medirContrasteHoja(clave: string) {
  const num = (c: string) => (c.match(/-?\d*\.?\d+/g) || []).map(Number)
  const rgba = (c: string): [number, number, number, number] => {
    const n = num(c)
    const f = c.startsWith("color(") ? 255 : 1
    return [n[0] * f, n[1] * f, n[2] * f, n.length > 3 ? n[3] : 1]
  }
  const sobre = (c: [number, number, number, number], fondo: number[]) => [0, 1, 2].map((i) => c[i] * c[3] + fondo[i] * (1 - c[3]))
  const lin = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
  const lum = (c: number[]) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2])
  const ratio = (a: number[], b: number[]) => {
    const [h, l] = [lum(a), lum(b)].sort((x, y) => y - x)
    return (h + 0.05) / (l + 0.05)
  }
  const h = document.querySelector<HTMLElement>(`[data-dock-hoja="${clave}"]`)!
  const fondo = rgba(getComputedStyle(h).backgroundColor).slice(0, 3)
  let peor = Infinity
  let cual = ""
  let n = 0
  for (const e of h.querySelectorAll<HTMLElement>("*")) {
    const propio = [...e.childNodes].some((c) => c.nodeType === 3 && (c.textContent || "").trim().length > 0)
    // Los separadores decorativos (aria-hidden, p. ej. la «/» entre idiomas) no son texto que se lea.
    if (!propio || e.getBoundingClientRect().width === 0 || e.closest("[aria-hidden=true]")) continue
    // El texto de una tarjeta o botón con relleno propio se mide contra ese relleno.
    let f = fondo
    for (let a: HTMLElement | null = e; a && a !== h; a = a.parentElement) {
      const c = rgba(getComputedStyle(a).backgroundColor)
      if (c[3] > 0) {
        f = sobre(c, fondo)
        break
      }
    }
    const k = ratio(sobre(rgba(getComputedStyle(e).color), f), f)
    n++
    if (k < peor) {
      peor = k
      cual = (e.textContent || "").trim().slice(0, 30)
    }
  }
  return { peor, cual, n }
}

describe("dock móvil: todo el texto ≥ 4,5:1 en el peor caso", () => {
  for (const [idioma, ruta] of Object.entries(IDIOMAS)) {
    for (const ancho of [390, 820]) {
      it(`${idioma} ${ancho}px: dock (con la página actual y con la hoja abierta) y hojas`, async (ctx) => {
        if (!navegador) return ctx.skip()
        const p = await navegador.newPage({ viewport: { width: ancho, height: alto(ancho) } })
        try {
          // Una página con elemento activo en el dock (Colección) y otra neutra.
          for (const r of [ruta === "/" ? "/coleccion" : `${ruta}/coleccion`, ruta]) {
            await p.goto(servidor.base + r, { waitUntil: "networkidle" })
            const d = await p.evaluate(medirContrasteDock)
            expect(d.velo, "velo del dock").toBeCloseTo(0.72, 2)
            expect(d.peor, `${r} dock, peor elemento «${d.cual}» (${d.visto.join(" ")})`).toBeGreaterThanOrEqual(4.5)
          }
          for (const clave of ["portal", "menu"] as const) {
            await abrir(p, clave)
            const d = await p.evaluate(medirContrasteDock) // con el botón de la hoja abierta (activo)
            expect(d.peor, `dock con «${clave}» abierta: «${d.cual}»`).toBeGreaterThanOrEqual(4.5)
            const h = await p.evaluate(medirContrasteHoja, clave)
            expect(h.n).toBeGreaterThan(3)
            expect(h.peor, `hoja ${clave}: «${h.cual}»`).toBeGreaterThanOrEqual(4.5)
            await p.keyboard.press("Escape")
            await p.waitForTimeout(250)
          }
        } finally {
          await p.close()
        }
      })
    }
  }
})

describe("dock móvil: el rótulo «Imagen ilustrativa» no queda bajo el dock", () => {
  const ALTOS: Record<number, number[]> = { 390: [800, 844], 820: [900, 1100, 1180] }
  for (const ruta of ["/", "/propietarios"]) {
    for (const [ancho, altos] of Object.entries(ALTOS)) {
      for (const altoVentana of altos) {
        it(`${ruta} a ${ancho}×${altoVentana}: el rótulo no se solapa con el dock (ni con el botón del asistente)`, async (ctx) => {
          if (!navegador) return ctx.skip()
          const p = await navegador.newPage({ viewport: { width: Number(ancho), height: altoVentana } })
          try {
            await p.goto(servidor.base + ruta, { waitUntil: "networkidle" })
            // El rótulo va en el borde de abajo de su bloque (el hero): se mira con ese borde pegado al de abajo de la
            // ventana, que es donde el dock lo taparía (en /propietarios el hero es más alto que la ventana).
            await p.evaluate(() => {
              const tag = [...document.querySelectorAll<HTMLElement>("span.pointer-events-none.absolute")].find((e) => /ilustrativa|illustrative|Symbolbild|illustr/i.test(e.textContent || ""))
              const bloque = tag?.closest<HTMLElement>("header, section")
              if (bloque) window.scrollTo(0, Math.max(0, bloque.getBoundingClientRect().bottom + window.scrollY - innerHeight))
            })
            await p.waitForTimeout(700)
            const r = await p.evaluate(() => {
              const cajas = [document.querySelector<HTMLElement>("[data-dock]"), document.querySelector<HTMLElement>("[data-asistente-boton]")]
                .filter((e): e is HTMLElement => !!e)
                .map((e) => e.getBoundingClientRect())
              // Los rótulos son <span> absolutos, sin eventos, con el texto de `img.illustrative` en cualquier idioma.
              const tags = [...document.querySelectorAll<HTMLElement>("span.pointer-events-none.absolute")].filter((e) => /ilustrativa|illustrative|illustr|Symbolbild|Illustration/i.test(e.textContent || ""))
              const visibles = tags.filter((e) => {
                const q = e.getBoundingClientRect()
                return q.width > 0 && q.bottom > 0 && q.top < innerHeight
              })
              const solapan = visibles
                .filter((e) => {
                  const q = e.getBoundingClientRect()
                  return cajas.some((c) => q.left < c.right && c.left < q.right && q.top < c.bottom && c.top < q.bottom)
                })
                .map((e) => (e.textContent || "").trim())
              const dock = cajas[0]
              const margen = visibles.map((e) => Math.round(dock.top - e.getBoundingClientRect().bottom))
              return { total: tags.length, visibles: visibles.length, solapan, margen }
            })
            expect(r.total, "la página lleva el rótulo").toBeGreaterThan(0)
            expect(r.solapan, "rótulos tapados por el dock o el asistente").toEqual([])
          } finally {
            await p.close()
          }
        })
      }
    }
  }
})
