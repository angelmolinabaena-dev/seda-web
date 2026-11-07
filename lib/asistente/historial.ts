import type { ModelMessage } from "ai"
import { LIMITES } from "./config"
import { retirarDatosSensibles } from "./datos-sensibles"

/*
  El historial que llega del cliente, acotado y saneado ANTES de tocar el modelo.

  El servidor no guarda la conversación: la manda el navegador entera en cada
  turno (`useChat`). Por eso aquí no se confía en nada de lo que trae:

    · Solo pasa TEXTO. Las partes de herramienta, de razonamiento o de ficheros
      se tiran: un cliente hecho a mano podría falsificar el resultado de una
      herramienta («rentabilidad garantizada del 40 %») y el modelo lo tomaría
      por dato. Si hace falta una cifra, el modelo vuelve a llamar a la
      herramienta (las instrucciones se lo exigen).
    · Solo los últimos LIMITES.mensajesHistorial mensajes; empieza por la persona.
    · Cada mensaje de la persona: sin caracteres de control y, como mucho,
      LIMITES.caracteresMensaje. El ÚLTIMO, si es más largo, se rechaza (la
      interfaz no deja escribir más); los anteriores se cortan.
    · Cada respuesta anterior del asistente, como mucho LIMITES.caracteresRespuestaPrevia.
    · Datos sensibles (IBAN, tarjeta, DNI/NIE, correo, teléfono, contraseñas)
      sustituidos por «[dato retirado]» antes de que el texto salga hacia Anthropic.

  Mismo planteamiento que `acotarHistorial` de Sofía (guest-app,
  lib/villa/chat-acotar-historial.ts), más estricto porque esta puerta es pública.
  Módulo puro: sin red.
*/

export type HistorialAcotado =
  | {
      ok: true
      mensajes: ModelMessage[]
      /** Mensajes de la persona en toda la conversación recibida (para el límite por conversación). */
      turnosPersona: number
      /** Tipos de dato sensible retirados en el último mensaje (métrica, sin valor). */
      retirados: string[]
    }
  | { ok: false; error: "historial_invalido" | "mensaje_vacio" | "mensaje_largo" }

// Controles salvo salto de línea y tabulador; y los separadores Unicode de línea.
const CONTROLES = /[\u0000-\u0008\u000b-\u001f\u007f\u2028\u2029]/g

function textoDe(m: unknown): string | null {
  if (!m || typeof m !== "object") return null
  const partes = (m as { parts?: unknown }).parts
  if (!Array.isArray(partes)) return null
  return partes
    .filter((p): p is { type: "text"; text: string } => !!p && typeof p === "object" && (p as { type?: unknown }).type === "text" && typeof (p as { text?: unknown }).text === "string")
    .map((p) => p.text)
    .join("\n")
}

const limpiar = (t: string) => t.replace(CONTROLES, " ").replace(/\n{3,}/g, "\n\n").trim()

export function acotarHistorial(entrada: unknown): HistorialAcotado {
  if (!Array.isArray(entrada) || entrada.length === 0 || entrada.length > 200) return { ok: false, error: "historial_invalido" }

  const crudos: { role: "user" | "assistant"; texto: string }[] = []
  for (const m of entrada) {
    const role = m && typeof m === "object" ? (m as { role?: unknown }).role : undefined
    if (role !== "user" && role !== "assistant") continue
    const texto = textoDe(m)
    if (texto === null) continue
    crudos.push({ role, texto: limpiar(texto) })
  }

  const ultimo = crudos.at(-1)
  if (!ultimo || ultimo.role !== "user" || ultimo.texto.length === 0) return { ok: false, error: "mensaje_vacio" }
  if (ultimo.texto.length > LIMITES.caracteresMensaje) return { ok: false, error: "mensaje_largo" }

  const turnosPersona = crudos.filter((m) => m.role === "user").length

  let recientes = crudos.slice(-LIMITES.mensajesHistorial)
  while (recientes.length > 0 && recientes[0].role !== "user") recientes = recientes.slice(1)

  let retirados: string[] = []
  const mensajes: ModelMessage[] = []
  recientes.forEach((m, i) => {
    if (m.texto.length === 0) return
    const tope = m.role === "user" ? LIMITES.caracteresMensaje : LIMITES.caracteresRespuestaPrevia
    const r = retirarDatosSensibles(m.texto.slice(0, tope))
    if (i === recientes.length - 1) retirados = r.tipos
    mensajes.push({ role: m.role, content: r.texto })
  })

  return { ok: true, mensajes, turnosPersona, retirados }
}
