import { afterEach, describe, expect, it } from 'vitest'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

/**
 * El escáner de fugas revisa solo lo que git puede subir: en el hook, lo que
 * hay en stage (`--staged`); en CI y a mano, trackeados + no ignorados.
 *
 * Cada caso corre el script real copiado a un repo temporal: el script toma
 * como raíz la carpeta padre de la suya, así que la copia escanea el temporal
 * y nunca el checkout de verdad.
 *
 * El secreto falso se monta en tiempo de ejecución: escrito entero en este
 * fichero, el escáner lo cazaría aquí mismo en el repo real.
 */
const SECRETO = 'sk_' + 'live_' + 'Q7'.repeat(12)
const SCRIPT = join(process.cwd(), 'scripts/keys-check-leak.mjs')

let repo: string

function git(...args: string[]) {
  const r = spawnSync(
    'git',
    ['-c', 'user.name=t', '-c', 'user.email=t@t', '-c', 'commit.gpgsign=false', '-c', 'core.hooksPath=', ...args],
    { cwd: repo, encoding: 'utf8' },
  )
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`)
}

function escribir(ruta: string, contenido: string) {
  mkdirSync(dirname(join(repo, ruta)), { recursive: true })
  writeFileSync(join(repo, ruta), contenido)
}

function escanear(...flags: string[]) {
  const r = spawnSync(process.execPath, ['scripts/keys-check-leak.mjs', ...flags], { cwd: repo, encoding: 'utf8' })
  const salida = `${r.stdout}${r.stderr}`
  // Bloquee o no, el valor no sale por consola: ni entero ni su principio.
  expect(salida).not.toContain(SECRETO.slice(0, 12))
  return { codigo: r.status, salida }
}

function repoTemporal() {
  repo = mkdtempSync(join(tmpdir(), 'keys-leak-'))
  git('init', '-q')
  escribir('scripts/keys-check-leak.mjs', readFileSync(SCRIPT, 'utf8'))
  // Como el `.gitignore` de seda-web: `.env*.local` y nada más. Más una
  // carpeta ignorada cualquiera, del estilo de `supabase/.temp`.
  escribir('.gitignore', '.env*.local\n.temp/\n')
  escribir('README.md', 'nada\n')
  git('add', '.')
  git('commit', '-qm', 'base', '--no-verify')
}

afterEach(() => rmSync(repo, { recursive: true, force: true }))

describe('keys-check-leak: solo lo que git puede subir', () => {
  it('un fichero ignorado con un secreto no bloquea, ni en el hook ni en CI', () => {
    repoTemporal()
    escribir('.temp/start-secrets/docker.env', `SERVICE_KEY=${SECRETO}\n`)
    escribir('.env.local', `SERVICE_KEY=${SECRETO}\n`)
    escribir('README.md', 'cambio\n')
    git('add', 'README.md')

    expect(escanear('--staged').codigo).toBe(0)
    expect(escanear().codigo).toBe(0)
  })

  it('el mismo fichero forzado con `git add -f` sí bloquea', () => {
    repoTemporal()
    escribir('.temp/notas.txt', `SERVICE_KEY=${SECRETO}\n`)
    git('add', '-f', '.temp/notas.txt')

    const { codigo, salida } = escanear('--staged')
    expect(codigo).toBe(1)
    expect(salida).toContain('[Stripe live secret key] .temp/notas.txt:1')
  })

  it('un `.env` en stage bloquea aunque dentro no case ningún patrón', () => {
    repoTemporal()
    escribir('.env', 'NOMBRE=valor-sin-forma-de-clave\n')
    git('add', '.env')

    const { codigo, salida } = escanear('--staged')
    expect(codigo).toBe(1)
    expect(salida).toContain('[Fichero de secretos en stage] .env')
  })

  it('un `.env.local` forzado a stage bloquea por el nombre', () => {
    repoTemporal()
    escribir('.env.local', 'NOMBRE=valor-sin-forma-de-clave\n')
    git('add', '-f', '.env.local')

    const { codigo, salida } = escanear('--staged')
    expect(codigo).toBe(1)
    expect(salida).toContain('[Fichero de secretos en stage] .env.local')
  })

  it('`*.pem` y `*.key` en stage bloquean por el nombre', () => {
    repoTemporal()
    escribir('certs/servidor.pem', 'sin cabecera\n')
    escribir('certs/servidor.key', 'sin cabecera\n')
    git('add', 'certs')

    const { codigo, salida } = escanear('--staged')
    expect(codigo).toBe(1)
    expect(salida).toContain('certs/servidor.pem')
    expect(salida).toContain('certs/servidor.key')
  })

  it('`.env.example` limpio no bloquea; con una clave real dentro, sí', () => {
    repoTemporal()
    escribir('.env.example', 'STRIPE_SECRET_KEY=\nNEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co\n')
    git('add', '.env.example')

    expect(escanear('--staged').codigo).toBe(0)
    expect(escanear().codigo).toBe(0)

    escribir('.env.example', `STRIPE_SECRET_KEY=${SECRETO}\n`)
    git('add', '.env.example')
    expect(escanear('--staged').codigo).toBe(1)
  })

  it('un secreto en un fichero trackeado bloquea, en el hook y en CI', () => {
    repoTemporal()
    escribir('lib/config.ts', `export const k = '${SECRETO}'\n`)
    git('add', 'lib/config.ts')

    expect(escanear('--staged').codigo).toBe(1)
    git('commit', '-qm', 'fuga', '--no-verify')
    expect(escanear().codigo).toBe(1)
  })

  it('el hook lee el contenido del stage, no el del disco', () => {
    repoTemporal()
    escribir('lib/config.ts', `export const k = '${SECRETO}'\n`)
    git('add', 'lib/config.ts')
    // Se limpia en disco pero no se vuelve a añadir: lo que se commitea es el stage.
    escribir('lib/config.ts', 'export const k = process.env.K\n')

    expect(escanear('--staged').codigo).toBe(1)
  })

  it('en CI, un fichero nuevo sin ignorar también se lee', () => {
    repoTemporal()
    escribir('lib/nuevo.ts', `export const k = '${SECRETO}'\n`)

    expect(escanear().codigo).toBe(1)
  })
})
