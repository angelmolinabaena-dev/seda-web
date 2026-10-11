import { getTranslations } from "next-intl/server"
import { routing } from "@/i18n/routing"
import { buildLlmsTxt } from "@/lib/llms"

// Generado en el build desde las fuentes de la web (ver lib/llms.ts).
export const dynamic = "force-static"

export async function GET() {
  const t = await getTranslations({ locale: routing.defaultLocale })
  return new Response(buildLlmsTxt(t), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
