import { defineConfig } from "vitest/config"
import path from "node:path"
import { fileURLToPath } from "node:url"

// `npm run asistente:bateria` — la batería del asistente contra el modelo real
// (tests/asistente-real/). A mano: cuesta dinero y necesita ANTHROPIC_API_KEY.
// `npm test` no la incluye (vitest.config.mts solo mira tests/*.test.ts fuera de
// las carpetas de integración y de esta).
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "."),
    },
  },
  test: {
    environment: "node",
    include: ["tests/asistente-real/**/*.test.ts"],
    // Una petición a la vez: menos ruido de límites de la API y un informe en orden.
    fileParallelism: false,
    maxConcurrency: 1,
  },
})
