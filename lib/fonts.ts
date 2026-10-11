import { Cormorant_Garamond, Manrope, JetBrains_Mono } from "next/font/google"

/*
  Brand fonts. Shared by the two places that render `<html>`:
  `app/[locale]/layout.tsx` (every real page) and `app/not-found.tsx` (the
  locale-less 404). Defined once so both ship the same files.
*/

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  // 700 (bold) is used by the mobile mega-menu where labels need
  // editorial presence; 600 reserved for future H2 emphasis.
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
})

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  // 600 (semibold) used by mobile mega-menu CTAs where the buttons
  // need extra presence — `font-semibold` would synthesise a fake bold
  // without this weight, which renders weak on small mono text.
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
})

export const fontVariables = `${cormorant.variable} ${manrope.variable} ${jetbrainsMono.variable}`
