import type { Locale } from "@/i18n/routing"

/*
  Mensajes de respaldo del asistente — lo que se dice SIN llamar al modelo:
  límite por visitante o por conversación, tope diario alcanzado, fallo del
  proveedor o falta de configuración. Siempre amables y siempre con la salida
  «déjenos sus datos y le llamamos» (la interfaz muestra el formulario debajo).

  Viven en el núcleo, no en messages/*.json, porque también los usará la puerta
  de WhatsApp (guest-app), que no lee los mensajes de la web.
*/

export type MotivoRespaldo = "limite_visitante" | "limite_conversacion" | "tope_diario" | "no_disponible"

const TEXTOS: Record<Locale, Record<MotivoRespaldo, string>> = {
  es: {
    limite_visitante:
      "Ha enviado muchos mensajes en poco tiempo. Si lo prefiere, déjenos sus datos y le llamamos; o vuelva a escribirnos en unos minutos.",
    limite_conversacion:
      "Hemos llegado al final de lo que puedo atender en esta conversación. Déjenos sus datos y una persona del equipo le llamará para seguir.",
    tope_diario:
      "Hoy el asistente ha atendido todas las consultas que puede. Déjenos sus datos y le llamamos.",
    no_disponible:
      "El asistente no está disponible en este momento. Déjenos sus datos y le llamamos.",
  },
  en: {
    limite_visitante:
      "You have sent a lot of messages in a short time. If you prefer, leave us your details and we will call you, or write again in a few minutes.",
    limite_conversacion:
      "We have reached the end of what I can handle in this conversation. Leave us your details and someone from the team will call you to continue.",
    tope_diario: "The assistant has answered all the questions it can for today. Leave us your details and we will call you.",
    no_disponible: "The assistant is not available right now. Leave us your details and we will call you.",
  },
  de: {
    limite_visitante:
      "Sie haben in kurzer Zeit viele Nachrichten gesendet. Wenn Sie möchten, hinterlassen Sie uns Ihre Daten und wir rufen Sie an, oder schreiben Sie uns in einigen Minuten erneut.",
    limite_conversacion:
      "Wir sind am Ende dessen angelangt, was ich in diesem Gespräch beantworten kann. Hinterlassen Sie uns Ihre Daten, und jemand aus dem Team ruft Sie an.",
    tope_diario:
      "Der Assistent hat für heute alle Anfragen beantwortet, die er kann. Hinterlassen Sie uns Ihre Daten, und wir rufen Sie an.",
    no_disponible: "Der Assistent ist im Moment nicht verfügbar. Hinterlassen Sie uns Ihre Daten, und wir rufen Sie an.",
  },
  fr: {
    limite_visitante:
      "Vous avez envoyé beaucoup de messages en peu de temps. Si vous le souhaitez, laissez-nous vos coordonnées et nous vous appellerons, ou écrivez-nous à nouveau dans quelques minutes.",
    limite_conversacion:
      "Nous sommes arrivés au bout de ce que je peux traiter dans cette conversation. Laissez-nous vos coordonnées et une personne de l'équipe vous appellera.",
    tope_diario:
      "L'assistant a répondu aujourd'hui à toutes les demandes qu'il peut traiter. Laissez-nous vos coordonnées et nous vous appellerons.",
    no_disponible: "L'assistant n'est pas disponible pour le moment. Laissez-nous vos coordonnées et nous vous appellerons.",
  },
}

export function textoRespaldo(locale: Locale, motivo: MotivoRespaldo): string {
  return TEXTOS[locale][motivo]
}

export const MOTIVOS_RESPALDO = Object.keys(TEXTOS.es) as MotivoRespaldo[]
