# Cómo pegar el kit en el panel de Beds24, y cómo deshacerlo

Para Cowork. **Este kit no ha tocado Beds24**: ni por API, ni por panel. Todo lo de abajo lo hace una persona con
acceso al panel, después de que Ángel mergee.

> **Estado de la verificación (3-nov-2026).** `custom.css` se ajustó contra la **instantánea real** de la booking page
> (`preview/real/booking2-es-2026-11-03.html` y `-en-`, propid 348601). Sigue sin verse: `include/booking3.css`, el
> calendario desplegable abierto, **el formulario del huésped y el pago**, y el sitio donde el panel coloca el HTML de
> cabecera y pie. Lo confirmado y lo no confirmado están separados en §5. Los nombres de menú y campo del panel
> (SETTINGS → BOOKING PAGE → DEVELOPERS: Custom CSS, Header HTML, Footer HTML) son los del encargo y **no se han
> comprobado en el panel**: si un campo se llama distinto, manda el panel.

---

## 0 · Antes de pegar: tres cosas que no son de este PR

1. **Bay Side no tiene VFT ni arrendador en el repo** (`textos.md` §7). La web se niega a publicar una casa así. La
   booking page con «Reservar» y pago es lo mismo. **No se activa la reserva pública hasta que existan.** El kit
   puede pegarse antes (solo viste la página), pero los textos de §1 y §7 de `textos.md` llevan huecos marcados.
2. **Los textos de cancelación, fianza (cómo se calcula) y pago con menos de 14 días están marcados «⛔ PENDIENTE»**
   en `textos.md`. No se pegan inventados.
3. **El logo se sirve desde `sedaprivatehomes.com/brand/svg/seda-isotipo-ink.svg`.** Ese fichero está en
   `public/brand/svg/` del repo, pero no se pudo comprobar que esté en producción (la red del entorno bloquea el
   dominio). Tras el merge y el despliegue:

   ```bash
   curl -sI https://sedaprivatehomes.com/brand/svg/seda-isotipo-ink.svg | head -3
   ```

   Debe dar `200` y `content-type: image/svg+xml`. Si no, no pegar `header.html`.

---

## 1 · Copia de seguridad (obligatoria, antes del primer pegado)

Los tres campos pueden tener ya contenido. Beds24 **no consta** que guarde versiones de estos campos.

1. Abrir cada campo (Custom CSS, Header HTML, Footer HTML).
2. Seleccionar todo (Ctrl+A) y copiarlo a un fichero de texto: `copia-custom-css-AAAA-MM-DD.txt`,
   `copia-header-AAAA-MM-DD.txt`, `copia-footer-AAAA-MM-DD.txt`. Si el campo está vacío, escribir en el fichero
   «VACÍO».
3. Guardar los tres ficheros **fuera** de este repo.

---

## 2 · Pegar, paso a paso

Orden: **CSS primero**, para que al pegar header y pie ya tengan estilo.

| # | Dónde en el panel | Qué pegar | Notas |
|---|---|---|---|
| 1 | SETTINGS → BOOKING PAGE → DEVELOPERS → **Custom CSS** | Todo `custom.css` | La primera línea es el `@import` de Google Fonts: tiene que quedar la **primera** del campo. |
| 2 | SETTINGS → BOOKING PAGE → **Header HTML** | Todo `header.html` | Lleva un `<script>` pequeño (§5.3). |
| 3 | SETTINGS → BOOKING PAGE → **Footer HTML** | Todo `footer.html` | |
| 4 | Guardar (Save) | | |

Cómo pegar sin estropear el formato: abrir el fichero desde GitHub (botón **Raw**), Ctrl+A, Ctrl+C, y pegar en el
campo. No pegar desde un chat ni desde un documento de texto enriquecido: cambia las comillas.

### Textos (`textos.md`)

Dónde van los textos (bienvenida, qué incluye, entrada y salida, pago, fianza, cancelación) depende de campos de
**texto de la propiedad por idioma** de Beds24. **No se ha visto su nombre exacto.** Procedimiento:

1. Abrir la propiedad (Bay Side: `propid=348601`) y localizar los campos de texto de la booking page, por idioma.
   En la instantánea hay dos módulos vacíos de agencia (`.b24-owner-desc1`, antes del formulario, y
   `.b24-owner-desc2`, después) y módulos de texto vacíos por habitación (`.b24-room-module`) y por oferta
   (`.at_offersummary`): son candidatos, no está confirmado cuál es cuál.
2. Pegar solo lo que **no** esté marcado «⛔ PENDIENTE» en `textos.md`.
3. Sustituir los huecos `{nombre}`, `{municipio}`, `{desde}`, `{hasta}`, `{numero}` por los valores reales. Si falta el
   valor (arrendador, VFT), **no pegar esa frase**.
4. Cancelación: **no pegar nada nuevo**. Comprobar que el texto que ya hay en Beds24 coincide con
   `docs/POLITICA-CANCELACION.md` (repo `seda_os`/`portal-propietarios`). Ver `textos.md` §6.
5. **Idiomas:** el selector de la página real ofrece **en, de, es y fr**. **No ofrece italiano.** Los textos en
   italiano de `textos.md` solo sirven si Ángel activa ese idioma en la propiedad.

---

## 3 · Comprobar que ha quedado bien

Abrir `https://beds24.com/booking2.php?propid=348601&lang=es` en una **ventana privada** y repetir con `&lang=en`,
`de`, `fr`.

- [ ] Fondo crema, titulares en serif ligera, etiquetas en mayúsculas monoespaciadas, botón «Reservar» oscuro (no azul `#008acc`).
- [ ] Cabecera con el isotipo y el enlace «Volver a la web» **en el idioma de la URL**.
- [ ] Pie con `info@sedaprivatehomes.com`, Privacidad y «Aviso legal y condiciones», en el idioma de la URL.
- [ ] A **375 px** (DevTools → modo móvil): sin barra de scroll horizontal; la fecha de entrada y la de salida se leen
      enteras («ma 3 nov 2026»); «Reservar» ocupa todo el ancho.
- [ ] A **1440 px**: contenido centrado; calendarios mensuales de tres en tres.
- [ ] **Tabulador**: cada campo, enlace y botón muestra un contorno olivo de 2 px.
- [ ] El **texto del cuerpo mide 16 px** (no 10): si se ve diminuto, ver §5.2, punto 1.
- [ ] Hacer una reserva de prueba **no** corresponde a este kit. No se hace.

---

## 4 · Deshacer

De menos a más drástico:

1. **Solo el aspecto:** vaciar **Custom CSS** y guardar. La página vuelve al aspecto por defecto de Beds24; cabecera y
   pie siguen, sin estilo.
2. **Cabecera o pie:** vaciar **Header HTML** o **Footer HTML**. Son independientes.
3. **Todo:** devolver a cada campo el contenido de la copia de §1 (o dejarlo vacío si la copia decía «VACÍO») y guardar.
4. Si el paso 1 no cambia nada, vaciar la caché del navegador o abrir en ventana privada: Beds24 puede cachear el CSS.

El kit no cambia ningún dato, precio, disponibilidad, tarifa ni ajuste de pago: solo añade CSS y HTML de presentación.
Deshacerlo no afecta a ninguna reserva.

---

## 5 · Selectores: lo que la instantánea confirma, lo que no y lo que sigue sin verse

### 5.1 · Confirmado en la instantánea (marcado real de la página de fechas y alojamientos)

| Selector real | Qué es | Dónde se usa en `custom.css` |
|---|---|---|
| `body.colorbody.colorbody-es.layout1` | `<body>` | Prefijo de **todas** las reglas (§5.2, punto 2) |
| `.b24fullcontainer-*` > `.container.container2.atcolor` | Franjas de página y su contenedor | §3 marco |
| `.b24fullcontainer-top` · `.b24languagedropdown` · `.dropdown-toggle` · `.dropdown-menu` | Selector de idioma | §3 |
| `#b24scroller.colorbookingstrip.b24-bookingstrip` | Franja de búsqueda de fechas | §8 |
| `.b24-selector-checkin` / `-checkout` / `-numnight` / `-numadult` | Columnas de la franja | Rejilla de Bootstrap (sin reglas propias) |
| `#inputcheckin`, `#inputcheckout` (`readonly`, `.form-control`) · `.input-group.date` · `.input-group-addon` | Campos de fecha con icono | §5 formularios |
| `#inputnumnight`, `#inputnumadult` (`select.form-control`) | Noches y personas | §5 |
| `.b24room > .panel.b24panel-room.atcolor.border` · `.panel-heading.b24-roompanel-heading` · `.panel-body.b24panel` | Tarjeta del alojamiento | §7 |
| `.at_roomnametext` | Nombre del alojamiento | §7 |
| `.b24-offer-pic img.img-responsive` · `.b24-offer-summary` · `.b24-offer-select` | Foto, resumen y columna de precio | §10 |
| `.at_roomofferprice` · `.b24-roombuttondiv > input.btn.btn-lg.button.at_bookingbut` | Precio y «Reservar» | §6, §10 |
| `.fakelink` («Comprobar Disponibilidad», «Cerrar») | Abre/cierra el calendario del alojamiento | §10 |
| `table.monthcalendar` > `td.monthcalendarhead` / `td.monthcalendarday` / `td.daymon…daysun` · `.roomoffercalendarmonth` | Calendarios mensuales | §10 |
| `.dateavail` / `.datenotavail` / `.daterequest` (y `.at_date…`) | Estado de cada día (definidos en el `<style>` de Beds24) | §10 |
| `#notavailableforselection.alert.alert-danger` · `.at_offerwarndiv.alert.alert-danger` | Avisos | §11 |
| `.b24fullcontainer-footer > footer` · `.book_poweredby` · `.btn.btn-default.btn-sm.button` («Up», solo móvil) | Pie de Beds24 | §6, §12 |

**Reglas que se han quitado** (no casaban con nada de la página real): `#searchbox`, `.booking-search`,
`.searchform`, `.room`, `.roomcontainer`, `.roomname`, `.roomprice`, `.price`, `.total`, `.message`, `.notice`,
`.card*`, `.well`, `#bookingpage`, `.error` y todo `.ui-datepicker*` (la página usa
**bootstrap-datetimepicker**, no jQuery UI).

**Reglas que se han conservado sin verlas en la instantánea**, marcadas en el CSS: las de Bootstrap 3 estándar
(`.form-control`, `.checkbox`, `.radio`, `.table`, `.alert`, `.panel`, `.help-block`, `.has-error`), porque la
página carga Bootstrap 3.3.4 y el formulario del huésped y el pago lo usarán, **pero esas pantallas no se han
capturado**.

### 5.2 · Descubrimientos de la instantánea que cambiaron el CSS

1. **`html { font-size: 10px }`** (Bootstrap 3). `1rem` mide **10 px** en la booking page. Todo `custom.css` va en `px`.
   Si algo se ve diminuto, comprobar que no se ha reintroducido ninguna `rem`.
2. **El `<style>` de Beds24 usa selectores de clase** (`.colorbody{background:#f4f4f4}`, `.atcolor`, `.button{background:#008acc}`,
   `.button:hover`…). Un selector de elemento (`body`, `input`) pierde contra eso por especificidad, **sin usar la marca de prioridad
   forzada**. Por eso todas las reglas llevan el prefijo `.colorbody` (clase real del `<body>`): pesan más y ganan sin depender de en qué
   orden coloque Beds24 este CSS. Hoy hay **cero** reglas con prioridad forzada.
3. **Los campos de fecha son `readonly` pero interactivos.** La regla de `[readonly]` que los pintaba como deshabilitados
   ya no los afecta.
4. **`<html lang="es|en">` lo pone Beds24** (comprobado en las dos instantáneas): el respaldo por `:lang()` de la
   cabecera y el pie funciona sin JavaScript.
5. **`.fakelink` («Comprobar Disponibilidad») es un `<div onclick>`**: no recibe foco con el Tabulador. **El CSS no puede
   arreglarlo**; es una limitación de Beds24 (accesibilidad por teclado). Se le da aspecto y tamaño de enlace.
6. **Calendarios mensuales:** Beds24 pone tres meses en `col-sm-3` (celdas de ~24 px a 768 px). `custom.css` los pasa a
   un mes por fila hasta 1199 px y tres desde 1200 px; en móvil el bloque sale hasta el borde de la tarjeta (≈50 px por celda a 375, medido).

### 5.3 · Sigue SIN verse: comprobar con el inspector

| # | Qué | Por qué importa | ☐ |
|---|---|---|---|
| 1 | `include/booking3.css` (CSS propio de Beds24; la instantánea solo lo referencia) | Si tiene reglas más específicas que `.colorbody .x`, alguna no ganará: usar el «PLAN B» del final de `custom.css` solo para ese selector. La preview **no** lo carga: no es idéntica a la real. | ☐ |
| 2 | **Dónde coloca el panel el Header HTML y el Footer HTML** | La preview los pone justo tras `<body>` y justo antes del pie «powered by Beds24»: **ubicación supuesta**. | ☐ |
| 3 | ¿Elimina Beds24 el `<script>` de `header.html`? | Si lo hace, no pasa nada: el idioma sale por `<html lang>` (comprobado, punto 5.2.4). | ☐ |
| 4 | ¿Permite Beds24 el `<img>` de otro dominio en la cabecera? | Si el isotipo no aparece, consola → «blocked». Alternativa: subir el SVG a Beds24 y cambiar la URL de `header.html`. | ☐ |
| 5 | El calendario desplegable abierto (`.bootstrap-datetimepicker-widget`) | Lo crea JavaScript; las reglas usan el marcado documentado de la librería, no el capturado. | ☐ |
| 6 | **Formulario del huésped y pantalla de pago** | No están en la instantánea. Hace falta otra instantánea de cada una para ajustar sus reglas y capturarlas. | ☐ |
| 7 | La foto de la habitación | Es `media.xmlcal.com/pic/p0034/8601/01.400.png` (foto real, alojada por Beds24). Desde el entorno de captura no se pudo cargar: las capturas llevan un marcador rotulado en su lugar. | ☐ |

### 5.4 · Dos cosas de las instantáneas subidas al repo

1. **Las dos instantáneas contienen una clave de API de Google Maps** (en el `src` del `<iframe>`, `key=AIza…`) y un
   **identificador de sesión** de Beds24 (`booking=…`) en los enlaces. Es la clave que Beds24 ya sirve en su HTML público,
   pero el repo es **público** y queda en el historial. Conviene redactarla en esos dos ficheros (no se ha tocado: son
   instantáneas de Cowork). `preview/build.mjs` quita el iframe y neutraliza el identificador de sesión en lo que
   genera, así que los `index*.html` no los llevan.
2. `preview/vendor/bootstrap-3.3.4/` es Bootstrap 3.3.4 (MIT, con su `LICENSE`), copiado de npm: es la versión exacta
   que carga la página real.

---

## 6 · Variante: qué hace el botón «Reservar» de la web

No hace falta tocar nada para que el kit funcione, pero esto es lo que lleva a la booking page. Ya está hecho en
la web (`components/escaparate/reserva-beds24.tsx`, `lib/escaparate.ts`): ver la descripción del PR, punto 5.
