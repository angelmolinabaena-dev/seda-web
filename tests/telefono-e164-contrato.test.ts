import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { normalizarTelefonoE164 } from "@/lib/telefono-e164"

/*
  V4-04 · EL CONTRATO DEL TELÉFONO ENTRE seda-web Y seda_os.

  El fixture está, byte a byte, en seda_os `tests/fixtures/telefono-e164-contrato.json`,
  y su test (`tests/telefono-e164-contrato.test.ts`) fija la MISMA huella. Aquí
  lo pasa la copia de seda-web (lib/telefono-e164.ts); allí, la original
  (lib/crm-propietarios.ts). Las salidas del fixture están hechas a mano con la
  regla, no sacadas de ninguna de las dos funciones.

  La huella se calcula con los finales de línea normalizados a LF: un checkout
  de Windows con autocrlf no la rompe; un cambio de contenido, sí.
*/

const RUTA = join(process.cwd(), "tests/fixtures/telefono-e164-contrato.json")
const HUELLA = "b5cef74d29045049c9fe57a2eb9bdabfba0b2314bb4878e31421cf4918707d2e"

const texto = readFileSync(RUTA, "utf8").replace(/\r\n/g, "\n")
const { casos } = JSON.parse(texto) as { casos: { entrada: string; e164: string | null; porQue: string }[] }

describe("el fixture es el mismo que el de seda_os", () => {
  it("su sha256 (LF) es la huella que fijan los dos repos", () => {
    expect(createHash("sha256").update(texto, "utf8").digest("hex")).toBe(HUELLA)
  })

  it("trae el caso de V4-04 y casos a los dos lados de cada frontera", () => {
    expect(casos.find((c) => c.entrada === "07700 900123")?.e164).toBeNull()
    expect(casos.filter((c) => c.e164 === null).length).toBeGreaterThan(5)
    expect(casos.filter((c) => c.e164 !== null).length).toBeGreaterThan(5)
  })
})

describe("normalizarTelefonoE164 de seda-web, contra el fixture", () => {
  it.each(casos.map((c) => [c.entrada, c.e164, c.porQue] as const))("%j → %j (%s)", (entrada, e164) => {
    expect(normalizarTelefonoE164(entrada)).toBe(e164)
  })

  it("es idempotente: lo que devuelve, normalizado otra vez, es lo mismo (seda_os lo vuelve a normalizar)", () => {
    for (const c of casos) if (c.e164) expect(normalizarTelefonoE164(c.e164)).toBe(c.e164)
  })
})
