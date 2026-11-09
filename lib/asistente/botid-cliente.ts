import { initBotId } from "botid/client/core"
import { RUTAS_BOTID } from "@/lib/asistente/config"

/*
  Vercel BotID en el navegador, SOLO cuando alguien va a usar el chat.

  `initBotId` (botid@1.5.12, producción) envuelve `window.fetch` y `XMLHttpRequest` y
  registra listeners; el script del desafío (c.js) se carga con la PRIMERA petición
  protegida, y esa petición espera a que el desafío esté listo. Una petición protegida
  hecha ANTES de `initBotId` sale con el `fetch` sin envolver, sin cabeceras de BotID
  y sin esperar. Por eso se inicia al primer hover, foco o clic en el botón del
  asistente (el panel, y con él el primer mensaje, solo existe después), y no al montar
  la página: quien nunca toca el botón no recibe ni el parche de `fetch` ni nada de BotID.

  Una sola vez por carga: la variable es del módulo, no del componente, así que un
  cambio de página no lo repite. En desarrollo `initBotId` no hace nada.
*/

let iniciado = false

export function iniciarBotIdUnaVez(): void {
  if (iniciado) return
  iniciado = true
  initBotId({ protect: RUTAS_BOTID })
}

/** Solo para los tests. */
export function reiniciarBotIdParaTests(): void {
  iniciado = false
}
