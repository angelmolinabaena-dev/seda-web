# HALLAZGOS DE ESTADO — SEDA OS + GUEST-APP

**Auditoría de venta · 2026-07-10 · Modelo: Claude Fable 5 · Esfuerzo ALTO · SOLO LECTURA**

Fuentes: código de `guest-app` (commit `ef86a96`) y `seda_os`/`portal-propietarios` (commit `5796ecd`), BD de producción Supabase (EU `skqrvzdmzvvlhnorzzxh`, consultas SELECT), logs runtime de Vercel (7 días), Sentry (90 días), PRs abiertos en GitHub. El repo `seda_os` se localizó en GitHub como `angelmolinabaena-dev/portal-propietarios` (la referencia canónica está en `guest-app/lib/sedaOsApi.ts:6-20`).

Nota de método: los checks HTTP directos a producción (p. ej. `/api/health`) están bloqueados por la política de red del entorno → marcados NO VERIFICABLE cuando no hay señal alternativa (Vercel/Supabase/Sentry sí fueron accesibles).

---

## 1 · SEMÁFORO DEL CAMINO CRÍTICO

### 🟡 AMARILLO — venta vía OTA (Airbnb/Booking a través de Beds24)

Este es el único camino por el que puede entrar una reserva cobrada HOY, y funciona: canal abierto, cobro en la OTA, espejo Beds24→SEDA operativo (webhook fail-closed + cron `beds24-reconcile` verde: última ejecución hoy 2026-07-10 09:48, `last_ok=true`, registrado en `cron_runs`). La BD real ya contiene 1 reserva con `channel_source='beds24'`.

Parches de horas antes de aceptar huéspedes reales:
1. **Scan de documento RD933 roto en producción** (H-05) — el huésped no puede escanear su DNI.
2. **Columna `verificacion_omitido_at` ausente en BD** (H-04) — el "omitir verificación" devuelve 500.
3. **Verificar los 22 crons de n8n en real** (H-13) — sin ellos no sale ningún email del ciclo de vida (confirmación, pre-arrival, códigos de puerta).
4. **Validez de `ANTHROPIC_API_KEY` en Vercel prod** (H-12) — gate abierto desde el incidente de junio; sin ella, Sofía cae.
5. **Data-reset sesión 2 sin ejecutar** (H-19) — la BD mezcla datos de prueba con lo que entre real.

### 🔴 ROJO — venta DIRECTA (motor propio en portal/guest-app)

No vendible con motor propio hoy. Bloqueantes exactos:
1. `SEDA_FLAG_MOTOR_RESERVAS` OFF por defecto (funnel + quote + holds apagados) — `seda_os/lib/feature-flags.ts:72`.
2. Write-back SEDA→Beds24 (`POST /bookings`, cierre de canal) **DARK y sin verificar E2E**: falta token con `write:bookings`; el shape de respuesta está sin confirmar — `seda_os/lib/beds24/writeback.ts:207-210`, `lib/beds24/client.ts:423-425`, `BEDS24_POC_FINDINGS.md:3-8`.
3. **Cero evidencia de pago ejercitado**: `pagos_reserva=0`, `stripe_webhook_events=0`, `date_holds=0`, `beds24_writeback_jobs=0` en producción (SQL en vivo, 2026-07-10).
4. En guest-app, el webhook Stripe escribe contra una tabla **inexistente en prod** (H-01) — cualquier activación de cobro de extras/identity falla al 100%.
5. **Divergencia de arquitectura sin resolver** (H-02): lo construido no es la "decisión cerrada" del encargo.

### Matiz importante sobre la "decisión cerrada" de arquitectura

El encargo da por cerrado: `GET /inventory/rooms/offers` → cobro por el endpoint Stripe **de Beds24** atado a `bookId` → `POST /bookings`. **El código implementa otra cosa**: SEDA es autoritativo (disponibilidad/precio desde BD propia con EXCLUDE anti-overbooking `no_solapamiento_reservas`, cobro con **Stripe propio** vía PaymentIntent en `seda_os/app/api/reservar/checkout/route.ts:109-134`, confirmación con re-check interno y auto-reembolso en `lib/booking-confirm.ts:74-96`) y Beds24 actúa como espejo + write-back para cerrar OTAs. No existe ninguna llamada a `/inventory/rooms/offers` ni al Stripe de Beds24 en ninguno de los dos repos. Esto no es necesariamente peor (el diseño implementado es defendible y está bien construido), pero **una de las dos cosas tiene que ceder**: o se actualiza la decisión de arquitectura al diseño implementado, o se reescribe el motor. Decisión de Angel antes de invertir más en el motor directo.

---

## 2 · TABLA DE HALLAZGOS

Leyenda repos: **GA** = guest-app · **SO** = seda_os (portal-propietarios) · **RT** = runtime (BD/Vercel/Sentry, sin file:line).
Modelos: **Opus 4.8** = dinero/auth/legal/RLS/migraciones · **Sonnet 5** = UI/limpieza/bajo riesgo · **Angel** = decisión humana, no ejecutable por modelo.

| ID | Repo | Evidencia | Problema | Riesgo | Modelo | Fix propuesto + criterio de aceptación |
|----|------|-----------|----------|--------|--------|----------------------------------------|
| H-01 | GA | `app/api/stripe/webhook/route.ts:46-58` + SQL live: `to_regclass('public.stripe_processed_events')=NULL` | El webhook Stripe deduplica contra una tabla que **no existe en prod** → todo el error-path cae en 500 en cada entrega; Stripe reintentaría sin fin. Migración `supabase/migrations/stripe_webhook_idempotency.sql` escrita pero sin aplicar. | CRÍTICO-DINERO (latente) | Opus 4.8 | Aplicar la migración manualmente en Supabase Studio. Aceptación: `to_regclass` no nulo + evento de test de Stripe → 200 con `{deduped:true}` en el segundo intento. |
| H-02 | SO | `lib/booking-quote.ts`, `app/api/reservar/*`, `lib/beds24/writeback.ts:159-160` (no existe `/inventory/rooms/offers` ni Stripe-de-Beds24 en el repo) | Arquitectura implementada (SEDA-autoritativo + Stripe propio + write-back espejo) ≠ decisión cerrada del encargo (Beds24 offers + Stripe de Beds24 + bookId). | CRÍTICO-DINERO (decisión) | **Angel** | Ratificar por escrito el diseño implementado (recomendado) o abrir plan de reescritura. Aceptación: decisión documentada; el roadmap del motor apunta a un solo diseño. |
| H-03 | SO | `lib/beds24/writeback.ts:207-210`, `lib/beds24/client.ts:423-425`, `BEDS24_POC_FINDINGS.md:3-8` | Cierre atómico de canal (write-back `POST /bookings`) DARK, sin token `write:bookings` provisto y sin verificación E2E. Sin esto, una reserva directa NO cierra disponibilidad en las OTAs → riesgo real de overbooking cross-canal. | CRÍTICO-DINERO | Opus 4.8 | Provisionar token con scopes (`write:bookings`, `bookings-personal`, `bookings-financial`), ejercitar E2E con reserva de test, activar `SEDA_FLAG_BEDS24_WRITEBACK`. Aceptación: reserva directa de test visible en Beds24 con `custom10=seda:<uuid>` y fechas bloqueadas en canal. |
| H-04 | GA+RT | Vercel logs 4-5 jul (`PGRST204`) + SQL live: columna `verificacion_omitido_at` no existe en `reservas` | `/api/viajeros/skip-verification` devuelve 500 en producción: el código referencia una columna cuya migración no se aplicó. | ALTO | Opus 4.8 (migración) | Aplicar `ALTER TABLE reservas ADD COLUMN verificacion_omitido_at timestamptz` (o la migración del repo) en Studio. Aceptación: el endpoint responde 200 y sella el campo. |
| H-05 | GA+RT | Vercel logs 4 jul: `scan_document.failed — Invalid schema: Enum value 'dni' does not match declared type '['string','null']'` en `/api/scan-document` | El escaneo OCR del documento (paso central del registro RD933) está roto en prod por un schema de salida inválido enviado a la API de Anthropic. | ALTO (bloquea registro huésped) | Sonnet 5 (revisión Opus por tocar flujo legal) | Corregir el JSON Schema del output (`tipo_documento` enum vs nullable). Aceptación: scan de un DNI de prueba devuelve campos extraídos sin `AI_APICallError`. |
| H-06 | GA | PRs #51/#52/#53 abiertos + SO PR #136 (índice único `(reserva_id,tipo_documento,num_documento)`) | Gate de completitud de viajeros (bloquea finalizar con roster incompleto) y anti-duplicados de acompañantes **escritos pero sin mergear/aplicar**. Sin ellos: sub-registro o sobre-reporte a SES.Hospedajes (falsedad RD933 art. 5). Orden obligatorio: migración #136 ANTES que el upsert #53. | CRÍTICO-LEGAL | Opus 4.8 | Aplicar índice (Studio) → mergear #136, #51, #53 (y #52 tras retarget). Aceptación: re-add del mismo documento → 200 idempotente, una sola fila; finalizar con roster incompleto → 409. |
| H-07 | GA | `app/legal/privacidad/page.tsx:188-219` + PR #35 abierto desde 25-jun | Política de privacidad **materialmente falsa** en prod: promete "Vercel AI Gateway + Gemini + retención cero", la realidad es Anthropic directo (EE. UU.). Riesgo AEPD. El PR #35 (política veraz + `pii_access_log`) lleva 2 semanas sin mergear. | CRÍTICO-LEGAL | Opus 4.8 | Rebasear #35, revisión de asesoría de datos, mergear. Aceptación: la política publicada describe el flujo real (Anthropic, SCC art. 46.2.c) y cada ruta PII inserta en `pii_access_log`. |
| H-08 | SO | PR #100 (gate B4): "el botón Emitir factura funciona y el NIF emisor es ficticio; bloqueado solo por compromiso" | No hay guard de código que impida emitir la primera factura real con `SEDA_NIF_FISCAL` ficticio y sin sign-off de la asesora. | CRÍTICO-LEGAL | Opus 4.8 | Guard: bloquear emisión si el NIF es el placeholder o si falta flag de sign-off fiscal. Aceptación: intento de emisión con NIF ficticio → error explícito; test que lo fija. |
| H-09 | GA | `lib/magic-link.ts:147` (`if (!redis) return true`), `lib/pin-rate-limit.ts` (fallback in-memory) + `magic_link_consumptions=0` en prod | El burn single-use de magic-links y el rate-limit del PIN **fallan en abierto** sin Upstash Redis; la tabla de consumos a 0 sugiere que Redis no está operativo en prod. | CRÍTICO-AUTH | Opus 4.8 | Fail-closed en producción (throw si falta `UPSTASH_REDIS_REST_URL`) + provisionar Upstash. Aceptación: replay de un magic-link consumido >10 min → rechazado; 6º intento de PIN desde misma IP → 429. |
| H-10 | GA | PR #56 abierto (access gate global) — hoy el gate no está en main | Sin el PR #56, la app de huéspedes sirve su bundle completo a visitantes sin sesión (el guard es por pantalla, no global). Requiere migración manual `session_version` + env vars antes del merge. | ALTO-AUTH | Opus 4.8 | Revisar/rebasear #56, aplicar migración y env vars, mergear. Aceptación: visita sin cookie a `guests.…/` → redirect a `/acceso`; PWA install sigue funcionando. |
| H-11 | SO | `docs/AUDIT_PMS.md:140-145,243-245` | P1 del propio repo sin cerrar: (a) PaymentIntents huérfanos sin cron de reconciliación (cargo sin reserva posible); (b) cancelación no revoca código NUKI; (c) `nuki-delivery`/`viajeros-purge` fallan en silencio. | ALTO (a=DINERO, b=seguridad física) | Opus 4.8 | (a) cron diario de reconciliación PI↔reserva; (b) llamar `revokeNukiAccess` en cancel; (c) `alertCronFailure` en ambos crons. Aceptación: test por cada uno. |
| H-12 | GA+RT | `docs/PENDING_GATE.md:39-45`; incidente 2026-06-23 (`invalid x-api-key`); curl a `/api/health` bloqueado desde este entorno | Validez de `ANTHROPIC_API_KEY` en Vercel Production sin confirmar tras la rotación de junio (el runbook quedó a medias; ojo: el incidente fue de la clave Anthropic, NO de Stripe). Además los runbooks `docs/RUNBOOK.md` y `docs/runbook-keys.md` están referenciados pero **no existen**. | ALTO | Angel (2 min) + Sonnet 5 (runbooks) | Abrir `https://guests.sedaprivatehomes.com/api/health` → `ai_provider.ok:true` cierra el gate. Escribir los 2 runbooks fantasma. |
| H-13 | GA+RT | `docs/CRONS_MIGRADOS_A_N8N.md` (solo `rd933-invite` probado E2E); `cron_runs` solo registra `beds24-reconcile`; todos los `*_sent_at=0` históricos | Los 22 crons migrados a n8n/Railway no tienen verificación de ejecución real; el checklist admin (`app/admin/cron-status`) depende de que sellen `*_sent_at`. Además hay 2 rutas cron huérfanas fuera de la tabla de 22: `proactive-celebrations` y `post-stay-thank-you`. | ALTO | Angel (verificar n8n UI) + Sonnet 5 (huérfanos) | Confirmar en n8n que los 22 workflows corren en verde 48h y que `cron-status` muestra sellados; agendar o retirar los 2 huérfanos. |
| H-14 | GA+SO+RT | Sentry 90d: **1 solo evento** (= smoke test `SENTRY_CHECK_EU` 5-jul); los errores reales de Vercel no llegan; DSN vacío en `.env.example` de SO; config y scrubbing sí correctos (`sentry.*.config.ts`, `lib/sentry-scrub.ts`) | Sentry está bien configurado (EU `de.sentry.io`, `sendDefaultPii:false`, scrub 2 capas, Replay off) pero **no captura errores reales** — o DSN ausente en algún scope o solo proyecto portal. Guest-app no tiene proyecto server efectivo. | MEDIO | Sonnet 5 | Setear DSN en ambos proyectos/scopes y provocar un error de prueba por app. Aceptación: error de prueba de cada app visible en Sentry con PII redactada. |
| H-15 | GA | `lib/emails/booking-confirmation.ts` (no importa `reservation-code`); `lib/reservation-code.ts:22-27,42` | El localizador es `SEDA-YYMM-NNNN` (no `SP-XXXXX` como asume el encargo), se ve en la app pero **no aparece en el email de confirmación**; además es derivado (no columna) con riesgo de colisión ~50% a ~16 reservas/mes. | MEDIO | Sonnet 5 | Incluir el localizador en el email + evaluar persistirlo como columna única. Aceptación: email de confirmación muestra `SEDA-…` idéntico al de la app. |
| H-16 | GA | `app/api/booking-preferences/route.ts:63-134` | Único GET session-less que muta `reservas` (preferencias). Endurecido (rate-limit, first-click-wins, allowlist) y de bajo impacto, pero un prefetch puede fijar la primera preferencia. | BAJO | Sonnet 5 | Convertir la fijación en POST desde página interstitial. Aceptación: GET solo lee; prefetch no fija nada. |
| H-17 | SO | `lib/supabase.ts:6` (sin `flowType:'pkce'`); `app/reset-password/page.tsx:20-63`; `middleware.ts:170-192` | Invitación de propietario frágil ×3: recovery link se consume en GET (prefetch de escáner lo mata), sesión queda en localStorage y el middleware lee cookie (rebote a login), y la landing se queda en "Verificando enlace…" para siempre si el token llegó consumido. | ALTO · **POST-VENTA** | Opus 4.8 | Migrar a PKCE/SSR cookie helper + manejo de `#error=` con reintento. Aceptación: invitación E2E con SafeLinks simulado → owner dentro del portal sin login manual. |
| H-18 | SO | `docs/PRE_LAUNCH_CHECKLIST.md:19-27`, `docs/RUNBOOK_LIQUIDACIONES.md:6-11` | SEPA débitor IBAN/BIC **ficticios** (bloqueante pre-launch ya documentado, pendiente constitución S.L. + cuenta). Sin riesgo de emisión accidental (descarga manual), pero ninguna liquidación real puede pagarse. | ALTO · POST-VENTA | Angel | Constituir S.L. + cuenta; sustituir placeholders. Aceptación: checklist pre-launch en verde. |
| H-19 | SO+RT | PR #127 (backup + censo hechos; sesión 2 NO ejecutada); BD live: 2 reservas (test/espejo), 1.149 filas censadas | La BD de producción sigue con datos de prueba; el plan de base-cero está aprobado a medias. Vender con datos de test mezclados contamina liquidaciones, métricas y SES. | ALTO (operacional) | Angel + Opus 4.8 (sesión 2 supervisada) | Ejecutar sesión 2 del data-reset (manual en Studio, con backup ya verificado). Aceptación: solo quedan filas CONSERVAR del censo. |
| H-20 | GA | `app/api/villa/servicios/checkout/route.ts:187-235`, `sv4_reservas_servicio_2026_05_26.sql`; grep IVA/factura → 0 | Camino B (extras): pedidos (`reservas_servicio`) + Stripe Checkout + Connect **construidos**, pero sin pata fiscal (factura 21%) y dependen del webhook roto H-01. Nunca cobrado en prod. | POST-VENTA | Opus 4.8 (cuando toque) | No construir más ahora. Antes de activar: H-01 + factura 21% + onboarding Connect. |
| H-21 | GA | `lib/viajero-validation.ts:371`; crons con `skip_no_email` | Email y teléfono del titular son opcionales en el registro → si no los da, todo el ciclo de comunicaciones queda mudo para esa reserva. | MEDIO | Sonnet 5 (decisión de producto de Angel sobre obligatoriedad) | Exigir al menos un canal de contacto del titular. Aceptación: no se puede finalizar sin email o teléfono. |
| H-22 | SO+RT | Supabase advisors: `facturas_emitidas_guard` con search_path mutable (WARN), `btree_gist` en public (WARN), leaked-password-protection OFF (WARN); `user_prefs_own` policy comentada en `2026-06-12_PMS1` | Flecos de seguridad menores en BD. Los ~45 lints "RLS enabled no policy" son el patrón deny-default intencional, NO hallazgos. | BAJO | Opus 4.8 (junto a cualquier otra migración) | Fijar search_path, activar HIBP protection, decidir si `user_prefs_own` fue olvido. |
| H-23 | GA+RT | Vercel: 17 boot-failures hasta 7-jul (`Missing REQUIRED env vars … Refusing to boot`) en rutas `/`, `/acceso` | Deployments (previsiblemente previews sin env vars de scope) rebotan usuarios reales con error de boot. Si algún alias público apunta ahí, es caída visible. | MEDIO | Angel (2 min en Vercel) | Copiar las 3 env vars Supabase al scope Preview o desactivar previews públicos. Aceptación: 0 boot-errors en logs 7 días. |
| H-24 | SO | `LOOP_STATUS.md:5-6` | La UI admin del espejo Beds24 (`/admin/beds24`, F2) está en PR DRAFT sin mergear ni desplegar — el admin hoy no ve el espejo de canal desde la UI (las vistas F1 de reservas directo-vs-OTA sí están OK con guard servidor). | MEDIO | Sonnet 5 | QA visual + merge del draft. Aceptación: 3 pestañas de `/admin/beds24` visibles con datos del espejo. |

**Verificado OK (sin acción):** invariante OTA read-only con guard en servidor + test (`seda_os/app/api/reservas/[id]/route.ts:112-117,307-312`, `tests/reservas-channel-edit-gate.test.ts`) · hard-stop de cancelación por plataforma en ambas rutas (`seda_os/app/api/guest-portal/cancel/route.ts:59-64` — matiz: la ruta guest-portal no tiene gate por flag, solo la admin `admin/reservas/[id]/cancel/route.ts:53,75-80`) · emails al huésped en los 16 templates (bug histórico ausente) · `{{PRIVACY_URL}}` no existe en el árbol actual · magic-links del huésped con gracia anti-prefetch de 10 min (`lib/magic-link.ts:143-165`) — la pata débil es H-09 (Redis) · SES.Hospedajes real (SOAP+mTLS) correctamente gated `off` hasta cert FNMT · RLS SEC2-SEC5 intacto y las tablas nuevas post-SEC5 todas con RLS · flag IRNR intacto y fail-safe OFF (`lib/liquidacion-calculator.ts:157`, `lib/modelo-irnr.ts:68-69`) · secretos limpios en git (historial completo revisado, pre-commit scanner activo) · portal propietarios: 20 páginas funcionales, guards completos, ningún gap bloquea venta · reconcile cron verde hoy con `CRON_SECRET` + `timingSafeEqual`.

---

## 3 · DOCUMENTOS DE EJECUCIÓN A GENERAR (en orden, un repo por documento)

| # | Documento | Repo | Cubre | Modelo |
|---|-----------|------|-------|--------|
| 1 | `EXEC_GA_01_stripe-webhook-tabla-idempotencia.md` | guest-app | H-01 (SQL manual en Studio + verificación) | Opus 4.8 |
| 2 | `EXEC_GA_02_migracion-verificacion-omitido.md` | guest-app | H-04 (SQL manual) | Opus 4.8 |
| 3 | `EXEC_GA_03_scan-document-schema-fix.md` | guest-app | H-05 | Sonnet 5 (+revisión Opus) |
| 4 | `EXEC_SO_01_indice-unico-viajeros.md` | seda_os | H-06 parte SO (migración #136, va PRIMERO) | Opus 4.8 |
| 5 | `EXEC_GA_04_rd933-gates-merge.md` | guest-app | H-06 parte GA (PRs #51→#53→#52) | Opus 4.8 |
| 6 | `EXEC_GA_05_redis-fail-closed.md` | guest-app | H-09 (Upstash + throw en prod) | Opus 4.8 |
| 7 | `EXEC_GA_06_privacidad-pii-log.md` | guest-app | H-07 (rebase PR #35 + checklist legal) | Opus 4.8 |
| 8 | `EXEC_SO_02_gate-emision-factura.md` | seda_os | H-08 (guard NIF ficticio) | Opus 4.8 |
| 9 | `EXEC_GA_07_access-gate-merge.md` | guest-app | H-10 (PR #56 + migración session_version) | Opus 4.8 |
| 10 | `EXEC_SO_03_beds24-writeback-e2e.md` | seda_os | H-03 (token + E2E + flags) — tras decisión H-02 | Opus 4.8 |
| 11 | `EXEC_SO_04_p1-pms-cierres.md` | seda_os | H-11 (PI huérfanos, NUKI revoke, alertas cron) | Opus 4.8 |
| 12 | `EXEC_GA_08_observabilidad-sentry.md` | guest-app | H-14 parte GA | Sonnet 5 |
| 13 | `EXEC_SO_05_observabilidad-sentry.md` | seda_os | H-14 parte SO | Sonnet 5 |
| 14 | `EXEC_GA_09_email-localizador-y-runbooks.md` | guest-app | H-15 + runbooks fantasma de H-12 | Sonnet 5 |
| 15 | `EXEC_GA_10_crons-huerfanos-y-contacto-titular.md` | guest-app | H-13 (huérfanos) + H-21 | Sonnet 5 |
| 16 | `EXEC_SO_06_owner-invite-hardening.md` | seda_os | H-17 (POST-VENTA) | Opus 4.8 |
| 17 | `EXEC_SO_07_data-reset-sesion2.md` | seda_os | H-19 (manual supervisado, con orden explícita de Angel) | Opus 4.8 |
| 18 | `EXEC_GA_11_booking-preferences-post.md` | guest-app | H-16 (BAJO) | Sonnet 5 |
| 19 | `EXEC_SO_08_beds24-espejo-admin-merge.md` | seda_os | H-24 (QA + merge draft F2) | Sonnet 5 |

**Decisiones previas de Angel (sin documento de ejecución):** H-02 (ratificar arquitectura), H-12 (abrir `/api/health` en prod), H-13 (mirar n8n), H-18 (S.L. + banco), H-23 (env vars de preview en Vercel), obligatoriedad de contacto del titular (H-21).

---

## 4 · LO QUE NO SE TOCA

- **`SEDA_FLAG_IRNR_RETENEDOR`** — gate verificado intacto y fail-safe OFF en `lib/liquidacion-calculator.ts:157` y `lib/modelo-irnr.ts:68-69`, con tests. Sigue pendiente de asesora fiscal (PR #100 es el entregable de consulta). No tocar.
- **Reservas OTA (`channel_source='beds24'`)** — read-only aplicado por guard de servidor + UI + test. Ninguna ruta las muta. No tocar.
- **`email-shell.ts` / kit de emails** (`lib/emails/_theme.ts`, PR #32) — sin placeholders vivos en el árbol actual; el rediseño está en PR abierto pendiente de decisión de merge. No tocar en esta fase.
- **Inconsistencias de color documentadas** — CLAUDE.md olivo vs teal runtime, `ReservaModal.tsx:62` azul off-palette, `OwnerAnalysisPanel.tsx:41` oro, dos olivos owner (`#44665C` vs `#4A5340`): todo ya inventariado en `docs/design/DIAGNOSTICO_SISTEMAS_2026-07.md`, pendiente de decisión de Angel. No tocar.

---

## 5 · REGLAS DE EJECUCIÓN (recordatorio, fuera de esta pasada)

- Angel mergea todos los PRs él mismo (`gh pr merge --squash`). Fable nunca mergea.
- SQL/migraciones: siempre manual en Supabase Studio (H-01, H-04, H-06/#136, session_version de H-10, H-19).
- Todo diff que toque dinero o auth pasa revisión Opus antes del merge.
