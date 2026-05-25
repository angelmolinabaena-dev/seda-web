import React from "react"
import type { Metadata, Viewport } from "next"
import { Cormorant_Garamond, Manrope, JetBrains_Mono } from "next/font/google"
import { getLocale } from "next-intl/server"

import "./globals.css"

/*
  Root layout — locale-agnostic. The `<html lang>` attribute, NextIntlClientProvider
  and SkipLink live in `app/[locale]/layout.tsx`, where the locale is resolved
  from the URL.
*/

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  // 700 (bold) is used by the mobile mega-menu where labels need
  // editorial presence; 600 reserved for future H2 emphasis.
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
})

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  // 600 (semibold) used by mobile mega-menu CTAs where the buttons
  // need extra presence — `font-semibold` would synthesise a fake bold
  // without this weight, which renders weak on small mono text.
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://sedaprivatehomes.com"),
  title: {
    default: "SEDA Private Homes — Villas privadas en la Costa del Sol",
    template: "%s · SEDA Private Homes",
  },
  description:
    "Gestión de villas privadas en la Costa del Sol, operada sobre software propio. Hospitalidad mediterránea para huéspedes, transparencia total para propietarios.",
  alternates: {
    canonical: "https://sedaprivatehomes.com",
    languages: {
      es: "https://sedaprivatehomes.com",
      en: "https://sedaprivatehomes.com/en",
      fr: "https://sedaprivatehomes.com/fr",
      de: "https://sedaprivatehomes.com/de",
      "x-default": "https://sedaprivatehomes.com",
    },
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    alternateLocale: ["en_GB"],
    siteName: "SEDA Private Homes",
    title: "SEDA Private Homes — Villas privadas en la Costa del Sol",
    description:
      "Gestión de villas privadas en la Costa del Sol, operada sobre software propio.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEDA Private Homes",
    description:
      "Villas privadas en la Costa del Sol. Hospitalidad mediterránea, operada sobre software propio.",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1c1d1b",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Resolve the locale from the URL via next-intl's server helper so that
  // `<html lang>` matches the rendered language. This also drives screen-reader
  // language switching and gives Google a strong locale signal at first paint.
  const locale = await getLocale()
  return (
    <html
      lang={locale}
      className={`${cormorant.variable} ${manrope.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
