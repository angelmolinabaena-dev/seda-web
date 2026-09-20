# Pendiente de instalar — `compartidos:check` en CI

`.github/workflows/**` está denegado a las sesiones de Claude Code, así que este
cambio lo aplica Ángel a mano en `.github/workflows/conflict-markers-check.yml`.

## ⚠️ LEE ESTO ANTES DE APLICAR: NO RENOMBRES NINGÚN JOB

Los tres nombres de job de este repo **son los tres contextos requeridos en el
ruleset `web` de `main`** (activo, confirmado el 19-sep-2026 contra la API):

```
verify (legal + leak-scan + lint + tsc + build)
conflict-markers (marcadores de merge sin resolver)
invariantes (reglas compartidas presentes)
```

**Ninguno se renombra.** Si un `name:` cambia sin actualizar el ruleset a la vez,
la protección de rama se queda esperando un check que ya no existe y **`main` se
bloquea para todos los PR**. El diff de abajo **añade un paso y no toca ningún
`name:`**. Para cambiar un nombre: primero añadir el contexto nuevo al ruleset,
luego renombrar el job, luego retirar el antiguo. Nunca en un solo paso.

## Dónde: el job `invariantes`, no `verify`

Elegido el job `invariantes (reglas compartidas presentes)` de
`conflict-markers-check.yml`, por tres razones:

1. **Es temáticamente el sitio.** Ya corre `invariants-check.mjs`, el hermano
   directo: los dos comprueban «lo que los tres repos deben decir igual».
2. **Ya está aislado y barato.** No hace `npm ci` ni `setup-node`; `compartidos-check.mjs`
   solo importa built-ins de node y `invariants-check.mjs`, así que no necesita nada
   más y corre en segundos.
3. **`verify` es el job caro y el más tocado.** Meter ahí una comprobación de
   ficheros sin dependencias la ata a `npm ci` + build sin ganar nada, y hace que un
   fallo de paridad quede tras lint/tsc en vez de ser una señal propia.

Contra: el sitio no es el de «donde ya vive el resto» (`verify`). Si se prefiere
ahí, el paso es el mismo, tras `Identidad legal (check:legal)`, con
`run: npm run compartidos:check`.

## El diff

Al final del job `invariants`, tras `Invariantes compartidos (presencia)`:

```diff
@@ -89,3 +89,10 @@
       # de contenido entre los tres repos) es local: `npm run invariants:parity`.
       - name: Invariantes compartidos (presencia)
         run: node scripts/invariants-check.mjs
+
+      # Guardarraíl compartidos — lo que los tres repos deben decir igual
+      # (tabla PATTERNS, invariantes.lock.json, .gitattributes) contra
+      # compartidos.lock.json. Aquí aplican 3 de 4: health-check.mjs no, porque
+      # seda-web no publica /api/health. Solo node built-ins: no hace falta npm ci.
+      - name: Compartidos entre repos (huellas)
+        run: node scripts/compartidos-check.mjs --repo=seda-web
```

`--repo=seda-web` es explícito a propósito: sin él el repo se deduce del nombre del
directorio (`basename`), que en un runner es `seda-web` pero no es una garantía.

## Ensayos sobre este diff

Hechos el 20-sep-2026 sobre el blob de `HEAD` (no el working tree, que está en CRLF) con el paso añadido:

| ensayo | resultado |
|---|---|
| Parseo YAML (`js-yaml`) del fichero resultante | OK, jobs = `conflict-markers`, `invariants` |
| `name:` de los dos jobs y del workflow, antes vs después | **idénticos** |
| Job `conflict-markers` y pasos previos de `invariants`, antes vs después | **idénticos** (`JSON.stringify` igual) |
| `run:` extraído del YAML == `node scripts/compartidos-check.mjs --repo=seda-web` | byte a byte, sí |
| `bash -n` sobre ese cuerpo extraído | OK |
| Sin heredoc, una sola línea | sí |
| Ejecutar el `run:` extraído en este checkout | exit 0, «Recalcula (3)», «✓ coincide» |

## Qué comprueba y por qué salen tres

`invariantes.lock.json`, la tabla PATTERNS de `keys-check-leak.mjs` y la línea
`scripts/*.mjs text eol=lf` de `.gitattributes`. **`scripts/health-check.mjs` no
aplica a este repo**: no publica `/api/health` y su universo en
`compartidos-check.mjs` lo excluye a propósito. No se añade para «cuadrar cuatro».
