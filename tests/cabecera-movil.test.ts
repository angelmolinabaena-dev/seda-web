import { beforeEach, describe, expect, it } from "vitest"
import { DESTINO_PROPIETARIOS, DESTINO_VIAJEROS } from "@/lib/franja-cabecera"
import { ALTO_BARRA_MOVIL, ALTO_BARRA_TABLET, ANCHO_ESCRITORIO, ANCHO_TABLET, destinoReserva, reservaDe } from "@/lib/cabecera-movil"
import { abrirAsistente, registrarAsistente, reiniciarMontajeParaTests } from "@/lib/asistente/montaje"
import { routing } from "@/i18n/routing"

describe("Reservar / Valorar", () => {
  it("el destino de reserva es el de siempre (no hay motor de reservas: se mantiene /contacto?type=guest)", () => {
    expect(destinoReserva()).toBe(DESTINO_VIAJEROS)
    expect(DESTINO_VIAJEROS).toBe("/contacto?type=guest")
  })
  it("páginas de viajeros y neutras: Reservar → viajeros", () => {
    for (const t of ["viajeros", "neutro"] as const) expect(reservaDe(t)).toEqual({ clave: "reservar", href: DESTINO_VIAJEROS })
  })
  it("páginas de propietarios: Valorar → propietarios", () => {
    expect(reservaDe("propietarios")).toEqual({ clave: "valorar", href: DESTINO_PROPIETARIOS })
    expect(DESTINO_PROPIETARIOS).toBe("/contacto?type=owner")
  })
})

describe("medidas", () => {
  it("los puntos de corte y las alturas de barra son los del encargo", () => {
    expect([ANCHO_ESCRITORIO, ANCHO_TABLET, ALTO_BARRA_MOVIL, ALTO_BARRA_TABLET]).toEqual([1280, 768, 56, 72])
  })
})

describe("almacén de montaje del asistente", () => {
  beforeEach(() => reiniciarMontajeParaTests())
  it("abrirAsistente llama a lo registrado y deja de hacerlo al desregistrar", () => {
    let n = 0
    const quitar = registrarAsistente(() => n++)
    abrirAsistente()
    expect(n).toBe(1)
    quitar()
    abrirAsistente()
    expect(n).toBe(1)
  })
  it("sin asistente montado, abrirAsistente no hace nada", () => {
    expect(() => abrirAsistente()).not.toThrow()
  })
})

describe("textos nuevos en los cuatro idiomas", () => {
  const claves = ["portal", "reservar", "valorar", "portal_seccion", "portal_aria", "huespedes_etiqueta", "huespedes_nombre", "propietarios_etiqueta", "propietarios_nombre", "asistente_titulo", "asistente_texto", "menu_seda"]
  for (const l of routing.locales) {
    it(`${l}: movil.* completo, sin vacíos`, async () => {
      const m = (await import(`@/messages/${l}.json`)).default
      for (const c of claves) expect(typeof m.movil[c], `${l} movil.${c}`).toBe("string")
      for (const c of claves) expect(m.movil[c].trim().length, `${l} movil.${c}`).toBeGreaterThan(0)
    })
    it(`${l}: la etiqueta corta del asistente está dentro del nombre accesible de la portada (WCAG 2.5.3)`, async () => {
      const a = (await import(`@/messages/${l}.json`)).default.asistente
      expect(a.abrir_portada_aria.toLowerCase()).toContain(a.corto.toLowerCase())
    })
  }
  it("Reservar, Valorar y Portal son una sola palabra: caben en la barra a 360 px", async () => {
    for (const l of routing.locales) {
      const m = (await import(`@/messages/${l}.json`)).default.movil
      for (const c of ["portal", "reservar", "valorar"]) expect(m[c], `${l} ${c}`).not.toMatch(/\s/)
    }
  })
})
