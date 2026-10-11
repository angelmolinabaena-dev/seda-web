# La portada en su idioma: el título y la descripción que ve Google en inglés, francés y alemán (seda-web)

**MODELO:** Sonnet 5.5 · **ESFUERZO:** medium. Son metadatos y su test de guarda.
**SESIÓN:** nueva, **local**, carpeta **`seda-web`** (`C:\Users\AngelMolina\seda-web`), sin worktree. `main` en `df4399b` (#81).

---

## De dónde viene

Medido en producción el 11-oct, la portada sirve el mismo `<title>` y la misma `meta description` en español en los cuatro idiomas:

| URL | `<title>` | description |
|---|---|---|
| `/` | SEDA Private Homes — Villas privadas en la Costa del Sol | Gestión de villas privadas en la Costa del Sol… |
| `/en`, `/fr`, `/de` | **lo mismo, en español** | **lo mismo, en español** |

El resto de páginas ya lo hace bien. Por ejemplo, `/de/propietarios` da «Ihre Immobilie, vollständig unter Kontrolle.» y `/fr/experiencias` da «Des expériences pensées autour de votre séjour.». El #81 lo dejó anotado como fuera de alcance.

Es lo que Google y las IA enseñan como resultado para la portada en cada idioma.

## Qué hay que hacer

1. **La portada saca su `title`, su `description` y sus Open Graph y Twitter de los mensajes del idioma**, igual que las demás páginas.
   - Si los textos ya existen en `messages/*.json`, úsalos.
   - Si no existen, tradúcelos del español con el tono de cada fichero (de usted, «Sie», «vous»), sin inventar nada que no diga el español.
   - El `title` en español no cambia.
2. **Test de guarda:** para cada página de la web y cada idioma que no sea `es`, el `title`, la `description` y el `og:title` no son iguales a los de `es`, salvo la marca sola. Velo en rojo antes con la portada.
3. **Comprueba en el build** el `<head>` de `/`, `/en`, `/fr` y `/de`: title, description, `og:locale` y `hreflang`.

## Reglas

- No cambies ningún texto en español ni el diseño.
- No tocar `seda_os`, `guest-app`, `CLAUDE.md` ni `.github/workflows/`. Nada de `git stash` ni cambiar de rama a mitad.

## Git

- Rama `fix/la-portada-en-su-idioma` desde `origin/main` actualizado.
- Al terminar, este fichero va a `docs/prompts/hechos/` con `git mv` (antes, `git add`).
- Pasan `npm test`, el lint y el build (con `check-legal-entity`).
- Push y PR.

## Cierre

Abre el PR y para. **NO mergees.** En la descripción va la tabla de la portada en los cuatro idiomas, antes y después.

Pega la salida de `git branch --show-current`, `git status --short`, `git log origin/main..HEAD --oneline` y `gh pr view --json number,url`.

**MODELO:** Sonnet 5.5 · **ESFUERZO:** medium · **SESIÓN:** nueva, **local**, en `seda-web`, sin worktree.
