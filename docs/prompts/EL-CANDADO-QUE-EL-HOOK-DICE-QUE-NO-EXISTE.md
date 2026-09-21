# El candado que el hook dice que no existe

**MODELO: Sonnet · ESFUERZO: Medio**
**SESIÓN: NUEVA (seda-web). Bloquea el repo mientras corre.**
**WORKTREE: NO. Checkout principal, `git checkout -b`.**

**Criterio de modelo/esfuerzo:** el cambio es un texto, pero hay una decisión de
fondo —para qué sirve hoy este hook— y una referencia rota que hay que resolver
en un sentido o en el otro. Sonnet, esfuerzo medio.

**Criterio de sesión:** nueva, solo seda-web. Puede correr **en paralelo** con las
de los otros dos repos: el mismo defecto está en los tres y cada uno lo arregla
con su verdad.

Repo principal: seda-web · Rama nueva desde main actualizado.

---

## 1 · Qué pasa

`.githooks/pre-push` refuse pushear a `main`, y su cabecera explica por qué
existe. Esa explicación **es falsa hoy**, en dos puntos distintos.

## 2 · Lo medido, el 20-sep-2026

Contra la API de GitHub. Las sesiones no tenéis `gh` autenticado, así que estos
datos te los da el revisor y **no los puedes reproducir desde el checkout**; eso
es justamente por lo que el texto llevaba meses sin corregirse. Si algo de aquí
te parece dudoso, dilo en el parte en vez de asumirlo.

| repo | privado | ruleset | estado |
|---|---|---|---|
| portal-propietarios (seda_os) | sí | `main protection` | **active** |
| guest-app | sí | `main` | **active** |
| seda-web | no | `web` | **active** |

**Este repo (seda-web): privado = no · ruleset `web` · active.**

### 2.1 · La primera afirmación falsa

> «This repo is private on the GitHub Free plan — branch protection (and
> rulesets, same boundary) is only available on public repos with Free, or on
> private repos with Pro/Team/Enterprise. There is no server-side gate stopping
> `git push origin main` today, and there won't be one without paying for it.»

Los **dos** repos privados tienen ruleset activo. Sea porque GitHub abrió los
rulesets al plan Free o por otra razón, la conclusión —«no hay candado y no lo
habrá sin pagar»— es falsa. Y no es inocua: **hay constancia de que la protección
de seda_os bloqueó dos merges el 19-sep**, y el ruleset de seda-web exige tres
checks, confirmado contra la API.

### 2.2 · La segunda, y esta es peor

> «See `.github/workflows/main-push-guard.yml` for the detective half that
> covers those two gaps after the fact.»

**Ese fichero no existe en ninguno de los tres repos.** El hook remite a una
mitad que no está, para cubrir dos huecos que nombra bien —no corre sin
`core.hooksPath` cableado, y no ve un merge por API— y que hoy no cubre nadie.
Una referencia rota en un guardarraíl es peor que no tenerla: quien la lee se
queda tranquilo.

## 3 · Qué hacer

### 3.1 · Que el texto diga la verdad de ESTE repo

Reescribe la cabecera con lo medido arriba **para este repo**, con la fecha.
Nombra el ruleset por su nombre.

### 3.2 · Y la decisión de fondo: ¿para qué sirve el hook hoy?

El texto justifica el hook como **sustituto** de un candado que no existe. Si el
candado existe, esa justificación se cae — pero el hook no tiene por qué caerse
con ella. Decide y escribe **cuál de estas dos es**:

- **Sigue valiendo, por otra razón**: te para en local, antes del viaje a GitHub
  y antes de ver el rechazo. Es un atajo, no un sustituto. Si eliges esta, el
  texto tiene que decir eso y dejar de hablar de planes de pago.
- **Ya no vale**: la protección lo cubre y el hook es ruido. Si eliges esta,
  **no lo borres**: dilo, argumenta, y déjalo para Ángel. Retirar un guardarraíl
  es suyo.

La primera me parece la buena, pero **mídelo antes de escribirlo**: comprueba qué
pasa hoy con un `git push origin main` —sin hacerlo— leyendo qué exige el
ruleset, y si el hook aporta algo que la protección no dé.

### 3.3 · La referencia rota

Dos salidas legítimas, y eliges una argumentando:

- **Quitar la referencia** y describir los dos huecos como lo que son: huecos
  conocidos que hoy nadie cubre. Honesto y barato.
- **Escribir el workflow**, que iría a `docs/pendiente-instalar/` porque
  `.github/workflows/**` está **denegado** a esta sesión. Más trabajo, y solo
  vale si de verdad quieres ese detective.

**No dejes la referencia como está.** Apuntar a un fichero inexistente es lo
único que no es una opción.

## 4 · Los controles que exijo

1. El hook **sigue funcionando**: provoca su rechazo (sin pushear a main de
   verdad) y pega la salida. Un texto nuevo sobre un hook que ya no corre sería
   el mismo defecto una capa más abajo.
2. `grep` que demuestre que ninguna afirmación del texto nuevo cita un fichero
   que no existe.
3. `npm test`, `npm run lint` y `npx tsc --noEmit` en verde.

## 5 · Qué NO hacer

- **No borres el hook.** Si concluyes que sobra, lo dices; lo retira Ángel.
- **No toques `.github/workflows/**`.** Denegado.
- **No toques los otros dos repos.** Cada uno tiene su encargo y su verdad.
- **No inventes el estado de la protección.** Los datos de §2 son los que hay;
  si necesitas otro, pídelo en el parte.
- **No leas `.env*`.**

## 6 · Criterio de terminado

1. La cabecera dice la verdad de este repo, con fecha y el ruleset por su nombre.
2. La pregunta de §3.2 está decidida y argumentada.
3. La referencia rota está resuelta en un sentido o en el otro.
4. El hook se ha visto rechazar, con salida literal.
5. El parte dice qué mediste y qué no pudiste medir.
