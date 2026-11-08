import { checkBotId } from "botid/server"

/*
  Vercel BotID en las dos rutas del asistente (MOT-11, «no hay protección contra
  bots»). Es de Vercel, que ya aloja el sitio y ejecuta estas funciones: no
  añade ningún encargado nuevo.

  Cómo encaja:
    · El navegador: `initBotId` con RUTAS_BOTID (lib/asistente/config.ts) (botid/client/core) en el componente del
      asistente, que solo se compila con SEDA_FLAG_ASISTENTE_PROPIETARIOS=1. Así,
      con el interruptor apagado, ninguna página carga el script de BotID.
    · `withBotId` en next.config.mjs: las reescrituras del script y del proxy de
      BotID (/149e9513-…), que proxy.ts deja pasar sin next-intl.
    · Aquí, `checkBotId()` con las cabeceras de la petición.

  Si BotID falla (por ejemplo, fuera de Vercel), deja pasar con un console.error:
  los cupos, el origen y el Firewall siguen delante. En desarrollo y en los
  tests (`NODE_ENV` ≠ production) BotID responde «humano» sin llamar a nadie.

  El modo «Deep Analysis» se activa en el panel de Vercel (Firewall → Configure);
  el código no cambia (mismo `checkBotId()` con el nivel por defecto).
*/

export async function esBot(req: Request): Promise<boolean> {
  try {
    const v = await checkBotId({ advancedOptions: { headers: Object.fromEntries(req.headers) } })
    return v.isBot
  } catch (e) {
    console.error("[asistente/bots] BotID no respondió: la petición pasa", e instanceof Error ? e.name : "")
    return false
  }
}
