import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SEDA Private Homes",
    short_name: "SEDA",
    description:
      "Gestión de villas privadas en la Costa del Sol, operada sobre software propio.",
    start_url: "/",
    display: "standalone",
    background_color: "#fff9f0",
    theme_color: "#1c1d1b",
    icons: [
      { src: "/brand/favicon/favicon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/favicon/favicon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/brand/favicon/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }
}
