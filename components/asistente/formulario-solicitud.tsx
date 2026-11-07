"use client"

import { useId, useState, type FormEvent } from "react"
import { Check } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { estadoTrasRespuesta, type EstadoFormulario } from "@/lib/calculadora-propietarios"
import { cartaParaEnviar } from "@/lib/carta-qr"
import { HONEYPOT_FIELD } from "@/lib/contact-fields"
import { cabecerasConsentimiento, rastrearLead } from "@/lib/meta-pixel-cliente"
import { normalizarTelefonoE164 } from "@/lib/telefono-e164"

/*
  El mini formulario del asistente: el MISMO de la calculadora reducido a
  nombre, correo, teléfono opcional y la casilla de consentimiento, con los
  mismos textos (`calculadora.form.*`, `calculadora.gracias.*`) y las mismas
  reglas (prefijo del teléfono, honeypot, estados tras la respuesta).

  Lo rellena la persona. El modelo no lo rellena ni decide el consentimiento:
  este componente no recibe nada del modelo, solo aparece cuando el modelo
  llama a `ofrecer_solicitud` o cuando hay un mensaje de respaldo.

  Va a /api/asistente/solicitud (canal "asistente", sin ninguna cifra), con la
  carta del QR si la había. El Lead de Meta, como en la calculadora: solo si el
  servidor devuelve `event_id` (consentimiento de marketing + 201 de seda_os).
*/

const CLASE_CAMPO =
  "w-full bg-transparent border-b border-border py-2 text-[0.95rem] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground transition-colors"
const CLASE_ETIQUETA = "font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground"

/** `carta`: lee, al enviar, el código del QR que guardó el botón del asistente (solo en memoria). */
export function FormularioSolicitud({ carta }: { carta: () => string | null }) {
  const t = useTranslations()
  const locale = useLocale()
  const id = useId()
  const [estado, setEstado] = useState<EstadoFormulario>("reposo")
  const [consentimiento, setConsentimiento] = useState(false)
  const [telefono, setTelefono] = useState("")
  const [pedirPrefijo, setPedirPrefijo] = useState(false)
  const telefonoSinPrefijo = telefono.trim() !== "" && normalizarTelefonoE164(telefono) === null

  async function enviar(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    if (estado === "enviando") return
    if (telefonoSinPrefijo) {
      setPedirPrefijo(true)
      ev.currentTarget.querySelector<HTMLInputElement>('input[name="telefono"]')?.focus()
      return
    }
    const datos = new FormData(ev.currentTarget)
    const c = cartaParaEnviar(carta())
    setEstado("enviando")
    try {
      const resp = await fetch("/api/asistente/solicitud", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...cabecerasConsentimiento() },
        body: JSON.stringify({
          nombre: String(datos.get("nombre") ?? ""),
          email: String(datos.get("email") ?? ""),
          telefono: telefono.trim(),
          consentimiento,
          locale,
          ...(c !== undefined ? { carta: c } : {}),
          [HONEYPOT_FIELD]: String(datos.get(HONEYPOT_FIELD) ?? ""),
        }),
      })
      const cuerpo = (await resp.json().catch(() => ({}))) as { error?: string; lead?: { event_id?: unknown } }
      if (resp.ok && typeof cuerpo.lead?.event_id === "string") rastrearLead(cuerpo.lead.event_id)
      const siguiente = estadoTrasRespuesta(resp.status, cuerpo.error)
      if (siguiente === "telefono") {
        setPedirPrefijo(true)
        setEstado("reposo")
      } else setEstado(siguiente)
    } catch {
      setEstado("error")
    }
  }

  if (estado === "ok") {
    return (
      <div role="status" className="border border-border rounded-xl p-4 bg-background flex gap-3 items-start">
        <span className="w-7 h-7 shrink-0 rounded-full bg-[hsl(var(--olive))] text-[hsl(var(--gold-light))] grid place-items-center">
          <Check className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </span>
        <div>
          <p className="font-serif text-lg leading-snug">{t("calculadora.gracias.title")}</p>
          <p className="text-[0.85rem] leading-relaxed text-muted-foreground mt-1">{t("calculadora.gracias.body")}</p>
        </div>
      </div>
    )
  }

  const avisarPrefijo = pedirPrefijo && telefonoSinPrefijo
  return (
    <form onSubmit={enviar} className="border border-border rounded-xl p-4 bg-background flex flex-col gap-4" aria-labelledby={`${id}-titulo`}>
      <div>
        <p id={`${id}-titulo`} className="font-serif text-lg leading-snug">
          {t("asistente.form_titulo")}
        </p>
        <p className="text-[0.8rem] leading-relaxed text-muted-foreground mt-1">{t("asistente.form_cuerpo")}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-nombre`} className={CLASE_ETIQUETA}>
          {t("calculadora.form.nombre")}
          <span aria-hidden className="text-[hsl(var(--gold))] ml-1">*</span>
        </label>
        <input id={`${id}-nombre`} name="nombre" type="text" required maxLength={120} autoComplete="name" className={CLASE_CAMPO} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-email`} className={CLASE_ETIQUETA}>
          {t("calculadora.form.email")}
          <span aria-hidden className="text-[hsl(var(--gold))] ml-1">*</span>
        </label>
        <input id={`${id}-email`} name="email" type="email" required maxLength={254} autoComplete="email" className={CLASE_CAMPO} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-tel`} className={CLASE_ETIQUETA}>
          {t("calculadora.form.telefono")}
        </label>
        <input
          id={`${id}-tel`}
          name="telefono"
          type="tel"
          maxLength={40}
          autoComplete="tel"
          value={telefono}
          onChange={(ev) => setTelefono(ev.target.value)}
          onBlur={() => setPedirPrefijo(telefonoSinPrefijo)}
          aria-describedby={`${id}-tel-hint${avisarPrefijo ? ` ${id}-tel-prefijo` : ""}`}
          aria-invalid={avisarPrefijo || undefined}
          className={`${CLASE_CAMPO} ${avisarPrefijo ? "border-[#b85432]" : ""}`}
        />
        <p id={`${id}-tel-hint`} className="text-[0.75rem] leading-relaxed text-muted-foreground">
          {t("calculadora.form.telefono_hint")}
        </p>
        {avisarPrefijo && (
          <p id={`${id}-tel-prefijo`} role="alert" className="text-[0.8rem] leading-relaxed text-[#b85432]">
            {t("calculadora.form.telefono_prefijo")}
          </p>
        )}
      </div>

      {/* Trampa para bots: fuera de pantalla, fuera del orden de tabulación, invisible a lectores de pantalla. */}
      <div aria-hidden="true" className="absolute -left-[10000px] top-auto w-px h-px overflow-hidden">
        <label>
          Website
          <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      {/* Consentimiento RGPD: la casilla y el texto de la calculadora, sin marcar, obligatoria. */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          name="consentimiento"
          required
          checked={consentimiento}
          onChange={(ev) => setConsentimiento(ev.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-[hsl(var(--olive))]"
        />
        <span className="text-[0.8rem] leading-relaxed text-foreground/85">
          {t.rich("calculadora.form.consent", {
            privacidad: (chunks) => (
              <Link href="/privacidad" target="_blank" rel="noopener" className="underline underline-offset-4 decoration-foreground/40 hover:decoration-foreground">
                {chunks}
              </Link>
            ),
          })}
          <span aria-hidden className="text-[hsl(var(--gold))] ml-1">*</span>
        </span>
      </label>

      {(estado === "error" || estado === "limite" || estado === "limite_minuto" || estado === "datos") && (
        <p role="alert" className="border-l-2 border-[#b85432] bg-[#b85432]/8 px-3 py-2 text-[0.8rem] text-foreground/85">
          {estado === "limite_minuto"
            ? t("calculadora.form.error_rate_minuto")
            : estado === "limite"
              ? t("calculadora.form.error_rate")
              : estado === "datos"
                ? t("calculadora.form.error_datos")
                : t("calculadora.form.error")}
        </p>
      )}

      <button
        type="submit"
        disabled={estado === "enviando"}
        className="self-start inline-flex items-center gap-2 px-5 py-3 bg-[hsl(var(--olive))] text-background font-mono text-[10px] tracking-[0.22em] uppercase hover:bg-[hsl(var(--olive))]/90 transition-colors disabled:opacity-40"
      >
        {estado === "enviando" ? t("calculadora.form.sending") : t("calculadora.form.submit")}
      </button>
    </form>
  )
}
