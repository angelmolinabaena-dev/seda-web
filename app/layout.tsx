import type { Metadata, Viewport } from "next"

/*
  Root layout — a pass-through. `<html lang>`, `<body>`, the fonts and
  globals.css live in `app/[locale]/layout.tsx`, where the locale comes from
  the URL segment.

  It used to render `<html lang={await getLocale()}>` here. Outside the
  `[locale]` segment `getLocale()` can only learn the locale from the
  request headers, and reading headers made EVERY route a per-request
  render: no static HTML, no CDN cache, ~0.3–0.5 s of TTFB from the iad1
  function on each visit. Without it, every page prerenders at build time.

  The metadata and viewport below still apply to every route.
*/

export const metadata: Metadata = {
  metadataBase: new URL("https://sedaprivatehomes.com"),
  title: {
    default: "SEDA Private Homes — Villas privadas en la Costa del Sol",
    template: "%s · SEDA Private Homes",
  },
  description:
    "Gestión de villas privadas en la Costa del Sol, operada sobre software propio. Hospitalidad mediterránea para huéspedes, transparencia total para propietarios.",
  // No root-level `alternates` here on purpose: this metadata is the
  // fallback for EVERY route, and a single hardcoded canonical/hreflang
  // pointing at the homepage was being inherited by all 13 non-home routes
  // (verified in prod) — telling Google the whole site was a duplicate of
  // "/". Each route now sets its own `alternates.canonical` + `.languages`
  // via `generateMetadata` (see `@/lib/seo-urls`); no canonical here is
  // strictly better than one that's wrong everywhere except "/".
  openGraph: {
    type: "website",
    locale: "es_ES",
    alternateLocale: ["en_GB"],
    siteName: "SEDA Private Homes",
    title: "SEDA Private Homes — Villas privadas en la Costa del Sol",
    description:
      "Gestión de villas privadas en la Costa del Sol, operada sobre software propio.",
    images: [
      {
        url: "/brand/og/og-stone.jpg",
        width: 1200,
        height: 630,
        alt: "SEDA Private Homes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SEDA Private Homes",
    description:
      "Villas privadas en la Costa del Sol. Hospitalidad mediterránea, operada sobre software propio.",
    images: ["/brand/og/og-stone.jpg"],
  },
  icons: {
    icon: [
      { url: "/brand/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/brand/favicon/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/brand/favicon/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: ["/brand/favicon/favicon.ico"],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1c1d1b",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
