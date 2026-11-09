import { describe, expect, it } from "vitest"
import { routing } from "@/i18n/routing"
import {
  ASISTENTE_ANCHO,
  ASISTENTE_SEPARACION,
  CREMA_RGB,
  DOCK_ABAJO,
  DOCK_ALFA_ETIQUETA,
  DOCK_ALFA_RELLENO_ACTIVO,
  DOCK_ALTO,
  DOCK_LADOS,
  DOCK_VELO_ALFA,
  DOCK_VELO_RGB,
  ORO_CLARO_HEX,
  ORO_CLARO_RGB,
  OLIVA_HEX,
  elementosDock,
  enlaceActivo,
  llamadaDock,
} from "@/lib/dock-movil"
import { readFileSync } from "node:fs"

describe("elementos del dock", () => {
  it("orden: Colección, Experiencias (solo tablet), Propietarios, Portal y Menú", () => {
    const e = elementosDock()
    expect(e.map((x) => x.clave)).toEqual(["coleccion", "experiencias", "propietarios", "portal", "menu"])
    expect(e.filter((x) => x.tipo === "enlace" && x.solo === "tablet").map((x) => x.clave)).toEqual(["experiencias"])
    expect(e.filter((x) => x.tipo === "hoja").map((x) => x.clave)).toEqual(["portal", "menu"])
    expect(e.find((x) => x.clave === "coleccion")).toMatchObject({ href: "/coleccion" })
    expect(e.find((x) => x.clave === "propietarios")).toMatchObject({ href: "/propietarios" })
  })

  it("la llamada de la tablet: «Valorar mi propiedad» en páginas de propietarios y «Solicitar estancia» en el resto", () => {
    expect(llamadaDock("propietarios")).toEqual({ clave: "valorar_propiedad", href: "/contacto?type=owner" })
    expect(llamadaDock("viajeros")).toEqual({ clave: "solicitar_estancia", href: "/contacto?type=guest" })
    expect(llamadaDock("neutro")).toEqual({ clave: "solicitar_estancia", href: "/contacto?type=guest" })
  })

  it.each([
    ["/coleccion", "/coleccion", true],
    ["/coleccion", "/villa/casa-x", true],
    ["/coleccion", "/villa", true],
    ["/propietarios", "/propietarios/calculadora", true],
    ["/propietarios", "/propietarios/", true],
    ["/experiencias", "/experiencias", true],
    ["/coleccion", "/", false],
    ["/propietarios", "/propietarios-x", false],
    ["/coleccion", "/coleccionista", false],
    ["/experiencias", "/coleccion", false],
    ["/coleccion", null, false],
  ] as const)("enlaceActivo(%s, %s) = %s", (href, ruta, esperado) => {
    expect(enlaceActivo(href, ruta)).toBe(esperado)
  })
})

describe("medidas y colores del dock (los del diseño)", () => {
  it("66 px de alto, a 12 px de los lados y a 14 px del borde; asistente de 64 px con 8 px de separación", () => {
    expect([DOCK_ALTO, DOCK_LADOS, DOCK_ABAJO, ASISTENTE_ANCHO, ASISTENTE_SEPARACION]).toEqual([66, 12, 14, 64, 8])
    expect(DOCK_VELO_ALFA).toBe(0.72)
    expect([...DOCK_VELO_RGB]).toEqual([20, 16, 14])
    expect(DOCK_ALFA_ETIQUETA).toBe(0.86)
    expect(ORO_CLARO_HEX).toBe("#ebd4ad")
    expect(OLIVA_HEX).toBe("#536043")
  })
  it("el código usa esas medidas: hueco de la página, botón del asistente y dock junto al asistente", () => {
    const css = readFileSync("app/globals.css", "utf8")
    expect(css).toContain(`padding-bottom: calc(${DOCK_ABAJO}px + ${DOCK_ALTO}px + env(safe-area-inset-bottom) + 14px)`)
    expect(css).toContain("@media (max-width: 1279px)")
    const asistente = readFileSync("components/asistente/asistente-propietarios.tsx", "utf8")
    expect(asistente).toContain(`h-[${DOCK_ALTO}px] w-16`) // 64 × 66
    expect(asistente).toContain(`bg-[${OLIVA_HEX}]`)
    expect(asistente).toContain("--dock-asistente")
    expect(asistente).toContain("ASISTENTE_ANCHO + ASISTENTE_SEPARACION") // 72 px que se resta al dock
    // El rótulo «Imagen ilustrativa»: en el hero de la portada (alto de la ventana) sube por encima del dock con el mismo
    // hueco que la página; en el hero de /propietarios (más alto que la ventana) va arriba a la derecha, bajo la barra.
    const hueco = `bottom-[calc(${DOCK_ABAJO}px+${DOCK_ALTO}px+env(safe-area-inset-bottom)+14px)]`
    expect(readFileSync("components/hero.tsx", "utf8")).toContain(`<IllustrativeTag className="${hueco} right-6 min-[1280px]:bottom-4" />`)
    expect(readFileSync("app/[locale]/propietarios/PropietariosContent.tsx", "utf8")).toContain(
      '<IllustrativeTag className="top-[6.25rem] right-6 min-[1280px]:top-auto min-[1280px]:bottom-4" />',
    )
    const dock = readFileSync("components/dock-movil.tsx", "utf8")
    expect(dock).toContain("right-[calc(12px+var(--dock-asistente,0px))]")
    expect(dock).toContain("blur(16px) saturate(140%)")
  })
})

/* Contraste WCAG calculado a mano (no con el código de la web), peor caso: foto blanca bajo el dock. */
const lin = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const lum = ([r, g, b]: readonly number[]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
const ratio = (a: readonly number[], b: readonly number[]) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}
const mezcla = (arriba: readonly number[], alfa: number, abajo: readonly number[]) => arriba.map((c, i) => c * alfa + abajo[i] * (1 - alfa))

describe("contraste del dock sobre la foto más clara (fondo blanco)", () => {
  const dock = mezcla(DOCK_VELO_RGB, DOCK_VELO_ALFA, [255, 255, 255])
  it("etiqueta (crema al 86 %) ≥ 4,5:1", () => {
    expect(ratio(mezcla(CREMA_RGB, DOCK_ALFA_ETIQUETA, dock), dock)).toBeGreaterThanOrEqual(4.5)
  })
  it("elemento activo: oro claro sobre el relleno crema ≥ 4,5:1", () => {
    const fondo = mezcla(CREMA_RGB, DOCK_ALFA_RELLENO_ACTIVO, dock)
    expect(ratio(ORO_CLARO_RGB, fondo)).toBeGreaterThanOrEqual(4.5)
  })
  it("el relleno es el más alto que lo permite: el 0,14 del diseño deja el oro en 3,7:1 y 0,07 ya no pasa", () => {
    const oroSobre = (f: number) => ratio(ORO_CLARO_RGB, mezcla(CREMA_RGB, f, dock))
    expect(oroSobre(0.14)).toBeLessThan(4.5)
    expect(oroSobre(0.07)).toBeLessThan(4.5)
    expect(oroSobre(0.06)).toBeGreaterThanOrEqual(4.5)
    expect(DOCK_ALFA_RELLENO_ACTIVO).toBe(0.06)
  })
  it("etiqueta sobre el relleno del elemento activo (cuando la página actual no es oro) también pasa", () => {
    const fondo = mezcla(CREMA_RGB, DOCK_ALFA_RELLENO_ACTIVO, dock)
    expect(ratio(mezcla(CREMA_RGB, DOCK_ALFA_ETIQUETA, fondo), fondo)).toBeGreaterThanOrEqual(4.5)
  })
})

describe("textos del dock en los cuatro idiomas", () => {
  it("existen todas las claves y las etiquetas son cortas (caben en un botón de ~66 px a 10 px)", async () => {
    const claves = ["aria", "coleccion", "experiencias", "propietarios", "portal", "menu", "cerrar", "idioma", "idioma_actual", "portal_titulo", "portal_texto", "huespedes_etiqueta", "huespedes_nombre", "propietarios_etiqueta", "propietarios_nombre", "aun_no_cliente", "menu_titulo", "portal_propietario", "asa"]
    for (const l of routing.locales) {
      const d = ((await import(`@/messages/${l}.json`)).default as { dock: Record<string, string> }).dock
      for (const c of claves) expect(d[c], `${l}.${c}`).toBeTruthy()
      for (const c of ["coleccion", "propietarios", "portal", "menu", "cerrar"]) expect(d[c].length, `${l}.${c} «${d[c]}»`).toBeLessThanOrEqual(13)
    }
    const es = (await import("@/messages/es.json")).default as { dock: Record<string, string> }
    expect(es.dock.portal_texto).toBe("Acceso privado para huéspedes y propietarios.")
    expect(es.dock.aun_no_cliente).toBe("¿Aún no es cliente?")
  })
})
