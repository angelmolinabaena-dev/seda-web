import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

// NOTE: eslint-config-next/core-web-vitals ships as
// [...eslint-config-next's base "next" config (already spreads
// @next/eslint-plugin-next's `recommended` rules)] + [the plugin's
// `core-web-vitals` rule set, which redefines the same @next/next/* rule
// IDs at upgraded severity, e.g. no-html-link-for-pages warn -> error].
// Flat config runs every matching config object independently, so any
// @next/next/* rule present in both fires twice per violation (duplicate
// entries in `eslint .` output for the same line/col). This is upstream
// packaging, not something we introduced — avoiding it means hand-rolling
// our own @next/next rule block instead of `core-web-vitals`, which is
// fragile and would drift on every eslint-config-next upgrade. Left as-is.
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    // Defaults de eslint-config-next
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Herramientas y copias del repo, no codigo fuente
    '.claude/**',
    '.worktrees/**',
    '.impeccable/**',
    '.tmp/**',
    'graphify-out/**',
  ]),
])

export default eslintConfig
