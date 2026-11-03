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
alojamiento anual = ocupación × 365 × precio medio por noche
comisión SEDA     = la menor de  21 % × (alojamiento − comisión del canal)  y  20 % × alojamiento
neto              = alojamiento − comisión del canal − comisión SEDA      (antes de impuestos)
IVA del 21 % de la comisión: aparte, no está restado del neto
```

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

### Cuerpo enviado (PROVISIONAL: confirmar con CRM-PROPIETARIOS)

```jsonc
{
  "origen": "seda-web/calculadora-propietarios",
  "idioma": "es",                         // es | en | fr | de
  "nombre": "María García",
  "email": "maria@example.com",
  "telefono": null,                       // opcional
  "consentimiento": {
    "aceptado": true,
    "politica_privacidad_actualizada": "2026-10-15",   // PRIVACIDAD.actualizado
    "recogido_en": "2026-11-03T10:00:00.000Z"
  },
  "propiedad": { "municipio": "Estepona", "dormitorios": 3 },   // ambos opcionales (null)
  "estimacion": {                         // recalculada en el servidor con lib/tarifa
    "tarifa": "v6",
    "precio_noche_eur": 200,
    "ocupacion_pct": 50,
    "ingresos_brutos_anuales_eur": 36500,
    "canal_pct_ejemplo": 15,
    "reserva_directa": { "comision_seda_eur": 7300, "iva_comision_eur": 1533, "neto_antes_de_impuestos_eur": 29200 },
    "por_canal": { "comision_canal_eur": 5475, "comision_seda_eur": 6515, "iva_comision_eur": 1368, "neto_antes_de_impuestos_eur": 24510 }
  }
}
```

No se envía ninguna cabecera de autenticación: no consta que el endpoint la pida. Si la pide, hay que añadirla
en `app/api/leads/propietario/route.ts` con una variable de entorno, nunca en el cliente.

## Antes de encender el flag

1. **Política de privacidad.** `lib/legal/privacidad.ts` dice hoy que la única entrada de datos del sitio es el formulario
   de contacto (un correo vía Resend, sin base de datos). Con este formulario deja de ser verdad: hay un nuevo tratamiento
   (nombre, correo, teléfono, datos de la propiedad y la estimación), una nueva finalidad y un nuevo destinatario (el CRM de
   SEDA en el portal). Hay que actualizar `datos`, `finalidad`, `destinatarios` y `conservacion` en los cuatro idiomas.
   No se ha tocado `lib/legal/`: es texto legal y lo decide Ángel.
2. **Endpoint real de CRM-PROPIETARIOS**: confirmar URL, cuerpo (arriba), respuesta (cualquier 2xx es éxito) y si exige autenticación.
3. **Revisión de los textos nuevos** (`calculadora.*` en `messages/*.json`, los cuatro idiomas). Marcados como TEXTO NUEVO.
4. **Firewall de Vercel**: regla de frecuencia para `/api/leads/propietario` (el límite en código es por instancia).
5. Poner la variable en Vercel y **redesplegar**.
