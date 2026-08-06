import type { DocumentoLegalMultilingue } from "./types"

/*
  Aviso legal — artículo 10 de la Ley 34/2002 (LSSI-CE).

  Cada afirmación de este texto se sostiene en un hecho comprobable del
  repositorio. Las comprobaciones, una a una, están en la descripción del
  PR. Las tres que más condicionan la redacción:

    · No hay contratación en línea: la única entrada de datos del sitio es
      `app/api/contact/route.ts`, que compone un correo y lo envía. No hay
      pasarela de pago, ni motor de reservas, ni base de datos.
    · Los cinco distintivos de premios de `/nosotros` se cargan desde
      hotelesteponaplaza.com (`NosotrosContent.tsx`, constante `AWARDS`) y
      pertenecen al Hotel Estepona Plaza, no a SEDA Private Homes.
    · No se cita ninguna licencia turística: la que había era inventada y se
      retiró (`app/[locale]/layout.tsx`, comentario de `businessJsonLd`).
*/

export const AVISO_LEGAL: DocumentoLegalMultilingue = {
  id: "aviso-legal",
  ruta: "/aviso-legal",
  actualizado: "2026-08-06",
  traducciones: {
    es: {
      titulo: "Aviso legal",
      entradilla:
        "Quién opera sedaprivatehomes.com, en qué condiciones y con qué responsabilidad. Se publica en cumplimiento del artículo 10 de la Ley 34/2002, de servicios de la sociedad de la información y de comercio electrónico.",
      secciones: [
        {
          id: "titular",
          titulo: "Titular del sitio",
          bloques: [
            { tipo: "identificacion" },
            {
              tipo: "parrafo",
              texto:
                "SEDA Private Homes es el nombre comercial bajo el que la persona física identificada arriba presta los servicios que este sitio describe.",
            },
            {
              tipo: "parrafo",
              texto:
                "No existe todavía sociedad mercantil constituida: no hay denominación social, ni NIF de sociedad, ni inscripción en el Registro Mercantil que declarar. Preferimos decirlo a dejar el apartado en blanco. El día que la sociedad se constituya e inscriba, este bloque pasará a recoger sus datos y la fecha de revisión del pie cambiará.",
            },
          ],
        },
        {
          id: "objeto",
          titulo: "Qué es este sitio",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "sedaprivatehomes.com es un sitio informativo. Describe el modelo de gestión de villas de SEDA Private Homes, los servicios que presta a huéspedes y propietarios, y la tecnología sobre la que opera.",
            },
            {
              tipo: "parrafo",
              texto:
                "No dispone de sistema de contratación en línea. No publica disponibilidad ni precios, no procesa pagos y no formaliza reservas. Lo que envías por el formulario de contacto llega como un correo electrónico y se atiende después, de forma individual, fuera de la web.",
            },
            {
              tipo: "parrafo",
              texto:
                "Las imágenes que ilustran propiedades son renderizaciones conceptuales, no fotografías de inmuebles concretos. La fotografía real de cada villa se facilita bajo solicitud directa al equipo.",
            },
          ],
        },
        {
          id: "uso",
          titulo: "Condiciones de uso",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "El acceso al sitio es libre y gratuito, y no exige registro. Al usarlo te comprometes a hacerlo conforme a la ley y a la buena fe: no emplearlo con fines ilícitos, no intentar acceder a partes no públicas, y no enviar por el formulario contenido que no te pertenezca o que pueda dañar los sistemas de nadie.",
            },
            {
              tipo: "parrafo",
              texto:
                "El formulario aplica límites técnicos de tamaño del mensaje, número de campos y frecuencia de envío. Los envíos que los superan se rechazan con un error, sin que quede registro del contenido.",
            },
          ],
        },
        {
          id: "propiedad-intelectual",
          titulo: "Propiedad intelectual e industrial",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Los textos, la estructura, el diseño, las ilustraciones y el código de este sitio pertenecen a su titular o se utilizan con licencia. Puedes citarlos indicando la fuente; reproducirlos o explotarlos con fines comerciales requiere autorización previa por escrito.",
            },
            {
              tipo: "parrafo",
              texto:
                "SEDA Private Homes, y los nombres de sus herramientas internas, se usan como signos distintivos del titular.",
            },
            {
              tipo: "parrafo",
              texto:
                "Los distintivos de premios que aparecen en la página «Nosotros» pertenecen a las plataformas que los otorgan —Tripadvisor, Booking.com, Expedia, Orbitz y Core Hospitality— y se muestran a título informativo, referidos al Hotel Estepona Plaza. Sus imágenes se sirven desde hotelesteponaplaza.com.",
            },
          ],
        },
        {
          id: "enlaces",
          titulo: "Enlaces a sitios de terceros",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Este sitio enlaza a destinos que no controla: la aplicación de huéspedes (guests.sedaprivatehomes.com), el portal de propietarios (portal.sedaprivatehomes.com), hotelesteponaplaza.com y plataformas de reseñas.",
            },
            {
              tipo: "parrafo",
              texto:
                "El titular no responde del contenido, la disponibilidad ni las prácticas de privacidad de esos destinos. A partir del momento en que sigues un enlace externo, se aplican sus condiciones y no estas.",
            },
          ],
        },
        {
          id: "responsabilidad",
          titulo: "Responsabilidad",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "El titular procura que el sitio esté disponible y que su información sea exacta y esté al día, pero no puede garantizar que el servicio no se interrumpa ni que no contenga errores. Puede modificar, suspender o retirar contenidos en cualquier momento.",
            },
            {
              tipo: "parrafo",
              texto:
                "La información publicada tiene carácter informativo y no constituye una oferta contractual vinculante. Las condiciones de una estancia o de un encargo de gestión se acuerdan por escrito con cada huésped o propietario.",
            },
          ],
        },
        {
          id: "datos",
          titulo: "Protección de datos y cookies",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "El tratamiento de los datos que envías por el formulario, por correo o por teléfono se explica en la política de privacidad. Lo que este sitio guarda en tu navegador —una sola cookie, para recordar el idioma— se explica en la política de cookies.",
            },
          ],
          enlaces: [
            { href: "/privacidad", etiqueta: "Política de privacidad" },
            { href: "/cookies", etiqueta: "Política de cookies" },
          ],
        },
        {
          id: "ley-aplicable",
          titulo: "Legislación aplicable",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Este aviso legal se rige por la legislación española. Para cualquier controversia relativa al sitio, las partes se someten a los juzgados y tribunales que resulten competentes conforme a derecho. Si eres consumidor, conservas íntegramente los fueros que la normativa de consumo te reconoce, que prevalecen sobre lo anterior.",
            },
          ],
        },
        {
          id: "contacto",
          titulo: "Contacto",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Para cualquier cuestión relacionada con este aviso legal: {email} · {telefono}.",
            },
          ],
        },
      ],
    },

    en: {
      titulo: "Legal notice",
      entradilla:
        "Who operates sedaprivatehomes.com, on what terms and with what liability. Published under article 10 of Spanish Law 34/2002 on information society services and electronic commerce.",
      secciones: [
        {
          id: "titular",
          titulo: "Site owner",
          bloques: [
            { tipo: "identificacion" },
            {
              tipo: "parrafo",
              texto:
                "SEDA Private Homes is the trading name under which the individual identified above provides the services this site describes.",
            },
            {
              tipo: "parrafo",
              texto:
                "No company has been incorporated yet: there is no registered company name, no company tax number and no Commercial Registry entry to declare. We would rather say so than leave the section blank. Once the company exists and is registered, this block will carry its details and the revision date in the footer will change.",
            },
          ],
        },
        {
          id: "objeto",
          titulo: "What this site is",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "sedaprivatehomes.com is an informational site. It describes how SEDA Private Homes manages villas, the services it provides to guests and owners, and the technology it runs on.",
            },
            {
              tipo: "parrafo",
              texto:
                "There is no online contracting system. The site publishes no availability and no prices, processes no payments and confirms no bookings. Whatever you send through the contact form arrives as an email and is dealt with afterwards, individually, away from the website.",
            },
            {
              tipo: "parrafo",
              texto:
                "The images illustrating properties are conceptual renderings, not photographs of specific homes. Real photography of each villa is provided on direct request to the team.",
            },
          ],
        },
        {
          id: "uso",
          titulo: "Terms of use",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Access is free and requires no registration. By using the site you undertake to do so lawfully and in good faith: not for unlawful purposes, without attempting to reach non-public areas, and without sending through the form any content that is not yours or that could damage anyone's systems.",
            },
            {
              tipo: "parrafo",
              texto:
                "The form enforces technical limits on message size, number of fields and submission frequency. Submissions that exceed them are rejected with an error, and no record of their content is kept.",
            },
          ],
        },
        {
          id: "propiedad-intelectual",
          titulo: "Intellectual and industrial property",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "The texts, structure, design, illustrations and code of this site belong to its owner or are used under licence. You may quote them with attribution; reproducing or exploiting them commercially requires prior written permission.",
            },
            {
              tipo: "parrafo",
              texto:
                "SEDA Private Homes, and the names of its internal tools, are used as distinctive signs of the owner.",
            },
            {
              tipo: "parrafo",
              texto:
                "The award badges shown on the “About us” page belong to the platforms that grant them — Tripadvisor, Booking.com, Expedia, Orbitz and Core Hospitality — and are shown for information, referring to Hotel Estepona Plaza. Their images are served from hotelesteponaplaza.com.",
            },
          ],
        },
        {
          id: "enlaces",
          titulo: "Links to third-party sites",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "This site links to destinations it does not control: the guest app (guests.sedaprivatehomes.com), the owner portal (portal.sedaprivatehomes.com), hotelesteponaplaza.com and review platforms.",
            },
            {
              tipo: "parrafo",
              texto:
                "The owner is not responsible for the content, availability or privacy practices of those destinations. From the moment you follow an external link, their terms apply and not these.",
            },
          ],
        },
        {
          id: "responsabilidad",
          titulo: "Liability",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "The owner works to keep the site available and its information accurate and current, but cannot guarantee uninterrupted or error-free service, and may modify, suspend or withdraw content at any time.",
            },
            {
              tipo: "parrafo",
              texto:
                "The information published is informational and does not constitute a binding contractual offer. The terms of a stay or of a management engagement are agreed in writing with each guest or owner.",
            },
          ],
        },
        {
          id: "datos",
          titulo: "Data protection and cookies",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "How we handle the data you send through the form, by email or by phone is explained in the privacy policy. What this site stores in your browser — a single cookie, to remember your language — is explained in the cookie policy.",
            },
          ],
          enlaces: [
            { href: "/privacidad", etiqueta: "Privacy policy" },
            { href: "/cookies", etiqueta: "Cookie policy" },
          ],
        },
        {
          id: "ley-aplicable",
          titulo: "Applicable law",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "This legal notice is governed by Spanish law. For any dispute concerning the site, the parties submit to the courts with jurisdiction under the applicable rules. If you are a consumer, you retain in full the fora that consumer legislation grants you, which prevail over the foregoing.",
            },
          ],
        },
        {
          id: "contacto",
          titulo: "Contact",
          bloques: [
            {
              tipo: "parrafo",
              texto: "For anything concerning this legal notice: {email} · {telefono}.",
            },
          ],
        },
      ],
    },

    fr: {
      titulo: "Mentions légales",
      entradilla:
        "Qui exploite sedaprivatehomes.com, à quelles conditions et avec quelle responsabilité. Publiées en application de l'article 10 de la loi espagnole 34/2002 relative aux services de la société de l'information et au commerce électronique.",
      secciones: [
        {
          id: "titular",
          titulo: "Titulaire du site",
          bloques: [
            { tipo: "identificacion" },
            {
              tipo: "parrafo",
              texto:
                "SEDA Private Homes est le nom commercial sous lequel la personne physique identifiée ci-dessus fournit les services décrits sur ce site.",
            },
            {
              tipo: "parrafo",
              texto:
                "Aucune société n'est encore constituée : il n'existe ni dénomination sociale, ni numéro fiscal de société, ni immatriculation au registre du commerce à déclarer. Nous préférons le dire plutôt que laisser la rubrique vide. Le jour où la société sera constituée et immatriculée, ce bloc reprendra ses données et la date de révision indiquée en bas de page changera.",
            },
          ],
        },
        {
          id: "objeto",
          titulo: "Ce qu'est ce site",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "sedaprivatehomes.com est un site d'information. Il décrit le modèle de gestion de villas de SEDA Private Homes, les services proposés aux voyageurs et aux propriétaires, et la technologie qui les soutient.",
            },
            {
              tipo: "parrafo",
              texto:
                "Il ne dispose d'aucun système de contractualisation en ligne. Il ne publie ni disponibilités ni tarifs, ne traite aucun paiement et ne confirme aucune réservation. Ce que vous envoyez via le formulaire de contact arrive sous forme de courriel et est traité ensuite, individuellement, en dehors du site.",
            },
            {
              tipo: "parrafo",
              texto:
                "Les images illustrant les propriétés sont des rendus conceptuels, et non des photographies de biens réels. La photographie de chaque villa est fournie sur demande directe auprès de l'équipe.",
            },
          ],
        },
        {
          id: "uso",
          titulo: "Conditions d'utilisation",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "L'accès au site est libre, gratuit et sans inscription. En l'utilisant, vous vous engagez à le faire conformément à la loi et de bonne foi : sans finalité illicite, sans tenter d'accéder aux parties non publiques, et sans envoyer via le formulaire de contenu qui ne vous appartient pas ou susceptible d'endommager les systèmes d'autrui.",
            },
            {
              tipo: "parrafo",
              texto:
                "Le formulaire applique des limites techniques de taille du message, de nombre de champs et de fréquence d'envoi. Les envois qui les dépassent sont rejetés par une erreur, sans qu'aucune trace de leur contenu ne soit conservée.",
            },
          ],
        },
        {
          id: "propiedad-intelectual",
          titulo: "Propriété intellectuelle et industrielle",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Les textes, la structure, le design, les illustrations et le code de ce site appartiennent à son titulaire ou sont utilisés sous licence. Vous pouvez les citer en indiquant la source ; leur reproduction ou leur exploitation commerciale requiert une autorisation écrite préalable.",
            },
            {
              tipo: "parrafo",
              texto:
                "SEDA Private Homes, ainsi que les noms de ses outils internes, sont utilisés comme signes distinctifs du titulaire.",
            },
            {
              tipo: "parrafo",
              texto:
                "Les distinctions affichées sur la page « Nous » appartiennent aux plateformes qui les décernent — Tripadvisor, Booking.com, Expedia, Orbitz et Core Hospitality — et sont présentées à titre informatif, en référence à l'Hotel Estepona Plaza. Leurs images sont servies depuis hotelesteponaplaza.com.",
            },
          ],
        },
        {
          id: "enlaces",
          titulo: "Liens vers des sites tiers",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Ce site renvoie vers des destinations qu'il ne contrôle pas : l'application voyageurs (guests.sedaprivatehomes.com), le portail propriétaires (portal.sedaprivatehomes.com), hotelesteponaplaza.com et des plateformes d'avis.",
            },
            {
              tipo: "parrafo",
              texto:
                "Le titulaire n'est pas responsable du contenu, de la disponibilité ni des pratiques de confidentialité de ces destinations. Dès que vous suivez un lien externe, ce sont leurs conditions qui s'appliquent, et non les présentes.",
            },
          ],
        },
        {
          id: "responsabilidad",
          titulo: "Responsabilité",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Le titulaire s'efforce de maintenir le site disponible et son information exacte et à jour, sans pouvoir garantir un service ininterrompu ou exempt d'erreurs ; il peut modifier, suspendre ou retirer des contenus à tout moment.",
            },
            {
              tipo: "parrafo",
              texto:
                "Les informations publiées ont une valeur informative et ne constituent pas une offre contractuelle ferme. Les conditions d'un séjour ou d'un mandat de gestion sont convenues par écrit avec chaque voyageur ou propriétaire.",
            },
          ],
        },
        {
          id: "datos",
          titulo: "Protection des données et cookies",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Le traitement des données que vous envoyez par le formulaire, par courriel ou par téléphone est expliqué dans la politique de confidentialité. Ce que ce site conserve dans votre navigateur — un seul cookie, pour mémoriser la langue — est expliqué dans la politique relative aux cookies.",
            },
          ],
          enlaces: [
            { href: "/privacidad", etiqueta: "Politique de confidentialité" },
            { href: "/cookies", etiqueta: "Politique relative aux cookies" },
          ],
        },
        {
          id: "ley-aplicable",
          titulo: "Droit applicable",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Les présentes mentions légales sont régies par le droit espagnol. Pour tout litige relatif au site, les parties se soumettent aux juridictions compétentes selon les règles applicables. Si vous êtes consommateur, vous conservez intégralement les fors que la législation de consommation vous reconnaît, lesquels priment sur ce qui précède.",
            },
          ],
        },
        {
          id: "contacto",
          titulo: "Contact",
          bloques: [
            {
              tipo: "parrafo",
              texto: "Pour toute question relative à ces mentions légales : {email} · {telefono}.",
            },
          ],
        },
      ],
    },

    de: {
      titulo: "Impressum",
      entradilla:
        "Wer sedaprivatehomes.com betreibt, zu welchen Bedingungen und mit welcher Verantwortung. Veröffentlicht gemäß Artikel 10 des spanischen Gesetzes 34/2002 über Dienste der Informationsgesellschaft und den elektronischen Geschäftsverkehr.",
      secciones: [
        {
          id: "titular",
          titulo: "Inhaber der Website",
          bloques: [
            { tipo: "identificacion" },
            {
              tipo: "parrafo",
              texto:
                "SEDA Private Homes ist die Geschäftsbezeichnung, unter der die oben genannte natürliche Person die auf dieser Website beschriebenen Leistungen erbringt.",
            },
            {
              tipo: "parrafo",
              texto:
                "Eine Gesellschaft ist noch nicht gegründet: Es gibt keine Firma, keine Umsatzsteuer-Identifikationsnummer einer Gesellschaft und keine Eintragung im Handelsregister, die anzugeben wären. Wir sagen das lieber, als den Abschnitt leer zu lassen. Sobald die Gesellschaft gegründet und eingetragen ist, stehen hier ihre Daten, und das Revisionsdatum am Ende der Seite ändert sich.",
            },
          ],
        },
        {
          id: "objeto",
          titulo: "Was diese Website ist",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "sedaprivatehomes.com ist eine Informationswebsite. Sie beschreibt, wie SEDA Private Homes Villen verwaltet, welche Leistungen Gäste und Eigentümer erhalten und auf welcher Technologie das Ganze läuft.",
            },
            {
              tipo: "parrafo",
              texto:
                "Es gibt kein Online-Vertragssystem. Die Website veröffentlicht weder Verfügbarkeiten noch Preise, verarbeitet keine Zahlungen und bestätigt keine Buchungen. Was Sie über das Kontaktformular senden, kommt als E-Mail an und wird anschließend individuell außerhalb der Website bearbeitet.",
            },
            {
              tipo: "parrafo",
              texto:
                "Die Bilder, die Immobilien zeigen, sind konzeptionelle Renderings und keine Fotografien konkreter Objekte. Echte Fotografien jeder Villa werden auf direkte Anfrage beim Team bereitgestellt.",
            },
          ],
        },
        {
          id: "uso",
          titulo: "Nutzungsbedingungen",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Der Zugang ist frei, kostenlos und ohne Registrierung. Mit der Nutzung verpflichten Sie sich, die Website rechtmäßig und nach Treu und Glauben zu nutzen: nicht zu rechtswidrigen Zwecken, ohne Zugriffsversuche auf nicht öffentliche Bereiche und ohne über das Formular Inhalte zu senden, die Ihnen nicht gehören oder fremde Systeme schädigen könnten.",
            },
            {
              tipo: "parrafo",
              texto:
                "Das Formular erzwingt technische Grenzen für Nachrichtengröße, Feldanzahl und Sendefrequenz. Übersteigende Übermittlungen werden mit einem Fehler abgewiesen, ohne dass ihr Inhalt gespeichert wird.",
            },
          ],
        },
        {
          id: "propiedad-intelectual",
          titulo: "Geistiges und gewerbliches Eigentum",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Texte, Struktur, Gestaltung, Illustrationen und Code dieser Website gehören dem Inhaber oder werden lizenziert genutzt. Zitieren mit Quellenangabe ist erlaubt; Vervielfältigung oder kommerzielle Verwertung bedarf der vorherigen schriftlichen Zustimmung.",
            },
            {
              tipo: "parrafo",
              texto:
                "SEDA Private Homes sowie die Namen der internen Werkzeuge werden als Kennzeichen des Inhabers verwendet.",
            },
            {
              tipo: "parrafo",
              texto:
                "Die auf der Seite „Über uns“ gezeigten Auszeichnungen gehören den verleihenden Plattformen — Tripadvisor, Booking.com, Expedia, Orbitz und Core Hospitality — und werden informativ mit Bezug auf das Hotel Estepona Plaza gezeigt. Ihre Bilddateien werden von hotelesteponaplaza.com ausgeliefert.",
            },
          ],
        },
        {
          id: "enlaces",
          titulo: "Links zu Websites Dritter",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Diese Website verlinkt Ziele, die sie nicht kontrolliert: die Gäste-App (guests.sedaprivatehomes.com), das Eigentümerportal (portal.sedaprivatehomes.com), hotelesteponaplaza.com und Bewertungsplattformen.",
            },
            {
              tipo: "parrafo",
              texto:
                "Der Inhaber haftet nicht für Inhalt, Verfügbarkeit oder Datenschutzpraxis dieser Ziele. Ab dem Moment, in dem Sie einem externen Link folgen, gelten deren Bedingungen und nicht diese.",
            },
          ],
        },
        {
          id: "responsabilidad",
          titulo: "Haftung",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Der Inhaber bemüht sich um Verfügbarkeit und um richtige, aktuelle Informationen, kann aber weder einen unterbrechungsfreien noch einen fehlerfreien Betrieb garantieren und darf Inhalte jederzeit ändern, aussetzen oder entfernen.",
            },
            {
              tipo: "parrafo",
              texto:
                "Die veröffentlichten Informationen sind informativ und stellen kein bindendes Vertragsangebot dar. Die Bedingungen eines Aufenthalts oder eines Verwaltungsauftrags werden mit jedem Gast bzw. Eigentümer schriftlich vereinbart.",
            },
          ],
        },
        {
          id: "datos",
          titulo: "Datenschutz und Cookies",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Wie die Daten verarbeitet werden, die Sie über das Formular, per E-Mail oder telefonisch senden, steht in der Datenschutzerklärung. Was diese Website in Ihrem Browser speichert — ein einziges Cookie, für die Sprache — steht in der Cookie-Richtlinie.",
            },
          ],
          enlaces: [
            { href: "/privacidad", etiqueta: "Datenschutzerklärung" },
            { href: "/cookies", etiqueta: "Cookie-Richtlinie" },
          ],
        },
        {
          id: "ley-aplicable",
          titulo: "Anwendbares Recht",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Dieses Impressum unterliegt spanischem Recht. Für Streitigkeiten über die Website unterwerfen sich die Parteien den nach den anwendbaren Vorschriften zuständigen Gerichten. Als Verbraucher behalten Sie uneingeschränkt die Gerichtsstände, die Ihnen das Verbraucherrecht zuerkennt; diese gehen dem Vorstehenden vor.",
            },
          ],
        },
        {
          id: "contacto",
          titulo: "Kontakt",
          bloques: [
            {
              tipo: "parrafo",
              texto: "Für alle Fragen zu diesem Impressum: {email} · {telefono}.",
            },
          ],
        },
      ],
    },
  },
}
