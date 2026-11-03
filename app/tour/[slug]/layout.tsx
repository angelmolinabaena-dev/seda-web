import "./tour.css"

/*
  Layout del visor 360 incrustable. Va FUERA de app/[locale] a propósito (ver
  proxy.ts y lib/tour360/idiomas.ts): sin navegación, sin pie, sin fuentes de
  Google, sin analítica y sin cookies. Solo el visor.

  El root layout (app/layout.tsx) es un pass-through, así que <html> y <body>
  se pintan aquí, igual que en app/[locale]/layout.tsx. `lang` arranca en «es»
  y el visor lo ajusta al idioma resuelto (?lang= o navegador).
*/
export default function TourLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="tour-body">{children}</body>
    </html>
  )
}
