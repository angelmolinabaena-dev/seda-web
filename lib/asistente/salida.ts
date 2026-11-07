import type { StreamTextTransform, TextStreamPart, ToolSet } from "ai"
import { REFERENCIA_INTERNA } from "./instrucciones"
import { generalContact } from "@/lib/site-contact"
import { retirarDatosSensibles } from "./datos-sensibles"

/*
  La salida del modelo, antes de llegar a la persona: se tapan los datos
  sensibles (por si el modelo repitiera uno que se le escapó a la entrada) y la
  referencia interna de las instrucciones (señal de que intentan sacárselas).

  El texto llega a trozos. Para que un dato partido entre dos trozos no se cuele,
  se retiene hasta un final de frase (salto de línea, o «. », «? », «! », «: »
  tras una letra) o el final del bloque, se limpia y se suelta. Las respuestas
  son de dos a cinco frases: la espera es de una frase, no de la respuesta.
*/

/** Limpia un texto completo de salida. Devuelve el texto y qué se tapó. */
export function limpiarSalida(texto: string): { texto: string; tapado: string[] } {
  // El contacto público de SEDA sí puede salir (es el de la web).
  const r = retirarDatosSensibles(texto, [generalContact.email, generalContact.phone])
  const tapado = [...r.tipos]
  let t = r.texto
  if (t.includes(REFERENCIA_INTERNA)) {
    tapado.push("referencia_interna")
    t = t.split(REFERENCIA_INTERNA).join("")
  }
  return { texto: t, tapado }
}

// Fin de frase seguro para soltar: salto de línea, o puntuación de cierre tras una letra y seguida de espacio.
const FIN_DE_FRASE = /(?:\n|[\p{L})»"][.?!:;] )(?![\s\S]*(?:\n|[\p{L})»"][.?!:;] ))/u

export function transformarSalida<TOOLS extends ToolSet>(onTapado?: (tipos: string[]) => void): StreamTextTransform<TOOLS> {
  return () => {
    const pendientes = new Map<string, string>()
    const soltar = (id: string, texto: string, ctrl: TransformStreamDefaultController<TextStreamPart<TOOLS>>) => {
      if (!texto) return
      const { texto: limpio, tapado } = limpiarSalida(texto)
      if (tapado.length) onTapado?.(tapado)
      ctrl.enqueue({ type: "text-delta", id, text: limpio } as TextStreamPart<TOOLS>)
    }
    return new TransformStream<TextStreamPart<TOOLS>, TextStreamPart<TOOLS>>({
      transform(parte, ctrl) {
        if (parte.type === "text-delta") {
          const acumulado = (pendientes.get(parte.id) ?? "") + parte.text
          const m = FIN_DE_FRASE.exec(acumulado)
          if (m) {
            const corte = m.index + m[0].length
            soltar(parte.id, acumulado.slice(0, corte), ctrl)
            pendientes.set(parte.id, acumulado.slice(corte))
          } else {
            pendientes.set(parte.id, acumulado)
          }
          return
        }
        if (parte.type === "text-end") {
          soltar(parte.id, pendientes.get(parte.id) ?? "", ctrl)
          pendientes.delete(parte.id)
        }
        ctrl.enqueue(parte)
      },
      flush(ctrl) {
        for (const [id, texto] of pendientes) soltar(id, texto, ctrl)
        pendientes.clear()
      },
    })
  }
}
