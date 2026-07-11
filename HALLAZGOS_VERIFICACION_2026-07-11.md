# HALLAZGOS DE VERIFICACIÓN — RE-AUDITORÍA POST-SPRINT

**2026-07-11 (tarde) · Claude Fable 5 · Esfuerzo ALTO · SOLO LECTURA**

Verifica los ~10 merges encadenados de hoy sobre `guest-app` (main `d491181`) y `portal-propietarios` (main `97c62a1`), contra BD live y logs de Vercel/Sentry. Complementa a `HALLAZGOS_ESTADO_2026-07-10.md` (PR #9).

---

## 1 · SEMÁFORO ACTUALIZADO

### 🟡 AMARILLO — OTA (técnico)

Lo grueso del sprint aguantó: **cero regresiones en registro RD933, gate NUKI, Redis fail-closed y Stripe** tras los rebases encadenados. Pero la re-auditoría caza **una regresión real de #56 (V-01)** y **dos hallazgos que explican/bloquean lo pendiente** (V-02 Sentry, V-03 emails). Para VERDE técnico faltan exactamente **4 cosas** (lista corta en §4).

**Bloqueante legal paralelo (fuera de código):** H-18 (constitución S.L. → NIF real, SEPA, footer fiscal) + revisión legal del PR #35. No impiden que entre una reserva OTA; impiden facturar y dejar el footer de emails correcto.

### 🔴 ROJO — motor directo (sin cambios)

`MOTOR_RESERVAS` OFF hasta las 4 condiciones de la ratificación H-02. `stripe_processed_events` sigue sin existir en BD (verificado hoy — es la condición 4). Nada de hoy tocó el money-path (verificado: cero commits del día en `app/api/stripe/**`, `lib/stripe.ts`, checkout de servicios).

---

## 2 · TABLA DE REGRESIONES (lo cerrado, ¿sigue cerrado?)

| Área verificada | Veredicto | Evidencia |
|---|---|---|
| Registro viajeros 4-capas (#51+#53+#65+#66 en `app/api/viajeros/route.ts`) | ✅ VERIFICADO OK | Un solo `upsert(`, ramas disjuntas titular/acompañante (`route.ts:197-286`), payload único `buildMutableFields` — sin duplicación ni ramas muertas |
| Upsert idempotente #53 | ✅ OK | `onConflict:'reserva_id,tipo_documento,num_documento'` + `ignoreDuplicates` + recuperación id existente 200 (`route.ts:243-277`) + fallback constraint (`lib/db-constraints.ts:67`) |
| Validación laxa #65 | ✅ OK | `NUM_DOCUMENTO_SHAPE /^[A-Z0-9-]{3,32}$/` (`viajero-validation.ts:50`); soporte solo DNI/NIE (`:58`, `:358-363`), pasaporte exento |
| Skip titular #66 vs primer registro | ✅ OK | `shouldSaveTitular = dirty || !savedId` (`lib/registro-titular.ts:28-30`) — primer registro siempre guarda (savedId null) |
| Welcome-back Model 1 (#52) | ✅ OK | "Faltan N de M" i18n ×5 (`lib/i18n.ts:361,1760,3089,4410,5731`), "Entrar a la villa" fuera del gate del nudge (`page.tsx:1830-1841`) |
| Finalize 409 (NULL / incompleto) | ✅ OK | `finalize/route.ts:53-62, 82-95` — solo tocado por #51 |
| Gate NUKI `deriveNukiGate` | ✅ OK | COUNT vs numero_personas, fail-closed null/0 (`lib/nuki-gate.ts:59-80`); ningún commit posterior a #62 tocó los ficheros del gate (git verificado) |
| Proyección nukiCode (villa-server) | ✅ OK | Solo `nukiGate.nukiCode` al cliente (`villa-server.ts:281`); count error → 0 → cerrado (`:216`) |
| Fuga offline-essentials | ✅ OK (sigue tapada) | `doorCode = withheld ? null` (`offline-essentials/route.ts:109`) + tests de regresión (`tests/offline-essentials.test.ts:153-186`) |
| PIN login con roster incompleto | ✅ OK | Auth server-side `timingSafeEqual` (`app/acceso/actions.ts:122`); el gate solo oculta VISUALIZACIÓN — semántica correcta, verificada en vivo por Angel (SP-00003) |
| Barrido proyección nuki_code (18 apariciones, incl. código de hoy) | ✅ OK — 0 sin gate | Emails #32 sin código de puerta; crons #58 sin datos; chat Sofía lo excluye del select (`chat/route.ts:253-257`) |
| Seeds limpios | ✅ OK | `SEED-DO-NOT-USE` en ambos seeds; nota conocida: PIN `1234` en `tests/e2e/_stitch-audit.spec.ts:31` (decisión documentada de #62) |
| Redis fail-closed (#59) | ✅ OK | `git log 928221c..HEAD` sobre redis/magic-link/pin-rate-limit = vacío; residual (catch fail-open con Redis CONFIGURADO erroreando) sigue siendo el único hueco |
| session_version al mintear | ✅ OK | 3/3 caminos lo leen y embeben (`proxy.ts:146-158`, `app/acceso/actions.ts:98,130`, villa acceso `:72`) |
| instrumentation fail-fast + Sentry init | ✅ OK | Supabase+Upstash fail-fast intactos (`:85-97`); `sendDefaultPii:false` node+edge (`:160,187`); #60 fue aditivo |
| Sentry PII redact (#60) | ✅ OK | `redact()` en ambas rutas de reenvío (`lib/logger.ts:435-441`); endpoint #63 borrado del todo por #64 |
| Stripe sin tocar hoy | ✅ OK | 0 commits del día en la superficie de pago |
| Portal: superficie de regresión | ✅ OK — nula | Main solo movió #136 (SQL puro, 1 fichero); RLS/vistas intactas |
| #151 / #157 mergeables tras #136 | ✅ OK | `git merge-tree` exit 0 en ambas, sin conflictos |
| Migración #136 vs índice en BD | ✅ OK | `2026-07-05_viajeros_documento_unique.sql:54-55` = índice único plain 3 columnas, coincide con BD |
| Interacciones multi-PR (i18n, crons #58∩#32, registro ×4 PRs) | ✅ OK | i18n paridad 1216 claves ×5; GET delegante sobrevivió a #32 (22 rutas = 1 GET/1 POST); sin marcadores de conflicto |
| BD post data-reset | ✅ OK | `nuki_code='1234'`: 0 filas · `numero_personas NULL`: 0 filas · reservas=2, viajeros=2 (SP-00003 en vivo) |

**Una sola REGRESIÓN encontrada → V-01 (abajo).**

---

## 3 · HALLAZGOS NUEVOS

| ID | Repo | Evidencia | Problema | Riesgo | Modelo | Fix + criterio de aceptación |
|----|------|-----------|----------|--------|--------|------------------------------|
| **V-01** | guest-app | `proxy.ts:214` (matcher solo exime `api/acceso/*` y `api/health`) + `proxy.ts:179-194` (redirect 307 sin distinción de APIs) | **REGRESIÓN de #56**: el access gate intercepta `/api/cron/*` (22 rutas, llamadas por n8n con Bearer, sin cookie) y `/api/stripe/webhook` (firma HMAC, sin cookie) → 307 a `/acceso`. Cronología: los 405 que motivaron #58 son de las 11:00 UTC, ANTERIORES al merge de #56 (~12:47) — el próximo disparo de n8n chocará contra el gate, no contra el 405. El webhook Stripe aún no está registrado (Fase B), pero quedaría roto de serie. Runtime no verificable desde este entorno (HTTP saliente bloqueado); confirmable con `curl -H "Authorization: Bearer $CRON_SECRET" https://guests.…/api/cron/pre-arrival` → si 307, confirmado. | **CRÍTICO** (mata los 22 crons aunque Angel arregle n8n) | Opus 4.8 | Añadir `api/cron/.*` y `api/stripe/.*` a las exenciones del matcher + `isPublicPath` (su propia auth Bearer/firma los protege; el gate nunca fue pensado para server-to-server). Aceptación: GET cron con Bearer → 200/401 según token; webhook POST → llega al handler; visitante sin cookie a página → sigue 307. |
| **V-02** | guest-app | `instrumentation.ts:146-147` (register acepta `SENTRY_DSN ?? NEXT_PUBLIC_SENTRY_DSN`) vs `instrumentation.ts:208` (`onRequestError` solo `SENTRY_DSN`) y `lib/logger.ts:344` (`getSentry` solo `SENTRY_DSN`); el comentario `:142-145` recomienda setear SOLO la pública | **Sentry inerte en la config que el propio código recomienda**: con solo `NEXT_PUBLIC_SENTRY_DSN`, el SDK se inicializa pero ni `onRequestError` ni el reenvío del logger capturan nada. Explicación más probable del "DSN puesta y Sentry a 0". | ALTO | Sonnet 5 (+revisión rápida) | Alinear los 3 gates a `SENTRY_DSN ?? NEXT_PUBLIC_SENTRY_DSN` (o exigir ambas en docs). Aceptación: con solo la var pública, un error forzado aparece en Sentry con PII redactada. Interim para Angel: setear TAMBIÉN `SENTRY_DSN` (mismo valor) y probar. |
| **V-03** | guest-app | `lib/emails/_theme.ts:188` (placeholders literales), `shell()` los emite incondicionalmente (`:227`), `sendEmail()` sin ningún guard (`lib/email.ts:147-199`), 0 sustituciones en todo el repo | **H-26 confirmado y cuantificado**: los **16/16 templates** con footer envían `{{RAZON_SOCIAL}} · NIF {{NIF}} · {{DOMICILIO_SOCIAL}}` literales. Hoy no sale ningún email (n8n caído), pero en cuanto A6 se arregle, TODOS los emails reales saldrían con el footer sin rellenar. Prioritario PRE-n8n. | ALTO (pre-requisito de A6) | Sonnet 5 | Guard de render: omitir la línea fiscal del footer mientras los 3 valores no estén configurados (env/company_settings); jamás emitir un `{{`. Aceptación: email renderizado sin valores → footer sin línea fiscal ni llaves; con valores → línea completa. Los placeholders NO se rellenan (gated H-18) — solo se dejan de emitir. |
| **V-04** | portal | `components/admin/ReservaModal.tsx:401` + `app/api/reservas/route.ts:158` (persisten null), `route.ts:48-53` (validación solo si se aporta) | `numero_personas` puede quedar NULL al crear reserva desde admin (campo "Opcional") → dispara el fail-closed del gate NUKI y el 409 del finalize; el propio `lib/rd933-backstop.ts:79-94` lo lista como brecha. **Corrección al hallazgo previo**: el `nuki_code='1234'` queda REFUTADO — era el `placeholder` del input (`ReservaModal.tsx:725`), se persiste null. | MEDIO | Opus 4.8 (toca creación de reservas) | Hacer `numero_personas` obligatorio (UI + servidor) para reservas de inventario propio. Aceptación: crear reserva sin huéspedes → error de validación; OTA vía espejo no afectada. |
| V-05 | guest-app | `instrumentation.ts:208` | (Subsumido en V-02) `onRequestError` solo mira `SENTRY_DSN`. | — | — | Se cierra con V-02. |
| V-06 | guest-app | `lib/ses-soap-envelope.ts:38-47` | Mapeo SES completo sin huecos de código (5 tipos + default `X`), pero pendiente de conformidad: confirmar con el esquema del Ministerio que `X` (Otro) y `C` (carné) son aceptados — #65 enruta todos los docs UE a `OTRO→X`. Solo relevante al activar SES. | BAJO (futuro SES) | Angel + asesor | Confirmar códigos aceptados antes de `SES_ACTIVATED=true`. |
| V-07 | guest-app | `page.tsx:1486-1488` + proyección parcial `ExistingViajeroRow` | UX: en welcome-back, editar el titular obliga a re-teclear documento y soporte (la hidratación no los proyecta, por diseño de privacidad). Pre-existente, NO regresión de hoy. Sin corrupción de datos. | BAJO | Sonnet 5 (backlog) | Copy aclaratorio o proyección de últimos-4. |

**Notas informativas (sin acción):** ADMIN_PREVIEW_TOKEN resuelto — las 4 rutas son **fail-closed** en ambos escenarios (páginas → 404, APIs → 500 explícito si falta la var; ninguna OPERATIVA-ROTA; `email-preview/page.tsx:192-196`, `cron-status/page.tsx:164-168`, `ses-push/[viajeroId]/route.ts:57-70`, `rd933-invite/[reservaId]/route.ts:62-79`) · duplicación semántica i18n `rootAcceso*` vs `acceso*` (dos pantallas, a vigilar) · 3 `eslint-disable` solo en script de preview.

**Runtime del día:** beds24-reconcile verde (16:00 UTC) · producción sin tráfico significativo esta tarde → el 405→200 de #58 y el estado real de n8n quedan NO VERIFICABLES hasta el próximo disparo (11:00 UTC) — que ahora chocará con V-01 · Sentry a 0 eventos, consistente con "cero errores en prod" pero V-02 predice que seguirá a 0 incluso con errores si solo está la var pública.

---

## 4 · LISTA CORTA PARA VERDE TÉCNICO (en orden)

1. **V-01 — exenciones del gate para `/api/cron/*` + `/api/stripe/webhook`** (PR guest-app, Opus + revisión). Sin esto, arreglar n8n no sirve de nada.
2. **V-03 — guard del footer fiscal** (PR guest-app, Sonnet). Antes de que n8n dispare emails reales.
3. **A6-infra — revivir el workflow n8n en Railway** (Angel; sigue disparando ~2 de ~24). Verificación: cada cron con una llamada 200 en 24h.
4. **V-02 — alinear gates de DSN + un error forzado** (PR mínimo guest-app, Sonnet; y Angel: setear también `SENTRY_DSN`). Cierra A9 con evidencia.

Con esas 4, el semáforo OTA técnico pasa a **VERDE** (los smokes de Angel de hoy ya cubrieron registro end-to-end, NUKI y health). Paralelo no-código: merges #151→#157 y #35 (legal), H-18.

## 5 · LO QUE NO SE TOCA

Sin cambios respecto a la auditoría original: `SEDA_FLAG_IRNR_RETENEDOR` (intacto, re-verificado indirectamente — nadie tocó el portal hoy salvo SQL) · reservas OTA read-only · `email-shell.ts`/kit (los placeholders fiscales NO se rellenan — V-03 solo deja de emitirlos, gated H-18) · `MOTOR_RESERVAS` OFF hasta las 4 condiciones H-02 · inconsistencias de color documentadas.

**Reglas vigentes:** Angel mergea todo · SQL manual en Studio · dinero/auth pasa revisión Opus · un PR = un repo.
