import { ImageResponse } from "next/og"
import { loadGoogleFont } from "@/lib/og-fonts"

export const alt = "SEDA Private Homes — Villas privadas en la Costa del Sol"
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
          background: "hsl(36, 38%, 97%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px 96px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            color: "hsl(60, 3%, 45%)",
            fontFamily: "JetBrains Mono",
            fontSize: 18,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
          }}
        >
          <div style={{ display: "flex" }}>36°30&apos;N · 04°53&apos;W</div>
          <div style={{ display: "flex" }}>SEDA Private Homes</div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 32,
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: "Cormorant Garamond",
              fontSize: 88,
              fontWeight: 300,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              color: "hsl(90, 4%, 11%)",
              maxWidth: 1020,
            }}
          >
            Hospitalidad inteligente.
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Cormorant Garamond",
              fontSize: 88,
              fontWeight: 400,
              fontStyle: "italic",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              color: "hsl(90, 4%, 11%)",
              maxWidth: 1020,
              marginTop: -32,
            }}
          >
            Alma mediterránea.
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "JetBrains Mono",
              fontSize: 18,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "hsl(162, 20%, 33%)",
            }}
          >
            Villas privadas · Costa del Sol
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
