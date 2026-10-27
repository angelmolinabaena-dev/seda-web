import { afterEach, describe, expect, it, vi } from "vitest"
import sitemap from "@/app/sitemap"
import {
  VILLAS,
  beds24Ids,
  escaparateActivo,
  esIndexable,
  esPublicable,
  getVillaVisible,
  incluyeVilla,
  urlReservaBeds24,
  villasIndexables,
  villasVisibles,
  type FichaVilla,
} from "@/lib/escaparate"

/*
  Escaparate de villas (feat/escaparate-villas, 15-oct-2026).

  Sin número de registro turístico (VFT) no se puede anunciar una vivienda
  turística en Andalucía: todo el escaparate va detrás de
  SEDA_FLAG_ESCAPARATE_VILLAS, apagado por defecto, Y de que la casa tenga VFT
  y arrendador (REA seda-web 2026-10, B-1/B-2). Estos tests fijan que con el
  flag apagado —o encendido pero sin VFT— no hay ficha ni entrada de sitemap,
  y que la URL de Beds24 lleva las fechas solo cuando son válidas.

  El 404 real de /villa/<slug> con el flag apagado se comprueba contra
  `next start` en tests/integracion/rutas-404.test.ts.

  Fuente externa del formato de la URL: wiki de Beds24 («Embedded Iframe»,
  lista `validParameters`) y la booking page de Bay Side cargada el
  15-oct-2026 con `checkin=2026-11-10&checkout=2026-11-13&numadult=2`, que
  Beds24 leyó como llegada el 10, 3 noches y 2 adultos.
*/

afterEach(() => {
  vi.unstubAllEnvs()
})

const urlsVilla = () => sitemap().map((e) => e.url).filter((u) => u.includes("/villa/"))

describe("flag SEDA_FLAG_ESCAPARATE_VILLAS", () => {
  it("apagado si no existe", () => {
    expect(escaparateActivo({})).toBe(false)
  })

  it.each(["0", "true", "on", "yes", " 1", ""])("apagado con %j (solo \"1\" lo enciende)", (v) => {
    expect(escaparateActivo({ SEDA_FLAG_ESCAPARATE_VILLAS: v })).toBe(false)
  })

  it('encendido con "1"', () => {
    expect(escaparateActivo({ SEDA_FLAG_ESCAPARATE_VILLAS: "1" })).toBe(true)
  })
})

describe("flag apagado", () => {
  it("no hay ninguna ficha (la ruta no genera páginas)", () => {
    vi.stubEnv("SEDA_FLAG_ESCAPARATE_VILLAS", "")
    expect(villasVisibles()).toEqual([])
    expect(getVillaVisible("bay-side")).toBeUndefined()
  })

  it("el sitemap no lista ninguna /villa/", () => {
    vi.stubEnv("SEDA_FLAG_ESCAPARATE_VILLAS", "")
    expect(urlsVilla()).toEqual([])
  })
})

describe("flag encendido: el flag es la cerradura, el VFT y el arrendador la llave (REA B-1)", () => {
  const ON = { SEDA_FLAG_ESCAPARATE_VILLAS: "1" }
  const completa: FichaVilla = { ...VILLAS[0], registroTuristico: "VFT/MA/00000", arrendador: "Propietario de ejemplo" }

  it("Bay Side, sin número de registro, NO es visible aunque el flag esté encendido", () => {
    vi.stubEnv("SEDA_FLAG_ESCAPARATE_VILLAS", "1")
    const bay = VILLAS.find((v) => v.slug === "bay-side")!
    expect(bay.registroTuristico).toBeNull()
    expect(esPublicable(bay)).toBe(false)
    expect(getVillaVisible("bay-side")).toBeUndefined() // la ficha da 404
    expect(villasVisibles()).toEqual([]) // /coleccion sigue en «Próxima apertura»
    expect(villasIndexables()).toEqual([])
    expect(urlsVilla()).toEqual([])
  })

  it("con número de registro y arrendador, y el flag encendido: visible e indexable", () => {
    expect(esPublicable(completa)).toBe(true)
    expect(esIndexable(completa, ON)).toBe(true)
  })

  it("el número de registro solo no basta: sin arrendador la ficha no puede decir quién alquila", () => {
    expect(esPublicable({ ...completa, arrendador: null })).toBe(false)
    expect(esPublicable({ ...completa, arrendador: "  " })).toBe(false)
  })

  it("el arrendador solo no basta: sin VFT no se publica", () => {
    expect(esPublicable({ ...completa, registroTuristico: null })).toBe(false)
    expect(esPublicable({ ...completa, registroTuristico: "   " })).toBe(false)
  })

  it("…y nunca con el flag apagado, aunque la casa esté completa", () => {
    expect(esIndexable(completa, {})).toBe(false)
  })

  it("«llegada sin llaves» solo si la casa tiene cerradura (REA I-11)", () => {
    expect(incluyeVilla({ ...completa, cerradura: false })).toEqual(["concierge", "limpieza"])
    expect(incluyeVilla({ ...completa, cerradura: true })).toEqual(["llegada", "concierge", "limpieza"])
    expect(VILLAS.find((v) => v.slug === "bay-side")!.cerradura).toBe(false)
  })
})

describe("fichas: ningún dato sin fuente", () => {
  it("Bay Side solo lleva lo que viene de Beds24 (municipio y horario)", () => {
    const bay = VILLAS.find((v) => v.slug === "bay-side")!
    expect(bay.municipio).toBe("Estepona")
    expect(bay.horario).toEqual({ entradaDesde: "16:00", entradaHasta: "24:00", salidaHasta: "10:00" })
    expect(bay.esencial).toEqual({})
  })

  it("las fotos provisionales están marcadas como tales", () => {
    for (const v of VILLAS) for (const f of v.fotos) expect(f.provisional, f.src).toBe(true)
  })
})

describe("ids de Beds24 desde SEDA_BEDS24_ESCAPARATE (no en el código)", () => {
  const env = (v?: string) => ({ SEDA_BEDS24_ESCAPARATE: v })

  it("sin variable → sin ids", () => {
    expect(beds24Ids("bay-side", env())).toBeUndefined()
  })

  it("JSON roto o id no numérico → sin ids", () => {
    expect(beds24Ids("bay-side", env("{"))).toBeUndefined()
    expect(beds24Ids("bay-side", env('{"bay-side":{"propId":"abc"}}'))).toBeUndefined()
    expect(beds24Ids("bay-side", env('{"bay-side":{"propId":1,"roomId":"x"}}'))).toBeUndefined()
    expect(beds24Ids("otra", env('{"bay-side":{"propId":1}}'))).toBeUndefined()
  })

  it("lee propId y roomId", () => {
    expect(beds24Ids("bay-side", env('{"bay-side":{"propId":111,"roomId":222}}'))).toEqual({ propId: 111, roomId: 222 })
    expect(beds24Ids("bay-side", env('{"bay-side":{"propId":111}}'))).toEqual({ propId: 111, roomId: undefined })
  })
})

describe("URL de la booking page de Beds24", () => {
  const ids = { propId: 111, roomId: 222 }
  const ctx = { locale: "es", slug: "bay-side" }
  const params = (u: string) => Object.fromEntries(new URL(u).searchParams)

  it("sin fechas: propiedad, habitación, idioma y UTM; ni checkin ni checkout", () => {
    const u = urlReservaBeds24(ids, {}, ctx)
    expect(u.startsWith("https://beds24.com/booking2.php?")).toBe(true)
    expect(params(u)).toEqual({
      propid: "111",
      roomid: "222",
      lang: "es",
      referer: "sedaprivatehomes.com",
      utm_source: "sedaprivatehomes.com",
      utm_medium: "referral",
      utm_campaign: "escaparate",
      utm_content: "bay-side",
    })
  })

  it("con fechas y personas: checkin, checkout y numadult", () => {
    const p = params(urlReservaBeds24(ids, { checkin: "2026-11-10", checkout: "2026-11-13", huespedes: 2 }, ctx))
    expect(p.checkin).toBe("2026-11-10")
    expect(p.checkout).toBe("2026-11-13")
    expect(p.numadult).toBe("2")
  })

  it("salida igual o anterior a la llegada → sin fechas (Beds24 abre su calendario)", () => {
    for (const checkout of ["2026-11-10", "2026-11-09"]) {
      const p = params(urlReservaBeds24(ids, { checkin: "2026-11-10", checkout }, ctx))
      expect(p.checkin).toBeUndefined()
      expect(p.checkout).toBeUndefined()
    }
  })

  it("una sola fecha, o una fecha que no existe → sin fechas", () => {
    expect(params(urlReservaBeds24(ids, { checkin: "2026-11-10" }, ctx)).checkin).toBeUndefined()
    expect(params(urlReservaBeds24(ids, { checkin: "2026-02-27", checkout: "2026-02-30" }, ctx)).checkin).toBeUndefined()
    expect(params(urlReservaBeds24(ids, { checkin: "10/11/2026", checkout: "13/11/2026" }, ctx)).checkin).toBeUndefined()
  })

  it("sin roomId no manda roomid; el idioma sigue al de la página", () => {
    const p = params(urlReservaBeds24({ propId: 111 }, {}, { locale: "de", slug: "bay-side" }))
    expect(p.roomid).toBeUndefined()
    expect(p.lang).toBe("de")
  })

  it("personas no válidas no viajan", () => {
    for (const huespedes of [0, -1, 2.5, Number.NaN]) {
      expect(params(urlReservaBeds24(ids, { huespedes }, ctx)).numadult).toBeUndefined()
    }
  })
})
