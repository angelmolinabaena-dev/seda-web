import { describe, expect, it } from "vitest"
import { avisosConfiguracionMeta, metaCapiActivo, metaPixelActivo, metaPixelId } from "../lib/meta-config.mjs"

/*
  Interruptores de Meta. Regla de todos los flags de seda-web: solo el valor
  EXACTO "1" enciende; cualquier otra cosa es apagado (fail closed). Aquí, además,
  el píxel necesita un ID numérico válido y la API de conversiones, el píxel y un
  token: un flag encendido a medias deja TODO apagado.
*/

const ID = "123456789012345"
const TOKEN = "EAAB" + "x".repeat(60) // de relleno; no es un token

describe("SEDA_FLAG_META_PIXEL", () => {
  it.each([[undefined], [""], ["0"], ["true"], ["TRUE"], ["yes"], [" 1"], ["1 "]])("%j → apagado", (v) => {
    expect(metaPixelActivo({ SEDA_FLAG_META_PIXEL: v, NEXT_PUBLIC_META_PIXEL_ID: ID })).toBe(false)
  })

  it("«1» con un ID válido → encendido", () => {
    expect(metaPixelActivo({ SEDA_FLAG_META_PIXEL: "1", NEXT_PUBLIC_META_PIXEL_ID: ID })).toBe(true)
  })

  it.each([[undefined], [""], ["abc"], ["12345"], ["123 456 789 012"], ["1234567890123456789012"], ["<script>"]])(
    "«1» con el ID %j → apagado (no hay píxel al que pedir permiso)",
    (id) => {
      expect(metaPixelActivo({ SEDA_FLAG_META_PIXEL: "1", NEXT_PUBLIC_META_PIXEL_ID: id })).toBe(false)
      expect(metaPixelId({ NEXT_PUBLIC_META_PIXEL_ID: id })).toBeNull()
    },
  )

  it("el ID se recorta (un espacio al pegarlo en Vercel no lo rompe)", () => {
    expect(metaPixelId({ NEXT_PUBLIC_META_PIXEL_ID: `  ${ID}\n` })).toBe(ID)
  })

  it("por defecto —sin variables— está apagado", () => {
    expect(metaPixelActivo({})).toBe(false)
    expect(metaCapiActivo({})).toBe(false)
  })
})

describe("SEDA_FLAG_META_CAPI", () => {
  const ON = { SEDA_FLAG_META_PIXEL: "1", NEXT_PUBLIC_META_PIXEL_ID: ID, SEDA_FLAG_META_CAPI: "1", META_CAPI_TOKEN: TOKEN }

  it("flag + píxel + token → encendida", () => {
    expect(metaCapiActivo(ON)).toBe(true)
  })

  it.each([
    ["sin el flag de la CAPI", { SEDA_FLAG_META_CAPI: undefined }],
    ["flag a «0»", { SEDA_FLAG_META_CAPI: "0" }],
    ["flag a «true»", { SEDA_FLAG_META_CAPI: "true" }],
    ["sin token", { META_CAPI_TOKEN: undefined }],
    ["token vacío", { META_CAPI_TOKEN: "" }],
    ["token de relleno (corto)", { META_CAPI_TOKEN: "abc" }],
    ["píxel apagado: la CAPI sola no tiene consentimiento que la respalde", { SEDA_FLAG_META_PIXEL: undefined }],
    ["píxel sin ID válido", { NEXT_PUBLIC_META_PIXEL_ID: "no" }],
  ])("%s → apagada", (_, cambio) => {
    expect(metaCapiActivo({ ...ON, ...cambio })).toBe(false)
  })
})

describe("avisos de configuración incoherente (para el build)", () => {
  it("todo apagado o bien puesto → ningún aviso", () => {
    expect(avisosConfiguracionMeta({})).toEqual([])
    expect(avisosConfiguracionMeta({ SEDA_FLAG_META_PIXEL: "1", NEXT_PUBLIC_META_PIXEL_ID: ID })).toEqual([])
  })

  it("píxel encendido sin ID, y CAPI encendida sin lo necesario, avisan — sin imprimir valores", () => {
    const avisos = avisosConfiguracionMeta({ SEDA_FLAG_META_PIXEL: "1", SEDA_FLAG_META_CAPI: "1", META_CAPI_TOKEN: TOKEN })
    expect(avisos).toHaveLength(2)
    expect(avisos.join(" ")).not.toContain(TOKEN)
  })
})
