# El CI que solo mira marcadores de conflicto

## Lo que hay hoy, medido el 19-sep-2026

`seda-web` es la web pública de SEDA. `main` **auto-despliega a producción** por
la integración Vercel↔GitHub. Esto es lo que se interpone entre un push y esa
producción:

    .github/workflows/  →  conflict-markers-check.yml, y nada más
      job 1 · conflict-markers .... busca <<<<<<< sin resolver
      job 2 · invariantes ......... node scripts/invariants-check.mjs (presencia)

Eso es todo. Y en `package.json` viven, sin que nadie los llame:

    lint ............ eslint .                    ← NO corre en CI
    build ........... check-legal + next build    ← NO corre en CI
    check:legal ..... node scripts/check-legal-entity.mjs  ← NO corre en CI

**Un PR que rompe el build, que no pasa el lint o que se carga la identidad
legal de la empresa entra en verde.** El último commit del repo se llama
«fix/identidad legal real (#50)»: alguien consideró ese dato lo bastante serio
como para escribirle un check, y ese check no se ejecuta en ningún gate.

Además: **0 ficheros de test** (`git ls-files | grep -cE '\.(test|spec)\.'` → 0)
y **no hay escáner de credenciales** — `scripts/keys-check-leak.mjs` existe en
seda_os y en guest-app, aquí no.

## Y el freno de main es un hook local

`.githooks/pre-push` rechaza empujar a `main`, y su propio texto explica por qué
existe: *«This repo has no server-side branch protection — private repo on the
GitHub Free plan»*. O sea:

  · Se salta con `git push --no-verify`.
  · No existe en un clon nuevo hasta que alguien corre `npm install` (lo instala
    el script `prepare`).
  · No protege a nadie que no sea quien lo tenga instalado.

**No es este encargo quien arregla eso** —la protección de rama es una decisión
de Ángel y cuesta dinero (plan de GitHub)—, pero sí hay que dejarlo escrito
donde se lea, porque cambia el valor de todo lo demás: si el CI no bloquea y la
rama no está protegida, el CI es una opinión.

## Apartado 1 — Que el CI ejecute lo que el repo ya sabe hacer

Un solo workflow nuevo, `ci.yml`, con un job `verify` que corra **en este orden**:

  1. `npm ci`
  2. `npm run check:legal`  ← primero: es barato y es el que protege un dato legal
  3. `npm run lint`
  4. `npx tsc --noEmit` si el repo tiene TypeScript configurado; si no, dilo y salta
  5. `npm run build`

Nada de esto es código nuevo: son scripts que ya existen y que hoy no llama
nadie. El encargo es **enchufarlos**, no reescribirlos.

Disparo: `pull_request` contra `main` y `push` a `main`.

**Ojo con `build`**: `npm run build` ya incluye `check:legal`. Se pone igualmente
como paso propio y ANTES, para que cuando falle se vea en su propia línea y no
enterrado en la salida de `next build`. Di en el parte si prefieres lo contrario
y por qué.

## Apartado 2 — El escáner de credenciales

Porta `scripts/keys-check-leak.mjs` desde **guest-app** (no desde seda_os: la
versión de guest-app es la que quedó al día el 19-sep, con 17 patrones y la
lista ampliada de extensiones) y añade `keys:check-leak` a los scripts y al job
`verify`.

Adapta el tratamiento de los `.env*` a lo que diga el `.gitignore` de ESTE repo,
y **escribe en la cabecera cuál de los dos criterios sigues y por qué**:

  · guest-app se salta TODOS los `.env*`, porque su `.gitignore` los ignora en bloque.
  · seda_os lee todos menos cinco nombres, porque versiona `.env.example`.

Mira el `.gitignore` antes de elegir. No copies el criterio sin comprobar cuál
aplica.

Y **antes de commitear nada**, corre el escáner sobre el árbol y sobre lo
versionado. Si sale un positivo, PARA y decláralo en el parte con el nombre del
fichero y el patrón — **sin pegar el valor**.

## Apartado 3 — Lo que NO se hace aquí, y se dice

Este repo también está sin `checkLock`, sin `invariantes.lock.json` y con
`--parity`, que es local-only y por tanto no corre en ningún CI. Todo eso va en
su propio encargo: **no lo toques**. Pero deja una sección en
`docs/GUARDARRAILES.md` —créalo si no existe— que diga, en una tabla, qué tiene
este repo y qué le falta frente a los otros dos. Un hueco declarado se puede
cerrar; uno que nadie ha escrito, no.

Incluye ahí lo del `pre-push` y la falta de protección de rama, con la frase
del propio hook como cita.

## Lo que NO hay que hacer

· No tocar `main` directamente. El `pre-push` lo impide y hace bien.
· No añadir tests de la aplicación: este encargo enchufa gates, no escribe
  cobertura. Que haya 0 tests se declara en `GUARDARRAILES.md` y se queda para
  otro día.
· No tocar la configuración de Vercel ni la protección de rama.
· No commitear ningún `.env*` ni ningún valor que el escáner marque.

## Cierre

Cierre según las reglas del repo, con la salida literal. Además:

1. La salida **completa** de cada paso nuevo del CI corrido en local: `check:legal`,
   `lint`, `build` y `keys:check-leak`. Si alguno falla hoy sobre `main`, ESE es
   el hallazgo: dilo el primero, con su salida, y no lo arregles sin decirlo.
2. El recuento del escáner: ficheros leídos y hits.
3. La tabla de `GUARDARRAILES.md`, pegada en el parte.
4. Lo que dejaste sin cubrir.
