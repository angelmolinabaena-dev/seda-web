#!/usr/bin/env node
/**
 * Greps the source tree for accidental hard-coded secrets that look
 * like Supabase keys (legacy JWT and `sb_secret_`), Stripe keys (live and
 * test), Resend, Sentry, GitHub, Meta, AWS, OpenAI or Anthropic tokens, or
 * a PEM private key.
 *
 * Heuristic-only — false positives are possible. Designed as a
 * pre-commit / pre-deploy gate, NOT a substitute for `gitleaks` or
 * `trufflehog` (run those in CI for full audits).
 *
 * Procedencia: portado el 19-sep-2026 desde guest-app/scripts/keys-check-leak.mjs
 * (17 patrones, lista ampliada de extensiones); desde el 1-oct-2026 revisa lo
 * que git puede subir (ver «Qué se revisa»), como guest-app#430.
 *
 * Procedencia de la lista (leer antes de añadir un patrón):
 *
 *   · Los ocho últimos de PATTERNS —Resend, `sb_secret_`, Stripe de prueba,
 *     los dos de Sentry, los dos de GitHub moderno y la clave PEM— se
 *     portaron el 19-sep-2026 desde seda_os/scripts/keys-check-leak.mjs. Allí
 *     entraron el 16-sep-2026 (B-9, #728); aquí llegaron tres días después.
 *   · Los dos ficheros se mantienen a mano y NADA avisa cuando uno se
 *     adelanta al otro. Quien añada el patrón dieciocho en uno tiene que
 *     abrir el otro y comprobar si ya lo tiene.
 *   · Se portan con su forma y su nombre, no se reescriben: una regex de
 *     credencial escrita aquí a ojo parece cobertura y no lo es. La laxa
 *     `re_[A-Za-z0-9_]{20,}` casa con las columnas `pre_arrival_welcome_sent_at`
 *     y `pre_checkout_reminder_sent_at` (16 ficheros versionados, medido el
 *     19-sep-2026), y ninguno es una llave.
 */
import { spawnSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { join, dirname, extname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const STAGED = process.argv.includes('--staged')

// ── Qué se revisa: solo lo que git puede subir ─────────────────────────────
// Hasta el 1-oct-2026 recorría el disco entero con una lista de carpetas y de
// `.env*.local` saltados a mano. Ahora la lista la da git y respeta
// `.gitignore`, así que no hace falta saltarse nada por nombre:
//
//   · `--staged` (lo pasa `.githooks/pre-commit`): los ficheros en stage, con
//     el contenido DEL STAGE, no el del disco. Un ignorado forzado con
//     `git add -f` está en stage y se revisa. Aquí además bloquea el NOMBRE:
//     `.env`, `.env.*` (salvo `.env.example`), `*.pem` y `*.key` en stage
//     paran el commit aunque dentro no case ningún patrón.
//   · sin flag (CI y `npm run keys:check-leak`): trackeados más no ignorados
//     (`git ls-files --cached --others --exclude-standard`), leídos del disco.
//
// `.env.example` SE VERSIONA en este repo: se lee como cualquier otro fichero,
// que es justo donde una clave real se cuela por descuido.
const ENV_PERMITIDO = '.env.example'
const ES_ENV = /^\.env(?:\.|$)/

/** ¿Bloquea este nombre por sí solo, sin leer nada? Solo se aplica en stage. */
function nombreProhibido(ruta) {
  const nombre = basename(ruta)
  if (ES_ENV.test(nombre)) return nombre !== ENV_PERMITIDO
  return /\.(?:pem|key)$/i.test(nombre)
}

// ── Qué ficheros se leen ────────────────────────────────────────────────────
// Antes, `ts tsx js jsx mjs cjs json md sql yml yaml html` y nada más: el
// escáner llevaba un patrón «Private key (PEM)» y no abría un `.pem`, ni un
// `.toml`, ni los hooks de `.githooks/` (sin extensión). Se portó el detector y
// no el alcance. Lista portada de seda_os/scripts/keys-check-leak.mjs
// (`EXTENSIONES`, `seLee`, y el criterio de `.env*`, arriba). Se cierra
// una diferencia, no se abre otra: no hay aquí ninguna extensión que allí no
// esté.
//
// El criterio de allí es «texto donde una persona pega un valor a mano»:
//   · notas, exportaciones y correo: txt csv tsv eml
//   · scripts: sh bash ps1 psm1 bat cmd
//   · configuración: env ini cfg conf toml
//   · material de clave: pem key
//   · plantillas: example sample template
//   · lo que no tiene extensión: `.npmrc`, `.netrc`, hooks, un `Dockerfile`.
// Fuera, a propósito: binarios, css y svg, log.
const EXTENSIONES =
  /\.(?:tsx?|jsx?|mjs|cjs|json|md|sql|ya?ml|html|txt|csv|tsv|eml|sh|bash|ps1|psm1|bat|cmd|env|ini|cfg|conf|toml|pem|key|example|sample|template)$/i

/** ¿Se lee este fichero? Decide sólo por el nombre, antes de abrirlo. */
function seLee(nombre) {
  return extname(nombre) === '' || EXTENSIONES.test(nombre)
}

const PATTERNS = [
  { name: 'Supabase service_role JWT', re: /eyJhbGciOiJIUzI1[A-Za-z0-9_\-\.]{40,}/ },
  { name: 'Stripe live secret key',    re: /sk_live_[A-Za-z0-9]{20,}/ },
  { name: 'Stripe live restricted key',re: /rk_live_[A-Za-z0-9]{20,}/ },
  { name: 'Stripe webhook secret',     re: /whsec_[A-Za-z0-9]{20,}/ },
  { name: 'Meta WhatsApp token',       re: /EAAB[A-Za-z0-9]{50,}/ },
  { name: 'AWS access key id',         re: /AKIA[0-9A-Z]{16}/ },
  { name: 'GitHub personal token',     re: /ghp_[A-Za-z0-9]{30,}/ },
  { name: 'OpenAI key',                re: /sk-[A-Za-z0-9]{32,}/ },
  { name: 'Anthropic key',             re: /sk-ant-[A-Za-z0-9_\-]{30,}/ },

  // ── Los ocho portados desde seda_os (ver la cabecera) ──────────────────────
  // Resend: `re_` + tramo + `_` + tramo. El guion bajo interior es obligatorio:
  // los ids de reembolso de Stripe también empiezan por `re_` (`re_3P…`), pero
  // son de un solo tramo y no son un secreto. El `\b` inicial impide casar
  // dentro de un identificador (`pre_…`).
  { name: 'Resend API key',            re: /\bre_[A-Za-z0-9]{6,}_[A-Za-z0-9]{16,}\b/ },
  // Formato nuevo de Supabase, que sustituye a `service_role`. Sin este
  // patrón, rotar las claves a este formato dejaba ciego al escáner: el JWT de
  // arriba era el único que cubría la clave más peligrosa del sistema. Forma
  // medida en seda_os sobre la clave local de `supabase status`: 22 caracteres
  // base64url + `_` + 8, o sea 31. El umbral de 32+ que proponen otros
  // escáneres NO la caza; por eso 20+. Esa clave local no es un secreto y
  // también casa: si algún día hay que versionarla, que se monte en tiempo de
  // ejecución.
  { name: 'Supabase secret key',       re: /sb_secret_[A-Za-z0-9_-]{20,}/ },
  // Stripe de PRUEBA. Un `sk_test_` commiteado sigue siendo una fuga de la
  // cuenta de pruebas. Con 20+ no casan los marcadores cortos o con guiones
  // bajos, que cortan el tramo.
  { name: 'Stripe test key',           re: /(?:sk|rk)_test_[A-Za-z0-9]{20,}/ },
  // `SENTRY_AUTH_TOKEN`, en sus dos clases: `sntrys_` (de organización) y
  // `sntryu_` (de usuario). Forma de gitleaks (reglas sentry-org-token y
  // sentry-user-token), simplificada: el de organización es un JSON en base64
  // (`eyJ…`) + `_` + 43. Exigir ese último tramo deja fuera los fixtures que
  // imitan el principio del token y no el final.
  { name: 'Sentry org auth token',     re: /sntrys_eyJ[A-Za-z0-9+/]{20,}={0,2}_[A-Za-z0-9+/]{43}/ },
  { name: 'Sentry user auth token',    re: /sntryu_[a-f0-9]{64}/ },
  // Los tokens modernos de GitHub (gitleaks: github-fine-grained-pat,
  // github-oauth, github-app-token, github-refresh-token). El `ghp_` clásico
  // es el de arriba.
  { name: 'GitHub fine-grained token', re: /github_pat_[A-Za-z0-9_]{82}/ },
  { name: 'GitHub OAuth/app token',    re: /gh[ousr]_[A-Za-z0-9]{36}/ },
  // Clave privada PEM. Se exige material en base64 tras la cabecera —con salto
  // de línea real o con `\n` escapado, que es como viaja dentro de un JSON o de
  // una variable de entorno—, porque la cabecera sola aparece en la
  // documentación que DESCRIBE el formato, y eso no es una fuga.
  { name: 'Private key (PEM)',         re: /-----BEGIN[ A-Z0-9_-]{0,100}PRIVATE KEY-----(?:\\[rn]|\s)+[A-Za-z0-9+/]{40,}/ },
]

/** Ejecuta git en la raíz del repo y devuelve stdout en bruto. Si falla, el escáner no da verde. */
function git(args, input) {
  const r = spawnSync('git', args, {
    cwd: root,
    input,
    maxBuffer: 1 << 30,
    env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' },
  })
  if (r.status !== 0) {
    console.error(`✗ keys-check-leak: \`git ${args.join(' ')}\` falló: ${String(r.stderr).trim()}`)
    process.exit(2)
  }
  return r.stdout
}

const separarNul = (buf) => buf.toString('utf8').split('\0').filter(Boolean)

/**
 * Los ficheros en stage, con el contenido del stage. `--no-renames` convierte
 * un renombrado en alta + baja; las bajas no suben nada. Los submódulos (modo
 * 160000) no tienen blob que leer.
 */
function enStage() {
  const campos = separarNul(git(['diff', '--cached', '--raw', '-z', '--no-abbrev', '--no-renames', '--diff-filter=ACMT']))
  const entradas = []
  for (let i = 0; i + 1 < campos.length; i += 2) {
    const [, modo, , sha] = campos[i].split(' ')
    if (modo === '160000') continue
    entradas.push({ ruta: campos[i + 1], sha })
  }
  if (entradas.length === 0) return []

  // Un solo `git cat-file --batch`: cabecera `<sha> blob <tamaño>`, contenido y salto de línea.
  const salida = git(['cat-file', '--batch'], entradas.map((e) => e.sha).join('\n') + '\n')
  let pos = 0
  for (const e of entradas) {
    const fin = salida.indexOf(0x0a, pos)
    const tamano = Number(salida.subarray(pos, fin).toString('utf8').split(' ')[2])
    e.leer = async () => salida.subarray(fin + 1, fin + 1 + tamano).toString('utf8')
    pos = fin + 1 + tamano + 1
  }
  return entradas
}

/** Trackeados + no ignorados, leídos del disco. */
function subibles() {
  const rutas = new Set(separarNul(git(['ls-files', '-z', '--cached', '--others', '--exclude-standard'])))
  return [...rutas].map((ruta) => ({
    ruta,
    // Un trackeado borrado del disco sigue en `--cached`: no hay nada que leer.
    leer: () => readFile(join(root, ruta), 'utf8').catch(() => ''),
  }))
}

const lineaDe = (txt, indice) => txt.slice(0, indice).split('\n').length

let hits = 0
let scanned = 0

for (const f of STAGED ? enStage() : subibles()) {
  if (STAGED && nombreProhibido(f.ruta)) {
    hits++
    console.error(`  ❌ [Fichero de secretos en stage] ${f.ruta}`)
    continue
  }
  if (!seLee(basename(f.ruta))) continue
  scanned++
  const txt = await f.leer()
  for (const p of PATTERNS) {
    const m = p.re.exec(txt)
    if (m) {
      hits++
      // Patrón, fichero y línea. Nunca el valor, ni siquiera su principio.
      console.error(`  ❌ [${p.name}] ${f.ruta}:${lineaDe(txt, m.index)}`)
    }
  }
}

console.log(`
Scanned ${scanned} files. ${hits === 0 ? '✅ No leaks detected' : `❌ ${hits} suspicious match(es)`}`)
process.exit(hits === 0 ? 0 : 1)
