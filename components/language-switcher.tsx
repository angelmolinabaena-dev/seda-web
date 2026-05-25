"use client"

import { useTransition } from "react"
import { useLocale, useTranslations } from "next-intl"
import { usePathname, useRouter } from "@/i18n/navigation"
import type { Locale } from "@/i18n/routing"

/*
  Discreet ES/EN toggle for the header. Two letters with the active one
  underlined — no flags (avoids political/cultural ambiguity with EN ↔ UK ↔ US).

  The switcher pushes the same pathname under the new locale. With
  `localePrefix: 'as-needed'`, ES routes drop the prefix (`/coleccion`) and EN
  routes keep it (`/en/coleccion`). next-intl handles the URL rewriting.
*/

const LOCALES: { id: Locale; label: string }[] = [
  { id: "es", label: "ES" },
  { id: "en", label: "EN" },
  { id: "fr", label: "FR" },
  { id: "de", label: "DE" },
]

export function LanguageSwitcher({
  darkOnLight = true,
  onAfterChange,
}: {
  darkOnLight?: boolean
  onAfterChange?: (locale: Locale) => void
}) {
  const locale = useLocale() as Locale
  const t = useTranslations()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const switchTo = (next: Locale) => {
    if (next === locale) return
    startTransition(() => {
      router.replace(pathname, { locale: next })
      onAfterChange?.(next)
    })
  }

  return (
    <div
      role="group"
      aria-label={t("lang.switch_label")}
      aria-busy={isPending}
      className="inline-flex items-baseline gap-1 font-mono text-[10px] tracking-[0.22em] uppercase select-none"
    >
      {LOCALES.map((l, i) => {
        const active = l.id === locale
        return (
          <span key={l.id} className="contents">
            <button
              type="button"
              onClick={() => switchTo(l.id)}
              aria-pressed={active}
              disabled={isPending && !active}
              className={`transition-colors ${
                active
                  ? darkOnLight
                    ? "text-foreground"
                    : "text-background"
                  : darkOnLight
                  ? "text-muted-foreground hover:text-foreground"
                  : "text-background/55 hover:text-background"
              } ${active ? "border-b border-current" : ""} pb-px`}
            >
              {l.label}
            </button>
            {i < LOCALES.length - 1 && (
              <span
                aria-hidden
                className={darkOnLight ? "text-muted-foreground/40" : "text-background/30"}
              >
                /
              </span>
            )}
          </span>
        )
      })}
    </div>
  )
}
