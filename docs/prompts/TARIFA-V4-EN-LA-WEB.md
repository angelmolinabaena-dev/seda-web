# La tarifa v4 en la web: 24 % con tope del 20 %, alta 0 € y salida con 1 mes (seda-web)

**MODELO:** Sonnet 5.5 · **ESFUERZO:** medium. Textos públicos de precio en cuatro idiomas y sus tests de guarda.
**SESIÓN:** nueva, **local**, carpeta **`seda-web`** (`C:\Users\AngelMolina\seda-web`). Rama propia desde `origin/main`.

---

## De dónde viene

Ángel decidió el 19-oct-2026 la tarifa v4 (fuente: `seda_os/docs/PRICING.md` §2-3 y `seda_os/docs/CONTRATO-GESTION-REQUISITOS.md` §2, §6, §8, §8 bis). La web sigue con la v3: alta de 1.290 € (gratis solo para las primeras firmas) y la página de propietarios fundadores. El folleto para propietarios ya dice la v4: la web tiene que decir exactamente lo mismo.

## La tarifa v4 (textos exactos de referencia, sin IVA)

- Gestión: **24 % sobre la base neta** (bruto − comisión de la plataforma − limpieza), **nunca más del 20 % del alojamiento**.
- **Alta 0 €** (fotos profesionales, anuncios, cerradura inteligente y puesta en marcha). Si el propietario sale antes de 12 meses, abona la parte proporcional de 1.290 €.
- **Sin permanencia:** salida con 1 mes de preaviso.
- Uso propio libre avisando con 14 días (30 en julio y agosto).
- Tramitación del registro turístico: 490 €. Mantenimiento al coste hasta 200 €; 12 % de coordinación en obras mayores. Limpieza al coste, la paga el huésped. SEDA Care 129 €/mes, opcional.
- Compromisos: sin penalización por salir ni por alquilar por tu cuenta, las fotos son del propietario, se conectan sus anuncios y reseñas sin coste, ningún gasto de más de 200 € sin su aprobación, sin horas extra.

## Qué hacer

1. Localiza **todos** los sitios donde la web habla de comisión, alta/setup, fundadores o permanencia (empieza por `app/[locale]/propietarios/PropietariosContent.tsx`, `app/[locale]/founding-owners/page.tsx`, `app/[locale]/meet/page.tsx`, `messages/{es,en,de,fr}.json` y los tests que fijan esos textos). Lista lo encontrado en el informe antes de cambiar nada.
2. Sustituye la v3 por la v4 en los cuatro idiomas, con el mismo ejemplo del folleto (reserva de 1.000 € de alojamiento: por Booking/Airbnb ≈196 €; directa 200 € por el tope; importes sin IVA).
3. **Fundadores:** el beneficio fundacional era el alta gratis y ahora la tiene todo el mundo. Redirige `/founding-owners` (308) a `/propietarios` en los cuatro idiomas y quita sus enlaces del menú y del pie. No borres la página del historial de git.
4. Mantén las reglas de `docs/audit/VERACIDAD-PUBLICA.md`: ni nombres de competidores, ni «los únicos», ni cifras sin fuente.
5. Actualiza o crea los tests de guarda para que un 1.290 € de alta o un «19 % fundador» no puedan volver.

## Qué NO hacer

- **No mergees.** El PR queda abierto con el título empezando por `[NO MERGEAR · asesoría]`: el tope del 20 % y la parte proporcional del alta esperan la validación de la asesoría.
- No toques textos legales (`lib/legal/*`) ni el aviso legal.

## Informe

Lista de ficheros tocados, capturas o textos antes/después por idioma, tests en verde y el bloque de cierre.
