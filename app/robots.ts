import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/seo-urls"

/*
  Decisión de Ángel (11-oct-2026): queremos que las IA recomienden SEDA. Los
  rastreadores de búsqueda y de IA se nombran uno a uno, con permiso
  explícito, además de la regla general. `/api/` queda fuera para todos.

  - GPTBot, OAI-SearchBot: OpenAI (entrenamiento y búsqueda de ChatGPT).
  - ClaudeBot, Claude-SearchBot: Anthropic.
  - PerplexityBot: Perplexity.
  - Google-Extended: el permiso para Gemini y los resúmenes con IA; no es un
    rastreador aparte (Googlebot rastrea), es el token que lo autoriza.
*/
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-SearchBot",
  "PerplexityBot",
  "Google-Extended",
] as const

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/"] },
      { userAgent: [...AI_CRAWLERS], allow: "/", disallow: ["/api/"] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
