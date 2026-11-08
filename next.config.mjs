import { withBotId } from "botid/next/config"
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
  // Igual con SEDA_FLAG_ASISTENTE_PROPIETARIOS: apagado, el botón del asistente
  // no se compila en el chunk de /propietarios ni de la calculadora. Las rutas
  // /api/asistente leen el valor en tiempo de ejecución (`asistentePropietariosActivo()`
  // accede a `env[...]`, que el bundler no sustituye).
  // SEDA_IVA_ALOJAMIENTO_RDL29 (lib/iva-alojamiento.ts) se inlina para que la
  // calculadora, que calcula en el navegador, y el servidor (textos, asistente)
  // apliquen el mismo régimen del IVA del alojamiento: cambiarlo exige redeploy.
  env: {
    SEDA_FLAG_META_PIXEL: process.env.SEDA_FLAG_META_PIXEL ?? "",
    SEDA_FLAG_ASISTENTE_PROPIETARIOS: process.env.SEDA_FLAG_ASISTENTE_PROPIETARIOS ?? "",
    SEDA_IVA_ALOJAMIENTO_RDL29: process.env.SEDA_IVA_ALOJAMIENTO_RDL29 ?? "",
  },
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

// withBotId: las reescrituras de Vercel BotID (script y proxy, mismo origen) que usa
// el asistente de propietarios (lib/asistente/bots.ts). Sin el asistente encendido,
// ninguna página pide esas rutas.
export default withBotId(withNextIntl(nextConfig))
