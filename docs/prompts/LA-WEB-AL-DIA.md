# La web al día (seda-web)

**MODELO:** Sonnet 5.5 · **ESFUERZO:** medium. Son dependencias, un error de lint y la caché de dos imágenes.
No hay contenido, textos legales ni diseño que decidir.
**SESIÓN:** nueva, **local**, carpeta **`seda-web`** (`C:\Users\AngelMolina\seda-web`), sin worktree. Va en
paralelo con `seda_os` y `guest-app`. **No toques otros repos.**

---

## Lo medido (Cowork, 8-oct, `main` = `25cec71`, con #73 y #74 mergeados)

1. **Dependabot, 5 alertas abiertas:**

   | Paquete | Gravedad | Arreglo |
   |---|---|---|
   | `sharp` | alta | 0.35.5 |
   | `source-map-js` | alta | 1.2.2 |
   | `brace-expansion` (dos ramas) | media | 1.1.21 y 5.0.12 |
   | `postcss-selector-parser` | media | 7.1.6 |

   El PR #75 de Dependabot se cerró porque **quitaba `postcss-selector-parser`** y Tailwind dejaba de tipar
   `tailwind.config.ts` (`darkMode: ["class"]`), con lo que caían `tsc`, el build y Vercel. Mismo caso que el
   #883 de seda_os.
2. **`npm run lint` da 1 error** en `brand/web/SiteHeader.tsx:40`, que viene de antes del #73, más 4 avisos.
   Aun así `verify` pasa: averigua por qué el CI no lo para.
3. **La caché de `/villas/*`** es `public, max-age=2592000, immutable` (`vercel.json`). En el #73,
   `experiencias-hero.jpg` (2 MB → 155 KB) y `angel-molina.jpg` (392 → 34 KB) se recomprimieron **con el mismo
   nombre**: quien ya los tuviera en caché seguirá descargando la versión pesada hasta 30 días.

## Lo que se pide

1. **Dependencias**, de una en una, comprobando el build después de cada una:
   - `sharp` → 0.35.5, `source-map-js` → 1.2.2 y `brace-expansion` a sus versiones arregladas, con
     `npm update <paquete>` (o `overrides` si hace falta para una dependencia transitiva). **Nunca quitando
     `postcss-selector-parser`.**
   - `postcss-selector-parser` → 7.1.6 **solo si Tailwind lo acepta** y pasan `tsc` y el build. Si no, se
     queda y lo explicas en el PR (lo exige Tailwind; solo se usa al compilar).
   - `npm audit --omit=dev` antes y después, en el PR.
2. **El error de lint de `SiteHeader.tsx:40`:** arréglalo sin cambiar lo que se ve. Los 4 avisos, igual, si
   el arreglo es seguro; si no, se anotan.
3. **Por qué el CI no para un error de lint:** mira el script que ejecuta `verify` (no el workflow: la app no
   deja tocar `.github/workflows/`). Si el script de lint del `package.json` se lo traga (`|| true`, un
   `--quiet` que no sale con error, una carpeta excluida…), arréglalo en el script. Si el problema está en el
   workflow, dime qué línea cambiar y lo aplica Cowork.
4. **La caché de las dos imágenes:** dales un nombre nuevo (por ejemplo `experiencias-hero-v2.jpg` y
   `angel-molina-v2.jpg`) y actualiza todas sus referencias, para que nadie se quede con la versión pesada. El
   guardarraíl `tests/public-assets.test.ts` tiene que seguir pasando.

## Reglas

- No cambia el contenido: ni textos, ni qué fotos salen, ni el orden.
- No tocar `.github/workflows/` ni `CLAUDE.md`. Nada de `git stash` ni cambiar de rama a mitad.
- No crear `dependabot.yml`. Fuera de estos puntos no se arregla nada: se anota en el PR (por ejemplo, la
  decisión pendiente de `CCBot` en `robots.txt`).

## Git

- Rama `chore/la-web-al-dia` desde `origin/main` actualizado. Commits por punto.
- Al terminar, este fichero se añade a git en `docs/prompts/` (el repo no tiene `hechos/`).
- Pasan lint (sin errores), `tsc`, tests, build y el escáner de fugas. Push y PR.

## Cierre

Abre el PR y para. **NO mergees.** En la descripción: `npm audit` antes y después, qué pasó con
`postcss-selector-parser`, por qué el CI no paraba el lint y cómo queda.

Pega la salida de `git branch --show-current`, `git status --short`, `git log origin/main..HEAD --oneline` y
`gh pr view --json number,url`.

**MODELO:** Sonnet 5.5 · **ESFUERZO:** medium · **SESIÓN:** nueva, **local**, en `seda-web`, sin worktree.
