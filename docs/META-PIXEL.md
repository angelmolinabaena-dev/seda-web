# Píxel de Meta con consentimiento — plan «Motor SEDA», fase 1

Aviso de cookies, píxel de Meta solo con consentimiento y evento `Lead` de la calculadora de propietarios
(navegador + API de conversiones). **Todo apagado por defecto.** Los anuncios de Meta irán en la categoría
especial de vivienda; el píxel sirve para medir los leads, nada más.

## Interruptores y variables

| Variable | Dónde | Qué hace |
|---|---|---|
| `SEDA_FLAG_META_PIXEL=1` | Vercel (build) | Enciende aviso, píxel con consentimiento y dominios de Meta en la CSP. Solo el valor exacto `1`. |
| `NEXT_PUBLIC_META_PIXEL_ID` | Vercel (build) | ID del píxel (solo dígitos). Con el flag a `1` y sin un ID válido **todo queda apagado** (el build lo avisa). |
| `SEDA_FLAG_META_CAPI=1` | Vercel (build y runtime) | Enciende la API de conversiones. Solo tiene efecto con el píxel encendido. |
| `META_CAPI_TOKEN` | Vercel, **solo servidor** | Token de la API de conversiones. Nunca `NEXT_PUBLIC_`. Sin él, la CAPI queda apagada. |

Las páginas son estáticas: **cambiar el valor exige un redeploy**. Lógica en `lib/meta-config.mjs`.

## Apagado = la web como hoy

Comprobado contra `main`: con los interruptores apagados, las 78 páginas HTML de `next build` son idénticas a las de
`main` (tras normalizar nombres de chunk y buildId). Para conseguirlo:

- `app/[locale]/layout.tsx` carga el aviso con `import()` bajo `process.env.SEDA_FLAG_META_PIXEL === "1"`, que
  `next.config.mjs` inlina (`env`): apagado, el bundler elimina el código y no hay ni un chunk de más.
- El aviso y el enlace del pie viajan como props opcionales del pie (`components/footer.tsx`): un `null` entre los
  hijos del layout, o como prop, quedaría serializado en el HTML.
- Los textos del aviso están en `lib/consentimiento-textos.ts`, **no** en `messages/*.json` (esas claves viajan en el HTML).
- Las políticas de cookies y privacidad son las de hoy, el mismo objeto (`lib/legal/meta.ts`).

## CSP

La CSP global **ya no está en `vercel.json`**: la genera `lib/csp.mjs` y la publica `next.config.mjs` en el mismo
`source` (`/((?!tour/).*)`). Con todo apagado es, carácter por carácter, la cadena anterior
(`tests/csp-headers.test.ts` la compara con una copia literal). Encendido añade:

- `script-src` → `https://connect.facebook.net`
- `img-src` → `https://www.facebook.com`
- `connect-src` → `https://www.facebook.com https://connect.facebook.net`

**No volver a poner una CSP en la regla global de `vercel.json`**: dos CSP sobre una respuesta se intersecan y la de
`vercel.json` anularía los dominios de Meta. La CSP del visor 360 (`/tour/*`) sigue en `vercel.json` y no lleva Meta.

## El aviso (guía de la AEPD, 2023)

- Primera capa: «Aceptar», «Rechazar», «Configurar»: la misma clase CSS y el mismo ancho/alto en los cuatro idiomas y en móvil.
- Nada marcado de antemano; una sola categoría opcional, «marketing»; sin muro (el aviso es `position: fixed`, no bloquea).
- La elección se guarda en `localStorage` (`seda_consentimiento_cookies`) como `{version, fecha, marketing}`.
- Se vuelve a preguntar a los **24 meses** o si cambia la versión (`lib/legal/meta-version.ts`).
- «Configurar cookies» en el pie cambia o retira la elección desde cualquier página.
- Sin almacenamiento disponible, la elección vive en memoria durante la visita.

## El píxel (`lib/meta-pixel-cliente.ts`)

- No se carga nada hasta «Aceptar» (o una elección vigente). «Rechazar» y «sin elegir» = ni un `<script>` ni una petición a Meta.
- `fbq("set","autoConfig",false,ID)` antes de `init`, y `init` solo con el ID: **sin coincidencia avanzada**, ni correo ni
  teléfono, ni con hash. *Además* hay que dejar apagada la coincidencia avanzada automática en el Administrador de eventos
  de Meta (es un ajuste del píxel, fuera de este código).
- `PageView` al activarse y en cada cambio de ruta.
- Al retirar el consentimiento: `fbq("consent","revoke")`, no se envía nada más y se borran `_fbp` y `_fbc` (host y dominios padre).

## El `Lead` (`app/api/leads/propietario/route.ts`)

El navegador manda `X-Consent-Marketing: 1` solo con consentimiento de marketing vigente. La ruta solo mide si
(1) `SEDA_FLAG_META_PIXEL` está encendido, (2) llega esa cabecera y (3) **seda_os responde exactamente 201**. Entonces
la respuesta añade `lead: { event_id }` (UUID del servidor): el navegador lo pasa a `fbq("track","Lead",{}, {eventID})` y,
con la CAPI encendida, el servidor manda el mismo `Lead` con **ese mismo `event_id`** (Meta deduplica por nombre + id).
Con otro 2xx (200, 202…) el lead se crea pero no hay `event_id` ni evento (y se registra un aviso con el estado).
Sin el interruptor la respuesta es exactamente `{ ok: true }`, como siempre.

La CAPI (`lib/meta-capi.ts`) manda `event_name`, `event_time`, `event_id`, `event_source_url` (sin query ni hash),
`action_source: "website"` y en `user_data` solo IP, user-agent y, si existen, `_fbp`/`_fbc`. **Nunca** correo, teléfono ni
nombre —ni con hash—, ni estimación, ni `custom_data`. Un fallo de Meta no afecta al lead. El token va en el cuerpo, no en la
URL ni en los logs.

## Políticas

`lib/legal/meta.ts` deriva las variantes «con Meta» (y «con CAPI») de los textos base mediante parches con anclas exactas
(si el base cambia y un ancla desaparece, falla al cargar). Los cuatro idiomas: qué cookies, para qué, cuánto duran, Meta
como destinataria y transferencia a EE. UU.

**Pendiente de revisión legal antes de encender el flag** (Ángel o la asesora):

1. Duración de `_fbp`/`_fbc` (90 días) y cookies de `facebook.com`: salen de la documentación de Meta, **no se han medido** en un navegador (el texto lo dice).
2. Razón social (Meta Platforms Ireland Limited), reparto de responsabilidad (art. 26 RGPD) y garantías de la transferencia (se atribuyen a lo que «Meta indica»): contrastar con el acuerdo de responsable de Meta.
3. **La fecha de versión.** La privacidad ya llevaba `2026-11-06` (#116), así que no hay una fecha posterior que poner sin inventarla. Al encender el flag, subir `ACTUALIZADO_CON_META` (`lib/legal/meta-version.ts`) al día de activación: es a la vez la versión del consentimiento y el `consentimiento_version` que viaja al portal.
4. Textos nuevos del aviso (`lib/consentimiento-textos.ts`) y de las políticas: marcados como TEXTO NUEVO; revisión de en/fr/de.

## Antes de encender

1. Revisión legal (arriba) y subir `ACTUALIZADO_CON_META`.
2. Probar con el **Probador de eventos de Meta** y un navegador real: la CSP y los dominios salen de la guía de Meta y se han
   verificado con un `fbevents.js` simulado, no con el de Meta (no hay salida a Meta desde el entorno de desarrollo). Revisar
   también la versión de la Graph API (`META_GRAPH_VERSION`, hoy `v23.0`).
3. Confirmar que seda_os responde **201** (hoy solo lo asume el mock de los tests): si respondiera 200 no se mediría ningún lead.
4. Variables en Vercel y **redeploy**.
