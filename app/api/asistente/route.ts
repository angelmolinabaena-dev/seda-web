import { anthropic } from "@ai-sdk/anthropic"
import { createUIMessageStream, createUIMessageStreamResponse, streamText } from "ai"
import { NextResponse } from "next/server"
import { routing, type Locale } from "@/i18n/routing"
import { clientKey, esMismoOrigen } from "@/lib/api-guards"
import { ASISTENTE_MODEL_ID, LIMITES, asistentePropietariosActivo } from "@/lib/asistente/config"
import { conversacionAgotada, crearCupos } from "@/lib/asistente/cupos"
import { acotarHistorial } from "@/lib/asistente/historial"
import { textoRespaldo, type MotivoRespaldo } from "@/lib/asistente/respaldo"
import { transformarSalida } from "@/lib/asistente/salida"
import { prepararTurno } from "@/lib/asistente/turno"

/*
  POST /api/asistente — la puerta web del asistente de propietarios.

  · Interruptor apagado (SEDA_FLAG_ASISTENTE_PROPIETARIOS ≠ "1") → 404 antes de
    leer nada. No se llama a nadie.
  · Solo del propio sitio (Origin / Sec-Fetch-Site), `application/json`, cuerpo
    de LIMITES.bytesPeticion como mucho.
  · Cupos (lib/asistente/cupos.ts): por visitante, por conversación y diario.
    Pasado un cupo NO se llama al modelo: se responde, en el mismo formato del
    chat, el mensaje de respaldo («déjenos sus datos y le llamamos») y una señal
    `data-respaldo` para que la interfaz muestre el formulario.
  · El historial lo manda el navegador; aquí se acota y se sanea
    (lib/asistente/historial.ts): solo texto, últimos mensajes, 1.000 caracteres,
    datos sensibles retirados antes de salir hacia Anthropic.
  · La salida pasa por lib/asistente/salida.ts (datos sensibles y la referencia
    interna de las instrucciones, tapados).
  · NO SE GUARDA LA CONVERSACIÓN. Ni en base de datos (este sitio no tiene) ni
    en los logs: solo una línea de métricas sin contenido (idioma, turno,
    herramientas usadas, tokens, duración, motivo de fin). Ni la IP ni el texto.
  · Sin ANTHROPIC_API_KEY → respaldo `no_disponible` y un console.error.
*/

export const maxDuration = 30

const cupos = crearCupos()

const json = (body: Record<string, unknown>, init?: ResponseInit) => NextResponse.json(body, init)

const esLocale = (v: unknown): v is Locale => typeof v === "string" && (routing.locales as readonly string[]).includes(v)

/** Métrica sin contenido. Una línea JSON por turno. */
function metrica(datos: Record<string, unknown>) {
  console.log(JSON.stringify({ evento: "asistente.turno", ...datos }))
}

/** Respuesta de respaldo en el formato del chat: un mensaje del asistente y la señal para enseñar el formulario. */
function respaldo(locale: Locale, motivo: MotivoRespaldo) {
  metrica({ locale, respaldo: motivo })
  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      writer.write({ type: "start" })
      writer.write({ type: "text-start", id: "respaldo" })
      writer.write({ type: "text-delta", id: "respaldo", delta: textoRespaldo(locale, motivo) })
      writer.write({ type: "text-end", id: "respaldo" })
      writer.write({ type: "data-respaldo", data: { motivo } })
      writer.write({ type: "finish" })
    },
  })
  return createUIMessageStreamResponse({ stream, headers: { "X-Asistente-Respaldo": motivo } })
}

export async function POST(req: Request) {
  if (!asistentePropietariosActivo()) return json({ ok: false, error: "not_found" }, { status: 404 })
  if (!esMismoOrigen(req)) return json({ ok: false, error: "forbidden_origin" }, { status: 403 })
  if (!/^application\/json\b/i.test(req.headers.get("content-type") ?? "")) {
    return json({ ok: false, error: "unsupported_media_type" }, { status: 415 })
  }

  const declarado = Number(req.headers.get("content-length") ?? "")
  if (Number.isFinite(declarado) && declarado > LIMITES.bytesPeticion) {
    return json({ ok: false, error: "payload_too_large" }, { status: 413 })
  }
  let raw: string
  try {
    raw = await req.text()
  } catch {
    return json({ ok: false, error: "invalid_body" }, { status: 400 })
  }
  if (new TextEncoder().encode(raw).length > LIMITES.bytesPeticion) {
    return json({ ok: false, error: "payload_too_large" }, { status: 413 })
  }
  let body: unknown
  try {
    body = JSON.parse(raw)
  } catch {
    return json({ ok: false, error: "invalid_json" }, { status: 400 })
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) return json({ ok: false, error: "invalid_body" }, { status: 400 })
  const { messages, locale } = body as { messages?: unknown; locale?: unknown }
  if (!esLocale(locale)) return json({ ok: false, error: "invalid_locale" }, { status: 400 })

  // Por visitante ANTES de nada caro.
  if (!cupos.visitante(clientKey(req)).ok) return respaldo(locale, "limite_visitante")

  const historial = acotarHistorial(messages)
  if (!historial.ok) return json({ ok: false, error: historial.error }, { status: 400 })
  if (conversacionAgotada(historial.turnosPersona)) return respaldo(locale, "limite_conversacion")

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("[/api/asistente] falta ANTHROPIC_API_KEY: el asistente responde con el mensaje de respaldo")
    return respaldo(locale, "no_disponible")
  }
  if (!cupos.diario()) return respaldo(locale, "tope_diario")

  const inicio = Date.now()
  const herramientasUsadas: string[] = []
  const tapado: string[] = []
  const result = streamText({
    model: anthropic(ASISTENTE_MODEL_ID),
    ...prepararTurno({ locale, mensajes: historial.mensajes }),
    abortSignal: req.signal,
    experimental_transform: transformarSalida((tipos) => tapado.push(...tipos)),
    onStepFinish: (paso) => {
      for (const c of paso.toolCalls) herramientasUsadas.push(c.toolName)
    },
    onError: ({ error }) => {
      // Sin contenido: solo el tipo y, si lo hay, el estado HTTP del proveedor.
      const estado = (error as { statusCode?: unknown })?.statusCode
      console.error("[/api/asistente] error del modelo", error instanceof Error ? error.name : "unknown", typeof estado === "number" ? estado : "")
    },
    onFinish: (fin) => {
      metrica({
        locale,
        turno: historial.turnosPersona,
        herramientas: herramientasUsadas,
        retiradosEntrada: historial.retirados,
        tapadosSalida: tapado,
        tokensEntrada: fin.totalUsage.inputTokens ?? null,
        tokensSalida: fin.totalUsage.outputTokens ?? null,
        tokensCache: fin.totalUsage.cachedInputTokens ?? null,
        pasos: fin.steps.length,
        fin: fin.finishReason,
        ms: Date.now() - inicio,
      })
    },
  })

  return result.toUIMessageStreamResponse({
    sendReasoning: false,
    sendSources: false,
    // El detalle del error no sale al navegador: la interfaz enseña el respaldo.
    onError: () => "no_disponible",
  })
}
