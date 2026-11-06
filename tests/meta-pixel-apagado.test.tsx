import { isValidElement, type ReactElement, type ReactNode } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { NextIntlClientProvider } from "next-intl"
import { afterEach, describe, expect, it, vi } from "vitest"
import LocaleLayout from "@/app/[locale]/layout"
import { Footer } from "@/components/footer"
import { Aviso, CLASE_BOTON, ConsentimientoCookies, Panel } from "@/components/consentimiento/consentimiento-cookies"
import { EnlaceConfigurarCookies } from "@/components/consentimiento/enlace-configurar-cookies"
import { ControladorConsentimiento } from "@/lib/consentimiento-controlador"
import { TEXTOS_CONSENTIMIENTO } from "@/lib/consentimiento-textos"
import { routing } from "@/i18n/routing"
import es from "@/messages/es.json"

/*
  «Apagado = la web exactamente como hoy», y el aspecto del aviso encendido.

  Dos formas de comprobarlo, sin navegador:
    · El ÁRBOL que devuelve el layout: con el flag apagado no contiene el aviso ni
      el enlace del pie, y el pie recibe las mismas props que antes (ni siquiera
      `enlaceCookies: null`, que también se serializa en el HTML).
    · El HTML de los componentes reales (react-dom/server).
  La comparación byte a byte del HTML de `next build` contra la rama base está en
  la descripción del PR: los nombres de los chunks cambian con cualquier cambio
  de código, así que no se puede fijar en un test.
*/

// `next/font/google` solo existe bajo el transformador de Next, no en vitest.
vi.mock("@/lib/fonts", () => ({ fontVariables: "" }))
// Y `setRequestLocale` exige un contexto de petición de Next que aquí no hay.
vi.mock("next-intl/server", () => ({ setRequestLocale: () => {} }))

const ID = "123456789012345"

afterEach(() => vi.unstubAllEnvs())

/** Todos los elementos React de un árbol, en profundidad. */
function elementos(nodo: ReactNode, salida: ReactElement[] = []): ReactElement[] {
  if (Array.isArray(nodo)) nodo.forEach((n) => elementos(n, salida))
  else if (isValidElement(nodo)) {
    salida.push(nodo)
    elementos((nodo.props as { children?: ReactNode }).children, salida)
  }
  return salida
}

async function arbol(locale: string) {
  return LocaleLayout({ children: <main id="contenido" />, params: Promise.resolve({ locale }) }) as Promise<ReactElement>
}

describe.each(routing.locales)("layout (%s)", (loc) => {
  it("con todo apagado: ni el aviso ni el enlace del pie, el pie sin props nuevas y ningún hijo nuevo en el layout", async () => {
    const raiz = await arbol(loc)
    const el = elementos(raiz)
    expect(el.find((e) => e.type === ConsentimientoCookies)).toBeUndefined()
    const pie = el.find((e) => e.type === Footer)!
    expect(pie).toBeDefined()
    expect(Object.keys(pie.props as object)).toEqual([]) // exactamente las props de antes: ninguna
    expect(el.find((e) => e.type === EnlaceConfigurarCookies)).toBeUndefined()
    // Los hijos del proveedor son los de siempre, sin un `null`/`false` suelto (que también se serializa en el HTML).
    const proveedor = el.find((e) => e.type === NextIntlClientProvider)!
    const hijos = (proveedor.props as { children: ReactNode[] }).children
    expect(hijos).toHaveLength(6)
    expect(hijos.every((h) => isValidElement(h))).toBe(true)
  })

  it.each([
    ["flag a «0»", { SEDA_FLAG_META_PIXEL: "0", NEXT_PUBLIC_META_PIXEL_ID: ID }],
    ["flag encendido pero sin ID", { SEDA_FLAG_META_PIXEL: "1" }],
    ["solo la CAPI", { SEDA_FLAG_META_CAPI: "1", META_CAPI_TOKEN: "t".repeat(40), NEXT_PUBLIC_META_PIXEL_ID: ID }],
    ["solo el ID", { NEXT_PUBLIC_META_PIXEL_ID: ID }],
  ])("%s → igual que apagado", async (_, env) => {
    for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v)
    const el = elementos(await arbol(loc))
    expect(el.find((e) => e.type === ConsentimientoCookies)).toBeUndefined()
    expect(Object.keys((el.find((e) => e.type === Footer)!.props as object))).toEqual([])
    expect(JSON.stringify(await arbol(loc))).not.toContain("pixelId")
  })

  it("con el flag y el ID: monta el aviso con el ID y los textos del idioma, y el enlace del pie", async () => {
    vi.stubEnv("SEDA_FLAG_META_PIXEL", "1")
    vi.stubEnv("NEXT_PUBLIC_META_PIXEL_ID", ID)
    const el = elementos(await arbol(loc))
    // El aviso y el enlace viajan en props del pie (no como hijos del layout).
    const props = el.find((e) => e.type === Footer)!.props as { enlaceCookies: ReactElement; avisoCookies: ReactElement }
    expect(props.avisoCookies.type).toBe(ConsentimientoCookies)
    expect(props.avisoCookies.props).toEqual({ pixelId: ID, textos: TEXTOS_CONSENTIMIENTO[loc] })
    const enlace = props.enlaceCookies
    expect(enlace.type).toBe(EnlaceConfigurarCookies)
    expect(enlace.props).toEqual({ etiqueta: TEXTOS_CONSENTIMIENTO[loc].enlacePie })
  })
})

describe("el pie", () => {
  const pie = (props: Parameters<typeof Footer>[0] = {}) =>
    renderToStaticMarkup(
      <NextIntlClientProvider locale="es" messages={es}>
        <Footer {...props} />
      </NextIntlClientProvider>,
    )

  it("sin la prop: HTML idéntico al de `enlaceCookies={null}` y sin ningún botón", () => {
    const base = pie()
    expect(pie({ enlaceCookies: null })).toBe(base)
    expect(base).not.toContain("<button")
    expect(base).not.toMatch(/facebook|meta\b/i)
  })

  it("con el enlace: aparece «Configurar cookies» dentro del menú legal, tras los tres enlaces de siempre", () => {
    const con = pie({ enlaceCookies: <EnlaceConfigurarCookies etiqueta="Configurar cookies" /> })
    expect(con).toContain(">Configurar cookies</button>")
    expect(con.indexOf("/cookies")).toBeLessThan(con.indexOf("Configurar cookies"))
    // Lo único que cambia es ese botón.
    expect(con.replace(/<button[^>]*>Configurar cookies<\/button>/, "")).toBe(pie())
  })
})

describe("el aviso (primera capa)", () => {
  const controlador = new ControladorConsentimiento({ almacen: () => null, pixel: { activar() {}, desactivar() {} }, version: "v" })
  const render = (nodo: ReactNode, loc: keyof typeof TEXTOS_CONSENTIMIENTO = "es") =>
    renderToStaticMarkup(
      <NextIntlClientProvider locale={loc} messages={es}>
        {nodo}
      </NextIntlClientProvider>,
    )

  it("en el servidor / primer pintado no pinta nada, ni nombra a Meta como destino de ninguna petición", () => {
    const html = renderToStaticMarkup(<ConsentimientoCookies pixelId={ID} textos={TEXTOS_CONSENTIMIENTO.es} />)
    expect(html).toBe("")
  })

  it.each(routing.locales)("%s: Aceptar, Rechazar y Configurar — tres botones con LA MISMA clase (mismo peso visual)", (loc) => {
    const t = TEXTOS_CONSENTIMIENTO[loc]
    const html = render(<Aviso textos={t} controlador={controlador} />, loc)
    const botones = [...html.matchAll(/<button type="button" class="([^"]*)">([^<]*)<\/button>/g)]
    expect(botones.map((b) => b[2])).toEqual([t.aceptar, t.rechazar, t.configurar])
    const clases = new Set(botones.map((b) => b[1]))
    expect(clases.size).toBe(1)
    expect([...clases][0]).toBe(CLASE_BOTON)
  })

  it("los botones no empujan: ninguno destaca por color de relleno, tamaño ni peso", () => {
    // Misma clase ⇒ lo mismo. Y esa clase no es un botón «primario» (relleno oscuro) ni «enlace» (sin borde).
    expect(CLASE_BOTON).toContain("border border-foreground")
    expect(CLASE_BOTON).toContain("bg-background")
    expect(CLASE_BOTON).not.toMatch(/(^|\s)bg-(olive|primary|foreground)(\s|$)/) // el relleno base es el del fondo, igual en los tres
  })

  it("lleva el enlace a la política de cookies, es una región con nombre y no es modal (sin muro)", () => {
    const html = render(<Aviso textos={TEXTOS_CONSENTIMIENTO.es} controlador={controlador} />)
    expect(html).toContain('href="/cookies"')
    expect(html).toContain('role="region"')
    expect(html).toContain('aria-label="Aviso de cookies"')
    expect(html).not.toContain("aria-modal")
    expect(html).toContain("fixed inset-x-0 bottom-0") // superpuesto: no empuja ni tapa la página entera
    expect(html).not.toMatch(/inset-0\b|h-screen|backdrop/) // sin capa que bloquee la página
  })

  it("el aviso no carga nada de Meta: ni <script>, ni <img>, ni <iframe>, ni URL de Meta", () => {
    const html = render(<Aviso textos={TEXTOS_CONSENTIMIENTO.es} controlador={controlador} />)
    expect(html).not.toMatch(/<script|<img|<iframe|<link|facebook\.com|facebook\.net|fbcdn/i)
  })
})

describe("el panel «Configurar» (segunda capa)", () => {
  const controlador = new ControladorConsentimiento({ almacen: () => null, pixel: { activar() {}, desactivar() {} }, version: "v" })
  const render = (marketingInicial: boolean, loc: keyof typeof TEXTOS_CONSENTIMIENTO = "es") =>
    renderToStaticMarkup(
      <NextIntlClientProvider locale={loc} messages={es}>
        <Panel textos={TEXTOS_CONSENTIMIENTO[loc]} marketingInicial={marketingInicial} controlador={controlador} />
      </NextIntlClientProvider>,
    )

  it.each(routing.locales)("%s: una sola casilla, «marketing», SIN marcar de antemano la primera vez", (loc) => {
    const html = render(false, loc)
    expect([...html.matchAll(/type="checkbox"/g)]).toHaveLength(1)
    expect(html).not.toContain("checked")
    expect(html).toContain(TEXTOS_CONSENTIMIENTO[loc].panel.marketing.titulo)
  })

  it("si la persona ya había aceptado, la casilla aparece marcada (para poder retirarla)", () => {
    expect(render(true)).toContain('checked=""')
  })

  it("las técnicas aparecen como «siempre activas» y sin casilla", () => {
    const html = render(false)
    expect(html).toContain(TEXTOS_CONSENTIMIENTO.es.panel.tecnicas.estado)
    expect([...html.matchAll(/<input/g)]).toHaveLength(1)
  })

  it("es un diálogo no modal: no tapa ni bloquea la página", () => {
    const html = render(false)
    expect(html).toContain('role="dialog"')
    expect(html).toContain('aria-modal="false"')
  })
})

describe("los textos del aviso están en los cuatro idiomas y no empujan", () => {
  it("cada idioma trae todos los campos no vacíos", () => {
    for (const loc of routing.locales) {
      const t = TEXTOS_CONSENTIMIENTO[loc]
      const planos = [t.region, t.titulo, t.cuerpo, t.aceptar, t.rechazar, t.configurar, t.politica, t.enlacePie, t.panel.titulo, t.panel.intro, t.panel.guardar, t.panel.cerrar, t.panel.tecnicas.titulo, t.panel.tecnicas.descripcion, t.panel.tecnicas.estado, t.panel.marketing.titulo, t.panel.marketing.descripcion]
      for (const p of planos) expect(p.trim().length, `${loc}: ${p}`).toBeGreaterThan(0)
    }
  })

  it("el cuerpo del aviso dice quién (Meta), para qué (medir anuncios) y cómo cambiarlo (el enlace del pie)", () => {
    for (const loc of routing.locales) {
      const t = TEXTOS_CONSENTIMIENTO[loc]
      expect(t.cuerpo, loc).toContain("Meta")
      expect(t.cuerpo, loc).toContain(t.enlacePie)
    }
  })

  it("el panel no promete lo que no se hace: nunca nombre, correo ni teléfono a Meta", () => {
    expect(TEXTOS_CONSENTIMIENTO.es.panel.marketing.descripcion).toMatch(/nunca tu nombre, correo ni teléfono/)
  })
})
