import { createHash, createHmac } from "node:crypto"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  calculadoraPropietariosActiva,
  estadoTrasRespuesta,
  estimar,
  hoyMadrid,
  precioConIvaAlojamiento,
  precioNocheSinIva,
} from "@/lib/calculadora-propietarios"
import { cuerpoPortal, validarLead, ENDPOINT_PORTAL_LEADS_PROPIETARIO } from "@/lib/lead-propietario"
import { faqCalculadora } from "@/lib/faq"
import { faqPageJsonLd } from "@/lib/jsonld"
import { netoAnual, resolverMensajes, type Idioma } from "@/lib/tarifa"

/*
  /propietarios/calculadora — el cálculo, el consentimiento y el flag.

  Regla de CLAUDE.md: un test escrito por quien escribió el código demuestra
  consistencia, no corrección. Por eso las cifras de aquí abajo están hechas A
  MANO con la regla de la tarifa v6 (decisión de Ángel, 25–26-oct-2026), no sacadas
  de la función que se prueba:

      alojamiento anual = ocupación × 365 × precio por noche
      comisión SEDA     = la menor de  21 % × (alojamiento − canal)  y  20 % × alojamiento
      neto              = alojamiento − canal − comisión;  IVA 21 % de la comisión, aparte.
      canal del ejemplo de la tarifa: 15 %.

  Caso A · 200 € × 50 % → 0,5 × 365 × 200 = 36.500 €
    directa: 21 % = 7.665 · tope 20 % = 7.300 → 7.300 · IVA 1.533 · neto 29.200
    canal:   15 % = 5.475 · base 31.025 · 21 % = 6.515,25 → 6.515 · IVA 1.368,20 → 1.368 · neto 24.510
  Caso B · 1.450 € × 72 % → 381.060 € (el del simulador de /propietarios, tests/tarifa.test.ts)
    directa: tope 76.212 · IVA 16.004,52 → 16.005 · neto 304.848
    canal:   57.159 · base 323.901 · 21 % = 68.019,21 → 68.019 · IVA 14.284,03 → 14.284 · neto 255.882
  Caso C · 1.000 € × 95 % → 346.750 €
    directa: tope 69.350 · IVA 14.563,50 → 14.564 · neto 277.400
    canal:   15 % = 52.012,50 → 52.013 · base 294.737,50 · 21 % = 61.894,875 → 61.895 · neto 232.842
             (exacto 232.842,625; en pantalla el neto es bruto − canal − comisión ya redondeados)
*/

// Estas cifras son las de ANTES del 1-dic-2026 (alojamiento exento): la fecha va
// fijada para que el test no cambie de significado solo por pasar el día.
const ANTES = "2026-11-30"

describe("cálculo, contra cifras hechas a mano", () => {
  it("A · 200 € × 50 %: directa 7.300 € de comisión y neto 29.200 €; por canal 6.515 € y 24.510 €", () => {
    const e = estimar(200, 50, ANTES)!
    expect(e.alojamientoAnual).toBe(36500)
    expect(e.directa).toEqual({ canal: 0, comision: 7300, iva: 1533, neto: 29200 })
    expect(e.conCanal).toEqual({ canal: 5475, comision: 6515, iva: 1368, neto: 24510 })
    expect(e.canalPct).toBe(15)
    expect(e.tarifa).toBe("v6")
  })

  it("B · 1.450 € × 72 %: 381.060 € brutos, neto 304.848 € directa y 255.882 € por canal", () => {
    const e = estimar(1450, 72, ANTES)!
    expect(e.alojamientoAnual).toBe(381060)
    expect(e.directa).toEqual({ canal: 0, comision: 76212, iva: 16005, neto: 304848 })
    expect(e.conCanal).toEqual({ canal: 57159, comision: 68019, iva: 14284, neto: 255882 })
  })

  it("C · 1.000 € × 95 %: los medios euros se redondean hacia arriba y la cuenta visible cuadra", () => {
    const e = estimar(1000, 95, ANTES)!
    expect(e.alojamientoAnual).toBe(346750)
    expect(e.directa).toEqual({ canal: 0, comision: 69350, iva: 14564, neto: 277400 })
    expect(e.conCanal).toEqual({ canal: 52013, comision: 61895, iva: 12998, neto: 232842 })
  })

  it("en reserva directa manda el tope del 20 %, no el 21 %: la comisión es el 20 % del alojamiento", () => {
    for (const [precio, ocu] of [[200, 50], [1450, 72], [1000, 95], [333, 41]] as const) {
      const e = estimar(precio, ocu, ANTES)!
      expect(e.directa.comision).toBe(Math.round(e.alojamientoAnual * 0.2))
    }
  })

  it("lo que se ve suma: bruto − canal − comisión = neto, en los dos escenarios", () => {
    for (const [precio, ocu] of [[200, 50], [1450, 72], [1000, 95], [333, 41], [87.5, 63]] as const) {
      const e = estimar(precio, ocu, ANTES)!
      expect(e.alojamientoAnual - e.directa.canal - e.directa.comision).toBe(e.directa.neto)
      expect(e.alojamientoAnual - e.conCanal.canal - e.conCanal.comision).toBe(e.conCanal.neto)
    }
  })

  it("no se aleja más de 1 € del neto de /propietarios (`netoAnual`), que redondea solo al final", () => {
    for (const [precio, ocu] of [[200, 50], [1450, 72], [1000, 95], [333, 41]] as const) {
      const e = estimar(precio, ocu, ANTES)!
      const ref = netoAnual(e.alojamientoAnual)
      expect(Math.abs(e.directa.neto - ref.directa)).toBeLessThanOrEqual(1)
      expect(Math.abs(e.conCanal.neto - ref.ota)).toBeLessThanOrEqual(1)
    }
  })

  it("control negativo: con la v3 (24 % plano) el neto directo del caso B sería 289.606 €, que NO es el de la v6", () => {
    expect(Math.round(381060 * (1 - 0.24))).toBe(289606)
    expect(estimar(1450, 72, ANTES)!.directa.neto).not.toBe(289606)
  })

  it("sin precio o sin ocupación utilizables no hay estimación", () => {
    expect(estimar(0, 50, ANTES)).toBeNull()
    expect(estimar(-10, 50, ANTES)).toBeNull()
    expect(estimar(Number.NaN, 50, ANTES)).toBeNull()
    expect(estimar(200, 0, ANTES)).toBeNull()
    expect(estimar(200, 101, ANTES)).toBeNull()
    expect(estimar(200_001, 50, ANTES)).toBeNull()
  })
})

describe("consentimiento RGPD obligatorio", () => {
  const BASE = {
    nombre: "María García",
    email: "maria@example.com",
    locale: "es",
    precioNoche: 200,
    ocupacionPct: 50,
  }

  it("sin consentimiento, con false o con algo que no es el booleano true: se rechaza", () => {
    for (const consentimiento of [undefined, false, "true", "on", 1, null]) {
      const r = validarLead({ ...BASE, consentimiento })
      expect(r).toEqual({ ok: false, error: "consent_required" })
    }
  })

  it("con consentimiento: true y todo lo demás en orden, se acepta", () => {
    const r = validarLead({ ...BASE, consentimiento: true, telefono: "+34 600 123 456", municipio: "Estepona", dormitorios: 3 })
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.lead).toMatchObject({ nombre: "María García", telefono: "+34600123456", municipio: "Estepona", dormitorios: 3 })
  })

  it("el cuerpo para el portal es EXACTAMENTE el contrato de seda_os (leadPropietarioSchema, .strict())", () => {
    const r = validarLead({ ...BASE, consentimiento: true, telefono: "+34 600 123 456", municipio: "Estepona", dormitorios: 3 })
    if (!r.ok) throw new Error("debía aceptarse")
    const c = cuerpoPortal(r.lead)
    expect(Object.keys(c).sort()).toEqual(
      ["canal", "consentimiento", "consentimiento_version", "correo", "dormitorios", "idioma", "municipio", "nombre", "telefono"],
    )
    expect(c.consentimiento).toBe(true)
    expect(c.consentimiento_version).toMatch(/^[A-Za-z0-9._-]{1,40}$/)
    expect(c.correo).toBe(c.correo.toLowerCase())
    // CONTROL NEGATIVO: nada de lo que el portal rechazaría por .strict()
    for (const k of ["email", "origen", "estimacion", "propiedad", "website"]) expect(c).not.toHaveProperty(k)
  })

  it("idioma: el cuerpo lleva el locale de la página, con cada uno de los cuatro", () => {
    for (const locale of ["es", "en", "de", "fr"]) {
      const r = validarLead({ ...BASE, consentimiento: true, locale })
      if (!r.ok) throw new Error("debía aceptarse")
      expect(cuerpoPortal(r.lead).idioma).toBe(locale)
    }
  })

  it("los topes coinciden con los del portal: municipio 80 y dormitorios 30", () => {
    expect(validarLead({ ...BASE, consentimiento: true, municipio: "x".repeat(81) })).toEqual({ ok: false, error: "invalid_municipio" })
    expect(validarLead({ ...BASE, consentimiento: true, dormitorios: 31 })).toEqual({ ok: false, error: "invalid_dormitorios" })
    expect(validarLead({ ...BASE, consentimiento: true, dormitorios: 30 }).ok).toBe(true)
  })

  it("el formulario no deja enviar sin la casilla: required, sin marcar de antemano y con enlace a la privacidad", async () => {
    const src = readFileSync(join(process.cwd(), "app/[locale]/propietarios/calculadora/CalculadoraContent.tsx"), "utf8")
    const casilla = src.match(/<input\s[^>]*type="checkbox"[\s\S]*?\/>/)?.[0] ?? ""
    expect(casilla).toContain("required")
    expect(src).toContain("useState(false)") // consentimiento arranca sin marcar
    expect(src).toMatch(/href="\/privacidad"/)
    // La política de privacidad existe como ruta pública.
    const { PRIVACIDAD } = await import("@/lib/legal/privacidad")
    expect(PRIVACIDAD.ruta).toBe("/privacidad")
  })
})

describe("validación del resto de campos", () => {
  const OK = { nombre: "Ana", email: "ana@example.com", locale: "en", precioNoche: 150, ocupacionPct: 60, consentimiento: true }

  it.each([
    [{ email: "ana@example.com,otro@evil.tld" }, "invalid_email"],
    [{ email: "no-es-un-email" }, "invalid_email"],
    [{ nombre: "" }, "missing_field"],
    [{ nombre: "Ana\nEMAIL: x@y.com" }, "invalid_name"],
    [{ nombre: "x".repeat(121) }, "invalid_name"],
    [{ telefono: "abc" }, "phone_needs_prefix"],
    [{ telefono: "07700 900123" }, "phone_needs_prefix"],
    [{ telefono: "+34 600\n123" }, "invalid_phone"],
    [{ locale: "it" }, "invalid_locale"],
    [{ dormitorios: 0 }, "invalid_dormitorios"],
    [{ dormitorios: "3" }, "invalid_dormitorios"],
    [{ precioNoche: "200" }, "invalid_calculo"],
    [{ precioNoche: 0 }, "invalid_calculo"],
    [{ ocupacionPct: 5 }, "invalid_calculo"],
    [{ ocupacionPct: 100 }, "invalid_calculo"],
    [{ neto: 999999 }, "unknown_field"],
  ])("%j → %s", (cambio, error) => {
    expect(validarLead({ ...OK, ...cambio })).toEqual({ ok: false, error })
  })

  it("el honeypot relleno se detecta pero no se rechaza (misma respuesta que un envío bueno)", () => {
    const r = validarLead({ ...OK, website: "http://spam.example" })
    expect(r).toMatchObject({ ok: true, honeypot: true })
  })
})

describe("el flag: solo el valor exacto «1» enciende", () => {
  it.each([[undefined], [""], ["0"], ["true"], ["TRUE"], ["yes"], [" 1"], ["1 "]])("%j → apagado", (v) => {
    expect(calculadoraPropietariosActiva({ SEDA_FLAG_CALCULADORA_PROPIETARIOS: v })).toBe(false)
  })
  it("«1» → encendido", () => {
    expect(calculadoraPropietariosActiva({ SEDA_FLAG_CALCULADORA_PROPIETARIOS: "1" })).toBe(true)
  })
})

/* ── La ruta /api/leads/propietario ─────────────────────────────────────── */

type Route = typeof import("@/app/api/leads/propietario/route")
let seq = 0
const ipNueva = () => `203.0.113.${(seq += 1)}`

async function cargarRuta(): Promise<Route> {
  vi.resetModules() // estado del limitador limpio
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

function peticion(cuerpo: unknown = LEAD, cabeceras: Record<string, string> = {}) {
  return new Request("http://localhost/api/leads/propietario", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "http://localhost", "x-forwarded-for": ipNueva(), ...cabeceras },
    body: typeof cuerpo === "string" ? cuerpo : JSON.stringify(cuerpo),
  })
}

describe("POST /api/leads/propietario", () => {
  let enviado: ReturnType<typeof vi.fn>

  beforeEach(() => {
    enviado = vi.fn(async () => new Response("{}", { status: 201 }))
    vi.stubGlobal("fetch", enviado)
    vi.spyOn(console, "error").mockImplementation(() => {})
    vi.spyOn(console, "warn").mockImplementation(() => {})
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  describe("con el flag apagado no se envía nada", () => {
    it.each([[undefined], [""], ["0"], ["true"]])("flag %j: un envío perfecto → 404 y ninguna llamada al portal", async (flag) => {
      if (flag !== undefined) vi.stubEnv("SEDA_FLAG_CALCULADORA_PROPIETARIOS", flag)
      else vi.stubEnv("SEDA_FLAG_CALCULADORA_PROPIETARIOS", undefined as unknown as string)
      const { POST } = await cargarRuta()
      const r = await POST(peticion())
      expect(r.status).toBe(404)
      expect(await r.json()).toEqual({ ok: false, error: "not_found" })
      expect(enviado).not.toHaveBeenCalled()
    })

    it("ni siquiera lee el cuerpo: un JSON roto también es 404, no 400", async () => {
      vi.stubEnv("SEDA_FLAG_CALCULADORA_PROPIETARIOS", "0")
      const { POST } = await cargarRuta()
      expect((await POST(peticion("{roto"))).status).toBe(404)
      expect(enviado).not.toHaveBeenCalled()
    })

    it("la página es un 404 y el sitemap no la lista", async () => {
      vi.stubEnv("SEDA_FLAG_CALCULADORA_PROPIETARIOS", "0")
      const sitemap = (await import("@/app/sitemap")).default
      expect(sitemap().filter((e) => e.url.includes("/propietarios/calculadora"))).toEqual([])
      const Pagina = (await import("@/app/[locale]/propietarios/calculadora/page")).default
      await expect(Pagina({ params: Promise.resolve({ locale: "es" }) })).rejects.toMatchObject({
        digest: expect.stringContaining("404"),
      })
    })
  })

  describe("con el flag encendido", () => {
    // Secreto de PRUEBA (lo dice su texto); no es el de ningún entorno.
    const SECRETO = "secreto-de-prueba-de-seda-web-no-es-real-0123456789"
    beforeEach(() => {
      vi.stubEnv("SEDA_FLAG_CALCULADORA_PROPIETARIOS", "1")
      vi.stubEnv("SEDA_LEADS_HMAC_SECRET", SECRETO)
    })

    it("V4-01: el POST al portal va firmado (HMAC-Lead + X-Timestamp) sobre el texto EXACTO que se envía", async () => {
      const antes = Date.now()
      const { POST } = await cargarRuta()
      expect((await POST(peticion())).status).toBe(200)
      const [, init] = enviado.mock.calls[0] as [string, RequestInit]
      const cabeceras = new Headers(init.headers)
      const ts = cabeceras.get("x-timestamp") ?? ""
      expect(ts).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
      expect(Math.abs(Date.parse(ts) - antes)).toBeLessThan(5_000)
      // Recalculada aquí con node:crypto a pelo, no con lib/lead-firma.ts.
      const hash = createHash("sha256").update(String(init.body), "utf8").digest("hex")
      const firma = createHmac("sha256", SECRETO).update(`POST|/api/leads/propietario|${ts}|${hash}`).digest("hex")
      expect(cabeceras.get("authorization")).toBe(`HMAC-Lead ${firma}`)
    })

    it.each([[undefined], [""], ["corto-de-menos-de-32"]])(
      "V4-01: sin SEDA_LEADS_HMAC_SECRET válido (%j) → 503 not_configured y NO se llama al portal",
      async (secreto) => {
        vi.stubEnv("SEDA_LEADS_HMAC_SECRET", secreto as unknown as string)
        const { POST } = await cargarRuta()
        const r = await POST(peticion())
        expect(r.status).toBe(503)
        expect(await r.json()).toEqual({ ok: false, error: "not_configured" })
        expect(enviado).not.toHaveBeenCalled()
      },
    )

    it("V4-01: el secreto no se escribe en los logs", async () => {
      enviado.mockResolvedValueOnce(new Response("{}", { status: 401 }))
      const { POST } = await cargarRuta()
      await POST(peticion())
      const log = JSON.stringify([...(console.error as ReturnType<typeof vi.fn>).mock.calls, ...(console.warn as ReturnType<typeof vi.fn>).mock.calls])
      expect(log).not.toContain(SECRETO)
    })

    it("un envío bueno hace UN POST al portal, con el contrato de seda_os y sin el honeypot", async () => {
      const { POST } = await cargarRuta()
      const r = await POST(peticion())
      expect(r.status).toBe(200)
      expect(await r.json()).toEqual({ ok: true })

      expect(enviado).toHaveBeenCalledTimes(1)
      const [url, init] = enviado.mock.calls[0] as [string, RequestInit]
      expect(url).toBe("https://portal.sedaprivatehomes.com/api/leads/propietario")
      expect(url).toBe(ENDPOINT_PORTAL_LEADS_PROPIETARIO)
      expect(init.method).toBe("POST")
      const cuerpo = JSON.parse(String(init.body))
      expect(cuerpo).toEqual({
        nombre: "María García",
        correo: "maria@example.com",
        telefono: "+34600123456", // ya en E.164: la regla de seda_os (V4-04)
        municipio: "Estepona",
        dormitorios: 3,
        consentimiento: true,
        consentimiento_version: expect.stringMatching(/^[A-Za-z0-9._-]{1,40}$/),
        idioma: "es", // locale de la página (LEAD usa "es")
        canal: "calculadora", // cartas-QR: siempre
      })
      expect(JSON.stringify(cuerpo)).not.toContain("website")
    })

    it("sin consentimiento → 400 y no se envía nada", async () => {
      const { POST } = await cargarRuta()
      for (const consentimiento of [false, undefined, "true"]) {
        const r = await POST(peticion({ ...LEAD, consentimiento }))
        expect(r.status).toBe(400)
        expect(await r.json()).toEqual({ ok: false, error: "consent_required" })
      }
      expect(enviado).not.toHaveBeenCalled()
    })

    it("honeypot relleno → misma respuesta que un envío bueno, sin enviar", async () => {
      const { POST } = await cargarRuta()
      const r = await POST(peticion({ ...LEAD, website: "https://spam.example" }))
      expect(r.status).toBe(200)
      expect(await r.json()).toEqual({ ok: true })
      expect(enviado).not.toHaveBeenCalled()
    })

    it("un cliente no puede colar su propio neto: un campo desconocido se rechaza", async () => {
      const { POST } = await cargarRuta()
      const r = await POST(peticion({ ...LEAD, neto: 999999 }))
      expect(r.status).toBe(400)
      expect(enviado).not.toHaveBeenCalled()
    })

    it("origen ajeno, sin origen o sin application/json → 403 / 415, sin enviar", async () => {
      const { POST } = await cargarRuta()
      expect((await POST(peticion(LEAD, { origin: "https://evil.example" }))).status).toBe(403)
      expect((await POST(peticion(LEAD, { origin: "" }))).status).toBe(403)
      expect((await POST(peticion(LEAD, { "sec-fetch-site": "cross-site" }))).status).toBe(403)
      expect((await POST(peticion(LEAD, { "content-type": "text/plain" }))).status).toBe(415)
      expect(enviado).not.toHaveBeenCalled()
    })

    it("si el portal no responde 2xx, el visitante ve un error: nunca un «recibido» falso", async () => {
      enviado.mockResolvedValueOnce(new Response("boom", { status: 500 }))
      const { POST } = await cargarRuta()
      const r = await POST(peticion())
      expect(r.status).toBe(502)
      expect(await r.json()).toEqual({ ok: false, error: "send_failed" })
    })

    it("V4-04: un móvil británico sin prefijo (07700 900123) → 400 phone_needs_prefix, sin llamar al portal; el formulario pide el prefijo", async () => {
      // Hoy (antes de V4-04) seda-web lo aceptaba, seda_os respondía 400 y el
      // visitante veía un 502 «inténtelo en unos minutos». Se simula ese portal.
      enviado.mockResolvedValue(new Response('{"ok":false,"error":"solicitud_invalida"}', { status: 400 }))
      const { POST } = await cargarRuta()
      const r = await POST(peticion({ ...LEAD, telefono: "07700 900123" }))
      expect(r.status).toBe(400)
      const cuerpo = (await r.json()) as { error: string }
      expect(cuerpo).toEqual({ ok: false, error: "phone_needs_prefix" })
      expect(enviado).not.toHaveBeenCalled()
      expect(estadoTrasRespuesta(r.status, cuerpo.error)).toBe("telefono")
    })

    it("V4-04: el mismo móvil con su prefijo (+44 7700 900123) pasa y viaja en E.164", async () => {
      const { POST } = await cargarRuta()
      const r = await POST(peticion({ ...LEAD, telefono: "+44 7700 900123" }))
      expect(r.status).toBe(200)
      const [, init] = enviado.mock.calls[0] as [string, RequestInit]
      expect(JSON.parse(String(init.body)).telefono).toBe("+447700900123")
    })

    it("V4-04: un 400 del portal es un dato, no una avería → 422 rejected_data (y el formulario pide revisar los datos)", async () => {
      enviado.mockResolvedValueOnce(new Response('{"ok":false,"error":"solicitud_invalida"}', { status: 400 }))
      const { POST } = await cargarRuta()
      const r = await POST(peticion())
      expect(r.status).toBe(422)
      const cuerpo = (await r.json()) as { error: string }
      expect(cuerpo).toEqual({ ok: false, error: "rejected_data" })
      expect(estadoTrasRespuesta(r.status, cuerpo.error)).toBe("datos")
    })

    it("si el portal no contesta (red caída o tiempo agotado) → 502 network_error", async () => {
      enviado.mockRejectedValueOnce(new Error("ECONNRESET"))
      const { POST } = await cargarRuta()
      const r = await POST(peticion())
      expect(r.status).toBe(502)
      expect(await r.json()).toEqual({ ok: false, error: "network_error" })
    })

    it("no escribe datos personales en los logs", async () => {
      enviado.mockResolvedValueOnce(new Response("boom", { status: 500 }))
      const { POST } = await cargarRuta()
      await POST(peticion())
      const log = JSON.stringify([...(console.error as ReturnType<typeof vi.fn>).mock.calls, ...(console.warn as ReturnType<typeof vi.fn>).mock.calls])
      expect(log).not.toContain("maria@example.com")
      expect(log).not.toContain("María")
      expect(log).not.toContain("600 123")
    })

    it("límite de frecuencia: el sexto envío seguido desde la misma IP → 429", async () => {
      const { POST } = await cargarRuta()
      const ip = { "x-forwarded-for": "198.51.100.7" }
      for (let i = 0; i < 5; i++) expect((await POST(peticion(LEAD, ip))).status).toBe(200)
      const r = await POST(peticion(LEAD, ip))
      expect(r.status).toBe(429)
      expect(r.headers.get("retry-after")).toBeTruthy()
    })

    describe("V4-M06: límite por visitante en el portal", () => {
      const cabecerasEnviadas = () => new Headers((enviado.mock.calls[0] as [string, RequestInit])[1].headers as HeadersInit)
      const sinIp = () =>
        new Request("http://localhost/api/leads/propietario", {
          method: "POST",
          headers: { "content-type": "application/json", origin: "http://localhost" },
          body: JSON.stringify(LEAD),
        })

      it("manda X-Visitor-Ip con la primera IP de x-forwarded-for", async () => {
        const { POST } = await cargarRuta()
        const r = await POST(peticion(LEAD, { "x-forwarded-for": "198.51.100.20, 10.0.0.1" }))
        expect(r.status).toBe(200)
        expect(cabecerasEnviadas().get("x-visitor-ip")).toBe("198.51.100.20")
      })

      it("sin x-forwarded-for usa x-real-ip", async () => {
        const { POST } = await cargarRuta()
        const req = new Request("http://localhost/api/leads/propietario", {
          method: "POST",
          headers: { "content-type": "application/json", origin: "http://localhost", "x-real-ip": "198.51.100.21" },
          body: JSON.stringify(LEAD),
        })
        await POST(req)
        expect(cabecerasEnviadas().get("x-visitor-ip")).toBe("198.51.100.21")
      })

      it("sin IP del visitante NO manda la cabecera", async () => {
        const { POST } = await cargarRuta()
        expect((await POST(sinIp())).status).toBe(200)
        expect(cabecerasEnviadas().has("x-visitor-ip")).toBe(false)
      })

      it("la IP no va en el cuerpo, ni en la firma, ni en los logs", async () => {
        enviado.mockResolvedValueOnce(new Response("boom", { status: 500 }))
        const { POST } = await cargarRuta()
        await POST(peticion(LEAD, { "x-forwarded-for": "198.51.100.22" }))
        const [, init] = enviado.mock.calls[0] as [string, RequestInit]
        expect(String(init.body)).not.toContain("198.51.100.22")
        cabecerasEnviadas().forEach((valor, nombre) => {
          if (nombre !== "x-visitor-ip") expect(valor).not.toContain("198.51.100.22")
        })
        const log = JSON.stringify([...(console.error as ReturnType<typeof vi.fn>).mock.calls, ...(console.warn as ReturnType<typeof vi.fn>).mock.calls])
        expect(log).not.toContain("198.51.100.22")
      })

      it("429 demasiadas_solicitudes del portal → 429 con ese código y el formulario dice «espere un minuto»", async () => {
        enviado.mockResolvedValueOnce(new Response('{"error":"demasiadas_solicitudes"}', { status: 429 }))
        const { POST } = await cargarRuta()
        const r = await POST(peticion())
        expect(r.status).toBe(429)
        const cuerpo = (await r.json()) as { error: string }
        expect(cuerpo).toEqual({ ok: false, error: "demasiadas_solicitudes" })
        expect(estadoTrasRespuesta(r.status, cuerpo.error)).toBe("limite_minuto")
        expect(estadoTrasRespuesta(429, "rate_limited")).toBe("limite")
      })

      it("el texto «espere un minuto» existe en los cuatro idiomas y es distinto del genérico", async () => {
        for (const l of ["es", "en", "fr", "de"]) {
          const m = (await import(`@/messages/${l}.json`)).default.calculadora.form
          expect(m.error_rate_minuto).toBeTruthy()
          expect(m.error_rate_minuto).not.toBe(m.error)
          expect(m.error_rate_minuto).not.toBe(m.error_rate)
        }
      })
    })

    it("la página existe y el sitemap la lista en los cuatro idiomas", async () => {
      const sitemap = (await import("@/app/sitemap")).default
      const urls = sitemap().map((e) => e.url).filter((u) => u.includes("/propietarios/calculadora"))
      expect(urls.sort()).toEqual([
        "https://sedaprivatehomes.com/de/propietarios/calculadora",
        "https://sedaprivatehomes.com/en/propietarios/calculadora",
        "https://sedaprivatehomes.com/fr/propietarios/calculadora",
        "https://sedaprivatehomes.com/propietarios/calculadora",
      ])
    })
  })
})

/* ── SEO: el FAQ son cuatro preguntas que la web ya tenía ───────────────── */

describe("FAQPage de la calculadora", () => {
  const LOCALES: Idioma[] = ["es", "en", "fr", "de"]
  for (const l of LOCALES) {
    it(`${l}: cuatro preguntas, las mismas que /propietarios (prop.faq.items q1, q3, q5, q7), sin texto nuevo`, () => {
      const msgs = resolverMensajes(JSON.parse(readFileSync(join(process.cwd(), `messages/${l}.json`), "utf8")), l) as {
        prop: { faq: { items: Record<string, { q: string; a: string }> } }
      }
      const t = (key: string) => key.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown>)[k], msgs) as string
      const faq = faqCalculadora(t)
      expect(faq).toHaveLength(4)
      const items = msgs.prop.faq.items
      expect(faq).toEqual([items.q1, items.q3, items.q5, items.q7].map(({ q, a }) => ({ q, a })))
      const ld = faqPageJsonLd(faq) as { "@type": string; mainEntity: { name: string }[] }
      expect(ld["@type"]).toBe("FAQPage")
      expect(ld.mainEntity.map((m) => m.name)).toEqual(faq.map((f) => f.q))
    })
  }
})

/* ── V4-04 · El IVA del alojamiento desde el 1-dic-2026 ─────────────────── */

describe("V4-04: desde el 1-dic-2026 se quita la cuota del 10 % antes de calcular", () => {
  /*
    Cifras A MANO con la regla de la estancia de 30 noches o menos (RDL 29/2026;
    docs/REGLAS-NEGOCIO.md de seda_os, D-3): el precio es IVA incluido y la
    cuota es precio × 10 / 110.

      110 €/noche IVA incluido → 110 × 100 / 110 = 100 € de alojamiento, 10 € de cuota.

    Caso D · 110 € × 50 %, el 1-dic-2026:
      pagado por los huéspedes = 0,5 × 365 × 110 = 20.075 €
      cuota = 20.075 × 10 / 110 = 1.825 €   →  alojamiento = 18.250 € (= 0,5 × 365 × 100)
      directa: 21 % × 18.250 = 3.832,50 · tope 20 % = 3.650 → 3.650 · IVA 766,50 → 767 · neto 14.600
      canal:   15 % × 20.075 (sobre lo que paga el huésped) = 3.011,25 → 3.011
               base 18.250 − 3.011,25 = 15.238,75 · 21 % = 3.200,14 → 3.200 (tope 3.650 no actúa)
               IVA 21 % × 3.200,14 = 672,03 → 672 · neto 18.250 − 3.011 − 3.200 = 12.039
    El mismo caso el 30-nov: exento, alojamiento = 20.075 € (todo el precio).
  */
  const DESDE = "2026-12-01"

  it("110 €/noche IVA incluido ⇒ 100 € de alojamiento desde el 1-dic; 110 € el 30-nov", () => {
    expect(precioNocheSinIva(110, DESDE)).toBe(100)
    expect(precioNocheSinIva(110, "2026-11-30")).toBe(110)
  })

  it("la fecha de corte es el 1-dic-2026, comparada como texto", () => {
    expect(precioConIvaAlojamiento("2026-11-30")).toBe(false)
    expect(precioConIvaAlojamiento("2026-12-01")).toBe(true)
    expect(precioConIvaAlojamiento("2027-03-15")).toBe(true)
  })

  it("D · 110 € × 50 % el 1-dic: 20.075 € pagados, 1.825 € de cuota y 18.250 € de alojamiento", () => {
    const e = estimar(110, 50, DESDE)!
    expect(e.ivaAlojamientoIncluido).toBe(true)
    expect(e.pagadoHuespedes).toBe(20075)
    expect(e.cuotaIvaAlojamiento).toBe(1825)
    expect(e.alojamientoAnual).toBe(18250)
    expect(e.directa).toEqual({ canal: 0, comision: 3650, iva: 767, neto: 14600 })
    expect(e.conCanal).toEqual({ canal: 3011, comision: 3200, iva: 672, neto: 12039 })
  })

  it("el mismo caso el 30-nov: sin cuota, el alojamiento es todo lo pagado", () => {
    const e = estimar(110, 50, "2026-11-30")!
    expect(e.ivaAlojamientoIncluido).toBe(false)
    expect(e.cuotaIvaAlojamiento).toBe(0)
    expect(e.alojamientoAnual).toBe(20075)
    expect(e.pagadoHuespedes).toBe(20075)
  })

  it("control negativo: sin quitar la cuota, la comisión directa del caso D saldría 4.015 € (20 % de 20.075), un 10 % más", () => {
    expect(Math.round(20075 * 0.2)).toBe(4015)
    expect(estimar(110, 50, DESDE)!.directa.comision).not.toBe(4015)
  })

  it("lo que se ve sigue sumando con la cuota fuera: alojamiento − canal − comisión = neto", () => {
    for (const [precio, ocu] of [[110, 50], [200, 50], [1450, 72], [87.5, 63]] as const) {
      const e = estimar(precio, ocu, DESDE)!
      expect(e.pagadoHuespedes - e.cuotaIvaAlojamiento).toBe(e.alojamientoAnual)
      expect(e.alojamientoAnual - e.directa.canal - e.directa.comision).toBe(e.directa.neto)
      expect(e.alojamientoAnual - e.conCanal.canal - e.conCanal.comision).toBe(e.conCanal.neto)
    }
  })

  it("sin fecha, toma hoy en Madrid (YYYY-MM-DD)", () => {
    expect(hoyMadrid(new Date("2026-11-30T23:30:00Z"))).toBe("2026-12-01") // 00:30 en Madrid
    expect(hoyMadrid(new Date("2026-11-30T22:30:00Z"))).toBe("2026-11-30")
    expect(estimar(110, 50)).toEqual(estimar(110, 50, hoyMadrid()))
  })
})

/* ── V4-04 · Los textos del formulario y de la ayuda del precio ─────────── */

describe("V4-04: el formulario no promete enviar la estimación", () => {
  const LOCALES: Idioma[] = ["es", "en", "fr", "de"]
  // La palabra «estimación» en cada idioma, tal como la usan sus textos.
  const ESTIMACION: Record<Idioma, RegExp> = { es: /estimaci/i, en: /estimate/i, fr: /estimation/i, de: /schätzung/i }
  const IVA: Record<Idioma, RegExp> = { es: /IVA/, en: /VAT/, fr: /TVA/, de: /MwSt/ }

  const calc = (l: Idioma) =>
    (JSON.parse(readFileSync(join(process.cwd(), `messages/${l}.json`), "utf8")) as {
      calculadora: {
        form: Record<string, string>
        gracias: Record<string, string>
        inputs: { precio: { hint: string } }
        results: Record<string, unknown>
      }
    }).calculadora

  for (const l of LOCALES) {
    it(`${l}: el consentimiento no contiene «estimación» (ni los de esta estimación)`, () => {
      expect(calc(l).form.consent).not.toMatch(ESTIMACION[l])
      expect(calc(l).form.consent).toContain("<privacidad>")
    })

    it(`${l}: ni el título, ni el texto, ni el botón, ni el aviso, ni el «gracias» dicen que se envía la estimación`, () => {
      const c = calc(l)
      for (const texto of [c.form.h2, c.form.body, c.form.submit, c.form.needs_estimate, c.gracias.body]) {
        expect(texto).not.toMatch(ESTIMACION[l])
      }
    })

    it(`${l}: la ayuda del precio dice cómo va el IVA (exento hasta el 30-nov, 10 % dentro desde el 1-dic, 30 noches, 110 → 100)`, () => {
      const hint = calc(l).inputs.precio.hint
      expect(hint).toMatch(IVA[l])
      expect(hint).toMatch(/10 ?%/)
      expect(hint).toContain("30")
      expect(hint).toMatch(/110/)
      expect(hint).toMatch(/100/)
    })

    it(`${l}: hay texto para pedir el prefijo, para el dato rechazado y para la cuota en el resultado`, () => {
      const c = calc(l)
      expect(c.form.telefono_prefijo).toMatch(/\+\d/)
      expect(c.form.telefono_hint).toMatch(/\+\d/)
      expect(c.form.error_datos.length).toBeGreaterThan(20)
      expect(c.results.iva_alojamiento).toMatch(/\{pagado\}[\s\S]*\{cuota\}/)
    })
  }

  it("el campo del teléfono ya no lleva su propia regex: manda la de seda_os", () => {
    const src = readFileSync(join(process.cwd(), "app/[locale]/propietarios/calculadora/CalculadoraContent.tsx"), "utf8")
    expect(src).not.toMatch(/pattern=/)
    expect(src).toContain("normalizarTelefonoE164")
    const lib = readFileSync(join(process.cwd(), "lib/lead-propietario.ts"), "utf8")
    expect(lib).toContain("normalizarTelefonoE164")
    expect(lib).not.toMatch(/\[\\d\\s\+\(\)-\]\{6,\}/)
  })

  it("estadoTrasRespuesta: 2xx ok · 400 phone_needs_prefix → teléfono · 422 → datos · 429 → límite · 5xx/502 → error", () => {
    expect(estadoTrasRespuesta(200, undefined)).toBe("ok")
    expect(estadoTrasRespuesta(400, "phone_needs_prefix")).toBe("telefono")
    expect(estadoTrasRespuesta(400, "invalid_email")).toBe("error")
    expect(estadoTrasRespuesta(422, "rejected_data")).toBe("datos")
    expect(estadoTrasRespuesta(429, "rate_limited")).toBe("limite")
    expect(estadoTrasRespuesta(502, "send_failed")).toBe("error")
    expect(estadoTrasRespuesta(503, "not_configured")).toBe("error")
  })
})
