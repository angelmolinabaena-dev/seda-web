import createMiddleware from "next-intl/middleware"
import { routing } from "./i18n/routing"

export default createMiddleware(routing)

// Match all routes except API, internal Next.js paths, and static assets.
export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
}
