import { LIMITES } from "./config"

/*
  Lo que el navegador manda en cada turno (MOT-11 de la REA-MOTOR).

  `useChat` reenvía por defecto la conversación ENTERA, con las partes de
  herramienta y sus salidas (`servicio` devuelve todas las preguntas frecuentes;
  `estimar`, la tabla completa). Medido con el `Chat` del AI SDK contra la ruta
  real (tests/asistente-cuerpo.test.ts): el cuerpo crece unos 4 KB por turno con
  una herramienta y 6 KB con dos, y pasa de LIMITES.bytesPeticion (32 KB) en el
  turno 11 —o en el 7 si cada turno usa `servicio` y `estimar`—. A partir de ahí
  todos los turnos dan 413 y el chat queda roto.

  El servidor ya tira todo lo que no es texto (lib/asistente/historial.ts), así
  que mandarlo solo gastaba bytes. Aquí se manda lo mismo que el servidor usa:
    · de cada mensaje, solo sus partes de texto, unidas;
    · la respuesta del asistente, cortada a LIMITES.caracteresRespuestaPrevia
      (el servidor la corta igual);
    · los mensajes que quedan fuera de los LIMITES.mensajesHistorial últimos van
      SIN texto, solo con su papel: el servidor no los manda al modelo, pero los
      cuenta para el límite por conversación.
  Lo que llega al modelo es lo mismo que antes; el servidor sigue acotando por su cuenta
  (no se fía de lo que manda el navegador).

  Módulo puro, sin React ni red: lo usa el panel y lo prueban los tests.
*/

type MensajeCliente = { id: string; role: string; parts: readonly unknown[] }

export type MensajeEnviado = { id: string; role: "user" | "assistant"; parts: { type: "text"; text: string }[] }

const textoDe = (partes: readonly unknown[]) =>
  partes
    .filter((p): p is { type: "text"; text: string } => !!p && typeof p === "object" && (p as { type?: unknown }).type === "text" && typeof (p as { text?: unknown }).text === "string")
    .map((p) => p.text)
    .join("\n")

export function mensajesParaEnviar(mensajes: readonly MensajeCliente[]): MensajeEnviado[] {
  const utiles = mensajes.filter((m): m is MensajeCliente & { role: "user" | "assistant" } => m.role === "user" || m.role === "assistant")
  const desde = utiles.length - LIMITES.mensajesHistorial
  return utiles.map((m, i) => {
    if (i < desde) return { id: m.id, role: m.role, parts: [{ type: "text", text: "" }] }
    const texto = textoDe(m.parts)
    const tope = m.role === "user" ? LIMITES.caracteresMensaje : LIMITES.caracteresRespuestaPrevia
    return { id: m.id, role: m.role, parts: [{ type: "text", text: texto.slice(0, tope) }] }
  })
}

/** El cuerpo de la petición: el idioma y los mensajes recortados. Para `prepareSendMessagesRequest`. */
export function cuerpoPeticion({ id, messages, body }: { id: string; messages: readonly MensajeCliente[]; body?: Record<string, unknown> }) {
  return { body: { ...body, id, messages: mensajesParaEnviar(messages) } }
}
