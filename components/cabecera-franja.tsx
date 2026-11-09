"use client"

import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import {
  ALFA,
  CREMA_HSL,
  DESTINO_PROPIETARIOS,
  DESTINO_VIAJEROS,
  ORO_CLARO_HSL,
  URL_GUEST_APP,
  URL_PORTAL_PROPIETARIO,
  VELO_ALFA,
  VELO_RGB,
  type TipoPagina,
} from "@/lib/franja-cabecera"

/*
  Franja fina encima de la barra (36 px, propuesta D). Dos mitades separadas por un
  filete vertical de 1 px, sin bloques de color: velo oscuro translúcido con
  desenfoque y filete inferior crema al 10 %.

  · Izquierda, viajeros: «Solicitar estancia →». Derecha, propietarios: «Valorar mi
    propiedad →» en oro claro. Mismos destinos que el botón que tenía la barra.
  · Según la página (lib/franja-cabecera.ts): en las de propietarios la mitad de
    propietarios queda destacada y en las de viajeros la de viajeros; en la portada y el
    resto, iguales. Se destaca con un punto dorado delante, la etiqueta en oro claro y la
    frase al 90 %; la otra mitad NO se apaga: todo el texto pasa 4,5:1 sobre la foto más clara.
  · Ancho: desde 1.440 px completa; de 1.280 a 1.439, solo etiqueta y enlace (sin la
    frase); por debajo de 1.280 no se ve y sus dos enlaces van arriba del menú móvil.
  · Al bajar por la página se recoge con una transición suave (sin animación con
    prefers-reduced-motion) y deja de recibir foco.
*/

const crema = (a: number) => `hsl(${CREMA_HSL[0]} ${CREMA_HSL[1]}% ${CREMA_HSL[2]}% / ${a})`
const oro = `hsl(${ORO_CLARO_HSL[0]} ${ORO_CLARO_HSL[1]}% ${ORO_CLARO_HSL[2]}%)`

function Mitad({
  lado,
  destacada,
  etiqueta,
  frase,
  enlace,
  href,
}: {
  lado: "viajeros" | "propietarios"
  destacada: boolean
  etiqueta: string
  frase: string
  enlace: string
  href: string
}) {
  const propietarios = lado === "propietarios"
  return (
    <div
      data-franja-mitad={lado}
      data-franja-estado={destacada ? "destacada" : "igual"}
      className={`flex min-w-0 flex-1 items-center gap-2.5 whitespace-nowrap ${propietarios ? "border-l pl-6" : "pr-6"}`}
      style={propietarios ? { borderColor: crema(0.1) } : undefined}
    >
      <span className="flex shrink-0 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: destacada ? oro : crema(ALFA.etiqueta) }}>
        {destacada && <span aria-hidden className="inline-block h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: oro }} />}
        {etiqueta}
      </span>
      <span aria-hidden className="shrink-0" style={{ color: crema(0.3) }}>
        ·
      </span>
      {/* La frase solo desde 1.440 px. */}
      <span className="hidden shrink-0 text-[12.5px] min-[1440px]:inline" style={{ color: crema(destacada ? ALFA.fraseDestacada : ALFA.frase) }}>
        {frase}
      </span>
      <span aria-hidden className="hidden shrink-0 min-[1440px]:inline" style={{ color: crema(0.3) }}>
        ·
      </span>
      <Link
        href={href}
        className="shrink-0 rounded-sm text-[12.5px] font-semibold underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
        style={{ color: propietarios ? oro : crema(ALFA.enlace) }}
      >
        {enlace} <span aria-hidden>→</span>
      </Link>
    </div>
  )
}

export function FranjaCabecera({ tipo, recogida }: { tipo: TipoPagina; recogida: boolean }) {
  const t = useTranslations()
  return (
    <div
      data-franja
      data-franja-tipo={tipo}
      data-franja-recogida={recogida ? "si" : "no"}
      // Altura animada con un contenedor que recorta; recogida, además `inert` (sin foco ni lector de pantalla).
      className={`hidden overflow-hidden transition-[height,opacity] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none min-[1280px]:block ${
        recogida ? "h-0 opacity-0" : "h-9 opacity-100"
      }`}
      aria-hidden={recogida ? true : undefined}
      inert={recogida}
    >
      <div
        className="flex h-9 items-center border-b px-12 backdrop-blur-md min-[1340px]:px-20"
        style={{ background: `rgba(${VELO_RGB.join(",")},${VELO_ALFA})`, borderColor: crema(0.1) }}
        role="region"
        aria-label={t("franja.aria")}
      >
        <Mitad
          lado="viajeros"
          destacada={tipo === "viajeros"}
          etiqueta={t("franja.viajeros")}
          frase={t("franja.frase_viajeros")}
          enlace={t("cta.solicitar_estancia")}
          href={DESTINO_VIAJEROS}
        />
        <Mitad
          lado="propietarios"
          destacada={tipo === "propietarios"}
          etiqueta={t("franja.propietarios")}
          frase={t("franja.frase_propietarios")}
          enlace={t("cta.valorar_propiedad")}
          href={DESTINO_PROPIETARIOS}
        />
      </div>
    </div>
  )
}

/** Desplegable «Portal»: dos tarjetas, a los mismos destinos de siempre. */
export function TarjetasPortal() {
  const t = useTranslations()
  const tarjetas = [
    { clave: "huespedes", titulo: t("franja.huespedes_titulo"), linea: t("franja.huespedes_linea"), href: URL_GUEST_APP },
    { clave: "propietarios", titulo: t("franja.propietarios_titulo"), linea: t("franja.propietarios_linea"), href: URL_PORTAL_PROPIETARIO },
  ]
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-2 p-2">
      {tarjetas.map((c) => (
        <a
          key={c.clave}
          href={c.href}
          target="_blank"
          rel="noopener noreferrer"
          role="menuitem"
          data-portal-tarjeta={c.clave}
          className="group box-border flex w-full min-w-0 flex-col gap-1 whitespace-normal break-words rounded-sm border border-border px-4 py-3 transition-colors hover:border-foreground/30 hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground">{c.titulo}</span>
          <span className="text-[0.8rem] leading-snug text-muted-foreground">{c.linea}</span>
          <span className="mt-1 text-[0.8rem] font-semibold text-foreground">
            {t("franja.entrar")} <span aria-hidden className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
          </span>
        </a>
      ))}
    </div>
  )
}
