import { describe, expect, it } from "vitest"
import { routing } from "@/i18n/routing"
import {
  ALFA,
  ALFA_BARRA,
  CREMA_HSL,
  DESTINO_PROPIETARIOS,
  DESTINO_VIAJEROS,
  ORO_CLARO_HSL,
  URL_GUEST_APP,
  URL_PORTAL_PROPIETARIO,
  VELO_ALFA,
  VELO_RGB,
  tipoDePagina,
} from "@/lib/franja-cabecera"

describe("tipo de página por ruta", () => {
  it.each([
    ["/propietarios", "propietarios"],
    ["/propietarios/calculadora", "propietarios"],
    ["/founding-owners", "propietarios"],
    ["/ecosistema", "propietarios"],
    ["/coleccion", "viajeros"],
    ["/villa/casa-de-ejemplo", "viajeros"],
    ["/experiencias", "viajeros"],
    ["/guias", "viajeros"],
    ["/guias/un-articulo", "viajeros"],
    ["/descubre", "viajeros"],
    ["/guestapp", "viajeros"],
    ["/", "neutro"],
    ["/faq", "neutro"],
    ["/contacto", "neutro"],
    ["/nosotros", "neutro"],
    ["/privacidad", "neutro"],
    ["/meet", "neutro"],
  ] as const)("%s → %s", (ruta, tipo) => {
    expect(tipoDePagina(ruta)).toBe(tipo)
  })

  it("tolera barra final, query y hash; sin ruta es neutro", () => {
    expect(tipoDePagina("/propietarios/")).toBe("propietarios")
    expect(tipoDePagina("/coleccion?x=1")).toBe("viajeros")
    expect(tipoDePagina("/ecosistema#a")).toBe("propietarios")
    expect(tipoDePagina(null)).toBe("neutro")
    expect(tipoDePagina(undefined)).toBe("neutro")
    expect(tipoDePagina("")).toBe("neutro")
  })

  it("no confunde prefijos: /propietarios-x o /villas no son esas páginas", () => {
    expect(tipoDePagina("/propietarios-x")).toBe("neutro")
    expect(tipoDePagina("/villas")).toBe("neutro")
    expect(tipoDePagina("/guestapps")).toBe("neutro")
  })

  it("las rutas que existen en app/[locale] están todas clasificadas a propósito", async () => {
    const { readdirSync } = await import("node:fs")
    const carpetas = readdirSync("app/[locale]", { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => `/${d.name}`)
    const esperado: Record<string, string> = {
      "/aviso-legal": "neutro", "/coleccion": "viajeros", "/contacto": "neutro", "/cookies": "neutro", "/descubre": "viajeros",
      "/ecosistema": "propietarios", "/experiencias": "viajeros", "/faq": "neutro", "/founding-owners": "propietarios",
      "/guestapp": "viajeros", "/guias": "viajeros", "/meet": "neutro", "/nosotros": "neutro", "/privacidad": "neutro",
      "/propietarios": "propietarios", "/villa": "viajeros",
    }
    for (const c of carpetas) expect(esperado[c], `ruta nueva sin clasificar: ${c}`).toBeDefined()
    for (const c of carpetas) expect(tipoDePagina(c), c).toBe(esperado[c])
  })
})

describe("destinos: los mismos que tenía el botón de la barra y el desplegable «Portal»", () => {
  it("franja y portal", () => {
    expect(DESTINO_VIAJEROS).toBe("/contacto?type=guest")
    expect(DESTINO_PROPIETARIOS).toBe("/contacto?type=owner")
    expect(URL_GUEST_APP).toBe("https://guests.sedaprivatehomes.com/acceso")
    expect(URL_PORTAL_PROPIETARIO).toBe("https://portal.sedaprivatehomes.com/")
  })
})

/* Contraste WCAG 2.x, calculado a mano con la fórmula de la norma (no con el código de la web). */
const lin = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const lum = ([r, g, b]: number[]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
const ratio = (a: number[], b: number[]) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}
function hslARgb([h, s, l]: readonly number[]): number[] {
  const S = s / 100, L = l / 100
  const k = (n: number) => (n + h / 30) % 12
  const a = S * Math.min(L, 1 - L)
  const f = (n: number) => L - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [f(0), f(8), f(4)].map((v) => Math.round(v * 255))
}
const mezcla = (arriba: number[], alfa: number, abajo: number[]) => arriba.map((c, i) => c * alfa + abajo[i] * (1 - alfa))

describe("contraste del texto de la franja sobre la foto más clara (fondo blanco, peor caso)", () => {
  const blanco = [255, 255, 255]
  const fondo = mezcla([...VELO_RGB], VELO_ALFA, blanco)
  const crema = hslARgb(CREMA_HSL)
  const oro = hslARgb(ORO_CLARO_HSL)
  it("la crema y el oro claro son los de la web (36 38% 97% → rgb 250 248 244; 38 60% 80% → rgb 235 212 173; calculado a mano)", () => {
    expect(crema.every((c, i) => Math.abs(c - [250, 248, 244][i]) <= 1)).toBe(true)
    expect(oro.every((c, i) => Math.abs(c - [235, 212, 173][i]) <= 1)).toBe(true)
  })
  it("las constantes son las de app/globals.css (--background y --gold-light)", async () => {
    const { readFileSync } = await import("node:fs")
    const css = readFileSync("app/globals.css", "utf8")
    const leer = (v: string) => [...css.matchAll(new RegExp(`--${v}:\\s*(\\d+)\\s+(\\d+)%\\s+(\\d+)%`, "g"))][0].slice(1, 4).map(Number)
    expect(leer("background")).toEqual([...CREMA_HSL])
    expect(leer("gold-light")).toEqual([...ORO_CLARO_HSL])
  })
  it.each([
    ["etiqueta de la franja", ALFA.etiqueta, "crema"],
    ["frase de la franja", ALFA.frase, "crema"],
    ["frase de la mitad destacada", ALFA.fraseDestacada, "crema"],
    ["enlace (crema)", ALFA.enlace, "crema"],
    ["etiqueta de la mitad destacada y enlace de propietarios (oro claro)", 1, "oro"],
  ] as const)("%s ≥ 4,5:1", (_, alfa, color) => {
    const texto = mezcla(color === "crema" ? crema : oro, alfa, fondo)
    expect(ratio(texto, fondo)).toBeGreaterThanOrEqual(4.5)
  })
  it("nada de la franja se apaga: no hay opacidades atenuadas, y la destacada es más clara que la normal", () => {
    expect(Object.keys(ALFA).sort()).toEqual(["enlace", "etiqueta", "frase", "fraseDestacada"])
    expect(ALFA.enlace).toBe(1)
    expect(ALFA.fraseDestacada).toBeGreaterThan(ALFA.frase)
  })
  it.each([
    ["enlace inactivo de la barra", ALFA_BARRA.enlaceInactivo],
    ["idioma inactivo del selector de la barra", ALFA_BARRA.idiomaInactivo],
    ["enlace activo y botones de la barra (crema al 100 %)", 1],
  ] as const)("barra transparente (portada, arriba): %s ≥ 4,5:1", (_, alfa) => {
    expect(ratio(mezcla(crema, alfa, fondo), fondo)).toBeGreaterThanOrEqual(4.5)
  })
  it("el velo es el mismo en la franja y en la barra y es el más bajo con el que todo pasa: 0,64 y 0,66 no bastan para el oro claro", () => {
    const fondoCon = (v: number) => mezcla([...VELO_RGB], v, blanco)
    expect(VELO_ALFA).toBe(0.68)
    expect(ratio(oro, fondoCon(0.64))).toBeLessThan(4.5)
    expect(ratio(oro, fondoCon(0.66))).toBeLessThan(4.5)
    expect(ratio(oro, fondoCon(VELO_ALFA))).toBeGreaterThanOrEqual(4.5)
  })
  it("el código usa esos valores: velo de la barra, opacidades del texto de la barra y del selector de idiomas", async () => {
    const { readFileSync } = await import("node:fs")
    const nav = readFileSync("components/navigation.tsx", "utf8")
    const idiomas = readFileSync("components/language-switcher.tsx", "utf8")
    const franja = readFileSync("components/cabecera-franja.tsx", "utf8")
    expect(nav).toContain(`bg-[rgba(${VELO_RGB.join(",")},${VELO_ALFA})]`)
    expect(nav).toContain(`text-background/${ALFA_BARRA.enlaceInactivo * 100} hover:text-background`)
    expect(idiomas).toContain(`text-background/${ALFA_BARRA.idiomaInactivo * 100} hover:text-background`)
    expect(franja).toContain("VELO_ALFA") // la franja pinta su velo con la misma constante
    expect(nav).not.toMatch(/rgba\(20,16,14,0\.72\)/)
  })
  it("cada opacidad de texto que define ALFA pasa 4,5:1 (la foto más clara posible es el blanco)", () => {
    for (const a of Object.values(ALFA)) expect(ratio(mezcla(crema, a, fondo), fondo)).toBeGreaterThanOrEqual(4.5)
  })
})

describe("textos de la franja en los cuatro idiomas", () => {
  it("existen todas las claves y el trato es de usted, Sie, vous y your", async () => {
    const claves = ["viajeros", "propietarios", "frase_viajeros", "frase_propietarios", "aria", "huespedes_titulo", "huespedes_linea", "propietarios_titulo", "propietarios_linea", "entrar"]
    for (const l of routing.locales) {
      const f = ((await import(`@/messages/${l}.json`)).default as { franja: Record<string, string> }).franja
      for (const c of claves) expect(f[c], `${l}.${c}`).toBeTruthy()
    }
    const f = (l: string) => import(`@/messages/${l}.json`).then((m) => m.default.franja as Record<string, string>)
    expect((await f("es")).frase_propietarios).toBe("Gestión integral de su vivienda con SEDA OS")
    expect((await f("es")).frase_viajeros).toBe("Casas privadas con servicio de hotel")
    expect((await f("de")).frase_propietarios).toMatch(/\bIhrer\b/)
    expect((await f("fr")).frase_propietarios).toMatch(/\bvotre\b/)
    expect((await f("en")).frase_propietarios).toMatch(/\byour\b/)
  })
})
