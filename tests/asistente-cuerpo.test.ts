import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { MockLanguageModelV3, simulateReadableStream } from "ai/test"
import { Chat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { LIMITES } from "@/lib/asistente/config"
import { cuerpoPeticion, mensajesParaEnviar } from "@/lib/asistente/peticion"

/*
  MOT-11 (REA-MOTOR, §8.6): «el navegador reenvía la conversación entera con las
  salidas de las herramientas y la ruta corta en 32 KB».

  Reproducción con las piezas reales: el `Chat` del AI SDK (lo mismo que hay
  debajo de `useChat`) con el `DefaultChatTransport` del panel, contra el
  POST /api/asistente de verdad. Solo el modelo es simulado: en cada turno pide
  `servicio` y `estimar` (las dos salidas más grandes) y luego contesta unos
  900 caracteres. Las herramientas se ejecutan de verdad.

  Medido el 8-nov-2026 sin recortar: 244 B, 6,3 KB, 12,3 KB, 18,3 KB, 24,3 KB,
  30,4 KB y, en el turno 7, 36,4 KB → 413; desde ahí, 413 en todos los turnos.
  Con una sola herramienta por turno, el 413 llegaba en el turno 11 (35,6 KB).
*/

const llamadas: string[] = []

vi.mock("@ai-sdk/anthropic", () => ({
  anthropic: () =>
    new MockLanguageModelV3({
      doStream: async (opciones) => {
        llamadas.push(JSON.stringify(opciones.prompt))
        const ultimo = opciones.prompt.at(-1) as { role: string }
        const turno = opciones.prompt.filter((m) => (m as { role: string }).role === "user").length
        const usage = { inputTokens: { total: 5, noCache: 5, cacheRead: 0, cacheWrite: 0 }, outputTokens: { total: 5, text: 5, reasoning: 0 } }
        if (ultimo.role !== "tool") {
          return {
            stream: simulateReadableStream({
              chunks: [
                { type: "stream-start", warnings: [] },
                { type: "tool-call", toolCallId: `a${turno}`, toolName: "servicio", input: "{}" },
                { type: "tool-call", toolCallId: `b${turno}`, toolName: "estimar", input: JSON.stringify({ precioNoche: 180, ocupacionPct: 65 }) },
                { type: "finish", finishReason: { unified: "tool-calls", raw: "tool_use" }, usage },
              ],
            }),
          }
        }
        const texto = `Respuesta ${turno}. Según lo publicado en la web, `.padEnd(900, "la gestión incluye limpieza y atención al huésped. ")
        return {
          stream: simulateReadableStream({
            chunks: [
              { type: "stream-start", warnings: [] },
              { type: "text-start", id: "t" },
              { type: "text-delta", id: "t", delta: texto },
              { type: "text-end", id: "t" },
              { type: "finish", finishReason: { unified: "stop", raw: "end_turn" }, usage },
            ],
          }),
        }
      },
    }),
}))

type Medida = { bytes: number; status: number; respaldo: string | null }

async function conversar(turnos: number, recortar: boolean) {
  vi.resetModules()
  const { POST } = await import("@/app/api/asistente/route")
  const medidas: Medida[] = []
  const chat = new Chat({
    transport: new DefaultChatTransport({
      api: "https://sedaprivatehomes.com/api/asistente",
      body: { locale: "es" },
      ...(recortar ? { prepareSendMessagesRequest: cuerpoPeticion } : {}),
      fetch: async (url, init) => {
        const r = await POST(
          new Request(String(url), { ...init, headers: { ...(init!.headers as Record<string, string>), origin: "https://sedaprivatehomes.com" } }),
        )
        medidas.push({ bytes: new TextEncoder().encode(String(init!.body)).length, status: r.status, respaldo: r.headers.get("x-asistente-respaldo") })
        return r
      },
    }),
  })
  for (let i = 0; i < turnos; i++) {
    await chat.sendMessage({ text: `Pregunta ${i + 1}: ¿cómo funciona el servicio y cuánto me quedaría con 180 € la noche y un 65 % de ocupación?` })
  }
  return { medidas, chat }
}

describe("MOT-11: el cuerpo de la petición del chat", () => {
  beforeEach(() => {
    llamadas.length = 0
    vi.spyOn(console, "log").mockImplementation(() => {})
    vi.spyOn(console, "error").mockImplementation(() => {})
    vi.stubEnv("SEDA_FLAG_ASISTENTE_PROPIETARIOS", "1")
    vi.stubEnv("ANTHROPIC_API_KEY", "clave-de-prueba")
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it("reproducción: sin recortar, 8 turnos con servicio y estimar pasan de 32 KB y la ruta da 413", async () => {
    const { medidas } = await conversar(8, false)
    const primero = medidas.findIndex((m) => m.status === 413)
    expect(primero).toBeGreaterThan(0)
    expect(primero).toBeLessThan(8)
    expect(medidas[primero].bytes).toBeGreaterThan(LIMITES.bytesPeticion)
    expect(medidas.slice(primero).every((m) => m.status === 413)).toBe(true) // el chat queda roto
  })

  it("con cuerpoPeticion (el del panel): 15 turnos, todos 200 y lejos de 32 KB", async () => {
    const { medidas, chat } = await conversar(LIMITES.turnosPorConversacion, true)
    expect(medidas.map((m) => m.status)).toEqual(Array(LIMITES.turnosPorConversacion).fill(200))
    expect(medidas.every((m) => m.respaldo === null)).toBe(true)
    expect(Math.max(...medidas.map((m) => m.bytes))).toBeLessThan(LIMITES.bytesPeticion / 2)
    // Y el navegador sigue pintando las herramientas: el recorte es solo de lo que se envía.
    expect(chat.messages.at(-1)!.parts.some((p) => p.type === "tool-estimar")).toBe(true)
  })

  it("el límite por conversación sigue contando: el turno 16 recibe el respaldo", async () => {
    const { medidas } = await conversar(LIMITES.turnosPorConversacion + 1, true)
    expect(medidas.at(-1)!.respaldo).toBe("limite_conversacion")
  })

  it("el modelo recibe exactamente lo mismo con y sin recorte", async () => {
    await conversar(5, false)
    const sin = [...llamadas]
    llamadas.length = 0
    await conversar(5, true)
    expect(llamadas).toEqual(sin)
  })
})

describe("mensajesParaEnviar", () => {
  const herramienta = { type: "tool-servicio", toolCallId: "x", state: "output-available", input: {}, output: { preguntasFrecuentes: "x".repeat(5000) } }

  it("solo texto: tira herramientas, razonamiento y step-start", () => {
    const r = mensajesParaEnviar([
      { id: "1", role: "user", parts: [{ type: "text", text: "Hola" }] },
      { id: "2", role: "assistant", parts: [{ type: "step-start" }, herramienta, { type: "reasoning", text: "pienso" }, { type: "text", text: "Buenas" }] },
    ])
    expect(r).toEqual([
      { id: "1", role: "user", parts: [{ type: "text", text: "Hola" }] },
      { id: "2", role: "assistant", parts: [{ type: "text", text: "Buenas" }] },
    ])
  })

  it("corta la respuesta previa a lo que el servidor reenvía y vacía lo que queda fuera de la ventana", () => {
    const largo = Array.from({ length: 20 }, (_, i) => ({ id: String(i), role: i % 2 ? "assistant" : "user", parts: [{ type: "text", text: "y".repeat(3000) }] }))
    const r = mensajesParaEnviar(largo)
    expect(r).toHaveLength(20) // ninguno se pierde: el servidor los cuenta
    const fuera = r.slice(0, 20 - LIMITES.mensajesHistorial)
    expect(fuera.every((m) => m.parts[0].text === "")).toBe(true)
    for (const m of r.slice(-LIMITES.mensajesHistorial)) {
      expect(m.parts[0].text.length).toBe(m.role === "user" ? LIMITES.caracteresMensaje : LIMITES.caracteresRespuestaPrevia)
    }
  })

  it("descarta papeles que no son de la persona ni del asistente", () => {
    expect(mensajesParaEnviar([{ id: "s", role: "system", parts: [{ type: "text", text: "x" }] }])).toEqual([])
  })
})
