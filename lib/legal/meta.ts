import { metaCapiActivo, metaPixelActivo } from "../meta-config.mjs"
import { COOKIES } from "./cookies"
import { PRIVACIDAD } from "./privacidad"
import { ACTUALIZADO_CON_META } from "./meta-version"
import type { BloqueLegal, DocumentoLegal, DocumentoLegalMultilingue, SeccionLegal } from "./types"
import type { Locale } from "@/i18n/routing"

/*
  Variantes de las políticas de cookies y privacidad CON el píxel de Meta
  (plan «Motor SEDA», fase 1).

  Por qué dos variantes y no un solo texto: con SEDA_FLAG_META_PIXEL apagado la
  web NO tiene píxel ni aviso, y la política tiene que seguir diciendo lo que
  hoy es verdad («no hay píxeles de Meta»). Con el flag encendido, esas frases
  serían falsas. Así que `COOKIES` y `PRIVACIDAD` (cookies.ts, privacidad.ts)
  quedan intactos —la variante «sin Meta»— y aquí se derivan las de «con Meta»
  mediante PARCHES sobre el texto base. Un parche nombra el texto exacto que
  sustituye; si alguien edita el base y el ancla deja de existir (o existe dos
  veces), `aplicar` lanza un error al evaluar el módulo, no publica un texto a
  medias. Dentro de «con Meta» hay dos formas: con y sin API de conversiones
  (SEDA_FLAG_META_CAPI), porque la política debe describir solo lo que ocurre.

  ── La versión ─────────────────────────────────────────────────────────────
  `ACTUALIZADO_CON_META` es la fecha de ambas variantes con Meta y, a la vez,
  la VERSIÓN del consentimiento de cookies: si cambia, el aviso vuelve a
  preguntar a quien ya eligió (lib/consentimiento.ts). La política de
  privacidad ya llevaba fecha 2026-11-06 (#116), así que ese día no hay una
  fecha posterior que poner sin inventarla: al ENCENDER el flag, subir esta
  constante al día de la activación. `tests/meta-pixel-legal.test.ts` exige
  que no sea anterior a las fechas de los textos base.

  ── Qué NO está verificado (texto pendiente de revisión legal) ─────────────
  · Duración de _fbp y _fbc (90 días) y la lista de cookies de facebook.com:
    salen de la documentación de Meta, no se han medido en un navegador. El
    texto de Calendly de cookies.ts sí está medido; este no, y lo dice.
  · La razón social de Meta (Meta Platforms Ireland Limited), el reparto de
    responsabilidad (art. 26 RGPD) y las garantías de la transferencia a
    EE. UU. (Marco de Privacidad de Datos UE–EE. UU. y cláusulas tipo, que el
    texto atribuye a lo que «Meta indica») hay que contrastarlos con el
    acuerdo de responsable que Meta ofrece en el Administrador de eventos.
*/

export { ACTUALIZADO_CON_META }

type Reemplazo = readonly [antes: string, despues: string]

type Parche = {
  entradilla?: string
  titulos?: { seccion: string; titulo: string }[]
  reemplazos?: Reemplazo[]
  /** Fila añadida a la PRIMERA tabla de la sección. */
  filas?: { seccion: string; fila: string[] }[]
  bloquesAlFinal?: { seccion: string; bloques: BloqueLegal[] }[]
  /** Sustituye la sección `id` por estas (una o más). */
  secciones?: { id: string; por: SeccionLegal[] }[]
}

const cuenta = (texto: string, aguja: string): number => texto.split(aguja).length - 1

/** Cada cadena visible de un documento, para buscar anclas. */
function* cadenas(doc: DocumentoLegal): Generator<string> {
  for (const s of doc.secciones) {
    for (const b of s.bloques) {
      if (b.tipo === "parrafo") yield b.texto
      else if (b.tipo === "lista") yield* b.items
      else if (b.tipo === "tabla") for (const fila of b.filas) yield* fila
    }
  }
}

function reemplazarEnBloques(bloques: BloqueLegal[], antes: string, despues: string): void {
  for (const b of bloques) {
    if (b.tipo === "parrafo") b.texto = b.texto.replace(antes, () => despues)
    else if (b.tipo === "lista") b.items = b.items.map((i) => i.replace(antes, () => despues))
    else if (b.tipo === "tabla") b.filas = b.filas.map((f) => f.map((c) => c.replace(antes, () => despues)))
  }
}

function aplicarEn(doc: DocumentoLegal, p: Parche, ctx: string): DocumentoLegal {
  const d: DocumentoLegal = structuredClone(doc)
  if (p.entradilla) d.entradilla = p.entradilla

  for (const [antes, despues] of p.reemplazos ?? []) {
    const n = [...cadenas(d)].reduce((acc, c) => acc + cuenta(c, antes), 0)
    if (n !== 1) throw new Error(`[legal/meta] ${ctx}: el ancla aparece ${n} veces (debe ser 1): «${antes.slice(0, 70)}…»`)
    for (const s of d.secciones) reemplazarEnBloques(s.bloques, antes, despues)
  }

  const seccion = (id: string): SeccionLegal => {
    const s = d.secciones.find((x) => x.id === id)
    if (!s) throw new Error(`[legal/meta] ${ctx}: no existe la sección «${id}»`)
    return s
  }
  for (const { seccion: id, titulo } of p.titulos ?? []) seccion(id).titulo = titulo
  for (const { seccion: id, fila } of p.filas ?? []) {
    const tabla = seccion(id).bloques.find((b) => b.tipo === "tabla")
    if (!tabla || tabla.tipo !== "tabla") throw new Error(`[legal/meta] ${ctx}: «${id}» no tiene tabla`)
    if (tabla.cabeceras.length !== fila.length) throw new Error(`[legal/meta] ${ctx}: fila con ${fila.length} celdas en una tabla de ${tabla.cabeceras.length}`)
    tabla.filas.push(fila)
  }
  for (const { seccion: id, bloques } of p.bloquesAlFinal ?? []) seccion(id).bloques.push(...bloques)
  for (const { id, por } of p.secciones ?? []) {
    const i = d.secciones.findIndex((x) => x.id === id)
    if (i < 0) throw new Error(`[legal/meta] ${ctx}: no existe la sección «${id}» para sustituir`)
    d.secciones.splice(i, 1, ...por)
  }
  return d
}

function aplicar(base: DocumentoLegalMultilingue, parches: Record<Locale, Parche>): DocumentoLegalMultilingue {
  const traducciones = {} as Record<Locale, DocumentoLegal>
  for (const loc of Object.keys(base.traducciones) as Locale[]) {
    traducciones[loc] = aplicarEn(base.traducciones[loc], parches[loc], `${base.id}/${loc}`)
  }
  return { ...base, actualizado: ACTUALIZADO_CON_META, traducciones }
}

const ENLACES_COOKIES: Record<Locale, { href: string; etiqueta: string }[]> = {
  es: [{ href: "/privacidad", etiqueta: "Política de privacidad" }],
  en: [{ href: "/privacidad", etiqueta: "Privacy policy" }],
  fr: [{ href: "/privacidad", etiqueta: "Politique de confidentialité" }],
  de: [{ href: "/privacidad", etiqueta: "Datenschutzerklärung" }],
}

/* ═══════════════════════════ COOKIES ═══════════════════════════ */

function parchesCookies(capi: boolean): Record<Locale, Parche> {
  const es: Parche = {
    entradilla:
      "Qué guarda este sitio en tu navegador: una cookie técnica propia (el idioma), el registro de tu elección sobre cookies, las de Calendly solo si abres su calendario en /meet y, solo si pulsas «Aceptar», las de marketing de Meta. Esta página explica exactamente cuáles, para qué, cuánto duran y cómo cambiar tu elección.",
    titulos: [{ seccion: "que-usamos", titulo: "Lo que guardamos sin pedirte permiso" }],
    filas: [
      {
        seccion: "que-usamos",
        fila: [
          "seda_consentimiento_cookies (almacenamiento local, no es una cookie)",
          "sedaprivatehomes.com (propio)",
          "Recordar si aceptas o rechazas las cookies de marketing, con la fecha y la versión de esta política, para no volver a preguntarte en cada página.",
          "24 meses; después volvemos a preguntarte.",
          "Técnica, necesaria para respetar tu elección.",
        ],
      },
    ],
    reemplazos: [
      [
        "Cookies publicitarias o de redes sociales: ninguna. No hay píxeles de Meta, Google Ads, LinkedIn ni TikTok.",
        "Cookies publicitarias o de redes sociales: solo las del píxel de Meta, y solo si pulsas «Aceptar» (ver «Cookies de marketing: el píxel de Meta»). No hay píxeles de Google Ads, LinkedIn ni TikTok.",
      ],
      [
        "Cookies de terceros: ninguna al visitar el sitio. Las únicas son las de Calendly, y solo si abres su calendario (ver «El calendario de Calendly en /meet»).",
        "Cookies de terceros sin tu permiso: ninguna. Las únicas son las de Meta, si las aceptas, y las de Calendly, si abres su calendario (ver «El calendario de Calendly en /meet»).",
      ],
      [
        "Tampoco usamos el almacenamiento local del navegador (localStorage o sessionStorage) para seguirte.",
        "Solo usamos el almacenamiento local del navegador (localStorage) para recordar tu elección sobre las cookies; no para seguirte.",
      ],
      [
        "La única excepción es el calendario de Calendly en /meet, y solo si lo abres.",
        "Las únicas excepciones son el calendario de Calendly en /meet, si lo abres, y el píxel de Meta, si pulsas «Aceptar».",
      ],
    ],
    secciones: [
      {
        id: "sin-banner",
        por: [
          {
            id: "tu-eleccion",
            titulo: "Tu elección sobre las cookies",
            bloques: [
              {
                tipo: "parrafo",
                texto:
                  "El artículo 22.2 de la LSSI exige consentimiento para las cookies que no sean estrictamente necesarias. Lo pedimos para las de marketing. La cookie del idioma y el registro de tu elección están exceptuados: sin ellos no podríamos recordar tu idioma ni respetar tu decisión.",
              },
              {
                tipo: "parrafo",
                texto:
                  "La primera vez que entras ves un aviso con tres botones del mismo tamaño y peso: «Aceptar», «Rechazar» y «Configurar». No hay nada marcado de antemano y hay una sola categoría opcional: marketing. Hasta que eliges, el píxel de Meta no se carga y tu navegador no se conecta con Meta.",
              },
              {
                tipo: "parrafo",
                texto: "No hay «muro de cookies»: si rechazas, o ignoras el aviso, puedes usar la web exactamente igual.",
              },
              {
                tipo: "parrafo",
                texto:
                  "Puedes cambiar o retirar tu elección cuando quieras con el enlace «Configurar cookies» del pie de cualquier página. Retirarla es tan fácil como darla: dejamos de enviar datos a Meta y borramos las cookies _fbp y _fbc de tu navegador. Retirar el consentimiento no afecta a lo tratado antes de retirarlo.",
              },
              {
                tipo: "parrafo",
                texto:
                  "Guardamos tu elección 24 meses, con su fecha y la versión de esta política. Pasado ese tiempo, o si esta política cambia, volvemos a preguntarte.",
              },
            ],
          },
          {
            id: "meta",
            titulo: "Cookies de marketing: el píxel de Meta",
            bloques: [
              {
                tipo: "parrafo",
                texto:
                  "Si pulsas «Aceptar», cargamos en tu navegador el píxel de Meta (Facebook e Instagram). Lo usamos para una sola cosa: medir nuestra publicidad en Meta, es decir, cuántas visitas a la web y cuántas solicitudes de propietarios —del formulario de la calculadora o del formulario del asistente de propietarios— llegan desde nuestros anuncios.",
              },
              {
                tipo: "tabla",
                cabeceras: ["Cookie", "Quién la instala", "Para qué", "Duración", "Tipo"],
                filas: [
                  ["_fbp", "sedaprivatehomes.com (propia; la fija el píxel de Meta)", "Identificar tu navegador para contar visitas y medir los anuncios.", "90 días.", "Marketing."],
                  ["_fbc", "sedaprivatehomes.com (propia; la fija el píxel de Meta)", "Guardar el identificador del anuncio de Meta en el que pulsaste, solo si llegas desde uno.", "90 días.", "Marketing."],
                  ["Cookies de facebook.com", "facebook.com (Meta Platforms Ireland Limited)", "Al recibir los datos del píxel, Meta puede leer o fijar cookies en su propio dominio, según tu navegador y si tienes sesión en Facebook o Instagram. Se rigen por la política de cookies de Meta.", "La define Meta.", "Marketing."],
                ],
              },
              {
                tipo: "parrafo",
                texto:
                  "Duraciones según la documentación de Meta; aún no las hemos medido en un navegador, a diferencia de las de Calendly. Con el píxel, Meta recibe la página que visitas, el identificador de esas cookies, tu dirección IP y datos de tu navegador (tipo, idioma) y, cuando envías el formulario de la calculadora o el del asistente de propietarios, un evento «Lead» que solo dice que se ha enviado un formulario. No enviamos tu nombre, tu correo ni tu teléfono —ni siquiera cifrados—, ni lo que escribes en el formulario o en el chat, ni las cifras de la estimación. El píxel está configurado sin coincidencia avanzada.",
              },
              ...(capi
                ? ([
                    {
                      tipo: "parrafo",
                      texto:
                        "Además, cuando envías el formulario de la calculadora o el del asistente de propietarios, nuestro servidor envía a Meta ese mismo evento «Lead» a través de su API de conversiones, con el mismo identificador de evento para que Meta lo cuente una sola vez. Lleva tu dirección IP, los datos de tu navegador y, si existen, los identificadores de las cookies anteriores; nunca tu nombre, tu correo ni tu teléfono. Solo lo hace si has aceptado las cookies de marketing.",
                    },
                  ] as BloqueLegal[])
                : []),
              {
                tipo: "parrafo",
                texto:
                  "Meta Platforms Ireland Limited (Dublín, Irlanda) recibe estos datos y puede transferirlos a Meta Platforms, Inc., en Estados Unidos. Meta también los usa para sus propios fines y responde de ese uso: consulta su política de datos y su política de cookies. La base jurídica es tu consentimiento (artículo 6.1.a del RGPD y artículo 22.2 de la LSSI). Más información, en nuestra política de privacidad.",
              },
            ],
            enlaces: ENLACES_COOKIES.es,
          },
        ],
      },
    ],
  }

  const en: Parche = {
    entradilla:
      "What this site stores in your browser: one first-party technical cookie (language), a record of your cookie choice, Calendly's only if you open its calendar on /meet and, only if you press “Accept”, Meta's marketing cookies. This page explains exactly which ones, what for, how long they last and how to change your choice.",
    titulos: [{ seccion: "que-usamos", titulo: "What we store without asking you" }],
    filas: [
      {
        seccion: "que-usamos",
        fila: [
          "seda_consentimiento_cookies (local storage, not a cookie)",
          "sedaprivatehomes.com (first party)",
          "Remember whether you accept or reject marketing cookies, with the date and the version of this policy, so we do not ask again on every page.",
          "24 months; after that we ask you again.",
          "Technical, needed to respect your choice.",
        ],
      },
    ],
    reemplazos: [
      [
        "Advertising or social network cookies: none. There are no Meta, Google Ads, LinkedIn or TikTok pixels.",
        "Advertising or social network cookies: only the Meta pixel's, and only if you press “Accept” (see “Marketing cookies: the Meta pixel”). There are no Google Ads, LinkedIn or TikTok pixels.",
      ],
      [
        "Third-party cookies: none when you visit the site. The only ones are Calendly's, and only if you open its calendar (see “The Calendly calendar on /meet”).",
        "Third-party cookies without your permission: none. The only ones are Meta's, if you accept them, and Calendly's, if you open its calendar (see “The Calendly calendar on /meet”).",
      ],
      [
        "We also do not use browser storage (localStorage or sessionStorage) to track you.",
        "We only use the browser's local storage (localStorage) to remember your cookie choice; not to track you.",
      ],
      [
        "The only exception is the Calendly calendar on /meet, and only if you open it.",
        "The only exceptions are the Calendly calendar on /meet, if you open it, and the Meta pixel, if you press “Accept”.",
      ],
    ],
    secciones: [
      {
        id: "sin-banner",
        por: [
          {
            id: "tu-eleccion",
            titulo: "Your cookie choice",
            bloques: [
              {
                tipo: "parrafo",
                texto:
                  "Article 22.2 of the Spanish LSSI requires consent for cookies that are not strictly necessary. We ask for it for marketing cookies. The language cookie and the record of your choice are exempt: without them we could not remember your language or respect your decision.",
              },
              {
                tipo: "parrafo",
                texto:
                  "The first time you visit you see a notice with three buttons of the same size and weight: “Accept”, “Reject” and “Configure”. Nothing is ticked in advance and there is a single optional category: marketing. Until you choose, the Meta pixel is not loaded and your browser does not connect to Meta.",
              },
              {
                tipo: "parrafo",
                texto: "There is no “cookie wall”: if you reject, or ignore the notice, you can use the site exactly the same.",
              },
              {
                tipo: "parrafo",
                texto:
                  "You can change or withdraw your choice at any time with the “Cookie settings” link in the footer of any page. Withdrawing is as easy as giving it: we stop sending data to Meta and delete the _fbp and _fbc cookies from your browser. Withdrawing consent does not affect processing carried out before you withdrew it.",
              },
              {
                tipo: "parrafo",
                texto:
                  "We keep your choice for 24 months, with its date and the version of this policy. After that, or if this policy changes, we ask you again.",
              },
            ],
          },
          {
            id: "meta",
            titulo: "Marketing cookies: the Meta pixel",
            bloques: [
              {
                tipo: "parrafo",
                texto:
                  "If you press “Accept”, we load the Meta pixel (Facebook and Instagram) in your browser. We use it for one thing only: measuring our advertising on Meta, that is, how many visits to the site and how many owner requests — from the calculator form or from the owners' assistant form — come from our ads.",
              },
              {
                tipo: "tabla",
                cabeceras: ["Cookie", "Who sets it", "What for", "Lifetime", "Type"],
                filas: [
                  ["_fbp", "sedaprivatehomes.com (first party; set by the Meta pixel)", "Identify your browser to count visits and measure ads.", "90 days.", "Marketing."],
                  ["_fbc", "sedaprivatehomes.com (first party; set by the Meta pixel)", "Store the ID of the Meta ad you clicked, only if you arrive from one.", "90 days.", "Marketing."],
                  ["facebook.com cookies", "facebook.com (Meta Platforms Ireland Limited)", "When it receives the pixel data, Meta may read or set cookies on its own domain, depending on your browser and whether you are signed in to Facebook or Instagram. They are governed by Meta's cookie policy.", "Defined by Meta.", "Marketing."],
                ],
              },
              {
                tipo: "parrafo",
                texto:
                  "Lifetimes as stated in Meta's documentation; we have not yet measured them in a browser, unlike Calendly's. With the pixel, Meta receives the page you visit, the identifier in those cookies, your IP address and browser data (type, language) and, when you submit the calculator form or the owners' assistant form, a “Lead” event that only says a form was submitted. We do not send your name, email or phone — not even hashed — nor what you type in the form or in the chat, nor the figures of the estimate. The pixel is configured without advanced matching.",
              },
              ...(capi
                ? ([
                    {
                      tipo: "parrafo",
                      texto:
                        "In addition, when you submit the calculator form or the owners' assistant form, our server sends Meta that same “Lead” event through its Conversions API, with the same event ID so that Meta counts it once. It carries your IP address, your browser data and, if they exist, the identifiers in the cookies above; never your name, email or phone. It only does so if you accepted marketing cookies.",
                    },
                  ] as BloqueLegal[])
                : []),
              {
                tipo: "parrafo",
                texto:
                  "Meta Platforms Ireland Limited (Dublin, Ireland) receives this data and may transfer it to Meta Platforms, Inc. in the United States. Meta also uses it for its own purposes and is responsible for that use: see its data policy and cookie policy. The legal basis is your consent (Article 6.1.a GDPR and Article 22.2 LSSI). More information in our privacy policy.",
              },
            ],
            enlaces: ENLACES_COOKIES.en,
          },
        ],
      },
    ],
  }

  const fr: Parche = {
    entradilla:
      "Ce que ce site conserve dans votre navigateur : un cookie technique propre (la langue), l'enregistrement de votre choix sur les cookies, ceux de Calendly uniquement si vous ouvrez son calendrier sur /meet et, uniquement si vous appuyez sur « Accepter », les cookies de marketing de Meta. Cette page explique précisément lesquels, pourquoi, combien de temps ils durent et comment modifier votre choix.",
    titulos: [{ seccion: "que-usamos", titulo: "Ce que nous conservons sans vous le demander" }],
    filas: [
      {
        seccion: "que-usamos",
        fila: [
          "seda_consentimiento_cookies (stockage local, ce n'est pas un cookie)",
          "sedaprivatehomes.com (interne)",
          "Mémoriser si vous acceptez ou refusez les cookies de marketing, avec la date et la version de cette politique, pour ne pas vous le redemander à chaque page.",
          "24 mois ; ensuite nous vous le redemandons.",
          "Technique, nécessaire pour respecter votre choix.",
        ],
      },
    ],
    reemplazos: [
      [
        "Cookies publicitaires ou de réseaux sociaux : aucun. Il n'y a pas de pixel Meta, Google Ads, LinkedIn ou TikTok.",
        "Cookies publicitaires ou de réseaux sociaux : uniquement ceux du pixel Meta, et seulement si vous appuyez sur « Accepter » (voir « Cookies de marketing : le pixel Meta »). Il n'y a pas de pixel Google Ads, LinkedIn ou TikTok.",
      ],
      [
        "Cookies tiers : aucun lorsque vous visitez le site. Les seuls sont ceux de Calendly, et uniquement si vous ouvrez son calendrier (voir « Le calendrier Calendly sur /meet »).",
        "Cookies tiers sans votre accord : aucun. Les seuls sont ceux de Meta, si vous les acceptez, et ceux de Calendly, si vous ouvrez son calendrier (voir « Le calendrier Calendly sur /meet »).",
      ],
      [
        "Nous n'utilisons pas non plus le stockage du navigateur (localStorage ou sessionStorage) pour vous suivre.",
        "Nous n'utilisons le stockage local du navigateur (localStorage) que pour mémoriser votre choix sur les cookies ; pas pour vous suivre.",
      ],
      [
        "La seule exception est le calendrier Calendly sur /meet, et uniquement si vous l'ouvrez.",
        "Les seules exceptions sont le calendrier Calendly sur /meet, si vous l'ouvrez, et le pixel Meta, si vous appuyez sur « Accepter ».",
      ],
    ],
    secciones: [
      {
        id: "sin-banner",
        por: [
          {
            id: "tu-eleccion",
            titulo: "Votre choix sur les cookies",
            bloques: [
              {
                tipo: "parrafo",
                texto:
                  "L'article 22.2 de la LSSI espagnole exige le consentement pour les cookies qui ne sont pas strictement nécessaires. Nous le demandons pour les cookies de marketing. Le cookie de langue et l'enregistrement de votre choix sont exemptés : sans eux, nous ne pourrions ni mémoriser votre langue ni respecter votre décision.",
              },
              {
                tipo: "parrafo",
                texto:
                  "La première fois que vous venez, vous voyez un bandeau avec trois boutons de même taille et de même poids : « Accepter », « Refuser » et « Configurer ». Rien n'est coché à l'avance et il n'y a qu'une seule catégorie facultative : le marketing. Tant que vous n'avez pas choisi, le pixel Meta n'est pas chargé et votre navigateur ne se connecte pas à Meta.",
              },
              {
                tipo: "parrafo",
                texto: "Il n'y a pas de « mur de cookies » : si vous refusez, ou ignorez le bandeau, vous utilisez le site exactement de la même façon.",
              },
              {
                tipo: "parrafo",
                texto:
                  "Vous pouvez modifier ou retirer votre choix à tout moment avec le lien « Configurer les cookies » en pied de n'importe quelle page. Le retirer est aussi simple que le donner : nous cessons d'envoyer des données à Meta et supprimons les cookies _fbp et _fbc de votre navigateur. Le retrait du consentement n'affecte pas les traitements effectués avant.",
              },
              {
                tipo: "parrafo",
                texto:
                  "Nous conservons votre choix 24 mois, avec sa date et la version de cette politique. Passé ce délai, ou si cette politique change, nous vous le redemandons.",
              },
            ],
          },
          {
            id: "meta",
            titulo: "Cookies de marketing : le pixel Meta",
            bloques: [
              {
                tipo: "parrafo",
                texto:
                  "Si vous appuyez sur « Accepter », nous chargeons le pixel Meta (Facebook et Instagram) dans votre navigateur. Nous l'utilisons pour une seule chose : mesurer notre publicité sur Meta, c'est-à-dire combien de visites du site et combien de demandes de propriétaires — envoyées depuis le formulaire du calculateur ou depuis celui de l'assistant pour propriétaires — proviennent de nos annonces.",
              },
              {
                tipo: "tabla",
                cabeceras: ["Cookie", "Qui le dépose", "Pour quoi faire", "Durée", "Type"],
                filas: [
                  ["_fbp", "sedaprivatehomes.com (interne ; déposé par le pixel Meta)", "Identifier votre navigateur pour compter les visites et mesurer les annonces.", "90 jours.", "Marketing."],
                  ["_fbc", "sedaprivatehomes.com (interne ; déposé par le pixel Meta)", "Conserver l'identifiant de l'annonce Meta sur laquelle vous avez cliqué, uniquement si vous en venez.", "90 jours.", "Marketing."],
                  ["Cookies de facebook.com", "facebook.com (Meta Platforms Ireland Limited)", "En recevant les données du pixel, Meta peut lire ou déposer des cookies sur son propre domaine, selon votre navigateur et si vous êtes connecté à Facebook ou Instagram. Ils relèvent de la politique de cookies de Meta.", "Définie par Meta.", "Marketing."],
                ],
              },
              {
                tipo: "parrafo",
                texto:
                  "Durées selon la documentation de Meta ; nous ne les avons pas encore mesurées dans un navigateur, contrairement à celles de Calendly. Avec le pixel, Meta reçoit la page que vous visitez, l'identifiant de ces cookies, votre adresse IP et des données de votre navigateur (type, langue) et, lorsque vous envoyez le formulaire du calculateur ou celui de l'assistant pour propriétaires, un événement « Lead » qui indique seulement qu'un formulaire a été envoyé. Nous n'envoyons ni votre nom, ni votre courriel, ni votre téléphone — pas même chiffrés —, ni ce que vous saisissez dans le formulaire ou dans le chat, ni les chiffres de l'estimation. Le pixel est configuré sans appariement avancé.",
              },
              ...(capi
                ? ([
                    {
                      tipo: "parrafo",
                      texto:
                        "En outre, lorsque vous envoyez le formulaire du calculateur ou celui de l'assistant pour propriétaires, notre serveur envoie à Meta ce même événement « Lead » via son API de conversions, avec le même identifiant d'événement pour que Meta ne le compte qu'une fois. Il contient votre adresse IP, les données de votre navigateur et, s'ils existent, les identifiants des cookies ci-dessus ; jamais votre nom, votre courriel ni votre téléphone. Il ne le fait que si vous avez accepté les cookies de marketing.",
                    },
                  ] as BloqueLegal[])
                : []),
              {
                tipo: "parrafo",
                texto:
                  "Meta Platforms Ireland Limited (Dublin, Irlande) reçoit ces données et peut les transférer à Meta Platforms, Inc., aux États-Unis. Meta les utilise aussi pour ses propres finalités et répond de cet usage : consultez sa politique de données et sa politique en matière de cookies. La base juridique est votre consentement (article 6.1.a du RGPD et article 22.2 de la LSSI). Plus d'informations dans notre politique de confidentialité.",
              },
            ],
            enlaces: ENLACES_COOKIES.fr,
          },
        ],
      },
    ],
  }

  const de: Parche = {
    entradilla:
      "Was diese Website in Ihrem Browser speichert: ein eigenes technisches Cookie (die Sprache), die Aufzeichnung Ihrer Cookie-Auswahl, die von Calendly nur, wenn Sie dessen Kalender auf /meet öffnen, und, nur wenn Sie auf „Akzeptieren“ klicken, die Marketing-Cookies von Meta. Diese Seite erklärt genau welche, wofür, wie lange sie gelten und wie Sie Ihre Auswahl ändern.",
    titulos: [{ seccion: "que-usamos", titulo: "Was wir ohne Ihre Zustimmung speichern" }],
    filas: [
      {
        seccion: "que-usamos",
        fila: [
          "seda_consentimiento_cookies (lokaler Speicher, kein Cookie)",
          "sedaprivatehomes.com (eigenes)",
          "Merken, ob Sie die Marketing-Cookies akzeptieren oder ablehnen, mit Datum und Version dieser Richtlinie, damit wir Sie nicht auf jeder Seite erneut fragen.",
          "24 Monate; danach fragen wir erneut.",
          "Technisch, erforderlich, um Ihre Auswahl zu respektieren.",
        ],
      },
    ],
    reemplazos: [
      [
        "Werbe- oder Social-Media-Cookies: keine. Es gibt keine Pixel von Meta, Google Ads, LinkedIn oder TikTok.",
        "Werbe- oder Social-Media-Cookies: nur die des Meta-Pixels, und nur, wenn Sie auf „Akzeptieren“ klicken (siehe „Marketing-Cookies: das Meta-Pixel“). Es gibt keine Pixel von Google Ads, LinkedIn oder TikTok.",
      ],
      [
        "Cookies Dritter: keine beim Besuch der Website. Die einzigen sind die von Calendly, und nur, wenn Sie dessen Kalender öffnen (siehe „Der Calendly-Kalender auf /meet“).",
        "Cookies Dritter ohne Ihre Zustimmung: keine. Die einzigen sind die von Meta, wenn Sie sie akzeptieren, und die von Calendly, wenn Sie dessen Kalender öffnen (siehe „Der Calendly-Kalender auf /meet“).",
      ],
      [
        "Auch den Browser-Speicher (localStorage oder sessionStorage) nutzen wir nicht, um Sie zu verfolgen.",
        "Den lokalen Speicher des Browsers (localStorage) nutzen wir nur, um Ihre Cookie-Auswahl zu merken; nicht, um Sie zu verfolgen.",
      ],
      [
        "Die einzige Ausnahme ist der Calendly-Kalender auf /meet, und nur, wenn Sie ihn öffnen.",
        "Die einzigen Ausnahmen sind der Calendly-Kalender auf /meet, wenn Sie ihn öffnen, und das Meta-Pixel, wenn Sie auf „Akzeptieren“ klicken.",
      ],
    ],
    secciones: [
      {
        id: "sin-banner",
        por: [
          {
            id: "tu-eleccion",
            titulo: "Ihre Cookie-Auswahl",
            bloques: [
              {
                tipo: "parrafo",
                texto:
                  "Artikel 22.2 des spanischen LSSI verlangt eine Einwilligung für Cookies, die nicht unbedingt erforderlich sind. Wir holen sie für die Marketing-Cookies ein. Das Sprach-Cookie und die Aufzeichnung Ihrer Auswahl sind ausgenommen: Ohne sie könnten wir weder Ihre Sprache merken noch Ihre Entscheidung respektieren.",
              },
              {
                tipo: "parrafo",
                texto:
                  "Beim ersten Besuch sehen Sie einen Hinweis mit drei gleich großen und gleich gewichteten Schaltflächen: „Akzeptieren“, „Ablehnen“ und „Konfigurieren“. Nichts ist vorab angekreuzt, und es gibt nur eine optionale Kategorie: Marketing. Bis Sie wählen, wird das Meta-Pixel nicht geladen, und Ihr Browser verbindet sich nicht mit Meta.",
              },
              {
                tipo: "parrafo",
                texto: "Es gibt keine „Cookie-Wall“: Wenn Sie ablehnen oder den Hinweis ignorieren, nutzen Sie die Website genau gleich.",
              },
              {
                tipo: "parrafo",
                texto:
                  "Sie können Ihre Auswahl jederzeit über den Link „Cookies konfigurieren“ in der Fußzeile jeder Seite ändern oder widerrufen. Der Widerruf ist so einfach wie die Erteilung: Wir senden keine Daten mehr an Meta und löschen die Cookies _fbp und _fbc aus Ihrem Browser. Der Widerruf berührt nicht die Verarbeitung vor dem Widerruf.",
              },
              {
                tipo: "parrafo",
                texto:
                  "Wir speichern Ihre Auswahl 24 Monate lang, mit Datum und Version dieser Richtlinie. Danach, oder wenn sich diese Richtlinie ändert, fragen wir erneut.",
              },
            ],
          },
          {
            id: "meta",
            titulo: "Marketing-Cookies: das Meta-Pixel",
            bloques: [
              {
                tipo: "parrafo",
                texto:
                  "Wenn Sie auf „Akzeptieren“ klicken, laden wir das Meta-Pixel (Facebook und Instagram) in Ihrem Browser. Wir nutzen es für genau einen Zweck: unsere Werbung auf Meta zu messen, also wie viele Besuche der Website und wie viele Anfragen von Eigentümern — über das Formular des Rechners oder über das Formular des Eigentümer-Assistenten — aus unseren Anzeigen stammen.",
              },
              {
                tipo: "tabla",
                cabeceras: ["Cookie", "Wer es setzt", "Wofür", "Dauer", "Art"],
                filas: [
                  ["_fbp", "sedaprivatehomes.com (eigenes; gesetzt vom Meta-Pixel)", "Ihren Browser kennzeichnen, um Besuche zu zählen und Anzeigen zu messen.", "90 Tage.", "Marketing."],
                  ["_fbc", "sedaprivatehomes.com (eigenes; gesetzt vom Meta-Pixel)", "Die Kennung der Meta-Anzeige speichern, auf die Sie geklickt haben, nur wenn Sie von einer kommen.", "90 Tage.", "Marketing."],
                  ["Cookies von facebook.com", "facebook.com (Meta Platforms Ireland Limited)", "Beim Empfang der Pixel-Daten kann Meta auf seiner eigenen Domain Cookies lesen oder setzen, je nach Browser und danach, ob Sie bei Facebook oder Instagram angemeldet sind. Es gilt die Cookie-Richtlinie von Meta.", "Von Meta festgelegt.", "Marketing."],
                ],
              },
              {
                tipo: "parrafo",
                texto:
                  "Laufzeiten nach der Dokumentation von Meta; wir haben sie noch nicht in einem Browser gemessen, anders als die von Calendly. Mit dem Pixel erhält Meta die besuchte Seite, die Kennung dieser Cookies, Ihre IP-Adresse und Browserdaten (Typ, Sprache) und, wenn Sie das Formular des Rechners oder das des Eigentümer-Assistenten absenden, ein „Lead“-Ereignis, das nur besagt, dass ein Formular abgesendet wurde. Wir senden weder Ihren Namen noch Ihre E-Mail noch Ihre Telefonnummer — auch nicht gehasht —, nicht das, was Sie im Formular oder im Chat eingeben, und nicht die Zahlen der Schätzung. Das Pixel ist ohne erweiterten Abgleich konfiguriert.",
              },
              ...(capi
                ? ([
                    {
                      tipo: "parrafo",
                      texto:
                        "Zusätzlich sendet unser Server, wenn Sie das Formular des Rechners oder das des Eigentümer-Assistenten absenden, dasselbe „Lead“-Ereignis über die Conversions API an Meta, mit derselben Ereignis-ID, damit Meta es nur einmal zählt. Es enthält Ihre IP-Adresse, Ihre Browserdaten und, falls vorhanden, die Kennungen der obigen Cookies; niemals Ihren Namen, Ihre E-Mail oder Ihre Telefonnummer. Das geschieht nur, wenn Sie die Marketing-Cookies akzeptiert haben.",
                    },
                  ] as BloqueLegal[])
                : []),
              {
                tipo: "parrafo",
                texto:
                  "Meta Platforms Ireland Limited (Dublin, Irland) erhält diese Daten und kann sie an Meta Platforms, Inc. in den Vereinigten Staaten übermitteln. Meta nutzt sie auch für eigene Zwecke und verantwortet diese Nutzung: siehe deren Datenrichtlinie und Cookie-Richtlinie. Rechtsgrundlage ist Ihre Einwilligung (Artikel 6 Abs. 1 Buchst. a DSGVO und Artikel 22.2 LSSI). Weitere Informationen in unserer Datenschutzerklärung.",
              },
            ],
            enlaces: ENLACES_COOKIES.de,
          },
        ],
      },
    ],
  }

  return { es, en, fr, de }
}

/* ═══════════════════════════ PRIVACIDAD ═══════════════════════════ */

function parchesPrivacidad(capi: boolean): Record<Locale, Parche> {
  const apiEs = capi ? " y, si está activada, la API de conversiones" : ""
  const es: Parche = {
    reemplazos: [
      [
        "No recogemos datos con fines analíticos, publicitarios ni de perfilado. Este sitio no tiene ninguna herramienta de medición —ni Google Analytics, ni Vercel Analytics, ni equivalentes— ni píxeles de redes sociales. Las únicas cookies de terceros son las que pone Calendly si",
        "No elaboramos perfiles. Este sitio no tiene ninguna herramienta de analítica —ni Google Analytics, ni Vercel Analytics, ni equivalentes— y su único píxel es el de Meta, que mide nuestros anuncios y solo se carga si pulsas «Aceptar» en el aviso de cookies. Las demás cookies de terceros son las que pone Calendly si",
      ],
      [
        "No hay más destinatarios.",
        "Si aceptas las cookies de marketing, los datos del píxel los recibe además Meta, como se explica arriba. No hay más destinatarios.",
      ],
      [
        "Vercel, Resend, Supabase, Upstash y Calendly son sociedades estadounidenses: el tratamiento implica una transferencia internacional de datos fuera del Espacio Económico Europeo.",
        "Vercel, Resend, Supabase, Upstash y Calendly son sociedades estadounidenses y Meta Platforms Ireland Limited puede transferir los datos del píxel a su matriz en Estados Unidos: el tratamiento implica una transferencia internacional de datos fuera del Espacio Económico Europeo. Meta indica en su política de datos que ampara esas transferencias en la decisión de adecuación del Marco de Privacidad de Datos UE–EE. UU. y en cláusulas contractuales tipo.",
      ],
    ],
    filas: [
      {
        seccion: "datos",
        fila: [
          "Cookies de marketing (solo si pulsas «Aceptar» en el aviso de cookies)",
          "Identificadores de las cookies de Meta (_fbp y _fbc), páginas que visitas, dirección IP y datos de tu navegador; y, si envías el formulario de la calculadora o el del asistente de propietarios, el aviso de que lo has enviado (sin tu nombre, correo ni teléfono). Detalle en la política de cookies.",
        ],
      },
      {
        seccion: "finalidad",
        fila: [
          `Medir cuántas visitas y cuántas solicitudes de la calculadora y del asistente de propietarios llegan desde nuestros anuncios en Meta (píxel de Meta${apiEs}).`,
          "Artículo 6.1.a del RGPD y artículo 22.2 de la LSSI: tu consentimiento, que das pulsando «Aceptar» en el aviso de cookies. Guardamos tu elección 24 meses, con su fecha y la versión de esta política. Puedes retirarlo cuando quieras con «Configurar cookies», en el pie de cualquier página.",
        ],
      },
      {
        seccion: "destinatarios",
        fila: [
          "Meta Platforms Ireland Limited",
          "Recibe los datos del píxel" + apiEs + " cuando aceptas las cookies de marketing y los usa para darnos estadísticas de nuestros anuncios y para sus propios fines. SEDA y Meta decidimos conjuntamente cómo se recogen y se transmiten esos datos (artículo 26 del RGPD); del uso posterior responde Meta, ante quien también puedes ejercer tus derechos según su política de datos.",
          "Irlanda, con transferencia a Meta Platforms, Inc. en Estados Unidos.",
        ],
      },
    ],
    bloquesAlFinal: [
      {
        seccion: "conservacion",
        bloques: [
          {
            tipo: "parrafo",
            texto:
              "Tu elección sobre las cookies se guarda en tu navegador durante 24 meses. Las cookies _fbp y _fbc duran 90 días. Los datos que recibe Meta los conserva Meta según su propia política, que no decidimos nosotros.",
          },
        ],
      },
    ],
  }

  const apiEn = capi ? " and, where enabled, the Conversions API" : ""
  const en: Parche = {
    reemplazos: [
      [
        "We collect no data for analytics, advertising or profiling. This site has no measurement tool at all — no Google Analytics, no Vercel Analytics, nothing equivalent — and no social network pixels. The only third-party cookies are the ones Calendly sets if",
        "We build no profiles. This site has no analytics tool — no Google Analytics, no Vercel Analytics, nothing equivalent — and its only pixel is Meta's, which measures our ads and loads only if you press “Accept” in the cookie notice. The other third-party cookies are the ones Calendly sets if",
      ],
      [
        "There are no other recipients.",
        "If you accept marketing cookies, Meta also receives the pixel data, as explained above. There are no other recipients.",
      ],
      [
        "Vercel, Resend, Supabase, Upstash and Calendly are US companies, so the processing involves an international transfer of data outside the European Economic Area.",
        "Vercel, Resend, Supabase, Upstash and Calendly are US companies, and Meta Platforms Ireland Limited may transfer the pixel data to its parent in the United States, so the processing involves an international transfer of data outside the European Economic Area. Meta states in its data policy that it relies on the adequacy decision for the EU–US Data Privacy Framework and on standard contractual clauses for those transfers.",
      ],
    ],
    filas: [
      {
        seccion: "datos",
        fila: [
          "Marketing cookies (only if you press “Accept” in the cookie notice)",
          "Identifiers in Meta's cookies (_fbp and _fbc), pages you visit, IP address and browser data; and, if you submit the calculator form or the owners' assistant form, the notice that you submitted it (without your name, email or phone). Details in the cookie policy.",
        ],
      },
      {
        seccion: "finalidad",
        fila: [
          `Measure how many visits and how many calculator and owners' assistant submissions come from our ads on Meta (Meta pixel${apiEn}).`,
          "Article 6.1.a GDPR and Article 22.2 LSSI: your consent, which you give by pressing “Accept” in the cookie notice. We keep your choice for 24 months, with its date and the version of this policy. You can withdraw it at any time with “Cookie settings” in the footer of any page.",
        ],
      },
      {
        seccion: "destinatarios",
        fila: [
          "Meta Platforms Ireland Limited",
          "Receives the pixel data" + apiEn + " when you accept marketing cookies and uses it to give us statistics on our ads and for its own purposes. SEDA and Meta jointly decide how that data is collected and transmitted (Article 26 GDPR); Meta is responsible for the later use, and you can also exercise your rights against it under its data policy.",
          "Ireland, with transfer to Meta Platforms, Inc. in the United States.",
        ],
      },
    ],
    bloquesAlFinal: [
      {
        seccion: "conservacion",
        bloques: [
          {
            tipo: "parrafo",
            texto:
              "Your cookie choice is kept in your browser for 24 months. The _fbp and _fbc cookies last 90 days. The data Meta receives is kept by Meta under its own policy, which we do not decide.",
          },
        ],
      },
    ],
  }

  const apiFr = capi ? " et, si elle est activée, l'API de conversions" : ""
  const fr: Parche = {
    reemplazos: [
      [
        "Nous ne recueillons aucune donnée à des fins analytiques, publicitaires ou de profilage. Ce site n'a aucun outil de mesure — ni Google Analytics, ni Vercel Analytics, ni équivalent — ni aucun pixel de réseau social. Les seuls cookies tiers sont ceux que dépose Calendly si",
        "Nous n'établissons aucun profil. Ce site n'a aucun outil d'analyse d'audience — ni Google Analytics, ni Vercel Analytics, ni équivalent — et son seul pixel est celui de Meta, qui mesure nos annonces et ne se charge que si vous appuyez sur « Accepter » dans le bandeau de cookies. Les autres cookies tiers sont ceux que dépose Calendly si",
      ],
      [
        "Il n'y a pas d'autres destinataires.",
        "Si vous acceptez les cookies de marketing, Meta reçoit en outre les données du pixel, comme expliqué ci-dessus. Il n'y a pas d'autres destinataires.",
      ],
      [
        "Vercel, Resend, Supabase, Upstash et Calendly sont des sociétés américaines : le traitement implique un transfert international de données hors de l'Espace économique européen.",
        "Vercel, Resend, Supabase, Upstash et Calendly sont des sociétés américaines et Meta Platforms Ireland Limited peut transférer les données du pixel à sa maison mère aux États-Unis : le traitement implique un transfert international de données hors de l'Espace économique européen. Meta indique dans sa politique de données qu'elle fonde ces transferts sur la décision d'adéquation relative au Cadre de protection des données UE–États-Unis et sur des clauses contractuelles types.",
      ],
    ],
    filas: [
      {
        seccion: "datos",
        fila: [
          "Cookies de marketing (uniquement si vous appuyez sur « Accepter » dans le bandeau de cookies)",
          "Identifiants des cookies de Meta (_fbp et _fbc), pages que vous visitez, adresse IP et données de votre navigateur ; et, si vous envoyez le formulaire du calculateur ou celui de l'assistant pour propriétaires, l'information que vous l'avez envoyé (sans votre nom, courriel ni téléphone). Détail dans la politique de cookies.",
        ],
      },
      {
        seccion: "finalidad",
        fila: [
          `Mesurer combien de visites et combien d'envois du calculateur et de l'assistant pour propriétaires proviennent de nos annonces sur Meta (pixel Meta${apiFr}).`,
          "Article 6.1.a du RGPD et article 22.2 de la LSSI : votre consentement, que vous donnez en appuyant sur « Accepter » dans le bandeau de cookies. Nous conservons votre choix 24 mois, avec sa date et la version de cette politique. Vous pouvez le retirer à tout moment avec « Configurer les cookies », en pied de n'importe quelle page.",
        ],
      },
      {
        seccion: "destinatarios",
        fila: [
          "Meta Platforms Ireland Limited",
          "Reçoit les données du pixel" + apiFr + " lorsque vous acceptez les cookies de marketing et les utilise pour nous fournir des statistiques sur nos annonces et pour ses propres finalités. SEDA et Meta décidons conjointement de la manière dont ces données sont collectées et transmises (article 26 du RGPD) ; Meta répond de l'usage ultérieur, et vous pouvez aussi exercer vos droits auprès d'elle selon sa politique de données.",
          "Irlande, avec transfert à Meta Platforms, Inc. aux États-Unis.",
        ],
      },
    ],
    bloquesAlFinal: [
      {
        seccion: "conservacion",
        bloques: [
          {
            tipo: "parrafo",
            texto:
              "Votre choix sur les cookies est conservé dans votre navigateur pendant 24 mois. Les cookies _fbp et _fbc durent 90 jours. Les données que reçoit Meta sont conservées par Meta selon sa propre politique, que nous ne fixons pas.",
          },
        ],
      },
    ],
  }

  const apiDe = capi ? " und, sofern aktiviert, der Conversions API" : ""
  const de: Parche = {
    reemplazos: [
      [
        "Wir erheben keine Daten zu Analyse-, Werbe- oder Profiling-Zwecken. Diese Website hat kein einziges Messwerkzeug — weder Google Analytics noch Vercel Analytics noch Vergleichbares — und keine Social-Media-Pixel. Die einzigen Cookies Dritter setzt Calendly, wenn",
        "Wir erstellen keine Profile. Diese Website hat kein Analysewerkzeug — weder Google Analytics noch Vercel Analytics noch Vergleichbares — und ihr einziges Pixel ist das von Meta, das unsere Anzeigen misst und nur geladen wird, wenn Sie im Cookie-Hinweis auf „Akzeptieren“ klicken. Die übrigen Cookies Dritter setzt Calendly, wenn",
      ],
      [
        "Weitere Empfänger gibt es nicht.",
        "Wenn Sie die Marketing-Cookies akzeptieren, erhält zusätzlich Meta die Pixel-Daten, wie oben erläutert. Weitere Empfänger gibt es nicht.",
      ],
      [
        "Vercel, Resend, Supabase, Upstash und Calendly sind US-amerikanische Unternehmen: Die Verarbeitung umfasst eine internationale Datenübermittlung außerhalb des Europäischen Wirtschaftsraums.",
        "Vercel, Resend, Supabase, Upstash und Calendly sind US-amerikanische Unternehmen, und Meta Platforms Ireland Limited kann die Pixel-Daten an die Muttergesellschaft in den Vereinigten Staaten übermitteln: Die Verarbeitung umfasst eine internationale Datenübermittlung außerhalb des Europäischen Wirtschaftsraums. Meta gibt in seiner Datenrichtlinie an, diese Übermittlungen auf den Angemessenheitsbeschluss zum EU-US-Datenschutzrahmen und auf Standardvertragsklauseln zu stützen.",
      ],
    ],
    filas: [
      {
        seccion: "datos",
        fila: [
          "Marketing-Cookies (nur wenn Sie im Cookie-Hinweis auf „Akzeptieren“ klicken)",
          "Kennungen der Meta-Cookies (_fbp und _fbc), besuchte Seiten, IP-Adresse und Browserdaten; und, wenn Sie das Formular des Rechners oder das des Eigentümer-Assistenten absenden, die Information, dass Sie es abgesendet haben (ohne Ihren Namen, Ihre E-Mail oder Telefonnummer). Einzelheiten in der Cookie-Richtlinie.",
        ],
      },
      {
        seccion: "finalidad",
        fila: [
          `Messen, wie viele Besuche und wie viele Absendungen des Rechners und des Eigentümer-Assistenten aus unseren Anzeigen auf Meta stammen (Meta-Pixel${apiDe}).`,
          "Artikel 6 Abs. 1 Buchst. a DSGVO und Artikel 22.2 LSSI: Ihre Einwilligung, die Sie durch Klick auf „Akzeptieren“ im Cookie-Hinweis erteilen. Wir speichern Ihre Auswahl 24 Monate lang, mit Datum und Version dieser Richtlinie. Sie können sie jederzeit über „Cookies konfigurieren“ in der Fußzeile jeder Seite widerrufen.",
        ],
      },
      {
        seccion: "destinatarios",
        fila: [
          "Meta Platforms Ireland Limited",
          "Erhält die Pixel-Daten" + apiDe + ", wenn Sie die Marketing-Cookies akzeptieren, und nutzt sie, um uns Statistiken zu unseren Anzeigen zu liefern und für eigene Zwecke. SEDA und Meta entscheiden gemeinsam darüber, wie diese Daten erhoben und übermittelt werden (Artikel 26 DSGVO); für die spätere Nutzung ist Meta verantwortlich, und Sie können Ihre Rechte nach deren Datenrichtlinie auch dort ausüben.",
          "Irland, mit Übermittlung an Meta Platforms, Inc. in den Vereinigten Staaten.",
        ],
      },
    ],
    bloquesAlFinal: [
      {
        seccion: "conservacion",
        bloques: [
          {
            tipo: "parrafo",
            texto:
              "Ihre Cookie-Auswahl wird 24 Monate lang in Ihrem Browser gespeichert. Die Cookies _fbp und _fbc gelten 90 Tage. Die Daten, die Meta erhält, speichert Meta nach seiner eigenen Richtlinie, über die wir nicht entscheiden.",
          },
        ],
      },
    ],
  }

  return { es, en, fr, de }
}

/* ═══════════════════════════ Selección por interruptor ═══════════════════════════ */

type Env = Record<string, string | undefined>

// Una variante por (capi sí/no), construida una vez: los parches son datos puros.
const cache = new Map<string, DocumentoLegalMultilingue>()
const una = (clave: string, crear: () => DocumentoLegalMultilingue) => {
  let d = cache.get(clave)
  if (!d) cache.set(clave, (d = crear()))
  return d
}

/** Política de cookies vigente: la actual con todo apagado; con Meta, la variante que describe lo que de verdad ocurre. */
export function cookiesVigente(env: Env = process.env): DocumentoLegalMultilingue {
  if (!metaPixelActivo(env)) return COOKIES
  const capi = metaCapiActivo(env)
  return una(`cookies:${capi}`, () => aplicar(COOKIES, parchesCookies(capi)))
}

/** Política de privacidad vigente, igual que `cookiesVigente`. */
export function privacidadVigente(env: Env = process.env): DocumentoLegalMultilingue {
  if (!metaPixelActivo(env)) return PRIVACIDAD
  const capi = metaCapiActivo(env)
  return una(`privacidad:${capi}`, () => aplicar(PRIVACIDAD, parchesPrivacidad(capi)))
}

/** Las dos variantes con Meta, para los tests (comprueban las anclas aunque el flag esté apagado). */
export function variantesConMeta(capi: boolean) {
  return {
    cookies: aplicar(COOKIES, parchesCookies(capi)),
    privacidad: aplicar(PRIVACIDAD, parchesPrivacidad(capi)),
  }
}
