# Pendiente de instalar — `npm test` en el job `verify` de CI

`.github/workflows/**` está denegado a las sesiones de Claude Code, así que este
cambio lo aplica Ángel a mano en `.github/workflows/ci.yml`.

## ⚠️ LEE ESTO ANTES DE APLICAR: NO RENOMBRES EL JOB

El job se llama, y **debe seguir llamándose exactamente**:

```
verify (legal + leak-scan + lint + tsc + build)
```

Ese texto **es el nombre del check requerido en el ruleset de `main`** (ruleset
`web`, activo). Al añadir tests el nombre queda incompleto y la tentación será
actualizarlo a «… + tests + build». **No lo hagas.** Si el `name:` cambia sin
actualizar el ruleset a la vez, la protección de rama se queda esperando un check
que ya no existe y **`main` se bloquea para todos los PR**.

El diff de abajo **añade un paso y no toca `name:`**. Un nombre algo incompleto es
un defecto cosmético; un ruleset huérfano bloquea el repo.

Si algún día se quiere el nombre nuevo: primero añadir el contexto nuevo al
ruleset, luego renombrar el job, luego retirar el antiguo. Nunca en un solo paso.

## El diff

Entre `Typecheck (tsc --noEmit)` y `Production build (next build)`:

```diff
       - name: Typecheck (tsc --noEmit)
         run: npx tsc --noEmit

+      - name: Tests (vitest)
+        run: npm test
+
       - name: Production build (next build)
         run: npm run build
```

Opcional, en el bloque de comentarios de cabecera, una línea que diga que los
tests corren aquí aunque el nombre del job no lo diga, y por qué no se ha
renombrado.

## Qué mide y qué no en CI

- **Sí mide:** `isValidEmail`, el rate limit y los límites de tamaño de
  `/api/contact`, y `checkLock` (la huella de `invariantes.lock.json`).
- **No mide, por diseño:** el test de `--parity` busca los tres repos como
  directorios hermanos; en CI hay uno solo, así que se declara «no hay nada que
  comparar» y pasa sin comparar. No es cobertura de CI; sólo diagnóstico local.

`npm run build` **no** ejecuta los tests: un test rojo no debe tumbar un despliegue
de Vercel. Los tests sólo bloquean el merge, vía este paso.
