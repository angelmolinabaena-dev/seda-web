import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"
import type { LocaleParams } from "@/i18n/routing"
import { Link } from "@/i18n/navigation"
import { AsistentePropietarios } from "@/components/asistente/asistente-propietarios"
import { JsonLdScript } from "@/components/page-json-ld"
import { asistentePropietariosActivo } from "@/lib/asistente/config"
import { RUTA_CALCULADORA, calculadoraPropietariosActiva } from "@/lib/calculadora-propietarios"
import { faqCalculadora } from "@/lib/faq"
import { breadcrumbJsonLd, faqPageJsonLd } from "@/lib/jsonld"
import { asLocale, getSitePage, localizedMetadata } from "@/lib/site-pages"
import { CalculadoraContent } from "./CalculadoraContent"

/*
  /propietarios/calculadora — detrás del flag SEDA_FLAG_CALCULADORA_PROPIETARIOS.
  Apagado: 404, sin metadatos y fuera del sitemap (app/sitemap.ts). No está en
  SITE_PAGES (lib/site-pages.ts) a propósito: ese catálogo alimenta el sitemap y
  /llms.txt sin condiciones, y esta página solo existe con el flag encendido.
  Mismo criterio que las fichas del escaparate y las guías.
*/

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params
  if (!calculadoraPropietariosActiva()) return {}
  const t = await getTranslations({ locale })
  return localizedMetadata(locale, RUTA_CALCULADORA, {
    title: t("calculadora.meta.title"),
    description: t("calculadora.meta.description"),
  })
}

export default async function CalculadoraPropietariosPage({ params }: LocaleParams) {
  if (!calculadoraPropietariosActiva()) notFound()
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations()
  const faq = faqCalculadora(t)

  return (
    <main id="main-content">
      <JsonLdScript
        data={breadcrumbJsonLd(locale, [
          { name: t("breadcrumb.home"), path: "" },
          { name: getSitePage("/propietarios").copy(t, asLocale(locale)).title, path: "/propietarios" },
          { name: t("calculadora.meta.title"), path: RUTA_CALCULADORA },
        ])}
      />
      {/* Las mismas cuatro preguntas que se ven abajo (lib/faq.ts), tomadas de /propietarios. */}
      <JsonLdScript data={faqPageJsonLd(faq)} />

      <header className="px-6 md:px-12 lg:px-20 pt-36 md:pt-44 pb-16 md:pb-20 bg-[hsl(var(--olive))] text-background">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/propietarios"
            className="font-mono text-[10px] tracking-[0.22em] uppercase text-background/70 hover:text-background transition-colors"
          >
            ← {t("nav.propietarios")}
          </Link>
          <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-[hsl(var(--gold))] mt-8 mb-5">
            {t("calculadora.hero.eyebrow")}
          </p>
          <h1 className="font-serif font-light text-[clamp(2.25rem,5vw,4.25rem)] leading-[1.04] tracking-[-0.02em] text-balance max-w-[20ch]">
            {t("calculadora.hero.h1.line1")} <span className="italic">{t("calculadora.hero.h1.italic")}</span>
          </h1>
          <p className="text-base md:text-lg leading-[1.6] text-background/85 max-w-[56ch] mt-6">{t("calculadora.hero.body")}</p>
        </div>
      </header>

      <CalculadoraContent />
      {/* Asistente de propietarios: solo con SEDA_FLAG_ASISTENTE_PROPIETARIOS=1 (lib/asistente/config.ts). */}
      {asistentePropietariosActivo() && <AsistentePropietarios />}

      <section className="px-6 md:px-12 lg:px-20 py-20 md:py-28 bg-secondary/40">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-4">{t("prop.faq.eyebrow")}</p>
            <h2 className="font-serif font-light text-3xl md:text-4xl leading-[1.1] tracking-[-0.02em] text-foreground text-balance">
              {t("prop.faq.h2.line1")} <span className="italic">{t("prop.faq.h2.italic")}</span> {t("prop.faq.h2.line2")}
            </h2>
          </div>
          <div className="border-t border-border">
            {faq.map(({ q, a }) => (
              <details key={q} className="group border-b border-border py-6">
                <summary className="flex items-start justify-between gap-6 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <h3 className="font-serif font-light text-lg md:text-xl leading-snug tracking-tight text-foreground text-balance">{q}</h3>
                  <span aria-hidden className="font-serif text-2xl leading-none text-muted-foreground/60 group-open:rotate-45 transition-transform shrink-0">
                    +
                  </span>
                </summary>
                <p className="text-[0.95rem] leading-[1.7] text-muted-foreground max-w-2xl mt-4">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
