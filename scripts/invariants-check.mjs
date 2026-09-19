#!/usr/bin/env node

// Guardarraíl — paridad de invariantes entre seda_os, guest-app y seda-web.
//
// Las reglas invariables (las que una sesión debe conocer antes de actuar)
// están duplicadas en los CLAUDE.md / AGENTS.md de los tres repos. Nada
// comprobar que coincidan, y ya divergen (PR #367, 2026-08-11).
//
// Dos modos:
//
// 1. CI (default): comprueba que todos los invariantes registrados existen
//    en este repo Y que su texto coincide con la huella acordada
//    (`invariantes.lock.json`, desde el PR #629). No basta con que el titular
//    esté: si el texto cambió sin regenerar la huella, falla. No necesita
//    acceso a los otros repos. 100% estático.
//
// 2. Parity (--parity): compara el contenido de cada invariante entre los
//    tres repos. Local solo — en CI solo hay un repo checked out.
//
// Método: extracción por heading. Cada invariante es una sección `## ` del
// fichero de reglas. El contenido entre ese heading y el siguiente `## `
// (o EOF) es el "texto del invariante". Se normaliza whitespace y se compara.
//
// Por qué no un fichero único @-referenciado: Claude Code resuelve `@filename`
// relativo al repo, no sigue referencias entre repos. Un `INVARIANTS.md` en
// seda_os referenciado desde guest-app no se cargaría — la regla dejaría de
// leerse, que es peor que duplicada. Verificado 2026-08-11.
//
// Por qué heading-delimited y no texto literal del fichero entero: cada repo
// tiene contenido propio (guardarraíles de esquema en seda_os, stack de
// guest-app, etc.). Comparar ficheros enteros da falsos positivos constantes.
//
// Por qué no solo presencia de heading: no detecta que el contenido diverja.
// El bug original de guest-app: el heading "## Una sesión por checkout" estaba
// presente pero su contenido se mezcló con la sección anterior.

import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname, resolve, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

// ── Registro de invariantes ─────────────────────────────────────────────
//
// Cada entrada es un heading `## ` exacto que debe existir en los tres repos.
// El contenido bajo cada heading debe ser idéntico (tras normalización).
// Si añades un invariante aquí, añádelo a los tres repos.

export const INVARIANT_HEADINGS = [
  '## Base de datos — Claude Code NUNCA escribe',
  '## Ramas: siempre desde main actualizado',
  '## Merge',
  '## Worktrees: trabajar en el directorio actual',
  '## Verificar la rama ANTES de empezar',
  '## Una sesión por checkout',
  '## Un test en verde no demuestra corrección',
  '## «No mergees» no significa «no termines»',
  '## Economía de sesión',
];

// Repos hermanos para el modo parity. El nombre es el del directorio.
export const SIBLING_REPOS = ['seda_os', 'guest-app', 'seda-web'];

// ── Lectura ─────────────────────────────────────────────────────────────

/**
 * Lee los ficheros de reglas de un directorio como array (no concatenados).
 * guest-app usa `@AGENTS.md` en su CLAUDE.md — la sesión ve ambos, pero
 * cada fichero es independiente: concatenarlos hara que la última sección
 * de CLAUDE.md absorba contenido de AGENTS.md.
 */
export function readRulesFiles(dir) {
  const files = ['CLAUDE.md'];
  if (existsSync(join(dir, 'AGENTS.md'))) {
    files.push('AGENTS.md');
  }
  return files.map((f) => {
    const p = join(dir, f);
    return existsSync(p) ? readFileSync(p, 'utf8') : '';
  });
}

/**
 * Devuelve el contenido concatenado de todos los ficheros de reglas.
 * Solo para compatibilidad con tests que esperan un string.
 */
export function readRulesContent(dir) {
  return readRulesFiles(dir).join('\n');
}

// ── Extracción ──────────────────────────────────────────────────────────

/**
 * Extrae el contenido bajo un heading `## ` hasta el siguiente `## `,
 * un separador `---` (solo en la línea), o EOF.
 * No incluye la línea del heading. Respeta code fences (```).
 */
export function extractSection(content, heading) {
  const lines = content.split('\n');
  let inSection = false;
  let inCodeBlock = false;
  const sectionLines = [];

  for (const line of lines) {
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
    }

    if (!inCodeBlock && line.startsWith('## ')) {
      if (inSection) break; // siguiente heading → fin
      if (line.trim() === heading) {
        inSection = true;
        continue; // no incluir el heading
      }
    } else if (inSection) {
      // `---` solo en la línea = separador de sección → fin
      if (!inCodeBlock && line.trim() === '---') break;
      sectionLines.push(line);
    }
  }

  return sectionLines.join('\n');
}

/**
 * Extrae un invariante de un directorio, buscando en cada fichero
 * independientemente. El primer fichero que tenga el heading con
 * contenido no vacío gana.
 */
export function extractInvariantFromDir(dir, heading) {
  const files = readRulesFiles(dir);
  for (const content of files) {
    const section = extractSection(content, heading);
    if (section.trim()) {
      return normalize(section);
    }
  }
  return '';
}

/**
 * Normaliza whitespace: trim-end por línea, colapsa blank lines, trim global.
 */
export function normalize(text) {
  return text
    .split('\n')
    .map((l) => l.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function extractInvariant(content, heading) {
  return normalize(extractSection(content, heading));
}

// ── CI mode: presencia ──────────────────────────────────────────────────

export function checkPresence(dir = REPO_ROOT) {
  const files = readRulesFiles(dir);
  const missing = [];

  for (const heading of INVARIANT_HEADINGS) {
    let found = false;
    for (const content of files) {
      const section = extractSection(content, heading);
      if (section.trim()) {
        found = true;
        break;
      }
    }
    if (!found) {
      missing.push(heading);
    }
  }

  return { ok: missing.length === 0, missing };
}

// ── La huella: cómo se hace cumplir una regla de tres repos con UN checkout ──
//
// El problema, medido el 30-ago-2026: `--parity` es la única comprobación que
// mira de verdad el contenido de los tres repos, y no corre en ningún sitio.
// ci.yml:106 corre este script SIN `--parity` (la línea 104 lo dice: «es
// local»), y el único sitio que llama a `checkParity()` en CI es
// `tests/invariants-check.test.ts`, donde con un solo repo en disco la
// comparación es de un elemento contra sí mismo y pasa SIEMPRE. O sea que no
// era un guardarraíl que no corre: era uno que corre, no mide nada y da verde.
//
// Con un checkout no se puede comparar contra los hermanos. Lo que sí se puede
// es comparar contra una HUELLA acordada: `invariantes.lock.json`, el sha256
// del texto normalizado de cada invariante, byte a byte igual en los tres
// repos. Cada CI comprueba «mi CLAUDE.md sigue diciendo lo acordado» sin ver a
// nadie más, y entra por el paso que YA existe en ci.yml — cero cambios de
// workflow, que además están denegados a las sesiones de Claude Code.
//
// EL PRECIO, dicho entero: la huella no cierra el agujero, lo estrecha. Quien
// cambie el texto y regenere el lock en un solo repo se queda verde, y los
// otros dos siguen verdes hasta que alguien copie el fichero. Lo que se gana
// es que sincronizar deja de ser «reconciliar prosa en tres sitios» y pasa a
// ser «copiar un fichero de 1 KB», que es la operación que menos se tuerce; y
// que el día que alguien toque el texto SIN regenerar —el caso frecuente— su
// propio CI se pone rojo en el acto. El resto del razonamiento, y por qué no
// se eligió ni el checkout de los hermanos ni publicar el bloque desde un
// sitio, en seda_os/docs/audit/GUARDARRAILES-QUE-MIDEN-LA-MAQUINA-2026-08-30.md.

export const LOCK_PATH = 'invariantes.lock.json'

export function huellaDeTexto(texto) {
  return createHash('sha256').update(texto, 'utf8').digest('hex').slice(0, 16)
}

/** { heading: sha256corto } del repo en disco. Ausente => cadena vacía. */
export function huellaDelRepo(dir = REPO_ROOT) {
  const out = {}
  for (const h of INVARIANT_HEADINGS) out[h] = huellaDeTexto(extractInvariantFromDir(dir, h))
  return out
}

export function leerLock(dir = REPO_ROOT) {
  const p = join(dir, LOCK_PATH)
  if (!existsSync(p)) return null
  return JSON.parse(readFileSync(p, 'utf8'))
}

/**
 * Compara la huella en disco con la del lock. Tres formas de fallar, y las
 * tres importan: un invariante cuyo texto cambió (`difieren`), uno que el lock
 * no conoce (`sinLock`, alguien añadió al registro sin regenerar) y uno que
 * sobra en el lock (`muertos`, alguien quitó del registro sin regenerar). La
 * tercera es la que hace que el lock no se pueda quedar atrás en silencio —
 * misma doctrina que la allowlist de scripts/docs-check.mjs, donde una entrada
 * que ya no silencia nada FALLA.
 */
export function checkLock(dir = REPO_ROOT) {
  const lock = leerLock(dir)
  if (!lock) return { ok: false, ausente: true, difieren: [], sinLock: [], muertos: [] }
  const disco = huellaDelRepo(dir)
  const esperado = lock.invariantes ?? {}
  const difieren = []
  const sinLock = []
  for (const [h, sha] of Object.entries(disco)) {
    if (!(h in esperado)) sinLock.push(h)
    else if (esperado[h] !== sha) difieren.push({ heading: h, lock: esperado[h], disco: sha })
  }
  const muertos = Object.keys(esperado).filter((h) => !(h in disco))
  return {
    ok: !difieren.length && !sinLock.length && !muertos.length,
    ausente: false, difieren, sinLock, muertos,
  }
}

export function escribirLock(dir = REPO_ROOT) {
  const cuerpo = {
    _comentario: [
      'Huella de los invariantes compartidos por seda_os, guest-app y seda-web.',
      'Este fichero debe ser BYTE A BYTE IDENTICO en los tres repos: es el',
      'unico modo de que cada CI, que solo ve su propio checkout, compruebe que',
      'su CLAUDE.md sigue diciendo lo acordado.',
      '',
      'No se edita a mano. Se regenera con `npm run invariants:lock` y se copia',
      'igual a los otros dos repos, en el mismo PR o en uno inmediato.',
      '',
      'sha256 (16 hex) del texto de cada seccion `## `, tras normalizar',
      'whitespace con normalize() de scripts/invariants-check.mjs.',
    ],
    invariantes: huellaDelRepo(dir),
  }
  writeFileSync(join(dir, LOCK_PATH), `${JSON.stringify(cuerpo, null, 2)}\n`, 'utf8')
  return cuerpo
}

// ── Parity mode: comparación entre repos ────────────────────────────────

export function findSiblingRepos(rootDir = REPO_ROOT) {
  const parent = dirname(rootDir);
  const repos = {};
  for (const name of SIBLING_REPOS) {
    const p = join(parent, name);
    if (existsSync(p)) {
      repos[name] = p;
    }
  }
  // Incluir el repo actual siempre (por si su dir no matchea SIBLING_REPOS)
  const currentName = basename(rootDir);
  repos[currentName] = rootDir;
  return repos;
}

export function checkParity(rootDir = REPO_ROOT) {
  const repos = findSiblingRepos(rootDir);
  const found = Object.keys(repos);
  const divergences = [];

  for (const heading of INVARIANT_HEADINGS) {
    const contents = {};
    for (const [name, dir] of Object.entries(repos)) {
      contents[name] = extractInvariantFromDir(dir, heading);
    }

    const values = Object.values(contents);
    const allEqual = values.every((v) => v === values[0]);

    if (!allEqual) {
      divergences.push({ heading, contents });
    }
  }

  return { ok: divergences.length === 0, divergences, repos: found };
}

// ── CLI ─────────────────────────────────────────────────────────────────

function main() {
  const mode = process.argv[2];

  if (mode === '--parity') {
    const result = checkParity();
    if (result.repos.length < 2) {
      console.error('✗ Parity necesita al menos 2 repos hermanos.');
      console.error(`  Encontrados: ${result.repos.join(', ')}`);
      console.error(`  Buscados en: ${dirname(REPO_ROOT)}`);
      process.exit(1);
    }
    if (!result.ok) {
      console.error('✗ Invariantes que divergen entre repos:');
      for (const { heading, contents } of result.divergences) {
        console.error(`\n  ${heading}`);
        for (const [name, content] of Object.entries(contents)) {
          if (!content) {
            console.error(`    ${name}: (ausente)`);
          } else {
            const preview = content.slice(0, 100).replace(/\n/g, ' ');
            console.error(`    ${name}: ${preview}…`);
          }
        }
      }
      console.error('\nCorrige las diferencias y vuelve a ejecutar.');
      process.exit(1);
    }
    console.log(`✓ Paridad verificada entre ${result.repos.length} repos.`);
    console.log(`  Repos: ${result.repos.join(', ')}`);
    return;
  }

  if (mode === '--lock') {
    const cuerpo = escribirLock();
    console.log(`✓ ${LOCK_PATH} regenerado con ${Object.keys(cuerpo.invariantes).length} invariantes.`);
    console.log('');
    console.log('  AHORA COPIA ESTE FICHERO, igual, a guest-app y seda-web.');
    console.log('  Sin eso los tres repos siguen divergiendo y cada CI sigue verde.');
    return;
  }

  if (mode === '--help' || mode === '-h') {
    console.log('Uso: node scripts/invariants-check.mjs [--parity|--lock]');
    console.log('');
    console.log('  Sin argumentos  Modo CI: presencia + huella (invariantes.lock.json).');
    console.log('  --parity        Compara contenido entre repos (local, exige los 3).');
    console.log('  --lock          Regenera la huella. Cópiala luego a los otros dos repos.');
    return;
  }

  // Default: CI mode
  const result = checkPresence();
  if (!result.ok) {
    console.error('✗ Faltan invariantes en este repo:');
    for (const h of result.missing) {
      console.error(`  - ${h}`);
    }
    console.error('');
    console.error('Estos invariantes deben existir en los tres repos.');
    process.exit(1);
  }

  // La huella. Esto es lo que convierte «presencia» en «el texto acordado», y
  // es lo único de los tres repos que un CI con un solo checkout puede exigir.
  const lock = checkLock();
  if (!lock.ok) {
    if (lock.ausente) {
      console.error(`✗ Falta ${LOCK_PATH}. Regénéralo: npm run invariants:lock`);
      process.exit(1);
    }
    console.error('✗ El texto de los invariantes no coincide con la huella acordada:');
    for (const d of lock.difieren) {
      console.error(`  ${d.heading}`);
      console.error(`      lock ${d.lock}  ≠  disco ${d.disco}`);
    }
    for (const h of lock.sinLock) console.error(`  ${h}\n      en el registro pero no en el lock`);
    for (const h of lock.muertos) console.error(`  ${h}\n      en el lock pero ya no en el registro`);
    console.error('');
    console.error('Si el cambio es DELIBERADO, aplícalo también a guest-app y seda-web,');
    console.error('regenera con `npm run invariants:lock` y copia el lock a los tres.');
    console.error('Si no lo es, has divergido de los otros dos repos: revierte.');
    process.exit(1);
  }

  console.log(`✓ ${INVARIANT_HEADINGS.length} invariantes presentes y con la huella acordada.`);
}

// Ejecutar solo si es el entry point (no si es importado por un test)
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
