import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./i18n/request.ts")

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Sin `X-Powered-By: Next.js`: no aporta nada al visitante y dice qué
  // framework (y casi qué versión) corre detrás. Las cabeceras de seguridad,
  // CSP incluida, viven en vercel.json.
  poweredByHeader: false,
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
      {
        // 19-oct-2026: el beneficio fundacional era el alta gratis y ahora la
        // tiene todo el mundo (tarifa v4). La página se retira; el contenido
        // vigente está en /propietarios. `permanent: true` => 308.
        source: "/founding-owners",
        destination: "/propietarios",
        permanent: true,
      },
      {
        source: "/:locale(en|fr|de)/founding-owners",
        destination: "/:locale/propietarios",
        permanent: true,
      },
    ]
  },
}

export default withNextIntl(nextConfig)
