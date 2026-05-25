import Link from "next/link"

/*
  Root-level not-found — must be self-contained.
  Reached only when middleware can't resolve the URL to a locale at all
  (rare). The locale-aware version (with Navigation, Footer, i18n) lives at
  `app/[locale]/not-found.tsx` and handles every normal mismatched route.

  Bilingual hardcoded copy is intentional here: we can't use useTranslations()
  outside the NextIntlClientProvider in [locale]/layout.tsx.
*/

export const metadata = {
  title: "Not found · Página no encontrada — SEDA Private Homes",
}

export default function RootNotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-32 bg-background text-foreground">
      <div className="max-w-2xl text-center">
        <p className="font-mono text-[11px] tracking-[0.35em] uppercase text-muted-foreground mb-8">
          — 404 · Not found
        </p>
        <h1 className="font-serif font-light text-[clamp(2.5rem,6vw,5rem)] leading-[1.05] tracking-[-0.015em] text-foreground text-balance mb-8">
          This page has stepped <span className="italic">aside</span>.
          <br />
          Esta página se ha tomado <span className="italic">un momento</span>.
        </h1>
        <p className="text-base leading-[1.7] text-muted-foreground max-w-md mx-auto mb-12">
          The address may have changed or no longer exists.
          <br />
          Es posible que el enlace haya cambiado o que la dirección no exista.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-7 py-3.5 bg-foreground text-background font-mono text-[11px] tracking-[0.25em] uppercase hover:bg-foreground/90 transition-colors"
          >
            Inicio / Home
          </Link>
          <Link
            href="/coleccion"
            className="inline-flex items-center justify-center px-7 py-3.5 border border-foreground/30 text-foreground font-mono text-[11px] tracking-[0.25em] uppercase hover:border-foreground transition-colors"
          >
            Colección / Collection
          </Link>
        </div>
      </div>
    </main>
  )
}
