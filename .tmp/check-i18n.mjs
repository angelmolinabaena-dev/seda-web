/**
 * Paridad de claves entre los 4 idiomas del repo (es/en/fr/de — no hay `it` aquí).
 *
 * Antes solo comparaba es↔en, de modo que una clave presente en es y en pero
 * ausente en fr o de pasaba desapercibida. Ahora `es` es la referencia y cada
 * idioma se contrasta contra ella en ambas direcciones.
 *
 * Sale con código 1 si hay divergencia, para poder encadenarlo en CI.
 */
import es from "../messages/es.json" with { type: "json" }
import en from "../messages/en.json" with { type: "json" }
import fr from "../messages/fr.json" with { type: "json" }
import de from "../messages/de.json" with { type: "json" }

const REFERENCE = "es"
const LOCALES = { es, en, fr, de }

function flat(o, p = "") {
  return Object.entries(o).flatMap(([k, v]) =>
    v && typeof v === "object" && !Array.isArray(v) ? flat(v, p + k + ".") : [p + k]
  )
}

const keys = Object.fromEntries(
  Object.entries(LOCALES).map(([loc, msgs]) => [loc, new Set(flat(msgs))])
)

const ref = keys[REFERENCE]
console.log(
  Object.entries(keys)
    .map(([loc, k]) => `${loc}=${k.size}`)
    .join(" ")
)

let failed = false
for (const loc of Object.keys(LOCALES)) {
  if (loc === REFERENCE) continue
  const missing = [...ref].filter((k) => !keys[loc].has(k))
  const extra = [...keys[loc]].filter((k) => !ref.has(k))
  if (missing.length === 0 && extra.length === 0) {
    console.log(`✓ ${loc}: paridad con ${REFERENCE}`)
    continue
  }
  failed = true
  if (missing.length) console.log(`✗ ${loc}: faltan ${missing.length} →`, missing)
  if (extra.length) console.log(`✗ ${loc}: sobran ${extra.length} →`, extra)
}

if (failed) {
  console.error("\nParidad i18n rota.")
  process.exit(1)
}
console.log("\nParidad i18n correcta en los 4 idiomas.")
