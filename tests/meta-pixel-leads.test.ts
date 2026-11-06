import { createHash } from "node:crypto"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cuerpoLeadCapi, enviarLeadCapi, identificadoresDeCookie } from "../lib/meta-capi"
import { crearPixel, type DocumentoMeta, type VentanaMeta } from "../lib/meta-pixel-cliente"

/*
  El Lead de la calculadora: píxel (navegador) y API de conversiones (servidor).

  Reglas que se prueban, todas del encargo:
    · Lead SOLO cuando seda_os responde 201. Con 200 (u otro 2xx), no hay evento.
    · Sin el consentimiento de marketing en la petición, la API de conversiones no
      se llama y la respuesta no lleva event_id.
    · El event_id que ve el navegador es el que recibe Meta desde el servidor
      (deduplicación).
    · Ni correo ni teléfono ni nombre llegan a Meta, ni siquiera con hash.
    · Con SEDA_FLAG_META_PIXEL apagado la ruta responde exactamente lo de siempre.

  La comprobación de «ni con hash» se hace con un SHA-256 calculado aquí con
  node:crypto, no con ninguna función del código que se prueba.
*/

type Route = typeof import("@/app/api/leads/propietario/route")
let seq = 0
const ipNueva = () => `198.51.100.${(seq += 1)}`

async function cargarRuta(): Promise<Route> {
  vi.resetModules()
  return import("@/app/api/leads/propietario/route")
}

const LEAD = {
  nombre: "María García",
  email: "maria@example.com",
  telefono: "+34 600 123 456",
  consentimiento: true,
  locale: "es",
  municipio: "Estepona",
  dormitorios: 3,
  precioNoche: 200,
  ocupacionPct: 50,
  website: "",
}

function peticion(cabeceras: Record<string, string> = {}) {
  return new Request("https://sedaprivatehomes.com/api/leads/propietario", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://sedaprivatehomes.com",
      referer: "https://sedaprivatehomes.com/en/propietarios/calculadora?utm=x#hash",
      "user-agent": "Mozilla/5.0 (prueba)",
      "x-forwarded-for": ipNueva(),
      ...cabeceras,
    },
    body: JSON.stringify(LEAD),
  })
}

const SECRETO = "secreto-de-prueba-de-seda-web-no-es-real-0123456789"
const ID_PIXEL = "123456789012345"
const TOKEN_CAPI = "EAAB-token-de-prueba-" + "z".repeat(40) // de relleno; no es de ningún entorno
const URL_PORTAL = "https://portal.sedaprivatehomes.com/api/leads/propietario"
const URL_META = `https://graph.facebook.com/v23.0/${ID_PIXEL}/events`

describe("el Lead de la calculadora (píxel + API de conversiones)", () => {
  let fetchMock: ReturnType<typeof vi.fn>
  let estadoPortal: number

  const llamadasA = (url: string) => fetchMock.mock.calls.filter(([u]) => u === url) as [string, RequestInit][]

  beforeEach(() => {
    estadoPortal = 201
    fetchMock = vi.fn(async (url: string) => {
      if (url === URL_PORTAL) return new Response("{}", { status: estadoPortal })
      if (url === URL_META) return new Response('{"events_received":1}', { status: 200 })
      throw new Error(`petición inesperada a ${url}`)
    })
    vi.stubGlobal("fetch", fetchMock)
    vi.spyOn(console, "error").mockImplementation(() => {})
    vi.spyOn(console, "warn").mockImplementation(() => {})
    vi.stubEnv("SEDA_FLAG_CALCULADORA_PROPIETARIOS", "1")
    vi.stubEnv("SEDA_LEADS_HMAC_SECRET", SECRETO)
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  function encenderPixel(conCapi: boolean) {
    vi.stubEnv("SEDA_FLAG_META_PIXEL", "1")
    vi.stubEnv("NEXT_PUBLIC_META_PIXEL_ID", ID_PIXEL)
    if (conCapi) {
      vi.stubEnv("SEDA_FLAG_META_CAPI", "1")
      vi.stubEnv("META_CAPI_TOKEN", TOKEN_CAPI)
    }
  }

  describe("con SEDA_FLAG_META_PIXEL apagado: la ruta es la de siempre", () => {
    it.each([[undefined], ["0"], ["true"]])("flag %j: responde exactamente { ok: true }, aunque el navegador mande el consentimiento", async (flag) => {
      vi.stubEnv("SEDA_FLAG_META_PIXEL", flag as unknown as string)
      vi.stubEnv("NEXT_PUBLIC_META_PIXEL_ID", ID_PIXEL)
      vi.stubEnv("SEDA_FLAG_META_CAPI", "1")
      vi.stubEnv("META_CAPI_TOKEN", TOKEN_CAPI)
      const { POST } = await cargarRuta()
      const r = await POST(peticion({ "x-consent-marketing": "1" }))
      expect(r.status).toBe(200)
      expect(await r.json()).toEqual({ ok: true })
      expect(llamadasA(URL_META)).toHaveLength(0)
      expect(fetchMock).toHaveBeenCalledTimes(1) // solo el portal
    })
  })

  describe("sin consentimiento de marketing: nada hacia Meta", () => {
    it("sin la cabecera → { ok: true } sin event_id y ninguna llamada a Meta (CAPI encendida)", async () => {
      encenderPixel(true)
      const { POST } = await cargarRuta()
      const r = await POST(peticion())
      expect(await r.json()).toEqual({ ok: true })
      await new Promise((ok) => setTimeout(ok, 20))
      expect(llamadasA(URL_META)).toHaveLength(0)
    })

    it.each([["0"], [""], ["true"], ["yes"]])("cabecera x-consent-marketing = %j → tampoco (solo vale «1»)", async (valor) => {
      encenderPixel(true)
      const { POST } = await cargarRuta()
      const r = await POST(peticion({ "x-consent-marketing": valor }))
      expect(await r.json()).toEqual({ ok: true })
      await new Promise((ok) => setTimeout(ok, 20))
      expect(llamadasA(URL_META)).toHaveLength(0)
    })
  })

  describe("Lead solo cuando seda_os responde 201", () => {
    it("201 + consentimiento → { ok: true, lead: { event_id } } con un UUID", async () => {
      encenderPixel(false)
      const { POST } = await cargarRuta()
      const r = await POST(peticion({ "x-consent-marketing": "1" }))
      expect(r.status).toBe(200)
      const cuerpo = (await r.json()) as { ok: boolean; lead: { event_id: string } }
      expect(cuerpo.ok).toBe(true)
      expect(cuerpo.lead.event_id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    })

    it.each([[200], [202]])("el portal responde %i (2xx pero no 201) → el lead se crea, pero NO hay event_id ni evento", async (estado) => {
      estadoPortal = estado
      encenderPixel(true)
      const { POST } = await cargarRuta()
      const r = await POST(peticion({ "x-consent-marketing": "1" }))
      expect(r.status).toBe(200)
      expect(await r.json()).toEqual({ ok: true })
      await new Promise((ok) => setTimeout(ok, 20))
      expect(llamadasA(URL_META)).toHaveLength(0)
    })

    it.each([[400], [401], [429], [500], [503]])("el portal responde %i → error para el visitante y ningún Lead", async (estado) => {
      estadoPortal = estado
      encenderPixel(true)
      const { POST } = await cargarRuta()
      const r = await POST(peticion({ "x-consent-marketing": "1" }))
      expect(r.status).toBeGreaterThanOrEqual(400)
      const cuerpo = (await r.json()) as Record<string, unknown>
      expect(cuerpo).not.toHaveProperty("lead")
      await new Promise((ok) => setTimeout(ok, 20))
      expect(llamadasA(URL_META)).toHaveLength(0)
    })

    it("la red al portal caída → 502 y ningún Lead", async () => {
      encenderPixel(true)
      fetchMock.mockImplementation(async () => {
        throw new Error("ECONNRESET")
      })
      const { POST } = await cargarRuta()
      const r = await POST(peticion({ "x-consent-marketing": "1" }))
      expect(r.status).toBe(502)
      expect(llamadasA(URL_META)).toHaveLength(0)
    })

    it("el honeypot relleno no genera Lead", async () => {
      encenderPixel(true)
      const { POST } = await cargarRuta()
      const req = new Request("https://sedaprivatehomes.com/api/leads/propietario", {
        method: "POST",
        headers: { "content-type": "application/json", origin: "https://sedaprivatehomes.com", "x-forwarded-for": ipNueva(), "x-consent-marketing": "1" },
        body: JSON.stringify({ ...LEAD, website: "http://spam.example" }),
      })
      const r = await POST(req)
      expect(await r.json()).toEqual({ ok: true })
      expect(fetchMock).not.toHaveBeenCalled()
    })
  })

  describe("API de conversiones: el mismo Lead desde el servidor", () => {
    it("201 + consentimiento + CAPI encendida → UNA llamada a Meta con el MISMO event_id que ve el navegador", async () => {
      encenderPixel(true)
      const { POST } = await cargarRuta()
      const r = await POST(peticion({ "x-consent-marketing": "1" }))
      const { lead } = (await r.json()) as { lead: { event_id: string } }

      await vi.waitFor(() => expect(llamadasA(URL_META)).toHaveLength(1))
      const [url, init] = llamadasA(URL_META)[0]
      expect(url).toBe(`https://graph.facebook.com/v23.0/${ID_PIXEL}/events`)
      expect(init.method).toBe("POST")
      const cuerpo = JSON.parse(String(init.body)) as { data: Record<string, unknown>[]; access_token: string }
      expect(cuerpo.data).toHaveLength(1)
      expect(cuerpo.data[0].event_id).toBe(lead.event_id)
      expect(cuerpo.data[0].event_name).toBe("Lead")
      expect(cuerpo.data[0].action_source).toBe("website")
      expect(cuerpo.access_token).toBe(TOKEN_CAPI)
    })

    it("el token va en el cuerpo, no en la URL ni en los logs", async () => {
      encenderPixel(true)
      const { POST } = await cargarRuta()
      await POST(peticion({ "x-consent-marketing": "1" }))
      await vi.waitFor(() => expect(llamadasA(URL_META)).toHaveLength(1))
      expect(llamadasA(URL_META)[0][0]).not.toContain(TOKEN_CAPI)
      const log = JSON.stringify([...(console.error as ReturnType<typeof vi.fn>).mock.calls, ...(console.warn as ReturnType<typeof vi.fn>).mock.calls])
      expect(log).not.toContain(TOKEN_CAPI)
    })

    it("el evento lleva exactamente los campos esperados y la IP y el navegador del visitante; la URL, sin query ni hash", async () => {
      encenderPixel(true)
      const { POST } = await cargarRuta()
      const ip = ipNueva()
      await POST(peticion({ "x-consent-marketing": "1", "x-forwarded-for": ip, cookie: "_fbp=fb.1.1596403881668.1116446470; _fbc=fb.1.1554763741205.AbCdEfGhIjK" }))
      await vi.waitFor(() => expect(llamadasA(URL_META)).toHaveLength(1))
      const { data } = JSON.parse(String(llamadasA(URL_META)[0][1].body)) as { data: Record<string, unknown>[] }
      const e = data[0]
      expect(Object.keys(e).sort()).toEqual(["action_source", "event_id", "event_name", "event_source_url", "event_time", "user_data"])
      expect(e.event_source_url).toBe("https://sedaprivatehomes.com/en/propietarios/calculadora")
      expect(Math.abs((e.event_time as number) - Date.now() / 1000)).toBeLessThan(10)
      expect(e.user_data).toEqual({
        client_ip_address: ip,
        client_user_agent: "Mozilla/5.0 (prueba)",
        fbp: "fb.1.1596403881668.1116446470",
        fbc: "fb.1.1554763741205.AbCdEfGhIjK",
      })
    })

    it("NI correo NI teléfono NI nombre llegan a Meta, ni siquiera con hash (SHA-256 calculado aquí)", async () => {
      encenderPixel(true)
      const { POST } = await cargarRuta()
      await POST(peticion({ "x-consent-marketing": "1" }))
      await vi.waitFor(() => expect(llamadasA(URL_META)).toHaveLength(1))
      const enviado = String(llamadasA(URL_META)[0][1].body)
      const sha = (s: string) => createHash("sha256").update(s, "utf8").digest("hex")
      for (const dato of ["maria@example.com", "María García", "maria", "García", "+34600123456", "+34 600 123 456", "34600123456", "600123456", "Estepona"]) {
        expect(enviado.toLowerCase(), dato).not.toContain(dato.toLowerCase())
        expect(enviado, `hash de ${dato}`).not.toContain(sha(dato))
        expect(enviado, `hash de ${dato.toLowerCase()}`).not.toContain(sha(dato.toLowerCase()))
      }
      for (const campo of ["em", "ph", "fn", "ln", "external_id", "custom_data", "value", "currency"]) {
        expect(enviado, campo).not.toContain(`"${campo}"`)
      }
    })

    it("con la CAPI apagada: el navegador recibe event_id (para el píxel) pero el servidor no llama a Meta", async () => {
      encenderPixel(false)
      const { POST } = await cargarRuta()
      const r = await POST(peticion({ "x-consent-marketing": "1" }))
      expect(await r.json()).toMatchObject({ ok: true, lead: { event_id: expect.any(String) } })
      await new Promise((ok) => setTimeout(ok, 20))
      expect(llamadasA(URL_META)).toHaveLength(0)
    })

    it("la CAPI encendida sin token → no llama a Meta", async () => {
      encenderPixel(true)
      vi.stubEnv("META_CAPI_TOKEN", "")
      const { POST } = await cargarRuta()
      await POST(peticion({ "x-consent-marketing": "1" }))
      await new Promise((ok) => setTimeout(ok, 20))
      expect(llamadasA(URL_META)).toHaveLength(0)
    })

    it("si Meta falla (500 o red caída), el visitante sigue viendo el éxito: el lead ya está creado", async () => {
      encenderPixel(true)
      fetchMock.mockImplementation(async (url: string) => {
        if (url === URL_PORTAL) return new Response("{}", { status: 201 })
        throw new Error("ECONNRESET")
      })
      const { POST } = await cargarRuta()
      const r = await POST(peticion({ "x-consent-marketing": "1" }))
      expect(r.status).toBe(200)
      expect(await r.json()).toMatchObject({ ok: true })
      await vi.waitFor(() => expect(llamadasA(URL_META)).toHaveLength(1))
    })

    it("el cuerpo que va al portal no cambia por tener Meta encendido", async () => {
      encenderPixel(true)
      const { POST } = await cargarRuta()
      await POST(peticion({ "x-consent-marketing": "1" }))
      const cuerpo = JSON.parse(String(llamadasA(URL_PORTAL)[0][1].body))
      expect(Object.keys(cuerpo).sort()).toEqual(["consentimiento", "consentimiento_version", "correo", "dormitorios", "idioma", "municipio", "nombre", "telefono"])
      expect(JSON.stringify(cuerpo)).not.toMatch(/event_id|fbp|fbc|meta/i)
    })
  })

  describe("el mismo event_id llega al píxel (deduplicación)", () => {
    it("el que devuelve la ruta es el que el navegador pasa a fbq('track','Lead') y el que recibe Meta por la CAPI", async () => {
      encenderPixel(true)
      const { POST } = await cargarRuta()
      const r = await POST(peticion({ "x-consent-marketing": "1" }))
      const { lead } = (await r.json()) as { lead: { event_id: string } }

      // Navegador: lo que haría CalculadoraContent con esa respuesta.
      const win: VentanaMeta & { fbq?: { queue?: unknown[][] } } = {}
      const doc = { head: { appendChild() {} }, createElement: () => ({ async: false, src: "" }), cookie: "" }
      const pixel = crearPixel({ id: ID_PIXEL, win, doc: doc as unknown as DocumentoMeta, host: "sedaprivatehomes.com" })
      pixel.activar()
      pixel.lead(lead.event_id)
      const trackLead = (win.fbq!.queue as unknown[][]).map((a) => Array.from(a as ArrayLike<unknown>)).find((a) => a[0] === "track" && a[1] === "Lead")!
      expect((trackLead[3] as { eventID: string }).eventID).toBe(lead.event_id)

      // Servidor: lo que recibió Meta.
      await vi.waitFor(() => expect(llamadasA(URL_META)).toHaveLength(1))
      const { data } = JSON.parse(String(llamadasA(URL_META)[0][1].body)) as { data: { event_id: string; event_name: string }[] }
      expect(data[0].event_id).toBe((trackLead[3] as { eventID: string }).eventID)
      expect(data[0].event_name).toBe(trackLead[1]) // «Lead» en los dos: Meta deduplica por nombre + id
    })
  })
})

describe("lib/meta-capi: funciones sueltas", () => {
  it("enviarLeadCapi con todo apagado no llama a nadie", async () => {
    const f = vi.fn()
    expect(await enviarLeadCapi({ eventId: "x", urlOrigen: "https://sedaprivatehomes.com/" }, {}, f as unknown as typeof fetch)).toBe("apagado")
    expect(f).not.toHaveBeenCalled()
  })

  it("solo acepta _fbp/_fbc con la forma de Meta; lo demás se descarta", () => {
    expect(identificadoresDeCookie("a=1; _fbp=fb.1.1596403881668.1116446470; b=2")).toEqual({ fbp: "fb.1.1596403881668.1116446470", fbc: undefined })
    expect(identificadoresDeCookie("_fbp=<script>; _fbc=fb.1.1554763741205.x y")).toEqual({ fbp: undefined, fbc: undefined })
    expect(identificadoresDeCookie(null)).toEqual({ fbp: undefined, fbc: undefined })
  })

  it("el cuerpo sin ip ni navegador deja user_data vacío, sin claves inventadas", () => {
    const c = cuerpoLeadCapi({ eventId: "id", urlOrigen: "https://sedaprivatehomes.com/", ahora: new Date("2026-11-06T10:00:00Z") })
    expect(c.data[0].user_data).toEqual({})
    expect(c.data[0].event_time).toBe(Date.UTC(2026, 10, 6, 10, 0, 0) / 1000)
  })
})
