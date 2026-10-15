import { defineConfig } from "vitest/config"

/*
  Tests de integración: arrancan `next start` sobre el build de producción
  (`.next/`). Fuera de `npm test` porque en CI los tests corren antes del
  build. Uso: `npm run build && npm run test:integracion`.
*/
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/integracion/**/*.test.ts"],
    testTimeout: 15_000,
  },
})
