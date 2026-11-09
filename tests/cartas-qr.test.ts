import { createHash, createHmac } from "node:crypto"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { CARTA_MAX, capturarCarta, separarCarta, tomarCarta } from "@/lib/carta-qr"
import { cuerpoLeadCapi } from "@/lib/meta-capi"
import { crearPixel, type DocumentoMeta, type VentanaMeta } from "@/lib/meta-pixel-cliente"
import { PRIVACIDAD } from "@/lib/legal/privacidad"
import { variantesConMeta } from "@/lib/legal/meta"
import { cuerpoPortal, validarLead } from "@/lib/lead-propietario"

/*
  Cartas-QR (plan «Motor SEDA», fase 1): ?carta= de la calculadora → seda_os.

  Los literales (campos, 40 caracteres, "calculadora") son del encargo y del
  contrato de seda_os #1150, no de lo que escribió el código. La firma se
  recalcula aquí con node:crypto a pelo.
*/

const SECRETO = "secreto-de-prueba-de-seda-web-no-es-real-0123456789"
const URL_PORTAL = "https://portal.sedaprivatehomes.com/api/leads/propietario"
const CODIGO = "k7Qm-2xPz_9" // aleatorio de ejemplo
let seq = 0

const LEAD = {
  nombre: "María García", email: "maria@example.com", telefono: "+34 600 123 456", consentimiento: true,
  locale: "es", municipio: "Estepona", dormitorios: 3, precioNoche: 200, ocupacionPct: 50, website: "",
}

function peticion(extra: Record<string, unknown> = {}, cab: Record<string, string> = {}) {
  return new Request("https://sedaprivatehomes.com/api/leads/propietario", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://sedaprivatehomes.com",
      referer: "https://sedaprivatehomes.com/propietarios/calculadora",
      "x-forwarded-for": `198.51.100.${(seq += 1)}`,
      ...cab,
    },
    body: JSON.stringify({ ...LEAD, ...extra }),
  })
}

async function cargarRuta() {
  vi.resetModules()
  return import("@/app/api/leads/propietario/route")
}

describe("ruta: canal y carta en el cuerpo firmado", () => {
  let fetchMock: ReturnType<typeof vi.fn>
  beforeEach(() => {
    fetchMock = vi.fn(async () => new Response("{}", { status: 201 }))
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

  const enviado = () => {
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    return { url, init, cuerpo: JSON.parse(String(init.body)) as Record<string, unknown> }
  }

  it("con carta → el cuerpo lleva carta (tal cual) y canal «calculadora», y la firma cubre ese cuerpo", async () => {
    const { POST } = await cargarRuta()
    expect((await POST(peticion({ carta: CODIGO }))).status).toBe(200)
    const { url, init, cuerpo } = enviado()
    expect(url).toBe(URL_PORTAL)
    expect(cuerpo.carta).toBe(CODIGO)
    expect(cuerpo.canal).toBe("calculadora")
    const cab = new Headers(init.headers)
    const ts = cab.get("x-timestamp") ?? ""
    const hash = createHash("sha256").update(String(init.body), "utf8").digest("hex")
    const firma = createHmac("sha256", SECRETO).update(`POST|/api/leads/propietario|${ts}|${hash}`).digest("hex")
    expect(cab.get("authorization")).toBe(`HMAC-Lead ${firma}`)
    expect(cab.get("x-visitor-ip")).toMatch(/^198\.51\.100\./)
  })

  it("sin carta → solo canal, sin la clave carta", async () => {
    const { POST } = await cargarRuta()
    await POST(peticion())
    const { cuerpo } = enviado()
    expect(cuerpo.canal).toBe("calculadora")
    expect(cuerpo).not.toHaveProperty("carta")
  })

  it("el código no se valida ni se limpia: espacios, mayúsculas y símbolos llegan intactos", async () => {
    const { POST } = await cargarRuta()
    await POST(peticion({ carta: " Ab/1+é " }))
    expect(enviado().cuerpo.carta).toBe(" Ab/1+é ")
  })

  it(`40 caracteres → se manda; ${CARTA_MAX + 1} → no se manda (y el lead sí)`, async () => {
    const { POST } = await cargarRuta()
    const justo = "a".repeat(40)
    expect((await POST(peticion({ carta: justo }))).status).toBe(200)
    expect(enviado().cuerpo.carta).toBe(justo)
    fetchMock.mockClear()
    expect((await POST(peticion({ carta: "a".repeat(41) }))).status).toBe(200)
    expect(enviado().cuerpo).not.toHaveProperty("carta")
  })

  it.each([[""], [5], [null], [["x"]]])("carta %j (vacía o no es texto) → no se manda", async (carta) => {
    const { POST } = await cargarRuta()
    expect((await POST(peticion({ carta }))).status).toBe(200)
    expect(enviado().cuerpo).not.toHaveProperty("carta")
  })

  it("ninguna cifra de la estimación ni otra clave nueva viaja a seda_os", async () => {
    const { POST } = await cargarRuta()
    await POST(peticion({ carta: CODIGO }))
    expect(Object.keys(enviado().cuerpo).sort()).toEqual(
      ["canal", "carta", "consentimiento", "consentimiento_version", "correo", "dormitorios", "idioma", "municipio", "nombre", "telefono"],
    )
  })

  it("una clave desconocida sigue dando 400", async () => {
    const { POST } = await cargarRuta()
    const r = await POST(peticion({ cartas: CODIGO }))
    expect(r.status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("el honeypot sigue descartando sin enviar, también con carta", async () => {
    const { POST } = await cargarRuta()
    expect((await POST(peticion({ carta: CODIGO, website: "bot" }))).status).toBe(200)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("Meta: ni el Lead del navegador ni el de la CAPI llevan el código", async () => {
    vi.stubEnv("SEDA_FLAG_META_PIXEL", "1")
    vi.stubEnv("NEXT_PUBLIC_META_PIXEL_ID", "123456789012345")
    vi.stubEnv("SEDA_FLAG_META_CAPI", "1")
    vi.stubEnv("META_CAPI_TOKEN", "EAAB-token-de-prueba-" + "z".repeat(40))
    fetchMock.mockImplementation(async (url: string) =>
      new Response(url === URL_PORTAL ? "{}" : '{"events_received":1}', { status: url === URL_PORTAL ? 201 : 200 }))
    const { POST } = await cargarRuta()
    // El Referer llega CON ?carta= (por ejemplo, de una pestaña que no limpió la URL): la CAPI no lo usa.
    const r = await POST(peticion({ carta: CODIGO }, { "x-consent-marketing": "1", referer: `https://sedaprivatehomes.com/propietarios/calculadora?carta=${CODIGO}` }))
    const cuerpoRespuesta = JSON.stringify(await r.json())
    await new Promise((ok) => setTimeout(ok, 30))
    expect(cuerpoRespuesta).not.toContain(CODIGO)
    const aMeta = fetchMock.mock.calls.filter(([u]) => String(u).includes("graph.facebook.com"))
    expect(aMeta).toHaveLength(1)
    expect(String((aMeta[0] as [string, RequestInit])[1].body)).not.toContain(CODIGO)
  })
})

describe("cuerpoLeadCapi no tiene dónde llevar el código", () => {
  it("solo URL sin query, y ninguna clave de carta", () => {
    const c = cuerpoLeadCapi({ eventId: "id", urlOrigen: "https://sedaprivatehomes.com/propietarios/calculadora" })
    expect(JSON.stringify(c)).not.toMatch(/carta/i)
  })
})

describe("validarLead / cuerpoPortal", () => {
  it("carta válida se conserva en el lead y en el cuerpo; el canal va siempre", () => {
    const r = validarLead({ ...LEAD, carta: CODIGO })
    if (!r.ok) throw new Error("debía aceptarse")
    expect(cuerpoPortal(r.lead)).toMatchObject({ canal: "calculadora", carta: CODIGO })
  })
})

describe("navegador: ?carta= sale de la URL al leerlo", () => {
  function pantalla(url: string) {
    const u = new URL(url)
    const reemplazos: string[] = []
    const win = {
      location: { pathname: u.pathname, search: u.search, hash: u.hash },
      history: { state: { n: 1 }, replaceState: vi.fn((_s: unknown, _t: string, nueva?: string | null) => { reemplazos.push(String(nueva)) }) },
    }
    return { win, reemplazos }
  }

  afterEach(() => { tomarCarta() })

  it("lee el código, lo guarda en memoria y deja la URL sin ?carta= (conserva otros parámetros y el hash)", () => {
    const { win, reemplazos } = pantalla(`https://sedaprivatehomes.com/en/propietarios/calculadora?carta=${CODIGO}&utm_source=carta#form`)
    capturarCarta(win)
    expect(reemplazos).toEqual(["/en/propietarios/calculadora?utm_source=carta#form"])
    expect(reemplazos[0]).not.toContain(CODIGO)
    expect(win.history.replaceState.mock.calls[0][0]).toEqual({ n: 1 }) // conserva el estado del router
    expect(tomarCarta()).toBe(CODIGO)
    expect(tomarCarta()).toBeNull() // una sola lectura
  })

  it("sin ?carta= no toca la URL ni guarda nada", () => {
    const { win } = pantalla("https://sedaprivatehomes.com/propietarios/calculadora?x=1")
    capturarCarta(win)
    expect(win.history.replaceState).not.toHaveBeenCalled()
    expect(tomarCarta()).toBeNull()
  })

  it("en otra página no hace nada (aunque traiga ?carta=)", () => {
    const { win } = pantalla(`https://sedaprivatehomes.com/propietarios?carta=${CODIGO}`)
    capturarCarta(win)
    expect(win.history.replaceState).not.toHaveBeenCalled()
    expect(tomarCarta()).toBeNull()
  })

  it("?carta= vacío se quita de la URL y no cuenta como código", () => {
    const { win, reemplazos } = pantalla("https://sedaprivatehomes.com/propietarios/calculadora?carta=")
    capturarCarta(win)
    expect(reemplazos).toEqual(["/propietarios/calculadora"])
    expect(tomarCarta()).toBeNull()
  })

  it("separarCarta devuelve el valor decodificado sin recortarlo", () => {
    expect(separarCarta("?carta=%20a%2Fb%20").carta).toBe(" a/b ")
  })

  it("el píxel ya consentido no ve el código: capturar antes de cargar deja la URL limpia cuando fbevents arranca", () => {
    const { win } = pantalla(`https://sedaprivatehomes.com/propietarios/calculadora?carta=${CODIGO}`)
    // Lo que fbevents.js leería (location.href) en el momento de cargar el script.
    const hrefAlCargar: string[] = []
    const ventana: VentanaMeta = {}
    const doc: DocumentoMeta = {
      createElement: () => ({ async: false, src: "" }),
      head: { appendChild: () => { hrefAlCargar.push(win.location.pathname + win.location.search) } },
      cookie: "",
    }
    capturarCarta(win)
    // replaceState simulado: la ubicación pasa a ser la limpia
    win.location.search = ""
    crearPixel({ id: "123456789012345", win: ventana, doc, host: "sedaprivatehomes.com" }).activar()
    expect(hrefAlCargar).toEqual(["/propietarios/calculadora"])
  })
})

describe("política de privacidad: la línea de las cartas con QR, en los cuatro idiomas", () => {
  const FRAGMENTO: Record<string, RegExp> = {
    es: /desde el código QR de la carta[\s\S]*vinculamos tu solicitud a esa carta mientras exista el envío/,
    en: /from the QR code on the letter[\s\S]*link your request to that letter for as long as the mailing exists/,
    fr: /depuis le code QR du courrier[\s\S]*rattachons votre demande à ce courrier tant que l'envoi existe/,
    de: /über den QR-Code auf dem Brief[\s\S]*verknüpfen Ihre Anfrage mit diesem Brief, solange die Sendung besteht/,
  }
  for (const doc of [PRIVACIDAD, variantesConMeta(true).privacidad]) {
    for (const locale of ["es", "en", "fr", "de"] as const) {
      it(`${doc === PRIVACIDAD ? "base" : "con Meta"} / ${locale}: en la sección de cartas`, () => {
        const s = doc.traducciones[locale].secciones.find((x) => x.id === "cartas")
        expect(JSON.stringify(s)).toMatch(FRAGMENTO[locale])
      })
    }
  }
  it("la fecha de la política está al día (2026-11-09, ASISTENTE-EN-PORTADA) y es la que viaja como consentimiento_version", () => {
    expect(PRIVACIDAD.actualizado).toBe("2026-11-09")
    const r = validarLead(LEAD)
    if (!r.ok) throw new Error("debía aceptarse")
    expect(cuerpoPortal(r.lead).consentimiento_version).toBe("2026-11-09")
  })
})
