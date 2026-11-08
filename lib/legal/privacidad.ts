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
      Además (MOT-M04, REA-MOTOR, 8-nov-2026): la ruta manda la IP al portal en
      `X-Visitor-Ip` (lib/lead-portal-envio.ts, calculadora y solicitud del
      asistente) y el portal, para su límite por visitante, guarda en Upstash un
      resumen sha256 de la IP durante 60 s. Dato seudonimizado; Upstash, encargado.
      Lo del portal sale de la REA-MOTOR (seda_os, PR #1151), no se ha leído su
      código desde este repo.
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
    · Asistente de propietarios (7-nov-2026, detrás de
      `SEDA_FLAG_ASISTENTE_PROPIETARIOS`): chat en app/api/asistente/route.ts,
      que no guarda la conversación y retira los datos sensibles antes de
      enviarlos (lib/asistente/historial.ts). Lo único que registra es una línea
      de métricas sin contenido ni IP (`metrica()` en esa ruta): idioma, turno,
      herramientas, tipos de dato retirado (entrada) o tapado (salida), tokens
      de entrada, salida y caché, pasos, motivo de fin, duración y, si lo hubo,
      el motivo del respaldo. El modelo es de Anthropic: contraparte en el EEE
      Anthropic Ireland, Limited (Commercial Terms), encargado según su DPA (en
      vigor 24-feb-2025, SCC módulos 2 y 3) y sin entrenamiento con los datos
      (Commercial Terms).
      Conservación en Anthropic: sus dos fuentes no dicen lo mismo. El artículo
      de privacidad (https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data)
      dice que borra entradas y salidas en 30 días como máximo; la página de la
      API (https://platform.claude.com/docs/en/manage-claude/api-and-data-retention)
      dice que no se conservan por defecto salvo los «Covered Models». La
      política da el plazo más largo de los dos, 30 días, más las excepciones
      que dan ambas: hasta 2 años si sus sistemas de seguridad marcan el
      contenido, o lo que exija la ley (decisión de Ángel vía Cowork, 8-nov-2026).
      El mini formulario del chat va al mismo CRM que la calculadora, con canal
      "asistente" (app/api/asistente/solicitud). Detalle:
      docs/ASISTENTE-PROPIETARIOS.md.
    · Las valoraciones de huéspedes NO van aquí: viven en guest-app, que
      tiene su propia política (`/legal/privacidad`) y no enlaza a esta.
*/

export const PRIVACIDAD: DocumentoLegalMultilingue = {
  id: "privacidad",
  ruta: "/privacidad",
  actualizado: "2026-11-08",
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
                "Solo tratamos los datos que nos das tú. No los compramos, no los obtenemos de terceros y no los completamos con fuentes externas. La única excepción son las cartas postales a titulares de viviendas turísticas, cuyos datos proceden de un registro público (ver «Cartas postales a titulares de viviendas turísticas»).",
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
                "No usamos los datos que nos das para enviarte comunicaciones comerciales (las cartas postales a titulares de viviendas turísticas, descritas aparte, no parten de datos que hayas facilitado). Si algún día existe un boletín, requerirá tu consentimiento expreso y separado, y podrás retirarlo cuando quieras.",
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
                  "Upstash, Inc.",
                  "Cuando envías tus datos desde la calculadora o desde el asistente, el portal de SEDA guarda en Upstash, durante 60 segundos, un resumen criptográfico de tu IP (un dato seudonimizado, no la IP en claro) para limitar abusos. Actúa como encargado del tratamiento.",
                  "Estados Unidos",
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
                "Si reservas una llamada, tus datos los tratan además Calendly y Google Ireland Limited, como se explica en «Reserva de una llamada con Calendly». Si usas el asistente de propietarios, tus mensajes los trata además Anthropic, como se explica en «Asistente de propietarios». No hay más destinatarios. No vendemos ni cedemos datos a terceros con fines comerciales. Solo se comunicarían a autoridades u organismos públicos si una norma lo exigiera. Las cartas postales tienen sus propios destinatarios, indicados en su sección.",
            },
            {
              tipo: "parrafo",
              texto:
                "Vercel, Resend, Supabase, Upstash y Calendly son sociedades estadounidenses: el tratamiento implica una transferencia internacional de datos fuera del Espacio Económico Europeo. Puedes pedirnos información sobre las garantías aplicables a esa transferencia escribiendo a {email}.",
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
          id: "cartas",
          titulo: "Cartas postales a titulares de viviendas turísticas",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Si eres titular de una vivienda turística en Torremolinos, Benalmádena, Málaga, Fuengirola, Mijas, Marbella, Estepona, Sotogrande (San Roque) o en el litoral de Nerja y de Torrox, podemos escribirte una carta postal. No nos has dado tú tus datos: esta sección es la información del artículo 14 del RGPD y es a la que remite la carta.",
            },
            {
              tipo: "tabla",
              cabeceras: ["Aspecto", "Cartas postales"],
              filas: [
                [
                  "Datos",
                  "Tu nombre o razón social, la dirección de la vivienda, su número de registro y su número de plazas. Nunca tu correo electrónico ni tu teléfono.",
                ],
                [
                  "Origen",
                  "El Registro de Turismo de Andalucía, que la Junta de Andalucía publica como datos abiertos (OpenRTA, licencia CC BY 4.0). No los completamos con otras fuentes.",
                ],
                [
                  "Finalidad",
                  "Enviarte por correo postal, como mucho dos veces al año, información sobre nuestro servicio de gestión de viviendas turísticas.",
                ],
                [
                  "Base jurídica",
                  "Artículo 6.1.f del RGPD: interés legítimo en dar a conocer nuestro servicio a quien, por figurar en un registro público, lo ejerce como actividad. Hemos hecho una evaluación documentada de ese interés frente a tus derechos; puedes pedírnosla escribiendo a {email}.",
                ],
                [
                  "Destinatarios",
                  "La imprenta que imprime y prepara la carta (encargada del tratamiento) y el operador postal que la entrega. El sistema en el que se gestionan los envíos lo alojan Vercel y Supabase, con servidores en Fráncfort (UE).",
                ],
                [
                  "Conservación",
                  "Hasta 12 meses después de la última carta que te enviemos, si no respondes. Los datos importados de los que no sale una carta en el plazo de un mes se suprimen.",
                ],
                [
                  "Tus derechos",
                  "Acceso, rectificación, supresión, limitación y oposición, y reclamar ante la Agencia Española de Protección de Datos (ver «Tus derechos»).",
                ],
              ],
            },
            {
              tipo: "parrafo",
              texto:
                "Vercel y Supabase son sociedades estadounidenses: el tratamiento implica una transferencia internacional de datos fuera del Espacio Económico Europeo, con las garantías adecuadas. Puedes pedirnos información sobre ellas escribiendo a {email}.",
            },
            {
              tipo: "parrafo",
              texto:
                "Puedes oponerte (artículo 21 del RGPD) en cualquier momento y sin dar motivos: escaneando el código QR de baja de la carta, o escribiendo a {email} con el código que figura en la carta. No te pediremos ningún dato más. Tras una oposición no volveremos a escribirte, y para ello solo conservamos una huella criptográfica de tus datos, a partir de la cual no se pueden recuperar.",
            },
            {
              tipo: "parrafo",
              texto:
                "Si entras en la calculadora desde el código QR de la carta y nos dejas tus datos, anotamos que la carta tuvo respuesta y vinculamos tu solicitud a esa carta mientras exista el envío, para medir el resultado. El código de la carta es aleatorio y no contiene ningún dato tuyo; no lo guardamos en tu navegador ni lo enviamos a ninguna herramienta de medición o publicidad.",
            },
          ],
        },
        {
          id: "asistente",
          titulo: "Asistente de propietarios (inteligencia artificial)",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "En /propietarios y en la calculadora puede haber un chat: el asistente de propietarios. Es una inteligencia artificial, no una persona, y lo dice en su primer mensaje (artículo 50 del Reglamento (UE) 2024/1689, de inteligencia artificial). Responde sobre el servicio de SEDA, su tarifa, la normativa de vivienda turística en Andalucía y la calculadora. No escribas en él datos sensibles: documentos, cuentas bancarias, tarjetas ni contraseñas.",
            },
            {
              tipo: "tabla",
              cabeceras: ["Aspecto", "Asistente de propietarios"],
              filas: [
                [
                  "Datos",
                  "Los mensajes que escribes y las respuestas del asistente. Antes de enviar tus mensajes, el servidor sustituye lo que parezca un dato sensible (IBAN, tarjeta, DNI o NIE, correo electrónico, teléfono, contraseñas) por «[dato retirado]». Tu dirección IP, solo para limitar la frecuencia de uso. Si pides que te contactemos, el formulario del chat recoge tu nombre, tu correo y, si quieres, tu teléfono.",
                ],
                [
                  "Finalidad",
                  "Responder a tus preguntas sobre la gestión de tu vivienda con SEDA. Con el formulario del chat, ponernos en contacto contigo. Sin perfiles y sin publicidad.",
                ],
                [
                  "Base jurídica",
                  "Artículo 6.1.b del RGPD: medidas precontractuales que tú pides al escribir. El formulario del chat, artículo 6.1.a del RGPD: tu consentimiento, que das con su casilla, como en la calculadora.",
                ],
                [
                  "Quién los ve",
                  "Nadie de SEDA lee la conversación, porque no la guardamos. Solo registramos métricas sin contenido: idioma, número del mensaje en la conversación, herramientas usadas, tipos de dato retirado o tapado (por ejemplo «iban» o «teléfono», nunca el dato), tokens de entrada, de salida y en caché, número de pasos, motivo de fin, duración y, si lo hubo, el motivo del mensaje de respaldo. Lo que dejas en el formulario del chat llega al registro interno de contactos de SEDA, igual que lo de la calculadora.",
                ],
                [
                  "Encargado del tratamiento",
                  "Anthropic Ireland, Limited, que presta el modelo de inteligencia artificial (Claude) que redacta las respuestas: cada mensaje se le envía para generar la respuesta. Actúa como encargado del tratamiento según su Anexo de Tratamiento de Datos (Data Processing Addendum, en vigor desde el 24 de febrero de 2025), que forma parte de sus Condiciones Comerciales, y estas le prohíben entrenar sus modelos con los mensajes. Vercel ejecuta la función que conecta el chat con Anthropic.",
                ],
                [
                  "Transferencia internacional",
                  "Anthropic trata y almacena los datos fuera del Espacio Económico Europeo, principalmente en Estados Unidos. La transferencia se ampara en las cláusulas contractuales tipo de la Comisión Europea (módulos dos y tres) que incorpora ese anexo.",
                ],
                [
                  "Conservación",
                  "SEDA no guarda la conversación: vive solo en la pestaña de tu navegador y desaparece al cerrarla o recargar la página. Anthropic borra los mensajes y las respuestas en un plazo máximo de 30 días, salvo que sus sistemas de seguridad los marquen (entonces hasta 2 años) o lo exija la ley. Fuentes: su artículo de privacidad sobre conservación y su documentación de la API, enlazados al final de esta sección. La IP del control de frecuencia, en memoria y 10 minutos como máximo. Los datos del formulario del chat, como los de la calculadora.",
                ],
              ],
            },
            {
              tipo: "parrafo",
              texto:
                "El asistente puede equivocarse. Sus estimaciones usan el mismo cálculo que la calculadora y no son una promesa de ingresos. No toma decisiones sobre ti. Para cualquier decisión, habla con una persona: el chat tiene siempre el enlace a la página de contacto. Como SEDA no guarda la conversación, no podemos darte acceso a ella ni borrarla; para los datos del formulario del chat, ver «Tus derechos».",
            },
          ],
          enlaces: [
            { href: "https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data", etiqueta: "Anthropic: cuánto tiempo conserva los datos" },
            { href: "https://platform.claude.com/docs/en/manage-claude/api-and-data-retention", etiqueta: "Anthropic: conservación de datos de la API" },
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
                "El control de frecuencia de los formularios de esta web guarda tu dirección IP en memoria durante diez minutos como máximo: no se escribe en ninguna base de datos y no sobrevive al reinicio del servicio. Además, para limitar abusos, cuando envías tus datos desde la calculadora o desde el asistente el portal de SEDA guarda un resumen criptográfico de tu IP (un dato seudonimizado) durante 60 segundos en Upstash, su encargado del tratamiento. Los registros técnicos del proveedor de alojamiento se conservan según sus propios plazos, que no decidimos nosotros.",
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
            {
              tipo: "parrafo",
              texto:
                "Lo mismo vale para el formulario del asistente de propietarios. Las conversaciones con el asistente no se guardan en ninguna parte de SEDA.",
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
                "No tomamos decisiones automatizadas ni elaboramos perfiles con tus datos: cada mensaje de los formularios lo lee una persona. El asistente de propietarios responde de forma automática, pero no decide nada sobre ti.",
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
                "We only process the data you give us. We do not buy it, do not obtain it from third parties and do not enrich it from external sources. The only exception is postal letters to holiday-rental owners, whose data comes from a public register (see “Postal letters to holiday-rental owners”).",
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
                "We do not use the data you give us to send you marketing (the postal letters to holiday-rental owners, described separately, do not start from data you provided). If a newsletter ever exists, it will require your express, separate consent, which you can withdraw at any time.",
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
                  "Upstash, Inc.",
                  "When you send your details from the calculator or the assistant, SEDA's portal stores in Upstash, for 60 seconds, a cryptographic digest of your IP (pseudonymised data, not the IP in clear) to limit abuse. It acts as a processor.",
                  "United States",
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
                "If you book a call, your data is also processed by Calendly and Google Ireland Limited, as explained under “Booking a call with Calendly”. If you use the owners' assistant, your messages are also processed by Anthropic, as explained under “Owners' assistant”. There are no other recipients. We do not sell or transfer data to third parties for commercial purposes. Data would only be disclosed to authorities or public bodies if a legal rule required it. Postal letters have their own recipients, given in their section.",
            },
            {
              tipo: "parrafo",
              texto:
                "Vercel, Resend, Supabase, Upstash and Calendly are US companies, so the processing involves an international transfer of data outside the European Economic Area. You can ask us about the safeguards applicable to that transfer by writing to {email}.",
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
          id: "cartas",
          titulo: "Postal letters to holiday-rental owners",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "If you are the holder of a holiday rental in Torremolinos, Benalmádena, Málaga, Fuengirola, Mijas, Marbella, Estepona, Sotogrande (San Roque) or the coast of Nerja and Torrox, we may send you a letter by post. You did not give us your details yourself: this section is the information required by article 14 GDPR, and it is the one the letter refers to.",
            },
            {
              tipo: "tabla",
              cabeceras: ["Aspect", "Postal letters"],
              filas: [
                [
                  "Data",
                  "Your name or company name, the address of the property, its registration number and its number of places. Never your email address or telephone number.",
                ],
                [
                  "Source",
                  "The Andalusian Tourism Register, which the Junta de Andalucía publishes as open data (OpenRTA, CC BY 4.0 licence). We do not supplement it with other sources.",
                ],
                [
                  "Purpose",
                  "To send you by post, at most twice a year, information about our holiday-rental management service.",
                ],
                [
                  "Legal basis",
                  "Article 6(1)(f) GDPR: our legitimate interest in making our service known to those who, by appearing in a public register, run a holiday rental as an activity. We have carried out a documented assessment of that interest against your rights; you can ask for it by writing to {email}.",
                ],
                [
                  "Recipients",
                  "The printer that prints and prepares the letter (a processor) and the postal operator that delivers it. The system in which the mailings are managed is hosted by Vercel and Supabase, with servers in Frankfurt (EU).",
                ],
                [
                  "Retention",
                  "Up to 12 months after the last letter we send you, if you do not reply. Imported data for which no letter is produced within one month is deleted.",
                ],
                [
                  "Your rights",
                  "Access, rectification, erasure, restriction and objection, and the right to lodge a complaint with the Spanish Data Protection Agency (see “Your rights”).",
                ],
              ],
            },
            {
              tipo: "parrafo",
              texto:
                "Vercel and Supabase are US companies, so the processing involves an international transfer of data outside the European Economic Area, with appropriate safeguards. You can ask us about them by writing to {email}.",
            },
            {
              tipo: "parrafo",
              texto:
                "You can object (article 21 GDPR) at any time and without giving reasons: by scanning the opt-out QR code on the letter, or by writing to {email} with the code printed on the letter. We will not ask you for any further data. After an objection we will not write to you again, and for that purpose we keep only a cryptographic fingerprint of your data, from which the data cannot be recovered.",
            },
            {
              tipo: "parrafo",
              texto:
                "If you enter the calculator from the QR code on the letter and leave us your details, we record that the letter received a reply and link your request to that letter for as long as the mailing exists, in order to measure the result. The letter’s code is random and contains no data about you; we do not store it in your browser or send it to any measurement or advertising tool.",
            },
          ],
        },
        {
          id: "asistente",
          titulo: "Owners' assistant (artificial intelligence)",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "On /propietarios and on the calculator there may be a chat: the owners' assistant. It is an artificial intelligence, not a person, and it says so in its first message (Article 50 of Regulation (EU) 2024/1689, the Artificial Intelligence Act). It answers questions about SEDA's service, its fees, the holiday-rental regulations in Andalusia and the calculator. Do not write sensitive data in it: documents, bank accounts, cards or passwords.",
            },
            {
              tipo: "tabla",
              cabeceras: ["Aspect", "Owners' assistant"],
              filas: [
                [
                  "Data",
                  "The messages you write and the assistant's replies. Before your messages are sent, the server replaces anything that looks like sensitive data (IBAN, card, Spanish DNI or NIE, email address, phone number, passwords) with “[dato retirado]”. Your IP address, only to limit how often the chat can be used. If you ask us to contact you, the chat form collects your name, your email and, if you wish, your phone number.",
                ],
                [
                  "Purpose",
                  "Answering your questions about managing your home with SEDA. With the chat form, getting in touch with you. No profiling and no advertising.",
                ],
                [
                  "Legal basis",
                  "Article 6(1)(b) GDPR: pre-contractual steps you request by writing. The chat form, Article 6(1)(a) GDPR: your consent, which you give with its checkbox, as on the calculator.",
                ],
                [
                  "Who sees them",
                  "Nobody at SEDA reads the conversation, because we do not keep it. We only record metrics with no content: language, the message's position in the conversation, tools used, the types of data removed or masked (for example “iban” or “phone”, never the data itself), input, output and cached tokens, number of steps, finish reason, duration and, if there was one, the reason for the fallback message. What you leave in the chat form reaches SEDA's internal contact register, just like the calculator.",
                ],
                [
                  "Processor",
                  "Anthropic Ireland, Limited, which provides the artificial intelligence model (Claude) that writes the replies: each message is sent to it to generate the reply. It acts as a processor under its Data Processing Addendum (effective 24 February 2025), which forms part of its Commercial Terms, and those terms forbid it from training its models on the messages. Vercel runs the function that connects the chat to Anthropic.",
                ],
                [
                  "International transfer",
                  "Anthropic processes and stores the data outside the European Economic Area, mainly in the United States. The transfer relies on the European Commission's standard contractual clauses (modules two and three) incorporated in that addendum.",
                ],
                [
                  "Retention",
                  "SEDA does not keep the conversation: it lives only in your browser tab and disappears when you close it or reload the page. Anthropic deletes the messages and replies within 30 days at most, unless its safety systems flag them (then up to 2 years) or the law requires otherwise. Sources: its privacy article on retention and its API documentation, linked at the end of this section. The IP address used for the rate limiter, in memory for 10 minutes at most. The chat form data, like the calculator's.",
                ],
              ],
            },
            {
              tipo: "parrafo",
              texto:
                "The assistant can make mistakes. Its estimates use the same calculation as the calculator and are not a promise of income. It makes no decisions about you. For any decision, speak to a person: the chat always shows the link to the contact page. As SEDA does not keep the conversation, we cannot give you access to it or delete it; for the chat form data, see “Your rights”.",
            },
          ],
          enlaces: [
            { href: "https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data", etiqueta: "Anthropic: how long it stores data" },
            { href: "https://platform.claude.com/docs/en/manage-claude/api-and-data-retention", etiqueta: "Anthropic: API data retention" },
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
                "This site's form rate limiter holds your IP address in memory for ten minutes at most: it is never written to a database and does not survive a restart of the service. In addition, to limit abuse, when you send your details from the calculator or the assistant SEDA's portal stores a cryptographic digest of your IP (pseudonymised data) for 60 seconds in Upstash, its processor. The hosting provider's technical logs are kept for its own periods, which we do not decide.",
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
            {
              tipo: "parrafo",
              texto:
                "The same applies to the owners' assistant form. Conversations with the assistant are not kept anywhere at SEDA.",
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
                "We take no automated decisions and build no profiles from your data: every message sent through the forms is read by a person. The owners' assistant replies automatically, but it decides nothing about you.",
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
                "Nous ne traitons que les données que vous nous donnez. Nous ne les achetons pas, ne les obtenons pas auprès de tiers et ne les enrichissons pas depuis des sources externes. La seule exception concerne les courriers postaux aux titulaires de logements touristiques, dont les données proviennent d'un registre public (voir « Courriers postaux aux titulaires de logements touristiques »).",
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
                "Nous n'utilisons pas les données que vous nous donnez pour vous envoyer des communications commerciales (les courriers postaux aux titulaires de logements touristiques, décrits à part, ne partent pas de données que vous avez fournies). Si une lettre d'information voit le jour, elle exigera votre consentement exprès et distinct, révocable à tout moment.",
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
                  "Upstash, Inc.",
                  "Lorsque vous envoyez vos coordonnées depuis le calculateur ou l'assistant, le portail de SEDA conserve chez Upstash, pendant 60 secondes, une empreinte cryptographique de votre adresse IP (une donnée pseudonymisée, pas l'adresse IP en clair) pour limiter les abus. Upstash agit comme sous-traitant.",
                  "États-Unis",
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
                "Si vous réservez un appel, vos données sont aussi traitées par Calendly et Google Ireland Limited, comme expliqué sous « Réservation d'un appel avec Calendly ». Si vous utilisez l'assistant pour propriétaires, vos messages sont aussi traités par Anthropic, comme expliqué sous « Assistant pour propriétaires ». Il n'y a pas d'autres destinataires. Nous ne vendons ni ne cédons de données à des tiers à des fins commerciales. Elles ne seraient communiquées aux autorités ou organismes publics que si une norme l'exigeait. Les courriers postaux ont leurs propres destinataires, indiqués dans leur section.",
            },
            {
              tipo: "parrafo",
              texto:
                "Vercel, Resend, Supabase, Upstash et Calendly sont des sociétés américaines : le traitement implique un transfert international de données hors de l'Espace économique européen. Vous pouvez nous demander des informations sur les garanties applicables à ce transfert en écrivant à {email}.",
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
          id: "cartas",
          titulo: "Courriers postaux aux titulaires de logements touristiques",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Si vous êtes titulaire d'un logement touristique à Torremolinos, Benalmádena, Málaga, Fuengirola, Mijas, Marbella, Estepona, Sotogrande (San Roque) ou sur le littoral de Nerja et de Torrox, nous pouvons vous écrire par courrier postal. Ce n'est pas vous qui nous avez donné vos données : cette section est l'information prévue à l'article 14 du RGPD, celle à laquelle renvoie le courrier.",
            },
            {
              tipo: "tabla",
              cabeceras: ["Aspect", "Courriers postaux"],
              filas: [
                [
                  "Données",
                  "Votre nom ou raison sociale, l'adresse du logement, son numéro d'enregistrement et son nombre de places. Jamais votre courriel ni votre téléphone.",
                ],
                [
                  "Origine",
                  "Le Registre du tourisme d'Andalousie, que la Junta de Andalucía publie en données ouvertes (OpenRTA, licence CC BY 4.0). Nous ne les complétons pas avec d'autres sources.",
                ],
                [
                  "Finalité",
                  "Vous envoyer par courrier postal, au plus deux fois par an, des informations sur notre service de gestion de logements touristiques.",
                ],
                [
                  "Base juridique",
                  "Article 6.1.f du RGPD : intérêt légitime à faire connaître notre service à ceux qui, figurant dans un registre public, exercent cette activité. Nous avons réalisé une évaluation documentée de cet intérêt au regard de vos droits ; vous pouvez la demander en écrivant à {email}.",
                ],
                [
                  "Destinataires",
                  "L'imprimerie qui imprime et prépare le courrier (sous-traitant) et l'opérateur postal qui le distribue. Le système dans lequel les envois sont gérés est hébergé par Vercel et Supabase, avec des serveurs à Francfort (UE).",
                ],
                [
                  "Conservation",
                  "Jusqu'à 12 mois après le dernier courrier que nous vous envoyons, si vous ne répondez pas. Les données importées dont il ne résulte aucun courrier dans un délai d'un mois sont supprimées.",
                ],
                [
                  "Vos droits",
                  "Accès, rectification, effacement, limitation et opposition, et réclamation auprès de l'Agence espagnole de protection des données (voir « Vos droits »).",
                ],
              ],
            },
            {
              tipo: "parrafo",
              texto:
                "Vercel et Supabase sont des sociétés américaines : le traitement implique un transfert international de données hors de l'Espace économique européen, avec les garanties appropriées. Vous pouvez nous en demander le détail en écrivant à {email}.",
            },
            {
              tipo: "parrafo",
              texto:
                "Vous pouvez vous opposer (article 21 du RGPD) à tout moment et sans motif : en scannant le code QR de désinscription du courrier, ou en écrivant à {email} avec le code figurant sur le courrier. Nous ne vous demanderons aucune autre donnée. Après une opposition, nous ne vous écrirons plus, et pour cela nous ne conservons qu'une empreinte cryptographique de vos données, dont elles ne peuvent pas être retrouvées.",
            },
            {
              tipo: "parrafo",
              texto:
                "Si vous accédez au calculateur depuis le code QR du courrier et nous laissez vos coordonnées, nous notons que le courrier a reçu une réponse et nous rattachons votre demande à ce courrier tant que l'envoi existe, afin de mesurer le résultat. Le code du courrier est aléatoire et ne contient aucune donnée vous concernant ; nous ne le conservons pas dans votre navigateur et ne l'envoyons à aucun outil de mesure ou de publicité.",
            },
          ],
        },
        {
          id: "asistente",
          titulo: "Assistant pour propriétaires (intelligence artificielle)",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Sur /propietarios et sur le calculateur, il peut y avoir un chat : l'assistant pour propriétaires. C'est une intelligence artificielle, pas une personne, et il le dit dans son premier message (article 50 du règlement (UE) 2024/1689 sur l'intelligence artificielle). Il répond sur le service de SEDA, son tarif, la réglementation des logements touristiques en Andalousie et le calculateur. N'y écrivez pas de données sensibles : pièces d'identité, comptes bancaires, cartes ou mots de passe.",
            },
            {
              tipo: "tabla",
              cabeceras: ["Aspect", "Assistant pour propriétaires"],
              filas: [
                [
                  "Données",
                  "Les messages que vous écrivez et les réponses de l'assistant. Avant l'envoi de vos messages, le serveur remplace ce qui ressemble à une donnée sensible (IBAN, carte, DNI ou NIE espagnols, adresse e-mail, téléphone, mots de passe) par « [dato retirado] ». Votre adresse IP, uniquement pour limiter la fréquence d'utilisation. Si vous demandez à être contacté, le formulaire du chat recueille votre nom, votre e-mail et, si vous le souhaitez, votre téléphone.",
                ],
                [
                  "Finalité",
                  "Répondre à vos questions sur la gestion de votre logement avec SEDA. Avec le formulaire du chat, prendre contact avec vous. Sans profilage ni publicité.",
                ],
                [
                  "Base juridique",
                  "Article 6.1.b du RGPD : mesures précontractuelles que vous demandez en écrivant. Le formulaire du chat, article 6.1.a du RGPD : votre consentement, que vous donnez avec sa case, comme sur le calculateur.",
                ],
                [
                  "Qui les voit",
                  "Personne chez SEDA ne lit la conversation, car nous ne la conservons pas. Nous n'enregistrons que des mesures sans contenu : langue, rang du message dans la conversation, outils utilisés, types de données retirées ou masquées (par exemple « iban » ou « téléphone », jamais la donnée), jetons en entrée, en sortie et en cache, nombre d'étapes, motif de fin, durée et, le cas échéant, le motif du message de secours. Ce que vous laissez dans le formulaire du chat arrive dans le registre interne des contacts de SEDA, comme pour le calculateur.",
                ],
                [
                  "Sous-traitant",
                  "Anthropic Ireland, Limited, qui fournit le modèle d'intelligence artificielle (Claude) qui rédige les réponses : chaque message lui est envoyé pour générer la réponse. Il agit comme sous-traitant selon son avenant relatif au traitement des données (Data Processing Addendum, en vigueur depuis le 24 février 2025), qui fait partie de ses conditions commerciales, lesquelles lui interdisent d'entraîner ses modèles avec les messages. Vercel exécute la fonction qui relie le chat à Anthropic.",
                ],
                [
                  "Transfert international",
                  "Anthropic traite et stocke les données hors de l'Espace économique européen, principalement aux États-Unis. Le transfert repose sur les clauses contractuelles types de la Commission européenne (modules deux et trois) intégrées à cet avenant.",
                ],
                [
                  "Conservation",
                  "SEDA ne conserve pas la conversation : elle n'existe que dans l'onglet de votre navigateur et disparaît lorsque vous le fermez ou rechargez la page. Anthropic supprime les messages et les réponses dans un délai maximal de 30 jours, sauf si ses systèmes de sécurité les signalent (alors jusqu'à 2 ans) ou si la loi l'exige. Sources : son article de confidentialité sur la conservation et la documentation de son API, liés à la fin de cette section. L'adresse IP du contrôle de fréquence, en mémoire et 10 minutes au maximum. Les données du formulaire du chat, comme celles du calculateur.",
                ],
              ],
            },
            {
              tipo: "parrafo",
              texto:
                "L'assistant peut se tromper. Ses estimations utilisent le même calcul que le calculateur et ne sont pas une promesse de revenus. Il ne prend aucune décision vous concernant. Pour toute décision, parlez à une personne : le chat affiche toujours le lien vers la page de contact. Comme SEDA ne conserve pas la conversation, nous ne pouvons ni vous y donner accès ni l'effacer ; pour les données du formulaire du chat, voir « Vos droits ».",
            },
          ],
          enlaces: [
            { href: "https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data", etiqueta: "Anthropic : durée de conservation des données" },
            { href: "https://platform.claude.com/docs/en/manage-claude/api-and-data-retention", etiqueta: "Anthropic : conservation des données de l'API" },
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
                "Le contrôle de fréquence des formulaires de ce site conserve votre adresse IP en mémoire pendant dix minutes au maximum : elle n'est écrite dans aucune base de données et ne survit pas au redémarrage du service. En outre, pour limiter les abus, lorsque vous envoyez vos coordonnées depuis le calculateur ou l'assistant, le portail de SEDA conserve une empreinte cryptographique de votre adresse IP (une donnée pseudonymisée) pendant 60 secondes chez Upstash, son sous-traitant. Les journaux techniques de l'hébergeur suivent ses propres délais, que nous ne décidons pas.",
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
            {
              tipo: "parrafo",
              texto:
                "Il en va de même pour le formulaire de l'assistant pour propriétaires. Les conversations avec l'assistant ne sont conservées nulle part chez SEDA.",
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
                "Nous ne prenons aucune décision automatisée et n'établissons aucun profil à partir de vos données : chaque message des formulaires est lu par une personne. L'assistant pour propriétaires répond de façon automatique, mais ne décide rien vous concernant.",
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
                "Wir verarbeiten nur die Daten, die Sie uns geben. Wir kaufen sie nicht, beziehen sie nicht von Dritten und reichern sie nicht aus externen Quellen an. Die einzige Ausnahme ist die Briefpost an Inhaber von Ferienwohnungen, deren Daten aus einem öffentlichen Register stammen (siehe „Briefpost an Inhaber von Ferienwohnungen“).",
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
                "Wir nutzen die Daten, die Sie uns geben, nicht für Werbung (die Briefpost an Inhaber von Ferienwohnungen, gesondert beschrieben, geht nicht von Daten aus, die Sie angegeben haben). Sollte es je einen Newsletter geben, verlangt er Ihre ausdrückliche, gesonderte Einwilligung, die Sie jederzeit widerrufen können.",
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
                  "Upstash, Inc.",
                  "Wenn Sie Ihre Daten über den Rechner oder den Assistenten senden, speichert das Portal von SEDA bei Upstash 60 Sekunden lang einen kryptografischen Hashwert Ihrer IP-Adresse (ein pseudonymisiertes Datum, nicht die IP-Adresse im Klartext), um Missbrauch zu begrenzen. Upstash handelt als Auftragsverarbeiter.",
                  "Vereinigte Staaten",
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
                "Wenn Sie ein Gespräch buchen, verarbeiten auch Calendly und Google Ireland Limited Ihre Daten, wie unter „Buchung eines Gesprächs über Calendly“ erläutert. Wenn Sie den Assistenten für Eigentümer nutzen, verarbeitet zusätzlich Anthropic Ihre Nachrichten, wie unter „Assistent für Eigentümer“ erläutert. Weitere Empfänger gibt es nicht. Wir verkaufen oder übermitteln keine Daten zu kommerziellen Zwecken an Dritte. An Behörden oder öffentliche Stellen würden sie nur übermittelt, wenn eine Rechtsvorschrift das verlangt. Die Briefpost hat eigene Empfänger, die in ihrem Abschnitt genannt sind.",
            },
            {
              tipo: "parrafo",
              texto:
                "Vercel, Resend, Supabase, Upstash und Calendly sind US-amerikanische Unternehmen: Die Verarbeitung umfasst eine internationale Datenübermittlung außerhalb des Europäischen Wirtschaftsraums. Informationen zu den für diese Übermittlung geltenden Garantien erhalten Sie auf Anfrage unter {email}.",
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
          id: "cartas",
          titulo: "Briefpost an Inhaber von Ferienwohnungen",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Wenn Sie Inhaber einer Ferienwohnung in Torremolinos, Benalmádena, Málaga, Fuengirola, Mijas, Marbella, Estepona, Sotogrande (San Roque) oder an der Küste von Nerja und Torrox sind, können wir Ihnen einen Brief schicken. Ihre Daten haben nicht Sie uns gegeben: Dieser Abschnitt enthält die Information nach Art. 14 DSGVO, auf die der Brief verweist.",
            },
            {
              tipo: "tabla",
              cabeceras: ["Aspekt", "Briefpost"],
              filas: [
                [
                  "Daten",
                  "Ihr Name oder Ihre Firma, die Adresse der Wohnung, ihre Registernummer und die Zahl der Plätze. Niemals Ihre E-Mail-Adresse oder Telefonnummer.",
                ],
                [
                  "Herkunft",
                  "Das Tourismusregister Andalusiens, das die Junta de Andalucía als offene Daten veröffentlicht (OpenRTA, Lizenz CC BY 4.0). Wir ergänzen sie nicht aus anderen Quellen.",
                ],
                [
                  "Zweck",
                  "Ihnen per Post, höchstens zweimal im Jahr, Informationen über unseren Verwaltungsservice für Ferienwohnungen zu schicken.",
                ],
                [
                  "Rechtsgrundlage",
                  "Art. 6 Abs. 1 lit. f DSGVO: berechtigtes Interesse, unseren Service denen bekannt zu machen, die als Eintragung in einem öffentlichen Register eine Ferienwohnung betreiben. Wir haben dieses Interesse gegenüber Ihren Rechten dokumentiert abgewogen; die Abwägung können Sie unter {email} anfordern.",
                ],
                [
                  "Empfänger",
                  "Die Druckerei, die den Brief druckt und vorbereitet (Auftragsverarbeiter), und der Postdienstleister, der ihn zustellt. Das System, in dem die Sendungen verwaltet werden, wird von Vercel und Supabase gehostet, mit Servern in Frankfurt (EU).",
                ],
                [
                  "Speicherdauer",
                  "Bis zu 12 Monate nach dem letzten Brief, den wir Ihnen schicken, wenn Sie nicht antworten. Importierte Daten, aus denen binnen eines Monats kein Brief entsteht, werden gelöscht.",
                ],
                [
                  "Ihre Rechte",
                  "Auskunft, Berichtigung, Löschung, Einschränkung und Widerspruch sowie Beschwerde bei der spanischen Datenschutzbehörde (siehe „Ihre Rechte“).",
                ],
              ],
            },
            {
              tipo: "parrafo",
              texto:
                "Vercel und Supabase sind US-amerikanische Unternehmen: Die Verarbeitung bringt eine internationale Übermittlung von Daten außerhalb des Europäischen Wirtschaftsraums mit sich, mit geeigneten Garantien. Informationen dazu erhalten Sie unter {email}.",
            },
            {
              tipo: "parrafo",
              texto:
                "Sie können jederzeit und ohne Begründung widersprechen (Art. 21 DSGVO): mit dem Abmelde-QR-Code auf dem Brief oder per E-Mail an {email} mit dem Code, der auf dem Brief steht. Weitere Daten verlangen wir nicht. Nach einem Widerspruch schreiben wir Ihnen nicht mehr; dafür speichern wir nur einen kryptografischen Fingerabdruck Ihrer Daten, aus dem sich die Daten nicht wiederherstellen lassen.",
            },
            {
              tipo: "parrafo",
              texto:
                "Wenn Sie über den QR-Code auf dem Brief in den Rechner gelangen und uns Ihre Daten hinterlassen, vermerken wir, dass der Brief eine Antwort erhalten hat, und verknüpfen Ihre Anfrage mit diesem Brief, solange die Sendung besteht, um das Ergebnis zu messen. Der Code des Briefs ist zufällig und enthält keine Angaben zu Ihnen; wir speichern ihn nicht in Ihrem Browser und übermitteln ihn an kein Mess- oder Werbewerkzeug.",
            },
          ],
        },
        {
          id: "asistente",
          titulo: "Assistent für Eigentümer (künstliche Intelligenz)",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "Auf /propietarios und im Rechner kann es einen Chat geben: den Assistenten für Eigentümer. Er ist eine künstliche Intelligenz, kein Mensch, und sagt das in seiner ersten Nachricht (Artikel 50 der Verordnung (EU) 2024/1689 über künstliche Intelligenz). Er beantwortet Fragen zum Service von SEDA, zum Tarif, zu den Vorschriften für Ferienwohnungen in Andalusien und zum Rechner. Schreiben Sie dort keine sensiblen Daten: keine Ausweise, Bankkonten, Karten oder Passwörter.",
            },
            {
              tipo: "tabla",
              cabeceras: ["Aspekt", "Assistent für Eigentümer"],
              filas: [
                [
                  "Daten",
                  "Die Nachrichten, die Sie schreiben, und die Antworten des Assistenten. Bevor Ihre Nachrichten gesendet werden, ersetzt der Server alles, was wie ein sensibles Datum aussieht (IBAN, Karte, spanische DNI oder NIE, E-Mail-Adresse, Telefonnummer, Passwörter), durch „[dato retirado]“. Ihre IP-Adresse, nur um die Nutzungshäufigkeit zu begrenzen. Wenn Sie um Kontakt bitten, erfasst das Formular im Chat Ihren Namen, Ihre E-Mail-Adresse und, wenn Sie möchten, Ihre Telefonnummer.",
                ],
                [
                  "Zweck",
                  "Ihre Fragen zur Verwaltung Ihrer Immobilie mit SEDA beantworten. Mit dem Formular im Chat: mit Ihnen Kontakt aufnehmen. Ohne Profilbildung und ohne Werbung.",
                ],
                [
                  "Rechtsgrundlage",
                  "Art. 6 Abs. 1 lit. b DSGVO: vorvertragliche Maßnahmen, um die Sie mit Ihrer Nachricht bitten. Das Formular im Chat: Art. 6 Abs. 1 lit. a DSGVO, Ihre Einwilligung, die Sie mit dem Kontrollkästchen erteilen, wie im Rechner.",
                ],
                [
                  "Wer sie sieht",
                  "Bei SEDA liest niemand das Gespräch, weil wir es nicht speichern. Wir erfassen nur Kennzahlen ohne Inhalt: Sprache, Position der Nachricht im Gespräch, verwendete Werkzeuge, Arten entfernter oder abgedeckter Daten (zum Beispiel „iban“ oder „Telefon“, nie die Daten selbst), Eingabe-, Ausgabe- und Cache-Tokens, Anzahl der Schritte, Abschlussgrund, Dauer und gegebenenfalls den Grund für die Ersatznachricht. Was Sie im Formular des Chats hinterlassen, gelangt in das interne Kontaktverzeichnis von SEDA, genau wie beim Rechner.",
                ],
                [
                  "Auftragsverarbeiter",
                  "Anthropic Ireland, Limited, das das KI-Modell (Claude) bereitstellt, das die Antworten verfasst: Jede Nachricht wird dorthin gesendet, um die Antwort zu erzeugen. Anthropic handelt als Auftragsverarbeiter nach seinem Data Processing Addendum (in Kraft seit dem 24. Februar 2025), das Teil seiner Commercial Terms ist; diese verbieten ihm, seine Modelle mit den Nachrichten zu trainieren. Vercel führt die Funktion aus, die den Chat mit Anthropic verbindet.",
                ],
                [
                  "Internationale Übermittlung",
                  "Anthropic verarbeitet und speichert die Daten außerhalb des Europäischen Wirtschaftsraums, hauptsächlich in den Vereinigten Staaten. Die Übermittlung stützt sich auf die Standardvertragsklauseln der Europäischen Kommission (Module zwei und drei), die dieses Addendum enthält.",
                ],
                [
                  "Speicherdauer",
                  "SEDA speichert das Gespräch nicht: Es existiert nur im Tab Ihres Browsers und verschwindet, wenn Sie ihn schließen oder die Seite neu laden. Anthropic löscht die Nachrichten und Antworten spätestens nach 30 Tagen, es sei denn, seine Sicherheitssysteme markieren sie (dann bis zu 2 Jahre) oder das Gesetz verlangt es. Quellen: sein Datenschutzartikel zur Speicherdauer und seine API-Dokumentation, verlinkt am Ende dieses Abschnitts. Die IP-Adresse der Häufigkeitsbegrenzung: im Arbeitsspeicher, höchstens 10 Minuten. Die Daten aus dem Formular des Chats: wie beim Rechner.",
                ],
              ],
            },
            {
              tipo: "parrafo",
              texto:
                "Der Assistent kann sich irren. Seine Schätzungen nutzen dieselbe Berechnung wie der Rechner und sind kein Einnahmeversprechen. Er trifft keine Entscheidungen über Sie. Für jede Entscheidung sprechen Sie mit einem Menschen: Der Chat zeigt immer den Link zur Kontaktseite. Da SEDA das Gespräch nicht speichert, können wir Ihnen weder Zugang dazu geben noch es löschen; für die Daten aus dem Formular des Chats siehe „Ihre Rechte“.",
            },
          ],
          enlaces: [
            { href: "https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data", etiqueta: "Anthropic: Speicherdauer der Daten" },
            { href: "https://platform.claude.com/docs/en/manage-claude/api-and-data-retention", etiqueta: "Anthropic: Datenspeicherung der API" },
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
                "Die Frequenzbegrenzung der Formulare dieser Website hält Ihre IP-Adresse höchstens zehn Minuten im Arbeitsspeicher: Sie wird in keine Datenbank geschrieben und überlebt keinen Neustart des Dienstes. Außerdem speichert das Portal von SEDA, um Missbrauch zu begrenzen, einen kryptografischen Hashwert Ihrer IP-Adresse (ein pseudonymisiertes Datum) 60 Sekunden lang bei Upstash, seinem Auftragsverarbeiter, wenn Sie Ihre Daten über den Rechner oder den Assistenten senden. Die technischen Protokolle des Hosting-Anbieters folgen dessen eigenen Fristen, über die wir nicht entscheiden.",
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
            {
              tipo: "parrafo",
              texto:
                "Dasselbe gilt für das Formular des Assistenten für Eigentümer. Gespräche mit dem Assistenten werden bei SEDA nirgends gespeichert.",
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
                "Wir treffen keine automatisierten Entscheidungen und erstellen keine Profile aus Ihren Daten: Jede Nachricht aus den Formularen liest ein Mensch. Der Assistent für Eigentümer antwortet automatisch, entscheidet aber nichts über Sie.",
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
