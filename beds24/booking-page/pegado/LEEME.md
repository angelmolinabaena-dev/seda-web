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
