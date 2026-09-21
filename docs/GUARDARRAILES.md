# Guardarraíles de seda-web

Qué protege este repo, qué le falta frente a `seda_os` y `guest-app`, y qué
depende de una decisión de Ángel. Medido el 19-sep-2026; revisado el
21-sep-2026 (checks requeridos, tests y paridad entre repos). Un hueco declarado
se puede cerrar; uno que nadie ha escrito, no.

`main` auto-despliega a producción por la integración Vercel ↔ GitHub.

## Qué corre hoy en CI

| Workflow | Job | Qué hace |
|---|---|---|
| `conflict-markers-check.yml` | `conflict-markers` | `git grep` de marcadores de merge sin resolver |
| `conflict-markers-check.yml` | `invariantes` | `invariants-check.mjs`: presencia de las reglas compartidas **y** huella de su texto (`invariantes.lock.json`) |
| `ci.yml` | `verify` | `npm ci` → `check:legal` → `keys:check-leak` → `lint` → `tsc --noEmit` → `npm test` → `build` |

Los tres jobs son checks requeridos del ruleset `web` (medido el 21-sep-2026; ver
«`verify` ya es un check requerido», abajo).

## Tabla comparativa

`sí` = existe y corre en CI. `local` = existe pero no corre en ningún CI.

| Guardarraíl | seda-web | guest-app | seda_os |
|---|---|---|---|
| Marcadores de conflicto | sí | sí | sí |
| Invariantes: presencia de headings | sí | sí | sí |
| Invariantes: huella (`checkLock` + `invariantes.lock.json`) | sí | sí | sí |
| Compartidos: huella (`compartidos-check` + `compartidos.lock.json`) | sí (dentro de `npm test`) | sí (dentro de `npm test`) | sí (dentro de `npm test`) |
| Paridad entre repos. `--parity` es local por construcción; los locks (`invariantes.lock.json` y `compartidos.lock.json`) los compara desde el 21-sep-2026 el barrido programado de seda_os, cada 6 h, contra el `main` de los tres | programada, desde seda_os | programada, desde seda_os | programada (`salud-sistema.yml`) |
| Lint en CI | sí (desde `ci.yml`) | sí, con `--max-warnings 0` | sí |
| `tsc --noEmit` en CI | sí (desde `ci.yml`) | sí | sí |
| `next build` en CI | sí (desde `ci.yml`) | sí | — (no consta) |
| Escáner de credenciales (`keys:check-leak`) | sí (desde `ci.yml`) | sí | sí |
| Identidad legal (`check:legal`) | sí (desde `ci.yml`, y dentro de `build`) | n/a | n/a |
| Tests de aplicación | 3 ficheros (desde el #61; en `verify` desde el #62) | 227 entradas en `tests/` (19-sep) | 372 entradas en `tests/` (19-sep) |
| Hook `pre-commit` | **no** | sí | no consta |
| Hook `pre-push` contra `main` | sí (local) | sí (local) | no consta |

«— (no consta)» = no lo he comprobado en `seda_os`, no que no exista. Las filas de
`seda_os` salen de leer su `ci.yml` y su carpeta `tests/`, no de ejecutarlo.

## Lo que este repo NO tiene

1. **Paridad entre repos en el PR que la rompe.** Las huellas
   (`invariantes.lock.json`, `compartidos.lock.json`) comprueban que este repo
   sigue diciendo lo acordado, pero **cada lock se copia a mano** a los tres
   repos: quien cambie un texto y regenere el lock en un solo repo se queda en
   verde en su PR. Desde el 21-sep-2026 el barrido programado de seda_os
   (`salud-sistema.yml`, job `barrido`) compara los dos locks de los tres `main`
   cada 6 h y se pone rojo si difieren; lo que sigue sin existir es verlo en el
   PR que causa la divergencia. `--parity` es local por construcción (compara
   directorios hermanos; en CI solo hay un checkout).
2. **Tests, pocos.** 3 ficheros: la ruta de contacto (`tests/contact-route.test.ts`,
   desde el #61), los invariantes y los compartidos. Corren en `verify` desde el
   #62. No prueban el sitio: prueban la única puerta de escritura y los
   guardarraíles.
3. **`lint` sin `--max-warnings 0`.** Hoy hay 17 warnings en el árbol versionado
   (`no-img-element` y un `no-unused-vars`). Solo los errores rompen.
4. **Escáner de credenciales solo heurístico.** No sustituye a `gitleaks` ni
   `trufflehog`; no mira el historial de git, solo el árbol.

## Lo que depende de una decisión de Ángel

### `verify` ya es un check requerido

Esta sección decía, el 19-sep-2026, que la protección de `main` exigía **un único
check** (`conflict-markers`) y que añadir `verify` era decisión de Ángel. Se
añadió. Medido el 21-sep-2026 con la API pública (el repo es público, no hace
falta token):

- **Ruleset `web`** (id 19892315, activo, sobre la rama por defecto; última
  modificación 19-sep-2026, 21:47 UTC): PR obligatorio sin aprobaciones mínimas,
  sin borrado, sin force-push, y `required_status_checks` con la rama al día
  (`strict`) y **tres** contextos:
  `verify (legal + leak-scan + lint + tsc + build)`,
  `conflict-markers (marcadores de merge sin resolver)` e
  `invariantes (reglas compartidas presentes)`.
- **Protección clásica de rama**, además: solo exige `conflict-markers`, con
  `enforcement_level: non_admins`.

Los tres nombres son los `name:` de los jobs: **no se renombra ninguno** sin
tocar el ruleset a la vez (añadir el contexto nuevo, renombrar, retirar el viejo).

Lo que no se puede medir sin token: los `bypass_actors` del ruleset (la API
pública devuelve `null`, no la lista). El 19-sep-2026 se leyó con `gh` que no
tenía ninguno.

### El `pre-push` describe un mundo que ya no es este

`.githooks/pre-push` dice, textualmente:

> This repo has no server-side branch protection — private repo
> on the GitHub Free plan, which requires Pro/Team/Enterprise
> for that on private repos.

Hoy eso es falso en dos puntos, medido con `gh api` el 19-sep-2026:

- El repo es **público** (`visibility: PUBLIC`), y en un repo público la
  protección de rama sí está disponible en el plan Free.
- `main` **tiene** protección de rama y un ruleset activo (PR obligatorio, sin
  force-push ni borrado; los checks requeridos, arriba).
  El commit d4481f4 (#43, 9-ago-2026) retiró `main-push-guard.yml` precisamente
  «porque la protección de rama lo hace en el servidor».

El hook sigue siendo válido como atajo local (te para antes del viaje a GitHub),
no como sustituto de la protección. Su cabecera se reescribió el 20-sep-2026 con
esto y sin la mención a `main-push-guard.yml`. Lo que sigue siendo cierto del
hook: se salta con `git push --no-verify` y no existe en un clon nuevo hasta que
`npm install` corre el script `prepare`.

## Cómo se lee `verify` cuando falla

- `check:legal`: falta un dato de `lib/legal/identidad.json`. No inventarlo.
- `keys:check-leak`: el mensaje lleva el fichero y el patrón, y los doce primeros
  caracteres del valor. **Rotar la credencial**, no solo borrarla del árbol: sigue
  en el historial.
- `lint` / `tsc` / `build`: como en local con el mismo comando.

## Escáner de credenciales: criterio de `.env*`

`scripts/keys-check-leak.mjs` se portó desde `guest-app` (17 patrones, lista de
extensiones ampliada). Se sigue el criterio de `seda_os`, no el de `guest-app`:
el `.gitignore` de este repo solo ignora `.env*.local` y **versiona
`.env.example`**, así que ese fichero se lee y solo se saltan los `.env*.local`.
Razonamiento completo en la cabecera del script.

Los dos escáneres previos se mantienen a mano: ver la cabecera para saber qué
hacer al añadir un patrón.
