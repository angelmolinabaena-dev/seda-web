import { ImageResponse } from "next/og"
import { loadGoogleFont } from "@/lib/og-fonts"

export const alt = "Propietarios — SEDA Private Homes"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OpenGraphImage() {
  const [serifLight, serifItalic, mono] = await Promise.all([
    loadGoogleFont("Cormorant Garamond", 300, "normal"),
    loadGoogleFont("Cormorant Garamond", 400, "italic"),
    loadGoogleFont("JetBrains Mono", 400, "normal"),
  ])

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "hsl(90, 4%, 11%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px 96px",
          color: "hsl(36, 38%, 97%)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            fontFamily: "JetBrains Mono",
            fontSize: 18,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "hsla(36, 38%, 97%, 0.55)",
          }}
        >
          <div style={{ display: "flex" }}>Propietarios</div>
          <div style={{ display: "flex" }}>SEDA Private Homes</div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: "Cormorant Garamond",
              fontSize: 84,
              fontWeight: 300,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              maxWidth: 1020,
            }}
          >
            Su villa, dirigida con la
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Cormorant Garamond",
              fontSize: 84,
              fontWeight: 400,
              fontStyle: "italic",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              color: "hsl(36, 99%, 64%)",
              maxWidth: 1020,
            }}
          >
            precisión de un hotel.
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "JetBrains Mono",
              fontSize: 18,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "hsla(36, 38%, 97%, 0.55)",
              marginTop: 12,
            }}
          >
            Portal financiero · Cumplimiento fiscal · Equipo local
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Cormorant Garamond", data: serifLight, weight: 300, style: "normal" },
        { name: "Cormorant Garamond", data: serifItalic, weight: 400, style: "italic" },
        { name: "JetBrains Mono", data: mono, weight: 400, style: "normal" },
      ],
    },
  )
}
