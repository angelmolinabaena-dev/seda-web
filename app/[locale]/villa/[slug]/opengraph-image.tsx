import { ImageResponse } from "next/og"
import { loadGoogleFont } from "@/lib/og-fonts"
import { getVillaBySlug } from "@/lib/villas"

export const alt = "Villa SEDA Private Homes"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const villa = getVillaBySlug(slug)
  const prefix = villa?.prefix ?? "SEDA"
  const italic = villa?.italic ?? "Private Homes"
  const sublocation = villa?.sublocation ?? "Costa del Sol"
  const capacity = villa?.capacity ?? "Villa privada"

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
            fontFamily: "JetBrains Mono",
            fontSize: 18,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "hsl(60, 3%, 45%)",
          }}
        >
          <div style={{ display: "flex" }}>{sublocation}</div>
          <div style={{ display: "flex" }}>SEDA Private Homes</div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: "Cormorant Garamond",
              fontSize: 120,
              fontWeight: 300,
              lineHeight: 1.0,
              letterSpacing: "-0.02em",
              color: "hsl(90, 4%, 11%)",
            }}
          >
            {prefix}{" "}
            <span
              style={{
                fontStyle: "italic",
                fontWeight: 400,
                marginLeft: 24,
              }}
            >
              {italic}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "JetBrains Mono",
              fontSize: 20,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "hsl(162, 20%, 33%)",
              marginTop: 16,
            }}
          >
            {capacity}
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
