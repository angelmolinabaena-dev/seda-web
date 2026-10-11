# La web al 100: Lighthouse 100 en móvil y escritorio, y lo que leen los buscadores y las IA, generado solo (seda-web)

**MODELO:** Opus 5.5 · **ESFUERZO:** medium. Hay que medir antes de tocar nada.
**SESIÓN:** nueva, **local**, carpeta **`seda-web`** (`C:\Users\AngelMolina\seda-web`), sin worktree. `main` en `733c343` (#79).

---

## De dónde viene

La pestaña SEO del admin de seda_os mide `https://sedaprivatehomes.com/` con PageSpeed Insights. El 11-oct daba **84 en móvil** y 98 en escritorio, solo en rendimiento.

Lo que leen los buscadores y las IA ya existe, pero escrito a mano:
- `public/llms.txt` es un fichero estático;
- la home lleva `Organization`, `LodgingBusiness` y `FAQPage` en JSON-LD;
- los `hreflang` solo están en el sitemap, no en el `<head>`.

Ángel quiere la pestaña SEO al 100 % y que el SEO y el GEO (lo que entienden ChatGPT, Claude, Perplexity y los resúmenes de Google) se mantengan solos.

## Qué hay que hacer

1. **Medir primero.** Lighthouse en local contra el build de producción (`next build` y `next start`, o la URL de producción), en móvil y en escritorio, con las cuatro categorías: rendimiento, accesibilidad, buenas prácticas y SEO.
   - Páginas: la home, una de propiedad, la de propietarios, la de contacto y la home en inglés.
   - Pon la tabla en el PR antes de arreglar nada.
2. **Llegar a 100 en las cuatro categorías, en móvil y en escritorio, en esas páginas.** Un commit por causa (LCP de la portada, tamaño de imágenes, fuentes, JS que sobra, contraste, etiquetas, enlaces…), con la medida de antes y de después.
   - Si alguna página no puede llegar a 100 sin quitar algo que Ángel quiere (el vídeo, un tour, una fuente de marca), déjala en lo máximo posible y explícalo en el PR con la cifra.
   - No se cambia el diseño ni los textos. Si un arreglo los toca, va a la lista del PR.
3. **El GEO, generado solo desde los datos:**
   - `llms.txt` (y `llms-full.txt`, si encaja) se genera como ruta a partir de las mismas fuentes que pintan la web (propiedades, servicios, zonas, FAQ), en vez de un fichero escrito a mano. Una propiedad nueva aparece sin tocarlo.
   - JSON-LD por tipo de página: la propiedad como `LodgingBusiness`/`Accommodation`, con dirección de zona (sin la exacta), capacidad, servicios y fotos; las zonas como `Place`; la FAQ como `FAQPage`; y `BreadcrumbList`. Nada inventado: si un dato no está en la fuente, no se pone.
   - `hreflang` y `canonical` en el `<head>` de cada página, en los idiomas que ya tiene la web.
   - `robots.ts`: permite los rastreadores de IA de búsqueda (GPTBot, OAI-SearchBot, ClaudeBot, Claude-SearchBot, PerplexityBot, Google-Extended) además de los de siempre. Decisión de Ángel del 11-oct: queremos que las IA recomienden SEDA.
4. **Test de guarda:** el JSON-LD de cada tipo de página valida contra su esquema (los campos obligatorios están y no hay `undefined` ni cadenas vacías). `llms.txt` lista todas las propiedades publicadas, y `robots.txt` y el sitemap responden.

## Reglas

- No cambiar el diseño, los textos ni la marca.
- Cero DDL y cero DML contra producción.
- No tocar `seda_os`, `guest-app`, `CLAUDE.md` ni `.github/workflows/`. Nada de `git stash` ni cambiar de rama a mitad.

## Git

- Rama `perf/la-web-al-100` desde `origin/main` actualizado.
- Si el repo tiene `docs/prompts/` y cola, este fichero va a `docs/prompts/hechos/` con `git mv` (antes, `git add`).
- Pasan `npm test`, el lint y el build (con `check-legal-entity`).
- Push y PR.

## Cierre

Abre el PR y para. **NO mergees.** En la descripción va:
- la tabla de Lighthouse antes y después, por página, dispositivo y categoría;
- un ejemplo del JSON-LD de una propiedad y del `llms.txt` generado;
- lo que no llegó a 100 y por qué.

Pega la salida de `git branch --show-current`, `git status --short`, `git log origin/main..HEAD --oneline` y `gh pr view --json number,url`.

**MODELO:** Opus 5.5 · **ESFUERZO:** medium · **SESIÓN:** nueva, **local**, en `seda-web`, sin worktree.
