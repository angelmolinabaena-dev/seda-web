/*
  ─────────────────────────────────────────────────────────────────────────
  DATOS IDENTIFICATIVOS DEL TITULAR DEL SITIO — ÚNICO FICHERO QUE ÁNGEL EDITA
  ─────────────────────────────────────────────────────────────────────────

  Las tres páginas legales (/aviso-legal, /privacidad, /cookies) leen su
  bloque de identificación de aquí. No hay ningún otro sitio donde figuren
  estos datos.

  ⚠️ LOS DATOS DE LA SOCIEDAD ESTÁN A `null` A PROPÓSITO.

  La S.L. no está constituida: no hay denominación social, CIF ni inscripción
  registral. Mientras eso sea así, quien responde legalmente del sitio es la
  PERSONA FÍSICA que lo opera, y el artículo 10 de la LSSI exige publicar su
  nombre, su NIF y su domicilio. Los datos de la sociedad no están en el
  repositorio y no se inventan (el 2 de agosto se retiraron de este mismo
  sitio métricas, garantías y una licencia turística inventadas — ver
  docs/audit/VERACIDAD-PUBLICA.md; un aviso legal con datos de ejemplo sería
  el mismo error en la página que menos lo perdona).

  DÓNDE SE RELLENAN: en `lib/legal/identidad.json`, no en este fichero.
  Es un JSON aparte por una razón concreta: el guion que bloquea el build
  (`scripts/check-legal-entity.mjs`) corre en Node antes que Next, sin
  TypeScript por medio, y `JSON.parse` no puede equivocarse leyéndolo.
  Aquí queda la documentación y el tipado; allí, sólo los valores.

  QUÉ PASA SI FALTA UN DATO DE LA FORMA JURÍDICA ACTIVA:

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

  LA S.L. YA ESTÁ PREPARADA (REA seda-web 2026-10, I-7 / D-5):

    `identidad.json` lleva `formaJuridica` ("persona_fisica" hoy) y un bloque
    `sociedad` con denominacion, cif, domicilioSocial e inscripcionRegistral,
    todo a `null`. Mientras `formaJuridica` sea "persona_fisica":

      · el aviso legal dice que no hay sociedad (bloques `solo: "persona_fisica"`);
      · NINGUNA página nombra una S.L. (el pie de /meet sale de `pieLegal`).

    El día que Ángel dé razón social, CIF y domicilio social, en UN solo PR:
    rellenar `sociedad.denominacion`, `sociedad.cif` y `sociedad.domicilioSocial`
    (y `sociedad.inscripcionRegistral` cuando esté inscrita), poner
    `formaJuridica: "sociedad"` y borrar el NIF y el domicilio personales.
    `legalEntity` pasa entonces a servir los datos de la sociedad y las tres
    páginas legales, la privacidad y el pie de /meet cambian solos. Con
    "sociedad" y algún campo a `null`, el build falla (scripts/check-legal-entity.mjs).
    Qué falta hoy: `npm run check:legal`.
*/

import type { Locale } from "@/i18n/routing"
import identidad from "./identidad.json"

/**
 * Forma jurídica de quien responde del sitio. Decide qué texto legal se
 * publica y de dónde salen `titular`, `nif`, `domicilio` e `inscripcionRegistral`.
 */
export type FormaJuridica = "persona_fisica" | "sociedad"

/**
 * Contenido de `identidad.json`.
 *
 * - `formaJuridica`: "persona_fisica" mientras no haya sociedad constituida.
 * - `titular`: nombre y apellidos de la persona física, tal y como figuran en
 *   su documento de identidad.
 * - `nif`: NIF/DNI de esa persona física, con la letra.
 * - `domicilio`: domicilio a efectos de notificaciones — calle, número, código
 *   postal, municipio y provincia. Es el que la LSSI obliga a publicar; si no
 *   se quiere publicar un domicilio particular, la alternativa legítima es un
 *   domicilio profesional real (un apartado de correos no vale).
 * - `proveedorCorreo`: razón social y país del proveedor del buzón
 *   `info@sedaprivatehomes.com`. Aparece en la tabla de destinatarios de la
 *   política de privacidad. Forma esperada: "Google Ireland Ltd. (Irlanda)".
 * - `sociedad`: los datos de la S.L., a `null` hasta que existan. Denominación
 *   social, CIF y domicilio social bloquean el build SOLO si `formaJuridica`
 *   es "sociedad"; `inscripcionRegistral` no bloquea nunca (una sociedad
 *   recién constituida puede no estar inscrita todavía). Forma esperada de la
 *   inscripción: "Registro Mercantil de Málaga, tomo X, folio Y, hoja Z".
 */
type Identidad = {
  formaJuridica: FormaJuridica
  titular: string | null
  nif: string | null
  domicilio: string | null
  proveedorCorreo: string | null
  sociedad: {
    denominacion: string | null
    cif: string | null
    domicilioSocial: string | null
    inscripcionRegistral: string | null
  }
}

/** Qué datos de la sociedad faltan para poder pasar a `formaJuridica: "sociedad"`. */
export function camposSociedadPendientes(id: Identidad = identidad as Identidad): string[] {
  const { denominacion, cif, domicilioSocial } = id.sociedad
  return Object.entries({ denominacion, cif, domicilioSocial })
    .filter(([, v]) => !v?.trim())
    .map(([k]) => k)
}

/**
 * Los datos efectivos de quien responde del sitio. Con "sociedad" salen del
 * bloque `sociedad`; con "persona_fisica", de los campos de la persona.
 */
export function resolverIdentidad(id: Identidad) {
  const esSociedad = id.formaJuridica === "sociedad"
  return {
    formaJuridica: id.formaJuridica,
    titular: esSociedad ? id.sociedad.denominacion : id.titular,
    nif: esSociedad ? id.sociedad.cif : id.nif,
    domicilio: esSociedad ? id.sociedad.domicilioSocial : id.domicilio,
    proveedorCorreo: id.proveedorCorreo,
    inscripcionRegistral: esSociedad ? id.sociedad.inscripcionRegistral : null,
  }
}

const { formaJuridica, titular, nif, domicilio, proveedorCorreo, inscripcionRegistral } = resolverIdentidad(
  identidad as Identidad,
)

export const legalEntity = {
  formaJuridica,
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

/**
 * ¿Se publica este bloque con la forma jurídica activa? Un párrafo con
 * `solo: "persona_fisica"` o `solo: "sociedad"` solo sale con esa forma; sin
 * `solo`, siempre. El resto de bloques, siempre.
 */
export function bloqueAplica(bloque: { tipo: string; solo?: FormaJuridica }, forma: FormaJuridica = legalEntity.formaJuridica): boolean {
  return !bloque.solo || bloque.solo === forma
}

/**
 * Línea de pie de página que identifica a quien responde, para las páginas que
 * no son legales (/meet). Sale de los mismos datos que el aviso legal: con
 * persona física no nombra ninguna sociedad ni ninguna sede; con sociedad,
 * nombra la sociedad y su domicilio social.
 */
export function pieLegal(locale: Locale, e: Pick<typeof legalEntity, "formaJuridica" | "titular" | "domicilio" | "nombreComercial"> = legalEntity): string {
  if (e.formaJuridica === "sociedad" && e.titular && e.domicilio) return `${e.titular} · ${e.domicilio}`
  const pais = { es: "España", en: "Spain", fr: "Espagne", de: "Spanien" }[locale]
  return `${e.nombreComercial} · Costa del Sol · ${pais}`
}

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
