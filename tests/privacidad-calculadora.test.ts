import { describe, expect, it } from "vitest"
import { routing } from "@/i18n/routing"
import { cuerpoPortal } from "@/lib/lead-propietario"
import { PRIVACIDAD } from "@/lib/legal/privacidad"
import type { SeccionLegal } from "@/lib/legal/types"

/*
  La política de privacidad tiene que describir el formulario de la calculadora
  (/propietarios/calculadora) en TODOS los idiomas del sitio. Antes de este
  tratamiento decía que la única entrada de datos era el formulario de contacto
  (un correo, sin base de datos); con la calculadora eso es falso y publicarlo así
  es un incumplimiento de los arts. 13 y 14 del RGPD.

  El test falla si:
    · algún idioma no menciona la calculadora en «qué datos», «para qué»,
      «destinatarios», «conservación» o «dónde no están»;
    · falta Supabase como destinatario, o la base del consentimiento (art. 6.1.a);
    · reaparece la frase antigua «ni CRM conectado»;
    · se añade un idioma sin completar este test;
    · la versión del consentimiento que viaja al portal deja de ser la fecha de
      esta política.

  Los literales salen de los hechos del encargo (docs de portal-propietarios y
  `lib/lead-propietario.ts`), no de lo que haya escrito la propia política.
*/

// Cómo se nombra la calculadora en cada idioma de la política.
const TERMINO: Record<string, RegExp> = {
  es: /calculadora/i,
  en: /calculator/i,
  fr: /calculateur/i,
  de: /Rechner/,
}

// Cómo se cita «art. 6.1.a RGPD (consentimiento)» en cada idioma.
const BASE_CONSENTIMIENTO: Record<string, RegExp> = {
  es: /Artículo 6\.1\.a del RGPD/,
  en: /Article 6\(1\)\(a\) GDPR/,
  fr: /Article 6\.1\.a du RGPD/,
  de: /Art\. 6 Abs\. 1 lit\. a DSGVO/,
}

// La afirmación que la calculadora hace falsa, tal como estaba en cada idioma.
const FRASE_ANTIGUA: Record<string, string> = {
  es: "ni CRM conectado",
  en: "no connected CRM",
  fr: "ni CRM connecté",
  de: "kein angebundenes CRM",
}

const SECCIONES = ["datos", "finalidad", "destinatarios", "conservacion", "donde-no-estan"] as const

const textoDe = (s: SeccionLegal) => JSON.stringify(s)
const seccion = (locale: string, id: string): SeccionLegal => {
  const s = PRIVACIDAD.traducciones[locale as keyof typeof PRIVACIDAD.traducciones].secciones.find((x) => x.id === id)
  if (!s) throw new Error(`falta la sección «${id}» en ${locale}`)
  return s
}

describe("política de privacidad: formulario de la calculadora de propietarios", () => {
  it("este test conoce todos los idiomas del sitio (si se añade uno, hay que completarlo aquí)", () => {
    for (const l of routing.locales) {
      expect(TERMINO[l], `término de la calculadora para «${l}»`).toBeDefined()
      expect(BASE_CONSENTIMIENTO[l], `cita del art. 6.1.a para «${l}»`).toBeDefined()
      expect(FRASE_ANTIGUA[l], `frase antigua para «${l}»`).toBeDefined()
    }
  })

  for (const locale of routing.locales) {
    describe(locale, () => {
      for (const id of SECCIONES) {
        it(`la sección «${id}» menciona la calculadora`, () => {
          expect(textoDe(seccion(locale, id))).toMatch(TERMINO[locale])
        })
      }

      it("«qué datos» cita la ruta de la página, que no se traduce", () => {
        expect(textoDe(seccion(locale, "datos"))).toContain("/propietarios/calculadora")
      })

      it("«para qué» da como base el consentimiento (art. 6.1.a) y explica cómo retirarlo escribiendo a {email}", () => {
        const s = seccion(locale, "finalidad")
        expect(textoDe(s)).toMatch(BASE_CONSENTIMIENTO[locale])
        const parrafos = s.bloques.flatMap((b) => (b.tipo === "parrafo" ? [b.texto] : []))
        expect(parrafos.some((p) => p.includes("{email}") && TERMINO[locale].test(p))).toBe(true)
      })

      it("«destinatarios» nombra a Supabase y a Vercel", () => {
        const t = textoDe(seccion(locale, "destinatarios"))
        expect(t).toContain("Supabase")
        expect(t).toContain("Vercel")
      })

      it("«conservación» da el plazo de 1 año desde el último contacto", () => {
        // El año es el de docs/CONSERVACION-DATOS.md (fila «consultas y contactos sin reserva»).
        const t = textoDe(seccion(locale, "conservacion"))
        const plazo = { es: /1 año/, en: /1 year/, fr: /1 an\b/, de: /1 Jahr/ }[locale as "es" | "en" | "fr" | "de"]
        expect(t).toMatch(plazo)
      })

      it("ya no afirma que no haya CRM conectado", () => {
        expect(JSON.stringify(PRIVACIDAD.traducciones[locale as keyof typeof PRIVACIDAD.traducciones])).not.toContain(
          FRASE_ANTIGUA[locale],
        )
      })
    })
  }

  it("la versión del consentimiento que viaja al portal es la fecha de esta política, y es del 4-nov-2026 o posterior", () => {
    const cuerpo = cuerpoPortal({
      nombre: "Prueba",
      email: "Prueba@Example.com",
      locale: "es",
      precioNoche: 200,
      ocupacionPct: 50,
    })
    expect(cuerpo.consentimiento_version).toBe(PRIVACIDAD.actualizado)
    expect(PRIVACIDAD.actualizado >= "2026-11-04").toBe(true)
  })

  it("el precio y la ocupación no viajan al portal (la política dice que no se reenvían)", () => {
    const cuerpo = cuerpoPortal({
      nombre: "Prueba",
      email: "prueba@example.com",
      locale: "es",
      precioNoche: 200,
      ocupacionPct: 50,
    })
    expect(Object.keys(cuerpo).sort()).toEqual(
      ["consentimiento", "consentimiento_version", "correo", "dormitorios", "idioma", "municipio", "nombre", "telefono"].sort(),
    )
  })
})
