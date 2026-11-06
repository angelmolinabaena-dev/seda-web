import { CLAVE_ALMACENAMIENTO, eleccionVigente, parsearEleccion, serializarEleccion, type Eleccion } from "./consentimiento"

/*
  Controlador del consentimiento: lo único que decide cuándo se activa y cuándo
  se desactiva el píxel. Los componentes React son una piel fina encima.

  Reglas (guía de la AEPD, 2023):
  · Hasta que hay una elección VIGENTE no se activa nada. «Sin elegir» y
    «Rechazar» son lo mismo para el píxel: apagado.
  · «Aceptar», «Rechazar» y «Guardar» (en Configurar) escriben una elección con
    fecha y versión. Retirar el consentimiento es guardar `marketing: false`.
  · Una elección caducada (24 meses) o de otra versión de la política cuenta
    como «sin elegir»: el aviso vuelve a salir y el píxel no se activa.
  · Sin muro: el estado «sin elegir» solo muestra el aviso; la web sigue igual.

  El almacenamiento puede fallar (modo privado, cookies bloqueadas): entonces la
  elección vive en memoria durante la visita y no se vuelve a preguntar en cada
  página.
*/

export type AlmacenElecciones = Pick<Storage, "getItem" | "setItem">

export type PixelControlable = { activar(): void; desactivar(): void }

export type EstadoConsentimiento = {
  /** false hasta leer el almacenamiento: en el servidor y en la hidratación no se muestra nada. */
  cargado: boolean
  /** Hay una elección vigente. */
  decidido: boolean
  marketing: boolean
  panelAbierto: boolean
}

export const ESTADO_INICIAL: EstadoConsentimiento = Object.freeze({
  cargado: false,
  decidido: false,
  marketing: false,
  panelAbierto: false,
})

/** ¿Debe verse la primera capa (el aviso)? Solo si ya se miró el almacenamiento y no hay elección. */
export function mostrarAviso(e: EstadoConsentimiento): boolean {
  return e.cargado && !e.decidido && !e.panelAbierto
}

export class ControladorConsentimiento {
  private estado: EstadoConsentimiento = ESTADO_INICIAL
  private enMemoria: Eleccion | null = null
  private oyentes = new Set<() => void>()

  constructor(
    private readonly opts: {
      almacen: () => AlmacenElecciones | null
      pixel: PixelControlable
      version: string
      ahora?: () => Date
    },
  ) {}

  private ahora(): Date {
    return this.opts.ahora ? this.opts.ahora() : new Date()
  }

  private almacen(): AlmacenElecciones | null {
    try {
      return this.opts.almacen()
    } catch {
      return null
    }
  }

  private emitir(siguiente: Partial<EstadoConsentimiento>): void {
    this.estado = { ...this.estado, ...siguiente }
    for (const o of this.oyentes) o()
  }

  private leer(): Eleccion | null {
    let crudo: string | null = null
    try {
      crudo = this.almacen()?.getItem(CLAVE_ALMACENAMIENTO) ?? null
    } catch {
      crudo = null
    }
    const guardada = parsearEleccion(crudo) ?? this.enMemoria
    return eleccionVigente(guardada, this.opts.version, this.ahora()) ? guardada : null
  }

  /** Lee el almacenamiento y, si hay un «sí» vigente, activa el píxel. Llamar una vez montado en el navegador. */
  iniciar(): void {
    const e = this.leer()
    if (e?.marketing) this.opts.pixel.activar()
    else this.opts.pixel.desactivar()
    this.emitir({ cargado: true, decidido: e !== null, marketing: e?.marketing ?? false })
  }

  /** Guarda la elección y aplica sus efectos. `marketing: false` es rechazar o retirar. */
  guardar(marketing: boolean): void {
    const e: Eleccion = { version: this.opts.version, fecha: this.ahora().toISOString(), marketing }
    this.enMemoria = e
    try {
      this.almacen()?.setItem(CLAVE_ALMACENAMIENTO, serializarEleccion(e))
    } catch {
      // Sin almacenamiento: queda en memoria durante la visita.
    }
    if (marketing) this.opts.pixel.activar()
    else this.opts.pixel.desactivar()
    this.emitir({ cargado: true, decidido: true, marketing, panelAbierto: false })
  }

  aceptar(): void {
    this.guardar(true)
  }

  rechazar(): void {
    this.guardar(false)
  }

  abrirPanel(): void {
    this.emitir({ panelAbierto: true })
  }

  cerrarPanel(): void {
    this.emitir({ panelAbierto: false })
  }

  /* Contrato de useSyncExternalStore */
  suscribir = (oyente: () => void): (() => void) => {
    this.oyentes.add(oyente)
    return () => this.oyentes.delete(oyente)
  }

  instantanea = (): EstadoConsentimiento => this.estado

  marketingConcedido(): boolean {
    return this.estado.marketing
  }
}
