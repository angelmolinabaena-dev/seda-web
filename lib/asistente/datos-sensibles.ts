/*
  Datos sensibles en el chat — el asistente nunca los pide, y si alguien los
  escribe no deben llegar al modelo ni volver en la respuesta.

  Se sustituyen por MARCA_RETIRADO ANTES de mandar el texto a Anthropic (así el
  modelo no puede repetirlos y el encargado no los recibe) y, por si acaso, otra
  vez en la salida del modelo. Lo que se tapa:

    · IBAN (ES y cualquier otro país: dos letras, dos dígitos y 11–30 caracteres);
    · números de tarjeta (13–19 dígitos, con espacios o guiones, que pasan Luhn);
    · DNI y NIE españoles (8 dígitos + letra; X/Y/Z + 7 dígitos + letra);
    · correos electrónicos y teléfonos (el contacto se deja en el formulario, con
      su consentimiento, no en la conversación);
    · contraseñas y claves escritas como «contraseña: …», «password …», «PIN …».

  Es una red, no una garantía: un dato escrito de forma rara puede pasar. Por eso
  la regla está también en las instrucciones («no lo repita») y la política de
  privacidad pide no escribirlos.
*/

export const MARCA_RETIRADO = "[dato retirado]"

const IBAN = /\b[A-Z]{2}\d{2}(?:[ -]?[A-Z0-9]){11,30}\b/gi
const TARJETA = /\b(?:\d[ -]?){12,18}\d\b/g
const DNI = /\b\d{8}[ -]?[A-HJ-NP-TV-Z]\b/gi
const NIE = /\b[XYZ][ -]?\d{7}[ -]?[A-HJ-NP-TV-Z]\b/gi
const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi
// Teléfono: prefijo opcional y 9 o más dígitos con separadores. Un precio
// («1.290 €») o un año no llegan a 9 dígitos.
const TELEFONO = /(?:\+|00)?\d(?:[ .-]?\d){8,14}\b/g
const CLAVE = /\b(contraseña|password|passwort|mot de passe|pin|clave)\s*[:=]?\s*\S+/gi

function pasaLuhn(digitos: string): boolean {
  let suma = 0
  let doble = false
  for (let i = digitos.length - 1; i >= 0; i--) {
    let d = digitos.charCodeAt(i) - 48
    if (doble) {
      d *= 2
      if (d > 9) d -= 9
    }
    suma += d
    doble = !doble
  }
  return suma % 10 === 0
}

export type Retirada = { texto: string; tipos: string[] }

const soloDigitos = (s: string) => s.replace(/\D/g, "")

/**
 * Tapa los datos sensibles de `texto`. Devuelve el texto y qué tipos se taparon
 * (para métricas, sin el valor). `permitidos`: valores que no se tapan (el
 * contacto público de SEDA en la salida); se comparan sin mayúsculas y, si son
 * teléfonos, solo por los dígitos.
 */
export function retirarDatosSensibles(texto: string, permitidos: readonly string[] = []): Retirada {
  const tipos: string[] = []
  const libres = new Set(permitidos.flatMap((p) => [p.toLowerCase(), soloDigitos(p)]).filter((p) => p.length > 0))
  const tapar = (re: RegExp, tipo: string, valido: (m: string) => boolean = () => true) => (t: string) =>
    t.replace(re, (m) => {
      if (libres.has(m.toLowerCase()) || libres.has(soloDigitos(m))) return m
      if (!valido(m)) return m
      tipos.push(tipo)
      return MARCA_RETIRADO
    })
  let t = texto
  t = tapar(IBAN, "iban", (m) => /\d{6}/.test(m.replace(/[ -]/g, "")))(t)
  t = tapar(TARJETA, "tarjeta", (m) => pasaLuhn(m.replace(/[ -]/g, "")))(t)
  t = tapar(NIE, "nie")(t)
  t = tapar(DNI, "dni")(t)
  t = tapar(EMAIL, "email")(t)
  t = tapar(TELEFONO, "telefono")(t)
  t = tapar(CLAVE, "clave")(t)
  return { texto: t, tipos }
}
