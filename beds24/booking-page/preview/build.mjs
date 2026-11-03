// Genera preview/index.html juntando header.html, footer.html y estructura.html.
// Uso, desde la raíz del repo:  node beds24/booking-page/preview/build.mjs
//
// Así la preview no lleva copias a mano de lo que se pega en Beds24: cualquier cambio en
// header.html / footer.html / custom.css se ve al volver a generar.
import { readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const aqui = dirname(fileURLToPath(import.meta.url))
const leer = (f) => readFileSync(join(aqui, f), "utf8")

// Los enlaces del header/footer apuntan a sedaprivatehomes.com. En la preview, el logo se carga del repo
// (public/brand/svg) para que funcione sin red y antes de desplegar.
const local = (html) => html.replaceAll("https://sedaprivatehomes.com/brand/", "../../../public/brand/")

// Calendario de diciembre de 2026 con el marcado de jQuery UI datepicker (suposición, ver estructura.html).
function calendario() {
  const anio = 2026
  const mes = 11 // diciembre (0-indexado)
  const primero = new Date(Date.UTC(anio, mes, 1))
  const huecos = (primero.getUTCDay() + 6) % 7 // la semana empieza en lunes
  const dias = new Date(Date.UTC(anio, mes + 1, 0)).getUTCDate()
  const llegada = 12
  const salida = 15
  const ocupados = new Set([5, 6, 7]) // días de prueba no disponibles
  const filas = []
  let celdas = []
  for (let i = 0; i < huecos; i++) celdas.push(`<td class="ui-datepicker-other-month ui-datepicker-unselectable ui-state-disabled">&nbsp;</td>`)
  for (let d = 1; d <= dias; d++) {
    if (ocupados.has(d)) {
      celdas.push(`<td class="ui-datepicker-unselectable ui-state-disabled"><span class="ui-state-default" aria-label="${d} de diciembre, no disponible">${d}</span></td>`)
    } else {
      const activo = d === llegada || d === salida
      celdas.push(
        `<td><a class="ui-state-default${activo ? " ui-state-active" : ""}" href="#" onclick="return false" aria-label="${d} de diciembre"${activo ? ' aria-current="date"' : ""}>${d}</a></td>`,
      )
    }
    if (celdas.length === 7) {
      filas.push(`<tr>${celdas.join("")}</tr>`)
      celdas = []
    }
  }
  if (celdas.length) {
    while (celdas.length < 7) celdas.push(`<td class="ui-datepicker-other-month ui-datepicker-unselectable ui-state-disabled">&nbsp;</td>`)
    filas.push(`<tr>${celdas.join("")}</tr>`)
  }
  const cabeza = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"].map((d) => `<th scope="col"><span>${d}</span></th>`).join("")
  return `<div class="ui-datepicker ui-widget preview-calendario" role="dialog" aria-label="Elegir fecha de llegada">
  <div class="ui-datepicker-header">
    <a class="ui-datepicker-prev" href="#" onclick="return false" aria-label="Mes anterior"><span aria-hidden="true">‹</span></a>
    <a class="ui-datepicker-next" href="#" onclick="return false" aria-label="Mes siguiente"><span aria-hidden="true">›</span></a>
    <div class="ui-datepicker-title"><span class="ui-datepicker-month">diciembre</span> <span class="ui-datepicker-year">2026</span></div>
  </div>
  <table class="ui-datepicker-calendar"><thead><tr>${cabeza}</tr></thead><tbody>${filas.join("")}</tbody></table>
</div>`
}

const estructura = leer("estructura.html").replaceAll("{{CALENDARIO}}", calendario())

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Preview · booking page de Beds24 con custom.css de SEDA</title>
<link rel="stylesheet" href="../custom.css">
<!-- Estilos SOLO de la preview (no se pegan en Beds24): el aviso, el marcador de foto y la posición del calendario. -->
<style>
  .preview-aviso { margin: 0; padding: 8px var(--seda-gutter); font: 500 12px/1.4 var(--seda-mono); color: var(--seda-bg); background: var(--seda-fg); text-align: center; }
  .preview-foto { display: grid; place-items: center; aspect-ratio: 3 / 2; padding: 16px; text-align: center; font: 500 12px/1.5 var(--seda-mono); color: var(--seda-muted); background: repeating-linear-gradient(45deg, var(--seda-card), var(--seda-card) 10px, var(--seda-secondary) 10px, var(--seda-secondary) 20px); border: 1px solid var(--seda-line); }
  .preview-calendario { position: relative; margin-top: 16px; }
  main { padding-top: 32px; }
  main > section { margin-bottom: 48px; }
</style>
</head>
<body>
<p class="preview-aviso" role="note">PREVISUALIZACIÓN · datos de prueba · estructura reconstruida, no la página real de Beds24</p>
${local(leer("../header.html"))}
<main id="bookingpage" class="container">
${estructura}
</main>
${local(leer("../footer.html"))}
<script>
  // ?paso=busqueda | habitaciones | huesped | pago  → solo esa pantalla. Sin parámetro: las cuatro.
  (function () {
    var p = new URLSearchParams(location.search).get("paso");
    if (!p) return;
    document.querySelectorAll("main > section").forEach(function (s) { s.hidden = s.getAttribute("data-paso") !== p; });
  })();
</script>
</body>
</html>
`

writeFileSync(join(aqui, "index.html"), html)
console.log("preview/index.html generado")
