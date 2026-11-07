import type { ReactNode } from "react"
import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import type { LocaleParams } from "@/i18n/routing"
import { PageJsonLd } from "@/components/page-json-ld"
import { calculadoraPropietariosActiva } from "@/lib/calculadora-propietarios"
import { pageMetadata } from "@/lib/site-pages"
import { PropietariosContent } from "./PropietariosContent"

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata(locale, "/propietarios", await getTranslations({ locale }))
}

export default async function PropietariosPage({ params }: LocaleParams) {
  // Asistente de propietarios (SEDA_FLAG_ASISTENTE_PROPIETARIOS=1, lib/asistente/config.ts).
  // `process.env.…` literal e `import()` condicionado, como el aviso de cookies del
  // layout: next.config.mjs inlina el flag y, apagado, el botón no entra en el bundle.
  let asistente: ReactNode = null
  if (process.env.SEDA_FLAG_ASISTENTE_PROPIETARIOS === "1") {
    const { AsistentePropietarios } = await import("@/components/asistente/asistente-propietarios")
    asistente = <AsistentePropietarios />
  }
  const { locale } = await params
  setRequestLocale(locale)
  return (
    <>
      <PageJsonLd locale={locale} path="/propietarios" />
      <PropietariosContent calculadora={calculadoraPropietariosActiva()} />
      {asistente}
    </>
  )
}
