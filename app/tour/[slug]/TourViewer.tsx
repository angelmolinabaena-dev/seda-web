"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { IDIOMAS_TOUR, NOMBRE_IDIOMA_TOUR, esIdiomaTour, resolverIdioma, type IdiomaTour } from "@/lib/tour360/idiomas"
import type { TourManifiesto } from "@/lib/tour360/manifiesto"
import { construirConfig } from "@/lib/tour360/pannellum-config"
import { TEXTOS_VISOR, rellenar } from "@/lib/tour360/textos"

/*
  Visor 360. Cliente porque Pannellum necesita DOM y WebGL.

  · Pannellum se sirve desde /vendor/pannellum (nuestro dominio, CSP 'self'): ni
    CDN ni terceros. Se carga aquí, al montar el visor, no antes.
  · Sin analítica, sin cookies, sin localStorage. El idioma se lee de ?lang= o del
    navegador y NO se guarda en ningún sitio (la URL lleva `?lang=` al cambiarlo).
  · Parámetros de URL: ?lang=es|en|de|fr|it · ?escena=<id> · ?debug=1 (coordenadas
    para colocar hotspots; ver docs/TOUR-360.md).
*/

const VENDOR = "/vendor/pannellum/"

type VisorPannellum = {
  destroy(): void
  getScene(): string
  getYaw(): number
  getPitch(): number
  getHfov(): number
  setHfov(hfov: number, animado?: number | boolean): void
  loadScene(id: string): void
  toggleFullscreen(): void
  isLoaded(): boolean
  isOrientationSupported(): boolean
  isOrientationActive(): boolean
  startOrientation(): void
  stopOrientation(): void
  mouseEventToCoords(e: MouseEvent): [number, number]
  on(tipo: string, fn: (...args: never[]) => void): void
}

declare global {
  interface Window {
    pannellum?: { viewer: (el: HTMLElement, config: object) => VisorPannellum }
  }
}

let cargaPannellum: Promise<void> | null = null

function cargarPannellum(): Promise<void> {
  if (window.pannellum) return Promise.resolve()
  cargaPannellum ??= new Promise<void>((ok, ko) => {
    let pendientes = 2
    const listo = () => {
      if (--pendientes === 0) ok()
    }
    const fallo = () => {
      cargaPannellum = null
      ko(new Error("No se ha podido cargar /vendor/pannellum"))
    }
    const css = document.createElement("link")
    css.rel = "stylesheet"
    css.href = `${VENDOR}pannellum.css`
    css.onload = listo
    css.onerror = fallo
    const js = document.createElement("script")
    js.src = `${VENDOR}pannellum.js`
    js.async = true
    js.onload = listo
    js.onerror = fallo
    document.head.append(css, js)
  })
  return cargaPannellum
}

/** Hotspot accesible: botón enfocable con teclado y etiqueta legible por lector de pantalla. */
function crearHotspot(div: HTMLElement, args: { texto: string; etiqueta: string }) {
  div.setAttribute("role", "button")
  div.setAttribute("aria-label", args.etiqueta)
  div.tabIndex = 0
  const anillo = document.createElement("span")
  anillo.className = "tour-hotspot__anillo"
  anillo.setAttribute("aria-hidden", "true")
  const texto = document.createElement("span")
  texto.className = "tour-hotspot__texto"
  texto.textContent = args.texto
  div.append(anillo, texto)
  div.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      div.click()
    }
  })
}

type HotspotConfig = { text: string } & Record<string, unknown>
type EscenaConfig = { hotSpots: HotspotConfig[] }

function decorarHotspots(config: Record<string, unknown>, irA: string) {
  const escenas = config.scenes as Record<string, EscenaConfig>
  for (const escena of Object.values(escenas)) {
    for (const h of escena.hotSpots) {
      h.cssClass = "tour-hotspot"
      h.createTooltipFunc = crearHotspot
      h.createTooltipArgs = { texto: h.text, etiqueta: rellenar(irA, { estancia: h.text }) }
    }
  }
}

function Icono({ d, d2 }: { d: string; d2?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" aria-hidden="true">
      <path d={d} />
      {d2 && <path d={d2} />}
    </svg>
  )
}

const ICONOS = {
  mas: "M12 5v14M5 12h14",
  menos: "M5 12h14",
  expandir: "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5",
  contraer: "M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5",
  giro: "M12 3a9 9 0 1 0 9 9",
  giro2: "M12 8v4l3 2M21 3v5h-5",
}

type Punto = { escena: string; pitch: number; yaw: number }

export function TourViewer({ tour }: { tour: TourManifiesto }) {
  const contenedor = useRef<HTMLDivElement>(null)
  const visorRef = useRef<VisorPannellum | null>(null)
  const [idioma, setIdioma] = useState<IdiomaTour | null>(null)
  const [escenaUrl, setEscenaUrl] = useState<string | undefined>()
  const [depurar, setDepurar] = useState(false)
  const [intento, setIntento] = useState(0)
  const [fase, setFase] = useState<"cargando" | "listo">("cargando")
  const [error, setError] = useState<string | null>(null)
  const [escena, setEscena] = useState<string>(tour.escenaInicial)
  const [pantalla, setPantalla] = useState(false)
  const [giroSoportado, setGiroSoportado] = useState(false)
  const [giroActivo, setGiroActivo] = useState(false)
  const [ayuda, setAyuda] = useState(false)
  const [punto, setPunto] = useState<Punto | null>(null)

  // 1) Parámetros de URL y navegador → idioma. Una sola vez, al montar.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const i = resolverIdioma({ parametro: p.get("lang"), navegador: navigator.languages ?? [navigator.language] })
    document.documentElement.lang = i
    const e = p.get("escena")
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lectura única de window al montar
    setIdioma(i)
    setEscenaUrl(e ?? undefined)
    setDepurar(p.get("debug") === "1")
  }, [])

  // 2) Crea (o recrea, si cambia el idioma) el visor conservando escena y vista.
  useEffect(() => {
    if (!idioma) return
    const el = contenedor.current
    if (!el) return
    let cancelado = false
    const t = TEXTOS_VISOR[idioma]
    // Reinicia el estado visible antes de (re)crear el visor.
    setError(null)
    setFase("cargando")
    cargarPannellum()
      .then(() => {
        if (cancelado || !window.pannellum) return
        const previo = visorRef.current
        const base = previo
          ? { escena: previo.getScene(), vista: { yaw: previo.getYaw(), pitch: previo.getPitch(), hfov: previo.getHfov() } }
          : { escena: escenaUrl, vista: undefined }
        previo?.destroy()
        visorRef.current = null
        const config = construirConfig(tour, idioma, { escena: base.escena, vista: base.vista, depurar })
        decorarHotspots(config, t.irA)
        const visor = window.pannellum.viewer(el, config)
        visorRef.current = visor
        setEscena((config.default as { firstScene: string }).firstScene)
        setGiroSoportado(visor.isOrientationSupported())
        visor.on("load", (() => setFase("listo")) as () => void)
        visor.on("scenechange", ((id: string) => setEscena(String(id))) as () => void)
        visor.on("error", ((mensaje: string) => setError(String(mensaje))) as () => void)
        visor.on("fullscreenchange", ((activo: boolean) => setPantalla(Boolean(activo))) as () => void)
        // Pannellum puede disparar `load` ANTES de volver de `viewer()` (medido: el callback de
        // inicio corre antes de que se registre ningún manejador). Un evento perdido dejaría el
        // indicador de carga puesto para siempre: se consulta el estado además de escuchar.
        if (visor.isLoaded()) setFase("listo")
        if (depurar) {
          const registrar = (e: MouseEvent) => {
            const [pitch, yaw] = visor.mouseEventToCoords(e)
            setPunto({ escena: visor.getScene(), pitch: Math.round(pitch * 10) / 10, yaw: Math.round(yaw * 10) / 10 })
          }
          visor.on("mousedown", registrar as unknown as () => void)
        }
      })
      .catch(() => {
        if (!cancelado) setError(t.errorCarga)
      })
    return () => {
      cancelado = true
    }
    // `escenaUrl` y `depurar` solo se leen en la creación inicial; no deben recrear el visor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idioma, intento, tour])

  // 3) Al desmontar, libera WebGL y los listeners de Pannellum.
  useEffect(
    () => () => {
      visorRef.current?.destroy()
      visorRef.current = null
    },
    [],
  )

  // 4) Pannellum no avisa cuando el permiso del giroscopio (iOS) se concede después: se sincroniza.
  useEffect(() => {
    if (!giroSoportado) return
    const id = window.setInterval(() => {
      const v = visorRef.current
      if (v) setGiroActivo(v.isOrientationActive())
    }, 400)
    return () => window.clearInterval(id)
  }, [giroSoportado])

  // 5) La indicación «arrastra para mirar» aparece al cargar y se va sola o al primer gesto.
  useEffect(() => {
    if (fase !== "listo") return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- temporizador de una indicación efímera
    setAyuda(true)
    const fin = window.setTimeout(() => setAyuda(false), 5000)
    return () => window.clearTimeout(fin)
  }, [fase])

  const cambiarIdioma = useCallback((nuevo: string) => {
    if (!esIdiomaTour(nuevo)) return
    const url = new URL(window.location.href)
    url.searchParams.set("lang", nuevo)
    window.history.replaceState(null, "", url)
    document.documentElement.lang = nuevo
    setIdioma(nuevo)
  }, [])

  const zoom = (delta: number) => {
    const v = visorRef.current
    if (v) v.setHfov(v.getHfov() + delta, 250)
  }
  const alternarGiro = () => {
    const v = visorRef.current
    if (!v) return
    if (v.isOrientationActive()) v.stopOrientation()
    else v.startOrientation()
    window.setTimeout(() => setGiroActivo(v.isOrientationActive()), 150)
  }

  if (!idioma) {
    // Idioma aún sin resolver: ni un texto en el idioma equivocado, solo el indicador.
    return (
      <main className="tour">
        <div className="tour__estado" role="status" aria-busy="true">
          <span className="tour__spinner" />
        </div>
        <noscript>
          <p className="tour__noscript">JavaScript · 360°</p>
        </noscript>
      </main>
    )
  }

  const t = TEXTOS_VISOR[idioma]
  const titulo = tour.escenas.find((e) => e.id === escena)?.titulos[idioma] ?? ""

  return (
    <main className="tour" data-fase={fase} onPointerDown={() => setAyuda(false)}>
      <div ref={contenedor} className="tour__visor" />

      <header className="tour__cabecera">
        <div className="tour__rotulo">
          <p className="tour__kicker">
            {tour.nombre} · {t.recorrido360}
          </p>
          <h1 className="tour__titulo" aria-live="polite">
            {titulo}
          </h1>
        </div>
        <label className="tour__idioma">
          <span className="tour__solo-lectores">{t.idioma}</span>
          <select value={idioma} onChange={(e) => cambiarIdioma(e.target.value)} aria-label={t.idioma}>
            {IDIOMAS_TOUR.map((i) => (
              <option key={i} value={i}>
                {NOMBRE_IDIOMA_TOUR[i]}
              </option>
            ))}
          </select>
        </label>
      </header>

      <div className="tour__controles">
        <button type="button" className="tour__boton" onClick={() => zoom(-15)} aria-label={t.acercar} title={t.acercar}>
          <Icono d={ICONOS.mas} />
        </button>
        <button type="button" className="tour__boton" onClick={() => zoom(15)} aria-label={t.alejar} title={t.alejar}>
          <Icono d={ICONOS.menos} />
        </button>
        {giroSoportado && (
          <button
            type="button"
            className="tour__boton"
            aria-pressed={giroActivo}
            onClick={alternarGiro}
            aria-label={giroActivo ? t.desactivarGiroscopio : t.activarGiroscopio}
            title={giroActivo ? t.desactivarGiroscopio : t.activarGiroscopio}
          >
            <Icono d={ICONOS.giro} d2={ICONOS.giro2} />
          </button>
        )}
        <button
          type="button"
          className="tour__boton"
          aria-pressed={pantalla}
          onClick={() => visorRef.current?.toggleFullscreen()}
          aria-label={pantalla ? t.salirPantallaCompleta : t.pantallaCompleta}
          title={pantalla ? t.salirPantallaCompleta : t.pantallaCompleta}
        >
          <Icono d={pantalla ? ICONOS.contraer : ICONOS.expandir} />
        </button>
      </div>

      {tour.escenas.length > 1 && (
        <nav className="tour__escenas" aria-label={t.estancias}>
          <ul>
            {tour.escenas.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  className="tour__chip"
                  aria-current={e.id === escena ? "true" : undefined}
                  onClick={() => visorRef.current?.loadScene(e.id)}
                >
                  {e.titulos[idioma]}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {ayuda && !error && (
        <p className="tour__ayuda" aria-hidden="true">
          {t.ayuda}
        </p>
      )}

      {fase === "cargando" && !error && (
        <div className="tour__estado" role="status">
          <span className="tour__spinner" />
          <p>{t.cargando}</p>
        </div>
      )}

      {error && (
        <div className="tour__estado tour__estado--error" role="alert">
          <p>{error}</p>
          <button type="button" className="tour__reintentar" onClick={() => setIntento((n) => n + 1)}>
            {t.reintentar}
          </button>
        </div>
      )}

      {depurar && (
        <aside className="tour__depurar">
          <p>Modo depuración (?debug=1) — pulsa en el punto donde irá el hotspot.</p>
          {punto ? (
            <code>{`{ "escena": "<destino>", "pitch": ${punto.pitch}, "yaw": ${punto.yaw} }   // en «${punto.escena}»`}</code>
          ) : (
            <code>—</code>
          )}
        </aside>
      )}
    </main>
  )
}
