import { crearLimitador } from "@/lib/api-guards"
import { hoyMadrid } from "@/lib/calculadora-propietarios"
import { LIMITES, topeDiario } from "./config"

/*
  Cupos del asistente: cada turno cuesta dinero.

  · Por visitante (IP): LIMITES.turnosPorVisitante por ventana, ventana deslizante.
  · Por conversación: LIMITES.turnosPorConversacion mensajes de la persona (se
    cuentan en el historial que manda el navegador; quien lo borre para saltárselo
    choca con el límite por visitante).
  · Diario: `topeDiario()` turnos al día (día de Madrid).

  TODO EN MEMORIA, por instancia de la función (seda-web no tiene Upstash ni
  ninguna base de datos propia; decisión y alternativas en
  docs/ASISTENTE-PROPIETARIOS.md, «Costes y abuso»). En Vercel una instancia
  caliente atiende muchas peticiones (Fluid compute), pero varias instancias
  suman cupos: por eso el techo que DURA está fuera del código —una regla de
  límite en el Firewall de Vercel sobre /api/asistente y el límite de gasto del
  espacio de trabajo en la consola de Anthropic—, y cuando Anthropic deja de
  responder por ese límite el asistente da el mensaje de respaldo.

  La IP no sale de estos mapas en memoria y se purga en cada llamada (como el
  limitador de los formularios).
*/

export function crearCupos(ahora: () => number = Date.now) {
  const porVisitante = crearLimitador(LIMITES.turnosPorVisitante, LIMITES.ventanaVisitanteMs)
  let dia = ""
  let usados = 0

  return {
    /** ¿Puede este visitante hacer otro turno? Cuenta el turno si sí. */
    visitante(clave: string) {
      return porVisitante(clave, ahora())
    },
    /** ¿Queda cupo hoy? Cuenta el turno si sí. */
    diario(env: Record<string, string | undefined> = process.env): boolean {
      const hoy = hoyMadrid(new Date(ahora()))
      if (hoy !== dia) {
        dia = hoy
        usados = 0
      }
      if (usados >= topeDiario(env)) return false
      usados++
      return true
    },
  }
}

export function conversacionAgotada(turnosPersona: number): boolean {
  return turnosPersona > LIMITES.turnosPorConversacion
}
