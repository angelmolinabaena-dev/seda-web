import createMiddleware from "next-intl/middleware"
import { routing } from "./i18n/routing"
import { type NextRequest, NextResponse } from "next/server"

const intlMiddleware = createMiddleware(routing)

/*
  ── 410 Gone para las cuatro fichas de villa retiradas ──────────────────

  `/villa/<slug>` publicaba cuatro residencias que no existen. Se retiraron
  (ruta, datos, JSON-LD, sitemap e i18n) — ver docs/audit/RETIRADA-COLECCION.md.

  Las 16 URLs resultantes (4 slugs × 4 locales) estaban indexadas, así que no
  pueden caer en un 404 silencioso. Se responde **410 Gone**, no una
  redirección a `/coleccion`:

    · Un 301/308 afirmaría que el recurso «está ahora» en /coleccion. Las
      villas no se han movido: no existen. Google trata la redirección masiva
      de fichas concretas a una página genérica como *soft 404* — la URL
      sobrevive en el índice con su título antiguo, que es justo lo que hay
      que evitar.
    · 410 es la afirmación correcta y la señal de desindexación más rápida:
      «existió, se ha retirado de forma permanente».
    · El cuerpo servido lleva enlace a /coleccion en el idioma de la URL, de
      modo que el visitante humano no queda en un callejón sin salida.

  Cualquier otra ruta bajo `/villa/` sigue devolviendo 404: no fue retirada,
  nunca existió.
*/
const RETIRED_VILLA_SLUGS = [
  "villa-alboran",
  "atico-marina-puerto-banus",
  "finca-los-olivos-casares",
  "residencia-duna-estepona",
] as const

const RETIRED_VILLA_PATH = new RegExp(
  `^/(?:(${routing.locales.join("|")})/)?villa/(?:${RETIRED_VILLA_SLUGS.join("|")})(?:/.*)?$`,
)

// TEXTO NUEVO — pendiente de revisión de Ángel (solo la primera línea de cada
// idioma). La etiqueta del enlace es copia literal de `notfound.see_collection`
// de messages/<locale>.json, no redacción nueva.
const GONE_COPY: Record<string, { gone: string; link: string }> = {
  es: { gone: "Esta residencia ya no está publicada.", link: "Ver la colección" },
  en: { gone: "This residence is no longer published.", link: "See the collection" },
  fr: { gone: "Cette résidence n'est plus publiée.", link: "Voir la collection" },
  de: { gone: "Diese Residenz wird nicht mehr veröffentlicht.", link: "Kollektion ansehen" },
}

function goneResponse(locale: string) {
  const copy = GONE_COPY[locale] ?? GONE_COPY[routing.defaultLocale]
  const href = locale === routing.defaultLocale ? "/coleccion" : `/${locale}/coleccion`
  const body = `<!doctype html>
<html lang="${locale}">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${copy.gone} — SEDA Private Homes</title>
<style>
  html { color-scheme: light }
  body {
    margin: 0; min-height: 100vh; display: flex; align-items: center;
    justify-content: center; padding: 2rem; text-align: center;
    background: hsl(36 38% 97%); color: hsl(90 4% 11%);
    font-family: ui-serif, Georgia, "Times New Roman", serif;
  }
  p { font-size: clamp(1.25rem, 4vw, 1.75rem); font-weight: 300; margin: 0 0 2rem }
  a {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.7rem; letter-spacing: 0.22em; text-transform: uppercase;
    color: hsl(90 4% 11%); border-bottom: 1px solid hsl(90 4% 11% / 0.3);
    padding-bottom: 0.25rem; text-decoration: none;
  }
</style>
<body>
  <main>
    <p>${copy.gone}</p>
    <a href="${href}">${copy.link}</a>
  </main>
</body>
</html>`
  return new NextResponse(body, {
    status: 410,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  })
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  // Guard: never locale-route Next.js internals, API routes, or static files.
  // This runs even if the matcher below is ignored by the runtime.
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_vercel/") ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  ) {
    return NextResponse.next()
  }
  const retired = RETIRED_VILLA_PATH.exec(pathname)
  if (retired) {
    return goneResponse(retired[1] ?? routing.defaultLocale)
  }
  return intlMiddleware(request)
}

export const proxyConfig = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
}
