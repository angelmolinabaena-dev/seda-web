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
//    en este repo. No necesita acceso a los otros repos. 100% estático.
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

import { readFileSync, existsSync } from 'node:fs';
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

  if (mode === '--help' || mode === '-h') {
    console.log('Uso: node scripts/invariants-check.mjs [--parity]');
    console.log('');
    console.log('  Sin argumentos  Modo CI: presencia de invariantes.');
    console.log('  --parity        Compara contenido entre repos (local).');
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
  console.log(`✓ ${INVARIANT_HEADINGS.length} invariantes presentes.`);
}

// Ejecutar solo si es el entry point (no si es importado por un test)
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
