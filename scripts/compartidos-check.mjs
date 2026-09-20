#!/usr/bin/env node
/**
 * ¿Sigue este repo diciendo lo que se acordó que los repos dicen igual?
 *
 * `compartidos.lock.json` declara cuatro cosas que deben ser idénticas entre
 * los repos, con su huella y el universo de repos donde vive cada una (por
 * qué, una línea cada una, en el propio lock). Este script compara ESTE repo
 * contra esa huella, sin ver a los hermanos: funciona con un solo checkout,
 * igual que `checkLock` de invariants-check.mjs.
 *
 * LOS CUATRO SE RECALCULAN. Antes cada elemento llevaba `comprobacion`
 * («extractor» o «declarada») y tres de cuatro eran «declarada»: huella escrita,
 * nadie la recalculaba. No era una limitación técnica —las cuatro funciones
 * `texto(dir)` existían y funcionaban—, era un `else` que no las llamaba, y el
 * CI de seda_os estuvo verde sobre un `health-check.mjs` que guest-app ya no
 * decía igual. Un vocabulario con un solo valor es ruido: el concepto se fue
 * con la rama.
 *
 * UNIVERSO POR ELEMENTO. Cada elemento dice en qué repos debe existir
 * (`repos`). El check de un repo comprueba solo los suyos; un elemento cuyo
 * universo incluye este repo y que no está en disco es ROJO, con mensaje —nunca
 * un `null` silencioso—. `health-check.mjs` no existe en seda-web y no tiene por
 * qué: no publica `/api/health`.
 *
 * QUÉ SE HASHEA. Lo que tiene que coincidir, no el fichero:
 *   · la tabla PATTERNS de keys-check-leak.mjs (233 y 73 líneas con los mismos
 *     diecisiete patrones): la lista de pares `nombre + regex`, sin comentarios
 *     ni espacios;
 *   · el CÓDIGO de health-check.mjs, sin comentarios: qué ruta pega, qué
 *     variable lee, cuándo da 1 y cuándo 2. El comentario de cabecera NO puede
 *     ser igual nunca —cada repo nombra su propio dominio—, y hashear el fichero
 *     entero daría rojo perpetuo por una diferencia legítima.
 * Ver `docs/GUARDARRAILES.md` (§«compartidos.lock.json») para la medida que
 * decidió el extractor de health en vez de sacarlo del lock.
 *
 * EL PRECIO, dicho entero (el mismo que invariants-check.mjs): la huella no
 * cierra el agujero, lo estrecha. Quien cambie el elemento Y regenere el lock en
 * un solo repo se queda verde, y el otro sigue verde hasta que alguien copie el
 * fichero. Lo que se gana: que sincronizar sea «copiar un fichero de 1 KB» y no
 * «reconciliar código en dos sitios», y que quien toque el elemento SIN
 * regenerar —el caso frecuente— se ponga rojo en su propio CI en el acto. Lo
 * único que compara repos de verdad es el barrido programado
 * (`docs/pendiente-instalar/paridad-locks.yml`, pendiente de instalar).
 *
 * Uso: node scripts/compartidos-check.mjs                    # comprueba
 *      node scripts/compartidos-check.mjs --repo=guest-app   # si el directorio no se llama como el repo
 *      node scripts/compartidos-check.mjs --lock             # regenera las huellas
 */
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SIBLING_REPOS } from './invariants-check.mjs'

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
export const LOCK_PATH = 'compartidos.lock.json'

/** Los repos que comparten cosas. Se teclea UNA vez, en invariants-check.mjs. */
export const UNIVERSO = SIBLING_REPOS

export function huellaDeTexto(texto) {
  return createHash('sha256').update(texto, 'utf8').digest('hex').slice(0, 16)
}

/** Fin de línea y espacios finales fuera: un checkout CRLF no debe cambiar la huella. */
function normalizar(texto) {
  return texto.replace(/\r\n?/g, '\n').split('\n').map((l) => l.trimEnd()).join('\n').trim()
}

/**
 * Pares `nombre => regex` de la tabla `PATTERNS` de un keys-check-leak.mjs.
 * Lee cada entrada `{ name: '…', re: /…/ }` de su línea; una entrada que no
 * case con esa forma NO se ignora en silencio: la tabla no se puede leer y
 * eso revienta.
 */
export function extraerPatrones(fuente) {
  const texto = fuente.replace(/\r\n?/g, '\n')
  const ini = texto.search(/\bconst PATTERNS\s*=\s*\[/)
  if (ini < 0) throw new Error('no hay `const PATTERNS = [` en el fichero')
  const cuerpo = texto.slice(ini).split('\n').slice(1)
  const fin = cuerpo.findIndex((l) => /^\]/.test(l))
  if (fin < 0) throw new Error('la tabla PATTERNS no cierra con `]` en columna 0')
  const pares = []
  for (const linea of cuerpo.slice(0, fin)) {
    const t = linea.trim()
    if (t === '' || t.startsWith('//')) continue
    const m = t.match(/^\{\s*name:\s*'([^']+)',\s*re:\s*(\/.+\/)\s*\},?$/)
    if (!m) throw new Error(`entrada de PATTERNS ilegible: ${t.slice(0, 80)}`)
    pares.push(`${m[1]}\t${m[2]}`)
  }
  if (pares.length === 0) throw new Error('la tabla PATTERNS está vacía')
  return pares
}

/**
 * El CÓDIGO de un health-check.mjs, sin comentarios: lo que de verdad tiene que
 * coincidir entre repos (ruta, variable de entorno, códigos de salida). Quita
 * los comentarios de línea completa y los bloques de comentario que empiezan al
 * principio de línea; NO toca un `//` dentro de una cadena (`http://localhost`).
 * Si el fichero no habla de `/api/health`, de `HEALTH_BASE_URL` o de
 * `process.exit(`, revienta: un extractor que hashea «nada» no protege nada.
 */
export function extraerContratoHealth(fuente) {
  const codigo = fuente
    .replace(/\r\n?/g, '\n')
    .replace(/^[ \t]*\/\*[\s\S]*?\*\//gm, '')
    .split('\n')
    .map((l) => l.trimEnd())
    .filter((l) => l.trim() !== '' && !l.trim().startsWith('//'))
  const texto = codigo.join('\n')
  for (const pieza of ['/api/health', 'HEALTH_BASE_URL', 'process.exit(']) {
    if (!texto.includes(pieza)) throw new Error(`el contrato de health no menciona \`${pieza}\``)
  }
  return codigo
}

/** Lo que el universo exige y no está: distinto de lo que está y no se deja leer. */
class Ausencia extends Error {}

const leer = (dir, ruta) => {
  const p = join(dir, ruta)
  if (!existsSync(p)) throw new Ausencia(`falta el fichero ${ruta}`)
  return readFileSync(p, 'utf8')
}

/** Los cuatro elementos: dónde deben existir y cómo se obtiene el texto que se hashea. */
export const ELEMENTOS = {
  'tabla PATTERNS de keys-check-leak': {
    repos: UNIVERSO,
    porQue: 'Qué secretos caza el escáner de fugas: si un repo aprende una clave que el otro no, uno queda ciego en silencio (guest-app tuvo 9 patrones contra 17 hasta el #373, 19-sep-2026). Medido el 20-sep-2026: los diecisiete pares nombre+regex son idénticos en los tres repos.',
    texto: (dir) => extraerPatrones(leer(dir, 'scripts/keys-check-leak.mjs')).join('\n'),
  },
  'scripts/health-check.mjs': {
    repos: UNIVERSO.filter((r) => r !== 'seda-web'),
    porQue: 'Es el mismo humo contra /api/health en seda_os y guest-app. Se hashea el código sin comentarios (17 líneas: ruta, variable, códigos de salida 1 y 2), no el fichero: la cabecera difiere a propósito —cada repo nombra su dominio, y la de guest-app documenta salud-produccion.yml—. Medido el 20-sep-2026: ficheros de 25 y de 27 líneas, código idéntico. seda-web no lo tiene ni lo necesita: no publica /api/health.',
    texto: (dir) => extraerContratoHealth(leer(dir, 'scripts/health-check.mjs')).join('\n'),
  },
  'invariantes.lock.json': {
    repos: UNIVERSO,
    porQue: 'Es la huella de los invariantes de CLAUDE.md y solo sirve si es byte a byte la misma en todos. Medido el 20-sep-2026: idéntica en los tres (guest-app#376 y seda-web#59, del 19-sep-2026, la portaron).',
    texto: (dir) => normalizar(leer(dir, 'invariantes.lock.json')),
  },
  '.gitattributes: scripts/*.mjs text eol=lf': {
    repos: UNIVERSO,
    porQue: 'Un shebang con CRLF rompe el import de un script bajo vitest en Windows (costó guest-app#374). Medido el 20-sep-2026: la línea está en los tres; seda-web no la tuvo hasta seda-web#61 (20-sep-2026), con su CI ya importando invariants-check.mjs.',
    texto: (dir) => {
      const linea = 'scripts/*.mjs text eol=lf'
      if (!normalizar(leer(dir, '.gitattributes')).split('\n').includes(linea)) {
        throw new Ausencia(`falta la línea \`${linea}\` en .gitattributes`)
      }
      return linea
    },
  },
}

export function leerLock(dir = REPO_ROOT) {
  const p = join(dir, LOCK_PATH)
  return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null
}

/** Huella de un elemento en el disco. Revienta con el motivo si no se puede leer: nunca `null`. */
export function huellaDe(nombre, dir = REPO_ROOT) {
  return huellaDeTexto(ELEMENTOS[nombre].texto(dir))
}

/**
 * Compara el repo con el lock. Solo se miran los elementos cuyo universo
 * incluye `repo`; de esos, todos se recalculan.
 */
export function checkCompartidos(dir = REPO_ROOT, repo = basename(dir)) {
  const vacio = { comprueba: [], difieren: [], ausentes: [], ilegibles: [], sinLock: [], muertos: [] }
  if (!UNIVERSO.includes(repo)) return { ok: false, ausente: false, repoDesconocido: true, repo, ...vacio }
  const lock = leerLock(dir)
  if (!lock) return { ok: false, ausente: true, repoDesconocido: false, repo, ...vacio }
  const items = lock.compartidos ?? {}
  const comprueba = []
  const difieren = []
  const ausentes = []
  const ilegibles = []
  const sinLock = []
  for (const [nombre, el] of Object.entries(ELEMENTOS)) {
    if (!el.repos.includes(repo)) continue
    const def = items[nombre]
    if (!def) { sinLock.push(nombre); continue }
    // Un lock que promete otro universo que el del código es un lock que miente.
    if (JSON.stringify(def.repos) !== JSON.stringify(el.repos)) {
      difieren.push({ nombre, lock: `repos=${JSON.stringify(def.repos)}`, disco: `repos=${JSON.stringify(el.repos)}` })
      continue
    }
    comprueba.push(nombre)
    let disco
    try {
      disco = huellaDe(nombre, dir)
    } catch (e) {
      const motivo = e instanceof Error ? e.message : String(e)
      ;(e instanceof Ausencia ? ausentes : ilegibles).push({ nombre, motivo, porQue: el.porQue })
      continue
    }
    if (disco !== def.huella) difieren.push({ nombre, lock: def.huella, disco })
  }
  const muertos = Object.keys(items).filter((n) => !ELEMENTOS[n])
  const ok = difieren.length + ausentes.length + ilegibles.length + sinLock.length + muertos.length === 0
  return { ok, ausente: false, repoDesconocido: false, repo, comprueba, difieren, ausentes, ilegibles, sinLock, muertos }
}

export function escribirLock(dir = REPO_ROOT) {
  const compartidos = {}
  for (const [nombre, el] of Object.entries(ELEMENTOS)) {
    compartidos[nombre] = { porQue: el.porQue, repos: el.repos, huella: huellaDe(nombre, dir) }
  }
  const lock = {
    _comentario: [
      'Lo que seda_os, guest-app y seda-web deben decir IGUAL, con su huella (sha256, 16 hex) y los repos donde vive cada cosa.',
      'Se regenera con `node scripts/compartidos-check.mjs --lock`; no se edita a mano.',
      'El check recalcula TODO lo que declara, solo para los elementos cuyo universo incluye el repo; lo que no se pudiera recalcular no entra.',
      'Este fichero debe ser byte a byte el mismo en los tres repos: el barrido programado lo compara.',
      'NO entran, a proposito: los guardarrailes que solo tiene un repo (23 solo en seda_os,',
      '2 solo en guest-app). Son propios, no un olvido.',
    ],
    compartidos,
  }
  writeFileSync(join(dir, LOCK_PATH), JSON.stringify(lock, null, 2) + '\n')
  return lock
}

function main() {
  if (process.argv.includes('--lock')) {
    escribirLock()
    console.log(`✓ ${LOCK_PATH} regenerado.`)
    return
  }
  const flag = process.argv.find((a) => a.startsWith('--repo='))
  const r = checkCompartidos(REPO_ROOT, flag ? flag.slice('--repo='.length) : basename(REPO_ROOT))
  if (r.repoDesconocido) {
    console.error(`✗ No sé qué repo es «${r.repo}»: no está en ${UNIVERSO.join(', ')}. Pásalo con --repo=<nombre>.`)
    process.exit(1)
  }
  if (r.ausente) {
    console.error(`✗ Falta ${LOCK_PATH}. Regénéralo: node scripts/compartidos-check.mjs --lock`)
    process.exit(1)
  }
  console.log(`Repo ${r.repo}. Recalcula (${r.comprueba.length}): ${r.comprueba.join('; ') || '—'}`)
  if (!r.ok) {
    for (const a of r.ausentes) console.error(`✗ ${a.nombre}\n    AUSENTE en ${r.repo}, donde debe estar: ${a.motivo}.\n    Por qué debe estar: ${a.porQue}`)
    for (const a of r.ilegibles) console.error(`✗ ${a.nombre}\n    ILEGIBLE en ${r.repo}: ${a.motivo}.\n    Por qué se mira: ${a.porQue}`)
    for (const d of r.difieren) console.error(`✗ ${d.nombre}\n    lock ${d.lock}  ≠  disco ${d.disco}`)
    for (const n of r.sinLock) console.error(`✗ ${n}\n    en el código y en el universo de ${r.repo}, pero no en el lock`)
    for (const n of r.muertos) console.error(`✗ ${n}\n    en el lock pero ya no en el código`)
    console.error('')
    console.error('Si el cambio es DELIBERADO, aplícalo también a los otros repos, regenera con')
    console.error('`node scripts/compartidos-check.mjs --lock` y copia el lock. Si no, has')
    console.error('divergido de los otros repos: revierte.')
    process.exit(1)
  }
  console.log('✓ lo comprobado coincide con la huella acordada.')
}

if (process.argv[1] && fileURLToPath(import.meta.url) === join(process.argv[1])) main()
