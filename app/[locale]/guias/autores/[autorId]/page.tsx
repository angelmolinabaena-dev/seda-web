import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { localeUrl, buildAlternates } from "@/lib/seo-urls"
import { autores, getAutor } from "@/lib/autores"
import { getGuiasPublicadas } from "@/lib/guias"
import type { Locale } from "@/i18n/routing"

/*
  Entidad de autor. Solo hechos verificables (lib/autores.ts) — nada de
  premios, cifras ni credenciales no trazables. Enlazada desde el JSON-LD
  `Article` (`author.url`) de cada guía publicada.
*/

export function generateStaticParams() {
  return Object.keys(autores).map((autorId) => ({ autorId }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; autorId: string }>
}): Promise<Metadata> {
  const { locale, autorId } = await params
  const autor = getAutor(autorId)
  if (!autor) return {}
  const t = await getTranslations("guias.autor")
  return {
    title: t("hechos_titulo", { nombre: autor.nombre }),
    alternates: {
      canonical: localeUrl(locale, `/guias/autores/${autorId}`),
      languages: buildAlternates(`/guias/autores/${autorId}`),
    },
  }
}

export default async function AutorPage({
  params,
}: {
  params: Promise<{ locale: string; autorId: string }>
}) {
  const { locale, autorId } = await params
  const loc = locale as Locale
  const autor = getAutor(autorId)
  if (!autor) notFound()

  const t = await getTranslations("guias.autor")
  const guiasDelAutor = getGuiasPublicadas().filter((g) => g.autorId === autorId)

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: autor.nombre,
    url: localeUrl(loc, `/guias/autores/${autorId}`),
  }

  return (
    <main className="px-6 pt-32 pb-24 md:px-12 lg:px-20 max-w-2xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground/60 mb-4">
        {t("eyebrow")}
      </p>
      <h1 className="font-serif text-3xl md:text-4xl leading-tight text-foreground mb-8">
        {t("hechos_titulo", { nombre: autor.nombre })}
      </h1>
      <ul className="space-y-2 text-foreground/90 mb-12">
        {autor.hechos[loc].map((hecho) => (
          <li key={hecho}>{hecho}</li>
        ))}
      </ul>

      {guiasDelAutor.length > 0 && (
        <div>
          <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-muted-foreground/60 mb-3">
            {t("guias_de", { nombre: autor.nombre })}
          </p>
          <ul className="space-y-1">
            {guiasDelAutor.map((g) => (
              <li key={g.slug}>
                <Link href={`/guias/${g.slug}`} className="text-sm underline underline-offset-2">
                  {g.traducciones[loc].titulo}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  )
}
