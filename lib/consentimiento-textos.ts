import type { Locale } from "@/i18n/routing"

/*
  Textos del aviso de cookies, en los cuatro idiomas.

  Viven aquí y NO en messages/<locale>.json a propósito: `NextIntlClientProvider`
  serializa todos los mensajes dentro del HTML de cada página, así que añadir
  claves allí cambiaría el HTML aunque SEDA_FLAG_META_PIXEL esté apagado — y el
  requisito es que apagado sea «la web exactamente como hoy». Estos textos solo
  se leen cuando el flag está encendido y viajan como props del componente.

  TEXTO NUEVO — pendiente de revisión de Ángel (es) y de las revisiones de
  idioma de en/fr/de.

  Reglas de redacción (guía de la AEPD, 2023): la primera capa dice quién
  trata, para qué y que hay una elección; los tres botones usan verbos
  equivalentes y el mismo peso; sin tono que empuje a aceptar («¡Genial!», «Sí,
  continuar») ni que castigue rechazar.
*/

export type TextosConsentimiento = {
  /** Nombre accesible de la región del aviso. */
  region: string
  titulo: string
  cuerpo: string
  aceptar: string
  rechazar: string
  configurar: string
  /** Enlace a la política de cookies. */
  politica: string
  panel: {
    titulo: string
    intro: string
    tecnicas: { titulo: string; descripcion: string; estado: string }
    marketing: { titulo: string; descripcion: string }
    guardar: string
    cerrar: string
  }
  /** Enlace del pie que reabre la configuración. */
  enlacePie: string
}

export const TEXTOS_CONSENTIMIENTO: Record<Locale, TextosConsentimiento> = {
  es: {
    region: "Aviso de cookies",
    titulo: "Cookies",
    cuerpo:
      "Usamos cookies técnicas, necesarias para que la web funcione. Con tu permiso, usamos también cookies de marketing de Meta para medir si nuestros anuncios funcionan. Puedes aceptarlas, rechazarlas o elegir, y cambiarlo cuando quieras en «Configurar cookies», al pie de la página.",
    aceptar: "Aceptar",
    rechazar: "Rechazar",
    configurar: "Configurar",
    politica: "Política de cookies",
    panel: {
      titulo: "Configurar cookies",
      intro: "Elige qué cookies permites. Puedes cambiarlo o retirarlo en cualquier momento.",
      tecnicas: {
        titulo: "Técnicas",
        descripcion: "Recuerdan tu idioma y tu elección sobre las cookies. La web no funciona bien sin ellas, por eso no piden permiso.",
        estado: "Siempre activas",
      },
      marketing: {
        titulo: "Marketing (Meta)",
        descripcion:
          "El píxel de Meta nos dice cuántas visitas y cuántas solicitudes de la calculadora llegan desde nuestros anuncios. Meta recibe tu IP y datos de tu navegador; nunca tu nombre, correo ni teléfono.",
      },
      guardar: "Guardar mi elección",
      cerrar: "Cerrar",
    },
    enlacePie: "Configurar cookies",
  },
  en: {
    region: "Cookie notice",
    titulo: "Cookies",
    cuerpo:
      "We use technical cookies, which the site needs to work. With your permission we also use Meta marketing cookies to measure whether our ads work. You can accept them, reject them or choose, and change it at any time under “Cookie settings” at the foot of the page.",
    aceptar: "Accept",
    rechazar: "Reject",
    configurar: "Configure",
    politica: "Cookie policy",
    panel: {
      titulo: "Cookie settings",
      intro: "Choose which cookies you allow. You can change or withdraw this at any time.",
      tecnicas: {
        titulo: "Technical",
        descripcion: "They remember your language and your cookie choice. The site does not work well without them, so they do not ask for permission.",
        estado: "Always on",
      },
      marketing: {
        titulo: "Marketing (Meta)",
        descripcion:
          "The Meta pixel tells us how many visits and how many calculator submissions come from our ads. Meta receives your IP and browser data; never your name, email or phone.",
      },
      guardar: "Save my choice",
      cerrar: "Close",
    },
    enlacePie: "Cookie settings",
  },
  fr: {
    region: "Bandeau de cookies",
    titulo: "Cookies",
    cuerpo:
      "Nous utilisons des cookies techniques, nécessaires au fonctionnement du site. Avec votre accord, nous utilisons aussi des cookies de marketing de Meta pour mesurer l'efficacité de nos annonces. Vous pouvez les accepter, les refuser ou choisir, et modifier votre choix à tout moment via « Configurer les cookies », en bas de page.",
    aceptar: "Accepter",
    rechazar: "Refuser",
    configurar: "Configurer",
    politica: "Politique de cookies",
    panel: {
      titulo: "Configurer les cookies",
      intro: "Choisissez les cookies que vous autorisez. Vous pouvez modifier ou retirer votre choix à tout moment.",
      tecnicas: {
        titulo: "Techniques",
        descripcion: "Ils mémorisent votre langue et votre choix sur les cookies. Le site ne fonctionne pas bien sans eux, c'est pourquoi ils ne demandent pas d'accord.",
        estado: "Toujours actifs",
      },
      marketing: {
        titulo: "Marketing (Meta)",
        descripcion:
          "Le pixel Meta nous indique combien de visites et combien d'envois du calculateur proviennent de nos annonces. Meta reçoit votre IP et des données de votre navigateur ; jamais votre nom, courriel ou téléphone.",
      },
      guardar: "Enregistrer mon choix",
      cerrar: "Fermer",
    },
    enlacePie: "Configurer les cookies",
  },
  de: {
    region: "Cookie-Hinweis",
    titulo: "Cookies",
    cuerpo:
      "Wir verwenden technische Cookies, die für den Betrieb der Website nötig sind. Mit Ihrer Erlaubnis verwenden wir außerdem Marketing-Cookies von Meta, um zu messen, ob unsere Anzeigen wirken. Sie können sie akzeptieren, ablehnen oder auswählen und das jederzeit unter „Cookies konfigurieren“ am Seitenende ändern.",
    aceptar: "Akzeptieren",
    rechazar: "Ablehnen",
    configurar: "Konfigurieren",
    politica: "Cookie-Richtlinie",
    panel: {
      titulo: "Cookies konfigurieren",
      intro: "Wählen Sie, welche Cookies Sie erlauben. Sie können das jederzeit ändern oder widerrufen.",
      tecnicas: {
        titulo: "Technisch",
        descripcion: "Sie merken sich Ihre Sprache und Ihre Cookie-Auswahl. Ohne sie funktioniert die Website nicht richtig, deshalb fragen sie nicht um Erlaubnis.",
        estado: "Immer aktiv",
      },
      marketing: {
        titulo: "Marketing (Meta)",
        descripcion:
          "Das Meta-Pixel zeigt uns, wie viele Besuche und wie viele Absendungen des Rechners aus unseren Anzeigen stammen. Meta erhält Ihre IP und Browserdaten; niemals Ihren Namen, Ihre E-Mail oder Telefonnummer.",
      },
      guardar: "Meine Auswahl speichern",
      cerrar: "Schließen",
    },
    enlacePie: "Cookies konfigurieren",
  },
}
