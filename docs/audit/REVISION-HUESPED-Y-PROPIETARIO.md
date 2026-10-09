# La web revisada por un huésped y por un propietario

**Fecha:** 2026-10-09 · **Alcance:** 16 páginas públicas × 4 idiomas (es/en/fr/de), 64 URL, salvo
aviso legal, privacidad y cookies, que solo entran en las comprobaciones mecánicas · **Modelo:** `claude-opus-5-5`.
Texto extraído de `next build` + `next start` (HTML renderizado, sin JS). Los resultados crudos no se versionan.

## 1. Lo que entendió y no entendió cada lector

### Huésped (alemán/UK/FR, lee la versión `/en`)

- **Entiende** SEDA como una gestora nueva de villas Marbella/Estepona que, hoy, vende sobre todo software a propietarios.
- **Cómo reservo:** solo ve `/contacto` → «I want to book a stay» → formulario → respuesta en 24 h. No hay precio, calendario,
  botón de reserva ni pago.
- **Qué incluye:** no lo sabe. No distingue qué va en el precio base (limpieza, ropa de cama…) de lo «activable»; los servicios
  (chef, transfer, yates…) no llevan precio.
- **Confianza:** suma la persona con nombre (Ángel, LinkedIn), el hotel verificable, el teléfono y la nota honesta de que las imágenes
  son renders. Resta que «la colección abre en octubre de 2026», que no hay ni una reseña de huésped de SEDA, que no hay política de
  cancelación/fianza/pago ni nº de registro turístico, y que media web habla a propietarios.
- **No se entiende:** «SEDA OS», «Ecosystem», «Eight/Six modules»; «Guest App · In production» (¿ya funciona?); «9.6★» (¿sobre 5 o 10?);
  «no forms, no waits» frente a un formulario con espera; cifras de maqueta («Active bookings 14», «Villa Puerto Banús #1») sin villas publicadas.
- **Ejemplos de la app** no son de lujo: «Apartamento Torremolinos», «Calle Casablanca 14, Torremolinos», código de puerta «1234».

### Propietario (apartamento en Estepona, lee `/es`)

- **Entiende** qué hace SEDA (comercialización, operación, portal, trámites) y que cobra el 24 %. Valora que se aclare que SEDA no presenta
  los impuestos.
- **La base del 24 % se contradice entre páginas:** `/propietarios` y `/faq`: «sobre el alojamiento, tras descontar la comisión de la plataforma»;
  `/founding-owners` y `/meet`: «bruto − comisión de canal **− limpieza**». El «ronda el 18 %» solo sale con la segunda fórmula; con la
  primera y Airbnb 15 % salen ≈20,4 %.
- **Las liquidaciones de ejemplo no enseñan la base:** portada 8.452 € sobre 38.420 € = 22 %; `/propietarios` 2.614 € sobre 10.890 € = 24 % del bruto,
  sin línea de canal ni limpieza. Parece cobro sobre bruto, que la propia web niega. La partida «Servicios» no se explica.
- **Qué le preocupa:** no hay historial («2 propietarios en programa»); la web habla de villas de lujo y él tiene un apartamento; ¿aguantan tres
  personas el «menos de 2 minutos» en agosto?; fiscalidad: «automatizado» frente a «solo preparamos documentación».
- **Echa en falta:** licencia VUT/registro, IVA sobre el 24 % (+21 % ⇒ ≈29 %), coste de la limpieza, seguros, de quién son las cuentas de Airbnb/Booking,
  control de precio mínimo, modelo de contrato y liquidación real, CIF/dirección, plazo de pago.
- **Promesas difíciles:** «menos de 2 minutos», concierge 24/7 con equipo de tres, «cumplimiento fiscal en tiempo real», «+24 % RevPAR» y simulador
  con 72 % de ocupación y ADR 1.450 €.

## 2. Comprobaciones mecánicas (sin API)

| Comprobación | Resultado |
|---|---|
| Enlaces internos (64) | Todos 200 |
| Imágenes (28) | Todas 200 |
| Enlaces externos (12) | OK salvo **Calendly 404** (corregido, ver §3); LinkedIn 999 y TripAdvisor 403 son bloqueo anti-bot, no enlace roto |
| Subdominios `guests.` y `portal.` | 200 / 307 |
| Booking page de Beds24 | **No hay enlace en la web.** La reserva de huésped es solo el formulario de `/contacto` |
| Texto de prueba/relleno | Ninguno (lorem, TODO, TBD, etc.). Quedan en `public/` `placeholder*.{png,svg,jpg}` sin uso en las páginas |
| Imágenes generadas | Ver §4 |
| Cifras vs `seda_os/docs/PRICING.md` (v3, 2026-08-16) | Ver §4: 24 % y 18 % efectivo coinciden; base y «sin coste de alta» no |

## 3. Arreglos hechos

1. **Calendly roto** en `/meet` (iframe + enlace de reserva) y `/founding-owners` (2 botones): `calendly.com/sedaprivatehomes` da 404; el slug de la
   cuenta conectada es `sedaprivatehomes-info` (200). Era la única vía de reservar llamada en esas dos páginas.
2. **Trato en español** (10 cadenas de `messages/es.json`): portada, `/guestapp`, formulario de `/contacto` y una respuesta de la FAQ pasaban de
   usted a tú dentro de la misma página («por ti», «Tú solo disfrutas», «Bloquea las fechas», «responderte»…).

## 4. Para Ángel (decisión de negocio, marca o contenido; no se ha tocado)

**Comisión y precios (contradicen `PRICING.md` o entre sí)**
- Unificar la base del 24 %: `/propietarios` y `/faq` omiten la limpieza; `PRICING.md` §1 la excluye. Es la corrección con más riesgo comercial.
- «Sin coste de alta / Sin coste inicial / 0 €» (`/propietarios`, `/faq`): `PRICING.md` §3 fija setup 1.290 € y 0 € solo para las 3 primeras firmas
  directas (490 € la 4.ª y 5.ª). `/founding-owners` y `/meet` sí lo dicen bien.
- Liquidaciones de ejemplo (portada, `/propietarios`): que muestren canal, limpieza y base, o rotularlas como ilustrativas; hoy dan 22 % / 24 % del bruto.
- «Sin coste adicional (sólo limpieza y reposición a tarifa interna)» en la FAQ de uso propio: la tarifa interna no se publica.
- No se dice si el 24 % lleva IVA aparte (PRICING §2: +21 %).

**Consistencia y promesas**
- Idiomas del concierge: «cinco» (portada), «ES·EN·DE·FR» (`/guestapp`), «incluye italiano» (FAQ). Hay 4 idiomas en la web.
- Experiencia del fundador: «más de una década» (`/propietarios`), «8+ años» (`/nosotros`), «8 años» (`/founding-owners`). Sede «Estepona» frente a «S.L. · Marbella».
- «Active bookings 14», «Average response time <2 min», «Villa Puerto Banús #1» y «9.6★» conviven con «2 propietarios» y «sin residencias publicadas»; rotular como ilustrativo o retirar.
- Fiscal: «automatizado / cumplimiento fiscal en tiempo real» frente a «solo preparamos documentación»; `/founding-owners` menciona «Modelo 179/238» y `PRICING.md` §7 dice que el 179 está suprimido desde 2024 y prohíbe prometerlo.
- Ejemplos de la guest app (Torremolinos, «1234») y la zona (`/contacto`: «Marbella · Estepona · Benahavís · Casares · Málaga», sin Torremolinos).

**Imágenes (regla del 27-jul).** Revisadas a ojo: `about.jpg` (mesa con portal/móvil «Eleanor», cifras ficticias), `guest-app-hand.jpg`,
`portal-tablet.jpg`, `journey-*.jpg`, `villa-liria/casa-almena/casa-almazara/villa-sosiego.jpg` y `services/*.jpg` son renders/generaciones
(la web lo declara en `/coleccion`, no así en `/descubre`). En `/descubre` las cuatro «villas» aparecen rotuladas con un pueblo (Marbella, Estepona, Benahavís, Casares)
sin decir que son ilustrativas. Las sustituirá Ángel por reales; no se han tocado. Las fotos de premios y la de Ángel son reales.

**Contenido ausente o a medias**
- `/nosotros` entera, el título/descripción de metadatos y la biografía del fundador en `/propietarios` están **en español en `/en`, `/fr` y `/de`**
  (ya anotado en `app/[locale]/nosotros/page.tsx`; requiere traducción, no se ha inventado).
- `/meet` y `/founding-owners` tutean en español, y su equivalente en los otros idiomas habría que revisarlo: es decisión de tono.
- Faltan para el huésped: precios orientativos, qué incluye el precio, cancelación/fianza/pago, registro turístico, reseñas propias. Para el propietario:
  licencia VUT, seguros, titularidad de cuentas OTA, modelo de contrato, CIF/dirección, plazo de pago.
- `/guias` está vacío («Vuelva pronto»).

## 5. Qué NO se completó y por qué

Con la tarifa conservadora usada para el tope (15 $/75 $ por millón, no la real) el gasto llegó a 4,43 $ tras 5 de 7 llamadas:
- **Lectores huésped y propietario:** completos (el del propietario cortado por límite de tokens en el apartado 4; las promesas difíciles sacadas arriba son de lo que alcanzó a escribir).
- **Revisión de idioma es:** respuesta truncada (solo trato de usted, ya aplicado en lo que aplica a mensajes).
- **Revisión de idioma en y fr:** la API devolvió 8.000 tokens de salida **sin texto** (probablemente razonamiento interno agotó el límite). **No revisadas.**
- **Revisión de idioma de:** no ejecutada por tope. Hecho solo un barrido mecánico de tuteo/castellano residual (§4: texto en español en en/fr/de).

Queda pendiente una revisión nativa de en/fr/de (y es completa) con `max_tokens` mayor y sin razonamiento: coste estimado 1–2 $ con tarifa real; requiere decidir si se amplía el tope.

## 6. Coste

Tokens: **126.607 de entrada, 33.811 de salida** (7 llamadas, 5 con respuesta; 3 de ellas sin texto útil completo). Estimación **conservadora 4,43 $**
(tarifa asumida 15/75 $ por millón); con 5/25 $ serían ≈1,5 $. Confirmar en la consola de Anthropic: el script no conoce la tarifa real.
