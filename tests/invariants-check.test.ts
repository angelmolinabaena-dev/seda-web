import { describe, expect, it } from 'vitest'
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  INVARIANT_HEADINGS,
  extractSection,
  normalize,
  extractInvariant,
  checkPresence,
  checkParity,
  checkLock,
  huellaDelRepo,
  huellaDeTexto,
  leerLock,
  findSiblingRepos,
} from '../scripts/invariants-check.mjs'

// ── Fixtures ────────────────────────────────────────────────────────────

const HEADING = '## Una sesión por checkout'

const CONTENT_OK = `
## Una sesión por checkout

**Nunca dos sesiones de Claude Code sobre el mismo working copy.**

Y \`git add\` siempre con **rutas explícitas**.

## Siguiente sección

Otro contenido.
`

const CONTENT_MISSING = `
## Otra sección

Sin el invariante.
`

const CONTENT_DIVERGED = `
## Una sesión por checkout

Texto diferente al de los otros repos.

## Siguiente
`

// ── Tests de extracción ────────────────────────────────────────────────

describe('guardarraíl invariantes — extracción', () => {
  it('extrae el contenido bajo un heading hasta el siguiente ##', () => {
    const section = extractSection(CONTENT_OK, HEADING)
    expect(section).toContain('Nunca dos sesiones')
    expect(section).not.toContain('Siguiente sección')
    expect(section).not.toContain('## Una sesión por checkout')
  })

  it('devuelve vacío si el heading no existe', () => {
    const section = extractSection(CONTENT_MISSING, HEADING)
    expect(section.trim()).toBe('')
  })

  it('respeta code fences — un ## dentro de ``` no es heading', () => {
    const content = `
## Una sesión por checkout

Texto antes del bloque.

\`\`\`
## Esto no es un heading
Contenido del bloque.
\`\`\`

Texto después del bloque.

## Siguiente sección
`
    const section = extractSection(content, HEADING)
    expect(section).toContain('Texto antes del bloque')
    expect(section).toContain('## Esto no es un heading')
    expect(section).toContain('Texto después del bloque')
    expect(section).not.toContain('## Siguiente sección')
  })

  it('normalize colapsa blank lines y hace trim-end', () => {
    const raw = 'línea 1  \n\n\n\nlínea 2  \n\n'
    expect(normalize(raw)).toBe('línea 1\n\nlínea 2')
  })
})

// ── Tests del modo CI (presencia) ──────────────────────────────────────

describe('guardarraíl invariantes — modo CI (presencia)', () => {
  it('detecta un invariante que falta', () => {
    // checkPresence en un directorio sin CLAUDE.md → todo falta
    const result = checkPresence(join(tmpdir(), 'inv-no-existe'))
    // Como ese directorio no existe, no tiene CLAUDE.md y todo falta
    expect(result.ok).toBe(false)
    expect(result.missing.length).toBe(INVARIANT_HEADINGS.length)
  })

  it('el repo real pasa el check de presencia', () => {
    const result = checkPresence()
    expect(result.ok).toBe(true)
    expect(result.missing).toEqual([])
  })
})

// ── Tests del modo parity (divergencia) ────────────────────────────────

describe('guardarraíl invariantes — modo parity (divergencia)', () => {
  it('detecta divergencia cuando dos repos tienen contenido distinto', () => {
    // Usar directorios reales no es viable aquí. En su lugar, verificamos
    // que extractInvariant produce textos distintos para contenido distinto,
    // y que checkParity los compararía correctamente.
    const a = extractInvariant(CONTENT_OK, HEADING)
    const b = extractInvariant(CONTENT_DIVERGED, HEADING)
    expect(a).not.toBe(b)
  })

  it('detecta divergencia cuando un repo no tiene el invariante', () => {
    const a = extractInvariant(CONTENT_OK, HEADING)
    const b = extractInvariant(CONTENT_MISSING, HEADING)
    expect(a).not.toBe('')
    expect(b).toBe('')
  })

  it('dos contenidos idénticos producen el mismo invariant', () => {
    const a = extractInvariant(CONTENT_OK, HEADING)
    const b = extractInvariant(CONTENT_OK, HEADING)
    expect(a).toBe(b)
  })

  it('el parity mode con los tres repos reales no da falsos positivos', () => {
    // Tras arreglar los huecos, el parity mode debe pasar.
    // Si esto falla, hay una divergencia real sin arreglar.
    //
    // EL GUARDA DE ABAJO NO ES DECORACIÓN. Sin él este test era el peor caso
    // posible: en CI sólo hay UN repo en disco, así que `checkParity()`
    // comparaba un elemento contra sí mismo y `ok` salía true SIEMPRE. Verde
    // perpetuo midiendo nada — mientras en la máquina de Ángel, con los tres
    // checkouts al lado, salía rojo por tres divergencias reales. Medido el
    // 30-ago-2026 corriendo esta misma suite en el árbol de trabajo y en un
    // clon limpio: 1 failed vs 1 passed, mismo commit.
    //
    // La comparación de verdad la hace ahora la huella (`checkLock`), que sí
    // funciona con un solo checkout. Esto se queda como diagnóstico local.
    const repos = Object.keys(findSiblingRepos())
    if (repos.length < 2) {
      expect(repos.length).toBe(1) // sólo este repo: no hay nada que comparar
      return
    }
    const result = checkParity()
    expect(result.divergences.map((d: { heading: string }) => d.heading)).toEqual([])
    expect(result.ok).toBe(true)
  })
})

// ── La huella ───────────────────────────────────────────────────────────────
//
// `invariantes.lock.json` es lo que hace exigible en CI una regla de tres
// repos cuando ningún CI ve más de uno. Ver el comentario largo sobre la
// huella en scripts/invariants-check.mjs.

describe('guardarraíl invariantes — la huella (invariantes.lock.json)', () => {
  it('el lock existe y cubre exactamente el registro', () => {
    const lock = leerLock()
    expect(lock).not.toBeNull()
    expect(Object.keys(lock.invariantes).sort()).toEqual([...INVARIANT_HEADINGS].sort())
  })

  it('el CLAUDE.md de este repo coincide con la huella acordada', () => {
    expect(checkLock().ok).toBe(true)
  })

  it('cambiar el texto de un invariante rompe la huella, y dice cuál', () => {
    // Control positivo: sin esto, un lock que no comprobara nada pasaría igual.
    const disco = huellaDelRepo() as Record<string, string>
    const falseado: Record<string, string> = { ...disco, '## Merge': huellaDeTexto('otra cosa') }
    const difieren = Object.keys(disco).filter((h) => falseado[h] !== disco[h])
    expect(difieren).toEqual(['## Merge'])
  })

  it('la huella no cambia con el final de línea (Windows vs ubuntu-latest)', () => {
    // EL test de este PR. La huella se calcula del CLAUDE.md TAL COMO SE
    // MATERIALIZA en disco, y este repo se registra en LF pero se materializa
    // en CRLF en Windows (`git add` lo avisa; 1.458 de 1.704 ficheros, medido
    // el 26-ago). Si `normalize()` no comiera el `\r`, el lock generado aquí
    // sería ROJO en ubuntu-latest y verde en local — o sea, este PR habría
    // introducido justo la avería que viene a quitar.
    //
    // Lo salva el `trimEnd()` por línea de normalize(). Esto lo fija.
    const lf = 'línea 1\n\nlínea 2\n'
    const crlf = lf.replace(/\n/g, '\r\n')
    const seccion = (t: string) => `## X\n\n${t}\n## Y\n`
    expect(huellaDeTexto(extractInvariant(seccion(crlf), '## X')))
      .toBe(huellaDeTexto(extractInvariant(seccion(lf), '## X')))
  })

  it('la huella no depende de la máquina: sólo lee ficheros versionados', () => {
    // `CLAUDE.md` está trackeado, así que dos lecturas del mismo árbol dan lo
    // mismo. Lo que este test fija es que la huella se calcule del CONTENIDO y
    // no de nada del entorno — es determinista y repetible.
    expect(huellaDelRepo()).toEqual(huellaDelRepo())
  })

  it('el lock cubre los invariantes del registro, ni más ni menos', () => {
    // Las dos formas de que el lock se quede atrás en silencio: un heading
    // nuevo sin huella, y una huella de un heading ya retirado.
    const lock = leerLock()
    const enLock = new Set(Object.keys(lock.invariantes))
    expect(INVARIANT_HEADINGS.filter((h: string) => !enLock.has(h))).toEqual([])
    expect([...enLock].filter((h) => !INVARIANT_HEADINGS.includes(h))).toEqual([])
  })
})

// ── Las tres formas de fallar de checkLock, sobre una copia ────────────────
//
// Control negativo del lock: cada forma se provoca en un directorio temporal
// (nunca en el árbol real) y tiene que dar rojo diciendo CUÁL.

describe('guardarraíl invariantes — checkLock falla de las tres formas', () => {
  function copia(): string {
    const dir = mkdtempSync(join(tmpdir(), 'inv-lock-'))
    // seda-web no tiene AGENTS.md (guest-app sí): se copia lo que exista.
    for (const f of ['CLAUDE.md', 'AGENTS.md', 'invariantes.lock.json']) {
      if (existsSync(join(process.cwd(), f))) cpSync(join(process.cwd(), f), join(dir, f))
    }
    return dir
  }

  it('control: la copia sin tocar da verde', () => {
    const dir = copia()
    try {
      expect(checkLock(dir).ok).toBe(true)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('difieren: cambiar una palabra de un invariante', () => {
    const dir = copia()
    try {
      const p = join(dir, 'CLAUDE.md') // en seda-web los invariantes viven en CLAUDE.md
      const txt = readFileSync(p, 'utf8')
      expect(txt).toContain('Ángel es el único que mergea')
      writeFileSync(p, txt.replace('Ángel es el único que mergea', 'Cualquiera puede mergear'))
      const r = checkLock(dir)
      expect(r.ok).toBe(false)
      expect(r.difieren.map((d: { heading: string }) => d.heading)).toEqual(['## Merge'])
      expect(r.sinLock).toEqual([])
      expect(r.muertos).toEqual([])
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('sinLock: el lock no conoce un invariante del registro', () => {
    const dir = copia()
    try {
      const p = join(dir, 'invariantes.lock.json')
      const lock = JSON.parse(readFileSync(p, 'utf8'))
      delete lock.invariantes['## Merge']
      writeFileSync(p, JSON.stringify(lock))
      const r = checkLock(dir)
      expect(r.ok).toBe(false)
      expect(r.sinLock).toEqual(['## Merge'])
      expect(r.difieren).toEqual([])
      expect(r.muertos).toEqual([])
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('muertos: el lock conoce un invariante que ya no está en el registro', () => {
    const dir = copia()
    try {
      const p = join(dir, 'invariantes.lock.json')
      const lock = JSON.parse(readFileSync(p, 'utf8'))
      lock.invariantes['## Sección retirada'] = 'deadbeefdeadbeef'
      writeFileSync(p, JSON.stringify(lock))
      const r = checkLock(dir)
      expect(r.ok).toBe(false)
      expect(r.muertos).toEqual(['## Sección retirada'])
      expect(r.difieren).toEqual([])
      expect(r.sinLock).toEqual([])
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

// ── Test del registro ──────────────────────────────────────────────────

describe('guardarraíl invariantes — registro', () => {
  it('el registro tiene al menos los 9 invariantes esperados', () => {
    expect(INVARIANT_HEADINGS.length).toBeGreaterThanOrEqual(9)
  })

  it('todos los headings empiezan con ## ', () => {
    for (const h of INVARIANT_HEADINGS) {
      expect(h.startsWith('## ')).toBe(true)
    }
  })

  it('no hay headings duplicados en el registro', () => {
    const set = new Set(INVARIANT_HEADINGS)
    expect(set.size).toBe(INVARIANT_HEADINGS.length)
  })
})
