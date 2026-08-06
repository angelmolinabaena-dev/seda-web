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
    · Único subrecurso de tercero: los cinco distintivos de premios de
      `/nosotros`, cargados con `<img>` desde hotelesteponaplaza.com
      (`NosotrosContent.tsx`, constante `AWARDS`). Comprobación con
      `curl -I` el 2026-08-06: HTTP 200, servidor nginx, SIN cabecera
      `Set-Cookie`.
    · Las tipografías se sirven desde el propio dominio: `app/layout.tsx`
      usa `next/font/google`, que las descarga en tiempo de build y las
      auto-aloja — el navegador no contacta con Google Fonts.

  Si cualquiera de estos hechos cambia, este texto cambia con él, y si
  aparece analítica hay que añadir además un banner de consentimiento.
*/

export const COOKIES: DocumentoLegalMultilingue = {
  id: "cookies",
  ruta: "/cookies",
  actualizado: "2026-08-06",
  traducciones: {
    es: {
      titulo: "Política de cookies",
      entradilla:
        "Qué guarda este sitio en tu navegador. Es poco: una sola cookie, para recordar el idioma. Esta página explica exactamente cuál, por qué, y qué no hacemos.",
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
                "Cookies de terceros: ninguna.",
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
                "El día que este sitio incorpore analítica, publicidad o cualquier cookie de tercero, aparecerá un banner de consentimiento real, y esta página cambiará antes de que eso ocurra.",
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
                "La página «Nosotros» muestra cinco distintivos de premios cuyas imágenes se cargan desde hotelesteponaplaza.com. Al abrir esa página, tu navegador se conecta a ese servidor, que recibe tu dirección IP y los datos técnicos de la petición. Comprobado el 6 de agosto de 2026: esas respuestas no instalan ninguna cookie.",
            },
            {
              tipo: "parrafo",
              texto:
                "El resto de imágenes, tipografías y archivos del sitio se sirven desde nuestro propio dominio.",
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
        "What this site stores in your browser. Not much: a single cookie, to remember your language. This page explains exactly which one, why, and what we do not do.",
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
                "Third-party cookies: none.",
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
                "The day this site adds analytics, advertising or any third-party cookie, a real consent banner will appear, and this page will change before that happens.",
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
                "The “About us” page shows five award badges whose images load from hotelesteponaplaza.com. When you open that page, your browser connects to that server, which receives your IP address and the technical data of the request. Checked on 6 August 2026: those responses set no cookie.",
            },
            {
              tipo: "parrafo",
              texto:
                "Every other image, typeface and file on the site is served from our own domain.",
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
        "Ce que ce site conserve dans votre navigateur. C'est peu : un seul cookie, pour mémoriser la langue. Cette page explique précisément lequel, pourquoi, et ce que nous ne faisons pas.",
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
                "Cookies tiers : aucun.",
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
                "Le jour où ce site intégrera de la mesure d'audience, de la publicité ou un quelconque cookie tiers, un vrai bandeau de consentement apparaîtra, et cette page changera avant.",
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
                "La page « Nous » affiche cinq distinctions dont les images sont chargées depuis hotelesteponaplaza.com. En ouvrant cette page, votre navigateur se connecte à ce serveur, qui reçoit votre adresse IP et les données techniques de la requête. Vérifié le 6 août 2026 : ces réponses ne déposent aucun cookie.",
            },
            {
              tipo: "parrafo",
              texto:
                "Toutes les autres images, polices et fichiers du site sont servis depuis notre propre domaine.",
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
        "Was diese Website in Ihrem Browser speichert. Es ist wenig: ein einziges Cookie, für die Sprache. Diese Seite erklärt genau welches, warum, und was wir nicht tun.",
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
                "Cookies Dritter: keine.",
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
                "An dem Tag, an dem diese Website Analyse, Werbung oder irgendein Cookie Dritter einsetzt, erscheint ein echtes Einwilligungsbanner — und diese Seite ändert sich vorher.",
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
                "Die Seite „Über uns“ zeigt fünf Auszeichnungen, deren Bilder von hotelesteponaplaza.com geladen werden. Beim Öffnen dieser Seite verbindet sich Ihr Browser mit jenem Server, der Ihre IP-Adresse und die technischen Daten der Anfrage erhält. Geprüft am 6. August 2026: Diese Antworten setzen kein Cookie.",
            },
            {
              tipo: "parrafo",
              texto:
                "Alle übrigen Bilder, Schriften und Dateien der Website werden von unserer eigenen Domain ausgeliefert.",
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
