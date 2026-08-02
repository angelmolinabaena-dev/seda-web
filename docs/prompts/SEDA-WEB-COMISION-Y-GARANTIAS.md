# SEDA-WEB — COMISIÓN, GARANTÍAS Y MÉTRICAS

**MODELO: Opus 5**
**ESFUERZO: alto**

**Criterio de routing:** Opus/alto. Es la web pública que un propietario lee **antes de firmar**, con una firma real en septiembre. Toca el tipo de comisión y su base de cálculo (dinero), garantías de cumplimiento legal (RD 933), y métricas presentadas como medición. Cualquier discrepancia entre lo publicado y el contrato es discrepancia precontractual. Además exige distinguir, afirmación por afirmación, lo que se retira de lo que se reescribe — eso es criterio, no ejecución.

---

## Contexto

`docs/audit/VERACIDAD-PUBLICA.md` dejó 9 fichas en `PENDIENTE_ÁNGEL` porque ninguna era puramente aritmética. **Ángel ha decidido.** Este prompt trae esas decisiones. No hay que volver a auditar: hay que aplicar.

Cuatro criterios de verdad que gobiernan todo:

1. **La comisión pactada es 22% sobre `importe_bruto`.** Fuente: `lib/reserva-financials.ts` y `docs/PRICING.md` en `seda_os`.
2. **SEDA no presta la declaración fiscal.** La lleva una gestoría que factura directamente al propietario. Cerrado por escrito el 1 de agosto de 2026.
3. **El gate SES/RD 933 está en `off` en producción.** Nada se comunica al Ministerio del Interior.
4. **Hay 2 propietarios.** Ninguna métrica de cartera puede sostener un porcentaje ni un compset.

**Regla general: lo que no se puede sostener se retira, no se reetiqueta.** Reescribir solo cuando exista una afirmación verdadera y comprobable que ocupe su sitio.

---

## BLOQUE 1 — Comisión (máxima prioridad)

Hoy conviven cuatro tipos implícitos —18% en un mockup, 19% en `/meet` y `/founding-owners`, 25% en el simulador (`× 0.75`)— y la base cambia de página a página: «brutos» en la FAQ, «netos» en `/founding-owners`.

- Unifica en **22% sobre importe bruto**, en todas las páginas y en los 4 idiomas (`es/en/fr/de`).
- La base debe enunciarse **explícitamente** allí donde se cite el tipo. «22%» a secas es insuficiente: 22% sobre netos es otro dinero.
- El mockup del 18%: si es una imagen o un componente decorativo, cámbialo o retíralo. Un propietario no distingue mockup de oferta.
- El `× 0.75` del simulador debe pasar a `× 0.78`. Verifica que no haya otros factores de comisión codificados en constantes.

Al terminar, `grep` de `%` en las 4 traducciones y confirma que no queda ningún tipo de comisión distinto de 22.

## BLOQUE 2 — Garantías legales falsas

Retira, en los 4 idiomas:

- «Cero multas y cero sorpresas con Hacienda o Interior»
- «cumplimiento legal 100%»
- toda mención a un «equipo fiscal» de SEDA o a que SEDA presenta declaraciones por cuenta del propietario

Motivo: las dos primeras son **garantías de resultado** sobre un sistema cuyo gate SES está apagado. La tercera contradice lo ya cerrado por escrito.

Lo que **sí** se puede decir, si quieres poner algo en su lugar: que SEDA registra a los viajeros y gestiona el alta ante las autoridades como parte del servicio. Describir capacidad no es garantizar resultado. **No inventes redacción nueva sin dejarla marcada para revisión de Ángel.**

## BLOQUE 3 — Métricas de cartera

`/propietarios` publica «Q4 2025 · 12.480 reservas analizadas» y «más del 60% no residentes», y de ahí cuelgan +24% RevPAR, +12% pricing y 99,98% uptime. `/founding-owners` dice «2 propietarios en programa». Las dos cosas no pueden ser ciertas a la vez.

Antes de tocar: **averigua qué son los 12.480.** Busca en el repo el origen del dato — fichero, comentario, commit.

- Si son **datos de mercado** de la Costa del Sol analizados por SEDA → no se retiran: se reetiquetan con fuente y fecha, y se separa visiblemente lo que es mercado de lo que es cartera propia.
- Si son **cartera de SEDA** → se retiran, junto con las tres métricas que cuelgan de ellos. No existen.
- Si **no se puede determinar** → se retiran. Una cifra sin origen trazable no se publica.

El 99,98% de uptime va aparte: o hay una fuente de monitorización que lo respalde, o fuera.

## BLOQUE 4 — El simulador ignora 4 de sus 6 entradas

Elegir «Solo verano» sigue multiplicando por 365 días: sobrestima ×3,97.

Dos salidas posibles. **Elige la segunda salvo que el mapeo sea trivial y evidente en el código:**

1. **Honrar la entrada** — solo si el mapeo opción→días ya existe en algún sitio del repo. Si tienes que inventarlo, no vale.
2. **Retirar el control** — si un input no se usa, quitarlo es estrictamente mejor que dejarlo mintiendo.

Aplica lo mismo a las otras 3 entradas ignoradas. Documenta cuál elegiste para cada una y por qué.

**Prohibido inventar el mapeo de días por temporada.** Eso es una decisión de negocio de Ángel; si hace falta, fíchala.

## BLOQUE 5 — Cierre del registro

Actualiza `docs/audit/VERACIDAD-PUBLICA.md`: cada una de las 9 fichas queda `RESUELTA` (con la decisión aplicada) o sigue `PENDIENTE_ÁNGEL` con la razón concreta de por qué no se pudo cerrar.

---

## Verificación exigida

- Paridad de claves en los **4 idiomas** (`es/en/fr/de` — este repo no tiene `it`). Verifica los 4 en runtime, no `es↔en`. El `.tmp/check-i18n.mjs` actual solo compara dos: **amplíalo en este PR**.
- Para cada cifra que cambie, delta escrito a mano en el PR.
- Render comprobado, no solo `tsc`. Si retiras bloques, mira que las secciones no queden vacías ni descuadradas.

## Prohibido

- Reetiquetar una cifra que no puedas trazar a un origen. Se retira.
- Escribir garantías de resultado de cualquier tipo.
- Inventar el mapeo de temporadas del simulador.
- Fijar postura sobre retención de IRNR.
- Mergear el PR.

---

**MODELO: Opus 5 · ESFUERZO: alto** — recuérdalo en el resumen final del trabajo.
