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
trabajo en dos sitios: el código queda en el worktree y los ficheros sin trackear
(assets nuevos, SVG, imágenes) siguen en el repo principal, porque **los untracked
no se propagan a los worktrees**.

Regla: trabajar en el directorio desde el que se lanzó la sesión. Si aun así se crea
un worktree, **decirlo de forma explícita en el resumen**, indicando ruta y qué
ficheros quedan allí, para poder consolidarlos antes de commitear.

> Incidente 2026-07-24/25 (`seda-web`, tarea de logo): ocurrió cuatro veces seguidas.
> Cada vez hubo que copiar a mano `navigation.tsx`, `hero.tsx` y `tailwind.config.ts`
> desde `.claude/worktrees/seda-web-logo-hero-a494f0` al repo principal antes del
> commit. Riesgo real: commitear los assets sin el código que los usa, o al revés.

## Verificar la rama ANTES de empezar

`git branch --show-current` antes de tocar el primer fichero. Crear la rama y olvidarlo
no deja ninguna senal hasta el push, cuando ya se ha trabajado sobre la rama equivocada.

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
