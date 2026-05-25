/*
  Catálogo curado de villas Seda Private Homes — nombres alineados con la
  canonical brand list. Imágenes generadas con fal.ai Nano Banana Pro como
  placeholder de alta fidelidad hasta que existan fotos profesionales reales.
*/

export type Villa = {
  slug: string
  prefix: string
  italic: string
  sublocation: string
  capacity: string
  description: string
  image: string
}

export const VILLAS: Villa[] = [
  {
    slug: "villa-alboran",
    prefix: "Villa",
    italic: "Alborán",
    sublocation: "Marbella, Costa del Sol",
    capacity: "8 huéspedes · 4 suites · 400 m² · piscina infinita",
    description:
      "Una residencia contemporánea con piscina infinita y vistas abiertas al Mediterráneo, en Marbella. Arquitectura de líneas largas que privilegia la luz, los olivos centenarios del jardín y el mar como horizonte permanente.",
    image: "/villas/villa-liria.jpg",
  },
  {
    slug: "atico-marina-puerto-banus",
    prefix: "Ático",
    italic: "Marina",
    sublocation: "Puerto Banús, Costa del Sol",
    capacity: "4 huéspedes · 2 suites · 280 m² · vistas panorámicas",
    description:
      "Ático con vistas panorámicas sobre Puerto Banús — terraza envolvente, materiales contemporáneos y la cercanía discreta al muelle. Para estancias urbanas sin renunciar al mar.",
    image: "/villas/casa-almazara.jpg",
  },
  {
    slug: "finca-los-olivos-casares",
    prefix: "Finca",
    italic: "Los Olivos",
    sublocation: "Casares, Costa del Sol",
    capacity: "10 huéspedes · 5 suites · 390 m² · spa privado",
    description:
      "Una finca andaluza entre olivos centenarios en las colinas de Casares — spa privado, patio interior con limonero y la quietud de la sierra. Para reuniones largas, familias o grupos que buscan retiro.",
    image: "/villas/villa-sosiego.jpg",
  },
  {
    slug: "residencia-duna-estepona",
    prefix: "Residencia",
    italic: "Duna",
    sublocation: "Estepona, Costa del Sol",
    capacity: "6 huéspedes · 3 suites · 460 m² · primera línea de playa",
    description:
      "Residencia a primera línea de playa en Estepona — terrazas en cascada, acceso directo a la arena y arquitectura minimalista que cede el protagonismo al horizonte. La estancia más cercana al mar de la colección.",
    image: "/villas/casa-almena.jpg",
  },
]

export function getVillaBySlug(slug: string): Villa | undefined {
  return VILLAS.find((v) => v.slug === slug)
}
