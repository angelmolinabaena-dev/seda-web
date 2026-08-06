/*
  ─────────────────────────────────────────────────────────────────────────
  DATOS IDENTIFICATIVOS DEL TITULAR DEL SITIO — ÚNICO FICHERO QUE ÁNGEL EDITA
  ─────────────────────────────────────────────────────────────────────────

  Las tres páginas legales (/aviso-legal, /privacidad, /cookies) leen su
  bloque de identificación de aquí. No hay ningún otro sitio donde figuren
  estos datos.

  ⚠️ TRES CAMPOS ESTÁN A `null` A PROPÓSITO.

  La S.L.U. no está constituida: no hay denominación social, NIF de sociedad
  ni inscripción registral. Mientras eso sea así, quien responde legalmente
  del sitio es la PERSONA FÍSICA que lo opera, y el artículo 10 de la LSSI
  exige publicar su nombre, su NIF y su domicilio. Esos datos no están en el
  repositorio y no se inventan (el 2 de agosto se retiraron de este mismo
  sitio métricas, garantías y una licencia turística inventadas — ver
  docs/audit/VERACIDAD-PUBLICA.md; un aviso legal con datos de ejemplo sería
  el mismo error en la página que menos lo perdona).

  DÓNDE SE RELLENAN: en `lib/legal/identidad.json`, no en este fichero.
  Es un JSON aparte por una razón concreta: el guion que bloquea el build
  (`scripts/check-legal-entity.mjs`) corre en Node antes que Next, sin
  TypeScript por medio, y `JSON.parse` no puede equivocarse leyéndolo.
  Aquí queda la documentación y el tipado; allí, sólo los cinco valores.

  QUÉ PASA SI SE DEJAN A `null`:

    · `npm run build` FALLA antes de arrancar Next, con un error que nombra
      los campos que faltan — y con él falla el despliegue en Vercel, que
      ejecuta ese mismo script. Es decir: este trabajo no puede llegar a
      producción sin los datos. Es deliberado: un TODO en la descripción de
      un PR se olvida; un despliegue que no sale, no.
    · Las páginas comprueban además lo mismo en tiempo de ejecución
      (`exigirIdentidad`), por si alguien se salta el script cambiando el
      Build Command del proyecto en Vercel.
    · En desarrollo (`next dev`) las páginas SÍ renderizan, con un aviso
      rojo arriba que lista lo que falta, para poder revisar el texto sin
      tener los datos.

  EL DÍA QUE EXISTA LA SOCIEDAD:

    Se sustituye la persona física por la sociedad — `titular` pasa a ser la
    denominación social, `nif` el CIF, `domicilio` el domicilio social — y se
    RELLENA `inscripcionRegistral`, que hoy es `null` porque no hay registro
    que citar. Ese campo no bloquea el build: su ausencia es hoy la verdad,
    no un dato pendiente.
*/

import type { Locale } from "@/i18n/routing"
import identidad from "./identidad.json"

/**
 * Los cinco campos de `identidad.json`, ya tipados.
 *
 * - `titular`: nombre y apellidos de la persona física titular del sitio,
 *   tal y como figuran en su documento de identidad. Cuando exista la
 *   S.L.U., su denominación social.
 * - `nif`: NIF/DNI de esa persona física, con la letra. Después, el CIF de
 *   la sociedad.
 * - `domicilio`: domicilio a efectos de notificaciones — calle, número,
 *   código postal, municipio y provincia. Es el que la LSSI obliga a
 *   publicar; si no se quiere publicar un domicilio particular, la
 *   alternativa legítima es un domicilio profesional real (un apartado de
 *   correos no vale como domicilio).
 * - `proveedorCorreo`: razón social y país del proveedor del buzón
 *   `info@sedaprivatehomes.com`. Aparece en la tabla de destinatarios de la
 *   política de privacidad, porque el mensaje del formulario acaba viviendo
 *   ahí. Forma esperada: "Google Ireland Ltd. (Irlanda)".
 * - `inscripcionRegistral`: `null` mientras no haya sociedad inscrita. NO
 *   bloquea el build — hoy su ausencia es un hecho cierto, no un dato que
 *   falte. El día que se inscriba: "Registro Mercantil de Málaga, tomo X,
 *   folio Y, hoja Z".
 */
type Identidad = {
  titular: string | null
  nif: string | null
  domicilio: string | null
  proveedorCorreo: string | null
  inscripcionRegistral: string | null
}

const { titular, nif, domicilio, proveedorCorreo, inscripcionRegistral } =
  identidad as Identidad

export const legalEntity = {
  titular,
  nif,
  domicilio,
  proveedorCorreo,
  inscripcionRegistral,

  // ── Verificados en el repositorio ─────────────────────────────────────
  /** `lib/site-contact.ts` — buzón real del dominio. */
  email: "info@sedaprivatehomes.com",
  /** `lib/site-contact.ts`. */
  telefono: "+34 686 980 798",
  nombreComercial: "SEDA Private Homes",
  dominio: "sedaprivatehomes.com",
} satisfies Record<string, string | null>

/*
  `dpd@sedaprivatehomes.com` NO se usa en ninguna de las tres páginas.
  El comentario de `app/api/contact/route.ts:18` — escrito al endurecer el
  formulario en el PR #36 — dice que los únicos buzones reales del dominio
  son `info@` y `reservas@`. Publicar una dirección para ejercer derechos
  que nadie lee es peor que no publicarla: el artículo 12 del RGPD obliga a
  facilitar el ejercicio, no a aparentarlo. Si `dpd@` llega a existir como
  buzón atendido, se añade aquí y las páginas lo recogen solas.
*/

export type CampoIdentidad = "titular" | "nif" | "domicilio" | "proveedorCorreo"

/** Campos que cada documento necesita para poder publicarse sin mentir. */
export const REQUISITOS = {
  /** LSSI art. 10: nombre, NIF y domicilio del prestador. */
  "aviso-legal": ["titular", "nif", "domicilio"],
  /** RGPD art. 13.1.a (identidad del responsable) + tabla de destinatarios. */
  privacidad: ["titular", "proveedorCorreo"],
  /** Nombra a quien instala la cookie. */
  cookies: ["titular"],
} as const satisfies Record<string, readonly CampoIdentidad[]>

export type DocumentoId = keyof typeof REQUISITOS

export function camposPendientes(documento: DocumentoId): CampoIdentidad[] {
  return REQUISITOS[documento].filter((campo) => !legalEntity[campo])
}

/**
 * Puerta de publicación. En producción (incluido `next build`) lanza si
 * falta cualquier dato exigido por el documento; fuera de producción
 * devuelve la lista para que la página la pinte como aviso visible.
 */
export function exigirIdentidad(documento: DocumentoId): CampoIdentidad[] {
  const faltan = camposPendientes(documento)
  if (faltan.length > 0 && process.env.NODE_ENV === "production") {
    throw new Error(
      [
        "",
        `╔══════════════════════════════════════════════════════════════════╗`,
        `  BUILD DETENIDO — /${documento} no puede publicarse todavía.`,
        `╚══════════════════════════════════════════════════════════════════╝`,
        `  Faltan estos datos en lib/legal/identidad.json:`,
        ...faltan.map((c) => `    · ${c}`),
        "",
        `  No los rellenes con datos de ejemplo: son los que identifican`,
        `  legalmente a quien responde del sitio. Ver el encabezado de`,
        `  lib/legal/entity.ts.`,
        "",
      ].join("\n"),
    )
  }
  return faltan
}

/**
 * Sustituye `{campo}` por su valor en cualquier texto de los documentos.
 * Un campo pendiente se marca en el texto de forma evidente — sólo puede
 * verse en desarrollo, porque en producción `exigirIdentidad` ya ha
 * detenido el build.
 */
export function resolverTokens(texto: string): string {
  return texto.replace(/\{(\w+)\}/g, (original, campo: string) => {
    if (!(campo in legalEntity)) return original
    const valor = legalEntity[campo as keyof typeof legalEntity]
    return valor ?? `«${campo.toUpperCase()} PENDIENTE»`
  })
}

/** Etiquetas del bloque de identificación, por idioma. */
export const ETIQUETAS_IDENTIFICACION: Record<
  Locale,
  {
    titular: string
    nif: string
    domicilio: string
    email: string
    telefono: string
    nombreComercial: string
    dominio: string
    inscripcion: string
    sinInscripcion: string
  }
> = {
  es: {
    titular: "Titular",
    nif: "NIF",
    domicilio: "Domicilio",
    email: "Correo electrónico",
    telefono: "Teléfono",
    nombreComercial: "Nombre comercial",
    dominio: "Sitio web",
    inscripcion: "Inscripción registral",
    sinInscripcion: "No procede: no existe sociedad inscrita",
  },
  en: {
    titular: "Owner",
    nif: "Tax ID (NIF)",
    domicilio: "Address",
    email: "Email",
    telefono: "Telephone",
    nombreComercial: "Trading name",
    dominio: "Website",
    inscripcion: "Company register",
    sinInscripcion: "Not applicable: no company is registered",
  },
  fr: {
    titular: "Titulaire",
    nif: "Numéro fiscal (NIF)",
    domicilio: "Adresse",
    email: "Courriel",
    telefono: "Téléphone",
    nombreComercial: "Nom commercial",
    dominio: "Site web",
    inscripcion: "Immatriculation",
    sinInscripcion: "Sans objet : aucune société n'est immatriculée",
  },
  de: {
    titular: "Inhaber",
    nif: "Steuernummer (NIF)",
    domicilio: "Anschrift",
    email: "E-Mail",
    telefono: "Telefon",
    nombreComercial: "Geschäftsbezeichnung",
    dominio: "Website",
    inscripcion: "Handelsregister",
    sinInscripcion: "Nicht zutreffend: keine eingetragene Gesellschaft",
  },
}
