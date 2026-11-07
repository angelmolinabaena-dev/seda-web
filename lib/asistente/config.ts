/*
  ASISTENTE-PROPIETARIAS (plan «Motor SEDA», fase 1) — configuración del agente.

  El núcleo (lib/asistente/*) no depende de React ni de la petición HTTP: lo usa
  la puerta web (app/api/asistente) y, más adelante, la de WhatsApp (guest-app).
  Aquí viven el interruptor, el modelo y los límites, en un solo sitio.

  ── El interruptor ──────────────────────────────────────────────────────────
  `SEDA_FLAG_ASISTENTE_PROPIETARIOS=1` enciende el widget en /propietarios y en
  la calculadora, y las rutas POST /api/asistente y /api/asistente/solicitud.
  Con cualquier otro valor (o sin él) no hay widget y las dos rutas responden
  404 sin leer nada ni llamar a nadie. Fail closed, como la calculadora.
*/

type Env = Record<string, string | undefined>

/** ¿Está encendido el asistente? Solo con el valor exacto "1": fail closed. */
export function asistentePropietariosActivo(env: Env = process.env): boolean {
  return env.SEDA_FLAG_ASISTENTE_PROPIETARIOS === "1"
}

/*
  ── El modelo ───────────────────────────────────────────────────────────────
  `claude-haiku-5-5`: el más barato de la familia actual (0,10 $ / 0,50 $ por
  millón de tokens de entrada / salida con prompts de hasta 100 000 tokens;
  Haiku 4.5 cuesta 1 $ / 5 $, diez veces más). El prompt del asistente mide unos
  pocos miles de tokens, así que siempre va con la tarifa baja.

  Por qué no Haiku 4.5, que es lo que usa Sofía (guest-app): solo por precio. La
  medición de Sofía (#469, docs/audit/SOFIA-ESTANCIA-ENTERA.md de guest-app) vio
  que `claude-haiku-5-5` acertaba el idioma 138 de 150 veces frente a 210 de 210
  de Haiku 4.5. Por eso las instrucciones llevan la regla de idioma al principio
  Y al final (la «regla reforzada» que Sofía activa para 5.5), y la batería del
  asistente comprueba el idioma de cada respuesta en los cuatro idiomas.

  Pendiente de verificar con el modelo real ANTES de encender el flag:
  `npm run asistente:bateria` (docs/ASISTENTE-PROPIETARIOS.md). Si la batería no
  pasa con Haiku 5.5, se cambia esta constante a `claude-haiku-4-5` (y
  ASISTENTE_EFFORT a null: Haiku 4.5 no admite `effort`) y se vuelve a correr.

  Esfuerzo `low`: chat breve con herramientas. Haiku 5.5 piensa por defecto
  (adaptativo) y `low` hace que piense poco o nada en preguntas sencillas.
*/
export type EsfuerzoAsistente = "low" | "medium"

export const ASISTENTE_MODEL_ID: string = "claude-haiku-5-5"

/** `null` = no se manda `effort` (necesario si se vuelve a Haiku 4.5). */
export const ASISTENTE_EFFORT: EsfuerzoAsistente | null = "low"

/** Modelo de respaldo documentado, por si la batería no pasa con el de arriba. */
export const ASISTENTE_MODEL_ID_RESPALDO = "claude-haiku-4-5"

/* ── Límites (costes y abuso) ─────────────────────────────────────────────── */

export const LIMITES = {
  /** Caracteres por mensaje de la persona. */
  caracteresMensaje: 1_000,
  /** Mensajes del historial que llegan al modelo (los más recientes). */
  mensajesHistorial: 16,
  /** Caracteres de cada respuesta anterior del asistente que se reenvían. */
  caracteresRespuestaPrevia: 1_500,
  /** Turnos de la persona por conversación: a partir de aquí, mensaje de respaldo. */
  turnosPorConversacion: 15,
  /** Tokens de salida por paso (incluye el razonamiento del modelo). */
  tokensSalida: 1_200,
  /** Pasos del bucle de herramientas por turno (herramientas + respuesta final). */
  pasosPorTurno: 5,
  /** Tamaño máximo del cuerpo de la petición, en bytes. */
  bytesPeticion: 32 * 1024,
  /** Turnos por visitante (IP) y ventana. */
  turnosPorVisitante: 20,
  ventanaVisitanteMs: 10 * 60 * 1000,
} as const

/**
 * Tope diario de turnos (por instancia de la función; ver
 * docs/ASISTENTE-PROPIETARIOS.md, «Costes»). Variable pública, no secreta:
 * `SEDA_ASISTENTE_TOPE_DIARIO`. Sin ella o con un valor raro, 400.
 */
export function topeDiario(env: Env = process.env): number {
  const n = Number(env.SEDA_ASISTENTE_TOPE_DIARIO)
  return Number.isInteger(n) && n > 0 ? n : 400
}

/*
  ── La llamada con una persona ───────────────────────────────────────────────
  `NEXT_PUBLIC_SEDA_CALENDLY_URL`: el enlace de Calendly que ofrece el asistente.
  Pública a propósito (va en un botón). Solo se acepta https://calendly.com/…;
  sin ella, o con otra cosa, el asistente ofrece la página /meet de la web, que
  ya lleva el calendario de SEDA detrás de su fachada.
*/
export const RUTA_LLAMADA_POR_DEFECTO = "/meet"

export function enlaceLlamada(env: Env = process.env): { url: string; tipo: "calendly" | "pagina" } {
  const v = env.NEXT_PUBLIC_SEDA_CALENDLY_URL?.trim()
  if (v) {
    try {
      const u = new URL(v)
      if (u.protocol === "https:" && u.hostname === "calendly.com" && u.pathname.length > 1) {
        return { url: u.toString(), tipo: "calendly" }
      }
    } catch {
      // valor que no es una URL: se ignora
    }
  }
  return { url: RUTA_LLAMADA_POR_DEFECTO, tipo: "pagina" }
}
