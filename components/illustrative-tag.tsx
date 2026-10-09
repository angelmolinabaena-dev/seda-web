import { useTranslations } from "next-intl"

/*
  Rótulo «Imagen ilustrativa» para las imágenes que no son de una casa o una
  app reales (renders, generaciones). Regla del 27-jul: nada de imágenes
  inventadas que pasen por reales. Si no es la casa real, se rotula. Va dentro
  de un contenedor `relative`. `compact` es para imágenes dentro de una maqueta
  de móvil, donde el rótulo normal no cabe.
*/
export function IllustrativeTag({
  className = "bottom-3 left-3",
  compact = false,
}: {
  className?: string
  compact?: boolean
}) {
  const t = useTranslations()
  const size = compact
    ? "px-1.5 py-0.5 text-[6px] tracking-[0.1em]"
    : "px-2.5 py-1 text-[10px] tracking-[0.18em]"
  return (
    <span
      className={`pointer-events-none absolute z-10 bg-background/80 font-mono uppercase text-foreground/80 backdrop-blur-sm ${size} ${className}`}
    >
      {t("img.illustrative")}
    </span>
  )
}
