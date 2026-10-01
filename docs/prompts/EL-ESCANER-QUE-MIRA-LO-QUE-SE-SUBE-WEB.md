# El escáner que mira lo que se sube (seda-web)

> **@estado:** `hecho`

**MODELO:** Sonnet. Es portar un arreglo ya hecho y probado en guest-app (#430).
**ESFUERZO:** medium.
**SESIÓN:** nueva, **local**, carpeta **`seda-web`** (`C:\Users\AngelMolina\seda-web`), sin
worktree.

> **Visto bueno de Ángel (1-oct) para cambiar este guardarraíl**, solo en lo que dice este
> encargo (los guardarraíles no se tocan sin su autorización).

---

## De dónde viene

- **guest-app #430** cambió su escáner de fugas (`scripts/keys-check-leak.mjs`) así:
  - **en el hook de pre-commit** (`--staged`) revisa solo lo que está en stage, con su contenido
    en stage;
  - **en CI y en `npm run`** revisa los ficheros trackeados más los no ignorados;
  - un `.env` o `.env.*` (salvo `.env.example`), `*.pem` o `*.key` en stage bloquea aunque no
    tenga dentro un secreto;
  - al bloquear imprime **solo el nombre del patrón, el fichero y la línea**, nunca parte del
    secreto (antes sacaba los 12 primeros caracteres);
  - `.env.example` se revisa como cualquier otro fichero.
- **La tabla `PATTERNS` es compartida** entre seda_os, guest-app y seda-web
  (`compartidos.lock.json`), y el #430 no la tocó.

## Lo que se pide

1. **Lee el diff del #430:**
   `gh pr diff 430 -R angelmolinabaena-dev/guest-app`
   Lee también cómo es hoy el escáner de seda-web y qué lo llama (hooks, CI, `package.json`).
   Dilo en el PR.
2. **Lleva el mismo comportamiento** al escáner de seda-web, adaptado a lo que tenga el repo:
   - en el hook, `--staged`;
   - en CI, trackeados más no ignorados;
   - los ficheros sensibles en stage bloquean;
   - **nunca se imprime parte de un secreto.**
3. **La tabla `PATTERNS` no se toca.** `node scripts/compartidos-check.mjs` (o como se llame en
   seda-web) tiene que seguir en verde contra los otros dos repos.
4. **Tests,** los mismos ocho casos del #430, con su equivalente en el runner de seda-web. Los que
   apliquen, vistos en rojo con el escáner viejo:
   - un ignorado con secreto no bloquea;
   - un `git add -f` del mismo fichero sí bloquea;
   - un `.env` en stage bloquea;
   - `.env.example` no bloquea si está limpio;
   - un secreto en un fichero trackeado bloquea;
   - la salida no contiene ningún carácter del secreto.
5. **Si seda-web no tiene hook de pre-commit o no tiene escáner,** dilo y **para** antes de
   inventar uno.

## Límites

- **No cambies** los patrones ni ningún otro guardarraíl.
- **No imprimas** ningún secreto en logs, tests, PR ni chat.
- **No borres** ficheros locales de secretos.
- **No tocar** seda_os ni guest-app.
- **`GIT_OPTIONAL_LOCKS=0`** en el git de solo lectura.

## Git

- Rama `fix/el-escaner-que-mira-lo-que-se-sube` desde `origin/main` actualizado.
- Commit: `Escáner de fugas: revisa lo que git puede subir y no enseña el secreto`.
- **Pasan:** los tests, el lint, el build y el check de compartidos que tenga el repo.
- Push y PR.

## Cierre

Abre el PR y para. **NO mergees.** Pega la salida de estos comandos:

- `git rev-parse --show-toplevel`
- `git branch --show-current`
- `git status --short`
- `git log origin/main..HEAD --oneline`
- `gh pr view --json number,url`

**MODELO:** Sonnet · **ESFUERZO:** medium · **SESIÓN:** nueva, **local**, en `seda-web`, sin
worktree.
