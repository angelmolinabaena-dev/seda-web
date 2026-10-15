/*
  Campos del formulario de contacto — una sola fuente para el navegador
  (`maxLength`, `required`) y para el servidor (`app/api/contact/route.ts`),
  que es quien de verdad hace cumplir los límites. El navegador sólo los
  adelanta; un `curl` se salta cualquier atributo HTML.

  Los nombres son exactamente los `name=` de GuestForm, OwnerForm y OtherForm
  en `app/[locale]/contacto/ContactoContent.tsx`. Un campo que no esté aquí se
  rechaza: lo que llega al buzón es lo que el formulario pide, nada más.
*/

export type ContactType = "guest" | "owner" | "other"

export const CONTACT_TYPES: ContactType[] = ["guest", "owner", "other"]

type FieldSpec = {
  /** Longitud máxima en caracteres, tras recortar espacios. */
  max: number
  /** Admite saltos de línea. Los de una línea los rechazan. */
  multiline?: boolean
  /** Longitud mínima si se rellena (refleja `minLength` del formulario). */
  min?: number
}

export const FIELD_SPEC = {
  name: { max: 120 },
  email: { max: 254 },
  whatsapp: { max: 40 },
  organization: { max: 160 },
  subject: { max: 200 },
  arrival: { max: 40 },
  departure: { max: 40 },
  zone: { max: 120 },
  guests: { max: 40 },
  property_type: { max: 120 },
  services: { max: 300 },
  property_location: { max: 200 },
  bedrooms: { max: 10 },
  status: { max: 200 },
  goal: { max: 300 },
  notes: { max: 4000, multiline: true },
  message: { max: 4000, multiline: true, min: 20 },
} satisfies Record<string, FieldSpec>

export type ContactField = keyof typeof FIELD_SPEC

/** Campos de cada variante; `true` = obligatorio (asterisco en el formulario). */
export const FIELDS_BY_TYPE: Record<ContactType, Partial<Record<ContactField, boolean>>> = {
  guest: {
    arrival: true,
    departure: true,
    zone: false,
    guests: true,
    property_type: false,
    services: false,
    notes: false,
    name: true,
    email: true,
    whatsapp: false,
  },
  owner: {
    property_location: true,
    property_type: true,
    bedrooms: true,
    status: false,
    goal: false,
    notes: false,
    name: true,
    email: true,
    whatsapp: false,
  },
  other: {
    name: true,
    organization: false,
    email: true,
    subject: true,
    message: true,
  },
}

/*
  Trampa para bots: un campo que ninguna persona ve ni rellena. Si llega con
  contenido, el servidor responde como si hubiera enviado y no envía nada.
*/
export const HONEYPOT_FIELD = "website"
export const HONEYPOT_MAX = 200
