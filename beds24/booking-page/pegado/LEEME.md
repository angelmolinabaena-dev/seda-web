# Lo que está pegado en Beds24 (3-nov-2026, propid 348601)

Pegado por Cowork en Booking Engine → Property Booking Page → Developer.

| Campo del panel | Fichero | Tamaño |
|---|---|---|
| Custom CSS | custom.min.css (csso --no-restructure de ../custom.css) | 13 560 (v5; lo pegado en el panel hoy, v4, mide 16 478) |
| Insert in HTML <BODY> top | header.pegado.html (../header.html sin comentario ni <script>) | 1 116 |
| Insert in HTML <BODY> bottom | footer.min.html | 1 972 |

## Límites medidos del panel (no documentados por Beds24)

- **Custom CSS:** guarda 16 393 caracteres; 18 209 no se guarda. El límite está entre los dos. Por eso se pega la versión minificada.
- **Insert in HTML <BODY> top/bottom:** unos **2 000 caracteres**: 1 997 guarda y 2 037 no. Si se pasa, el panel **no avisa**: no guarda nada y no recarga.
- El <script> de la cabecera no se pegó. El idioma sale del atributo lang de <html>, que Beds24 pone.

## Qué se ha quitado del pie para que quepa

- las variantes en italiano (el selector de Beds24 no ofrece italiano);
- la línea «Costa del Sol · Andalucía»;
- la etiqueta «Legal»;
- el modificador --mono del correo;
- la frase inglesa «owner's name…», que pasa a «acts in the name and on behalf of the owner»;
- los href, que quedan relativos al protocolo.

## Cómo regenerar

    npx -y csso-cli beds24/booking-page/custom.css --no-restructure -o beds24/booking-page/pegado/custom.min.css

Tiene que quedar en **14 500 caracteres o menos** (el panel deja de guardar sobre ~16 300 y no avisa). La regla `body.colorbody #topofthebookingpage,#b24scroller-container{position:static!important}` ya va dentro de `custom.css`.

## Cambios del 3-nov por la tarde (v2 a v4), en el panel

- **Pictures:** las 8 fotos de la propiedad van en position 1-8, antes «not used». Así se activa el slider de portada (fullwidthjumbopropslider).
- **Layout:**
  - Property Map → not used;
  - Offer Picture → not used;
  - Offer Description → row 2, lg 12;
  - Offer Select → lg 12;
  - se añade Property Description 2 al pie de la propiedad.
- **Content → Property Description 2:** el bloque «Lo que incluye SEDA» y «Antes de reservar», en es, en, de y fr. Va en propdescbot*.
- **CSS** (custom.min.css, 16 478 caracteres): al final se añade `body.colorbody #topofthebookingpage,#b24scroller-container{position:static!important}`. Pone el idioma y la barra de fechas debajo de la foto, contra una regla de booking3.css con 2 ids y 2 clases.
- **Upsell Items:** x1descES = «Limpieza final». EN se queda «Final cleaning». No se pone DE ni FR: `DESCRIPCION_LIMPIEZA_RE = /clean|limpiez/i` de seda_os no los reconocería y la limpieza se clasificaría como alojamiento.
- **Booking Rules:** Same Day Booking Cut off pasa a 00:00; antes era none. No se puede reservar para el mismo día.
- **Instantáneas nuevas:** preview/real/booking2-es-v2-2026-11-03.html, con el slider, y book3-formulario-es-2026-11-03.html, con el formulario del huésped.

## v5 (3-nov, rama feat/booking-page-v5): lo que cambia respecto a lo pegado

- **Más corto:** 16 478 → 13 560 caracteres. Se quitaron las reglas que no casan con nada en las dos instantáneas (h1/h2, tablas, `.has-error`, `.checkbox label`, `.alert-warning`, `--mono` del pie, `data-seda-lang`, italiano…). Se conservan, marcadas `[JS]`, las que crea el JS de Beds24: el calendario desplegable de fechas y las clases `dateavail/datenotavail/daterequest`.
- **«Reservar»:** olivo `#536043`, ancho natural y a la derecha del precio en escritorio; 100 % en móvil. «Atrás» y «Up» pasan a contorno.
- **Slider:** altura `clamp(300px, 56vw, 640px)` con la foto recortada (cover); a sangre en móvil. La altura lleva `!important` por si el JS de Beds24 la fija en línea (no verificable: la instantánea no trae ese JS).
- **Formulario del huésped:** etiqueta sobre el campo, asterisco terracota, resumen de precio con «Limpieza final» y total en serif, casilla de condiciones a la izquierda del texto, «Atrás» / «Confirmar la reserva».
- **`.seda-info`:** dos columnas desde 768 px (`grid-auto-flow: column`), una en móvil; viñeta = filete dorado.
- **«por N noches» junto al precio: NO hecho.** El precio lo escribe el JS de Beds24 en `#price-roomprice-1-*` (vacío en la instantánea) y N está en `#inputnumnight`, otro elemento: CSS no puede leer un valor de un `<select>`. Hacerlo exige `<script>`, que el panel no admite en estos bloques.
- **No hay HTML nuevo:** header y footer no cambian (1 127 y 1 978 caracteres), sin `<script>` ni apóstrofo recto.
- **Capturas:** `node beds24/booking-page/preview/capturar.mjs` → `preview/capturas/{portada,formulario}-{375,1440}.png`, sobre las instantáneas reales. Las fotos son de prueba (media.xmlcal.com no es accesible desde el entorno) y falta `include/booking2.css`/`booking3.css`.
