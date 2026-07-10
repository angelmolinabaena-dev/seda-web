# FASE A — PASOS MANUALES DE ANGEL (loop 2026-07-10)

**Orquestador: Claude Fable 5 · Esfuerzo ALTO.** Cada paso indica su hallazgo de origen (HALLAZGOS_ESTADO_2026-07-10.md) y el criterio de verificación que el loop ejecutará después de que confirmes ejecución.

---

## A1 · SQL en Supabase Studio — columnas de skip-verification (H-04)

Ejecuta tal cual el contenido de `guest-app/supabase/migrations/reservas_skip_verification_audit.sql` (verificado por el loop contra la BD live el 2026-07-10: `verificacion_estado` es nullable con default `'pendiente'` y el CHECK actual solo permite `pendiente|completo`; la migración lo sustituye por los 5 valores y añade las 2 columnas + índice. Idempotente).

```sql
ALTER TABLE reservas
  ADD COLUMN IF NOT EXISTS verificacion_omitido_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verificacion_omitido_ip TEXT;

DO $$
DECLARE
  cname TEXT;
BEGIN
  SELECT conname INTO cname
    FROM pg_constraint
   WHERE conrelid = 'reservas'::regclass
     AND contype  = 'c'
     AND pg_get_constraintdef(oid) ILIKE '%verificacion_estado%';

  IF cname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE reservas DROP CONSTRAINT %I', cname);
  END IF;

  ALTER TABLE reservas
    ADD CONSTRAINT reservas_verificacion_estado_chk
    CHECK (verificacion_estado IS NULL OR verificacion_estado IN
      ('pendiente', 'completo', 'fallido', 'requires_input', 'omitido_por_huesped'));
END$$;

CREATE INDEX IF NOT EXISTS idx_reservas_omitido
  ON reservas (verificacion_omitido_at DESC)
  WHERE verificacion_estado = 'omitido_por_huesped';
```

**Verificación del loop tras tu confirmación:** query de columna + prueba del endpoint `skip-verification` sin `PGRST204`.

Nota A1-bis: la otra mitad de A1 (scan OCR roto) **ya estaba cerrada** — fix #49 mergeado el 4-jul 11:32 UTC, posterior a los últimos fallos (11:04 UTC). Solo queda tu smoke: un escaneo real de DNI en prod sin error.

---

## A3 · Gates RD933 — orden estricto de aplicación (H-06)

1. **PRIMERO** SQL en Studio: migración del PR portal-propietarios **#136** (`supabase/migrations/...viajeros_documento_unique.sql` de la rama `feat/rd933-viajeros-documento-unique`): índice único `(reserva_id, tipo_documento, num_documento)`. El propio fichero trae la query de pre-verificación de duplicados (el 5-jul dio 0 filas).
2. Merge **#136** (portal-propietarios).
3. Merge guest-app **#51** (gate de completitud), luego **#53** (upsert idempotente de acompañantes).
4. **#52** está stacked sobre #51: tras mergear #51, GitHub lo retargetea a main solo; revisa el diff residual y mergea.

**Verificación del loop:** re-add del mismo documento → 200 idempotente con una sola fila; finalizar con roster incompleto → 409.

---

## A6 · n8n/Railway — el scheduler está efectivamente CAÍDO (evidencia nueva)

Evidencia de producción (logs Vercel, 26 h hasta 2026-07-10 11:57 UTC):
- **Solo 2 llamadas cron en total**: `GET /api/cron/post-stay-review` y `GET /api/cron/post-stay-thank-you` a las 11:00 UTC.
- **Ambas 405** (Method Not Allowed): n8n llama con GET y esas rutas solo exportan POST.
- **Los otros ~20 crons no recibieron ninguna llamada** en 26 h.

Acción tuya en n8n (Railway):
1. Abrir el workflow "SEDA — Crons guest-app (v2 simple)" y comprobar por qué solo dispara 2 endpoints (¿workflow desactivado a medias? ¿instancia dormida? ¿nodos borrados?).
2. Cambiar el método de los nodos HTTP Request a **POST** (o esperar el PR del loop que añade GET-delegate a las 8 rutas que no lo tenían — ambas cosas son compatibles; con el PR mergeado, GET también vale).
3. Confirmar `Authorization: Bearer <CRON_SECRET>` en la credencial.

**Verificación del loop:** en 24 h, cada cron con al menos una llamada 200 en logs de Vercel (o sellados `*_sent_at` donde haya reservas que apliquen).

---

## A7 · Gate ANTHROPIC_API_KEY (H-12)

Desde tu navegador (el entorno del loop tiene el HTTP saliente a prod bloqueado):
`https://guests.sedaprivatehomes.com/api/health` → debe dar `ai_provider.ok: true`.
Si da `false`: rotar/re-set `ANTHROPIC_API_KEY` en Vercel (proyecto guest-app, scope Production) y re-comprobar. Con eso se cierra el ítem 3 de `docs/PENDING_GATE.md`.

---

## A8 · Data-reset sesión 2 (H-19)

El plan aprobado en sesión 1 está en el PR portal-propietarios **#127** (rama `data-reset/plan`, script `scripts/data-reset-2026-07.sql`; backup verificado de 1.149 filas ya generado en tu máquina el 2026-07-02).
1. Revisar las 3 DECISIONES marcadas en el PR (gastos_seda, limpiadoras, auth user admin — default CONSERVAR las tres).
2. Ejecutar el script en Studio (transacción única).
3. Confirmar al loop para la verificación post (queries de conteo + smoke de empty states).

⚠️ Si desde el 2-jul ha entrado algún dato real nuevo, regenerar backup antes (el script borra por listas cerradas, pero el backup es del 2-jul).

---

## A9 · Sentry (H-14) — parte tuya

- **guest-app no tiene DSN**: crear proyecto "guest-app" en la org Sentry `seda-private-homes` (región DE/EU) y `vercel env add SENTRY_DSN production` en el proyecto guest-app. El código ya se auto-activa con la var (`instrumentation.ts`, plantilla Sprint K).
- El pipeline del portal funciona (el smoke `SENTRY_CHECK_EU` del 5-jul llegó), pero en 90 días es EL ÚNICO evento: los errores reales van por `lib/logger.ts` a logs de Vercel y no se lanzan como excepciones. El cableado logger→Sentry es una iteración de código del loop (queda en backlog A9-código).

**Verificación del loop:** error forzado de prueba visible en Sentry para cada app, con PII scrubbing intacto.
