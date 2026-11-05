"use client"

import { useId, useState, type FormEvent, type ReactNode } from "react"
import { ArrowRight, Check } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { HONEYPOT_FIELD } from "@/lib/contact-fields"
import {
  OCUPACION_MAX,
  OCUPACION_MIN,
  PRECIO_NOCHE_MAX,
  estadoTrasRespuesta,
  estimar,
  type EstadoFormulario,
} from "@/lib/calculadora-propietarios"
import { normalizarTelefonoE164 } from "@/lib/telefono-e164"
import { euros, type Idioma } from "@/lib/tarifa"
import { ZONAS } from "@/lib/zonas"

/*
  /propietarios/calculadora — el cálculo y el formulario.

  Dos reglas de esta pantalla, las dos heredadas del simulador de /propietarios:

  1. Un input ignorado miente. Municipio y dormitorios NO entran en la fórmula
     (no hay en el repo ninguna media de mercado con fuente que los use), y la
     pantalla lo dice junto a los campos. Sirven para el lead.
  2. Ninguna cifra de mercado por defecto. Precio y ocupación empiezan vacíos;
     hasta que el propietario los pone no hay estimación, solo un ejemplo
     etiquetado como ejemplo con las cifras de la tarifa (lib/tarifa).

  Las cifras salen de `estimar` (lib/calculadora-propietarios), que lee la
  tarifa v6 de lib/tarifa. Aquí no hay ningún porcentaje escrito.
*/

type Estado = EstadoFormulario

const CLASE_CAMPO =
  "bg-transparent border-b border-border py-2 text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground transition-colors [&:user-invalid]:border-[#b85432] [&:user-invalid]:text-[#b85432]"
const CLASE_ETIQUETA = "font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground"

function Campo({
  label,
  hint,
  required,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  children: (props: { id: string; "aria-describedby"?: string }) => ReactNode
}) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={CLASE_ETIQUETA}>
        {label}
        {required && (
          <span aria-hidden className="text-[hsl(var(--gold))] ml-1">
            *
          </span>
        )}
      </label>
      {children({ id, "aria-describedby": hintId })}
      {hint && (
        <p id={hintId} className="text-[0.8rem] leading-relaxed text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  )
}

export function CalculadoraContent() {
  const t = useTranslations()
  const locale = useLocale() as Idioma
  const e = (n: number) => euros(n, locale)
  const pct = (n: number) => (locale === "en" ? `${n}%` : `${n} %`)

  // Entradas. Vacías hasta que el propietario las pone: ninguna media de mercado por defecto.
  const [municipio, setMunicipio] = useState("")
  const [dormitorios, setDormitorios] = useState("")
  const [precioTxt, setPrecioTxt] = useState("")
  const [ocupacion, setOcupacion] = useState<number | null>(null)

  // Formulario.
  const [consentimiento, setConsentimiento] = useState(false)
  const [estado, setEstado] = useState<Estado>("reposo")
  // Teléfono: la misma regla que seda_os. Si no se puede llevar a E.164, se pide
  // el prefijo AQUÍ, junto al campo, antes de enviar nada.
  const [telefono, setTelefono] = useState("")
  const [pedirPrefijo, setPedirPrefijo] = useState(false)
  const telefonoSinPrefijo = telefono.trim() !== "" && normalizarTelefonoE164(telefono) === null

  const precio = Number(precioTxt.replace(",", "."))
  const est = ocupacion === null ? null : estimar(precio, ocupacion)

  async function enviar(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    if (!est || ocupacion === null || estado === "enviando") return
    if (telefonoSinPrefijo) {
      setPedirPrefijo(true)
      ev.currentTarget.querySelector<HTMLInputElement>('input[name="telefono"]')?.focus()
      return
    }
    const datos = new FormData(ev.currentTarget)
    const dorm = Number(dormitorios)
    setEstado("enviando")
    try {
      const resp = await fetch("/api/leads/propietario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: String(datos.get("nombre") ?? ""),
          email: String(datos.get("email") ?? ""),
          telefono: telefono.trim(),
          consentimiento,
          locale,
          municipio: municipio.trim(),
          ...(dormitorios !== "" && Number.isInteger(dorm) ? { dormitorios: dorm } : {}),
          precioNoche: precio,
          ocupacionPct: ocupacion,
          [HONEYPOT_FIELD]: String(datos.get(HONEYPOT_FIELD) ?? ""),
        }),
      })
      const cuerpo = (await resp.json().catch(() => ({}))) as { error?: string }
      const siguiente = estadoTrasRespuesta(resp.status, cuerpo.error)
      if (siguiente === "telefono") {
        setPedirPrefijo(true)
        setEstado("reposo")
      } else setEstado(siguiente)
    } catch {
      setEstado("error")
    }
  }

  const filas: { clave: string; etiqueta: string; directa: number; canal: number; fuerte?: boolean; aparte?: boolean }[] =
    est
      ? [
          { clave: "bruto", etiqueta: t("calculadora.results.table.bruto"), directa: est.alojamientoAnual, canal: est.alojamientoAnual },
          { clave: "canal", etiqueta: t("calculadora.results.table.canal_row"), directa: est.directa.canal, canal: est.conCanal.canal },
          { clave: "seda", etiqueta: t("calculadora.results.table.seda"), directa: est.directa.comision, canal: est.conCanal.comision },
        ]
      : []

  return (
    <>
      <section className="px-6 md:px-12 lg:px-20 py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
          {/* ── Entradas ── */}
          <div className="bg-background border border-border rounded-2xl p-6 sm:p-8 md:p-10">
            <h2 className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground">
              {t("calculadora.inputs.heading")}
            </h2>

            <div className="mt-6 flex flex-col gap-7">
              <Campo label={t("calculadora.inputs.municipio.label")}>
                {(p) => (
                  <>
                    <input
                      {...p}
                      type="text"
                      list={`${p.id}-zonas`}
                      value={municipio}
                      onChange={(ev) => setMunicipio(ev.target.value)}
                      placeholder={t("calculadora.inputs.municipio.placeholder")}
                      maxLength={120}
                      autoComplete="off"
                      className={CLASE_CAMPO}
                    />
                    <datalist id={`${p.id}-zonas`}>
                      {ZONAS.map((z) => (
                        <option key={z.name} value={z.name} />
                      ))}
                    </datalist>
                  </>
                )}
              </Campo>

              <Campo label={t("calculadora.inputs.dormitorios.label")}>
                {(p) => (
                  <input
                    {...p}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={50}
                    step={1}
                    value={dormitorios}
                    onChange={(ev) => setDormitorios(ev.target.value)}
                    placeholder={t("calculadora.inputs.dormitorios.placeholder")}
                    className={CLASE_CAMPO}
                  />
                )}
              </Campo>

              <p className="text-[0.8rem] leading-relaxed text-muted-foreground -mt-2">{t("calculadora.inputs.context_note")}</p>

              <Campo label={`${t("calculadora.inputs.precio.label")} (€)`} hint={t("calculadora.inputs.precio.hint")}>
                {(p) => (
                  <input
                    {...p}
                    type="number"
                    inputMode="decimal"
                    min={1}
                    max={PRECIO_NOCHE_MAX}
                    step="any"
                    value={precioTxt}
                    onChange={(ev) => setPrecioTxt(ev.target.value)}
                    placeholder={t("calculadora.inputs.precio.placeholder")}
                    className={CLASE_CAMPO}
                  />
                )}
              </Campo>

              <Campo label={t("calculadora.inputs.ocupacion.label")} hint={t("calculadora.inputs.ocupacion.hint")}>
                {(p) => (
                  <>
                    <p className="font-serif text-xl" aria-hidden>
                      {ocupacion === null ? (
                        <span className="text-muted-foreground/70 text-base">{t("calculadora.inputs.ocupacion.sin_elegir")}</span>
                      ) : (
                        pct(ocupacion)
                      )}
                    </p>
                    <input
                      {...p}
                      type="range"
                      min={OCUPACION_MIN}
                      max={OCUPACION_MAX}
                      step={1}
                      // El deslizador siempre tiene una posición; hasta que se toca no hay valor elegido.
                      value={ocupacion ?? Math.round((OCUPACION_MIN + OCUPACION_MAX) / 2)}
                      aria-valuetext={ocupacion === null ? t("calculadora.inputs.ocupacion.sin_elegir") : pct(ocupacion)}
                      onChange={(ev) => setOcupacion(Number(ev.target.value))}
                      onPointerUp={(ev) => setOcupacion((v) => v ?? Number(ev.currentTarget.value))}
                      className={`w-full accent-[hsl(var(--olive))] ${ocupacion === null ? "opacity-60" : ""}`}
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground" aria-hidden>
                      <span>{pct(OCUPACION_MIN)}</span>
                      <span>{pct(OCUPACION_MAX)}</span>
                    </div>
                  </>
                )}
              </Campo>
            </div>
          </div>

          {/* ── Resultado ── */}
          <div className="flex flex-col gap-6">
            <div className="bg-secondary/40 border border-border rounded-2xl p-6 sm:p-8 md:p-10">
              <h2 className="font-serif text-xl">{t("calculadora.results.heading")}</h2>

              {est ? (
                <>
                  <table className="w-full mt-6 text-left border-collapse">
                    <caption className="sr-only">{t("calculadora.results.table.caption")}</caption>
                    <thead>
                      <tr className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
                        <td className="pb-3 pr-2" />
                        <th scope="col" className="pb-3 px-2 text-right font-normal align-bottom w-[27%]">
                          {t("calculadora.results.table.directa")}
                        </th>
                        <th scope="col" className="pb-3 pl-2 text-right font-normal align-bottom w-[31%]">
                          {t("calculadora.results.table.canal")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-[0.9rem] tabular-nums">
                      {filas.map((f) => (
                        <tr key={f.clave} className="border-t border-border">
                          <th scope="row" className="py-3 pr-2 text-left font-normal text-foreground/85">
                            {f.etiqueta}
                          </th>
                          <td className="py-3 px-2 text-right">{f.clave === "bruto" ? e(f.directa) : f.directa === 0 ? "—" : `−${e(f.directa)}`}</td>
                          <td className="py-3 pl-2 text-right">{f.clave === "bruto" ? e(f.canal) : `−${e(f.canal)}`}</td>
                        </tr>
                      ))}
                      <tr className="border-t border-border">
                        <th scope="row" className="py-3 pr-2 text-left font-normal text-foreground/85">
                          {t("calculadora.results.table.limpieza")}
                        </th>
                        <td colSpan={2} className="py-3 pl-2 text-right text-[0.8rem] leading-snug text-muted-foreground">
                          {t("calculadora.results.table.limpieza_value")}
                        </td>
                      </tr>
                      <tr className="border-t border-foreground/40">
                        <th scope="row" className="py-4 pr-2 text-left font-serif text-lg font-normal">
                          {t("calculadora.results.table.neto")}
                        </th>
                        <td className="py-4 px-2 text-right font-serif text-xl sm:text-2xl text-[hsl(var(--olive))]">{e(est.directa.neto)}</td>
                        <td className="py-4 pl-2 text-right font-serif text-xl sm:text-2xl text-[hsl(var(--olive))]">{e(est.conCanal.neto)}</td>
                      </tr>
                      <tr className="border-t border-border text-muted-foreground">
                        <th scope="row" className="py-3 pr-2 text-left font-normal">
                          {t("calculadora.results.table.iva")}
                        </th>
                        <td className="py-3 px-2 text-right">{e(est.directa.iva)}</td>
                        <td className="py-3 pl-2 text-right">{e(est.conCanal.iva)}</td>
                      </tr>
                    </tbody>
                  </table>

                  <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted-foreground mt-8">
                    {t("calculadora.results.como")}
                  </p>
                  {est.ivaAlojamientoIncluido && (
                    <p className="text-[0.85rem] leading-relaxed text-foreground/85 mt-6">
                      {t("calculadora.results.iva_alojamiento", { pagado: e(est.pagadoHuespedes), cuota: e(est.cuotaIvaAlojamiento) })}
                    </p>
                  )}

                  <p className="text-[0.85rem] leading-relaxed text-muted-foreground mt-2">{t("calculadora.results.como_body")}</p>
                </>
              ) : (
                <div className="mt-6">
                  <p className="text-[0.95rem] leading-relaxed text-foreground/85">{t("calculadora.results.empty")}</p>
                  <div className="mt-6 border border-dashed border-border rounded-lg p-4">
                    <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-[hsl(var(--gold))]">
                      {t("calculadora.results.example_label")}
                    </p>
                    <p className="text-[0.85rem] leading-relaxed text-muted-foreground mt-2">{t("calculadora.results.example_body")}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Aviso: junto a las cifras, no en un pie. */}
            <aside className="border-l-2 border-[hsl(var(--gold))] bg-secondary/40 px-5 py-4" aria-labelledby="aviso-calc">
              <p id="aviso-calc" className="font-mono text-[10px] tracking-[0.22em] uppercase text-foreground">
                {t("calculadora.aviso.label")}
              </p>
              <p className="text-[0.85rem] leading-relaxed text-foreground/85 mt-2">{t("calculadora.aviso.body")}</p>
            </aside>
          </div>
        </div>
      </section>

      {/* ── Formulario ── */}
      <section className="px-6 md:px-12 lg:px-20 pb-20 md:pb-28 bg-background">
        <div className="max-w-3xl mx-auto border border-border rounded-2xl p-6 sm:p-8 md:p-12">
          {estado === "ok" ? (
            <div role="status" className="flex flex-col items-start gap-4">
              <span className="w-10 h-10 rounded-full bg-[hsl(var(--olive))] text-[hsl(var(--gold-light))] grid place-items-center">
                <Check className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <h2 className="font-serif font-light text-2xl md:text-3xl leading-tight">{t("calculadora.gracias.title")}</h2>
              <p className="text-base leading-relaxed text-muted-foreground">{t("calculadora.gracias.body")}</p>
            </div>
          ) : (
            <form onSubmit={enviar} className="flex flex-col gap-7">
              <div>
                <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-3">
                  {t("calculadora.form.eyebrow")}
                </p>
                <h2 className="font-serif font-light text-2xl md:text-3xl leading-tight tracking-tight text-balance">
                  {t("calculadora.form.h2")}
                </h2>
                <p className="text-[0.95rem] leading-relaxed text-muted-foreground mt-4">{t("calculadora.form.body")}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
                <Campo label={t("calculadora.form.nombre")} required>
                  {(p) => <input {...p} name="nombre" type="text" required maxLength={120} autoComplete="name" className={CLASE_CAMPO} />}
                </Campo>
                <Campo label={t("calculadora.form.email")} required>
                  {(p) => <input {...p} name="email" type="email" required maxLength={254} autoComplete="email" className={CLASE_CAMPO} />}
                </Campo>
              </div>
              <Campo label={t("calculadora.form.telefono")} hint={t("calculadora.form.telefono_hint")}>
                {(p) => {
                  const avisar = pedirPrefijo && telefonoSinPrefijo
                  const errorId = `${p.id}-prefijo`
                  return (
                    <>
                      <input
                        {...p}
                        aria-describedby={[p["aria-describedby"], avisar ? errorId : undefined].filter(Boolean).join(" ") || undefined}
                        aria-invalid={avisar || undefined}
                        name="telefono"
                        type="tel"
                        maxLength={40}
                        autoComplete="tel"
                        value={telefono}
                        onChange={(ev) => setTelefono(ev.target.value)}
                        onBlur={() => setPedirPrefijo(telefonoSinPrefijo)}
                        className={`${CLASE_CAMPO} ${avisar ? "border-[#b85432]" : ""}`}
                      />
                      {avisar && (
                        <p id={errorId} role="alert" className="text-[0.85rem] leading-relaxed text-[#b85432]">
                          {t("calculadora.form.telefono_prefijo")}
                        </p>
                      )}
                    </>
                  )
                }}
              </Campo>

              {/* Trampa para bots: fuera de pantalla, fuera del orden de tabulación, invisible a lectores de pantalla. */}
              <div aria-hidden="true" className="absolute -left-[10000px] top-auto w-px h-px overflow-hidden">
                <label>
                  Website
                  <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" defaultValue="" />
                </label>
              </div>

              {/* Consentimiento RGPD: casilla propia, sin marcar de antemano, obligatoria, con enlace a la privacidad. */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="consentimiento"
                  required
                  checked={consentimiento}
                  onChange={(ev) => setConsentimiento(ev.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 accent-[hsl(var(--olive))]"
                />
                <span className="text-[0.85rem] leading-relaxed text-foreground/85">
                  {t.rich("calculadora.form.consent", {
                    privacidad: (chunks) => (
                      <Link
                        href="/privacidad"
                        target="_blank"
                        rel="noopener"
                        className="underline underline-offset-4 decoration-foreground/40 hover:decoration-foreground"
                      >
                        {chunks}
                      </Link>
                    ),
                  })}
                  <span aria-hidden className="text-[hsl(var(--gold))] ml-1">
                    *
                  </span>
                </span>
              </label>

              {(estado === "error" || estado === "limite" || estado === "datos") && (
                <div role="alert" className="border-l-2 border-[#b85432] bg-[#b85432]/8 px-4 py-3 text-[0.9rem] text-foreground/85">
                  {estado === "limite"
                    ? t("calculadora.form.error_rate")
                    : estado === "datos"
                      ? t("calculadora.form.error_datos")
                      : t("calculadora.form.error")}{" "}
                  {estado === "error" && (
                    <Link href="/contacto?type=owner" className="underline underline-offset-4">
                      {t("calculadora.form.error_contact")}
                    </Link>
                  )}
                </div>
              )}

              <div className="flex flex-col items-start gap-3">
                <button
                  type="submit"
                  disabled={!est || estado === "enviando"}
                  className="group inline-flex items-center gap-3 px-7 py-3.5 bg-[hsl(var(--olive))] text-background font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-[hsl(var(--olive))]/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {estado === "enviando" ? t("calculadora.form.sending") : t("calculadora.form.submit")}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={1.75} />
                </button>
                {!est && <p className="text-[0.8rem] leading-relaxed text-muted-foreground">{t("calculadora.form.needs_estimate")}</p>}
              </div>
            </form>
          )}
        </div>
      </section>
    </>
  )
}
