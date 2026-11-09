import { execSync } from "node:child_process"
import { createRequire } from "node:module"

/* Playwright no es dependencia del proyecto: tipos mínimos de lo que usan los tests de integración con navegador. */
export type Pagina = {
  goto(url: string, o: { waitUntil: "networkidle" }): Promise<unknown>
  evaluate<T, A = undefined>(f: ((arg: A) => T) | string, arg?: A): Promise<T>
  waitForTimeout(ms: number): Promise<void>
  click(selector: string): Promise<void>
  hover(selector: string): Promise<void>
  close(): Promise<void>
  keyboard: { press(tecla: string): Promise<void> }
  mouse: { click(x: number, y: number): Promise<void> }
}
export type Navegador = { newPage(o: { viewport: { width: number; height: number }; reducedMotion?: "reduce" | "no-preference" }): Promise<Pagina>; close(): Promise<void> }
export type Pw = { chromium: { launch(): Promise<Navegador> } }

export function cargarPlaywright(): Pw | null {
  const intentos = [() => createRequire(import.meta.url)("playwright"), () => createRequire(`${execSync("npm root -g").toString().trim()}/`)("playwright")]
  for (const f of intentos) {
    try {
      return f() as Pw
    } catch {}
  }
  return null
}
