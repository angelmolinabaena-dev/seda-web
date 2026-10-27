import type { FichaVilla } from "@/lib/escaparate"
import type { FaqEntry } from "@/lib/faq"
import { localeUrl, SITE_URL } from "@/lib/seo-urls"
import { SITE_NAME } from "@/lib/site-pages"
import { generalContact } from "@/lib/site-contact"
import { REGION, ZONAS } from "@/lib/zonas"

/*
  JSON-LD por tipo de página. Solo datos que ya están en la web: si un campo
  no tiene fuente, no se emite (ni vacío ni con un valor de relleno).
  `tests/jsonld.test.ts` lo comprueba para los cuatro idiomas.

  `accommodationJsonLd` es la ficha de una casa del escaparate
  (lib/escaparate.ts). Solo se emite si la ficha es indexable (flag encendido
  y número de registro turístico), y solo con los campos que tienen dato.
*/

export type JsonLd = Record<string, unknown>

/**
 * JSON listo para ir DENTRO de un `<script type="application/ld+json">`: escapa
 * «<» como \u003c, de modo que un `</script>` en cualquier dato no cierre el
 * bloque ni rompa la página (REA seda-web 2026-10, M-4). Hoy los datos son del
 * repo y no es explotable; esto lo deja a prueba de datos futuros. Es JSON
 * válido: el parser lo lee igual.
 */
export const jsonLdString = (data: unknown): string => JSON.stringify(data).replace(/</g, "\\u003c")

const region = { "@type": "Place", name: REGION }

/** Cada zona de lib/zonas.ts como `Place`, dentro de la Costa del Sol. */
export const zonaPlaces = () =>
  ZONAS.map((z) => ({
    "@type": "Place",
    name: z.name,
    containedInPlace: region,
    address: { "@type": "PostalAddress", addressLocality: z.name, addressCountry: "ES" },
  }))

/**
 * Organization + LodgingBusiness del sitio, en todas las páginas.
 * Sin `priceRange` (el precio es por propiedad, no del negocio) y sin
 * `identifier` (no hay número de registro turístico real que poner): ver
 * docs/audit/VERACIDAD-PUBLICA.md §10.8/§10.9.
 */
export function businessJsonLd(): JsonLd {
  const telephone = generalContact.phone.replace(/\s/g, "")
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        email: generalContact.email,
        telephone,
      },
      {
        "@type": "LodgingBusiness",
        "@id": `${SITE_URL}/#lodgingbusiness`,
        name: SITE_NAME,
        url: SITE_URL,
        email: generalContact.email,
        telephone,
        areaServed: [region, ...zonaPlaces()],
        address: {
          "@type": "PostalAddress",
          addressRegion: REGION,
          addressCountry: "ES",
        },
      },
    ],
  }
}

export type Crumb = { name: string; path: string }

/** BreadcrumbList: portada → … → página actual. `path` sin prefijo de idioma. */
export function breadcrumbJsonLd(locale: string, trail: Crumb[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: localeUrl(locale, c.path),
    })),
  }
}

/**
 * Accommodation de una ficha del escaparate. Sin `image` (las fotos aún son
 * renders provisionales), sin `offers`/`priceRange` (el precio lo da Beds24)
 * y sin dirección exacta: municipio y región.
 */
export function accommodationJsonLd(locale: string, villa: FichaVilla, tipo: string): JsonLd {
  const e = villa.esencial
  return {
    "@context": "https://schema.org",
    "@type": villa.tipo === "apartamento" ? "Apartment" : "House",
    "@id": `${localeUrl(locale, `/villa/${villa.slug}`)}#accommodation`,
    name: villa.nombre,
    description: `${villa.nombre} · ${tipo} · ${villa.municipio}`,
    url: localeUrl(locale, `/villa/${villa.slug}`),
    address: {
      "@type": "PostalAddress",
      addressLocality: villa.municipio,
      addressRegion: REGION,
      addressCountry: "ES",
    },
    ...(villa.registroTuristico ? { identifier: villa.registroTuristico } : {}),
    ...(e.huespedes ? { occupancy: { "@type": "QuantitativeValue", maxValue: e.huespedes } } : {}),
    ...(e.dormitorios ? { numberOfBedrooms: e.dormitorios } : {}),
    ...(e.banos ? { numberOfBathroomsTotal: e.banos } : {}),
    ...(e.metros ? { floorSize: { "@type": "QuantitativeValue", value: e.metros, unitCode: "MTK" } } : {}),
    containedInPlace: { "@id": `${SITE_URL}/#lodgingbusiness` },
  }
}

/** FAQPage con las mismas preguntas que se ven en la página. */
export function faqPageJsonLd(entries: FaqEntry[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  }
}

/** /descubre — las zonas de «Presencia» como lista de `Place`. */
export function zonasJsonLd(locale: string, name: string): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${localeUrl(locale, "/descubre")}#zonas`,
    name,
    itemListElement: zonaPlaces().map((place, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: place,
    })),
  }
}
