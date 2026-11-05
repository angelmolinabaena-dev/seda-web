/*
  Teléfono del lead de propietario — UNA sola regla con seda_os (V4-04).

  `normalizarTelefonoE164` es COPIA LITERAL de la de seda_os
  (`lib/crm-propietarios.ts`), que es quien guarda el lead y la que manda: su
  CHECK `leads_propietarios_telefono_chk` exige E.164. Antes seda-web validaba
  con `/^[\d\s+()-]{6,}$/` y aceptaba `07700 900123` (un móvil británico sin
  prefijo) que seda_os rechaza con un 400: el lead se perdía tras un «inténtelo
  en unos minutos».

  La copia está atada por un contrato, no por la buena fe: el fixture
  `tests/fixtures/telefono-e164-contrato.json` está, byte a byte, en los dos
  repos, y cada uno lo pasa por SU función (seda-web
  `tests/telefono-e164-contrato.test.ts`, seda_os
  `tests/telefono-e164-contrato.test.ts`). Si una de las dos copias cambia de
  regla, su test se pone rojo contra el mismo fixture; si alguien cambia el
  fixture en un repo solo, la huella sha256 que fijan los dos tests no casa.

  Este módulo no importa nada: lo usa también el formulario (cliente).
*/

/** La forma que exige el CHECK `leads_propietarios_telefono_chk` de seda_os. */
export const RE_E164 = /^\+[1-9][0-9]{6,14}$/

/**
 * Lleva un teléfono tal y como lo escribe una persona a E.164, o `null` si no se
 * puede sin adivinar. Quita espacios, puntos, guiones y paréntesis; `00` → `+`;
 * un número español de 9 cifras (6, 7, 8 o 9 delante) recibe `+34`. Cualquier
 * otro sin `+` se rechaza: no se inventa el prefijo de otro país.
 */
export function normalizarTelefonoE164(entrada: string): string | null {
  const limpio = entrada.trim().replace(/[\s().-]/g, '')
  let candidato: string
  if (limpio.startsWith('+')) candidato = limpio
  else if (limpio.startsWith('00')) candidato = `+${limpio.slice(2)}`
  else if (/^[6-9][0-9]{8}$/.test(limpio)) candidato = `+34${limpio}`
  else return null
  return RE_E164.test(candidato) ? candidato : null
}
