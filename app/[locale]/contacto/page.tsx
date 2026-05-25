"use client"

import { useEffect, useState, type ReactNode } from "react"
import { ArrowUpRight } from "lucide-react"
import { getVillaBySlug } from "@/lib/villas"
import { useTranslations } from "next-intl"

type ContactType = "guest" | "owner" | "other"

function Field({
  label,
  placeholder,
  type = "text",
  name,
  required = false,
  pattern,
  defaultValue,
  autoComplete,
}: {
  label: string
  placeholder: string
  type?: string
  name: string
  required?: boolean
  pattern?: string
  defaultValue?: string
  autoComplete?: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
        {label}
        {required && <span aria-hidden className="text-[hsl(var(--gold))] ml-1">*</span>}
      </span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        pattern={pattern}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        className="
          bg-transparent border-b border-border py-2 text-base text-foreground
          placeholder:text-muted-foreground/60 focus:outline-none
          focus:border-foreground transition-colors
          [&:user-invalid]:border-[#b85432]
          [&:user-invalid]:text-[#b85432]
        "
      />
    </div>
  )
}

function FormRow({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">{children}</div>
}

function GuestForm({ villaName }: { villaName: string | null }) {
  const t = useTranslations()
  // When the visitor lands here from a /villa/[slug] page, we surface a small
  // banner so they immediately see that their interest in that property has
  // been captured, and we pre-seed the notes textarea with the villa name.
  const noteSeed = villaName ? t("contacto.villa.interest_note", { name: villaName }) : ""
  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-3">
          {t("contacto.form.guest.eyebrow")}
        </p>
        <h3 className="font-serif font-light text-2xl md:text-[1.65rem] leading-tight tracking-tight text-foreground">
          {t("contacto.form.guest.h3_line1")} <span className="italic">{t("contacto.form.guest.h3_italic")}</span>
        </h3>
      </div>

      {villaName && (
        <div className="flex items-center gap-3 bg-[hsl(var(--olive))]/10 border-l-2 border-[hsl(var(--olive))] px-4 py-3">
          <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[hsl(var(--olive))]">
            {t("contacto.villa.label")}
          </span>
          <span className="font-serif italic text-foreground">{villaName}</span>
        </div>
      )}
      <FormRow>
        <Field name="arrival"  label={t("contacto.form.labels.arrival")} placeholder={t("contacto.form.placeholders.date")} required />
        <Field name="departure" label={t("contacto.form.labels.departure")}  placeholder={t("contacto.form.placeholders.date")} required />
      </FormRow>
      <FormRow>
        <Field name="zone"   label={t("contacto.form.labels.zone")}       placeholder={t("contacto.form.placeholders.zone")} />
        <Field name="guests" label={t("contacto.form.labels.guests")} placeholder={t("contacto.form.placeholders.guests")} required />
      </FormRow>
      <FormRow>
        <Field name="property_type" label={t("contacto.form.labels.property_type")}  placeholder={t("contacto.form.placeholders.property_type_guest")} />
        <Field name="services"      label={t("contacto.form.labels.services")} placeholder={t("contacto.form.placeholders.services")} />
      </FormRow>
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
          {t("contacto.form.labels.notes")}
        </span>
        <textarea
          name="notes"
          defaultValue={noteSeed}
          placeholder={t("contacto.form.placeholders.notes_guest")}
          rows={4}
          className="bg-transparent border border-border focus:border-foreground transition-colors p-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none resize-none"
        />
      </div>
      <FormRow>
        <Field name="name"  label={t("contacto.form.labels.name")} placeholder={t("contacto.form.placeholders.name")} required autoComplete="name" />
        <Field name="email" label={t("contacto.form.labels.email")}  placeholder={t("contacto.form.placeholders.email")} type="email" required autoComplete="email" />
      </FormRow>
      <Field name="whatsapp" label={t("contacto.form.labels.whatsapp")} placeholder={t("contacto.form.placeholders.whatsapp")} type="tel" pattern="[\\d\\s+()-]{6,}" autoComplete="tel" />
    </div>
  )
}

function OwnerForm() {
  const t = useTranslations()
  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-3">
          {t("contacto.form.owner.eyebrow")}
        </p>
        <h3 className="font-serif font-light text-2xl md:text-[1.65rem] leading-tight tracking-tight text-foreground">
          {t("contacto.form.owner.h3_line1")} <span className="italic">{t("contacto.form.owner.h3_italic")}</span>
        </h3>
      </div>
      <FormRow>
        <Field name="property_location" label={t("contacto.form.labels.location")} placeholder={t("contacto.form.placeholders.location")} required />
        <Field name="property_type"      label={t("contacto.form.labels.property_type")}      placeholder={t("contacto.form.placeholders.property_type_owner")} required />
      </FormRow>
      <FormRow>
        <Field name="bedrooms" label={t("contacto.form.labels.bedrooms")}   placeholder={t("contacto.form.placeholders.bedrooms")} type="number" required />
        <Field name="status"   label={t("contacto.form.labels.status")} placeholder={t("contacto.form.placeholders.status")} />
      </FormRow>
      <Field name="goal" label={t("contacto.form.labels.goal")} placeholder={t("contacto.form.placeholders.goal")} />
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
          {t("contacto.form.labels.notes")}
        </span>
        <textarea
          name="notes"
          placeholder={t("contacto.form.placeholders.notes_owner")}
          rows={4}
          className="bg-transparent border border-border focus:border-foreground transition-colors p-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none resize-none"
        />
      </div>
      <FormRow>
        <Field name="name"  label={t("contacto.form.labels.name")} placeholder={t("contacto.form.placeholders.name")} required autoComplete="name" />
        <Field name="email" label={t("contacto.form.labels.email")}  placeholder={t("contacto.form.placeholders.email")} type="email" required autoComplete="email" />
      </FormRow>
      <Field name="whatsapp" label={t("contacto.form.labels.whatsapp")} placeholder={t("contacto.form.placeholders.whatsapp")} type="tel" pattern="[\\d\\s+()-]{6,}" autoComplete="tel" />
    </div>
  )
}

function OtherForm() {
  const t = useTranslations()
  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-3">
          {t("contacto.form.other.eyebrow")}
        </p>
        <h3 className="font-serif font-light text-2xl md:text-[1.65rem] leading-tight tracking-tight text-foreground">
          {t("contacto.form.other.h3_line1")} <span className="italic">{t("contacto.form.other.h3_italic")}</span>
        </h3>
      </div>
      <FormRow>
        <Field name="name"         label={t("contacto.form.labels.name")}       placeholder={t("contacto.form.placeholders.name")} required autoComplete="name" />
        <Field name="organization" label={t("contacto.form.labels.organization")} placeholder={t("contacto.form.placeholders.organization")} autoComplete="organization" />
      </FormRow>
      <FormRow>
        <Field name="email"   label={t("contacto.form.labels.email")}  placeholder={t("contacto.form.placeholders.email")} type="email" required autoComplete="email" />
        <Field name="subject" label={t("contacto.form.labels.subject")} placeholder={t("contacto.form.placeholders.subject")} required />
      </FormRow>
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
          {t("contacto.form.labels.message")}
          <span aria-hidden className="text-[hsl(var(--gold))] ml-1">*</span>
        </span>
        <textarea
          name="message"
          required
          minLength={20}
          placeholder={t("contacto.form.placeholders.message")}
          rows={6}
          className="bg-transparent border border-border focus:border-foreground transition-colors p-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none resize-none [&:user-invalid]:border-[#b85432]"
        />
      </div>
    </div>
  )
}

export default function ContactoPage() {
  const t = useTranslations()
  const [type, setType] = useState<ContactType>("guest")
  const [sent, setSent] = useState(false)
  const [villaName, setVillaName] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Locale-aware contact type cards
  const localizedTypes: { id: ContactType; t: string; b: string }[] = [
    { id: "guest", t: t("contacto.type.guest.title"), b: t("contacto.type.guest.desc") },
    { id: "owner", t: t("contacto.type.owner.title"), b: t("contacto.type.owner.desc") },
    { id: "other", t: t("contacto.type.other.title"), b: t("contacto.type.other.desc") },
  ]

  // Read URL query string client-side after mount.
  // Honored params:
  //   ?type=guest|owner|other  — preselects the form variant
  //   ?villa=<slug>            — surfaces a "Villa solicitada" banner + seeds notes
  // Using window.location keeps this Suspense-free (vs useSearchParams).
  useEffect(() => {
    if (typeof window === "undefined") return
    const sp = new URLSearchParams(window.location.search)
    const qType = sp.get("type")
    if (qType === "guest" || qType === "owner" || qType === "other") {
      setType(qType)
    }
    const v = sp.get("villa")
    if (v) {
      const villa = getVillaBySlug(v)
      if (villa) setVillaName(`${villa.prefix} ${villa.italic}`)
    }
  }, [])

  return (
    <main id="main-content">
      {/* Hero */}
      <section className="px-6 md:px-12 lg:px-20 pt-40 md:pt-48 pb-12 md:pb-16">
        <div className="max-w-7xl mx-auto">
          <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-8">
            {t("contacto.eyebrow")}
          </p>
          <h1 className="font-serif font-light text-[clamp(2.5rem,6vw,5.5rem)] leading-[1.02] tracking-[-0.02em] text-foreground text-balance max-w-[18ch]">
            {t("contacto.hero.h1.line1")}{" "}
            <span className="italic">{t("contacto.hero.h1.italic")}</span>
          </h1>
        </div>
      </section>

      {/* Selector + form */}
      <section className="px-6 md:px-12 lg:px-20 py-16 md:py-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 items-start">
          {/* Selector columna izquierda */}
          <aside className="md:col-span-4 flex flex-col gap-8">
            <div>
              <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-6">
                {t("contacto.selector")}
              </p>
              <div className="flex flex-col gap-3">
                {localizedTypes.map((opt) => {
                  const active = type === opt.id
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setType(opt.id)
                        setSent(false)
                      }}
                      className={`text-left p-6 border transition-colors ${
                        active
                          ? "bg-foreground text-background border-foreground"
                          : "bg-background text-foreground border-border hover:border-foreground/40"
                      }`}
                      aria-pressed={active}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-serif font-light text-xl md:text-[1.35rem] leading-tight tracking-tight">
                          {opt.t}
                        </span>
                        <span
                          className={`shrink-0 w-5 h-5 rounded-full border transition-colors ${
                            active
                              ? "border-[hsl(var(--gold))] bg-[hsl(var(--gold))]"
                              : "border-border"
                          }`}
                        />
                      </div>
                      <p
                        className={`text-[0.85rem] leading-[1.6] mt-2 ${
                          active ? "text-background/70" : "text-muted-foreground"
                        }`}
                      >
                        {opt.b}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="pt-6 border-t border-border">
              <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-4">
                {t("contacto.otros_canales")}
              </p>
              <ul className="space-y-2 text-[0.9rem] text-foreground/85">
                <li>
                  <a href="mailto:info@sedaprivatehomes.com" className="hover:text-foreground transition-colors">
                    info@sedaprivatehomes.com
                  </a>
                </li>
                <li>
                  <a href="tel:+34686980798" className="hover:text-foreground transition-colors">
                    +34 686 980 798
                  </a>
                </li>
                <li className="text-muted-foreground">
                  {t("contacto.address_line")}
                </li>
              </ul>
            </div>
          </aside>

          {/* Formulario columna derecha */}
          <div className="md:col-span-8">
            {sent ? (
              <div className="bg-[hsl(var(--olive))] text-background p-10 md:p-16 text-center">
                <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-[hsl(var(--gold))] mb-6">
                  {t("contacto.received.eyebrow")}
                </p>
                <h3 className="font-serif font-light text-3xl md:text-4xl lg:text-[2.75rem] leading-[1.05] tracking-[-0.015em] text-balance">
                  {t("contacto.received.h3.line1")}{" "}
                  <span className="italic text-[hsl(var(--gold))]">{t("contacto.received.h3.italic")}</span>
                </h3>
                <p className="text-[0.95rem] leading-[1.7] text-background/75 max-w-[44ch] mx-auto mt-6">
                  {t("contacto.received.body")}
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="group inline-flex items-center gap-3 px-6 py-3 mt-10 border border-background/40 text-background font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-background/10 transition-colors"
                >
                  {t("contacto.received.cta")}
                  <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                </button>
              </div>
            ) : (
              <form
                className="bg-background border border-border p-8 md:p-12"
                onSubmit={async (e) => {
                  e.preventDefault()
                  if (isSubmitting) return
                  setSubmitError(null)

                  // Collect form data into a plain object
                  const formEl = e.currentTarget
                  const fd = new FormData(formEl)
                  const fields: Record<string, string> = {}
                  fd.forEach((v, k) => {
                    if (typeof v === "string" && v.trim().length > 0) fields[k] = v
                  })
                  if (villaName && !fields.villa) fields.villa = villaName

                  setIsSubmitting(true)
                  try {
                    const res = await fetch("/api/contact", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ type, fields }),
                    })
                    const json = await res.json().catch(() => ({}))
                    if (!res.ok || !json.ok) {
                      throw new Error(json.error ?? `http_${res.status}`)
                    }
                    setSent(true)
                    if (typeof window !== "undefined") {
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                  } catch (err) {
                    console.error("[contacto] submit error", err)
                    setSubmitError(t("contacto.error.send"))
                  } finally {
                    setIsSubmitting(false)
                  }
                }}
              >
                {type === "guest" && <GuestForm villaName={villaName} />}
                {type === "owner" && <OwnerForm />}
                {type === "other" && <OtherForm />}

                {submitError && (
                  <div
                    role="alert"
                    className="mt-8 border-l-2 border-[#b85432] bg-[#b85432]/8 px-4 py-3 text-[0.9rem] text-foreground/85"
                  >
                    {submitError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group inline-flex items-center gap-3 px-7 py-3.5 mt-10 bg-foreground text-background font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-foreground/90 transition-colors disabled:opacity-60 disabled:cursor-progress"
                >
                  {isSubmitting ? (
                    <>
                      <span
                        className="inline-block w-3 h-3 border-2 border-background border-t-transparent rounded-full animate-spin"
                        aria-hidden
                      />
                      {t("contacto.submitting")}
                    </>
                  ) : (
                    <>
                      {t("contacto.submit")}
                      <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
