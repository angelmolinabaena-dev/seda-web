import { describe, expect, it } from "vitest"
import { METATEXTO, PATRONES_METATEXTO } from "./asistente/bateria"

/*
  Cada patrón de METATEXTO se prueba POR SEPARADO: una frase que debe casar y otra
  legítima que no. En #126 cuatro patrones nunca casaban (\b sin la bandera u no
  entiende «é» ni «ü») y el test pasaba en verde porque otras palabras de la frase
  («herramientas», «outil», «Werkzeug») tapaban el fallo. Aquí cada frase que debe
  casar lleva SOLO lo que prueba su patrón, y se comprueba que ningún OTRO patrón
  la detecta, de modo que un patrón muerto no puede esconderse detrás de otro.
*/

type Caso = { casa: string[]; noCasa: string[] }

const CASOS: Record<string, Caso> = {
  "es-herramienta": {
    casa: ["Consulto la herramienta de tarifa.", "Las herramientas no están disponibles."],
    noCasa: ["La comisión de gestión es la que figura en la tarifa publicada."],
  },
  "es-verbo-1p": {
    casa: ["Lo consulté.", "Lo comprobé, y se mantiene.", "Ya lo verifiqué: es así", "Revisé la tarifa", "Sí. Consulté,"],
    noCasa: ["Puede consultar la tarifa en la web.", "Le consultaremos con el equipo.", "Es una comprobación habitual.", "Lo revisará una persona del equipo."],
  },
  "es-he-hecho": {
    casa: ["He consultado la tarifa.", "He vuelto a verificar las cifras.", "Lo he comprobado de nuevo.", "He revisado lo anterior;"],
    noCasa: ["Hemos consultado con el equipo.", "Hecho: la tarifa es la publicada.", "Verificar el alta es sencillo, no he dicho más."],
  },
  "es-vuelto-a": {
    casa: ["Hemos vuelto a verificar el dato.", "Ha vuelto a comprobar la cifra,"],
    noCasa: ["Si vuelve a escribirnos, le atenderemos.", "Volveremos a consultar con usted el calendario."],
  },
  "es-turno": {
    casa: ["En este turno no llamé a nada.", "En el turno anterior le dije otra cosa.", "En turnos anteriores hablamos de la tarifa.", "Ese turno ya pasó."],
    noCasa: ["Hay un turno de limpieza por salida.", "Los turnos de mantenimiento los organiza el equipo.", "Es su turno de elegir fechas."],
  },
  "en-tool": {
    casa: ["I used the tool again.", "The tools returned the same figure.", "No tool was needed."],
    noCasa: ["The tooling of the villa is included.", "A stool in the kitchen.", "It is a toolbox of services."],
  },
  "en-i-checked": {
    casa: ["I checked the fee again.", "I've verified the figures.", "I have just consulted the rates.", "I double-checked it.", "I looked up the rate."],
    noCasa: ["You can check the fee on the website.", "Checked-in guests receive a welcome pack.", "We verified your request is complete."],
  },
  "en-turn": {
    casa: ["In this turn I did not call anything.", "As in my previous turn, the fee is the same.", "Earlier turns were fine.", "That turn is over.", "Two turns ago I said otherwise."],
    noCasa: ["A turn-key service for your villa.", "In turn, the team will contact you.", "Take a left turn at the roundabout.", "Turn the page on empty weeks."],
  },
  "de-werkzeug": {
    casa: ["Ich nutze das Werkzeug.", "Mit dem Werkzeug geprüft."],
    noCasa: ["Die Verwaltung übernimmt SEDA für Sie."],
  },
  "de-ich-habe": {
    casa: ["Ich habe das erneut überprüft.", "Ich habe es geprüft.", "Ich habe noch einmal nachgesehen.", "Ich habe die Provision abgefragt, sie bleibt gleich."],
    noCasa: ["Gerne habe ich Ihnen alles erklärt.", "Wir haben Ihre Anfrage überprüft"],
  },
  "de-runde": {
    casa: ["In dieser Runde habe ich nichts aufgerufen.", "In der vorherigen Runde sagte ich etwas anderes.", "Frühere Runden waren anders.", "Die letzte Runde war kurz."],
    noCasa: ["Eine Runde Golf an der Costa del Sol.", "Die Gesprächsrunde mit dem Team findet online statt.", "Die Finanzierungsrunde ist abgeschlossen."],
  },
  "fr-outil": {
    casa: ["J'utilise l'outil de tarif.", "Les outils ne sont pas disponibles."],
    noCasa: ["Le service est outillé pour votre villa.", "Un routeur est inclus."],
  },
  "fr-jai-verifie": {
    casa: ["J’ai vérifié le tarif.", "J'ai de nouveau consulté la grille.", "J'ai contrôlé les chiffres.", "J’ai à nouveau vérifié."],
    noCasa: ["Vous pouvez vérifier le tarif sur le site.", "Nous avons consulté l'équipe.", "J'ai bien compris votre demande."],
  },
  "fr-tour": {
    casa: ["Au tour précédent, je vous ai dit autre chose.", "Dans le précédent tour, rien n'a changé.", "Au dernier tour de la conversation, oui.", "Les tours précédents étaient clairs."],
    noCasa: ["Un tour de la propriété est possible.", "L'équipe vous appellera à tour de rôle.", "Le tour de ville est inclus."],
  },
}

describe("METATEXTO: cada patrón por separado, en los cuatro idiomas", () => {
  it("hay casos para todos los patrones y ninguno huérfano", () => {
    expect(Object.keys(CASOS).sort()).toEqual(Object.keys(PATRONES_METATEXTO).sort())
    expect(METATEXTO).toHaveLength(Object.keys(PATRONES_METATEXTO).length)
    for (const l of ["es", "en", "de", "fr"]) expect(Object.keys(PATRONES_METATEXTO).some((k) => k.startsWith(`${l}-`)), l).toBe(true)
  })

  for (const [nombre, re] of Object.entries(PATRONES_METATEXTO)) {
    const c = CASOS[nombre]
    it(`${nombre} usa la bandera u`, () => expect(re.flags).toContain("u"))
    for (const f of c?.casa ?? []) {
      it(`${nombre} casa: ${f}`, () => {
        expect(re.test(f)).toBe(true)
      })
    }
    for (const f of c?.noCasa ?? []) {
      it(`${nombre} NO casa (legítima): ${f}`, () => {
        expect(re.test(f)).toBe(false)
        // ninguna frase legítima la detecta tampoco otro patrón
        expect(METATEXTO.some((o) => o.test(f)), "otro patrón la detecta").toBe(false)
      })
    }
  }

  it("un patrón vivo: «consulté» al final, ante espacio y ante puntuación (el fallo de #126)", () => {
    const re = PATRONES_METATEXTO["es-verbo-1p"]
    for (const f of ["consulté", "consulté ", "consulté.", "consulté,", "¿consulté?", "Sí, consulté la tarifa"]) expect(re.test(f), f).toBe(true)
  })
})
