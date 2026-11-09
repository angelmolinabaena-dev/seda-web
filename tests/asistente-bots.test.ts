import { readFileSync } from "node:fs"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"
import { RUTAS_BOTID } from "@/lib/asistente/config"

/*
  MOT-11 (REA-MOTOR §8.6), «no hay protección contra bots»: Vercel BotID en
  POST /api/asistente y POST /api/asistente/solicitud.

  `checkBotId` se simula (en local y en CI BotID siempre responde «humano»):
  lo que se comprueba es que la puerta lo consulta y que un bot recibe 403 sin
  llegar al modelo ni al portal; que si BotID falla, la petición pasa; y que el
  navegador protege exactamente esas dos rutas.
*/

let veredicto: "bot" | "humano" | "error" = "humano"
const consultas: Record<string, unknown>[] = []

vi.mock("botid/server", () => ({
  checkBotId: async (opciones: { advancedOptions?: { headers?: Record<string, unknown> } }) => {
    consultas.push(opciones.advancedOptions?.headers ?? {})
    if (veredicto === "error") throw new Error("botid caído")
    return { isBot: veredicto === "bot", isHuman: veredicto === "humano", isVerifiedBot: false, bypassed: false }
  },
}))

const modelo = vi.fn()
vi.mock("@ai-sdk/anthropic", () => ({ anthropic: () => modelo() }))

const cab = { "content-type": "application/json", origin: "https://sedaprivatehomes.com", "x-forwarded-for": "203.0.113.9" }

describe("BotID en las rutas del asistente", () => {
  let fetchMock: ReturnType<typeof vi.fn>
  beforeEach(() => {
    veredicto = "humano"
    consultas.length = 0
    modelo.mockReset()
    fetchMock = vi.fn(async () => new Response("{}", { status: 201 }))
    vi.stubGlobal("fetch", fetchMock)
    vi.spyOn(console, "log").mockImplementation(() => {})
    vi.spyOn(console, "error").mockImplementation(() => {})
    vi.stubEnv("SEDA_FLAG_ASISTENTE_PROPIETARIOS", "1")
    vi.stubEnv("ANTHROPIC_API_KEY", "clave")
    vi.stubEnv("SEDA_LEADS_HMAC_SECRET", "s".repeat(40))
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  const chat = () =>
    new Request("https://sedaprivatehomes.com/api/asistente", {
      method: "POST",
      headers: { ...cab, "x-is-human": "{}" },
      body: JSON.stringify({ messages: [{ id: "1", role: "user", parts: [{ type: "text", text: "Hola" }] }], locale: "es" }),
    })
  const solicitud = () =>
    new Request("https://sedaprivatehomes.com/api/asistente/solicitud", {
      method: "POST",
      headers: cab,
      body: JSON.stringify({ nombre: "Ana", email: "ana@example.com", consentimiento: true, locale: "es", website: "" }),
    })

  it("chat: un bot → 403 sin leer el cuerpo ni llamar al modelo", async () => {
    veredicto = "bot"
    const { POST } = await import("@/app/api/asistente/route")
    const r = await POST(chat())
    expect(r.status).toBe(403)
    expect(await r.json()).toEqual({ ok: false, error: "forbidden" })
    expect(modelo).not.toHaveBeenCalled()
    expect(consultas[0]["x-is-human"]).toBe("{}") // las cabeceras de la petición llegan a BotID
  })

  it("solicitud: un bot → 403 sin llamar al portal", async () => {
    veredicto = "bot"
    const { POST } = await import("@/app/api/asistente/solicitud/route")
    const r = await POST(solicitud())
    expect(r.status).toBe(403)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("interruptor apagado: 404 antes de consultar a BotID", async () => {
    vi.stubEnv("SEDA_FLAG_ASISTENTE_PROPIETARIOS", "0")
    const { POST } = await import("@/app/api/asistente/route")
    expect((await POST(chat())).status).toBe(404)
    expect(consultas).toHaveLength(0)
  })

  it("si BotID falla, la petición pasa (los cupos y el Firewall siguen delante)", async () => {
    veredicto = "error"
    const { POST } = await import("@/app/api/asistente/solicitud/route")
    expect((await POST(solicitud())).status).not.toBe(403)
    expect(fetchMock).toHaveBeenCalled()
  })
})

describe("BotID en el navegador y en el enrutado", () => {
  it("protege exactamente las dos rutas del asistente, por POST", () => {
    expect(RUTAS_BOTID).toEqual([
      { path: "/api/asistente", method: "POST" },
      { path: "/api/asistente/solicitud", method: "POST" },
    ])
  })

  it("se inicia en el componente del asistente (solo con el interruptor), no en todas las páginas", () => {
    // Desde ASISTENTE-EN-PORTADA la llamada vive en lib/asistente/botid-cliente.ts y el componente la dispara al primer hover/foco/clic.
    expect(readFileSync("lib/asistente/botid-cliente.ts", "utf8")).toMatch(/initBotId\(\{ protect: RUTAS_BOTID \}\)/)
    expect(readFileSync("components/asistente/asistente-propietarios.tsx", "utf8")).toMatch(/iniciarBotIdUnaVez\(\)/)
    expect(() => readFileSync("instrumentation-client.ts", "utf8")).toThrow()
    expect(readFileSync("next.config.mjs", "utf8")).toMatch(/withBotId\(withNextIntl\(nextConfig\)\)/)
  })

  it("proxy.ts no pasa por next-intl las rutas de BotID (sin redirección a /es/…)", async () => {
    const { proxy, proxyConfig } = await import("../proxy")
    const r = proxy(new NextRequest("https://sedaprivatehomes.com/149e9513-01fa-4fb0-aad4-566afd725d1b/2d206a39-8ed7-437e-a3be-862e0f06eea3/p"))
    expect(r.headers.get("location")).toBeNull()
    expect(r.headers.get("x-middleware-next")).toBe("1")
    expect(proxyConfig.matcher[0]).toContain("149e9513-01fa-4fb0-aad4-566afd725d1b")
  })
})
