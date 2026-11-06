import createNextIntlPlugin from "next-intl/plugin"
import { SOURCE_CSP_GLOBAL, cspGlobal } from "./lib/csp.mjs"
import { avisosConfiguracionMeta } from "./lib/meta-config.mjs"

const withNextIntl = createNextIntlPlugin("./i18n/request.ts")

// Flags de Meta encendidos a medias: se dice en el build, sin imprimir valores.
for (const aviso of avisosConfiguracionMeta()) console.warn(`[meta] ${aviso}`)

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Sin `X-Powered-By: Next.js`: no aporta nada al visitante y dice qué
  // framework (y casi qué versión) corre detrás. Las cabeceras de seguridad
  // viven en vercel.json; la CSP GLOBAL es la excepción: se genera aquí
  // (lib/csp.mjs) porque sus dominios de Meta dependen de un flag.
  poweredByHeader: false,
  // Inlina SEDA_FLAG_META_PIXEL en el código (`process.env.SEDA_FLAG_META_PIXEL`
  // literal): así, apagado, el bundler elimina el aviso de cookies y su chunk
  // (ver app/[locale]/layout.tsx). Solo el flag, que no es un secreto.
  env: { SEDA_FLAG_META_PIXEL: process.env.SEDA_FLAG_META_PIXEL ?? "" },
  async headers() {
    return [
      {
        source: SOURCE_CSP_GLOBAL,
        headers: [{ key: "Content-Security-Policy", value: cspGlobal() }],
      },
    ]
  },
  // Image optimization is on by default on Vercel — leaving this on
  // gives us automatic WebP/AVIF, responsive sizes, and edge caching
  // for any future `next/image` adoption. Plain <img> tags are
  // unaffected.
  images: {
    // Sin hosts remotos, a propósito (21-sep-2026). `next/image` solo se usa
    // con ficheros de /public: los renders de fal.ai son ficheros locales
    // (/villas/*.jpg) y los distintivos de premios de /nosotros viven en
    // /images/nosotros. Cada host de esta lista abría /_next/image a cualquier
    // imagen de ese dominio, a cuenta de nuestro cupo de Vercel.
    // Cuando llegue la fotografía real (Supabase Storage u otro), se añade aquí
    // su host exacto, con `pathname` si se puede.
    remotePatterns: [],
  },
  async redirects() {
    return [
      {
        // Legacy slug from earlier iteration — header now reads "Guest App"
        // per the Claude design reference; preserve old links/bookmarks.
        source: "/huespedes",
        destination: "/guestapp",
        permanent: true,
      },
    ]
  },
}

export default withNextIntl(nextConfig)
