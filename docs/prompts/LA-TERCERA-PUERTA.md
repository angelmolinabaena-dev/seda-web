# La tercera puerta

## Lo que dice el fichero que no está aquí

`seda_os/invariantes.lock.json` abre así:

> Huella de los invariantes compartidos por seda_os, guest-app y seda-web.
> Este fichero debe ser BYTE A BYTE IDENTICO en los tres repos.

Los tres. Medido el 19-sep-2026:

| | `invariants-check.mjs` | `checkLock` | `invariantes.lock.json` |
|---|---|---|---|
| seda_os   | sí | sí | sí |
| guest-app | sí | sí (19-sep, PR #376) | sí |
| **seda-web** | sí | **no** | **no** |

El candado se diseñó para tres puertas. Hoy está en dos. El CI de este repo
comprueba que los invariantes **existen** —«invariantes (reglas compartidas
presentes)»— y no que **digan lo acordado**. Alguien puede reescribir entero un
invariante del `CLAUDE.md` de seda-web y el check sigue en verde.

## Apartado 1 — Portar, no reescribir

De `guest-app/scripts/invariants-check.mjs` (la versión que quedó al día ayer)
vienen `huellaDelRepo`, `leerLock`, `checkLock`, `escribirLock` y `normalize()`.
**Pórtalas tal cual.** Si las dos implementaciones normalizan distinto, los
sha256 no coinciden y el lock deja de significar nada. Compara el resultado de
tu `huellaDelRepo` con el de guest-app sobre el mismo directorio antes de seguir.

`checkLock` distingue TRES formas de fallar y las tres importan:

  · `difieren` — el texto de un invariante cambió.
  · `sinLock`  — hay un invariante que el lock no conoce (se añadió sin regenerar).
  · `muertos`  — el lock conoce uno que ya no está (se quitó sin regenerar).

**Ojo, que este detalle costó una corrección el 19-sep**: quitar una entrada del
LOCK produce `sinLock`, no `muertos`. `muertos` sale de quitar el heading del
REGISTRO. Mide las dos direcciones y no te fíes del nombre.

Añade `invariants:lock` a los scripts.

## Apartado 2 — El lock se copia, y si sale rojo ese rojo es el hallazgo

Copia `seda_os/invariantes.lock.json` **byte a byte**. No lo regeneres aquí.

> **Si al copiarlo el check se pone ROJO, no lo silencies.** Significa que el
> `CLAUDE.md` de seda-web YA dice algo distinto de lo acordado, y nadie lo sabía.
> Regenerar el lock en este repo para ponerlo en verde destruiría exactamente lo
> que se acaba de construir.

Si pasa: **PARA**, no toques ningún `CLAUDE.md`, y escribe en el parte qué
invariante difiere, con las dos huellas y las dos versiones del texto. Cuál es la
buena lo decide Ángel.

En guest-app no salió ningún rojo. Aquí puede que sí: este repo ha ido más por
libre que los otros dos.

## Apartado 3 — `--parity`, que existe y no corre

`package.json` tiene `invariants:parity`, y su propia cabecera dice que es
**local-only**: compara los tres repos hermanos por directorio, cosa que en CI,
con un solo checkout, es imposible. O sea: existe un modo de comprobación que
ningún gate ejecuta nunca.

**No lo arregles aquí.** El arreglo de verdad —que cada CI verifique la huella
del otro repo por HTTP, patrón puntero→digest— es otro encargo. Lo que sí toca:
que `docs/GUARDARRAILES.md` lo diga en su tabla, en la fila que ya tiene, con
una frase clara: *«`--parity` no lo ejecuta ningún CI y no puede; la paridad
real entre repos hoy no la comprueba nadie»*.

Un hueco declarado se cierra algún día; uno que nadie escribió, no.

## Lo que NO hay que hacer

· No editar ningún `CLAUDE.md`. Si el texto diverge, se declara y decide Ángel.
· No regenerar el lock en este repo.
· No tocar `.github/workflows/`: el `verify` del PR #58 ya ejecuta
  `invariants:check`, así que al portar `checkLock` ese paso pasa a comprobar la
  huella **sin tocar nada**. Compruébalo y dilo; si hace falta cambiar el rótulo
  del paso, deja la línea exacta en el parte.
· No tocar seda_os ni guest-app.

## Cierre

Cierre según las reglas del repo, con la salida literal. Además:

1. `npm run check:legal`, `npm run lint`, `npx tsc --noEmit`, `npm run build` y
   `npm run keys:check-leak` **pegados**.
2. Las tres formas de fallo provocadas a mano, con su mensaje de rojo, y el
   árbol limpio después (`git status --short` vacío).
3. La comparación de `huellaDelRepo` contra la de guest-app: si coinciden sobre
   el mismo texto y cómo lo comprobaste.
4. Si el lock copiado da verde o rojo. Si da rojo, PARA y decláralo.
5. Lo que dejaste sin cubrir. Este repo sigue con **0 tests**: dilo otra vez, que
   no se olvide.
