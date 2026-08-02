# Retirada de la colección de villas ficticias — `seda-web`

**Fecha:** 2026-08-02
**Repo:** `seda-web` (sedaprivatehomes.com) · rama `claude/remove-fictional-villas-2c2b96`
**Modelo:** Opus 5 · esfuerzo alto.
**Decisión de partida (Ángel):** las cuatro residencias publicadas **se retiran**. No se
reetiquetan como ilustrativas.
**Documento hermano:** [`VERACIDAD-PUBLICA.md`](./VERACIDAD-PUBLICA.md) §10.11 — ficha de cierre.

---

## 0. Por qué

`/coleccion` publicaba cuatro residencias con nombre propio, ubicación, capacidad,
superficie y badge **«SEDA Managed»**. Ninguna existe: cero propietarios firmados con
propiedad publicable. Las imágenes son renders generados y **ni siquiera coinciden con la
villa que ilustran** — `villa-liria.jpg` bajo «Villa Alborán», `casa-almazara.jpg` bajo
«Ático Marina», `villa-sosiego.jpg` bajo «Finca Los Olivos», `casa-almena.jpg` bajo
«Residencia Duna». El desajuste entre nombre de fichero y villa es el rastro de que las
cuatro fichas vienen del prototipo `.tmp/seda4/`, no de un inventario real.

El pie reconoce que las imágenes son «representaciones conceptuales». No reconoce que las
propiedades no existen ni que no se gestionan. **«SEDA Managed» sobre una propiedad
inventada es una afirmación de servicio prestado, no de ilustración** — es la razón por la
que se retira en vez de rotularse.

Criterio aplicado, el mismo de `VERACIDAD-PUBLICA.md` §10: **lo que no se puede sostener
se retira, no se reetiqueta.** Solo se reescribe cuando existe una afirmación verdadera y
comprobable que ocupe su sitio.

---

## 1. Inventario — fase 1

Barrido completo antes del primer cambio funcional. Este es el alcance real de la entidad
«villa» en el repo.

### 1.1 Origen de los datos

**Un único fichero, sin CMS ni JSON externo:** [`lib/villas.ts`](../../lib/villas.ts) — 63
líneas, un array `VILLAS: Villa[]` con **exactamente 4 entradas** y un helper
`getVillaBySlug()`. **No hay más villas definidas que las cuatro publicadas**: no existe
un catálogo mayor filtrado por `published`, ni un flag de borrador, ni villas comentadas.
Los textos visibles (`sublocation`, `capacity`, `description`) están duplicados en
`messages/*.json` bajo `villa.items.<slug>.*` para los 4 idiomas; `lib/villas.ts` conserva
la versión ES como canónica porque `parseCapacity()` la parsea para el JSON-LD.

| slug | nombre publicado | ubicación | ficha | imagen (fichero) |
|---|---|---|---|---|
| `villa-alboran` | Villa *Alborán* | Marbella | 8 huéspedes · 4 suites · 400 m² · piscina infinita | `/villas/villa-liria.jpg` |
| `atico-marina-puerto-banus` | Ático *Marina* | Puerto Banús | 4 huéspedes · 2 suites · 280 m² · vistas panorámicas | `/villas/casa-almazara.jpg` |
| `finca-los-olivos-casares` | Finca *Los Olivos* | Casares | 10 huéspedes · 5 suites · 390 m² · spa privado | `/villas/villa-sosiego.jpg` |
| `residencia-duna-estepona` | Residencia *Duna* | Estepona | 6 huéspedes · 3 suites · 460 m² · primera línea de playa | `/villas/casa-almena.jpg` |

### 1.2 Rutas

| Ruta | Fichero | Qué genera |
|---|---|---|
| `/villa/[slug]` | [`app/[locale]/villa/[slug]/page.tsx`](../../app/%5Blocale%5D/villa/%5Bslug%5D/page.tsx) | 4 slugs × 4 locales = **16 URLs estáticas** (`generateStaticParams`) |
| `/villa/[slug]/opengraph-image` | [`app/[locale]/villa/[slug]/opengraph-image.tsx`](../../app/%5Blocale%5D/villa/%5Bslug%5D/opengraph-image.tsx) | 16 imágenes OG generadas con el nombre y la ficha de cada villa |
| `/coleccion` | [`app/[locale]/coleccion/`](../../app/%5Blocale%5D/coleccion/) | Rejilla de las 4 fichas. **La ruta no se retira** — ver §2 |

Las 16 URLs de `/villa/*`:

```
/villa/{villa-alboran, atico-marina-puerto-banus, finca-los-olivos-casares, residencia-duna-estepona}
/en/villa/{…}   /fr/villa/{…}   /de/villa/{…}
```

### 1.3 Enlaces entrantes

`grep` de los cuatro slugs y de `VILLAS` sobre todo el repo. Resultado — **cinco
consumidores en código de aplicación**, ninguno más:

| Fichero | Qué hace | Acción |
|---|---|---|
| [`components/projects-section.tsx`](../../components/projects-section.tsx) | Sección **de la home** (`app/[locale]/page.tsx:58`). Rejilla de las 4 tarjetas + contador `({VILLAS.length}) Villas`, cada tarjeta enlaza a `/villa/<slug>` | Sección completa retirada |
| [`app/[locale]/coleccion/ColeccionContent.tsx`](../../app/%5Blocale%5D/coleccion/ColeccionContent.tsx) | Rejilla de las 4 fichas + strip `4 residencias curadas` + badges «SEDA Managed» / «Bajo consulta» | Reescrita — ver §2 |
| [`app/[locale]/villa/[slug]/page.tsx`](../../app/%5Blocale%5D/villa/%5Bslug%5D/page.tsx) | La ficha en sí + bloque «Otras residencias» (3 enlaces cruzados por página) | Ruta eliminada |
| [`app/sitemap.ts`](../../app/sitemap.ts) | `villaRoutes`: 4 slugs × 4 locales con `hreflang` | Bloque eliminado |
| [`app/[locale]/contacto/ContactoContent.tsx`](../../app/%5Blocale%5D/contacto/ContactoContent.tsx) | Lee `?villa=<slug>`, resuelve con `getVillaBySlug()`, pinta el banner «Villa solicitada» y pre-rellena las notas | Manejo del parámetro eliminado |

**Falso positivo verificado, no tocado:** `prop.marketing.desc_quote` en los 4 idiomas cita
«el **mar de Alborán**» — el accidente geográfico real, no la villa. Se conserva.

**Enlaces a `/coleccion` que NO se tocan** (la ruta sigue existiendo): `components/navigation.tsx`
(×2), `components/footer.tsx`, `components/hero.tsx`, `components/keyboard-shortcuts.tsx`
(atajo `g` + `c`), `app/not-found.tsx`, `app/[locale]/not-found.tsx`,
`app/[locale]/nosotros/NosotrosContent.tsx`, `app/[locale]/descubre/DescubreContent.tsx`,
`app/[locale]/guestapp/GuestappContent.tsx` (×2).

### 1.4 Metadatos

| Artefacto | Dónde | Qué afirma | Acción |
|---|---|---|---|
| `generateMetadata` de la ficha | `villa/[slug]/page.tsx:20-46` | `title` = «Villa Alborán», `description` = «Marbella, Costa del Sol. 8 huéspedes · 4 suites · 400 m²… Villa privada **gestionada por** SEDA Private Homes» | Eliminado con la ruta |
| `alternates.canonical` + `languages` | ídem | 4 canonicals + 16 hreflang hacia URLs de villas | Eliminado con la ruta |
| JSON-LD `Accommodation` | `villa/[slug]/page.tsx:113-132` | `name`, `description`, `address.addressLocality`, `occupancy`, `numberOfBedrooms`, `floorSize` — datos estructurados legibles por máquina de una propiedad inexistente | Eliminado con la ruta |
| JSON-LD `BreadcrumbList` | `components/breadcrumbs.tsx`, invocado solo desde la ficha | Rastro `Inicio → Colección → Villa Alborán` | Desaparece al eliminarse su único consumidor |
| Imagen OG | `villa/[slug]/opengraph-image.tsx` | Render 1200×630 con nombre + `sublocation` + `capacity` de cada villa | Fichero eliminado |
| Sitemap | `app/sitemap.ts:46-55` | 16 entradas `/villa/*` con `priority: 0.8` | Bloque eliminado |
| `VILLA_PRICING` | `villa/[slug]/page.tsx:51-56` | «Desde €4.200 / noche» etc. — precios placeholder de propiedades inexistentes, visibles en el hero y en la barra móvil | Eliminado con la ruta |

Ya correcto de antes y sin cambio: el JSON-LD `Accommodation` **omitía deliberadamente**
`image` y `offers`/`priceRange`. La retirada elimina el bloque entero, así que la omisión
deja de ser relevante.

**No se toca**: el `@graph` `Organization` + `LodgingBusiness` de
[`app/[locale]/layout.tsx`](../../app/%5Blocale%5D/layout.tsx). Solo se corrige el
comentario de cabecera, que remitía a «`VILLA_PRICING` placeholders in the villa page» —
un puntero a código que deja de existir.

### 1.5 Textos i18n (`es` / `en` / `fr` / `de` — este repo **no tiene `it`**)

Alcance del repo confirmado en [`i18n/routing.ts:11`](../../i18n/routing.ts): 4 locales.
Estado de partida: **837 claves × 4 idiomas, 0 divergencias**.

| Bloque | Claves | Destino |
|---|---|---|
| `villa.*` (namespace completo) | 39 | **Retirado.** Sin la ruta no queda ningún consumidor |
| `coleccion.managed_badge`, `coleccion.price_badge` | 2 | Retirado — badges de las tarjetas |
| `coleccion.meta.{tag,count,geo}` | 3 | Retirado — strip «Colección 2026 · 4 residencias curadas · Marbella → Casares» |
| `coleccion.standard.*` | 15 | Retirado — «Todas las residencias SEDA **incluyen**». Ver §2.2 |
| `coleccion.cta.*` | 5 | Retirado — «¿No encuentra la villa exacta? **Tenemos** residencias fuera de catálogo…» |
| `home.projects.*` | 5 | Retirado — encabezado y contador de la sección de la home |
| `contacto.villa.{label,interest_note}` | 2 | Retirado — banner «Villa solicitada» |
| `coleccion.body` | 1 | **Sustituida**, no retirada. Texto nuevo — ver §2.1 |
| `coleccion.eyebrow`, `coleccion.h1.*` | 4 | **Conservadas sin cambio** — encabezado de la página |
| `breadcrumb.{home,coleccion,label}` | 3 | **Conservadas** — ver §5 |

Total retirado: **71 claves × 4 idiomas**. Total tras la retirada: **766 × 4**.

### 1.6 Imágenes — lista, sin borrar

Auditoría de consumidores sobre los **126 ficheros** de `public/villas/`, cruzando cada
ruta contra todo el código de `app/`, `components/`, `lib/`, `messages/`, `hooks/`.

**Resultado: la retirada no deja huérfana ninguna imagen.** Las cuatro que ilustraban las
fichas tienen **otro consumidor vivo** en `/descubre`, donde sirven de ilustración de
municipio (no de propiedad concreta, no con nombre propio):

| Fichero | Consumidor tras la retirada |
|---|---|
| `/villas/villa-liria.jpg` | `descubre/DescubreContent.tsx:8` — «Marbella» |
| `/villas/casa-almena.jpg` | `descubre/DescubreContent.tsx:9` — «Estepona» |
| `/villas/casa-almazara.jpg` | `descubre/DescubreContent.tsx:10` — «Benahavís» |
| `/villas/villa-sosiego.jpg` | `descubre/DescubreContent.tsx:11` — «Casares» |

Nótese que en `/descubre` la asignación fichero → municipio **tampoco coincide** con la de
`/coleccion` (`casa-almazara.jpg` era «Ático Marina, Puerto Banús» y en `/descubre` es
«Benahavís»), lo que confirma que los ficheros nunca representaron una propiedad concreta.

**Ficheros de `public/villas/` sin ningún consumidor — 106.** Ya estaban huérfanos
*antes* de esta retirada: son el volcado de trabajo del prototipo (`ChatGPT Image …png`,
`Luxury_Villa_Visuals_….mp4`, `Untitled Project (10).png`, UUIDs sueltos,
`BeneficiosPropietarios.jsx`, `seda_beneficios_propietarios_mockup.html`, y previas
`*-prev*.jpg`). **Ninguno se borra en este PR** — la limpieza de `public/` no entra en el
encargo. Lista completa reproducible con:

```
node .tmp/img-consumers.mjs      # o el script equivalente del PR
```

Los 20 ficheros de `public/villas/` que **sí** tienen consumidor tras la retirada:
`about.jpg`, `casa-almazara.jpg`, `casa-almena.jpg`, `door.jpg`, `experiencias-hero.jpg`,
`guest-app-hand.jpg`, `hero-poster.jpg`, `journey-{antes,durante,despues}.jpg`,
`portal-tablet.jpg`, `services/{actividades,beach-clubs,chef,experiencias,limpieza,transfer,wellness}.jpg`,
`villa-liria.jpg`, `villa-sosiego.jpg`.

---

## 2. Qué ocupa el hueco — fase 2

`/coleccion` **no desaparece**: la URL está indexada, es la primera entrada del pie y la
primera de la navegación, y tiene atajo de teclado propio (`g` + `c`). Queda como estado
honesto.

### 2.1 Composición de la página

1. **Encabezado — conservado sin cambio.** `coleccion.eyebrow` («— Colección 2026») y el
   `h1` («Nuestra *colección privada* en la Costa del Sol»). No afirman inventario: nombran
   la colección, que es lo que se abre.
2. **Un solo bloque de texto** — `coleccion.body`, sustituido. **Texto nuevo, pendiente de
   revisión de Ángel:**

   > **es** — «La colección abre en octubre de 2026. Hasta entonces no publicamos ninguna
   > residencia; si desea reservar una estancia o incorporar su propiedad, escríbanos.»

   Traducido a `en` / `fr` / `de`. Única cadena nueva del PR. La fecha —octubre de
   2026— es la fijada por Ángel; no se añade ninguna otra fecha, cifra ni promesa.
3. **Llamada al contacto, huésped vs propietario**, reutilizando destinos y etiquetas que
   ya existen — **cero copy nuevo**:
   - `/contacto?type=guest` con `cta.solicitar_estancia` («Solicitar estancia»)
   - `/contacto?type=owner` con `cta.valorar_propiedad` («Valorar mi propiedad»)

   Son los mismos par destino/etiqueta que ya usan `components/navigation.tsx:123-124`,
   `/propietarios` y `/faq`.

**Sin contador de residencias. Sin «próximamente» decorativo. Sin plantillas vacías.**

### 2.2 Lo que también se retira de `/coleccion`, y por qué — decisión a revisar

Además de la rejilla, se retira la sección **«SEDA Standard — Todas las residencias SEDA
incluyen»** (6 tarjetas: check-in, soporte 24/7, estándar, Guest App, servicios,
privacidad) y la sección **CTA «¿No encuentra la villa exacta?»**.

- El CTA es retirada obligada: «**Tenemos** residencias fuera de catálogo para estancias
  largas o grupos privados» afirma un inventario oculto que no existe. Es la misma clase de
  afirmación que las cuatro fichas.
- La sección «SEDA Standard» es **juicio aplicado, y merece tu visto bueno**. El encargo
  fija la composición de la página en tres elementos (encabezado + un bloque de texto +
  llamada al contacto), y esta sección no es ninguno de los tres. Por su contenido, además,
  está en presente y en plural sobre una cartera vacía: «Todas las residencias SEDA
  incluyen…». **El copy no se pierde**: las 15 claves quedan registradas aquí y en el
  historial de git, y describen compromisos de servicio que encajarían en `/propietarios` o
  `/guestapp` si quieres recolocarlas. Dilo y se recolocan en un PR aparte.

### 2.3 La home

`ProjectsSection` se retira completa de `app/[locale]/page.tsx`. No queda hueco: la sección
era autónoma (encabezado propio + rejilla propia + contador `(04) Villas`) y su vecindad
—`ValueProp` → `EditorialBreak`— enlaza sin transición intermedia. **No se sustituye por
nada**: cualquier bloque de relleno sería la «plantilla vacía» que el encargo prohíbe.

---

## 3. Las 16 URLs indexadas — 410, no redirección

**Decisión: `410 Gone`** para las 16 URLs (`/villa/<slug>` en los 4 locales), servido desde
[`proxy.ts`](../../proxy.ts) antes del middleware de `next-intl`, con un cuerpo HTML mínimo
que enlaza a `/coleccion`.

**Por qué 410 y no `301`/`308` a `/coleccion`:**

1. **Una redirección afirma equivalencia.** `301` significa «este recurso ahora está aquí».
   Las cuatro villas no se han movido a `/coleccion`: no existen. Redirigir cuatro fichas de
   propiedad concreta a una página que dice «la colección abre en octubre» es exactamente el
   patrón que Google clasifica como *soft 404* — la URL sobrevive en el índice, la
   redirección se ignora, y el título antiguo («Villa Alborán · SEDA Private Homes») puede
   seguir apareciendo en resultados. El objetivo aquí es lo contrario: **que desaparezcan
   del índice**, y `410` es la señal explícita e inequívoca para eso, más rápida que un `404`.
2. **`410` es la afirmación correcta.** «Este recurso existió y ha sido retirado de forma
   permanente» es literalmente lo que ha pasado. `404` («no encontrado») sería ambiguo —
   podría leerse como un fallo temporal— y el encargo lo descarta por eso.
3. **No se pierde al visitante.** El cuerpo servido con el `410` lleva un enlace a
   `/coleccion` en el idioma correspondiente. Un `410` con cuerpo útil cubre la parte
   humana; el código de estado cubre la parte del buscador. Una redirección solo cubre la
   primera, y a costa de mentir sobre la segunda.

**Aplicado a las cuatro por igual**, sin excepciones, incluidas las rutas hijas
(`/villa/<slug>/opengraph-image`). Cualquier otra ruta bajo `/villa/` que nunca existió
sigue devolviendo `404`, que es lo correcto: no fue retirada, nunca estuvo.

---

## 4. Aviso del pie — fase 4: reportado, NO modificado

Texto actual (`home.footer.disclaimer`, 4 idiomas):

> «Las imágenes que ilustran las propiedades en esta web son renderizaciones conceptuales.
> La fotografía profesional de cada villa está disponible bajo solicitud directa al equipo
> SEDA.»

**Comprobación:** tras la retirada **siguen publicándose imágenes de propiedad** —
`/descubre` (5 municipios ilustrados con renders), el póster y el vídeo del hero,
`editorial-break`, `guest-app-section`, `/experiencias`. **La primera frase sigue siendo
necesaria y correcta.**

**La segunda frase, no.** «La fotografía profesional **de cada villa** está disponible bajo
solicitud directa al equipo SEDA» presupone un conjunto de villas identificables de las que
SEDA tendría fotografía profesional. Retiradas las cuatro fichas, ese conjunto está vacío:
la frase ofrece material de propiedades que ya no se publican, y que —en el caso de las
cuatro retiradas— nunca fueron reales. Es del mismo género que lo retirado en
`VERACIDAD-PUBLICA.md` §10.8: una oferta de acreditación/material que no puede cumplirse.

**No se cambia en este PR**, conforme al encargo. Propuesta para tu decisión: **conservar la
primera frase y retirar la segunda**, dejando

> «Las imágenes que ilustran las propiedades en esta web son renderizaciones conceptuales.»

No propongo sustituto para la segunda: no hay fotografía profesional de villas SEDA que
ofrecer, y prometer que la habrá sería una promesa de resultado.

---

## 5. Residuo consciente — `components/breadcrumbs.tsx`

Su **único consumidor** era la ficha de villa. Tras la retirada el componente queda sin
llamadas, y con él las claves `breadcrumb.{home,coleccion,label}`.

**No se borra**, y se ficha aquí para que la decisión sea explícita y no por omisión: es
infraestructura correcta (patrón WAI de migas, `aria-current="page"`, JSON-LD
`BreadcrumbList` con URLs por locale ya corregidas para `fr`/`de`), no una afirmación
sobre el negocio, y volverá a hacer falta en cuanto exista cualquier ruta profunda. Si
prefieres el repo sin código muerto, se retira componente + 3 claves en un PR de dos
líneas.

---

## 6. Fuera de alcance — `.tmp/seda4/`

Las cuatro villas también aparecen en `.tmp/seda4/*.jsx` (prototipo de diseño trackeado en
git). **No se toca**, por el mismo motivo por el que nunca se ha tocado en esta auditoría:
ninguna ruta de Next lo sirve, no es contenido público. Desde el PR #27 el directorio lleva
`LEEME.md` advirtiendo de que ninguno de sus datos es real. Ver `VERACIDAD-PUBLICA.md` §9.

---

## 7. Verificación

Registrada en `VERACIDAD-PUBLICA.md` §10.11 junto con el cierre de la ficha.
