# El inventario que aquí son tres de cuatro

**MODELO: Sonnet · ESFUERZO: Alto**
**SESIÓN: NUEVA (seda-web). Bloquea el repo mientras corre.**
**WORKTREE: NO. Checkout principal, `git checkout -b`.**

**Criterio de modelo/esfuerzo:** el porte es mecánico, pero aquí hay una
diferencia real respecto a los otros dos repos que no se puede portar a ciegas, y
una trampa que bloquea `main` si se toca lo que no se debe. Sonnet, alto.

**Criterio de sesión:** nueva, solo seda-web. Puede correr **en paralelo** con las
de seda_os y guest-app.

Repo principal: seda-web · Rama nueva desde main actualizado.

**PRERREQUISITOS**, los dos: el PR #776 de `portal-propietarios` mergeado (es lo
que hay que copiar), y el #64 de este repo mergeado (`next 16.3.5`, las dos RCE).
Si alguno falta, para y dilo.

---

## 1 · Qué pasa

`compartidos.lock.json` declara lo que los tres repos deben decir igual, y hoy
**existe en uno solo**: seda_os. Medido con `checkCompartidos` contra los tres
checkouts, seda-web da `ausente=true`. El inventario de lo compartido lo
comprueba el repo que lo escribió, contra sí mismo.

El #776 arregló la otra mitad. Esta es la tuya.

## 2 · Lo medido, el 20-sep-2026. Y la diferencia de este repo

Vuelve a medirlo tú.

**Aquí aplican TRES de los cuatro elementos.** El universo del #776:

| elemento | ¿aplica a seda-web? |
|---|---|
| tabla PATTERNS de keys-check-leak | **sí** |
| invariantes.lock.json | **sí** |
| .gitattributes: scripts/*.mjs text eol=lf | **sí** |
| scripts/health-check.mjs | **NO** — seda-web no publica `/api/health` |

Esa exclusión **ya está en el código** que vas a portar (`repos` por elemento). No
la inventes ni la quites: el check debe comprobar solo los elementos cuyo
universo incluya este repo, y **no** debe dar rojo por un fichero que aquí no
tiene por qué existir.

**Las tres huellas ya coinciden con las de los otros dos:**

```
tabla PATTERNS          6d500467a65a845a
invariantes.lock.json   097b752ae90b0def
.gitattributes          2117c46403807840
```

La tercera merece una nota, porque es reciente: hasta el #61 de este repo (00:53
de hoy) seda-web **no tenía** la línea `scripts/*.mjs text eol=lf` y su huella era
`e3b0c44298fc1c14` — el sha256 de la cadena vacía. La añadió el paso 0 de aquel
encargo. O sea: este repo era el divergente hasta hace unas horas.

**Tu expectativa: VERDE, 3/3.** Si sale rojo, o has portado mal, o hay una
divergencia nueva. En ese caso el hallazgo vale más que el porte: dilo primero y
**no lo silencies regenerando el lock**.

## 3 · Qué hacer

### Paso 1 · Portar, sin retocar

Desde el seda_os ya mergeado, **byte a byte**:

- `scripts/compartidos-check.mjs`
- `compartidos.lock.json` — **no lo regeneres.**
- `tests/compartidos-check.test.ts` — este repo ya tiene vitest desde el #61.
  Los tests que tocan `health-check.mjs` no aplican aquí: **no los borres a
  ciegas**. Mira si el fichero de tests del #776 ya los condiciona al universo; si
  no, condiciónalos y di cómo.

Demuestra el byte a byte con `git hash-object` **del blob**, no del working tree:
da resultados distintos según el entorno por los finales de línea, y lo que decide
es el blob.

### Paso 2 · `package.json`

```
"compartidos:check": "node scripts/compartidos-check.mjs",
"compartidos:lock":  "node scripts/compartidos-check.mjs --lock"
```

### Paso 3 · CI, y la trampa

`.github/workflows/**` está **denegado** a esta sesión. Deja el diff en
`docs/pendiente-instalar/compartidos-en-verify.md`.

Hay dos sitios posibles y **elige con criterio, diciendo por qué**: el job
`invariantes (reglas compartidas presentes)` de `conflict-markers-check.yml`, que
es temáticamente el sitio, o el job `verify` de `ci.yml`, donde ya vive el resto.

**El aviso que va en grande en ese fichero:** los tres nombres de job de este repo
son **los tres contextos requeridos en el ruleset `web` de `main`** (activo,
confirmado el 19-sep contra la API):

```
verify (legal + leak-scan + lint + tsc + build)
conflict-markers (marcadores de merge sin resolver)
invariantes (reglas compartidas presentes)
```

**Ninguno se renombra.** Si un `name:` cambia sin actualizar el ruleset a la vez,
la protección espera un check que ya no existe y **`main` se bloquea para todos
los PR**. El diff añade un paso y no toca ningún `name:`.

**Repite los ensayos del #776** sobre tu diff y publica la tabla: parseo YAML,
el `run:` **extraído del YAML** byte a byte, `bash -n` sobre ese cuerpo extraído,
sin heredoc, y los `name:` intactos.

## 4 · Los controles que exijo

Salida literal:

1. **Verde**: `npm run compartidos:check` sale **3/3**, y dice explícitamente que
   `health-check.mjs` no aplica aquí — no que «falta».
2. **Rojo por divergencia**: muta un patrón de `keys-check-leak.mjs` en una
   **copia temporal** y enseña que el check lo caza y lo nombra.
3. **Rojo por ausencia**: quita la línea de `.gitattributes` en esa copia y
   enseña que da `AUSENTE` con motivo. Es la divergencia que este repo tenía de
   verdad hasta anoche, así que es el control más honesto que puedes correr.
4. **El lock es el mismo**: las dos huellas de blob.
5. `npm test` (56 + los nuevos), `npm run lint`, `npx tsc --noEmit`,
   `npm run build` en verde.

## 5 · Qué NO hacer

- **No regeneres ningún lock.**
- **No toques `.github/workflows/**`.** Denegado.
- **No toques seda_os ni guest-app.** Hay sesiones corriendo en los dos.
- **No renombres ningún job.** Los tres nombres son contextos del ruleset.
- **No añadas `scripts/health-check.mjs`** a este repo para que «cuadren los
  cuatro». No publica `/api/health` y su universo lo excluye a propósito.
- **No leas `.env*`.**

## 6 · Criterio de terminado

1. `npm run compartidos:check` existe, corre y sale 3/3, nombrando la exclusión.
2. Script y lock byte a byte los de seda_os, demostrado por blob.
3. Los tests corren aquí, con los de `health-check` condicionados al universo.
4. `docs/pendiente-instalar/compartidos-en-verify.md` con el aviso de los tres
   nombres y la tabla de ensayos.
5. Los dos controles de rojo salieron rojos, con salida literal.
6. El parte dice qué mediste. Un desacuerdo con §2 va primero.
