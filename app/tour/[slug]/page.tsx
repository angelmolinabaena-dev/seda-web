import type { Metadata, Viewport } from "next"
import { notFound } from "next/navigation"
import { getTourPublicado, toursPublicados } from "@/lib/tour360/cargar"
import { TourViewer } from "./TourViewer"

/*
  /tour/<slug> — visor 360 de una casa. Estática, incrustable en un iframe.

  Solo existen las rutas de los recorridos con `publicado: true` en
  tours/<slug>/tour.json (y con todas sus escenas procesadas: ver
  lib/tour360/manifiesto.ts). Hoy no hay ninguno: no hay fotos reales todavía,
  así que /tour/<lo-que-sea> da 404. No se publica nada con imágenes de ejemplo.

  `noindex`: es una vista para incrustar, no una página para posicionar; el
  contenido indexable es la ficha de la casa, que enlaza aquí con «Ver en 360°».
*/

type Params = { params: Promise<{ slug: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return toursPublicados().map((t) => ({ slug: t.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const tour = getTourPublicado(slug)
  return {
    // Título neutro en idioma: la página es estática y el idioma lo resuelve el visor en el cliente.
    title: tour ? `${tour.nombre} · 360°` : "360°",
    robots: { index: false, follow: false },
    // Sin openGraph/twitter heredados del root: una vista incrustable no se comparte como página.
    openGraph: null,
    twitter: null,
  }
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1c1d1b",
}

export default async function TourPage({ params }: Params) {
  const { slug } = await params
  const tour = getTourPublicado(slug)
  if (!tour) notFound()
  return <TourViewer tour={tour} />
}
