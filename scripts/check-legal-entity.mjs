#!/usr/bin/env node
/*
  Puerta de publicación de las tres páginas legales.

  Corre ANTES de `next build` (ver el script `build` de package.json), así
  que corre también en el despliegue de Vercel, que ejecuta `npm run build`.
  Si falta cualquier dato identificativo, el despliegue no sale.

  ¿Por qué un script y no una comprobación dentro de las páginas? Porque en
  este sitio TODAS las rutas se renderizan bajo demanda (`next build` las
  lista como `ƒ`, no como `○`): una comprobación dentro del componente no
  llega a ejecutarse durante el build, y el fallo aparecería como un error
  500 en una página legal ya publicada. Comprobado en esta misma rama: con
  los datos a `null`, `next build` terminaba en verde. Las páginas mantienen
  además su propia comprobación en tiempo de ejecución como segunda barrera.

  El repositorio NO contiene el nombre, el NIF ni el domicilio de quien
  responde del sitio, y no se inventan. Rellénalos en
  `lib/legal/identidad.json`.
*/

import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..")
// Un primer argumento sustituye al fichero (lo usan los tests con identidades de prueba).
const FICHERO = process.argv[2] ?? join(RAIZ, "lib", "legal", "identidad.json")

/*
  Dos formas jurídicas:

    · persona_fisica (hoy): titular, nif, domicilio y proveedorCorreo.
    · sociedad: sociedad.denominacion, sociedad.cif, sociedad.domicilioSocial
      y proveedorCorreo. `sociedad.inscripcionRegistral` nunca bloquea: una
      sociedad recién constituida puede no estar inscrita todavía.

  El bloque `sociedad` a `null` NO bloquea mientras la forma sea persona_fisica:
  es la S.L. preparada, a falta de datos. El script los lista como aviso.
*/
const FORMAS = new Set(["persona_fisica", "sociedad"])

const identidad = JSON.parse(readFileSync(FICHERO, "utf8"))

const vacio = (valor) => typeof valor !== "string" || valor.trim() === ""

if (!FORMAS.has(identidad.formaJuridica)) {
  console.error(
    `\n  ✖  lib/legal/identidad.json: formaJuridica debe ser "persona_fisica" o "sociedad" (vale ${JSON.stringify(identidad.formaJuridica)}).\n`,
  )
  process.exit(1)
}

const sociedad = identidad.sociedad ?? {}
const faltanSociedad = ["denominacion", "cif", "domicilioSocial"].filter((c) => vacio(sociedad[c]))

const requeridos =
  identidad.formaJuridica === "sociedad"
    ? [
        ...faltanSociedad.map((c) => `sociedad.${c}`),
        ...(vacio(identidad.proveedorCorreo) ? ["proveedorCorreo"] : []),
      ]
    : ["titular", "nif", "domicilio", "proveedorCorreo"].filter((c) => vacio(identidad[c]))

const faltan = requeridos

if (faltan.length > 0) {
  console.error(
    [
      "",
      "  ✖  BUILD DETENIDO — las páginas legales no pueden publicarse todavía.",
      "",
      `     Forma jurídica: ${identidad.formaJuridica}. Faltan estos datos en lib/legal/identidad.json:`,
      ...faltan.map((campo) => `       · ${campo}`),
      "",
      "     Son los datos que el artículo 10 de la LSSI y el artículo 13 del",
      "     RGPD obligan a publicar para identificar a quien responde del",
      "     sitio. Mientras la S.L. no exista, son los de la persona física.",
      "",
      "     NO los rellenes con datos de ejemplo ni con una sociedad que aún",
      "     no esté inscrita. La explicación, campo por campo, está en el",
      "     encabezado de lib/legal/entity.ts.",
      "",
    ].join("\n"),
  )
  process.exit(1)
}

console.log(`✓ Datos identificativos completos (${identidad.formaJuridica}) — las páginas legales pueden publicarse.`)
if (identidad.formaJuridica === "persona_fisica" && faltanSociedad.length > 0) {
  console.log(
    [
      "",
      "  ℹ  Para pasar a la S.L. faltan en lib/legal/identidad.json (bloque «sociedad»):",
      ...faltanSociedad.map((campo) => `       · sociedad.${campo}`),
      '     (y sociedad.inscripcionRegistral cuando esté inscrita). Después, formaJuridica: "sociedad".',
      "",
    ].join("\n"),
  )
}
