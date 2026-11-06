import { COOKIES_META } from "./consentimiento"

/*
  Píxel de Meta, lado navegador. Solo existe si alguien lo ACTIVA, y solo lo
  activa el controlador del consentimiento tras un «Aceptar» (o una elección
  guardada y vigente). Antes de eso este módulo no toca el DOM, no crea
  `window.fbq` y no hace ninguna petición.

  Dos decisiones de privacidad, en el código y no en un ajuste del panel de Meta:

  · `fbq("set", "autoConfig", false, ID)` ANTES de `init`: desactiva la
    configuración automática, que es lo que lee los campos de los formularios
    (correo, teléfono) para la coincidencia avanzada. Y `init` va sin datos de
    usuario: ni correo ni teléfono, ni siquiera con hash. (En el Administrador
    de eventos de Meta hay que dejar apagada también la coincidencia avanzada
    automática: es un ajuste del píxel, fuera del alcance de este código.)
  · Al retirar el consentimiento: `fbq("consent", "revoke")`, no se vuelve a
    llamar a `fbq` (el objeto deja de ser accesible desde aquí) y se borran
    `_fbp` y `_fbc`.

  El «documento» y la «ventana» llegan por parámetro, de modo que los tests
  pasan unos de mentira y comprueban qué se habría pedido.
*/

export const URL_FBEVENTS = "https://connect.facebook.net/en_US/fbevents.js"

type Fbq = {
  (...args: unknown[]): void
  callMethod?: (...args: unknown[]) => void
  queue?: unknown[]
  push?: unknown
  loaded?: boolean
  version?: string
}

export type VentanaMeta = { fbq?: Fbq; _fbq?: Fbq }

export type DocumentoMeta = {
  createElement(tag: "script"): { async: boolean; src: string }
  head: { appendChild(n: unknown): unknown }
  cookie: string
}

export type PixelMeta = {
  readonly activo: boolean
  /** Carga el script (la primera vez) y autoriza el envío. Idempotente. */
  activar(): void
  /** Retira el consentimiento: nada más se envía y se borran _fbp y _fbc. Idempotente. */
  desactivar(): void
  /** `PageView`; no hace nada si no está activo. */
  pageView(): void
  /** `Lead` con el `event_id` compartido con la API de conversiones; no hace nada si no está activo. */
  lead(eventId: string): void
}

/** Dominios en los que pudo quedar una cookie de `host`: el propio y cada sufijo con al menos dos etiquetas. */
export function dominiosDeCookie(host: string): string[] {
  const partes = host.split(".").filter(Boolean)
  const salida: string[] = []
  for (let i = 0; i <= partes.length - 2; i++) salida.push(partes.slice(i).join("."))
  return salida
}

/** Borra _fbp y _fbc en el host y en cada dominio padre posible. */
export function borrarCookiesMeta(doc: Pick<DocumentoMeta, "cookie">, host: string): void {
  const dominios: (string | null)[] = [null, ...dominiosDeCookie(host).flatMap((d) => [d, `.${d}`])]
  for (const nombre of COOKIES_META) {
    for (const dominio of dominios) {
      const dom = dominio ? `; Domain=${dominio}` : ""
      doc.cookie = `${nombre}=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/${dom}; SameSite=Lax`
    }
  }
}

export function crearPixel(opts: { id: string; win: VentanaMeta; doc: DocumentoMeta; host: string }): PixelMeta {
  const { id, win, doc, host } = opts
  let activo = false
  let iniciado = false
  let revocado = false

  function cargar(): void {
    // Copia fiel del cargador oficial de Meta, sin el <noscript> (que pediría
    // una imagen a Meta sin consentimiento).
    const n: Fbq = function (...args: unknown[]) {
      if (n.callMethod) n.callMethod(...args)
      else (n.queue as unknown[]).push(args)
    }
    if (!win._fbq) win._fbq = n
    n.push = n
    n.loaded = true
    n.version = "2.0"
    n.queue = []
    win.fbq = n
    const s = doc.createElement("script")
    s.async = true
    s.src = URL_FBEVENTS
    doc.head.appendChild(s)
    win.fbq("set", "autoConfig", false, id)
    win.fbq("init", id)
  }

  return {
    get activo() {
      return activo
    },
    activar() {
      if (activo) return
      if (!iniciado) {
        iniciado = true
        cargar()
      } else if (revocado && win.fbq) {
        win.fbq("consent", "grant")
      }
      revocado = false
      activo = true
    },
    desactivar() {
      if (!activo) {
        // Sin consentimiento nunca se cargó nada; si hay cookies de una visita anterior, fuera.
        borrarCookiesMeta(doc, host)
        return
      }
      activo = false
      revocado = true
      win.fbq?.("consent", "revoke")
      borrarCookiesMeta(doc, host)
    },
    pageView() {
      if (activo && win.fbq) win.fbq("track", "PageView")
    },
    lead(eventId: string) {
      if (activo && win.fbq) win.fbq("track", "Lead", {}, { eventID: eventId })
    },
  }
}

/* ── Instancia del navegador ───────────────────────────────────────────── */

type Actual = { pixel: PixelMeta; marketing: () => boolean }
let actual: Actual | null = null

/** Lo llama el componente del aviso al montarse (solo existe con SEDA_FLAG_META_PIXEL encendido). */
export function registrarPixelActual(a: Actual | null): void {
  actual = a
}

/** Cabecera que dice al servidor que el navegador tiene el consentimiento de marketing. Vacía si no lo hay. */
export function cabecerasConsentimiento(): Record<string, string> {
  return actual?.marketing() ? { "X-Consent-Marketing": "1" } : {}
}

/** `Lead` del navegador. Sin píxel registrado, o sin consentimiento, no hace nada. */
export function rastrearLead(eventId: string): void {
  actual?.pixel.lead(eventId)
}
