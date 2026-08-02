import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations, getLocale } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { localeUrl, buildAlternates, SITE_URL } from "@/lib/seo-urls"
import { esPublicable, getGuiaBySlug, guias } from "@/lib/guias"
import { getAutor } from "@/lib/autores"
import type { Locale } from "@/i18n/routing"

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
    title: trad.titulo,
    description: trad.entradilla,
    alternates: {
      canonical: localeUrl(locale, `/guias/${slug}`),
      languages: buildAlternates(`/guias/${slug}`),
    },
    // Fail closed: cualquier cosa que no sea explícitamente publicable
    // lleva noindex,nofollow. No hay rama intermedia.
    robots: publicable
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      title: trad.titulo,
      description: trad.entradilla,
      type: "article",
      locale,
      url: localeUrl(locale, `/guias/${slug}`),
    },
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

  const trad = guia.traducciones[loc]
  const t = await getTranslations("guias.ficha")
  const publicable = esPublicable(guia)
  const autor = guia.autorId ? getAutor(guia.autorId) : undefined

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
    <main className="px-6 pt-32 pb-24 md:px-12 lg:px-20 max-w-2xl mx-auto">
      {articleJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
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

      <Link
        href="/guias"
        className="font-mono text-[11px] tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
      >
        ← {t("volver")}
      </Link>
    </main>
  )
}
