import { afterEach, describe, expect, it, vi } from "vitest"
import { LIMITES, topeDiarioPorIp } from "@/lib/asistente/config"
import { almacenMemoria, configUpstash, crearCupos, segundosHastaMedianocheMadrid, type AlmacenCupos } from "@/lib/asistente/cupos"

/*
  MOT-11 (REA-MOTOR §8.6): «el tope diario del asistente es por instancia y
  compartido por todos: un script lo agota y la campaña entera recibe
  tope_diario hasta medianoche».

  Lo que se exige:
    · los contadores viven en un almacén que comparten todas las instancias
      (Upstash): dos `crearCupos` sobre el mismo almacén suman juntos;
    · hay un tope por IP y día; superado, SOLO esa IP recibe tope_diario;
    · la IP no llega al almacén en claro, solo un HMAC, y sus contadores caducan
      a medianoche de Madrid;
    · sin las variables de Upstash, o si Upstash falla, memoria por instancia.
*/

/** Un almacén «compartido» que apunta lo que recibe (lo que vería Upstash). */
function almacenEspia(ahora: () => number) {
  const base = almacenMemoria(ahora)
  const claves: string[] = []
  const ttls: number[] = []
  const a: AlmacenCupos = {
    tipo: "upstash",
    ventana: async (k) => (claves.push(k), base.ventana(k)),
    sumar: async (k, ttl) => (claves.push(k), ttls.push(ttl), base.sumar(k, ttl)),
  }
  return { a, claves, ttls }
}

afterEach(() => vi.restoreAllMocks())

describe("tope diario compartido entre instancias", () => {
  it("dos instancias de la función suman en el mismo contador global", async () => {
    const t = Date.parse("2026-11-08T10:00:00Z")
    const { a } = almacenEspia(() => t)
    const env = { SEDA_ASISTENTE_TOPE_DIARIO: "3" }
    const i1 = crearCupos({ ahora: () => t, env, almacen: a, claveResumen: "k" })
    const i2 = crearCupos({ ahora: () => t, env, almacen: a, claveResumen: "k" })
    expect(await i1.diario("10.0.0.1")).toBe("ok")
    expect(await i2.diario("10.0.0.2")).toBe("ok")
    expect(await i1.diario("10.0.0.3")).toBe("ok")
    expect(await i2.diario("10.0.0.4")).toBe("tope_global") // por instancia, cada una habría dejado 3
  })

  it("la ventana por visitante también se comparte", async () => {
    const t = 5_000_000
    const { a } = almacenEspia(() => t)
    const i1 = crearCupos({ ahora: () => t, env: {}, almacen: a, claveResumen: "k" })
    const i2 = crearCupos({ ahora: () => t, env: {}, almacen: a, claveResumen: "k" })
    for (let i = 0; i < LIMITES.turnosPorVisitante; i++) expect(await (i % 2 ? i1 : i2).visitante("10.0.0.9")).toBe(true)
    expect(await i1.visitante("10.0.0.9")).toBe(false)
    expect(await i2.visitante("10.0.0.9")).toBe(false)
  })
})

describe("tope por IP y día", () => {
  it("superado el de una IP, solo esa IP recibe tope_diario; las demás siguen", async () => {
    const t = Date.parse("2026-11-08T10:00:00Z")
    const env = { SEDA_ASISTENTE_TOPE_DIARIO_IP: "2", SEDA_ASISTENTE_TOPE_DIARIO: "100" }
    const c = crearCupos({ ahora: () => t, env, almacen: almacenEspia(() => t).a, claveResumen: "k" })
    expect(await c.diario("198.51.100.7")).toBe("ok")
    expect(await c.diario("198.51.100.7")).toBe("ok")
    expect(await c.diario("198.51.100.7")).toBe("tope_ip")
    expect(await c.diario("198.51.100.8")).toBe("ok")
  })

  it("el script que agota su IP no gasta el tope global de los demás", async () => {
    const t = Date.parse("2026-11-08T10:00:00Z")
    const env = { SEDA_ASISTENTE_TOPE_DIARIO_IP: "5", SEDA_ASISTENTE_TOPE_DIARIO: "10" }
    const c = crearCupos({ ahora: () => t, env, almacen: almacenEspia(() => t).a, claveResumen: "k" })
    for (let i = 0; i < 500; i++) await c.diario("203.0.113.66")
    for (let i = 0; i < 5; i++) expect(await c.diario(`192.0.2.${i}`)).toBe("ok")
  })

  it("SEDA_ASISTENTE_TOPE_DIARIO_IP: 60 por defecto, entero positivo", () => {
    expect(topeDiarioPorIp({})).toBe(60)
    expect(topeDiarioPorIp({ SEDA_ASISTENTE_TOPE_DIARIO_IP: "30" })).toBe(30)
    expect(topeDiarioPorIp({ SEDA_ASISTENTE_TOPE_DIARIO_IP: "0" })).toBe(60)
    expect(topeDiarioPorIp({ SEDA_ASISTENTE_TOPE_DIARIO_IP: "x" })).toBe(60)
    expect(topeDiarioPorIp({})).toBeGreaterThanOrEqual(LIMITES.turnosPorConversacion * 4)
  })
})

describe("la IP, solo como resumen criptográfico y con caducidad corta", () => {
  it("ninguna clave del almacén lleva la IP; el resumen es un HMAC que depende de la clave secreta", async () => {
    const t = Date.parse("2026-11-08T10:00:00Z")
    const e1 = almacenEspia(() => t)
    const e2 = almacenEspia(() => t)
    const c1 = crearCupos({ ahora: () => t, env: {}, almacen: e1.a, claveResumen: "secreto-1" })
    const c2 = crearCupos({ ahora: () => t, env: {}, almacen: e2.a, claveResumen: "secreto-2" })
    for (const c of [c1, c2]) {
      await c.visitante("198.51.100.23")
      await c.diario("198.51.100.23")
    }
    for (const k of [...e1.claves, ...e2.claves]) {
      expect(k).not.toContain("198.51.100.23")
      expect(k).not.toMatch(/198\.51|51\.100/)
    }
    const hash = (cl: string[]) => cl.find((k) => k.includes(":ip:"))!.split(":ip:")[1]
    expect(hash(e1.claves)).toMatch(/^[0-9a-f]{32}$/)
    expect(hash(e1.claves)).not.toBe(hash(e2.claves))
  })

  it("los contadores diarios caducan en la medianoche de Madrid (+60 s)", async () => {
    const t = Date.parse("2026-11-08T22:00:00Z") // 23:00 en Madrid (CET, UTC+1)
    const e = almacenEspia(() => t)
    await crearCupos({ ahora: () => t, env: {}, almacen: e.a, claveResumen: "k" }).diario("192.0.2.1")
    expect(e.ttls).toEqual([3600 + 60, 3600 + 60])
  })

  it("segundosHastaMedianocheMadrid: invierno, verano y los dos cambios de hora (comprobado a mano)", () => {
    expect(segundosHastaMedianocheMadrid(Date.parse("2026-11-08T22:00:00Z"))).toBe(3600) // 23:00 CET
    expect(segundosHastaMedianocheMadrid(Date.parse("2026-07-15T21:30:00Z"))).toBe(1800) // 23:30 CEST
    // 29-mar-2026: a las 02:00 CET pasa a 03:00 CEST; el día dura 23 h. A las 00:00 CET (23:00Z del 28) faltan 23 h.
    expect(segundosHastaMedianocheMadrid(Date.parse("2026-03-28T23:00:00Z"))).toBe(23 * 3600)
    // 25-oct-2026: a las 03:00 CEST vuelve a 02:00 CET; el día dura 25 h. A las 00:00 CEST (22:00Z del 24) faltan 25 h.
    expect(segundosHastaMedianocheMadrid(Date.parse("2026-10-24T22:00:00Z"))).toBe(25 * 3600)
    // Y al mediodía de esos días (después del cambio): 12 h.
    expect(segundosHastaMedianocheMadrid(Date.parse("2026-03-29T10:00:00Z"))).toBe(12 * 3600)
    expect(segundosHastaMedianocheMadrid(Date.parse("2026-10-25T11:00:00Z"))).toBe(12 * 3600)
  })
})

describe("sin Upstash, o si Upstash falla: memoria por instancia", () => {
  it("configUpstash: hacen falta las dos variables y https", () => {
    expect(configUpstash({})).toBeNull()
    expect(configUpstash({ UPSTASH_REDIS_REST_URL: "https://x.upstash.io" })).toBeNull()
    expect(configUpstash({ UPSTASH_REDIS_REST_TOKEN: "t" })).toBeNull()
    expect(configUpstash({ UPSTASH_REDIS_REST_URL: "http://x.upstash.io", UPSTASH_REDIS_REST_TOKEN: "t" })).toBeNull()
    expect(configUpstash({ UPSTASH_REDIS_REST_URL: "https://x.upstash.io", UPSTASH_REDIS_REST_TOKEN: "t" })).toEqual({ url: "https://x.upstash.io", token: "t" })
  })

  it("sin variables: almacén en memoria", async () => {
    expect(await crearCupos({ env: {} }).tipo()).toBe("memoria")
  })

  it("Upstash que falla: la petición sigue con los límites en memoria y un console.error sin la IP", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {})
    const roto: AlmacenCupos = {
      tipo: "upstash",
      ventana: async () => {
        throw new Error("ECONNRESET 198.51.100.4")
      },
      sumar: async () => {
        throw new Error("ECONNRESET")
      },
    }
    const c = crearCupos({ env: { SEDA_ASISTENTE_TOPE_DIARIO: "1" }, almacen: roto, claveResumen: "k" })
    expect(await c.visitante("198.51.100.4")).toBe(true)
    expect(await c.diario("198.51.100.4")).toBe("ok")
    expect(await c.diario("198.51.100.5")).toBe("tope_global") // la memoria cuenta
    expect(err).toHaveBeenCalled()
    expect(JSON.stringify(err.mock.calls)).not.toContain("198.51.100")
  })
})

describe("almacenUpstash: @upstash/ratelimit para la ventana, INCR + EXPIRE para el día", () => {
  it("usa una ventana deslizante con los límites del asistente y un pipeline incr/expire", async () => {
    const llamadas: unknown[][] = []
    vi.doMock("@upstash/redis", () => ({
      Redis: class {
        constructor(o: unknown) {
          llamadas.push(["redis", o])
        }
        pipeline() {
          const ops: unknown[][] = []
          const p = {
            incr: (k: string) => (ops.push(["incr", k]), p),
            expire: (k: string, s: number) => (ops.push(["expire", k, s]), p),
            exec: async () => (llamadas.push(["exec", ops]), [7, 1]),
          }
          return p
        }
      },
    }))
    vi.doMock("@upstash/ratelimit", () => ({
      Ratelimit: Object.assign(
        class {
          constructor(o: { limiter: unknown; prefix: string }) {
            llamadas.push(["ratelimit", o.limiter, o.prefix])
          }
          async limit(k: string) {
            llamadas.push(["limit", k])
            return { success: false }
          }
        },
        { slidingWindow: (n: number, v: string) => ({ n, v }) },
      ),
    }))
    vi.resetModules()
    const { almacenUpstash } = await import("@/lib/asistente/cupos")
    const a = await almacenUpstash({ url: "https://x.upstash.io", token: "t" })
    expect(a.tipo).toBe("upstash")
    expect(await a.ventana("abc")).toBe(false)
    expect(await a.sumar("clave", 120)).toBe(7)
    expect(llamadas).toContainEqual(["ratelimit", { n: LIMITES.turnosPorVisitante, v: `${LIMITES.ventanaVisitanteMs / 1000} s` }, "seda-web:asistente:visitante"])
    expect(llamadas).toContainEqual(["exec", [["incr", "clave"], ["expire", "clave", 120]]])
    vi.doUnmock("@upstash/redis")
    vi.doUnmock("@upstash/ratelimit")
  })
})
