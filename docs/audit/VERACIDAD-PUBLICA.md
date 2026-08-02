# Auditoría de veracidad pública — seda-web

**Fecha:** 2026-08-01
**Repo:** `seda-web` (sedaprivatehomes.com) · rama `claude/seda-web-audit-fiscal-ea9006`
**Alcance:** toda cifra, referencia normativa y afirmación comparativa servida al público.
**Modelo:** Opus 5 · esfuerzo alto.
**Auditoría previa:** ninguna. Este es el primer documento de `docs/audit/` en este repo.

> **Estado del registro (actualizado 2026-08-02, rama `claude/seda-commission-guarantees-metrics-740314`):**
> Ángel ha decidido sobre las entradas `PENDIENTE_ÁNGEL` de §7 y las decisiones están
> aplicadas. **El cierre ficha por ficha está en §10.** §1–§9 se conservan tal cual
> quedaron el 2026-08-01: son el estado *previo* a la corrección y sirven de contraste.
> Ocho de las diez entradas de §7 quedan `RESUELTA`; dos siguen `PENDIENTE_ÁNGEL` con
> motivo concreto.

> **Criterio aplicado:** una afirmación es `CORRECTO` solo si es reproducible desde
> el código o desde una fuente primaria citable. «Suena razonable» no es CORRECTO;
> es `NO_TRAZABLE`. No se ha inventado criterio fiscal en ningún punto: cuando la
> respuesta exigía norma, la entrada se marca `PENDIENTE_ÁNGEL`.

---

## 0. Resumen ejecutivo

| Estado | Nº |
|---|---|
| `CORRECTO` | 6 |
| `ERRÓNEO` | 4 |
| `NO_TRAZABLE` | 12 |

**Tres conclusiones que condicionan todo lo demás:**

1. **El sitio se contradice a sí mismo sobre el tamaño de SEDA.** `/founding-owners`
   declara «2 propietarios en programa». `/propietarios` declara «cartera SEDA Q4 2025
   vs Costa del Sol compset (**12.480 reservas analizadas**)» y «Más del **60%** de los
   propietarios SEDA son no residentes». Con n=2 propietarios, ni el compset de 12.480
   reservas ni el porcentaje del 60% pueden existir. Todas las métricas de rendimiento
   del sitio (+24% RevPAR, +12% pricing, 99,98% uptime) cuelgan de esa cartera
   inexistente. Es el hallazgo de mayor exposición del repo.

2. **Se publican cuatro tasas de comisión implícitas distintas, ninguna igual al 22% pactado.**
   18% (mockup de liquidación), 19% (`/meet`, `/founding-owners`), 25% (simulador de
   ingresos), y «sobre ingresos **netos**» vs «sobre ingresos **brutos**» según la página.
   Ver §3.

3. **El defecto ×4 del Modelo 238 no está en este repo.** Está en
   `seda_os/lib/savings-calculator.ts:231`, detrás de auth en `/portal/comparativa`.
   Confirmado y con root cause identificado (§5), pero **no es corregible desde un PR de
   `seda-web`**: son repositorios git distintos. Parche listo para aplicar en §5.4.

---

## 1. Inventario de afirmaciones

Barrido sobre `messages/{es,en,fr,de}.json` (880 claves × 4 idiomas, **paridad
verificada al 100%**: 0 claves divergentes) + literales hardcodeados en `app/` y
`components/`.

> **Nota de alcance:** el repo tiene **4 idiomas** (`es`, `en`, `fr`, `de`) —
> ver [i18n/routing.ts:11](../../i18n/routing.ts). El encargo mencionaba 5. No existe
> `it` en este repo. No hay divergencia de contenido entre idiomas: cada afirmación
> listada abajo aparece en los 4, salvo donde se indique.

### 1.1 Cifras de rendimiento y comparativas

| fichero:línea | idioma | afirmación literal | tipo |
|---|---|---|---|
| [messages/es.json:349](../../messages/es.json) `prop.hero.citation` | ×4 | «Datos · cartera SEDA Q4 2025 vs Costa del Sol compset (12.480 reservas analizadas)» | comparativa |
| `messages/*.json` `prop.hero.stat.revpar` | ×4 | «+24% RevPAR vs mercado» | comparativa |
| [propietarios/page.tsx:915](../../app/[locale]/propietarios/page.tsx) | hardcoded | `["+24%", …]` (repetición del claim en sección final) | comparativa |
| `messages/*.json` `prop.marketing.pricing_delta` | ×4 | «↑ 12% vs baseline» | comparativa |
| `messages/*.json` `prop.os.kpi.ingresos_d` | ×4 | «+12% vs prev.» | cifra |
| `messages/*.json` `home.dashboard.kpi.ocupacion_sub` | ×4 | «+6 pts vs. mes anterior» | cifra |
| `messages/*.json` `prop.arch.stats.uptime_v` | ×4 | «99,98%» (uptime) | cifra |
| `messages/es.json` `prop.marketing.conv_body` | ×4 | «Mejora media de listings SEDA frente a baseline del mercado» | comparativa |
| `messages/*.json` `prop.faq.items.q4.a` | ×4 | «Más del 60% de los propietarios SEDA son no residentes» | cifra |

### 1.2 Comisión y economía del propietario

| fichero:línea | idioma | afirmación literal | tipo |
|---|---|---|---|
| [propietarios/page.tsx:238](../../app/[locale]/propietarios/page.tsx) | n/a (código) | `annualNet = annualGross * 0.75` → comisión implícita **25%** | cifra |
| [propietarios/page.tsx:125](../../app/[locale]/propietarios/page.tsx) | hardcoded | «€ 10.890 / − € 1.960 / − € 510» → comisión implícita **18,0%** | cifra |
| [meet/page.tsx:86](../../app/[locale]/meet/page.tsx) (+120, 154, 188) | es/en/fr/de | «5 plazas · 3 disponibles · **19% comisión** durante 24 meses» | cifra |
| [founding-owners/page.tsx:45](../../app/[locale]/founding-owners/page.tsx) | ×4 | «Una comisión fija sobre **ingresos netos**» | cifra |
| `messages/*.json` `faq.owners_items.q2.a` | ×4 | «comisión sobre **ingresos brutos**» | cifra |
| [propietarios/page.tsx:236](../../app/[locale]/propietarios/page.tsx) | n/a (código) | `annualGross = (occ/100) * 365 * adr` | cifra |
| `messages/*.json` `prop.sim.disclaimer` | ×4 | «Estimaciones basadas en compset histórico Costa del Sol 2023–2025 y modelo SEDA OS» | comparativa |

### 1.3 Referencias normativas

| fichero:línea | idioma | afirmación literal | tipo |
|---|---|---|---|
| `messages/*.json` `prop.trust.items.m179.b` | ×4 | «Modelo 179/238, según normativa vigente» | norma |
| `messages/*.json` `prop.faq.items.q3.a` | ×4 | «Modelo 179/238, según normativa vigente … SES.Hospedajes (RD 933/2021) … Para no residentes (IRNR), **nuestro equipo fiscal** genera la documentación y le soporta en la presentación» | norma |
| `messages/*.json` `prop.trust.items.rd.t` / `.b` | ×4 | «RD 933/2021» · «Registro de viajeros integrado, preparado para SES.Hospedajes» | norma |
| `messages/*.json` `prop.trust.items.irnr.t` | ×4 | «**Liquidación IRNR**» | norma |
| `messages/*.json` `prop.arch.mod.finanzas.body` | ×4 | «IRNR y reporting fiscal **trimestral**» | norma / plazo |
| `messages/*.json` `guestapp.features.items.compliance_b` | ×4 | «RD 933/2021 · SES Hospedajes · firma digital» | norma |
| `messages/*.json` `faq.owners_items.q6.q` | ×4 | «Cumplimiento fiscal? Informativas AEAT, RD 933, IRNR» | norma |
| [founding-owners/page.tsx:49](../../app/[locale]/founding-owners/page.tsx) | ×4 | «RD 933/2021, **Modelo 179**, IRNR para no residentes. Lo gestionamos todo. **Cero multas** y cero sorpresas con Hacienda o Interior» | norma / comparativa |
| [founding-owners/page.tsx:35,48](../../app/[locale]/founding-owners/page.tsx) | ×4 | «cumplimiento legal **100%**» | comparativa |
| [meet/page.tsx:75](../../app/[locale]/meet/page.tsx) | ×4 | «RD 933/2021, **Modelo 210 trimestral** y SES.HOSPEDAJES» | norma / plazo |

### 1.4 Credenciales

| fichero:línea | idioma | afirmación literal | tipo |
|---|---|---|---|
| [founding-owners/page.tsx:35,53](../../app/[locale]/founding-owners/page.tsx) | ×4 | «8 años en Iberostar + Les Roches MHM» | cifra |
| [founding-owners/page.tsx:36](../../app/[locale]/founding-owners/page.tsx) | ×4 | «2 propietarios en programa» / «Quedan 3 plazas fundadoras» | cifra |

---

## 2. Verificación — entradas `CORRECTO`

| # | Afirmación | Reproducción | Estado |
|---|---|---|---|
| C-01 | Mockup de liquidación cuadra internamente | 10.890 − 1.960 − 510 = **8.420** = valor mostrado | `CORRECTO` |
| C-02 | «5 plazas · 3 disponibles» vs «2 propietarios en programa» | 2 + 3 = 5 ✅ coherente entre `/meet` y `/founding-owners` | `CORRECTO` |
| C-03 | `annualGross = (occ/100) × 365 × adr` | Fórmula RevPAR anual estándar. 0,72 × 365 × 1.450 = **381.060 €**, coincide con lo renderizado. Aritmética correcta. | `CORRECTO` |
| C-04 | «Modelo 179/238, según normativa vigente» | Formulación cubierta: no fija cuál está vigente. Coherente con la sustitución 179→238 (RD 117/2024). | `CORRECTO` |
| C-05 | «RD 933/2021 · SES.Hospedajes · registro de viajeros» | Referencia normativa correcta y no sobredimensionada («preparado para la comunicación», no «comunicamos»). | `CORRECTO` |
| C-06 | Paridad i18n de las 880 claves × 4 idiomas | Verificado programáticamente: 0 claves faltantes, 0 sobrantes. Ninguna afirmación existe en un idioma y no en otro. | `CORRECTO` |

---

## 3. Verificación — entradas `ERRÓNEO`

### E-01 · El simulador ignora 4 de sus 6 entradas

**Fichero:** [app/[locale]/propietarios/page.tsx:220-260](../../app/[locale]/propietarios/page.tsx)

El simulador pide al visitante **Ubicación**, **Tipología**, **Dormitorios** y
**Disponibilidad**, y el cálculo solo consume `occ` y `adr`:

```js
const annualGross = Math.round((occ / 100) * 365 * adr)
```

`loc`, `propType`, `beds` y `avail` se guardan en estado y **no entran en ninguna
fórmula**. El copy promete lo contrario: *«Ajuste los parámetros y descubra el impacto
de SEDA OS en su rentabilidad anual.»*

**El caso grave es `Disponibilidad`.** Sus opciones son `Todo el año` / `Temporada alta`
/ `Solo verano` / `A medida`. Se multiplica siempre por **365 días**, elija lo que elija:

| Selección | Muestra | Reproducción a mano (occ 72%, ADR 1.450 €) | Sobrestimación |
|---|---|---|---|
| Todo el año | 381.060 € | 0,72 × 365 × 1.450 = 381.060 € | — |
| Solo verano | **381.060 €** | 0,72 × ~92 × 1.450 = **96.048 €** | **×3,97** |

Un propietario que declara alquilar solo en verano recibe una proyección **casi cuatro
veces superior** a la que corresponde a su propio input. Es el mismo orden de magnitud
que el ×4 del Modelo 238, por una causa distinta.

**Estado:** `ERRÓNEO`.
**No se corrige en este PR.** El arreglo exige decidir el mapeo opción→días
(`Temporada alta` = ¿cuántos días?; `A medida` no admite mapeo numérico alguno). Eso es
criterio de producto, no aritmética. → §7 `PENDIENTE_ÁNGEL`.

### E-02 · «Cero multas y cero sorpresas con Hacienda o Interior»

**Fichero:** [app/[locale]/founding-owners/page.tsx:49](../../app/[locale]/founding-owners/page.tsx) — en los 4 idiomas.

Garantía absoluta de un resultado sancionador que no está bajo control de SEDA. Una
inspección de AEAT o Interior puede sancionar por hechos ajenos al gestor (datos que
aporte el propietario, criterio del actuario, cambio normativo retroactivo). Es la
afirmación de mayor riesgo publicitario del sitio, agravada por acompañarse de
«cumplimiento legal **100%**».

**Estado:** `ERRÓNEO` (promesa de resultado). Redacción condicionada propuesta en §6.

### E-03 · `/founding-owners` cita el Modelo 179 como vigente, sin la cobertura del resto del sitio

**Fichero:** [app/[locale]/founding-owners/page.tsx:49](../../app/[locale]/founding-owners/page.tsx)

Dice «RD 933/2021, **Modelo 179**, IRNR». El resto del sitio usa sistemáticamente la
fórmula cubierta «Modelo **179/238**, según normativa vigente» (§C-04). Esta página es
la excepción y cita el modelo sustituido como si fuera el actual.

**Estado:** `ERRÓNEO` por inconsistencia interna verificable — no hace falta criterio
fiscal externo para detectarlo: el propio sitio se contradice. La corrección natural es
alinear con la fórmula ya usada en las otras 8 apariciones.
**No se aplica en este PR:** tocar copy normativo sin asesoría contratada entra en la
regla 1 del encargo. → §7.

### E-04 · «Nuestro equipo fiscal»

**Fichero:** `messages/{es,en,fr,de}.json` → `prop.faq.items.q3.a`

«Para no residentes (IRNR), **nuestro equipo fiscal** genera la documentación y le
soporta en la presentación.»

El contexto del encargo lo desmiente de forma explícita: *«No hay asesoría contratada a
fecha de hoy.»* Se publica en 4 idiomas una capacidad de servicio que no existe.

**Estado:** `ERRÓNEO`. Redacción condicionada en §6. No se aplica aquí: define qué
servicio presta SEDA, que es decisión de Ángel.

---

## 4. Verificación — entradas `NO_TRAZABLE`

Ninguna se corrige en este PR. Ángel decide si se corrigen o se retiran.

| # | Afirmación | Por qué no es trazable |
|---|---|---|
| N-01 | «12.480 reservas analizadas · cartera SEDA Q4 2025» | No existe dataset, fichero ni consulta que produzca esa cifra en ninguno de los tres repos. Incompatible con «2 propietarios en programa». |
| N-02 | «+24% RevPAR vs mercado» (×2 apariciones) | Depende de N-01. Sin compset no hay baseline contra el que medir. |
| N-03 | «Más del 60% de los propietarios SEDA son no residentes» | Estadística sobre una base de 2 propietarios. |
| N-04 | «↑ 12% vs baseline» (pricing) | Sin fuente. No hay motor de pricing en este repo ni serie histórica. |
| N-05 | «+12% vs prev.» (ingresos) | Mockup de dashboard, pero no está rotulado como ilustrativo. |
| N-06 | «+6 pts vs. mes anterior» (ocupación) | Ídem N-05. |
| N-07 | «99,98% uptime» | Afirmación de nivel SLA. No hay página de estado, monitor ni histórico que la respalde. |
| N-08 | «compset histórico Costa del Sol 2023–2025» (disclaimer del simulador) | Cita una fuente de datos que no consta en el repo. El disclaimer aporta falsa trazabilidad. |
| N-09 | Comisión implícita **25%** (`× 0.75`) | Ver §3 abajo. No coincide con el 22% pactado y no hay nada que documente qué representa el 25%. |
| N-10 | Comisión implícita **18,0%** (mockup 1.960/10.890) | Ídem. Tercera tasa distinta. |
| N-11 | «19% comisión durante 24 meses» | Plausible como condición fundadora promocional sobre el 22%, pero no hay documento en el repo que lo fije. Solo Ángel puede confirmarlo. |
| N-12 | «8 años en Iberostar + Les Roches MHM» | Credencial personal, no verificable desde código. Se señala porque **diverge del signal registrado** para SEDA (fundador de Hotel Estepona Plaza + 5 premios de sector), que no aparece en la web. |

### Nota sobre la base de comisión (N-09, N-10 y §1.2)

El encargo prohíbe tocar el modelo de comisión (22%) y pide únicamente **verificar que
lo publicado coincide con lo pactado**. No coincide. Lo publicado hoy:

| Superficie | Tasa implícita | Base declarada |
|---|---|---|
| Simulador `/propietarios` (`× 0.75`) | **25%** | — |
| Mockup de liquidación `/propietarios` | **18,0%** | — |
| `/meet` y `/founding-owners` | **19%** (24 meses) | — |
| FAQ propietarios | — | sobre ingresos **brutos** |
| `/founding-owners` | — | sobre ingresos **netos** |
| **Pactado** | **22%** | bruto (`reservas.importe_bruto` en seda_os) |

Dos problemas distintos:

1. **Ninguna tasa publicada es el 22%.** El simulador, con el ADR y ocupación por
   defecto, muestra **285.795 €** de neto; al 22% pactado serían **297.227 €**. Diferencia:
   **11.432 €/año** — infraestimando el neto del propietario. La dirección del error no
   es publicitariamente agresiva, pero contradice lo pactado.
2. **La base cambia según la página.** «Sobre ingresos netos» y «sobre ingresos brutos»
   son cantidades materialmente distintas. En `seda_os` la comisión se calcula sobre
   `importe_bruto`, lo que respalda la formulación de la FAQ y deja `/founding-owners`
   como la incorrecta.

No lo arreglo porque cambiar `0.75` exige saber si ese 25% pretendía ser solo comisión o
comisión + otros costes, y esa respuesta no está en el código. → §7.

---

## 5. El ×4 del Modelo 238

### 5.1 Ubicación real — no está en `seda-web`

El encargo lo situaba en el `savings-calculator` de este repo. **No existe aquí.**
Búsqueda en los tres repos (`seda-web`, `seda_os`, `guest-app`):

```
seda_os/lib/savings-calculator.ts   ← única copia canónica
guest-app/                          ← sin coincidencias
seda-web/                           ← sin coincidencias
```

Consume `seda_os/lib/competitor-pricing.ts` y alimenta `/portal/comparativa`, que está
**detrás de autenticación**. No es contenido de marketing público: la exposición es
frente al propietario ya registrado, no frente al visitante anónimo.

### 5.2 El defecto

`seda_os/lib/savings-calculator.ts:230-231`:

```js
const m238Quarterly = pick(comp.modelo238FeeQuarterlyRange)
const modelo238Annual = m238Quarterly * 4
```

### 5.3 Por qué aparece el ×4 — root cause

**No es un error de tecleo: es un residuo de la sustitución Modelo 179 → Modelo 238.**

El Modelo 179 (declaración informativa de cesión de uso de viviendas con fines
turísticos) era de presentación **trimestral**. El Modelo 238 que lo sustituye —vía
RD 117/2024, transposición de DAC7— es de presentación **anual**. El propio fichero
documenta la sustitución en su cabecera («*Modelo 179 → 238 per RD 117/2024 / DAC7*»),
pero el campo conservó el nombre y la semántica antiguos:

```js
modelo238FeeQuarterlyRange: [200, 350]   // ← "Quarterly" heredado del 179
```

Cuando el modelo pasó a ser anual, la conversión trimestral→anual (`× 4`) dejó de tener
base: ya solo hay **una presentación al año**. El `× 4` sobrevivió al rename del campo.

Es decir: **es un error de escala trimestral→anual mal aplicado**, no un problema de
«por propiedad vs por titular» (esa dimensión sí está bien resuelta: `rd933AnnualFee` y
`setupFee` sí multiplican por `propertyCount`, y el fee del 238 correctamente **no** lo
hace, porque la declaración es por titular).

**Impacto — reproducción a mano** (banda `mid` de cada competidor):

| Competidor | Fee mid | Publicado (`×4`) | Correcto (anual) | Inflación |
|---|---|---|---|---|
| Sunstay | 275 € | 1.100 € | 275 € | +825 €/año |
| MálagaSuite | 275 € | 1.100 € | 275 € | +825 €/año |
| Costasolproperty | 325 € | 1.300 € | 325 € | +975 €/año |
| AirHost | 100 € | 400 € | 100 € | +300 €/año |

El fee inflado entra en `totalCost` del competidor → reduce `competitorNet` → **infla
directamente el "ahorro anual con SEDA"** entre 300 y 975 €/año por propietario. **La
dirección del error favorece a SEDA**, que es exactamente la dirección que genera
exposición publicitaria.

### 5.4 Por qué no está en este PR

`seda_os` es **otro repositorio git**. Un PR sobre `seda-web` no puede contener ese
commit. Además `seda_os` está ahora mismo en la rama `feat/ui-permanencia`, no en `main`
— y CLAUDE.md exige que toda rama nueva salga de `main` actualizado.

**Parche listo para aplicar en `seda_os`, en rama propia desde `main`:**

```diff
--- a/lib/competitor-pricing.ts
+++ b/lib/competitor-pricing.ts
-  /** Modelo 238 fee in EUR; [0,0] if included. */
-  modelo238FeeQuarterlyRange: [number, number]
+  /**
+   * Modelo 238 fee in EUR **per annual filing**; [0,0] if included.
+   * El 238 (RD 117/2024, DAC7) se presenta UNA vez al año — sustituye al
+   * 179, que era trimestral. No multiplicar por 4.
+   */
+  modelo238FeeAnnualRange: [number, number]
```

```diff
--- a/lib/savings-calculator.ts
+++ b/lib/savings-calculator.ts
-  const m238Quarterly = pick(comp.modelo238FeeQuarterlyRange)
-  const modelo238Annual = m238Quarterly * 4
+  // El Modelo 238 es de presentación anual (RD 117/2024 / DAC7). El `× 4`
+  // anterior era residuo del Modelo 179, que sí era trimestral.
+  const modelo238Annual = pick(comp.modelo238FeeAnnualRange)
```

Los 4 literales de `COMPETITORS` se renombran sin cambiar valor (`[200,350]`,
`[200,350]`, `[250,400]`, `[0,200]`): el valor ya estaba expresado por presentación.

**Tests exigidos (3 casos), para `seda_os/tests/savings-calculator.test.ts`:**

| Caso | Entrada | Esperado antes (falla) | Esperado después (pasa) |
|---|---|---|---|
| 1 propietario, 1 propiedad | 12 meses de reservas, `propertyCount: 1` | `modelo238AvoidedAvg === 1100` (Sunstay) | `=== 275` |
| 2 propiedades | mismo set, `propertyCount: 2` | `1100` (no escala — correcto) | `275`, **sigue sin escalar** con `propertyCount` (la declaración es por titular, no por inmueble) |
| Importe cero | `reservas: []` | `annualGross 0`; el fee del 238 sigue entrando en `totalCost` e infla el ahorro sobre base cero | `bestCaseAnnualSavings` no se dispara por un fee fantasma |

El caso 2 es el que fija la semántica «por titular» y evita que un futuro arreglo
reintroduzca el error multiplicando por `propertyCount`.

### 5.5 ¿Contamina el mismo error de escala otras salidas del calculador?

Revisadas las cuatro conversiones temporales restantes de `competitorEffectiveCost`:

| Salida | Conversión | Veredicto |
|---|---|---|
| `commission` | `annualGross × baseRate` — sin conversión temporal | ✅ correcto |
| `cleaningMarkupAnnual` | `propertyCount × baseline anual × rate` | ✅ correcto (baseline ya anual) |
| `rd933Annual` | `pick(rd933AnnualFeeRange) × propertyCount` | ✅ correcto (campo ya anual) |
| `setupAmortisedAnnual` | `setupFee × propertyCount / 3` | ✅ correcto (36 meses → /3 años), aunque el comentario dice «/3» sin explicitar años |
| `annualisationFactor` | `12 / monthsObserved` sobre `monthSpan` inclusivo | ⚠️ ver abajo |

**Un hallazgo colateral:** `monthSpan()` es **inclusivo** (`+1`), de modo que un set de
reservas concentrado en un único mes da `monthsObserved = 1` y anualiza `× 12`. Un
propietario con una sola reserva de temporada alta ve una proyección anual 12 veces su
único mes. No es el ×4 y no lo arreglo aquí, pero pertenece al mismo género de error de
escala y merece revisión en el mismo PR de `seda_os`.

---

## 6. Barrido de riesgo publicitario

Afirmaciones que prometen un resultado económico o legal concreto sin condicionar.
**Redacciones propuestas — NO aplicadas**, listadas aparte según el encargo.

| # | Actual | Propuesta condicionada |
|---|---|---|
| R-01 | «Cero multas y cero sorpresas con Hacienda o Interior» | «Preparamos y documentamos las obligaciones de RD 933/2021 y las informativas de cesión turística para que lleguen completas y en plazo a tu asesor fiscal.» |
| R-02 | «Cumplimiento legal 100%» | «Cumplimiento legal documentado y trazable.» |
| R-03 | «Nuestro equipo fiscal genera la documentación y le soporta en la presentación» | «Generamos la documentación necesaria para que su asesor fiscal realice la presentación.» |
| R-04 | «Liquidación IRNR» (badge) | «Documentación IRNR» — evita afirmar que SEDA liquida. Ver aviso de gate abajo. |
| R-05 | «+24% RevPAR vs mercado» | Retirar hasta disponer de cartera y compset reales. No admite condicionado: el dato no existe. |
| R-06 | «Más del 60% de los propietarios SEDA son no residentes» | Retirar. Con n=2 no hay porcentaje publicable. |
| R-07 | «99,98%» uptime | Retirar o sustituir por objetivo declarado («objetivo de disponibilidad 99,9%»), nunca por un histórico no medido. |
| R-08 | Simulador: «Neto para el propietario» | Añadir que es estimación antes de impuestos y de gastos no incluidos, y que la disponibilidad seleccionada no está aplicada (mientras E-01 siga abierto). |

> ⚠️ **Gate IRNR respetado.** R-04 se limita a evitar que el badge afirme que SEDA
> liquida. **Este documento no fija ninguna postura de SEDA sobre retención de IRNR**;
> el flag `SEDA_FLAG_IRNR_RETENEDOR` sigue cerrado y requiere confirmación escrita de la
> asesoría que se contrate. La web puede explicar el marco citando norma; no puede decir
> «SEDA retiene» ni «SEDA no retiene».

---

## 7. `PENDIENTE_ÁNGEL`

> **Sección histórica.** Refleja el estado del 2026-08-01. El cierre de cada entrada
> está en **§10**. Se conserva sin editar para que quede rastro de qué se preguntó.

Ninguna de estas se resuelve sin decisión tuya o sin asesoría contratada.

**Fiscal / normativo — requiere asesoría**

1. **`Modelo 210 trimestral`** (`/meet`) y **`reporting fiscal trimestral`**
   (`prop.arch.mod.finanzas.body`, 4 idiomas). Hay indicios de que la periodicidad de
   presentación del Modelo 210 por rendimientos de alquiler de no residentes cambió de
   trimestral a anual en una orden ministerial reciente. **No lo he corregido ni lo
   afirmo**: exige confirmación contra AEAT/BOE. Si se confirma, ambos textos están
   desactualizados en los 4 idiomas.
2. **E-03** — alinear `/founding-owners` («Modelo 179») con la fórmula cubierta
   «Modelo 179/238, según normativa vigente» ya usada en el resto del sitio.
3. **E-04 / R-03** — ¿existe o existirá un equipo fiscal? Mientras no, el texto es falso
   en 4 idiomas.
4. **R-04** — redacción del badge «Liquidación IRNR» sin tocar el gate.

**Económico — requiere tu decisión, no asesoría**

5. **N-09 · `× 0.75` del simulador.** ¿El 25% pretendía ser solo comisión (y debe ser
   `0.78` para el 22% pactado) o comisión + otros costes? Si es lo segundo, hay que
   documentar qué costes, o el número no es publicable.
6. **N-10 · mockup al 18%.** Ajustar los tres importes para que la comisión implícita sea
   la pactada, o rotular el bloque como ilustrativo.
7. **N-11 · «19% durante 24 meses».** ¿Condición fundadora real y vigente? Si sí, debe
   constar en un documento de pricing citable.
8. **§1.2 · base de comisión.** `/founding-owners` dice «sobre ingresos **netos**»; la
   FAQ y `seda_os` dicen **bruto**. Uno de los dos textos es incorrecto.
9. **E-01 · mapeo de `Disponibilidad`.** Necesito de ti: días/año para `Temporada alta`
   y `Solo verano`, y qué hacer con `A medida` (lo natural: que deshabilite la proyección
   y lleve al formulario de contacto). Con eso el arreglo pasa a ser mecánico.

**Datos de rendimiento — requiere cartera real**

10. **N-01 a N-08.** Todas las métricas de rendimiento del sitio dependen de una cartera
    que hoy no existe. Decisión binaria: retirarlas hasta tener datos, o mantenerlas
    rotuladas inequívocamente como objetivo/ilustración. No hay término medio: hoy se
    presentan como medición histórica.

---

## 8. Marcado de frescura y fuente (tarea 4) — no aplicado, con motivo

El encargo pide añadir a cada bloque normativo fecha visible de última actualización,
enlace a fuente primaria (BOE/AEAT) y autoría atribuible.

**No lo he aplicado, y creo que aplicarlo hoy sería un defecto de veracidad en sí mismo.**
Marcar un bloque con «Actualizado 2026-08-01 · Fuente: BOE» certifica ante el lector —y
ante los buscadores generativos, que es justamente el objetivo— que el contenido ha sido
verificado. Cuatro de los bloques normativos están en `PENDIENTE_ÁNGEL` (§7.1–7.4): uno
posiblemente desactualizado en periodicidad, otro citando un modelo sustituido, otro
afirmando un equipo que no existe. Sellarlos como verificados los volvería más citables
siendo dudosos, que es el peor resultado posible.

**Orden correcto:** resolver §7.1–7.4 → aplicar el marcado. La plantilla queda lista:

```
Actualizado: AAAA-MM-DD · Fuente: <enlace BOE/AEAT> · Criterio: Ángel Molina, fundador
```

Con la restricción de que cada enlace apunte a la norma consolidada en BOE o a la página
de AEAT del modelo, nunca a un blog ni a un agregador.

---

## 9. Cobertura y límites de esta auditoría

**Cubierto:** `messages/{es,en,fr,de}.json` completos (880 claves × 4, paridad verificada);
literales numéricos hardcodeados en `app/` y `components/`; el simulador de ingresos; el
`savings-calculator` de `seda_os` con sus consumidores; búsqueda cruzada en los tres repos
antes de declarar ausente el `savings-calculator`.

**No cubierto — y por qué:**

- **Marcado estructurado y metadatos** (JSON-LD, OG, hreflang): asignado al otro prompt.
- **`.tmp/seda4/*.jsx`** — contienen afirmaciones con cifras y **están trackeados en git**,
  pero no los sirve ninguna ruta de Next. No se auditan como contenido público; conviene
  confirmar que no se reactivan.
- **Verificación de las tasas de la competencia** (`competitor-pricing.ts`): todas marcadas
  `verification: 'estimated'` con origen en entrevistas internas. No son verificables desde
  código ni desde fuente pública, y el propio fichero advierte del riesgo LCD art. 9. Fuera
  del alcance de una auditoría de código.
- **Credenciales del fundador** (N-12): solo Ángel es fuente.

---

## 10. Cierre del registro — decisiones de Ángel aplicadas

**Fecha:** 2026-08-02 · **Rama:** `claude/seda-commission-guarantees-metrics-740314`
**Modelo:** Opus 5 · esfuerzo alto.

Cuatro criterios de verdad recibidos por escrito, que gobiernan todo el cierre:

| # | Criterio | Fuente |
|---|---|---|
| 1 | La comisión pactada es **22% sobre `importe_bruto`** | `seda_os/lib/reserva-financials.ts`, `seda_os/docs/PRICING.md` |
| 2 | **SEDA no presta la declaración fiscal.** La lleva una gestoría que factura directamente al propietario | cerrado por escrito el 2026-08-01 |
| 3 | El **gate SES/RD 933 está en `off`** en producción. Nada se comunica al Ministerio del Interior | estado de producción |
| 4 | Hay **2 propietarios**. Ninguna métrica de cartera sostiene un porcentaje ni un compset | estado de producción |

Regla aplicada: **lo que no se puede sostener se retira, no se reetiqueta.** Solo se
reescribe cuando existe una afirmación verdadera y comprobable que ocupe su sitio.

### 10.1 Estado ficha por ficha

| §7 | Ficha | Estado | Decisión aplicada |
|---|---|---|---|
| 1 | `Modelo 210 trimestral` (`/meet`) y `reporting fiscal trimestral` (`prop.arch.mod.finanzas.body`) | **`RESUELTA` por retirada (parcial)** | «trimestral» retirado de `prop.arch.mod.finanzas.body` en los 4 idiomas — retirar una afirmación falsa no exige criterio fiscal, solo sustituirla lo exigiría (criterio A-03). La periodicidad correcta sigue sin fijarse — ver §10.3 |
| 2 | E-03 · `/founding-owners` cita «Modelo 179» como vigente | **`RESUELTA`** | Alineado con la fórmula cubierta «Modelo 179/238, según normativa vigente» en los 4 idiomas |
| 3 | E-04 / R-03 · «nuestro equipo fiscal» | **`RESUELTA`** | Retirado en los 4 idiomas. Sustituido por el hecho (criterio 2): SEDA prepara la documentación, la gestoría del propietario presenta |
| 4 | R-04 · badge «Liquidación IRNR» | **`RESUELTA`** | → «Documentación IRNR». Sin postura sobre retención (gate intacto) |
| 5 | N-09 · `× 0.75` del simulador (25% implícito) | **`RESUELTA`** | → `× 0.78`. Barrido hecho: no hay ningún otro factor de comisión en constantes |
| 6 | N-10 · mockup de liquidación al 18% | **`RESUELTA`** | Recalculado al 22%. **Eran dos mockups, no uno** — ver §10.2 |
| 7 | N-11 · «19% comisión durante 24 meses» | **`RESUELTA`** | → 22% sobre ingresos brutos, 4 idiomas. Ver la advertencia de §10.4 |
| 8 | §1.2 · base netos vs brutos | **`RESUELTA`** | **Bruto** en todas las superficies, y enunciado explícitamente allí donde se cita el tipo |
| 9 | E-01 · mapeo `Disponibilidad` → días | **`RESUELTA` por retirada** · abre ficha nueva | Control retirado, no mapeado. El mapeo **no se ha inventado** — sigue siendo decisión tuya (§10.3) |
| 10 | N-01 a N-08 · métricas de cartera | **`RESUELTA`** | Retiradas. Origen trazado — ver §10.2 |

### 10.2 Las trazas de origen que decidieron «retirar» frente a «reetiquetar»

**Los 12.480 y el 99,98% no son datos de mercado.** Ambos salen del mismo bloque
decorativo del prototipo de diseño, `.tmp/seda4/page-propietarios.jsx:219-223`
(commit `aaabde0`), un contador `AnimatedNumber` de cuatro casillas:

```jsx
["Disponibilidad 2026", <AnimatedNumber to={99.98} decimals={2}/>],
["Tiempo de respuesta", <>&lt; <AnimatedNumber to={2}/> min</>],
["Reservas procesadas", <AnimatedNumber to={12480}/>],
["Idiomas soportados",  "ES · EN · DE · FR"],
```

No es un dataset de la Costa del Sol analizado por SEDA: es un contador de maqueta al que
después se le añadió el rótulo «cartera SEDA Q4 2025 vs Costa del Sol compset». Por eso
**no admite reetiquetado con fuente y fecha** —no hay fuente— y se retira, junto con las
tres métricas que colgaban de él. El mismo prototipo (`page-home.jsx:92`) es el origen de
«14 propiedades en gestión», que se retira por idéntico motivo.

El `99,98%` se retira además por su criterio propio: **no hay página de estado, monitor ni
histórico** en ninguno de los tres repos que lo respalde. Se retiró la strip completa de
`/propietarios`, no solo el uptime, porque los cuatro valores proceden del mismo bloque de
maqueta — incluido «Tiempo de respuesta < 2 min».

**Hallazgo nuevo — la auditoría original se dejó un segundo mockup al 18%.** §3/N-10
localizó `app/[locale]/propietarios/page.tsx` (10.890 / 1.960 → 18,0%), pero
`components/dashboard-mockup.tsx` —que se renderiza en la **home**, la página de mayor
tráfico— tenía la misma tasa implícita: 6.915 / 38.420 = 18,0%. Ambos corregidos.

### 10.3 Lo que sigue `PENDIENTE_ÁNGEL`, y por qué

**P-1 · Periodicidad del reporting fiscal (§7.1).** Exige confirmación contra AEAT/BOE y
no hay asesoría contratada, así que **sigue sin fijarse una periodicidad**. Lo que sí ha
cambiado en la segunda pasada (2026-08-02): `prop.arch.mod.finanzas.body` decía «reporting
fiscal trimestral» en los 4 idiomas — «trimestral» queda **retirado**, sin sustituirlo por
«anual» ni por ningún otro plazo. El texto queda «… IRNR y reporting fiscal.», sin
periodicidad. Esto no exige criterio fiscal porque no afirma nada sobre cuándo se
presenta — solo deja de afirmar algo no confirmado (mismo criterio que A-03: retirar una
falsedad no requiere asesoría; *sustituirla por otra cifra* sí la requeriría). `/meet` ya
no menciona el Modelo 210 desde la primera pasada. Sigue abierta la pregunta de fondo:
qué periodicidad es correcta, si se quiere volver a afirmar una.

**P-2 · Mapeo temporada → días del simulador (§7.9).** El encargo prohíbe explícitamente
inventarlo. Se ha tomado la salida 2 (retirar el control) porque el mapeo **no existe en
ningún punto del repo**: no hay tabla opción→días, ni curva de estacionalidad, ni constante
de temporada. Honrar la entrada habría exigido inventar cuántos días son «Temporada alta» y
qué hace «A medida» — decisión de negocio, no aritmética.
Queda abierta como ficha nueva: si quieres los cuatro controles de vuelta hacen falta
(a) días/año para `Temporada alta` y `Solo verano`; (b) qué hace `A medida` —lo natural
sigue siendo deshabilitar la proyección y llevar al formulario—; y (c) si `Ubicación`,
`Tipología` y `Dormitorios` deben modular ADR u ocupación y con qué coeficientes. Sin
(a)–(c) documentados, los controles no vuelven.

### 10.4 Dos decisiones que conviene que revises

Ninguna es aritmética; ambas se han resuelto aplicando el criterio recibido, pero cambian
texto comercial y merecen tu visto bueno explícito.

1. **Se ha eliminado «durante 24 meses» del claim de `/meet`.** El 19% era una condición
   fundadora promocional sobre el 22%. Al unificar en el 22% pactado, mantener «durante 24
   meses» habría implicado que la comisión **sube** pasados esos 24 meses — afirmación
   nueva que nadie ha fijado. El texto queda «22% de comisión sobre ingresos brutos», sin
   plazo. Si el descuento fundador sigue vivo, debe constar en un documento de pricing
   citable antes de volver a publicarse.

2. **Redacción nueva en los bloques de cumplimiento** de `/founding-owners` (4 idiomas) y
   `/meet` (4 idiomas). Describe capacidad, nunca resultado, y respeta el gate SES:
   «registro de viajeros integrado, **preparado para** la comunicación a SES.Hospedajes»
   —nunca «comunicamos»— y «preparamos la documentación … **para que tu gestoría la
   presente**». **Marcada para tu revisión** conforme al encargo.

### 10.5 Afirmaciones adyacentes NO tocadas en este PR

Se dejan constar para que la decisión sea tuya y no por omisión. Ninguna entraba en el
alcance de este encargo, y todas son del mismo género que lo retirado:

| Afirmación | Fichero | Por qué se señala |
|---|---|---|
| «Modelo 179/238, según normativa vigente» | 8 apariciones | `CORRECTO` (C-04): formulación cubierta. Se mantiene |
| Marcado de frescura y fuente (§8) | bloques normativos | Sigue sin aplicarse: P-1 continúa abierta (queda por fijar la periodicidad correcta), y sellar como verificado un bloque dudoso es peor que no sellarlo |

> «+42% de conversión en ficha» y «+12% vs prev. · +6 pts vs. mes anterior» estaban aquí
> hasta la segunda pasada (2026-08-02). Ya no están adyacentes — se retiraron. Ver §10.7.

### 10.6 Verificación ejecutada

- **Paridad i18n en los 4 idiomas.** `.tmp/check-i18n.mjs` se ha **ampliado en este PR**:
  antes solo comparaba `es↔en`, de modo que una clave presente en `es` y `en` pero ausente
  en `fr` o `de` pasaba desapercibida. Ahora toma `es` como referencia, contrasta los otros
  tres en ambas direcciones y sale con código 1 si hay divergencia. Resultado: **847 claves
  × 4 idiomas, 0 divergencias** (eran 880: se retiran 34 claves y se añade
  `prop.sim.net_note`).
- **Barrido de `%`** sobre las 4 traducciones: no queda ningún tipo de comisión distinto de
  22. Los únicos `%` restantes son los ticks de ocupación del simulador (20% / 95%).
- **Render comprobado**, no solo `tsc`: las secciones de las que se retiraron bloques (hero
  de `/propietarios`, strip de arquitectura, panel del simulador, stats del CTA final, hero
  de `/guestapp`) se han revisado ya recompuestas.

### 10.7 Segunda pasada — conversión, KPIs de mockup y periodicidad fiscal (2026-08-02)

**Encargo:** retirar «+42% de conversión» y las KPI de ingresos/ocupación de los mockups
`SedaOSWindow` (`/propietarios`) y `DashboardMockup` (home), y retirar «trimestral» de
`prop.arch.mod.finanzas.body`. Mismo criterio que §10.2: **se retira, no se reetiqueta**,
salvo que exista un valor real que ocupe el sitio.

**Origen verificado — mismo prototipo decorativo que los 12.480/99,98% de §10.2.**
`.tmp/seda4/page-home.jsx:578-579`, `page-propietarios.jsx:383-384` y
`page-ecosistema.jsx:354-355` comparten el mismo bloque KPI de maqueta:

```jsx
{ label: "Ingresos previstos", value: "€45.000", delta: "+12% vs prev." },
{ label: "Ocupación", value: "78%", delta: "+6 pts" },
```

Ni `€45.000` ni `78%` ni los deltas `+12% vs prev.` / `+6 pts` tienen fuente distinta del
prototipo — es la misma maqueta `AnimatedNumber`/KPI que ya se documentó como no trazable
en §10.2. Un delta retirado sobre una cifra inventada no la arregla: se retiran cifra y
delta juntos, no solo el delta.

**Retirado:**

- `app/[locale]/propietarios/page.tsx` — el KPI `Ingresos previstos: €45.000 (+12% vs
  prev.)` y el KPI `Ocupación: 78% (+6 pts)` del mockup `SedaOSWindow`. Quedan `Llegadas
  hoy` y `Mantenimiento`, los dos únicos KPI de esa fila con valor operativo (no de
  cartera).
- `app/[locale]/propietarios/page.tsx` — la tarjeta completa «Conversión en ficha +42%»
  del bento de marketing (bloque `prop.marketing.conv_*`): mismo motivo que R-05 (§6),
  cifra de conversión sin serie histórica ni fuente distinta del texto mismo.
- `components/dashboard-mockup.tsx` — el KPI `Ocupación: 78% (+6 pts vs. mes anterior)`
  del mockup de la home. Quedan `Ingresos` (€142.300, cifra distinta de los €45.000 de la
  maqueta retirada, no señalada como no trazable) y `Reservas activas`.
- `messages/{es,en,de,fr}.json` — 9 claves retiradas en los 4 idiomas: `prop.os.kpi.
  {ingresos,ingresos_d,ocupacion,ocupacion_d}`, `home.dashboard.kpi.{ocupacion,
  ocupacion_sub}`, `prop.marketing.{conv_label,conv_body,conv_range}`.
- `prop.arch.mod.finanzas.body` (4 idiomas) — «trimestral» retirado sin sustituir por
  ningún otro plazo. Ver §10.1 fila 1 y §10.3 P-1.

**Ajuste de layout para no dejar los mockups descuadrados:**

- `SedaOSWindow`: la fila de KPI pasa de 4 tarjetas (`grid-cols-2 md:grid-cols-4`) a 2
  (`grid-cols-2`, sin breakpoint `md`) — 2 columnas en todos los tamaños, sin celdas
  vacías. El texto que dependía de `k.up` (flecha «↗» y color verde de tendencia) se
  retira: ninguno de los dos KPI restantes (`Llegadas hoy`, `Mantenimiento`) la usaba —
  era exclusiva de los dos KPI retirados.
- `DashboardMockup`: la fila de KPI pasa de 3 tarjetas (`sm:grid-cols-3`) a 2
  (`sm:grid-cols-2`).
- Bento de marketing: al retirar la única tarjeta con `md:row-span-2`, quedan 7 tarjetas
  en un grid de 3 columnas, una de ellas con `md:col-span-2` («SEO alta intención»). El
  orden original la dejaba en la posición 6, lo que en flujo automático (no `dense`) deja
  la celda fila-2/col-3 vacía: CSS Grid no rellena hacia atrás sin `grid-flow-dense`. **Se
  reordenó** — «Non-Resident» pasa delante de «SEO alta intención» — para que la fila 2 se
  complete con 3 tarjetas normales y la tarjeta ancha quede sola en la última fila (patrón
  bento habitual), en vez de dejar un hueco a mitad de grid. Verificado con
  `getBoundingClientRect()` en el navegador, no solo razonado: ver más abajo.

**Verificado en navegador, no solo razonado — desktop (1280) y móvil (375):**

- `npx tsc --noEmit`: limpio. (Detectó y forzó corregir una referencia residual a `k.up`
  en `SedaOSWindow` que solo existía para los dos KPI ya retirados.)
- `npx eslint` sobre los ficheros tocados: 0 errores (1 warning preexistente y ajeno,
  `no-img-element`).
- **Dev server levantado** (`npm run dev`, puerto 3004) y verificado con
  `getBoundingClientRect()` sobre el DOM real, no solo por lectura de código:
  - **Home, desktop (1280):** fila de KPI de `DashboardMockup` — 2 tarjetas, mismo ancho
    (284px c/u), mismo `y`, `grid-template-columns` de 2 pistas. Sin celda vacía.
  - **`/propietarios`, desktop (1280):** fila de KPI de `SedaOSWindow` — 2 tarjetas
    (Llegadas hoy / Mantenimiento), mismo ancho (275px c/u), mismo `y`. Bento de
    marketing tras el reordenamiento — filas 1 y 2 completas con 3 tarjetas cada una
    (358px c/u, sin huecos intermedios), fila 3 con la tarjeta ancha (732px) sola —
    hueco solo al final, patrón bento intencional, no a mitad de grid.
  - **Home y `/propietarios`, móvil (375):** ambos grids colapsan a 1 columna
    (`grid-cols-1` sin el breakpoint `sm:`/`md:`) — todas las tarjetas apiladas a ancho
    completo, sin posibilidad de hueco ni desalineación en una sola columna.
- `grep` de las 9 claves retiradas sobre `app/` y `components/`: 0 referencias residuales.
- **Paridad i18n**, `.tmp/check-i18n.mjs`: **838 claves × 4 idiomas, 0 divergencias**
  (eran 847 tras §10.6; se retiran 9).

**Nota de sesión anterior, ya superada:** una primera pasada de este apartado se conformó
con razonar el layout desde CSS Grid auto-flow sin levantar el servidor. Ese razonamiento
**se equivocó**: asumió que el flujo automático quedaría sin huecos, y no era cierto — el
orden original dejaba una celda vacía a mitad del bento (fila 2, columna 3). Se detectó al
levantar `npm run dev` y medir el DOM real, y se corrigió reordenando las tarjetas (arriba).
Queda como recordatorio de por qué este PR ya no se cierra sin medir en navegador.

### 10.8 Ficha nueva — columna «Cumplimiento» del footer retirada (2026-08-02)

**Retirado:** en `components/footer.tsx`, la columna completa `md:col-span-2
md:col-start-11` bajo el rótulo `home.footer.cumplimiento` («Cumplimiento» /
«Compliance» / «Conformité» según idioma), con sus tres `<span>`:

```
RD 933/2021
Modelo 179
VTAR/MA/27.143
```

**Por qué los tres, y por qué no se reetiqueta (mismo criterio que §10.2/§10.6):**

1. **`VTAR/MA/27.143` es un código inventado**, y además de estar inventado corresponde
   a la figura equivocada: **VTAR** es la Vivienda Turística en el Ámbito Rústico —suelo
   rústico—, no la figura que le correspondería a las propiedades que gestiona SEDA. No
   hay una VTAR real que sustituir: no hay número de registro turístico verificable en
   ningún fichero del repo ni en `seda_os`.
2. **`Modelo 179` está derogado** por el RD 117/2024, y **SEDA no lo presenta** —lo
   presenta la gestoría del propietario, no SEDA (criterio 2 de §10, cerrado por escrito
   el 2026-08-01). Listarlo bajo «Cumplimiento» sugiere una acreditación de SEDA que no
   existe en ningún sentido: ni la norma vigente, ni el sujeto que presenta.
3. **El gate `SEDA_FLAG_SES_RD933` sigue en `off`** en producción — no hay comunicación
   a SES.Hospedajes / Ministerio del Interior. `RD 933/2021` bajo «Cumplimiento» se lee
   como «cumplimos esta norma», cuando lo cierto es que el registro de viajeros integrado
   está construido pero el envío está apagado (mismo gate que gobierna §10.4.2).

Bajo el rótulo «Cumplimiento» los tres se leen como acreditaciones. Ninguna lo es: una es
inventada y de la figura equivocada, otra cita una norma derogada que además SEDA no
presenta, y la tercera describe una integración que existe en código pero no está activa
en producción. **No se sustituyen por nada** — no hay una acreditación real disponible
que ocupe su sitio; inventar una violaría la misma regla que gobierna el resto de este
documento.

**Ajuste de rejilla — sin hueco:** la columna de navegación pasa de
`md:col-span-4 md:col-start-7` a `md:col-span-6 md:col-start-7`, extendiéndose hasta el
borde derecho del grid de 12 columnas. La columna 6 (entre la marca y la navegación) sigue
vacía — es el espaciador original entre `col-span-5` y `col-start-7`, no un hueco nuevo.

**i18n:** `home.footer.cumplimiento` retirado en `messages/{es,en,de,fr}.json`.
Verificado con `grep -rn "footer.cumplimiento"` sobre el repo antes de retirar: el único
consumidor era `components/footer.tsx` en esta rama. (Hay una copia de `footer.tsx` en
`.claude/worktrees/seo-geo-mechanical-fixes/`, un *worktree* de git distinto —otra rama,
otro checkout— que aún referencia la clave; no es parte de esta rama ni de este PR, y no
se ha tocado.)

**Verificado en navegador — desktop (1280) y móvil (375), midiendo el DOM real:**

Sin pane de navegador visible en esta sesión, `computer.screenshot` y `computer.zoom`
fallan («the Browser pane is not displayed, so the page is not compositing frames») — no
hay captura de píxeles posible aquí. En su lugar, verificación por `getBoundingClientRect()`
sobre el DOM ya renderizado por el dev server (`npm run dev`, puerto 3004), que es
render real, no razonamiento sobre el código:

- **Ausencia total confirmada:** `document.body.innerText` de la página completa (no solo
  el footer) escaneado para `Cumplimiento`, `RD 933/2021`, `Modelo 179`, `VTAR` — **0
  apariciones** de las cuatro cadenas, en desktop y en móvil.
- **Desktop (1280):** el grid del footer tiene **2 hijos** (antes 3). Columna de marca:
  `x=80 → 522`. Columna de navegación: `x=648 → 1185`, coincidiendo con el borde derecho
  del grid (`gridRight=1185`) — **`trailingGapAfterNav = 0px`**. El hueco entre marca y
  navegación (`127px`, columna 6) es el espaciador preexistente, sin cambios.
- **Móvil (375):** el grid colapsa a 1 columna (`grid-cols-1`, sin breakpoint `md:`) —
  marca y navegación apiladas a `w=327px` cada una, sin tercer bloque, sin hueco posible
  en una sola columna.

**Verificación estática:**

- `npx tsc --noEmit`: limpio.
- `npx eslint components/footer.tsx`: 0 errores, 0 warnings.
- `.tmp/check-i18n.mjs`: **837 claves × 4 idiomas, 0 divergencias** (eran 838 tras §10.7;
  se retira 1: `home.footer.cumplimiento`).
- `grep` de `VTAR` sobre `app/`, `components/`, `lib/`, `messages/`: 0 apariciones.
</content>
</invoke>
