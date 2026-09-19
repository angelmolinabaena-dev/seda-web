import { defineConfig } from "vitest/config"
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
    include: ["tests/**/*.test.{ts,tsx}"],
  },
})
