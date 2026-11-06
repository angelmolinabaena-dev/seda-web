import { META_GRAPH_ORIGEN, META_GRAPH_VERSION, metaCapiActivo, metaPixelId } from "./meta-config.mjs"

/*
  API de conversiones de Meta — el evento `Lead` desde el servidor (solo servidor).

  Existe para que la medición no dependa de que el navegador consiga mandar el
  evento (bloqueadores, cierre de pestaña). Es el MISMO evento que manda el
  píxel, con el MISMO `event_id`, y así Meta lo cuenta una sola vez
  (deduplicación por `event_name` + `event_id`).

  Qué se manda — y qué no:
    · SÍ: event_name "Lead", event_time, event_id, event_source_url,
      action_source "website", y en `user_data` solo la IP y el user-agent del
      visitante (lo que el navegador le habría mandado a Meta con el píxel) y,
      si existen, sus cookies `_fbp` / `_fbc`.
    · NO: correo, teléfono, nombre — ni siquiera con hash. Ni la estimación, ni
      municipio, ni dormitorios. Sin `custom_data` (ni valor ni moneda).

  Cuándo: la ruta de leads solo lo llama si (1) SEDA_FLAG_META_CAPI y el píxel
  están encendidos y hay META_CAPI_TOKEN, (2) el navegador mandó la cabecera de
  consentimiento de marketing y (3) el portal de seda_os respondió 201. Un fallo
  aquí NUNCA afecta al lead: se registra el estado HTTP (jamás el token ni el
  cuerpo) y se sigue.

  El token va en el cuerpo del POST, no en la URL: las URL acaban en registros.
*/

export type EventoLeadCapi = {
  eventId: string
  /** URL de la página donde se envió el formulario (sin query ni hash). */
  urlOrigen: string
  ip?: string
  userAgent?: string
  fbp?: string
  fbc?: string
  /** Instante del evento; por defecto, ahora. */
  ahora?: Date
}

/** Formato de _fbp / _fbc: fb.<n>.<marca de tiempo>.<id>. Cualquier otra cosa se descarta. */
const IDENTIFICADOR_FB = /^fb\.\d\.\d{10,13}\.[A-Za-z0-9_-]{1,512}$/

/** `_fbp` y `_fbc` de una cabecera Cookie, si tienen la forma esperada. */
export function identificadoresDeCookie(cabeceraCookie: string | null): { fbp?: string; fbc?: string } {
  const leer = (nombre: string) => {
    const par = (cabeceraCookie ?? "").split(/;\s*/).find((c) => c.startsWith(`${nombre}=`))
    const valor = par?.slice(nombre.length + 1)
    return valor && IDENTIFICADOR_FB.test(valor) ? valor : undefined
  }
  return { fbp: leer("_fbp"), fbc: leer("_fbc") }
}

/** El cuerpo del POST SIN el token. Es lo que el test inspecciona campo a campo. */
export function cuerpoLeadCapi(e: EventoLeadCapi) {
  const userData: Record<string, string> = {}
  if (e.ip) userData.client_ip_address = e.ip
  if (e.userAgent) userData.client_user_agent = e.userAgent.slice(0, 512)
  if (e.fbp) userData.fbp = e.fbp
  if (e.fbc) userData.fbc = e.fbc
  return {
    data: [
      {
        event_name: "Lead",
        event_time: Math.floor((e.ahora ?? new Date()).getTime() / 1000),
        event_id: e.eventId,
        event_source_url: e.urlOrigen,
        action_source: "website",
        user_data: userData,
      },
    ],
  }
}

export type ResultadoCapi = "enviado" | "fallo" | "apagado"

const TIMEOUT_CAPI_MS = 5_000

/**
 * Manda el `Lead`. No lanza nunca. Devuelve "apagado" sin llamar a nadie si la
 * API de conversiones no está encendida (flag, píxel, token).
 */
export async function enviarLeadCapi(
  e: EventoLeadCapi,
  env: Record<string, string | undefined> = process.env,
  enviar: typeof fetch = fetch,
): Promise<ResultadoCapi> {
  if (!metaCapiActivo(env)) return "apagado"
  const pixelId = metaPixelId(env)
  const token = (env.META_CAPI_TOKEN ?? "").trim()
  if (!pixelId || !token) return "apagado"
  try {
    const resp = await enviar(`${META_GRAPH_ORIGEN}/${META_GRAPH_VERSION}/${pixelId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...cuerpoLeadCapi(e), access_token: token }),
      signal: AbortSignal.timeout(TIMEOUT_CAPI_MS),
    })
    if (!resp.ok) {
      console.error("[meta-capi] Meta respondió", resp.status)
      return "fallo"
    }
    return "enviado"
  } catch (err) {
    console.error("[meta-capi] error de red hacia Meta", err instanceof Error ? err.name : "unknown")
    return "fallo"
  }
}
