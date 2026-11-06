import { beforeEach, describe, expect, it } from "vitest"
import { CLAVE_ALMACENAMIENTO, MESES_VIGENCIA, caducidad, eleccionVigente, parsearEleccion, serializarEleccion } from "../lib/consentimiento"
import { ControladorConsentimiento, mostrarAviso, type AlmacenElecciones } from "../lib/consentimiento-controlador"
import { URL_FBEVENTS, borrarCookiesMeta, crearPixel, dominiosDeCookie, type DocumentoMeta, type VentanaMeta } from "../lib/meta-pixel-cliente"

/*
  Consentimiento y píxel, sin navegador.

  Lo que se prueba es qué le PEDIRÍA el sitio a Meta: el único modo de que el
  navegador se conecte con Meta es añadir un <script> a connect.facebook.net, y
  desde ahí llamar a `window.fbq`. La ventana y el documento son falsos y lo
  registran todo: si no se añade el <script>, no hay petición; si `fbq` no se
  llama, no hay evento. Las fechas de los casos de caducidad están hechas a mano
  (24 meses exactos), no sacadas de la función que se prueba.
*/

const ID = "123456789012345"
const VERSION = "2026-11-06"
const HOST = "www.sedaprivatehomes.com"

/* ── Mundo falso ──────────────────────────────────────────────────────── */

class AlmacenFalso implements AlmacenElecciones {
  datos = new Map<string, string>()
  getItem(k: string) {
    return this.datos.get(k) ?? null
  }
  setItem(k: string, v: string) {
    this.datos.set(k, v)
  }
}

type Mundo = {
  win: VentanaMeta & { fbq?: ((...a: unknown[]) => void) & { queue?: unknown[][] } }
  doc: DocumentoMeta & { scripts: string[]; escrituras: string[] }
}

function mundoFalso(): Mundo {
  const scripts: string[] = []
  const escrituras: string[] = []
  const doc = {
    scripts,
    escrituras,
    head: { appendChild: (n: unknown) => scripts.push((n as { src: string }).src) },
    createElement: () => ({ async: false, src: "" }),
    get cookie() {
      return ""
    },
    set cookie(v: string) {
      escrituras.push(v)
    },
  }
  return { win: {}, doc: doc as unknown as Mundo["doc"] }
}

function armar(opts: { almacen?: AlmacenElecciones | null; ahora?: () => Date; version?: string } = {}) {
  const mundo = mundoFalso()
  const pixel = crearPixel({ id: ID, win: mundo.win, doc: mundo.doc, host: HOST })
  const almacen = opts.almacen === undefined ? new AlmacenFalso() : opts.almacen
  const controlador = new ControladorConsentimiento({
    almacen: () => almacen,
    pixel,
    version: opts.version ?? VERSION,
    ahora: opts.ahora,
  })
  return { mundo, pixel, controlador, almacen }
}

const cola = (m: Mundo) => (m.win.fbq?.queue ?? []).map((a) => Array.from(a as ArrayLike<unknown>))

/* ── El registro de la elección ───────────────────────────────────────── */

describe("el registro de la elección (fecha y versión)", () => {
  it("se guarda con versión, fecha ISO y marketing, y se lee igual", () => {
    const e = { version: VERSION, fecha: "2026-11-06T10:15:00.000Z", marketing: true }
    expect(JSON.parse(serializarEleccion(e))).toEqual(e)
    expect(parsearEleccion(serializarEleccion(e))).toEqual(e)
  })

  it.each([
    [null], [undefined], [""], ["no es json"], ["[]"], ["null"], ["true"],
    [JSON.stringify({ version: VERSION, fecha: "2026-11-06T10:15:00.000Z" })], // sin marketing
    [JSON.stringify({ version: VERSION, fecha: "2026-11-06T10:15:00.000Z", marketing: "true" })], // marketing no booleano
    [JSON.stringify({ version: VERSION, fecha: "ayer", marketing: true })],
    [JSON.stringify({ version: "", fecha: "2026-11-06T10:15:00.000Z", marketing: true })],
    [JSON.stringify({ version: VERSION, fecha: "2026-13-45T99:99:99.000Z", marketing: true })],
  ])("lo guardado %j no es una elección: cuenta como «sin elegir»", (crudo) => {
    expect(parsearEleccion(crudo)).toBeNull()
  })
})

describe("vigencia: 24 meses, misma versión", () => {
  const e = { version: VERSION, fecha: "2026-11-06T10:00:00.000Z", marketing: true }

  it("caduca exactamente a los 24 meses (a mano: 6-nov-2026 → 6-nov-2028)", () => {
    expect(MESES_VIGENCIA).toBe(24)
    expect(caducidad(e.fecha).toISOString()).toBe("2028-11-06T10:00:00.000Z")
  })

  it("un segundo antes de los 24 meses sigue vigente; al cumplirlos, no", () => {
    expect(eleccionVigente(e, VERSION, new Date("2028-11-06T09:59:59.000Z"))).toBe(true)
    expect(eleccionVigente(e, VERSION, new Date("2028-11-06T10:00:00.000Z"))).toBe(false)
    expect(eleccionVigente(e, VERSION, new Date("2030-01-01T00:00:00.000Z"))).toBe(false)
  })

  it("si la versión de la política cambia, deja de valer aunque sea de ayer", () => {
    expect(eleccionVigente(e, VERSION, new Date("2026-11-07T00:00:00.000Z"))).toBe(true)
    expect(eleccionVigente(e, "2026-12-01", new Date("2026-11-07T00:00:00.000Z"))).toBe(false)
  })

  it("una fecha en el futuro no se acepta (no se puede fabricar una elección eterna)", () => {
    const futura = { ...e, fecha: "2031-01-01T00:00:00.000Z" }
    expect(eleccionVigente(futura, VERSION, new Date("2026-11-07T00:00:00.000Z"))).toBe(false)
  })

  it("sin elección no hay nada vigente", () => {
    expect(eleccionVigente(null, VERSION, new Date())).toBe(false)
  })
})

/* ── Sin consentimiento: ni un script ni una petición a Meta ──────────── */

describe("sin consentimiento, ni un script ni una petición a Meta", () => {
  let t: ReturnType<typeof armar>
  beforeEach(() => {
    t = armar()
  })

  it("al abrir la web por primera vez: ningún <script>, ningún fbq, y el aviso se muestra", () => {
    t.controlador.iniciar()
    expect(t.mundo.doc.scripts).toEqual([])
    expect(t.mundo.win.fbq).toBeUndefined()
    expect(t.pixel.activo).toBe(false)
    const s = t.controlador.instantanea()
    expect(s).toMatchObject({ cargado: true, decidido: false, marketing: false })
    expect(mostrarAviso(s)).toBe(true)
  })

  it("antes de leer el almacenamiento (servidor, hidratación) no se muestra el aviso", () => {
    expect(mostrarAviso(t.controlador.instantanea())).toBe(false)
  })

  it("«Rechazar»: ningún <script>, ningún fbq; la elección se guarda con fecha y versión; el aviso se va", () => {
    const t2 = armar({ ahora: () => new Date("2026-11-06T10:15:00.000Z") })
    t2.controlador.iniciar()
    t2.controlador.rechazar()
    expect(t2.mundo.doc.scripts).toEqual([])
    expect(t2.mundo.win.fbq).toBeUndefined()
    expect(JSON.parse((t2.almacen as AlmacenFalso).datos.get(CLAVE_ALMACENAMIENTO)!)).toEqual({
      version: VERSION,
      fecha: "2026-11-06T10:15:00.000Z",
      marketing: false,
    })
    expect(mostrarAviso(t2.controlador.instantanea())).toBe(false)
  })

  it("tras «Rechazar», PageView y Lead no hacen nada aunque se les llame", () => {
    t.controlador.iniciar()
    t.controlador.rechazar()
    t.pixel.pageView()
    t.pixel.lead("evento-1")
    expect(t.mundo.win.fbq).toBeUndefined()
    expect(t.mundo.doc.scripts).toEqual([])
  })

  it("en la visita siguiente, con el «no» guardado: sigue sin cargar nada y no vuelve a preguntar", () => {
    t.controlador.iniciar()
    t.controlador.rechazar()
    const otra = armar({ almacen: t.almacen })
    otra.controlador.iniciar()
    expect(otra.mundo.doc.scripts).toEqual([])
    expect(otra.mundo.win.fbq).toBeUndefined()
    expect(mostrarAviso(otra.controlador.instantanea())).toBe(false)
  })

  it("«Configurar» no activa nada por sí solo: abrir el panel y cerrarlo sin guardar deja todo apagado", () => {
    t.controlador.iniciar()
    t.controlador.abrirPanel()
    expect(t.controlador.instantanea().panelAbierto).toBe(true)
    t.controlador.cerrarPanel()
    expect(t.mundo.doc.scripts).toEqual([])
    expect(t.mundo.win.fbq).toBeUndefined()
    expect(mostrarAviso(t.controlador.instantanea())).toBe(true) // sigue sin elegir
  })

  it("una elección caducada (24 meses) o de otra versión cuenta como «sin elegir»: no se carga nada y se vuelve a preguntar", () => {
    const almacen = new AlmacenFalso()
    almacen.setItem(CLAVE_ALMACENAMIENTO, serializarEleccion({ version: VERSION, fecha: "2024-11-01T00:00:00.000Z", marketing: true }))
    const caducada = armar({ almacen, ahora: () => new Date("2026-11-06T00:00:00.000Z") })
    caducada.controlador.iniciar()
    expect(caducada.mundo.doc.scripts).toEqual([])
    expect(mostrarAviso(caducada.controlador.instantanea())).toBe(true)

    const almacen2 = new AlmacenFalso()
    almacen2.setItem(CLAVE_ALMACENAMIENTO, serializarEleccion({ version: "2026-01-01", fecha: "2026-11-01T00:00:00.000Z", marketing: true }))
    const otraVersion = armar({ almacen: almacen2, ahora: () => new Date("2026-11-06T00:00:00.000Z") })
    otraVersion.controlador.iniciar()
    expect(otraVersion.mundo.doc.scripts).toEqual([])
    expect(mostrarAviso(otraVersion.controlador.instantanea())).toBe(true)
  })

  it("sin muro de cookies: el estado «sin elegir» solo enciende el aviso; nada más cambia", () => {
    t.controlador.iniciar()
    expect(t.controlador.instantanea()).toEqual({ cargado: true, decidido: false, marketing: false, panelAbierto: false })
  })
})

/* ── Con «Aceptar» ────────────────────────────────────────────────────── */

describe("con «Aceptar»: se carga el píxel y se manda PageView", () => {
  it("carga UN solo <script>, de connect.facebook.net, y configura sin coincidencia avanzada", () => {
    const t = armar()
    t.controlador.iniciar()
    t.controlador.aceptar()
    expect(t.mundo.doc.scripts).toEqual([URL_FBEVENTS])
    expect(URL_FBEVENTS).toBe("https://connect.facebook.net/en_US/fbevents.js")
    // autoConfig apagado ANTES de init; init solo con el ID: sin correo, sin teléfono, sin datos de usuario.
    expect(cola(t.mundo)).toEqual([
      ["set", "autoConfig", false, ID],
      ["init", ID],
    ])
  })

  it("PageView: solo después de aceptar", () => {
    const t = armar()
    t.controlador.iniciar()
    t.pixel.pageView()
    expect(t.mundo.win.fbq).toBeUndefined()
    t.controlador.aceptar()
    t.pixel.pageView()
    expect(cola(t.mundo).at(-1)).toEqual(["track", "PageView"])
  })

  it("la elección queda guardada con marketing: true, fecha y versión, y el aviso se va", () => {
    const t = armar({ ahora: () => new Date("2026-11-06T12:00:00.000Z") })
    t.controlador.iniciar()
    t.controlador.aceptar()
    expect(JSON.parse((t.almacen as AlmacenFalso).datos.get(CLAVE_ALMACENAMIENTO)!)).toEqual({
      version: VERSION,
      fecha: "2026-11-06T12:00:00.000Z",
      marketing: true,
    })
    expect(mostrarAviso(t.controlador.instantanea())).toBe(false)
  })

  it("«Guardar» en Configurar con la casilla marcada equivale a aceptar; sin marcar, a rechazar", () => {
    const si = armar()
    si.controlador.iniciar()
    si.controlador.guardar(true)
    expect(si.mundo.doc.scripts).toEqual([URL_FBEVENTS])
    const no = armar()
    no.controlador.iniciar()
    no.controlador.guardar(false)
    expect(no.mundo.doc.scripts).toEqual([])
  })

  it("visita siguiente con el «sí» vigente guardado: se carga el píxel sin volver a preguntar", () => {
    const t = armar()
    t.controlador.iniciar()
    t.controlador.aceptar()
    const otra = armar({ almacen: t.almacen })
    otra.controlador.iniciar()
    expect(otra.mundo.doc.scripts).toEqual([URL_FBEVENTS])
    expect(mostrarAviso(otra.controlador.instantanea())).toBe(false)
  })

  it("Lead lleva el event_id que se le pasa (el mismo que usa la API de conversiones)", () => {
    const t = armar()
    t.controlador.iniciar()
    t.controlador.aceptar()
    t.pixel.lead("c0ffee00-1111-4222-8333-444455556666")
    expect(cola(t.mundo).at(-1)).toEqual(["track", "Lead", {}, { eventID: "c0ffee00-1111-4222-8333-444455556666" }])
  })

  it("activar dos veces no carga dos scripts", () => {
    const t = armar()
    t.pixel.activar()
    t.pixel.activar()
    expect(t.mundo.doc.scripts).toHaveLength(1)
  })
})

/* ── Retirar el consentimiento ────────────────────────────────────────── */

describe("retirar el consentimiento lo para todo", () => {
  function aceptado() {
    const t = armar()
    t.controlador.iniciar()
    t.controlador.aceptar()
    return t
  }

  it("fbq('consent','revoke') y ya no se envía NADA más: ni PageView ni Lead", () => {
    const t = aceptado()
    const antes = cola(t.mundo).length
    t.controlador.guardar(false) // «Configurar cookies» → desmarcar → guardar
    expect(cola(t.mundo).slice(antes)).toEqual([["consent", "revoke"]])
    const despues = cola(t.mundo).length
    t.pixel.pageView()
    t.pixel.lead("evento-tras-retirar")
    expect(cola(t.mundo)).toHaveLength(despues)
    expect(t.pixel.activo).toBe(false)
  })

  it("«Rechazar» desde el aviso tras haber aceptado en otra visita también lo para", () => {
    const t = aceptado()
    t.controlador.rechazar()
    t.pixel.pageView()
    expect(cola(t.mundo).filter((a) => a[0] === "track")).toEqual([])
  })

  it("se borran _fbp y _fbc: en el host y en cada dominio padre, con Max-Age=0", () => {
    const t = aceptado()
    t.controlador.guardar(false)
    const e = t.mundo.doc.escrituras
    for (const nombre of ["_fbp", "_fbc"]) {
      const suyas = e.filter((x) => x.startsWith(`${nombre}=;`))
      expect(suyas.length).toBeGreaterThanOrEqual(5)
      for (const x of suyas) {
        expect(x).toContain("Max-Age=0")
        expect(x).toContain("Path=/")
      }
      // Sin Domain (cookie del host exacto) y con el dominio padre donde el píxel suele fijarla.
      expect(suyas.some((x) => !x.includes("Domain="))).toBe(true)
      expect(suyas.some((x) => x.includes("Domain=.sedaprivatehomes.com;"))).toBe(true)
      expect(suyas.some((x) => x.includes("Domain=www.sedaprivatehomes.com;"))).toBe(true)
    }
    // Y nada más que esas dos cookies.
    expect(e.every((x) => x.startsWith("_fbp=;") || x.startsWith("_fbc=;"))).toBe(true)
  })

  it("la elección queda guardada como marketing: false (no se vuelve a preguntar en cada página)", () => {
    const t = aceptado()
    t.controlador.guardar(false)
    expect(JSON.parse((t.almacen as AlmacenFalso).datos.get(CLAVE_ALMACENAMIENTO)!)).toMatchObject({ marketing: false })
  })

  it("volver a aceptar tras retirar no recarga el script: concede de nuevo y manda PageView", () => {
    const t = aceptado()
    t.controlador.guardar(false)
    t.controlador.aceptar()
    expect(t.mundo.doc.scripts).toHaveLength(1)
    t.pixel.pageView()
    const c = cola(t.mundo)
    expect(c.at(-2)).toEqual(["consent", "grant"])
    expect(c.at(-1)).toEqual(["track", "PageView"])
  })

  it("si en una visita nueva se descubre una elección caducada, se limpian las cookies de Meta que pudieran quedar", () => {
    const almacen = new AlmacenFalso()
    almacen.setItem(CLAVE_ALMACENAMIENTO, serializarEleccion({ version: VERSION, fecha: "2024-01-01T00:00:00.000Z", marketing: true }))
    const t = armar({ almacen, ahora: () => new Date("2026-11-06T00:00:00.000Z") })
    t.controlador.iniciar()
    expect(t.mundo.doc.escrituras.some((x) => x.startsWith("_fbp=;"))).toBe(true)
    expect(t.mundo.doc.scripts).toEqual([])
  })
})

/* ── Robustez ─────────────────────────────────────────────────────────── */

describe("si el almacenamiento falla", () => {
  it("sin localStorage (modo privado): la elección vive en memoria y no se vuelve a preguntar en cada página", () => {
    const t = armar({ almacen: null })
    t.controlador.iniciar()
    expect(mostrarAviso(t.controlador.instantanea())).toBe(true)
    t.controlador.aceptar()
    expect(t.mundo.doc.scripts).toEqual([URL_FBEVENTS])
    expect(mostrarAviso(t.controlador.instantanea())).toBe(false)
  })

  it("un localStorage que lanza al leer o al escribir no rompe nada", () => {
    const roto: AlmacenElecciones = {
      getItem() {
        throw new Error("SecurityError")
      },
      setItem() {
        throw new Error("QuotaExceededError")
      },
    }
    const t = armar({ almacen: roto })
    expect(() => t.controlador.iniciar()).not.toThrow()
    expect(() => t.controlador.rechazar()).not.toThrow()
    expect(t.mundo.doc.scripts).toEqual([])
  })
})

describe("borrado de cookies: dominios", () => {
  it("el host y cada sufijo con al menos dos etiquetas (nunca «com»)", () => {
    expect(dominiosDeCookie("www.sedaprivatehomes.com")).toEqual(["www.sedaprivatehomes.com", "sedaprivatehomes.com"])
    expect(dominiosDeCookie("sedaprivatehomes.com")).toEqual(["sedaprivatehomes.com"])
    expect(dominiosDeCookie("localhost")).toEqual([])
  })

  it("en localhost borra sin Domain (el navegador rechaza Domain=localhost)", () => {
    const escrituras: string[] = []
    const doc = {
      get cookie() {
        return ""
      },
      set cookie(v: string) {
        escrituras.push(v)
      },
    }
    borrarCookiesMeta(doc, "localhost")
    expect(escrituras).toHaveLength(2)
    expect(escrituras.every((x) => !x.includes("Domain="))).toBe(true)
  })
})
