"use client"

import { useState, useSyncExternalStore } from "react"
import { ArrowUpRight } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { urlReservaBeds24, type Beds24Ids } from "@/lib/escaparate"

/*
  Bloque de reserva de una ficha: fechas y personas (opcionales) y el botón
  «Reservar» hacia la booking page de Beds24.

  Es un ENLACE, no un <form>: la CSP lleva `form-action 'self'`, que bloquearía
  un formulario con action en beds24.com. Una navegación normal no la toca la
  CSP, así que vercel.json no cambia. El `href` se recalcula con cada cambio
  de fecha; sin fechas, Beds24 abre con su propio calendario.

  Misma pestaña (el huésped sigue el flujo de reserva, no abre otra web
  aparte). `rel="nofollow"`: es un enlace de reserva, no una recomendación
  que deba pasar autoridad a Beds24. Sin `noopener` porque no hay
  `target="_blank"`: en misma pestaña no hay `window.opener` que proteger.

  En móvil el botón vive además en una barra fija abajo; la página reserva el
  hueco con `pb-28` en el <main>.

  Sin ids de Beds24 (variable de entorno ausente o mal formada) no se pinta
  un enlace roto: el botón lleva a /contacto como «Solicitar estancia».
*/
const sinSuscripcion = () => () => {}

/** Fecha local del visitante, AAAA-MM-DD. */
function hoyLocal() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}

export function ReservaBeds24({
  ids,
  slug,
  maxHuespedes,
}: {
  ids: Beds24Ids | undefined
  slug: string
  maxHuespedes?: number
}) {
  const t = useTranslations()
  const locale = useLocale()
  const [checkin, setCheckin] = useState("")
  const [checkout, setCheckout] = useState("")
  const [huespedes, setHuespedes] = useState("")
  // `min` de los calendarios: hoy en el navegador del visitante. En el HTML
  // estático (generado en el build) va sin `min`, para no desacompasar la
  // hidratación con una fecha de build.
  const hoy = useSyncExternalStore(sinSuscripcion, hoyLocal, () => undefined)

  const fechasIncompatibles = Boolean(checkin && checkout && checkout <= checkin)
  const href = ids
    ? urlReservaBeds24(
        ids,
        { checkin, checkout, huespedes: huespedes ? Number(huespedes) : undefined },
        { locale, slug },
      )
    : undefined

  // Sin capacidad conocida en la ficha no se ofrece selector de personas: un
  // máximo inventado dejaría elegir más de las que admite la casa. Se eligen
  // en Beds24, que sí conoce el límite.
  const opciones = maxHuespedes ? Array.from({ length: maxHuespedes }, (_, i) => i + 1) : []
  const campo =
    "w-full bg-transparent border border-foreground/20 px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-foreground"
  const etiqueta = "block font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground mb-2"
  const boton =
    "inline-flex items-center justify-center gap-3 px-7 py-3.5 bg-foreground text-background font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-foreground/90 transition-colors"

  const cta = (className: string) =>
    href ? (
      <a href={href} rel="nofollow" className={`${boton} ${className}`} data-reserva="beds24">
        {t("escaparate.reserva.cta")}
        <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
      </a>
    ) : (
      <Link href="/contacto?type=guest" className={`${boton} ${className}`}>
        {t("cta.solicitar_estancia")}
        <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
      </Link>
    )

  return (
    <>
      <div className="border border-foreground/15 p-6 md:p-8 bg-background">
        <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground">
          {t("escaparate.reserva.titulo")}
        </p>
        <p className="font-serif font-light text-2xl text-foreground mt-3">{t("escaparate.reserva.precio")}</p>

        {ids && (
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div>
              <label htmlFor="reserva-llegada" className={etiqueta}>
                {t("escaparate.reserva.llegada")}
              </label>
              <input
                id="reserva-llegada"
                type="date"
                min={hoy}
                value={checkin}
                onChange={(e) => setCheckin(e.target.value)}
                className={campo}
              />
            </div>
            <div>
              <label htmlFor="reserva-salida" className={etiqueta}>
                {t("escaparate.reserva.salida")}
              </label>
              <input
                id="reserva-salida"
                type="date"
                min={checkin || hoy}
                value={checkout}
                onChange={(e) => setCheckout(e.target.value)}
                aria-invalid={fechasIncompatibles || undefined}
                aria-describedby={fechasIncompatibles ? "reserva-fechas-error" : undefined}
                className={campo}
              />
            </div>
            {opciones.length > 0 && (
              <div className="col-span-2">
                <label htmlFor="reserva-personas" className={etiqueta}>
                  {t("escaparate.reserva.personas")}
                </label>
                <select
                  id="reserva-personas"
                  value={huespedes}
                  onChange={(e) => setHuespedes(e.target.value)}
                  className={campo}
                >
                  <option value="">—</option>
                  {opciones.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {fechasIncompatibles && (
              <p id="reserva-fechas-error" role="alert" className="col-span-2 text-sm text-destructive">
                {t("escaparate.reserva.fechas_error")}
              </p>
            )}
          </div>
        )}

        {cta("w-full mt-6")}
        <p className="text-xs leading-relaxed text-muted-foreground mt-4">{t("escaparate.reserva.nota")}</p>
      </div>

      {/* Barra fija en móvil: el mismo enlace, siempre a mano. */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-foreground/15 bg-background/95 backdrop-blur-sm px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center justify-between gap-4">
        <p className="text-xs leading-snug text-muted-foreground">{t("escaparate.reserva.precio")}</p>
        {cta("shrink-0")}
      </div>
    </>
  )
}
