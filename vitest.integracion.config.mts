import { defineConfig } from "vitest/config"
import path from "node:path"
import { fileURLToPath } from "node:url"

/*
  Tests de integración: arrancan `next start` sobre el build de producción
  (`.next/`). Fuera de `npm test` porque en CI los tests corren antes del
  build. Uso: `npm run build && npm run test:integracion`.
*/
export default defineConfig({
  resolve: {
    alias: {
      // El mismo alias que vitest.config.mts y tsconfig.json `paths`.
      "@": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "."),
    },
  },
  test: {
    environment: "node",
    include: ["tests/integracion/**/*.test.ts"],
    testTimeout: 15_000,
  },
})
