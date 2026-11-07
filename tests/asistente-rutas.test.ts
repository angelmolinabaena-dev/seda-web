import { createHash, createHmac } from "node:crypto"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { MockLanguageModelV3, simulateReadableStream } from "ai/test"
import { LIMITES } from "@/lib/asistente/config"
import { PRIVACIDAD } from "@/lib/legal/privacidad"

/*
  Las dos rutas del asistente: POST /api/asistente (chat) y
  POST /api/asistente/solicitud (el mini formulario).

  El proveedor de Anthropic se sustituye por un modelo simulado (vi.mock): CI no
  llama a nadie. Lo que se comprueba es la puerta: interruptor, origen, cupos,
  respaldo, saneado de entrada y salida, métricas sin contenido, y que la
  solicitud va al portal por el camino firmado con canal "asistente" y sin
  ninguna cifra.
*/

const SECRETO = "s".repeat(40)
const URL_PORTAL = "https://portal.sedaprivatehomes.com/api/leads/propietario"
let seq = 0

// Lo que el modelo simulado recibe y devuelve en cada prueba.
const llamadas: unknown[] = []
let textoModelo = "La comisión de gestión es un 21% + IVA."
let finModelo: "stop" | "content-filter" = "stop"

vi.mock("@ai-sdk/anthropic", () => ({
  anthropic: () =>
    new MockLanguageModelV3({
      doStream: async (opciones) => {
        llamadas.push(opciones.prompt)
        return {
          stream: simulateReadableStream({
            chunks: [
              { type: "stream-start", warnings: [] },
              ...(textoModelo
                ? [
                    { type: "text-start" as const, id: "t" },
                    ...textoModelo.match(/[\s\S]{1,7}/g)!.map((delta) => ({ type: "text-delta" as const, id: "t", delta })),
                    { type: "text-end" as const, id: "t" },
                  ]
                : []),
              {
                type: "finish",
                finishReason: { unified: finModelo, raw: finModelo === "stop" ? "end_turn" : "refusal" },
                usage: { inputTokens: { total: 5, noCache: 5, cacheRead: 0, cacheWrite: 0 }, outputTokens: { total: 5, text: 5, reasoning: 0 } },
              },
            ],
          }),
        }
      },
    }),
}))

const ui = (role: "user" | "assistant", text: string, i = 0) => ({ id: `m${i}`, role, parts: [{ type: "text", text }] })

function peticionChat(cuerpo: unknown, cab: Record<string, string> = {}) {
  return new Request("https://sedaprivatehomes.com/api/asistente", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://sedaprivatehomes.com",
      "x-forwarded-for": `203.0.113.${(seq += 1) % 250}`,
      ...cab,
    },
    body: typeof cuerpo === "string" ? cuerpo : JSON.stringify(cuerpo),
  })
}

async function leer(resp: Response): Promise<string> {
  return await resp.text()
}

async function rutaChat() {
  vi.resetModules()
  return import("@/app/api/asistente/route")
}

describe("POST /api/asistente", () => {
  let log: { mock: { calls: unknown[][] } }
  beforeEach(() => {
    llamadas.length = 0
    textoModelo = "La comisión de gestión es un 21% + IVA."
    finModelo = "stop"
    log = vi.spyOn(console, "log").mockImplementation(() => {})
    vi.spyOn(console, "error").mockImplementation(() => {})
    vi.stubEnv("SEDA_FLAG_ASISTENTE_PROPIETARIOS", "1")
    vi.stubEnv("ANTHROPIC_API_KEY", "clave-de-prueba")
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  const bueno = (texto = "¿Cuánto cobráis?") => ({ messages: [ui("user", texto)], locale: "es" })

  it.each([undefined, "0", "true"])("interruptor %s → 404 sin llamar al modelo", async (flag) => {
    vi.stubEnv("SEDA_FLAG_ASISTENTE_PROPIETARIOS", flag as string)
    const { POST } = await rutaChat()
    const r = await POST(peticionChat("{roto"))
    expect(r.status).toBe(404)
    expect(llamadas).toHaveLength(0)
  })

  it("otro origen → 403; sin JSON → 415; locale raro → 400", async () => {
    const { POST } = await rutaChat()
    expect((await POST(peticionChat(bueno(), { origin: "https://evil.example" }))).status).toBe(403)
    expect((await POST(peticionChat(bueno(), { "sec-fetch-site": "cross-site" }))).status).toBe(403)
    expect((await POST(peticionChat(bueno(), { "content-type": "text/plain" }))).status).toBe(415)
    expect((await POST(peticionChat({ ...bueno(), locale: "it" }))).status).toBe(400)
    expect(llamadas).toHaveLength(0)
  })

  it("mensaje de más de 1.000 caracteres → 400 sin llamar al modelo", async () => {
    const { POST } = await rutaChat()
    const r = await POST(peticionChat(bueno("x".repeat(LIMITES.caracteresMensaje + 1))))
    expect(r.status).toBe(400)
    expect(await r.json()).toEqual({ ok: false, error: "mensaje_largo" })
    expect(llamadas).toHaveLength(0)
  })

  it("cuerpo demasiado grande → 413", async () => {
    const { POST } = await rutaChat()
    expect((await POST(peticionChat({ ...bueno(), relleno: "x".repeat(LIMITES.bytesPeticion) }))).status).toBe(413)
  })

  it("responde en streaming con el texto del modelo; las instrucciones van como sistema", async () => {
    const { POST } = await rutaChat()
    const r = await POST(peticionChat(bueno()))
    expect(r.status).toBe(200)
    const cuerpo = await leer(r)
    expect(cuerpo).toContain("21% + IVA")
    const prompt = llamadas[0] as { role: string }[]
    expect(prompt[0].role).toBe("system")
    expect(prompt.at(-1)!.role).toBe("user")
  })

  it("datos sensibles: no llegan al modelo y, si el modelo los escribiera, la salida los tapa", async () => {
    textoModelo = "Gracias. Su IBAN ES91 2100 0418 4502 0005 1332 no hace falta."
    const { POST } = await rutaChat()
    const cuerpo = await leer(await POST(peticionChat(bueno("Mi IBAN es ES91 2100 0418 4502 0005 1332"))))
    expect(JSON.stringify(llamadas)).not.toContain("0005 1332")
    expect(cuerpo).not.toContain("0005 1332")
    expect(cuerpo).toContain("[dato retirado]")
  })

  it("las métricas no llevan contenido ni IP", async () => {
    const { POST } = await rutaChat()
    await leer(await POST(peticionChat(bueno("Mi casa está en la calle Secreta 12"))))
    const lineas = log.mock.calls.map((c: unknown[]) => String(c[0])).filter((l: string) => l.includes("asistente.turno"))
    expect(lineas.length).toBeGreaterThan(0)
    for (const l of lineas) {
      expect(l).not.toContain("Secreta")
      expect(l).not.toContain("21%")
      expect(l).not.toMatch(/203\.0\.113/)
    }
  })

  it("el motivo de fin viaja en los metadatos del mensaje: un rechazo llega como «content-filter»", async () => {
    textoModelo = ""
    finModelo = "content-filter"
    const { POST } = await rutaChat()
    const cuerpo = await leer(await POST(peticionChat(bueno())))
    expect(cuerpo).toContain('"finishReason":"content-filter"')
    expect(cuerpo).not.toContain("text-delta")
  })

  it("una respuesta normal lleva «stop»", async () => {
    const { POST } = await rutaChat()
    expect(await leer(await POST(peticionChat(bueno())))).toContain('"finishReason":"stop"')
  })

  it("sin ANTHROPIC_API_KEY → mensaje de respaldo y señal para el formulario, sin llamar al modelo", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "")
    const { POST } = await rutaChat()
    const r = await POST(peticionChat(bueno()))
    expect(r.status).toBe(200)
    expect(r.headers.get("x-asistente-respaldo")).toBe("no_disponible")
    const cuerpo = await leer(r)
    expect(cuerpo).toContain("Déjenos sus datos")
    expect(cuerpo).toContain("data-respaldo")
    expect(llamadas).toHaveLength(0)
  })

  it("límite por conversación → respaldo", async () => {
    const { POST } = await rutaChat()
    const messages = Array.from({ length: LIMITES.turnosPorConversacion * 2 + 1 }, (_, i) => ui(i % 2 ? "assistant" : "user", `m${i}`, i))
    const r = await POST(peticionChat({ messages, locale: "en" }))
    expect(r.headers.get("x-asistente-respaldo")).toBe("limite_conversacion")
    expect(await leer(r)).toContain("Leave us your details")
    expect(llamadas).toHaveLength(0)
  })

  it("límite por visitante → respaldo", async () => {
    const { POST } = await rutaChat()
    const mismo = { "x-forwarded-for": "198.51.100.77" }
    for (let i = 0; i < LIMITES.turnosPorVisitante; i++) await leer(await POST(peticionChat(bueno(), mismo)))
    const r = await POST(peticionChat(bueno(), mismo))
    expect(r.headers.get("x-asistente-respaldo")).toBe("limite_visitante")
  })

  it("tope diario → respaldo en alemán", async () => {
    vi.stubEnv("SEDA_ASISTENTE_TOPE_DIARIO", "1")
    const { POST } = await rutaChat()
    await leer(await POST(peticionChat({ messages: [ui("user", "Hallo")], locale: "de" })))
    const r = await POST(peticionChat({ messages: [ui("user", "Hallo")], locale: "de" }))
    expect(r.headers.get("x-asistente-respaldo")).toBe("tope_diario")
    expect(await leer(r)).toContain("Hinterlassen Sie uns Ihre Daten")
  })
})

/* ── El mini formulario ─────────────────────────────────────────────────── */

const LEAD = { nombre: "Ana Prueba", email: "Ana@Example.com", telefono: "+34 600 123 456", consentimiento: true, locale: "fr", website: "" }

function peticionSolicitud(extra: Record<string, unknown> = {}, cab: Record<string, string> = {}) {
  return new Request("https://sedaprivatehomes.com/api/asistente/solicitud", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://sedaprivatehomes.com",
      referer: "https://sedaprivatehomes.com/fr/propietarios",
      "x-forwarded-for": `192.0.2.${(seq += 1) % 250}`,
      ...cab,
    },
    body: JSON.stringify({ ...LEAD, ...extra }),
  })
}

async function rutaSolicitud() {
  vi.resetModules()
  return import("@/app/api/asistente/solicitud/route")
}

describe("POST /api/asistente/solicitud", () => {
  let fetchMock: ReturnType<typeof vi.fn>
  beforeEach(() => {
    fetchMock = vi.fn(async () => new Response("{}", { status: 201 }))
    vi.stubGlobal("fetch", fetchMock)
    vi.spyOn(console, "error").mockImplementation(() => {})
    vi.spyOn(console, "warn").mockImplementation(() => {})
    vi.stubEnv("SEDA_FLAG_ASISTENTE_PROPIETARIOS", "1")
    vi.stubEnv("SEDA_LEADS_HMAC_SECRET", SECRETO)
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  const enviado = () => {
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    return { url, init, cuerpo: JSON.parse(String(init.body)) as Record<string, unknown> }
  }

  it("interruptor apagado → 404 sin llamar al portal (aunque la calculadora esté encendida)", async () => {
    vi.stubEnv("SEDA_FLAG_ASISTENTE_PROPIETARIOS", "0")
    vi.stubEnv("SEDA_FLAG_CALCULADORA_PROPIETARIOS", "1")
    const { POST } = await rutaSolicitud()
    expect((await POST(peticionSolicitud())).status).toBe(404)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("va al portal firmado, con canal «asistente», el idioma y sin ninguna cifra", async () => {
    const { POST } = await rutaSolicitud()
    expect((await POST(peticionSolicitud())).status).toBe(200)
    const { url, init, cuerpo } = enviado()
    expect(url).toBe(URL_PORTAL)
    expect(cuerpo).toEqual({
      nombre: "Ana Prueba",
      correo: "ana@example.com",
      telefono: "+34600123456",
      municipio: null,
      dormitorios: null,
      consentimiento: true,
      consentimiento_version: PRIVACIDAD.actualizado,
      idioma: "fr",
      canal: "asistente",
    })
    const cab = new Headers(init.headers)
    const ts = cab.get("x-timestamp") ?? ""
    const hash = createHash("sha256").update(String(init.body), "utf8").digest("hex")
    const firma = createHmac("sha256", SECRETO).update(`POST|/api/leads/propietario|${ts}|${hash}`).digest("hex")
    expect(cab.get("authorization")).toBe(`HMAC-Lead ${firma}`)
  })

  it("la carta del QR viaja tal cual", async () => {
    const { POST } = await rutaSolicitud()
    await POST(peticionSolicitud({ carta: "ABCD-EFGH-23" }))
    expect(enviado().cuerpo.carta).toBe("ABCD-EFGH-23")
  })

  it("una cifra en el cuerpo (precio, ocupación, neto) → 400: el chat no manda estimaciones", async () => {
    const { POST } = await rutaSolicitud()
    for (const extra of [{ precioNoche: 150 }, { ocupacionPct: 60 }, { neto: 1 }, { municipio: "Marbella" }]) {
      expect((await POST(peticionSolicitud(extra))).status).toBe(400)
    }
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it.each([false, "true", 1, undefined])("consentimiento %s → 400", async (consentimiento) => {
    const { POST } = await rutaSolicitud()
    const r = await POST(peticionSolicitud({ consentimiento }))
    expect(r.status).toBe(400)
    expect(await r.json()).toEqual({ ok: false, error: "consent_required" })
  })

  it("honeypot relleno → misma respuesta, sin enviar", async () => {
    const { POST } = await rutaSolicitud()
    expect((await POST(peticionSolicitud({ website: "https://spam.example" }))).status).toBe(200)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("teléfono sin prefijo reconocible → 400 phone_needs_prefix", async () => {
    const { POST } = await rutaSolicitud()
    const r = await POST(peticionSolicitud({ telefono: "12345" }))
    expect(await r.json()).toEqual({ ok: false, error: "phone_needs_prefix" })
  })

  it("otro origen → 403", async () => {
    const { POST } = await rutaSolicitud()
    expect((await POST(peticionSolicitud({}, { origin: "https://evil.example" }))).status).toBe(403)
  })

  it("400 del portal → 422 rejected_data; 5xx → 502", async () => {
    const { POST } = await rutaSolicitud()
    fetchMock.mockResolvedValueOnce(new Response("{}", { status: 400 }))
    expect((await POST(peticionSolicitud())).status).toBe(422)
    fetchMock.mockResolvedValueOnce(new Response("{}", { status: 500 }))
    expect((await POST(peticionSolicitud())).status).toBe(502)
  })

  it("sin secreto → 503 sin llamar al portal", async () => {
    vi.stubEnv("SEDA_LEADS_HMAC_SECRET", "corto")
    const { POST } = await rutaSolicitud()
    expect((await POST(peticionSolicitud())).status).toBe(503)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("Meta: con el píxel apagado no hay event_id ni llamada a Meta", async () => {
    const { POST } = await rutaSolicitud()
    const r = await POST(peticionSolicitud({}, { "x-consent-marketing": "1" }))
    expect(await r.json()).toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
