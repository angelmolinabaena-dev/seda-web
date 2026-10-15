import type { DocumentoLegalMultilingue } from "./types"

/*
  Política de cookies — artículo 22.2 de la LSSI.

  Este texto se escribió DESPUÉS de comprobar qué guarda el sitio, no antes.
  Lo comprobado el 2026-08-06 sobre esta rama:

    · Una sola cookie: `NEXT_LOCALE`. La instala next-intl, cuya
      configuración por defecto (`localeCookie`) se resuelve en
      `node_modules/next-intl/.../routing/config.js` a
      `{ name: "NEXT_LOCALE", sameSite: "lax" }` — sin `maxAge`, es decir,
      cookie de SESIÓN. `routing.ts` no la sobrescribe.
      Cuándo se instala: `middleware/syncCookie.js` la escribe si ya existe
      con otro valor, o si no existe y el idioma resuelto no coincide con el
      que negocia el `Accept-Language` del navegador — en la práctica, al
      usar el selector de idioma.
    · Cero herramientas de analítica y cero píxeles: búsqueda de `analytics`,
      `gtag`, `googletagmanager`, `fbq`, `hotjar`, `clarity`, `posthog`,
      `plausible` y `SpeedInsights` en todo el árbol — ninguna coincidencia.
      `package.json` tampoco tiene `@vercel/analytics`.
    · Cero uso de `localStorage` / `sessionStorage`: sin coincidencias.
      (`components/theme-provider.tsx` envuelve next-themes, que sí usaría
      localStorage, pero NO está montado en ningún layout ni página.)
    · Los cinco distintivos de premios de `/nosotros` ya no vienen de un
      tercero: viven en `public/images/nosotros/` (`NosotrosContent.tsx`,
      constante `AWARDS`) y la CSP (`vercel.json`) no admite orígenes
      externos en `img-src`.
    · Las tipografías se sirven desde el propio dominio: `app/layout.tsx`
      usa `next/font/google`, que las descarga en tiempo de build y las
      auto-aloja — el navegador no contacta con Google Fonts.
    · Calendly (15-oct-2026): `/meet` muestra su calendario tras una fachada
      (`app/[locale]/meet/CalendlyFachada.tsx`): el iframe no se monta hasta
      que el visitante pulsa «Ver calendario». Al cargarse, calendly.com fija
      `_calendly_session` (21 días), `__cf_bm` (30 min) y `_cfuvid` (sesión),
      medido con `curl -D -` sobre la URL del iframe. Sin `hide_gdpr_banner`:
      Calendly muestra su propio aviso de cookies.

  Si cualquiera de estos hechos cambia, este texto cambia con él, y si
  aparece analítica hay que añadir además un banner de consentimiento.
*/

export const COOKIES: DocumentoLegalMultilingue = {
  id: "cookies",
  ruta: "/cookies",
  actualizado: "2026-10-15",
  traducciones: {
    es: {
      titulo: "Política de cookies",
      entradilla:
        "Qué guarda este sitio en tu navegador. Es poco: una cookie propia, para recordar el idioma, y las de Calendly solo si abres su calendario en /meet. Esta página explica exactamente cuáles, por qué, y qué no hacemos.",
      secciones: [
        {
          id: "que-usamos",
          titulo: "La única cookie que usamos",
          bloques: [
            {
              tipo: "tabla",
              cabeceras: ["Cookie", "Quién la instala", "Para qué", "Duración", "Tipo"],
              filas: [
                [
                  "NEXT_LOCALE",
                  "sedaprivatehomes.com (propia)",
                  "Recordar el idioma que eliges en el selector, para que las páginas siguientes se muestren en ese idioma.",
                  "De sesión: se borra al cerrar el navegador.",
                  "Técnica, de personalización de la interfaz.",
                ],
              ],
            },
            {
              tipo: "parrafo",
              texto:
                "Se instala cuando el idioma con el que se sirve el sitio no coincide con el que declara tu navegador: en la práctica, cuando cambias de idioma con el selector. No contiene identificadores, ni tu dirección IP, ni nada que permita reconocerte entre visitas: solo dos letras (es, en, fr o de).",
            },
            {
              tipo: "parrafo",
              texto: "El responsable de este sitio es {titular}.",
            },
          ],
        },
        {
          id: "lo-que-no",
          titulo: "Lo que no usamos",
          bloques: [
            {
              tipo: "lista",
              items: [
                "Cookies de analítica: ninguna. Este sitio no tiene Google Analytics, ni Vercel Analytics, ni ninguna otra herramienta de medición de audiencia.",
                "Cookies publicitarias o de redes sociales: ninguna. No hay píxeles de Meta, Google Ads, LinkedIn ni TikTok.",
                "Cookies de terceros: ninguna al visitar el sitio. Las únicas son las de Calendly, y solo si abres su calendario (ver «El calendario de Calendly en /meet»).",
                "Tampoco usamos el almacenamiento local del navegador (localStorage o sessionStorage) para seguirte.",
              ],
            },
            {
              tipo: "parrafo",
              texto:
                "Las tipografías se sirven desde nuestro propio dominio: al abrir estas páginas tu navegador no se conecta a Google Fonts.",
            },
          ],
        },
        {
          id: "sin-banner",
          titulo: "Por eso no verás un banner",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "El artículo 22.2 de la LSSI exige consentimiento para las cookies que no sean estrictamente necesarias. Una cookie que se limita a recordar el idioma que tú mismo has elegido está entre las exceptuadas —la Guía sobre el uso de cookies de la Agencia Española de Protección de Datos las llama cookies de personalización de la interfaz—, de modo que pedirte consentimiento para ella sería pedirlo sin objeto.",
            },
            {
              tipo: "parrafo",
              texto:
                "Las cookies de Calendly no se instalan al visitar el sitio: solo cuando, en /meet, pulsas «Ver calendario» después de leer el aviso que lo explica, y entonces es el propio Calendly quien muestra su aviso de cookies. El día que este sitio incorpore analítica o publicidad, aparecerá un banner de consentimiento real, y esta página cambiará antes de que eso ocurra.",
            },
          ],
        },
        {
          id: "calendly",
          titulo: "El calendario de Calendly en /meet",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "La página /meet ofrece reservar una llamada con el calendario de Calendly. No se carga al abrir la página: hasta que pulsas «Ver calendario», tu navegador no se conecta con calendly.com. Al pulsarlo, el calendario se carga desde calendly.com y Calendly fija estas cookies en su propio dominio:",
            },
            {
              tipo: "tabla",
              cabeceras: ["Cookie", "Quién la instala", "Para qué", "Duración", "Tipo"],
              filas: [
                ["_calendly_session", "calendly.com (Calendly LLC)", "Mantener la sesión del calendario mientras eliges día y hora y reservas.", "21 días.", "Técnica."],
                ["__cf_bm", "calendly.com (Cloudflare, proveedor de Calendly)", "Distinguir el tráfico de personas del de bots.", "30 minutos.", "Técnica, de seguridad."],
                ["_cfuvid", "calendly.com (Cloudflare, proveedor de Calendly)", "Aplicar límites de peticiones por visitante.", "De sesión: se borra al cerrar el navegador.", "Técnica, de seguridad."],
              ],
            },
            {
              tipo: "parrafo",
              texto:
                "Son las que medimos al cargar el calendario el 15 de octubre de 2026. Calendly muestra además su propio aviso de cookies: lo que aceptes o rechaces ahí se rige por la política de cookies de Calendly, no por esta.",
            },
            {
              tipo: "parrafo",
              texto:
                "Si prefieres que Calendly no instale ninguna cookie, no abras el calendario: escríbenos desde la página de contacto y te proponemos día y hora por correo.",
            },
          ],
        },
        {
          id: "terceros",
          titulo: "Contenido servido por terceros",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Las imágenes de los cinco distintivos de premios de la página «Nosotros» se sirven desde nuestro propio dominio: al abrirla, tu navegador no se conecta a ningún servidor de terceros para cargarlas.",
            },
            {
              tipo: "parrafo",
              texto:
                "El resto de imágenes, tipografías y archivos del sitio se sirven desde nuestro propio dominio. La única excepción es el calendario de Calendly en /meet, y solo si lo abres.",
            },
            {
              tipo: "parrafo",
              texto:
                "Si sigues un enlace externo —a Tripadvisor, a hotelesteponaplaza.com o a cualquier otro destino—, a partir de ahí se aplica la política de cookies de ese sitio, no esta.",
            },
          ],
        },
        {
          id: "control",
          titulo: "Cómo controlarlas",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Puedes borrar o bloquear cookies desde la configuración de tu navegador (Chrome, Safari, Firefox y Edge lo permiten en su apartado de privacidad).",
            },
            {
              tipo: "parrafo",
              texto:
                "Si bloqueas NEXT_LOCALE, el sitio sigue funcionando con normalidad: el idioma viaja en la propia dirección de cada página (/en/…, /fr/…, /de/…). Lo único que se pierde es que la portada recuerde el idioma que elegiste la última vez.",
            },
          ],
          enlaces: [
            { href: "/privacidad", etiqueta: "Política de privacidad" },
            { href: "/aviso-legal", etiqueta: "Aviso legal" },
          ],
        },
      ],
    },

    en: {
      titulo: "Cookie policy",
      entradilla:
        "What this site stores in your browser. Not much: one first-party cookie, to remember your language, and Calendly's only if you open its calendar on /meet. This page explains exactly which ones, why, and what we do not do.",
      secciones: [
        {
          id: "que-usamos",
          titulo: "The only cookie we use",
          bloques: [
            {
              tipo: "tabla",
              cabeceras: ["Cookie", "Who sets it", "What for", "Lifetime", "Type"],
              filas: [
                [
                  "NEXT_LOCALE",
                  "sedaprivatehomes.com (first party)",
                  "Remember the language you pick in the switcher, so the next pages are shown in it.",
                  "Session: deleted when you close the browser.",
                  "Technical, user-interface personalisation.",
                ],
              ],
            },
            {
              tipo: "parrafo",
              texto:
                "It is set when the language the site serves does not match the one your browser declares — in practice, when you change language with the switcher. It holds no identifier, no IP address, nothing that could recognise you across visits: just two letters (es, en, fr or de).",
            },
            { tipo: "parrafo", texto: "The controller of this site is {titular}." },
          ],
        },
        {
          id: "lo-que-no",
          titulo: "What we do not use",
          bloques: [
            {
              tipo: "lista",
              items: [
                "Analytics cookies: none. This site has no Google Analytics, no Vercel Analytics and no other audience measurement tool.",
                "Advertising or social network cookies: none. There are no Meta, Google Ads, LinkedIn or TikTok pixels.",
                "Third-party cookies: none when you visit the site. The only ones are Calendly's, and only if you open its calendar (see “The Calendly calendar on /meet”).",
                "We also do not use browser storage (localStorage or sessionStorage) to track you.",
              ],
            },
            {
              tipo: "parrafo",
              texto:
                "Typefaces are served from our own domain: opening these pages does not make your browser connect to Google Fonts.",
            },
          ],
        },
        {
          id: "sin-banner",
          titulo: "That is why you will not see a banner",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Article 22.2 of the Spanish LSSI requires consent for cookies that are not strictly necessary. A cookie that merely remembers the language you chose yourself is among the exempted ones — the Spanish Data Protection Agency's cookie guidance calls them user-interface personalisation cookies — so asking for consent to it would be asking for nothing.",
            },
            {
              tipo: "parrafo",
              texto:
                "Calendly's cookies are not set when you visit the site: only when, on /meet, you press “View calendar” after reading the notice that explains it, and then Calendly itself shows its own cookie notice. The day this site adds analytics or advertising, a real consent banner will appear, and this page will change before that happens.",
            },
          ],
        },
        {
          id: "calendly",
          titulo: "The Calendly calendar on /meet",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "The /meet page lets you book a call through Calendly's calendar. It is not loaded when you open the page: until you press “View calendar”, your browser does not connect to calendly.com. When you press it, the calendar loads from calendly.com and Calendly sets these cookies on its own domain:",
            },
            {
              tipo: "tabla",
              cabeceras: ["Cookie", "Who sets it", "What for", "Lifetime", "Type"],
              filas: [
                ["_calendly_session", "calendly.com (Calendly LLC)", "Keep the calendar session while you choose a day and time and book.", "21 days.", "Technical."],
                ["__cf_bm", "calendly.com (Cloudflare, Calendly's provider)", "Tell human traffic apart from bots.", "30 minutes.", "Technical, security."],
                ["_cfuvid", "calendly.com (Cloudflare, Calendly's provider)", "Apply per-visitor request limits.", "Session: deleted when you close the browser.", "Technical, security."],
              ],
            },
            {
              tipo: "parrafo",
              texto:
                "These are the ones we measured when loading the calendar on 15 October 2026. Calendly also shows its own cookie notice: whatever you accept or reject there is governed by Calendly's cookie policy, not this one.",
            },
            {
              tipo: "parrafo",
              texto:
                "If you would rather Calendly set no cookies at all, do not open the calendar: write to us from the contact page and we will suggest a day and time by email.",
            },
          ],
        },
        {
          id: "terceros",
          titulo: "Content served by third parties",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "The images of the five award badges on the “About us” page are served from our own domain: when you open it, your browser does not connect to any third-party server to load them.",
            },
            {
              tipo: "parrafo",
              texto:
                "Every other image, typeface and file on the site is served from our own domain. The only exception is the Calendly calendar on /meet, and only if you open it.",
            },
            {
              tipo: "parrafo",
              texto:
                "If you follow an external link — to Tripadvisor, to hotelesteponaplaza.com or anywhere else — that site's cookie policy applies from then on, not this one.",
            },
          ],
        },
        {
          id: "control",
          titulo: "How to control them",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "You can delete or block cookies in your browser settings (Chrome, Safari, Firefox and Edge all allow it under privacy).",
            },
            {
              tipo: "parrafo",
              texto:
                "If you block NEXT_LOCALE, the site keeps working normally: the language travels in each page's own address (/en/…, /fr/…, /de/…). The only thing lost is the home page remembering the language you last chose.",
            },
          ],
          enlaces: [
            { href: "/privacidad", etiqueta: "Privacy policy" },
            { href: "/aviso-legal", etiqueta: "Legal notice" },
          ],
        },
      ],
    },

    fr: {
      titulo: "Politique relative aux cookies",
      entradilla:
        "Ce que ce site conserve dans votre navigateur. C'est peu : un cookie propre, pour mémoriser la langue, et ceux de Calendly uniquement si vous ouvrez son calendrier sur /meet. Cette page explique précisément lesquels, pourquoi, et ce que nous ne faisons pas.",
      secciones: [
        {
          id: "que-usamos",
          titulo: "Le seul cookie que nous utilisons",
          bloques: [
            {
              tipo: "tabla",
              cabeceras: ["Cookie", "Qui le dépose", "Pour quoi faire", "Durée", "Type"],
              filas: [
                [
                  "NEXT_LOCALE",
                  "sedaprivatehomes.com (interne)",
                  "Mémoriser la langue choisie dans le sélecteur, afin que les pages suivantes s'affichent dans cette langue.",
                  "De session : supprimé à la fermeture du navigateur.",
                  "Technique, de personnalisation de l'interface.",
                ],
              ],
            },
            {
              tipo: "parrafo",
              texto:
                "Il est déposé lorsque la langue servie par le site ne correspond pas à celle que déclare votre navigateur : en pratique, quand vous changez de langue avec le sélecteur. Il ne contient aucun identifiant, aucune adresse IP, rien qui permette de vous reconnaître d'une visite à l'autre : seulement deux lettres (es, en, fr ou de).",
            },
            { tipo: "parrafo", texto: "Le responsable de ce site est {titular}." },
          ],
        },
        {
          id: "lo-que-no",
          titulo: "Ce que nous n'utilisons pas",
          bloques: [
            {
              tipo: "lista",
              items: [
                "Cookies de mesure d'audience : aucun. Ce site n'a ni Google Analytics, ni Vercel Analytics, ni aucun autre outil de mesure.",
                "Cookies publicitaires ou de réseaux sociaux : aucun. Il n'y a pas de pixel Meta, Google Ads, LinkedIn ou TikTok.",
                "Cookies tiers : aucun lorsque vous visitez le site. Les seuls sont ceux de Calendly, et uniquement si vous ouvrez son calendrier (voir « Le calendrier Calendly sur /meet »).",
                "Nous n'utilisons pas non plus le stockage du navigateur (localStorage ou sessionStorage) pour vous suivre.",
              ],
            },
            {
              tipo: "parrafo",
              texto:
                "Les polices de caractères sont servies depuis notre propre domaine : l'ouverture de ces pages ne connecte pas votre navigateur à Google Fonts.",
            },
          ],
        },
        {
          id: "sin-banner",
          titulo: "C'est pourquoi vous ne verrez pas de bandeau",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "L'article 22.2 de la LSSI espagnole exige le consentement pour les cookies qui ne sont pas strictement nécessaires. Un cookie qui se borne à mémoriser la langue que vous avez vous-même choisie fait partie des exceptions — le guide sur les cookies de l'Agence espagnole de protection des données les appelle cookies de personnalisation de l'interface —, de sorte que vous demander votre consentement pour lui serait le demander sans objet.",
            },
            {
              tipo: "parrafo",
              texto:
                "Les cookies de Calendly ne sont pas déposés lorsque vous visitez le site : seulement lorsque, sur /meet, vous appuyez sur « Voir le calendrier » après avoir lu l'avis qui l'explique, et c'est alors Calendly lui-même qui affiche son propre avis sur les cookies. Le jour où ce site intégrera de la mesure d'audience ou de la publicité, un vrai bandeau de consentement apparaîtra, et cette page changera avant.",
            },
          ],
        },
        {
          id: "calendly",
          titulo: "Le calendrier Calendly sur /meet",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "La page /meet permet de réserver un appel via le calendrier de Calendly. Il n'est pas chargé à l'ouverture de la page : tant que vous n'appuyez pas sur « Voir le calendrier », votre navigateur ne se connecte pas à calendly.com. Lorsque vous appuyez, le calendrier se charge depuis calendly.com et Calendly dépose ces cookies sur son propre domaine :",
            },
            {
              tipo: "tabla",
              cabeceras: ["Cookie", "Qui le dépose", "Pour quoi faire", "Durée", "Type"],
              filas: [
                ["_calendly_session", "calendly.com (Calendly LLC)", "Maintenir la session du calendrier pendant que vous choisissez le jour et l'heure et réservez.", "21 jours.", "Technique."],
                ["__cf_bm", "calendly.com (Cloudflare, prestataire de Calendly)", "Distinguer le trafic humain de celui des robots.", "30 minutes.", "Technique, de sécurité."],
                ["_cfuvid", "calendly.com (Cloudflare, prestataire de Calendly)", "Appliquer des limites de requêtes par visiteur.", "De session : supprimé à la fermeture du navigateur.", "Technique, de sécurité."],
              ],
            },
            {
              tipo: "parrafo",
              texto:
                "Ce sont ceux que nous avons mesurés en chargeant le calendrier le 15 octobre 2026. Calendly affiche en outre son propre avis sur les cookies : ce que vous y acceptez ou refusez relève de la politique de cookies de Calendly, pas de celle-ci.",
            },
            {
              tipo: "parrafo",
              texto:
                "Si vous préférez que Calendly ne dépose aucun cookie, n'ouvrez pas le calendrier : écrivez-nous depuis la page de contact et nous vous proposerons un jour et une heure par courriel.",
            },
          ],
        },
        {
          id: "terceros",
          titulo: "Contenu servi par des tiers",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Les images des cinq distinctions de la page « Nous » sont servies depuis notre propre domaine : en l'ouvrant, votre navigateur ne se connecte à aucun serveur tiers pour les charger.",
            },
            {
              tipo: "parrafo",
              texto:
                "Toutes les autres images, polices et fichiers du site sont servis depuis notre propre domaine. La seule exception est le calendrier Calendly sur /meet, et uniquement si vous l'ouvrez.",
            },
            {
              tipo: "parrafo",
              texto:
                "Si vous suivez un lien externe — vers Tripadvisor, vers hotelesteponaplaza.com ou ailleurs —, c'est la politique de cookies de ce site qui s'applique dès lors, et non celle-ci.",
            },
          ],
        },
        {
          id: "control",
          titulo: "Comment les contrôler",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Vous pouvez supprimer ou bloquer les cookies depuis les réglages de votre navigateur (Chrome, Safari, Firefox et Edge le permettent dans leur rubrique confidentialité).",
            },
            {
              tipo: "parrafo",
              texto:
                "Si vous bloquez NEXT_LOCALE, le site continue de fonctionner normalement : la langue voyage dans l'adresse de chaque page (/en/…, /fr/…, /de/…). La seule chose perdue est que la page d'accueil se souvienne de la langue choisie la dernière fois.",
            },
          ],
          enlaces: [
            { href: "/privacidad", etiqueta: "Politique de confidentialité" },
            { href: "/aviso-legal", etiqueta: "Mentions légales" },
          ],
        },
      ],
    },

    de: {
      titulo: "Cookie-Richtlinie",
      entradilla:
        "Was diese Website in Ihrem Browser speichert. Es ist wenig: ein eigenes Cookie, für die Sprache, und die von Calendly nur, wenn Sie dessen Kalender auf /meet öffnen. Diese Seite erklärt genau welche, warum, und was wir nicht tun.",
      secciones: [
        {
          id: "que-usamos",
          titulo: "Das einzige Cookie, das wir setzen",
          bloques: [
            {
              tipo: "tabla",
              cabeceras: ["Cookie", "Wer es setzt", "Wofür", "Dauer", "Art"],
              filas: [
                [
                  "NEXT_LOCALE",
                  "sedaprivatehomes.com (eigenes)",
                  "Die im Umschalter gewählte Sprache merken, damit die folgenden Seiten in ihr erscheinen.",
                  "Sitzung: wird beim Schließen des Browsers gelöscht.",
                  "Technisch, Personalisierung der Oberfläche.",
                ],
              ],
            },
            {
              tipo: "parrafo",
              texto:
                "Es wird gesetzt, wenn die ausgelieferte Sprache nicht der entspricht, die Ihr Browser angibt — praktisch also, wenn Sie die Sprache über den Umschalter wechseln. Es enthält keine Kennung, keine IP-Adresse, nichts, womit Sie über Besuche hinweg wiedererkannt werden könnten: nur zwei Buchstaben (es, en, fr oder de).",
            },
            { tipo: "parrafo", texto: "Verantwortlich für diese Website ist {titular}." },
          ],
        },
        {
          id: "lo-que-no",
          titulo: "Was wir nicht verwenden",
          bloques: [
            {
              tipo: "lista",
              items: [
                "Analyse-Cookies: keine. Diese Website hat weder Google Analytics noch Vercel Analytics noch ein anderes Reichweiten-Messwerkzeug.",
                "Werbe- oder Social-Media-Cookies: keine. Es gibt keine Pixel von Meta, Google Ads, LinkedIn oder TikTok.",
                "Cookies Dritter: keine beim Besuch der Website. Die einzigen sind die von Calendly, und nur, wenn Sie dessen Kalender öffnen (siehe „Der Calendly-Kalender auf /meet“).",
                "Auch den Browser-Speicher (localStorage oder sessionStorage) nutzen wir nicht, um Sie zu verfolgen.",
              ],
            },
            {
              tipo: "parrafo",
              texto:
                "Die Schriften werden von unserer eigenen Domain ausgeliefert: Beim Öffnen dieser Seiten verbindet sich Ihr Browser nicht mit Google Fonts.",
            },
          ],
        },
        {
          id: "sin-banner",
          titulo: "Deshalb sehen Sie kein Banner",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Artikel 22.2 des spanischen LSSI verlangt eine Einwilligung für Cookies, die nicht unbedingt erforderlich sind. Ein Cookie, das lediglich die von Ihnen selbst gewählte Sprache merkt, gehört zu den Ausnahmen — der Cookie-Leitfaden der spanischen Datenschutzbehörde nennt sie Cookies zur Personalisierung der Oberfläche —, sodass eine Einwilligungsabfrage dafür gegenstandslos wäre.",
            },
            {
              tipo: "parrafo",
              texto:
                "Die Cookies von Calendly werden beim Besuch der Website nicht gesetzt: nur wenn Sie auf /meet nach dem erklärenden Hinweis auf „Kalender anzeigen“ klicken, und dann zeigt Calendly selbst seinen eigenen Cookie-Hinweis. An dem Tag, an dem diese Website Analyse oder Werbung einsetzt, erscheint ein echtes Einwilligungsbanner — und diese Seite ändert sich vorher.",
            },
          ],
        },
        {
          id: "calendly",
          titulo: "Der Calendly-Kalender auf /meet",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Auf der Seite /meet können Sie über den Kalender von Calendly ein Gespräch buchen. Er wird beim Öffnen der Seite nicht geladen: Bis Sie auf „Kalender anzeigen“ klicken, verbindet sich Ihr Browser nicht mit calendly.com. Wenn Sie klicken, lädt der Kalender von calendly.com, und Calendly setzt auf seiner eigenen Domain diese Cookies:",
            },
            {
              tipo: "tabla",
              cabeceras: ["Cookie", "Wer es setzt", "Wofür", "Dauer", "Art"],
              filas: [
                ["_calendly_session", "calendly.com (Calendly LLC)", "Die Kalendersitzung halten, während Sie Tag und Uhrzeit wählen und buchen.", "21 Tage.", "Technisch."],
                ["__cf_bm", "calendly.com (Cloudflare, Dienstleister von Calendly)", "Menschlichen Verkehr von Bots unterscheiden.", "30 Minuten.", "Technisch, Sicherheit."],
                ["_cfuvid", "calendly.com (Cloudflare, Dienstleister von Calendly)", "Anfragelimits pro Besucher anwenden.", "Sitzung: wird beim Schließen des Browsers gelöscht.", "Technisch, Sicherheit."],
              ],
            },
            {
              tipo: "parrafo",
              texto:
                "Diese haben wir beim Laden des Kalenders am 15. Oktober 2026 gemessen. Calendly zeigt außerdem einen eigenen Cookie-Hinweis: Was Sie dort annehmen oder ablehnen, richtet sich nach der Cookie-Richtlinie von Calendly, nicht nach dieser.",
            },
            {
              tipo: "parrafo",
              texto:
                "Wenn Calendly überhaupt keine Cookies setzen soll, öffnen Sie den Kalender nicht: Schreiben Sie uns über die Kontaktseite, und wir schlagen Ihnen Tag und Uhrzeit per E-Mail vor.",
            },
          ],
        },
        {
          id: "terceros",
          titulo: "Von Dritten ausgelieferte Inhalte",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Die Bilder der fünf Auszeichnungen auf der Seite „Über uns“ werden von unserer eigenen Domain ausgeliefert: Beim Öffnen verbindet sich Ihr Browser dafür mit keinem Drittserver.",
            },
            {
              tipo: "parrafo",
              texto:
                "Alle übrigen Bilder, Schriften und Dateien der Website werden von unserer eigenen Domain ausgeliefert. Die einzige Ausnahme ist der Calendly-Kalender auf /meet, und nur, wenn Sie ihn öffnen.",
            },
            {
              tipo: "parrafo",
              texto:
                "Wenn Sie einem externen Link folgen — zu Tripadvisor, zu hotelesteponaplaza.com oder anderswohin —, gilt ab dann die Cookie-Richtlinie jener Website, nicht diese.",
            },
          ],
        },
        {
          id: "control",
          titulo: "Wie Sie sie steuern",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Sie können Cookies in den Einstellungen Ihres Browsers löschen oder blockieren (Chrome, Safari, Firefox und Edge erlauben das im Datenschutzbereich).",
            },
            {
              tipo: "parrafo",
              texto:
                "Wenn Sie NEXT_LOCALE blockieren, funktioniert die Website normal weiter: Die Sprache steht in der Adresse jeder Seite (/en/…, /fr/…, /de/…). Verloren geht nur, dass die Startseite sich Ihre zuletzt gewählte Sprache merkt.",
            },
          ],
          enlaces: [
            { href: "/privacidad", etiqueta: "Datenschutzerklärung" },
            { href: "/aviso-legal", etiqueta: "Impressum" },
          ],
        },
      ],
    },
  },
}
