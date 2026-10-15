"use client"

import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { ArrowUpRight } from "lucide-react"
import { useTranslations } from "next-intl"
import { IllustrativeTag } from "@/components/illustrative-tag"
import type { FichaVilla, Foto } from "@/lib/escaparate"

/*
  Estado honesto de `/coleccion` tras retirar las cuatro residencias
  ficticias (ver docs/audit/RETIRADA-COLECCION.md).

  La ruta NO desaparece: está indexada, encabeza la navegación y el pie, y
  tiene atajo de teclado propio (g + c). Queda con tres elementos y ningún
  otro — sin contador de residencias, sin «próximamente» decorativo, sin
  plantillas de ficha vacías:

    1. Encabezado existente, sin cambio (`coleccion.eyebrow` + `coleccion.h1`).
    2. Un bloque de texto (`coleccion.body`) — próxima apertura, sin fecha.
    3. Contacto, distinguiendo huésped de propietario, reutilizando los
       destinos y etiquetas que ya existen (`cta.solicitar_estancia` →
       /contacto?type=guest, `cta.valorar_propiedad` → /contacto?type=owner),
       los mismos que usa `components/navigation.tsx`.

  Escaparate (lib/escaparate.ts): con SEDA_FLAG_ESCAPARATE_VILLAS encendido,
  `villas` trae las fichas publicadas; el texto pasa a `coleccion.body_abierta`
  y debajo va una tarjeta por casa. Con el flag apagado `villas` llega vacío y
  la página es exactamente la de antes: ningún enlace a /villa/*.
*/
export type VillaTarjeta = Pick<FichaVilla, "slug" | "nombre" | "tipo" | "municipio"> & { foto?: Foto }

export function ColeccionContent({ villas = [] }: { villas?: VillaTarjeta[] }) {
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
              {villas.length > 0 ? t("coleccion.body_abierta") : t("coleccion.body")}
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

      {villas.length > 0 && (
        <section className="px-6 md:px-12 lg:px-20 pb-28 md:pb-40">
          <ul className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12">
            {villas.map((v) => (
              <li key={v.slug}>
                <Link href={`/villa/${v.slug}`} className="group block">
                  {v.foto && (
                    <div
                      className="relative aspect-[4/3] overflow-hidden bg-secondary/40"
                      data-provisional={v.foto.provisional || undefined}
                    >
                      {v.foto.provisional && <IllustrativeTag />}
                      <Image
                        src={v.foto.src}
                        alt={t(v.foto.altKey)}
                        fill
                        sizes="(min-width: 1280px) 620px, (min-width: 768px) 50vw, 100vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                      />
                    </div>
                  )}
                  <h2 className="font-serif font-light text-3xl text-foreground mt-6">{v.nombre}</h2>
                  <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted-foreground mt-2">
                    {t(`escaparate.tipo.${v.tipo}`)} · {v.municipio}
                  </p>
                  <span className="inline-flex items-center gap-2 mt-5 font-mono text-[11px] tracking-[0.22em] uppercase text-foreground border-b border-foreground/30 pb-1 group-hover:border-foreground transition-colors">
                    {t("coleccion.ver_casa")}
                    <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}
