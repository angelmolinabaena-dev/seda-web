# La web que carga en el móvil (seda-web)

**MODELO:** Sonnet 5.5 · **ESFUERZO:** medium. Es rendimiento medible: imágenes, vídeo y carga. No hay
dinero, textos legales ni decisiones de contenido.
**SESIÓN:** nueva, **local**, carpeta **`seda-web`** (`C:\Users\AngelMolina\seda-web`), sin worktree. Va en
paralelo con `seda_os` y `guest-app`. **No toques otros repos.**

---

## Lo medido (Cowork, 8-oct, `main` = `b9afc79`)

| Qué | Hoy |
|---|---|
| Lighthouse móvil / escritorio (medida anterior) | **75 / 94** |
| `public/` | **218,6 MB**, 132 imágenes, **82 PNG de más de 1 MB** |
| Vídeos en `public/` | 9, en total unos 58 MB. Hay duplicados con `(1)` en el nombre y el mayor pesa 15,8 MB |
| Portada (`components/hero.tsx:96-108`) | `<video src="/hero.mp4">` (3 MB) con **`preload="auto"`**, `autoPlay` y `loop`; tiene póster |
| `next/image` | solo en 2 ficheros; hay 1 `<img>` crudo |

Es lo mismo que pasó en guest-app #344: muchos «JPG» o PNG pesados que salían de generadores de imagen sin
convertir. **Mira los magic bytes antes de dar nada por JPEG.**

## Lo que se pide

1. **Mide antes:** Lighthouse móvil de la portada, de una página de propiedad y de la de propietarios (`npx
   lighthouse` o Playwright con el perfil móvil). Guarda las tres cifras y LCP, CLS y bytes transferidos.
2. **Imágenes:**
   - recomprímelas al formato que toque (JPEG progresivo para fotos, PNG solo si hay transparencia) y
     cambia la referencia si cambia la extensión;
   - verifica la calidad por SSIM, con el umbral de guest-app #344 (`docs/IMAGENES_GUEST.md` de ese repo),
     y mira a ojo las ocho peores a tamaño móvil;
   - las imágenes visibles van con `next/image`, con `sizes` correcto, y solo la de la portada con
     `priority`.
3. **Vídeo:**
   - `preload="metadata"` (o `none` con el póster) en la portada;
   - en móvil, la portada no descarga el vídeo hasta que se ve el póster (o queda solo el póster con
     `prefers-reduced-data`/`saveData`, si lo soporta). Elige lo más simple y dilo;
   - recomprime `hero.mp4` (H.264, sin audio, ancho adecuado) sin que se note.
4. **Lo que no usa nadie:** lista los ficheros de `public/` que ninguna página referencia (los vídeos con `(1)`
   y los que sobren). Quítalos con `git rm` en un commit propio, con la lista en el PR. Si dudas de uno, se
   queda y lo anotas.
5. **Mide después** las mismas tres páginas, con la misma herramienta. Objetivo: **móvil ≥ 90** en la portada.
   Si no se llega, explica qué lo frena.
6. **Que no vuelva:** un test o un guardarraíl que falle si entra en `public/` una imagen de más de un tamaño
   razonable (propón el límite) o un PNG que en realidad es una foto. Engánchalo donde ya corran los
   guardarraíles del repo, sin tocar `.github/workflows/`.

## Reglas

- **No se cambia el contenido:** ni textos, ni qué fotos salen, ni el orden. Solo peso y forma de carga. (Las
  fotos generadas con IA las cambiará Ángel por reales antes de abrir: no las sustituyas tú.)
- No tocar `.github/workflows/` ni `CLAUDE.md`. Nada de `git stash` ni cambiar de rama a mitad.
- Fuera de esto no se arregla nada: se anota en el PR (por ejemplo, la decisión pendiente de `CCBot` en
  `robots.txt`).

## Git

- Rama `perf/la-web-que-carga-en-el-movil` desde `origin/main` actualizado. Commits por punto.
- Al terminar, este fichero va a `docs/prompts/hechos/` con `git mv` si el repo sigue ese patrón; si aún no
  está en git, primero `git add`.
- Pasan lint, `tsc`, tests, build y el escáner de fugas del repo. Push y PR.

## Cierre

Abre el PR y para. **NO mergees.** En la descripción:
- una tabla de antes y después: Lighthouse móvil de las tres páginas, LCP, bytes transferidos y peso de
  `public/`;
- la lista de ficheros quitados;
- capturas de la portada en móvil antes y después.

Pega la salida de `git branch --show-current`, `git status --short`, `git log origin/main..HEAD --oneline` y
`gh pr view --json number,url`.

**MODELO:** Sonnet 5.5 · **ESFUERZO:** medium · **SESIÓN:** nueva, **local**, en `seda-web`, sin worktree.
