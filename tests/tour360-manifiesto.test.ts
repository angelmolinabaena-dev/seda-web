import { describe, expect, it } from "vitest"
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { IDIOMAS_TOUR, normalizarIdioma, resolverIdioma } from "@/lib/tour360/idiomas"
import { baseTilesValida, validarTour, type TourManifiesto } from "@/lib/tour360/manifiesto"
import { construirConfig } from "@/lib/tour360/pannellum-config"
import { TEXTOS_VISOR, rellenar } from "@/lib/tour360/textos"
import { getTourPublicado, leerTour, listarTours, toursPublicados } from "@/lib/tour360/cargar"

const raiz = process.cwd()
const plantilla = JSON.parse(readFileSync(join(raiz, "tours", "_plantilla", "tour.json"), "utf8"))

/** Un tour publicable derivado de la plantilla: cada escena con su multires. */
function publicable(): TourManifiesto {
  const t = structuredClone(plantilla)
  t.publicado = true
  for (const e of t.escenas) e.multires = { tileResolution: 512, maxLevel: 4, cubeResolution: 3496, extension: "jpg" }
  return t
}

describe("idiomas del visor: cinco", () => {
  it("son es, en, de, fr, it", () => {
    expect([...IDIOMAS_TOUR]).toEqual(["es", "en", "de", "fr", "it"])
  })

  it("?lang= manda sobre el navegador; lo desconocido cae al navegador y, si no, a español", () => {
    expect(resolverIdioma({ parametro: "it", navegador: ["en-US"] })).toBe("it")
    expect(resolverIdioma({ parametro: "DE-at", navegador: ["en"] })).toBe("de")
    expect(resolverIdioma({ parametro: "pt", navegador: ["fr-CA", "en"] })).toBe("fr")
    expect(resolverIdioma({ parametro: null, navegador: ["pt-BR", "it-IT", "en"] })).toBe("it")
    expect(resolverIdioma({ parametro: "xx", navegador: ["ja"] })).toBe("es")
    expect(resolverIdioma({})).toBe("es")
    expect(normalizarIdioma("  EN_gb ")).toBe("en")
    expect(normalizarIdioma("__proto__")).toBeUndefined()
  })

  it("los textos de interfaz existen en los cinco idiomas, sin vacíos y sin copiar el español en los demás", () => {
    const es = TEXTOS_VISOR.es
    const claves = (o: object, p = ""): string[] =>
      Object.entries(o).flatMap(([k, v]) => (typeof v === "object" ? claves(v, `${p}${k}.`) : [`${p}${k}`]))
    const get = (o: Record<string, unknown>, ruta: string) => ruta.split(".").reduce<unknown>((a, k) => (a as Record<string, unknown>)[k], o)
    for (const i of IDIOMAS_TOUR) {
      expect(claves(TEXTOS_VISOR[i]).sort(), i).toEqual(claves(es).sort())
      for (const k of claves(es)) {
        const v = get(TEXTOS_VISOR[i] as unknown as Record<string, unknown>, k)
        expect(typeof v === "string" && v.trim().length > 0, `${i}.${k} vacío`).toBe(true)
        // Marcadores que cada plantilla traducida debe conservar para poder rellenarse.
        const marcadores = (get(es as unknown as Record<string, unknown>, k) as string).match(/\{\w+\}|%s/g) ?? []
        for (const m of marcadores) expect(v as string, `${i}.${k} pierde ${m}`).toContain(m)
        if (i !== "es" && !["idioma", "pannellum.loadingLabel"].includes(k)) {
          expect(v, `${i}.${k} es idéntico al español`).not.toBe(get(es as unknown as Record<string, unknown>, k))
        }
      }
    }
  })

  it("rellenar() sustituye marcadores y deja a la vista los que faltan", () => {
    expect(rellenar("Ir a {estancia}", { estancia: "Cocina" })).toBe("Ir a Cocina")
    expect(rellenar("Ir a {estancia}", {})).toBe("Ir a {estancia}")
  })
})

describe("manifiesto: la plantilla y las reglas", () => {
  it("tours/_plantilla/tour.json es válido, NO está publicado y cada escena trae los cinco idiomas", () => {
    const t = validarTour(plantilla, "tours/_plantilla/tour.json")
    expect(t.publicado).toBe(false)
    expect(t.escenas.length).toBeGreaterThanOrEqual(5)
    for (const e of t.escenas) expect(Object.keys(e.titulos).sort()).toEqual([...IDIOMAS_TOUR].sort())
  })

  it("la plantilla no inventa casa, norte ni fotos: sin norte medido y sin multires", () => {
    const t = validarTour(plantilla)
    expect(t.norte).toBeUndefined()
    for (const e of t.escenas) {
      expect(e.norte).toBeUndefined()
      expect(e.multires).toBeUndefined()
    }
  })

  it("cubre las estancias del encargo: salón, cocina, dormitorio, terraza, piscina", () => {
    const ids = validarTour(plantilla).escenas.map((e) => e.id)
    expect(ids).toEqual(expect.arrayContaining(["salon", "cocina", "dormitorio-1", "terraza", "piscina"]))
  })

  it("un recorrido publicado completo es válido", () => {
    expect(() => validarTour(publicable())).not.toThrow()
  })

  it("publicado:true sin multires en alguna escena se rechaza (no se publican fotos sin procesar)", () => {
    const t = publicable()
    delete t.escenas[2].multires
    expect(() => validarTour(t)).toThrow(/publicado: true exige multires en «dormitorio-1»/)
  })

  it("rechaza: escena inicial inexistente, ids repetidos, hotspot a escena inexistente o a sí misma", () => {
    const a = publicable()
    a.escenaInicial = "garaje"
    expect(() => validarTour(a)).toThrow(/escenaInicial «garaje» no existe/)
    const b = publicable()
    b.escenas[1].id = "salon"
    expect(() => validarTour(b)).toThrow(/id repetido: salon/)
    const c = publicable()
    c.escenas[0].hotspots.push({ escena: "sotano", pitch: 0, yaw: 0 })
    expect(() => validarTour(c)).toThrow(/lleva a «sotano», que no existe/)
    const d = publicable()
    d.escenas[0].hotspots.push({ escena: "salon", pitch: 0, yaw: 0 })
    expect(() => validarTour(d)).toThrow(/su propia escena/)
  })

  it("rechaza un título sin traducir en cualquiera de los cinco idiomas", () => {
    for (const idioma of IDIOMAS_TOUR) {
      const t = publicable()
      t.escenas[0].titulos[idioma] = "  "
      expect(() => validarTour(t), idioma).toThrow()
      const u = publicable()
      delete u.escenas[0].titulos[idioma]
      expect(() => validarTour(u), idioma).toThrow()
    }
  })

  it("rechaza pitch/yaw fuera de rango", () => {
    const t = publicable()
    t.escenas[0].hotspots[0].pitch = 95
    expect(() => validarTour(t)).toThrow()
    const u = publicable()
    u.escenas[0].hotspots[0].yaw = 181
    expect(() => validarTour(u)).toThrow()
  })

  it("un recorrido publicado no puede dejar una estancia inalcanzable", () => {
    const t = publicable()
    // Quita todos los hotspots que llevan a piscina: nadie llega.
    for (const e of t.escenas) e.hotspots = e.hotspots.filter((h) => h.escena !== "piscina")
    expect(() => validarTour(t)).toThrow(/«piscina» no se alcanza/)
  })

  it("tiles.base: ruta propia sí; protocolo-relativa, con «..», http o dominio ajeno no", () => {
    expect(baseTilesValida("/tours/bay-side/v1")).toBe(true)
    for (const mala of ["//evil.example/x", "/tours/../secreto", "http://evil.example/x", "https://evil.example/x", "tours/x", "/a?b=1", "/a#b", "javascript:alert(1)"]) {
      expect(baseTilesValida(mala), mala).toBe(false)
    }
  })
})

describe("construirConfig → configuración de Pannellum", () => {
  const tour = publicable()

  it("es un tour multires con escena inicial, autoload y controles propios", () => {
    const c = construirConfig(tour, "es") as { default: Record<string, unknown>; scenes: Record<string, Record<string, unknown>> }
    expect(c.default.firstScene).toBe("salon")
    expect(c.default.autoLoad).toBe(true)
    expect(c.default.showControls).toBe(false)
    expect(c.default.escapeHTML).toBe(true)
    expect(c.default.autoRotate).toBe(false)
    // Sin fundido entre escenas: Pannellum lo hace con una imagen data: que la CSP del visor bloquea.
    expect("sceneFadeDuration" in c.default).toBe(false)
    expect(Object.keys(c.scenes).sort()).toEqual(tour.escenas.map((e) => e.id).sort())
  })

  it("cada escena apunta a SU carpeta de tiles y usa las rutas de generate.py", () => {
    const c = construirConfig(tour, "es") as { scenes: Record<string, { multiRes: Record<string, unknown>; preview: string; type: string }> }
    const cocina = c.scenes["cocina"]
    expect(cocina.type).toBe("multires")
    expect(cocina.multiRes).toEqual({
      basePath: "/tours/plantilla/v1/cocina",
      path: "/%l/%s%y_%x",
      fallbackPath: "/fallback/%s",
      extension: "jpg",
      tileResolution: 512,
      maxLevel: 4,
      cubeResolution: 3496,
    })
    expect(cocina.preview).toBe("/tours/plantilla/v1/cocina/preview.jpg")
  })

  it("título de escena y etiqueta de hotspot salen en el idioma pedido, para los cinco", () => {
    const esperado = { es: "Cocina", en: "Kitchen", de: "Küche", fr: "Cuisine", it: "Cucina" } as const
    for (const i of IDIOMAS_TOUR) {
      const c = construirConfig(tour, i) as { scenes: Record<string, { title: string; hotSpots: { sceneId: string; text: string; type: string }[] }> }
      expect(c.scenes["cocina"].title).toBe(esperado[i])
      const h = c.scenes["salon"].hotSpots.find((x) => x.sceneId === "cocina")!
      expect(h.type).toBe("scene")
      expect(h.text).toBe(esperado[i])
    }
  })

  it("un hotspot puede llevar etiqueta propia; si no, usa el título de la escena destino", () => {
    const t = publicable()
    t.escenas[0].hotspots[0].titulos = { es: "A la cocina", en: "To the kitchen", de: "Zur Küche", fr: "Vers la cuisine", it: "Verso la cucina" }
    const c = construirConfig(t, "en") as { scenes: Record<string, { hotSpots: { text: string }[] }> }
    expect(c.scenes["salon"].hotSpots[0].text).toBe("To the kitchen")
    expect(c.scenes["salon"].hotSpots[1].text).toBe("Bedroom 1")
  })

  it("sin norte medido no hay brújula ni northOffset; con norte, sí, y la escena manda sobre el tour", () => {
    const sin = construirConfig(tour, "es") as { default: { compass: boolean }; scenes: Record<string, Record<string, unknown>> }
    expect(sin.default.compass).toBe(false)
    expect("northOffset" in sin.scenes["salon"]).toBe(false)

    const t = publicable()
    t.norte = 90
    t.escenas[1].norte = 135
    const con = construirConfig(t, "es") as { default: { compass: boolean }; scenes: Record<string, { northOffset?: number }> }
    expect(con.default.compass).toBe(true)
    expect(con.scenes["salon"].northOffset).toBe(90)
    expect(con.scenes["cocina"].northOffset).toBe(135)
  })

  it("abre en la escena pedida y conserva la vista al cambiar de idioma; una escena desconocida cae a la inicial", () => {
    const c = construirConfig(tour, "de", { escena: "terraza", vista: { yaw: 40, pitch: -5, hfov: 80 } }) as {
      default: { firstScene: string }
      scenes: Record<string, { yaw?: number; pitch?: number; hfov?: number }>
    }
    expect(c.default.firstScene).toBe("terraza")
    expect(c.scenes["terraza"]).toMatchObject({ yaw: 40, pitch: -5, hfov: 80 })
    expect(c.scenes["salon"].yaw).toBeUndefined()
    const d = construirConfig(tour, "de", { escena: "../../etc" }) as { default: { firstScene: string } }
    expect(d.default.firstScene).toBe("salon")
  })

  it("las escenas sin procesar (sin multires) no se dibujan ni se enlazan", () => {
    const t = publicable()
    t.publicado = false
    delete t.escenas[4].multires // piscina
    const c = construirConfig(t, "es") as { scenes: Record<string, { hotSpots: { sceneId: string }[] }> }
    expect(c.scenes["piscina"]).toBeUndefined()
    expect(c.scenes["terraza"].hotSpots.map((h) => h.sceneId)).toEqual(["salon"])
  })

  it("los textos de Pannellum van traducidos (sin inglés por defecto en los otros idiomas)", () => {
    const c = construirConfig(tour, "it") as { default: { strings: Record<string, string> } }
    expect(c.default.strings.genericWebGLError).toBe(TEXTOS_VISOR.it.pannellum.genericWebGLError)
    expect(c.default.strings.loadingLabel).toBe("Caricamento…")
  })
})

describe("carga de manifiestos (build)", () => {
  function carpeta() {
    const dir = mkdtempSync(join(tmpdir(), "tour360-tours-"))
    return { dir, limpiar: () => rmSync(dir, { recursive: true, force: true }) }
  }
  const escribir = (dir: string, slug: string, t: unknown) => {
    mkdirSync(join(dir, slug), { recursive: true })
    writeFileSync(join(dir, slug, "tour.json"), JSON.stringify(t))
  }

  it("en el repo HOY no hay ningún recorrido publicado (no hay fotos reales todavía)", () => {
    expect(toursPublicados()).toEqual([])
    expect(getTourPublicado("bay-side")).toBeUndefined()
    expect(getTourPublicado("plantilla")).toBeUndefined()
    expect(existsSync(join(raiz, "tours", "bay-side"))).toBe(false)
  })

  it("la plantilla (carpeta con «_») no cuenta como casa", () => {
    expect(listarTours().map((t) => t.slug)).not.toContain("plantilla")
  })

  it("lista solo lo publicado, y la carpeta tiene que coincidir con el slug", () => {
    const { dir, limpiar } = carpeta()
    try {
      escribir(dir, "casa-uno", { ...publicable(), slug: "casa-uno" })
      escribir(dir, "casa-dos", { ...plantilla, slug: "casa-dos" })
      cpSync(join(raiz, "tours", "_plantilla"), join(dir, "_plantilla"), { recursive: true })
      expect(listarTours(dir).map((t) => t.slug).sort()).toEqual(["casa-dos", "casa-uno"])
      expect(toursPublicados(dir).map((t) => t.slug)).toEqual(["casa-uno"])
      expect(getTourPublicado("casa-dos", dir)).toBeUndefined()
      escribir(dir, "otra", { ...publicable(), slug: "distinta" })
      expect(() => leerTour("otra", dir)).toThrow(/la carpeta y el slug tienen que coincidir/)
    } finally {
      limpiar()
    }
  })

  it("un manifiesto inválido ROMPE la carga (el build no sale con un recorrido roto)", () => {
    const { dir, limpiar } = carpeta()
    try {
      const roto = publicable()
      delete roto.escenas[0].multires
      escribir(dir, "rota", { ...roto, slug: "rota" })
      expect(() => listarTours(dir)).toThrow(/no es un manifiesto de recorrido válido/)
    } finally {
      limpiar()
    }
  })

  it("slugs con trucos de ruta no leen nada fuera de tours/", () => {
    expect(leerTour("../package")).toBeUndefined()
    expect(leerTour("a/b")).toBeUndefined()
  })
})
