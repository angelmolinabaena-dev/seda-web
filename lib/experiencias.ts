/*
  Catálogo de experiencias — las nueve tarjetas de /experiencias. Una sola
  fuente para la página y para /llms.txt. El título y la línea de cada una
  viven en messages/<locale>.json bajo `exp.catalog.items.<id>`.

  `image` es la foto de la tarjeta (render ilustrativo): no sale en llms.txt.
*/
export const EXPERIENCIAS = [
  { id: "chef",     image: "/villas/services/chef.jpg" },
  { id: "beach",    image: "/villas/services/beach-clubs.jpg" },
  { id: "wellness", image: "/villas/services/wellness.jpg" },
  { id: "transfer", image: "/villas/services/transfer.jpg" },
  { id: "golf",     image: "/villas/services/limpieza.jpg" },
  { id: "yates",    image: "/villas/services/actividades.jpg" },
  { id: "familias", image: "/villas/journey-antes.jpg" },
  { id: "cultura",  image: "/villas/journey-durante.jpg" },
  { id: "reservas", image: "/villas/services/experiencias.jpg" },
] as const
