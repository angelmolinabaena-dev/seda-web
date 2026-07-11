# FASE A — ITERACIONES EJECUTADAS (loop 2026-07-10)

**Orquestador: Claude Fable 5 · Ejecutores: Opus 4.8 (dinero/auth/legal) y Sonnet 5 (bajo riesgo) · Revisión Opus sobre todo diff de dinero/auth.**

Registro de cierre por iteración con evidencia. Los PRs quedan en borrador: **Angel mergea todo**.

| It. | Hallazgo | Entregable | Verificación | Revisión Opus |
|-----|----------|------------|--------------|---------------|
| A1a | H-05 scan OCR roto | **Ya estaba cerrado en main** (fix #49, 4-jul 11:32 UTC; los fallos de prod eran de las 11:04). Sin PR nuevo. | Logs Vercel 7d: cero `scan_document.failed` post-fix. Pendiente: 1 smoke real de Angel. | n/a |
| A1b | H-04 columna ausente | **✅ CERRADO 2026-07-11** — Angel ejecutó el SQL en Studio | Verificado por query 08:55 UTC: `verificacion_omitido_at` ✓, `verificacion_omitido_ip` ✓, índice `idx_reservas_omitido` ✓, CHECK recreado con los 5 valores ✓. Vercel: 0 errores en 24h (sin `PGRST204`) | n/a (SQL manual) |
| A2 | H-07 privacidad falsa | **PR guest-app #35 des-conflictuado** (merge `3416463` pusheado a su rama; preservados anyOf del scan + SES1a + auditoría PII) | `tsc` 0 err · vitest **1157/1157** | El diff original ya era del PR; el merge se validó con suite completa |
| A4 | H-08 gate factura | **PR portal-propietarios #157** — `assertFacturacionLive()` fail-closed en las 3 vías de emisión + flag `SEDA_FLAG_FACTURACION_LIVE` + bloqueo NIF ficticio | `tsc` 0 err · 59 tests de área · suite 1314 pass / 7 fail preexistentes (#151) | **APTO** (2 LOW cosméticos anotados en el PR) |
| A5 | H-09 Redis fail-open | **✅ CERRADO 2026-07-11** — PR #59 mergeado por Angel (Upstash provisionado ANTES, orden correcto) | Deploy prod `928221c` READY 12:25 UTC; peticiones reales 200 a las 12:28-12:29 con instrumentation limpio → fail-fast pasado = vars Upstash presentes en Production | **APTO CON CAMBIOS → aplicados** (`dc08cce`) |
| A6 | H-13 crons n8n | **PR guest-app #58** — GET-delegate en las 8 rutas sin export GET + test de delegación. **Hallazgo mayor**: el scheduler n8n está caído (solo 2 llamadas en 26h, ambas 405) | `tsc` 0 err · vitest **1144/1144** · preview Ready | Sonnet + evidencia runtime; sin dinero/auth |
| A9 | H-14 Sentry ciego | **PR guest-app #60** — el cableado logger→Sentry YA existía en main (premisa de la auditoría corregida); se cierra un **bug de PII** (`captureError` enviaba fields sin redactar a Sentry) + `sendDefaultPii:false` en los 3 runtimes. Falta solo el DSN (Angel) | `tsc` 0 err · vitest **1146/1146** | Ejecutor Opus + diff verificado por el orquestador |

## Correcciones a la auditoría original (hechas por los ejecutores)

- **H-09**: `magic_link_consumptions=0` NO era evidencia de Redis ausente — es una tabla huérfana del diseño pre-Redis (candidata a `DROP`, post-venta).
- **H-05**: ya estaba resuelto en main antes de arrancar el loop; la auditoría lo capturó entre el incidente y el deploy del fix.
- **A6**: el problema de los crons no era solo "verificación pendiente": el scheduler está efectivamente caído (2/24 endpoints llamados, método incorrecto).
- **H-14/A9**: el cableado logger→Sentry ya existía en main (PL-016); lo que falta es solo el DSN en Vercel. El hallazgo real de la iteración fue un bug de PII en `captureError` (corregido en #60).

## Orden de merge sugerido (todo tuyo)

1. portal **#151** (test-only, pone verde el CI del portal)
2. portal **#157** (gate factura — CI verde tras #151)
3. guest-app **#58** (crons GET) → después revisar workflow n8n
4. Upstash provisionado → guest-app **#59** (sin las vars, el deploy de prod rehúsa arrancar — a propósito)
5. guest-app **#35** (privacidad — tras tu revisión legal)
6. Cadena RD933: SQL índice #136 en Studio → portal #136 → guest-app #51 → #53 → #52

## Residuales aceptados y documentados

- A5: con Redis configurado pero erroreando, el burn falla en abierto (degradar > lockout total); único hueco de replay restante, exige poseer ya un token válido.
- A4: gate en capa de aplicación (no BD); un call-site futuro que salte las 3 funciones no está impedido por constraint — anotado como hardening futuro.
