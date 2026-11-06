import type { Locale } from "@/i18n/routing"
import { requisitosDe, type GrupoRequisitos } from "@/lib/guias-contenido/vut-andalucia"

/*
  Catálogo de guías — modelo de contenido para `/guias`.

  DECISIÓN: datos estructurados en TypeScript (este fichero), no MDX.
  Ver razonamiento completo en la descripción del PR. Resumen: el repo no
  tiene pipeline MDX (ninguna dependencia `@next/mdx` / `next-mdx-remote`
  en package.json), y el patrón ya existente para catálogos (`lib/*.ts`
  exportando datos tipados, consumidos por `app/[locale]/...`) es el mismo
  que usa `lib/seo-urls.ts` y las páginas server-component del sitio.
  Ángel escribe primero en español: con este modelo añade una guía nueva
  como un objeto, rellena `es` y deja el resto de idiomas con el mismo
  cuerpo provisional o vacío hasta traducir — sin instalar un pipeline de
  build nuevo ni aprender sintaxis MDX.

  ESTADO Y PUERTA DE INDEXACIÓN (fail closed):
  `estado !== "publicada"` (incluido cualquier valor inesperado o ausente)
  se trata como borrador: `noindex` + fuera del sitemap. Ver `esPublicable`.
*/

export type EstadoGuia = "borrador" | "publicada"

export type Fuente = {
  label: string
  url: string
}

export type GuiaTraduccion = {
  titulo: string
  entradilla: string
  /** Cuerpo como lista de párrafos — evita HTML/MDX embebido en el catálogo. */
  cuerpo: string[]
  /**
   * Requisitos agrupados por estancia, cada uno con su artículo (ver
   * lib/guias-contenido/). Se pintan como lista de comprobación tras el cuerpo.
   * Las guías sin lista de requisitos lo dejan sin definir.
   */
  requisitos?: GrupoRequisitos[]
  /** Párrafos tras la lista (avisos, qué normas la modifican). */
  notas?: string[]
}

export type Guia = {
  slug: string
  estado: EstadoGuia
  /** `null` mientras no haya autor asignado (ej. la guía de prueba). */
  autorId: string | null
  /** ISO 8601 (YYYY-MM-DD). `null` si aún no se ha publicado. */
  fechaPublicacion: string | null
  /** ISO 8601 (YYYY-MM-DD). `null` si no ha habido revisión posterior. */
  fechaRevision: string | null
  fuentes: Fuente[]
  /** Si la guía lleva llamada a la calculadora de propietarios (solo se pinta con la calculadora encendida). */
  calculadora?: boolean
  traducciones: Record<Locale, GuiaTraduccion>
}

export const guias: Guia[] = [
  {
    // Plan «Motor SEDA», fase 1. Fuente única: texto consolidado oficial del
    // Decreto 28/2016 (Junta de Andalucía). Ver lib/guias-contenido/vut-andalucia.ts
    // y docs/fuentes/DECRETO-28-2016-consolidado.txt.
    slug: "requisitos-vivienda-turistica-andalucia",
    estado: "publicada",
    autorId: "angel-molina",
    fechaPublicacion: "2026-11-06",
    // Fecha en que se contrastó la guía con el texto consolidado oficial.
    // Hay que actualizarla CADA vez que se vuelva a comprobar contra el BOJA.
    fechaRevision: "2026-11-06",
    calculadora: true,
    fuentes: [
      {
        label: "Decreto 28/2016 — texto consolidado oficial (Junta de Andalucía, PDF)",
        url: "https://www.juntadeandalucia.es/sites/default/files/inline-files/2025/04/Decreto%2028-2016%20de%202%20de%20febrero%20de%20las%20viviendas%20de%20uso%20turistico.pdf",
      },
      {
        label: "Registro de Turismo de Andalucía — Viviendas de uso turístico (Junta de Andalucía)",
        url: "https://www.juntadeandalucia.es/organismos/turismoyandaluciaexterior/areas/registro-turismo/establecimientos-servicios/paginas/viviendas-turisticas.html",
      },
      {
        label: "Decreto 28/2016, de 2 de febrero (BOJA nº 28, de 11/02/2016)",
        url: "https://www.juntadeandalucia.es/boja/2016/28/6",
      },
      {
        label: "Decreto 31/2024, de 29 de enero (BOJA nº 24, de 02/02/2024)",
        url: "https://www.juntadeandalucia.es/boja/2024/24/50",
      },
      {
        label: "Decreto-ley 1/2025, de 24 de febrero, texto consolidado (BOE)",
        url: "https://www.boe.es/buscar/pdf/2025/BOJA-b-2025-90042-consolidado.pdf",
      },
    ],
    traducciones: {
      es: {
        titulo: "Requisitos de una vivienda turística en Andalucía",
        entradilla:
          "Qué exige el Decreto 28/2016 de la Junta de Andalucía a la vivienda y a quien la explota, estancia por estancia, y qué hay que presentar para el alta en el Registro de Turismo. Cada requisito lleva su artículo.",
        cuerpo: [
          "Esta guía recoge lo que el Decreto 28/2016 (viviendas de uso turístico) exige a la vivienda y a quien la explota, ordenado por estancias, y los pasos del alta en el Registro de Turismo de Andalucía. Está pensada para propietarias y propietarios que se plantean poner su casa en alquiler turístico.",
          "Fuente única: el texto consolidado oficial del Decreto 28/2016, que incorpora las modificaciones del Decreto 31/2024, el Decreto-ley 7/2024 y el Decreto-ley 1/2025. Junto a cada requisito figura su artículo, o la letra del anexo. Lo que ese texto no dice, no está aquí.",
          "La vivienda debe cumplir además la normativa urbanística de su municipio y no tener prohibida la actividad en los estatutos de su comunidad de propietarios (arts. 6.1.a, 1.3 y 9.1.g). Esta guía no analiza esos casos uno a uno.",
        ],
        requisitos: requisitosDe("es"),
        notas: [
          "Esta guía es información general sobre un texto legal. No sustituye al asesoramiento jurídico ni a la consulta al ayuntamiento y a la Consejería competente en turismo. El texto vigente es siempre el publicado en el BOJA.",
          "Historial del Decreto 28/2016 según su texto consolidado: modificado por la Sentencia del Tribunal Supremo de 21 de octubre de 2019, por el Decreto 31/2024, de 29 de enero (BOJA nº 24, de 2 de febrero de 2024), por el Decreto-ley 7/2024, de 25 de junio, y por el Decreto-ley 1/2025, de 24 de febrero. Si esta guía lleva tiempo sin revisarse, compruebe en el BOJA que no haya cambios posteriores.",
        ],
      },
      en: {
        titulo: "Requirements for a tourist rental home in Andalusia",
        entradilla:
          "What Decree 28/2016 of the Junta de Andalucía requires of the home and of whoever operates it, room by room, and what must be filed to register in the Andalusian Tourism Register. Every requirement cites its article.",
        cuerpo: [
          "This guide sets out what Decree 28/2016 (tourist-use homes) requires of the home and of whoever operates it, organised room by room, together with the steps for registering in the Andalusian Tourism Register. It is written for owners who are considering letting their home to tourists.",
          "Single source: the official consolidated text of Decree 28/2016, which incorporates the amendments made by Decree 31/2024, Decree-Law 7/2024 and Decree-Law 1/2025. Each requirement shows its article, or the letter of the annex. What that text does not say is not here.",
          "The home must also comply with the urban planning rules of its municipality and must not be prohibited from this activity by the statutes of its owners' community (articles 6.1.a, 1.3 and 9.1.g). This guide does not examine those cases one by one.",
          "The official text is in Spanish. This translation is provided for convenience: if there is any difference, the official Spanish text published in the BOJA prevails.",
        ],
        requisitos: requisitosDe("en"),
        notas: [
          "This guide is general information about a legal text. It is not a substitute for legal advice or for asking the town council and the regional ministry responsible for tourism. The text in force is always the one published in the BOJA.",
          "History of Decree 28/2016 according to its consolidated text: amended by the Supreme Court ruling of 21 October 2019, by Decree 31/2024 of 29 January (BOJA no. 24, 2 February 2024), by Decree-Law 7/2024 of 25 June and by Decree-Law 1/2025 of 24 February. If this guide has not been reviewed for some time, check the BOJA for later changes.",
        ],
      },
      de: {
        titulo: "Anforderungen an eine Ferienwohnung in Andalusien",
        entradilla:
          "Was das Dekret 28/2016 der Junta de Andalucía von der Wohnung und von der betreibenden Person verlangt, Zimmer für Zimmer, und was für die Eintragung im Tourismusregister einzureichen ist. Jede Anforderung nennt ihren Artikel.",
        cuerpo: [
          "Dieser Leitfaden fasst zusammen, was das Dekret 28/2016 (Wohnungen zur touristischen Nutzung) von der Wohnung und von der betreibenden Person verlangt, geordnet nach Räumen, sowie die Schritte zur Eintragung im Tourismusregister Andalusiens. Er richtet sich an Eigentümerinnen und Eigentümer, die erwägen, ihre Wohnung touristisch zu vermieten.",
          "Einzige Quelle: der offizielle konsolidierte Text des Dekrets 28/2016, der die Änderungen durch das Dekret 31/2024, das Dekret-Gesetz 7/2024 und das Dekret-Gesetz 1/2025 enthält. Neben jeder Anforderung steht ihr Artikel bzw. der Buchstabe des Anhangs. Was dieser Text nicht sagt, steht hier nicht.",
          "Die Wohnung muss außerdem die Bauvorschriften ihrer Gemeinde einhalten, und die Satzung ihrer Eigentümergemeinschaft darf die Tätigkeit nicht verbieten (Art. 6.1.a, 1.3 und 9.1.g). Diese Fälle prüft der Leitfaden nicht einzeln.",
          "Der offizielle Text ist spanisch. Diese Übersetzung dient der Orientierung: Bei Abweichungen gilt der im BOJA veröffentlichte spanische Originaltext.",
        ],
        requisitos: requisitosDe("de"),
        notas: [
          "Dieser Leitfaden ist eine allgemeine Information über einen Rechtstext. Er ersetzt weder Rechtsberatung noch die Anfrage bei der Gemeinde und bei der für Tourismus zuständigen Consejería. Maßgeblich ist stets der im BOJA veröffentlichte Text.",
          "Geschichte des Dekrets 28/2016 laut konsolidiertem Text: geändert durch das Urteil des Obersten Gerichtshofs vom 21. Oktober 2019, durch das Dekret 31/2024 vom 29. Januar (BOJA Nr. 24 vom 2. Februar 2024), durch das Dekret-Gesetz 7/2024 vom 25. Juni und durch das Dekret-Gesetz 1/2025 vom 24. Februar. Wurde dieser Leitfaden lange nicht überprüft, prüfen Sie im BOJA, ob es spätere Änderungen gibt.",
        ],
      },
      fr: {
        titulo: "Conditions requises pour un logement touristique en Andalousie",
        entradilla:
          "Ce que le décret 28/2016 de la Junta de Andalucía exige du logement et de la personne qui l'exploite, pièce par pièce, et ce qu'il faut déposer pour l'inscription au Registre du tourisme. Chaque exigence cite son article.",
        cuerpo: [
          "Ce guide présente ce que le décret 28/2016 (logements à usage touristique) exige du logement et de la personne qui l'exploite, classé par pièces, ainsi que les démarches d'inscription au Registre du tourisme d'Andalousie. Il s'adresse aux propriétaires qui envisagent de louer leur bien à des touristes.",
          "Source unique : le texte consolidé officiel du décret 28/2016, qui intègre les modifications du décret 31/2024, du décret-loi 7/2024 et du décret-loi 1/2025. À côté de chaque exigence figure son article, ou la lettre de l'annexe. Ce que ce texte ne dit pas ne figure pas ici.",
          "Le logement doit aussi respecter la réglementation d'urbanisme de sa commune, et les statuts de sa copropriété ne doivent pas interdire l'activité (art. 6.1.a, 1.3 et 9.1.g). Ce guide n'examine pas ces cas un par un.",
          "Le texte officiel est en espagnol. Cette traduction est fournie à titre indicatif : en cas de divergence, le texte officiel espagnol publié au BOJA prévaut.",
        ],
        requisitos: requisitosDe("fr"),
        notas: [
          "Ce guide est une information générale sur un texte juridique. Il ne remplace ni un conseil juridique ni une demande auprès de la commune et de la Consejería compétente en matière de tourisme. Le texte en vigueur est toujours celui publié au BOJA.",
          "Historique du décret 28/2016 d'après son texte consolidé : modifié par l'arrêt de la Cour suprême du 21 octobre 2019, par le décret 31/2024 du 29 janvier (BOJA n° 24 du 2 février 2024), par le décret-loi 7/2024 du 25 juin et par le décret-loi 1/2025 du 24 février. Si ce guide n'a pas été revu depuis longtemps, vérifiez au BOJA qu'il n'y a pas eu de modifications ultérieures.",
        ],
      },
    },
  },
]

/**
 * Fail-closed: cualquier cosa que no sea exactamente `estado === "publicada"`
 * se trata como borrador (noindex + fuera de sitemap). Cubre valores
 * ausentes, `undefined`/`null`, o cualquier estado no reconocido si en el
 * futuro esta función recibe datos no tipados (ej. de un CMS externo).
 */
export function esPublicable(guia: Pick<Guia, "estado"> | null | undefined): boolean {
  if (!guia) return false
  return guia.estado === "publicada"
}

export function getGuiaBySlug(slug: string): Guia | undefined {
  return guias.find((g) => g.slug === slug)
}

export function getGuiasPublicadas(): Guia[] {
  return guias.filter(esPublicable)
}

export function haySeccionGuias(): boolean {
  return getGuiasPublicadas().length > 0
}
