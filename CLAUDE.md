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
