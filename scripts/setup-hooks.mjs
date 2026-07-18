#!/usr/bin/env node
/**
 * Points git's `core.hooksPath` at the tracked `.githooks/` directory so
 * the repo's shared hooks (e.g. .githooks/pre-commit) run for everyone
 * after `npm install`. Invoked by the `prepare` lifecycle script.
 *
 * Replaces the previous inline shell one-liner:
 *   `git config core.hooksPath .githooks 2>/dev/null || true`
 * That is a bash-ism. npm runs scripts via `cmd /d /s /c` on Windows,
 * where `2>/dev/null` redirects to the literal path `\dev\null` (fails)
 * and `|| true` fails (`true` is not a cmd builtin) — so every
 * `npm install` exited with code 1 after packages installed, which is
 * confusing locally and breaks Windows CI runners.
 *
 * Node runs identically on cmd and POSIX. We swallow any error (git not
 * installed, or not inside a work tree — e.g. installed from a tarball)
 * to preserve the original `|| true` intent: `prepare` must never fail
 * the install.
 */
import { execFileSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

try {
  execFileSync('git', ['config', 'core.hooksPath', '.githooks'], {
    cwd: root,
    stdio: 'ignore',
  })
} catch {
  // No git, or not a git work tree. Mirrors the old `|| true`: stay
  // silent and exit 0 so `npm install` succeeds regardless.
}
