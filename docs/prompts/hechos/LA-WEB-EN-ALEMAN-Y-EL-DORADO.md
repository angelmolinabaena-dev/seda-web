# La web en alemán sin claves sueltas, y el dorado que se lee (seda-web)

**MODELO:** Sonnet 5.5 · **ESFUERZO:** medium. Son traducciones, un test de guarda y un ajuste de contraste.
**SESIÓN:** nueva, **local**, carpeta **`seda-web`** (`C:\Users\AngelMolina\seda-web`), sin worktree. `main` en `2c700c4` (#80).

---

## De dónde viene

El #80 dejó la web en Lighthouse 100 en SEO y escritorio, y encontró dos cosas que no eran del encargo:

- **Las páginas en alemán enseñan claves sin traducir** en producción, en la portada y en Experiencias (por ejemplo `home.services.transfer.title`). Un visitante alemán ve el nombre interno del texto.
- **/propietarios se queda en 96 de accesibilidad:** el dorado de marca no llega al contraste mínimo sobre crema ni sobre oliva. En el código ya hay un dorado más oscuro que cumple.

## Decisiones (Cowork, 11-oct)

1. **Ninguna clave sin traducir en ningún idioma.**
   - Compara `messages/en.json`, `fr.json` y `de.json` con `es.json`, que es la fuente.
   - Toda clave que falte, o que tenga como valor la propia clave o un texto en otro idioma, se traduce.
   - Las traducciones siguen el tono que ya tiene cada fichero (de usted: «Sie», «vous»), son naturales y no inventan nada que no diga el español.
   - Nombres propios, marcas y nombres de servicios (Guest App, SEDA OS, Sofía) se quedan como están.
2. **Test de guarda:**
   - los cuatro ficheros tienen exactamente las mismas claves;
   - ningún valor es igual a su clave;
   - ninguna página renderizada en `en`, `fr` o `de` contiene un texto con forma de clave (`algo.algo.algo`).
   - Velo en rojo antes, con las claves alemanas que faltan hoy.
3. **El dorado que se lee, solo donde no se lee.** En la letra sobre crema y sobre oliva que hoy no llega a 4,5:1 (o a 3:1 si es texto grande), usa el dorado oscuro que ya existe en el código.
   - El dorado de marca se queda en logos, líneas, iconos, fondos y en el texto grande que ya cumple.
   - Pon en el PR la lista de los elementos cambiados, con el contraste de antes y de después, y una captura de /propietarios antes y después.
   - Objetivo: /propietarios a 100 en accesibilidad.
4. Comprueba en el navegador la portada, Experiencias y /propietarios en alemán y en francés, a 360 px y en escritorio.

## Reglas

- No se cambia ningún texto en español.
- No tocar `seda_os`, `guest-app`, `CLAUDE.md` ni `.github/workflows/`. Nada de `git stash` ni cambiar de rama a mitad.
- Un commit por decisión, con su test visto en rojo antes.

## Git

- Rama `fix/la-web-en-aleman-y-el-dorado` desde `origin/main` actualizado.
- Al terminar, este fichero va a `docs/prompts/hechos/` con `git mv` (antes, `git add`).
- Pasan `npm test`, el lint y el build (con `check-legal-entity`).
- Push y PR.

## Cierre

Abre el PR y para. **NO mergees.** En la descripción va:
- cuántas claves faltaban en cada idioma y cuáles eran;
- la tabla de contraste;
- Lighthouse de /propietarios antes y después.

Pega la salida de `git branch --show-current`, `git status --short`, `git log origin/main..HEAD --oneline` y `gh pr view --json number,url`.

**MODELO:** Sonnet 5.5 · **ESFUERZO:** medium · **SESIÓN:** nueva, **local**, en `seda-web`, sin worktree.
