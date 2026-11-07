import { stepCountIs, type ModelMessage, type SystemModelMessage } from "ai"
import type { Locale } from "@/i18n/routing"
import { hoyMadrid } from "@/lib/calculadora-propietarios"
import { ASISTENTE_EFFORT, LIMITES } from "./config"
import { herramientasAsistente } from "./herramientas"
import { instruccionesAsistente } from "./instrucciones"

/*
  Un turno del asistente: instrucciones + herramientas + historial ya acotado
  (lib/asistente/historial.ts). Devuelve las opciones que reciben tanto
  `streamText` (la puerta web) como `generateText` (la batería de pruebas y,
  más adelante, WhatsApp). El modelo lo pone quien llama: así la batería usa el
  modelo simulado en CI y el real a mano, con el mismo turno.
*/

export function prepararTurno(args: { locale: Locale; mensajes: ModelMessage[]; hoy?: string }) {
  const hoy = args.hoy ?? hoyMadrid()
  const sistema: SystemModelMessage = {
    role: "system",
    content: instruccionesAsistente(args.locale),
    // Caché de Anthropic sobre las instrucciones: son estables por idioma.
    providerOptions: { anthropic: { cacheControl: { type: "ephemeral" } } },
  }
  return {
    // Las instrucciones van en `system`, nunca mezcladas con los mensajes.
    system: sistema,
    messages: args.mensajes,
    tools: herramientasAsistente(args.locale, hoy),
    stopWhen: stepCountIs(LIMITES.pasosPorTurno),
    maxOutputTokens: LIMITES.tokensSalida,
    maxRetries: 1,
    ...(ASISTENTE_EFFORT ? { providerOptions: { anthropic: { effort: ASISTENTE_EFFORT } } } : {}),
  }
}
