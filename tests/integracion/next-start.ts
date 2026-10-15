import { spawn, type ChildProcess } from "node:child_process"
import { existsSync } from "node:fs"
import { createServer } from "node:net"
import { join } from "node:path"

/*
  Arranca `next start` sobre el build de producción (`.next/`) en un puerto
  libre, para los tests de integración. Cada fichero arranca el suyo: vitest
  los corre en paralelo y así no comparten estado.
*/

export type ServidorNext = {
  base: string
  /** stdout + stderr del servidor desde el arranque. */
  log: () => string
  parar: () => void
}

function puertoLibre(): Promise<number> {
  return new Promise((resolve, reject) => {
    const s = createServer()
    s.once("error", reject)
    s.listen(0, () => {
      const dir = s.address()
      const puerto = typeof dir === "object" && dir ? dir.port : 0
      s.close(() => resolve(puerto))
    })
  })
}

export async function arrancarNext(raiz = process.cwd(), ms = 30_000): Promise<ServidorNext> {
  if (!existsSync(join(raiz, ".next", "BUILD_ID"))) {
    throw new Error("No hay build de producción: ejecuta `npm run build` antes de `npm run test:integracion`.")
  }
  const puerto = await puertoLibre()
  const base = `http://localhost:${puerto}`
  let log = ""
  const servidor: ChildProcess = spawn(
    process.execPath,
    [join(raiz, "node_modules", "next", "dist", "bin", "next"), "start", "-p", String(puerto)],
    { cwd: raiz, stdio: ["ignore", "pipe", "pipe"] },
  )
  servidor.stdout?.on("data", (b) => (log += b))
  servidor.stderr?.on("data", (b) => (log += b))

  const fin = Date.now() + ms
  for (;;) {
    try {
      await fetch(`${base}/robots.txt`)
      break
    } catch {
      if (Date.now() > fin) {
        servidor.kill()
        throw new Error(`next start no respondió en ${ms} ms. Log:\n${log}`)
      }
      await new Promise((r) => setTimeout(r, 250))
    }
  }
  return { base, log: () => log, parar: () => servidor.kill() }
}
