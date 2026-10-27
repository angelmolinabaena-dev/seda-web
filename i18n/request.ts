import { getRequestConfig } from "next-intl/server"
import { hasLocale } from "next-intl"
import { routing } from "./routing"
import { resolverMensajes } from "@/lib/tarifa"

/*
  Per-request config consumed by next-intl on the server.
  Resolves the locale from URL, falls back to the default, and loads the
  matching `messages/{locale}.json` bundle.

  Las cifras de la tarifa no están escritas en los mensajes: llevan
  `[[tarifa.<nombre>]]` y se resuelven aquí con lib/tarifa/tarifa.json, el
  único origen. Lo que lee este bundle (la web, el JSON-LD FAQPage, /llms.txt)
  hereda la cifra.
*/
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale

  return {
    locale,
    messages: resolverMensajes((await import(`../messages/${locale}.json`)).default, locale),
  }
})
