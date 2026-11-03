/*
  Orígenes con permiso para enmarcar el visor (`frame-ancestors`) y, si algún
  día los tiles salen de /public, orígenes desde los que el visor puede cargarlos.

  UNA sola lista, tres consumidores que no pueden divergir:
    · vercel.json  → regla `/tour/(.*)`: `frame-ancestors 'self' <ORIGENES_EMBEBIDO>`
    · este módulo  → lo que el código cree que está permitido
    · tests/tour360-cabeceras.test.ts → falla si vercel.json y esta lista difieren

  Cada origen lleva su fuente. Sin fuente no entra.
*/

export const ORIGENES_EMBEBIDO = [
  // Guest-app. Fuente: components/navigation.tsx (GUEST_APP_URL) y
  // app/[locale]/guestapp/GuestappContent.tsx (URL_HUESPED).
  "https://guests.sedaprivatehomes.com",
  // Booking page de Beds24. Fuente: lib/escaparate.ts (BEDS24_BOOKING_URL =
  // https://beds24.com/booking2.php). La descripción de la casa se pinta ahí.
  "https://beds24.com",
  // «www» NO consta como origen de la booking page; se incluye por si Beds24
  // sirve la misma página con www. Es del mismo propietario y solo concede
  // permiso para enmarcar un visor sin datos. Si se comprueba que no hace falta, se quita.
  "https://www.beds24.com",
] as const

/**
 * Orígenes EXTERNOS permitidos para los tiles (`tiles.base` absoluto en tour.json).
 * Vacío a propósito: hoy los tiles se sirven desde el propio dominio (/tours/…).
 * Si se elige Supabase Storage o Vercel Blob (docs/TOUR-360.md §3), se añade AQUÍ
 * el origen exacto del bucket y, en el mismo PR, a `img-src` y `connect-src` de
 * la regla `/tour/(.*)` de vercel.json; el test de cabeceras exige que coincidan.
 */
export const ORIGENES_TILES_EXTERNOS: readonly string[] = []
