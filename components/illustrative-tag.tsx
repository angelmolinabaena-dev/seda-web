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
  sutil = false,
}: {
  className?: string
  compact?: boolean
  /** Por debajo de 1.280 px, más discreto: fondo tinta al 70 %, texto al 90 %, mono de 8,5 px (31c). */
  sutil?: boolean
}) {
  const t = useTranslations()
  const size = compact
    ? "px-1.5 py-0.5 text-[6px] tracking-[0.1em]"
    : "px-2.5 py-1 text-[10px] tracking-[0.18em]"
  const discreto = sutil
    ? "max-[1279px]:rounded-[3px] max-[1279px]:bg-[rgba(20,16,14,0.7)] max-[1279px]:px-[7px] max-[1279px]:py-[3px] max-[1279px]:text-[8.5px] max-[1279px]:tracking-[0.12em] max-[1279px]:text-background/90"
    : ""
  return (
    <span
      data-rotulo-ilustrativo
      className={`pointer-events-none absolute z-10 bg-background/80 font-mono uppercase text-foreground/80 backdrop-blur-sm ${size} ${discreto} ${className}`}
    >
      {t("img.illustrative")}
    </span>
  )
}
