import { describe, expect, it } from "vitest"
import { variantesConMeta } from "@/lib/legal/meta"
import { PRIVACIDAD } from "@/lib/legal/privacidad"

/*
  MOT-M04 (REA-MOTOR): la política decía que la IP del límite vive en memoria y
  no se guarda en ninguna base de datos, pero el portal guarda en Upstash un
  resumen sha256 de la IP durante 60 s (su límite por visitante, que lee
  `X-Visitor-Ip`, lib/lead-portal-envio.ts). Upstash no figuraba en la política.

  En los cuatro idiomas, en la política base y en la variante con Meta: Upstash
  es destinatario y encargado, la conservación dice «60 segundos» y
  «seudonimizado», y las transferencias a EE. UU. lo nombran.
*/

const SEUDONIMO = { es: /seudonimizado/, en: /pseudonymised/, fr: /pseudonymisée/, de: /pseudonymisiert/ } as const
const ENCARGADO = { es: /encargado del tratamiento/, en: /processor/, fr: /sous-traitant/, de: /Auftragsverarbeiter/ } as const
const SESENTA = { es: /60 segundos/, en: /60 seconds/, fr: /60 secondes/, de: /60 Sekunden/ } as const
const LOCALES = ["es", "en", "fr", "de"] as const

const seccion = (doc: typeof PRIVACIDAD, l: (typeof LOCALES)[number], id: string) =>
  JSON.stringify(doc.traducciones[l].secciones.find((s) => s.id === id))

describe("MOT-M04: Upstash en la política de privacidad", () => {
  for (const [nombre, doc] of [
    ["base", PRIVACIDAD],
    ["con Meta", variantesConMeta(true).privacidad],
  ] as const) {
    for (const l of LOCALES) {
      it(`${nombre} / ${l}: Upstash, Inc. es destinatario, encargado, y está en las transferencias a EE. UU.`, () => {
        const d = seccion(doc, l, "destinatarios")
        expect(d).toContain("Upstash, Inc.")
        expect(d).toMatch(ENCARGADO[l])
        expect(d).toMatch(SESENTA[l])
        expect(d).toMatch(/Supabase, Upstash/)
      })

      it(`${nombre} / ${l}: la conservación dice el resumen seudonimizado de la IP, 60 s, en Upstash`, () => {
        const c = seccion(doc, l, "conservacion")
        expect(c).toContain("Upstash")
        expect(c).toMatch(SESENTA[l])
        expect(c).toMatch(SEUDONIMO[l])
      })
    }
  }

  it("la «Última actualización» sube al día del cambio (2026-11-08)", () => {
    expect(PRIVACIDAD.actualizado).toBe("2026-11-08")
  })
})
