import { NextResponse } from "next/server"

/*
  Contact form backend — uses Resend if RESEND_API_KEY is configured,
  falls back to a dev-mode mock that just logs the payload.

  Setup:
    1. Create account at resend.com (free tier: 100 emails/day, 3k/mo)
    2. Add domain sedaprivatehomes.com + verify DNS
    3. Set env var:  RESEND_API_KEY="re_xxxxxx"
    4. Configure DESTINATION_EMAIL env var (defaults to info@sedaprivatehomes.com)

  Without these, the route returns 200 + mode:"mock" so the UI still works
  end-to-end in development — payloads appear in the server console.
*/

const DEFAULT_TO = "info@sedaprivatehomes.com"
const FROM = "SEDA Private Homes <web@sedaprivatehomes.com>"

type ContactType = "guest" | "owner" | "other"

const SUBJECT_BY_TYPE: Record<ContactType, string> = {
  guest: "Solicitud de estancia — sedaprivatehomes.com",
  owner: "Valoración de propiedad — sedaprivatehomes.com",
  other: "Mensaje desde sedaprivatehomes.com",
}

function escape(value: string) {
  return value.replace(/[<>&]/g, (c) =>
    c === "<" ? "&lt;" : c === ">" ? "&gt;" : "&amp;",
  )
}

function renderHtml(type: ContactType, fields: Record<string, string>) {
  const rows = Object.entries(fields)
    .filter(([, v]) => v && v.trim().length > 0)
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

export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 })
  }

  const type = (body.type as ContactType) ?? "other"
  if (!["guest", "owner", "other"].includes(type)) {
    return NextResponse.json({ ok: false, error: "invalid_type" }, { status: 400 })
  }
  const fields = (body.fields as Record<string, string>) ?? {}

  // Minimum validation server-side as defence in depth
  const email = fields.email?.trim()
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 })
  }

  const subject = SUBJECT_BY_TYPE[type]
  const html = renderHtml(type, fields)
  const text = Object.entries(fields)
    .filter(([, v]) => v && v.trim().length > 0)
    .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
    .join("\n")

  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.SEDA_CONTACT_TO ?? DEFAULT_TO

  // Dev fallback when no Resend key is configured.
  if (!apiKey) {
    console.warn("[/api/contact] RESEND_API_KEY not set — running in MOCK mode")
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
