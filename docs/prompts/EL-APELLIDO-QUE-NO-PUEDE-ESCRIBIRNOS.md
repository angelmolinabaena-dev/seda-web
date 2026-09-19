# El apellido que no puede escribirnos

**MODELO: Sonnet · ESFUERZO: Alto**
**SESIÓN: NUEVA (seda-web). Bloquea el repo mientras corre.**
**WORKTREE: NO. Checkout principal, `git checkout -b`.**

**Criterio de modelo/esfuerzo:** montar vitest en un Next 16 con TypeScript sin
romper el `build` tiene aristas, y hay un hallazgo que exige medir el coste sin
pasarse a decidir por Ángel. Sonnet, esfuerzo alto.

**Criterio de sesión:** nueva, solo seda-web. Puede correr **en paralelo** con la
sesión de seda_os: no comparten repo ni ficheros.

Repo principal: seda-web · Rama nueva desde main actualizado.

---

## 1 · El resumen en una frase

`seda-web` **no tiene el comando `npm test`**. No es que los tests fallen: es que
no existe el script, ni el framework, ni un solo fichero de prueba. Y la única
puerta de entrada de clientes del sitio son 281 líneas de validación y rate
limiting que nadie ha probado nunca.

Ya se está cobrando: hay al menos un apellido corriente que **no puede
escribirte**, y nada lo detectó.

## 2 · Lo medido, el 19-sep-2026

Vuelve a medirlo tú. Si algún número no te sale igual, dímelo antes de tocar nada.

### 2.1 · El estado de las pruebas

```
package.json scripts : dev, build, check:legal, start, lint,
                       keys:check-leak, invariants:check,
                       invariants:parity, invariants:lock, prepare
                       → no hay "test"
devDependencies      : ni vitest, ni jest, ni playwright, ni testing-library
ficheros *.test.* /
          *.spec.*  : ninguno
vitest.config.*     : no existe
```

Consecuencia directa: **`scripts/invariants-check.mjs`, instalado hoy mismo por
el #59, es código sin una sola prueba.** En seda_os y en guest-app ese mismo
guardarraíl tiene tests. Aquí no. Un guardarraíl sin pruebas es una promesa.

### 2.2 · El fallo que ya está costando clientes

`app/api/contact/route.ts` valida el correo con dos reglas que se contradicen:

```ts
const EMAIL_RE = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+ … /   // el ' ESTÁ permitido
const FORBIDDEN_IN_EMAIL = /[,;<>\s"'()[\]:\\]/          // el ' ESTÁ prohibido
```

Ejecutada la lógica real del fichero, no leída:

| dirección | veredicto |
|---|---|
| `angel@sedaprivatehomes.com` | acepta |
| `maria.lopez+reserva@gmail.com` | acepta |
| **`o'brien@gmail.com`** | **RECHAZA** |
| **`d'angelo@libero.it`** | **RECHAZA** |
| `sin-arroba.com` | rechaza (bien) |
| `dos@@arrobas.com` | rechaza (bien) |

`EMAIL_RE` sola dice `true` sobre `o'brien@gmail.com`. Quien lo tumba es
`FORBIDDEN_IN_EMAIL`. Las dos reglas del mismo fichero se contradicen y gana la
que pierde clientes.

Y no fue una decisión: `docs/prompts/SEDA-WEB-CONTACT-HARDENING.md` §1 pidió
literalmente rechazar «**comas, punto y coma, saltos de línea, espacios**». El
apóstrofo **no está en esa lista** — lo añadió por su cuenta quien implementó el
encargo, junto con `"`, `(`, `)`, `[`, `]` y `\`. El comentario del código lo
llama «header/recipient separators», y el apóstrofo no es un separador de
cabecera de correo.

El sitio es de alquiler de lujo en la Costa del Sol. `O'Brien`, `O'Sullivan`,
`D'Angelo`, `O'Connor` no son casos de laboratorio: son la clientela británica e
irlandesa, rebotando contra un formulario que les dice que su correo no es válido.

### 2.3 · El prerrequisito, y por qué va primero

`.gitattributes` de seda-web protege `.githooks/*` pero **no `scripts/*.mjs`**:

```
elemento                          seda_os   guest-app   seda-web
scripts/*.mjs text eol=lf           SÍ         SÍ          NO
```

Y seda-web tiene cuatro scripts `.mjs`: `check-legal-entity.mjs`,
`invariants-check.mjs`, `keys-check-leak.mjs`, `setup-hooks.mjs`.

Esto no es un detalle de estilo: **un shebang con CRLF rompe el import de un
script bajo vitest en Windows**, y costó guest-app#374. O sea, es exactamente el
fallo que te vas a encontrar en cuanto montes vitest e importes
`invariants-check.mjs` desde un test. Por eso la línea va en el paso 0 y no de
propina al final.

El propio `.gitattributes` del repo ya razona el peligro para los hooks:

> «a CRLF shebang line breaks under Git's `sh` on push/commit»

El mismo razonamiento, el mismo repo, un glob distinto.

## 3 · Qué hacer, en este orden

### Paso 0 · La línea que falta

Añade a `.gitattributes`:

```
scripts/*.mjs text eol=lf
```

Con un comentario breve que diga por qué (vitest en Windows, guest-app#374) y que
es el mismo criterio que la línea de `.githooks/*` que ya está arriba.

**Comprueba que la normalización se aplicó de verdad**: `git ls-files --eol
scripts/` antes y después, y pégame las dos salidas. Un `.gitattributes` que
nadie ejerce es una línea decorativa.

### Paso 1 · `npm test` existe

Monta **vitest** (es lo que usan seda_os y guest-app; no traigas un framework
distinto a un tercer repo). Mínimo viable:

- `vitest` en `devDependencies`, versión `^4` — alineada con guest-app (4.1.5)
  y seda_os (4.1.11); no traigas una mayor distinta a un tercer repo
- `vitest.config.ts` con lo justo para que resuelva `@/` como lo hace Next
- `"test": "vitest run"` en `package.json`

**No toques `build`.** `npm run build` es lo que ejecuta Vercel en cada
despliegue: encadenar los tests ahí convierte un test rojo en un despliegue caído.

### Paso 2 · Los tests que importan, por este orden

**a) `isValidEmail`** — la tabla entera de §2.2 como casos, **incluidos los dos
apellidos**, escritos con el veredicto que el código da HOY. Si Ángel decide
después quitar el apóstrofo de la lista, el test se pone rojo y hay que cambiarlo
a mano: eso es la señal, no un estorbo.

**b) El rate limit** — 5 por ventana de 10 min. Prueba el límite exacto (el 5º
pasa, el 6º no), que la ventana expira, y que `retryAfter` sale coherente. Y el
caso que nadie ha mirado: **cuando no llegan `x-forwarded-for` ni `x-real-ip`,
`clientKey` devuelve `"unknown"`** — o sea, todos los visitantes comparten
contraseña y cinco envíos de cualquiera cierran el formulario para todo el mundo
durante diez minutos. Escribe el test que lo documenta y **dime si ese camino es
alcanzable en Vercel o no**; mídelo, no lo supongas.

**c) `scripts/invariants-check.mjs`** — porta los tests que ya existen para el
mismo fichero, adaptando solo las rutas. No los reinventes.

Porta el de **guest-app** (`tests/invariants-check.test.ts`, 310 líneas), no el
de seda_os (232): es el más reciente y ya pasó por el ejercicio de adaptarse a un
segundo repo, que es exactamente lo que vas a repetir aquí.

**Y sabe lo que estás ganando, que es menos de lo que parece.** Ese fichero trae
dos clases de test. `checkLock` —la huella— funciona con un solo checkout y **sí
mide en CI**: es la que vale. El test de `--parity` busca los tres repos como
directorios hermanos, y en CI hay uno solo, así que se declarará «no hay nada que
comparar» y pasará sin comparar. Eso es **por diseño**, no una avería: se arregló
el 30-ago justamente para que no pasara en verde fingiendo haber comparado
(`docs/audit/GUARDARRAILES-QUE-MIDEN-LA-MAQUINA-2026-08-30.md` §3.2 y §6.2, en
seda_os). Dilo así en el parte y no vendas el parity como cobertura de CI.

**d) Los límites de tamaño** — `MAX_BODY_BYTES`, `MAX_FIELDS`,
`MAX_KEY_LENGTH`, `MAX_VALUE_LENGTH`: el caso justo por debajo pasa, el justo por
encima no.

Si el tiempo aprieta, (a) y (c) son lo irrenunciable.

### Paso 3 · Que CI los corra — y la trampa

`.github/workflows/**` está **denegado** a esta sesión: no lo edites. Deja el
diff en `docs/pendiente-instalar/tests-en-verify.md`, con las instrucciones para
Ángel.

**Y el aviso que tiene que leer antes de aplicarlo, en grande:** el job se llama

```
verify (legal + leak-scan + lint + tsc + build)
```

y ese texto **es el nombre del check requerido en el ruleset de `main`**
(confirmado el 19-sep contra la API: ruleset `web`, activo, tres contextos).
Añadir tests deja el nombre incompleto y la tentación será renombrarlo. **Si se
renombra el job sin actualizar el ruleset a la vez, la protección de rama queda
esperando un check que ya no existe y `main` se bloquea para todos los PR.**

Así que: el diff **añade un paso, no toca el `name:`**. Dilo explícitamente en el
fichero.

## 4 · Los controles que exijo

De cada uno, la salida literal:

1. **El control positivo del apóstrofo**: el test de (a) puesto a esperar
   `acepta` para `o'brien@gmail.com` sale **rojo**. Eso prueba que el test mide
   algo. Déjalo luego con el veredicto real.
2. **`git ls-files --eol scripts/`** antes y después del paso 0.
3. **`npm test`** entero, con el recuento.
4. **`npm run lint`**, **`npx tsc --noEmit`** y **`npm run build`** en verde —
   especialmente el `build`, para demostrar que montar vitest no tocó el
   despliegue.
5. **`npm run invariants:check`** y **`npm run keys:check-leak`** siguen verdes.

## 5 · Qué NO hacer

- **No quites el apóstrofo de `FORBIDDEN_IN_EMAIL`.** Es postura de seguridad y
  la decide Ángel. Tu trabajo es dejarlo medido, probado y a la vista, con una
  recomendación argumentada de dos líneas al final del parte. Nada más.
- **No toques `.github/workflows/**`.** Denegado.
- **No toques seda_os ni guest-app.** Hay una sesión corriendo en seda_os.
- **No metas los tests en `npm run build`.**
- **No renombres el job `verify`.**
- **No regeneres `invariantes.lock.json`.** Coincide en los tres repos desde hoy;
  regenerarlo aquí abre el agujero que el otro encargo está cerrando.
- **No leas `.env*`.**

## 6 · Criterio de terminado

1. `.gitattributes` protege `scripts/*.mjs`, y lo has demostrado con `--eol`.
2. `npm test` existe, corre, y cubre `isValidEmail`, el rate limit y
   `invariants-check.mjs`.
3. El control positivo del apóstrofo salió rojo antes de quedar en verde.
4. `docs/pendiente-instalar/tests-en-verify.md` existe y **avisa de lo del
   nombre del job**.
5. `lint`, `tsc`, `build`, `check:legal`, `keys:check-leak` e `invariants:check`
   en verde.
6. El parte dice qué mediste. Si algo de §2 no te sale igual, eso va primero.
