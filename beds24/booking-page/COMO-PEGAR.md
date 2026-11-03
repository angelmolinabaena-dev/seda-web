# Cómo pegar el kit en el panel de Beds24, y cómo deshacerlo

Para Cowork. **Este PR no ha tocado Beds24**: ni por API, ni por panel. Todo lo de abajo lo hace una persona con
acceso al panel, después de que Ángel mergee.

> **Aviso de verificación.** Los nombres de los menús y campos de abajo son los del encargo (SETTINGS → BOOKING PAGE
> → DEVELOPERS: Custom CSS, Header HTML, Footer HTML). **No se han podido comprobar contra el panel real** ni contra
> el wiki de Beds24: desde donde se preparó el kit, `beds24.com` y `wiki.beds24.com` devolvieron 403 del proxy. Si un
> campo se llama distinto o está en otro menú, manda el panel.

---

## 0 · Antes de pegar: tres cosas que no son de este PR

1. **Bay Side no tiene VFT ni arrendador en el repo** (`textos.md` §7). La web se niega a publicar una casa así. La
   booking page con «Reservar» y pago es lo mismo. **No se activa la reserva pública hasta que existan.** El kit
   puede pegarse antes (solo viste la página), pero los textos de §1 y §7 de `textos.md` llevan huecos marcados.
2. **Los textos de cancelación, fianza (cómo se calcula) y pago con menos de 14 días están marcados «⛔ PENDIENTE»**
   en `textos.md`. No se pegan inventados.
3. **El logo se sirve desde `sedaprivatehomes.com/brand/svg/seda-isotipo-ink.svg`.** Ese fichero está en
   `public/brand/svg/` del repo, pero este PR no pudo comprobar que esté en producción (la red bloquea el dominio).
   Tras el merge y el despliegue:

   ```bash
   curl -sI https://sedaprivatehomes.com/brand/svg/seda-isotipo-ink.svg | head -3
   ```

   Debe dar `200` y `content-type: image/svg+xml`. Si no, no pegar `header.html`.

---

## 1 · Copia de seguridad (obligatoria, antes del primer pegado)

Los tres campos pueden tener ya contenido. Beds24 **no consta** que guarde versiones de estos campos (no se ha
podido comprobar).

1. Abrir cada campo (Custom CSS, Header HTML, Footer HTML).
2. Seleccionar todo (Ctrl+A) y copiarlo a un fichero de texto: `copia-custom-css-AAAA-MM-DD.txt`,
   `copia-header-AAAA-MM-DD.txt`, `copia-footer-AAAA-MM-DD.txt`. Si el campo está vacío, escribir en el fichero
   «VACÍO».
3. Guardar los tres ficheros **fuera** de este repo. No contienen tokens, pero son de otro sistema.

---

## 2 · Pegar, paso a paso

Orden: **CSS primero**, para que al pegar header y footer ya tengan estilo.

| # | Dónde en el panel | Qué pegar | Notas |
|---|---|---|---|
| 1 | SETTINGS → BOOKING PAGE → DEVELOPERS → **Custom CSS** | Todo `custom.css` | La primera línea es el `@import` de Google Fonts: tiene que quedar la **primera** del campo. |
| 2 | SETTINGS → BOOKING PAGE → **Header HTML** | Todo `header.html` | Lleva un `<script>` pequeño (ver §5, punto 3). |
| 3 | SETTINGS → BOOKING PAGE → **Footer HTML** | Todo `footer.html` | |
| 4 | Guardar (Save) | | |

Cómo pegar sin estropear el formato: abrir el fichero desde GitHub (botón **Raw**), Ctrl+A, Ctrl+C, y pegar en el
campo. No pegar desde un chat ni desde un documento de texto enriquecido: cambia las comillas.

### Textos (`textos.md`)

Dónde van los textos (bienvenida, qué incluye, entrada y salida, pago, fianza, cancelación) depende de campos de
**texto de la propiedad por idioma** de Beds24. **No se ha podido ver su nombre exacto.** Procedimiento:

1. Abrir la propiedad (Bay Side: `propid=348601`) y localizar los campos de texto de la booking page, por idioma.
2. Pegar solo lo que **no** esté marcado «⛔ PENDIENTE» en `textos.md`.
3. Sustituir los huecos `{nombre}`, `{municipio}`, `{desde}`, `{hasta}`, `{numero}` por los valores reales. Si falta el
   valor (arrendador, VFT), **no pegar esa frase**.
4. Cancelación: **no pegar nada nuevo**. Comprobar que el texto que ya hay en Beds24 coincide con
   `docs/POLITICA-CANCELACION.md` (repo `seda_os`/`portal-propietarios`). Ver `textos.md` §6.

---

## 3 · Comprobar que ha quedado bien

Abrir `https://beds24.com/booking2.php?propid=348601&lang=es` en una **ventana privada** y repetir con `&lang=en`,
`de`, `fr`, `it`.

- [ ] Fondo crema, titulares en serif ligera, etiquetas en mayúsculas monoespaciadas, botón principal oscuro.
- [ ] Cabecera con el isotipo y el enlace «Volver a la web» **en el idioma de la URL**.
- [ ] Pie con `info@sedaprivatehomes.com`, Privacidad y «Aviso legal y condiciones», en el idioma de la URL.
- [ ] A **375 px** (DevTools → modo móvil): sin barra de scroll horizontal; el botón principal ocupa todo el ancho.
- [ ] A **1440 px**: contenido centrado, máximo 1120 px.
- [ ] **Tabulador**: cada campo, enlace y botón muestra un contorno olivo de 2 px.
- [ ] Un campo con error se ve en terracota con borde grueso **y** con texto (no solo color).
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

## 5 · Lo que hay que comprobar con el inspector (no se pudo ver la página real)

Abrir la booking page, clic derecho → **Inspeccionar**. El kit se escribió sin ver la página real, así que estas
suposiciones hay que confirmarlas. **Ninguna rompe la página si falla**: si una clase no existe, esa regla no se
aplica y el resto sigue valiendo (el aspecto cuelga sobre todo de selectores de elemento).

### 5.1 · Clases supuestas

| Selector en `custom.css` | Para qué | ¿Existe? (marcar) |
|---|---|---|
| `#searchbox`, `.booking-search`, `.searchform` | Búsqueda de fechas en fila desde 768 px | ☐ |
| `.panel`, `.panel-heading`, `.panel-body`, `.panel-title` (o `.card*`, `.well`) | Tarjetas con filete | ☐ |
| `.form-control`, `.form-group`, `.control-label`, `.help-block`, `.has-error` | Campos y errores | ☐ |
| `.btn`, `.btn-primary`, `.btn-default`, `.btn-lg` | Botones | ☐ |
| `.checkbox`, `.radio` | Casillas y radios con área de 44 px | ☐ |
| `.alert`, `.alert-danger`, `.alert-warning` | Avisos | ☐ |
| `.table`, `.table-responsive`, `tr.total` | Resumen de precio | ☐ |
| `.room`, `.roomcontainer`, `.roomname`, `.roomprice` | Lista de alojamientos | ☐ |
| `.ui-datepicker`, `.ui-datepicker-header`, `.ui-state-active`… | Calendario | ☐ |
| `.container`, `#bookingpage` | Anchura máxima y márgenes | ☐ |

Si falta alguna, anotar el nombre real y pasárselo a quien mantenga `custom.css`: cambiar un selector es una línea.

### 5.2 · Otras tres comprobaciones

1. **¿Pone Beds24 estilos en línea o prioridades forzadas** que ganen al CSS? Síntoma: algo no cambia aunque el
   inspector muestre la regla de SEDA tachada. Entonces, y solo para ese selector, usar el «PLAN B» del final de
   `custom.css`. Hoy hay **cero** reglas con prioridad forzada, porque no se ha visto ningún caso.
2. **¿Permite Beds24 el `<img>` de otro dominio en la cabecera?** Si el isotipo no aparece, el navegador lo habrá
   bloqueado (consola → «blocked» / CSP). Alternativa: subir el SVG a Beds24 y cambiar la URL de `header.html`.
3. **¿Elimina Beds24 el `<script>` de `header.html`?** Si lo hace, **no pasa nada grave**: el idioma de la cabecera y
   el pie se decide entonces por `<html lang>` y, si Beds24 no lo pone igual que el idioma de la página, saldrá en
   inglés. Se ha probado en la preview con JavaScript apagado: con `<html lang>` de es/de/fr/it/en sale ese idioma;
   con cualquier otro, inglés.
   Si Beds24 deja `<html lang>` fijo y quita el script, la cabecera y el pie saldrán siempre en ese idioma:
   hay que decidirlo (un solo idioma o una cabecera por idioma, si Beds24 lo permite).

---

## 6 · Variante: qué hace el botón «Reservar» de la web

No hace falta tocar nada para que el kit funcione, pero esto es lo que lleva a la booking page. Ya está hecho en
la web (`components/escaparate/reserva-beds24.tsx`, `lib/escaparate.ts`): ver la descripción del PR, punto 5.
