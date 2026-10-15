import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import type { LocaleParams } from "@/i18n/routing"
import { PageJsonLd } from "@/components/page-json-ld"
import { pageMetadata } from "@/lib/site-pages"
import { villasVisibles } from "@/lib/escaparate"
import { ColeccionContent } from "./ColeccionContent"

/*
  Server component wrapper. The actual UI is a client component
  (`ColeccionContent`) because it needs interactivity; only a server
  component can export `generateMetadata`, so the page is split in two.
  Title/description reuse the EXISTING translated `coleccion.h1`/`coleccion.body`
  keys (no new copy) — see lib/site-pages.ts.
*/

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata(locale, "/coleccion", await getTranslations({ locale }))
}

export default async function ColeccionPage({ params }: LocaleParams) {
  const { locale } = await params
  setRequestLocale(locale)
  return (
    <>
      <PageJsonLd locale={locale} path="/coleccion" />
      <ColeccionContent
        villas={villasVisibles().map((v) => ({
          slug: v.slug,
          nombre: v.nombre,
          tipo: v.tipo,
          municipio: v.municipio,
          foto: v.fotos[0],
        }))}
      />
    </>
  )
}
