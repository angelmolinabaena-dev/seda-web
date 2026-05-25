import { notFound } from "next/navigation"
import { NextIntlClientProvider, hasLocale } from "next-intl"
import { setRequestLocale } from "next-intl/server"
import { SkipLink } from "@/components/skip-link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts"
import { routing } from "@/i18n/routing"

/*
  Per-locale layout. Validates the URL locale, opts the page into static
  rendering for the locale, and provides the message context to client
  descendants. Root `<html>` + fonts live in the parent layout.

  ⚠️ Navigation + Footer MUST live here (not in each page.tsx). Mounting
  them at the layout level ensures the component instance PERSISTS across
  route changes. Previously every page mounted its own <Navigation />,
  which meant:
    1. User opens mobile drawer (isOpen=true on instance A)
    2. User taps a link → setIsOpen(false) queued on instance A
    3. router.push starts; React suspends the render
    4. During suspense, the OLD render is shown (drawer still open)
    5. New page loads; instance A unmounts, instance B mounts with
       default isOpen=false
    6. Drawer disappears — but user perceived "drawer never closed"
       because the close animation ran on an unmounted instance.
  With Navigation at the layout level, the same React instance handles
  all routes and `setIsOpen(false)` commits within the SAME paint frame
  — the drawer closes instantly on tap regardless of suspense.
*/

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  // Enables static rendering of all messages on this locale segment.
  setRequestLocale(locale)

  return (
    <NextIntlClientProvider>
      <SkipLink />
      <Navigation />
      {children}
      <Footer />
      {/* Global power-user shortcuts (g+c, g+p, ?, Esc). Mounted once
          per locale so it's available on every page without bloating
          individual route bundles. */}
      <KeyboardShortcuts />
    </NextIntlClientProvider>
  )
}
