import { useSyncExternalStore } from "react"

/*
  El asistente de propietarios se monta página a página (portada, /propietarios, calculadora y
  /founding-owners) y solo con SEDA_FLAG_ASISTENTE_PROPIETARIOS=1. La cabecera, que vive en el layout,
  necesita saber si está montado (para mostrar la tarjeta «Asistente SEDA» del menú del móvil) y poder
  abrirlo. Este almacén mínimo se lo cuenta, sin importar el componente del asistente: apagado, la
  cabecera no carga nada de él.
*/

type Estado = { montado: boolean; abrir: (() => void) | null }
let estado: Estado = { montado: false, abrir: null }
const oyentes = new Set<() => void>()

function emitir(nuevo: Estado) {
  estado = nuevo
  oyentes.forEach((o) => o())
}

/** Lo llama el componente del asistente al montarse; devuelve la función que lo desmonta. */
export function registrarAsistente(abrir: () => void): () => void {
  emitir({ montado: true, abrir })
  return () => emitir({ montado: false, abrir: null })
}

export function abrirAsistente(): void {
  estado.abrir?.()
}

const suscribir = (o: () => void) => {
  oyentes.add(o)
  return () => {
    oyentes.delete(o)
  }
}

/** ¿Está el asistente montado en esta página? (falso en el servidor y en el primer pintado) */
export function useAsistenteMontado(): boolean {
  return useSyncExternalStore(
    suscribir,
    () => estado.montado,
    () => false,
  )
}

/** Solo para los tests. */
export function reiniciarMontajeParaTests(): void {
  estado = { montado: false, abrir: null }
  oyentes.clear()
}
