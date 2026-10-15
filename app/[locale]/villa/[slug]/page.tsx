import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { ArrowUpRight } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { IllustrativeTag } from "@/components/illustrative-tag"
import { JsonLdScript } from "@/components/page-json-ld"
import { ReservaBeds24 } from "@/components/escaparate/reserva-beds24"
import { beds24Ids, esIndexable, getVillaVisible, villasVisibles, type FichaVilla } from "@/lib/escaparate"
import { accommodationJsonLd, breadcrumbJsonLd } from "@/lib/jsonld"
import { buildAlternates, localeUrl } from "@/lib/seo-urls"
import { asLocale, OG_IMAGE, OG_LOCALE, SITE_NAME } from "@/lib/site-pages"

/*
  Ficha de una casa del escaparate. Todo detrás de SEDA_FLAG_ESCAPARATE_VILLAS
  (ver lib/escaparate.ts):
    · flag apagado → `generateStaticParams` no devuelve ninguna ficha y
      `dynamicParams = false`: cualquier /villa/<slug> es 404. El `notFound()`
      de la página es la segunda cerradura.
    · flag encendido sin número de registro turístico → la ficha se ve, con
      noindex y sin JSON-LD de alojamiento.

  Los cuatro slugs de las villas ficticias retiradas en agosto siguen
  respondiendo 410 desde proxy.ts, antes de llegar aquí.
*/

type Params = { params: Promise<{ locale: string; slug: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return villasVisibles().map((v) => ({ slug: v.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params
  const villa = getVillaVisible(slug)
  if (!villa) return { robots: { index: false, follow: false } }
  const t = await getTranslations({ locale })
  const loc = asLocale(locale)
  const path = `/villa/${villa.slug}`
  const title = `${villa.nombre} · ${villa.municipio}`
  const description = t("escaparate.meta.description", {
    nombre: villa.nombre,
    tipo: t(`escaparate.tipo.${villa.tipo}`),
    municipio: villa.municipio,
  })
  return {
    title,
    description,
    // Fail closed: sin flag o sin número de registro, noindex. Sin rama intermedia.
    robots: esIndexable(villa) ? { index: true, follow: true } : { index: false, follow: false },
    alternates: { canonical: localeUrl(locale, path), languages: buildAlternates(path) },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: OG_LOCALE[loc],
      url: localeUrl(locale, path),
      title,
      description,
      images: [OG_IMAGE],
    },
    twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE.url] },
  }
}

type T = Awaited<ReturnType<typeof getTranslations>>

/** Lo esencial de un vistazo: solo los campos con dato. */
function Esencial({ villa, t }: { villa: FichaVilla; t: T }) {
  const e = villa.esencial
  const items: string[] = [t(`escaparate.tipo.${villa.tipo}`), villa.municipio]
  if (e.huespedes) items.push(t("escaparate.esencial.huespedes", { n: e.huespedes }))
  if (e.dormitorios) items.push(t("escaparate.esencial.dormitorios", { n: e.dormitorios }))
  if (e.banos) items.push(t("escaparate.esencial.banos", { n: e.banos }))
  if (e.metros) items.push(t("escaparate.esencial.metros", { n: e.metros }))
  if (e.piscina) items.push(t("escaparate.esencial.piscina"))
  if (e.terraza) items.push(t("escaparate.esencial.terraza"))
  if (e.playaMinutos) items.push(t("escaparate.esencial.playa", { n: e.playaMinutos }))
  return (
    <ul className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
      {items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  )
}

export default async function VillaPage({ params }: Params) {
  const { locale, slug } = await params
  const villa = getVillaVisible(slug)
  if (!villa) notFound()
  setRequestLocale(locale)
  const t = await getTranslations()
  const path = `/villa/${villa.slug}`
  const [portada, ...resto] = villa.fotos
  const indexable = esIndexable(villa)

  return (
    <main id="main-content" className="pb-28 md:pb-0">
      <JsonLdScript
        data={breadcrumbJsonLd(locale, [
          { name: t("breadcrumb.home"), path: "" },
          { name: t("breadcrumb.coleccion"), path: "/coleccion" },
          { name: villa.nombre, path },
        ])}
      />
      {indexable && <JsonLdScript data={accommodationJsonLd(locale, villa, t(`escaparate.tipo.${villa.tipo}`))} />}

      {/* Encabezado */}
      <section className="px-6 md:px-12 lg:px-20 pt-36 md:pt-44 pb-10 md:pb-14">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/coleccion"
            className="font-mono text-[11px] tracking-[0.22em] uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            ← {t("breadcrumb.coleccion")}
          </Link>
          <div className="mt-8 flex flex-wrap items-baseline gap-x-6 gap-y-3">
            <h1 className="font-serif font-light text-[clamp(2.5rem,6vw,5rem)] leading-[1.05] tracking-[-0.02em] text-foreground">
              {villa.nombre}
            </h1>
            {villa.registroTuristico && (
              <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
                {t("escaparate.registro", { numero: villa.registroTuristico })}
              </p>
            )}
          </div>
          <div className="mt-6">
            <Esencial villa={villa} t={t} />
          </div>
        </div>
      </section>

      {/* Galería: next/image, la primera con prioridad (es el LCP), el resto diferidas. */}
      {portada && (
        <section className="px-6 md:px-12 lg:px-20" aria-label={t("escaparate.galeria")}>
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-3">
            <figure
              className="relative md:col-span-2 md:row-span-2 aspect-[4/3] overflow-hidden bg-secondary/40"
              data-provisional={portada.provisional || undefined}
            >
              {portada.provisional && <IllustrativeTag />}
              <Image
                src={portada.src}
                alt={t(portada.altKey)}
                fill
                priority
                sizes="(min-width: 1280px) 830px, (min-width: 768px) 66vw, 100vw"
                className="object-cover"
              />
            </figure>
            {resto.map((f) => (
              <figure
                key={f.src}
                className="relative aspect-[4/3] overflow-hidden bg-secondary/40"
                data-provisional={f.provisional || undefined}
              >
                {f.provisional && <IllustrativeTag />}
                <Image
                  src={f.src}
                  alt={t(f.altKey)}
                  fill
                  sizes="(min-width: 1280px) 410px, (min-width: 768px) 33vw, 100vw"
                  className="object-cover"
                />
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* Cuerpo + reserva */}
      <section className="px-6 md:px-12 lg:px-20 py-16 md:py-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
          <div className="md:col-span-7 space-y-14">
            <Bloque titulo={t("escaparate.incluye.titulo")}>
              <ul className="space-y-3 text-base leading-[1.7] text-foreground/85">
                <li>{t("escaparate.incluye.llegada")}</li>
                <li>{t("escaparate.incluye.concierge")}</li>
                <li>{t("escaparate.incluye.limpieza")}</li>
              </ul>
            </Bloque>

            <Bloque titulo={t("escaparate.horario.titulo")}>
              <ul className="space-y-2 text-base leading-[1.7] text-foreground/85">
                <li>
                  {t("escaparate.horario.entrada", {
                    desde: villa.horario.entradaDesde,
                    hasta: villa.horario.entradaHasta,
                  })}
                </li>
                <li>{t("escaparate.horario.salida", { hasta: villa.horario.salidaHasta })}</li>
              </ul>
            </Bloque>

            {villa.normas.length > 0 && (
              <Bloque titulo={t("escaparate.normas.titulo")}>
                <ul className="space-y-2 text-base leading-[1.7] text-foreground/85">
                  {villa.normas.map((n) => (
                    <li key={n}>{t(`escaparate.normas.${n}`)}</li>
                  ))}
                </ul>
              </Bloque>
            )}

            <Bloque titulo={t("escaparate.zona.titulo")}>
              <p className="text-base leading-[1.7] text-foreground/85">
                {t("escaparate.zona.body", { municipio: villa.municipio })}
              </p>
              <Link
                href="/descubre"
                className="inline-flex items-center gap-2 mt-5 font-mono text-[11px] tracking-[0.22em] uppercase text-foreground border-b border-foreground/30 pb-1 hover:border-foreground transition-colors"
              >
                {t("escaparate.zona.link")}
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
              </Link>
            </Bloque>
          </div>

          <aside className="md:col-span-5">
            <div className="md:sticky md:top-28">
              <ReservaBeds24 ids={beds24Ids(villa.slug)} slug={villa.slug} maxHuespedes={villa.esencial.huespedes} />
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}

function Bloque({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-5">{titulo}</h2>
      {children}
    </div>
  )
}
