# Tokens de diseño de seda-web → booking page de Beds24

Fuente: el código de este repo, leído el 2026-11-03 sobre `main` (`cef91ac`). Cada valor lleva el fichero
de donde sale. Los contrastes **no** se copian de los comentarios del código: se han calculado (fórmula
WCAG 2.1, luminancia relativa) a partir de los hex de abajo. Dos cifras de los comentarios del repo no
coinciden con el cálculo; están marcadas en §2.

`custom.css` declara estos mismos valores como variables `--seda-*`. Si cambia la web, cambia aquí y allí.

---

## 1 · Tipografías

Fuente: `lib/fonts.ts` (`next/font/google`, variables `--font-serif`, `--font-sans`, `--font-mono`).
La web usa Google Fonts, así que `custom.css` puede cargarlas por `@import` (lo permite el encargo).

| Rol | Familia | Pesos que carga la web | Pesos que carga `custom.css` |
|---|---|---|---|
| Titulares (`font-serif`) | Cormorant Garamond | 300, 400, 500, 600, 700 | 300, 400, 500, 600 |
| Texto (`font-sans`) | Manrope | 300, 400, 500, 600 | 400, 500, 600 |
| Etiquetas, botones, cifras (`font-mono`) | JetBrains Mono | 400, 500, 600, 700 | 500, 600 |

Se piden menos pesos que en la web a propósito: cada peso es una descarga en una página de pago.
Respaldo si Google Fonts no carga: `Georgia, serif` / `system-ui, sans-serif` / `ui-monospace, monospace`
(los mismos de `tailwind.config.ts`).

### Escala (de los componentes reales)

| Uso | Clases en la web | Valor |
|---|---|---|
| H1 | `font-serif font-light text-3xl md:text-4xl lg:text-[2.5rem] leading-[1.05] tracking-[-0.015em]` (`app/[locale]/villa/[slug]/page.tsx`, `components/value-prop.tsx`) | 30 → 36 → 40 px, peso 300, interlínea 1,05 |
| H2 editorial | `font-serif font-light text-2xl md:text-3xl lg:text-[2.25rem] leading-[1.18] tracking-[-0.01em]` (`components/editorial-break.tsx`) | 24 → 30 → 36 px |
| Precio / destacado | `font-serif font-light text-2xl` (`components/escaparate/reserva-beds24.tsx`) | 24 px |
| Texto | `text-sm leading-[1.75]` (`components/footer.tsx`) | 14 px, interlínea 1,75 |
| Etiqueta de sección | `font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground` | 11 px, 0,3 em |
| Etiqueta de campo | `font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground` | 10 px, 0,22 em |
| Botón | `font-mono text-[11px] tracking-[0.22em] uppercase` | 11 px, 0,22 em |

**Dónde `custom.css` se aparta de la web, y por qué** (accesibilidad, no estética):

- Texto de párrafo a **16 px** (la web usa 14). En un formulario de pago, 14 px es pequeño en móvil.
- Campos a **16 px** como mínimo: por debajo, iOS Safari hace zoom al enfocar el campo.
- Etiquetas de campo a **11 px** (la web, 10): 10 px en monoespaciada mayúscula es el límite de lo legible.

---

## 2 · Colores

Fuente: `app/globals.css` (bloque `:root` bajo «SEDA palette»). Los HSL de la web, convertidos a hex.
`styles/globals.css` es el *scaffold* de shadcn (blanco/negro); **no lo importa nadie** (`grep "styles/globals"` sin resultados; el
layout importa `../globals.css`, es decir `app/globals.css`) y no se ha tomado de él nada.

| Token | HSL en la web | Hex | Papel |
|---|---|---|---|
| `--background` | 36 38% 97% | `#faf8f4` | Fondo de página (cal) |
| `--card` | 36 30% 94% | `#f4f1eb` | Tarjetas |
| `--secondary` / `--muted` | 36 22% 90% | `#ebe7e0` | Secciones apagadas |
| `--border` | 36 18% 85% | `#e0dad2` | Filetes |
| `--foreground` | 36 8% 12% | `#211f1c` | Texto y botón principal |
| `--muted-foreground` | 36 6% 40% | `#6c6760` | Texto secundario |
| `--olive` (= `--primary`, `--ring`) | 88 18% 32% | `#536043` | Firma de marca, foco |
| `--olive-deep` | 88 22% 22% | `#39442c` | Olivo sobre fondos oscuros |
| `--gold` | 38 50% 50% | `#bf9040` | **Solo decorativo** (filetes, puntos) |
| `--gold-dark` | 38 60% 35% | `#8f6824` | Texto dorado sobre cal |
| `--gold-light` | 38 60% 80% | `#ebd4ad` | Texto dorado sobre olivo u oscuro |
| `--deep` | 90 8% 12% | `#1f211c` | Superficie oscura (pie, secciones) |
| `--deep-foreground` | 36 30% 94% | `#f4f1eb` | Texto sobre `--deep` |
| `--destructive` | 12 50% 40% | `#994733` | Error (terracota) |

### Contrastes calculados (WCAG 2.1; AA = 4,5:1 texto, 3:1 elementos de interfaz)

| Pareja | Ratio | Veredicto |
|---|---|---|
| foreground sobre background | 15,50 | AAA |
| foreground sobre card / secondary | 14,58 / 13,34 | AAA |
| muted-foreground sobre background | 5,28 | AA |
| muted-foreground sobre card | 4,97 | AA |
| muted-foreground sobre secondary | 4,55 | AA justo: no bajar de ahí |
| olive sobre background | 6,34 | AA (no AAA) |
| background sobre olive | 6,34 | AA |
| background sobre olive-deep | 9,72 | AAA |
| gold-dark sobre background | 4,74 | AA justo |
| gold-dark sobre card | **4,46** | **Falla AA**: no usar texto dorado sobre card |
| gold sobre background | **2,72** | Falla: solo decorativo, nunca texto |
| gold sobre deep | 5,63 | AA |
| gold-light sobre olive | 4,66 | AA |
| deep-foreground sobre deep | 14,41 | AAA |
| destructive sobre background / card | 5,99 / 5,64 | AA |
| **foreground sobre olive** | **2,44** | **Falla**: nunca texto oscuro sobre olivo |

**Dos diferencias con los comentarios de `app/globals.css`** (el código dice una cosa, el cálculo otra):

1. El comentario dice «olive / background ≈ 9:1 (AAA)». Calculado: **6,34:1** (AA). No cambia ninguna decisión,
   pero no es AAA.
2. El comentario dice «foreground / background ≈ 17:1». Calculado: **15,50:1**. Sigue siendo AAA.

**Un incumplimiento de la propia web que `custom.css` NO copia.** Los campos de la web llevan
`border-foreground/20` (`components/escaparate/reserva-beds24.tsx`): sobre `#faf8f4` el borde mide **1,50:1**.
WCAG 1.4.11 pide 3:1 para el contorno de un campo. En la booking page, que es un formulario de pago, el
borde de los campos es `#85827d` (ver `custom.css`, `--seda-field-border`), medido en 3,61:1 sobre cal, 3,40 sobre card, 3,11 sobre secondary y 3,83 sobre blanco. En la web
queda como está: no es objeto de este encargo, pero se anota en el PR.

---

## 3 · Espaciado

> **En `px`, no en `rem`.** La booking page carga Bootstrap 3, que fija `html { font-size: 10px }`: allí `1rem` mide 10 px.
> Todos los valores de `custom.css` están en `px`. Aquí se dan en px por lo mismo.

Fuente: clases de los componentes. Escala de Tailwind (4 px).

| Uso | Web | `custom.css` |
|---|---|---|
| Gutter de página | `px-6 md:px-12 lg:px-20` = 24 / 48 / 80 px | 24 / 48 / 80 px (mismos) |
| Ancho máximo de contenido | `max-w-7xl` (1280, relleno incluido), `max-w-5xl` (1024) | 1280 px con relleno = **1120 px de contenido** a 1440 px |
| Sección | `py-16 md:py-20` / `py-28 md:py-36` | 48 / 64 px (una booking page no es una portada) |
| Tarjeta | `p-6 md:p-8` | 24 / 32 px |
| Campo | `px-3 py-2.5` | 12 px laterales; altura mínima **44 px** |
| Botón | `px-7 py-3.5` | 28 px laterales; altura mínima **44 px** |
| Separación entre campos | `gap-3` (12 px) | 16 px (más aire para el dedo) |

---

## 4 · Radios

`--radius: 0rem` («editorial: no border-radius», `app/globals.css`). Las tarjetas, campos y botones de la
ficha de villa son **rectos**. Excepciones reales: los botones de la navegación son `rounded-full`
(`components/navigation.tsx`), y `.seda-card` usa `rounded-2xl` pero su propio comentario dice que no se
extiende. Para la booking page: **radio 0 en todo**, salvo puntos de 6 px (`rounded-full`) como el punto
dorado del menú.

---

## 5 · Sombras

La web casi no usa sombras: separa con **filetes de 1 px**. Las únicas:

- Menús desplegables: `shadow-xl` sobre `bg-background border border-border` (`components/navigation.tsx`).
- Maquetas de producto (`dashboard-mockup`, `guest-app-section`): sombras largas decorativas. **No se usan.**

`custom.css`: **ninguna sombra** salvo el calendario desplegable (el menú de la web: filete + `shadow-xl`).

---

## 6 · Botones

Fuente: `components/escaparate/reserva-beds24.tsx` (el «Reservar» de la ficha) y `components/editorial-break.tsx`.

| Variante | Receta en la web | En `custom.css` |
|---|---|---|
| Principal | `px-7 py-3.5 bg-foreground text-background font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-foreground/90 transition-colors` | Fondo `#211f1c`, texto `#faf8f4` (15,50:1), hover `#373532` (= foreground al 90 % sobre cal) |
| Secundario | `border border-background/40 … hover:bg-background/10` (sobre oscuro) | Borde 1 px `#211f1c`, texto `#211f1c`, hover relleno `#ebe7e0` |
| Enlace | `font-mono text-[12px] text-foreground/70 hover:text-foreground` | Subrayado fino, olivo (6,34:1) |
| Foco | `focus:ring-2 focus:ring-[hsl(var(--olive))]` (`components/skip-link.tsx`) | `outline: 2px solid #536043; outline-offset: 2px` |

El botón principal es **oscuro, no olivo**: así es el «Reservar» de la web. El olivo es el color de foco,
de enlace y de selección.

---

## 7 · Tono de los textos

Fuentes: `docs/prompts/hechos/LA-WEB-COHERENTE.md` y `LA-WEB-REVISADA-POR-UN-HUESPED.md` («de usted»,
«Sie», «vous»); `messages/es.json` (`escaparate`, `coleccion`).

- **De usted**, siempre: «Su estancia», «si desea reservar», «escríbanos». Alemán: «Sie». Francés: «vous».
- **Frases cortas y afirmativas.** Ni un solo `!` ni `¡` en `messages/es.json` (0 de 0, contado).
- **Sin promesas que no se sostengan.** La web retiró cifras inventadas (`docs/audit/VERACIDAD-PUBLICA.md`) y
  solo promete «llegada sin llaves» si la casa tiene cerradura (`incluyeVilla`). Los textos de la booking
  page siguen esa regla: lo que no consta, se deja marcado, no se redacta.
- **Quién es el arrendador, siempre dicho:** «Arrendador: {nombre} · gestiona SEDA Private Homes» y «SEDA
  Private Homes actúa en nombre y por cuenta del propietario» (`escaparate.arrendador`).
- **Imágenes:** solo fotografía real de la casa. La web rotula «Imagen ilustrativa» lo que no lo es
  (regla del 27-jul). En la booking page **no se usan** imágenes provisionales.
- Registro visual del texto: etiquetas en mayúsculas monoespaciadas y espaciadas; titulares serif ligeros;
  cuerpo sans. Ver §1.

## 8 · Lo que no se ha tomado, y por qué

- **Modo oscuro** (`.dark` en `styles/globals.css`): es el *scaffold* sin usar. La web no lo ofrece.
- **Animaciones de entrada** (`hero-rise`, `reveal`): decorativas. En una página de pago solo se conserva
  la transición de color de 300 ms, y se apaga con `prefers-reduced-motion`.
- **Vídeo, mapas, sliders**: no aplican.
