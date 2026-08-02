# SUPERFICIE DE PUBLICACIÓN — dónde va a vivir el contenido

**MODELO: Sonnet 5**
**ESFUERZO: estándar**

**Criterio de routing:** Sonnet. Es enrutado, marcado y fontanería de i18n sobre patrones que este repo ya usa. Sin dinero, sin gates, sin criterio legal — porque **este prompt no escribe ni una línea de contenido**. Esa es la parte que solo puede hacer Ángel, y está expresamente prohibida aquí.

---

## Por qué esto

La base técnica de visibilidad quedó cerrada el 2026-08-02 (`docs/audit/GEO-BASE.md`): los diez rastreadores de IA entran, el canonical y el hreflang son correctos, el renderizado sin JS funciona.

Pero **no hay nada que rastrear**. `seda-web` tiene páginas de producto y ninguna de contenido. La única cola donde SEDA puede ser la mejor fuente en español de la Costa del Sol —el marco normativo del alquiler turístico— no tiene dónde publicarse.

Esto construye el sitio, no el contenido.

## Qué construir

### 1. La ruta

Una sección de guías bajo `/guias` (o el nombre que encaje con la nomenclatura del repo — **mira cómo se nombran las rutas existentes y sigue el patrón**, no inventes uno).

- Índice con listado
- Ficha individual por guía
- Las cuatro variantes de idioma (`es/en/fr/de` — este repo no tiene `it`)

### 2. El modelo de contenido

Decide dónde viven las guías: MDX en el repo, o datos estructurados como `lib/villas.ts` hacía con las villas. **Explica en el PR por qué eliges uno.** Criterio: Ángel escribe en español y traduce después; el formato tiene que hacer eso llevadero.

Campos mínimos por guía:

- título, entradilla, cuerpo
- **fecha de publicación y fecha de última revisión**, ambas visibles en la página
- autor, con enlace a una entidad de autor
- fuentes: lista de enlaces a norma primaria (BOE, AEAT, BOJA)
- estado: `borrador` o `publicada`

### 3. La puerta

**`estado: borrador` implica `noindex` y fuera del sitemap.** Sin excepción, y fallando cerrado: si el campo falta o no se puede leer, es borrador.

Una guía a medio escribir no puede acabar indexada. Es la misma disciplina que `esPublicable` para propiedades.

### 4. Marcado

Por guía publicada, JSON-LD `Article`:

- `headline`, `datePublished`, `dateModified`
- `author` como `Person`, enlazado a la `Organization` que ya existe en el layout
- `inLanguage`
- `isPartOf` apuntando al índice

**No emitas `Review`, `AggregateRating` ni ninguna valoración.** No hay ninguna.

En el índice, `CollectionPage` o `ItemList`. Nada más: la guía de Google de mayo de 2026 dice explícitamente que los schemas especiales para IA no sirven.

### 5. Integración

- Índice y guías publicadas en el `sitemap.xml`, con sus cuatro variantes
- `hreflang` recíproco, como el resto del sitio
- Enlace desde la navegación y desde el pie, **solo cuando haya al menos una guía publicada**. Si no hay ninguna, la sección no se enlaza
- Metadata propia por guía: `title`, `description`, Open Graph

### 6. La entidad de autor

Una página o bloque de autor para Ángel, con lo que sea **verificable**: fundador de SEDA Private Homes, fundador de Hotel Estepona Plaza.

**Nada de premios, cifras, años de experiencia ni credenciales que no puedas trazar.** Si no está documentado, no se escribe. Ese fue el error que se limpió el 2 de agosto en todo el sitio.

### 7. Una guía de prueba, marcada como borrador

Para validar el sistema hace falta una guía. Créala **en estado borrador**, con:

- título y estructura de secciones
- cuerpo con texto de relleno **evidente** (no párrafos que parezcan reales)
- las fechas, el autor y las fuentes en blanco o marcados como pendientes

Comprueba con ella que el `noindex` funciona, que no entra en el sitemap y que el JSON-LD se emite bien.

**Ángel escribirá el contenido real.** Cualquier texto que parezca una guía de verdad se retira.

## Verificación

- `curl` sobre la guía en borrador: `noindex` presente, ausente del sitemap.
- Simula el paso a `publicada` y comprueba que aparece en el sitemap y desaparece el `noindex`. Devuélvela a borrador después.
- Paridad i18n en los 4 idiomas para las cadenas de interfaz.
- JSON-LD parseado del DOM, no leído del código.
- `npm run build` limpio.

## Entregables

- PR contra `seda-web`, sin mergear.
- Un apartado en el PR explicando **cómo escribe Ángel una guía nueva**: qué fichero crea, qué campos rellena, cómo la pasa a publicada. Corto y práctico.
- Al terminar, ejecuta y pega `git status --short`, `git log origin/main..HEAD --oneline` y `gh pr view --json number,url`.

## Prohibido

- **Escribir contenido real.** Ni una guía, ni un párrafo que pueda confundirse con uno.
- Afirmar nada sobre normativa, fiscalidad o licencias.
- Inventar credenciales, premios o cifras en la entidad de autor.
- Enlazar la sección desde la navegación si no hay guías publicadas.
- Mergear.

---

**MODELO: Sonnet 5 · ESFUERZO: estándar** — recuérdalo en el resumen final del trabajo.
