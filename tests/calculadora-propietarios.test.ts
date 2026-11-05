import { createHash, createHmac } from "node:crypto"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { calculadoraPropietariosActiva, estimar } from "@/lib/calculadora-propietarios"
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

describe("cálculo, contra cifras hechas a mano", () => {
  it("A · 200 € × 50 %: directa 7.300 € de comisión y neto 29.200 €; por canal 6.515 € y 24.510 €", () => {
    const e = estimar(200, 50)!
    expect(e.alojamientoAnual).toBe(36500)
    expect(e.directa).toEqual({ canal: 0, comision: 7300, iva: 1533, neto: 29200 })
    expect(e.conCanal).toEqual({ canal: 5475, comision: 6515, iva: 1368, neto: 24510 })
    expect(e.canalPct).toBe(15)
    expect(e.tarifa).toBe("v6")
  })

  it("B · 1.450 € × 72 %: 381.060 € brutos, neto 304.848 € directa y 255.882 € por canal", () => {
    const e = estimar(1450, 72)!
    expect(e.alojamientoAnual).toBe(381060)
    expect(e.directa).toEqual({ canal: 0, comision: 76212, iva: 16005, neto: 304848 })
    expect(e.conCanal).toEqual({ canal: 57159, comision: 68019, iva: 14284, neto: 255882 })
  })

  it("C · 1.000 € × 95 %: los medios euros se redondean hacia arriba y la cuenta visible cuadra", () => {
    const e = estimar(1000, 95)!
    expect(e.alojamientoAnual).toBe(346750)
    expect(e.directa).toEqual({ canal: 0, comision: 69350, iva: 14564, neto: 277400 })
    expect(e.conCanal).toEqual({ canal: 52013, comision: 61895, iva: 12998, neto: 232842 })
  })

  it("en reserva directa manda el tope del 20 %, no el 21 %: la comisión es el 20 % del alojamiento", () => {
    for (const [precio, ocu] of [[200, 50], [1450, 72], [1000, 95], [333, 41]] as const) {
      const e = estimar(precio, ocu)!
      expect(e.directa.comision).toBe(Math.round(e.alojamientoAnual * 0.2))
    }
  })

  it("lo que se ve suma: bruto − canal − comisión = neto, en los dos escenarios", () => {
    for (const [precio, ocu] of [[200, 50], [1450, 72], [1000, 95], [333, 41], [87.5, 63]] as const) {
      const e = estimar(precio, ocu)!
      expect(e.alojamientoAnual - e.directa.canal - e.directa.comision).toBe(e.directa.neto)
      expect(e.alojamientoAnual - e.conCanal.canal - e.conCanal.comision).toBe(e.conCanal.neto)
    }
  })

  it("no se aleja más de 1 € del neto de /propietarios (`netoAnual`), que redondea solo al final", () => {
    for (const [precio, ocu] of [[200, 50], [1450, 72], [1000, 95], [333, 41]] as const) {
      const e = estimar(precio, ocu)!
      const ref = netoAnual(e.alojamientoAnual)
      expect(Math.abs(e.directa.neto - ref.directa)).toBeLessThanOrEqual(1)
      expect(Math.abs(e.conCanal.neto - ref.ota)).toBeLessThanOrEqual(1)
    }
  })

  it("control negativo: con la v3 (24 % plano) el neto directo del caso B sería 289.606 €, que NO es el de la v6", () => {
    expect(Math.round(381060 * (1 - 0.24))).toBe(289606)
    expect(estimar(1450, 72)!.directa.neto).not.toBe(289606)
  })

  it("sin precio o sin ocupación utilizables no hay estimación", () => {
    expect(estimar(0, 50)).toBeNull()
    expect(estimar(-10, 50)).toBeNull()
    expect(estimar(Number.NaN, 50)).toBeNull()
    expect(estimar(200, 0)).toBeNull()
    expect(estimar(200, 101)).toBeNull()
    expect(estimar(200_001, 50)).toBeNull()
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
    if (r.ok) expect(r.lead).toMatchObject({ nombre: "María García", telefono: "+34 600 123 456", municipio: "Estepona", dormitorios: 3 })
  })

  it("el cuerpo para el portal es EXACTAMENTE el contrato de seda_os (leadPropietarioSchema, .strict())", () => {
    const r = validarLead({ ...BASE, consentimiento: true, telefono: "+34 600 123 456", municipio: "Estepona", dormitorios: 3 })
    if (!r.ok) throw new Error("debía aceptarse")
    const c = cuerpoPortal(r.lead)
    expect(Object.keys(c).sort()).toEqual(
      ["consentimiento", "consentimiento_version", "correo", "dormitorios", "municipio", "nombre", "telefono"],
    )
    expect(c.consentimiento).toBe(true)
    expect(c.consentimiento_version).toMatch(/^[A-Za-z0-9._-]{1,40}$/)
    expect(c.correo).toBe(c.correo.toLowerCase())
    // CONTROL NEGATIVO: nada de lo que el portal rechazaría por .strict()
    for (const k of ["email", "origen", "idioma", "estimacion", "propiedad", "website"]) expect(c).not.toHaveProperty(k)
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
    [{ telefono: "abc" }, "invalid_phone"],
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
        telefono: "+34 600 123 456",
        municipio: "Estepona",
        dormitorios: 3,
        consentimiento: true,
        consentimiento_version: expect.stringMatching(/^[A-Za-z0-9._-]{1,40}$/),
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
