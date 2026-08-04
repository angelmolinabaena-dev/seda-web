import { NextResponse } from "next/server"

/*
  Contact form backend — the only data-entry point of the public site.

  Setup:
    1. Create account at resend.com (free tier: 100 emails/day, 3k/mo)
    2. Add domain sedaprivatehomes.com + verify DNS
    3. Set env var:  RESEND_API_KEY="re_xxxxxx"
    4. Configure SEDA_CONTACT_TO env var (defaults to info@sedaprivatehomes.com)

  Outside production (VERCEL_ENV !== "production"), a missing RESEND_API_KEY
  falls back to mock mode: 200 + mode:"mock", payload logged to the console.
  In production a missing key is a hard error — never a silent success.
*/

const DEFAULT_TO = "info@sedaprivatehomes.com"
// info@ is a real mailbox on the domain (the only ones are info@ and reservas@).
// A From: that does not exist starts landing in spam the day DMARC moves to
// p=quarantine, and a lead form in spam is a failure nobody notices.
const FROM = "SEDA Private Homes <info@sedaprivatehomes.com>"

// Everything below ends up in an inbox a human opens. Keep it small.
const MAX_BODY_BYTES = 16 * 1024
const MAX_FIELDS = 20
const MAX_KEY_LENGTH = 64
const MAX_VALUE_LENGTH = 4000
const MAX_EMAIL_LENGTH = 254

// Best-effort, per-instance rate limit. See the note above rateLimit().
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_MAX_KEYS = 5000

type ContactType = "guest" | "owner" | "other"

const CONTACT_TYPES: ContactType[] = ["guest", "owner", "other"]

const SUBJECT_BY_TYPE: Record<ContactType, string> = {
  guest: "Solicitud de estancia — sedaprivatehomes.com",
  owner: "Valoración de propiedad — sedaprivatehomes.com",
  other: "Mensaje desde sedaprivatehomes.com",
}

/*
  Single address, nothing else. Not RFC 5322 — deliberately narrower: the
  character classes exclude comma, semicolon, whitespace, newlines and angle
  brackets, so "lead@example.com,attacker@evil.tld" cannot reach reply_to.
*/
const EMAIL_RE =
  /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/

// Explicit belt-and-braces list of header/recipient separators.
const FORBIDDEN_IN_EMAIL = /[,;<>\s"'()[\]:\\]/

function isValidEmail(value: string) {
  if (value.length === 0 || value.length > MAX_EMAIL_LENGTH) return false
  if (FORBIDDEN_IN_EMAIL.test(value)) return false
  if (!EMAIL_RE.test(value)) return false
  const [local] = value.split("@")
  return local.length <= 64
}

function escape(value: string) {
  return value.replace(/[<>&]/g, (c) =>
    c === "<" ? "&lt;" : c === ">" ? "&gt;" : "&amp;",
  )
}

function renderHtml(type: ContactType, fields: Record<string, string>) {
  const rows = Object.entries(fields)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px;font-family:monospace;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#888;vertical-align:top;white-space:nowrap">${escape(
          k,
        )}</td><td style="padding:6px 12px;font-family:Georgia,serif;font-size:14px;color:#1c1d1b">${escape(
          v,
        ).replace(/\n/g, "<br/>")}</td></tr>`,
    )
    .join("")

  return `
<!doctype html>
<html><body style="font-family:Georgia,serif;background:#fbf9f6;padding:32px;color:#1c1d1b">
  <table style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #eadcc7;border-radius:8px;overflow:hidden">
    <tr><td style="padding:24px 28px;border-bottom:1px solid #eadcc7;background:#44665c;color:#fbf9f6">
      <div style="font-family:monospace;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#feb64a">SEDA — Nuevo contacto</div>
      <div style="font-family:Georgia,serif;font-style:italic;font-size:22px;margin-top:6px">${SUBJECT_BY_TYPE[type]}</div>
    </td></tr>
    <tr><td style="padding:24px 28px">
      <table style="width:100%;border-collapse:collapse">${rows}</table>
    </td></tr>
    <tr><td style="padding:16px 28px;border-top:1px solid #eadcc7;font-family:monospace;font-size:10px;letter-spacing:0.18em;color:#888">
      Origen: sedaprivatehomes.com · ${new Date().toISOString()}
    </td></tr>
  </table>
</body></html>`
}

/*
  Per-instance sliding window. seda-web is serverless, so this is NOT a global
  limit: it only throttles requests that land on the same warm instance. It is
  here because it costs nothing — no dependency, no env var, no Vercel config —
  and it already breaks the trivial "20 POST in a row from one script" case
  measured in the audit. The durable limit belongs in the Vercel Firewall
  (see docs/prompts/SEDA-WEB-CONTACT-HARDENING.md and the PR description).
*/
const hits = new Map<string, number[]>()

function rateLimit(key: string) {
  const now = Date.now()
  const since = now - RATE_LIMIT_WINDOW_MS

  if (hits.size > RATE_LIMIT_MAX_KEYS) {
    for (const [k, stamps] of hits) {
      if (stamps.every((t) => t <= since)) hits.delete(k)
    }
  }

  const recent = (hits.get(key) ?? []).filter((t) => t > since)
  if (recent.length >= RATE_LIMIT_MAX) {
    hits.set(key, recent)
    const retryAfter = Math.ceil((recent[0] + RATE_LIMIT_WINDOW_MS - now) / 1000)
    return { ok: false as const, retryAfter: Math.max(retryAfter, 1) }
  }

  recent.push(now)
  hits.set(key, recent)
  return { ok: true as const }
}

function clientKey(req: Request) {
  const fwd = req.headers.get("x-forwarded-for")
  if (fwd) return fwd.split(",")[0].trim()
  return req.headers.get("x-real-ip")?.trim() || "unknown"
}

export async function POST(req: Request) {
  const limit = rateLimit(clientKey(req))
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    )
  }

  const declared = Number(req.headers.get("content-length") ?? "")
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "payload_too_large" }, { status: 413 })
  }

  // Read as text so an undeclared/lying content-length cannot slip through.
  let raw: string
  try {
    raw = await req.text()
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 })
  }
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "payload_too_large" }, { status: 413 })
  }

  let body: unknown
  try {
    body = JSON.parse(raw)
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 })
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 })
  }

  const payload = body as Record<string, unknown>

  const rawType = payload.type ?? "other"
  if (typeof rawType !== "string" || !CONTACT_TYPES.includes(rawType as ContactType)) {
    return NextResponse.json({ ok: false, error: "invalid_type" }, { status: 400 })
  }
  const type = rawType as ContactType

  const rawFields = payload.fields
  if (
    typeof rawFields !== "object" ||
    rawFields === null ||
    Array.isArray(rawFields)
  ) {
    return NextResponse.json({ ok: false, error: "invalid_fields" }, { status: 400 })
  }

  const entries = Object.entries(rawFields as Record<string, unknown>)
  if (entries.length > MAX_FIELDS) {
    return NextResponse.json({ ok: false, error: "too_many_fields" }, { status: 400 })
  }

  /*
    Every value must already be a string — no coercion. `fields.email` arriving
    as a number used to reach .trim() and blow up with an unhandled 500.
    Over-long values are rejected rather than truncated: an email that arrives
    cut in half is worse than one that never arrives, because you answer half a
    request without knowing it. The sender sees the error and can shorten it.
  */
  const fields: Record<string, string> = {}
  for (const [key, value] of entries) {
    if (key.length === 0 || key.length > MAX_KEY_LENGTH) {
      return NextResponse.json({ ok: false, error: "invalid_field_name" }, { status: 400 })
    }
    if (typeof value !== "string") {
      return NextResponse.json({ ok: false, error: "invalid_field_value" }, { status: 400 })
    }
    if (value.length > MAX_VALUE_LENGTH) {
      return NextResponse.json({ ok: false, error: "field_too_long" }, { status: 400 })
    }
    const trimmed = value.trim()
    if (trimmed.length > 0) fields[key] = trimmed
  }

  const email = fields.email
  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 })
  }

  const subject = SUBJECT_BY_TYPE[type]
  const html = renderHtml(type, fields)
  const text = Object.entries(fields)
    .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
    .join("\n")

  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.SEDA_CONTACT_TO ?? DEFAULT_TO
  const isProduction = process.env.VERCEL_ENV === "production"

  if (!apiKey) {
    // Fail closed in production: never tell a lead "message received" when the
    // message only exists in a log line.
    if (isProduction) {
      console.error("[/api/contact] RESEND_API_KEY missing in production — refusing to fake success")
      return NextResponse.json(
        { ok: false, error: "mailer_unavailable" },
        { status: 503 },
      )
    }
    console.warn("[/api/contact] RESEND_API_KEY not set — running in MOCK mode (non-production)")
    console.log("[/api/contact] payload", { type, to, subject, fields })
    return NextResponse.json({ ok: true, mode: "mock" })
  }

  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [to],
        reply_to: email,
        subject,
        html,
        text,
      }),
    })

    if (!resp.ok) {
      const errText = await resp.text().catch(() => "")
      console.error("[/api/contact] resend error", resp.status, errText)
      return NextResponse.json(
        { ok: false, error: "send_failed" },
        { status: 502 },
      )
    }

    return NextResponse.json({ ok: true, mode: "resend" })
  } catch (err) {
    console.error("[/api/contact] network error", err)
    return NextResponse.json(
      { ok: false, error: "network_error" },
      { status: 502 },
    )
  }
}
