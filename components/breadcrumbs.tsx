import { ChevronRight } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { getTranslations, getLocale } from "next-intl/server"
import { localeUrl } from "@/lib/seo-urls"

/*
  Server-rendered breadcrumb trail.
  - Renders an <ol> with chevron separators and aria-label="Breadcrumb"
    (i18n'd via shortcuts.label/breadcrumb.label so screen readers
    announce it correctly in ES/EN).
  - Marks the last item with aria-current="page" and renders it as
    plain text (no link), per WAI breadcrumb pattern.
  - Emits a BreadcrumbList JSON-LD script for SEO — Google uses this
    to show breadcrumbs in SERPs instead of the raw URL.

  Closes Nielsen heuristic #3 (User Control & Freedom) on deep routes
  by exposing the location in the IA and a one-click escape to any
  ancestor level.
*/

export type BreadcrumbItem = {
  /** Visible label (already in the active locale). */
  label: string
  /** Absolute path (locale-aware Link handles the prefix). Omit on the last item. */
  href?: string
}

export async function Breadcrumbs({
  items,
  className = "",
}: {
  items: BreadcrumbItem[]
  className?: string
}) {
  const t = await getTranslations("breadcrumb")
  const locale = await getLocale()

  // Always prepend Home as the first crumb.
  const trail: BreadcrumbItem[] = [
    { label: t("home"), href: "/" },
    ...items,
  ]

  // Build absolute URLs for JSON-LD via the shared `localeUrl` helper —
  // covers all 4 locales (`as-needed` prefix: es is bare "/", en/fr/de get
  // "/{locale}/..."). Previously hardcoded to es/en only, so fr and de
  // breadcrumb JSON-LD silently emitted "/en/..." URLs.
  const localized = (path: string) => localeUrl(locale, path === "/" ? "" : path)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.label,
      ...(item.href ? { item: localized(item.href) } : {}),
    })),
  }

  return (
    <>
      <nav
        aria-label={t("label")}
        className={`font-mono text-[10px] tracking-[0.22em] uppercase ${className}`}
      >
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {trail.map((item, idx) => {
            const isLast = idx === trail.length - 1
            return (
              <li key={`${item.label}-${idx}`} className="flex items-center gap-2">
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="text-background/65 hover:text-background border-b border-transparent hover:border-background/40 transition-colors pb-0.5"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    aria-current={isLast ? "page" : undefined}
                    className={isLast ? "text-background" : "text-background/65"}
                  >
                    {item.label}
                  </span>
                )}
                {!isLast && (
                  <ChevronRight
                    aria-hidden
                    className="h-3 w-3 text-background/35 shrink-0"
                    strokeWidth={1.75}
                  />
                )}
              </li>
            )
          })}
        </ol>
      </nav>

      {/* SEO: BreadcrumbList structured data so Google replaces the URL
          in SERPs with the named trail. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  )
}
