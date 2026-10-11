/*
  Zonas donde opera SEDA — la lista que pinta /descubre («Presencia»).
  Una sola fuente para la página, el JSON-LD (`Place`, `areaServed`) y
  /llms.txt: añadir una zona aquí la publica en los tres sitios.

  `image` es la foto de la tarjeta en /descubre. Son renders ilustrativos (la
  página lleva el rótulo «Imagen ilustrativa»), no fotos de la zona: por eso
  no se usan en el JSON-LD ni en llms.txt.
*/
export type Zona = { name: string; image: string }

export const ZONAS: Zona[] = [
  { name: "Marbella",  image: "/villas/villa-liria.jpg" },
  { name: "Estepona",  image: "/villas/casa-almena.jpg" },
  { name: "Benahavís", image: "/villas/casa-almazara.jpg" },
  { name: "Casares",   image: "/villas/villa-sosiego.jpg" },
  { name: "Málaga",    image: "/villas/door.jpg" },
]

/** La región que contiene las zonas. Es la misma que ya declaraba el JSON-LD del sitio. */
export const REGION = "Costa del Sol"
