"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { X } from "lucide-react"

/*
  Global keyboard shortcuts — power-user navigation.
  Pattern: GitHub / Linear style.

    g then c   → /coleccion
    g then p   → /propietarios
    g then g   → /guestapp
    g then h   → /
    g then i   → /contacto (i = info)
    ?          → toggle help overlay
    Esc        → close help overlay

  Behaviour rules:
  - The 'g' chord opens a 1.5s window; press the second key within it.
  - Disabled while focus is in an input/textarea/select or any
    [contenteditable] element — typing 'g' into the contact form must
    never trigger navigation.
  - Modifier keys (Ctrl/Cmd/Alt/Meta) cancel the chord — we never want
    to clobber Cmd+G "find next" etc.
  - The help dialog is keyboard-accessible: role=dialog, aria-modal,
    Esc closes, focus is trapped to the close button.

  Closes Nielsen heuristic #7 (Flexibility & Efficiency of Use) without
  hurting first-time users (overlay is opt-in via `?`).
*/

type ShortcutAction = { keys: string[]; label: string; href?: string; isHelp?: boolean }

const NAV_SHORTCUTS: Array<{ second: string; path: string; key: string }> = [
  { second: "h", path: "/",             key: "home" },
  { second: "c", path: "/coleccion",    key: "coleccion" },
  { second: "p", path: "/propietarios", key: "propietarios" },
  { second: "g", path: "/guestapp",     key: "guestapp" },
  { second: "i", path: "/contacto",     key: "contacto" },
]

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false
  const tag = el.tagName
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true
  if (el.isContentEditable) return true
  return false
}

export function KeyboardShortcuts() {
  const t = useTranslations("shortcuts")
  const router = useRouter()
  const [helpOpen, setHelpOpen] = useState(false)
  const chordActiveRef = useRef(false)
  const chordTimerRef = useRef<number | null>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  const cancelChord = useCallback(() => {
    chordActiveRef.current = false
    if (chordTimerRef.current !== null) {
      window.clearTimeout(chordTimerRef.current)
      chordTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Never hijack typing.
      if (isTypingTarget(e.target)) return
      // Never compete with browser/OS chords.
      if (e.ctrlKey || e.metaKey || e.altKey) return

      const key = e.key

      // ? → toggle help. Shift+/ produces "?" on most layouts.
      if (key === "?" || (key === "/" && e.shiftKey)) {
        e.preventDefault()
        cancelChord()
        setHelpOpen((v) => !v)
        return
      }

      // Esc → close help if open.
      if (key === "Escape") {
        if (helpOpen) {
          e.preventDefault()
          setHelpOpen(false)
        }
        cancelChord()
        return
      }

      // 'g' starts the chord (unless already in chord).
      if (!chordActiveRef.current && (key === "g" || key === "G")) {
        e.preventDefault()
        chordActiveRef.current = true
        chordTimerRef.current = window.setTimeout(() => {
          chordActiveRef.current = false
          chordTimerRef.current = null
        }, 1500)
        return
      }

      // Second key inside the chord window.
      if (chordActiveRef.current) {
        const second = key.toLowerCase()
        const match = NAV_SHORTCUTS.find((s) => s.second === second)
        cancelChord()
        if (match) {
          e.preventDefault()
          // Close help if open before navigating.
          setHelpOpen(false)
          router.push(match.path)
        }
      }
    }

    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("keydown", onKey)
      cancelChord()
    }
  }, [router, helpOpen, cancelChord])

  // When help opens, move focus to the close button so screen-reader
  // and keyboard users immediately have a way out (Esc also works).
  useEffect(() => {
    if (helpOpen) closeBtnRef.current?.focus()
  }, [helpOpen])

  // Lock body scroll while modal is open.
  useEffect(() => {
    if (!helpOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [helpOpen])

  if (!helpOpen) return null

  const navItems: ShortcutAction[] = NAV_SHORTCUTS.map((s) => ({
    keys: ["G", s.second.toUpperCase()],
    label: t(`items.${s.key}`),
    href: s.path,
  }))

  const generalItems: ShortcutAction[] = [
    { keys: ["?"], label: t("items.help"), isHelp: true },
    { keys: ["Esc"], label: t("items.esc"), isHelp: true },
  ]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="kbd-shortcuts-title"
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8"
    >
      {/* Backdrop */}
      <button
        aria-label={t("close")}
        onClick={() => setHelpOpen(false)}
        className="absolute inset-0 bg-foreground/55 backdrop-blur-sm"
      />
      {/* Panel */}
      <div className="relative bg-background border border-border w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between px-7 py-5 border-b border-border">
          <div>
            <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-1.5">
              — {t("label")}
            </p>
            <h2
              id="kbd-shortcuts-title"
              className="font-serif font-light text-2xl text-foreground leading-tight"
            >
              {t("title")}
            </h2>
          </div>
          <button
            ref={closeBtnRef}
            onClick={() => setHelpOpen(false)}
            aria-label={t("close")}
            className="p-2 -m-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="px-7 py-6">
          <p className="text-sm leading-[1.7] text-muted-foreground mb-7">
            {t("intro")}
          </p>

          <div className="space-y-7">
            <ShortcutGroup
              title={t("sections.navigation")}
              items={navItems}
            />
            <ShortcutGroup
              title={t("sections.general")}
              items={generalItems}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function ShortcutGroup({
  title,
  items,
}: {
  title: string
  items: ShortcutAction[]
}) {
  return (
    <section>
      <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-3.5">
        — {title}
      </p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.keys.join("-") + item.label}
            className="flex items-center justify-between gap-4 py-2 border-b border-border/50 last:border-0"
          >
            <span className="text-sm text-foreground">{item.label}</span>
            <span className="flex items-center gap-1.5 shrink-0">
              {item.keys.map((k, i) => (
                <kbd
                  key={`${k}-${i}`}
                  className="font-mono text-[11px] tracking-wider uppercase px-2 py-1 border border-border bg-secondary/50 text-foreground rounded-sm min-w-[28px] text-center tabular-nums"
                >
                  {k}
                </kbd>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
