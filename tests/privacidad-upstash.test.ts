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

  /*
    MOT-11 (ASISTENTE-ANTES-DE-ENCENDER): los límites del asistente viven en
    Upstash (lib/asistente/cupos.ts). Plazos del código: la ventana por visitante
    caduca a `window * 2 + 1000` ms (@upstash/ratelimit, PEXPIRE del script de
    ventana deslizante) = 20 min y 1 s; el contador diario, a la medianoche de
    Madrid + 60 s (`segundosHastaMedianocheMadrid`).
  */
  const ASISTENTE = { es: /asistente/, en: /assistant/, fr: /assistant/, de: /Assistent/ } as const
  const VEINTE = { es: /20 minutos/, en: /20 minutes/, fr: /vingtaine de minutes/, de: /20 Minuten/ } as const
  const MEDIANOCHE = { es: /medianoche,? \(?hora de Madrid/, en: /midnight,? \(?Madrid time/, fr: /minuit,? \(?heure de Madrid/, de: /Mitternacht,? \(?Madrider Zeit/ } as const
  const fila = (doc: typeof PRIVACIDAD, l: (typeof LOCALES)[number]) =>
    JSON.stringify(
      doc.traducciones[l].secciones
        .find((s) => s.id === "destinatarios")!
        .bloques.flatMap((b) => (b.tipo === "tabla" ? b.filas : []))
        .find((f) => f[0] === "Upstash, Inc."),
    )
  for (const [nombre, doc] of [
    ["base", PRIVACIDAD],
    ["con Meta", variantesConMeta(true).privacidad],
  ] as const) {
    for (const l of LOCALES) {
      it(`${nombre} / ${l}: la fila de Upstash cubre también los límites del asistente (20 min y hasta medianoche)`, () => {
        const f = fila(doc, l)
        expect(f).toMatch(ASISTENTE[l])
        expect(f).toMatch(VEINTE[l])
        expect(f).toMatch(MEDIANOCHE[l])
        expect(f).toMatch(SESENTA[l]) // lo del portal sigue
      })

      it(`${nombre} / ${l}: la sección del asistente ya no dice «en memoria, 10 minutos» y nombra a Upstash`, () => {
        const a = seccion(doc, l, "asistente")
        expect(a).toContain("Upstash")
        expect(a).toMatch(SEUDONIMO[l])
        expect(a).toMatch(VEINTE[l])
        expect(a).not.toMatch(/en memoria y 10 minutos|in memory for 10 minutes|en mémoire et 10 minutes|im Arbeitsspeicher, höchstens 10 Minuten/)
        expect(a).toContain("BotID")
      })

      it(`${nombre} / ${l}: la conservación general recoge los plazos del asistente`, () => {
        const c = seccion(doc, l, "conservacion")
        expect(c).toMatch(VEINTE[l])
        expect(c).toMatch(MEDIANOCHE[l])
      })
    }
  }

  it("la «Última actualización» no es anterior al día del cambio (2026-11-08)", () => {
    // Cambios posteriores del texto (p. ej. 2026-11-09, el asistente en la portada) la suben; nunca puede bajar de aquí.
    expect(PRIVACIDAD.actualizado >= "2026-11-08").toBe(true)
  })
})
