# GATE DE IDENTIDAD LEGAL — VALIDEZ, NO PRESENCIA

**MODEL:** Sonnet
**EFFORT:** low
**SESIÓN:** Continuar en la sesión ya abierta en `seda-web` — la que creó este fichero. No abras una segunda sesión contra este repo: fue exactamente lo que rompió catorce rutas de admin en producción durante hora y media en julio. `seda_os` puede estar ocupado con la cola de prompts (ALARMA-CADUCADA, CORREOS-DIRECCIONES-FANTASMA, PWA-SERVICE-WORKER). No abras nada ahí desde esta sesión.
**Repo:** `C:\Users\AngelMolina\seda-web`
**Rama:** `fix/gate-identidad-legal`

---

## 0. Antes de tocar nada

```bash
cd /c/Users/AngelMolina/seda-web && git rev-parse --show-toplevel
gh pr list --state open
git pull
```

Confirma que el toplevel es `seda-web` y no otro repo. Los tres repos comparten numeración de PR y `gh` opera en silencio sobre el equivocado.

---

## 1. El defecto, verificado

El 16 de agosto de 2026 estas dos páginas están publicadas en producción con placeholders visibles:

- `https://sedaprivatehomes.com/aviso-legal` → sección 01, campos `NIF` y `Domicilio`
- `https://sedaprivatehomes.com/privacidad` → sección 01, mismos campos

Valores servidos literalmente al visitante:

```
NIF        TU_NIF_CON_LETRA
Domicilio  TU_DOMICILIO_COMPLETO_CON_CP_Y_PROVINCIA
```

Fecha declarada de última actualización en ambas: 6 de agosto de 2026. Llevan diez días así.

`components/legal-document.tsx:149` documenta el invariante como «Campos de identidad sin rellenar. Siempre vacío en producción» y el bloque de aviso (líneas 159-171) promete que `next build` falla a propósito si falta algún campo. **Ese invariante es falso y el build no ha fallado.**

Causa raíz: la comprobación mide **presencia**, no **validez**. Un placeholder es una cadena no vacía, así que pasa el gate. Es el mismo patrón de fallo que el DSN de Sentry (el gate comprobaba que existiera, no que fuera válido).

Defecto secundario: `legal-document.tsx:166` remite al operador a `lib/legal/entity.ts`, pero el fichero de datos que existe es `lib/legal/identidad.json`. Uno de los dos está mal.

---

## 2. Fuera de alcance

- **No rellenes `NIF` ni `Domicilio`.** Esos valores los introduce Ángel. Si los inventas, publicas datos identificativos falsos.
- **No toques el copy legal.** Los textos de aviso legal, privacidad y cookies están redactados y revisados. Este trabajo es solo el gate.
- **No mergees.** Ángel es el único que fusiona, siempre con `gh pr merge --squash`.
- No cambies el diseño ni los tokens del componente.

---

## 3. Trabajo

### 3.1 Inventario

Lista `lib/legal/` completo. Determina qué fichero es la fuente real de identidad y si `entity.ts` existe o es una referencia muerta. Documenta el hallazgo en el cuerpo del PR con rutas y números de línea.

### 3.2 Validador

Un único módulo que valide la identidad y sea la fuente de verdad para todas las páginas legales. Reglas mínimas por campo:

| Campo | Regla |
|---|---|
| `titular` | No vacío, al menos dos palabras |
| `nif` | Formato DNI (8 dígitos + letra) o NIE (X/Y/Z + 7 dígitos + letra), **con letra de control verificada** |
| `domicilio` | No vacío, contiene un código postal de 5 dígitos y una provincia |
| `email` | Formato de correo válido |
| `telefono` | Formato internacional con prefijo |

Sobre todos los campos, además, una regla transversal de placeholder: se rechaza cualquier valor que empiece por `TU_`, que contenga `XXX`, `TODO`, `PENDIENTE`, `LOREM`, `PLACEHOLDER`, o que esté enteramente en mayúsculas con guiones bajos. Esta regla es la que habría detenido el defecto actual, así que escríbela primero.

El validador devuelve la lista de campos inválidos **con el motivo**, no solo el nombre del campo. «nif: parece un placeholder» es accionable; «nif» no lo es.

### 3.3 Que el build falle de verdad

Comprobar en render no basta: si la ruta se prerenderiza y el fallo solo pinta un aviso, el despliegue sale igualmente. Añade la validación como paso previo de build en `package.json` (`prebuild`, o equivalente), ejecutable en Node puro, con salida distinta de cero y mensaje legible listando campo y motivo.

Verifica que el fallo se propaga: un `prebuild` que falle debe abortar `next build`, no solo imprimir en consola.

Mantén también el aviso en pantalla en desarrollo. Es útil.

### 3.4 Tests

- Identidad válida pasa.
- Cada regla de placeholder falla, una por caso.
- El valor exacto `TU_NIF_CON_LETRA` falla.
- Un NIF con letra de control incorrecta falla.
- Un campo vacío falla.

### 3.5 Coherencia

Corrige la referencia a `entity.ts` para que apunte al fichero real. Corrige o elimina el comentario «Siempre vacío en producción», que era una afirmación no verificada.

---

## 4. Criterios de aceptación

1. Con la identidad actual del repo (placeholders incluidos), `npm run build` **falla** e imprime qué campo y por qué.
2. Sustituyendo los placeholders por valores válidos de prueba en local, el build pasa. Revierte ese cambio antes de commitear.
3. Los tests del 3.4 pasan.
4. Ninguna diferencia en el copy legal renderizado.
5. El PR explica en su cuerpo la causa raíz (presencia vs validez) y qué ficheros tocó.

---

## 5. Verificación

CI en verde demuestra consistencia interna, no corrección. La comprobación real es de dos partes:

**Local, antes del PR:** deja el placeholder puesto, ejecuta `npm run build`, y pega en el PR la salida del fallo. Si el build pasa, el trabajo no está hecho.

**Producción, después del merge y del deploy** (esto lo ejecuta Ángel, no tú):

```bash
curl -s https://sedaprivatehomes.com/aviso-legal | grep -c "TU_NIF"
curl -s https://sedaprivatehomes.com/privacidad | grep -c "TU_NIF"
curl -s https://sedaprivatehomes.com/cookies | grep -ci "placeholder\|TU_"
```

Los tres deben devolver `0`.

---

## 6. Cierre de sesión

«No mergees» no significa «no termines». Antes de cerrar, deja el trabajo con commit, push y PR abierta, y verifícalo:

```bash
git status
git log --oneline -5
git branch --show-current
git log origin/fix/gate-identidad-legal --oneline -1
gh pr list --state open --head fix/gate-identidad-legal
```

Si alguno de los cinco no confirma lo esperado, la sesión no ha terminado.

---

## Resumen para el cierre

**MODEL:** Sonnet · **EFFORT:** low · **SESIÓN:** continuar en la ya abierta en `seda-web`

Endurecer el gate de identidad legal para que valide contenido y no solo presencia, de modo que un placeholder no pueda volver a publicarse. Dos páginas legales llevan diez días en producción mostrando `TU_NIF_CON_LETRA`. No rellenar los datos reales, no tocar el copy, no mergear.

**Acción de Ángel, independiente de esta sesión y anterior en urgencia:** rellenar `nif` y `domicilio` en `lib/legal/identidad.json` con los valores reales y desplegar. El gate evita la reincidencia; no arregla lo que ya está publicado.
