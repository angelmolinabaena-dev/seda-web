import { Link } from "@/i18n/navigation"
import { ArrowRight } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { routing } from "@/i18n/routing"

/*
  La metadata se traduce con el locale por defecto, explícito. `generateMetadata`
  no recibe `params`, y el `setRequestLocale` del layout no le llega: sin
  locale, next-intl lo busca en las cabeceras, y leer cabeceras en una ruta
  estática es un 500 («Page changed from static to dynamic at runtime, reason:
  headers»). Pasaba en `/foo.png`, `/wp-login.php`, `/.env` (el proxy deja
  pasar lo que tiene extensión y Next lo encaja en `[locale]`) y en cualquier
  `notFound()` de una ficha, p. ej. `/en/guias/<slug-que-no-existe>`.
  Comprobado contra `next build && next start`: con el layout y las fichas
  fijando el locale antes del `notFound()`, el 500 seguía; solo esto lo quita.

  El cuerpo, más abajo, sí sale en el idioma de la URL: el componente se
  renderiza bajo el layout, que ya ha fijado el locale.
*/
export async function generateMetadata() {
  const t = await getTranslations({ locale: routing.defaultLocale, namespace: "notfound" })
  return {
    title: t("title"),
    description: t("description"),
  }
}

export default async function NotFound() {
  const t = await getTranslations("notfound")
  return (
    <main id="main-content" className="bg-background min-h-screen flex flex-col">
      <section className="flex-1 flex items-center justify-center px-6 md:px-12 lg:px-20 py-32">
        <div className="max-w-2xl text-center">
          <p className="font-mono text-[11px] tracking-[0.35em] uppercase text-muted-foreground mb-8">
            {t("eyebrow")}
          </p>
          <h1 className="font-serif font-light text-[clamp(2.5rem,6vw,5rem)] leading-[1.05] tracking-[-0.015em] text-foreground text-balance mb-8">
            {t("h1_line1")} <span className="italic">{t("h1_italic")}</span>
          </h1>
          <p className="text-base leading-[1.7] text-muted-foreground max-w-md mx-auto mb-12">
            {t("body")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="group inline-flex items-center justify-center gap-3 px-7 py-3.5 bg-foreground text-background font-mono text-[11px] tracking-[0.25em] uppercase hover:bg-foreground/90 transition-colors"
            >
              {t("back_home")}
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                strokeWidth={1.75}
              />
            </Link>
            <Link
              href="/coleccion"
              className="group inline-flex items-center justify-center gap-3 px-7 py-3.5 border border-foreground/30 text-foreground font-mono text-[11px] tracking-[0.25em] uppercase hover:bg-foreground/5 hover:border-foreground/70 transition-colors"
            >
              {t("see_collection")}
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                strokeWidth={1.75}
              />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
