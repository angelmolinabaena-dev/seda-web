import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./i18n/request.ts")

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization is on by default on Vercel — leaving this on
  // gives us automatic WebP/AVIF, responsive sizes, and edge caching
  // for any future `next/image` adoption. Plain <img> tags are
  // unaffected.
  images: {
    // Allow remote villa renders served by fal.ai during placeholder
    // phase. Add Supabase Storage / Cloudinary hosts here when
    // real photography lands.
    remotePatterns: [
      { protocol: "https", hostname: "v3.fal.media" },
      { protocol: "https", hostname: "fal.media" },
    ],
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
