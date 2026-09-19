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
 * (17 patrones, lista ampliada de extensiones); sólo cambia el tratamiento de
 * los `.env*` (ver más abajo) y SKIP_DIRS.
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
import { readdir, readFile, stat } from 'node:fs/promises'
import { join, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const SKIP_DIRS = new Set([
  'node_modules', '.next', '.vercel', '.git', 'coverage', 'dist', 'build',
  // Visual reference folders — contain Stitch / Claude design exports
  // that ship with example tokens (Meta WhatsApp marketing snippets,
  // placeholder Supabase URLs, etc.). They are git-ignored already;
  // skipping them here prevents the heuristic from flagging legitimate
  // reference HTML that the developer keeps locally as design-only
  // material.
  '.stitch-ref',
  // Copias de trabajo y sesiones locales de Claude Code: gitignored (`.claude/`,
  // `.worktrees/`) y duplican el árbol entero, así que no añaden cobertura.
  '.claude', '.worktrees',
])

// ── Los `.env*`: se saltan sólo los que el `.gitignore` ignora ─────────────
// Criterio elegido: el de seda_os/scripts/keys-check-leak.mjs (leer todo salvo
// lo ignorado), NO el de guest-app (saltarse todos los `.env*`). Se mira el
// `.gitignore` de ESTE repo, que dice `.env*.local` y nada más (línea 11), y
// `.env.example` está versionado (`git ls-files`). O sea:
//
//   · `.env.local`, `.env.production.local`, etc. (todo `.env*.local`) no
//     pueden llegar a un commit sin `git add -f`: se saltan, como allí. Leerlos
//     rompería el pre-commit en cualquier máquina con claves reales locales y
//     al fallar imprimiría el arranque de una credencial real.
//   · `.env.example` SÍ se versiona, así que es justo donde una clave real se
//     cuela por descuido: se lee. Copiar el criterio de guest-app (`.env*`
//     entero ignorado) dejaría ese fichero sin mirar.
//   · `.env` a secas NO está ignorado aquí (`.env*.local` no lo casa), así que
//     también se lee. Difiere de seda_os, cuyo `.gitignore` sí lo ignora.
//
// La regla de abajo reproduce el glob `.env*.local` de aquel `.gitignore`. Si
// alguien ignora más nombres `.env*`, hay que ampliarla a la vez.
const ES_ENV_IGNORADO = /^\.env.*\.local$/

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
  if (ES_ENV_IGNORADO.test(nombre)) return false
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

let hits = 0
let scanned = 0

async function walk(dir) {
  const entries = await readdir(dir)
  for (const name of entries) {
    if (SKIP_DIRS.has(name)) continue
    const full = join(dir, name)
    const st = await stat(full)
    if (st.isDirectory()) {
      await walk(full)
      continue
    }
    if (!seLee(name)) continue
    scanned++
    const txt = await readFile(full, 'utf8').catch(() => '')
    for (const p of PATTERNS) {
      const m = txt.match(p.re)
      if (m) {
        hits++
        console.error(`  ❌ [${p.name}] ${full.slice(root.length + 1)}: ${m[0].slice(0, 12)}…`)
      }
    }
  }
}

await walk(root)

console.log(`\nScanned ${scanned} files. ${hits === 0 ? '✅ No leaks detected' : `❌ ${hits} suspicious match(es)`}`)
process.exit(hits === 0 ? 0 : 1)
