# Guía de rodaje 360 con la Insta360 X4

Para Ángel. Cómo hacer las fotos de una casa para que el visor 360 las aproveche, cómo exportarlas y dónde
dejarlas para que Cowork las procese. Lo que hace el visor y el script está en [`TOUR-360.md`](./TOUR-360.md).

> Los nombres exactos de los menús cambian con el firmware de la cámara y la versión de Insta360 Studio. Aquí
> van los nombres que publica Insta360 para la X4; **si algo no coincide en tu pantalla, manda por encima lo que
> ves en ella** y apúntalo al final de esta guía para corregirla.

## 0. Antes de salir de casa

- [ ] Cámara y móvil cargados; **tarjeta con espacio** (una foto de 72 MP pesa decenas de MB).
- [ ] **Trípode** estable y el **palo de selfie «invisible»** (el de Insta360 desaparece en la imagen 360).
- [ ] Paño de microfibra para las **dos lentes** (una huella da un velo en media esfera).
- [ ] **Ubicación del móvil/app desactivada** para la cámara (una foto con GPS enseña dónde vive el propietario).
      El script de SEDA borra los metadatos al procesar, pero mejor que no se graben.
- [ ] La casa lista: sin objetos personales, sin documentos, sin pantallas encendidas, sin gente (ver la
      checklist de privacidad en `TOUR-360.md` §7: es la misma que se usa al revisar).
- [ ] Un papel con la **lista de estancias** y sus nombres de fichero (ver §5).

## 1. Ajustes de la cámara (una vez, antes de empezar)

| Ajuste | Valor |
|---|---|
| Modo | **Foto 360** (no el modo de una sola lente) |
| Resolución | **72 MP** (≈ 11904 × 5952) |
| Calidad / procesado | **PureShot** (procesado en cámara de los 72 MP: menos ruido y mejor color; esas fotos se terminan de procesar en el ordenador con Insta360 Studio) |
| Temporizador | **10 s** (opciones del manual: 3 / 5 / 10 / 15 s). Da tiempo a salir de la sala. |
| Formato | JPG (`.insp` en la cámara; el JPG sale al exportar con Studio) |

### El problema del HDR (léelo antes de decidir)

Tu encargo pedía «72 MP con HDR». **En la X4 no se combinan**: según la tabla de especificaciones de Insta360,
el modo **HDR** en 360° se limita a **18 MP** (≈ 6000 × 3000), y los 72 MP usan **PureShot**. Cómo decidir:

- **Estancias normales** (sin ventanas muy luminosas): 72 MP + PureShot. Es lo que ve el visor al hacer zoom.
- **Estancias con ventanal, terraza o contraluz fuerte** (el cielo sale quemado o el interior sale negro):
  haz **además una toma en HDR a 18 MP** de la misma posición. Cowork elige cuál usa. Una toma de 18 MP se ve
  bien en el visor (menos detalle al ampliar) y no tiene las ventanas blancas.
- Guarda las dos con el mismo nombre más un sufijo: `salon.jpg` y `salon-hdr.jpg`. **No se mezclan en el
  recorrido**: Cowork te pregunta cuál queda y aparta la otra de la carpeta (el script se detiene si ve
  `salon-hdr` y ese id no está en el `tour.json`).

*(Fuente: [especificaciones de disparo de la X4](https://onlinemanual.insta360.com/x4/en-us/specs/shooting-specs)
y [guía de ajustes](https://www.insta360.com/blog/tips/insta360-x4-tips-shooting-best-settings-guide.html).
Comprueba en tu cámara si tu firmware permite otra cosa.)*

## 2. Montaje y altura

1. **Palo invisible sobre el trípode**, con la cámara a **1,5–1,6 m** del suelo (altura de ojos de una persona).
   Es la que hace que el recorrido «se sienta» como estar de pie.
2. **La misma altura en todas las estancias y en los pasillos.** Marca el palo (cinta en la altura) y no la
   cambies: si el salón está a 1,55 m y la cocina a 1,40 m, al pasar de una a otra el visitante sentirá un salto.
3. **Trípode nivelado** (nivel de burbuja o el de la propia cámara). Aun así, el horizonte se corrige después
   (§4), pero un trípode torcido da distorsión que no se arregla del todo.
4. **Posición**: en el centro de la estancia, o donde se vean a la vez la entrada y lo más valioso. Evita la
   pared pegada: a menos de ~1 m, las junturas de las dos lentes (stitching) se notan.
5. Una de las lentes mira «al frente»: el **centro de la imagen final es hacia donde apunta la lente con el
   botón/pantalla**. Apúntala siempre hacia **el mismo tipo de sitio** (p. ej. hacia la puerta por la que se
   entra) para que, al cambiar de estancia, el visitante conserve la orientación. Anótalo.

## 3. Luz y escena

- **Luces encendidas** (todas las de la estancia, incluidas las de lectura y las de la cocina) aunque sea de día.
- **Persianas y cortinas a medio abrir**: deja pasar luz sin dejar la ventana como un foco blanco. En una toma
  360° la ventana siempre sale en cuadro; a medio abrir da el mejor equilibrio entre interior y exterior.
- **Sin gente, sin mascotas, sin espejos con el fotógrafo dentro** (ver §4).
- Camas hechas, cojines colocados, encimeras despejadas, tapas de WC bajadas, sin cables ni zapatos.
- Pantallas **apagadas**. Puertas interiores **abiertas** (si no, no se ve la continuidad entre estancias).

## 4. Hacer la toma

1. Coloca y nivela el trípode; pon la cámara con la **lente frontal** donde decidiste (§2.5).
2. **Anota la brújula** (la del móvil, apuntando la lente frontal): servirá para el norte del visor (opcional,
   solo si lo mides bien; si no, no se pone).
3. Inicia el **temporizador de 10 s**.
4. **Sal del plano**: sal de la sala y **cierra la puerta o escóndete tras una esquina**. La cámara lo ve
   **todo**: tú, tu sombra y tus reflejos. Mejor en otra estancia que detrás del trípode.
   - **Cuidado con los espejos y cristales**: el trípode y la cámara se verán reflejados. Cambia la posición
     un metro si hace falta.
5. Espera a que termine (los 72 MP con PureShot tardan unos segundos más).
6. **Mira la foto en el móvil** (zoom al máximo en dos o tres zonas) antes de pasar a la siguiente estancia:
   sin gente, sin borrones, sin tu reflejo, sin dedos en las lentes. **Repite si hay duda**: mucho más barato
   que volver otro día.

### Una toma por estancia… y por pasillo

- **Una toma por estancia**: salón, cocina, **cada dormitorio**, **cada baño**, terraza, piscina, entrada.
- **Una toma por pasillo** (o un cada ~3–4 m si es largo) para que el visitante pueda caminar de una
  estancia a otra sin «saltos» y los enlaces del visor tengan un destino natural. Un pasillo corto con una
  toma en el centro vale.
- Siempre **a la misma altura** (§2).
- **Exteriores**: terraza y piscina con luz de día; evita el mediodía cenital si hay sombras duras. Sin
  vecinos asomados, ni bañistas, ni coches con matrícula legible a la vista.

## 5. Nombres de fichero (es lo que entiende el script)

El **nombre del fichero es el identificador de la escena**. Solo **minúsculas, dígitos y guiones**, sin
acentos ni espacios, y la extensión `.jpg`:

| Estancia | Fichero |
|---|---|
| Entrada | `entrada.jpg` |
| Salón | `salon.jpg` |
| Cocina | `cocina.jpg` |
| Dormitorio 1, 2, 3… | `dormitorio-1.jpg`, `dormitorio-2.jpg` |
| Baño 1, 2… | `bano-1.jpg`, `bano-2.jpg` |
| Pasillo 1, 2… | `pasillo-1.jpg`, `pasillo-2.jpg` |
| Terraza | `terraza.jpg` |
| Piscina | `piscina.jpg` |
| Variante HDR de una toma | `salon-hdr.jpg` |

`Salón 1.jpg` o `IMG_2043.jpg` **no valen**: el script se detiene antes de procesar nada y te dice qué nombre
corregir. Si necesitas una estancia que no está en la tabla, usa un nombre con el mismo estilo y avisa para
añadirla al recorrido (`tour.json`).

## 6. Exportar desde Insta360 Studio

Para cada foto (`.insp`):

1. Abre el archivo en **Insta360 Studio**.
2. **Nivelado del horizonte** (en fotos solo se corrige aquí, en la edición): activa la **nivelación
   automática del horizonte** (en el panel de estabilización: «Automatic horizon leveling» / «Horizon Lock»,
   con la opción **360°** para nivelar por completo). Comprueba en el visor de Studio que las verticales
   (marcos de puertas, esquinas) quedan **verticales** y que el horizonte del exterior queda recto.
3. **Exportar la foto 360 completa** (la esfera entera, no un «recuadro reencuadrado»): botón **Exportar** →
   **Exportar foto 360** (el manual de Insta360 la distingue de «foto reencuadrada»; los nombres pueden variar
   según la versión).
4. Formato **JPG**, proyección **equirectangular**, **máxima resolución** (72 MP ≈ 11904 × 5952). Tiene que
   salir **2:1** (el doble de ancho que de alto). El script rechaza cualquier otra proporción.
5. Guarda **cada foto con el nombre de §5**.

*(Fuentes: [Horizon Lock](https://onlinemanual.insta360.com/oner/en-us/camera/horizonlock), manual de
exportación de Insta360. La opción exacta de exportación varía entre versiones de Studio; lo que importa es el
resultado: JPG 2:1 con la esfera completa.)*

> Si la foto sale con una **costura visible** (una línea donde se unen las dos lentes) en una zona importante,
> repite la toma ligeramente apartada de la pared o el objeto cercano.

## 7. Dónde dejarlas (para que Cowork las procese)

En una carpeta **fuera de git** dentro del repo `seda-web`:

```
seda-web/tours-entrada/<slug-de-la-casa>/
    salon.jpg
    cocina.jpg
    dormitorio-1.jpg
    …
```

- `<slug-de-la-casa>` en minúsculas con guiones: `bay-side`.
- **Esa carpeta está en `.gitignore`**: las fotos originales (con 72 MP y posibles metadatos) **no deben
  subirse al repositorio**, y por eso se dejan aquí y no en una carpeta versionada. No las muevas a `public/`.
- Ya en la carpeta, dile a Cowork: «procesa los tours de `bay-side`». Cowork ejecutará:

  ```bash
  npm run tour360:preparar -- --slug bay-side --entrada tours-entrada/bay-side
  ```

  y te devolverá: los tiles en `tours-salida/bay-side/` (ignorada por git), el `tour.json` actualizado y el
  informe de pesos. **No subirá nada**: el alojamiento de los tiles lo decides tú (`TOUR-360.md` §5).
- Cada foto original puede pesar **30–40 MB**; el procesado tarda ≈ 20 s por escena.

## 8. Lista rápida (para llevar en el móvil)

- [ ] Ubicación de la cámara/app **desactivada**
- [ ] 72 MP · PureShot · temporizador 10 s
- [ ] Palo + trípode a 1,5–1,6 m, **marcado**, la **misma altura** en toda la casa
- [ ] Luces **encendidas**, persianas **a medio abrir**, pantallas **apagadas**, puertas **abiertas**
- [ ] Una toma por **estancia** y por **pasillo**
- [ ] **Salir del plano** (y mirar los espejos)
- [ ] Mirar cada foto en el móvil con zoom antes de seguir
- [ ] Ventanales o contraluz → toma extra en **HDR 18 MP** (`<nombre>-hdr.jpg`)
- [ ] Studio: horizonte nivelado → **foto 360 completa**, JPG, equirectangular, **2:1**
- [ ] Nombres: `salon.jpg`, `dormitorio-1.jpg`… (minúsculas, sin acentos)
- [ ] Dejar en `seda-web/tours-entrada/<slug>/`

---

### Notas de esta guía (para corregirla con lo que veas en la cámara)

- Menús y nombres de opción de la X4 / Studio: tomados de la documentación publicada por Insta360; **sin
  comprobar en una cámara real**.
- Resolución de los 72 MP: 11904 × 5952 según la mayoría de fuentes; hay una tabla de Insta360 con 11968 × 5984
  (probablemente otro modelo). Cualquiera de las dos funciona con el script; se confirma con la primera foto.
