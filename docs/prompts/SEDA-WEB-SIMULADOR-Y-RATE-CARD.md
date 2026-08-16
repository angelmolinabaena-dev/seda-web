# SIMULADOR DE PROPIETARIOS — fórmula real y rate card v3

**MODEL:** Sonnet
**EFFORT:** medium
**SESIÓN:** Nueva sesión en `seda-web`. Verifica antes que no haya otra abierta contra este repo. `seda_os` puede tener una sesión trabajando en la retirada de `/simulador` (otro simulador, otro repo) — no la toques.

**Repo:** `C:\Users\AngelMolina\seda-web`
**Rama:** `fix/simulador-formula-y-rate-card`

---

## 0. Antes de tocar nada

```bash
cd /c/Users/AngelMolina/seda-web && git rev-parse --show-toplevel
git branch --show-current
git status --short
gh pr list --state open
```

Confirma toplevel `seda-web`. **Hay un PR abierto (#50, `fix/identidad-legal-real`)
con el NIF y el domicilio del titular. Parte de `main`, NO de esa rama, y no toques
`lib/legal/`.**

---

## 1. Dos defectos distintos, ambos verificados

### 1.1 El simulador promete un neto que el propietario no va a recibir

`app/[locale]/propietarios/PropietariosContent.tsx`, función `Projection()`:

```ts
const annualGross = Math.round((occ / 100) * 365 * adr)
const annualNet   = Math.round(annualGross * 0.78)
```

Ese `0.78` aplica el 22 % sobre el bruto **y omite por completo la comisión del
canal**. Un propietario que mueva los deslizadores ve el 78 % del bruto. En una
reserva de Airbnb al 15 % recibiría en torno al 65 %. Sobre una proyección de
380.000 € eso son unos 50.000 € de diferencia, al alza, en la pantalla que sirve
para captarlo.

Es el mismo tipo de defecto que esta página ya corrigió en julio con los cuatro
controles que no entraban en la fórmula (ver `docs/audit/VERACIDAD-PUBLICA.md`
§7.9, y el comentario sobre «un input retirado no miente; un input ignorado sí»).
Aquí no es un input ignorado: es un término entero que falta.

### 1.2 Los textos afirman una base de cálculo que nunca ha existido

Cuatro claves en `messages/es.json`, `en.json`, `fr.json` y `de.json` — dieciséis
cadenas en total:

| Clave | Línea aprox. |
|---|---|
| `prop.sim.disclaimer` | 524 |
| `prop.sim.net_note` | 525 |
| FAQ comisión | 537 |
| FAQ comisión (segunda) | 1117 |

Todas dicen «22 % sobre los ingresos brutos» (y sus equivalentes en inglés,
francés y alemán). **Dos errores en la misma frase:**

- El porcentaje: `docs/PRICING.md` v3 (2026-08-16) fija el standard en **24 %**.
- La base: SEDA **nunca** ha cobrado sobre el bruto. `seda_os/lib/reserva-financials.ts`
  calcula sobre `importe_bruto − comision_plataforma − tarifa_limpieza`. La frase
  era falsa también con el 22 %.

---

## 2. La fórmula correcta

El deslizador de ADR introduce **tarifa de alojamiento por noche**, así que
`annualGross` NO incluye tarifa de limpieza. La limpieza queda fuera de este
cálculo y no hay que introducirla.

```
alojamiento        = (occ / 100) × 365 × adr
comision_canal     = alojamiento × pct_canal
base_comision_seda = alojamiento − comision_canal
comision_seda      = base_comision_seda × 0,24
neto_propietario   = alojamiento − comision_canal − comision_seda
```

Con `pct_canal = 0` (reserva directa) el neto es el 76 % del alojamiento.
Con `pct_canal = 0,15` (Airbnb) el neto ronda el 64,6 %.

**No inventes un mix de canal por defecto.** No existe en el repo un dato que
respalde «un X % de las reservas entran por OTA», y suponerlo sería exactamente
el defecto que esta página ya corrigió. Dos formas aceptables de resolverlo, elige
una y justifícala en el PR:

- **Rango:** mostrar el neto como una horquilla entre el caso directo (76 %) y el
  caso OTA al 15 % (64,6 %), rotulando qué extremo es cuál.
- **Control explícito:** un selector de canal con dos opciones (directa / OTA), que
  SÍ entre en la fórmula. Si lo añades, tiene que afectar al resultado — un
  control decorativo es el defecto original repetido.

Lo que no vale es un porcentaje único sin decir sobre qué canal se calcula.

---

## 3. Alcance

1. **`Projection()`** en `PropietariosContent.tsx`: fórmula del §2. Actualiza
   también el comentario del código, que hoy cita `0.78` como «comisión pactada
   22 % sobre ingresos brutos» y remite a `reserva-financials.ts`, que dice lo
   contrario.
2. **Las 16 cadenas** de los cuatro `messages/*.json`. La redacción debe enunciar
   el tipo **y** la base juntos. Referencia de `PRICING.md` §1.2, adaptada al 24 %:

   > El 24 % se aplica solo al alojamiento: descontamos primero la comisión de la
   > plataforma. Sobre el total que paga el huésped, el efecto real ronda el 18 %.
   > Hay gestoras que anuncian un porcentaje más bajo aplicado a una base más
   > grande: pida siempre la base de cálculo.

   Tradúcelo con sentido a EN, FR y DE. No calques el español palabra por palabra.
3. **El dashboard falso** de `SedaOSWindow()`: el desglose de liquidación usa
   10.890 − 2.396 − 510 = 7.984, con el comentario «Comisión = 22% sobre ingresos
   brutos». Recalcúlalo con el 24 % sobre la base correcta y actualiza el
   comentario. Es una maqueta, pero una maqueta con un número que contradice la
   FAQ de la misma página.
4. **`prop.trust.items.m179`**: el bloque de confianza anuncia el **Modelo 179**,
   suprimido por el RD 117/2024 y sustituido por el 238. Está registrado como A-03
   en `seda_os/docs/audit/PENDIENTE-ANGEL.md`. Retíralo, en los cuatro idiomas.
   **No lo sustituyas por el Modelo 238**: si el 238 es o no un servicio que SEDA
   presta es P-01 en `PENDIENTE-ASESORIA.md`, sin resolver. Afirmarlo sería
   decidirlo.

**No toques:** `lib/legal/` (PR #50 en vuelo), las páginas legales, ni el bloque
de premios del fundador.

---

## 4. Lo que NO se arregla aquí, y hay que reportar

Anótalo en el cuerpo del PR sin tocarlo, para que quede registrado:

- Bloque SEO con posiciones «#2 / #4 / #1 / #3» en cuatro keywords. Si no salen de
  Search Console, son del mismo tipo que las cifras retiradas en julio.
- «Pricing sugerido € 2.890» en la tarjeta de pricing dinámico.
- `app.sedaprivatehomes.com/os` y «v4.2.1» en la barra del dashboard falso: ese
  subdominio no consta que exista.

---

## 5. Criterios de aceptación

1. Con occ=72 % y adr=1.450 €, el neto mostrado ya NO es el 78 % del bruto.
2. Los cuatro idiomas dicen 24 % **y** enuncian la base. Ninguno dice «sobre
   ingresos brutos».
3. `npm run build` pasa. Recuerda que `scripts/check-legal-entity.mjs` corre antes
   del build: si falla por identidad, **no lo puentees** — es el PR #50 y no es
   asunto de esta sesión. Repórtalo y para.
4. Paridad de claves entre los cuatro `messages/*.json`: ninguna clave viva en un
   idioma y muerta en otro.
5. El PR explica la fórmula elegida, por qué, y los tres puntos del §4.

---

## 6. Verificación

CI en verde demuestra consistencia interna, no que el número sea correcto.

**A mano, antes del PR:** abre la pestaña «Simulador» en local, mueve los dos
deslizadores y comprueba a mano una combinación con calculadora. Pega el cálculo
en el PR. Esa comprobación manual es el punto: el defecto que arreglamos pasó
todos los tests durante meses.

**Después del deploy** (lo ejecuta Ángel): abrir `/propietarios`, pestaña
Simulador, y confirmar que la nota bajo el neto enuncia tipo y base.

---

## 7. Cierre de sesión

```bash
git status
git log --oneline -5
git branch --show-current
git log origin/fix/simulador-formula-y-rate-card --oneline -1
gh pr list --state open --head fix/simulador-formula-y-rate-card
```

Los cinco, pegados. No mergear: Ángel es el único que fusiona.

---

## Resumen para el cierre

**MODEL:** Sonnet · **EFFORT:** medium · **SESIÓN:** nueva en `seda-web`

El simulador de `/propietarios` multiplica el bruto por 0,78 e ignora la comisión
del canal, prometiendo al propietario un neto que no recibirá en reservas de OTA.
Y dieciséis cadenas en cuatro idiomas afirman «22 % sobre los ingresos brutos»,
que es falso en el porcentaje (v3 = 24 %) y en la base (nunca fue el bruto). Se
corrigen fórmula, textos, la maqueta del dashboard y el Modelo 179 derogado. No
se toca `lib/legal/` ni la fiscalidad.
