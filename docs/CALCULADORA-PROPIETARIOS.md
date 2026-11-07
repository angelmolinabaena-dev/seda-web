# Calculadora de propietarios — `/propietarios/calculadora`

«¿Cuánto ganaría su casa con SEDA?». Página de captación en `es`, `en`, `fr` y `de`,
**detrás de un flag apagado** mientras no esté el endpoint de CRM-PROPIETARIOS en `seda_os`.

## El flag

`SEDA_FLAG_CALCULADORA_PROPIETARIOS=1` (solo el valor exacto `1`; cualquier otra cosa es apagado).

| Con el flag apagado | Con el flag encendido |
|---|---|
| `/propietarios/calculadora` → 404 | la página existe en los cuatro idiomas |
| `POST /api/leads/propietario` → 404, sin leer el cuerpo ni llamar a nadie | la ruta valida y reenvía al portal |
| fuera del sitemap | en el sitemap (4 URLs, con hreflang) |
| ni un enlace en la portada ni en `/propietarios` | un enlace en cada una |

Las páginas son estáticas (`●` en el build), como las fichas del escaparate: **cambiar el valor
en Vercel exige un redeploy**. Se verificó con `next build` + `next start`, flag apagado y encendido.

## Qué calcula

Todo sale de `lib/tarifa` (tarifa v6, `lib/tarifa/tarifa.json`); la calculadora no escribe ninguna cifra.

```
pagado por los huéspedes = ocupación × 365 × precio medio por noche
cuota IVA alojamiento    = pagado × 10 / 110      (desde el 1-dic-2026; 0 antes)
alojamiento anual        = pagado − cuota
comisión del canal       = % del canal × pagado   (el canal cobra sobre el precio)
comisión SEDA            = la menor de  21 % × (alojamiento − comisión del canal)  y  20 % × alojamiento
neto                     = alojamiento − comisión del canal − comisión SEDA      (antes de impuestos)
IVA del 21 % de la comisión: aparte, no está restado del neto
```

**El IVA del alojamiento (V4-04, 5-nov-2026).** Desde el 1-dic-2026 (RDL 29/2026), una estancia de 30 noches o menos
tributa al 10 % y el precio al huésped es IVA incluido. seda_os quita esa cuota de la base de la comisión (D-3, #1129).
seda_os la saca con `ivaAlojamientoPorCobro`, que reparte por cobros; la web no tiene cobros ni estancias, así que usa
la regla del precio: **todo el precio por noche es IVA incluido, como si todas las estancias fueran de ≤ 30 noches**.
110 €/noche ⇒ 100 € de alojamiento. La ayuda del precio lo dice, en los cuatro idiomas, y el resultado enseña la cuota
quitada. La fecha se compara como texto `YYYY-MM-DD` en hora de Madrid. **Si el RDL no se convalida**, la fecha de
`FECHA_CORTE_IVA_ALOJAMIENTO` (lib/calculadora-propietarios.ts) y los textos hay que retirarlos: la calculadora no lee
`IVA_ALOJAMIENTO_RDL29` de seda_os.

- Se enseñan **dos extremos**, como el simulador de `/propietarios`: reserva directa (0 % de canal)
  y un canal que cobra el 15 % (`TARIFA.ejemplos.canalPct`, el ejemplo de la tarifa; no es una media de mercado).
- **Limpieza**: la paga el huésped y es íntegra del propietario; no entra en la comisión ni en el
  neto. Aparece como línea con ese texto y **sin cifra**: no hay ningún campo del que sacarla.
- **Municipio y dormitorios no entran en el cálculo** y la pantalla lo dice. Viajan en el lead.
- Cada componente se redondea al euro y el neto se calcula con los ya redondeados (lo que se ve suma).
  Frente a `netoAnual` (redondea al final) la diferencia es ≤ 1 €.

## Lo que NO se ha puesto, y por qué

- **Medias de mercado como sugerencia.** No hay en el repo ningún dato de mercado con fuente
  (`docs/audit/VERACIDAD-PUBLICA.md`: no hay compset). Los campos empiezan vacíos y el ejemplo va marcado como ejemplo.
- **Comparativa con «gestora típica».** El repo no tiene la base ni la fuente (`ing.cta_body` vive en el portal;
  `grep` de `cta_body` y «gestora típica» sin resultados). Lo único es un rango de un competidor, «sin verificar en campo»
  (`docs/marketing/CAPTACION-PROPIETARIOS.md`), y la política es no denigrar.
- **Analítica.** No hay Vercel Analytics en el repo, y `lib/legal/privacidad.ts` y `cookies.ts` declaran que el sitio no
  tiene ninguna herramienta de medición. No se ha añadido nada.
- **Fotos.** Ninguna. La página no usa imágenes.
- **`/llms.txt`.** La página no está en `SITE_PAGES` (ese catálogo alimenta sitemap y llms sin condiciones).

## El POST al portal

El navegador llama a **`/api/leads/propietario` de seda-web** (mismo origen) y es el servidor quien hace
`POST https://portal.sedaprivatehomes.com/api/leads/propietario`. No se llama al portal desde el navegador porque
el CSP del sitio es `connect-src 'self'` (`vercel.json`) y el portal tendría que abrir CORS a este sitio.

La ruta: solo POST del propio sitio (`Origin`), `application/json`, ≤ 4 KB, 5 envíos / 10 min por IP y por instancia
(el límite que dura es una regla en el Firewall de Vercel), honeypot `website`, consentimiento `true` obligatorio,
timeout de 8 s al portal. Si el portal no responde 2xx, el visitante ve un error. No se registra ningún dato personal.

### Cuerpo enviado (contrato de seda_os, `leadPropietarioSchema` en lib/leads-publico.ts, alineado el 4-nov)

```jsonc
{
  "nombre": "María García",
  "correo": "maria@example.com",          // en minúsculas
  "telefono": null,                       // opcional; ya en E.164 (+447700900123), la regla de seda_os
  "municipio": "Estepona",                // opcional, hasta 80
  "dormitorios": 3,                       // opcional, 1-30
  "consentimiento": true,
  "consentimiento_version": "2026-11-04"  // PRIVACIDAD.actualizado
}
```

**El teléfono (V4-04).** Una sola regla: `normalizarTelefonoE164` de seda_os, copiada en `lib/telefono-e164.ts` y atada
por el fixture `tests/fixtures/telefono-e164-contrato.json`, byte a byte en los dos repos, con la misma huella sha256 en
los dos tests (`tests/telefono-e164-contrato.test.ts` aquí y allí). Lo que no se puede llevar a E.164 sin adivinar (p. ej.
`07700 900123`, un móvil británico sin prefijo) se para en seda-web con 400 `phone_needs_prefix` y el formulario pide el
prefijo internacional junto al campo. Lo que pasa viaja ya en E.164. Si aun así el portal responde 400 (un dato que no
acepta), seda-web devuelve 422 `rejected_data` y el formulario pide revisar los datos; solo un 5xx o la red caída son 502.

El portal es `.strict()`: cualquier otro campo da 400. `origen` (`web-calculadora`) y `base_juridica` (`consentimiento`) los pone el portal. La estimación no viaja ni se guarda en el CRM.

**Firmado (LEADS-RUTA-FIRMADA, V4-01, 5-nov-2026).** Hasta esa fecha el portal aceptaba cualquier llamada sin `Origin`:
un `curl` daba de alta un lead con un consentimiento que nadie había dado. Ahora el servidor de seda-web firma cada POST
(`lib/lead-firma.ts`) y el portal lo verifica:

```
Authorization: HMAC-Lead <hex de 64>
X-Timestamp:   2026-11-05T10:00:00.000Z            (toISOString(); el portal admite ±5 min)
firma = HMAC-SHA256(SEDA_LEADS_HMAC_SECRET, "POST|/api/leads/propietario|<X-Timestamp>|<sha256 hex del cuerpo>")
```

El cuerpo firmado es el texto exacto que se envía (una sola serialización). Sin `SEDA_LEADS_HMAC_SECRET` (o con menos de
32 caracteres) seda-web no llama al portal: 503 `not_configured`, y el visitante ve el error. En el portal, sin firma o con
firma caducada o cuerpo alterado, 401; y la ruta del portal está además detrás de `SEDA_FLAG_LEADS_PUBLICOS` (404 apagado).
El vector de contrato, idéntico en los dos repos y calculado con `openssl`: `tests/lead-firma-contrato.test.ts` aquí y
`tests/leads-firma-contrato.test.ts` en seda_os.

El límite del portal (5 por minuto e IP) sigue siendo compartido: todas las llamadas salen de las IPs de Vercel de seda-web
(V4-M06, aparte).

## Antes de encender el flag

1. **Política de privacidad.** Redactada el 4-nov-2026 (`lib/legal/privacidad.ts`, es/en/fr/de, `actualizado: "2026-11-04"`):
   `datos`, `finalidad` (art. 6.1.a, retirada del consentimiento), `destinatarios` (Vercel, Supabase, aviso a `info@` sin datos
   personales), `conservacion` (1 año desde el último contacto si no hay contrato) y `donde-no-estan`.
   `tests/privacidad-calculadora.test.ts` falla si algún idioma deja de mencionar la calculadora. **Texto legal pendiente de
   que lo revise Ángel o la asesora** antes de encender el flag; los puntos sin verificar están en el PR #104.
2. **Endpoint de CRM-PROPIETARIOS**: contrato alineado (arriba). Falta aplicar su PROPUESTA en producción; hasta entonces el portal responde 503.
3. **Revisión de los textos nuevos** (`calculadora.*` en `messages/*.json`, los cuatro idiomas). Marcados como TEXTO NUEVO.
4. **Firewall de Vercel**: regla de frecuencia para `/api/leads/propietario` (el límite en código es por instancia).
5. **El secreto de la firma**: `SEDA_LEADS_HMAC_SECRET`, el MISMO valor en este proyecto de Vercel (seda-web) y en el del
   portal (`portal-propietarios`), solo servidor, nunca `NEXT_PUBLIC_`. Luego `SEDA_FLAG_LEADS_PUBLICOS=1` en el portal.
6. Poner la variable en Vercel y **redesplegar**.

## Cartas-QR: `?carta=` y `canal` (plan «Motor SEDA», fase 1)

- El QR de la carta postal lleva a `/propietarios/calculadora?carta=CODIGO`. `lib/carta-qr.ts` lo lee al entrar, lo guarda **solo en memoria de la página** (sin cookie ni almacenamiento) y lo quita de la URL con `history.replaceState`. El aviso de cookies llama a la misma función **antes** de cargar el píxel o hacer `PageView`, así que tampoco lo ve Meta con el consentimiento ya dado. La API de conversiones ya usaba la URL sin query.
- Al enviar, el cuerpo firmado a seda_os lleva `canal: "calculadora"` siempre y `carta` solo si venía en la URL, tal cual, y si mide ≤ 40 caracteres (contrato: `docs/CONTRATO-LEADS-CANAL-CARTA.md` de portal-propietarios). No viaja ninguna cifra de la estimación.
- Privacidad: línea nueva en la sección «cartas» (4 idiomas); `actualizado` y `ACTUALIZADO_CON_META` pasan a 2026-11-07.
