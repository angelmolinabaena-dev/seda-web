import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

/*
  app/api/contact/route.ts no exporta isValidEmail, rateLimit ni clientKey, y no
  puede: Next rechaza en el build cualquier export de un route.ts que no sea un
  verbo HTTP o una opción de segmento. Así que se prueban por donde entran de
  verdad: el POST. Sin RESEND_API_KEY y fuera de producción el handler responde
  200 + mode:"mock" sin llamar a nadie, que es lo que hace de "acepta" medible.

  Los veredictos de la tabla de email son los que el código da HOY, no los que
  Ángel querría. Si decide quitar el apóstrofo de FORBIDDEN_IN_EMAIL, los dos
  casos marcados abajo se ponen rojos y hay que cambiarlos a mano. Esa es la
  señal, no un estorbo.
*/

type Route = typeof import("@/app/api/contact/route")

let seq = 0
/** Una IP distinta por llamada: el rate limit es estado de módulo. */
const freshIp = () => `203.0.113.${(seq += 1)}`

async function loadRoute(): Promise<Route> {
  vi.resetModules() // estado de `hits` limpio
  return import("@/app/api/contact/route")
}

function contactRequest(
  fields: Record<string, unknown>,
  headers: Record<string, string> = {},
  body?: string,
) {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: body ?? JSON.stringify({ type: "guest", fields }),
  })
}

beforeEach(() => {
  vi.stubEnv("RESEND_API_KEY", "")
  vi.stubEnv("VERCEL_ENV", "")
  vi.spyOn(console, "log").mockImplementation(() => {})
  vi.spyOn(console, "warn").mockImplementation(() => {})
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

// ── (a) isValidEmail ────────────────────────────────────────────────────────

describe("/api/contact — validación del email (isValidEmail)", () => {
  const ACEPTA = [
    "angel@sedaprivatehomes.com",
    "maria.lopez+reserva@gmail.com",
  ]
  const RECHAZA = [
    "sin-arroba.com",
    "dos@@arrobas.com",
    "lead@example.com,attacker@evil.tld", // inyección de destinatario
    "lead@example.com;attacker@evil.tld",
    "con espacio@example.com",
    "<a@example.com>",
    "a@example",
    ".punto@example.com",
    "",
  ]

  it.each(ACEPTA)("acepta %s", async (email) => {
    const { POST } = await loadRoute()
    const res = await POST(contactRequest({ email }, { "x-forwarded-for": freshIp() }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true, mode: "mock" })
  })

  it.each(RECHAZA)("rechaza %j", async (email) => {
    const { POST } = await loadRoute()
    const res = await POST(contactRequest({ email }, { "x-forwarded-for": freshIp() }))
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ ok: false, error: "invalid_email" })
  })

  /*
    LOS DOS APELLIDOS — el hallazgo del 19-sep, ya corregido.

    EMAIL_RE permite el apóstrofo (está en su clase de caracteres, RFC 5322) y
    FORBIDDEN_IN_EMAIL lo prohibía: ganaba la segunda y estos dos rebotaban con
    400. Nadie lo había pedido — SEDA-WEB-CONTACT-HARDENING §1 pedía rechazar
    «comas, punto y coma, saltos de línea, espacios».

    Se retiró de la lista el 20-sep-2026. Medido antes de decidir: al quitarlo,
    los otros 54 tests siguieron verdes, incluido el de la inyección de
    destinatario (lead@…,attacker@…), que es lo que el hardening protegía.

    Si esto se pone rojo, alguien ha vuelto a meter el apóstrofo en
    FORBIDDEN_IN_EMAIL. No lo des por bueno: lee el comentario de route.ts.
  */
  it.each(["o'brien@gmail.com", "d'angelo@libero.it"])(
    "acepta %s (apellido con apóstrofo)",
    async (email) => {
      const { POST } = await loadRoute()
      const res = await POST(contactRequest({ email }, { "x-forwarded-for": freshIp() }))
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual({ ok: true, mode: "mock" })
    },
  )

  it("la longitud máxima del email es 254 y la del local-part 64", async () => {
    const { POST } = await loadRoute()
    const send = (email: string) =>
      POST(contactRequest({ email }, { "x-forwarded-for": freshIp() })).then((r) => r.status)

    const local64 = "a".repeat(64)
    // 64 + 1 + dominio hasta 254 en total
    const dominio = (n: number) => {
      const labels: string[] = []
      let left = n
      while (left > 0) {
        const l = Math.min(left, 60)
        labels.push("b".repeat(l))
        left -= l + 1
      }
      return labels.join(".") + ".com"
    }
    const justo = `${local64}@${dominio(150)}`
    expect(justo.length).toBeLessThanOrEqual(254)
    expect(await send(justo)).toBe(200)
    expect(await send(`${"a".repeat(65)}@example.com`)).toBe(400)
    const largo = `a@${dominio(255)}`
    expect(largo.length).toBeGreaterThan(254)
    expect(await send(largo)).toBe(400) // etiquetas válidas: sólo lo tumba la longitud total
  })
})

// ── (b) rate limit ──────────────────────────────────────────────────────────

describe("/api/contact — rate limit (5 por ventana de 10 min)", () => {
  const T0 = new Date("2026-09-20T10:00:00Z")
  const MIN = 60_000
  // Email inválido a propósito: el rate limit corre ANTES de validar, así que
  // cada intento cuenta igual y no se ejecuta ningún envío.
  const hit = (POST: Route["POST"], headers: Record<string, string>) =>
    POST(contactRequest({ email: "no-es-un-email" }, headers))

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(T0)
  })

  it("el 5º pasa y el 6º no (429 + Retry-After)", async () => {
    const { POST } = await loadRoute()
    const h = { "x-forwarded-for": "198.51.100.7" }
    for (let i = 1; i <= 5; i++) {
      expect((await hit(POST, h)).status, `intento ${i}`).toBe(400) // pasa el limit, cae en invalid_email
    }
    const sexto = await hit(POST, h)
    expect(sexto.status).toBe(429)
    expect(await sexto.json()).toEqual({ ok: false, error: "rate_limited" })
    expect(sexto.headers.get("Retry-After")).toBe("600")
  })

  it("una IP no gasta el cupo de otra", async () => {
    const { POST } = await loadRoute()
    for (let i = 0; i < 6; i++) await hit(POST, { "x-forwarded-for": "198.51.100.7" })
    expect((await hit(POST, { "x-forwarded-for": "198.51.100.8" })).status).toBe(400)
  })

  it("Retry-After baja con el tiempo y se cuenta desde el envío más antiguo", async () => {
    const { POST } = await loadRoute()
    const h = { "x-forwarded-for": "198.51.100.7" }
    await hit(POST, h) // t0: el más antiguo
    vi.advanceTimersByTime(3 * MIN)
    for (let i = 0; i < 4; i++) await hit(POST, h) // completa 5 a t0+3min
    vi.advanceTimersByTime(1 * MIN) // t0+4min
    const r = await hit(POST, h)
    expect(r.status).toBe(429)
    // El más antiguo cae de la ventana a t0+10min → faltan 6 min = 360 s.
    expect(r.headers.get("Retry-After")).toBe("360")
  })

  it("la ventana expira: justo antes sigue cerrado, en el límite se abre", async () => {
    const { POST } = await loadRoute()
    const h = { "x-forwarded-for": "198.51.100.7" }
    for (let i = 0; i < 5; i++) await hit(POST, h)

    vi.advanceTimersByTime(10 * MIN - 1)
    const antes = await hit(POST, h)
    expect(antes.status).toBe(429)
    expect(antes.headers.get("Retry-After")).toBe("1") // suelo de 1 s, nunca 0

    vi.advanceTimersByTime(1) // t0 + 10 min exactos
    expect((await hit(POST, h)).status).toBe(400)
  })

  it("una vez expirada la ventana vuelven a caber 5", async () => {
    const { POST } = await loadRoute()
    const h = { "x-forwarded-for": "198.51.100.7" }
    for (let i = 0; i < 6; i++) await hit(POST, h)
    vi.advanceTimersByTime(10 * MIN)
    for (let i = 1; i <= 5; i++) expect((await hit(POST, h)).status, `intento ${i}`).toBe(400)
    expect((await hit(POST, h)).status).toBe(429)
  })

  describe("clientKey", () => {
    it("usa la PRIMERA IP de x-forwarded-for", async () => {
      const { POST } = await loadRoute()
      const h = (n: number) => ({ "x-forwarded-for": `198.51.100.7, 10.0.0.${n}` })
      for (let i = 1; i <= 5; i++) await hit(POST, h(i))
      // Mismo cliente aunque cambien los saltos intermedios.
      expect((await hit(POST, h(99))).status).toBe(429)
    })

    it("sin x-forwarded-for cae en x-real-ip", async () => {
      const { POST } = await loadRoute()
      const h = { "x-real-ip": "198.51.100.9" }
      for (let i = 0; i < 5; i++) await hit(POST, h)
      expect((await hit(POST, h)).status).toBe(429)
      expect((await hit(POST, { "x-real-ip": "198.51.100.10" })).status).toBe(400)
    })

    /*
      DOCUMENTA UN DEFECTO DE DISEÑO, no un comportamiento deseable. Sin
      x-forwarded-for ni x-real-ip la clave es la cadena "unknown", idéntica
      para todos: cinco envíos de CUALQUIER visitante sin cabecera cierran el
      formulario para todos los demás durante diez minutos. Si alguien lo
      arregla (p. ej. rechazando o dejando pasar sin clave), este test se pone
      rojo y hay que cambiarlo. Alcanzabilidad en Vercel: ver el parte.
    */
    it("sin ninguna de las dos cabeceras TODOS comparten la clave \"unknown\"", async () => {
      const { POST } = await loadRoute()
      for (let i = 1; i <= 5; i++) {
        // cinco "visitantes" distintos, ninguno distinguible
        expect((await hit(POST, { "user-agent": `visitante-${i}` })).status).toBe(400)
      }
      const sexto = await hit(POST, { "user-agent": "visitante-6" })
      expect(sexto.status).toBe(429)

      // y "unknown" no se cuela en el cupo de quien SÍ trae IP
      expect((await hit(POST, { "x-forwarded-for": "198.51.100.7" })).status).toBe(400)
    })
  })
})

// ── (d) límites de tamaño ───────────────────────────────────────────────────

describe("/api/contact — límites de tamaño", () => {
  // Valores de route.ts. Si cambian allí, estos números tienen que cambiar
  // aquí A MANO: el test es la copia independiente, no una lectura del código.
  const MAX_BODY_BYTES = 16 * 1024
  const MAX_FIELDS = 20
  const MAX_KEY_LENGTH = 64
  const MAX_VALUE_LENGTH = 4000

  const send = async (fields: Record<string, unknown>) => {
    const { POST } = await loadRoute()
    return POST(contactRequest(fields, { "x-forwarded-for": freshIp() }))
  }
  const ok = { email: "angel@sedaprivatehomes.com" }

  describe("MAX_FIELDS", () => {
    const con = (n: number) => ({
      ...ok,
      ...Object.fromEntries(Array.from({ length: n - 1 }, (_, i) => [`k${i}`, "v"])),
    })
    it("20 campos pasa", async () => {
      expect((await send(con(MAX_FIELDS))).status).toBe(200)
    })
    it("21 campos no", async () => {
      const res = await send(con(MAX_FIELDS + 1))
      expect(res.status).toBe(400)
      expect(await res.json()).toEqual({ ok: false, error: "too_many_fields" })
    })
  })

  describe("MAX_KEY_LENGTH", () => {
    it("clave de 64 pasa", async () => {
      expect((await send({ ...ok, ["k".repeat(MAX_KEY_LENGTH)]: "v" })).status).toBe(200)
    })
    it("clave de 65 no", async () => {
      const res = await send({ ...ok, ["k".repeat(MAX_KEY_LENGTH + 1)]: "v" })
      expect(res.status).toBe(400)
      expect(await res.json()).toEqual({ ok: false, error: "invalid_field_name" })
    })
    it("clave vacía no", async () => {
      const res = await send({ ...ok, "": "v" })
      expect(res.status).toBe(400)
      expect(await res.json()).toEqual({ ok: false, error: "invalid_field_name" })
    })
  })

  describe("MAX_VALUE_LENGTH", () => {
    it("valor de 4000 pasa", async () => {
      expect((await send({ ...ok, message: "m".repeat(MAX_VALUE_LENGTH) })).status).toBe(200)
    })
    it("valor de 4001 no (se rechaza, no se trunca)", async () => {
      const res = await send({ ...ok, message: "m".repeat(MAX_VALUE_LENGTH + 1) })
      expect(res.status).toBe(400)
      expect(await res.json()).toEqual({ ok: false, error: "field_too_long" })
    })
  })

  describe("MAX_BODY_BYTES", () => {
    it("un cuerpo de 16 KiB exactos pasa el límite de tamaño", async () => {
      const { POST } = await loadRoute()
      const exacto = padTo(MAX_BODY_BYTES)
      expect(new TextEncoder().encode(exacto).length).toBe(MAX_BODY_BYTES)
      const res = await POST(contactRequest({}, { "x-forwarded-for": freshIp() }, exacto))
      expect(res.status).toBe(200)
    })

    it("16 KiB + 1 byte no: 413 aunque no declare content-length", async () => {
      const { POST } = await loadRoute()
      const uno = padTo(MAX_BODY_BYTES + 1)
      expect(new TextEncoder().encode(uno).length).toBe(MAX_BODY_BYTES + 1)
      const res = await POST(contactRequest({}, { "x-forwarded-for": freshIp() }, uno))
      expect(res.status).toBe(413)
      expect(await res.json()).toEqual({ ok: false, error: "payload_too_large" })
    })

    it("un content-length declarado por encima corta antes de leer el cuerpo", async () => {
      const { POST } = await loadRoute()
      const res = await POST(
        contactRequest(ok, {
          "x-forwarded-for": freshIp(),
          "content-length": String(MAX_BODY_BYTES + 1),
        }),
      )
      expect(res.status).toBe(413)
    })

    it("cuenta BYTES, no caracteres: 2 bytes por «ñ»", async () => {
      const { POST } = await loadRoute()
      // 8200 caracteres = 16400 bytes > 16384, repartidos en valores válidos (<4000).
      const ñ = "ñ".repeat(2000)
      const fields = { email: "angel@sedaprivatehomes.com", a: ñ, b: ñ, c: ñ, d: ñ, e: "ñ".repeat(200) }
      const cuerpo = JSON.stringify({ type: "guest", fields })
      expect(cuerpo.length).toBeLessThan(MAX_BODY_BYTES) // en caracteres cabría…
      expect(new TextEncoder().encode(cuerpo).length).toBeGreaterThan(MAX_BODY_BYTES) // …en bytes no
      const res = await POST(contactRequest({}, { "x-forwarded-for": freshIp() }, cuerpo))
      expect(res.status).toBe(413)
    })

    /**
     * JSON válido de exactamente `bytes` bytes (ASCII). El relleno se reparte
     * en campos p0..p4 de hasta MAX_VALUE_LENGTH: así sólo el tamaño total del
     * cuerpo puede hacer saltar el límite, no el de un valor.
     */
    function padTo(bytes: number) {
      const armar = (largos: number[]) =>
        JSON.stringify({
          type: "guest",
          fields: {
            email: "angel@sedaprivatehomes.com",
            ...Object.fromEntries(largos.map((n, i) => [`p${i}`, "x".repeat(n)])),
          },
        })
      const largos = [0, 0, 0, 0, 0]
      let falta = bytes - new TextEncoder().encode(armar(largos)).length
      for (let i = 0; falta > 0; i++) {
        largos[i] = Math.min(falta, MAX_VALUE_LENGTH)
        falta -= largos[i]
      }
      return armar(largos)
    }
  })
})
