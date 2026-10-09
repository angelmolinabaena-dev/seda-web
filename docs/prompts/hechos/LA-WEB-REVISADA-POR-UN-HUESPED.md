# La web revisada por un huésped y por un propietario (seda-web)

**MODELO:** Sonnet 5.5 · **ESFUERZO:** medium. Es una revisión con la API, con tope de gasto.
**SESIÓN:** nueva, **local**, carpeta **`seda-web`** (`C:\Users\AngelMolina\seda-web`), sin worktree. `main` en
`084b747` (#76).

---

## De dónde viene

La web de SEDA ya carga bien en el móvil (#73) y está al día (#76). Nadie ha leído su texto como lo leerá quien
llega a ella: un **huésped** que busca casa en la Costa del Sol, o un **propietario** que piensa en dejar la suya a
SEDA. Hay crédito promocional de la API hasta el 28-oct.

## Clave y coste

- seda-web no tiene clave de la API. Ángel añade `ANTHROPIC_API_KEY_PRUEBAS` a su `.env.local` antes de lanzar.
  **Si no existe, para y dilo. No la busques en otros repos.**
- **Tope: 4 $.** El script se para solo al llegar. Di el coste real en el PR.

## Lo que se pide

1. **Extrae el texto** de cada página pública, en cada idioma que tenga la web, tal como lo ve el visitante
   (`next build` + Playwright, o desde las fuentes). Guarda también las rutas, los enlaces de cada página y los
   formularios.
2. **Dos lectores** con `claude-opus-5-5`:
   - **El huésped:** «buscas una casa de lujo para una semana en la Costa del Sol, vienes de Alemania, Reino
     Unido o Francia». Responde:
     - ¿entiendes qué es SEDA?
     - ¿cómo reservo?
     - ¿qué incluye?
     - ¿qué te da confianza y qué te la quita?
     - ¿qué no se entiende?
   - **El propietario:** «tienes un apartamento en Estepona y te planteas dejarlo a SEDA». Responde:
     - ¿qué hace SEDA por ti y cuánto cobra?
     - ¿qué te preocupa?
     - ¿qué echas en falta para decidir?
     - ¿hay algo que suene a promesa difícil de cumplir?
3. **Revisión de idioma:** cada idioma, como un nativo:
   - ortografía;
   - naturalidad;
   - de usted;
   - el mismo significado que el español.
4. **Comprobaciones mecánicas,** sin la API:
   - cada enlace funciona (internos y externos, incluida la booking page de Beds24 si la enlaza);
   - ningún texto de prueba ni de relleno;
   - ninguna imagen inventada que se presente como real (regla del 27-jul: nada de imágenes generadas como si
     fueran la casa);
   - ninguna cifra (comisión, precios) que contradiga `docs/PRICING.md` de seda_os. Esto último se comprueba
     **leyendo** ese fichero, sin tocar seda_os.
5. **Arregla** lo pequeño y claro: erratas, enlaces rotos, textos que no se entienden. Lo que sea una decisión de
   negocio o de marca (qué se promete, qué se cobra, el tono) **se anota para Ángel y no se cambia**.

## Reglas

- No tocar `seda_os` ni `guest-app` (solo leer `docs/PRICING.md`), ni `CLAUDE.md` ni `.github/workflows/`. Nada de
  `git stash` ni cambiar de rama a mitad.
- Los resultados de la revisión no se versionan, salvo el resumen en `docs/audit/`.

## Git

- Rama `chore/la-web-revisada` desde `origin/main` actualizado.
- Al terminar, este fichero va a `docs/prompts/hechos/` con `git mv` (antes, `git add`).
- Pasan lint, `tsc` y el build. Push y PR.

## Cierre

Abre el PR y para. **NO mergees.** En la descripción van cuatro cosas:
- lo que entendió y no entendió cada lector;
- los arreglos;
- lo que queda para Ángel;
- el coste.

Pega la salida de `git branch --show-current`, `git status --short`, `git log origin/main..HEAD --oneline` y
`gh pr view --json number,url`.

**MODELO:** Sonnet 5.5 · **ESFUERZO:** medium · **SESIÓN:** nueva, **local**, en `seda-web`, sin worktree.
