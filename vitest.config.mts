import { configDefaults, defineConfig } from "vitest/config"
import path from "node:path"
import { fileURLToPath } from "node:url"

export default defineConfig({
  resolve: {
    alias: {
      // Same alias as tsconfig.json `paths` — how Next resolves "@/".
      "@": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "."),
    },
  },
  test: {
    environment: "node",
    // next-intl/middleware importa "next/server" sin extensión, que Node ESM no
    // resuelve. Vitest lo procesa con su propio resolver si se inlinea. Lo necesita
    // tests/tour360-cabeceras.test.ts, que ejecuta proxy.ts de verdad.
    server: { deps: { inline: ["next-intl"] } },
    include: ["tests/**/*.test.{ts,tsx}"],
    // Necesitan el build y un `next start`: van en `npm run test:integracion`
    // (vitest.integracion.config.mts), después de `npm run build`.
    // tests/asistente-real: la batería del asistente contra el modelo real, a mano
    // (`npm run asistente:bateria`, vitest.asistente-real.config.mts).
    exclude: [...configDefaults.exclude, "tests/integracion/**", "tests/asistente-real/**"],
  },
})
