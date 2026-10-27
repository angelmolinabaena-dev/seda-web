import { execFileSync } from "node:child_process"
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import sitemap from "@/app/sitemap"
import { VILLAS, esPublicable, incluyeVilla, villasVisibles, type FichaVilla } from "@/lib/escaparate"
import { jsonLdString } from "@/lib/jsonld"
import { AVISO_LEGAL } from "@/lib/legal/aviso-legal"
import { bloqueAplica, camposSociedadPendientes, pieLegal, resolverIdentidad } from "@/lib/legal/entity"
import { getSitePage } from "@/lib/site-pages"
import { comisionGestion, liquidacionEjemplo, netoAnual, resolverMensajes } from "@/lib/tarifa"

/*
  REA seda-web — 2026-10 (docs/audit/REA-SEDA-WEB-2026-10.md): arreglos.

  La auditoría (#97) dejó este fichero con 49 `it.fails`: cada uno afirmaba lo
  que DEBÍA pasar y fallaba hoy. Este PR arregla los hallazgos, así que cada
  `it.fails` pasa a `it` (verde) y lleva su CONTROL NEGATIVO: el mismo
  predicado, aplicado a una muestra con el defecto original, tiene que
  detectarlo. Sin el control, un predicado mal escrito pasaría en verde para
  siempre (CLAUDE.md: «un test en verde no demuestra corrección»).

    · `it(...)` normal      → el arreglo: el predicado no encuentra el defecto.
    · `// control negativo` → el predicado SÍ lo encuentra en la muestra mala.

  Las aserciones de texto leen lo que sirve la web: los mensajes con las cifras
  de la tarifa ya resueltas (`i18n/request.ts`) o el fuente de la página. La
  referencia de las cifras NO sale del código: son las de la decisión de Ángel
  del 25–26-oct-2026 (tarifa v6), calculadas a mano en tests/tarifa.test.ts.
*/

const raiz = process.cwd()
const leer = (rel: string) => readFileSync(join(raiz, rel), "utf8")
const LOCALES = ["es", "en", "fr", "de"] as const
type Loc = (typeof LOCALES)[number]
type Arbol = { [k: string]: Arbol | string }
const crudos = Object.fromEntries(LOCALES.map((l) => [l, JSON.parse(leer(`messages/${l}.json`))])) as Record<Loc, Arbol>
// Lo que llega a la web: i18n/request.ts resuelve [[tarifa.x]] antes de dárselo a next-intl.
const msgs = Object.fromEntries(LOCALES.map((l) => [l, resolverMensajes(crudos[l], l)])) as Record<Loc, Arbol>
const at = (l: Loc, path: string): string => {
  const v = path.split(".").reduce<Arbol | string | undefined>((o, k) => (typeof o === "object" ? o[k] : undefined), msgs[l])
  if (typeof v !== "string") throw new Error(`messages/${l}.json: no hay texto en ${path}`)
  return v
}

afterEach(() => {
  vi.unstubAllEnvs()
})

// ── I-1 · la tarifa publicada es la v6 (21 % + IVA, tope del 20 %) ──

describe("I-1 · el precio de gestión publicado es el de la v6", () => {
  const CLAVES_PRECIO = [
    "prop.faq.items.q1.a",
    "faq.owners_items.q2.a",
    "prop.sim.net_note",
    "prop.sim.disclaimer",
    "home.dashboard.liquidacion.row3",
    "prop.os.liq_comision",
  ]
  const esV3 = (s: string) => /\b24 ?%/.test(s)
  const IVA = /IVA|VAT|TVA|MwSt/

  it("control negativo — el predicado detecta la v3 en los textos que había", () => {
    expect(esV3("Aplicamos una comisión del 24% sobre el alojamiento")).toBe(true)
    expect(esV3("Comisión SEDA · 24% de la base")).toBe(true)
    expect(esV3("Commission 24%")).toBe(true)
    expect(esV3("un 21% con tope del 20%")).toBe(false)
  })

  for (const l of LOCALES) {
    it(`${l}: ninguna cifra de comisión del 24 %`, () => {
      for (const k of CLAVES_PRECIO) expect(esV3(at(l, k)), `${l}:${k}`).toBe(false)
    })

    it(`${l}: la FAQ de precio dice 21 %, el tope del 20 % y que el IVA va aparte`, () => {
      const a = at(l, "prop.faq.items.q1.a")
      expect(a).toMatch(/21 ?%/)
      expect(a).toMatch(/20 ?%/)
      expect(a).toMatch(IVA)
    })

    it(`${l}: los ejemplos publicados son los calculados a mano (200 € directa, 178,50 € con canal del 15 %)`, () => {
      const a = at(l, "prop.faq.items.q1.a")
      // 1.000 €: directa 21 % = 210 € → tope 200 €; con canal 150 € → 21 % × 850 = 178,50 €
      expect(a).toMatch(l === "en" ? /€210\b/ : /\b210\b/)
      expect(a).toMatch(l === "en" ? /€200\b/ : /\b200\b/)
      expect(a).toMatch(l === "en" ? /€178\.50/ : /178,50/)
    })

    it(`${l}: /faq (JSON-LD y llms.txt beben de aquí) dice lo mismo que /propietarios`, () => {
      const a = at(l, "faq.owners_items.q2.a")
      expect(a).toMatch(/21 ?%/)
      expect(a).toMatch(/20 ?%/)
      expect(a).toMatch(IVA)
    })
  }

  it("/founding-owners y /meet (cuatro idiomas) no publican 24 %", () => {
    for (const l of LOCALES) {
      const textos = JSON.stringify({ f: msgs[l].founding, m: msgs[l].meet })
      expect(esV3(textos), l).toBe(false)
    }
    // Y su fuente ya no lleva texto propio que pueda divergir (M-8).
    expect(leer("app/[locale]/founding-owners/page.tsx")).not.toMatch(/\b24 ?%/)
    expect(leer("app/[locale]/meet/page.tsx")).not.toMatch(/\b24 ?%/)
  })

  it("el ejemplo de /founding-owners es el de la v6 a mano: base 900 € → 189 € (+39,69 € de IVA), no 216 €", () => {
    expect(at("es", "founding.copy.diffs.d2.body")).toMatch(/comisión SEDA 189 €/)
    expect(at("es", "founding.copy.diffs.d2.body")).toMatch(/39,69 € de IVA/)
    expect(at("es", "founding.copy.diffs.d2.body")).not.toMatch(/comisión SEDA 216/)
    expect(at("en", "founding.copy.diffs.d2.body")).toMatch(/SEDA commission €189\b/)
    expect(at("fr", "founding.copy.diffs.d2.body")).toMatch(/commission SEDA 189 €/)
    expect(at("de", "founding.copy.diffs.d2.body")).toMatch(/SEDA-Provision 189 €/)
  })

  it("la maqueta de liquidación enseña 180 € (el tope manda sobre 189 €) y neto 820 €, no 216 € / 784 €", () => {
    expect(liquidacionEjemplo()).toMatchObject({ comision: 180, neto: 820 })
    for (const f of ["components/dashboard-mockup.tsx", "app/[locale]/propietarios/PropietariosContent.tsx"]) {
      expect(leer(f), f).not.toMatch(/€ 216|€ 784/)
      expect(leer(f), f).toMatch(/liquidacionEjemplo\(\)/)
    }
  })

  it("control — el calendario del alta publicado (0 € / 0 € / 0 € / 490 € / 490 € / 1.290 €) sigue siendo el de la v6", () => {
    for (const l of LOCALES) {
      const a = at(l, "prop.faq.items.q1.a")
      expect(a, l).toMatch(/490/)
      expect(a, l).toMatch(/1[.,\s  ]?290/)
    }
  })
})

// ── I-2 · preaviso de un mes ──

describe("I-2 · el preaviso publicado es de un mes", () => {
  const dice60 = (s: string) => /\b(60|sesenta|sixty|soixante|sechzig)\b/i.test(s)

  it("control negativo — el predicado detecta los 60 días que había", () => {
    expect(dice60("Preaviso de 60 días, sin penalizaciones")).toBe(true)
    expect(dice60("Sixty days' notice")).toBe(true)
    expect(dice60("Soixante jours de préavis")).toBe(true)
    expect(dice60("Sechzig Tage Kündigungsfrist")).toBe(true)
    expect(dice60("Preaviso de un mes")).toBe(false)
  })

  const UN_MES: Record<Loc, RegExp> = {
    es: /un mes/i,
    en: /one month/i,
    fr: /un mois/i,
    de: /ein Monat/i,
  }
  for (const l of LOCALES) {
    it(`${l}: la FAQ de baja no dice 60 días y dice un mes`, () => {
      const a = at(l, "prop.faq.items.q7.a")
      expect(dice60(a)).toBe(false)
      expect(a).toMatch(UN_MES[l])
    })
  }
})

// ── I-3 · el simulador modela la v6 ──

describe("I-3 · el simulador modela la v6", () => {
  const src = leer("app/[locale]/propietarios/PropietariosContent.tsx")
  const formulaV3 = (s: string) => /annualGross \* \(1 - 0\.24\)|annualGross \* \(1 - 0\.15\) \* \(1 - 0\.24\)/.test(s)

  it("control negativo — el predicado detecta la fórmula plana del 24 % que había", () => {
    expect(formulaV3("const netDirect = Math.round(annualGross * (1 - 0.24))")).toBe(true)
    expect(formulaV3("const netOTA = Math.round(annualGross * (1 - 0.15) * (1 - 0.24))")).toBe(true)
  })

  it("el componente usa lib/tarifa (21 % y tope del 20 % con IVA aparte), no una fórmula escrita a mano", () => {
    expect(formulaV3(src)).toBe(false)
    expect(src).toMatch(/netoAnual\(annualGross\)/)
    expect(src).not.toMatch(/0\.24/)
  })

  it("con los valores por defecto (381.060 €) enseña 255.882 – 304.848 € antes de IVA y 14.284 – 16.005 € de IVA", () => {
    // Cifras hechas a mano (ver tests/tarifa.test.ts): la v3 daba 246.165 – 289.606 €.
    expect(netoAnual(Math.round(0.72 * 365 * 1450))).toEqual({ directa: 304848, ota: 255882, ivaDirecta: 16005, ivaOta: 14284 })
  })

  it("una reserva directa con el tope activo y otra sin él: el tope solo recorta cuando el 21 % lo supera", () => {
    expect(comisionGestion(1000, 0).aplicaTope).toBe(true) // 210 > 200
    expect(comisionGestion(1000, 150).aplicaTope).toBe(false) // 178,50 < 200
  })
})

// ── I-4 · lo que la v6 cobra aparte y la web no contaba ──

describe("I-4 · la web dice lo que la v6 cobra aparte de la comisión", () => {
  const texto = (l: Loc) => ["prop.faq.items.q1.a", "prop.faq.items.q5.a", "faq.owners_items.q2.a"].map((k) => at(l, k)).join(" ")
  const diceConPreaviso = (s: string) => /preaviso|advance notice|notice|préavis|Vorankündigung|vorab|Vorlauf/i.test(s)

  it("control negativo — el predicado no se conforma con el texto de uso propio que había", () => {
    expect(diceConPreaviso("Sí. Bloquee las fechas en SEDA OS o en el portal de propietarios. El equipo prepara la casa.")).toBe(false)
    expect(diceConPreaviso("Yes. Block the dates in SEDA OS or the Owners Portal.")).toBe(false)
  })

  for (const l of LOCALES) {
    it(`${l}: el uso propio dice «con preaviso» y no inventa una «tarifa interna»`, () => {
      const a = at(l, "prop.faq.items.q5.a")
      expect(diceConPreaviso(a)).toBe(true)
      expect(a).not.toMatch(/tarifa interna|internal rate|tarifs internes|internen Tarif/i)
    })

    it(`${l}: el margen de mantenimiento (12 % solo sobre el exceso de 200 €, sin IVA) figura en la respuesta de precio`, () => {
      expect(texto(l)).toMatch(/12 ?%/)
      expect(texto(l)).toMatch(/200/)
      expect(at(l, "prop.faq.items.q1.a")).toMatch(/12 ?%/)
      expect(at(l, "faq.owners_items.q2.a")).toMatch(/12 ?%/)
    })
  }
})

// ── I-5 · /founding-owners no cuenta propietarios que no hay ──

describe("I-5 · /founding-owners no cuenta propietarios que no hay", () => {
  // SELECT de conteo del 27-oct-2026 en producción: propietarios = 1, contratos_gestion = 0.
  const cuentaPropietarios = (s: string) => /\b2 (propietarios|owners|propriétaires|Eigentümer)\b/.test(s)

  it("control negativo — el predicado detecta «2 propietarios en programa» en los cuatro idiomas", () => {
    for (const s of ["2 propietarios en programa", "2 owners in programme", "2 propriétaires dans le programme", "2 Eigentümer im Programm"]) {
      expect(cuentaPropietarios(s), s).toBe(true)
    }
  })

  it("no afirma «2 propietarios/owners/propriétaires/Eigentümer en el programa» en ningún idioma", () => {
    for (const l of LOCALES) {
      expect(cuentaPropietarios(JSON.stringify(msgs[l].founding)), l).toBe(false)
      expect(cuentaPropietarios(JSON.stringify(msgs[l].meet)), l).toBe(false)
    }
    expect(cuentaPropietarios(leer("app/[locale]/founding-owners/page.tsx"))).toBe(false)
  })

  it("«Alta gratuita para las 3 primeras firmas directas» sigue (es la v6 y cuadra con 0 contratos)", () => {
    expect(at("es", "founding.copy.seatsLeft")).toMatch(/3 primeras firmas directas/)
  })
})

// ── B-1 · sin VFT la casa no se publica como reservable ──

describe("B-1 · sin VFT la casa no se publica como reservable", () => {
  const ON = { SEDA_FLAG_ESCAPARATE_VILLAS: "1" }
  const bay = () => VILLAS.find((v) => v.slug === "bay-side")!
  // La lógica de antes: el flag como única puerta.
  const puertaAntigua = (env: Record<string, string | undefined>): FichaVilla[] => (env.SEDA_FLAG_ESCAPARATE_VILLAS === "1" ? VILLAS : [])

  it("control — con el flag apagado no hay ninguna ficha (producción: /villa/bay-side → 404)", () => {
    expect(villasVisibles({})).toEqual([])
  })

  it("control — Bay Side no tiene número de registro turístico en el repo", () => {
    expect(bay().registroTuristico).toBeNull()
  })

  it("control negativo — con la puerta de antes (solo el flag) Bay Side SÍ aparecía", () => {
    expect(puertaAntigua(ON).map((v) => v.slug)).toEqual(["bay-side"])
  })

  it("con el flag encendido y sin VFT, ninguna ficha es visible", () => {
    expect(villasVisibles(ON)).toEqual([])
  })

  it("con VFT y arrendador (y flag) la ficha sí se abre: la llave existe", () => {
    const completa = { ...bay(), registroTuristico: "VFT/MA/00000", arrendador: "Propietario de ejemplo" }
    expect(esPublicable(completa)).toBe(true)
  })

  it("/coleccion no dice «casas que ya puede reservar» mientras falte el VFT (ni en la meta description)", () => {
    vi.stubEnv("SEDA_FLAG_ESCAPARATE_VILLAS", "1")
    // `ColeccionContent` y `site-pages` deciden por `villasVisibles().length > 0`.
    expect(villasVisibles().length).toBe(0)
    const t = ((k: string) => k) as never
    expect(getSitePage("/coleccion").copy(t, "es").description).toBe("coleccion.body") // «Próxima apertura»
  })

  it("el sitemap no lista ninguna /villa/ sin VFT", () => {
    vi.stubEnv("SEDA_FLAG_ESCAPARATE_VILLAS", "1")
    expect(sitemap().map((e) => e.url).filter((u) => u.includes("/villa/"))).toEqual([])
  })
})

// ── B-2 · SEDA gestiona en nombre y por cuenta del arrendador ──

describe("B-2 · quién es el arrendador, y un aviso legal que cuenta lo que la web hace", () => {
  const AVISO_ES = JSON.stringify(AVISO_LEGAL.traducciones.es)
  const diceReservaDirecta = (s: string) => /Reserva directa con SEDA|Book direct with SEDA|Réservation directe avec SEDA|Direkt buchen bei SEDA/.test(s)
  const ARRENDADOR: Record<Loc, RegExp> = { es: /Arrendador/, en: /Lessor/, fr: /Bailleur/, de: /Vermieter/ }

  it("control negativo — el predicado detecta «Reserva directa con SEDA» en las metas que había", () => {
    expect(diceReservaDirecta("Bay Side: Apartamento en Estepona, Costa del Sol. Reserva directa con SEDA Private Homes.")).toBe(true)
    expect(diceReservaDirecta("…Costa del Sol. Book direct with SEDA Private Homes.")).toBe(true)
    expect(diceReservaDirecta("…Costa del Sol. Réservation directe avec SEDA Private Homes.")).toBe(true)
    expect(diceReservaDirecta("…Costa del Sol. Direkt buchen bei SEDA Private Homes.")).toBe(true)
  })

  for (const l of LOCALES) {
    it(`${l}: la ficha no vende «reserva directa con SEDA»; dice «${ARRENDADOR[l].source} … gestiona SEDA»`, () => {
      expect(diceReservaDirecta(at(l, "escaparate.meta.description"))).toBe(false)
      expect(at(l, "escaparate.meta.description")).toMatch(ARRENDADOR[l])
      expect(at(l, "escaparate.arrendador.linea")).toMatch(ARRENDADOR[l])
      expect(at(l, "escaparate.arrendador.linea")).toMatch(/SEDA Private Homes/)
    })
  }

  it("la ficha pinta «Arrendador: [propietario] · gestiona SEDA» ANTES del botón de reservar, y en nombre y por cuenta del propietario", () => {
    const pagina = leer("app/[locale]/villa/[slug]/page.tsx")
    expect(pagina).toMatch(/escaparate\.arrendador\.linea/)
    expect(pagina.indexOf("escaparate.arrendador.linea")).toBeLessThan(pagina.indexOf("<ReservaBeds24"))
    expect(at("es", "escaparate.arrendador.nota")).toMatch(/en nombre y por cuenta del propietario/)
    expect(at("en", "escaparate.arrendador.nota")).toMatch(/name and on the owner's behalf/)
  })

  it("el aviso legal ya no dice «No publica disponibilidad ni precios» ni «no dispone de sistema de contratación»", () => {
    expect(AVISO_ES).not.toMatch(/No publica disponibilidad ni precios/)
    expect(AVISO_ES).not.toMatch(/No dispone de sistema de contratación/)
  })

  it("control negativo — «No publica … precios» convivía con un alta de 1.290 € publicada en la misma web", () => {
    const textoAntiguo = "No dispone de sistema de contratación en línea. No publica disponibilidad ni precios, no procesa pagos"
    expect(/No publica disponibilidad ni precios/.test(textoAntiguo)).toBe(true)
    expect(at("es", "prop.faq.items.q1.a")).toMatch(/1\.290/) // y la web SÍ publica precios (de gestión)
  })

  for (const [l, esperado] of [
    ["es", [/Beds24/, /arrendador es el propietario/, /en su nombre y por su cuenta/, /no publica tarifas de alquiler/]],
    ["en", [/Beds24/, /lessor is the owner/, /in the owner's name and on the owner's behalf/, /does not publish rental rates/]],
    ["fr", [/Beds24/, /bailleur est le propriétaire/, /en son nom et pour son compte/, /ne publie pas de tarifs de location/]],
    ["de", [/Beds24/, /Vermieter ist der Eigentümer/, /in seinem Namen und für seine Rechnung/, /keine Mietpreise/]],
  ] as const) {
    it(`${l}: el aviso legal cuenta que la reserva se hace en Beds24 y que el arrendador es el propietario`, () => {
      const txt = JSON.stringify(AVISO_LEGAL.traducciones[l])
      for (const re of esperado) expect(txt, `${l} ${re}`).toMatch(re)
    })
  }

  it("alguna página dice quién es el arrendador cuando se reserva (DGT V0367-18)", () => {
    const todo = [JSON.stringify(msgs.es), AVISO_ES, leer("app/[locale]/villa/[slug]/page.tsx")].join("\n")
    expect(todo).toMatch(/arrendador/i)
  })
})

// ── I-6 · no se cita el Modelo 179 ──

describe("I-6 · no se cita el Modelo 179", () => {
  // RD 117/2024 lo sustituye por el Modelo 238 (DAC7, anual): portal-propietarios docs/fiscal/DICTAMEN-FISCAL-SEDA-26 y docs/ESTADO.md:688.
  const cita179 = (s: string) => /Modelo 179|Modelo 179\/238|Modèle 179/.test(s)

  it("control negativo — el predicado detecta la cita que había en los cuatro idiomas", () => {
    expect(cita179("(Modelo 179/238, según normativa vigente)")).toBe(true)
    expect(cita179("(Modelo 179/238, as per current regulation)")).toBe(true)
    expect(cita179("(Modelo 179/238, selon la réglementation en vigueur)")).toBe(true)
    expect(cita179("(Modelo 179/238, gemäß geltender Vorschrift)")).toBe(true)
  })

  it("/founding-owners no menciona el Modelo 179 en ningún idioma, ni /meet ni /propietarios", () => {
    for (const l of LOCALES) {
      expect(cita179(JSON.stringify(msgs[l].founding)), l).toBe(false)
      expect(cita179(JSON.stringify(msgs[l].meet)), l).toBe(false)
      expect(/\b179\b/.test(JSON.stringify(msgs[l])), `${l}: ningún «179» suelto`).toBe(false)
    }
    expect(cita179(leer("app/[locale]/founding-owners/page.tsx"))).toBe(false)
  })
})

// ── I-7 · una sola versión de quién es el titular ──

describe("I-7 · una sola versión de quién es el titular", () => {
  const avisoEs = AVISO_LEGAL.traducciones.es
  const titular = avisoEs.secciones.find((s) => s.id === "titular")!
  const textos = (forma: "persona_fisica" | "sociedad") =>
    titular.bloques
      .filter((b) => b.tipo !== "parrafo" || bloqueAplica(b, forma))
      .map((b) => (b.tipo === "parrafo" ? b.texto : ""))
      .join(" ")
  const nombraSL = (s: string) => /\bS\.L\.(U\.)?/.test(s)
  const diceNoHaySociedad = (s: string) => /No existe todavía sociedad mercantil constituida/.test(s)

  it("control — con persona física, el aviso legal dice que no hay sociedad", () => {
    expect(diceNoHaySociedad(textos("persona_fisica"))).toBe(true)
    expect(textos("persona_fisica")).toMatch(/la persona física identificada arriba/)
  })

  it("con persona física, ninguna página dice «S.L.» (el pie de /meet sale de los mismos datos que el aviso)", () => {
    const meet = leer("app/[locale]/meet/page.tsx")
    expect(nombraSL(meet)).toBe(false) // ni siquiera en comentarios que acabarían en el HTML
    expect(meet).toMatch(/pieLegal\(/)
    for (const l of LOCALES) {
      expect(nombraSL(JSON.stringify(msgs[l])), `messages/${l}.json`).toBe(false)
      expect(nombraSL(pieLegal(l)), `pie ${l}`).toBe(false)
    }
    // Hoy, con los datos reales del repo: persona física → sin sociedad, sin sede.
    expect(pieLegal("es")).toBe("SEDA Private Homes · Costa del Sol · España")
  })

  it("control negativo — con el pie de antes («Seda Private Homes S.L. · Marbella») el predicado salta", () => {
    expect(nombraSL("Seda Private Homes S.L. · Marbella · España")).toBe(true)
    expect(diceNoHaySociedad(textos("persona_fisica")) && nombraSL("Seda Private Homes S.L. · Marbella · España")).toBe(true) // la contradicción de I-7
  })

  it("con sociedad cambia todo a la vez: el aviso deja de decir «no existe sociedad», pasa a nombrarla y el pie la cita", () => {
    expect(diceNoHaySociedad(textos("sociedad"))).toBe(false)
    expect(textos("sociedad")).toMatch(/nombre comercial bajo el que \{titular\}/)
    const sl = resolverIdentidad({
      formaJuridica: "sociedad",
      titular: "Persona Física",
      nif: "00000000T",
      domicilio: "Calle Personal 1",
      proveedorCorreo: "Proveedor (País)",
      sociedad: { denominacion: "Sociedad de Prueba S.L.", cif: "B00000000", domicilioSocial: "Calle Social 2, Málaga", inscripcionRegistral: null },
    })
    expect(sl).toMatchObject({ titular: "Sociedad de Prueba S.L.", nif: "B00000000", domicilio: "Calle Social 2, Málaga" })
    expect(pieLegal("es", { ...sl, nombreComercial: "SEDA Private Homes" })).toBe("Sociedad de Prueba S.L. · Calle Social 2, Málaga")
  })

  it("qué falta para la S.L.: denominación social, CIF y domicilio social (la inscripción registral no bloquea)", () => {
    expect(camposSociedadPendientes()).toEqual(["denominacion", "cif", "domicilioSocial"])
    const salida = execFileSync("node", ["scripts/check-legal-entity.mjs"], { cwd: raiz, encoding: "utf8" })
    expect(salida).toMatch(/sociedad\.denominacion/)
    expect(salida).toMatch(/sociedad\.cif/)
    expect(salida).toMatch(/sociedad\.domicilioSocial/)
  })

  it("el build se detiene si se pasa a «sociedad» sin rellenar sus datos (y pasa con ellos)", () => {
    const dir = mkdtempSync(join(tmpdir(), "identidad-"))
    const base = JSON.parse(leer("lib/legal/identidad.json"))
    const ejecutar = (id: unknown) => {
      const f = join(dir, "identidad.json")
      writeFileSync(f, JSON.stringify(id))
      try {
        return { code: 0, out: execFileSync("node", ["scripts/check-legal-entity.mjs", f], { cwd: raiz, encoding: "utf8", stdio: "pipe" }) }
      } catch (e) {
        const err = e as { status: number; stderr: string }
        return { code: err.status, out: err.stderr }
      }
    }
    const vacia = ejecutar({ ...base, formaJuridica: "sociedad" })
    expect(vacia.code).toBe(1)
    expect(vacia.out).toMatch(/sociedad\.denominacion/)
    expect(vacia.out).toMatch(/sociedad\.cif/)
    expect(vacia.out).toMatch(/sociedad\.domicilioSocial/)
    const completa = ejecutar({ ...base, formaJuridica: "sociedad", sociedad: { denominacion: "X S.L.", cif: "B00000000", domicilioSocial: "Calle 1", inscripcionRegistral: null } })
    expect(completa.code).toBe(0)
    expect(ejecutar({ ...base, formaJuridica: "otra" }).code).toBe(1)
  })
})

// ── I-8 · el cumplimiento se cuenta como lo que es hoy ──

describe("I-8 · el cumplimiento se cuenta como lo que es hoy", () => {
  // REA-GLOBAL-PLATAFORMA-2026-10 G-01: SES en `off`, 0 partes comunicados en la historia, ses_comunicaciones vacía.
  const diceVerificaIdentidad = (s: string) => /Verificación de identidad|identity verification|Vérification d'identité|Identitätsprüfung/i.test(s)
  const dicePresenteAutomatizado = (s: string) => /^Automatizado|^Automated|^Automatisé|^Automatisiert/i.test(s)

  it("control negativo — los predicados detectan los textos que había", () => {
    expect(diceVerificaIdentidad("Verificación de identidad del huésped en el check-in.")).toBe(true)
    expect(diceVerificaIdentidad("Guest identity verification at check-in.")).toBe(true)
    expect(diceVerificaIdentidad("Vérification d'identité du voyageur à l'arrivée.")).toBe(true)
    expect(diceVerificaIdentidad("Identitätsprüfung des Gastes beim Check-in.")).toBe(true)
    expect(dicePresenteAutomatizado("Automatizado desde el alta de la villa en SEDA OS.")).toBe(true)
  })

  for (const l of LOCALES) {
    it(`${l}: el Centro de confianza no dice que SES «verifica la identidad del huésped en el check-in»`, () => {
      expect(diceVerificaIdentidad(at(l, "prop.trust.items.ses.b"))).toBe(false)
      expect(at(l, "prop.trust.items.ses.b")).toMatch(/SES\.Hospedajes|Ministerio del Interior|Ministry of the Interior|ministère de l'Intérieur|Innenministerium/)
    })

    it(`${l}: la FAQ de propietarios no dice «Automatizado desde el alta» sobre AEAT / RD 933 / IRNR`, () => {
      expect(dicePresenteAutomatizado(at(l, "faq.owners_items.q6.a"))).toBe(false)
    })
  }

  it("/meet no vende «Compliance automatizado» ni «comisión fiscalmente deducible» (cuatro idiomas)", () => {
    for (const l of LOCALES) {
      const meet = JSON.stringify(msgs[l].meet)
      expect(meet, l).not.toMatch(/automatizad|automation|automatisée|Automatisierte|deducible|deductible|déductible|absetzbar/i)
    }
    expect(at("es", "meet.copy.diffs.d1.title")).toBe("Cumplimiento documentado")
  })
})

// ── I-9 · lo que parece un panel real no inventa cifras ──

describe("I-9 · lo que parece un panel real no inventa cifras", () => {
  const src = leer("app/[locale]/propietarios/PropietariosContent.tsx")
  const mock = leer("components/dashboard-mockup.tsx")
  const dirGeneral = (s: string) => /DIRECTO|\bLIVE\b|OPERATIVO|OPERATIONAL|OPÉRATIONNEL|OPERATIV\b/i.test(s)

  it("control negativo — el predicado detecta los rótulos «EN DIRECTO / OPERATIVO» que había", () => {
    for (const s of ["SEDA OS · EN DIRECTO", "OPERATIVO", "SEDA OS · LIVE", "OPERATIONAL", "OPÉRATIONNEL", "OPERATIV"]) {
      expect(dirGeneral(s), s).toBe(true)
    }
  })

  it("las posiciones de SEO «#2 #4 #1 #3» no están escritas a mano", () => {
    expect(src).not.toMatch(/"#2"\]?,\s*\[t\("prop\.marketing\.seo_kw2"\), "#4"\]/)
    expect(src).not.toMatch(/"#[1-4]"/)
    expect(src).not.toMatch(/seo_kw\d"\), "#/)
  })

  it("el «SUGERIDO HOY €2.890» y el panel de pricing no existen", () => {
    expect(src).not.toMatch(/€2\.890/)
    expect(src).not.toMatch(/pricing_suggested|prop\.marketing\.pricing_/)
    for (const l of LOCALES) expect(JSON.stringify((msgs[l].prop as Arbol).marketing ?? {}), l).not.toMatch(/pricing_|compset_/)
  })

  it("el panel no se rotula «EN DIRECTO» ni «OPERATIVO» (SEDA tiene 0 propiedades publicadas): se rotula de ejemplo", () => {
    for (const l of LOCALES) {
      expect(dirGeneral(at(l, "prop.os.live")), l).toBe(false)
      expect(dirGeneral(at(l, "prop.os.operative")), l).toBe(false)
    }
    expect(at("es", "prop.os.live")).toMatch(/EJEMPLO/)
    expect(at("es", "prop.os.operative")).toMatch(/EJEMPLO/)
  })

  it("ni la URL «app.sedaprivatehomes.com/os» ni la versión «v4.2.1» / «v 4.2 · Build 2026.10»", () => {
    expect(src).not.toMatch(/app\.sedaprivatehomes\.com\/os|v4\.2\.1|prop\.arch\.version/)
    for (const l of LOCALES) expect(JSON.stringify(msgs[l]), l).not.toMatch(/Build 2026|v 4\.2/)
  })

  it("la maqueta de la portada no enseña «€ 142.300» ni «14 reservas activas»", () => {
    expect(mock).not.toMatch(/€ 142\.300/)
    for (const l of LOCALES) expect(JSON.stringify(msgs[l].home), l).not.toMatch(/142\.300|kpi/)
  })
})

// ── I-10 · la web no se contradice sobre el motor de reservas ──

describe("I-10 · la web no se contradice sobre el motor de reservas", () => {
  const dicePropio = (s: string) =>
    /Motor propio|Sin SaaS gen|No generic SaaS|Pas de SaaS|Kein generisches SaaS|[Pp]roprietary multi-channel engine|Moteur multicanal propriétaire|Eigene Multi-Channel|[Pp]ricing din|Dynamic pricing|Tarification dynamique|Dynamische Preisgestaltung|[Mm]onitoreo del compset/.test(s)

  it("control negativo — el predicado detecta los textos que había", () => {
    expect(dicePropio("Motor propio multicanal con sincronización en tiempo real")).toBe(true)
    expect(dicePropio("Sin SaaS genéricos. Sin improvisación.")).toBe(true)
    expect(dicePropio("No generic SaaS. No improvisation.")).toBe(true)
    expect(dicePropio("Proprietary multi-channel engine with real-time sync")).toBe(true)
    expect(dicePropio("Gestión de OTA, SEO, pricing dinámico y campañas")).toBe(true)
  })

  it("control — la propia ficha dice que Beds24 es el sistema de reservas", () => {
    expect(at("es", "escaparate.reserva.nota")).toMatch(/Beds24/)
  })

  it("no se vende un «Motor propio multicanal», «Sin SaaS genéricos», «pricing dinámico» ni «monitoreo del compset» (cuatro idiomas)", () => {
    for (const l of LOCALES) {
      expect(dicePropio(JSON.stringify(msgs[l])), l).toBe(false)
    }
  })

  it("se llama a lo que hay: software propio conectado a Beds24", () => {
    expect(at("es", "prop.arch.mod.reservas.body")).toMatch(/Software propio conectado a Beds24/)
    expect(at("es", "prop.hero.body")).toMatch(/conectada a Beds24/)
    expect(at("es", "home.os.body")).toMatch(/conectada a Beds24/)
  })
})

// ── I-11 · la ficha no promete lo que la casa no tiene ──

describe("I-11 · la ficha de Bay Side no promete lo que Bay Side no tiene", () => {
  // REA-GLOBAL-PLATAFORMA-2026-10 §1: Bay Side sin nuki_id ni nuki_code; ningún código de Nuki enviado en la historia.
  const bay = VILLAS.find((v) => v.slug === "bay-side")!
  const prometeSinLlaves = (v: FichaVilla) => incluyeVilla(v).includes("llegada")

  it("control negativo — una casa con cerradura SÍ promete llegada sin llaves", () => {
    expect(prometeSinLlaves({ ...bay, cerradura: true })).toBe(true)
  })

  it("«Lo que incluye SEDA» de Bay Side no dice «Llegada sin llaves» (sale de un dato por casa, no de un texto fijo)", () => {
    expect(bay.cerradura).toBe(false)
    expect(prometeSinLlaves(bay)).toBe(false)
    const pagina = leer("app/[locale]/villa/[slug]/page.tsx")
    expect(pagina).toMatch(/incluyeVilla\(villa\)/)
    expect(pagina).not.toMatch(/<li>\{t\("escaparate\.incluye\.llegada"\)\}<\/li>/)
  })
})

// ── I-12 · /api/contact solo acepta POST del propio sitio ──

describe("I-12 · /api/contact rechaza un POST de otro origen", () => {
  beforeEach(() => {
    vi.stubEnv("RESEND_API_KEY", "")
    vi.stubEnv("VERCEL_ENV", "")
    vi.spyOn(console, "log").mockImplementation(() => {})
    vi.spyOn(console, "warn").mockImplementation(() => {})
  })
  afterEach(() => vi.restoreAllMocks())

  const cuerpo = JSON.stringify({
    type: "other",
    fields: { name: "Auditoría", email: "rea@example.com", subject: "prueba", message: "mensaje de prueba de la REA" },
  })

  let ip = 0
  async function post(headers: Record<string, string>) {
    vi.resetModules()
    const { POST } = await import("@/app/api/contact/route")
    return POST(
      new Request("http://localhost/api/contact", {
        method: "POST",
        headers: { "x-forwarded-for": `203.0.113.${(ip += 1)}`, ...headers },
        body: cuerpo,
      }),
    )
  }

  it("control — desde el propio sitio, con JSON, entra (200, modo mock)", async () => {
    const res = await post({ "content-type": "application/json", origin: "http://localhost" })
    expect(res.status).toBe(200)
  })

  it("desde otro origen y como text/plain (petición «simple», sin preflight) → 403", async () => {
    const res = await post({ "content-type": "text/plain", origin: "https://evil.example" })
    expect(res.status).toBe(403)
  })

  it("control negativo — el 403 no depende del content-type: JSON desde otro origen también se rechaza", async () => {
    const res = await post({ "content-type": "application/json", origin: "https://evil.example" })
    expect(res.status).toBe(403)
  })

  it("sin cabecera Origin (curl, scripts) → 403", async () => {
    expect((await post({ "content-type": "application/json" })).status).toBe(403)
  })

  it("un host que solo se parece al del sitio → 403", async () => {
    for (const origin of ["https://sedaprivatehomes.com.evil.example", "https://evilsedaprivatehomes.com", "null"]) {
      expect((await post({ "content-type": "application/json", origin })).status, origin).toBe(403)
    }
  })

  it("Sec-Fetch-Site distinto de same-origin → 403, aunque el Origin coincida", async () => {
    const res = await post({ "content-type": "application/json", origin: "http://localhost", "sec-fetch-site": "cross-site" })
    expect(res.status).toBe(403)
  })

  it("el propio dominio de producción entra; el mismo origen pero text/plain → 415", async () => {
    expect((await post({ "content-type": "application/json", origin: "https://sedaprivatehomes.com", "sec-fetch-site": "same-origin" })).status).toBe(200)
    expect((await post({ "content-type": "text/plain", origin: "http://localhost" })).status).toBe(415)
  })
})

// ── I-13 · accesibilidad básica ──

describe("I-13 · accesibilidad básica", () => {
  const field = (src: string) => src.slice(src.indexOf("function Field("), src.indexOf("function FormRow"))
  const contacto = leer("app/[locale]/contacto/ContactoContent.tsx")
  const prop = leer("app/[locale]/propietarios/PropietariosContent.tsx")
  const slider = (src: string) => src.slice(src.indexOf("function SimSlider("), src.indexOf("/* -------- Product tabs"))
  const tieneNombre = (s: string) => /<label[\s>]|aria-label|aria-labelledby/.test(s)

  it("control negativo — el predicado no da por bueno un <span> con placeholder ni un <input type=range> sin nombre", () => {
    expect(tieneNombre('<span className="x">{label}</span><input placeholder={placeholder} />')).toBe(false)
    expect(tieneNombre('<input type="range" min={min} max={max} />')).toBe(false)
  })

  it("los campos del formulario de contacto tienen <label htmlFor> enlazado al input", () => {
    expect(field(contacto)).toMatch(/<label htmlFor=\{id\}/)
    expect(field(contacto)).toMatch(/<input\s+id=\{id\}/)
    // Los textareas también (notas y mensaje).
    expect(contacto).toMatch(/<label htmlFor="campo-notes"/)
    expect(contacto).toMatch(/id="campo-notes"/)
    expect(contacto).toMatch(/<label htmlFor="campo-message"/)
    expect(contacto).toMatch(/id="campo-message"/)
  })

  it("los dos deslizadores del simulador tienen nombre accesible y valor legible", () => {
    expect(tieneNombre(slider(prop))).toBe(true)
    expect(slider(prop)).toMatch(/<label htmlFor=\{id\}/)
    expect(slider(prop)).toMatch(/aria-valuetext/)
    expect(prop).toMatch(/id="sim-occ"/)
    expect(prop).toMatch(/id="sim-adr"/)
  })

  it('/meet y /guias tienen id="main-content" (destino del enlace «Saltar al contenido»)', () => {
    for (const f of [
      "app/[locale]/meet/page.tsx",
      "app/[locale]/guias/page.tsx",
      "app/[locale]/guias/[slug]/page.tsx",
      "app/[locale]/guias/autores/[autorId]/page.tsx",
    ]) {
      expect(leer(f), f).toMatch(/<main[^>]*id="main-content"/)
    }
  })

  it("el iframe de Calendly lleva un título en el idioma de la página (no uno fijo en inglés)", () => {
    const fachada = leer("app/[locale]/meet/CalendlyFachada.tsx")
    expect(fachada).not.toMatch(/title="Calendly — Seda Private Homes booking"/)
    expect(fachada).toMatch(/title=\{copy\.tituloIframe\}/)
    const titulos = LOCALES.map((l) => at(l, "meet.copy.calendly.tituloIframe"))
    expect(new Set(titulos).size).toBe(4)
    expect(at("es", "meet.copy.calendly.tituloIframe")).toMatch(/Calendario de Calendly/)
  })
})

// ── I-14 · la web no se contradice sobre los idiomas de la Guest App ──

describe("I-14 · la web no se contradice sobre los idiomas de la Guest App ni promete lo que no se puede probar", () => {
  const hayItaliano = (s: string) => /\bIT\b|italiano|italien|Italienisch|italian/i.test(s)

  it("control negativo — «ES · EN · DE · FR … sin traducción automática» no cuenta el italiano", () => {
    expect(hayItaliano("ES · EN · DE · FR de forma nativa, sin traducción automática.")).toBe(false)
    expect(hayItaliano("Multilingüe ES·EN·DE·FR")).toBe(false)
  })

  it("control — la FAQ dice cinco idiomas, con el italiano", () => {
    expect(at("es", "faq.guests_items.q4.a")).toMatch(/italiano/)
  })

  for (const l of LOCALES) {
    it(`${l}: la ficha de características y el rótulo también nombran el italiano`, () => {
      expect(hayItaliano(at(l, "guestapp.features.items.lang_b"))).toBe(true)
      expect(hayItaliano(at(l, "guestapp.marquee.i5"))).toBe(true)
    })

    it(`${l}: sin «menos de 2 minutos», sin «plantilla local 24/7», sin seguros ni verificación de huéspedes sin respaldo`, () => {
      expect(at(l, "prop.faq.items.q2.a")).not.toMatch(/2 minut|2 Minuten|24 h|24\/7|rund um die Uhr|plantilla|employed locally|salariée|fest angestellt/i)
      expect(at(l, "faq.owners_items.q5.a")).not.toMatch(/seguros|insurance|assurances|Versicherungen|Verificación de huéspedes|Guest verification|Vérification des voyageurs|Gästeverifizierung/i)
      expect(at(l, "home.faq.items.q7.a")).not.toMatch(/seguros|insurance|assurances|Versicherungen/i)
    })

    it(`${l}: «Sin tracking de terceros» fuera (Sentry y Mapbox lo contradicen) y la Guest App no se vende como demo abierta`, () => {
      expect(at(l, "guestapp.features.items.privacy_b")).not.toMatch(/tracking/i)
      expect(at(l, "guestapp.final.body")).toMatch(/enlace|link|lien|Link/i)
    })
  }
})

// ── M · higiene ──

describe("M · higiene", () => {
  const escapaMenor = (s: string) => !s.includes("<")

  it("M-4: el JSON-LD escapa «<» (un </script> en un dato no cierra el bloque)", () => {
    // control negativo: JSON.stringify a pelo SÍ deja pasar el cierre del script
    expect(escapaMenor(JSON.stringify({ a: "x</script><script>alert(1)</script>" }))).toBe(false)
    const seguro = jsonLdString({ a: "x</script><script>alert(1)</script>", b: ["<b>"] })
    expect(escapaMenor(seguro)).toBe(true)
    expect(JSON.parse(seguro)).toEqual({ a: "x</script><script>alert(1)</script>", b: ["<b>"] }) // sigue siendo el mismo JSON
    for (const f of [
      "components/page-json-ld.tsx",
      "components/breadcrumbs.tsx",
      "app/[locale]/guias/page.tsx",
      "app/[locale]/guias/[slug]/page.tsx",
      "app/[locale]/guias/autores/[autorId]/page.tsx",
    ]) {
      expect(leer(f), f).toMatch(/jsonLdString\(/)
      expect(leer(f), f).not.toMatch(/__html: JSON\.stringify/)
    }
  })

  it("M-5: el título de la página 404 no repite «· SEDA Private Homes» (la plantilla ya lo añade)", () => {
    const repite = (s: string) => /title: "Not found · Página no encontrada — SEDA Private Homes"/.test(s)
    expect(repite('title: "Not found · Página no encontrada — SEDA Private Homes",')).toBe(true) // control negativo
    expect(repite(leer("app/not-found.tsx"))).toBe(false)
    expect(leer("app/not-found.tsx")).toMatch(/title: "Not found · Página no encontrada"/)
  })

  it("M-3: no hay nada de .tmp/ versionado y queda en .gitignore", () => {
    const out = execFileSync("git", ["ls-files", ".tmp"], { cwd: raiz, encoding: "utf8" })
    expect(out.trim()).toBe("")
    expect(leer(".gitignore")).toMatch(/^\.tmp\/$/m)
  })

  it("M-2: el sitemap no marca todas las páginas como modificadas «ahora» en cada build", () => {
    const marcaAhora = (s: string) => /lastModified: now/.test(s)
    expect(marcaAhora("      lastModified: now,\n")).toBe(true) // control negativo
    expect(marcaAhora(leer("app/sitemap.ts"))).toBe(false)
    const conFecha = sitemap().filter((e) => e.lastModified !== undefined)
    expect(conFecha.every((e) => e.url.includes("/guias"))).toBe(true) // solo las guías, que tienen fecha de revisión real
  })

  it("M-8: los textos de /founding-owners y /meet viven en messages/ (los cubre messages-parity)", () => {
    for (const f of ["app/[locale]/founding-owners/page.tsx", "app/[locale]/meet/page.tsx"]) {
      expect(leer(f), f).not.toMatch(/const COPY\b/)
    }
    for (const l of LOCALES) {
      expect(Object.keys(msgs[l].founding as Arbol)).toContain("copy")
      expect(Object.keys(msgs[l].meet as Arbol)).toContain("copy")
    }
  })

  it("M-9: «cinco premios consecutivos» → cinco premios de cinco plataformas (no es una serie anual)", () => {
    const consecutivos = (s: string) => /consecutiv|consécutiv|in Folge|aufeinanderfolgend/i.test(s)
    expect(consecutivos("Cinco premios consecutivos — no por marketing")).toBe(true) // control negativo
    for (const l of LOCALES) expect(consecutivos(JSON.stringify(msgs[l].nosotros)), l).toBe(false)
  })
})

// ── Lo limpio, con su prueba ──

describe("control — lo que salió limpio", () => {
  it("ninguna analítica, píxel ni cookie propia en el código servido", () => {
    const pkg = JSON.parse(leer("package.json"))
    const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).join(" ")
    expect(deps).not.toMatch(/analytics|gtag|posthog|plausible|hotjar|clarity|sentry|mixpanel|segment/i)
    const fuentes = ["components", "app", "hooks"].flatMap((d) =>
      execFileSync("git", ["ls-files", d], { cwd: raiz, encoding: "utf8" }).split("\n").filter((f) => /\.tsx?$/.test(f)),
    )
    for (const f of fuentes) {
      const s = leer(f)
      expect(s, f).not.toMatch(/document\.cookie|localStorage\.|sessionStorage\.|googletagmanager|gtag\(|fbq\(/)
    }
  })

  it("robots.txt cierra /api/ y nombra los rastreadores de IA; CCBot no se nombra (decisión D-6: dejarlo permitido por ahora)", () => {
    const r = leer("app/robots.ts")
    expect(r).toMatch(/disallow: \["\/api\/"\]/)
    for (const bot of ["GPTBot", "OAI-SearchBot", "ClaudeBot", "Claude-SearchBot", "PerplexityBot", "Google-Extended"]) {
      expect(r).toContain(`"${bot}"`)
    }
    expect(r).not.toMatch(/CCBot/)
  })

  it("la CSP, HSTS y X-Frame-Options están en vercel.json y no hay unsafe-eval", () => {
    const v = JSON.parse(leer("vercel.json"))
    const h = Object.fromEntries(v.headers[0].headers.map((x: { key: string; value: string }) => [x.key, x.value]))
    expect(h["Content-Security-Policy"]).toMatch(/frame-ancestors 'none'/)
    expect(h["Content-Security-Policy"]).not.toMatch(/unsafe-eval/)
    expect(h["Strict-Transport-Security"]).toMatch(/max-age=63072000/)
    expect(h["X-Frame-Options"]).toBe("SAMEORIGIN")
  })

  it("ni una clave con forma de secreto en lo versionado (patrones de Stripe, Resend, Supabase, GitHub, AWS, claves privadas)", () => {
    const lista = execFileSync("git", ["ls-files"], { cwd: raiz, encoding: "utf8" })
      .split("\n")
      .filter((f) => /\.(tsx?|mjs|json|md|yml|yaml|env.*|txt)$/.test(f) && !f.startsWith("package-lock") && !f.startsWith("tests/") && !f.startsWith("scripts/") && !f.startsWith("docs/"))
    const patron = /(sk_live_[A-Za-z0-9]{8,}|re_[A-Za-z0-9]{24,}|eyJhbGciOi[A-Za-z0-9_.-]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE|ghp_[A-Za-z0-9]{30,}|sb_secret_[A-Za-z0-9]+)/
    for (const f of lista) expect(leer(f), f).not.toMatch(patron)
  })

  it("el vídeo de portada no precarga (preload=none) y se engancha tras el load", () => {
    const h = leer("components/hero.tsx")
    expect(h).toMatch(/preload="none"/)
    expect(h).toMatch(/addEventListener\("load", attach/)
  })
})
