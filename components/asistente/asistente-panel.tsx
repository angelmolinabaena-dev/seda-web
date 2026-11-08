"use client"

import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from "ai"
import { ArrowUp, CalendarDays, X } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import type { Locale } from "@/i18n/routing"
import { LIMITES } from "@/lib/asistente/config"
import { cuerpoPeticion } from "@/lib/asistente/peticion"
import { textoRespaldo } from "@/lib/asistente/respaldo"
import { sinRespuesta } from "@/lib/asistente/sin-respuesta"
import { FormularioSolicitud } from "./formulario-solicitud"

/*
  El panel del asistente. Es lo único que importa el AI SDK en el navegador:
  `asistente-propietarios.tsx` lo carga con next/dynamic al abrir el chat, así
  que /propietarios y la calculadora no descargan el SDK si nadie pregunta.

  · El primer mensaje lo pinta la interfaz, no el modelo (art. 50 del
    Reglamento europeo de IA): dice que es una IA y que no se escriban datos
    sensibles. Siempre visibles: «Hablar con una persona» (/contacto) y el
    enlace a cómo se tratan los mensajes (/privacidad#asistente).
  · Las respuestas se pintan como TEXTO PLANO (sin Markdown ni HTML).
  · `ofrecer_llamada` → botón al enlace que devuelve la herramienta;
    `ofrecer_solicitud` o un respaldo → el mini formulario (una sola vez, al final).
  · La conversación vive en la memoria de esta pestaña: ni cookie ni almacenamiento.
*/

type Parte = UIMessage["parts"][number]

/** Salida de `ofrecer_llamada`, comprobada: solo una ruta interna o https://calendly.com. */
function enlaceLlamada(p: Parte): string | null {
  if (p.type !== "tool-ofrecer_llamada") return null
  const salida = (p as { state?: string; output?: { url?: unknown } }).state === "output-available" ? (p as { output?: { url?: unknown } }).output : undefined
  const url = typeof salida?.url === "string" ? salida.url : null
  if (!url) return null
  if (url.startsWith("/") && !url.startsWith("//")) return url
  try {
    const u = new URL(url)
    return u.protocol === "https:" && u.hostname === "calendly.com" ? u.toString() : null
  } catch {
    return null
  }
}

const pideFormulario = (p: Parte) =>
  (p.type === "tool-ofrecer_solicitud" && (p as { state?: string }).state === "output-available") || p.type === "data-respaldo"

export default function AsistentePanel({ carta, abierto, onCerrar }: { carta: () => string | null; abierto: boolean; onCerrar: () => void }) {
  const t = useTranslations("asistente")
  const locale = useLocale()
  const id = useId()
  const [texto, setTexto] = useState("")
  const [formularioManual, setFormularioManual] = useState(false)
  const entrada = useRef<HTMLTextAreaElement>(null)
  const final = useRef<HTMLDivElement>(null)

  // Solo el texto de cada mensaje (lib/asistente/peticion.ts): con las salidas de las
  // herramientas, el cuerpo pasaba de 32 KB hacia el turno 7-11 y el chat daba 413.
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/asistente", body: { locale }, prepareSendMessagesRequest: cuerpoPeticion }),
    [locale],
  )
  const { messages, sendMessage, status, error } = useChat({ transport })
  const ocupado = status === "submitted" || status === "streaming"

  useEffect(() => {
    if (abierto) entrada.current?.focus()
  }, [abierto])
  // Lo nuevo a la vista: el mensaje de la persona y el «escribiendo», por abajo;
  // una respuesta, por su principio (si trae el formulario, que no tape el texto).
  useEffect(() => {
    const ultima = messages.at(-1)
    if (ultima?.role === "assistant" && status !== "submitted") {
      document.getElementById(`${id}-${ultima.id}`)?.scrollIntoView({ block: "start" })
    } else {
      final.current?.scrollIntoView({ block: "end" })
    }
  }, [messages, status, id])

  // El modelo rechazó o no dijo nada: lo mismo que con un cupo agotado (respaldo + formulario).
  const vacio = sinRespuesta(messages, status)
  const mostrarFormulario =
    formularioManual || !!error || vacio || messages.some((m) => m.role === "assistant" && m.parts.some(pideFormulario))

  function enviar(ev?: FormEvent) {
    ev?.preventDefault()
    const limpio = texto.trim()
    if (!limpio || ocupado) return
    void sendMessage({ text: limpio.slice(0, LIMITES.caracteresMensaje) })
    setTexto("")
  }

  function teclas(ev: KeyboardEvent<HTMLTextAreaElement>) {
    if (ev.key === "Enter" && !ev.shiftKey && !ev.nativeEvent.isComposing) {
      ev.preventDefault()
      enviar()
    }
  }

  const restantes = LIMITES.caracteresMensaje - texto.length

  return (
    <div
      id="asistente-propietarios"
      role="dialog"
      aria-modal="false"
      aria-labelledby={`${id}-titulo`}
      // MOT-M11: el aviso de IA (art. 50 del Reglamento de IA) es la descripción del
      // diálogo: el lector de pantalla lo anuncia al abrirlo, no solo al recorrer el log.
      aria-describedby={`${id}-aviso`}
      onKeyDown={(ev) => {
        if (ev.key === "Escape") onCerrar()
      }}
      className="fixed z-50 inset-x-0 bottom-0 h-[85dvh] md:inset-auto md:bottom-6 md:right-6 md:h-[min(640px,calc(100dvh-3rem))] md:w-[400px] flex flex-col bg-background text-foreground border border-border md:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden"
    >
      <header className="flex items-start justify-between gap-3 px-5 py-4 bg-[hsl(var(--olive))] text-background">
        <div>
          <h2 id={`${id}-titulo`} className="font-serif text-xl leading-tight">
            {t("titulo")}
          </h2>
          <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-background/75 mt-1">{t("subtitulo")}</p>
        </div>
        <button
          type="button"
          onClick={onCerrar}
          aria-label={t("cerrar")}
          className="p-2 -m-1 rounded-full hover:bg-background/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--gold))]"
        >
          <X className="h-5 w-5" strokeWidth={1.5} aria-hidden />
        </button>
      </header>

      <div role="log" aria-live="polite" aria-relevant="additions" className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-3 text-[0.92rem] leading-relaxed">
        {/* Primer mensaje: de la interfaz, no del modelo. */}
        <div className="self-start max-w-[90%] rounded-2xl rounded-tl-sm bg-secondary/60 px-4 py-3">
          <p id={`${id}-aviso`} className="whitespace-pre-line">
            {t("bienvenida")}
          </p>
        </div>

        {messages.map((m) => {
          const textoMensaje = m.parts
            .filter((p): p is Extract<Parte, { type: "text" }> => p.type === "text")
            .map((p) => p.text)
            .join("")
          const llamadas = m.parts.map(enlaceLlamada).filter((u): u is string => u !== null)
          if (m.role === "user") {
            return (
              <div key={m.id} className="self-end max-w-[85%] rounded-2xl rounded-tr-sm bg-[hsl(var(--olive))] text-background px-4 py-2.5">
                <p className="whitespace-pre-line break-words">{textoMensaje}</p>
              </div>
            )
          }
          return (
            <div key={m.id} id={`${id}-${m.id}`} className="self-start max-w-[90%] flex flex-col gap-2 scroll-mt-4">
              {textoMensaje && (
                <div className="rounded-2xl rounded-tl-sm bg-secondary/60 px-4 py-3">
                  <p className="whitespace-pre-line break-words">{textoMensaje}</p>
                </div>
              )}
              {llamadas.slice(0, 1).map((url) => (
                <a
                  key={url}
                  href={url}
                  {...(url.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="self-start inline-flex items-center gap-2 px-4 py-2.5 border border-[hsl(var(--olive))] text-[hsl(var(--olive))] font-mono text-[10px] tracking-[0.2em] uppercase hover:bg-[hsl(var(--olive))] hover:text-background transition-colors"
                >
                  <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                  {t("llamada")}
                </a>
              ))}
            </div>
          )
        })}

        {status === "submitted" && (
          <p role="status" className="self-start text-[0.8rem] text-muted-foreground italic">
            {t("escribiendo")}
          </p>
        )}
        {vacio && !error && (
          <div role="status" className="self-start max-w-[90%] rounded-2xl rounded-tl-sm bg-secondary/60 px-4 py-3">
            <p>{textoRespaldo(locale as Locale, "no_disponible")}</p>
          </div>
        )}
        {error && (
          <div role="alert" className="self-start max-w-[90%] rounded-2xl rounded-tl-sm border border-[#b85432]/40 bg-[#b85432]/8 px-4 py-3">
            <p>{t("error")}</p>
          </div>
        )}
        {mostrarFormulario && <FormularioSolicitud carta={carta} />}
        <div ref={final} />
      </div>

      <div className="border-t border-border px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <form onSubmit={enviar} className="flex items-end gap-2">
          <label htmlFor={`${id}-entrada`} className="sr-only">
            {t("etiqueta")}
          </label>
          <textarea
            ref={entrada}
            id={`${id}-entrada`}
            value={texto}
            onChange={(ev) => setTexto(ev.target.value.slice(0, LIMITES.caracteresMensaje))}
            onKeyDown={teclas}
            maxLength={LIMITES.caracteresMensaje}
            rows={2}
            placeholder={t("placeholder")}
            aria-describedby={restantes < 200 ? `${id}-restantes` : undefined}
            className="flex-1 resize-none bg-secondary/40 rounded-xl px-3 py-2 text-[0.92rem] placeholder:text-muted-foreground/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--olive))]"
          />
          <button
            type="submit"
            disabled={ocupado || texto.trim() === ""}
            aria-label={t("enviar")}
            className="h-10 w-10 shrink-0 grid place-items-center rounded-full bg-[hsl(var(--olive))] text-background disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--gold))]"
          >
            <ArrowUp className="h-4 w-4" strokeWidth={2} aria-hidden />
          </button>
        </form>
        {restantes < 200 && (
          <p id={`${id}-restantes`} className="text-[0.7rem] text-muted-foreground mt-1">
            {t("restantes", { n: restantes })}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[0.75rem]">
          <Link href="/contacto?type=owner" className="underline underline-offset-4 decoration-foreground/40 hover:decoration-foreground">
            {t("persona")}
          </Link>
          {!mostrarFormulario && (
            <button type="button" onClick={() => setFormularioManual(true)} className="underline underline-offset-4 decoration-foreground/40 hover:decoration-foreground">
              {t("dejar_datos")}
            </button>
          )}
          <Link href="/privacidad#asistente" className="text-muted-foreground underline underline-offset-4 decoration-foreground/30">
            {t("privacidad")}
          </Link>
        </div>
      </div>
    </div>
  )
}
