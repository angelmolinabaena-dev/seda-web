import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import {
  TARIFA,
  comisionGestion,
  euros,
  liquidacionEjemplo,
  netoAnual,
  numero,
  resolverMensajes,
  resolverTexto,
  tokensTarifa,
  type Idioma,
} from "@/lib/tarifa"

/*
  Tarifa v6 — un único origen de las cifras (lib/tarifa/tarifa.json).

  Regla de CLAUDE.md: un test escrito por quien escribió el código demuestra
  consistencia, no corrección. Por eso cada cifra de aquí abajo es un número
  calculado A MANO con la regla de Ángel (25–26-oct-2026), no la salida de la
  función que se prueba:

      comisión = la menor de  21 % × (alojamiento − comisión del canal)
                          y   20 % × alojamiento
      alojamiento = bruto − limpieza;  IVA 21 % aparte, sobre la comisión.

  Hechas con calculadora (decimales exactos, redondeo al céntimo):
      1.000 € directa ........ 21 % = 210,00 · tope 200,00 → 200,00 · IVA 42,00
      1.000 € canal 15 % ..... base 850 → 178,50 · tope 200 → 178,50 · IVA 37,49
      1.080 € canal 180 € .... base 900 → 189,00 · tope 216,00 → 189,00 · IVA 39,69
      900 € directa .......... 21 % = 189,00 · tope 180,00 → 180,00 · IVA 37,80
      381.060 € al año ....... directa: 76.212 (tope) · neto 304.848 · IVA 16.005
                               canal 15 %: 57.159 + 68.019,21 · neto 255.882 · IVA 14.284
*/

const raiz = process.cwd()
const LOCALES: Idioma[] = ["es", "en", "fr", "de"]
const msgs = Object.fromEntries(
  LOCALES.map((l) => [l, JSON.parse(readFileSync(join(raiz, `messages/${l}.json`), "utf8"))]),
) as Record<Idioma, Record<string, unknown>>

describe("fórmula de la v6, contra cifras hechas a mano", () => {
  it("directa, 1.000 €: el 21 % serían 210 €, pero manda el tope → 200 € (+42 € de IVA)", () => {
    const c = comisionGestion(1000, 0)
    expect(c.porBase).toBe(21000)
    expect(c.tope).toBe(20000)
    expect(c.comision).toBe(20000)
    expect(c.iva).toBe(4200)
    expect(c.aplicaTope).toBe(true)
  })

  it("canal al 15 % (150 €), 1.000 €: base 850 € → 178,50 € (+37,49 € de IVA); el tope no actúa", () => {
    const c = comisionGestion(1000, 150)
    expect(c.comision).toBe(17850)
    expect(c.iva).toBe(3749)
    expect(c.aplicaTope).toBe(false)
  })

  it("/founding-owners: 1.200 € con 120 € de limpieza y 180 € de canal → base 900 € → 189 € (+39,69 € de IVA)", () => {
    const c = comisionGestion(1200 - 120, 180)
    expect(c.comision).toBe(18900)
    expect(c.tope).toBe(21600)
    expect(c.iva).toBe(3969)
  })

  it("maqueta de liquidación: 1.000 € con 100 € de limpieza, directa → 21 % = 189 €, tope 180 € → 180 €; neto 820 €", () => {
    const l = liquidacionEjemplo()
    expect(l).toMatchObject({ bruto: 1000, base: 900, comision: 180, iva: 37.8, neto: 820, aplicaTope: true })
  })

  it("simulador, 72 % × 365 × 1.450 € = 381.060 €: neto directa 304.848 € y Airbnb 255.882 €, IVA aparte", () => {
    expect(Math.round(0.72 * 365 * 1450)).toBe(381060)
    expect(netoAnual(381060)).toEqual({ directa: 304848, ota: 255882, ivaDirecta: 16005, ivaOta: 14284 })
  })

  it("control negativo: la fórmula de la v3 (24 % plano) daría 289.606 € y 246.165 €, que NO son los de la v6", () => {
    expect(Math.round(381060 * (1 - 0.24))).toBe(289606)
    expect(Math.round(381060 * 0.85 * (1 - 0.24))).toBe(246165)
    expect(netoAnual(381060).directa).not.toBe(289606)
    expect(netoAnual(381060).ota).not.toBe(246165)
  })

  it("el IVA no entra en el tope: el tope es sobre la comisión sin IVA", () => {
    // 20 % de 1.000 € = 200 €; con el IVA dentro sería 165,29 € + 34,71 € de IVA.
    expect(comisionGestion(1000, 0).comision).toBe(20000)
  })
})

describe("datos: las cifras de la v6 son las de la decisión", () => {
  it("21 % + IVA 21 % con tope del 20 %; sin permanencia y un mes de preaviso", () => {
    expect(TARIFA.gestion).toEqual({ comisionPct: 21, topePct: 20, ivaPct: 21 })
    expect(TARIFA.permanencia).toBe(false)
    expect(TARIFA.preavisoMeses).toBe(1)
  })

  it("alta: 0 € las tres primeras firmas directas, 490 € la cuarta y la quinta, después 1.290 €", () => {
    expect(TARIFA.alta).toEqual({
      gratisPrimerasFirmas: 3,
      reducidaHastaFirma: 5,
      reducidaEur: 490,
      estandarEur: 1290,
    })
  })

  it("margen de mantenimiento: 12 % solo sobre el exceso de 200 €", () => {
    expect(TARIFA.mantenimiento).toEqual({ margenPct: 12, umbralEur: 200 })
  })
})

describe("formato por idioma", () => {
  it.each([
    ["es", 1290, "1.290 €"],
    ["en", 1290, "€1,290"],
    ["fr", 1290, "1 290 €"],
    ["de", 1290, "1.290 €"],
    ["es", 178.5, "178,50 €"],
    ["en", 178.5, "€178.50"],
    ["fr", 37.49, "37,49 €"],
    ["de", 200, "200 €"],
    ["es", 490, "490 €"],
  ] as const)("%s %s → %s", (l, v, esperado) => {
    expect(euros(v, l)).toBe(esperado)
  })

  it("numero(): sin decimales si son cero, con coma o punto según idioma, miles solo desde 1.000", () => {
    expect(numero(99900, "es")).toBe("999")
    expect(numero(381060_00, "en")).toBe("381,060")
    expect(numero(1234_56, "de")).toBe("1.234,56")
  })
})

describe("tokens [[tarifa.x]] en los textos", () => {
  it("resuelve en cada idioma con las cifras de a mano", () => {
    const es = tokensTarifa("es")
    expect(es).toMatchObject({
      comision: "21%",
      tope: "20%",
      iva: "21%",
      margen: "12%",
      umbral: "200 €",
      alta490: "490 €",
      altaEstandar: "1.290 €",
      ejDirecta21: "210 €",
      ejDirecta: "200 €",
      ejAirbnb: "178,50 €",
      ejCanal: "150 €",
      resAlojamiento: "1.080 €",
      resBase: "900 €",
      resComision: "189 €",
      resTope: "216 €",
      resIva: "39,69 €",
      liqIva: "37,80 €",
    })
    expect(tokensTarifa("en")).toMatchObject({ ejAirbnb: "€178.50", altaEstandar: "€1,290", resIva: "€39.69" })
  })

  it("un token desconocido lanza: nunca llega a la web un [[…]]", () => {
    expect(() => resolverTexto("el [[tarifa.noExiste]]", "es")).toThrow(/noExiste/)
  })

  it("resolverMensajes recorre el árbol entero", () => {
    expect(resolverMensajes({ a: { b: "el [[tarifa.comision]]" }, c: "x" }, "es")).toEqual({ a: { b: "el 21%" }, c: "x" })
  })

  for (const l of LOCALES) {
    it(`${l}: ningún mensaje conserva un [[…]] tras resolver, y los textos no escriben la tarifa a mano`, () => {
      const resueltos = JSON.stringify(resolverMensajes(msgs[l] as never, l))
      expect(resueltos).not.toMatch(/\[\[|\]\]/)
      // La comisión (21 %, 20 %), el margen (12 %) y el alta (490 €, 1.290 €) solo pueden entrar por token.
      const crudo = JSON.stringify(msgs[l])
      expect(crudo).not.toMatch(/\b24 ?%/) // la v3
      expect(crudo).not.toMatch(/1[.,\s  ]?290/)
      expect(crudo).not.toMatch(/\b490\b/)
    })
  }

  it("los textos que cuentan la regla en palabras concuerdan con los datos (tres primeras firmas, cuarta y quinta, un mes)", () => {
    // «las tres primeras firmas… la cuarta y la quinta» y «un mes» están en prosa: si cambian los datos, hay que cambiarlos.
    expect(TARIFA.alta.gratisPrimerasFirmas).toBe(3)
    expect(TARIFA.alta.reducidaHastaFirma).toBe(5)
    const q1 = (resolverMensajes(msgs.es as never, "es") as never as { prop: { faq: { items: { q1: { a: string } } } } }).prop.faq.items.q1.a
    expect(q1).toMatch(/tres primeras firmas directas no pagan el alta; la cuarta y la quinta pagan 490/)
    expect(q1).toMatch(/preaviso de un mes/)
  })
})
