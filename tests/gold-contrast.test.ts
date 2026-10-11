import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

/*
  El dorado de marca (--gold) es decorativo: sobre crema da 2,7:1 y sobre oliva
  2,35:1. Cuando el dorado es LETRA hay que usar --gold-dark (sobre crema/blanco)
  o --gold-light (sobre oliva). Esta guarda calcula el contraste con la fórmula
  WCAG 2.1 a partir de los HSL de globals.css, sin fiarse de lo que diga el
  comentario junto a cada token.
*/

const css = readFileSync(path.resolve(__dirname, "../app/globals.css"), "utf8")

function hsl(name: string): [number, number, number] {
  const m = css.match(new RegExp(`--${name}:\\s*(\\d+)\\s+(\\d+)%\\s+(\\d+)%`))
  if (!m) throw new Error(`falta --${name} en globals.css`)
  return [Number(m[1]), Number(m[2]), Number(m[3])]
}

function rgb([H, S, L]: [number, number, number]) {
  const s = S / 100
  const l = L / 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + H / 30) % 12
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
  }
  return [f(0), f(8), f(4)]
}

function luminance(c: number[]) {
  const [r, g, b] = c.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(fg: string, bg: string | number[]) {
  const a = luminance(rgb(hsl(fg)))
  const b = luminance(typeof bg === "string" ? rgb(hsl(bg)) : bg)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

describe("dorado como letra", () => {
  it("--gold-dark llega a 4,5:1 sobre crema y blanco", () => {
    expect(contrast("gold-dark", "background")).toBeGreaterThanOrEqual(4.5)
    expect(contrast("gold-dark", [1, 1, 1])).toBeGreaterThanOrEqual(4.5)
  })

  it("--gold-light llega a 4,5:1 sobre el oliva", () => {
    expect(contrast("gold-light", "olive")).toBeGreaterThanOrEqual(4.5)
  })

  it("--gold de marca NO sirve de letra sobre crema ni oliva (por eso existen los otros dos)", () => {
    expect(contrast("gold", "background")).toBeLessThan(3)
    expect(contrast("gold", "olive")).toBeLessThan(3)
  })
})
