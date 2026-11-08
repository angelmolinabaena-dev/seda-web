import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative } from "node:path"
import { describe, expect, it } from "vitest"
import {
  FECHA_CORTE_IVA_ALOJAMIENTO,
  IVA_ALOJAMIENTO_PCT,
  MAX_NOCHES_IVA_ALOJAMIENTO,
} from "@/lib/calculadora-propietarios"
import { RDL29_IVA_ALOJAMIENTO, diasConIvaEnProyeccion, rdl29Aplicado } from "@/lib/iva-alojamiento"
import { tokensIvaAlojamiento, type Idioma } from "@/lib/tarifa"

/*
  IVA-PROYECCION-UNA-FUENTE (MOT-09, REA-MOTOR) — EL CONTRATO DEL RDL 29/2026
  ENTRE seda-web Y seda_os.

  seda_os factura con `FECHA_CORTE_IVA_VUT = '2026-12-01'`
  (lib/factura-iva-regla.ts), el 10 % y estancias de 30 noches o menos
  (`MAX_NOCHES_IVA_VUT`). La calculadora y el asistente de la web proyectan con
  lib/iva-alojamiento.ts. Si uno de los dos repos mueve la fecha o el tipo y el
  otro no, la web promete a una propietaria una cifra que su liquidación no
  respeta.

  Como el vector de la firma (tests/lead-firma-contrato.test.ts), el valor va
  ESCRITO A MANO aquí, no importado: es el que debe fijar también seda_os, con
  estos mismos tres números, en su propio test. Si alguien cambia la fuente de la
  web sin cambiar este vector, rojo; si cambia el vector, tiene que cambiar el
  de seda_os.

  Fuente del valor: el texto del RDL 29/2026 tal como lo recoge la REA-MOTOR
  (docs/audit/REA-MOTOR-2026-11.md de seda_os, MOT-09). Desde esta sesión no se
  ha podido leer seda_os: el lado de allí se comprueba en su PR.
*/
const VECTOR_RDL29 = {
  fechaCorte: "2026-12-01",
  pct: 10,
  maxNoches: 30,
} as const

describe("RDL 29/2026: el vector, idéntico en seda_os", () => {
  it("la fuente única de la web dice la fecha, el tipo y las noches del vector", () => {
    expect(RDL29_IVA_ALOJAMIENTO.fechaCorte).toBe(VECTOR_RDL29.fechaCorte)
    expect(RDL29_IVA_ALOJAMIENTO.pct).toBe(VECTOR_RDL29.pct)
    expect(RDL29_IVA_ALOJAMIENTO.maxNoches).toBe(VECTOR_RDL29.maxNoches)
  })

  it("lo que exporta la calculadora es esa misma fuente, no una copia", () => {
    expect(FECHA_CORTE_IVA_ALOJAMIENTO).toBe(VECTOR_RDL29.fechaCorte)
    expect(IVA_ALOJAMIENTO_PCT).toBe(VECTOR_RDL29.pct)
    expect(MAX_NOCHES_IVA_ALOJAMIENTO).toBe(VECTOR_RDL29.maxNoches)
  })

  it("los textos dicen esa fecha y ese porcentaje (escritos a mano aquí)", () => {
    const esperado: Record<Idioma, { fecha: string; pct: string }> = {
      es: { fecha: "1 de diciembre de 2026", pct: "10 %" },
      en: { fecha: "1 December 2026", pct: "10%" },
      fr: { fecha: "1er décembre 2026", pct: "10 %" },
      de: { fecha: "1. Dezember 2026", pct: "10 %" },
    }
    for (const l of Object.keys(esperado) as Idioma[]) {
      const t = tokensIvaAlojamiento(l)
      expect(t.fechaCorte).toBe(esperado[l].fecha)
      expect(t.pct).toBe(esperado[l].pct)
      expect(t.maxNoches).toBe("30")
    }
  })
})

describe("un solo sitio: ningún otro fichero de la web escribe la fecha de corte", () => {
  const RAIZ = process.cwd()
  const CARPETAS = ["app", "lib", "components", "i18n", "messages"]
  const ficheros = (dir: string): string[] =>
    readdirSync(dir).flatMap((n) => {
      const p = join(dir, n)
      return statSync(p).isDirectory() ? ficheros(p) : /\.(tsx?|mjs|json)$/.test(n) ? [p] : []
    })

  it("el literal '2026-12-01' solo está en lib/iva-alojamiento.ts", () => {
    const con = CARPETAS.flatMap((c) => ficheros(join(RAIZ, c)))
      .filter((p) => /["'`]2026-12-01["'`]/.test(readFileSync(p, "utf8")))
      .map((p) => relative(RAIZ, p))
    expect(con).toEqual(["lib/iva-alojamiento.ts"])
  })
})

describe("el interruptor SEDA_IVA_ALOJAMIENTO_RDL29", () => {
  it("por defecto aplica el RDL; solo «0» lo apaga", () => {
    expect(rdl29Aplicado(undefined)).toBe(true)
    expect(rdl29Aplicado("")).toBe(true)
    expect(rdl29Aplicado("1")).toBe(true)
    expect(rdl29Aplicado("0")).toBe(false)
    expect(rdl29Aplicado(" 0 ")).toBe(false)
  })

  it("apagado, ningún día de ninguna proyección lleva IVA", () => {
    expect(diasConIvaEnProyeccion("2026-11-15", false)).toBe(0)
    expect(diasConIvaEnProyeccion("2027-06-01", false)).toBe(0)
    expect(diasConIvaEnProyeccion("2027-06-01", true)).toBe(365)
  })

  it("next.config.mjs lo inlina, para que el navegador y el servidor apliquen el mismo régimen", () => {
    const cfg = readFileSync(join(process.cwd(), "next.config.mjs"), "utf8")
    expect(cfg).toMatch(/SEDA_IVA_ALOJAMIENTO_RDL29:\s*process\.env\.SEDA_IVA_ALOJAMIENTO_RDL29/)
    const src = readFileSync(join(process.cwd(), "lib/iva-alojamiento.ts"), "utf8")
    // El literal `process.env.X` (lo que el bundler sustituye), no `env[...]`.
    expect(src).toContain("process.env.SEDA_IVA_ALOJAMIENTO_RDL29")
  })

  it("en el entorno de los tests el interruptor está sin tocar (el RDL se aplica)", () => {
    expect(process.env.SEDA_IVA_ALOJAMIENTO_RDL29 ?? "").not.toBe("0")
    expect(rdl29Aplicado()).toBe(true)
  })
})
