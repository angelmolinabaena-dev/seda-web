"use client"

import { Link } from "@/i18n/navigation"
import { ArrowUpRight } from "lucide-react"
import { useTranslations } from "next-intl"

/*
  Estado honesto de `/coleccion` tras retirar las cuatro residencias
  ficticias (ver docs/audit/RETIRADA-COLECCION.md).

  La ruta NO desaparece: está indexada, encabeza la navegación y el pie, y
  tiene atajo de teclado propio (g + c). Queda con tres elementos y ningún
  otro — sin contador de residencias, sin «próximamente» decorativo, sin
  plantillas de ficha vacías:

    1. Encabezado existente, sin cambio (`coleccion.eyebrow` + `coleccion.h1`).
    2. Un bloque de texto (`coleccion.body`) — apertura en octubre de 2026.
    3. Contacto, distinguiendo huésped de propietario, reutilizando los
       destinos y etiquetas que ya existen (`cta.solicitar_estancia` →
       /contacto?type=guest, `cta.valorar_propiedad` → /contacto?type=owner),
       los mismos que usa `components/navigation.tsx`.
*/
export function ColeccionContent() {
  const t = useTranslations()
  return (
    <main id="main-content">
      <section className="px-6 md:px-12 lg:px-20 pt-40 md:pt-48 pb-28 md:pb-40">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 items-end">
          <div className="md:col-span-7">
            <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-8">
              {t("coleccion.eyebrow")}
            </p>
            <h1 className="font-serif font-light text-[clamp(2.5rem,6vw,5.5rem)] leading-[1.05] tracking-[-0.02em] text-foreground text-balance">
              {t("coleccion.h1.line1")} <span className="italic">{t("coleccion.h1.italic")}</span>
              <br />
              {t("coleccion.h1.line2")}
            </h1>
          </div>
          <div className="md:col-span-5">
            <p className="text-base md:text-lg leading-[1.7] text-muted-foreground">
              {t("coleccion.body")}
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-10">
              <Link
                href="/contacto?type=guest"
                className="group inline-flex items-center justify-center gap-3 px-7 py-3.5 bg-foreground text-background font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-foreground/90 transition-colors"
              >
                {t("cta.solicitar_estancia")}
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
              </Link>
              <Link
                href="/contacto?type=owner"
                className="group inline-flex items-center justify-center gap-3 px-7 py-3.5 border border-foreground/30 text-foreground font-mono text-[11px] tracking-[0.22em] uppercase hover:border-foreground transition-colors"
              >
                {t("cta.valorar_propiedad")}
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
