/*
  ¿Se quedó la persona sin respuesta? — lo decide el panel del chat (navegador)
  con lo que trae el último mensaje del asistente. Módulo puro, sin React.

  Casos:
    · el modelo rechazó (Anthropic `stop_reason: "refusal"` → AI SDK
      `finishReason: "content-filter"`, que la ruta manda en los metadatos del
      mensaje, app/api/asistente/route.ts);
    · el turno terminó sin texto y sin nada que enseñar (ni botón de llamada,
      ni formulario, ni mensaje de respaldo).

  Entonces el panel hace lo mismo que cuando se agota un cupo: el mensaje de
  respaldo («déjenos sus datos y le llamamos») y el formulario.
*/

type Parte = { type: string; text?: unknown; state?: unknown }
type MensajeChat = { role: string; parts: Parte[]; metadata?: unknown }

export type EstadoChat = "submitted" | "streaming" | "ready" | "error"

const muestraAlgo = (p: Parte) =>
  (p.type === "text" && typeof p.text === "string" && p.text.trim().length > 0) ||
  p.type === "data-respaldo" ||
  ((p.type === "tool-ofrecer_llamada" || p.type === "tool-ofrecer_solicitud") && p.state === "output-available")

export function finishReasonDe(m: MensajeChat): string | undefined {
  const meta = m.metadata
  if (meta && typeof meta === "object" && typeof (meta as { finishReason?: unknown }).finishReason === "string") {
    return (meta as { finishReason: string }).finishReason
  }
  return undefined
}

export function sinRespuesta(mensajes: readonly MensajeChat[], estado: EstadoChat): boolean {
  if (estado !== "ready") return false
  const ultimo = mensajes.at(-1)
  if (!ultimo || ultimo.role !== "assistant") return false
  if (finishReasonDe(ultimo) === "content-filter") return true
  return !ultimo.parts.some(muestraAlgo)
}
