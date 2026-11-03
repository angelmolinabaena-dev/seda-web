# Textos de la booking page de Beds24 (es · en · de · fr · it)

Los textos que hoy están vacíos en la booking page. De usted en todos los idiomas («Sie», «vous», «Lei»), como
el resto de la web (`TOKENS.md` §7).

## Cómo leer las marcas

| Marca | Significa |
|---|---|
| **REPO** | Literal de `messages/<idioma>.json` (es, en, fr, de). La versión **it** no existe en la web: es traducción nueva y lleva la marca **IT-NUEVO**. |
| **ENCARGO** | Cifra o regla dada por Ángel en el encargo. **No está escrita en ningún fichero de los repos accesibles** (`docs/audit/REA-SEDA-WEB-2026-10.md`, cabecera: «Ninguna de ellas está escrita en un fichero de los repos»). La redacción es nueva; la cifra no. |
| **NUEVO** | Texto redactado en este PR. Pendiente de revisión de Ángel antes de pegarlo. |
| **⛔ PENDIENTE** | Falta la fuente. **No se ha redactado ni inventado.** Dice qué falta y dónde buscarlo. |

`{nombre}`, `{municipio}`, `{desde}`, `{hasta}` y `{numero}` son huecos: se sustituyen al pegar, por propiedad.
Para **Bay Side**: `{nombre}` = Bay Side, `{municipio}` = Estepona, entrada 16:00–24:00, salida 10:00
(`lib/escaparate.ts`, leído de Beds24 el 15-oct-2026).

> **Antes de pegar nada: Bay Side no tiene número de registro turístico ni arrendador en el repo**
> (`registroTuristico: null`, `arrendador: null` en `lib/escaparate.ts`). La web **no publica** una casa así
> (`esPublicable`; REA seda-web 2026-10, B-1) porque en Andalucía el anuncio debe llevar su número de inscripción.
> Una booking page con «Reservar» y pago es ese anuncio. Ver §7.

---

## 1 · Bienvenida — NUEVO (con la plantilla del arrendador: REPO)

| Idioma | Texto |
|---|---|
| es | Le damos la bienvenida a {nombre}, en {municipio}, Costa del Sol. Elija sus fechas, consulte el precio final y reserve en esta página: la disponibilidad, el precio y el pago se gestionan aquí. |
| en | Welcome to {nombre}, in {municipio}, on the Costa del Sol. Choose your dates, see the final price and book on this page: availability, price and payment are handled here. |
| de | Willkommen in {nombre} in {municipio} an der Costa del Sol. Wählen Sie Ihre Daten, sehen Sie den Endpreis und buchen Sie auf dieser Seite: Verfügbarkeit, Preis und Zahlung laufen hier. |
| fr | Bienvenue à {nombre}, à {municipio}, sur la Costa del Sol. Choisissez vos dates, consultez le prix final et réservez sur cette page : la disponibilité, le prix et le paiement sont gérés ici. |
| it (IT-NUEVO) | Le diamo il benvenuto a {nombre}, a {municipio}, sulla Costa del Sol. Scelga le date, consulti il prezzo finale e prenoti in questa pagina: disponibilità, prezzo e pagamento si gestiscono qui. |

Lo que afirma está sostenido por la propia web: «La disponibilidad, el precio final y el pago se gestionan en la
página de reserva de Beds24» (`escaparate.reserva.nota`). No promete nada más.

**Línea del arrendador** (va justo debajo, `escaparate.arrendador.linea`) — **REPO** en es/en/fr/de:

| Idioma | Texto |
|---|---|
| es | Arrendador: {nombre del propietario} · gestiona SEDA Private Homes |
| en | Lessor: {nombre del propietario} · managed by SEDA Private Homes |
| de | Vermieter: {nombre del propietario} · verwaltet von SEDA Private Homes |
| fr | Bailleur : {nombre del propietario} · géré par SEDA Private Homes |
| it (IT-NUEVO) | Locatore: {nombre del propietario} · gestito da SEDA Private Homes |

**⛔ PENDIENTE: el nombre del propietario de Bay Side.** `arrendador: null` en `lib/escaparate.ts`: «tal y como
figura en el contrato de gestión (nombre o razón social)… No se inventa». Lo da Ángel.

Y la nota (`escaparate.arrendador.nota`, **REPO** es/en/fr/de; ya va en el pie, `footer.html`):
«SEDA Private Homes actúa en nombre y por cuenta del propietario.» / «SEDA Private Homes acts in the owner's
name and on the owner's behalf.» / «SEDA Private Homes handelt im Namen und für Rechnung des Eigentümers.» /
«SEDA Private Homes agit au nom et pour le compte du propriétaire.» / it (IT-NUEVO): «SEDA Private Homes agisce
in nome e per conto del proprietario.»

---

## 2 · Qué incluye — REPO (es/en/fr/de) · IT-NUEVO

Fuente: `escaparate.incluye.*`. La web **solo promete lo que la casa tiene** (`incluyeVilla`): «llegada sin llaves»
solo si hay cerradura conectada.

**Bay Side → solo estas dos.** Bay Side no tiene `nuki_id` ni `nuki_code` en la base (comentario en
`lib/escaparate.ts`, REA-GLOBAL-PLATAFORMA 2026-10 §1; `cerradura: false`). **No se incluye «llegada sin llaves».**

| Idioma | Concierge | Limpieza |
|---|---|---|
| es | Sofía, la concierge virtual de SEDA, en la Guest App durante toda la estancia. | Limpieza profesional antes de su llegada. |
| en | Sofía, SEDA's virtual concierge, in the Guest App throughout your stay. | Professional cleaning before you arrive. |
| de | Sofía, die virtuelle Concierge von SEDA, während des gesamten Aufenthalts in der Guest App. | Professionelle Reinigung vor Ihrer Ankunft. |
| fr | Sofía, la concierge virtuelle de SEDA, dans la Guest App pendant tout votre séjour. | Ménage professionnel avant votre arrivée. |
| it (IT-NUEVO) | Sofía, la concierge virtuale di SEDA, nella Guest App per tutto il soggiorno. | Pulizia professionale prima del suo arrivo. |

Título del bloque: es «Lo que incluye SEDA» · en «What SEDA includes» · de «Was SEDA einschließt» · fr «Ce que SEDA
inclut» · it (IT-NUEVO) «Che cosa include SEDA».

Para una casa con cerradura conectada, añadir (REPO): es «Llegada sin llaves: acceso inteligente y check-in
autónomo, con las instrucciones en la Guest App.» · en «Keyless arrival: smart access and self check-in, with the
instructions in the Guest App.» · de «Ankunft ohne Schlüssel: smarter Zugang und Self-Check-in, mit allen Hinweisen
in der Guest App.» · fr «Arrivée sans clés : accès intelligent et check-in autonome, avec les instructions dans la
Guest App.» · it (IT-NUEVO) «Arrivo senza chiavi: accesso intelligente e check-in autonomo, con le istruzioni
nella Guest App.»

---

## 3 · Check-in y check-out — REPO (es/en/fr/de) · IT-NUEVO

Fuente: `escaparate.horario.*`; valores de Bay Side de `lib/escaparate.ts` (Beds24: `checkInStart` 16:00,
`checkInEnd` 24:00, `checkOutEnd` 10:00; leído el 15-oct-2026).

| Idioma | Título | Entrada | Salida |
|---|---|---|---|
| es | Entrada y salida | Entrada de 16:00 a 24:00 | Salida hasta las 10:00 |
| en | Check-in and check-out | Check-in from 16:00 to 24:00 | Check-out by 10:00 |
| de | Check-in und Check-out | Check-in von 16:00 bis 24:00 Uhr | Check-out bis 10:00 Uhr |
| fr | Arrivée et départ | Arrivée de 16:00 à 24:00 | Départ jusqu'à 10:00 |
| it (IT-NUEVO) | Check-in e check-out | Check-in dalle 16:00 alle 24:00 | Check-out entro le 10:00 |

---

## 4 · Pago: 30 % al reservar y 70 % 14 días antes — ENCARGO · NUEVO

| Idioma | Texto |
|---|---|
| es | Pago: el 30 % al reservar y el 70 % restante 14 días antes de la llegada. |
| en | Payment: 30% when you book and the remaining 70% 14 days before arrival. |
| de | Zahlung: 30 % bei der Buchung und die restlichen 70 % 14 Tage vor der Anreise. |
| fr | Paiement : 30 % à la réservation et les 70 % restants 14 jours avant l'arrivée. |
| it | Pagamento: il 30 % al momento della prenotazione e il restante 70 % 14 giorni prima dell'arrivo. |

Aritmética comprobada a mano con el ejemplo de la preview: 30 % de 600,00 € = 180,00 €; 70 % = 420,00 €; 14 días
antes del 12-dic-2026 = 28-nov-2026.

**⛔ PENDIENTE (no hay fuente; no se redacta):**
- Qué pasa si se reserva con **menos de 14 días** de antelación (¿se cobra el 100 % al reservar?).
- Medio de pago y moneda de cobro; si el 70 % se cobra automáticamente o hay que reclamarlo.
- Si los importes llevan IVA: la REA habla de «servicios con IVA incluido» (`REA-SEDA-WEB-2026-10.md`, B-2.3) pero
  no dice sobre qué importes. Es fiscal: lo confirma la asesoría, no este PR.

---

## 5 · Fianza: «hasta 400 € según la estancia» — ENCARGO · NUEVO

| Idioma | Texto |
|---|---|
| es | Fianza: hasta 400 € según la estancia. |
| en | Security deposit: up to €400, depending on the stay. |
| de | Kaution: bis zu 400 € je nach Aufenthalt. |
| fr | Caution : jusqu'à 400 € selon le séjour. |
| it | Cauzione: fino a 400 € a seconda del soggiorno. |

**⛔ PENDIENTE (la REA llama a esto «fianza V2» y no la define):**
- Cómo se calcula «según la estancia» (¿por noches? ¿por tramos?). **No se ha inventado ninguna escala.**
- Si se **cobra** o se **retiene** en la tarjeta, cuándo y en cuántos días se devuelve, y qué cubre.

---

## 6 · Política de cancelación — ⛔ PENDIENTE (todo)

**No se ha redactado ni una frase de política.** La REA dice que la cancelación es «por tramos» y que el texto «ya
está en Beds24, en 4 idiomas» (`REA-SEDA-WEB-2026-10.md`, B-2.3), pero:

1. Ese fichero cita la fuente como `docs/POLITICA-CANCELACION.md` (línea 73), que **no está en seda-web**. Vive en
   otro repo (`seda_os` o `portal-propietarios`), y **ninguno es accesible desde esta sesión** (solo `seda-web` y
   `seda-claude`).
2. Los tramos y porcentajes son dinero que se muestra a un huésped: sin fuente, no se escriben.
3. Ese texto ya existe en Beds24 (según la REA, sin contrastar: la booking page no se pudo abrir). **No hace falta
   pegar uno nuevo: hay que comprobar el que hay.** Si Cowork lo ve en el panel, basta con confirmar que dice lo
   mismo que `docs/POLITICA-CANCELACION.md` y que está en los cinco idiomas (el italiano no está en la web).

Plantilla para cuando exista la fuente:

```
Cancelación: {tramo 1 — PENDIENTE}; {tramo 2 — PENDIENTE}; {tramo 3 — PENDIENTE}.
```

---

## 7 · Datos legales y fiscales de la ficha

| Dato | Estado | Fuente / qué falta |
|---|---|---|
| «Actúa en nombre y por cuenta del propietario» | **REPO** | `escaparate.arrendador.nota` (§1) |
| Nombre del arrendador | **⛔ PENDIENTE** | `arrendador: null`. Lo da Ángel (contrato de gestión). |
| Número de registro turístico (VFT) | **⛔ PENDIENTE** | `registroTuristico: null`. Plantilla **REPO**: es «Registro turístico: {numero}» · en «Tourist registration: {numero}» · de «Touristische Registrierung: {numero}» · fr «Enregistrement touristique : {numero}» · it (IT-NUEVO) «Registro turistico: {numero}». |
| IVA / factura de la estancia | **⛔ PENDIENTE** | Fiscal. No hay fuente en este repo. |
| Impuesto turístico | **⛔ PENDIENTE** | No consta en ningún fichero de este repo. No se afirma que exista ni que no. |
| Condiciones de la estancia (aceptación) | Dependen de §4, §5 y §6 | El aviso legal dice que «se muestran y se aceptan en la página de reserva» (`lib/legal/aviso-legal.ts`, apartado de información). Esta página es donde se aceptan: no puede ir vacía. |

---

## 8 · Textos nuevos de `header.html` y `footer.html` — NUEVO

No están en `messages/*.json`; son de este PR. Los de es/en/fr/de siguen los nombres que ya usa la web
(`legal.links.*`), salvo los que se indican.

| Dónde | es | en | de | fr | it (IT-NUEVO) |
|---|---|---|---|---|---|
| Enlace de vuelta | Volver a la web | Back to the website | Zurück zur Website | Retour au site | Torna al sito |
| Etiqueta «Contacto» | Contacto | Contact | Kontakt | Contact | Contatti |
| Privacidad | Privacidad | Privacy | Datenschutz | Confidentialité | Privacy |
| Aviso legal y condiciones | Aviso legal y condiciones | Legal notice and terms | Impressum und Bedingungen | Mentions légales et conditions | Note legali e condizioni |
| Región | Costa del Sol · Andalucía | Costa del Sol · Andalucía | Costa del Sol · Andalusien | Costa del Sol · Andalousie | Costa del Sol · Andalusia |

**Decisión a revisar (Ángel):** el encargo pide «privacidad y condiciones». La web **no tiene** una página de
«condiciones de reserva». El enlace «Aviso legal y condiciones» lleva a `/aviso-legal`, que sí tiene el apartado
«Condiciones de uso» de la web (`lib/legal/aviso-legal.ts`). Las condiciones de la estancia son §4–§6. Si Ángel quiere
una página propia de condiciones de reserva, hay que crearla (texto legal) y cambiar el enlace.

**El italiano no existe en la web** (`i18n/routing.ts`: `es`, `en`, `fr`, `de`). Los enlaces del pie en italiano
llevan a la versión inglesa. Mientras no haya `/it`, es lo menos malo; no se ha creado una ruta.
