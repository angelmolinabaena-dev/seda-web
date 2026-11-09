/*
  Cabecera de móvil y tablet (propuesta A2): por debajo de 1.280 px.

  · Móvil (< 768): barra de 60 px con el logo y, a la derecha y siempre a la vista, «Portal»,
    «Reservar» (o «Valorar» en páginas de propietarios) y el botón del menú.
  · Tablet (768–1.279): la franja del escritorio arriba (etiqueta + enlace, sin frase) y una barra
    de 72 px con «SEDA OS ▾», «Portal ▾», «Reservar», los idiomas en línea y el menú.
  · El botón del asistente pasa abajo a la derecha (16 px del borde, 22 px + zona segura desde abajo).

  Aquí, sin React: medidas, colores y el destino del botón de reservar, para probarlos sin navegador.
*/
import { DESTINO_PROPIETARIOS, DESTINO_VIAJEROS, type TipoPagina } from "@/lib/franja-cabecera"

/** El escritorio empieza aquí; por debajo, esta cabecera. */
export const ANCHO_ESCRITORIO = 1280
/** Desde aquí (tablet) la barra lleva los desplegables, los idiomas en línea y la franja. */
export const ANCHO_TABLET = 768

/** Alto de la barra de arriba (px). */
export const ALTO_BARRA_MOVIL = 60
export const ALTO_BARRA_TABLET = 72
/** Alto del botón «Reservar» del móvil (px). */
export const ALTO_RESERVAR_MOVIL = 40

/* Botón del asistente por debajo de 1.280 px */
export const ASISTENTE_BORDE_DERECHO = 16
export const ASISTENTE_BORDE_INFERIOR = 22
export const ASISTENTE_ALTO = 44

/** Fondo de la barra sobre la foto (el mismo que el de escritorio). */
export const VELO_BARRA_RGB = [20, 16, 14] as const
export const VELO_BARRA_ALFA = 0.68
/** Verde oliva del asistente, `--olive` hsl(88 18% 32%) = #536043. */
export const OLIVA_HEX = "#536043"

/**
 * Hay un destino de reserva propio (motor de reservas) detrás de un interruptor? No: en el repositorio no
 * existe ningún interruptor `MOTOR_RESERVAS`, así que «Reservar» va al destino de reserva de siempre
 * (`/contacto?type=guest`, el de «Solicitar estancia»). Si algún día existe, se usará aquí, solo con el
 * interruptor encendido.
 */
export function destinoReserva(): string {
  return DESTINO_VIAJEROS
}

/** El botón de reservar de la barra: «Reservar» → reserva; en páginas de propietarios, «Valorar» → propietarios. */
export function reservaDe(tipo: TipoPagina): { clave: "reservar" | "valorar"; href: string } {
  return tipo === "propietarios" ? { clave: "valorar", href: DESTINO_PROPIETARIOS } : { clave: "reservar", href: destinoReserva() }
}
