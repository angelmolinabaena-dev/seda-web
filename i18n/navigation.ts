import { createNavigation } from "next-intl/navigation"
import { routing } from "./routing"

/*
  Locale-aware navigation primitives.
  - `<Link href="/coleccion">` → on ES renders `/coleccion`, on EN renders `/en/coleccion`.
  - `useRouter()` push/replace are locale-aware.
  - `redirect`, `permanentRedirect`, `usePathname` resolve in locale context.
*/
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
