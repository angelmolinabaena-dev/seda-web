import type { DocumentoLegalMultilingue } from "./types"

/*
  Política de privacidad — artículos 13 y 14 del RGPD y LOPDGDD 3/2018.

  NO es una copia de la de `guest-app`. Aquella describe el tratamiento de
  datos de HUÉSPEDES alojados (documento de identidad, registro de viajeros
  del RD 933/2021, obligación legal). Aquí no hay nada de eso: este sitio
  tiene dos entradas de datos.

    1. El formulario de contacto, que produce un correo electrónico —
       mayoritariamente de propietarios potenciales y de huéspedes que aún no
       han reservado— cuya base jurídica es precontractual o de interés
       legítimo, nunca una obligación legal de registro.
    2. El formulario de la calculadora para propietarios
       (`/propietarios/calculadora`, detrás de `SEDA_FLAG_CALCULADORA_PROPIETARIOS`),
       cuya base jurídica es el consentimiento (art. 6.1.a) y que SÍ acaba en
       una base de datos: el CRM interno de SEDA, en el portal (seda_os).

  Este sitio sigue sin base de datos propia: `package.json` no tiene ningún
  cliente de base de datos. Lo que hay detrás de UN formulario —el de la
  calculadora— es la base de datos del portal, a la que seda-web solo
  reenvía; por eso la política dice «sin base de datos propia» y no «sin base
  de datos».

  Los datos de cada tabla salen del código, no de una plantilla:

    · Campos de cada variante del formulario de contacto:
      `app/[locale]/contacto/ContactoContent.tsx` — GuestForm, OwnerForm,
      OtherForm.
    · Destino de lo enviado por contacto: `app/api/contact/route.ts` — se
      compone un correo y se entrega con la API de Resend al buzón `info@`.
      No hay escritura en base de datos.
    · Calculadora (4-nov-2026): campos en
      `app/[locale]/propietarios/calculadora/CalculadoraContent.tsx`;
      validación en `lib/lead-propietario.ts` (`validarLead`) y reenvío en
      `app/api/leads/propietario/route.ts`. `cuerpoPortal` es el contrato con
      seda_os: nombre, correo, teléfono, municipio, dormitorios, consentimiento
      y su versión (= `PRIVACIDAD.actualizado`). El precio por noche y la
      ocupación llegan a la función de este sitio para recalcular la
      estimación, pero NO viajan al portal ni se guardan. El portal los
      guarda en `leads_propietarios` (solo accesible por el servidor del
      admin) con base jurídica «consentimiento» y avisa a `info@` con un
      correo sin datos personales. Plazo, encargados y región, de
      portal-propietarios: `docs/CONSERVACION-DATOS.md`,
      `docs/privacidad/RAT-CRM-CAPTACION.md` (1 año desde el último contacto
      si no hay contrato; Vercel y Supabase como encargados),
      `docs/DPA_Annex_Art28_v4.md` (Supabase `eu-central-1`, Fráncfort) y su
      `vercel.json` (`regions: ["fra1"]`, como este repo).
    · IP: `rateLimit()` en esa misma ruta la guarda en un `Map` en memoria
      con ventana de 10 minutos (`RATE_LIMIT_WINDOW_MS`). No se persiste.
    · Ausencia de analítica y de píxeles: comprobado por búsqueda en todo el
      árbol (`analytics`, `gtag`, `fbq`, `hotjar`, `clarity`, `posthog`,
      `plausible`, `SpeedInsights`) — cero coincidencias.
    · Calendly (15-oct-2026): `app/[locale]/meet/page.tsx` inserta el
      calendario en un iframe detrás de una fachada
      (`app/[locale]/meet/CalendlyFachada.tsx`: el iframe solo se monta al
      pulsar «Ver calendario») y `app/[locale]/founding-owners/page.tsx`
      enlaza a él. Datos pedidos, leídos del tipo de evento en la API de
      Calendly: nombre, email, día y hora, y una pregunta libre opcional;
      lugar `google_conference` (Google Meet). El iframe hace que
      calendly.com fije, al abrirlo, cookies propias (`_calendly_session`, `__cf_bm`,
      `_cfuvid`), medido con una petición a la URL del iframe.
    · Las valoraciones de huéspedes NO van aquí: viven en guest-app, que
      tiene su propia política (`/legal/privacidad`) y no enlaza a esta.
*/

export const PRIVACIDAD: DocumentoLegalMultilingue = {
  id: "privacidad",
  ruta: "/privacidad",
  actualizado: "2026-11-06",
  traducciones: {
    es: {
      titulo: "Política de privacidad",
      entradilla:
        "Qué datos recogemos en sedaprivatehomes.com, para qué, con qué base legal, quién más los ve y cómo ejerces tus derechos. Información facilitada conforme a los artículos 13 y 14 del Reglamento (UE) 2016/679.",
      secciones: [
        {
          id: "responsable",
          titulo: "Quién es el responsable",
          bloques: [
            { tipo: "identificacion" },
            {
              tipo: "parrafo",
              texto:
                "Para cualquier cuestión relacionada con tus datos —incluido el ejercicio de tus derechos— escribe a {email}. Es un buzón real que se lee; no publicamos una dirección de contacto que no atendamos.",
            },
          ],
        },
        {
          id: "datos",
          titulo: "Qué datos tratamos",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Solo tratamos los datos que nos das tú. No los compramos, no los obtenemos de terceros y no los completamos con fuentes externas.",
            },
            {
              tipo: "tabla",
              cabeceras: ["Por dónde llegan", "Qué datos son"],
              filas: [
                [
                  "Formulario de contacto, opción «Estancia»",
                  "Fechas de entrada y salida, zona, número de huéspedes, tipo de propiedad, servicios de interés, comentarios, nombre, correo electrónico y, si lo indicas, teléfono o WhatsApp.",
                ],
                [
                  "Formulario de contacto, opción «Propiedad»",
                  "Ubicación de la propiedad, tipo, número de dormitorios, situación actual, objetivo, comentarios, nombre, correo electrónico y, si lo indicas, teléfono o WhatsApp.",
                ],
                [
                  "Formulario de contacto, opción «Otros»",
                  "Nombre, organización (opcional), correo electrónico, asunto y mensaje.",
                ],
                [
                  "Calculadora para propietarios (página /propietarios/calculadora)",
                  "Nombre y correo electrónico (obligatorios); si lo indicas, teléfono, municipio y número de dormitorios de tu propiedad; y la casilla de consentimiento, que debe marcarse expresamente. El precio por noche y la ocupación que introduces solo sirven para calcular la estimación en pantalla: no se reenvían a nuestro registro de contactos ni se guardan.",
                ],
                [
                  "Reserva de una llamada con Calendly (páginas /meet y /founding-owners)",
                  "Nombre, correo electrónico, día y hora elegidos, tu zona horaria y, si lo escribes, lo que quieras contarnos para preparar la reunión. Detalle en «Reserva de una llamada con Calendly».",
                ],
                [
                  "Correo o teléfono directos",
                  "Lo que decidas incluir en tu mensaje o contarnos en la llamada.",
                ],
                [
                  "Simple visita al sitio",
                  "Dirección IP y datos técnicos de la petición (navegador, sistema, página solicitada), tratados por el proveedor de alojamiento en sus registros de servicio.",
                ],
              ],
            },
            {
              tipo: "parrafo",
              texto:
                "Los campos marcados con asterisco en el formulario son los imprescindibles para poder responderte. El resto es voluntario y solo sirve para responder mejor.",
            },
            {
              tipo: "parrafo",
              texto:
                "No recogemos datos con fines analíticos, publicitarios ni de perfilado. Este sitio no tiene ninguna herramienta de medición —ni Google Analytics, ni Vercel Analytics, ni equivalentes— ni píxeles de redes sociales. Las únicas cookies de terceros son las que pone Calendly si, en /meet, pulsas «Ver calendario» (ver «Reserva de una llamada con Calendly»).",
            },
          ],
        },
        {
          id: "finalidad",
          titulo: "Para qué, y con qué base jurídica",
          bloques: [
            {
              tipo: "tabla",
              cabeceras: ["Finalidad", "Base jurídica"],
              filas: [
                [
                  "Atender tu solicitud de estancia o de valoración de tu propiedad y preparar, si procede, la relación contractual.",
                  "Artículo 6.1.b del RGPD: aplicación de medidas precontractuales adoptadas a tu petición.",
                ],
                [
                  "Responder a cualquier otra comunicación que nos dirijas por el formulario, por correo o por teléfono.",
                  "Artículo 6.1.f del RGPD: interés legítimo en atender a quien nos escribe.",
                ],
                [
                  "Limitar envíos automatizados o abusivos del formulario.",
                  "Artículo 6.1.f del RGPD: interés legítimo en la seguridad y disponibilidad del servicio.",
                ],
                [
                  "Organizar y celebrar la videollamada que reservas con Calendly.",
                  "Artículo 6.1.b del RGPD: aplicación de medidas precontractuales adoptadas a tu petición.",
                ],
                [
                  "Contactarte para valorar la gestión de tu propiedad, cuando dejas tus datos en la calculadora para propietarios.",
                  "Artículo 6.1.a del RGPD: tu consentimiento, que das marcando la casilla del formulario. Guardamos la versión de esta política que viste al darlo. Guardamos también el idioma de la página desde la que envías el formulario, para contestarte en ese idioma.",
                ],
              ],
            },
            {
              tipo: "parrafo",
              texto:
                "Puedes retirar el consentimiento que das en la calculadora cuando quieras, escribiendo a {email}. Retirarlo no afecta a la licitud del tratamiento realizado antes de la retirada.",
            },
            {
              tipo: "parrafo",
              texto:
                "No usamos tus datos para enviarte comunicaciones comerciales. Si algún día existe un boletín, requerirá tu consentimiento expreso y separado, y podrás retirarlo cuando quieras.",
            },
          ],
        },
        {
          id: "destinatarios",
          titulo: "Quién más ve estos datos",
          bloques: [
            {
              tipo: "tabla",
              cabeceras: ["Destinatario", "Qué hace con los datos", "Dónde está"],
              filas: [
                [
                  "Vercel Inc.",
                  "Aloja el sitio y el portal de SEDA (portal.sedaprivatehomes.com) y ejecuta las funciones que procesan los formularios y reenvían al portal lo que dejas en la calculadora. Registra datos técnicos de cada petición, incluida la IP.",
                  "Estados Unidos. Las funciones del sitio y del portal se ejecutan en Fráncfort (UE).",
                ],
                [
                  "Supabase Inc.",
                  "Aloja la base de datos del registro interno de contactos de SEDA (CRM), donde se guardan los datos que dejas en la calculadora para propietarios. Solo accede a ella el servidor de administración de SEDA.",
                  "Estados Unidos. La base de datos está en Fráncfort (UE).",
                ],
                [
                  "Resend, Inc.",
                  "Entrega el correo que contiene lo que has escrito en el formulario.",
                  "Estados Unidos",
                ],
                [
                  "{proveedorCorreo}",
                  "Presta el servicio del buzón {email}, donde el mensaje queda alojado.",
                  "Ver la columna anterior",
                ],
              ],
            },
            {
              tipo: "parrafo",
              texto:
                "Si dejas tus datos en la calculadora para propietarios, el servidor de este sitio los reenvía al portal de SEDA, que los guarda en su registro interno de contactos (alojado en Supabase y Vercel, ver arriba). Cuando llegan, el portal avisa al buzón {email} con un correo, entregado también por Resend, que no contiene datos personales.",
            },
            {
              tipo: "parrafo",
              texto:
                "Si reservas una llamada, tus datos los tratan además Calendly y Google Ireland Limited, como se explica en «Reserva de una llamada con Calendly». No hay más destinatarios. No vendemos ni cedemos datos a terceros con fines comerciales. Solo se comunicarían a autoridades u organismos públicos si una norma lo exigiera.",
            },
            {
              tipo: "parrafo",
              texto:
                "Vercel, Resend, Supabase y Calendly son sociedades estadounidenses: el tratamiento implica una transferencia internacional de datos fuera del Espacio Económico Europeo. Puedes pedirnos información sobre las garantías aplicables a esa transferencia escribiendo a {email}.",
            },
          ],
        },
        {
          id: "calendly",
          titulo: "Reserva de una llamada con Calendly",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Desde las páginas /meet y /founding-owners puedes reservar una videollamada de 30 minutos con nosotros. La reserva no la gestiona esta web, sino Calendly: su calendario se puede abrir dentro de /meet y está enlazado desde /founding-owners.",
            },
            {
              tipo: "tabla",
              cabeceras: ["Aspecto", "Reserva de una llamada"],
              filas: [
                [
                  "Finalidad",
                  "Organizar y celebrar la llamada que has pedido, normalmente para hablar de la gestión de tu propiedad.",
                ],
                [
                  "Datos",
                  "Nombre, correo electrónico, día y hora elegidos y tu zona horaria. Si lo rellenas, el campo opcional en el que nos cuentas lo que ayude a preparar la reunión.",
                ],
                [
                  "Base jurídica",
                  "Artículo 6.1.b del RGPD: aplicación de medidas precontractuales adoptadas a tu petición.",
                ],
                [
                  "Quién los ve",
                  "SEDA. Calendly nos notifica la reserva en el buzón {email}.",
                ],
                [
                  "Encargados del tratamiento",
                  "Calendly LLC (Estados Unidos): gestiona la agenda, guarda la reserva y te envía la confirmación y los recordatorios. Google Ireland Limited (Google Calendar y Google Meet): la cita se anota en nuestro calendario y la llamada se celebra por Google Meet. Y el proveedor del buzón {email}, donde llega el aviso.",
                ],
                [
                  "Conservación",
                  "12 meses desde la fecha de la llamada. Si de ella nace un contrato de gestión, los datos pasan al expediente del propietario y se conservan según ese contrato.",
                ],
              ],
            },
            {
              tipo: "parrafo",
              texto:
                "Abrir la página /meet no conecta con Calendly. Al pulsar «Ver calendario», tu navegador carga el calendario directamente desde calendly.com: Calendly recibe tu dirección IP y fija sus propias cookies (detalle en la política de cookies), aunque no llegues a reservar. Si prefieres evitarlo, no abras el calendario: escríbenos a {email} y te proponemos día y hora por correo.",
            },
          ],
        },
        {
          id: "conservacion",
          titulo: "Cuánto tiempo los conservamos",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Tu mensaje queda en el buzón {email} hasta que se elimina. No hay borrado automático programado, y preferimos decirlo a prometer un plazo que no cumpliríamos.",
            },
            {
              tipo: "parrafo",
              texto:
                "En la práctica: si la solicitud no deriva en una relación, el mensaje se conserva mientras pueda ser útil para atenderte o para responder de la propia comunicación, y se elimina en las revisiones del buzón. Si prefieres que lo borremos antes, escríbenos y lo borramos.",
            },
            {
              tipo: "parrafo",
              texto:
                "Si la solicitud sí deriva en una relación contractual, los datos pasan a conservarse durante la relación y después durante los plazos que impongan la normativa fiscal y de prescripción de responsabilidades.",
            },
            {
              tipo: "parrafo",
              texto:
                "Los datos que dejas en la calculadora para propietarios se conservan en el registro interno de contactos de SEDA durante 1 año desde nuestro último contacto contigo (llamada, correo o visita), si no llegas a firmar un contrato de gestión; al vencer ese plazo se suprimen. Si firmas, pasan al expediente del propietario y se conservan según ese contrato. Si pides su supresión, los borramos antes.",
            },
            {
              tipo: "parrafo",
              texto:
                "El control de frecuencia de los formularios guarda tu dirección IP en memoria durante diez minutos como máximo: no se escribe en ninguna base de datos y no sobrevive al reinicio del servicio. Los registros técnicos del proveedor de alojamiento se conservan según sus propios plazos, que no decidimos nosotros.",
            },
          ],
        },
        {
          id: "donde-no-estan",
          titulo: "Dónde no están tus datos",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Esta web no tiene base de datos propia ni registro de usuarios: lo que envías por el formulario de contacto se convierte en un correo electrónico y vive en un buzón. La única excepción es la calculadora para propietarios: lo que dejas en ella, y solo eso, lo reenvía el servidor de esta web al registro interno de contactos de SEDA, que está en el portal y no en esta web. Es una limitación deliberada — cuantos menos sitios guarden tus datos, menos sitios pueden perderlos.",
            },
          ],
        },
        {
          id: "derechos",
          titulo: "Tus derechos",
          bloques: [
            {
              tipo: "parrafo",
              texto: "Sobre tus datos puedes ejercer estos derechos:",
            },
            {
              tipo: "lista",
              items: [
                "Acceso: saber qué datos tuyos tratamos.",
                "Rectificación: corregir los que sean inexactos.",
                "Supresión: pedir que los borremos.",
                "Oposición: oponerte a un tratamiento basado en interés legítimo.",
                "Limitación: pedir que los conservemos sin usarlos mientras se resuelve una reclamación.",
                "Portabilidad: recibir en un formato legible los datos que nos hayas facilitado.",
              ],
            },
            {
              tipo: "parrafo",
              texto:
                "Para ejercerlos, escribe a {email} desde la misma dirección con la que contactaste o adjuntando un documento que permita identificarte. Responderemos dentro del plazo de un mes que fija el artículo 12 del RGPD.",
            },
            {
              tipo: "parrafo",
              texto:
                "Si consideras que no hemos atendido bien tu solicitud, puedes reclamar ante la Agencia Española de Protección de Datos (C/ Jorge Juan, 6 — 28001 Madrid), en www.aepd.es.",
            },
          ],
        },
        {
          id: "menores-decisiones",
          titulo: "Menores y decisiones automatizadas",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "El sitio no se dirige a menores de catorce años y no solicita datos de menores.",
            },
            {
              tipo: "parrafo",
              texto:
                "No tomamos decisiones automatizadas ni elaboramos perfiles con tus datos: cada mensaje lo lee una persona.",
            },
          ],
        },
        {
          id: "seguridad",
          titulo: "Seguridad",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "El sitio se sirve exclusivamente por HTTPS, con HSTS activado. El formulario valida el formato de la dirección de correo y limita el tamaño del mensaje, el número de campos y la frecuencia de envío; lo que no cumple esas condiciones se rechaza sin procesarse.",
            },
            {
              tipo: "parrafo",
              texto:
                "Ningún sistema es infalible. Si se produjera una brecha que afecte a tus datos, actuaremos conforme a los artículos 33 y 34 del RGPD.",
            },
          ],
        },
        {
          id: "cambios",
          titulo: "Cambios en esta política",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Si cambia lo que hacemos con los datos, cambia este texto antes. La fecha de la última revisión aparece al final de la página.",
            },
          ],
          enlaces: [
            { href: "/aviso-legal", etiqueta: "Aviso legal" },
            { href: "/cookies", etiqueta: "Política de cookies" },
          ],
        },
      ],
    },

    en: {
      titulo: "Privacy policy",
      entradilla:
        "What data we collect on sedaprivatehomes.com, what for, on what legal basis, who else sees it and how you exercise your rights. Provided under articles 13 and 14 of Regulation (EU) 2016/679.",
      secciones: [
        {
          id: "responsable",
          titulo: "Who the controller is",
          bloques: [
            { tipo: "identificacion" },
            {
              tipo: "parrafo",
              texto:
                "For anything concerning your data — including exercising your rights — write to {email}. It is a real mailbox that gets read; we do not publish a contact address we do not attend.",
            },
          ],
        },
        {
          id: "datos",
          titulo: "What data we process",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "We only process the data you give us. We do not buy it, do not obtain it from third parties and do not enrich it from external sources.",
            },
            {
              tipo: "tabla",
              cabeceras: ["How it reaches us", "What it consists of"],
              filas: [
                [
                  "Contact form, “Stay” option",
                  "Arrival and departure dates, area, number of guests, property type, services of interest, notes, name, email address and, if you provide it, phone or WhatsApp.",
                ],
                [
                  "Contact form, “Property” option",
                  "Property location, type, number of bedrooms, current situation, goal, notes, name, email address and, if you provide it, phone or WhatsApp.",
                ],
                [
                  "Contact form, “Other” option",
                  "Name, organisation (optional), email address, subject and message.",
                ],
                [
                  "Owner calculator (/propietarios/calculadora page)",
                  "Name and email address (required); if you provide them, phone number, municipality and number of bedrooms of your property; and the consent checkbox, which you must tick yourself. The nightly price and the occupancy you enter are only used to work out the estimate on screen: they are not forwarded to our contacts register and are not stored.",
                ],
                [
                  "Booking a call with Calendly (/meet and /founding-owners pages)",
                  "Name, email address, chosen day and time, your time zone and, if you write it, anything you want to tell us to prepare the meeting. Details under “Booking a call with Calendly”.",
                ],
                [
                  "Direct email or phone",
                  "Whatever you choose to include in your message or tell us on the call.",
                ],
                [
                  "Simply visiting the site",
                  "IP address and technical request data (browser, system, page requested), processed by the hosting provider in its service logs.",
                ],
              ],
            },
            {
              tipo: "parrafo",
              texto:
                "The fields marked with an asterisk on the form are the ones we need in order to reply. The rest is optional and only helps us reply better.",
            },
            {
              tipo: "parrafo",
              texto:
                "We collect no data for analytics, advertising or profiling. This site has no measurement tool at all — no Google Analytics, no Vercel Analytics, nothing equivalent — and no social network pixels. The only third-party cookies are the ones Calendly sets if, on /meet, you press “View calendar” (see “Booking a call with Calendly”).",
            },
          ],
        },
        {
          id: "finalidad",
          titulo: "What for, and on what legal basis",
          bloques: [
            {
              tipo: "tabla",
              cabeceras: ["Purpose", "Legal basis"],
              filas: [
                [
                  "Handle your stay enquiry or property valuation request and, where appropriate, prepare the contractual relationship.",
                  "Article 6(1)(b) GDPR: pre-contractual steps taken at your request.",
                ],
                [
                  "Reply to any other communication you send us through the form, by email or by phone.",
                  "Article 6(1)(f) GDPR: legitimate interest in answering whoever writes to us.",
                ],
                [
                  "Limit automated or abusive form submissions.",
                  "Article 6(1)(f) GDPR: legitimate interest in the security and availability of the service.",
                ],
                [
                  "Organise and hold the video call you book with Calendly.",
                  "Article 6(1)(b) GDPR: pre-contractual steps taken at your request.",
                ],
                [
                  "Contact you to assess the management of your property, when you leave your details in the owner calculator.",
                  "Article 6(1)(a) GDPR: your consent, which you give by ticking the checkbox on the form. We record the version of this policy you saw when you gave it. We also record the language of the page you submit the form from, so that we reply in that language.",
                ],
              ],
            },
            {
              tipo: "parrafo",
              texto:
                "You can withdraw the consent you give in the calculator at any time by writing to {email}. Withdrawing it does not affect the lawfulness of processing carried out before the withdrawal.",
            },
            {
              tipo: "parrafo",
              texto:
                "We do not use your data to send you marketing. If a newsletter ever exists, it will require your express, separate consent, which you can withdraw at any time.",
            },
          ],
        },
        {
          id: "destinatarios",
          titulo: "Who else sees this data",
          bloques: [
            {
              tipo: "tabla",
              cabeceras: ["Recipient", "What it does with the data", "Where it is"],
              filas: [
                [
                  "Vercel Inc.",
                  "Hosts the site and SEDA's portal (portal.sedaprivatehomes.com) and runs the functions that process the forms and forward to the portal what you leave in the calculator. Logs technical data of each request, including the IP address.",
                  "United States. The site and portal functions run in Frankfurt (EU).",
                ],
                [
                  "Supabase Inc.",
                  "Hosts the database of SEDA's internal contacts register (CRM), where the details you leave in the owner calculator are stored. Only SEDA's administration server can access it.",
                  "United States. The database is in Frankfurt (EU).",
                ],
                [
                  "Resend, Inc.",
                  "Delivers the email containing what you wrote in the form.",
                  "United States",
                ],
                [
                  "{proveedorCorreo}",
                  "Provides the {email} mailbox service, where the message is stored.",
                  "See previous column",
                ],
              ],
            },
            {
              tipo: "parrafo",
              texto:
                "If you leave your details in the owner calculator, this site's server forwards them to SEDA's portal, which stores them in its internal contacts register (hosted on Supabase and Vercel, see above). When they arrive, the portal notifies the {email} mailbox with an email, also delivered by Resend, that contains no personal data.",
            },
            {
              tipo: "parrafo",
              texto:
                "If you book a call, your data is also processed by Calendly and Google Ireland Limited, as explained under “Booking a call with Calendly”. There are no other recipients. We do not sell or transfer data to third parties for commercial purposes. Data would only be disclosed to authorities or public bodies if a legal rule required it.",
            },
            {
              tipo: "parrafo",
              texto:
                "Vercel, Resend, Supabase and Calendly are US companies, so the processing involves an international transfer of data outside the European Economic Area. You can ask us about the safeguards applicable to that transfer by writing to {email}.",
            },
          ],
        },
        {
          id: "calendly",
          titulo: "Booking a call with Calendly",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "From the /meet and /founding-owners pages you can book a 30-minute video call with us. The booking is not handled by this website but by Calendly: its calendar can be opened within /meet and is linked from /founding-owners.",
            },
            {
              tipo: "tabla",
              cabeceras: ["Aspect", "Booking a call"],
              filas: [
                [
                  "Purpose",
                  "Organise and hold the call you asked for, usually to talk about managing your property.",
                ],
                [
                  "Data",
                  "Name, email address, chosen day and time and your time zone. If you fill it in, the optional field where you tell us anything that helps prepare the meeting.",
                ],
                [
                  "Legal basis",
                  "Article 6(1)(b) GDPR: pre-contractual steps taken at your request.",
                ],
                [
                  "Who sees it",
                  "SEDA. Calendly notifies us of the booking in the {email} mailbox.",
                ],
                [
                  "Processors",
                  "Calendly LLC (United States): manages the schedule, stores the booking and sends you the confirmation and reminders. Google Ireland Limited (Google Calendar and Google Meet): the appointment goes into our calendar and the call takes place on Google Meet. And the provider of the {email} mailbox, where the notification arrives.",
                ],
                [
                  "Retention",
                  "12 months from the date of the call. If it leads to a management contract, the data moves to the owner's file and is kept as that contract provides.",
                ],
              ],
            },
            {
              tipo: "parrafo",
              texto:
                "Opening the /meet page does not connect to Calendly. When you press “View calendar”, your browser loads the calendar directly from calendly.com: Calendly receives your IP address and sets its own cookies (details in the cookie policy), even if you do not book. If you would rather avoid that, do not open the calendar: write to {email} and we will suggest a day and time by email.",
            },
          ],
        },
        {
          id: "conservacion",
          titulo: "How long we keep it",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Your message stays in the {email} mailbox until it is deleted. There is no scheduled automatic deletion, and we would rather say so than promise a retention period we would not honour.",
            },
            {
              tipo: "parrafo",
              texto:
                "In practice: if the enquiry does not lead to a relationship, the message is kept while it may still be useful to answer you or to account for the exchange itself, and is deleted when the mailbox is reviewed. If you would rather we deleted it sooner, write to us and we will.",
            },
            {
              tipo: "parrafo",
              texto:
                "If the enquiry does lead to a contractual relationship, the data is then kept for the duration of that relationship and afterwards for the periods imposed by tax rules and by limitation periods for liability.",
            },
            {
              tipo: "parrafo",
              texto:
                "The details you leave in the owner calculator are kept in SEDA's internal contacts register for 1 year from our last contact with you (call, email or visit), if you do not end up signing a management contract; when that period ends they are deleted. If you sign, they pass to the owner's file and are kept in line with that contract. If you ask for them to be deleted, we delete them sooner.",
            },
            {
              tipo: "parrafo",
              texto:
                "The forms' rate limiter holds your IP address in memory for ten minutes at most: it is never written to a database and does not survive a restart of the service. The hosting provider's technical logs are kept for its own periods, which we do not decide.",
            },
          ],
        },
        {
          id: "donde-no-estan",
          titulo: "Where your data is not",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "This website has no database of its own and no user registry: what you send through the contact form becomes an email and lives in a mailbox. The only exception is the owner calculator: what you leave in it, and only that, is forwarded by this website's server to SEDA's internal contacts register, which is in the portal and not on this website. That is a deliberate limitation — the fewer places that hold your data, the fewer places can lose it.",
            },
          ],
        },
        {
          id: "derechos",
          titulo: "Your rights",
          bloques: [
            { tipo: "parrafo", texto: "You may exercise these rights over your data:" },
            {
              tipo: "lista",
              items: [
                "Access: find out what data of yours we process.",
                "Rectification: correct anything inaccurate.",
                "Erasure: ask us to delete it.",
                "Objection: object to processing based on legitimate interest.",
                "Restriction: ask us to keep it without using it while a claim is resolved.",
                "Portability: receive the data you provided in a readable format.",
              ],
            },
            {
              tipo: "parrafo",
              texto:
                "To exercise them, write to {email} from the same address you contacted us with, or attach a document that identifies you. We will reply within the one-month period set by article 12 GDPR.",
            },
            {
              tipo: "parrafo",
              texto:
                "If you believe we have not handled your request properly, you may lodge a complaint with the Spanish Data Protection Agency (C/ Jorge Juan, 6 — 28001 Madrid), at www.aepd.es.",
            },
          ],
        },
        {
          id: "menores-decisiones",
          titulo: "Minors and automated decisions",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "The site is not directed at children under fourteen and does not request data about minors.",
            },
            {
              tipo: "parrafo",
              texto:
                "We take no automated decisions and build no profiles from your data: every message is read by a person.",
            },
          ],
        },
        {
          id: "seguridad",
          titulo: "Security",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "The site is served over HTTPS only, with HSTS enabled. The form validates the email address format and limits message size, number of fields and submission frequency; anything that fails those conditions is rejected without being processed.",
            },
            {
              tipo: "parrafo",
              texto:
                "No system is infallible. Should a breach affect your data, we will act in accordance with articles 33 and 34 GDPR.",
            },
          ],
        },
        {
          id: "cambios",
          titulo: "Changes to this policy",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "If what we do with data changes, this text changes first. The date of the last revision appears at the end of the page.",
            },
          ],
          enlaces: [
            { href: "/aviso-legal", etiqueta: "Legal notice" },
            { href: "/cookies", etiqueta: "Cookie policy" },
          ],
        },
      ],
    },

    fr: {
      titulo: "Politique de confidentialité",
      entradilla:
        "Quelles données nous recueillons sur sedaprivatehomes.com, pourquoi, sur quelle base légale, qui d'autre y accède et comment exercer vos droits. Information fournie conformément aux articles 13 et 14 du règlement (UE) 2016/679.",
      secciones: [
        {
          id: "responsable",
          titulo: "Qui est le responsable",
          bloques: [
            { tipo: "identificacion" },
            {
              tipo: "parrafo",
              texto:
                "Pour toute question relative à vos données — y compris l'exercice de vos droits — écrivez à {email}. C'est une boîte réelle, effectivement relevée : nous ne publions pas une adresse de contact que nous ne traiterions pas.",
            },
          ],
        },
        {
          id: "datos",
          titulo: "Quelles données nous traitons",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Nous ne traitons que les données que vous nous donnez. Nous ne les achetons pas, ne les obtenons pas auprès de tiers et ne les enrichissons pas depuis des sources externes.",
            },
            {
              tipo: "tabla",
              cabeceras: ["Par quel canal", "Quelles données"],
              filas: [
                [
                  "Formulaire de contact, option « Séjour »",
                  "Dates d'arrivée et de départ, zone, nombre de voyageurs, type de propriété, services souhaités, commentaires, nom, courriel et, si vous l'indiquez, téléphone ou WhatsApp.",
                ],
                [
                  "Formulaire de contact, option « Propriété »",
                  "Localisation du bien, type, nombre de chambres, situation actuelle, objectif, commentaires, nom, courriel et, si vous l'indiquez, téléphone ou WhatsApp.",
                ],
                [
                  "Formulaire de contact, option « Autres »",
                  "Nom, organisation (facultatif), courriel, objet et message.",
                ],
                [
                  "Calculateur pour propriétaires (page /propietarios/calculadora)",
                  "Nom et courriel (obligatoires) ; si vous les indiquez, téléphone, commune et nombre de chambres de votre bien ; et la case de consentement, que vous devez cocher vous-même. Le prix par nuit et le taux d'occupation que vous saisissez servent uniquement à calculer l'estimation à l'écran : ils ne sont pas transmis à notre registre de contacts et ne sont pas conservés.",
                ],
                [
                  "Réservation d'un appel avec Calendly (pages /meet et /founding-owners)",
                  "Nom, courriel, jour et heure choisis, votre fuseau horaire et, si vous l'écrivez, ce que vous souhaitez nous dire pour préparer la réunion. Détails sous « Réservation d'un appel avec Calendly ».",
                ],
                [
                  "Courriel ou téléphone direct",
                  "Ce que vous choisissez d'inclure dans votre message ou de nous dire au téléphone.",
                ],
                [
                  "Simple visite du site",
                  "Adresse IP et données techniques de la requête (navigateur, système, page demandée), traitées par l'hébergeur dans ses journaux de service.",
                ],
              ],
            },
            {
              tipo: "parrafo",
              texto:
                "Les champs marqués d'un astérisque sont ceux qui nous sont indispensables pour vous répondre. Le reste est facultatif et sert seulement à mieux répondre.",
            },
            {
              tipo: "parrafo",
              texto:
                "Nous ne recueillons aucune donnée à des fins analytiques, publicitaires ou de profilage. Ce site n'a aucun outil de mesure — ni Google Analytics, ni Vercel Analytics, ni équivalent — ni aucun pixel de réseau social. Les seuls cookies tiers sont ceux que dépose Calendly si, sur /meet, vous appuyez sur « Voir le calendrier » (voir « Réservation d'un appel avec Calendly »).",
            },
          ],
        },
        {
          id: "finalidad",
          titulo: "Pour quoi faire, et sur quelle base",
          bloques: [
            {
              tipo: "tabla",
              cabeceras: ["Finalité", "Base juridique"],
              filas: [
                [
                  "Traiter votre demande de séjour ou d'estimation de votre bien et préparer, le cas échéant, la relation contractuelle.",
                  "Article 6.1.b du RGPD : mesures précontractuelles prises à votre demande.",
                ],
                [
                  "Répondre à toute autre communication que vous nous adressez par le formulaire, par courriel ou par téléphone.",
                  "Article 6.1.f du RGPD : intérêt légitime à répondre à qui nous écrit.",
                ],
                [
                  "Limiter les envois automatisés ou abusifs du formulaire.",
                  "Article 6.1.f du RGPD : intérêt légitime à la sécurité et à la disponibilité du service.",
                ],
                [
                  "Organiser et tenir l'appel vidéo que vous réservez avec Calendly.",
                  "Article 6.1.b du RGPD : mesures précontractuelles prises à votre demande.",
                ],
                [
                  "Vous contacter pour évaluer la gestion de votre bien, lorsque vous laissez vos coordonnées dans le calculateur pour propriétaires.",
                  "Article 6.1.a du RGPD : votre consentement, que vous donnez en cochant la case du formulaire. Nous conservons la version de la présente politique que vous avez vue en le donnant. Nous conservons aussi la langue de la page depuis laquelle vous envoyez le formulaire, afin de vous répondre dans cette langue.",
                ],
              ],
            },
            {
              tipo: "parrafo",
              texto:
                "Vous pouvez retirer à tout moment le consentement donné dans le calculateur en écrivant à {email}. Le retrait ne porte pas atteinte à la licéité du traitement effectué avant ce retrait.",
            },
            {
              tipo: "parrafo",
              texto:
                "Nous n'utilisons pas vos données pour vous envoyer des communications commerciales. Si une lettre d'information voit le jour, elle exigera votre consentement exprès et distinct, révocable à tout moment.",
            },
          ],
        },
        {
          id: "destinatarios",
          titulo: "Qui d'autre voit ces données",
          bloques: [
            {
              tipo: "tabla",
              cabeceras: ["Destinataire", "Ce qu'il en fait", "Où il se trouve"],
              filas: [
                [
                  "Vercel Inc.",
                  "Héberge le site et le portail de SEDA (portal.sedaprivatehomes.com) et exécute les fonctions qui traitent les formulaires et transmettent au portail ce que vous laissez dans le calculateur. Journalise les données techniques de chaque requête, y compris l'adresse IP.",
                  "États-Unis. Les fonctions du site et du portail s'exécutent à Francfort (UE).",
                ],
                [
                  "Supabase Inc.",
                  "Héberge la base de données du registre interne de contacts de SEDA (CRM), où sont conservées les coordonnées que vous laissez dans le calculateur pour propriétaires. Seul le serveur d'administration de SEDA y accède.",
                  "États-Unis. La base de données se trouve à Francfort (UE).",
                ],
                [
                  "Resend, Inc.",
                  "Achemine le courriel contenant ce que vous avez écrit dans le formulaire.",
                  "États-Unis",
                ],
                [
                  "{proveedorCorreo}",
                  "Fournit le service de la boîte {email}, où le message est conservé.",
                  "Voir colonne précédente",
                ],
              ],
            },
            {
              tipo: "parrafo",
              texto:
                "Si vous laissez vos coordonnées dans le calculateur pour propriétaires, le serveur de ce site les transmet au portail de SEDA, qui les conserve dans son registre interne de contacts (hébergé chez Supabase et Vercel, voir ci-dessus). À leur arrivée, le portail avertit la boîte {email} par un courriel, également acheminé par Resend, qui ne contient aucune donnée personnelle.",
            },
            {
              tipo: "parrafo",
              texto:
                "Si vous réservez un appel, vos données sont aussi traitées par Calendly et Google Ireland Limited, comme expliqué sous « Réservation d'un appel avec Calendly ». Il n'y a pas d'autres destinataires. Nous ne vendons ni ne cédons de données à des tiers à des fins commerciales. Elles ne seraient communiquées aux autorités ou organismes publics que si une norme l'exigeait.",
            },
            {
              tipo: "parrafo",
              texto:
                "Vercel, Resend, Supabase et Calendly sont des sociétés américaines : le traitement implique un transfert international de données hors de l'Espace économique européen. Vous pouvez nous demander des informations sur les garanties applicables à ce transfert en écrivant à {email}.",
            },
          ],
        },
        {
          id: "calendly",
          titulo: "Réservation d'un appel avec Calendly",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Depuis les pages /meet et /founding-owners, vous pouvez réserver un appel vidéo de 30 minutes avec nous. La réservation n'est pas gérée par ce site mais par Calendly : son calendrier peut être ouvert dans /meet et est accessible par un lien depuis /founding-owners.",
            },
            {
              tipo: "tabla",
              cabeceras: ["Aspect", "Réservation d'un appel"],
              filas: [
                [
                  "Finalité",
                  "Organiser et tenir l'appel que vous avez demandé, généralement pour parler de la gestion de votre bien.",
                ],
                [
                  "Données",
                  "Nom, courriel, jour et heure choisis et votre fuseau horaire. Si vous le remplissez, le champ facultatif où vous nous indiquez ce qui aide à préparer la réunion.",
                ],
                [
                  "Base juridique",
                  "Article 6.1.b du RGPD : mesures précontractuelles prises à votre demande.",
                ],
                [
                  "Qui les voit",
                  "SEDA. Calendly nous notifie la réservation dans la boîte {email}.",
                ],
                [
                  "Sous-traitants",
                  "Calendly LLC (États-Unis) : gère l'agenda, conserve la réservation et vous envoie la confirmation et les rappels. Google Ireland Limited (Google Calendar et Google Meet) : le rendez-vous est inscrit dans notre calendrier et l'appel a lieu sur Google Meet. Et le fournisseur de la boîte {email}, où arrive la notification.",
                ],
                [
                  "Conservation",
                  "12 mois à compter de la date de l'appel. Si un contrat de gestion en découle, les données rejoignent le dossier du propriétaire et sont conservées selon ce contrat.",
                ],
              ],
            },
            {
              tipo: "parrafo",
              texto:
                "Ouvrir la page /meet ne vous connecte pas à Calendly. Lorsque vous appuyez sur « Voir le calendrier », votre navigateur charge le calendrier directement depuis calendly.com : Calendly reçoit votre adresse IP et dépose ses propres cookies (détails dans la politique de cookies), même si vous ne réservez pas. Si vous préférez l'éviter, n'ouvrez pas le calendrier : écrivez-nous à {email} et nous vous proposerons un jour et une heure par courriel.",
            },
          ],
        },
        {
          id: "conservacion",
          titulo: "Combien de temps nous les conservons",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Votre message reste dans la boîte {email} jusqu'à sa suppression. Il n'existe pas d'effacement automatique programmé, et nous préférons le dire plutôt que promettre un délai que nous ne tiendrions pas.",
            },
            {
              tipo: "parrafo",
              texto:
                "En pratique : si la demande ne débouche pas sur une relation, le message est conservé tant qu'il peut servir à vous répondre ou à rendre compte de l'échange, puis supprimé lors des revues de la boîte. Si vous préférez que nous l'effacions plus tôt, écrivez-nous et nous le ferons.",
            },
            {
              tipo: "parrafo",
              texto:
                "Si la demande débouche sur une relation contractuelle, les données sont ensuite conservées pendant la durée de cette relation, puis pendant les délais imposés par la réglementation fiscale et la prescription des responsabilités.",
            },
            {
              tipo: "parrafo",
              texto:
                "Les coordonnées que vous laissez dans le calculateur pour propriétaires sont conservées dans le registre interne de contacts de SEDA pendant 1 an à compter de notre dernier contact avec vous (appel, courriel ou visite), si vous ne signez pas de contrat de gestion ; à l'expiration de ce délai, elles sont supprimées. Si vous signez, elles rejoignent le dossier du propriétaire et sont conservées selon ce contrat. Si vous demandez leur suppression, nous les effaçons plus tôt.",
            },
            {
              tipo: "parrafo",
              texto:
                "Le contrôle de fréquence des formulaires conserve votre adresse IP en mémoire pendant dix minutes au maximum : elle n'est écrite dans aucune base de données et ne survit pas au redémarrage du service. Les journaux techniques de l'hébergeur suivent ses propres délais, que nous ne décidons pas.",
            },
          ],
        },
        {
          id: "donde-no-estan",
          titulo: "Où vos données ne sont pas",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Ce site n'a pas de base de données propre ni de registre d'utilisateurs : ce que vous envoyez par le formulaire de contact devient un courriel et vit dans une boîte. La seule exception est le calculateur pour propriétaires : ce que vous y laissez, et seulement cela, est transmis par le serveur de ce site au registre interne de contacts de SEDA, qui se trouve dans le portail et non sur ce site. C'est une limitation délibérée — moins d'endroits conservent vos données, moins d'endroits peuvent les perdre.",
            },
          ],
        },
        {
          id: "derechos",
          titulo: "Vos droits",
          bloques: [
            { tipo: "parrafo", texto: "Vous pouvez exercer sur vos données les droits suivants :" },
            {
              tipo: "lista",
              items: [
                "Accès : savoir quelles données vous concernant nous traitons.",
                "Rectification : corriger celles qui seraient inexactes.",
                "Effacement : demander leur suppression.",
                "Opposition : vous opposer à un traitement fondé sur l'intérêt légitime.",
                "Limitation : demander que nous les conservions sans les utiliser pendant l'examen d'une réclamation.",
                "Portabilité : recevoir dans un format lisible les données que vous nous avez fournies.",
              ],
            },
            {
              tipo: "parrafo",
              texto:
                "Pour les exercer, écrivez à {email} depuis l'adresse avec laquelle vous nous avez contactés, ou en joignant un document permettant de vous identifier. Nous répondrons dans le délai d'un mois fixé par l'article 12 du RGPD.",
            },
            {
              tipo: "parrafo",
              texto:
                "Si vous estimez que votre demande n'a pas été correctement traitée, vous pouvez saisir l'Agence espagnole de protection des données (C/ Jorge Juan, 6 — 28001 Madrid), sur www.aepd.es.",
            },
          ],
        },
        {
          id: "menores-decisiones",
          titulo: "Mineurs et décisions automatisées",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Le site ne s'adresse pas aux moins de quatorze ans et ne demande pas de données concernant des mineurs.",
            },
            {
              tipo: "parrafo",
              texto:
                "Nous ne prenons aucune décision automatisée et n'établissons aucun profil à partir de vos données : chaque message est lu par une personne.",
            },
          ],
        },
        {
          id: "seguridad",
          titulo: "Sécurité",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Le site est servi exclusivement en HTTPS, avec HSTS activé. Le formulaire valide le format de l'adresse de courriel et limite la taille du message, le nombre de champs et la fréquence d'envoi ; ce qui ne respecte pas ces conditions est rejeté sans traitement.",
            },
            {
              tipo: "parrafo",
              texto:
                "Aucun système n'est infaillible. En cas de violation affectant vos données, nous agirons conformément aux articles 33 et 34 du RGPD.",
            },
          ],
        },
        {
          id: "cambios",
          titulo: "Modifications de cette politique",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Si ce que nous faisons des données change, ce texte change d'abord. La date de la dernière révision figure en bas de page.",
            },
          ],
          enlaces: [
            { href: "/aviso-legal", etiqueta: "Mentions légales" },
            { href: "/cookies", etiqueta: "Politique relative aux cookies" },
          ],
        },
      ],
    },

    de: {
      titulo: "Datenschutzerklärung",
      entradilla:
        "Welche Daten wir auf sedaprivatehomes.com erheben, wofür, auf welcher Rechtsgrundlage, wer sie sonst noch sieht und wie Sie Ihre Rechte ausüben. Bereitgestellt gemäß Artikel 13 und 14 der Verordnung (EU) 2016/679.",
      secciones: [
        {
          id: "responsable",
          titulo: "Wer verantwortlich ist",
          bloques: [
            { tipo: "identificacion" },
            {
              tipo: "parrafo",
              texto:
                "Für alles, was Ihre Daten betrifft — auch für die Ausübung Ihrer Rechte — schreiben Sie an {email}. Das ist ein echtes Postfach, das gelesen wird; wir veröffentlichen keine Kontaktadresse, die niemand betreut.",
            },
          ],
        },
        {
          id: "datos",
          titulo: "Welche Daten wir verarbeiten",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Wir verarbeiten nur die Daten, die Sie uns geben. Wir kaufen sie nicht, beziehen sie nicht von Dritten und reichern sie nicht aus externen Quellen an.",
            },
            {
              tipo: "tabla",
              cabeceras: ["Auf welchem Weg", "Welche Daten"],
              filas: [
                [
                  "Kontaktformular, Option „Aufenthalt“",
                  "An- und Abreisedatum, Gebiet, Anzahl der Gäste, Objektart, gewünschte Leistungen, Anmerkungen, Name, E-Mail-Adresse und, sofern angegeben, Telefon oder WhatsApp.",
                ],
                [
                  "Kontaktformular, Option „Immobilie“",
                  "Lage der Immobilie, Art, Anzahl der Schlafzimmer, aktuelle Situation, Ziel, Anmerkungen, Name, E-Mail-Adresse und, sofern angegeben, Telefon oder WhatsApp.",
                ],
                [
                  "Kontaktformular, Option „Sonstiges“",
                  "Name, Organisation (freiwillig), E-Mail-Adresse, Betreff und Nachricht.",
                ],
                [
                  "Rechner für Eigentümer (Seite /propietarios/calculadora)",
                  "Name und E-Mail-Adresse (Pflichtangaben); auf Wunsch Telefonnummer, Gemeinde und Zahl der Schlafzimmer Ihrer Immobilie; sowie das Einwilligungskästchen, das Sie selbst anklicken müssen. Der Preis pro Nacht und die Auslastung, die Sie eingeben, dienen nur der Berechnung der Schätzung auf dem Bildschirm: Sie werden nicht an unser Kontaktregister weitergeleitet und nicht gespeichert.",
                ],
                [
                  "Buchung eines Gesprächs über Calendly (Seiten /meet und /founding-owners)",
                  "Name, E-Mail-Adresse, gewählter Tag und Uhrzeit, Ihre Zeitzone und, sofern Sie es schreiben, was Sie uns zur Vorbereitung des Gesprächs mitteilen möchten. Einzelheiten unter „Buchung eines Gesprächs über Calendly“.",
                ],
                [
                  "Direkte E-Mail oder Telefon",
                  "Was Sie in Ihrer Nachricht schreiben oder uns im Gespräch mitteilen.",
                ],
                [
                  "Bloßer Besuch der Website",
                  "IP-Adresse und technische Daten der Anfrage (Browser, System, aufgerufene Seite), die der Hosting-Anbieter in seinen Betriebsprotokollen verarbeitet.",
                ],
              ],
            },
            {
              tipo: "parrafo",
              texto:
                "Die mit einem Sternchen markierten Felder sind die, die wir zur Beantwortung brauchen. Alles Übrige ist freiwillig und hilft uns nur, besser zu antworten.",
            },
            {
              tipo: "parrafo",
              texto:
                "Wir erheben keine Daten zu Analyse-, Werbe- oder Profiling-Zwecken. Diese Website hat kein einziges Messwerkzeug — weder Google Analytics noch Vercel Analytics noch Vergleichbares — und keine Social-Media-Pixel. Die einzigen Cookies Dritter setzt Calendly, wenn Sie auf /meet auf „Kalender anzeigen“ klicken (siehe „Buchung eines Gesprächs über Calendly“).",
            },
          ],
        },
        {
          id: "finalidad",
          titulo: "Wozu, und auf welcher Rechtsgrundlage",
          bloques: [
            {
              tipo: "tabla",
              cabeceras: ["Zweck", "Rechtsgrundlage"],
              filas: [
                [
                  "Ihre Aufenthaltsanfrage oder die Bewertung Ihrer Immobilie bearbeiten und gegebenenfalls das Vertragsverhältnis vorbereiten.",
                  "Art. 6 Abs. 1 lit. b DSGVO: vorvertragliche Maßnahmen auf Ihre Anfrage hin.",
                ],
                [
                  "Auf jede weitere Mitteilung antworten, die Sie uns über das Formular, per E-Mail oder telefonisch senden.",
                  "Art. 6 Abs. 1 lit. f DSGVO: berechtigtes Interesse daran, denen zu antworten, die uns schreiben.",
                ],
                [
                  "Automatisierte oder missbräuchliche Formularübermittlungen begrenzen.",
                  "Art. 6 Abs. 1 lit. f DSGVO: berechtigtes Interesse an Sicherheit und Verfügbarkeit des Dienstes.",
                ],
                [
                  "Das Videogespräch organisieren und führen, das Sie über Calendly buchen.",
                  "Art. 6 Abs. 1 lit. b DSGVO: vorvertragliche Maßnahmen auf Ihre Anfrage hin.",
                ],
                [
                  "Sie kontaktieren, um die Verwaltung Ihrer Immobilie zu prüfen, wenn Sie Ihre Daten im Rechner für Eigentümer hinterlassen.",
                  "Art. 6 Abs. 1 lit. a DSGVO: Ihre Einwilligung, die Sie durch Anklicken des Kästchens im Formular erteilen. Wir speichern die Fassung dieser Erklärung, die Sie bei der Einwilligung gesehen haben. Wir speichern außerdem die Sprache der Seite, von der aus Sie das Formular senden, um Ihnen in dieser Sprache zu antworten.",
                ],
              ],
            },
            {
              tipo: "parrafo",
              texto:
                "Die im Rechner erteilte Einwilligung können Sie jederzeit widerrufen, indem Sie an {email} schreiben. Der Widerruf berührt nicht die Rechtmäßigkeit der bis zum Widerruf erfolgten Verarbeitung.",
            },
            {
              tipo: "parrafo",
              texto:
                "Wir nutzen Ihre Daten nicht für Werbung. Sollte es je einen Newsletter geben, verlangt er Ihre ausdrückliche, gesonderte Einwilligung, die Sie jederzeit widerrufen können.",
            },
          ],
        },
        {
          id: "destinatarios",
          titulo: "Wer diese Daten sonst noch sieht",
          bloques: [
            {
              tipo: "tabla",
              cabeceras: ["Empfänger", "Was er damit tut", "Wo er sitzt"],
              filas: [
                [
                  "Vercel Inc.",
                  "Hostet die Website und das Portal von SEDA (portal.sedaprivatehomes.com) und führt die Funktionen aus, die die Formulare verarbeiten und das, was Sie im Rechner hinterlassen, an das Portal weiterleiten. Protokolliert technische Daten jeder Anfrage, einschließlich der IP-Adresse.",
                  "Vereinigte Staaten. Die Funktionen der Website und des Portals laufen in Frankfurt (EU).",
                ],
                [
                  "Supabase Inc.",
                  "Hostet die Datenbank des internen Kontaktregisters von SEDA (CRM), in dem die Daten gespeichert werden, die Sie im Rechner für Eigentümer hinterlassen. Nur der Verwaltungsserver von SEDA greift darauf zu.",
                  "Vereinigte Staaten. Die Datenbank befindet sich in Frankfurt (EU).",
                ],
                [
                  "Resend, Inc.",
                  "Stellt die E-Mail zu, die Ihre Formulareingaben enthält.",
                  "Vereinigte Staaten",
                ],
                [
                  "{proveedorCorreo}",
                  "Betreibt das Postfach {email}, in dem die Nachricht liegt.",
                  "Siehe vorige Spalte",
                ],
              ],
            },
            {
              tipo: "parrafo",
              texto:
                "Wenn Sie Ihre Daten im Rechner für Eigentümer hinterlassen, leitet der Server dieser Website sie an das Portal von SEDA weiter, das sie in seinem internen Kontaktregister speichert (gehostet bei Supabase und Vercel, siehe oben). Bei Eingang benachrichtigt das Portal das Postfach {email} mit einer E-Mail, die ebenfalls über Resend zugestellt wird und keine personenbezogenen Daten enthält.",
            },
            {
              tipo: "parrafo",
              texto:
                "Wenn Sie ein Gespräch buchen, verarbeiten auch Calendly und Google Ireland Limited Ihre Daten, wie unter „Buchung eines Gesprächs über Calendly“ erläutert. Weitere Empfänger gibt es nicht. Wir verkaufen oder übermitteln keine Daten zu kommerziellen Zwecken an Dritte. An Behörden oder öffentliche Stellen würden sie nur übermittelt, wenn eine Rechtsvorschrift das verlangt.",
            },
            {
              tipo: "parrafo",
              texto:
                "Vercel, Resend, Supabase und Calendly sind US-amerikanische Unternehmen: Die Verarbeitung umfasst eine internationale Datenübermittlung außerhalb des Europäischen Wirtschaftsraums. Informationen zu den für diese Übermittlung geltenden Garantien erhalten Sie auf Anfrage unter {email}.",
            },
          ],
        },
        {
          id: "calendly",
          titulo: "Buchung eines Gesprächs über Calendly",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Auf den Seiten /meet und /founding-owners können Sie ein 30-minütiges Videogespräch mit uns buchen. Die Buchung wickelt nicht diese Website ab, sondern Calendly: Sein Kalender lässt sich in /meet öffnen und ist von /founding-owners aus verlinkt.",
            },
            {
              tipo: "tabla",
              cabeceras: ["Punkt", "Buchung eines Gesprächs"],
              filas: [
                [
                  "Zweck",
                  "Das von Ihnen gewünschte Gespräch organisieren und führen, meist über die Verwaltung Ihrer Immobilie.",
                ],
                [
                  "Daten",
                  "Name, E-Mail-Adresse, gewählter Tag und Uhrzeit sowie Ihre Zeitzone. Sofern ausgefüllt, das freiwillige Feld, in dem Sie uns mitteilen, was bei der Vorbereitung hilft.",
                ],
                [
                  "Rechtsgrundlage",
                  "Art. 6 Abs. 1 lit. b DSGVO: vorvertragliche Maßnahmen auf Ihre Anfrage hin.",
                ],
                [
                  "Wer sie sieht",
                  "SEDA. Calendly meldet uns die Buchung im Postfach {email}.",
                ],
                [
                  "Auftragsverarbeiter",
                  "Calendly LLC (Vereinigte Staaten): verwaltet den Terminkalender, speichert die Buchung und sendet Ihnen Bestätigung und Erinnerungen. Google Ireland Limited (Google Calendar und Google Meet): Der Termin wird in unseren Kalender eingetragen und das Gespräch findet über Google Meet statt. Und der Anbieter des Postfachs {email}, in dem die Benachrichtigung eingeht.",
                ],
                [
                  "Speicherdauer",
                  "12 Monate ab dem Datum des Gesprächs. Entsteht daraus ein Verwaltungsvertrag, gehen die Daten in die Akte des Eigentümers über und werden nach diesem Vertrag aufbewahrt.",
                ],
              ],
            },
            {
              tipo: "parrafo",
              texto:
                "Das Öffnen der Seite /meet verbindet nicht mit Calendly. Wenn Sie auf „Kalender anzeigen“ klicken, lädt Ihr Browser den Kalender direkt von calendly.com: Calendly erhält Ihre IP-Adresse und setzt eigene Cookies (Einzelheiten in der Cookie-Richtlinie), auch wenn Sie nicht buchen. Möchten Sie das vermeiden, öffnen Sie den Kalender nicht: Schreiben Sie an {email}, und wir schlagen Ihnen Tag und Uhrzeit per E-Mail vor.",
            },
          ],
        },
        {
          id: "conservacion",
          titulo: "Wie lange wir sie aufbewahren",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Ihre Nachricht bleibt im Postfach {email}, bis sie gelöscht wird. Es gibt keine geplante automatische Löschung, und wir sagen das lieber, als eine Frist zu versprechen, die wir nicht einhalten würden.",
            },
            {
              tipo: "parrafo",
              texto:
                "Praktisch heißt das: Führt die Anfrage zu keiner Beziehung, bleibt die Nachricht so lange, wie sie für Ihre Beantwortung oder zur Rechenschaft über den Austausch nützlich sein kann, und wird bei der Durchsicht des Postfachs gelöscht. Wenn Sie eine frühere Löschung wünschen, schreiben Sie uns — wir löschen sie.",
            },
            {
              tipo: "parrafo",
              texto:
                "Führt die Anfrage zu einem Vertragsverhältnis, werden die Daten für dessen Dauer und danach für die Fristen aufbewahrt, die Steuerrecht und Verjährung von Ansprüchen vorgeben.",
            },
            {
              tipo: "parrafo",
              texto:
                "Die Daten, die Sie im Rechner für Eigentümer hinterlassen, werden im internen Kontaktregister von SEDA 1 Jahr ab unserem letzten Kontakt mit Ihnen (Anruf, E-Mail oder Besuch) aufbewahrt, wenn Sie keinen Verwaltungsvertrag abschließen; nach Ablauf dieser Frist werden sie gelöscht. Schließen Sie einen Vertrag ab, gehen sie in die Akte des Eigentümers über und werden entsprechend diesem Vertrag aufbewahrt. Wenn Sie ihre Löschung verlangen, löschen wir sie früher.",
            },
            {
              tipo: "parrafo",
              texto:
                "Die Frequenzbegrenzung der Formulare hält Ihre IP-Adresse höchstens zehn Minuten im Arbeitsspeicher: Sie wird in keine Datenbank geschrieben und überlebt keinen Neustart des Dienstes. Die technischen Protokolle des Hosting-Anbieters folgen dessen eigenen Fristen, über die wir nicht entscheiden.",
            },
          ],
        },
        {
          id: "donde-no-estan",
          titulo: "Wo Ihre Daten nicht sind",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Diese Website hat keine eigene Datenbank und kein Nutzerregister: Was Sie über das Kontaktformular senden, wird zu einer E-Mail und liegt in einem Postfach. Die einzige Ausnahme ist der Rechner für Eigentümer: Was Sie dort hinterlassen, und nur das, leitet der Server dieser Website an das interne Kontaktregister von SEDA weiter, das im Portal liegt und nicht auf dieser Website. Das ist eine bewusste Beschränkung — je weniger Orte Ihre Daten halten, desto weniger Orte können sie verlieren.",
            },
          ],
        },
        {
          id: "derechos",
          titulo: "Ihre Rechte",
          bloques: [
            { tipo: "parrafo", texto: "Über Ihre Daten können Sie folgende Rechte ausüben:" },
            {
              tipo: "lista",
              items: [
                "Auskunft: erfahren, welche Daten von Ihnen wir verarbeiten.",
                "Berichtigung: unrichtige Daten korrigieren lassen.",
                "Löschung: die Löschung verlangen.",
                "Widerspruch: einer auf berechtigtem Interesse beruhenden Verarbeitung widersprechen.",
                "Einschränkung: verlangen, dass wir die Daten aufbewahren, ohne sie zu nutzen, solange eine Beanstandung geklärt wird.",
                "Datenübertragbarkeit: die von Ihnen bereitgestellten Daten in lesbarem Format erhalten.",
              ],
            },
            {
              tipo: "parrafo",
              texto:
                "Zur Ausübung schreiben Sie an {email} — von der Adresse, mit der Sie uns kontaktiert haben, oder mit einem Dokument, das Sie identifiziert. Wir antworten innerhalb der Monatsfrist des Artikels 12 DSGVO.",
            },
            {
              tipo: "parrafo",
              texto:
                "Wenn Sie meinen, Ihr Anliegen sei nicht ordnungsgemäß bearbeitet worden, können Sie sich bei der spanischen Datenschutzbehörde beschweren (C/ Jorge Juan, 6 — 28001 Madrid), unter www.aepd.es.",
            },
          ],
        },
        {
          id: "menores-decisiones",
          titulo: "Minderjährige und automatisierte Entscheidungen",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Die Website richtet sich nicht an Personen unter vierzehn Jahren und fragt keine Daten von Minderjährigen ab.",
            },
            {
              tipo: "parrafo",
              texto:
                "Wir treffen keine automatisierten Entscheidungen und erstellen keine Profile aus Ihren Daten: Jede Nachricht liest ein Mensch.",
            },
          ],
        },
        {
          id: "seguridad",
          titulo: "Sicherheit",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Die Website wird ausschließlich über HTTPS mit aktiviertem HSTS ausgeliefert. Das Formular prüft das Format der E-Mail-Adresse und begrenzt Nachrichtengröße, Feldanzahl und Sendefrequenz; was diese Bedingungen nicht erfüllt, wird ohne Verarbeitung abgewiesen.",
            },
            {
              tipo: "parrafo",
              texto:
                "Kein System ist unfehlbar. Sollte eine Verletzung Ihre Daten betreffen, handeln wir nach Artikel 33 und 34 DSGVO.",
            },
          ],
        },
        {
          id: "cambios",
          titulo: "Änderungen dieser Erklärung",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Ändert sich, was wir mit den Daten tun, ändert sich zuerst dieser Text. Das Datum der letzten Überarbeitung steht am Ende der Seite.",
            },
          ],
          enlaces: [
            { href: "/aviso-legal", etiqueta: "Impressum" },
            { href: "/cookies", etiqueta: "Cookie-Richtlinie" },
          ],
        },
      ],
    },
  },
}
