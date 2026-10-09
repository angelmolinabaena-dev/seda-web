# La web coherente: las cifras de PRICING, las imágenes rotuladas y los cinco idiomas completos (seda-web)

**MODELO:** Sonnet 5.5 · **ESFUERZO:** medium. Las decisiones están tomadas aquí.
**SESIÓN:** nueva, **local**, carpeta **`seda-web`** (`C:\Users\AngelMolina\seda-web`), sin worktree. `main` en
`036f11a` (#77).

---

## De dónde viene

La revisión del #77 (`docs/audit/REVISION-HUESPED-Y-PROPIETARIO.md`) dejó cosas para decidir y no completó la
revisión de idioma. Las decisiones son de Cowork, del 9-oct.

## Decisiones

1. **La comisión, igual que en `docs/PRICING.md` de seda_os** (léelo, no lo toques). El 24 % se aplica sobre:
   **bruto − comisión de la plataforma − tarifa de limpieza − extras del gestor**. Las páginas que no descuentan la
   limpieza (`/propietarios`, `/faq` y las que encuentres) se alinean con `/founding-owners` y `/meet`, que ya lo
   dicen bien. Si hay ejemplo numérico, usa el de PRICING (bruto 1.000 €, limpieza 100 €).
2. **El coste de alta, igual que en PRICING §3:** 0 € para las tres primeras firmas directas, 490 € para la cuarta
   y la quinta, y **1.290 €** después. «Sin coste de alta» a secas es falso: pasa a decir que las primeras firmas no
   pagan alta, con el número de plazas. **No inventes** plazas restantes ni fechas límite.
3. **Las imágenes que no son de la casa real** (los renders de villas y de las apps, y las fotos rotuladas con un
   pueblo en `/descubre`) llevan un rótulo visible «Imagen ilustrativa» en los cinco idiomas. Es la regla del 27-jul:
   nada de imágenes inventadas que pasen por reales. No borres ninguna imagen.
4. **Lo que sale en español en otros idiomas** (`/nosotros` entera y la biografía del fundador en `/propietarios`)
   se traduce a en, fr y de, de usted y con el mismo significado, en `messages/*.json` como el resto.
5. **El huésped no puede reservar.** Hoy es así a propósito: la colección no abre hasta que haya fichas reales y
   licencia. No se añade reserva ni precios. Lo que sí: allí donde la web dice «la colección abre en octubre de
   2026», se cambia por una frase que no caduque («Próxima apertura»), sin fecha.
6. **La revisión de idioma pendiente** (es truncada, y en, fr y de sin hacer).
   - Repítela con `ANTHROPIC_API_KEY_PRUEBAS` y **`claude-opus-5-5`**, **por lotes pequeños**: una página por
     llamada y `max_tokens` holgado, para que no se trunque.
   - El coste se calcula con los tokens que devuelve la API y el precio de la consola. Si no lo sabes, usa
     5/25 $ por millón y dilo.
   - **Tope: 3 $.**
   - Criterios: de usted, natural, el mismo significado que el español, ortografía y formatos. El español solo se
     toca si hay un error.
   - Tabla en el PR con todas las propuestas, aplicadas o no.

## Reglas

- No tocar `seda_os` ni `guest-app` (solo leer `docs/PRICING.md`), ni `CLAUDE.md` ni `.github/workflows/`. Nada de
  `git stash` ni cambiar de rama a mitad.
- Ninguna cifra nueva que no esté en PRICING.
- Un commit por decisión.

## Git

- Rama `fix/la-web-coherente` desde `origin/main` actualizado.
- Al terminar, este fichero va a `docs/prompts/hechos/` con `git mv` (antes, `git add`).
- Pasan lint, `tsc`, los tests y el build. Push y PR.

## Cierre

Abre el PR y para. **NO mergees.** En la descripción van cuatro cosas:
- cada decisión con su antes y su después;
- la tabla de idiomas;
- el coste real;
- lo que quede para Ángel.

Pega la salida de `git branch --show-current`, `git status --short`, `git log origin/main..HEAD --oneline` y
`gh pr view --json number,url`.

**MODELO:** Sonnet 5.5 · **ESFUERZO:** medium · **SESIÓN:** nueva, **local**, en `seda-web`, sin worktree.
