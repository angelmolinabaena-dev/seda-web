import { getTranslations } from "next-intl/server"
import { breadcrumbJsonLd, type Crumb, type JsonLd } from "@/lib/jsonld"
import { asLocale, getSitePage } from "@/lib/site-pages"

/** Un bloque `<script type="application/ld+json">`. */
export function JsonLdScript({ data }: { data: JsonLd }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}

/*
  BreadcrumbList de una página del catálogo (lib/site-pages.ts): portada →
  página. Solo datos estructurados: la web no pinta migas visibles, y el
  nombre de cada miga es el mismo título que lleva la página en su <title>.
*/
export async function PageJsonLd({ locale, path }: { locale: string; path: string }) {
  const t = await getTranslations({ locale })
  const trail: Crumb[] = [
    { name: t("breadcrumb.home"), path: "" },
    { name: getSitePage(path).copy(t, asLocale(locale)).title, path },
  ]
  return <JsonLdScript data={breadcrumbJsonLd(locale, trail)} />
}
