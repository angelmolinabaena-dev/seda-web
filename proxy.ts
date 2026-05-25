import createMiddleware from "next-intl/middleware"
import { routing } from "./i18n/routing"
import { type NextRequest, NextResponse } from "next/server"

const intlMiddleware = createMiddleware(routing)

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
  return intlMiddleware(request)
}

export const proxyConfig = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
}
