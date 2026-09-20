import { describe, expect, it } from 'vitest'
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { mutar } from '../scripts/lib/mutacion.mjs'
import { SIBLING_REPOS } from '../scripts/invariants-check.mjs'
import {
  checkCompartidos,
  escribirLock,
  extraerContratoHealth,
  extraerPatrones,
  ELEMENTOS,
  UNIVERSO,
} from '../scripts/compartidos-check.mjs'

const REAL = process.cwd()
const HEALTH = 'scripts/health-check.mjs'
// Este fichero viaja a los tres repos, pero seda-web no tiene health-check.mjs: su
// universo lo excluye (no publica /api/health). Lo que necesita ese fichero se
// condiciona a que el universo de ESTE repo lo incluya, no a que exista en disco.
const ESTE_REPO = 'seda-web'
const TIENE_HEALTH = (ELEMENTOS as Record<string, { repos: string[] }>)[HEALTH].repos.includes(ESTE_REPO)
const GITATTR = '.gitattributes: scripts/*.mjs text eol=lf'

/** Copia mínima del repo con lo que el check lee, para mutar sin tocar el real. */
function repoTemporal(): string {
  const dir = mkdtempSync(join(tmpdir(), 'compartidos-'))
  mkdirSync(join(dir, 'scripts'))
  const ficheros = ['scripts/keys-check-leak.mjs', 'invariantes.lock.json', '.gitattributes']
  if (TIENE_HEALTH) ficheros.push(HEALTH)
  for (const f of ficheros) writeFileSync(join(dir, f), readFileSync(join(REAL, f)))
  // Sin health-check.mjs no se puede regenerar el lock (escribirLock lo lee): se copia el real,
  // que el primer test comprueba contra el disco.
  if (TIENE_HEALTH) escribirLock(dir)
  else writeFileSync(join(dir, 'compartidos.lock.json'), readFileSync(join(REAL, 'compartidos.lock.json')))
  return dir
}

const nombres = (xs: { nombre: string }[]) => xs.map((x) => x.nombre)

describe('compartidos-check', () => {
  it('el repo real coincide con su lock y recalcula TODO lo que su universo incluye', () => {
    const r = checkCompartidos(REAL, ESTE_REPO)
    expect(r.difieren).toEqual([])
    expect(r.ausentes).toEqual([])
    expect(r.ok).toBe(true)
    const esperados = Object.entries(ELEMENTOS as Record<string, { repos: string[] }>)
      .filter(([, el]) => el.repos.includes(ESTE_REPO))
      .map(([nombre]) => nombre)
    expect(r.comprueba).toEqual(esperados)
    // seda-web: tres de cuatro. health-check.mjs no aplica (no publica /api/health): no es una «falta».
    expect(r.comprueba).toHaveLength(TIENE_HEALTH ? 4 : 3)
    expect(r.comprueba.includes(HEALTH)).toBe(TIENE_HEALTH)
    expect(nombres(r.ausentes)).not.toContain(HEALTH)
  })

  it('no queda el concepto «declarada»: ni en los elementos ni en el resultado', () => {
    for (const el of Object.values(ELEMENTOS) as Record<string, unknown>[]) {
      expect(el).not.toHaveProperty('comprobacion')
    }
    expect(checkCompartidos(REAL, 'seda_os')).not.toHaveProperty('soloDeclara')
  })

  it('el universo se teclea una vez y cada elemento vive en un subconjunto', () => {
    expect(UNIVERSO).toEqual(SIBLING_REPOS)
    for (const [nombre, el] of Object.entries(ELEMENTOS) as [string, { repos: string[] }][]) {
      expect(el.repos.length, nombre).toBeGreaterThan(0)
      for (const r of el.repos) expect(UNIVERSO, `${nombre} → ${r}`).toContain(r)
    }
    expect((ELEMENTOS as Record<string, { repos: string[] }>)[HEALTH].repos).toEqual(['seda_os', 'guest-app'])
    expect((ELEMENTOS as Record<string, { repos: string[] }>)['tabla PATTERNS de keys-check-leak'].repos).toEqual(UNIVERSO)
  })

  it('la tabla real se lee entera: 17 patrones', () => {
    expect(extraerPatrones(readFileSync(join(REAL, 'scripts/keys-check-leak.mjs'), 'utf8'))).toHaveLength(17)
  })

  it('cambiar un patrón SIN regenerar el lock pone rojo', () => {
    const dir = repoTemporal()
    try {
      const f = join(dir, 'scripts/keys-check-leak.mjs')
      writeFileSync(f, mutar(readFileSync(f, 'utf8'), { de: 'sk_live_[A-Za-z0-9]{20,}', a: 'sk_live_[A-Za-z0-9]{21,}', objetivo: 'umbral de Stripe live' }))
      const r = checkCompartidos(dir, ESTE_REPO)
      expect(r.ok).toBe(false)
      expect(nombres(r.difieren)).toEqual(['tabla PATTERNS de keys-check-leak'])
    } finally { rmSync(dir, { recursive: true, force: true }) }
  })

  it('un comentario o un cambio de espacios en el fichero NO pone rojo (la huella es de la tabla)', () => {
    const dir = repoTemporal()
    try {
      const f = join(dir, 'scripts/keys-check-leak.mjs')
      // mutacion-check: normalizador — pasa el fichero a CRLF y añade comentarios; NO cambia la tabla
      writeFileSync(f, '// comentario nuevo\n' + readFileSync(f, 'utf8').replace(/\n/g, '\r\n') + '\n// más cosas\n')
      expect(checkCompartidos(dir, ESTE_REPO).ok).toBe(true)
    } finally { rmSync(dir, { recursive: true, force: true }) }
  })

  it('quitar un patrón, o una entrada ilegible, no pasa en silencio', () => {
    const dir = repoTemporal()
    try {
      const f = join(dir, 'scripts/keys-check-leak.mjs')
      const orig = readFileSync(f, 'utf8')
      writeFileSync(f, mutar(orig, { de: /^ {2}\{ name: 'Stripe live secret key'.*\n/m, a: '', objetivo: 'quitar un patrón' }))
      expect(checkCompartidos(dir, ESTE_REPO).ok).toBe(false)
      writeFileSync(f, mutar(orig, { de: "{ name: 'AWS access key id',", a: "{ name:\n 'AWS access key id',", objetivo: 'partir una entrada' }))
      expect(checkCompartidos(dir, ESTE_REPO).ok).toBe(false)
    } finally { rmSync(dir, { recursive: true, force: true }) }
  })

  it('un lock que promete otro universo que el del código está rojo', () => {
    const dir = repoTemporal()
    try {
      const p = join(dir, 'compartidos.lock.json')
      const lock = JSON.parse(readFileSync(p, 'utf8'))
      lock.compartidos[HEALTH].repos = [...UNIVERSO]
      writeFileSync(p, JSON.stringify(lock))
      const r = checkCompartidos(dir, 'seda_os')
      expect(r.ok).toBe(false)
      expect(nombres(r.difieren)).toEqual([HEALTH])
    } finally { rmSync(dir, { recursive: true, force: true }) }
  })

  it('sin lock, rojo y «ausente»', () => {
    const dir = mkdtempSync(join(tmpdir(), 'compartidos-'))
    try {
      const r = checkCompartidos(dir, 'seda_os')
      expect(r.ok).toBe(false)
      expect(r.ausente).toBe(true)
    } finally { rmSync(dir, { recursive: true, force: true }) }
  })

  it('un directorio que no es de ningún repo del universo no pasa por verde: rojo y lo dice', () => {
    const r = checkCompartidos(REAL, 'otro-repo')
    expect(r.ok).toBe(false)
    expect(r.repoDesconocido).toBe(true)
  })
})

describe('health-check.mjs: se hashea el contrato, no el fichero', () => {
  // Los tests que leen el fichero real solo corren en repos cuyo universo lo incluye (no seda-web).
  it.skipIf(!TIENE_HEALTH)('la cabecera y el host pueden ser otros sin que salte nada (la razón de que no sea un hash del fichero)', () => {
    const dir = repoTemporal()
    try {
      const f = join(dir, HEALTH)
      const orig = readFileSync(f, 'utf8')
      // mutacion-check: normalizador — cambia solo comentarios y el host del ejemplo; el código no se toca
      writeFileSync(f, orig.replace('owners.sedaprivatehomes.com', 'guests.sedaprivatehomes.com').replace(/^ \* Hits[^\n]*\n/m, ' * Otra frase.\n * Y otra.\n'))
      expect(readFileSync(f, 'utf8')).not.toBe(orig)
      expect(checkCompartidos(dir, 'seda_os').ok).toBe(true)
    } finally { rmSync(dir, { recursive: true, force: true }) }
  })

  it.skipIf(!TIENE_HEALTH).each([
    ['el código de salida cuando hay una dependencia enferma', { de: 'process.exit(1)', a: 'process.exit(0)', objetivo: 'salir 0 estando enfermo' }],
    ['la ruta que se pega', { de: '}/api/health`', a: '}/api/healthz`', objetivo: 'otra ruta (la del código, no la del comentario)' }],
    ['qué cuenta como enfermo', { de: 'body.ok === false', a: 'body.ok === true', objetivo: 'invertir ok' }],
    ['la variable de entorno', { de: 'process.env.HEALTH_BASE_URL', a: 'process.env.BASE_URL', objetivo: 'otra variable (la del código)' }],
  ])('cambiar %s pone rojo, y nombra el elemento', (_que, m) => {
    const dir = repoTemporal()
    try {
      const f = join(dir, HEALTH)
      writeFileSync(f, mutar(readFileSync(f, 'utf8'), m as Parameters<typeof mutar>[1]))
      const r = checkCompartidos(dir, 'guest-app')
      expect(r.ok).toBe(false)
      // Rojo por dos vías: el contrato cambia (difiere) o deja de poder leerse (ilegible).
      expect([...nombres(r.difieren), ...nombres(r.ilegibles)]).toEqual([HEALTH])
    } finally { rmSync(dir, { recursive: true, force: true }) }
  })

  it('un `//` dentro de una cadena no se toma por comentario', () => {
    const codigo = extraerContratoHealth("const base = 'http://localhost:3000' // /api/health HEALTH_BASE_URL\nprocess.exit(1)\n")
    expect(codigo[0]).toContain('http://localhost:3000')
  })

  it('un fichero que no habla de health no se hashea como «nada»', () => {
    expect(() => extraerContratoHealth('console.log("hola")\n')).toThrow(/no menciona/)
  })
})

describe('ausencia: lo que el universo exige y no está en disco es rojo, con mensaje', () => {
  it('sin scripts/health-check.mjs en un repo cuyo universo lo incluye', () => {
    const dir = repoTemporal()
    try {
      rmSync(join(dir, HEALTH), { force: true })
      for (const repo of ['seda_os', 'guest-app']) {
        const r = checkCompartidos(dir, repo)
        expect(r.ok, repo).toBe(false)
        expect(nombres(r.ausentes), repo).toEqual([HEALTH])
        expect(r.ausentes[0].motivo).toMatch(/falta el fichero scripts\/health-check\.mjs/)
        expect(r.ausentes[0].porQue.length).toBeGreaterThan(20)
      }
    } finally { rmSync(dir, { recursive: true, force: true }) }
  })

  it('...pero en seda-web, cuyo universo no lo incluye, su ausencia es lo correcto', () => {
    const dir = repoTemporal()
    try {
      rmSync(join(dir, HEALTH), { force: true })
      const r = checkCompartidos(dir, 'seda-web')
      expect(r.ok).toBe(true)
      expect(r.comprueba).not.toContain(HEALTH)
      expect(r.comprueba).toHaveLength(3)
    } finally { rmSync(dir, { recursive: true, force: true }) }
  })

  it('sin la línea de .gitattributes: rojo, y el mensaje dice cuál falta (no un hash de la cadena vacía)', () => {
    const dir = repoTemporal()
    try {
      const f = join(dir, '.gitattributes')
      writeFileSync(f, readFileSync(f, 'utf8').split(/\r?\n/).filter((l) => l !== 'scripts/*.mjs text eol=lf').join('\n'))
      const r = checkCompartidos(dir, 'seda-web')
      expect(r.ok).toBe(false)
      expect(nombres(r.ausentes)).toEqual([GITATTR])
      expect(r.ausentes[0].motivo).toMatch(/falta la línea `scripts\/\*\.mjs text eol=lf`/)
    } finally { rmSync(dir, { recursive: true, force: true }) }
  })

  it('un elemento del universo que falta en el lock también es rojo', () => {
    const dir = repoTemporal()
    try {
      const p = join(dir, 'compartidos.lock.json')
      const lock = JSON.parse(readFileSync(p, 'utf8'))
      delete lock.compartidos['invariantes.lock.json']
      writeFileSync(p, JSON.stringify(lock))
      expect(checkCompartidos(dir, 'guest-app').sinLock).toEqual(['invariantes.lock.json'])
    } finally { rmSync(dir, { recursive: true, force: true }) }
  })
})
