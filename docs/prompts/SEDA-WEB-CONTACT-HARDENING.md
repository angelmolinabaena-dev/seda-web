# SEDA-WEB — Endurecer `/api/contact`, la única entrada de datos del sitio

**MODELO: Opus**
**ESFUERZO: Medio**
**SESIÓN: NUEVA (seda-web). Bloquea el repo mientras corre.**
**WORKTREE: NO. Checkout principal, `git checkout -b`.**

**Criterio de modelo/esfuerzo:** endpoint público, sin autenticación, que recibe datos personales y dispara emails con una clave de Resend activa. Tiene una vulnerabilidad de inyección de cabecera y un fail-open. Es seguridad y datos personales, no UI: Opus. Esfuerzo medio y no alto porque el fichero son 150 líneas y el alcance está cerrado.

**Criterio de sesión:** nueva. seda-web no tiene ninguna sesión activa. guest-app está ocupado con la matriz de cobertura; esto no lo toca.

Repo: seda-web · Fichero: `app/api/contact/route.ts` · Rama nueva desde main actualizado.

Contexto: auditoría `docs/audit/AUDIT-CODIGO-SEDA-WEB.md` (PR #34, mergeado). Ejercitado, no leído: 20 POST → 20× 200; campo numérico → 500 sin manejar; 2.000.055 bytes → 200.

---

## 1 · Inyección de cabecera en `reply_to` — lo más grave

```ts
if (!email || !/^\S+@\S+\.\S+$/.test(email)) { ... }
...
reply_to: email,
```

Ese regex acepta `lead@example.com,attacker@evil.tld`, y la cadena entera viaja a `reply_to`. Un tercero puede conseguir que tu respuesta a un propietario salga también hacia su dirección.

Valida en serio: una sola dirección, sin comas, sin punto y coma, sin saltos de línea, sin espacios, con longitud máxima. No busques un regex «perfecto» de RFC 5322 — busca uno que **rechace todo lo que no sea exactamente una dirección**, y que además rechace explícitamente los separadores.

## 2 · `mode: "mock"` es un fail-open

```ts
if (!apiKey) { ...; return NextResponse.json({ ok: true, mode: "mock" }) }
```

Si `RESEND_API_KEY` desapareciera de Vercel, la ruta devuelve **éxito** y la UI le dice al propietario «mensaje recibido» mientras el lead solo existe en la consola. Es una fuga silenciosa de captación.

Hoy la clave está configurada en Production y Preview (verificado 2026-08-04), así que esto no está ocurriendo — pero el diseño falla abierto y debe fallar cerrado.

En producción, sin clave, la ruta devuelve error y la UI lo dice. El modo mock puede seguir existiendo **solo** fuera de producción, y distinguiéndolo por `process.env.VERCEL_ENV`, no por la ausencia de la clave.

## 3 · Sin límite de tamaño ni de campos

`body.fields` se recorre entero sin comprobar nada: 2 MB pasan, y nada impide 500 claves.

Pon un techo al cuerpo, un máximo de campos, y una longitud máxima por valor. Trunca o rechaza — elige y justifica. Todo lo que entre acaba en un email que tú abres.

## 4 · El 500 del campo numérico

```ts
const email = fields.email?.trim()
```

Si `fields.email` llega como número, `.trim()` no existe y revienta con 500 sin manejar. Lo mismo puede pasar en el resto de campos, que se asumen `string` sin comprobarlo.

Valida tipos antes de operar. Un cuerpo malformado debe dar 400 con un mensaje neutro, nunca 500.

## 5 · Sin rate limiting

20 POST seguidos, 20 respuestas 200. Un formulario público sin límite es spam, coste de Resend, y tu bandeja inutilizable.

**Aquí hay una decisión y quiero que la razones, no que la des por hecha:** seda-web es serverless, así que un contador en memoria no sirve entre invocaciones. Las opciones que veo son Upstash Redis (guest-app ya lo usa, pero seda-web **no** tiene esas variables — compruébalo antes de asumirlo), el WAF de Vercel, o una defensa más simple tipo honeypot o marca de tiempo. Elige según lo que de verdad esté disponible en este proyecto y explica por qué.

Si la mejor opción exige configurar algo en Vercel, **dilo y déjalo preparado** en vez de implementar a medias: la variable la pone Ángel.

## 6 · `FROM` apunta a un buzón que no existe

```ts
const FROM = "SEDA Private Homes <web@sedaprivatehomes.com>"
```

**`web@sedaprivatehomes.com` no existe.** Verificado el 2026-08-04 en el panel del dominio: solo hay dos buzones, `info@` y `reservas@`, más los alias `beds24@`, `report@` y `dpd@` sobre `info@`.

Cámbialo a `info@sedaprivatehomes.com`. No es cosmético: está pendiente endurecer DMARC de `p=none` a `p=quarantine`, y ese día un remitente que no existe en el dominio empieza a ir a spam. El formulario de captación de propietarios cayendo en spam es un fallo que nadie detecta.

## 7 · Consentimiento — anótalo, no lo implementes

La ruta capta nombre, email y mensaje de un propietario potencial **sin registrar consentimiento ni base jurídica**, y el sitio no tiene aviso legal ni política de cookies (hallazgo P0 de la auditoría).

**No implementes el checkbox aquí.** Va con las páginas legales, que dependen de la S.L.U. constituida. Lo que sí haces: dejarlo escrito en el PR como lo que bloquea, para que no se olvide el día que se creen esas páginas.

## Prohibiciones

- **No toques el formulario del cliente** salvo lo mínimo para que un 400 se muestre bien. El alcance es el endpoint.
- **No añadas dependencias** sin justificarlo. El repo tiene dos usos de `process.env` en todo el árbol y esa sobriedad vale.
- **No cambies el diseño del email.** El HTML es correcto y respeta la paleta.

## Verificación — ejercitando, no leyendo

Repite las pruebas de la auditoría y pega los resultados:

- `lead@example.com,attacker@evil.tld` → debe dar 400.
- Campo numérico en `email` → 400, no 500.
- Payload de 2 MB → rechazado.
- Ráfaga de 20 POST → limitada.
- Sin `RESEND_API_KEY` en un entorno de producción simulado → error, no `ok: true`.

**Hazlo todo en local y en modo mock.** Contra producción enviarías emails reales a la bandeja de Ángel.

## Cierre

Puedes abrir PR. **No mergear**: Ángel es el único que mergea.

"No mergees" no significa "no termines". Commiteado, pusheado, PR abierto.

Antes de cerrar, ejecuta y pega la salida literal de:

```
git rev-parse --git-dir
git rev-parse --show-toplevel
git branch --show-current
git status --short
git log origin/main..HEAD --oneline
gh pr view --json number,url
```

## Resumen final

Repite al principio:

```
MODELO: Opus
ESFUERZO: Medio
SESIÓN: NUEVA (seda-web)
WORKTREE: NO
```

Y añade: qué estrategia de rate limiting elegiste y por qué, si exige configurar algo en Vercel, los cinco resultados de verificación en literal, y qué queda anotado sobre el consentimiento.
