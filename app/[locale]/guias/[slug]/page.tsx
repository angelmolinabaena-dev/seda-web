import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { localeUrl, SITE_URL } from "@/lib/seo-urls"
import { localizedMetadata } from "@/lib/site-pages"
import { esPublicable, getGuiaBySlug, guias } from "@/lib/guias"
import { getAutor } from "@/lib/autores"
import type { Locale } from "@/i18n/routing"
import { jsonLdString } from "@/lib/jsonld"
import { formatearRef } from "@/lib/guias-contenido/vut-andalucia"
import { RUTA_CALCULADORA, calculadoraPropietariosActiva } from "@/lib/calculadora-propietarios"
import { BotonImprimir } from "@/components/boton-imprimir"

/*
  Ficha individual de guía. Puerta de indexación fail-closed:
  `estado !== "publicada"` (vía `esPublicable`) ⇒ `robots: { index: false }`
  en metadata Y se omite del sitemap (ver app/sitemap.ts, que usa el mismo
  `esPublicable`/`getGuiasPublicadas`). Misma disciplina que `esPublicable`
  para propiedades.

  La ruta SIGUE siendo accesible en borrador (para que Ángel y QA puedan
  revisarla antes de publicar) — solo se le retira la indexación, nunca se
  hace 404 de un borrador real. La guía de prueba usa este mismo camino.
*/

export function generateStaticParams() {
  return guias.map((g) => ({ slug: g.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const guia = getGuiaBySlug(slug)
  if (!guia) return {}

  const trad = guia.traducciones[locale as Locale]
  const publicable = esPublicable(guia)

  return {
    // og:locale «de_DE», no «de»; y twitter:* propio, no el del layout raíz.
    ...localizedMetadata(locale, `/guias/${slug}`, { title: trad.titulo, description: trad.entradilla }, "article"),
    // Fail closed: cualquier cosa que no sea explícitamente publicable
    // lleva noindex,nofollow. No hay rama intermedia.
    robots: publicable
      ? { index: true, follow: true }
      : { index: false, follow: false },
  }
}

export default async function GuiaPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const loc = locale as Locale
  const guia = getGuiaBySlug(slug)
  if (!guia) notFound()

  setRequestLocale(locale)
  const trad = guia.traducciones[loc]
  const t = await getTranslations("guias.ficha")
  const publicable = esPublicable(guia)
  const autor = guia.autorId ? getAutor(guia.autorId) : undefined
  // Guías con lista de requisitos: versión imprimible (CSS de impresión en
  // globals.css, que esconde cabecera y pie solo cuando existe este marcador).
  const imprimible = Boolean(trad.requisitos?.length)
  // La calculadora está detrás de un flag (fail closed): sin él, la ruta es 404
  // y no se enlaza.
  const mostrarCalculadora = Boolean(guia.calculadora) && calculadoraPropietariosActiva()

  // Article JSON-LD — solo se emite para guías publicables. Una guía en
  // borrador no debe declarar datePublished/dateModified inventados.
  const articleJsonLd = publicable
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        "@id": `${localeUrl(loc, `/guias/${slug}`)}#article`,
        headline: trad.titulo,
        datePublished: guia.fechaPublicacion,
        dateModified: guia.fechaRevision ?? guia.fechaPublicacion,
        inLanguage: loc,
        isPartOf: { "@id": `${localeUrl(loc, "/guias")}#collectionpage` },
        ...(autor
          ? {
              author: {
                "@type": "Person",
                name: autor.nombre,
                url: localeUrl(loc, `/guias/autores/${autor.id}`),
              },
            }
          : {}),
        publisher: { "@id": `${SITE_URL}/#organization` },
      }
    : null

  return (
    <main
      id="main-content"
      {...(imprimible ? { "data-guia-imprimible": "" } : {})}
      className="px-6 pt-32 pb-24 md:px-12 lg:px-20 max-w-2xl mx-auto print:max-w-none print:px-0 print:pt-0 print:pb-0"
    >
      {imprimible && (
        <p className="hidden print:block mb-6 border-b border-foreground/40 pb-2 font-mono text-[10px] tracking-[0.2em] uppercase">
          SEDA Private Homes · {localeUrl(loc, `/guias/${slug}`)}
        </p>
      )}
      {articleJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(articleJsonLd) }}
        />
      )}

      {!publicable && (
        <p className="mb-8 inline-block border border-dashed border-muted-foreground/40 px-3 py-1 font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
          {t("borrador_badge")}
        </p>
      )}

      <h1 className="font-serif text-3xl md:text-4xl leading-tight text-foreground mb-4">
        {trad.titulo}
      </h1>
      <p className="text-muted-foreground mb-8">{trad.entradilla}</p>

      <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-[11px] tracking-[0.1em] uppercase text-muted-foreground/70 mb-10 border-y border-border py-4">
        <span>
          {guia.fechaPublicacion
            ? t("publicada_el", { fecha: guia.fechaPublicacion })
            : `${t("publicada_el", { fecha: "" })}${t("pendiente")}`}
        </span>
        <span>
          {guia.fechaRevision
            ? t("revisada_el", { fecha: guia.fechaRevision })
            : `${t("revisada_el", { fecha: "" })}${t("pendiente")}`}
        </span>
        <span>
          {t("autor_por", {
            autor: autor ? autor.nombre : t("pendiente"),
          })}
        </span>
      </div>

      <div className="space-y-5 text-foreground/90 leading-relaxed mb-12">
        {trad.cuerpo.map((parrafo, idx) => (
          <p key={idx}>{parrafo}</p>
        ))}
      </div>

      {imprimible && guia.fechaRevision && (
        <p className="mb-10 border-l-2 border-foreground/40 pl-4 text-sm text-foreground/80">
          {t("revision_aviso", { fecha: guia.fechaRevision })}
        </p>
      )}

      {imprimible && (
        <div className="mb-10 flex flex-wrap items-center gap-4 print:hidden">
          <BotonImprimir etiqueta={t("imprimir")} />
          <span className="text-sm text-muted-foreground">{t("imprimir_ayuda")}</span>
        </div>
      )}

      {trad.requisitos && trad.requisitos.length > 0 && (
        <>
          <p className="mb-8 text-sm text-muted-foreground">{t("requisitos_leyenda")}</p>
          {trad.requisitos.map((grupo) => (
            <section key={grupo.id} className="mb-10 break-inside-avoid-page">
              <h2 className="font-serif text-2xl text-foreground mb-4 border-b border-border pb-2">
                {grupo.titulo}
              </h2>
              <ul className="space-y-3">
                {grupo.items.map((item) => (
                  <li key={item.id} className="flex gap-3 break-inside-avoid">
                    <span
                      aria-hidden="true"
                      className="mt-[0.35rem] h-3.5 w-3.5 shrink-0 border border-foreground/60"
                    />
                    <span className="text-foreground/90 leading-relaxed">
                      {item.texto}{" "}
                      <span className="whitespace-nowrap font-mono text-[11px] tracking-[0.05em] text-muted-foreground">
                        ({formatearRef(item.ref, loc)})
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </>
      )}

      {trad.notas && trad.notas.length > 0 && (
        <div className="mb-12 space-y-4 text-sm text-muted-foreground leading-relaxed">
          {trad.notas.map((nota, idx) => (
            <p key={idx}>{nota}</p>
          ))}
        </div>
      )}

      {mostrarCalculadora && (
        <aside className="mb-12 border border-border p-6 break-inside-avoid">
          <h2 className="font-serif text-xl text-foreground mb-2">{t("cta_titulo")}</h2>
          <p className="text-sm text-muted-foreground mb-4">{t("cta_texto")}</p>
          <Link
            href={RUTA_CALCULADORA}
            className="inline-flex items-center border border-foreground/30 px-4 py-2 font-mono text-[11px] tracking-[0.15em] uppercase text-foreground hover:bg-foreground hover:text-background transition-colors print:hidden"
          >
            {t("cta_boton")}
          </Link>
          <p className="hidden print:block text-sm">{localeUrl(loc, RUTA_CALCULADORA)}</p>
        </aside>
      )}

      {guia.fuentes.length > 0 && (
        <div className="mb-12">
          <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-muted-foreground/60 mb-3">
            {t("fuentes_titulo")}
          </p>
          <ul className="space-y-1">
            {guia.fuentes.map((f) => (
              <li key={f.url}>
                <a
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-sm text-foreground/80 hover:text-foreground underline underline-offset-2"
                >
                  {f.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {imprimible && guia.fechaRevision && (
        <p className="hidden print:block mt-8 border-t border-foreground/40 pt-2 text-[11px]">
          {t("impresion_pie", { fecha: guia.fechaRevision })}
        </p>
      )}

      <Link
        href="/guias"
        className="font-mono text-[11px] tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors print:hidden"
      >
        ← {t("volver")}
      </Link>
    </main>
  )
}
