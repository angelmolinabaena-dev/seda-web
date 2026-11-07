import { describe, expect, it } from "vitest"
import { routing } from "@/i18n/routing"
import { variantesConMeta } from "@/lib/legal/meta"
import { PRIVACIDAD } from "@/lib/legal/privacidad"
import type { DocumentoLegalMultilingue } from "@/lib/legal/types"

/*
  La política de privacidad describe el asistente de propietarios en los cuatro
  idiomas (arts. 13 RGPD y 50 del Reglamento (UE) 2024/1689). Los literales que
  se exigen salen de fuentes externas al código del asistente:

    · Anthropic Ireland, Limited como contraparte en el EEE, encargado del
      tratamiento, DPA en vigor desde el 24-feb-2025 y cláusulas contractuales
      tipo (módulos 2 y 3): https://www.anthropic.com/legal/commercial-terms y
      https://www.anthropic.com/legal/data-processing-addendum (leídas el 7-nov-2026).
    · Sin entrenamiento con los datos: Commercial Terms («Anthropic may not train
      models on Customer Content from Services»).
    · Hasta 2 años si la conversación la marcan sus sistemas de seguridad:
      https://platform.claude.com/docs/en/manage-claude/api-and-data-retention.
    · Que SEDA no guarda la conversación: app/api/asistente/route.ts no escribe
      en ningún sitio (este sitio no tiene base de datos) y solo registra métricas.
*/

const EXIGIDO: Record<string, RegExp[]> = {
  es: [/Anthropic Ireland, Limited/, /encargado del tratamiento/, /24 de febrero de 2025/, /cláusulas contractuales tipo/, /2 años/, /entrenar/, /Reglamento \(UE\) 2024\/1689/, /artículo 50/, /SEDA no guarda la conversación/, /Artículo 6\.1\.b del RGPD/],
  en: [/Anthropic Ireland, Limited/, /processor/, /24 February 2025/, /standard contractual clauses/, /2 years/, /training/, /Regulation \(EU\) 2024\/1689/, /Article 50/, /SEDA does not keep the conversation/, /Article 6\(1\)\(b\) GDPR/],
  fr: [/Anthropic Ireland, Limited/, /sous-traitant/, /24 février 2025/, /clauses contractuelles types/, /2 ans/, /entraîner/, /règlement \(UE\) 2024\/1689/, /article 50/, /SEDA ne conserve pas la conversation/, /Article 6\.1\.b du RGPD/],
  de: [/Anthropic Ireland, Limited/, /Auftragsverarbeiter/, /24\. Februar 2025/, /Standardvertragsklauseln/, /2 Jahre/, /trainieren/, /Verordnung \(EU\) 2024\/1689/, /Artikel 50/, /SEDA speichert das Gespräch nicht/, /Art\. 6 Abs\. 1 lit\. b DSGVO/],
}

function comprobar(doc: DocumentoLegalMultilingue, etiqueta: string) {
  for (const l of routing.locales) {
    const secciones = doc.traducciones[l].secciones
    const s = secciones.find((x) => x.id === "asistente")
    expect(s, `${etiqueta}/${l}: falta la sección «asistente»`).toBeDefined()
    const texto = JSON.stringify(s)
    for (const re of EXIGIDO[l]) expect(texto, `${etiqueta}/${l}: ${re}`).toMatch(re)
    const destinatarios = JSON.stringify(secciones.find((x) => x.id === "destinatarios"))
    expect(destinatarios, `${etiqueta}/${l}: destinatarios sin Anthropic`).toContain("Anthropic")
    const donde = JSON.stringify(secciones.find((x) => x.id === "donde-no-estan"))
    expect(donde.length).toBeGreaterThan(0)
  }
}

describe("política de privacidad: asistente de propietarios", () => {
  it("sin Meta: la sección está en los cuatro idiomas, con Anthropic como destinatario", () => comprobar(PRIVACIDAD, "base"))
  it("con el píxel (y con la API de conversiones): igual", () => {
    comprobar(variantesConMeta(false).privacidad, "meta")
    comprobar(variantesConMeta(true).privacidad, "meta+capi")
  })
  it("la ancla #asistente que enlaza el chat existe", () => {
    expect(PRIVACIDAD.traducciones.es.secciones.map((s) => s.id)).toContain("asistente")
  })
})
