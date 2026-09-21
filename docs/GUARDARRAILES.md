# Guardarraíles de seda-web

Qué protege este repo, qué le falta frente a `seda_os` y `guest-app`, y qué
depende de una decisión de Ángel. Medido el 19-sep-2026. Un hueco declarado se
puede cerrar; uno que nadie ha escrito, no.

`main` auto-despliega a producción por la integración Vercel ↔ GitHub.

## Qué corre hoy en CI

| Workflow | Job | Qué hace |
|---|---|---|
| `conflict-markers-check.yml` | `conflict-markers` | `git grep` de marcadores de merge sin resolver |
| `conflict-markers-check.yml` | `invariantes` | `invariants-check.mjs`: presencia de las reglas compartidas **y** huella de su texto (`invariantes.lock.json`) |
| `ci.yml` | `verify` | `npm ci` → `check:legal` → `keys:check-leak` → `lint` → `tsc --noEmit` → `build` |

## Tabla comparativa

`sí` = existe y corre en CI. `local` = existe pero no corre en ningún CI.

| Guardarraíl | seda-web | guest-app | seda_os |
|---|---|---|---|
| Marcadores de conflicto | sí | sí | sí |
| Invariantes: presencia de headings | sí | sí | sí |
| Invariantes: huella (`checkLock` + `invariantes.lock.json`) | sí | sí | sí |
| Invariantes: paridad entre repos (`--parity`). `--parity` no lo ejecuta ningún CI y no puede; la paridad real entre repos hoy no la comprueba nadie | local | local | local |
| Lint en CI | sí (desde `ci.yml`) | sí, con `--max-warnings 0` | sí |
| `tsc --noEmit` en CI | sí (desde `ci.yml`) | sí | sí |
| `next build` en CI | sí (desde `ci.yml`) | sí | — (no consta) |
| Escáner de credenciales (`keys:check-leak`) | sí (desde `ci.yml`) | sí | sí |
| Identidad legal (`check:legal`) | sí (desde `ci.yml`, y dentro de `build`) | n/a | n/a |
| Tests de aplicación | **0 ficheros** | 227 entradas en `tests/` | 372 entradas en `tests/` |
| Hook `pre-commit` | **no** | sí | no consta |
| Hook `pre-push` contra `main` | sí (local) | sí (local) | no consta |

«— (no consta)» = no lo he comprobado en `seda_os`, no que no exista. Las filas de
`seda_os` salen de leer su `ci.yml` y su carpeta `tests/`, no de ejecutarlo.

## Lo que este repo NO tiene

1. **Paridad real entre repos.** La huella (`invariantes.lock.json`) comprueba
   que el `CLAUDE.md` de este repo sigue diciendo lo acordado, pero **el lock
   mismo se copia a mano** a los tres repos: quien cambie un texto y regenere el
   lock en un solo repo se queda verde, y los otros dos también, hasta que alguien
   copie el fichero. `--parity` es local por construcción (compara directorios
   hermanos; en CI solo hay un checkout), así que **no lo ejecuta ningún CI y no
   puede; la paridad real entre repos hoy no la comprueba nadie**. El arreglo de
   fondo —que cada CI verifique la huella del otro repo por HTTP, patrón
   puntero→digest— es un encargo aparte.
2. **Tests.** `git ls-files | grep -cE '\.(test|spec)\.'` → 0. `verify` prueba
   que el sitio compila, pasa lint y conserva la identidad legal; no prueba que
   nada funcione. Este encargo enchufó gates, no escribió cobertura.
3. **`lint` sin `--max-warnings 0`.** Hoy hay 17 warnings en el árbol versionado
   (`no-img-element` y un `no-unused-vars`). Solo los errores rompen.
4. **Escáner de credenciales solo heurístico.** No sustituye a `gitleaks` ni
   `trufflehog`; no mira el historial de git, solo el árbol.

## Lo que depende de una decisión de Ángel

### `verify` no es un check requerido

La protección de `main` (rama y ruleset `web`) exige **un único check**:
`conflict-markers (marcadores de merge sin resolver)`. `verify` corre y se pone
rojo, pero **nada impide mergear un PR con `verify` en rojo** hasta que se añada
como check requerido en Settings → Branches / Rules. Hasta entonces, el CI es una
opinión. No lo toca este PR (la protección de rama no es cosa del encargo).
El nombre exacto del check a añadir es el del job:
`verify (legal + leak-scan + lint + tsc + build)`.

Además, `enforce_admins` está en `false` en la protección clásica y el ruleset
no tiene `bypass_actors`: quien administra el repo puede saltarse la rama
clásica.

### El `pre-push` describe un mundo que ya no es este

`.githooks/pre-push` dice, textualmente:

> This repo has no server-side branch protection — private repo
> on the GitHub Free plan, which requires Pro/Team/Enterprise
> for that on private repos.

Hoy eso es falso en dos puntos, medido con `gh api` el 19-sep-2026:

- El repo es **público** (`visibility: PUBLIC`), y en un repo público la
  protección de rama sí está disponible en el plan Free.
- `main` **tiene** protección de rama (PR obligatorio en el ruleset, check
  `conflict-markers` requerido, sin force-push ni borrado) y un ruleset activo.
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
