import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import sharp from "sharp"
import { calcularNiveles, generarMultires, renderizarCara, tamanoNivel } from "../scripts/tour360-preparar/tiler.mjs"
import { equirectSintetica } from "./helpers/equirect-sintetica.mjs"

/*
  Tiler de scripts/tour360-preparar. Imagen de entrada: una CUADRÍCULA sintética
  generada por fórmula (tests/helpers/equirect-sintetica.mjs). Nada de fotos.

  Los valores esperados NO salen del código que se prueba:
    · niveles y tiles de una X4: aritmética hecha a mano (comentada en cada caso);
    · posición de los marcadores en cada cara: trigonometría hecha a mano a partir
      de dónde se pintaron en la equirectangular (lon/lat);
    · que las caras tengan la ORIENTACIÓN que Pannellum espera no se puede probar
      con un test unitario: se comprobó renderizando en Pannellum, equirectangular
      directa frente a multires generado, en 14 vistas incluidos cénit y nadir
      (docs/TOUR-360.md §Verificación del tiler; script
      scripts/tour360-preparar/verificar-con-pannellum.mjs).
*/

describe("niveles — aritmética de generate.py a mano", () => {
  it("X4 en foto 72 MP (11904×5952, dato publicado por Insta360): cubo 3784, 4 niveles, 510 tiles", () => {
    // 11904/π = 3789,2 → /8 = 473,6 → ⌊·⌋ = 473 → ·8 = 3784.
    // log2(3784/512) = log2(7,39) = 2,89 → ⌈·⌉ = 3 → +1 = 4 niveles.
    const n = calcularNiveles({ ancho: 11904 })
    expect(n).toEqual({ cubeResolution: 3784, tileResolution: 512, maxLevel: 4 })
    // Lado por nivel (mitad en cada uno, truncando): 473, 946, 1892, 3784.
    expect([1, 2, 3, 4].map((l) => tamanoNivel(3784, 4, l))).toEqual([473, 946, 1892, 3784])
    // Tiles por cara: ⌈473/512⌉²=1, ⌈946/512⌉²=4, ⌈1892/512⌉²=16, ⌈3784/512⌉²=64 → 85; ×6 caras = 510.
    const porCara = [473, 946, 1892, 3784].map((s) => Math.ceil(s / 512) ** 2)
    expect(porCara).toEqual([1, 4, 16, 64])
    expect(6 * porCara.reduce((a, b) => a + b, 0)).toBe(510)
  })

  it("5,7K (5760×2880): cubo 1832, 3 niveles", () => {
    // 5760/π = 1833,5 → /8 = 229,2 → 229 → ·8 = 1832. log2(1832/512)=1,84 → 2 → +1 = 3.
    expect(calcularNiveles({ ancho: 5760 })).toEqual({ cubeResolution: 1832, tileResolution: 512, maxLevel: 3 })
  })

  it("si el cubo cabe en un tile, hay un solo nivel y el tile se encoge al cubo", () => {
    // 1024/π = 325,9 → /8 = 40,7 → 40 → ·8 = 320 < 512.
    expect(calcularNiveles({ ancho: 1024 })).toEqual({ cubeResolution: 320, tileResolution: 320, maxLevel: 1 })
  })
})

describe("proyección — marcadores en la cara correcta", () => {
  // Equirectangular 1024×512. Marcadores (ver equirect-sintetica.mjs), todos pintados por (lon, lat):
  //   rojo (30, 20) · azul (−60, −10) · magenta (180, 75) · verde (0, −75) · amarillo lat>85 · cian lat<−85
  const eq = equirectSintetica(1024)
  const N = 256
  const px = (cara: Buffer, i: number, j: number) => [cara[(i * N + j) * 3], cara[(i * N + j) * 3 + 1], cara[(i * N + j) * 3 + 2]]
  const f = renderizarCara(eq, "f", N)
  const l = renderizarCara(eq, "l", N)
  const u = renderizarCara(eq, "u", N)
  const d = renderizarCara(eq, "d", N)

  it("cara f: el disco rojo (lon 30°, lat 20°) cae donde dice la trigonometría", () => {
    // Plano f (z=1): a = tan 30° = 0,57735 ; b = tan 20° / cos 30° = 0,36397/0,86603 = 0,42027.
    // columna j = (1+a)/2·256 − ½ = 201,4 ; fila i = (1−b)/2·256 − ½ = 73,7.
    const [r, g, b] = px(f, 74, 201)
    expect(r).toBeGreaterThan(200)
    expect(g).toBeLessThan(80)
    expect(b).toBeLessThan(80)
  })

  it("cara l: el cuadrado azul (lon −60°, lat −10°) cae donde dice la trigonometría", () => {
    // l mira a yaw −90°; lon −60° está 30° hacia la derecha (hacia delante). a = tan 30° = 0,57735
    // → j = 201,4. b = tan(−10°)/cos 30° = −0,17633/0,86603 = −0,20361 → i = (1+0,20361)/2·256 − ½ = 153,6.
    const [r, , b] = px(l, 154, 201)
    expect(b).toBeGreaterThan(200)
    expect(r).toBeLessThan(80)
  })

  it("cara u: el cénit es el casquete amarillo y el disco magenta (lon 180°, lat 75°) está ARRIBA del centro", () => {
    // Centro de u = lat 90° → amarillo (lat > 85°).
    const [cr, cg, cb] = px(u, 127, 127)
    expect(cr).toBeGreaterThan(200)
    expect(cg).toBeGreaterThan(180)
    expect(cb).toBeLessThan(100)
    // Dirección (yaw 180°, pitch 75°): x=0, y=sin 75°, z=−cos 75°. En u el borde superior mira ATRÁS (−z):
    // a = 0 → j = 127,5 ; b = cos 75°/sin 75° = 0,26795 → i = (1−0,26795)/2·256 − ½ = 93,2 (por encima del centro, fila 127).
    const [r, g, b] = px(u, 93, 127)
    expect(r).toBeGreaterThan(180)
    expect(b).toBeGreaterThan(180)
    expect(g).toBeLessThan(80)
  })

  it("cara d: el nadir es el casquete cian y el disco verde (lon 0°, lat −75°) está ARRIBA del centro", () => {
    const [cr, cg, cb] = px(d, 127, 127)
    expect(cr).toBeLessThan(100)
    expect(cg).toBeGreaterThan(180)
    expect(cb).toBeGreaterThan(180)
    // Dirección (yaw 0°, pitch −75°): y=−sin 75°, z=cos 75°. En d el borde superior mira DELANTE (+z):
    // b = cos 75°/sin 75° = 0,26795 → i = 93,2 ; a = 0 → j = 127,5.
    const [r, g, b] = px(d, 93, 127)
    expect(g).toBeGreaterThan(160)
    expect(r).toBeLessThan(80)
    expect(b).toBeLessThan(110)
  })

  it("las costuras no tienen escalón: el borde derecho de f y el izquierdo de r son la misma vertical", () => {
    // Columna extrema derecha de f = yaw ≈ +45° ; la extrema izquierda de r (mira a +90°) = yaw ≈ +45° también.
    const r = renderizarCara(eq, "r", N)
    let maxDif = 0
    for (let i = 0; i < N; i++) {
      for (let c = 0; c < 3; c++) {
        maxDif = Math.max(maxDif, Math.abs(f[(i * N + (N - 1)) * 3 + c] - r[(i * N) * 3 + c]))
      }
    }
    // Un píxel de separación entre muestras (≈0,36° de yaw) sobre un degradado suave y líneas de 1,2°:
    // la diferencia máxima tolerable es la de un salto de línea de cuadrícula, no un cambio de imagen.
    const grande = Array.from({ length: N }, (_, i) => Math.abs(f[(i * N + (N - 1)) * 3] - r[(i * N) * 3]))
    const sobre = grande.filter((x) => x > 90).length
    expect(sobre, `píxeles con salto >90: ${sobre} de ${N} (máx ${maxDif})`).toBeLessThan(N * 0.1)
  })
})

describe("generarMultires — estructura en disco", () => {
  let dir: string
  let salida: string
  let resultado: Awaited<ReturnType<typeof generarMultires>>
  const MARCA = "tour360-marca-privada-exif"

  beforeAll(async () => {
    dir = mkdtempSync(join(tmpdir(), "tour360-tiler-"))
    const eq = equirectSintetica(2048)
    // JPEG de entrada CON metadatos que no deben salir: una marca en EXIF (Copyright, ASCII en claro).
    await sharp(eq.data, { raw: { width: eq.width, height: eq.height, channels: 3 } })
      .withExif({ IFD0: { Copyright: MARCA } })
      .jpeg({ quality: 92 })
      .toFile(join(dir, "salon.jpg"))
    salida = join(dir, "salida")
    resultado = await generarMultires({ entrada: join(dir, "salon.jpg"), salida })
  }, 60_000)

  afterAll(() => rmSync(dir, { recursive: true, force: true }))

  const dims = async (ruta: string) => {
    const m = await sharp(join(salida, ruta)).metadata()
    return [m.width, m.height]
  }

  it("la entrada de prueba SÍ lleva la marca en su EXIF (si no, la prueba de borrado no probaría nada)", async () => {
    const m = await sharp(join(dir, "salon.jpg")).metadata()
    expect(m.exif).toBeDefined()
    expect(m.exif!.toString("latin1")).toContain(MARCA)
  })

  it("parámetros multires: 2048 de ancho → cubo 648, 2 niveles, tiles de 512", () => {
    // 2048/π = 651,9 → /8 = 81,5 → 81 → ·8 = 648. log2(648/512) = 0,34 → 1 → +1 = 2.
    expect(resultado.multires).toEqual({ tileResolution: 512, maxLevel: 2, cubeResolution: 648, extension: "jpg" })
    expect(JSON.parse(readFileSync(join(salida, "multires.json"), "utf8"))).toEqual(resultado.multires)
  })

  it("nombres de fichero de Pannellum: <nivel>/<cara><fila>_<col>.jpg y fallback/<cara>.jpg", () => {
    for (const cara of ["f", "b", "u", "d", "l", "r"]) {
      expect(readdirSync(join(salida, "2")).filter((x) => x.startsWith(cara)).sort()).toEqual(
        [0, 1].flatMap((i) => [0, 1].map((j) => `${cara}${i}_${j}.jpg`)),
      )
      expect(existsSync(join(salida, "1", `${cara}0_0.jpg`))).toBe(true)
      expect(existsSync(join(salida, "fallback", `${cara}.jpg`))).toBe(true)
    }
    // Nivel 2: ⌈648/512⌉² = 4 por cara ; nivel 1: 324 → 1 por cara ; ⇒ 6·(4+1) = 30 tiles + 6 fallback + 1 preview.
    expect(resultado.ficheros).toBe(37)
  })

  it("tiles de borde con el tamaño que sobra (648 = 512 + 136) y nivel 1 de 324", async () => {
    expect(await dims("2/f0_0.jpg")).toEqual([512, 512])
    expect(await dims("2/f0_1.jpg")).toEqual([136, 512])
    expect(await dims("2/f1_0.jpg")).toEqual([512, 136])
    expect(await dims("2/f1_1.jpg")).toEqual([136, 136])
    expect(await dims("1/f0_0.jpg")).toEqual([324, 324])
  })

  it("fallback de 512 y preview equirectangular de 1024×512", async () => {
    expect(await dims("fallback/u.jpg")).toEqual([512, 512])
    expect(await dims("preview.jpg")).toEqual([1024, 512])
  })

  it("el contenido de un tile es el esperado (disco rojo de f en el tile 0_0 del nivel 2)", async () => {
    // Lado 648: j = 0,788675·648 − ½ = 510,5 ; i = 0,289865·648 − ½ = 187,3 (cálculo del test de proyección).
    // Se toma un punto 20 px dentro del disco (radio ≈ 59 px): fila 187, columna 490.
    const { data, info } = await sharp(join(salida, "2/f0_0.jpg")).raw().toBuffer({ resolveWithObject: true })
    const o = (187 * info.width + 490) * info.channels
    expect(data[o]).toBeGreaterThan(180)
    expect(data[o + 1]).toBeLessThan(90)
    expect(data[o + 2]).toBeLessThan(90)
  })

  it("PRIVACIDAD: ni un tile, fallback ni preview lleva EXIF, XMP ni la marca de la foto original", async () => {
    const ficheros = ["preview.jpg"]
    for (const f of readdirSync(join(salida, "fallback"))) ficheros.push(`fallback/${f}`)
    for (const nivel of ["1", "2"]) for (const f of readdirSync(join(salida, nivel))) ficheros.push(`${nivel}/${f}`)
    expect(ficheros.length).toBe(37)
    for (const f of ficheros) {
      const m = await sharp(join(salida, f)).metadata()
      expect(m.exif, `${f} lleva EXIF`).toBeUndefined()
      expect(m.xmp, `${f} lleva XMP`).toBeUndefined()
      expect(readFileSync(join(salida, f)).includes(Buffer.from(MARCA)), `${f} contiene la marca`).toBe(false)
    }
  })
})

describe("generarMultires — entradas que se rechazan", () => {
  it("una imagen que no es 2:1 no es una equirectangular completa", async () => {
    const dir = mkdtempSync(join(tmpdir(), "tour360-tiler-"))
    try {
      const ruta = join(dir, "panoramica.jpg")
      writeFileSync(ruta, await sharp({ create: { width: 1200, height: 800, channels: 3, background: "#888" } }).jpeg().toBuffer())
      await expect(generarMultires({ entrada: ruta, salida: join(dir, "x") })).rejects.toThrow(/no es una equirectangular completa/)
      expect(existsSync(join(dir, "x"))).toBe(false)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
