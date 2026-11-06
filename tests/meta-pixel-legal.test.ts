import { afterEach, describe, expect, it, vi } from "vitest"
import { COOKIES } from "../lib/legal/cookies"
import { ACTUALIZADO_CON_META } from "../lib/legal/meta-version"
import { cookiesVigente, privacidadVigente, variantesConMeta } from "../lib/legal/meta"
import { PRIVACIDAD } from "../lib/legal/privacidad"
import { routing } from "../i18n/routing"
import type { DocumentoLegal } from "../lib/legal/types"

/*
  Políticas de cookies y de privacidad con el píxel de Meta.

  Dos obligaciones opuestas que este test ata:
    1. Con SEDA_FLAG_META_PIXEL apagado, las políticas son EXACTAMENTE las de hoy
       (mismo objeto): decir «usamos Meta» en una web que no lo usa sería falso.
    2. Con el flag encendido, cada idioma dice qué cookies, para qué, cuánto
       duran, que Meta es destinataria y que hay transferencia a EE. UU., y NO
       conserva ninguna frase que niegue lo que ahora existe.

  Las frases «falsas con Meta» se escriben aquí a mano, copiadas de los textos
  base de hoy: si alguien las deja vivas en la variante, falla.
*/

const ID = "123456789012345"
const ON = { SEDA_FLAG_META_PIXEL: "1", NEXT_PUBLIC_META_PIXEL_ID: ID }
const ON_CAPI = { ...ON, SEDA_FLAG_META_CAPI: "1", META_CAPI_TOKEN: "t".repeat(40) }

const textoDe = (d: DocumentoLegal): string =>
  JSON.stringify([d.titulo, d.entradilla, ...d.secciones.map((s) => [s.id, s.titulo, s.bloques, s.enlaces])])

afterEach(() => vi.unstubAllEnvs())

describe("con SEDA_FLAG_META_PIXEL apagado: las políticas son las de hoy", () => {
  it.each([[{}], [{ SEDA_FLAG_META_PIXEL: "0", NEXT_PUBLIC_META_PIXEL_ID: ID }], [{ SEDA_FLAG_META_PIXEL: "1" }], [{ SEDA_FLAG_META_CAPI: "1", NEXT_PUBLIC_META_PIXEL_ID: ID }]])(
    "interruptores %j → el mismo objeto, sin tocar",
    (env) => {
      expect(cookiesVigente(env)).toBe(COOKIES)
      expect(privacidadVigente(env)).toBe(PRIVACIDAD)
    },
  )

  it("y siguen diciendo que no hay píxeles de Meta (hoy es verdad)", () => {
    expect(textoDe(COOKIES.traducciones.es)).toContain("No hay píxeles de Meta")
    expect(textoDe(COOKIES.traducciones.es)).toContain("sin-banner")
  })

  it("process.env: sin variables, las políticas vigentes son las base", () => {
    vi.stubEnv("SEDA_FLAG_META_PIXEL", undefined as unknown as string)
    expect(cookiesVigente()).toBe(COOKIES)
    expect(privacidadVigente()).toBe(PRIVACIDAD)
  })
})

describe("versión: sube respecto a los textos base", () => {
  it("la variante con Meta lleva ACTUALIZADO_CON_META, que no es anterior a ninguna fecha base", () => {
    expect(ACTUALIZADO_CON_META).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(ACTUALIZADO_CON_META >= COOKIES.actualizado).toBe(true)
    expect(ACTUALIZADO_CON_META >= PRIVACIDAD.actualizado).toBe(true)
    expect(ACTUALIZADO_CON_META > COOKIES.actualizado).toBe(true) // cookies: sube de verdad (2026-10-15 → …)
    expect(cookiesVigente(ON).actualizado).toBe(ACTUALIZADO_CON_META)
    expect(privacidadVigente(ON).actualizado).toBe(ACTUALIZADO_CON_META)
  })

  it("el consentimiento_version que viaja al portal es el de la política vigente", async () => {
    const { cuerpoPortal } = await import("../lib/lead-propietario")
    const lead = { nombre: "N", email: "a@b.es", locale: "es", precioNoche: 100, ocupacionPct: 50 }
    vi.stubEnv("SEDA_FLAG_META_PIXEL", undefined as unknown as string)
    expect(cuerpoPortal(lead).consentimiento_version).toBe(PRIVACIDAD.actualizado)
    for (const [k, v] of Object.entries(ON)) vi.stubEnv(k, v)
    expect(cuerpoPortal(lead).consentimiento_version).toBe(ACTUALIZADO_CON_META)
    expect(cuerpoPortal(lead).consentimiento_version).toMatch(/^[A-Za-z0-9._-]{1,40}$/) // el contrato de seda_os
  })
})

describe.each(routing.locales)("política con Meta — %s", (loc) => {
  const sin = variantesConMeta(false)
  const con = variantesConMeta(true)
  const cookies = textoDe(sin.cookies.traducciones[loc])
  const privacidad = textoDe(sin.privacidad.traducciones[loc])

  it("cookies: nombra _fbp y _fbc, 90 días, Meta Platforms Ireland Limited y los 24 meses de la elección", () => {
    for (const c of ["_fbp", "_fbc", "90", "Meta Platforms Ireland Limited", "Meta Platforms, Inc.", "24", "facebook.com", "seda_consentimiento_cookies"]) {
      expect(cookies, c).toContain(c)
    }
  })

  it("cookies: explica el aviso — sin muro, tres botones, nada marcado, una categoría, enlace del pie", () => {
    const t = sin.cookies.traducciones[loc]
    const ids = t.secciones.map((s) => s.id)
    expect(ids).toContain("tu-eleccion")
    expect(ids).toContain("meta")
    expect(ids).not.toContain("sin-banner") // «Por eso no verás un banner» ya no es verdad
    expect(ids.indexOf("meta")).toBe(ids.indexOf("tu-eleccion") + 1)
  })

  it("cookies: la tabla de Meta tiene las columnas de siempre en todas sus filas", () => {
    const tabla = sin.cookies.traducciones[loc].secciones.find((s) => s.id === "meta")!.bloques.find((b) => b.tipo === "tabla")
    expect(tabla?.tipo).toBe("tabla")
    if (tabla?.tipo === "tabla") for (const f of tabla.filas) expect(f).toHaveLength(tabla.cabeceras.length)
  })

  it("privacidad: Meta como destinataria, base jurídica (consentimiento), 24 meses y transferencia a EE. UU.", () => {
    expect(privacidad).toContain("Meta Platforms Ireland Limited")
    expect(privacidad).toContain("Meta Platforms, Inc.")
    expect(privacidad).toContain("_fbp")
    expect(privacidad).toContain("24")
    expect(privacidad).toContain("22.2")
    const eeuu = { es: "Estados Unidos", en: "United States", fr: "États-Unis", de: "Vereinigten Staaten" }[loc]
    expect(privacidad).toContain(eeuu)
  })

  it("privacidad: la tabla de destinatarios y la de finalidades ganan exactamente una fila (Meta)", () => {
    const filas = (d: DocumentoLegal, id: string) => {
      const t = d.secciones.find((s) => s.id === id)!.bloques.find((b) => b.tipo === "tabla")
      return t?.tipo === "tabla" ? t.filas.length : -1
    }
    const base = PRIVACIDAD.traducciones[loc]
    for (const id of ["destinatarios", "finalidad", "datos"]) {
      expect(filas(sin.privacidad.traducciones[loc], id), id).toBe(filas(base, id) + 1)
    }
  })

  it("ninguna frase que niegue lo que ahora existe sobrevive", () => {
    const falsas: Record<string, string[]> = {
      es: ["No hay píxeles de Meta", "ni píxeles de redes sociales", "Por eso no verás un banner", "Tampoco usamos el almacenamiento local", "Las únicas cookies de terceros son las que pone Calendly"],
      en: ["There are no Meta, Google Ads", "and no social network pixels", "That is why you will not see a banner", "We also do not use browser storage", "The only third-party cookies are the ones Calendly sets"],
      fr: ["Il n'y a pas de pixel Meta", "ni aucun pixel de réseau social", "C'est pourquoi vous ne verrez pas de bandeau", "Nous n'utilisons pas non plus le stockage du navigateur", "Les seuls cookies tiers sont ceux que dépose Calendly"],
      de: ["Es gibt keine Pixel von Meta", "und keine Social-Media-Pixel", "Deshalb sehen Sie kein Banner", "Auch den Browser-Speicher", "Die einzigen Cookies Dritter setzt Calendly"],
    }
    for (const f of falsas[loc]) {
      expect(cookies, f).not.toContain(f)
      expect(privacidad, f).not.toContain(f)
    }
    // y las frases falsas SÍ están en el texto base de hoy (el test no es vacío):
    const base = textoDe(COOKIES.traducciones[loc]) + textoDe(PRIVACIDAD.traducciones[loc])
    expect(falsas[loc].some((f) => base.includes(f))).toBe(true)
  })

  it("la API de conversiones aparece en las políticas SOLO si está encendida", () => {
    const api: Record<string, RegExp> = { es: /API de conversiones/, en: /Conversions API/, fr: /API de conversions/, de: /Conversions API/ }
    expect(cookies).not.toMatch(api[loc])
    expect(privacidad).not.toMatch(api[loc])
    expect(textoDe(con.cookies.traducciones[loc])).toMatch(api[loc])
    expect(textoDe(con.privacidad.traducciones[loc])).toMatch(api[loc])
  })

  it("cumple lo que el código promete: sin correo ni teléfono, ni con hash; tampoco se menciona un uso distinto a medir anuncios", () => {
    // El texto dice qué NO se envía; si alguien lo cambia a «se envía el correo», falla.
    const afirmaEnvio: Record<string, RegExp> = {
      es: /enviamos (tu )?(correo|teléfono)(?! ni)/i,
      en: /we send your (email|phone)/i,
      fr: /nous envoyons votre (courriel|téléphone)/i,
      de: /wir senden Ihre (E-Mail|Telefonnummer)(?! oder)/i,
    }
    expect(cookies).not.toMatch(afirmaEnvio[loc])
    expect(cookies).toMatch({ es: /ni siquiera cifrados/, en: /not even hashed/, fr: /pas même chiffrés/, de: /auch nicht gehasht/ }[loc])
  })
})

describe("las variantes se pueden construir", () => {
  it("cookiesVigente / privacidadVigente con el flag encendido devuelven documentos distintos de la base y estables (misma referencia)", () => {
    const a = cookiesVigente(ON)
    expect(a).not.toBe(COOKIES)
    expect(cookiesVigente(ON)).toBe(a)
    expect(privacidadVigente(ON)).not.toBe(PRIVACIDAD)
    expect(cookiesVigente(ON_CAPI)).not.toBe(a) // otra forma: con CAPI
  })

  it("no modifican los textos base (se parchea una copia)", () => {
    const antes = JSON.stringify([COOKIES, PRIVACIDAD])
    variantesConMeta(true)
    variantesConMeta(false)
    expect(JSON.stringify([COOKIES, PRIVACIDAD])).toBe(antes)
  })
})
