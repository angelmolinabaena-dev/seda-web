import { isValidElement, type ReactElement, type ReactNode } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { NextIntlClientProvider } from "next-intl"
import { afterEach, describe, expect, it, vi } from "vitest"
import { routing } from "@/i18n/routing"
import { AsistentePropietarios } from "@/components/asistente/asistente-propietarios"
import { montarAsistente } from "@/components/asistente/montar-asistente"
import { PRIVACIDAD } from "@/lib/legal/privacidad"
import { RUTAS_BOTID } from "@/lib/asistente/config"

/*
  ASISTENTE-EN-PORTADA: el botón del asistente también está en la portada y en
  founding-owners, solo con SEDA_FLAG_ASISTENTE_PROPIETARIOS=1. Apagado, esas
  páginas no llevan nada (la comparación byte a byte del HTML está en el PR).
*/

vi.mock("next-intl/server", () => ({
  setRequestLocale: () => {},
  getTranslations: async () => (clave: string) => clave,
}))
vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children }: { href: string; children: ReactNode }) => <a href={href}>{children}</a>,
  usePathname: () => "/",
  useRouter: () => ({}),
}))
// El botón llama a initBotId al montarse (useEffect); renderToStaticMarkup no ejecuta efectos, pero se importa el módulo.
vi.mock("botid/client/core", () => ({ initBotId: () => {} }))

afterEach(() => vi.unstubAllEnvs())

function elementos(nodo: ReactNode, salida: ReactElement[] = []): ReactElement[] {
  if (Array.isArray(nodo)) nodo.forEach((n) => elementos(n, salida))
  else if (isValidElement(nodo)) {
    salida.push(nodo)
    elementos((nodo.props as { children?: ReactNode }).children, salida)
  }
  return salida
}

const entidades = (s: string) => s.replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&")

async function boton(locale: string, variante?: "portada" | "propietarios") {
  const mensajes = (await import(`@/messages/${locale}.json`)).default
  return renderToStaticMarkup(
    <NextIntlClientProvider locale={locale} messages={mensajes}>
      <AsistentePropietarios variante={variante} />
    </NextIntlClientProvider>,
  )
}

describe("montarAsistente (interruptor SEDA_FLAG_ASISTENTE_PROPIETARIOS)", () => {
  it.each([[undefined], ["0"], [""], ["true"], ["yes"]])("flag %j → null: la página queda como hoy", async (v) => {
    if (v !== undefined) vi.stubEnv("SEDA_FLAG_ASISTENTE_PROPIETARIOS", v)
    else vi.stubEnv("SEDA_FLAG_ASISTENTE_PROPIETARIOS", "")
    expect(await montarAsistente("portada")).toBeNull()
    expect(await montarAsistente("propietarios")).toBeNull()
  })
  it("flag a «1» → el botón, con su variante", async () => {
    vi.stubEnv("SEDA_FLAG_ASISTENTE_PROPIETARIOS", "1")
    const p = (await montarAsistente("portada")) as ReactElement
    expect(p.type).toBe(AsistentePropietarios)
    expect(p.props).toEqual({ variante: "portada" })
    expect(((await montarAsistente("propietarios")) as ReactElement).props).toEqual({ variante: "propietarios" })
  })
})

describe("las páginas", () => {
  async function arbolPortada() {
    const { default: Page } = await import("@/app/[locale]/page")
    return Page({ params: Promise.resolve({ locale: "es" }) }) as Promise<ReactElement>
  }
  async function arbolFounding() {
    const { default: Page } = await import("@/app/[locale]/founding-owners/page")
    return Page({ params: Promise.resolve({ locale: "es" }) }) as Promise<ReactElement>
  }
  it("portada y founding-owners, apagado: no hay botón en el árbol", async () => {
    vi.stubEnv("SEDA_FLAG_ASISTENTE_PROPIETARIOS", "")
    for (const arbol of [await arbolPortada(), await arbolFounding()]) {
      expect(elementos(arbol).some((e) => e.type === AsistentePropietarios)).toBe(false)
      expect(JSON.stringify(arbol)).not.toContain("asistente")
    }
  })
  it("portada, encendido: botón de variante «portada»", async () => {
    vi.stubEnv("SEDA_FLAG_ASISTENTE_PROPIETARIOS", "1")
    const b = elementos(await arbolPortada()).find((e) => e.type === AsistentePropietarios)
    expect((b?.props as { variante: string }).variante).toBe("portada")
  })
  it("founding-owners, encendido: botón de variante «propietarios»", async () => {
    vi.stubEnv("SEDA_FLAG_ASISTENTE_PROPIETARIOS", "1")
    const b = elementos(await arbolFounding()).find((e) => e.type === AsistentePropietarios)
    expect((b?.props as { variante: string }).variante).toBe("propietarios")
  })
})

describe.each(routing.locales)("botón (%s)", (locale) => {
  it("portada: dice para quién es y tiene nombre accesible completo", async () => {
    const m = (await import(`@/messages/${locale}.json`)).default.asistente as Record<string, string>
    const html = entidades(await boton(locale, "portada"))
    expect(html).toContain(`>${m.abrir_portada}</button>`)
    expect(html).toContain(`aria-label="${m.abrir_portada_aria}"`)
    expect(m.abrir_portada_aria.toLowerCase()).toContain(m.abrir_portada.replace(/[?¿]/g, "").toLowerCase().split(" ")[0])
    expect(html).not.toContain(`>${m.abrir}</button>`)
  })
  it("propietarios (por defecto): el texto de siempre, sin aria-label", async () => {
    const m = (await import(`@/messages/${locale}.json`)).default.asistente as Record<string, string>
    for (const v of [undefined, "propietarios" as const]) {
      const html = entidades(await boton(locale, v))
      expect(html).toContain(`>${m.abrir}</button>`)
      expect(html).not.toContain("aria-label")
    }
  })
})

describe("lo que necesita el asistente en cualquier página", () => {
  it("BotID protege las dos rutas del asistente y el componente lo inicia (no depende de la página)", async () => {
    expect(RUTAS_BOTID.map((r) => r.path)).toEqual(["/api/asistente", "/api/asistente/solicitud"])
    const { readFileSync } = await import("node:fs")
    const src = readFileSync("components/asistente/asistente-propietarios.tsx", "utf8")
    expect(src).toContain("initBotId({ protect: RUTAS_BOTID })")
  })
  it("la privacidad nombra la portada y founding-owners en los cuatro idiomas", () => {
    const FRASE = {
      es: /portada, en \/propietarios, en \/founding-owners/,
      en: /home page, on \/propietarios, on \/founding-owners/,
      fr: /page d'accueil, sur \/propietarios, sur \/founding-owners/,
      de: /Startseite, auf \/propietarios, auf \/founding-owners/,
    } as const
    for (const l of routing.locales) {
      const s = PRIVACIDAD.traducciones[l].secciones.find((x) => x.id === "asistente")
      expect(JSON.stringify(s), l).toMatch(FRASE[l])
    }
  })
})
