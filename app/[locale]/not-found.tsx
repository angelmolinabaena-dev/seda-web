import { Link } from "@/i18n/navigation"
import { ArrowRight } from "lucide-react"
import { getTranslations } from "next-intl/server"
export async function generateMetadata() {
  const t = await getTranslations("notfound")
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
