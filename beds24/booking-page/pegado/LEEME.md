# Lo que está pegado en Beds24 (3-nov-2026, propid 348601)

Pegado por Cowork en Booking Engine → Property Booking Page → Developer.

| Campo del panel | Fichero | Tamaño |
|---|---|---|
| Custom CSS | custom.min.css (csso --no-restructure de ../custom.css) | 16 393 |
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

Tiene que quedar por debajo de ~16 390 caracteres.

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
