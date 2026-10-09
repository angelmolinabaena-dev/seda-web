import { useTranslations } from "next-intl"

/*
  Rótulo «Imagen ilustrativa» para las imágenes que no son de una casa o una
  app reales (renders, generaciones). Regla del 27-jul: nada de imágenes
  inventadas que pasen por reales. Va dentro de un contenedor `relative`.
*/
export function IllustrativeTag({ className = "bottom-3 left-3" }: { className?: string }) {
  const t = useTranslations()
  return (
    <span
      className={`pointer-events-none absolute z-10 bg-background/80 px-2.5 py-1 font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/80 backdrop-blur-sm ${className}`}
    >
      {t("img.illustrative")}
    </span>
  )
}
