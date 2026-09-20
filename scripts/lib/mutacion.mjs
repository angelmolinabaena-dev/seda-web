/**
 * Mutar es una operación que puede FALLAR EN SILENCIO, y este módulo existe
 * para que no pueda.
 *
 * ── El defecto ───────────────────────────────────────────────────────────────
 * Un control positivo muta un fichero a propósito y exige que el test se ponga
 * rojo. Pero hay dos resultados distintos que hoy se leen exactamente igual
 * —verde— y significan cosas opuestas:
 *
 *   · «apliqué la mutación y el test siguió en verde»  → el test NO SIRVE.
 *   · «no llegué a aplicar la mutación»                → NO SE HA PROBADO NADA.
 *
 * El segundo es el peligroso, porque se lee como éxito. Ha ocurrido tres veces
 * en dos días, siempre por lo mismo: el ancla se escribe con `\n` y el fichero
 * del working tree está en CRLF (`core.autocrlf=true` deja 1.458 de los 1.704
 * ficheros versionados en `w/crlf`), así que la sustitución no casa, el texto
 * sale intacto y el checker —correctamente— no encuentra nada que denunciar.
 *
 *   1. guest-app #311 — siete de veinte tests del comparador de contratos en
 *      rojo sólo en Windows: el fixture se materializaba en CRLF y el
 *      `replace()` anclado en `\n` no reintroducía la deriva.
 *   2. Este repo, `.gitattributes` — el shebang CRLF rompía el import y el
 *      fichero de test entero contaba 0 tests. (Ver §«Lo que NO cubre».)
 *   3. Este repo, PR #610 — el baseline es CRLF, el regex de la mutación asumía
 *      LF, la mutación nunca se aplicó y todo siguió en verde. La sesión lo
 *      describió con la frase exacta: «indistinguible de que el test no
 *      detecta». Repetido con `\r?\n`, cayeron cuatro tests.
 *
 * ── Lo que hace este módulo ──────────────────────────────────────────────────
 * `mutar()` normaliza el fichero a LF antes de tocarlo, así que un ancla escrita
 * con `\n` casa siempre, venga el fichero de donde venga. Y sobre todo: exige
 * que la sustitución haya ocurrido de verdad —ancla presente y texto distinto—
 * y si no, LANZA. Una mutación que no se aplica pasa de leerse como verde a
 * detener el test con un mensaje que dice que no se aplicó.
 *
 * Eso mata la clase entera, no sólo el síntoma CRLF: un ancla que dejó de casar
 * porque alguien renombró la función, una ruta que cambió o un regex mal
 * escapado producen el mismo rojo con el mismo nombre.
 *
 * ── Lo que NO cubre ──────────────────────────────────────────────────────────
 * Que el arnés entero no llegue a correr (incidente 2). Eso no lo puede ver una
 * función a la que nadie llama. Hoy lo cubre Vitest: medido en 4.1.7, un
 * fichero que revienta al importar sale `FAIL … SyntaxError`, y uno sin ningún
 * `describe` sale `Error: No test suite found in file`. Los dos son rojos, no
 * verdes. La premisa de `.gitattributes` —«el fichero cuenta 0 tests y se lee
 * como verde»— era cierta con la versión de entonces y ya no lo es con ésta.
 */

/** Traduce CRLF a LF. Idempotente. */
export function normalizarALf(texto) {
  return texto.replace(/\r\n/g, '\n')
}

/**
 * Una mutación que no llegó a aplicarse. Se distingue a propósito de un fallo
 * de aserción: no dice «el código está mal», dice «no se ha probado nada».
 */
export class MutacionNoAplicada extends Error {
  constructor(mensaje) {
    super(mensaje)
    this.name = 'MutacionNoAplicada'
  }
}

const PISTA =
  'Una mutación que no se aplica deja la suite en verde y se lee igual que una ' +
  'mutación sobrevivida. Este error existe para que no se pueda confundir.'

/**
 * Aplica una sustitución textual y GARANTIZA que ocurrió.
 *
 * @param {string} fuente     Contenido leído del árbol (CRLF o LF, da igual).
 * @param {object} opciones
 * @param {string|RegExp} opciones.de   Ancla a buscar. Con `\n`: se normaliza.
 * @param {string} opciones.a           Con qué se sustituye.
 * @param {string} opciones.objetivo    Nombre legible, para el mensaje de error.
 * @returns {string} El texto mutado, en LF.
 * @throws {MutacionNoAplicada} Si el ancla no aparece o el texto no cambió.
 */
export function mutar(fuente, { de, a, objetivo }) {
  if (typeof fuente !== 'string' || fuente.length === 0) {
    throw new MutacionNoAplicada(
      `MUTACIÓN NO APLICADA — ${objetivo}: la fuente está vacía o no es texto. ${PISTA}`,
    )
  }
  // El fichero se normaliza ANTES de buscar. Es lo que hace que un ancla con
  // `\n` case en un working tree CRLF: los tres incidentes de arriba.
  const base = normalizarALf(fuente)

  if (de instanceof RegExp) {
    if (!de.test(base)) {
      throw new MutacionNoAplicada(
        `MUTACIÓN NO APLICADA — ${objetivo}: el patrón ${de} no casa en el fichero. ${PISTA}`,
      )
    }
    // `test()` con /g avanza `lastIndex`; se rebobina para que el replace no
    // empiece a mitad y sustituya menos de lo que se acaba de comprobar.
    de.lastIndex = 0
    const texto = base.replace(de, a)
    return comprobarQueCambio(base, texto, objetivo, String(de))
  }

  const ancla = normalizarALf(de)
  if (!base.includes(ancla)) {
    throw new MutacionNoAplicada(
      `MUTACIÓN NO APLICADA — ${objetivo}: el ancla no aparece en el fichero.\n` +
        `  buscaba: ${JSON.stringify(recortar(ancla))}\n  ${PISTA}`,
    )
  }
  const texto = base.replace(ancla, normalizarALf(a))
  return comprobarQueCambio(base, texto, objetivo, recortar(ancla))
}

/**
 * La segunda mitad de la garantía. El ancla puede aparecer y aun así el texto
 * quedar idéntico —sustituir algo por sí mismo—, y eso también es no haber
 * probado nada.
 */
function comprobarQueCambio(base, texto, objetivo, quien) {
  if (texto === base) {
    throw new MutacionNoAplicada(
      `MUTACIÓN NO APLICADA — ${objetivo}: el ancla casa pero el texto no cambió ` +
        `(se sustituyó por sí mismo). ancla: ${quien}. ${PISTA}`,
    )
  }
  return texto
}

function recortar(s) {
  const una = s.replace(/\n/g, '\\n')
  return una.length > 120 ? `${una.slice(0, 120)}…` : una
}
