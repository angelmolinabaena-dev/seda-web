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
const FICHERO = join(RAIZ, "lib", "legal", "identidad.json")

/*
  `inscripcionRegistral` es la única excepción: hoy vale `null` porque no hay
  sociedad inscrita, y eso es un hecho cierto, no un dato pendiente.
*/
const OPCIONALES = new Set(["_leeme", "inscripcionRegistral"])

const identidad = JSON.parse(readFileSync(FICHERO, "utf8"))

const faltan = Object.entries(identidad)
  .filter(([campo]) => !OPCIONALES.has(campo))
  .filter(([, valor]) => typeof valor !== "string" || valor.trim() === "")
  .map(([campo]) => campo)

if (faltan.length > 0) {
  console.error(
    [
      "",
      "  ✖  BUILD DETENIDO — las páginas legales no pueden publicarse todavía.",
      "",
      "     Faltan estos datos en lib/legal/identidad.json:",
      ...faltan.map((campo) => `       · ${campo}`),
      "",
      "     Son los datos que el artículo 10 de la LSSI y el artículo 13 del",
      "     RGPD obligan a publicar para identificar a quien responde del",
      "     sitio. Mientras la S.L.U. no exista, son los de la persona física.",
      "",
      "     NO los rellenes con datos de ejemplo ni con una sociedad que aún",
      "     no esté inscrita. La explicación, campo por campo, está en el",
      "     encabezado de lib/legal/entity.ts.",
      "",
    ].join("\n"),
  )
  process.exit(1)
}

console.log("✓ Datos identificativos completos — las páginas legales pueden publicarse.")
