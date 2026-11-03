// Monta una instantánea REAL de Beds24 (preview/real/*.html) con un custom.css para verla en un navegador.
//
// Qué se quita: los <script> (apuntan a include/*.js, que no vienen en la instantánea), los <link> a include/*
// y el <style> que Beds24 ya trae con el CSS pegado EN VIVO (el de la v4), para probar el nuevo.
// Qué se añade: bootstrap 3.3.4 (vendor/) y el CSS que se pasa. NO está include/booking3.css (la instantánea solo
// lo referencia), así que lo que se ve es Bootstrap + el <style> de Beds24 + este CSS: no es idéntico a la real.
// Las fotos de media.xmlcal.com no se pueden bajar desde el entorno: se sustituyen por una de prueba.
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const aqui = dirname(fileURLToPath(import.meta.url))
export const leer = (f) => readFileSync(join(aqui, f), "utf8")

const FOTO = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c9b896"/><stop offset="1" stop-color="#6f7c5c"/></linearGradient></defs><rect width="1600" height="900" fill="url(#g)"/><text x="800" y="470" font-family="monospace" font-size="40" fill="#faf8f4" text-anchor="middle">foto de prueba 16:9</text></svg>',
)}`

export function pagina(fichero, css, { rellenar = true } = {}) {
  let html = leer(fichero)
  html = html.replace(/<script\b[\s\S]*?<\/script>/gi, "")
  html = html.replace(/<link\b[^>]*include\/[^>]*>/g, "")
  html = html.replace(/<style type="text\/css">[\s\S]*?<\/style>/i, "") // el CSS pegado en vivo (mayúsculas en la instantánea)
  html = html.replace(/<STYLE type="text\/css">[\s\S]*?<\/STYLE>/, "")
  html = html.replace(/<iframe[\s\S]*?<\/iframe>/g, "")
  html = html.replace(/booking=[A-Za-z0-9]{6,}/g, "booking=SESION")
  html = html.replace(/ data-lazy-load-src=/g, " src=")
  html = html.replace(/<img([^>]*?) src="https:\/\/media\.xmlcal\.com[^"]*"/g, `<img$1 src="${FOTO}"`)
  html = html.replace(/<img([^>]*?) src="https:\/\/sedaprivatehomes\.com\/brand\//g, `<img$1 src="../../../public/brand/`)
  html = html.replace(
    "</head>",
    `<link rel="stylesheet" href="vendor/bootstrap-3.3.4/css/bootstrap.min.css">\n<style id="css-bajo-prueba">${css}</style>\n</head>`,
  )
  if (rellenar && /id="inputcheckin"/.test(html)) {
    // Lo que hace el JS de Beds24 al cargar y la instantánea trae vacío (la disponibilidad real y el precio NO se emulan aquí)
    html = html.replace(/(id="inputcheckin"[^>]*?)value=""/, `$1value="mar 3 nov 2026"`)
    html = html.replace(/(id="inputcheckout"[^>]*?)value=""/, `$1value="jue 5 nov 2026"`)
    html = html.replace(`<div id="roomprice-1-719434" class="hidden">`, `<div id="roomprice-1-719434" class="">`)
    html = html.replace(`class="text-right at_roomofferprice"></div>`, `class="text-right at_roomofferprice">EUR 600,00</div>`)
  }
  return html
}
