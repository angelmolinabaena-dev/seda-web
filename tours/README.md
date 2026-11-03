# tours/

Un recorrido 360 por casa: `tours/<slug>/tour.json`. Todo el procedimiento, el esquema
y la checklist de privacidad están en [`docs/TOUR-360.md`](../docs/TOUR-360.md).

- `_plantilla/` no es una casa (el prefijo `_` la excluye): se copia para empezar una nueva.
- Hoy **no hay ninguna casa publicada**: no hay fotos reales todavía. Un recorrido solo
  existe como ruta `/tour/<slug>` con `"publicado": true`, y solo se acepta así si todas
  sus escenas tienen `multires` (es decir, ya pasaron por `scripts/tour360-preparar`).
- Las fotos y los tiles **no** se guardan aquí; solo el manifiesto (unos pocos KB).
