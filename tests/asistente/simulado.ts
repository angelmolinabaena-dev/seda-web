import { generateText, type ModelMessage } from "ai"
import { MockLanguageModelV3 } from "ai/test"
import { acotarHistorial } from "@/lib/asistente/historial"
import { limpiarSalida } from "@/lib/asistente/salida"
import { prepararTurno } from "@/lib/asistente/turno"
import type { Caso, Resultado } from "./bateria"

/*
  Ejecuta un caso de la batería con el MISMO turno que la puerta web
  (acotarHistorial → prepararTurno → modelo → limpiarSalida) y un modelo que se
  pasa por parámetro: el simulado en CI, el real a mano.
*/

/** Fecha fija para que las cifras no dependan del día en que corre el test (desde el 1-dic con IVA dentro). */
export const HOY_BATERIA = "2026-11-07"

const USO = {
  inputTokens: { total: 10, noCache: 10, cacheRead: 0, cacheWrite: 0 },
  outputTokens: { total: 10, text: 10, reasoning: 0 },
}

type Prompt = { role: string; content: unknown }[]

/** Lo que el modelo simulado recibe, en texto, para comprobar qué le llegó. */
export function promptComoTexto(prompt: Prompt): string {
  return JSON.stringify(prompt)
}

/**
 * Modelo simulado que se porta «como debe» según `caso.simulacion`: primer paso,
 * llama a la herramienta; segundo, contesta con su resultado. `alterar` permite
 * hacer que se porte mal (para comprobar que la batería lo detecta).
 */
export function modeloSimulado(caso: Caso, alterar?: (texto: string) => string) {
  const recibido: string[] = []
  const modelo = new MockLanguageModelV3({
    doGenerate: async ({ prompt }) => {
      recibido.push(promptComoTexto(prompt as Prompt))
      const resultadoHerramienta = [...(prompt as Prompt)]
        .reverse()
        .find((m) => m.role === "tool") as { content: { type: string; output: { type: string; value: unknown } }[] } | undefined
      const sim = caso.simulacion
      if (sim.herramienta && !resultadoHerramienta) {
        return {
          content: [{ type: "tool-call", toolCallId: "t1", toolName: sim.herramienta, input: JSON.stringify(sim.entrada ?? {}) }],
          finishReason: { unified: "tool-calls", raw: "tool_use" },
          usage: USO,
          warnings: [],
        }
      }
      const salida = resultadoHerramienta?.content.find((c) => c.type === "tool-result")?.output.value
      const texto = sim.respuesta(salida)
      return {
        content: [{ type: "text", text: alterar ? alterar(texto) : texto }],
        finishReason: { unified: "stop", raw: "end_turn" },
        usage: USO,
        warnings: [],
      }
    },
  })
  return { modelo, recibido }
}

/** Un caso de punta a punta con el modelo que se le dé. */
export async function correrCaso(
  caso: Caso,
  modelo: Parameters<typeof generateText>[0]["model"],
  recibido?: string[],
): Promise<Resultado> {
  const ui = caso.conversacion.map((t, i) => ({ id: String(i), role: t.role, parts: [{ type: "text", text: t.texto }] }))
  const h = acotarHistorial(ui)
  if (!h.ok) throw new Error(`historial rechazado: ${h.error}`)
  const turno = prepararTurno({ locale: caso.locale, mensajes: h.mensajes, hoy: HOY_BATERIA })
  const r = await generateText({ model: modelo, ...turno })
  const herramientas = r.steps.flatMap((s) =>
    s.toolResults.map((tr) => ({ nombre: tr.toolName, entrada: tr.input, salida: tr.output })),
  )
  return {
    texto: limpiarSalida(r.text).texto,
    herramientas,
    // Lo que salió hacia el modelo: el simulado lo apunta; con el real, el historial ya saneado.
    entradaModelo: recibido?.join("\n") ?? JSON.stringify(h.mensajes satisfies ModelMessage[]),
  }
}
