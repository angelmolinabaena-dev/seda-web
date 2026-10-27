import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { VILLAS, villasVisibles } from "@/lib/escaparate"

/*
  REA seda-web — 2026-10 (docs/audit/REA-SEDA-WEB-2026-10.md).

  Qué es este fichero: la prueba de cada hallazgo del informe, no un arreglo.
  Es una AUDITORÍA: el código de la web no se ha tocado.

    · `it(...)`       → control: algo que está bien hoy y debe seguir así.
    · `it.fails(...)` → el defecto. Afirma lo que DEBERÍA pasar, y falla hoy.
                        Vitest da verde mientras la aserción falle. Cuando
                        alguien arregle el hallazgo, el `it.fails` se pone
                        rojo y avisa de que hay que quitarle la marca.

  Las aserciones de texto leen el mismo fichero que sirve la web (messages/*.json
  o el fuente de la página), no una copia. La referencia de las cifras de la
  tarifa NO sale de este repo: es la decisión de Ángel del 25–26-oct-2026
  (tarifa v6), cuyos ejemplos están calculados a mano más abajo.
*/

const raiz = process.cwd()
const leer = (rel: string) => readFileSync(join(raiz, rel), "utf8")
const LOCALES = ["es", "en", "fr", "de"] as const
type Arbol = { [k: string]: Arbol | string }
const msgs = Object.fromEntries(LOCALES.map((l) => [l, JSON.parse(leer(`messages/${l}.json`))])) as Record<
  (typeof LOCALES)[number],
  Arbol
>
const at = (l: (typeof LOCALES)[number], path: string): string =>
  path.split(".").reduce<Arbol | string | undefined>((o, k) => (typeof o === "object" ? o[k] : undefined), msgs[l]) as string

afterEach(() => {
  vi.unstubAllEnvs()
})

// ── Tarifa v6, calculada a mano (fuente externa: decisión del 25–26-oct-2026) ──
//
//   comisión = menor de  21 % × (alojamiento − comisión del canal)
//                         y  20 % × alojamiento           (alojamiento = bruto − limpieza)
//   IVA 21 % aparte, sobre la comisión.
//
// Los números de cada caso están hechos con calculadora, no con esta función:
// la función solo evita repetir la cuenta, y cada `expect` lleva su cifra literal.
function comisionV6(alojamiento: number, comisionCanal: number) {
  const porBase = 0.21 * (alojamiento - comisionCanal)
  const tope = 0.2 * alojamiento
  return Math.min(porBase, tope)
}

describe("control — la tarifa v6 a mano (las cifras con las que se juzga la web)", () => {
  it("directa, 1.000 € de alojamiento: 21 % = 210 € > tope 200 € → 200 € (+42 € de IVA)", () => {
    expect(comisionV6(1000, 0)).toBeCloseTo(200, 2)
  })

  it("Airbnb al 15 %, 1.000 € de alojamiento: base 850 € × 21 % = 178,50 € < tope → 178,50 €", () => {
    expect(comisionV6(1000, 150)).toBeCloseTo(178.5, 2)
  })

  it("ejemplo de /founding-owners (1.200 € con 120 € de limpieza, canal 180 €): 21 % × 900 = 189 € (la web dice 216 €)", () => {
    expect(comisionV6(1080, 180)).toBeCloseTo(189, 2)
    expect(0.24 * 900).toBeCloseTo(216, 2) // lo que la web publica hoy (v3)
  })

  it("maqueta de liquidación (1.000 € con 100 € de limpieza, directa): 21 % × 900 = 189 € → tope 180 € (la web dice 216 €)", () => {
    expect(comisionV6(900, 0)).toBeCloseTo(180, 2)
  })

  it("simulador, 72 % × 365 × 1.450 € = 381.060 €: directa neto 304.848 €, Airbnb neto 255.882 € (sin IVA)", () => {
    const bruto = Math.round(0.72 * 365 * 1450)
    expect(bruto).toBe(381060)
    expect(Math.round(bruto * (1 - 0.2))).toBe(304848)
    expect(Math.round(bruto * 0.85 - 0.21 * bruto * 0.85)).toBe(255882)
    // lo que la web calcula hoy: 24 % sobre la base
    expect(Math.round(bruto * (1 - 0.24))).toBe(289606)
    expect(Math.round(bruto * (1 - 0.15) * (1 - 0.24))).toBe(246165)
  })
})

// ── I-1 · IMPORTANTE · la web sigue en 24 % (v3); la decisión vigente es 21 % + IVA con tope del 20 % ──

describe("I-1 · el precio de gestión publicado es el de la v6", () => {
  const CLAVES_PRECIO = [
    "prop.faq.items.q1.a",
    "faq.owners_items.q2.a",
    "prop.sim.net_note",
    "prop.sim.disclaimer",
    "home.dashboard.liquidacion.row3",
    "prop.os.liq_comision",
  ]

  for (const l of LOCALES) {
    it.fails(`${l}: ninguna cifra de comisión del 24 %`, () => {
      for (const k of CLAVES_PRECIO) expect(at(l, k), `${l}:${k}`).not.toMatch(/\b24 ?%/)
    })

    it.fails(`${l}: la FAQ de precio dice 21 %, el tope del 20 % y que el IVA va aparte`, () => {
      const a = at(l, "prop.faq.items.q1.a")
      expect(a).toMatch(/21 ?%/)
      expect(a).toMatch(/20 ?%/)
      expect(a).toMatch(/IVA|VAT|TVA|MwSt/)
    })
  }

  it.fails("/founding-owners y /meet no publican 24 % (cuatro idiomas, texto en el propio fuente)", () => {
    expect(leer("app/[locale]/founding-owners/page.tsx")).not.toMatch(/\b24 ?%/)
    expect(leer("app/[locale]/meet/page.tsx")).not.toMatch(/\b24 ?%/)
  })

  it("control — el calendario del alta publicado (0 € / 0 € / 0 € / 490 € / 490 € / 1.290 €) ya es el de la v6", () => {
    for (const l of LOCALES) {
      const a = at(l, "prop.faq.items.q1.a")
      expect(a, l).toMatch(/490/)
      expect(a, l).toMatch(/1[.,\s\u00a0\u202f]?290/)
    }
  })
})

// ── I-2 · IMPORTANTE · preaviso de 60 días; la v6 es de 1 mes ──

describe("I-2 · el preaviso publicado es de un mes", () => {
  for (const l of LOCALES) {
    it.fails(`${l}: la FAQ de baja no dice 60 días`, () => {
      expect(at(l, "prop.faq.items.q7.a")).not.toMatch(/\b(60|sesenta|sixty|soixante|sechzig)\b/i)
    })
  }
})

// ── I-3 · IMPORTANTE · el simulador aplica 24 % plano, sin tope ni IVA ──

describe("I-3 · el simulador modela la v6", () => {
  const src = leer("app/[locale]/propietarios/PropietariosContent.tsx")

  it.fails("la fórmula usa el 21 % y el tope del 20 %", () => {
    expect(src).toMatch(/0\.21/)
    expect(src).toMatch(/Math\.min\(/)
  })

  it("control — hoy la fórmula es 1 − 0,24 (directa) y 0,85 × 0,76 (Airbnb)", () => {
    expect(src).toMatch(/annualGross \* \(1 - 0\.24\)/)
    expect(src).toMatch(/annualGross \* \(1 - 0\.15\) \* \(1 - 0\.24\)/)
  })
})

// ── I-5 · IMPORTANTE · «2 propietarios en programa» ──

describe("I-5 · /founding-owners no cuenta propietarios que no hay", () => {
  // SELECT de conteo del 27-oct-2026 en producción: propietarios = 1, contratos_gestion = 0.
  it.fails("no afirma «2 propietarios/owners/propriétaires/Eigentümer en el programa»", () => {
    expect(leer("app/[locale]/founding-owners/page.tsx")).not.toMatch(
      /\b2 (propietarios|owners|propriétaires|Eigentümer)\b/,
    )
  })
})

// ── B-1 · IMPORTANTE · el escaparate se abre con un flag, no con el VFT ──

describe("B-1 · sin VFT la casa no se publica como reservable", () => {
  beforeEach(() => vi.stubEnv("SEDA_FLAG_ESCAPARATE_VILLAS", "1"))

  it("control — con el flag apagado no hay ninguna ficha (producción hoy: /villa/bay-side → 404)", () => {
    expect(villasVisibles({})).toEqual([])
  })

  it("control — Bay Side no tiene número de registro turístico en el repo", () => {
    expect(VILLAS.find((v) => v.slug === "bay-side")?.registroTuristico).toBeNull()
  })

  it.fails("con el flag encendido y sin VFT, ninguna ficha es visible", () => {
    expect(villasVisibles({ SEDA_FLAG_ESCAPARATE_VILLAS: "1" })).toEqual([])
  })

  it.fails("/coleccion no dice «casas que ya puede reservar» mientras falte el VFT", () => {
    // `villas.length > 0` basta para cambiar el texto (ColeccionContent.tsx) y el de la meta description (site-pages.ts).
    expect(villasVisibles({ SEDA_FLAG_ESCAPARATE_VILLAS: "1" }).length).toBe(0)
  })
})

// ── I-11 · IMPORTANTE · la ficha promete llegada sin llaves en una casa sin cerradura conectada ──

describe("I-11 · la ficha de Bay Side no promete lo que Bay Side no tiene", () => {
  // REA-GLOBAL-PLATAFORMA-2026-10 §1: Bay Side sin nuki_id ni nuki_code; ningún código de Nuki enviado en la historia.
  it.fails("«Lo que incluye SEDA» no dice «Llegada sin llaves» (texto fijo para todas las fichas)", () => {
    expect(at("es", "escaparate.incluye.llegada")).not.toMatch(/sin llaves/i)
  })
})

// ── I-7 · IMPORTANTE · la web nombra una S.L. que su propio aviso legal dice que no existe ──

describe("I-7 · una sola versión de quién es el titular", () => {
  const aviso = leer("lib/legal/aviso-legal.ts")
  const meet = leer("app/[locale]/meet/page.tsx")

  it("control — el aviso legal dice que no hay sociedad y el titular es una persona física", () => {
    expect(aviso).toMatch(/No existe todavía sociedad mercantil constituida/)
  })

  it.fails("si el aviso legal dice que no hay sociedad, ninguna página dice «S.L.»", () => {
    const diceQueNoHay = /No existe todavía sociedad mercantil constituida/.test(aviso)
    const nombraSL = /Seda Private Homes S\.L\./.test(meet)
    expect(diceQueNoHay && nombraSL).toBe(false)
  })
})

// ── I-12 · IMPORTANTE · /api/contact acepta POST de cualquier origen ──

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

  async function post(headers: Record<string, string>) {
    vi.resetModules()
    const { POST } = await import("@/app/api/contact/route")
    return POST(
      new Request("http://localhost/api/contact", {
        method: "POST",
        headers: { "x-forwarded-for": "203.0.113.200", ...headers },
        body: cuerpo,
      }),
    )
  }

  it("control — desde el propio sitio, con JSON, entra (200, modo mock)", async () => {
    const res = await post({ "content-type": "application/json", origin: "http://localhost" })
    expect(res.status).toBe(200)
  })

  it.fails("desde otro origen y como text/plain (petición «simple», sin preflight) → 403", async () => {
    const res = await post({ "content-type": "text/plain", origin: "https://evil.example" })
    expect(res.status).toBe(403)
  })
})

// ── I-13 · IMPORTANTE · accesibilidad de lo que recoge o cuenta ──

describe("I-13 · accesibilidad básica", () => {
  it.fails("los campos del formulario de contacto tienen <label> (hoy: <span>, solo placeholder)", () => {
    const src = leer("app/[locale]/contacto/ContactoContent.tsx")
    const field = src.slice(src.indexOf("function Field("), src.indexOf("function FormRow"))
    expect(field).toMatch(/<label[\s>]/)
  })

  it.fails("los dos deslizadores del simulador tienen nombre accesible", () => {
    const src = leer("app/[locale]/propietarios/PropietariosContent.tsx")
    const slider = src.slice(src.indexOf("function SimSlider("), src.indexOf("/* -------- Product tabs"))
    expect(slider).toMatch(/<label[\s>]|aria-label|aria-labelledby/)
  })

  it.fails("/meet y /guias tienen id=\"main-content\" (destino del enlace «Saltar al contenido»)", () => {
    for (const f of [
      "app/[locale]/meet/page.tsx",
      "app/[locale]/guias/page.tsx",
      "app/[locale]/guias/[slug]/page.tsx",
      "app/[locale]/guias/autores/[autorId]/page.tsx",
    ]) {
      expect(leer(f), f).toMatch(/<main[^>]*id="main-content"/)
    }
  })

  it.fails("el iframe de Calendly no lleva un título fijo en inglés en las cuatro lenguas", () => {
    expect(leer("app/[locale]/meet/CalendlyFachada.tsx")).not.toMatch(/title="Calendly — Seda Private Homes booking"/)
  })
})

// ── I-6 · IMPORTANTE · Modelo 179 ──

describe("I-6 · no se cita el Modelo 179", () => {
  // RD 117/2024 lo sustituye por el Modelo 238 (DAC7, anual): portal-propietarios docs/fiscal/DICTAMEN-FISCAL-SEDA-26 y docs/ESTADO.md:688.
  it.fails("/founding-owners no menciona «Modelo 179» en ningún idioma", () => {
    expect(leer("app/[locale]/founding-owners/page.tsx")).not.toMatch(/Modelo 179/)
  })
})

// ── I-9 · IMPORTANTE · maquetas con datos inventados y sin rótulo de ejemplo ──

describe("I-9 · lo que parece un panel real no inventa cifras", () => {
  const src = leer("app/[locale]/propietarios/PropietariosContent.tsx")

  it.fails("las posiciones de SEO «#2 #4 #1 #3» no están escritas a mano", () => {
    expect(src).not.toMatch(/"#2"\]?,\s*\[t\("prop\.marketing\.seo_kw2"\), "#4"\]/)
  })

  it.fails("el «SUGERIDO HOY €2.890» no está escrito a mano", () => {
    expect(src).not.toMatch(/€2\.890/)
  })

  it.fails("el panel no se rotula «EN DIRECTO» ni «OPERATIVO» (SEDA tiene 0 propiedades publicadas)", () => {
    expect(at("es", "prop.os.live")).not.toMatch(/DIRECTO/i)
    expect(at("es", "prop.os.operative")).not.toMatch(/OPERATIVO/i)
  })

  it.fails("la maqueta de la portada no enseña «€ 142.300» y «14 reservas activas» sin decir que son de ejemplo", () => {
    const mock = leer("components/dashboard-mockup.tsx")
    expect(mock).not.toMatch(/€ 142\.300/)
  })
})

// ── I-10 · IMPORTANTE · «motor propio / sin SaaS genéricos» frente a Beds24 ──

describe("I-10 · la web no se contradice sobre el motor de reservas", () => {
  it("control — la propia ficha dice que Beds24 es el sistema de reservas", () => {
    expect(at("es", "escaparate.reserva.nota")).toMatch(/Beds24/)
  })

  it.fails("no se vende un «Motor propio multicanal» ni «Sin SaaS genéricos»", () => {
    const dicenPropio =
      /Motor propio/i.test(at("es", "prop.arch.mod.reservas.body")) ||
      /Sin SaaS gen/i.test(at("es", "prop.hero.body")) ||
      /Sin SaaS gen/i.test(at("es", "home.os.body"))
    expect(dicenPropio).toBe(false)
  })
})

// ── B-2 · IMPORTANTE · el aviso legal describe una web que no publica precios ni enlaza a reservas ──

describe("B-2 · el aviso legal cuenta lo que la web hace", () => {
  const aviso = leer("lib/legal/aviso-legal.ts")

  it.fails("«No publica disponibilidad ni precios» no convive con una web que publica el alta de 1.290 €", () => {
    const dice = /No publica disponibilidad ni precios/.test(aviso)
    const publica = /1[.,\s\u00a0\u202f]?290/.test(at("es", "prop.faq.items.q1.a"))
    expect(dice && publica).toBe(false)
  })

  it.fails("alguna página dice quién es el arrendador cuando se reserva (DGT V0367-18: SEDA actúa en nombre y por cuenta del propietario)", () => {
    const todo = [
      JSON.stringify(msgs.es),
      leer("lib/legal/aviso-legal.ts"),
      leer("app/[locale]/villa/[slug]/page.tsx"),
    ].join("\n")
    expect(todo).toMatch(/arrendador/i)
  })

  it.fails("la ficha no vende «Reserva directa con SEDA Private Homes» (SEDA no es el arrendador)", () => {
    expect(at("es", "escaparate.meta.description")).not.toMatch(/Reserva directa con SEDA/)
  })
})

// ── M · MENOR · higiene ──

describe("M · higiene", () => {
  it.fails("el JSON-LD escapa «<» (JSON.stringify a pelo dentro de <script>)", () => {
    expect(leer("components/page-json-ld.tsx")).toMatch(/\\u003c|replace\(\/</)
  })

  it.fails("el título de la página 404 no repite «· SEDA Private Homes» (la plantilla ya lo añade)", () => {
    expect(leer("app/not-found.tsx")).not.toMatch(/title: "Not found · Página no encontrada — SEDA Private Homes"/)
  })

  it.fails("no hay nada de .tmp/ versionado", () => {
    const out = execFileSync("git", ["ls-files", ".tmp"], { cwd: raiz, encoding: "utf8" })
    expect(out.trim()).toBe("")
  })

  it.fails("el sitemap no marca todas las páginas como modificadas «ahora» en cada build", () => {
    expect(leer("app/sitemap.ts")).not.toMatch(/lastModified: now/)
  })
})

// ── I-4 · IMPORTANTE · lo que la v6 cobra y la web no dice ──

describe("I-4 · la web dice lo que la v6 cobra aparte de la comisión", () => {
  const texto = (l: (typeof LOCALES)[number]) =>
    ["prop.faq.items.q1.a", "prop.faq.items.q5.a", "faq.owners_items.q2.a"].map((k) => at(l, k)).join(" ")

  for (const l of LOCALES) {
    it.fails(`${l}: el uso propio dice «con preaviso» (v6: libre con preaviso)`, () => {
      expect(at(l, "prop.faq.items.q5.a")).toMatch(/preaviso|advance notice|notice|préavis|Vorankündigung|vorab|Vorlauf/i)
    })

    it.fails(`${l}: el margen de mantenimiento (12 % solo sobre el exceso de 200 €, sin IVA) figura en alguna respuesta`, () => {
      expect(texto(l)).toMatch(/12 ?%/)
      expect(texto(l)).toMatch(/200/)
    })
  }
})

// ── I-8 · IMPORTANTE · «automatizado» frente a SES apagado ──

describe("I-8 · el cumplimiento se cuenta como lo que es hoy", () => {
  // REA-GLOBAL-PLATAFORMA-2026-10 G-01: SES en `off`, 0 partes comunicados en la historia, ses_comunicaciones vacía.
  it.fails("el Centro de confianza no dice que SES «verifica la identidad del huésped en el check-in»", () => {
    expect(at("es", "prop.trust.items.ses.b")).not.toMatch(/Verificación de identidad/i)
  })

  it.fails("la FAQ de propietarios no dice «Automatizado desde el alta» sobre AEAT / RD 933 / IRNR", () => {
    expect(at("es", "faq.owners_items.q6.a")).not.toMatch(/Automatizado/i)
  })

  it.fails("/meet no vende «Compliance automatizado»", () => {
    expect(leer("app/[locale]/meet/page.tsx")).not.toMatch(/Compliance automatizado/)
  })
})

// ── I-14 · IMPORTANTE · cifras y promesas sin fuente que se contradicen entre páginas ──

describe("I-14 · la web no se contradice sobre los idiomas de la Guest App", () => {
  it("control — la FAQ dice cinco idiomas, con el italiano", () => {
    expect(at("es", "faq.guests_items.q4.a")).toMatch(/italiano/)
  })

  it.fails("la ficha de características y el rótulo también (hoy: «ES · EN · DE · FR … sin traducción automática»)", () => {
    expect(at("es", "guestapp.features.items.lang_b")).toMatch(/IT|italiano/)
    expect(at("es", "guestapp.marquee.i5")).toMatch(/IT/)
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

  it("robots.txt cierra /api/ y nombra los rastreadores de IA; CCBot no se nombra (decisión pendiente)", () => {
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
