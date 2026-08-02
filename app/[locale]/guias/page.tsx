import type { Metadata } from "next"
import { getTranslations, getLocale } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { localeUrl, buildAlternates } from "@/lib/seo-urls"
import { getGuiasPublicadas } from "@/lib/guias"
import type { Locale } from "@/i18n/routing"

/*
  Índice de `/guias`. Server component — sin interactividad, no necesita
  un wrapper cliente como `ColeccionContent`/`FaqContent`.

  Solo lista guías PUBLICADAS (`getGuiasPublicadas`). Si no hay ninguna,
  se muestra el `empty_state` — la ruta sigue existiendo (para que exista
  algo que enlazar el día que Ángel publique la primera), pero nav/footer
  no enlazan aquí hasta que `haySeccionGuias()` sea true (ver
  components/navigation.tsx y components/footer.tsx).
*/

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getTranslations("guias.index")
  return {
    title: `${t("h1.line1")} ${t("h1.italic")} ${t("h1.line2")}`,
    description: t("intro"),
    alternates: {
      canonical: localeUrl(locale, "/guias"),
      languages: buildAlternates("/guias"),
    },
  }
}

export default async function GuiasIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const loc = locale as Locale
  const t = await getTranslations("guias.index")
  const publicadas = getGuiasPublicadas()

  // CollectionPage/ItemList únicamente — nada de Review/AggregateRating,
  // que la guía SEO de mayo de 2026 desaconseja para IA.
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${localeUrl(loc, "/guias")}#collectionpage`,
    url: localeUrl(loc, "/guias"),
    name: `${t("h1.line1")} ${t("h1.italic")} ${t("h1.line2")}`,
    inLanguage: loc,
    ...(publicadas.length > 0
      ? {
          mainEntity: {
            "@type": "ItemList",
            itemListElement: publicadas.map((g, idx) => ({
              "@type": "ListItem",
              position: idx + 1,
              url: localeUrl(loc, `/guias/${g.slug}`),
            })),
          },
        }
      : {}),
  }

  return (
    <main className="px-6 pt-32 pb-24 md:px-12 lg:px-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground/60 mb-4">
        {t("eyebrow")}
      </p>
      <h1 className="font-serif text-4xl md:text-5xl leading-tight text-foreground mb-6 max-w-2xl">
        {t("h1.line1")} <em className="italic">{t("h1.italic")}</em> {t("h1.line2")}
      </h1>
      <p className="text-muted-foreground max-w-xl mb-16">{t("intro")}</p>

      {publicadas.length === 0 ? (
        <p className="text-muted-foreground/70 border-t border-border pt-8 max-w-md">
          {t("empty_state")}
        </p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-border pt-10">
          {publicadas.map((g) => {
            const trad = g.traducciones[loc]
            return (
              <li key={g.slug} className="border-b border-border pb-8">
                <Link href={`/guias/${g.slug}`} className="group block">
                  <h2 className="font-serif text-xl text-foreground group-hover:text-foreground/70 transition-colors mb-2">
                    {trad.titulo}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-3">{trad.entradilla}</p>
                  <span className="font-mono text-[11px] tracking-[0.15em] uppercase text-muted-foreground/60">
                    {t("leer_mas")}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
