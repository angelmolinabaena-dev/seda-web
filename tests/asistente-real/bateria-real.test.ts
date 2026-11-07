import { anthropic } from "@ai-sdk/anthropic"
import { afterAll, describe, expect, it } from "vitest"
import { ASISTENTE_MODEL_ID } from "@/lib/asistente/config"
import { CASOS, evaluar, type Fallo } from "../asistente/bateria"
import { correrCaso } from "../asistente/simulado"

/*
  La batería del asistente contra el MODELO REAL. A mano, nunca en CI (cuesta
  dinero y necesita la clave):

      ANTHROPIC_API_KEY=… npm run asistente:bateria

  Opcional:
      ASISTENTE_MODELO=claude-haiku-4-5   compara otro modelo sin tocar la constante
      ASISTENTE_REPETICIONES=3            cada caso N veces (el modelo no es determinista)
      ASISTENTE_CASOS=es-iban,fr-tva      solo esos casos

  Mismo turno que la web (acotarHistorial → prepararTurno → modelo →
  limpiarSalida) y mismas comprobaciones que el test de CI. El criterio para
  encender el interruptor está en docs/ASISTENTE-PROPIETARIOS.md: todos los
  casos, en todas las repeticiones.
*/

const modeloId = process.env.ASISTENTE_MODELO || ASISTENTE_MODEL_ID
const repeticiones = Math.max(1, Number(process.env.ASISTENTE_REPETICIONES) || 1)
const filtro = process.env.ASISTENTE_CASOS?.split(",").map((s) => s.trim()).filter(Boolean)
const casos = filtro?.length ? CASOS.filter((c) => filtro.includes(c.id)) : CASOS

const informe: { caso: string; vuelta: number; fallos: Fallo[]; herramientas: string[]; texto: string }[] = []

describe.skipIf(!process.env.ANTHROPIC_API_KEY)(`batería contra ${modeloId}`, () => {
  for (const caso of casos) {
    for (let vuelta = 1; vuelta <= repeticiones; vuelta++) {
      it(`${caso.id} #${vuelta}`, { timeout: 60_000 }, async () => {
        const r = await correrCaso(caso, anthropic(modeloId))
        const fallos = evaluar(caso, r)
        informe.push({ caso: caso.id, vuelta, fallos, herramientas: r.herramientas.map((h) => h.nombre), texto: r.texto })
        expect(fallos, r.texto).toEqual([])
      })
    }
  }

  afterAll(() => {
    const malos = informe.filter((f) => f.fallos.length > 0)
    console.log(`\n── Batería del asistente · ${modeloId} · ${informe.length - malos.length}/${informe.length} pasan ──`)
    for (const f of informe) {
      console.log(`${f.fallos.length ? "✗" : "✓"} ${f.caso} #${f.vuelta} [${f.herramientas.join(", ") || "sin herramientas"}]`)
      for (const x of f.fallos) console.log(`    · ${x.comprobacion}: ${x.detalle}`)
      if (f.fallos.length) console.log(`    «${f.texto.replace(/\s+/g, " ").slice(0, 400)}»`)
    }
  })
})

it.skipIf(!!process.env.ANTHROPIC_API_KEY)("sin ANTHROPIC_API_KEY no se corre la batería real", () => {
  console.log("Falta ANTHROPIC_API_KEY: la batería real no se ha ejecutado (ver docs/ASISTENTE-PROPIETARIOS.md).")
})
