import type { ReactNode } from "react"
import { notFound } from "next/navigation"
import { NextIntlClientProvider, hasLocale } from "next-intl"
import { setRequestLocale } from "next-intl/server"
import { SkipLink } from "@/components/skip-link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts"
import { JsonLdScript } from "@/components/page-json-ld"
import { routing } from "@/i18n/routing"
import { businessJsonLd } from "@/lib/jsonld"
import { fontVariables } from "@/lib/fonts"
import { TEXTOS_CONSENTIMIENTO } from "@/lib/consentimiento-textos"
import { metaPixelActivo, metaPixelId } from "@/lib/meta-config.mjs"

import "../globals.css"

// Site-wide Organization + LodgingBusiness JSON-LD — rendered on every
// route via this shared locale layout. Built in lib/jsonld.ts from data the
// site already shows (contact, zones); the notes on what it deliberately
// leaves out (priceRange, identifier) live there.
const businessLd = businessJsonLd()

/*
  Per-locale layout. Validates the URL locale, opts the page into static
  rendering for the locale, and provides the message context to client
  descendants. It also renders `<html>`, `<body>` and the fonts: the root
  layout is a pass-through (see app/layout.tsx).

  ⚠️ Navigation + Footer MUST live here (not in each page.tsx). Mounting
  them at the layout level ensures the component instance PERSISTS across
  route changes. Previously every page mounted its own <Navigation />,
  which meant:
    1. User opens mobile drawer (isOpen=true on instance A)
    2. User taps a link → setIsOpen(false) queued on instance A
    3. router.push starts; React suspends the render
    4. During suspense, the OLD render is shown (drawer still open)
    5. New page loads; instance A unmounts, instance B mounts with
       default isOpen=false
    6. Drawer disappears — but user perceived "drawer never closed"
       because the close animation ran on an unmounted instance.
  With Navigation at the layout level, the same React instance handles
  all routes and `setIsOpen(false)` commits within the SAME paint frame
  — the drawer closes instantly on tap regardless of suspense.
*/

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  // Enables static rendering of all messages on this locale segment.
  setRequestLocale(locale)

  // Píxel de Meta con consentimiento (SEDA_FLAG_META_PIXEL + NEXT_PUBLIC_META_PIXEL_ID).
  // Apagado: nada de nada — sin aviso, sin enlace en el pie, sin script, el mismo
  // HTML que antes (comprobado byte a byte contra `main`; ver el PR). Se lee al
  // hacer el build, como los demás flags.
  //
  // Dos detalles que hacen falta para que «apagado» sea de verdad idéntico:
  //  · `process.env.SEDA_FLAG_META_PIXEL` va escrito literal, y next.config.mjs
  //    lo inlina (`env`): con el flag apagado el bundler elimina el `import()` y
  //    el código del aviso ni siquiera se compila a un chunk. Con un import
  //    estático (o dinámico sin esta guarda) cada página pediría un .js más.
  //  · El aviso y el enlace viajan por el pie (props opcionales que solo se
  //    pasan si hay algo): un `{cond && <Aviso/>}` entre los hijos del layout
  //    dejaría un `null` serializado en el HTML aunque no se pinte nada.
  const pixelId = metaPixelActivo() ? metaPixelId() : null
  const textosCookies = TEXTOS_CONSENTIMIENTO[locale]
  const propsPie: { enlaceCookies?: ReactNode; avisoCookies?: ReactNode } = {}
  if (process.env.SEDA_FLAG_META_PIXEL === "1" && pixelId) {
    const { ConsentimientoCookies } = await import("@/components/consentimiento/consentimiento-cookies")
    const { EnlaceConfigurarCookies } = await import("@/components/consentimiento/enlace-configurar-cookies")
    propsPie.enlaceCookies = <EnlaceConfigurarCookies etiqueta={textosCookies.enlacePie} />
    propsPie.avisoCookies = <ConsentimientoCookies pixelId={pixelId} textos={textosCookies} />
  }

  // `<html lang>` matches the rendered language: drives screen-reader
  // language switching and gives Google a strong locale signal at first paint.
  return (
    <html lang={locale} className={fontVariables} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <NextIntlClientProvider>
          <JsonLdScript data={businessLd} />
          <SkipLink />
          <Navigation />
          {children}
          <Footer {...propsPie} />
          {/* Global power-user shortcuts (g+c, g+p, ?, Esc). Mounted once
              per locale so it's available on every page without bloating
              individual route bundles. */}
          <KeyboardShortcuts />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
