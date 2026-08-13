# SEDA WEB — Claude Code

Sitio público de marketing de SEDA Private Homes.

Invariantes de trabajo compartidos con `seda_os` y `guest-app`.

---

## Base de datos — Claude Code NUNCA escribe

Claude Code tiene acceso de **SOLO LECTURA** a la base de datos.

- **Prohibido DDL:** CREATE, ALTER, DROP, constraints, índices, políticas RLS.
- **Prohibido DML:** INSERT, UPDATE, DELETE, TRUNCATE. Incluye "corregir un dato
  de prueba", "limpiar una fila" o "dejarlo a NULL".
- **Permitido:** SELECT para verificar estado.

Cuando un cambio de datos sea necesario, Claude Code **entrega el SQL y para**.
Lo ejecuta Ángel en Supabase Studio.

Esto aplica aunque el usuario parezca autorizarlo en una respuesta rápida: si una
opción ofrecida dice "yo o tú lo hago", la interpretación por defecto es que lo
hace **Ángel**. Ante la duda, entregar el SQL y esperar.

> Incidente 2026-07-22 (en `seda_os`, la regla aplica a los tres repos): una opción
> redactada como "Yo (o tú) actualizo nuki_code de SP-00090…" se interpretó como
> autorización y Claude Code ejecutó un UPDATE en producción. Refuerzo aplicado:
> `execute_sql` y `apply_migration` retirados de la allow-list de
> `.claude/settings.local.json`, de modo que toda escritura exige confirmación.

---

## Ramas: siempre desde main actualizado

Toda rama nueva sale de `main` actualizado (`git pull` antes de `git checkout -b`).
**NUNCA** construir una rama encima de otra rama pendiente de merge.

> Incidente 2026-07-22 (en `seda_os`): el PR #185 se construyó sobre la rama del
> #184. Al mergear ambos, GitHub marcó #185 como MERGED pero su contenido nunca
> llegó a `main` (el squash quedó vacío). El validador de códigos de acceso quedó
> fuera de producción sin ninguna señal de error. Se detectó solo al probar en
> pantalla.

**"MERGED" en GitHub no garantiza que el código esté en main.**
Verificación obligatoria tras cada merge:

```
git fetch origin && git log origin/main --oneline -3
```

El commit debe aparecer ahí. Si no aparece, recuperar con `git cherry-pick <sha>`
en una rama nueva desde `main` y abrir PR.

---

## Merge

Ángel es el único que mergea (`gh pr merge --squash`). Claude Code abre PR y para.

---

## Worktrees: trabajar en el directorio actual

Claude Code tiende a crear un worktree propio en `.claude/worktrees/`. Eso parte el
trabajo: el codigo queda en el worktree y los ficheros sin trackear (assets, SVG,
imagenes) siguen en el repo principal, porque los untracked no se propagan.

Regla: trabajar en el directorio desde el que se lanzo la sesion. Si aun asi se crea
un worktree, decirlo explicitamente en el resumen con la ruta y que ficheros quedan alli.

## Verificar la rama ANTES de empezar

`git branch --show-current` antes de tocar el primer fichero. Crear la rama y olvidarlo
no deja ninguna senal hasta el push, cuando ya se ha trabajado sobre la rama equivocada.

El selector de rama de la app de Claude Code recuerda la última sesión, no `main`.
Comprobarlo en el desplegable antes de enviar el encargo, no después.

## Una sesión por checkout

**Nunca dos sesiones de Claude Code sobre el mismo working copy.** Si hace falta
paralelismo, cada una en su propio worktree.

Y `git add` siempre con **rutas explícitas**. Nunca `git add .` ni `git add -A`:
arrastra lo que haya escrito otra sesión, aunque esté a medio hacer.

> Incidente 2026-08-01 (en `guest-app`): dos sesiones compartían
> `C:\Users\AngelMolina\guest-app`. Una hizo `git add` amplio y se llevó al commit
> el fichero de test a medio escribir de la otra —`tests/chat-rate-limit.test.ts`,
> 306 líneas— **sin** el módulo que importaba, que aún no existía. `main` quedó con
> 15 tests importando un módulo inexistente, y el trabajo acabó en dos PRs
> duplicados (#124 y #125). No hubo ninguna señal hasta que falló la suite.

## Un test en verde no demuestra corrección

Un test escrito por quien escribió el código demuestra consistencia interna,
no corrección. Si el autor entendió mal la regla, el test ratifica el
malentendido y pasa en verde para siempre.

Tres casos documentados en este proyecto, todos con la suite en verde:

> - El backlog de `seda_os` leyó código sin ejercitarlo: 25% de fichas
>   falsas, y 5 de las 8 erróneas ya lo eran el día que se escribieron.
> - `tests/comparativa-desglose` afirmaba que con `reservas: []` el
>   comparador debía traer un fee de 275 € sobre 0 € de bruto. No detectaba
>   el defecto: lo exigía.
> - `tests/modelo-179-deadline` protegía con 8 tests el cálculo trimestral
>   de un modelo derogado por el RD 117/2024.

Regla: para afirmar que algo es correcto hay que confrontarlo con una fuente
externa al código — la norma, el contrato, un número calculado a mano, o una
consulta a la base de datos. Confrontarlo con otro artefacto escrito en la
misma sesión no cuenta.

Aplica especialmente a: importes y comisiones, plazos legales, obligaciones
fiscales, y cualquier cifra que se muestre a un propietario o a un huésped.

## «No mergees» no significa «no termines»

Un encargo termina con el trabajo **empujado y con PR abierto**. Que el prompt diga «no mergees» solo excluye el merge: no excluye commitear, pushear ni abrir el PR.

Antes de dar por cerrada una sesión, ejecuta y pega el resultado:

```
git rev-parse --show-toplevel     # ¿en qué repo estoy?
git branch --show-current          # ¿en qué rama?
git status --short                 # ¿queda algo sin commitear?
git log origin/main..HEAD --oneline # ¿el commit está por encima de main?
gh pr view --json number,url       # ¿existe el PR?
```

Si `git status --short` no está vacío, **la sesión no ha terminado**. Si `git log origin/main..HEAD` sale vacío, no hay commit y la rama está vacía por mucho que se haya pusheado.

**No afirmes haber hecho commit, push o PR sin haberlo comprobado con estos comandos.** Ocurrió cuatro veces el 2026-08-02: en un caso el trabajo quedó sin commitear en un worktree cuyo nombre no correspondía a la tarea, y solo se descubrió al fallar `gh pr create` con «could not find any commits between origin/main and la rama».

**Sobre los worktrees:** el directorio desde el que arranca la sesión puede no ser el que anuncia, puede desregistrarse a mitad, o ser una copia plana sin `.git` cuyos comandos operan sobre el checkout principal. Comprueba con `git rev-parse --git-dir` antes de tocar nada, y di en el resumen final **desde qué ruta exacta** trabajaste.

## Economía de sesión

El coste dominante de una sesión no son los tokens del prompt: es descubrir a mitad
del trabajo que la premisa era falsa y tener que relanzar. Relanzar tira todo el
contexto de código ya leído. Estas reglas están para evitar eso.

### 1 · No crees worktrees

Trabaja en el checkout principal con `git checkout -b`. Nada más.

El 2026-08-04 se eliminaron 53 worktrees entre los tres repos, 27 de ellos huérfanos
—registrados en disco pero no en git—. Cada uno arrastra su propio `node_modules`
(~700 MB en guest-app) y, lo que importa más, es un sitio donde una sesión puede
arrancar creyendo estar aislada mientras sus comandos operan sobre el checkout
principal. Ya ocurrió: una sesión escribió sobre `main` sin saberlo.

Efecto colateral medido: `npm run lint` en guest-app fallaba con **6.534 errores**
procedentes de `.claude/worktrees/`, que eslint no ignoraba. El número dependía de
cuántos worktrees hubiera en local, no del código.

Si crees que necesitas un worktree, no lo crees: dilo en el resumen y explica por qué.

### 2 · Comprueba antes de afirmar una ausencia

Antes de escribir «falta X», «no existe», «queda por hacer», «está vacío» o «hay que
crear», **compruébalo** con `grep`, un `SELECT`, o `curl` contra producción. Y cita la
comprobación en la misma frase.

La asimetría que lo explica: «X existe y hace Y en `fichero:línea`» es autoverificante
—para escribirlo hay que haberlo visto—. «X no existe» no tiene evidencia por
construcción. Medido en el PR #244 de seda_os: las afirmaciones de tipo «X no existe
en ninguna parte» salieron **erróneas 7 de 7**.

Si no puedes comprobarlo, escribe «no me consta, habría que verificar con X». Nunca lo
afirmes.

### 3 · Si el encargo ya está hecho, dilo y para

Un brief puede estar equivocado. Si al empezar descubres que el trabajo ya existe,
**no lo rehagas y no inventes una tarea sustituta**: verifica que está hecho, pega la
prueba (commit, PR, `curl` contra producción) y para.

Es la respuesta correcta y ahorra una sesión entera. Ha pasado dos veces y las dos
veces la sesión acertó al pararse.

### 4 · No hagas trabajo de inventario

Listar ramas, contar ficheros, medir tamaños, comprobar qué existe: eso se resuelve más
barato fuera de una sesión de código. Si un encargo consiste sobre todo en inventariar,
dilo en vez de ejecutarlo.

Tu trabajo es escribir código y documentos.

### 5 · Comprobación de arranque

Lo primero de cada sesión, antes de leer nada:

```
git rev-parse --git-dir
git rev-parse --show-toplevel
git branch --show-current
```

`--git-dir` debe apuntar al repo principal, no a un worktree. Si no coincide con lo que
el encargo espera, **para y dilo** en vez de trabajar en el sitio equivocado.

### 6 · Cierre

Un encargo termina con el trabajo commiteado, pusheado y con PR abierto. «No mergees»
no significa «no termines».

Antes de cerrar, ejecuta y pega la salida literal de:

```
git rev-parse --git-dir
git rev-parse --show-toplevel
git branch --show-current
git status --short
git log origin/main..HEAD --oneline
gh pr view --json number,url
```

Si `git log origin/main..HEAD` sale vacío, no hay commit por mucho que el push diga
«done».