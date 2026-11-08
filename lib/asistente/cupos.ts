import { createHmac, randomBytes } from "node:crypto"
import { crearLimitador } from "@/lib/api-guards"
import { hoyMadrid } from "@/lib/calculadora-propietarios"
import { LIMITES, topeDiario, topeDiarioPorIp } from "./config"

/*
  Cupos del asistente: cada turno cuesta dinero.

  · Por visitante (IP): LIMITES.turnosPorVisitante por ventana deslizante de
    LIMITES.ventanaVisitanteMs.
  · Por conversación: LIMITES.turnosPorConversacion mensajes de la persona (se
    cuentan en el historial que manda el navegador; quien lo borre para
    saltárselo choca con los límites por IP).
  · Por IP y día (MOT-11): `topeDiarioPorIp()` turnos al día de Madrid. Superado,
    SOLO esa IP recibe `tope_diario`.
  · Diario global: `topeDiario()` turnos al día de Madrid, para todo el sitio.

  ── Dónde viven los contadores ───────────────────────────────────────────────
  Con UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN (las pone Ángel en el
  proyecto seda-web antes de encender; docs/ASISTENTE-PROPIETARIOS.md), en
  Upstash: un solo contador para todas las instancias de la función. Antes
  (REA-MOTOR §8.6) eran por instancia y el tope diario lo agotaba un script para
  toda la campaña hasta medianoche.

  Sin ellas, o si Upstash falla en una petición, en memoria por instancia, como
  antes: el asistente sigue respondiendo y el techo que dura es el del Firewall
  de Vercel y el límite de gasto de Anthropic.

  ── La IP ────────────────────────────────────────────────────────────────────
  Nunca sale de la función en claro. La clave de todos los contadores es un
  HMAC-SHA256 de la IP (32 caracteres hexadecimales) con una clave secreta: en
  Upstash, el propio token de Upstash (sin él no se puede recalcular); en
  memoria, una clave aleatoria de la instancia. Caducidad: la ventana por
  visitante, la que fija @upstash/ratelimit (dos ventanas, 20 min); el contador
  diario de la IP, hasta la medianoche de Madrid (+60 s).
*/

export interface AlmacenCupos {
  readonly tipo: "upstash" | "memoria"
  /** Ventana deslizante por visitante. `true` si el turno pasa (y lo cuenta). */
  ventana(clave: string): Promise<boolean>
  /** Suma 1 al contador y devuelve el nuevo valor. El contador caduca en `ttlSegundos`. */
  sumar(clave: string, ttlSegundos: number): Promise<number>
}

type Env = Record<string, string | undefined>

/** Contadores en memoria de esta instancia (lo de siempre). La IP llega ya resumida. */
export function almacenMemoria(ahora: () => number = Date.now): AlmacenCupos {
  const porVisitante = crearLimitador(LIMITES.turnosPorVisitante, LIMITES.ventanaVisitanteMs)
  const contadores = new Map<string, { n: number; caduca: number }>()
  return {
    tipo: "memoria",
    ventana: async (clave) => porVisitante(clave, ahora()).ok,
    sumar: async (clave, ttlSegundos) => {
      const t = ahora()
      for (const [k, v] of contadores) if (v.caduca <= t) contadores.delete(k)
      const c = contadores.get(clave) ?? { n: 0, caduca: t + ttlSegundos * 1000 }
      c.n++
      contadores.set(clave, c)
      return c.n
    },
  }
}

/** ¿Están las dos variables de Upstash? Solo https. */
export function configUpstash(env: Env = process.env): { url: string; token: string } | null {
  const url = env.UPSTASH_REDIS_REST_URL?.trim()
  const token = env.UPSTASH_REDIS_REST_TOKEN?.trim()
  if (!url || !token || !url.startsWith("https://")) return null
  return { url, token }
}

/** Upstash: @upstash/ratelimit para la ventana, INCR + EXPIRE para los diarios. */
export async function almacenUpstash({ url, token }: { url: string; token: string }): Promise<AlmacenCupos> {
  const [{ Ratelimit }, { Redis }] = await Promise.all([import("@upstash/ratelimit"), import("@upstash/redis")])
  const redis = new Redis({ url, token, enableTelemetry: false })
  const limitador = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(LIMITES.turnosPorVisitante, `${LIMITES.ventanaVisitanteMs / 1000} s` as `${number} s`),
    prefix: "seda-web:asistente:visitante",
    analytics: false,
    // Si Upstash tarda, deja pasar (los diarios y el Firewall siguen ahí).
    timeout: 1500,
  })
  return {
    tipo: "upstash",
    ventana: async (clave) => (await limitador.limit(clave)).success,
    sumar: async (clave, ttlSegundos) => {
      const [n] = await redis.pipeline().incr(clave).expire(clave, ttlSegundos).exec<[number, number]>()
      return n
    },
  }
}

/** Segundos que faltan para la próxima medianoche de Madrid (con el cambio de hora). */
export function segundosHastaMedianocheMadrid(ahora: number): number {
  const hoy = hoyMadrid(new Date(ahora))
  const partes = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Madrid", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" })
    .formatToParts(new Date(ahora))
    .reduce<Record<string, number>>((acc, p) => (p.type === "literal" ? acc : { ...acc, [p.type]: Number(p.value) }), {})
  let fin = ahora + (86_400 - (partes.hour * 3600 + partes.minute * 60 + partes.second)) * 1000
  // Días de cambio de hora: el día dura 23 o 25 horas.
  if (hoyMadrid(new Date(fin - 3_600_000)) !== hoy) fin -= 3_600_000
  else if (hoyMadrid(new Date(fin)) === hoy) fin += 3_600_000
  return Math.max(1, Math.ceil((fin - ahora) / 1000))
}

export type ResultadoDiario = "ok" | "tope_ip" | "tope_global"

export function crearCupos({
  ahora = Date.now,
  env = process.env,
  almacen,
  claveResumen,
}: { ahora?: () => number; env?: Env; almacen?: AlmacenCupos; claveResumen?: string } = {}) {
  const respaldo = almacenMemoria(ahora)
  let elegido: Promise<{ almacen: AlmacenCupos; clave: string }> | null = null
  let avisado = false

  function elegir() {
    if (!elegido) {
      elegido = (async () => {
        if (almacen) return { almacen, clave: claveResumen ?? randomBytes(32).toString("hex") }
        const cfg = configUpstash(env)
        if (cfg) {
          try {
            return { almacen: await almacenUpstash(cfg), clave: cfg.token }
          } catch (e) {
            console.error("[asistente/cupos] no se pudo crear el cliente de Upstash: límites en memoria", e instanceof Error ? e.name : "")
          }
        } else if (env.NODE_ENV === "production") {
          console.warn("[asistente/cupos] sin UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN: límites en memoria, por instancia")
        }
        return { almacen: respaldo, clave: randomBytes(32).toString("hex") }
      })()
    }
    return elegido
  }

  /** Lo hace el almacén elegido; si falla, la memoria de esta instancia. */
  async function conRespaldo<T>(op: (a: AlmacenCupos) => Promise<T>): Promise<T> {
    const { almacen: a } = await elegir()
    if (a === respaldo) return op(respaldo)
    try {
      return await op(a)
    } catch (e) {
      if (!avisado) {
        avisado = true
        console.error("[asistente/cupos] Upstash no responde: límites en memoria en esta petición", e instanceof Error ? e.name : "")
      }
      return op(respaldo)
    }
  }

  async function resumen(ip: string): Promise<string> {
    const { clave } = await elegir()
    return createHmac("sha256", clave).update(ip).digest("hex").slice(0, 32)
  }

  return {
    /** Qué almacén se usa (para la métrica). */
    async tipo(): Promise<AlmacenCupos["tipo"]> {
      const { almacen: a } = await elegir()
      return a.tipo
    },
    /** ¿Puede este visitante hacer otro turno? Cuenta el turno si sí. */
    async visitante(ip: string): Promise<boolean> {
      const h = await resumen(ip)
      return conRespaldo((a) => a.ventana(h))
    },
    /** Topes diarios: primero el de la IP (solo la frena a ella), luego el global. */
    async diario(ip: string): Promise<ResultadoDiario> {
      const t = ahora()
      const hoy = hoyMadrid(new Date(t))
      const ttl = segundosHastaMedianocheMadrid(t) + 60
      const h = await resumen(ip)
      const deLaIp = await conRespaldo((a) => a.sumar(`seda-web:asistente:dia:${hoy}:ip:${h}`, ttl))
      if (deLaIp > topeDiarioPorIp(env)) return "tope_ip"
      const total = await conRespaldo((a) => a.sumar(`seda-web:asistente:dia:${hoy}:total`, ttl))
      if (total > topeDiario(env)) return "tope_global"
      return "ok"
    },
  }
}

export function conversacionAgotada(turnosPersona: number): boolean {
  return turnosPersona > LIMITES.turnosPorConversacion
}
