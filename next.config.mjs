import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./i18n/request.ts")

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization is on by default on Vercel — leaving this on
  // gives us automatic WebP/AVIF, responsive sizes, and edge caching
  // for any future `next/image` adoption. Plain <img> tags are
  // unaffected.
  images: {
    // Sin hosts remotos, a propósito (21-sep-2026). `next/image` solo se usa
    // con ficheros de /public: `git grep "next/image"` da NosotrosContent.tsx y
    // PropietariosContent.tsx, los dos con /angel-molina.jpg. Los renders de
    // fal.ai ya son ficheros locales (/villas/*.jpg) y los distintivos de
    // hotelesteponaplaza.com se pintan con <img>, que no pasa por el
    // optimizador. Cada host de esta lista abría /_next/image a cualquier
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
