// Genera preview/index.html (es) y preview/index.en.html (en) a partir de la INSTANTÁNEA REAL de la
// booking page de Beds24 (preview/real/booking2-<idioma>-2026-11-03.html, propid 348601) con custom.css.
//
// Uso, desde la raíz del repo:  node beds24/booking-page/preview/build.mjs
//
// Qué se conserva de la instantánea: el HTML del cuerpo tal cual y el <style> en línea de Beds24
// (sus colores de tema, que custom.css tiene que superar).
//
// Qué se quita: todos los <script> (apuntan a include/*.js, que no vienen en la instantánea y
// harían 404), los <link> a include/*, y el iframe de Google Maps (su URL lleva una clave de API
// que no queremos copiar a más ficheros) y el identificador de sesión «booking=…» de los enlaces.
//
// Qué se añade (SOLO en la preview, nada de esto se pega en Beds24):
//   · bootstrap 3.3.4 (vendor/): es la versión que carga la página real. Falta include/booking3.css,
//     que la instantánea solo referencia y no se pudo descargar: la preview NO es idéntica a la real.
//   · header.html y footer.html en SUPUESTOS de ubicación: el header justo tras <body>, el footer justo
//     antes del pie «powered by Beds24». La instantánea no dice dónde los coloca el panel.
//   · Lo que hace el JavaScript de Beds24 al cargar y que la instantánea trae vacío: fechas elegidas, precio,
//     calendarios mensuales (con la disponibilidad REAL del propio HTML) y el calendario desplegable de
//     bootstrap-datetimepicker (marcado de la librería, no capturado). El precio es de PRUEBA.
import { readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const aqui = dirname(fileURLToPath(import.meta.url))
const leer = (f) => readFileSync(join(aqui, f), "utf8")

// El logo se carga del repo (public/brand/svg) para que la preview funcione sin red y antes de desplegar.
const local = (html) => html.replaceAll("https://sedaprivatehomes.com/brand/", "../../../public/brand/")

const IDIOMAS = {
  es: { fichero: "real/booking2-es-2026-11-03.html", salida: "index.html", loc: "es-ES", dias: ["lu", "ma", "mi", "ju", "vi", "sá", "do"], dd: ["do", "lu", "ma", "mi", "ju", "vi", "sá"] },
  en: { fichero: "real/booking2-en-2026-11-03.html", salida: "index.en.html", loc: "en-GB", dias: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"], dd: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] },
}

const ROOM = "719434"
const CHECKIN = new Date(Date.UTC(2026, 10, 3))
const CHECKOUT = new Date(Date.UTC(2026, 10, 5))

const clave = (d) => `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`
const mesAnio = (loc, y, m) => new Intl.DateTimeFormat(loc, { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(y, m, 1)))
const corto = (L, d) => `${L.dd[d.getUTCDay()]} ${d.getUTCDate()} ${new Intl.DateTimeFormat(L.loc, { month: "short", timeZone: "UTC" }).format(d).replace(".", "")} ${d.getUTCFullYear()}`

// Rellena los tres calendarios mensuales vacíos con la disponibilidad real de la instantánea.
function calendarios(html, avail, L) {
  for (let t = 0; t < 3; t++) {
    const y = 2026 + Math.floor((10 + t) / 12)
    const mes = (10 + t) % 12
    const primero = new Date(Date.UTC(y, mes, 1))
    const huecos = (primero.getUTCDay() + 6) % 7 // la semana empieza en lunes (data-firstday="1")
    const dias = new Date(Date.UTC(y, mes + 1, 0)).getUTCDate()
    for (let c = 0; c < 42; c++) {
      const id = `calcell1-${ROOM}-${t * 42 + c + 1}`
      const dia = c - huecos + 1
      const re = new RegExp(`(<td id="${id}" class="[^"]*)">&nbsp;</td>`)
      if (dia < 1 || dia > dias) continue
      const libre = avail[clave(new Date(Date.UTC(y, mes, dia)))] === "1"
      html = html.replace(re, `$1 ${libre ? "dateavail" : "datenotavail"}">${dia}</td>`)
    }
    html = html.replace(`<span id="roomcalendarmonth1-${ROOM}-${t + 1}"></span>`, `<span id="roomcalendarmonth1-${ROOM}-${t + 1}">${mesAnio(L.loc, y, mes)}</span>`)
  }
  return html
}

// Marcado documentado de bootstrap-datetimepicker (NO capturado: lo genera JS al abrir el campo).
function widget(L) {
  const y = 2026
  const mes = 10
  const huecos = (new Date(Date.UTC(y, mes, 1)).getUTCDay() + 6) % 7
  const dias = new Date(Date.UTC(y, mes + 1, 0)).getUTCDate()
  const celdas = []
  for (let i = huecos; i > 0; i--) celdas.push(`<td class="day old disabled">${new Date(Date.UTC(y, mes, 1 - i)).getUTCDate()}</td>`)
  for (let d = 1; d <= dias; d++) {
    const pasado = d < 3
    const cls = ["day", pasado ? "disabled" : "", d === 3 ? "today active" : ""].filter(Boolean).join(" ")
    celdas.push(`<td class="${cls}" data-action="selectDay">${d}</td>`)
  }
  for (let d = 1; celdas.length % 7; d++) celdas.push(`<td class="day new">${d}</td>`)
  const filas = []
  for (let i = 0; i < celdas.length; i += 7) filas.push(`<tr>${celdas.slice(i, i + 7).join("")}</tr>`)
  const dow = L.dias.map((d) => `<th class="dow">${d}</th>`).join("")
  return `<div class="bootstrap-datetimepicker-widget dropdown-menu bottom preview-widget" role="dialog" aria-label="${mesAnio(L.loc, y, mes)}"><ul class="list-unstyled"><li class="collapse in"><div class="datepicker"><div class="datepicker-days"><table class="table-condensed"><thead><tr><th class="prev" data-action="previous"><span class="glyphicon glyphicon-chevron-left"></span></th><th class="picker-switch" data-action="pickerSwitch" colspan="5">${mesAnio(L.loc, y, mes)}</th><th class="next" data-action="next"><span class="glyphicon glyphicon-chevron-right"></span></th></tr><tr>${dow}</tr></thead><tbody>${filas.join("")}</tbody></table></div></div></li></ul></div>`
}

const PREVIEW_CSS = `
  /* SOLO de la preview: no se pega en Beds24 */
  .preview-aviso { margin: 0; padding: 8px 24px; font: 500 12px/1.4 "JetBrains Mono", ui-monospace, monospace; color: #faf8f4; background: #211f1c; text-align: center; }
  .preview-mapa { display: grid; place-items: center; height: 300px; padding: 16px; text-align: center; font: 500 12px/1.5 "JetBrains Mono", ui-monospace, monospace; color: #6c6760; background: #f4f1eb; border: 1px solid #d9d7d4; }
  #b24scroller { position: relative; }
  .preview-widget { display: none; position: absolute; top: calc(100% - 8px); left: 0; z-index: 1000; float: none; }
  @media (max-width: 767px) { .preview-widget { left: -8px; } }
  body.preview-widget-abierto .preview-widget { display: block; }
`

const PREVIEW_JS = `
  // ?paso=busqueda → calendario de fechas abierto · ?paso=habitaciones → disponibilidad del alojamiento abierta
  (function () {
    var p = new URLSearchParams(location.search).get("paso");
    if (p === "busqueda") document.body.classList.add("preview-widget-abierto");
    if (p === "habitaciones") {
      var c = document.getElementById("collapsecal-o${ROOM}-1");
      if (c) { c.className = ""; c.previousElementSibling.className += " hidden"; }
    }
  })();
`

for (const L of Object.values(IDIOMAS)) {
  let html = leer(L.fichero)
  // La disponibilidad REAL viene en un <script> de la instantánea: se lee ANTES de quitar los scripts.
  const mAvail = html.match(/\.data\("avail",\s*(\{[^}]*\})\)/)
  if (!mAvail) throw new Error(`${L.fichero}: no encuentro la disponibilidad (data("avail"))`)
  const avail = JSON.parse(mAvail[1])
  const estilo = html.match(/<style type='text\/css'>[\s\S]*?<\/style>/)?.[0] ?? ""
  if (!estilo) throw new Error(`${L.fichero}: no encuentro el <style> en línea de Beds24`)

  // 1 · Quitar scripts, enlaces a include/* y el iframe de Google Maps
  html = html.replace(/<script\b[\s\S]*?<\/script>/g, "")
  html = html.replace(/<link\b[^>]*include\/[^>]*>/g, "")
  html = html.replace(/<style type='text\/css'>[\s\S]*?<\/style>/, "")
  html = html.replace(/<iframe[\s\S]*?<\/iframe>/g, `<div class="preview-mapa">Mapa de Google (iframe) — no se carga en la preview</div>`)

  // Identificador de sesión de Beds24 en los enlaces («booking=…»): no se copia a la preview.
  html = html.replace(/booking=[a-z0-9]{10,}/g, "booking=SESION")
  html = html.replace(/(name="booking" value=")[a-z0-9]{10,}/g, "$1SESION")

  // 2 · Cabecera: Bootstrap (vendor), el <style> de Beds24 y, DESPUÉS, custom.css
  html = html.replace(
    "</head>",
    `<link rel="stylesheet" href="vendor/bootstrap-3.3.4/css/bootstrap.min.css">\n${estilo}\n<link rel="stylesheet" href="../custom.css">\n<style>${PREVIEW_CSS}</style>\n</head>`,
  )

  // 3 · Lo que hace el JS de Beds24 al cargar
  html = html.replace(/(id="inputcheckin"[^>]*?)value=""/, `$1value="${corto(L, CHECKIN)}"`)
  html = html.replace(/(id="inputcheckout"[^>]*?)value=""/, `$1value="${corto(L, CHECKOUT)}"`)
  html = html.replace(`<div id="roomprice-1-${ROOM}" class="hidden">`, `<div id="roomprice-1-${ROOM}" class="">`)
  html = html.replace(`<div id="price-roomprice-1-${ROOM}" class="text-right at_roomofferprice"></div>`, `<div id="price-roomprice-1-${ROOM}" class="text-right at_roomofferprice">400,00 €</div>`)
  html = calendarios(html, avail, L)
  html = html.replace(/(<div id="checkin" class="input-group date">[\s\S]*?<\/div>)/, `$1${widget(L)}`)

  // 4 · Aviso, header.html y footer.html (ubicaciones SUPUESTAS), y el JS de la preview
  const aviso = `<p class="preview-aviso" role="note">PREVISUALIZACIÓN · instantánea real de Beds24 del 3-nov-2026 + custom.css · precio de prueba · sin include/booking3.css · header y footer en ubicación supuesta</p>`
  html = html.replace(/(<body[^>]*>)/, `$1\n${aviso}\n${local(leer("../header.html"))}\n`)
  html = html.replace(`<div class="b24fullcontainer b24fullcontainer-footer">`, `${local(leer("../footer.html"))}\n<div class="b24fullcontainer b24fullcontainer-footer">`)
  html = html.replace("</body>", `<script>${PREVIEW_JS}</script>\n</body>`)

  writeFileSync(join(aqui, L.salida), html)
  console.log(`preview/${L.salida} generado desde ${L.fichero}`)
}
