# REA · seda-web — ¿lo que la web dice coincide con lo que SEDA hace y ha decidido hoy? — 2026-10-27

Auditoría con el método de [REA](https://github.com/morluto/rea) y el formato de las REA de
`portal-propietarios` (`docs/audit/REA-*.md`): BLOQUEA / IMPORTANTE / MENOR, una prueba por
hallazgo, lo que salió limpio, lo que no se pudo medir y decisiones con recomendación.

**Auditoría, no arreglo.** No se ha tocado el código de la web, ni DDL, ni DML. Este PR trae el
informe y [`tests/rea-seda-web-2026-10.test.ts`](../../tests/rea-seda-web-2026-10.test.ts), que
reproduce cada hallazgo. `portal-propietarios` se ha leído como referencia; no hay rama ni PR allí.

Fuente de verdad contra la que se ha juzgado la web: las decisiones de Ángel del 25–26-oct-2026
(tarifa v6, pago 30/70, cancelación por tramos, fianza V2, arrendador «en nombre y por cuenta»,
VFT obligatorio, S.L. con CIF) tal como las dio el encargo. **Ninguna de ellas está escrita en un
fichero de los repos** (`portal-propietarios/docs/PRICING.md` sigue en v3, `D-2026-08-16`): el
encargo es la única fuente, y los cálculos de abajo salen de él.

---

## Veredicto

> **Hoy, en producción, no hay nada que bloquee. Para encender el escaparate, sí hay dos cosas.**
>
> **Producción (medido hoy):** el despliegue de `seda-web.vercel.app` es `main` (`5284876`, el
> revert de la v4). Con `SEDA_FLAG_ESCAPARATE_VILLAS` apagado `/villa/bay-side` responde 404 y
> `/coleccion` dice «Próxima apertura. Mientras tanto no publicamos ninguna residencia». La CSP, HSTS y
> demás cabeceras están puestas. Cero analítica, cero banner necesario, cero secretos.
>
> **Pero la web publica un precio que ya no es el vigente** (24 % sobre la base, preaviso de 60 días,
> sin IVA, sin tope, sin margen de mantenimiento) en **24 apariciones en `messages/*.json` (6 × 4 idiomas) y 8 más en `/founding-owners` y `/meet`**, que además viajan al
> JSON-LD `FAQPage`, a `/llms.txt` y `/llms-full.txt` (comprobado con `next start`). Y hay **cuatro
> afirmaciones que la plataforma no sostiene hoy** (SES «verifica la identidad», «motor propio / sin
> SaaS», «2 propietarios en programa», un panel «EN DIRECTO» con rankings inventados).
>
> **Para abrir reservas (BLOQUEA):** B-1 — el escaparate se abre con un flag, no con el VFT: con el
> flag a `1` y sin número de registro la ficha se ve, lleva el botón *Reservar* a Beds24 y `/coleccion`
> dice «las casas que ya puede reservar». B-2 — la ficha vende «Reserva directa con SEDA», no dice
> quién es el arrendador, y el aviso legal asegura que la web «no formaliza reservas» ni «publica
> precios».

**Recuento: 2 BLOQUEA · 14 IMPORTANTE · 9 MENOR.** 67 pruebas en `tests/rea-seda-web-2026-10.test.ts`:
18 pasan (controles y cifras de la v6 hechas a mano) · 49 `it.fails` (los defectos).

### Tres premisas del encargo que no coinciden con lo medido

| El encargo decía | Lo medido |
|---|---|
| «Imágenes de 154 MB sin comprimir y vídeo de portada con `preload=auto`, ya conocidos: mide si siguen» | **Ya no.** `public/` pesa **4,4 MB** (la foto más pesada, 199 KB; `hero.mp4`, 1,2 MB), por #73 (8-oct, 218,6 → 9,1 MB). El vídeo lleva `preload="none"` y se engancha tras el evento `load` (`components/hero.tsx:123`). Lo guarda `tests/public-assets.test.ts`. Lo único que queda de aquello es **historia de git**: el pack pesa 209 MB (M-3). |
| «datos reales aún no en la web, PR #50 pendiente» | **`seda-web#50` ya está mergeado (2-sep, `7adca63`)**: rellenó NIF y domicilio **de Ángel como persona física** (`lib/legal/identidad.json`). Lo pendiente es lo siguiente: sustituir persona física por la S.L. (I-7). Si el #50 que tenías en mente es de otro repo, no lo he encontrado (`portal-propietarios#50` es un doc-only de junio). |
| La web está en v3/v4/v5 | Está en **v3**: la v4 (`#94`) se mergeó el 19-oct y se **revirtió** (`#96`). El alta (0 / 0 / 0 / 490 / 490 / 1.290 €) ya coincide con la v6; lo demás, no. |

---

## Método

- **Código** de `seda-web` en `origin/main` = `5284876`, rama `docs/rea-seda-web-2026-10`. Se han leído
  entero: los cuatro `messages/*.json`, `propietarios`, `founding-owners`, `meet`, `villa/[slug]`,
  `coleccion`, `contacto`, `api/contact`, `escaparate`, `jsonld`, `llms`, `robots`, `sitemap`,
  `proxy`, `vercel.json`, `next.config.mjs`, las tres páginas legales (cabeceras y las afirmaciones
  que dependen del código).
- **Producción, solo lectura.** `curl` a `sedaprivatehomes.com` desde este contenedor da `403` del
  proxy; se usó el MCP de Vercel: `list_deployments` (producción = `5284876`), `web_fetch_vercel_url`
  sobre ese despliegue (`/villa/bay-side` → 404; `/coleccion` → 200 con «Próxima apertura»; cabeceras
  de respuesta completas) y `get_firewall_config` (404: no hay configuración de firewall propia).
  **Las variables de entorno no se han leído.**
- **Base de datos, solo `SELECT` de conteo** (CLAUDE.md: «Permitido: SELECT»): `propietarios` = 1,
  `propiedades` = 1 (`estado = prospecto`), `contratos_gestion` = 0, propiedades con `numero_vft` = 0.
- **Servidor local**: `npm run build` + `next start` en el puerto 3111 y recorrido con Playwright
  (móvil 390×844) de 15 rutas × 4 idiomas = **60 páginas**, inyectando la CSP real de `vercel.json`
  en cada documento y escuchando `securitypolicyviolation`. Mide además errores de consola,
  peticiones fallidas, bytes, imágenes sin `alt`, campos sin etiqueta, `<main id>` y desbordes.
- **Cifras de la v6 a mano** (no con el código): ver el primer bloque de la tabla de tests.
- **Repositorios de referencia**: `portal-propietarios` `main` (`13df1e7`) — `docs/audit/REA-GLOBAL-PLATAFORMA-2026-10.md`,
  `REA-SECRETOS-Y-PUERTAS-2026-10.md`, `docs/POLITICA-CANCELACION.md`, `docs/ROADMAP.md`,
  `docs/fiscal/DICTAMEN-FISCAL-SEDA-26-criterios-2026-09-17.md`. **`guest-app` no está en este
  entorno**: lo que la web dice de la Guest App se ha cotejado solo contra lo que esas REA cuentan
  de ella.

---

## Hallazgos

| # | Gravedad | Dónde | Resumen | Prueba (describe → test) |
|---|---|---|---|---|
| B-1 | **BLOQUEA** (abrir) | `lib/escaparate.ts:101,110`, `coleccion/page.tsx:29`, `site-pages.ts:77` | Visible = flag. El VFT solo decide `noindex`/sitemap/JSON-LD | `B-1 …` ×2 |
| B-2 | **BLOQUEA** (abrir) | `messages/*.json` `escaparate.meta.description`, `lib/legal/aviso-legal.ts:60` | «Reserva directa con SEDA»; ni rastro de «arrendador»; aviso legal contradice | `B-2 …` ×3 |
| I-1 | IMPORTANTE | 32 apariciones | La comisión publicada es 24 % sobre la base (v3), no 21 % + IVA con tope del 20 % | `I-1 …` ×9 |
| I-2 | IMPORTANTE | `messages/*.json` `prop.faq.items.q7.a` | «Preaviso de 60 días»; la v6 es 1 mes | `I-2 …` ×4 |
| I-3 | IMPORTANTE | `PropietariosContent.tsx:243-244` | El simulador aplica 24 % plano: sin tope, sin IVA | `I-3 …` ×1 |
| I-4 | IMPORTANTE | FAQ de propietarios | La web calla lo que la v6 cobra aparte (12 % sobre el exceso de 200 €) y el «con preaviso» del uso propio | `I-4 …` ×8 |
| I-5 | IMPORTANTE | `founding-owners/page.tsx:45,75,105,135` | «2 propietarios en programa»: hay 1 propietario y 0 contratos | `I-5 …` ×1 |
| I-6 | IMPORTANTE | `founding-owners/page.tsx:58,88,118,148` | Cita el «Modelo 179/238»; el 179 está derogado desde 2024 | `I-6 …` ×1 |
| I-7 | IMPORTANTE | `meet/page.tsx:108,148,188,228` vs `aviso-legal.ts:44` | La web dice «Seda Private Homes S.L.»; su aviso legal dice que no existe sociedad | `I-7 …` ×1 |
| I-8 | IMPORTANTE | `messages/*.json` `prop.trust.items.ses.b`, `faq.owners_items.q6.a`; `meet/page.tsx:84` | Cumplimiento «automatizado» y SES «verifica la identidad» con SES apagado | `I-8 …` ×3 |
| I-9 | IMPORTANTE | `PropietariosContent.tsx:528,568`, `dashboard-mockup.tsx:17`, `messages/*.json` `prop.os.live` | Panel «EN DIRECTO / OPERATIVO» con rankings SEO, precio sugerido, 142.300 € y 14 reservas inventados | `I-9 …` ×4 |
| I-10 | IMPORTANTE | `messages/es.json:186,344,484` | «Motor propio», «Sin SaaS genéricos», «pricing dinámico» frente a Beds24 y PriceLabs | `I-10 …` ×1 |
| I-11 | IMPORTANTE | `messages/*.json` `escaparate.incluye.llegada` | La ficha de Bay Side promete «llegada sin llaves»; Bay Side no tiene cerradura conectada | `I-11 …` ×1 |
| I-12 | IMPORTANTE | `app/api/contact/route.ts` | Acepta POST de cualquier origen como `text/plain`; el límite es por instancia | `I-12 …` ×1 |
| I-13 | IMPORTANTE | `ContactoContent.tsx:8-47` (`Field`), `PropietariosContent.tsx:301`, `meet/page.tsx:249` | Formulario sin `<label>`, deslizadores sin nombre, `/meet` y `/guias` sin destino del «Saltar al contenido» | `I-13 …` ×4 |
| I-14 | IMPORTANTE | `messages/es.json:736,752` vs `:1222` | La Guest App es «ES · EN · DE · FR» en una página y cinco idiomas con italiano en otra; + promesas sin fuente | `I-14 …` ×1 |
| M-1…M-9 | MENOR | ver más abajo | CCBot, sitemap, `.tmp/`, JSON-LD, 404, privacidad, cadenas de versión, textos fuera de `messages/`, premios «consecutivos» | `M …` ×4 |

---

### B-1 · BLOQUEA (para abrir) · el escaparate se enciende con un flag; el VFT solo decide si se indexa

`lib/escaparate.ts:101` — `villasVisibles()` devuelve las fichas con el flag a `"1"`. `esIndexable()`
(l. 110) sí exige `registroTuristico`, pero solo la usan `generateMetadata` (`noindex`), el sitemap y el
JSON-LD. Con el flag a `1` y Bay Side sin VFT (hoy `registroTuristico: null`, y en la base `numero_vft`
vacío):

- `/villa/bay-side` se renderiza con el botón **Reservar** → `https://beds24.com/booking2.php?propid=…`
  (`components/escaparate/reserva-beds24.tsx`, solo se degrada a «Solicitar estancia» si faltan los ids de
  Beds24, no el VFT).
- `/coleccion` pasa a «Estas son las casas que ya puede reservar» (`ColeccionContent.tsx:51`) y a
  enlazar la ficha; su `<meta description>` también (`site-pages.ts:77`).
- `noindex` no impide que el enlace circule: es una URL pública con un botón de reserva.

El encargo lo dice sin matices: *«la web no debe publicar la casa como reservable sin [VFT]»*, y el
propio comentario de `escaparate.ts:10` dice «Mientras no lo haya, el escaparate entero va detrás de este
flag». El flag es una cerradura; el VFT debería ser la llave. Beds24 ya lo sabe: el vigilante de
Beds24 marca *«Falta el número de licencia turística»* en nivel `bloquea` (REA-GLOBAL §1).

**Prueba:** `B-1` — control: con el flag apagado no hay fichas (en producción: 404, medido); `it.fails`:
con el flag a `"1"` y sin VFT, `villasVisibles()` debería ser `[]`; hoy devuelve Bay Side.

### B-2 · BLOQUEA (para abrir) · la ficha vende «reserva directa con SEDA»; el aviso legal dice lo contrario

1. `escaparate.meta.description` (4 idiomas): «Reserva directa con SEDA Private Homes». Y
   `escaparate.reserva.nota`: «El pago se gestiona en Beds24, el sistema de reservas de SEDA».
   La decisión es que **SEDA actúa en nombre y por cuenta del propietario** (DGT V0367-18) y que booking
   page, confirmación y factura dicen «Arrendador: [propietario] · gestiona SEDA». En toda la web la
   palabra *arrendador* no aparece ni una vez (`grep -ri arrendador messages lib app`).
2. `lib/legal/aviso-legal.ts:60`: «No dispone de sistema de contratación en línea. **No publica
   disponibilidad ni precios**, no procesa pagos y no formaliza reservas». Con la ficha, enlaza a una
   booking page donde sí se reserva y se paga; y **ya hoy** publica precios (la comisión y el alta).
3. La web no dice nada del 30/70, de la política de cancelación por tramos, de la fianza V2 ni de
   «servicios con IVA incluido». Está bien que el detalle viva en Beds24 (el texto ya está ahí, en 4
   idiomas); lo que falta es **el enlace desde la ficha** antes de pulsar *Reservar*.

**Prueba:** `B-2` ×3 — «No publica disponibilidad ni precios» convive con `1.290 €` en la misma web;
ninguna cadena menciona *arrendador*; la meta de la ficha empieza por «Reserva directa con SEDA».

---

### I-1 · IMPORTANTE · el precio publicado es el de la v3

La v6: **un único plan al 21 % + IVA sobre lo que queda tras la comisión del canal (la limpieza no
cuenta), nunca más del 20 % del precio del alojamiento**. La web:

| Dónde | Texto | Líneas |
|---|---|---|
| FAQ propietarios (portada de `/propietarios`) | «comisión del 24 % … efecto real ronda el 18 %» | `messages/*.json:545` ×4 |
| FAQ de `/faq` | «comisión del 24 % sobre el alojamiento» | `messages/*.json:1236` ×4 |
| Simulador (nota y descargo) | «24 %» ×2 | `messages/*.json:532,533` ×4 |
| Maqueta de liquidación (portada y `/propietarios`) | «Comisión SEDA · 24 % de la base», «Comisión 24 %» | `messages/*.json:217,367` ×4 |
| `/founding-owners` | «Comisión del 24 % … 1.200 € … 216 €» | `page.tsx:54,84,114,144` |
| `/meet` | «24 % de comisión sobre base neta» | `page.tsx:96,136,176,216` |
| **Derivados** | JSON-LD `FAQPage` (`lib/faq.ts`), `/llms.txt`, `/llms-full.txt` (línea 74 del texto servido) | los generan las mismas claves |

Los ejemplos de la web, recalculados a mano con la v6:

| Caso | La web publica (v3) | v6 (sin IVA) |
|---|---|---|
| `/founding-owners`: 1.200 € vía Airbnb, limpieza 120 €, canal 180 € → base 900 € | 24 % × 900 = **216 €** | 21 % × 900 = **189 €** (tope 20 % × 1.080 = 216 €: no actúa) → +39,69 € de IVA |
| Maqueta de liquidación: 1.000 € directa, limpieza 100 € → base 900 € | 24 % × 900 = **216 €**, neto 784 € | 21 % × 900 = 189 € → **tope 20 % × 900 = 180 €**, +37,80 € de IVA |
| Directa, 1.000 € de alojamiento | 240 € | 210 € → **tope 200 €**, +42 € de IVA |
| Airbnb 15 %, 1.000 € de alojamiento | 24 % × 850 = 204 € | 21 % × 850 = **178,50 €** (+37,49 € de IVA) |

Dos arrastres más: «el efecto real **ronda el 18 %**» solo es cierto con canal al 15 % y **sin IVA**
(21 % × 0,85 = 17,85 %); en directa es el 20 % del tope, y con IVA es 21,6 %. Y el texto «sin letra
pequeña: pide siempre la base de cálculo» se queda corto si la web no menciona que el IVA va aparte.

**Prueba:** `I-1` ×9 (por idioma: ninguna cifra del 24 % + la FAQ dice 21 %, 20 % e IVA; y las dos
páginas con texto propio). Control: el calendario del alta publicado (490 / 1.290) **ya es el de la v6**.

### I-2 · IMPORTANTE · «Preaviso de 60 días»

`messages/*.json:569` (`prop.faq.items.q7.a`): «Preaviso de 60 días, sin penalizaciones» en los cuatro
idiomas. La v6: 1 mes. **Prueba:** `I-2` ×4.

### I-3 · IMPORTANTE · el simulador aplica 24 % plano

`PropietariosContent.tsx:243-244`: `netDirect = G × (1 − 0,24)`; `netOTA = G × 0,85 × 0,76`. Sin tope ni IVA.
Con los valores por defecto (72 % × 365 × 1.450 € = 381.060 €) enseña **246.165 – 289.606 €**; la v6 da
**255.882 – 304.848 € sin IVA** y **241.598 – 288.838 € con IVA** (directa 0,758 × G; Airbnb 0,634 × G). Por
casualidad el número de directa con IVA cae cerca del actual; el de Airbnb, no, y la fórmula sí está
mal en ambos casos. **Prueba:** `I-3` (la fuente no tiene `0.21` ni `Math.min`) + control con las cifras
a mano.

### I-4 · IMPORTANTE · lo que la v6 cobra aparte y la web no cuenta

- **Margen de mantenimiento del 12 % solo sobre el exceso de 200 € (sin IVA):** no aparece en ninguna
  de las 4 FAQ de precio. La web presume de «sin letra pequeña».
- **Uso propio:** `prop.faq.items.q5.a` dice «Bloquee las fechas … sin coste adicional (sólo limpieza y
  reposición a tarifa interna)». La v6 es «libre **con preaviso**». «Tarifa interna» no existe como
  concepto publicado en ningún otro sitio.

**Prueba:** `I-4` ×8 (por idioma: preaviso en el uso propio; 12 % y 200 € en alguna respuesta).

### I-5 · IMPORTANTE · «2 propietarios en programa»

`founding-owners/page.tsx:45` (y las tres traducciones): `trust: [..., "2 propietarios en programa"]`.
`SELECT` del 27-oct: `propietarios` = **1**, `propiedades` = 1 (`prospecto`), `contratos_gestion` = **0**.
La auditoría de agosto ya había quitado la misma cifra de otras páginas (`VERACIDAD-PUBLICA.md` §10);
esta quedó en la página que sólo se alcanza por enlace directo de la captación. «Alta gratuita para las
3 primeras firmas directas» es coherente con la v6 y con 0 contratos; el contador, no. **Prueba:** `I-5`.

### I-6 · IMPORTANTE · «Modelo 179/238, según normativa vigente»

`founding-owners/page.tsx:58,88,118,148`. El Modelo 179 quedó derogado por el RD 117/2024 y lo sustituye
el 238 (DAC7, anual): `portal-propietarios` `docs/fiscal/DICTAMEN-FISCAL-SEDA-26-criterios-2026-09-17.md`
l. 358, `docs/ESTADO.md:688` («retirados tres bloques falsos sobre el Modelo 179/238 … el modelo está
derogado desde 2024») y `COMPARATIVA-PROCEDENCIA.md:378`. «Según normativa vigente» no salva citar un
modelo que no está vigente. *No he comprobado el BOE; me fío del dictamen interno.* `/propietarios` ya
dice «Informativas AEAT» sin número. **Prueba:** `I-6`.

### I-7 · IMPORTANTE · una S.L. que el aviso legal dice que no existe

- `meet/page.tsx:108,148,188,228`: pie «Seda Private Homes S.L. · Marbella · España».
- `lib/legal/aviso-legal.ts:44`: «No existe todavía sociedad mercantil constituida … Preferimos decirlo
  a dejar el apartado en blanco». Titular: Ángel como persona física; domicilio particular en
  Torremolinos y su NIF, publicados (`identidad.json`).
- Tres sedes: Marbella (pie de `/meet`), Torremolinos (aviso legal), Estepona (`nosotros.hero.base_value`).

Con el CIF ya concedido, **cada día que pasa el aviso legal miente por el otro lado**. El siguiente paso
no es otro PR de datos: es **el cambio de titular en un solo sitio** (`identidad.json` + el párrafo
«No existe todavía…», que hoy es texto fijo y **no está atado a los datos**: el gate de build solo mira
que los campos no sean `null`) y que el pie de `/meet` salga de `entity.ts` en vez de estar escrito en
cuatro idiomas. **Prueba:** `I-7` — control (el aviso dice que no hay sociedad) + `it.fails` (ninguna
otra página dice «S.L.» mientras lo diga).

### I-8 · IMPORTANTE · «automatizado» frente a SES apagado

REA-GLOBAL-PLATAFORMA G-01 (BLOQUEA allí): SES en `off`, **0** partes comunicados en toda la historia,
`ses_comunicaciones` vacía; la web comenta ya en su fuente «gate SES que está en off»
(`PropietariosContent.tsx:845`) y retiró «100 % Cumplimiento legal». Quedan:

- `prop.trust.items.ses` — «SES Hospedajes: **Verificación de identidad del huésped en el check-in**»,
  en presente y sin «preparado para». Además es técnicamente otra cosa: SES es la comunicación al
  Ministerio, no una verificación de identidad.
- `faq.owners_items.q6.a`: «**Automatizado** desde el alta de la villa en SEDA OS».
- `meet/page.tsx:84`: título «Compliance automatizado»; l. 89: «Estructura de comisión **fiscalmente
  deducible** documentada» (afirmación fiscal sin dictamen citado en este repo).

**Prueba:** `I-8` ×3.

### I-9 · IMPORTANTE · un panel «EN DIRECTO» con cifras inventadas

Con **0 propiedades publicadas y 1 prospecto**, la web enseña como producto en funcionamiento:
«SEDA OS · EN DIRECTO … OPERATIVO» (`prop.os.live/operative`, URL `app.sedaprivatehomes.com/os` —el
portal real es `portal.sedaprivatehomes.com`—, versión `v4.2.1`); «Posición media: Villa de lujo Marbella
#2 · Alquiler Costa del Sol #4 · Villa Puerto Banús **#1** · Apartamento Torremolinos #3»
(`PropietariosContent.tsx:568`); «SUGERIDO HOY €2.890» (l. 528); «Ingresos previstos **€ 142.300** ·
14 reservas activas» (portada, `dashboard-mockup.tsx:17`). Solo la liquidación se rotula «de ejemplo»;
el resto no. La retirada de agosto quitó «+24 % RevPAR» y «14 propiedades en gestión» pero dejó estas
cifras. **Prueba:** `I-9` ×4.

### I-10 · IMPORTANTE · «motor propio / sin SaaS genéricos» frente a la propia web

- `prop.arch.mod.reservas.body`: «**Motor propio** multicanal con sincronización en tiempo real,
  anti-overbooking y políticas dinámicas» · `prop.hero.body` y `home.os.body`: «**Sin SaaS genéricos**».
- La misma web, en la ficha: «el pago se gestiona en **Beds24**, el sistema de reservas de SEDA», y
  `lib/escaparate.ts:2`: «Beds24 es la única fuente de verdad de las reservas».
- «**Pricing dinámico**» (`prop.marketing.pricing_h3`, `prop.arch.mod.marketing.body`): el propio ROADMAP
  de la plataforma dice «NO existe motor de pricing propio … el motor real es **PriceLabs**, SaaS
  externo» (D-2026-07-17). Eso es lo que **está contratado**, no lo que sea «propio».
- «Monitoreo del compset» (`prop.marketing.compset_body`): no consta en ninguna REA ni doc.
- «v 4.2 · Build 2026.10» (`prop.arch.version`): no hay versión 4.2 de nada que conste.

**Prueba:** `I-10` — control (la ficha dice Beds24) + `it.fails` (no se dice «Motor propio» ni «Sin SaaS»).

### I-11 · IMPORTANTE · la ficha de Bay Side promete «llegada sin llaves»

`escaparate.incluye.llegada`: «Llegada sin llaves: acceso inteligente y check-in autónomo». Es un texto
fijo para cualquier ficha. En la base, Bay Side no tiene `nuki_id` ni `nuki_code`, y **no se ha enviado
ningún código de Nuki en toda la historia** (REA-GLOBAL §1). Y `guestapp.features.items.lock_*`: «Nuki
Smart Lock integrado» se presenta como hecho cuando nunca ha abierto una puerta real. **Prueba:** `I-11`.

### I-12 · IMPORTANTE · `/api/contact` no mira de dónde viene la petición

Medido con `next start` (modo mock): `POST` con `Content-Type: text/plain` y `Origin: https://evil.example`
→ **200**; a la sexta en 10 minutos, `429`. Por tanto:

- Cualquier página o script ajeno puede fabricar peticiones «simples» (sin preflight) al buzón.
- El límite es **por instancia** (`hits` en memoria; lo dice el propio fichero y el aviso legal): en
  serverless no es un límite.
- `route.ts:15` documenta el plan gratuito de Resend: **100 correos/día**. Un goteo agota el cupo y, desde
  ese momento, `502` a los propietarios reales («No hemos podido enviar el mensaje»).
- `get_firewall_config` de Vercel responde `404: Seawall Config not found`: **no hay reglas propias**
  (la nota del propio fichero dice que «el límite duradero pertenece al Firewall»).

Lo que sí está bien (ver «Lo que salió limpio»): honeypot, límites de tamaño, validación estricta,
escape del HTML, sin inyección de cabeceras, 503 en producción sin clave. **Prueba:** `I-12` — control
(el mismo origen entra) + `it.fails` (otro origen → 403).

### I-13 · IMPORTANTE · accesibilidad de lo que recoge datos

Recorrido de 60 páginas con la CSP puesta (cero violaciones, cero errores de consola, cero peticiones
fallidas, cero desbordes horizontales, `h1` único en todas, `lang` correcto):

- **Formulario de contacto**: `Field` pinta la etiqueta en un `<span>` (`ContactoContent.tsx:30`), no
  `<label>`: los 10 campos de «Estancia» no tienen nombre accesible más que el *placeholder* (WCAG
  1.3.1, 3.3.2, 4.1.2). Es el único canal de captación.
- **Simulador**: los dos `<input type="range">` no tienen nombre (`SimSlider`, l. 301).
- **`/meet` y `/guias*`**: `<main>` sin `id="main-content"`; el enlace «Saltar al contenido» (`SkipLink`)
  apunta a un destino que no existe. (`/meet` es la página a la que se manda a los propietarios.)
- El `<iframe>` de Calendly lleva `title` fijo en inglés en los cuatro idiomas.

**Prueba:** `I-13` ×4.

### I-14 · IMPORTANTE · promesas sin fuente o que se contradicen

- **Idiomas de la Guest App:** `guestapp.features.items.lang_b` «ES · EN · DE · FR de forma nativa, **sin
  traducción automática**» y el rótulo `marquee.i5` «ES·EN·DE·FR», frente a `faq.guests_items.q4.a`
  «español, inglés, alemán, francés **e italiano**» y la portada «cinco idiomas». El concierge IA responde
  con un modelo de lenguaje: «sin traducción automática» es discutible. **Prueba:** `I-14`.
- **«Tiempo medio de respuesta: menos de 2 minutos»** (portada FAQ q2; `lang`/`concierge_b`): no hay
  medición en ninguna REA ni doc. *No me consta; habría que medirlo en `guest-app` antes de publicarlo.*
- **«Equipo SEDA en plantilla local … 24/7»**, «conserje humano», «Opera en Marbella, Estepona,
  Benahavís, Casares y Málaga» (`/llms.txt`, JSON-LD `areaServed`): hoy hay 1 propiedad prospecto en
  Estepona. `/meet` dice a la vez «Gestionado por el fundador … nunca habrá una cola de tickets».
- **«Datos cifrados. Sin tracking de terceros»** (`privacy_b`, Guest App): las REA listan en `guest-app`
  `NEXT_PUBLIC_SENTRY_DSN` y `NEXT_PUBLIC_MAPBOX_TOKEN` (REA-SECRETOS §«NEXT_PUBLIC_*»): Sentry y Mapbox
  son terceros que ven IP. *Hay que cotejarlo con la política de privacidad de la guest-app.*
- **«Seguros específicos»**, **«Verificación de huéspedes»** (FAQ de protección, portada y `/faq`): no
  consta ninguna póliza ni flujo de verificación en lo que he podido leer.
- **«Pruebe la app como un huésped real»** (`guestapp.final`, «Producto real»): el botón lleva a
  `guests.sedaprivatehomes.com/acceso`, que pide enlace o código de reserva (REA-SECRETOS: `/` →
  `/acceso?next=%2F`). *No me consta que haya un acceso de demostración.*

---

### MENOR

| # | Dónde | Hallazgo | Prueba |
|---|---|---|---|
| M-1 | `app/robots.ts` | `CCBot` no está nombrado: cae en `*` y puede rastrear. Decisión pendiente desde `GEO-BASE.md:124` (D-6). `host:` no es una directiva estándar (solo Yandex lo lee) | control |
| M-2 | `app/sitemap.ts:29,46,61` | `lastModified: now` en todas las URLs: cada despliegue «modifica» las 52 | `M …` |
| M-3 | `.tmp/` (27 ficheros) | Versionado: prototipos `seda4/*.jsx` y frames JPG. Y el pack de git pesa **209 MB** por las imágenes de antes del #73 (no afecta al visitante; sí a cada clon y al `git` de CI) | `M …` |
| M-4 | `components/page-json-ld.tsx:7` y 4 sitios más | `JSON.stringify` a pelo dentro de `<script>`: un `</script>` en un dato rompería la página. Hoy los datos son del repo; no es explotable, sí frágil | `M …` |
| M-5 | `app/not-found.tsx:18` | Título de la 404: «Not found · Página no encontrada — SEDA Private Homes · SEDA Private Homes» (se ve en producción) | `M …` |
| M-6 | `lib/legal/privacidad.ts` | (a) transferencias a EE. UU. (Vercel, Resend, Calendly): «puedes pedirnos información sobre las garantías» — el art. 13.1.f RGPD pide indicarlas (DPF/cláusulas) en la política; (b) el buzón «queda hasta que se elimina. No hay borrado automático» es honesto pero no es un plazo | — |
| M-7 | `PropietariosContent.tsx:60-62`, `messages/*.json:479` | `app.sedaprivatehomes.com/os`, `v4.2.1`, `Build 2026.10`: cadenas de producto que no existen | cubierto por I-9/I-10 |
| M-8 | `meet/page.tsx`, `founding-owners/page.tsx` | Los textos de estas dos páginas viven en un objeto `COPY` dentro del fichero: **no los cubre** `messages-parity.test.ts` ni los tests de idioma. Ninguna está enlazada desde la web (solo desde la captación); por eso la v3 sobrevivió al repaso. `/meet` es indexable y no está en el sitemap | — |
| M-9 | `nosotros.awards.body`, `hotel.k3` | «Cinco premios consecutivos»: son cinco distintivos de cinco plataformas y años distintos (TripAdvisor 2024, Booking 2026…); «consecutivos» pide una serie anual. Los distintivos son imágenes reales; **no he podido contrastarlos** (el dominio del hotel no resuelve desde aquí) | — |

---

## Lo que salió limpio (con su prueba)

- **Producción = `main`**: `list_deployments` → `5284876`. `/villa/bay-side` → 404 (flag apagado);
  `/coleccion` → «Próxima apertura»; `x-robots-tag: noindex` en el `*.vercel.app` (esperado).
- **Cabeceras en producción** (respuesta real vía Vercel): CSP completa, `X-Frame-Options: SAMEORIGIN`,
  `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS `max-age=63072000; includeSubDomains; preload`,
  sin `X-Powered-By`. (Cierra el hallazgo 3 de `REA-SECRETOS-Y-PUERTAS`.)
- **La CSP no rompe nada**: 60 páginas × (CSP real inyectada) = **0** `securitypolicyviolation`, 0 errores
  de consola, 0 peticiones fallidas. `frame-src https://calendly.com` y `form-action 'self'` son coherentes
  con la fachada de Calendly y con el *Reservar* como enlace (no `<form>`).
- **Analítica antes del consentimiento: no existe.** Ninguna dependencia ni cadena de analítica,
  píxeles, `document.cookie`, `localStorage`, `sessionStorage` en `app/`, `components/`, `hooks/`. Única
  cookie: `NEXT_LOCALE` (técnica; vista en la respuesta real: `Set-Cookie: NEXT_LOCALE=es; Path=/; SameSite=lax`),
  declarada en `/cookies`. Calendly **no se carga** hasta pulsar «Ver calendario»; el aviso previo existe.
  No hace falta banner (LSSI 22.2: cookie técnica) y no lo hay. `privacidad.ts` está redactada contra el código,
  fichero a fichero (y lo dice).
- **Secretos: ninguno.** `keys:check-leak` (180 ficheros), patrón sobre el árbol y sobre las **50 revisiones**
  de la historia (`sk_live`, `re_…`, JWT, `AKIA`, `-----BEGIN … PRIVATE`, `ghp_`, `xox`, `sb_secret_`): 0.
  `.env.example` sin valores; `NEXT_PUBLIC_*`: ninguna. `RESEND_API_KEY` solo en el servidor.
- **Formulario**: honeypot sin pista (misma respuesta que un envío bueno), 16 KB de máximo, 20 campos, allow-list
  por variante, longitudes, rechazo de caracteres de control, escape de HTML en el correo, `reply_to` sin
  inyección de destinatarios, 503 **sin** simular éxito en producción, `fra1`. Los destinos: `info@` por Resend.
- **Rendimiento móvil**: `public/` 4,4 MB; vídeo `preload="none"` (verificado en el DOM de las 4 portadas);
  portada 2,8 MB con el MP4 de 1,2 MB; resto de páginas 1,2–1,5 MB (813 KB de JS, 91 KB de fuentes).
  *No se ha pasado Lighthouse (no está instalado en el contenedor).*
- **Enlaces internos**: los 56 `href` internos distintos de las 60 páginas apuntan a rutas rastreadas (todas 200); sin
  `/guias` (no hay guías publicadas, `haySeccionGuias`). Las 19 `target="_blank"` llevan `rel` (comprobado por script).
  Externos (Calendly, LinkedIn, TripAdvisor, hotel) **no se han podido abrir** (proxy).
- **Entrada temprana**: la web no la vende ni la menciona; la salida tardía solo aparece en la maqueta
  de la Guest App («Late check-out disponible»). **Servicios con IVA incluido**: la web no publica
  precios de servicios, no hay nada que contradecir.
- **hreflang/canonical/sitemap**: 52 URLs, solo páginas indexables; `meet`, `founding-owners` y `/villa/*`
  fuera; `llms.txt` generado de las mismas fuentes. Robots: `/api/` cerrado y los seis rastreadores de IA nombrados.
- **Lint, tipos, tests, build**: ver «Verificación».

## Lo que no se pudo medir

- **`curl` a producción** (`403` del proxy): todo lo de producción se hizo por el MCP de Vercel.
- **Variables de entorno de Vercel** (`SEDA_FLAG_ESCAPARATE_VILLAS`, `SEDA_BEDS24_ESCAPARATE`,
  `RESEND_API_KEY`): no se leen. Que el flag esté apagado se deduce de que `/villa/bay-side` da 404 en el
  despliegue de producción.
- **La booking page de Beds24**: no se abrió. El texto del 30/70 y de la cancelación «ya en Beds24, 4
  idiomas» es lo que dice el encargo; no lo he contrastado.
- **Plan real de Resend** (100/día es lo que dice el comentario del código), **Firewall de Vercel**
  (solo «no hay configuración» por la API), **Calendly** y enlaces externos.
- **`guest-app`**: no está clonado. Todo lo que la web afirma de la Guest App se ha cotejado solo con lo
  que `portal-propietarios` cuenta de ella.
- **Premios del hotel**, **fotos reales**, **Lighthouse**.
- **La norma**: el BOE (Modelo 179, RD 117/2024) y la DGT V0367-18 no se han consultado; sirven los
  documentos internos citados.

---

## Decisiones para Ángel

| # | Decisión | Recomendación |
|---|---|---|
| D-1 | Cómo se escribe la v6 en público | Un único bloque de texto de tarifa en `messages/*.json` (namespace propio) del que beban la FAQ de `/propietarios`, `/faq`, el simulador, la maqueta, `/founding-owners` y `/meet`; así la v7 se cambia en un sitio y el JSON-LD y `llms.txt` la heredan. **«21 % + IVA sobre lo que queda tras la comisión del canal, nunca más del 20 % del precio del alojamiento»**, con el ejemplo de 1.000 € (directa 200 €; Airbnb 178,50 €) y el margen de mantenimiento a la vista. Y un test que lea esa cifra de un solo fichero. |
| D-2 | ¿El tope del 20 % incluye el IVA? | **No** (como en el doc v4 de la plataforma: el tope es sobre la comisión, el IVA va aparte). Escribirlo así y que el simulador lo diga. Si la respuesta es «sí», la cifra de 200 € de una directa de 1.000 € pasa a ser 165,29 € + IVA y hay que rehacer todos los ejemplos. |
| D-3 | `/founding-owners` y `/meet` | Mantenerlas (el alta 0 / 0 / 0 / 490 / 490 / 1.290 € **sigue siendo la v6**; no es el caso de la v4, que las eliminaba). Quitar «2 propietarios en programa» y el Modelo 179, mover su texto a `messages/` (M-8) y enlazar `/meet` desde `/propietarios` o dejarla `noindex`. Un contador de plazas («quedan 3») solo si sale de `contratos_gestion`. |
| D-4 | Cuándo y cómo se enciende el escaparate | Puerta = flag **y** VFT (`esIndexable`) para visibilidad, enlace y botón; sin VFT, la ficha da 404 y `/coleccion` no habla de «casas que ya puede reservar». Antes: ficha con «Arrendador: [propietario] · gestiona SEDA», enlace a la política de cancelación y resumen de 30/70 y fianza, y aviso legal reescrito para la web que ya enlaza a una reserva. El «sin llaves» de la ficha, derivado de un dato por casa (`cerradura: boolean`), no de un texto fijo. |
| D-5 | Titular legal | Cambiar a la S.L. en **un** PR el día que haya CIF + domicilio social: `identidad.json`, el párrafo «No existe todavía sociedad» (que pase a derivar de `inscripcionRegistral`), pie de `/meet` desde `entity.ts`, privacidad (responsable), y **retirar el NIF y el domicilio personales** de la web. Un test que impida «S.L.» y «no existe sociedad» a la vez. |
| D-6 | `CCBot` | **Dejarlo permitido por ahora.** `GEO-BASE.md` concluye que bloquearlo no cuesta visibilidad en las citas, pero tu decisión del 11-oct es «que las IA recomienden SEDA» y Common Crawl alimenta el entrenamiento de modelos base: con casi nada de huella pública, estar dentro ayuda más que protege. Revisar cuando se publiquen fichas con precios. |
| D-7 | Maquetas | Rotular todas «Datos de ejemplo» (o sustituirlas por una captura del portal con los datos de prueba de Bay Side) y **quitar** los rankings, el 2.890 €, el 142.300 €, «EN DIRECTO» y «v4.2.1». |
| D-8 | Cómo se llama lo que hay | «Software propio **conectado a** Beds24 (reservas y canales)»; «revenue management» sin «motor propio» ni «sin SaaS»; «pricing dinámico» solo si PriceLabs está en marcha para una casa real. |
| D-9 | Formulario | Comprobar `Origin`/`Sec-Fetch-Site` y `Content-Type: application/json` en `route.ts` (diez líneas) **y** una regla de límite en el Firewall de Vercel (eso solo lo puedes hacer tú en el panel). Plan de Resend por encima de 100/día antes de abrir. |
| D-10 | Promesas operativas (I-14) | Mantener solo las que se pueden demostrar el día del primer huésped: respuesta «en menos de 2 minutos» y «24/7» → retirar o medir en `guest-app`; «seguros» y «verificación» → retirar o enlazar a la póliza/flujo real; «Pruebe la app» → un acceso demo o cambiar el botón. |

---

## Verificación de este PR

| Comando | Resultado |
|---|---|
| `npm run check:legal` · `npm run keys:check-leak` (182 ficheros) · `npm run invariants:check` · `npm run compartidos:check` | verdes |
| `npm run lint` | 0 errores, 3 avisos (`<img>` en `hero.tsx:152`, `navigation.tsx:339,349`; ya existían en `main`) |
| `npx tsc --noEmit` | 0 errores |
| `npm test` | **14 ficheros, 455 pasan · 49 `it.fails` · 5 omitidos** (en `main`: 13 ficheros, 437 pasan · 5 omitidos; este PR suma 18 + 49) |
| `npm run build` | `exit 0` |
| `npm run test:integracion` (`next start`) | 2 ficheros, 36 pasan |
| Cada `it.fails` | Comprobado **sin** la marca (`it.fails(` → `it(`) en una copia temporal: los 49 fallan por lo que dice el mensaje del hallazgo (`expected 'Aplicamos una comisión del 24% …' to match /21 ?%/`, `expected 200 to be 403`, `expected [ { slug: 'bay-side' … } ] to deeply equal []`, etc.). La copia se borró. |

Un `it.fails` se pone **rojo** cuando alguien arregla el defecto: es la señal para quitarle la marca,
no un estorbo (misma convención que las REA de `seda_os`).
