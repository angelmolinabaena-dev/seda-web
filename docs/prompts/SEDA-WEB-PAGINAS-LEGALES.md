# SEDA-WEB — El sitio está en producción sin una sola página legal

**MODELO: Opus**
**ESFUERZO: Alto**
**SESIÓN: NUEVA (seda-web). Bloquea el repo mientras corre.**
**WORKTREE: NO. Checkout principal, `git checkout -b`.**

**Criterio de modelo/esfuerzo:** son textos con obligación legal detrás, y la mitad de los datos que exige la norma **no existen todavía** porque la sociedad no está constituida. El trabajo real es decidir qué se puede publicar hoy sin afirmar nada falso, y eso es criterio, no redacción. Opus.

**Criterio de sesión:** nueva. Si `guest-app` tiene una sesión corriendo, no importa: este encargo no lo toca.

Repo: seda-web · Rama nueva desde main actualizado.

Origen: `docs/audit/AUDIT-CODIGO-SEDA-WEB.md` (PR #34), hallazgo **P0**.

---

## El hecho

Verificado sobre `main` el 2026-08-06:

- **Cero rutas legales.** Ni aviso legal, ni política de privacidad, ni política de cookies.
- **Cero enlaces** a ellas en todo el código. No es que falten las páginas: es que nada las menciona.

`sedaprivatehomes.com` está en producción, capta datos por `/api/contact`, y no publica ninguna de las tres.

## Lo que exige la norma

**Aviso legal — LSSI art. 10.** Obligatorio para cualquier sitio con actividad económica. Debe identificar al prestador del servicio: denominación, NIF, domicilio, datos de contacto, y los de inscripción registral cuando la haya.

**Política de privacidad — RGPD arts. 13 y 14.** Quién es el responsable, qué datos se tratan, con qué base jurídica, cuánto se conservan, a quién se ceden, y cómo se ejercen los derechos.

**Política de cookies.** Solo si el sitio pone cookies que no sean estrictamente necesarias. **Compruébalo antes de escribirla**: si no hay analítica ni terceros, la política es corta y honesta, no un texto de plantilla que describa un tratamiento que no ocurre.

## El problema de fondo, y es el encargo entero

**La S.L.U. no está constituida.** No hay denominación social, ni NIF, ni domicilio social, ni inscripción registral.

Es decir: **la mitad de lo que el aviso legal debe declarar no existe todavía.**

Y aquí está la trampa que hay que evitar. El 2 de agosto se retiraron de este mismo sitio métricas inventadas, garantías legales imposibles y una licencia turística que no existía. **Rellenar el aviso legal con datos societarios inventados sería exactamente el mismo error, en la página que menos lo perdona.**

**Decide cómo se resuelve y justifícalo.** Dos caminos razonables, y los dos son defendibles:

1. **Publicar con lo que hay hoy** — persona física, identificada con nombre y NIF reales, que es lo que legalmente responde mientras no exista la sociedad. Y marcar en el código, de forma imposible de pasar por alto, los campos que cambian el día que la S.L. exista.
2. **Dejar las páginas escritas y sin publicar**, listas para el día que haya datos. Pero eso deja el sitio incumpliendo mientras tanto.

Lo que **no** vale: publicar con `[NOMBRE DE LA SOCIEDAD]`, con datos de ejemplo, o con una sociedad que aún no está inscrita.

**No inventes ni un solo dato societario.** Si te falta uno, déjalo declarado como pendiente en el PR y que lo rellene Ángel.

## La política de privacidad tiene un espejo

`guest-app` ya tiene una, y es la referencia de qué se trata de verdad. Está en su repo — **no la copies sin leerla**: la de guest-app describe el tratamiento de datos de **huéspedes**, y esta web capta datos de **propietarios potenciales** por un formulario de contacto. No son el mismo tratamiento ni la misma base jurídica.

Y arrastra dos avisos de la auditoría de guest-app que valen aquí:

**El destinatario real.** La imagen del documento del huésped viaja a Anthropic para OCR **sin DPA firmado** — eso es de guest-app y no aplica aquí, pero recuerda el criterio: **se nombra a los destinatarios reales, no los que quedan bien.** Mira qué hace `/api/contact` con los datos: quién los recibe, dónde se almacenan, cuánto duran.

**Y el idioma.** La de guest-app es monolingüe con una app en cinco idiomas. Comprueba en cuántos idiomas está esta web y **no publiques la política solo en español si el sitio no lo es** — el art. 13 exige información comprensible.

## Lo que sí es seguro afirmar hoy

Antes de escribir nada, **verifica contra el código**:

- Qué recoge `/api/contact` exactamente, y a dónde va. El PR #36 lo endureció; su código dice la verdad.
- Si hay analítica, píxeles o terceros. Si no los hay, la política de cookies lo dice y punto.
- Dónde se almacena lo que se capta y cuánto tiempo.

**Cada afirmación de las tres páginas tiene que poder señalarse en el código o en un hecho verificable.** Lo que no, no se escribe.

## Y hay que enlazarlas

Hoy no hay ni pie de página que las mencione. Una página legal sin enlace no cumple nada. Decide dónde van y asegúrate de que son alcanzables desde cualquier página del sitio.

## Prohibiciones

- **No inventes datos societarios, fiscales ni registrales.**
- **No copies textos de otras webs** ni uses generadores de plantilla. Un aviso legal genérico describe una empresa que no es esta.
- **No prometas plazos de conservación** que nadie va a cumplir ni derechos que no hay circuito para atender. Si no hay buzón para ejercer derechos, hay que decir a dónde se escribe de verdad — y `dpd@sedaprivatehomes.com` existe como alias, confírmalo.
- **No toques `/api/contact`** ni el circuito del formulario.
- **No toques `guest-app` ni `seda_os`.**

## Verificación

- Las tres páginas alcanzables desde el sitio desplegado, y desde cualquier página.
- **Una tabla en el PR** que cruce cada afirmación con el hecho que la sostiene: código, columna de base de datos, o dato societario que Ángel tiene que aportar.
- La lista explícita de **lo que queda pendiente hasta que exista la S.L.U.**

## Cierre

PR abierto, **sin mergear**. Ángel es el único que mergea.

Antes de cerrar, ejecuta y pega:

```
cd C:\Users\AngelMolina\seda-web
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
ESFUERZO: Alto
SESIÓN: NUEVA (seda-web)
WORKTREE: NO
```

Y añade: qué camino elegiste para el aviso legal y por qué, **la lista exacta de datos que Ángel debe aportar antes de publicar**, si hay cookies que declarar o no, y en qué idiomas quedan las páginas.
