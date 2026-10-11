import { getTranslations } from "next-intl/server"
import { routing } from "@/i18n/routing"
import { buildLlmsTxt } from "@/lib/llms"

// Como /llms.txt, con las respuestas de las preguntas frecuentes (ver lib/llms.ts).
export const dynamic = "force-static"

export async function GET() {
  const t = await getTranslations({ locale: routing.defaultLocale })
  return new Response(buildLlmsTxt(t, { full: true }), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
