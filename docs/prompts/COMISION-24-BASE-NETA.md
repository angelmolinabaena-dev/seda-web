# DOS PÁGINAS SE QUEDARON CON EL PRECIO VIEJO

MODEL: Sonnet
EFFORT: medium
SESIÓN: nueva en seda-web, CHECKOUT PRINCIPAL `C:\Users\AngelMolina\seda-web`. No crear worktree.

Rama: `fix/comision-24-base-neta`.

NO MERGEAR. Es la cifra que verá un propietario real: la revisa Ángel.

---

## Lo que está bien, y no hay que tocar

**`/propietarios` ya está resuelta.** Dice el 24%, explica la base, y su
`disclaimer` (messages/*.json, `prop.sim.disclaimer`) advierte que *«no es una
oferta ni una previsión de resultados»*. Incluso lleva la frase de venta correcta
en `prop.sim.net_note`, con el remate de *«pida siempre la base de cálculo»*.

**No la reescribas.** Es la referencia de cómo hay que decirlo.

## Lo que está mal

**Dos páginas se quedaron atrás** cuando la comisión pasó al 24% sobre base neta
en agosto de 2026:

| fichero | qué dice hoy |
|---|---|
| `app/[locale]/founding-owners/page.tsx:45,75,105,135` | *«comisión del **22% sobre los ingresos brutos**… sin letra pequeña ni costes ocultos»* — ES/EN/FR/DE |
| `app/[locale]/meet/page.tsx:86,120,154…` | *«5 plazas · 3 disponibles · **22% de comisión sobre ingresos brutos**»* |

**Las dos cifras son falsas.** La comisión es 24% y se aplica sobre base neta:

```
base            = importe_bruto − comision_plataforma − tarifa_limpieza
comisión SEDA   = base × 24%
```

(`seda_os/lib/reserva-financials.ts:29-32`, documentado en `seda_os/docs/PRICING.md`)

Con 1.200 € de reserva y 120 € de limpieza: base 900 €, comisión 216 €. Lo que
anuncia esa página —22% sobre bruto— serían 264 €. **Promete al propietario pagar
más de lo que realmente paga**, junto a la frase «sin letra pequeña».

Fue exacto cuando se escribió: el PR #22 se llamó *fix(veracidad)*.

## Y la escasez que no existe

`founding-owners` dice **«Quedan 3 plazas fundadoras»** en los cuatro idiomas, y
`meet` repite «5 plazas · 3 disponibles».

**El tier Founding Owner se retiró en agosto de 2026.** El 19% fundacional ya no
existe; lo que hay es la exención de cuota de alta para las tres primeras firmas
directas. Y **no hay ningún propietario firmado**, así que el contador no
corresponde a nada.

La investigación de mercado (18-ago-2026) lo señala como error de posicionamiento
en gama alta: un propietario con un activo caro *«percibe la incoherencia de
inmediato»*, y anunciar escasez falsa junto a un precio falso es lo que este
proyecto retiró del resto de superficies en agosto.

## Un fleco menor, pero conviene que cuadre

`prop.sim.disclaimer` y `prop.sim.net_note` dicen que la comisión se aplica *«ya
descontada la comisión del canal»* — cierto, pero **no mencionan que también se
descuenta la limpieza**. Y el cálculo del simulador
(`PropietariosContent.tsx`, `netDirect` / `netOTA`) tampoco la descuenta.

El error va **a favor del propietario** —el simulador le muestra menos neto del
que tendría— así que no es urgente ni engañoso. Pero la web afirma una fórmula
que no es exactamente la del sistema.

**Decide si lo corriges aquí o lo dejas anotado.** Si lo corriges, la limpieza es
un dato que el simulador no pide hoy, así que habría que introducirlo o asumir un
porcentaje — y asumirlo sería inventar. **Piénsalo antes de tocar el cálculo.**

## Alcance

**Que las dos páginas digan la verdad, en los cuatro idiomas.**

**Cómo se redacta lo decides tú.** El criterio está en
`seda_os/docs/PRICING.md` §1.2 y, sobre todo, **en la propia `/propietarios` de
este repo** — usa su tono y su estructura, que ya funcionan.

Un aviso de la investigación de mercado: un «24%» a secas pierde contra el «20%»
de un competidor que no dice sobre qué base, aunque tú seas más barato. La
recomendación es liderar con el 24% **acompañado del ejemplo numérico**, no de
una explicación abstracta. La comparación que convence es ver dos cifras juntas.

**Y decide qué hacer con las plazas.** Retirarlas, sustituirlas por lo que sí
existe —cuota de alta exenta en las tres primeras firmas directas—, o quitar el
bloque. Lo que no vale es dejar un contador inventado.

## Lo que NO entra

- **No toques `/propietarios`** salvo el fleco de la limpieza, si decides
  abordarlo.
- **No cambies el cálculo en `seda_os`**: es correcto y está verificado.
- **No inventes cifras de competidores.** Si comparas, hazlo con una gestora
  genérica y un importe de ejemplo, nunca nombrando a nadie: el art. 9 de la Ley
  3/1991 de Competencia Desleal prohíbe la denigración.
- Cero cambios en otros repos.

## Verificación

1. **`git grep "22%"` no devuelve nada** en `app/`.
2. **Ningún texto dice «sobre bruto»** referido a la comisión de SEDA.
3. **Los cuatro idiomas dicen lo mismo.** No vale corregir el español y dejar el
   alemán antiguo — es el fallo que guest-app ya tuvo.
4. **La escasez inventada desaparece** o se sustituye por algo que exista.
5. `npm run build` en verde.

## Cierre

Push + PR abierto, con las 5 órdenes de git como evidencia. NO mergear.

En el PR: la frase exacta en cada idioma, qué hiciste con las plazas fundadoras,
y qué decidiste sobre el fleco de la limpieza.
