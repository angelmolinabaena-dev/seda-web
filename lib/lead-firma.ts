import { createHash, createHmac } from "node:crypto"

/*
  LEADS-RUTA-FIRMADA (V4-01 de seda_os docs/audit/REA-GLOBAL-V4-2026-11.md) —
  la firma del POST de seda-web al portal. SOLO SERVIDOR: lo importa
  app/api/leads/propietario/route.ts y nada más (`tests/lead-firma-contrato.test.ts`
  falla si un componente lo importa).

  El portal (`POST /api/leads/propietario` de seda_os) ya no acepta una llamada
  porque venga sin `Origin`: exige

    Authorization: HMAC-Lead <hex de 64>
    X-Timestamp:   2026-11-05T10:00:00.000Z     (toISOString(), ±5 min)

    firma = HMAC-SHA256(SEDA_LEADS_HMAC_SECRET, `${método}|${ruta}|${timestamp}|${sha256hex(cuerpo)}`)

  El cuerpo que se firma es EXACTAMENTE el texto que se envía: se serializa una
  vez y esa misma cadena va a la firma y al `body`. Volver a llamar a
  `JSON.stringify` para el envío no sería lo mismo si algún día cambiara el
  orden de las claves.

  El secreto es `SEDA_LEADS_HMAC_SECRET`, el MISMO valor que en el proyecto de
  Vercel del portal. Nunca `NEXT_PUBLIC_`: Next solo incrusta en el navegador las
  variables con ese prefijo, y este módulo no entra en ningún bundle de cliente.

  El gemelo que verifica vive en seda_os `lib/leads-firma.ts`. Los dos repos fijan
  el mismo vector (calculado con openssl) en su test de contrato.
*/

export const ESQUEMA_FIRMA_LEAD = "HMAC-Lead"

/** El portal trata un secreto más corto como ausente (503). Aquí, igual: no se envía. */
export const SECRETO_LEAD_MIN = 32

export function sha256Hex(cuerpo: string): string {
  return createHash("sha256").update(cuerpo, "utf8").digest("hex")
}

export function firmarLead(args: { secreto: string; metodo: string; ruta: string; timestamp: string; cuerpo: string }): string {
  const cadena = `${args.metodo.toUpperCase()}|${args.ruta}|${args.timestamp}|${sha256Hex(args.cuerpo)}`
  return createHmac("sha256", args.secreto).update(cadena, "utf8").digest("hex")
}

/** El secreto, o `null` si falta o es demasiado corto. */
export function secretoLead(env: Record<string, string | undefined> = process.env): string | null {
  const s = env.SEDA_LEADS_HMAC_SECRET
  return s && s.length >= SECRETO_LEAD_MIN ? s : null
}

/**
 * Las dos cabeceras de la firma para un POST a `url` con este `cuerpo` (el texto
 * EXACTO que se envía), firmado a la hora `ahora`.
 */
export function cabecerasFirmaPortal(args: { secreto: string; url: string; cuerpo: string; ahora: Date }): {
  authorization: string
  "x-timestamp": string
} {
  const timestamp = args.ahora.toISOString()
  const firma = firmarLead({
    secreto: args.secreto,
    metodo: "POST",
    ruta: new URL(args.url).pathname,
    timestamp,
    cuerpo: args.cuerpo,
  })
  return { authorization: `${ESQUEMA_FIRMA_LEAD} ${firma}`, "x-timestamp": timestamp }
}
