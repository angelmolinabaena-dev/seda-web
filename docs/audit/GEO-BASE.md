# Base técnica de visibilidad IA — estado tras PR #10 y #29

Sustituye a `GEO-BASE-TECNICA.md` (obsoleto). Verificado el 2026-08-02 contra
producción (`https://sedaprivatehomes.com`), no contra el código.

Premisa: la guía oficial de Google (15 may 2026) dice que optimizar para
buscadores generativos sigue siendo SEO, y desmiente `llms.txt`, el troceado
de contenido y los schemas especiales como necesarios. Este documento verifica
acceso, renderizado y rendimiento — no trucos.

---

## FASE 1 — Verificación contra producción

### Canonical + hreflang (curl real)

Portada, `/propietarios`, `/coleccion` — 4 idiomas cada una. Todas devuelven
`<link rel="canonical">` propio y bloque `hreflang` recíproco con `x-default`.

```
$ curl -s https://sedaprivatehomes.com/ | grep -o '<link rel="canonical"[^>]*>\|<link[^>]*alternate[^>]*>'
<link rel="canonical" href="https://sedaprivatehomes.com"/>
<link rel="alternate" hrefLang="es" href="https://sedaprivatehomes.com"/>
<link rel="alternate" hrefLang="en" href="https://sedaprivatehomes.com/en"/>
<link rel="alternate" hrefLang="fr" href="https://sedaprivatehomes.com/fr"/>
<link rel="alternate" hrefLang="de" href="https://sedaprivatehomes.com/de"/>
<link rel="alternate" hrefLang="x-default" href="https://sedaprivatehomes.com"/>

$ curl -s https://sedaprivatehomes.com/propietarios | grep -o '<link rel="canonical"[^>]*>'
<link rel="canonical" href="https://sedaprivatehomes.com/propietarios"/>
$ curl -s https://sedaprivatehomes.com/en/propietarios | grep -o '<link rel="canonical"[^>]*>'
<link rel="canonical" href="https://sedaprivatehomes.com/en/propietarios"/>
$ curl -s https://sedaprivatehomes.com/fr/propietarios | grep -o '<link rel="canonical"[^>]*>'
<link rel="canonical" href="https://sedaprivatehomes.com/fr/propietarios"/>
$ curl -s https://sedaprivatehomes.com/de/propietarios | grep -o '<link rel="canonical"[^>]*>'
<link rel="canonical" href="https://sedaprivatehomes.com/de/propietarios"/>

$ curl -s https://sedaprivatehomes.com/coleccion | grep -o '<link rel="canonical"[^>]*>'
<link rel="canonical" href="https://sedaprivatehomes.com/coleccion"/>
$ curl -s https://sedaprivatehomes.com/en/coleccion | grep -o '<link rel="canonical"[^>]*>'
<link rel="canonical" href="https://sedaprivatehomes.com/en/coleccion"/>
$ curl -s https://sedaprivatehomes.com/fr/coleccion | grep -o '<link rel="canonical"[^>]*>'
<link rel="canonical" href="https://sedaprivatehomes.com/fr/coleccion"/>
$ curl -s https://sedaprivatehomes.com/de/coleccion | grep -o '<link rel="canonical"[^>]*>'
<link rel="canonical" href="https://sedaprivatehomes.com/de/coleccion"/>
```

**Estado: correcto, no requiere cambios.** El PR #10 ya resolvió esto.

### Sitemap

```
$ curl -s https://sedaprivatehomes.com/sitemap.xml | grep -c "<loc>"
40
$ curl -s https://sedaprivatehomes.com/sitemap.xml | grep -o '<loc>[^<]*</loc>' | sed 's/<[^>]*>//g' > urls.txt
$ grep -i villa urls.txt
(sin resultados)
$ while read -r u; do curl -s -o /dev/null -w "%{http_code} $u\n" "$u"; done < urls.txt
200 (× 40, todas las URLs)
```

**Estado: correcto.** 40 URLs = 10 rutas estáticas × 4 idiomas, todas 200,
ninguna villa (confirma que el PR #29 retiró las 16 entradas correctamente).

### JSON-LD

```
$ curl -s https://sedaprivatehomes.com/ | grep -o '"@type":"[^"]*"' | sort -u
"@type":"Answer"
"@type":"FAQPage"
"@type":"LodgingBusiness"
"@type":"Organization"
"@type":"PostalAddress"
"@type":"Question"

$ curl -s https://sedaprivatehomes.com/propietarios | grep -o '"@type":"[^"]*"' | sort -u
"@type":"LodgingBusiness"
"@type":"Organization"
"@type":"PostalAddress"

$ curl -s https://sedaprivatehomes.com/faq | grep -o '"@type":"[^"]*"' | sort -u
"@type":"Answer"
"@type":"FAQPage"
"@type":"LodgingBusiness"
"@type":"Organization"
"@type":"PostalAddress"
"@type":"Question"
```

**Estado: correcto.** `Organization` + `LodgingBusiness` + `FAQPage` presentes
donde corresponde, sin bug `fr`/`de` visible en el JSON servido.

---

## FASE 2 — Acceso de rastreadores de IA

No cubierto por ningún PR anterior. Verificado con `curl -A "<bot>" -I`.

```
$ for ua in Googlebot Google-Extended GPTBot OAI-SearchBot ChatGPT-User PerplexityBot ClaudeBot anthropic-ai Bingbot CCBot; do
    curl -s -o /dev/null -w "%{http_code}" -A "$ua" -I "https://sedaprivatehomes.com/"; echo " $ua"
  done
200 Googlebot
200 Google-Extended
200 GPTBot
200 OAI-SearchBot
200 ChatGPT-User
200 PerplexityBot
200 ClaudeBot
200 anthropic-ai
200 Bingbot
200 CCBot
```

Repetido sobre `/propietarios` — mismos 10 bots, mismos 10× `200`.

Revisado además `robots.txt` (permite todo salvo `/api/`), `vercel.json` (solo
cabeceras de seguridad y caché, ningún filtro por user-agent) y ausencia de
`middleware.ts` que pudiera bloquear por user-agent.

**Estado: sin bloqueos.** Los 5 sistemas listados (Google AI Overviews/Gemini,
OpenAI, Perplexity, Anthropic, Bing/Copilot) tienen acceso completo.

**Decisión pendiente de Ángel:** `CCBot` (entrenamiento de Common Crawl, no
citación) también responde `200`. Se puede bloquear en `robots.txt` sin perder
visibilidad en los motores generativos citados arriba. No se ha bloqueado —
es una decisión de negocio, no técnica.

---

## FASE 3 — Renderizado sin JS

`curl` plano (sin ejecutar JS) sobre las 5 rutas pedidas, contenido HTML
limpiado de `<script>`/`<style>` y medido en caracteres de texto visible.

```
$ curl -s https://sedaprivatehomes.com/ | [strip script/style/tags]
chars: 8456
sample: "SEDA Private Homes — Villas privadas en la Costa del Sol Saltar al
contenido Colección Experiencias SEDA OS ▼ Guest App Ecosistema..."

$ curl -s https://sedaprivatehomes.com/propietarios | [...]
chars: 8142

$ curl -s https://sedaprivatehomes.com/coleccion | [...]
chars: 1257
sample: "...La colección abre en octubre de 2026. Hasta entonces no
publicamos ninguna residencia; si desea reservar una estancia o incorporar
su propiedad, escríbanos..."

$ curl -s https://sedaprivatehomes.com/faq | [...]
chars: 3593

$ curl -s https://sedaprivatehomes.com/guestapp | [...]
chars: 5972
```

**Estado: correcto en las 5 rutas.** Todo el texto sustantivo (navegación,
titulares, cuerpo, footer) está en el HTML inicial. `/coleccion` es la más
corta porque, tras el PR #29, su contenido real es deliberadamente breve (aviso
de apertura en octubre 2026), no un defecto de renderizado. Confirma que el
PR #10 convirtió correctamente las 9 páginas `use client` a datos servidos en
el primer byte — no era una suposición, se ha verificado con `curl` real.

---

## FASE 4 — Rendimiento en móvil

PageSpeed: 75 móvil vs 94 escritorio (sin datos de campo — no hay tráfico
real todavía). El PR #10 dejó fuera, a propósito, tres causas: migración a
`next/image`, `preload` del vídeo de portada, recompresión de imágenes.

### Causa 1 — imágenes bajo el pliegue sin `loading="lazy"` (arreglado, bajo riesgo)

Se localizaron 16 usos de `<img>` plano (no `next/image`) en el sitio. De
ellos, 9 carecían de `loading="lazy"` y eran claramente secciones bajo el
pliegue (galerías, pasos numerados, bloques editoriales de scroll-reveal).
Se añadió `loading="lazy" decoding="async"` a esas 9 en:

- `app/[locale]/descubre/DescubreContent.tsx` (imagen editorial + galería de ciudades)
- `app/[locale]/experiencias/ExperienciasContent.tsx` (tarjetas de catálogo + imagen editorial; la imagen hero de esta página, que ya llevaba `fetchPriority="high"` por ser el LCP, se dejó intacta)
- `components/dual-conversion.tsx` (2 imágenes)
- `components/editorial-break.tsx`
- `components/journey-section.tsx`
- `components/guest-app-section.tsx` (`door.jpg`, ver Causa 2)

Se dejaron sin tocar: las 2 imágenes de `components/hero.tsx` (LCP de portada)
y la imagen hero de `app/[locale]/propietarios/PropietariosContent.tsx` (LCP
de esa página) — cambiarlas a lazy degradaría el LCP en vez de mejorarlo.
`app/[locale]/nosotros/NosotrosContent.tsx` y `components/services-slider.tsx`
ya llevaban `loading="lazy"`.

**Lo que queda pendiente y se reporta, no se toca:** migrar los 16 `<img>` a
`next/image` sigue fuera de alcance de este parche — es la tarea estructural
que el PR #10 dejó explícitamente diferida (conversión responsiva AVIF/WebP,
`sizes`, dimensiones intrínsecas). Impacto estimado: mayor que el de
`loading="lazy"` solo, porque además reduce el peso de bytes transferidos por
imagen (WebP/AVIF vs JPEG/PNG sin comprimir) — pero requiere tocar 9 ficheros
y verificar visualmente cada composición (`object-cover`, `aspect-*`), por lo
que no encaja en "bajo riesgo".

### Causa 2 — preload desperdiciado de `door.jpg` en portada (arreglado, bajo riesgo)

```
$ curl -s https://sedaprivatehomes.com/ | grep -o '<link rel="preload"[^>]*>'
<link rel="preload" as="image" href="/villas/door.jpg"/>
<link rel="preload" as="script" fetchPriority="low" href="/_next/static/chunks/115dplafwys-z.js"/>
```

La portada precargaba `/villas/door.jpg`, una imagen de `components/guest-app-section.tsx`
que ilustra el paso 1 de una guía de acceso muy por debajo del pliegue — no
la imagen de portada (`hero.mp4`/`hero-poster.jpg`). Esa precarga competía por
ancho de banda con el vídeo hero real en la conexión móvil, justo en el tramo
crítico del LCP. Con `loading="lazy"` añadido (Causa 1), el navegador deja de
tratarla como candidata a precarga.

### Causa 3 — vídeo de portada de 3 MB con `preload="auto"` (estructural, no tocado)

```
$ ls -la public/hero.mp4 public/villas/hero-poster.jpg
-rw-r--r-- 1 ... 3136425 hero.mp4        (~3.0 MB)
-rw-r--r-- 1 ... 294209  hero-poster.jpg (~288 KB)
```

`components/hero.tsx` sirve un vídeo de 3 MB con `autoPlay muted loop
preload="auto"` en cada visita móvil. El propio código lo marca como
`PLACEHOLDER (poster): sustituir por frame extraído del vídeo`, es decir, ya
está fichado como pendiente por el equipo, no es un descubrimiento nuevo.

**Impacto estimado:** es probablemente la causa individual más grande de la
diferencia 75/94 — un vídeo autoplay de 3 MB en primera carga es mucho peso en
redes móviles reales (3G/4G con throttling), aunque el conector de PageSpeed
de laboratorio no siempre lo penalice igual que Core Web Vitals de campo. No
se ha tocado porque cualquier cambio (`preload="metadata"`, servir solo el
poster en móvil, recodificar a un vídeo más ligero) altera el comportamiento
visual de la portada y requiere validación en el propio dispositivo — no es
un cambio mecánico de bajo riesgo.

### Recompresión de imágenes (estructural, no tocado)

```
$ find public/villas -iname "*.jpg" -o -iname "*.png" | xargs du -ch | tail -1
154M    total
```

Varios PNG sueltos pesan 2–7 MB cada uno (capturas/generaciones IA sin
comprimir, ver lista de huérfanos en Fase 5 — la mayoría de estos PNG pesados
son además huérfanos). Las imágenes en uso activo (`about.jpg`,
`portal-tablet.jpg`, etc.) están en rangos razonables (200–350 KB), no son la
prioridad. Recompresión masiva queda fuera de alcance de este parche por
instrucción explícita ("no borres imágenes de `public/villas` salvo la
maqueta") y porque re-encodear en bloque sin revisión visual una a una es
arriesgado.

---

## FASE 5 — Ficheros servidos que no deberían

### `.jsx` y `.html` de maqueta — **retirados**

```
$ curl -s -o /dev/null -w "%{http_code}\n" https://sedaprivatehomes.com/villas/BeneficiosPropietarios.jsx
200
$ curl -s -o /dev/null -w "%{http_code}\n" https://sedaprivatehomes.com/villas/seda_beneficios_propietarios_mockup.html
200
$ grep -rn "BeneficiosPropietarios\|seda_beneficios_propietarios_mockup" --include="*.ts" --include="*.tsx" --include="*.js" .
(sin resultados — no referenciados por ningún componente)
```

Ambos ficheros eran código de prototipo (componente React sin compilar +
maqueta HTML) servido directamente como estático por Next.js, públicamente
accesible con `200` y sin ninguna referencia desde el código de producción.
Se han retirado con `git rm`:

- `public/villas/BeneficiosPropietarios.jsx`
- `public/villas/seda_beneficios_propietarios_mockup.html`

### Ficheros huérfanos — listados, no borrados

103 ficheros (de 124 en `public/villas/` antes de esta retirada) no están
referenciados por ninguna ruta o componente del código. Suman **61 MB**.
Coincide con el orden de magnitud fichado por el PR #10 (~200 MB huérfanos
tras la retirada de las villas ficticias, 106 ficheros contando también los
dos de maqueta ya retirados aquí).

Predominan: exportaciones de ChatGPT/generaciones IA sin curar (`ChatGPT
Image *.png`, ~85 ficheros), vídeos de prueba de campaña (`Luxury_Villa_Visuals_*.mp4`,
`Create_a_vertical_luxury_websi.mp4`, `GENERA_UN_VIDEO_PARA_LA_PORTAD.mp4`,
`Ultra_premium_Mediterranean_pr.mp4`), variantes `-prev`/`-prev2`/`-prev3` de
imágenes ya en uso, y recortes `-removebg-preview` y `Untitled Project`.

Lista completa (rutas relativas a `public/`):

```
villas/059b6a0d-4aa2-4c18-ab70-f40c7523a68d.png
villas/349d62a3-a414-4386-bd45-b04670c98632.png
villas/468b2e3e-3a24-4964-8646-e7b38dabeb64.png
villas/about-prev.jpg
villas/about-prev2.jpg
villas/Captura de pantalla 2026-05-06 165350.png
villas/ChatGPT Image 5 may 2026, 07_59_14.png
villas/ChatGPT Image 5 may 2026, 08_00_09.png
villas/ChatGPT Image 5 may 2026, 08_07_49.png
villas/ChatGPT Image 5 may 2026, 08_13_44.png
villas/ChatGPT Image 5 may 2026, 21_04_47.png
villas/ChatGPT Image 5 may 2026, 22_18_09 (1).png
villas/ChatGPT Image 5 may 2026, 22_18_10 (2).png
villas/ChatGPT Image 6 may 2026, 07_23_48 (1).png
villas/ChatGPT Image 6 may 2026, 07_23_48 (2).png
villas/ChatGPT Image 6 may 2026, 07_23_48 (3).png
villas/ChatGPT Image 6 may 2026, 07_54_52 (1).png
villas/ChatGPT Image 6 may 2026, 07_54_52 (2).png
villas/ChatGPT Image 6 may 2026, 07_54_53 (3).png
villas/ChatGPT Image 6 may 2026, 08_36_01 (1).png
villas/ChatGPT Image 6 may 2026, 08_36_02 (2).png
villas/ChatGPT Image 6 may 2026, 08_36_02 (3).png
villas/ChatGPT Image 6 may 2026, 08_40_19 (1).png
villas/ChatGPT Image 6 may 2026, 08_40_20 (2).png
villas/ChatGPT Image 6 may 2026, 08_40_20 (3).png
villas/ChatGPT Image 6 may 2026, 08_44_22.png
villas/ChatGPT Image 6 may 2026, 08_44_29.png
villas/ChatGPT Image 6 may 2026, 08_57_54 (1).png
villas/ChatGPT Image 6 may 2026, 08_57_54 (2).png
villas/ChatGPT Image 6 may 2026, 08_57_54 (3).png
villas/ChatGPT Image 6 may 2026, 19_53_41 (1).png
villas/ChatGPT Image 6 may 2026, 19_53_41 (2).png
villas/ChatGPT Image 6 may 2026, 20_34_47.png
villas/ChatGPT Image 6 may 2026, 20_36_41.png
villas/ChatGPT Image 6 may 2026, 20_39_12.png
villas/ChatGPT Image 6 may 2026, 20_44_53.png
villas/ChatGPT Image 6 may 2026, 20_45_36.png
villas/ChatGPT Image 7 may 2026, 10_48_22 (1).png
villas/ChatGPT Image 7 may 2026, 10_48_23 (2).png
villas/ChatGPT Image 7 may 2026, 10_48_23 (3).png
villas/ChatGPT Image 7 may 2026, 10_48_23 (4).png
villas/ChatGPT Image 7 may 2026, 10_48_24 (5).png
villas/ChatGPT Image 7 may 2026, 10_53_33 (1).png
villas/ChatGPT Image 7 may 2026, 10_53_34 (2).png
villas/ChatGPT Image 7 may 2026, 10_53_34 (3).png
villas/ChatGPT Image 7 may 2026, 10_53_34 (4).png
villas/ChatGPT Image 7 may 2026, 10_53_35 (5).png
villas/ChatGPT Image 7 may 2026, 11_04_44 (1).png
villas/ChatGPT Image 7 may 2026, 11_04_44 (2).png
villas/ChatGPT Image 7 may 2026, 11_04_44 (3).png
villas/ChatGPT Image 7 may 2026, 11_04_44 (4).png
villas/ChatGPT Image 7 may 2026, 11_04_45 (5).png
villas/ChatGPT Image 7 may 2026, 20_37_57.png
villas/ChatGPT Image 7 may 2026, 20_40_46.png
villas/ChatGPT Image 7 may 2026, 20_54_24 (1).png
villas/ChatGPT Image 7 may 2026, 20_54_24 (2).png
villas/ChatGPT Image 7 may 2026, 20_54_24 (3).png
villas/ChatGPT Image 7 may 2026, 20_54_25 (4).png
villas/ChatGPT Image 7 may 2026, 20_54_26 (5).png
villas/ChatGPT Image 7 may 2026, 20_54_26 (6).png
villas/ChatGPT Image 7 may 2026, 20_54_27 (7).png
villas/ChatGPT Image 8 may 2026, 13_45_53 (1).png
villas/ChatGPT Image 8 may 2026, 13_45_56 (1).png
villas/ChatGPT Image 8 may 2026, 13_45_57 (2) (1).png
villas/ChatGPT Image 8 may 2026, 13_45_57 (2).png
villas/ChatGPT Image 8 may 2026, 13_45_57 (3) (1).png
villas/ChatGPT Image 8 may 2026, 13_45_57 (3).png
villas/ChatGPT Image 8 may 2026, 13_45_58 (4) (1).png
villas/ChatGPT Image 8 may 2026, 13_45_58 (4).png
villas/ChatGPT Image 8 may 2026, 13_45_58 (5) (1).png
villas/ChatGPT Image 8 may 2026, 13_45_58 (5).png
villas/ChatGPT Image 8 may 2026, 13_45_58 (6).png
villas/ChatGPT Image 8 may 2026, 13_45_59 (6).png
villas/ChatGPT Image 8 may 2026, 13_45_59 (7) (1).png
villas/ChatGPT Image 8 may 2026, 13_45_59 (7).png
villas/ChatGPT Image 8 may 2026, 16_49_52 (1).png
villas/ChatGPT Image 8 may 2026, 16_49_53 (2).png
villas/ChatGPT Image 8 may 2026, 16_49_56 (3).png
villas/ChatGPT Image 8 may 2026, 16_49_57 (4).png
villas/ChatGPT Image 8 may 2026, 16_49_58 (5).png
villas/ChatGPT Image 8 may 2026, 16_49_58 (6).png
villas/ChatGPT Image 8 may 2026, 18_19_26 (1).png
villas/ChatGPT Image 8 may 2026, 18_19_27 (2).png
villas/ChatGPT Image 8 may 2026, 18_19_27 (3).png
villas/Create_a_vertical_luxury_websi.mp4
villas/dcc928e0-793c-4fac-b413-08a70e2bcd12.png
villas/ff858722-3359-4b51-8860-8fd5e99fae88.png
villas/GENERA_UN_VIDEO_PARA_LA_PORTAD.mp4
villas/guest-app-hand-prev2.jpg
villas/guest-app-hand-prev3.jpg
villas/Luxury_Villa_Visuals_A_man_con_short_brown_hair_and_a_light_q6bqjfnO.mp4
villas/Luxury_Villa_Visuals_A_person_wearing_a_white_shirt_and_black_pants_I-mKG5VN (1).mp4
villas/Luxury_Villa_Visuals_A_person_wearing_a_white_shirt_and_black_pants_I-mKG5VN.mp4
villas/Luxury_Villa_Visuals_A_serene_infinity_pool_overlooks_the_calm_ocean_NgRqdPwm.png
villas/Luxury_Villa_Visuals_A_woman_with_dark_hair_and_a_red_dress_walks_h4ZHzVzt (1).mp4
villas/Luxury_Villa_Visuals_A_woman_with_dark_hair_and_a_red_dress_walks_h4ZHzVzt.mp4
villas/Luxury_Villa_Visuals_In_a_minimalist_architectural_style_a_luxurious_RupIrtNw.jpg
villas/portal-tablet-prev2.jpg
villas/Ultra_premium_Mediterranean_pr.mp4
villas/Untitled Project (10).png
villas/Untitled Project (11).png
villas/Untitled_Project__10_-removebg-preview.png
villas/Untitled_Project__11_-removebg-preview.png
```

**No se han borrado** por instrucción explícita del prompt de esta tarea.

---

## FASE 6 — `llms.txt`

Google lo ignora explícitamente para AI Overviews/AI Mode; otros sistemas
(OpenAI, Perplexity, Anthropic) pueden usarlo como resumen de navegación.
Se ha creado `public/llms.txt` con la estructura estándar (resumen + enlaces
a las 8 páginas principales). **No es una mejora de visibilidad** — es un
fichero de cortesía de 10 minutos, tal y como pide el prompt.

---

## Resumen de cambios en este PR

- `public/villas/BeneficiosPropietarios.jsx` — eliminado (maqueta accesible por URL).
- `public/villas/seda_beneficios_propietarios_mockup.html` — eliminado (maqueta accesible por URL).
- `public/llms.txt` — creado.
- `loading="lazy" decoding="async"` añadido a 9 `<img>` bajo el pliegue en
  6 ficheros (`DescubreContent.tsx`, `ExperienciasContent.tsx`,
  `dual-conversion.tsx`, `editorial-break.tsx`, `journey-section.tsx`,
  `guest-app-section.tsx`).
- `docs/audit/GEO-BASE.md` — este documento.

Nada más se ha tocado. Fases 1, 2 y 3 no requerían cambios (ya correctas tras
PR #10/#29) y se documentan como verificación, no como trabajo nuevo.

---

## BLOQUEADO

Pendiente de datos que aún no existen — no accionable desde este repo:

- **Licencia RTA** (Registro de Turismo de Andalucía): sin número de licencia
  no se puede añadir a `LodgingBusiness` ni mostrar en el sitio. Bloquea
  cualquier schema de tipo `Accommodation`/`Hotel` más específico.
- **Google Business Profile**: sin ficha verificada no hay `sameAs` que
  enlazar desde `Organization`, ni entidad para Knowledge Panel.
- **Reseñas**: no hay ninguna. No se debe emitir `AggregateRating` (prohibido
  explícitamente en el prompt) hasta que existan reseñas reales verificables.
- **Dirección fiscal de la S.L.**: `PostalAddress` en el JSON-LD actual usa
  datos genéricos de zona (Costa del Sol / Andalucía) a falta de domicilio
  social definitivo.

---

## Estructural, reportado y no tocado en este PR

| Punto | Impacto estimado | Por qué no se toca aquí |
|---|---|---|
| Migración de 16 `<img>` a `next/image` | Medio-alto: AVIF/WebP automático, `srcset` responsivo, dimensiones intrínsecas — más peso ahorrado que solo `loading="lazy"` | Toca 9 ficheros, requiere verificar visualmente cada composición (`aspect-*`, `object-cover`); no es mecánico |
| Vídeo hero 3 MB con `preload="auto"` | Alto: probablemente la causa individual mayor del gap 75/94 en móvil | Cambiar el comportamiento de autoplay/preload es un cambio de UX que exige prueba en dispositivo real, no un ajuste mecánico |
| Recompresión de imágenes (154 MB en `public/villas/jpg+png`) | Medio: varios PNG de 2–7 MB sin comprimir, mayoría huérfanos | Re-encodear en bloque sin revisión visual una a una es arriesgado; further, casi todo lo pesado ya está en la lista de huérfanos (Fase 5) y su destino natural es borrado, no compresión |
| Bloqueo de `CCBot` en `robots.txt` | Bajo — libera rastreo sin perder citación en los 5 sistemas verificados | Decisión de negocio de Ángel, no técnica (indicado explícitamente en el prompt) |

---

**MODELO: Sonnet 5 · ESFUERZO: estándar**
