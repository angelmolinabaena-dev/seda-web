# Auditoría de código — seda-web

> **Alcance:** solo lectura de código + ejercicio del endpoint en local + `curl` contra producción.
> No se modificó lógica, no se tocó contenido público, no se borró ningún fichero.
> **Commit base:** `a9fc932` (`origin/main`, PR #33 `/guias` incluido).
> **Fecha:** 2026-08-04.
> **Ruta de trabajo:** `C:/Users/AngelMolina/seda-web` — checkout principal, **sin worktree**.
> **Método:** inventario directo, ejecución del endpoint contra servidor local en `:3004`
> (modo mock, ningún email real enviado), `curl` contra `https://sedaprivatehomes.com`,
> `npm run lint`, `npx tsc --noEmit`, `npm audit`.
> **Relación con los documentos previos** (`VERACIDAD-PUBLICA.md`, `GEO-BASE.md`,
> `RETIRADA-COLECCION.md`): esos tres cubren veracidad de contenido y visibilidad.
> Éste es el primero que mira el código. Donde re-verifico una cifra suya lo digo.

## Etiquetas

- `[AUTO]` — arreglable sin decisión de Ángel (aislado; no toca legal, dinero ni PII de forma no trivial).
- `[GATE]` — necesita decisión de Ángel (texto legal, borrado de activos, infraestructura, contenido público).
- `[NO VERIFICABLE]` — no se puede cerrar desde el repo; se indica exactamente qué haría falta.

---

## 0. Resumen ejecutivo

**El repo está estructuralmente sano y su superficie de ataque es minúscula.** Es un sitio
de marketing estático de 15 páginas con **un solo endpoint** y **cero autenticación, cero
base de datos y cero PII almacenada**. Lo confirmé, no lo asumí: `process.env` aparece
exactamente **2 veces** en todo el árbol versionado, ambas dentro de
`app/api/contact/route.ts` (server-only); **no hay ni una sola** variable `NEXT_PUBLIC_*`
en el código; no hay Server Actions; no hay Supabase; no hay UUIDs ni datos personales en
el HTML de producción. `tsc --noEmit` sale limpio. La paridad i18n es **exacta**: 785
claves × 4 idiomas, 0 faltantes, 0 sobrantes.

**El hallazgo más grave no es de seguridad, es legal.** El sitio no tiene **ninguna**
página legal —ni política de privacidad, ni aviso legal, ni política de cookies— mientras
`/api/contact` capta nombre, email, teléfono y datos de la propiedad de propietarios
potenciales. No es un descuido de enlace: no existe el fichero. **P0-1, `[GATE]`.**

**El endpoint funciona pero confía en el cliente por completo.** Verificado ejercitándolo:
20 POST consecutivos → 20× 200 (sin rate limit); un campo numérico → **500 sin manejar**;
2 MB de payload → 200; claves de campo arbitrarias → aceptadas y renderizadas en el email;
`lead@example.com,attacker@evil.tld` → aceptado y reenviado a `reply_to`. Ninguna de estas
es explotable para robar datos —no hay datos que robar— pero juntas hacen del formulario un
vector de spam y de coste, y una fuente de 500 evitables.

**Dos cosas que el encargo daba por ciertas y no lo son en este repo**, y conviene fijarlas
para que no se re-auditen:

1. **`proxy.ts` no tiene ningún gate de autenticación.** No hay `GATE_PUBLIC_PATHS` en
   seda-web; ese símbolo existe **sólo** en `guest-app/proxy.ts:89`. El incidente de
   `/legal/privacidad` detrás del muro de login fue de guest-app, no de aquí. El
   `proxy.ts` de seda-web hace exactamente dos cosas: enrutado i18n y 410 para las cuatro
   fichas de villa retiradas. **No hay muro que auditar.**
2. **El calculador de ahorro no existe en seda-web.** El ×4 del Modelo 238 nunca estuvo
   aquí. Ver §5.

**`lint-output.txt` ya está resuelto** — está en `.gitignore:21` y no está trackeado. Pero
`npm run lint` **sí falla**, por otra razón que el encargo no anticipaba: eslint lintea
`brand/`, un directorio gitignoreado y sin trackear. Es el mismo patrón de guest-app a
escala mucho menor (5 hallazgos, no 6.534). Ver P2-4.

### Recuento

| Severidad | Nº | `[AUTO]` | `[GATE]` | `[NO VERIFICABLE]` |
|---|---|---|---|---|
| **P0** | 1 | 0 | 1 | 0 |
| **P1** | 4 | 3 | 0 | 1 |
| **P2** | 6 | 4 | 2 | 0 |
| **P3** | 5 | 3 | 2 | 0 |
| **Total** | **16** | **10** | **5** | **1** |

Y **13 comprobaciones que salieron limpias** (§6) — incluidas tres que el encargo pedía
explícitamente investigar. Que no haya nada grave en el 80 % de la superficie es el
resultado, no una omisión.

---

## P0 — Crítico

### P0-1 · No existe ninguna página legal, y el formulario capta datos personales · `[GATE]`

- **Qué es:** el sitio publica un formulario de contacto que recoge nombre, email,
  teléfono/WhatsApp, ubicación y características de la propiedad, y **no informa de nada**:
  no hay política de privacidad, ni aviso legal, ni política de cookies, ni casilla de
  consentimiento, ni enlace a un responsable del tratamiento.
- **Evidencia:**
  - Campos captados: `app/[locale]/contacto/ContactoContent.tsx:95-98` (`name`, `email`,
    `whatsapp`), `:116-123` (`property_location`, `property_type`, `bedrooms`, `status`,
    `goal`), `:136-139` (mismos datos en el formulario de propietario).
  - El `<form>` (`:333-403`) no contiene ningún checkbox de consentimiento ni texto
    informativo. Entre `:369` y `:402` sólo hay los tres subformularios, el bloque de error
    y el botón de envío.
  - `app/api/contact/route.ts:65-136`: la ruta no registra base jurídica, ni timestamp de
    consentimiento, ni versión de política. El único registro es el email a `info@`.
  - **El fichero no existe:** `git ls-files | grep -i "legal\|privac\|cookie\|aviso"` →
    **0 resultados**. Y `grep -rn "legal/\|/privacidad\|/cookies\|/aviso-legal" app
    components messages` → **0 resultados**. No es un enlace roto: no hay página.
  - Contraste: el inventario de rutas son 15 páginas + 1 endpoint
    (`app/[locale]/{coleccion,contacto,descubre,ecosistema,experiencias,faq,
    founding-owners,guestapp,guias,guias/[slug],guias/autores/[autorId],meet,nosotros,
    propietarios}` + home). Ninguna es legal.
- **Cómo se comprobó:** enumeración completa del árbol versionado (`git ls-files`) —
  ámbito cerrado, no una afirmación de «no existe en ninguna parte» sobre una capacidad.
  Más lectura íntegra del componente del formulario y de la ruta.
- **Por qué es P0:** RGPD Art. 13 exige informar **en el momento de la recogida** de
  identidad del responsable, finalidad, base jurídica, plazo de conservación y derechos.
  LSSI-CE Art. 10 exige aviso legal con datos identificativos del prestador (denominación,
  NIF, domicilio, contacto) en un sitio comercial. Nada de esto está. El sitio está vivo y
  el formulario funciona.
- **Por qué `[GATE]`:** el texto legal no se inventa. Requiere de Ángel: razón social y
  NIF, domicilio, plazo de conservación de los leads, encargados del tratamiento reales
  (Resend está procesando estos datos hoy y hay que nombrarlo), y una dirección de
  contacto para derechos —posiblemente `dpd@`, que **no aparece en este repo**, sólo
  `info@`, `web@` y `angel@`. **No se redacta nada en esta sesión.**

---

## P1 — Alto

### P1-1 · `/api/contact` sin rate limiting — vector de spam y de coste · `[AUTO]`

- **Qué es:** el único endpoint público acepta POST ilimitados. Cada uno dispara un email
  a `info@sedaprivatehomes.com` vía Resend.
- **Evidencia:** `app/api/contact/route.ts:65-136` — no hay ninguna comprobación de
  frecuencia, IP, ni token. La función entra directa de `req.json()` (`:68`) a validación
  de email (`:81`) a `fetch` a Resend (`:103`).
- **Cómo se comprobó:** 20 POST consecutivos contra el servidor local:

  ```
  codigos: 200 200 200 200 200 200 200 200 200 200 200 200 200 200 200 200 200 200 200 200
  distintos de 200: (ninguno)
  ```

  Ejecutado en local y en modo mock a propósito: contra producción habría enviado 20
  emails reales a la bandeja de Ángel.
- **Impacto:** buzón inutilizable en minutos; agotamiento de la cuota de Resend (plan
  gratuito: 100/día, 3.000/mes) dejando el formulario legítimo caído; coste si hay plan de
  pago. `vercel.json:27-31` fija `maxDuration: 10` para esta ruta, lo que limita el coste
  por invocación pero no el número de invocaciones.
- **Fix sugerido (fuera de esta sesión):** limitar por IP con ventana deslizante. Sin
  Redis en este repo, un mapa en memoria por lambda es débil pero no trivial de saltar;
  la alternativa robusta es Vercel Firewall / rate limiting de plataforma, que no requiere
  código.

### P1-2 · `/api/contact` confía por completo en los tipos del cliente · `[AUTO]`

- **Qué es:** `fields` se castea a `Record<string, string>` sin validar. Cualquier valor no
  string revienta la ruta; cualquier clave se acepta; no hay tope de tamaño; el regex de
  email es tan permisivo que deja pasar cadenas multi-dirección hasta `reply_to`.
- **Evidencia:**
  - `app/api/contact/route.ts:77` — `const fields = (body.fields as Record<string, string>) ?? {}`.
    Cast, no validación.
  - `:80` — `fields.email?.trim()`: si `email` no es string, `.trim` es `undefined` →
    `TypeError` sin capturar (el `try/catch` de `:67-71` sólo envuelve `req.json()`).
  - `:88` — `.filter(([, v]) => v && v.trim().length > 0)` en `renderHtml`: mismo fallo
    para cualquier otro campo no string.
  - `:81` — `/^\S+@\S+\.\S+$/`. Ese regex no excluye comas, `<`, `>` ni longitud.
  - `:112` — el valor validado por ese regex se pasa tal cual como `reply_to`.
- **Cómo se comprobó:** cuatro peticiones contra el servidor local.

  | Payload | Respuesta |
  |---|---|
  | `{"type":"owner","fields":{"email":"test@example.com","name":"Test"}}` | `200 {"ok":true,"mode":"mock"}` |
  | `{"type":"owner","fields":{"email":"test@example.com","bedrooms":3}}` | **`500`** |
  | `{"type":"owner","fields":{"email":12345}}` | **`500`** |
  | `{...,"notes":"A"×2.000.000}` (2.000.055 bytes) | `200` — sin tope |

  Y el regex, evaluado en Node contra siete cadenas: **acepta las siete**, incluidas
  `a@b.co,victim@evil.tld`, `<script>@b.co`, `a@b.co>attacker@evil.tld` y una dirección de
  5.005 caracteres. La petición con `"email":"lead@example.com,attacker@evil.tld"`
  devolvió `200`.
- **Matiz honesto:** el formulario real **no** dispara los 500. `FormData` serializa todo
  a string (`ContactoContent.tsx:344-346` filtra por `typeof v === "string"`), así que
  `bedrooms` llega como `"3"` aunque el input sea `type="number"`. Los 500 sólo los
  provoca un cliente que hable directamente con la API. Sigue siendo un fallo real —la
  ruta es pública y no debe caerse con entrada arbitraria— pero no está afectando a
  usuarios hoy.
- **Sobre el `reply_to` multi-dirección:** confirmado que **la ruta lo acepta y lo
  reenvía**. Si Resend honra una lista separada por comas en `reply_to` es cosa que no he
  verificado —haría falta un envío real— así que no afirmo que el escalado funcione. La
  debilidad de validación está confirmada; la consecuencia exacta, no.
- **Inyección HTML:** `escape()` (`:28-32`) cubre `<`, `>` y `&` tanto en clave como en
  valor, y los valores van en contenido de `<td>`, no en atributos. Probé
  `{"k\"onclick=alert(1)":"<img src=x onerror=alert(1)>"}` y se escapa correctamente.
  **No hay inyección HTML.** Lo que sí hay es que las claves arbitrarias se renderizan como
  filas de la tabla del email: un atacante puede fabricar un email que parezca contener
  campos oficiales (`{"URGENTE_Responda_a":"attacker@evil.tld"}` → aceptado, `200`).

### P1-3 · Si falta `RESEND_API_KEY` en producción, los leads se pierden en silencio · `[NO VERIFICABLE]`

- **Qué es:** sin la clave, la ruta **devuelve 200** y el usuario ve la pantalla de «mensaje
  recibido», pero no se envía nada. Además vuelca el payload completo —con PII— al log.
- **Evidencia:**
  - `app/api/contact/route.ts:96-100`:
    ```
    if (!apiKey) {
      console.warn("[/api/contact] RESEND_API_KEY not set — running in MOCK mode")
      console.log("[/api/contact] payload", { type, to, subject, fields })
      return NextResponse.json({ ok: true, mode: "mock" })
    }
    ```
  - El cliente sólo mira `json.ok` (`ContactoContent.tsx:355-358`), así que `mode:"mock"`
    pinta la confirmación de éxito (`:312-331`).
  - Confirmado en los logs del servidor local: el `console.log` imprime `email`, `name`,
    `notes` y demás campos en claro.
- **Cómo se comprobó:** ejercitado en local (donde no hay clave, luego siempre mock). La
  respuesta fue literalmente `{"ok":true,"mode":"mock"}`.
- **Por qué `[NO VERIFICABLE]` aquí:** el valor de `RESEND_API_KEY` en el scope Production
  vive en Vercel, no en el repo, y la CLI de Vercel no está instalada en esta máquina.
- **Qué haría falta para cerrarlo — una sola petición.** La respuesta distingue los dos
  casos por el campo `mode`:

  ```bash
  curl -s -X POST -H 'Content-Type: application/json' -d '{"type":"other","fields":{"email":"angel@sedaprivatehomes.com","subject":"prueba de configuracion","message":"comprobacion del endpoint de contacto tras la auditoria de codigo"}}' https://sedaprivatehomes.com/api/contact
  ```

  `{"ok":true,"mode":"resend"}` → la clave está puesta y llega un email a `info@`.
  `{"ok":true,"mode":"mock"}` → **la clave falta y todos los leads recibidos hasta hoy se
  han perdido**. No la he lanzado yo: enviaría un email real a la bandeja de Ángel, y es su
  decisión.
- **Nota aparte:** exponer `mode` en la respuesta le dice a cualquiera si el backend de
  correo del sitio está configurado. Ver P3-2.

### P1-4 · Tres vulnerabilidades `high` en dependencias de producción · `[AUTO]`

- **Evidencia:** `npm audit --omit=dev` → `3 high severity vulnerabilities`, todas con
  `fixAvailable: true`.

  | Paquete | Instalado | Rango vulnerable | Nota |
  |---|---|---|---|
  | `next` | **16.2.6** | `9.3.4-canary.0 – 16.3.0-preview.10` | 9 avisos; `latest` es `16.3.0` |
  | `postcss` | (transitiva vía `next`) | `<=8.5.22` | lectura arbitraria de ficheros vía `sourceMappingURL` |
  | `sharp` | **0.34.5** | `<0.35.0` | CVE-2026-33327/33328/35590/35591 en libvips |

- **Cómo se comprobó:** `npm audit --omit=dev --json`, y versiones instaladas leídas de
  `require('next/package.json').version` y `require('sharp/package.json').version`.
- **Qué aplica de verdad a este repo, y qué no.** De los 9 avisos de Next.js, la mayoría
  no tocan esta superficie y decirlo importa para no inflar la severidad:
  - «Middleware / Proxy bypass … using Turbopack and **single locale**» → **no aplica**:
    `grep -n "turbo" package.json next.config.mjs` sale vacío y `routing.locales` son
    cuatro.
  - «DoS in App Router using Server Actions», «SSRF in Server Actions», «Unbounded Server
    Action payload», «Unauthenticated disclosure of internal Server Function endpoints» →
    **no aplican**: `grep -rn '"use server"' app components lib` sale **vacío**, el repo
    no usa Server Actions.
  - «SSRF in rewrites via attacker-controlled destination hostname» → **no aplica**:
    `next.config.mjs` sólo define un `redirect` estático (`/huespedes` → `/guestapp`), sin
    rewrites dinámicos.
  - **Sí aplican:** «DoS in the Image Optimization API using SVGs» (la optimización de
    imágenes está activa, `next.config.mjs:11-25`, con `remotePatterns` a tres hosts
    externos) y las dos de cache confusion. Y las de `postcss` y `sharp`, que están en la
    cadena de build.
- **Fix:** `npm audit fix`, o subir a `next@16.3.0`. Mecánico, pero cambia una versión
  mayor-menor del framework: conviene que corra el build antes de mergear.

---

## P2 — Medio

### P2-1 · Sin `Content-Security-Policy` en producción · `[AUTO]`

- **Evidencia:** `vercel.json:6-12` define cinco cabeceras (`X-Frame-Options`,
  `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`,
  `Strict-Transport-Security`) — **ninguna es CSP**. Y `grep -rn
  "Content-Security-Policy" --include=*.ts --include=*.tsx --include=*.mjs --include=*.json`
  sobre el árbol versionado sale vacío (los dos únicos aciertos están en `.next/`,
  artefactos de build de la optimización de imágenes, no configuración nuestra).
- **Cómo se comprobó:** `curl -sI https://sedaprivatehomes.com/` devuelve las cinco
  cabeceras esperadas y **ninguna** `Content-Security-Policy`.
- **Impacto:** sin CSP no hay red de seguridad si alguna vez entra un script de terceros
  (analítica, chat, pixel) o si un XSS se cuela por otra vía. Hoy el riesgo directo es
  bajo —no hay entrada de usuario que se renderice— pero es la cabecera que falta.
- **Nota:** empezar en `Content-Security-Policy-Report-Only` es lo prudente; el sitio usa
  `<script type="application/ld+json">` inline en 7 sitios, que una CSP estricta sin nonce
  rompería.

### P2-2 · 103 renders huérfanos, 209,6 MB, servidos públicamente y versionados · `[GATE]`

- **Qué es:** `public/villas/` pesa **214,8 MB** en 124 ficheros. Sólo **21** se
  referencian desde el código. Los otros **103** (**209,6 MB, el 97,6 % del peso**) no los
  usa nadie, están en git, y Vercel los sirve con caché de 30 días.
- **Evidencia y cómo se comprobó:** crucé cada uno de los 124 ficheros de
  `git ls-files public/villas` contra `app components lib i18n messages`, por ruta completa
  y por nombre de fichero:

  ```
  TOTAL=124 REFERENCED=21 ORPHANS=103
  referenciados: 5.2 MB
  huerfanos:     209.6 MB
  ```

  Y comprobé que se sirven de verdad:

  ```
  200  /villas/059b6a0d-4aa2-4c18-ab70-f40c7523a68d.png
  200  /villas/349d62a3-a414-4386-bd45-b04670c98632.png
  200  /villas/468b2e3e-3a24-4964-8646-e7b38dabeb64.png
  200  /villas/Captura de pantalla 2026-05-06 165350.png

  /villas/Luxury_Villa_Visuals_A_person_wearing_a_white_shirt_and_black_pants_I-mKG5VN.mp4
    status=200 type=video/mp4 bytes=16516872
  ```

  Sí: hay un MP4 de **16,5 MB** públicamente descargable, con
  `Cache-Control: public, max-age=2592000, immutable` (`vercel.json:14-19`). Los siete
  vídeos huérfanos suman ~58 MB.
- **Re-verificación de los documentos previos:** mi recuento independiente (124 ficheros,
  103 huérfanos) **coincide** con `GEO-BASE.md:280`. Y `GEO-BASE.md:453` afirmaba que
  «casi todo lo pesado ya está en la lista de huérfanos»: **es correcto** — 209,6 de
  214,8 MB. Los 21 referenciados suman 5,2 MB y el mayor es
  `experiencias-hero.jpg` (1,9 MB). Recomprimir los vivos no arregla nada; lo que pesa es
  lo muerto.
- **Efecto en el repo:** `.git` ocupa **208 MB** y el árbol trackeado **221,3 MB** en 286
  ficheros. Es decir, **~95 % del repositorio es material sin consumidor.** Cada clon,
  cada CI, cada worktree paga ese peso.
- **Por qué `[GATE]`:** el encargo pide proponer la retirada, no ejecutarla, y borrar 103
  ficheros es irreversible sin reescribir historia (borrarlos del árbol no reduce `.git`).
  Decisión de Ángel: (a) borrar del árbol y aceptar que `.git` siga pesando, o (b) purgar
  historia con `git filter-repo`, que reescribe SHAs y obliga a re-clonar. **No se borra
  nada en este PR.**
- **Listado completo de los 103:** reproducible con el cruce descrito; no se incluye aquí
  para no meter 103 líneas de nombres de fichero con espacios en el documento.

### P2-3 · `.tmp/seda4/` — el prototipo de los datos falsos sigue versionado · `[GATE]`

- **Qué es:** 27 ficheros trackeados bajo `.tmp/`, de los cuales 9 son el prototipo
  `seda4/`: **3.919 líneas** de JSX y 260 KB.
- **Evidencia:** `git ls-files .tmp` → 27 ficheros. Inventario de `.tmp/seda4/`:

  | Fichero | Tamaño |
  |---|---|
  | `LEEME.md` | 844 B |
  | `main.jsx` | 2,1 KB |
  | `page-coleccion.jsx` | 13,5 KB |
  | `page-contacto.jsx` | 15,5 KB |
  | `page-ecosistema.jsx` | 36,8 KB |
  | `page-guestapp.jsx` | 40,5 KB |
  | `page-home.jsx` | 60,8 KB |
  | `page-propietarios.jsx` | 43,5 KB |
  | `shared.jsx` | 34,1 KB |

  El resto de `.tmp/` son 18 JPG de frames de vídeo (`frames/`, `frames2/`,
  `coleccion-frames/`, `coleccion2-frames/`, ~1,4 MB) y `check-i18n.mjs`.
- **Por qué importa:** su propio `LEEME.md` lo dice —lo cito porque es el aviso que
  justifica la ficha— y enumera lo que salió de ahí y llegó a producción como cierto:
  «12.480 reservas analizadas», «99,98 % disponibilidad», «14 propiedades en gestión»,
  KPIs inventados, la licencia turística `VTAR/MA/27.143`, y **el UUID de una reserva
  real** en enlaces de acceso de huésped. El `LEEME.md` cierra con «Pendiente: inventariar
  y retirar».
- **Estado del riesgo:** contenido. **No está expuesto** — `.tmp/` no se sirve
  (`public/` es la única raíz estática) y eslint ya lo ignora (`eslint.config.mjs`
  `globalIgnores` incluye `.tmp/**`). Comprobé además que **no queda ningún UUID** ni en
  el código (`grep` de patrón UUID sobre `app components lib messages i18n` → 0) ni en el
  HTML de producción de `/`, `/propietarios`, `/guias` y `/contacto` (0 en las cuatro).
  El peligro no es técnico: es que alguien —persona o agente— vuelva a copiar una cifra de
  ahí.
- **Propuesta:** eliminar `.tmp/` del control de versiones y añadir `.tmp/` a `.gitignore`.
  Si se quiere conservar el prototipo como referencia histórica, moverlo fuera del repo.
  **No se borra en este PR** (el encargo lo prohíbe explícitamente).

### P2-4 · `npm run lint` falla — por `brand/`, que ni siquiera está en el repo · `[AUTO]`

- **Qué es:** `eslint.config.mjs` ignora `.claude/`, `.worktrees/`, `.impeccable/`, `.tmp/`
  y `graphify-out/` — pero **no `brand/`**, que está en `.gitignore:23` (`/brand/`) y no
  está trackeado. eslint lo lintea igual, y de ahí sale el **único error** de la ejecución.
- **Evidencia:**
  - `eslint.config.mjs:22-33` — la lista de `globalIgnores`, sin `brand`.
  - `.gitignore:23` — `/brand/`.
  - `git ls-files brand` → **vacío** (no trackeado).
  - El error: `brand/web/SiteHeader.tsx:40:7 — Avoid calling setState() directly within an
    effect (react-hooks/set-state-in-effect)`.
- **Cómo se comprobó:** las dos ejecuciones, y la contrafactual.

  ```
  $ npm run lint
  ✖ 22 problems (1 error, 21 warnings)     EXIT: 1

  $ npx eslint . --ignore-pattern 'brand/**'
  ✖ 17 problems (0 errors, 17 warnings)    EXIT=0
  ```

  Repartidos: **5 hallazgos en `brand/`** (incluido el único error) y **17 en código
  fuente real**, todos `@next/next/no-img-element` (advertencias por usar `<img>` en vez
  de `next/image`).
- **Relación con guest-app:** es el mismo patrón —eslint linteando copias que no son
  código fuente— pero aquí son 5 hallazgos, no 6.534, porque `eslint.config.mjs` **ya**
  ignora `.worktrees/` y `.tmp/`. **No hace falta `.eslintignore`:** basta añadir
  `'brand/**'` a los `globalIgnores` que ya existen.
- **Efecto real hoy:** ninguno en CI, porque lint no está en CI (ver P2-5). El efecto es
  que `npm run lint` en local siempre sale en rojo, lo que entrena a ignorarlo.

### P2-5 · No hay CI de lint ni de typecheck · `[AUTO]`

- **Evidencia:** `.github/workflows/` contiene exactamente dos ficheros:
  `conflict-markers-check.yml` y `main-push-guard.yml`. Ninguno ejecuta `npm run lint`,
  `tsc --noEmit` ni `next build`. El propio `conflict-markers-check.yml` lo reconoce:
  «Este repo no tiene workflow `ci.yml` propio (es el sitio de marketing, sin suite de
  tests)».
- **Impacto:** un fallo de tipos o un error de lint sólo se detecta cuando falla el build
  de Vercel, o no se detecta. Hoy `tsc --noEmit` sale **limpio** (`EXIT=0`), así que no hay
  deuda acumulada — es el momento barato de poner la puerta.
- **Nota positiva:** los dos workflows que sí existen están bien pensados. El
  `main-push-guard` documenta correctamente que el repo es privado en plan Free y por eso
  no hay branch protection del lado servidor, y compensa con detección a posteriori.

### P2-6 · `/guias` es indexable sin estar publicada — la única fuga de un diseño fail-closed · `[AUTO]`

- **Qué es:** el sistema de publicación de guías es fail-closed en todas partes menos en el
  índice. `/guias` responde 200, **sin `noindex`**, mostrando el estado vacío.
- **Evidencia:**
  - `app/[locale]/guias/page.tsx:19-30` — `generateMetadata` devuelve `title`,
    `description` y `alternates`, pero **no `robots`**. Es la única de las páginas no
    publicables que lo omite.
  - Contraste dentro del mismo repo: `app/[locale]/guias/[slug]/page.tsx:45-47` sí aplica
    `robots: { index: false, follow: false }` cuando `esPublicable` es falso;
    `app/[locale]/meet/page.tsx:37` y `app/[locale]/founding-owners/page.tsx:6` también.
  - `lib/guias.ts:57` — la única guía existente está en `estado: "borrador"`, luego
    `haySeccionGuias()` (`:118-120`) es falso.
- **Cómo se comprobó:** contra producción.

  | URL | Status | `<meta name="robots">` |
  |---|---|---|
  | `/guias` | 200 | **ninguno** |
  | `/guias/guia-de-prueba-interna` | 200 | `noindex, nofollow` |
  | `/meet` | 200 | `noindex, nofollow` |
  | `/founding-owners` | 200 | `noindex, nofollow` |

  Y el sitemap de producción tiene **40 URLs** (10 rutas × 4 idiomas) — `/guias` **no está**,
  correctamente, porque `haySeccionGuias()` es falso.
- **Severidad real: baja.** `/guias` no está enlazada desde ningún sitio
  (`components/navigation.tsx:67,91` y `components/footer.tsx:32` la insertan sólo si
  `haySeccionGuias()`), ni está en el sitemap. Sólo llega ahí quien adivine la URL o siga
  un enlace externo. Pero Google indexa URLs que descubre por cualquier vía, y el resto del
  sistema está tan bien cerrado que esta omisión desentona.
- **Fix:** añadir `robots: { index: false, follow: false }` cuando
  `getGuiasPublicadas().length === 0`, replicando el patrón de `[slug]/page.tsx:45-47`.

---

## P3 — Bajo

### P3-1 · JSON-LD sin escapar `</script>` · `[AUTO]`

- **Evidencia:** 7 usos de `dangerouslySetInnerHTML={{ __html: JSON.stringify(...) }}`:
  `app/[locale]/layout.tsx:95`, `app/[locale]/page.tsx:53`, `app/[locale]/faq/page.tsx:50`,
  `app/[locale]/guias/page.tsx:69`, `app/[locale]/guias/[slug]/page.tsx:105`,
  `app/[locale]/guias/autores/[autorId]/page.tsx:62`, `components/breadcrumbs.tsx:104`.
  `JSON.stringify` no escapa `<` ni `/`, así que un `</script>` dentro de un dato rompería
  el bloque.
- **Honestamente: no es explotable hoy.** Verifiqué el origen de los datos en cada caso y
  **ninguno viene del usuario**: `breadcrumbs.tsx:39-58` construye el `jsonLd` desde el
  prop `items`, que los llamantes rellenan con cadenas traducidas estáticas;
  `guias/[slug]/page.tsx` resuelve el slug con `getGuiaBySlug` y hace `notFound()` si no
  existe (`:68`), luego no hay ruta desde la URL al JSON-LD. Todo el contenido es
  estático del repo.
- **Fix (endurecimiento, no corrección de fallo):** `.replace(/</g, '\\u003c')` sobre la
  salida de `JSON.stringify`. Barato, y elimina la clase de fallo antes de que las guías
  empiecen a tener títulos escritos por terceros.

### P3-2 · La respuesta de `/api/contact` revela si el correo está configurado · `[AUTO]`

- **Evidencia:** `app/api/contact/route.ts:99` devuelve `{ ok: true, mode: "mock" }` y
  `:128` `{ ok: true, mode: "resend" }`. El cliente no usa `mode` para nada —
  `ContactoContent.tsx:355` sólo mira `json.ok`.
- **Impacto:** mínimo, pero le dice a cualquiera si el backend de correo está caído o sin
  configurar, que es justo la información que hace útil un ataque de spam. Quitar `mode` de
  la respuesta (y dejarlo sólo en el log) no rompe nada.
- **Tensión con P1-3:** es el campo que permite diagnosticar P1-3 con una sola petición. Si
  se retira, hay que dejar otro canal —un log, o `/api/health`— o P1-3 se vuelve más caro
  de comprobar. **Retirar `mode` después de haber cerrado P1-3, no antes.**

### P3-3 · `SUPABASE_SERVICE_ROLE_KEY` en `.env.local` de un repo que no usa Supabase · `[GATE]`

- **Evidencia:** `.env.local` contiene `NEXT_PUBLIC_SUPABASE_URL` y
  `SUPABASE_SERVICE_ROLE_KEY`. Pero `.env.example` no las menciona (sólo `RESEND_API_KEY`
  y `SEDA_CONTACT_TO`), y `grep` de `process.env` en todo el árbol versionado da **2
  aciertos**, ambos en `app/api/contact/route.ts` — **ninguno lee Supabase**.
- **Lo que NO es:** no hay fuga en el repositorio. `.gitignore:11` cubre `.env*.local`,
  `git log --all -S "SUPABASE_SERVICE_ROLE_KEY"` no devuelve nada y `.env.local` nunca
  estuvo trackeado (`git log --all -- .env.local` vacío). Verificado.
- **Lo que sí es:** una clave `service_role` —que salta todo el RLS del proyecto Supabase
  compartido— presente en el entorno de un repo que no la necesita. Amplía el radio de
  daño de cualquier compromiso de la máquina o del proyecto de Vercel sin dar nada a cambio.
- **Por qué `[GATE]`:** hay que comprobar si también está puesta en el scope de Vercel de
  seda-web (no verificable desde aquí, sin CLI). Si lo está, retirarla toca configuración
  de producción. Y si se rota, afecta a seda_os y guest-app.

### P3-4 · La copia pública sigue nombrando el Modelo 179, derogado · `[GATE]` · contenido

- **Evidencia:** `messages/es.json:441` (y sus tres traducciones,
  `messages/{en,fr,de}.json:441`) — «declaraciones informativas de cesión turística
  (Modelo 179/238, según normativa vigente)». Idéntico en
  `app/[locale]/founding-owners/page.tsx:49,79,109,139`, hardcodeado en los cuatro idiomas.
  La clave i18n se llama `prop.trust.items.m179.*` y se renderiza en
  `app/[locale]/propietarios/PropietariosContent.tsx:589`.
- **El hecho:** el Modelo 179 quedó derogado y sustituido por el **238** vía RD 117/2024
  (DAC7). Nombrar los dos no es falso —la coletilla «según normativa vigente» cubre el
  matiz— pero le dice a un propietario que se le va a preparar una declaración que ya no
  existe.
- **Por qué `[GATE]` y por qué no lo toco:** el encargo prohíbe modificar contenido
  público. Lo anoto, como pedía. En seda_os ya se hizo el cambio equivalente
  (commit `e97f6bc`, «Modelo 179 -> 238 en la matriz de competidores»); aquí no.

### P3-5 · `X-Powered-By: Next.js` · `[AUTO]`

- **Evidencia:** `curl -sI https://sedaprivatehomes.com/` devuelve `X-Powered-By: Next.js`.
  `next.config.mjs` no fija `poweredByHeader: false`.
- **Impacto:** revelación de tecnología. Casi irrelevante —el sitio es obviamente Next.js
  por la estructura de `/_next/`— pero es una línea de configuración.

---

## 5 · La afirmación concreta a verificar: el ×4 del Modelo 238

**Ninguna de las dos opciones planteadas es la correcta: el calculador de ahorro no existe
en seda-web.** El ×4 nunca estuvo en este repo, así que ni «sigue» ni «se corrigió».

Cómo lo comprobé, con ámbito cerrado en los tres sitios donde podría estar:

1. **Por nombre de fichero:** `find . -path ./node_modules -prune -o -iname "*savings*"
   -print -o -iname "*ahorro*" -print` → **0 resultados**.
2. **Por contenido:** `grep -rln "calculator\|Calculator\|calculadora\|Calculadora"
   app components lib messages` → **0 resultados**.
3. **Por cálculo:** `grep -rn "\* 4\|trimestr\|quarterly\|ahorro\|savings" app components
   lib messages i18n` → 3 aciertos, los tres en `components/navigation.tsx:634,685,737`,
   y son retardos de animación (`165 + idx * 45`). **Ningún cálculo fiscal ni financiero.**
4. **Inventario de `lib/`:** seis ficheros —`autores.ts`, `guias.ts`, `og-fonts.ts`,
   `seo-urls.ts`, `site-contact.ts`, `utils.ts`—. Ninguno fiscal.
5. **Las únicas menciones a 179/238 en seda-web son copia descriptiva**, no cálculo:
   `messages/{es,en,fr,de}.json:441` y `app/[locale]/founding-owners/page.tsx:49,79,109,139`
   (ver P3-4).

**Dónde sí vive, para cerrar el hilo.** El calculador está en seda_os, y allí el ×4 **está
corregido**: `seda_os/lib/savings-calculator.ts:496-498` lleva hoy el comentario y el
cálculo anual —

```
// El Modelo 238 es de presentación anual (RD 117/2024 / DAC7). El `× 4`
// anterior era residuo del Modelo 179, que sí era trimestral.
const modelo238Annual = pick(comp.modelo238FeeAnnualRange)
```

— introducido por el commit `e835485` («fix(comparativa): elimina el ×4 residual del
Modelo 238 en savings-calculator (#254)»). El mismo repo tiene además
`lib/competitor-pricing.ts:193` documentando que el 238 «además es anual, no» trimestral, y
el commit `97bfbd0`/`5d21905` retiró después el calculador de plazos del 179 entero.

**Confrontación con fuente externa al código:** el RD 117/2024 traspone la DAC7 y sustituye
la informativa del Modelo 179 por el Modelo 238, de periodicidad **anual**. El ×4 asumía
las cuatro presentaciones trimestrales del 179. La corrección de seda_os es coherente con
la norma; seda-web no tiene nada que corregir porque no calcula nada.

---

## 6 · Comprobaciones que salieron limpias

Una auditoría que no encuentra nada en el 80 % de la superficie tiene que poder decirlo.
Trece verificaciones sin hallazgo, cada una con su forma de comprobación:

| # | Qué se comprobó | Resultado | Cómo |
|---|---|---|---|
| 1 | **Gate público de `proxy.ts`** | **No existe muro de login.** `proxy.ts` sólo hace i18n + 410. `GATE_PUBLIC_PATHS` no aparece en seda-web; sólo en `guest-app/proxy.ts:89`. El incidente de `/legal/privacidad` fue de guest-app | lectura íntegra de `proxy.ts` (112 líneas) + `grep` en los tres repos |
| 2 | **Rutas públicas en producción** | 16/16 responden 200: `/`, `/en`, `/coleccion`, `/contacto`, `/propietarios`, `/guias`, `/meet`, `/founding-owners`, `/faq`, `/nosotros`, `/descubre`, `/ecosistema`, `/experiencias`, `/guestapp`, `/robots.txt`, `/sitemap.xml` | `curl -o /dev/null -w '%{http_code}'` |
| 3 | **Asimetría inversa (algo protegido que responda 200)** | **Ninguna** — no hay nada protegido en este sitio. El único 200 que desentona es `/guias` sin `noindex` (P2-6), y es SEO, no acceso | inventario de rutas + `curl` |
| 4 | **410 de las villas retiradas** | 5/5 correctos, incluida la variante con prefijo de idioma (`/en/villa/villa-alboran`) | `curl` a los 4 slugs + 1 localizado |
| 5 | **Maquetas expuestas de `GEO-BASE.md`** | 404 las dos (`BeneficiosPropietarios.jsx`, `seda_beneficios_propietarios_mockup.html`). La retirada se sostiene | `curl` |
| 6 | **Enlaces rotos a rutas retiradas** | **Ninguno.** Las 4 referencias a `/villa/` que quedan son comentarios (`app/sitemap.ts:45`, `app/[locale]/layout.tsx:17`, `app/[locale]/coleccion/page.tsx:8`, `components/navigation.tsx:112`). Los ~14 enlaces a `/coleccion` apuntan a una ruta **que existe** | `grep` sobre `app components lib messages i18n` |
| 7 | **Secretos en el bundle cliente** | **Cero.** No hay ni una `NEXT_PUBLIC_*` en el código. `process.env` aparece 2 veces, ambas server-only en `app/api/contact/route.ts:92-93` | `grep` sobre `**/*.{ts,tsx,mjs}` |
| 8 | **PII / UUIDs en el HTML público** | **Cero UUIDs** en código y **0** en el HTML de `/`, `/propietarios`, `/guias`, `/contacto`. El único teléfono es el corporativo, deliberado | `grep` de patrón UUID + `curl \| grep -c` |
| 9 | **`lint-output.txt`** | **Ya resuelto.** En `.gitignore:21` y sin trackear (`git ls-files --error-unmatch` falla) | `git ls-files` |
| 10 | **eslint ignorando worktrees** (el fallo de guest-app) | **Ya resuelto.** `eslint.config.mjs:22-33` ignora `.claude/`, `.worktrees/`, `.impeccable/`, `.tmp/`, `graphify-out/`. **No hace falta `.eslintignore`** — sólo falta `brand/` (P2-4) | lectura de la config + contrafactual |
| 11 | **Typecheck** | `npx tsc --noEmit` → **EXIT=0**, limpio | ejecución |
| 12 | **Paridad i18n** | **Exacta**: 785 claves en cada uno de es/en/fr/de. 0 faltantes, 0 sobrantes en los tres idiomas contra es | script de aplanado recursivo de los 4 JSON |
| 13 | **Puertas de indexación** | Correctas y fail-closed: sitemap = 40 URLs (10×4), sin `/guias`; guía en borrador 200+`noindex`; `/meet` y `/founding-owners` 200+`noindex` | `curl` del sitemap + `<meta robots>` de 4 URLs |

**Worktrees:** ninguno. `git worktree list` devuelve una sola entrada (el checkout
principal) y tanto `.worktrees/` como `.claude/worktrees/` están **vacíos**. Esta sesión
trabajó íntegramente en `C:/Users/AngelMolina/seda-web`.

---

## 7 · Las cuatro preguntas del encargo sobre `/api/contact`

Respuestas directas, con la evidencia ya detallada arriba:

1. **¿Valida la entrada o confía en el cliente?** **Confía.** Valida sólo dos cosas: que
   `type` esté en `["guest","owner","other"]` (`:74`) y que `email` case con un regex muy
   laxo (`:81`). `fields` es un cast sin validar (`:77`). Ver P1-2.
2. **¿Tiene rate limiting?** **No.** 20 POST → 20× 200. Ver P1-1.
3. **¿Dónde acaban los datos y qué remitente usa?** Van por Resend a
   `process.env.SEDA_CONTACT_TO ?? "info@sedaprivatehomes.com"` (`:93`, `:17`), con
   remitente **`SEDA Private Homes <web@sedaprivatehomes.com>`** (`:18`, hardcodeado) y
   `reply_to` = el email del formulario (`:112`).
   **Sobre las cinco direcciones sin unificar:** en seda-web el problema **no existe**. El
   repo usa `info@` de forma consistente —`lib/site-contact.ts:16` es la fuente única, más
   9 `mailto:` y los 4 mensajes de error de `messages/*.json:796`—, `angel@` en `/meet`
   (`app/[locale]/meet/page.tsx:89,123,157,191`) y `web@` sólo como remitente. **No usa
   `RESEND_FROM_EMAIL`, ni `hola@`, ni `dpd@`, ni la `reservas@` hardcodeada.** Esas viven
   en los otros dos repos.
   **Si `web@` y `info@` existen de verdad como buzones no es verificable desde el repo** —
   requiere mirar el DNS del dominio y el panel de Resend. Lo que sí se puede decir: si el
   dominio no está verificado en Resend, el envío falla con 502 (`:119-126`), y eso sería
   visible en los logs de Vercel.
4. **¿Se registra el consentimiento?** **No, en ningún sitio.** Ni casilla en el formulario,
   ni campo en el payload, ni columna, ni log. Y no hay política a la que consentir. Es la
   raíz de **P0-1**.

---

## 8 · Orden sugerido de trabajo

No es una prioridad impuesta —eso lo decide Ángel— sino el orden que minimiza retrabajo:

1. **P1-3 primero, y con una sola petición** (`curl` de §P1-3). Si sale `mock`, todo lo
   demás cambia de urgencia: significa que el formulario lleva tiempo tragándose leads.
2. **P0-1** — el texto legal es lo único con exposición sancionadora, y es lo que más tarda
   porque depende de datos que sólo tiene Ángel.
3. **P1-1 + P1-2 juntos** — mismo fichero, misma sesión, ~40 líneas: validación con `zod`
   (ya está en `package.json`), tope de tamaño, tope de nº de campos, y rate limit.
4. **P1-4** — `npm audit fix` + verificar que el build pasa.
5. **P2-4 + P2-5 juntos** — añadir `'brand/**'` al ignore y, en el mismo PR, el workflow de
   lint+typecheck. Poner CI antes de arreglar el lint deja CI en rojo desde el minuto uno.
6. **P2-2 + P2-3** — la limpieza grande, cuando Ángel decida el modo (borrado simple vs
   reescritura de historia).
7. El resto (**P2-1, P2-6, P3-***) es acumulable en un PR de higiene.
