import { renderToStaticMarkup } from "react-dom/server"
import { NextIntlClientProvider } from "next-intl"
import { describe, expect, it, vi } from "vitest"
import { routing } from "@/i18n/routing"

/*
  MOT-M11 (REA-MOTOR): el aviso de IA del panel —«soy una inteligencia
  artificial, no una persona», art. 50 del Reglamento (UE) 2024/1689— es la
  descripción accesible del diálogo (`aria-describedby`), así que un lector de
  pantalla lo anuncia al abrir el chat.

  MOT-M12: el texto del mini formulario decía «La conversación no se envía ni se
  guarda», y sí se envía (a Anthropic, que la conserva hasta 30 días). Ahora dice
  lo que es verdad: no viaja con el formulario y a SEDA no le llega.

  Se pinta el panel real con react-dom/server; solo se simula el enlace de
  next-intl (necesita el enrutador de Next).
*/

vi.mock("@/i18n/navigation", () => ({ Link: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a> }))

async function pintar(locale: string) {
  const { default: AsistentePanel } = await import("@/components/asistente/asistente-panel")
  const mensajes = (await import(`@/messages/${locale}.json`)).default
  return {
    html: renderToStaticMarkup(
      <NextIntlClientProvider locale={locale} messages={mensajes}>
        <AsistentePanel carta={() => null} abierto onCerrar={() => {}} />
      </NextIntlClientProvider>,
    ),
    mensajes: mensajes as { asistente: Record<string, string> },
  }
}

const entidades = (s: string) => s.replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&")

describe.each(routing.locales)("panel del asistente — %s", (locale) => {
  it("MOT-M11: el diálogo se describe con el aviso de IA", async () => {
    const { html, mensajes } = await pintar(locale)
    const describe = /role="dialog"[^>]*aria-describedby="([^"]+)"/.exec(html)?.[1]
    expect(describe).toBeTruthy()
    const aviso = new RegExp(`<p id="${describe!.replace(/[:]/g, "\\:")}"[^>]*>([^<]+)</p>`).exec(html)?.[1]
    expect(entidades(aviso ?? "")).toBe(mensajes.asistente.bienvenida)
  })
})

describe("MOT-M12: el texto del formulario no dice que la conversación no se envía", () => {
  const VIAJA = {
    es: "a SEDA no le llega",
    en: "it never reaches SEDA",
    fr: "elle n'arrive pas à SEDA",
    de: "Es erreicht SEDA nicht",
  } as const
  it.each(Object.entries(VIAJA))("%s", async (locale, frase) => {
    const { asistente } = (await import(`@/messages/${locale}.json`)).default as { asistente: Record<string, string> }
    expect(asistente.form_cuerpo).toContain(frase)
    expect(asistente.form_cuerpo).not.toMatch(/no se envía|neither sent|ni envoyée|weder gesendet/)
  })
})
