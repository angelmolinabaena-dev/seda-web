import { execFileSync } from "node:child_process"
import { describe, expect, it } from "vitest"
import { cabecerasFirmaPortal, firmarLead, sha256Hex } from "@/lib/lead-firma"
import { ENDPOINT_PORTAL_LEADS_PROPIETARIO } from "@/lib/lead-propietario"

/*
  LEADS-RUTA-FIRMADA (V4-01) — EL CONTRATO DE LA FIRMA ENTRE seda-web Y seda_os.

  Este vector está COPIADO, carácter a carácter, en seda_os
  `tests/leads-firma-contrato.test.ts`. Aquí lo FIRMA seda-web (quien llama);
  allí lo VERIFICA la ruta del portal (quien recibe). Si cualquiera de los dos
  cambia la fórmula —orden, separador, hash del cuerpo, formato de la hora—, su
  test se pone rojo contra este mismo número.

  Las dos cifras se calcularon FUERA del código, con openssl, el 5-nov-2026:

    printf '%s' "$CUERPO" > cuerpo.json            # 184 bytes, UTF-8 («í» = c3 ad)
    openssl dgst -sha256 -r cuerpo.json
      → 5b0ded604342d5d384e77b0fea6a21ad3f9e95885f1d5463d58a7175e70449b7
    printf '%s' "POST|/api/leads/propietario|2026-11-05T10:00:00.000Z|5b0d…49b7" > cadena.txt
    openssl dgst -sha256 -hmac "$SECRETO" -r cadena.txt
      → e7b0aeeed3e757b6def727cd9c872f473fd21d348118e5388d205daaeccae431

  El secreto es de prueba y lo dice; no es el de ningún entorno.
*/
const VECTOR = {
  secreto: "vector-de-contrato-LEADS-esto-no-es-un-secreto",
  metodo: "POST",
  ruta: "/api/leads/propietario",
  timestamp: "2026-11-05T10:00:00.000Z",
  cuerpo:
    '{"nombre":"María García","correo":"maria@example.com","telefono":"+34 600 123 456","municipio":"Estepona","dormitorios":3,"consentimiento":true,"consentimiento_version":"2026-11-01"}',
  sha256Cuerpo: "5b0ded604342d5d384e77b0fea6a21ad3f9e95885f1d5463d58a7175e70449b7",
  firma: "e7b0aeeed3e757b6def727cd9c872f473fd21d348118e5388d205daaeccae431",
} as const

describe("el vector, contra openssl", () => {
  it("el cuerpo son 184 bytes UTF-8 y su sha256 es el de openssl", () => {
    expect(new TextEncoder().encode(VECTOR.cuerpo).byteLength).toBe(184)
    expect(sha256Hex(VECTOR.cuerpo)).toBe(VECTOR.sha256Cuerpo)
  })

  it("firmarLead da la firma de openssl", () => {
    expect(firmarLead(VECTOR)).toBe(VECTOR.firma)
  })

  it("las cabeceras que salen hacia el portal son exactamente las del vector", () => {
    expect(
      cabecerasFirmaPortal({
        secreto: VECTOR.secreto,
        url: ENDPOINT_PORTAL_LEADS_PROPIETARIO,
        cuerpo: VECTOR.cuerpo,
        ahora: new Date(VECTOR.timestamp),
      }),
    ).toEqual({ authorization: `HMAC-Lead ${VECTOR.firma}`, "x-timestamp": VECTOR.timestamp })
  })

  it("la ruta firmada es la del endpoint del portal", () => {
    expect(new URL(ENDPOINT_PORTAL_LEADS_PROPIETARIO).pathname).toBe(VECTOR.ruta)
  })

  it("un byte cambiado en el cuerpo cambia la firma", () => {
    expect(firmarLead({ ...VECTOR, cuerpo: VECTOR.cuerpo.replace("María", "Maria") })).not.toBe(VECTOR.firma)
  })
})

describe("el secreto no sale del servidor", () => {
  const rastrear = (patron: string) => {
    try {
      return execFileSync("git", ["grep", "--untracked", "-n", "-E", patron, "--", "app", "components", "lib", "hooks", "i18n"], {
        encoding: "utf8",
      })
        .split("\n")
        .filter(Boolean)
    } catch {
      return [] // git grep sin coincidencias sale con 1
    }
  }

  it("ningún NEXT_PUBLIC_ lleva el secreto de los leads", () => {
    expect(rastrear("NEXT_PUBLIC_[A-Z_]*LEADS")).toEqual([])
  })

  // Desde el asistente (feat/asistente-propietarios) la firma vive en
  // lib/lead-portal-envio.ts, el camino común de las dos puertas de leads.
  it("lib/lead-firma solo lo importa el envío al portal (servidor)", () => {
    const importadores = rastrear("from [\"']@/lib/lead-firma[\"']").map((l) => l.split(":")[0])
    expect(importadores).toEqual(["lib/lead-portal-envio.ts"])
  })

  it("lib/lead-portal-envio solo lo importan las dos rutas de servidor", () => {
    const importadores = rastrear("from [\"']@/lib/lead-portal-envio[\"']").map((l) => l.split(":")[0])
    expect(importadores.sort()).toEqual(["app/api/asistente/solicitud/route.ts", "app/api/leads/propietario/route.ts"])
  })
})
