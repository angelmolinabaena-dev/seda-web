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

### Cuerpo enviado (contrato de seda_os, `leadPropietarioSchema` en lib/leads-publico.ts, alineado el 4-nov)

```jsonc
{
  "nombre": "María García",
  "correo": "maria@example.com",          // en minúsculas
  "telefono": null,                       // opcional; el portal lo normaliza a E.164
  "municipio": "Estepona",                // opcional, hasta 80
  "dormitorios": 3,                       // opcional, 1-30
  "consentimiento": true,
  "consentimiento_version": "2026-11-04"  // PRIVACIDAD.actualizado
}
```

El portal es `.strict()`: cualquier otro campo da 400. `origen` (`web-calculadora`) y `base_juridica` (`consentimiento`) los pone el portal. La estimación no viaja ni se guarda en el CRM.

Sin autenticación: el portal acepta llamadas sin `Origin` (servidor a servidor), detrás de su límite de 5 por minuto e IP y del honeypot. Como todas las llamadas salen de las IPs de Vercel de seda-web, ese límite es compartido: con el volumen actual basta; si crece, hay que darle a seda-web una clave propia en el portal.

## Antes de encender el flag

1. **Política de privacidad.** Redactada el 4-nov-2026 (`lib/legal/privacidad.ts`, es/en/fr/de, `actualizado: "2026-11-04"`):
   `datos`, `finalidad` (art. 6.1.a, retirada del consentimiento), `destinatarios` (Vercel, Supabase, aviso a `info@` sin datos
   personales), `conservacion` (1 año desde el último contacto si no hay contrato) y `donde-no-estan`.
   `tests/privacidad-calculadora.test.ts` falla si algún idioma deja de mencionar la calculadora. **Texto legal pendiente de
   que lo revise Ángel o la asesora** antes de encender el flag; los puntos sin verificar están en el PR #104.
2. **Endpoint de CRM-PROPIETARIOS**: contrato alineado (arriba). Falta aplicar su PROPUESTA en producción; hasta entonces el portal responde 503.
3. **Revisión de los textos nuevos** (`calculadora.*` en `messages/*.json`, los cuatro idiomas). Marcados como TEXTO NUEVO.
4. **Firewall de Vercel**: regla de frecuencia para `/api/leads/propietario` (el límite en código es por instancia).
5. Poner la variable en Vercel y **redesplegar**.
