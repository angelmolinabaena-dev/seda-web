import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import sharp from "sharp"
import { comprobarPrevio, listarEntradas, parsearArgumentos, preparar } from "../scripts/tour360-preparar/index.mjs"
import { validarTour } from "@/lib/tour360/manifiesto"
import { equirectSintetica } from "./helpers/equirect-sintetica.mjs"

/*
  scripts/tour360-preparar de extremo a extremo, con equirectangulares sintéticas
  (cuadrícula) y un manifiesto copiado de tours/_plantilla. No toca tours/ del repo.
*/

let dir: string
let entrada: string
let manifiesto: string

async function jpgSintetico(ruta: string, ancho = 2048) {
  const eq = equirectSintetica(ancho)
  await sharp(eq.data, { raw: { width: eq.width, height: eq.height, channels: 3 } }).jpeg({ quality: 90 }).toFile(ruta)
}

beforeAll(async () => {
  dir = mkdtempSync(join(tmpdir(), "tour360-cli-"))
  entrada = join(dir, "entrada")
  mkdirSync(entrada)
  await jpgSintetico(join(entrada, "salon.jpg"))
  await jpgSintetico(join(entrada, "cocina.jpeg"), 2048)
  manifiesto = join(dir, "tour.json")
  cpSync(join(process.cwd(), "tours", "_plantilla", "tour.json"), manifiesto)
}, 60_000)

afterAll(() => rmSync(dir, { recursive: true, force: true }))

describe("argumentos", () => {
  it("valores por defecto y opciones numéricas", () => {
    const o = parsearArgumentos(["--slug", "bay-side", "--entrada", "x", "--calidad", "70", "--sobrescribir"])
    expect(o).toMatchObject({ slug: "bay-side", entrada: "x", calidad: 70, tile: 512, fallback: 512, cubo: 0, salida: "tours-salida", sobrescribir: true })
  })
  it("rechaza opciones desconocidas, valores que faltan y números absurdos", () => {
    expect(() => parsearArgumentos(["--rapido"])).toThrow(/Opción desconocida/)
    expect(() => parsearArgumentos(["--slug"])).toThrow(/necesita un valor/)
    expect(() => parsearArgumentos(["--calidad", "alta"])).toThrow(/debe ser un número/)
  })
})

describe("entradas y comprobaciones previas", () => {
  it("los ids salen del nombre del fichero, en minúsculas, y se aceptan .jpg y .jpeg", () => {
    expect(listarEntradas({ entrada }).map((e) => e.id)).toEqual(["cocina", "salon"])
    expect(listarEntradas({ entrada: join(entrada, "salon.jpg"), escena: "sala" })[0].id).toBe("sala")
  })

  it("rechaza ids mal formados, repetidos y escenas que no están en el manifiesto — ANTES de procesar nada", () => {
    const m = JSON.parse(readFileSync(manifiesto, "utf8"))
    const p = comprobarPrevio({
      entradas: [
        { id: "salon", ruta: "/x/salon.jpg" },
        { id: "salon", ruta: "/x/salon.jpeg" },
        { id: "habitación 2", ruta: "/x/Habitación 2.jpg" },
        { id: "garaje", ruta: "/x/garaje.jpg" },
      ],
      manifiesto: m,
    })
    expect(p.some((x) => /id repetido: «salon»/.test(x))).toBe(true)
    expect(p.some((x) => /«habitación 2».*no es válido/.test(x))).toBe(true)
    expect(p.some((x) => /«garaje» no está en el manifiesto/.test(x))).toBe(true)
  })

  it("una carpeta sin .jpg o una ruta inexistente fallan con mensaje claro", () => {
    const vacia = join(dir, "vacia")
    mkdirSync(vacia)
    expect(() => listarEntradas({ entrada: vacia })).toThrow(/No hay ningún \.jpg/)
    expect(() => listarEntradas({ entrada: join(dir, "nada") })).toThrow(/No existe la entrada/)
  })
})

describe("preparar()", () => {
  it("genera los tiles de cada foto y escribe multires en el manifiesto, sin tocar nada más", async () => {
    const antes = JSON.parse(readFileSync(manifiesto, "utf8"))
    const salida = join(dir, "salida")
    const lineas: string[] = []
    const r = await preparar({ slug: "plantilla", entrada, salida, manifiesto, calidad: 80, tile: 512, fallback: 512, cubo: 0 }, (l: string) => lineas.push(l))

    expect(r.resultados.map((x: { id: string }) => x.id)).toEqual(["cocina", "salon"])
    for (const id of ["salon", "cocina"]) {
      expect(existsSync(join(salida, "plantilla", id, "2", "f0_0.jpg"))).toBe(true)
      expect(existsSync(join(salida, "plantilla", id, "fallback", "u.jpg"))).toBe(true)
      expect(existsSync(join(salida, "plantilla", id, "preview.jpg"))).toBe(true)
    }

    const despues = JSON.parse(readFileSync(manifiesto, "utf8"))
    const mr = { tileResolution: 512, maxLevel: 2, cubeResolution: 648, extension: "jpg" }
    expect(despues.escenas.find((e: { id: string }) => e.id === "salon").multires).toEqual(mr)
    expect(despues.escenas.find((e: { id: string }) => e.id === "cocina").multires).toEqual(mr)
    // Las demás escenas siguen sin procesar y el recorrido sigue sin publicar: eso lo decide una persona.
    for (const id of ["dormitorio-1", "terraza", "piscina"]) {
      expect(despues.escenas.find((e: { id: string }) => e.id === id).multires).toBeUndefined()
    }
    expect(despues.publicado).toBe(false)
    // Lo único que cambia respecto a antes son los dos multires.
    for (const e of despues.escenas) delete e.multires
    expect(despues).toEqual(antes)
    // El resultado sigue siendo un manifiesto válido.
    expect(() => validarTour(JSON.parse(readFileSync(manifiesto, "utf8")))).not.toThrow()

    const informe = JSON.parse(readFileSync(join(salida, "plantilla", "informe.json"), "utf8"))
    expect(Object.keys(informe.escenas).sort()).toEqual(["cocina", "salon"])
    expect(informe.escenas.salon.origen).toBe("2048×1024")
    expect(lineas.join("\n")).toMatch(/Este script no sube nada/)
    expect(lineas.join("\n")).toMatch(/checklist de privacidad/)
  }, 60_000)

  it("no pisa una salida existente sin --sobrescribir", async () => {
    await expect(
      preparar({ slug: "plantilla", entrada, salida: join(dir, "salida"), manifiesto, calidad: 80, tile: 512, fallback: 512, cubo: 0 }),
    ).rejects.toThrow(/Ya existe salida para: cocina, salon/)
  })

  it("una foto con nombre de escena que no existe aborta sin generar nada", async () => {
    const otra = join(dir, "otra")
    mkdirSync(otra)
    await jpgSintetico(join(otra, "garaje.jpg"), 1024)
    const salida = join(dir, "salida-2")
    await expect(
      preparar({ slug: "plantilla", entrada: otra, salida, manifiesto, calidad: 80, tile: 512, fallback: 512, cubo: 0 }),
    ).rejects.toThrow(/«garaje» no está en el manifiesto/)
    expect(existsSync(salida)).toBe(false)
  })

  it("sin manifiesto (--sin-manifiesto) solo genera tiles", async () => {
    const solo = join(dir, "solo")
    mkdirSync(solo)
    await jpgSintetico(join(solo, "libre.jpg"), 1024)
    const salida = join(dir, "salida-3")
    const antes = readFileSync(manifiesto, "utf8")
    await preparar({ slug: "x", entrada: solo, salida, sinManifiesto: true, calidad: 80, tile: 512, fallback: 512, cubo: 0 })
    expect(existsSync(join(salida, "x", "libre", "1", "f0_0.jpg"))).toBe(true)
    expect(readFileSync(manifiesto, "utf8")).toBe(antes)
  })

  it("exige un slug válido y un manifiesto existente", async () => {
    await expect(preparar({ slug: "Bay Side", entrada })).rejects.toThrow(/--slug/)
    await expect(preparar({ slug: "sin-manifiesto-alguno", entrada, manifiesto: join(dir, "no.json") })).rejects.toThrow(/No existe/)
  })

  it("el manifiesto de plantilla del repo no se ha modificado por los tests", () => {
    const real = JSON.parse(readFileSync(join(process.cwd(), "tours", "_plantilla", "tour.json"), "utf8"))
    for (const e of real.escenas) expect(e.multires).toBeUndefined()
    writeFileSync(join(dir, "nota.txt"), "ok")
  })
})
