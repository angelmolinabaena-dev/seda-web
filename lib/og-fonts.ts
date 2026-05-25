/*
  Helper para cargar fuentes de Google Fonts en runtime para usarse
  dentro de `next/og` ImageResponse. Necesario porque Satori (el motor
  detrás de ImageResponse) no resuelve `font-family` automáticamente —
  hay que pasarle los buffers de fuente explícitamente.
*/

type FontStyle = "normal" | "italic"
type FontWeight = 300 | 400 | 500 | 600 | 700

const FONT_API = "https://fonts.googleapis.com/css2"

async function fetchFontBuffer(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch font: ${res.status}`)
  return res.arrayBuffer()
}

export async function loadGoogleFont(
  family: string,
  weight: FontWeight,
  style: FontStyle = "normal",
): Promise<ArrayBuffer> {
  const params = new URLSearchParams({
    family: `${family}:ital,wght@${style === "italic" ? "1" : "0"},${weight}`,
    display: "swap",
  })
  // The User-Agent header tells Google Fonts to serve .woff2 or .ttf
  // depending on browser/runtime. We use a modern UA so we get woff2.
  const cssRes = await fetch(`${FONT_API}?${params}`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  })
  if (!cssRes.ok) throw new Error(`Failed to fetch font CSS: ${cssRes.status}`)
  const css = await cssRes.text()
  // Extract the url(...) from the @font-face src declaration.
  const match = css.match(/src:\s*url\(([^)]+)\)/)
  if (!match?.[1]) throw new Error("Could not parse Google Font URL")
  return fetchFontBuffer(match[1])
}
