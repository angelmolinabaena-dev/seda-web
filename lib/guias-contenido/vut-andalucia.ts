import type { Locale } from "@/i18n/routing"

/*
  Guía «Requisitos de una vivienda turística en Andalucía» (plan «Motor SEDA», fase 1).

  FUENTE ÚNICA: el texto consolidado oficial del Decreto 28/2016, de 2 de febrero,
  por el que se regulan las viviendas de uso turístico (Junta de Andalucía), que
  incorpora el Decreto 31/2024, el Decreto-ley 7/2024 y el Decreto-ley 1/2025.
  Copia de trabajo, con su procedencia y huella: docs/fuentes/DECRETO-28-2016-consolidado.txt.

  REGLA: lo que no está en ese texto no se publica. Por eso cada requisito lleva:
    · `ref`  — su artículo (o «anexo.<letra>»), que la página muestra al lado;
    · `cita` — el fragmento LITERAL del texto oficial que lo respalda, en español.
  tests/guia-vut-andalucia.test.ts comprueba que cada `cita` aparece en la copia del
  texto oficial y que cada `ref` es un apartado que existe. La cita no se muestra:
  existe para que el test confronte la guía con la norma y no con otro texto nuestro.

  La estructura (ids, refs, citas) es única y no depende del idioma; los textos van
  por idioma y deben cubrir exactamente los mismos ids. Las cifras (plazas, m², cm,
  horas) se escriben con números en los cuatro idiomas para que el test pueda
  comprobar que ninguna traducción las cambia.
*/

export type GrupoId =
  | "general"
  | "dormitorios"
  | "banos"
  | "cocina"
  | "salon"
  | "seguridad"
  | "informacion"
  | "alta"

export type ItemEstructura = {
  id: string
  /** «6.1.d», «9.1», «anexo.c»… Apartado del Decreto 28/2016 que lo exige. */
  ref: string
  /** Fragmento(s) literal(es), en español, del texto consolidado oficial. */
  cita: string[]
}

export type GrupoEstructura = { id: GrupoId; items: ItemEstructura[] }

export const ESTRUCTURA: GrupoEstructura[] = [
  {
    id: "general",
    items: [
      {
        id: "g-capacidad",
        ref: "5.4",
        cita: [
          "cuando el uso de la vivienda sea completo no podrá ser superior a quince plazas",
          "cuando el uso sea por habitaciones no podrá superar las seis plazas",
        ],
      },
      {
        id: "g-superficie",
        ref: "6.1.b",
        cita: [
          "Tener una dimensión mínima construida de 14 m² por plaza, conforme a la superficie construida de uso principal que conste en la Sede Electrónica del Catastro",
          "la superficie mínima construida de uso principal será de 25 m² o, en su defecto, la que determine el planeamiento urbanístico",
        ],
      },
      {
        id: "g-amueblada",
        ref: "anexo.a",
        cita: [
          "Estar suficientemente amuebladas y dotadas de los aparatos y enseres necesarios para su uso inmediato y acorde al número de plazas de que dispongan",
        ],
      },
      {
        id: "g-suministros",
        ref: "anexo.a",
        cita: [
          "con los suministros básicos que permitan su habitabilidad, tales como electricidad y agua corriente caliente y fría",
        ],
      },
      { id: "g-tomas", ref: "anexo.a", cita: ["tomas de corriente en todas las estancias"] },
      {
        id: "g-limpieza",
        ref: "6.2.b",
        cita: ["Realizar la limpieza de la vivienda a la entrada y salida de nuevas personas usuarias"],
      },
    ],
  },
  {
    id: "dormitorios",
    items: [
      {
        id: "d-plazas",
        ref: "5.4",
        cita: [
          "no pudiendo exceder en ambos tipos de cuatro plazas por habitación, de las cuales dos deberán ser en camas que no sean literas",
        ],
      },
      {
        id: "d-ventilacion",
        ref: "6.1.d",
        cita: [
          "Los dormitorios y salones tendrán ventilación directa al exterior o a patios ventilados y algún sistema de oscurecimiento de las ventanas",
          "exima de su cumplimiento por motivos de protección arquitectónica",
        ],
      },
      {
        id: "d-frio",
        ref: "6.1.e",
        cita: [
          "Disponer de refrigeración centralizada o no centralizada por elementos fijos o portátiles en las habitaciones y salones",
          "cuando el período de funcionamiento comprenda los meses de mayo, junio, julio y agosto",
          "Se exceptúa del cumplimiento de este requisito a las construcciones tipo cueva",
        ],
      },
      {
        id: "d-calor",
        ref: "6.1.f",
        cita: [
          "Disponer de calefacción centralizada o no centralizada por elementos fijos o portátiles en las habitaciones y salones",
          "si el periodo de funcionamiento comprende los meses de diciembre, enero, febrero y marzo",
          "sin que en ningún caso sean admisibles los elementos incandescentes ni de combustión de líquidos o gases inflamables",
        ],
      },
      {
        id: "d-camas",
        ref: "anexo.c",
        cita: ["Las camas deberán medir al menos 80* 190 cm si es individual y 135* 190 cm si es doble"],
      },
      {
        id: "d-colchones",
        ref: "anexo.c",
        cita: [
          "colchones con un grosor mínimo de 18 cm, deben estar en buenas condiciones y presentar un nivel homogéneo de resistencia en toda la superficie",
        ],
      },
      {
        id: "d-ropa",
        ref: "anexo.c",
        cita: [
          "Ropa de cama, lencería, mantas o nórdicos y almohadas bien conservados en función a la ocupación de la vivienda y un juego de reposición de la ropa de cama",
        ],
      },
      {
        id: "d-armario",
        ref: "anexo.c",
        cita: [
          "un armario o espacio destinado a la ropa para cada cuatro plazas, con un número de perchas adecuado",
          "punto de luz próximo a la cama",
        ],
      },
    ],
  },
  {
    id: "banos",
    items: [
      {
        id: "b-numero",
        ref: "6.1.c",
        cita: [
          "Disponer de dos baños si el número de plazas es superior a cinco y de tres baños si el número de plazas es superior a ocho",
        ],
      },
      {
        id: "b-ventilacion",
        ref: "6.1.d",
        cita: ["Las cocinas y cuartos de baños tendrán ventilación directa o forzada para la renovación de aire"],
      },
      {
        id: "b-dotacion1",
        ref: "anexo.b",
        cita: [
          "El baño estará dotado al menos de inodoro, lavabo, bañera o plato de ducha, jabón de mano, gel, champú, una toalla de mano por persona, una toalla de baño por persona",
        ],
      },
      {
        id: "b-dotacion2",
        ref: "anexo.b",
        cita: [
          "suelos antideslizantes en duchas y bañeras, alfombra de baño lavable, luz apropiada para el baño, espejo, colgadores de toallas, rollo de papel higiénico adicional, escobilla para el inodoro, enchufe de corriente junto al espejo, estantería, secador y cubo higiénico",
        ],
      },
      {
        id: "b-inodoro",
        ref: "anexo.b",
        cita: [
          "el inodoro deberá estar independizado y cerrado, bien de manera individual bien con el resto de elementos sanitarios",
        ],
      },
    ],
  },
  {
    id: "cocina",
    items: [
      {
        id: "c-ventilacion",
        ref: "6.1.d",
        cita: ["Las cocinas y cuartos de baños tendrán ventilación directa o forzada para la renovación de aire"],
      },
      {
        id: "c-equipo",
        ref: "anexo.a",
        cita: ["La cocina deberá estar provista de un mínimo de dos fuegos, horno o microondas y frigorífico"],
      },
      {
        id: "c-utensilios",
        ref: "anexo.a",
        cita: [
          "de utensilios adecuados a la capacidad de alojamiento (al menos vajilla, cubertería, cristalería, sartenes, ollas, cubiertos para servir, sacacorchos, abridor, tijeras, abrelatas y escurridor)",
        ],
      },
      {
        id: "c-electro",
        ref: "anexo.a",
        cita: ["de pequeños electrodomésticos (al menos batidora, tostadora o grill, exprimidor y cafetera)"],
      },
      {
        id: "c-otros",
        ref: "anexo.a",
        cita: [
          "de mobiliario de almacenaje; de utensilios y kit de productos de limpieza con contenido mínimo de estropajo, bayeta, paño y gel limpiador; bolsas de basura; tendedero, plancha y tabla de planchar; y separación selectiva de residuos con el correspondiente detalle informativo",
        ],
      },
    ],
  },
  {
    id: "salon",
    items: [
      {
        id: "s-ventilacion",
        ref: "6.1.d",
        cita: [
          "Los dormitorios y salones tendrán ventilación directa al exterior o a patios ventilados y algún sistema de oscurecimiento de las ventanas",
        ],
      },
      {
        id: "s-frio",
        ref: "6.1.e",
        cita: [
          "Disponer de refrigeración centralizada o no centralizada por elementos fijos o portátiles en las habitaciones y salones",
          "cuando el período de funcionamiento comprenda los meses de mayo, junio, julio y agosto",
        ],
      },
      {
        id: "s-calor",
        ref: "6.1.f",
        cita: [
          "Disponer de calefacción centralizada o no centralizada por elementos fijos o portátiles en las habitaciones y salones",
          "si el periodo de funcionamiento comprende los meses de diciembre, enero, febrero y marzo",
        ],
      },
      { id: "s-tv", ref: "anexo.a", cita: ["contar con televisor e información de canales"] },
      {
        id: "s-convertibles",
        ref: "5.4",
        cita: [
          "Se permitirán dos plazas convertibles en el salón de las viviendas en el grupo completa, que computarán para la capacidad máxima de la vivienda",
        ],
      },
    ],
  },
  {
    id: "seguridad",
    items: [
      {
        id: "x-botiquin",
        ref: "anexo.d",
        cita: ["Botiquín de primeros auxilios, así como la instalación de algún tipo de detectores de humo"],
      },
      {
        id: "x-humo",
        ref: "anexo.d",
        cita: ["la instalación de algún tipo de detectores de humo en zona próxima a la cocina"],
      },
      { id: "x-extintor", ref: "anexo.d", cita: ["detectores de humo en zona próxima a la cocina y un extintor"] },
      {
        id: "x-evacuacion",
        ref: "6.2.d",
        cita: [
          "Deberá colocarse en la puerta de la vivienda un plano de evacuación, en caso de existir para la comunidad de vecinos del inmueble",
        ],
      },
    ],
  },
  {
    id: "informacion",
    items: [
      {
        id: "i-telefono",
        ref: "6.2.a",
        cita: [
          "Facilitar a las personas usuarias un número de atención telefónica durante las 24 horas del día para atender y resolver de forma inmediata cualquier consulta o incidencia relativa a la vivienda",
        ],
      },
      {
        id: "i-hojas",
        ref: "6.2.c",
        cita: [
          "Disponer de Hojas de Quejas y Reclamaciones oficiales de la Junta de Andalucía a disposición de las personas usuarias y de cartel anunciador de las mismas en un lugar visible dentro de la vivienda",
        ],
      },
      {
        id: "i-normas",
        ref: "6.2.d",
        cita: [
          "Informar a las personas usuarias de las normas de convivencia de la comunidad de propietarios, las zonas de uso restringido",
          "así como la admisión y existencia de mascotas en la vivienda, restricciones para personas fumadoras",
          "las zonas del depósito de basuras en la vía pública, las pautas de respeto por el entorno urbano",
          "protección del medio ambiente contra ruidos y vibraciones",
        ],
      },
      {
        id: "i-sac",
        ref: "6.2.f",
        cita: ["Informar a las personas usuarias si se encuentra adherida al Sistema Arbitral de Consumo"],
      },
      {
        id: "i-turistica",
        ref: "anexo.e",
        cita: [
          "Disponer de información turística, en soporte físico o electrónico, de la zona, zonas de ocio, restaurantes y cafeterías, comercios y tiendas de alimentos, aparcamientos más próximos a la vivienda, servicios médicos existentes en la zona, medios de transporte urbano y un plano de la localidad",
        ],
      },
      {
        id: "i-instrucciones",
        ref: "anexo.f",
        cita: [
          "Tener a disposición de las personas usuarias información e instrucciones de funcionamiento de electrodomésticos u otros dispositivos que lo requieran para su correcto uso",
        ],
      },
      {
        id: "i-justificante",
        ref: "6.2.e",
        cita: [
          "Entregar justificante de pago de los servicios y de los anticipos efectuados, en su caso, con el siguiente contenido",
          "Identificación de la vivienda y su código de inscripción en el Registro de Turismo de Andalucía",
          "Precio del servicio contratado y fecha de pago",
        ],
      },
      {
        id: "i-contrato",
        ref: "7.1",
        cita: [
          "le será entregado un documento, a modo de contrato",
          "el código alfanumérico de inscripción en el Registro de Turismo de Andalucía",
        ],
      },
      {
        id: "i-copia",
        ref: "7.3",
        cita: [
          "durante un año, teniendo valor de prueba a efectos administrativos y la consideración de contrato",
        ],
      },
      {
        id: "i-parte",
        ref: "7.2",
        cita: [
          "deberán presentar su documento de identificación a los efectos de cumplimentar el correspondiente parte de entrada",
        ],
      },
      {
        id: "i-horario",
        ref: "7.4",
        cita: [
          "desde las 15 horas del primer día del periodo contratado hasta las 11:00 horas del día señalado como fecha de salida, pudiendo acordarse individualmente un régimen diferente",
        ],
      },
      {
        id: "i-llaves",
        ref: "7.4",
        cita: ["los mismos no podrán ubicarse en elementos del mobiliario urbano de las vías públicas"],
      },
    ],
  },
  {
    id: "alta",
    items: [
      {
        id: "a-dr",
        ref: "9.1",
        cita: [
          "tendrá que presentar la correspondiente declaración responsable de forma electrónica ante la Consejería competente en materia de turismo",
        ],
      },
      {
        id: "a-publicidad",
        ref: "9.1",
        cita: ["pudiendo publicitarse a partir de este momento como vivienda de uso turístico"],
      },
      {
        id: "a-vivienda",
        ref: "9.1.a",
        cita: [
          "Identificación de la vivienda, incluida su referencia catastral, y su capacidad máxima de alojamiento",
          "Solo será admisible una vivienda por cada referencia catastral",
        ],
      },
      {
        id: "a-explotador",
        ref: "9.1.b",
        cita: [
          "Identificación de la persona o entidad explotadora y título que la habilite, incluyendo número de teléfono y correo electrónico",
        ],
      },
      {
        id: "a-propietario",
        ref: "9.1.c",
        cita: [
          "Identificación de la persona propietaria o titular del inmueble, en caso de ser distinta de la persona o entidad explotadora",
        ],
      },
      {
        id: "a-proteccion",
        ref: "9.1.d",
        cita: [
          "Manifestación de que la vivienda no está sometida a ningún régimen de protección pública o que se encuentra descalificada",
        ],
      },
      {
        id: "a-urbanismo",
        ref: "9.1.e",
        cita: [
          "Manifestación de que la vivienda resulta compatible para el uso como vivienda de uso turístico de conformidad con la ordenación urbanística aplicable",
          "la licencia o declaración responsable de cambio de uso que posibilita su destino turístico",
        ],
      },
      {
        id: "a-licencia",
        ref: "6.1.a",
        cita: [
          "Cumplir con la normativa urbanística municipal y disponer, cuando resulte aplicable de conformidad con lo previsto en el artículo 6 del Decreto-ley de medidas urgentes en materia de vivienda, de la licencia o declaración responsable que posibilita el destino turístico del inmueble",
        ],
      },
      {
        id: "a-datos",
        ref: "9.1.f",
        cita: ["Autorización expresa para la cesión e intercambio de datos por parte de las Administraciones públicas"],
      },
      {
        id: "a-comunidad",
        ref: "9.1.g",
        cita: [
          "Manifestación de que la vivienda no tiene prohibida la actividad de vivienda de uso turístico de acuerdo con el título constitutivo o estatutos de la comunidad de propietarios y que ha sido expresamente autorizada por la comunidad de propietarios",
        ],
      },
      { id: "a-periodos", ref: "9.1.h", cita: ["El período o períodos de prestación del servicio turístico"] },
      {
        id: "a-comercializacion",
        ref: "3.1",
        cita: [
          "Sólo podrá ser comercializada en los periodos indicados, considerándose actividad clandestina la comercialización fuera de los mismos",
        ],
      },
      {
        id: "a-prohibidas",
        ref: "1.3",
        cita: [
          "Las viviendas sometidas a régimen de protección pública",
          "contengan prohibición expresa para la actividad de alojamiento turístico",
          "Las unidades de alojamiento situadas en los establecimientos de alojamiento turístico que deban ocupar la totalidad o parte independiente del edificio",
          "Las viviendas reconocidas en situación de «asimilado a fuera de ordenación»",
          "salvo autorización previa expresa por parte del órgano competente municipal para el cambio de actividad",
        ],
      },
      {
        id: "a-responsable",
        ref: "4.1",
        cita: ["La persona titular de la explotación deberá disponer de título jurídico habilitante para el ejercicio de la actividad"],
      },
      {
        id: "a-copropiedad",
        ref: "3.2",
        cita: [
          "la empresa explotadora deberá obtener de todas las personas propietarias el título jurídico válido en Derecho que habilite para la explotación",
        ],
      },
      {
        id: "a-publicos",
        ref: "9.1",
        cita: [
          "serán de acceso público a través de buscadores abiertos",
          "salvo los relativos al número de teléfono y correo electrónico",
        ],
      },
      {
        id: "a-cambios",
        ref: "4.2",
        cita: [
          "debiendo comunicar al Registro de Turismo de Andalucía cualquier modificación que les afecte, ya sea en el vínculo jurídico que les habilita para la explotación o en las condiciones propias de cada una de las viviendas explotadas",
        ],
      },
      {
        id: "a-cancelacion",
        ref: "9.2",
        cita: [
          "incorrección, inexactitud o falsedad de carácter esencial en cualquier dato, manifestación o documento incorporado a la declaración responsable",
          "a la cancelación de la inscripción de la vivienda en el Registro de Turismo de Andalucía",
        ],
      },
      {
        id: "a-clandestina",
        ref: "11",
        cita: [
          "cuando el titular haya iniciado la actividad turística sin presentar declaración responsable",
          "estando tipificada dicha prestación como infracción grave por el artículo 71.1 de la Ley 13/2011",
        ],
      },
      {
        id: "a-ayuntamientos",
        ref: "2.2",
        cita: [
          "los Ayuntamientos, por razón imperiosa de interés general, podrán establecer limitaciones proporcionadas a dicha razón, en lo que respecta al número máximo de viviendas de uso turístico por edificio, sector, ámbito, periodos, área o zona",
        ],
      },
    ],
  },
]

type TextosLocale = {
  grupos: Record<GrupoId, string>
  items: Record<string, string>
}

export const TEXTOS: Record<Locale, TextosLocale> = {
  es: {
    grupos: {
      general: "La vivienda en su conjunto",
      dormitorios: "Dormitorios",
      banos: "Baños",
      cocina: "Cocina",
      salon: "Salón",
      seguridad: "Seguridad",
      informacion: "Información y trato al huésped",
      alta: "El alta en el Registro de Turismo de Andalucía",
    },
    items: {
      "g-capacidad": "Máximo de 15 plazas si se cede la vivienda completa y de 6 si se cede por habitaciones.",
      "g-superficie":
        "Superficie construida mínima de 14 m² por plaza, según la superficie construida de uso principal que figure en la Sede Electrónica del Catastro; en todo caso, 25 m² como mínimo o, en su defecto, la que determine el planeamiento urbanístico.",
      "g-amueblada":
        "Vivienda suficientemente amueblada y con los aparatos y enseres necesarios para su uso inmediato, acordes al número de plazas.",
      "g-suministros": "Suministros básicos que permitan habitarla: electricidad y agua corriente, fría y caliente.",
      "g-tomas": "Tomas de corriente en todas las estancias.",
      "g-limpieza": "Limpieza de la vivienda a la entrada y a la salida de cada nueva persona usuaria.",
      "d-plazas": "Un máximo de 4 plazas por habitación, de las cuales 2 deben ser en camas que no sean literas.",
      "d-ventilacion":
        "Ventilación directa al exterior o a patios ventilados y algún sistema de oscurecimiento de las ventanas. No se exige cuando la Administración local o autonómica, por razones de competencia, exima de ello por motivos de protección arquitectónica.",
      "d-frio":
        "Refrigeración (centralizada o no, con elementos fijos o portátiles) en habitaciones y salones si la vivienda funciona en mayo, junio, julio y agosto. Se exceptúan las construcciones tipo cueva.",
      "d-calor":
        "Calefacción (centralizada o no, con elementos fijos o portátiles) en habitaciones y salones si la vivienda funciona en diciembre, enero, febrero y marzo. No se admiten elementos incandescentes ni de combustión de líquidos o gases inflamables.",
      "d-camas": "Camas de al menos 80 × 190 cm si son individuales y de 135 × 190 cm si son dobles.",
      "d-colchones":
        "Canapés y colchones en buenas condiciones y con un nivel homogéneo de resistencia en toda la superficie. Grosor mínimo de los colchones: 18 cm.",
      "d-ropa":
        "Ropa de cama, lencería, mantas o nórdicos y almohadas bien conservados, según la ocupación de la vivienda, y un juego de reposición de la ropa de cama.",
      "d-armario":
        "Un armario o espacio para la ropa por cada 4 plazas, con perchas suficientes (puede estar en cualquiera de los dormitorios), y un punto de luz próximo a la cama.",
      "b-numero": "2 baños si hay más de 5 plazas y 3 baños si hay más de 8 plazas.",
      "b-ventilacion": "Ventilación directa o forzada para renovar el aire.",
      "b-dotacion1":
        "El baño lleva, como mínimo: inodoro, lavabo, bañera o plato de ducha, jabón de mano, gel, champú, una toalla de mano por persona y una toalla de baño por persona.",
      "b-dotacion2":
        "Además: suelos antideslizantes en duchas y bañeras, alfombra de baño lavable, luz apropiada, espejo, colgadores de toallas, rollo de papel higiénico adicional, escobilla, enchufe junto al espejo, estantería, secador y cubo higiénico.",
      "b-inodoro": "El inodoro está independizado y cerrado, de forma individual o junto con el resto de elementos sanitarios.",
      "c-ventilacion": "Ventilación directa o forzada para renovar el aire.",
      "c-equipo": "Como mínimo, 2 fuegos, horno o microondas y frigorífico.",
      "c-utensilios":
        "Utensilios adecuados a la capacidad de alojamiento: como mínimo vajilla, cubertería, cristalería, sartenes, ollas, cubiertos para servir, sacacorchos, abridor, tijeras, abrelatas y escurridor.",
      "c-electro": "Pequeños electrodomésticos: como mínimo batidora, tostadora o grill, exprimidor y cafetera.",
      "c-otros":
        "Mobiliario de almacenaje; kit de limpieza (como mínimo estropajo, bayeta, paño y gel limpiador); bolsas de basura; tendedero, plancha y tabla de planchar; y separación selectiva de residuos con su detalle informativo.",
      "s-ventilacion":
        "Ventilación directa al exterior o a patios ventilados y algún sistema de oscurecimiento de las ventanas (mismas condiciones que en los dormitorios).",
      "s-frio": "Refrigeración en el salón si la vivienda funciona en mayo, junio, julio y agosto.",
      "s-calor": "Calefacción en el salón si la vivienda funciona en diciembre, enero, febrero y marzo.",
      "s-tv": "Televisor, con información de los canales.",
      "s-convertibles":
        "En las viviendas cedidas completas se permiten 2 plazas convertibles en el salón, que cuentan para la capacidad máxima.",
      "x-botiquin": "Botiquín de primeros auxilios.",
      "x-humo": "Algún tipo de detector de humo en la zona próxima a la cocina.",
      "x-extintor": "Un extintor.",
      "x-evacuacion":
        "Plano de evacuación en la puerta de la vivienda, en caso de existir para la comunidad de vecinos del inmueble.",
      "i-telefono":
        "Un número de atención telefónica durante las 24 horas del día para resolver de inmediato cualquier consulta o incidencia relativa a la vivienda.",
      "i-hojas":
        "Hojas de Quejas y Reclamaciones oficiales de la Junta de Andalucía a disposición de las personas usuarias, con el cartel que las anuncia en un lugar visible dentro de la vivienda.",
      "i-normas":
        "Informar de: normas de convivencia de la comunidad de propietarios, zonas de uso restringido, uso de las instalaciones y equipos, admisión de mascotas, restricciones para fumadores, zonas del depósito de basuras en la vía pública y pautas de respeto al entorno urbano y a la normativa municipal contra ruidos y vibraciones.",
      "i-sac": "Informar de si la vivienda está adherida al Sistema Arbitral de Consumo.",
      "i-turistica":
        "Información turística de la zona, en papel o en formato electrónico: ocio, restaurantes y cafeterías, comercios de alimentación, aparcamientos más próximos a la vivienda, servicios médicos, transporte urbano y plano de la localidad.",
      "i-instrucciones":
        "Información e instrucciones de funcionamiento de los electrodomésticos u otros dispositivos que lo requieran.",
      "i-justificante":
        "Justificante del pago de los servicios y de los anticipos, con: titular de la explotación, vivienda y su código de inscripción en el Registro de Turismo de Andalucía, persona usuaria, número de personas alojadas, fechas de entrada y de salida, y precio y fecha de pago.",
      "i-contrato":
        "Al recibir a cada persona usuaria, un documento a modo de contrato con, al menos: nombre de la persona o entidad explotadora, código de inscripción en el Registro de Turismo de Andalucía, número de personas, fechas de entrada y salida, precio total de la estancia y teléfono de atención.",
      "i-copia":
        "La copia firmada del documento se conserva durante 1 año a disposición de la Administración de la Junta de Andalucía.",
      "i-parte":
        "Pedir el documento de identificación a la persona usuaria para cumplimentar el parte de entrada de viajeros.",
      "i-horario":
        "Salvo que se acuerde otra cosa, la persona usuaria puede ocupar la vivienda desde las 15:00 del primer día hasta las 11:00 del día de salida.",
      "i-llaves":
        "Si las llaves se entregan en candados, cajetines de seguridad o similares, no pueden colocarse en el mobiliario urbano de las vías públicas.",
      "a-dr":
        "Antes de empezar, presentar por vía electrónica una declaración responsable ante la Consejería competente en materia de turismo, manifestando que se cumplen los requisitos del Decreto.",
      "a-publicidad": "Solo a partir de ese momento puede publicitarse como vivienda de uso turístico.",
      "a-vivienda":
        "Identificación de la vivienda, con su referencia catastral y su capacidad máxima de alojamiento. Solo se admite una vivienda por referencia catastral, salvo que la normativa permita acreditar dos o más con la misma.",
      "a-explotador":
        "Identificación de la persona o entidad explotadora y del título que la habilita, con teléfono y correo electrónico para los avisos de notificaciones electrónicas.",
      "a-propietario": "Identificación de la persona propietaria o titular del inmueble, si no es quien explota la vivienda.",
      "a-proteccion":
        "Manifestación de que la vivienda no está sometida a ningún régimen de protección pública o de que se encuentra descalificada.",
      "a-urbanismo":
        "Manifestación de que la vivienda es compatible con el uso de vivienda de uso turístico según la ordenación urbanística aplicable y de que cuenta, cuando sea exigible, con la licencia o declaración responsable de cambio de uso que posibilita su destino turístico.",
      "a-licencia":
        "Cumplir la normativa urbanística municipal y, cuando resulte aplicable, disponer de la licencia o declaración responsable que posibilita el destino turístico del inmueble.",
      "a-datos":
        "Autorización expresa para que las Administraciones públicas (incluidas las fuerzas y cuerpos de seguridad y las autoridades tributarias) cedan e intercambien datos para ejercer sus competencias.",
      "a-comunidad":
        "Manifestación de que los estatutos o el título constitutivo de la comunidad de propietarios no prohíben la actividad y de que la comunidad la ha autorizado expresamente en los términos que exige la legislación estatal.",
      "a-periodos": "Indicar el período o períodos en que se prestará el servicio turístico.",
      "a-comercializacion":
        "La vivienda solo puede comercializarse en los periodos declarados; hacerlo fuera de ellos es actividad clandestina.",
      "a-prohibidas":
        "No pueden ser viviendas de uso turístico: las de protección pública; las de inmuebles cuyos estatutos o título constitutivo prohíban expresamente el alojamiento turístico; las unidades de alojamiento de establecimientos turísticos que deban ocupar todo el edificio o una parte independiente; y las «asimiladas a fuera de ordenación», salvo autorización previa expresa del órgano municipal competente para el cambio de actividad.",
      "a-responsable":
        "Quien figure como titular de la explotación responde ante la Administración y ante las personas usuarias, y debe tener título jurídico habilitante.",
      "a-copropiedad":
        "Si el inmueble está en copropiedad y explota otra persona o entidad, esta necesita el título jurídico válido de todas las personas propietarias.",
      "a-publicos":
        "Los datos de la vivienda de la declaración responsable son públicos en los buscadores de la Consejería, salvo el teléfono y el correo electrónico.",
      "a-cambios":
        "Comunicar al Registro de Turismo de Andalucía cualquier modificación que afecte al vínculo jurídico que habilita la explotación o a las condiciones de la vivienda.",
      "a-cancelacion":
        "Si la Consejería comprueba una incorrección, inexactitud o falsedad esencial en la declaración, o que se han dejado de reunir las condiciones, puede cancelar la inscripción previa audiencia de las personas interesadas.",
      "a-clandestina":
        "Empezar la actividad sin presentar la declaración responsable es actividad clandestina, tipificada como infracción grave en el artículo 71.1 de la Ley 13/2011.",
      "a-ayuntamientos":
        "Los ayuntamientos pueden limitar, con criterios claros, objetivos y publicados, el número máximo de viviendas de uso turístico por edificio, sector, ámbito, periodos, área o zona.",
    },
  },
  en: {
    grupos: {
      general: "The home as a whole",
      dormitorios: "Bedrooms",
      banos: "Bathrooms",
      cocina: "Kitchen",
      salon: "Living room",
      seguridad: "Safety",
      informacion: "Guest information and service",
      alta: "Registering in the Andalusian Tourism Register",
    },
    items: {
      "g-capacidad": "A maximum of 15 places if the whole home is let, and 6 if it is let by the room.",
      "g-superficie":
        "Minimum built area of 14 m² per place, based on the main-use built area shown in the Cadastre's online office; in any case at least 25 m² or, failing that, whatever the urban planning sets.",
      "g-amueblada":
        "Sufficiently furnished, with the appliances and household items needed for immediate use, in line with the number of places.",
      "g-suministros": "Basic supplies that make the home habitable: electricity and running water, hot and cold.",
      "g-tomas": "Power sockets in every room.",
      "g-limpieza": "Cleaning of the home at the arrival and at the departure of each new guest.",
      "d-plazas": "A maximum of 4 places per room, of which 2 must be in beds that are not bunk beds.",
      "d-ventilacion":
        "Direct ventilation to the outside or to ventilated courtyards, and some means of darkening the windows. Not required where the local or regional authority, within its powers, exempts the home on grounds of architectural protection.",
      "d-frio":
        "Cooling (central or not, using fixed or portable units) in bedrooms and living rooms if the home operates in May, June, July and August. Cave-type constructions are exempt.",
      "d-calor":
        "Heating (central or not, using fixed or portable units) in bedrooms and living rooms if the home operates in December, January, February and March. Incandescent elements and elements burning flammable liquids or gases are not accepted.",
      "d-camas": "Beds of at least 80 × 190 cm if single and 135 × 190 cm if double.",
      "d-colchones":
        "Bed bases and mattresses in good condition, with an even level of firmness across the whole surface. Minimum mattress thickness: 18 cm.",
      "d-ropa":
        "Bed linen, blankets or duvets and pillows in good condition, according to the home's occupancy, and one spare set of bed linen.",
      "d-armario":
        "A wardrobe or clothes space for every 4 places, with enough hangers (it may be in any of the bedrooms), and a light point near the bed.",
      "b-numero": "2 bathrooms if there are more than 5 places and 3 bathrooms if there are more than 8 places.",
      "b-ventilacion": "Direct or forced ventilation to renew the air.",
      "b-dotacion1":
        "The bathroom has, at a minimum: toilet, washbasin, bath or shower tray, hand soap, shower gel, shampoo, one hand towel per person and one bath towel per person.",
      "b-dotacion2":
        "Also: non-slip floors in showers and baths, a washable bath mat, suitable lighting, a mirror, towel hooks, a spare toilet roll, a toilet brush, a power socket next to the mirror, a shelf, a hairdryer and a hygienic bin.",
      "b-inodoro":
        "The toilet is separate and enclosed, either on its own or together with the other sanitary fittings.",
      "c-ventilacion": "Direct or forced ventilation to renew the air.",
      "c-equipo": "At a minimum, 2 hobs, an oven or microwave, and a fridge.",
      "c-utensilios":
        "Utensils suited to the home's capacity: at a minimum crockery, cutlery, glassware, frying pans, pots, serving cutlery, corkscrew, bottle opener, scissors, tin opener and a colander.",
      "c-electro": "Small appliances: at a minimum a blender, a toaster or grill, a juicer and a coffee maker.",
      "c-otros":
        "Storage furniture; a cleaning kit (at a minimum scouring pad, cloth, rag and cleaning gel); bin bags; a clothes-drying rack, an iron and an ironing board; and separate waste collection with the corresponding information.",
      "s-ventilacion":
        "Direct ventilation to the outside or to ventilated courtyards, and some means of darkening the windows (same conditions as for the bedrooms).",
      "s-frio": "Cooling in the living room if the home operates in May, June, July and August.",
      "s-calor": "Heating in the living room if the home operates in December, January, February and March.",
      "s-tv": "A television, with information on the channels.",
      "s-convertibles":
        "In homes let as a whole, 2 convertible places are allowed in the living room; they count towards the maximum capacity.",
      "x-botiquin": "A first-aid kit.",
      "x-humo": "Some type of smoke detector in the area near the kitchen.",
      "x-extintor": "A fire extinguisher.",
      "x-evacuacion":
        "An evacuation plan on the door of the home, where one exists for the building's residents' community.",
      "i-telefono":
        "A telephone number staffed 24 hours a day to deal at once with any query or incident concerning the home.",
      "i-hojas":
        "Official Complaints and Claims forms of the Junta de Andalucía available to guests, with the notice announcing them in a visible place inside the home.",
      "i-normas":
        "Inform guests of: the house rules of the owners' community, restricted-use areas, use of the home's facilities and equipment, whether pets are admitted, smoking restrictions, where the bins are on the public road, and guidelines on respecting the urban surroundings and the municipal rules against noise and vibration.",
      "i-sac": "Inform guests whether the home has joined the Consumer Arbitration System.",
      "i-turistica":
        "Tourist information on the area, on paper or in electronic form: leisure, restaurants and cafés, food shops, the nearest car parks, medical services, urban transport and a map of the town.",
      "i-instrucciones":
        "Information and operating instructions for appliances or other devices that need them.",
      "i-justificante":
        "A receipt for payment of the services and of any advances, stating: the holder of the operation, the home and its registration code in the Andalusian Tourism Register, the guest, the number of people staying, the arrival and departure dates, and the price and payment date.",
      "i-contrato":
        "On receiving each guest, a document serving as a contract that states at least: the name of the operator, the registration code in the Andalusian Tourism Register, the number of people, the arrival and departure dates, the total price of the stay and the contact telephone number.",
      "i-copia":
        "The signed copy of the document is kept for 1 year at the disposal of the Junta de Andalucía's administration.",
      "i-parte":
        "Ask the guest for an identity document in order to complete the traveller check-in record.",
      "i-horario":
        "Unless otherwise agreed, the guest may occupy the home from 15:00 on the first day until 11:00 on the departure day.",
      "i-llaves":
        "If keys are handed over in padlocks, security key boxes or similar, these may not be placed on street furniture on public roads.",
      "a-dr":
        "Before starting, file a declaración responsable (a responsible declaration) electronically with the regional ministry responsible for tourism, stating that the Decree's requirements are met.",
      "a-publicidad": "Only from that moment may the home be advertised as a tourist-use home.",
      "a-vivienda":
        "Identification of the home, with its cadastral reference and its maximum accommodation capacity. Only one home per cadastral reference is accepted, unless the regulations allow two or more to be shown under the same one.",
      "a-explotador":
        "Identification of the operator and of the title that entitles them to operate, with a telephone number and an email address for electronic-notification alerts.",
      "a-propietario": "Identification of the owner or holder of the property, if different from whoever operates the home.",
      "a-proteccion":
        "A statement that the home is not under any public-protection regime or that it has been declassified.",
      "a-urbanismo":
        "A statement that the home is compatible with use as a tourist-use home under the applicable urban planning and that, where required, it has the licence or declaración responsable for change of use that allows its tourist use.",
      "a-licencia":
        "Comply with the municipal urban planning rules and, where applicable, hold the licence or declaración responsable that allows the property's tourist use.",
      "a-datos":
        "Express authorisation for public administrations (including the security forces and the tax authorities) to share and exchange data in order to exercise their powers.",
      "a-comunidad":
        "A statement that the owners' community statutes or constitutive title do not prohibit the activity and that the community has expressly authorised it as required by state legislation.",
      "a-periodos": "State the period or periods in which the tourist service will be provided.",
      "a-comercializacion":
        "The home may be marketed only in the declared periods; marketing it outside them is clandestine activity.",
      "a-prohibidas":
        "The following cannot be tourist-use homes: publicly protected homes; homes in buildings whose statutes or constitutive title expressly prohibit tourist accommodation; accommodation units in tourist establishments that must occupy the whole building or an independent part of it; and homes recognised as «asimilado a fuera de ordenación» (assimilated to out-of-planning), unless the competent municipal body has given express prior authorisation for the change of activity.",
      "a-responsable":
        "Whoever is named as holder of the operation is answerable to the authorities and to guests, and must hold a valid legal title to operate.",
      "a-copropiedad":
        "If the property is co-owned and someone else operates it, that person or entity needs the valid legal title of all the owners.",
      "a-publicos":
        "The home's data in the declaración responsable is public in the ministry's search engines, except the telephone number and email address.",
      "a-cambios":
        "Notify the Andalusian Tourism Register of any change affecting the legal link that entitles the operation or the conditions of the home.",
      "a-cancelacion":
        "If the ministry finds an essential error, inaccuracy or falsehood in the declaration, or that the conditions are no longer met, it may cancel the registration after hearing the interested parties.",
      "a-clandestina":
        "Starting the activity without filing the declaración responsable is clandestine activity, classed as a serious infringement in article 71.1 of Law 13/2011.",
      "a-ayuntamientos":
        "Town councils may limit, on clear, objective and published criteria, the maximum number of tourist-use homes per building, sector, area, period or zone.",
    },
  },
  de: {
    grupos: {
      general: "Die Wohnung als Ganzes",
      dormitorios: "Schlafzimmer",
      banos: "Bäder",
      cocina: "Küche",
      salon: "Wohnzimmer",
      seguridad: "Sicherheit",
      informacion: "Information und Betreuung der Gäste",
      alta: "Die Eintragung im Tourismusregister Andalusiens",
    },
    items: {
      "g-capacidad": "Höchstens 15 Plätze bei Überlassung der ganzen Wohnung und 6, wenn zimmerweise vermietet wird.",
      "g-superficie":
        "Mindestens 14 m² Baufläche pro Platz, nach der Hauptnutzfläche laut Online-Katasteramt; in jedem Fall mindestens 25 m² oder, falls nicht möglich, den Wert, den die Bauleitplanung festlegt.",
      "g-amueblada":
        "Ausreichend möbliert und mit den Geräten und Haushaltsgegenständen ausgestattet, die für die sofortige Nutzung nötig sind, passend zur Zahl der Plätze.",
      "g-suministros": "Grundversorgung, die das Bewohnen ermöglicht: Strom sowie fließendes Kalt- und Warmwasser.",
      "g-tomas": "Steckdosen in allen Räumen.",
      "g-limpieza": "Reinigung der Wohnung bei Ankunft und bei Abreise jedes neuen Gastes.",
      "d-plazas": "Höchstens 4 Plätze pro Zimmer, davon 2 in Betten, die keine Etagenbetten sind.",
      "d-ventilacion":
        "Direkte Belüftung nach außen oder zu belüfteten Innenhöfen sowie eine Möglichkeit zum Verdunkeln der Fenster. Nicht erforderlich, wenn die lokale oder regionale Verwaltung im Rahmen ihrer Zuständigkeit aus Gründen des Denkmalschutzes davon befreit.",
      "d-frio":
        "Kühlung (zentral oder nicht, mit festen oder tragbaren Geräten) in Schlafzimmern und Wohnzimmern, wenn die Wohnung im Mai, Juni, Juli und August betrieben wird. Höhlenbauten sind ausgenommen.",
      "d-calor":
        "Heizung (zentral oder nicht, mit festen oder tragbaren Geräten) in Schlafzimmern und Wohnzimmern, wenn die Wohnung im Dezember, Januar, Februar und März betrieben wird. Glühende Heizelemente und Geräte, die brennbare Flüssigkeiten oder Gase verbrennen, sind nicht zulässig.",
      "d-camas": "Betten von mindestens 80 × 190 cm (Einzelbett) bzw. 135 × 190 cm (Doppelbett).",
      "d-colchones":
        "Bettunterbau und Matratzen in gutem Zustand und mit gleichmäßiger Festigkeit über die gesamte Fläche. Mindestdicke der Matratzen: 18 cm.",
      "d-ropa":
        "Bettwäsche, Decken oder Bettbezüge und Kissen in gutem Zustand, entsprechend der Belegung der Wohnung, und ein Satz Ersatzbettwäsche.",
      "d-armario":
        "Ein Schrank oder Stauraum für Kleidung je 4 Plätze, mit ausreichend Kleiderbügeln (er kann in einem beliebigen Schlafzimmer stehen), und ein Lichtpunkt in Bettnähe.",
      "b-numero": "2 Bäder bei mehr als 5 Plätzen und 3 Bäder bei mehr als 8 Plätzen.",
      "b-ventilacion": "Direkte oder erzwungene Belüftung zur Erneuerung der Luft.",
      "b-dotacion1":
        "Das Bad hat mindestens: Toilette, Waschbecken, Badewanne oder Duschwanne, Handseife, Duschgel, Shampoo, ein Handtuch pro Person und ein Badetuch pro Person.",
      "b-dotacion2":
        "Außerdem: rutschfeste Böden in Duschen und Badewannen, waschbare Badematte, geeignete Beleuchtung, Spiegel, Handtuchhaken, zusätzliche Toilettenpapierrolle, Toilettenbürste, Steckdose neben dem Spiegel, Ablage, Haartrockner und hygienischer Abfalleimer.",
      "b-inodoro":
        "Die Toilette ist abgetrennt und geschlossen, entweder einzeln oder zusammen mit den übrigen Sanitärelementen.",
      "c-ventilacion": "Direkte oder erzwungene Belüftung zur Erneuerung der Luft.",
      "c-equipo": "Mindestens 2 Kochstellen, Backofen oder Mikrowelle und Kühlschrank.",
      "c-utensilios":
        "Der Aufnahmekapazität angemessene Utensilien: mindestens Geschirr, Besteck, Gläser, Pfannen, Töpfe, Vorlegebesteck, Korkenzieher, Flaschenöffner, Schere, Dosenöffner und Abtropfsieb.",
      "c-electro": "Kleingeräte: mindestens Mixer, Toaster oder Grill, Saftpresse und Kaffeemaschine.",
      "c-otros":
        "Stauraummöbel; Reinigungsset (mindestens Topfschwamm, Spüllappen, Tuch und Reinigungsgel); Müllbeutel; Wäscheständer, Bügeleisen und Bügelbrett; und getrennte Abfallsammlung mit entsprechendem Informationshinweis.",
      "s-ventilacion":
        "Direkte Belüftung nach außen oder zu belüfteten Innenhöfen sowie eine Möglichkeit zum Verdunkeln der Fenster (gleiche Bedingungen wie bei den Schlafzimmern).",
      "s-frio": "Kühlung im Wohnzimmer, wenn die Wohnung im Mai, Juni, Juli und August betrieben wird.",
      "s-calor": "Heizung im Wohnzimmer, wenn die Wohnung im Dezember, Januar, Februar und März betrieben wird.",
      "s-tv": "Ein Fernseher, mit Information über die Sender.",
      "s-convertibles":
        "Bei vollständig überlassenen Wohnungen sind 2 umwandelbare Plätze im Wohnzimmer erlaubt; sie zählen zur Höchstkapazität.",
      "x-botiquin": "Ein Erste-Hilfe-Kasten.",
      "x-humo": "Ein Rauchmelder irgendeiner Art im Bereich nahe der Küche.",
      "x-extintor": "Ein Feuerlöscher.",
      "x-evacuacion":
        "Ein Evakuierungsplan an der Wohnungstür, sofern ein solcher für die Eigentümergemeinschaft des Gebäudes existiert.",
      "i-telefono":
        "Eine rund um die Uhr (24 Stunden am Tag) erreichbare Telefonnummer, um jede Frage oder jeden Vorfall zur Wohnung sofort zu klären.",
      "i-hojas":
        "Offizielle Beschwerde- und Reklamationsformulare (Hojas de Quejas y Reclamaciones) der Junta de Andalucía für die Gäste, mit dem Aushang dazu an gut sichtbarer Stelle in der Wohnung.",
      "i-normas":
        "Die Gäste informieren über: Hausordnung der Eigentümergemeinschaft, Bereiche mit eingeschränkter Nutzung, Nutzung der Einrichtungen und Geräte, Zulassung von Haustieren, Rauchverbote, Standort der Müllcontainer im öffentlichen Straßenraum sowie Regeln zur Rücksicht auf die städtische Umgebung und zu den kommunalen Vorschriften gegen Lärm und Erschütterungen.",
      "i-sac": "Informieren, ob die Wohnung dem Verbraucherschiedssystem (Sistema Arbitral de Consumo) angeschlossen ist.",
      "i-turistica":
        "Touristische Informationen zur Umgebung, gedruckt oder elektronisch: Freizeit, Restaurants und Cafés, Lebensmittelgeschäfte, nächstgelegene Parkplätze, ärztliche Versorgung, öffentlicher Nahverkehr und Ortsplan.",
      "i-instrucciones":
        "Informationen und Bedienungsanleitungen für Geräte oder andere Einrichtungen, die sie benötigen.",
      "i-justificante":
        "Ein Beleg über die Zahlung der Leistungen und etwaiger Anzahlungen mit: Inhaber des Betriebs, Wohnung und ihr Registrierungscode im Tourismusregister Andalusiens, Gast, Zahl der untergebrachten Personen, An- und Abreisedatum sowie Preis und Zahlungsdatum.",
      "i-contrato":
        "Bei der Ankunft jedes Gastes ein vertragsähnliches Dokument mit mindestens: Name der betreibenden Person oder Gesellschaft, Registrierungscode im Tourismusregister Andalusiens, Zahl der Personen, An- und Abreisedatum, Gesamtpreis des Aufenthalts und Telefonnummer für Anliegen.",
      "i-copia":
        "Die unterschriebene Kopie des Dokuments wird 1 Jahr lang für die Verwaltung der Junta de Andalucía bereitgehalten.",
      "i-parte":
        "Vom Gast ein Ausweisdokument verlangen, um die Meldung der Ankunft von Reisenden auszufüllen.",
      "i-horario":
        "Sofern nichts anderes vereinbart ist, kann der Gast die Wohnung ab 15:00 Uhr am ersten Tag bis 11:00 Uhr am Abreisetag nutzen.",
      "i-llaves":
        "Werden die Schlüssel in Vorhängeschlössern, Schlüsseltresoren oder Ähnlichem hinterlegt, dürfen diese nicht an Stadtmobiliar im öffentlichen Straßenraum angebracht werden.",
      "a-dr":
        "Vor dem Start auf elektronischem Weg eine «declaración responsable» (verantwortliche Erklärung) bei der für Tourismus zuständigen Consejería einreichen und erklären, dass die Anforderungen des Dekrets erfüllt sind.",
      "a-publicidad": "Erst ab diesem Zeitpunkt darf die Wohnung als Wohnung zur touristischen Nutzung beworben werden.",
      "a-vivienda":
        "Angabe der Wohnung mit ihrer Katasterreferenz und ihrer maximalen Aufnahmekapazität. Es wird nur eine Wohnung je Katasterreferenz zugelassen, außer die Vorschriften erlauben den Nachweis von zwei oder mehr Wohnungen mit derselben Referenz.",
      "a-explotador":
        "Angabe der betreibenden Person oder Gesellschaft und des Rechtstitels, der sie dazu berechtigt, mit Telefonnummer und E-Mail-Adresse für die Hinweise auf elektronische Zustellungen.",
      "a-propietario": "Angabe der Eigentümerin bzw. des Eigentümers der Immobilie, falls dies nicht die betreibende Person ist.",
      "a-proteccion":
        "Erklärung, dass die Wohnung keiner öffentlichen Schutzregelung unterliegt oder dass sie aus ihr entlassen wurde.",
      "a-urbanismo":
        "Erklärung, dass die Wohnung nach der geltenden Bauleitplanung für die Nutzung als Wohnung zur touristischen Nutzung geeignet ist und dass sie, wo erforderlich, die Genehmigung oder «declaración responsable» zur Nutzungsänderung besitzt, die ihre touristische Nutzung ermöglicht.",
      "a-licencia":
        "Die kommunalen Bauvorschriften einhalten und, soweit anwendbar, die Genehmigung oder «declaración responsable» besitzen, die die touristische Nutzung der Immobilie ermöglicht.",
      "a-datos":
        "Ausdrückliche Zustimmung dazu, dass die öffentlichen Verwaltungen (einschließlich Sicherheitskräften und Steuerbehörden) Daten zur Ausübung ihrer Befugnisse weitergeben und austauschen.",
      "a-comunidad":
        "Erklärung, dass die Satzung oder der Gründungstitel der Eigentümergemeinschaft die Tätigkeit nicht verbieten und dass die Gemeinschaft sie ausdrücklich so genehmigt hat, wie es die staatliche Gesetzgebung verlangt.",
      "a-periodos": "Angabe des Zeitraums oder der Zeiträume, in denen die touristische Leistung erbracht wird.",
      "a-comercializacion":
        "Die Wohnung darf nur in den erklärten Zeiträumen vermarktet werden; eine Vermarktung außerhalb davon gilt als heimliche (illegale) Tätigkeit.",
      "a-prohibidas":
        "Nicht als Wohnung zur touristischen Nutzung zulässig sind: öffentlich geförderte Wohnungen; Wohnungen in Gebäuden, deren Satzung oder Gründungstitel Touristenunterkünfte ausdrücklich verbieten; Unterkunftseinheiten in touristischen Betrieben, die das ganze Gebäude oder einen unabhängigen Teil davon einnehmen müssen; und als «asimilado a fuera de ordenación» (dem planungswidrigen Bestand gleichgestellt) anerkannte Wohnungen, es sei denn, die zuständige Gemeindestelle hat der Nutzungsänderung ausdrücklich vorab zugestimmt.",
      "a-responsable":
        "Wer als Inhaber des Betriebs genannt ist, haftet gegenüber der Verwaltung und den Gästen und muss einen gültigen Rechtstitel für den Betrieb besitzen.",
      "a-copropiedad":
        "Steht die Immobilie im Miteigentum und betreibt eine andere Person oder Gesellschaft sie, benötigt diese den gültigen Rechtstitel aller Eigentümer.",
      "a-publicos":
        "Die Daten der Wohnung aus der «declaración responsable» sind in den Suchmaschinen der Consejería öffentlich, mit Ausnahme von Telefonnummer und E-Mail-Adresse.",
      "a-cambios":
        "Jede Änderung, die die Rechtsgrundlage des Betriebs oder die Bedingungen der Wohnung betrifft, dem Tourismusregister Andalusiens melden.",
      "a-cancelacion":
        "Stellt die Consejería einen wesentlichen Fehler, eine Ungenauigkeit oder eine Falschangabe in der Erklärung fest oder dass die Bedingungen nicht mehr erfüllt sind, kann sie nach Anhörung der Beteiligten die Eintragung löschen.",
      "a-clandestina":
        "Wer die Tätigkeit ohne Einreichung der «declaración responsable» aufnimmt, übt eine heimliche Tätigkeit aus, die in Artikel 71.1 des Gesetzes 13/2011 als schwere Ordnungswidrigkeit eingestuft ist.",
      "a-ayuntamientos":
        "Die Gemeinden können anhand klarer, objektiver und veröffentlichter Kriterien die Höchstzahl der Wohnungen zur touristischen Nutzung je Gebäude, Sektor, Bereich, Zeitraum, Gebiet oder Zone begrenzen.",
    },
  },
  fr: {
    grupos: {
      general: "Le logement dans son ensemble",
      dormitorios: "Chambres",
      banos: "Salles de bains",
      cocina: "Cuisine",
      salon: "Salon",
      seguridad: "Sécurité",
      informacion: "Information et accueil des hôtes",
      alta: "L'inscription au Registre du tourisme d'Andalousie",
    },
    items: {
      "g-capacidad": "Au maximum 15 places si le logement est cédé en entier et 6 s'il est cédé par chambres.",
      "g-superficie":
        "Surface construite minimale de 14 m² par place, selon la surface construite à usage principal figurant au service en ligne du Cadastre ; dans tous les cas, au moins 25 m² ou, à défaut, celle que fixe le plan d'urbanisme.",
      "g-amueblada":
        "Logement suffisamment meublé et doté des appareils et ustensiles nécessaires à un usage immédiat, en rapport avec le nombre de places.",
      "g-suministros": "Fournitures de base permettant de l'habiter : électricité et eau courante, froide et chaude.",
      "g-tomas": "Prises de courant dans toutes les pièces.",
      "g-limpieza": "Nettoyage du logement à l'arrivée et au départ de chaque nouvel hôte.",
      "d-plazas": "Au maximum 4 places par chambre, dont 2 dans des lits qui ne sont pas des lits superposés.",
      "d-ventilacion":
        "Ventilation directe vers l'extérieur ou vers des patios ventilés, et un système d'occultation des fenêtres. Non exigé lorsque l'administration locale ou régionale, dans le cadre de ses compétences, en dispense pour des motifs de protection architecturale.",
      "d-frio":
        "Rafraîchissement (centralisé ou non, par éléments fixes ou portables) dans les chambres et les salons si le logement fonctionne en mai, juin, juillet et août. Les constructions de type grotte en sont exemptées.",
      "d-calor":
        "Chauffage (centralisé ou non, par éléments fixes ou portables) dans les chambres et les salons si le logement fonctionne en décembre, janvier, février et mars. Les éléments incandescents et ceux qui brûlent des liquides ou des gaz inflammables ne sont pas admis.",
      "d-camas": "Lits d'au moins 80 × 190 cm pour un lit simple et 135 × 190 cm pour un lit double.",
      "d-colchones":
        "Sommiers et matelas en bon état, avec un niveau de fermeté homogène sur toute la surface. Épaisseur minimale des matelas : 18 cm.",
      "d-ropa":
        "Linge de lit, couvertures ou couettes et oreillers bien entretenus, selon l'occupation du logement, et un jeu de linge de lit de rechange.",
      "d-armario":
        "Une armoire ou un espace de rangement pour le linge et les vêtements pour 4 places, avec un nombre suffisant de cintres (il peut se trouver dans n'importe quelle chambre), et un point lumineux près du lit.",
      "b-numero": "2 salles de bains s'il y a plus de 5 places et 3 s'il y a plus de 8 places.",
      "b-ventilacion": "Ventilation directe ou forcée pour renouveler l'air.",
      "b-dotacion1":
        "La salle de bains comprend au minimum : toilettes, lavabo, baignoire ou bac à douche, savon pour les mains, gel douche, shampooing, une serviette de toilette par personne et une serviette de bain par personne.",
      "b-dotacion2":
        "En outre : sols antidérapants dans les douches et baignoires, tapis de bain lavable, éclairage adapté, miroir, crochets à serviettes, rouleau de papier toilette supplémentaire, brosse de toilettes, prise de courant près du miroir, étagère, sèche-cheveux et poubelle hygiénique.",
      "b-inodoro":
        "Les toilettes sont séparées et fermées, de façon individuelle ou avec le reste des éléments sanitaires.",
      "c-ventilacion": "Ventilation directe ou forcée pour renouveler l'air.",
      "c-equipo": "Au minimum 2 feux, un four ou un micro-ondes et un réfrigérateur.",
      "c-utensilios":
        "Ustensiles adaptés à la capacité d'accueil : au minimum vaisselle, couverts, verrerie, poêles, casseroles, couverts de service, tire-bouchon, décapsuleur, ciseaux, ouvre-boîtes et égouttoir.",
      "c-electro": "Petit électroménager : au minimum un mixeur, un grille-pain ou un gril, un presse-fruits et une cafetière.",
      "c-otros":
        "Meubles de rangement ; kit de nettoyage (au minimum éponge à récurer, lavette, chiffon et gel nettoyant) ; sacs-poubelle ; séchoir à linge, fer et planche à repasser ; et tri sélectif des déchets avec l'information correspondante.",
      "s-ventilacion":
        "Ventilation directe vers l'extérieur ou vers des patios ventilés, et un système d'occultation des fenêtres (mêmes conditions que pour les chambres).",
      "s-frio": "Rafraîchissement dans le salon si le logement fonctionne en mai, juin, juillet et août.",
      "s-calor": "Chauffage dans le salon si le logement fonctionne en décembre, janvier, février et mars.",
      "s-tv": "Un téléviseur, avec l'information sur les chaînes.",
      "s-convertibles":
        "Dans les logements cédés en entier, 2 places convertibles sont autorisées dans le salon ; elles comptent dans la capacité maximale.",
      "x-botiquin": "Une trousse de premiers secours.",
      "x-humo": "Un détecteur de fumée, de n'importe quel type, dans la zone proche de la cuisine.",
      "x-extintor": "Un extincteur.",
      "x-evacuacion":
        "Un plan d'évacuation sur la porte du logement, s'il en existe un pour la communauté des copropriétaires de l'immeuble.",
      "i-telefono":
        "Un numéro de téléphone joignable pendant les 24 heures de la journée pour traiter immédiatement toute question ou tout incident concernant le logement.",
      "i-hojas":
        "Des feuilles officielles de plaintes et de réclamations (Hojas de Quejas y Reclamaciones) de la Junta de Andalucía à la disposition des hôtes, avec l'affiche qui les annonce dans un endroit visible du logement.",
      "i-normas":
        "Informer les hôtes : des règles de vie de la copropriété, des zones d'usage restreint, de l'usage des installations et équipements, de l'admission des animaux de compagnie, des restrictions pour les fumeurs, de l'emplacement des conteneurs à déchets sur la voie publique et des consignes de respect de l'environnement urbain et de la réglementation municipale contre le bruit et les vibrations.",
      "i-sac": "Informer les hôtes si le logement a adhéré au Système arbitral de consommation (Sistema Arbitral de Consumo).",
      "i-turistica":
        "Information touristique sur la zone, sur papier ou sous forme électronique : loisirs, restaurants et cafés, commerces d'alimentation, parkings les plus proches, services médicaux, transports urbains et plan de la localité.",
      "i-instrucciones":
        "Information et mode d'emploi des appareils électroménagers ou autres dispositifs qui en ont besoin.",
      "i-justificante":
        "Un justificatif du paiement des services et des acomptes, indiquant : le titulaire de l'exploitation, le logement et son code d'inscription au Registre du tourisme d'Andalousie, l'hôte, le nombre de personnes hébergées, les dates d'arrivée et de départ, ainsi que le prix et la date de paiement.",
      "i-contrato":
        "À l'accueil de chaque hôte, un document tenant lieu de contrat qui mentionne au moins : le nom de la personne ou de l'entité exploitante, le code d'inscription au Registre du tourisme d'Andalousie, le nombre de personnes, les dates d'arrivée et de départ, le prix total du séjour et le numéro de téléphone d'assistance.",
      "i-copia":
        "La copie signée du document est conservée pendant 1 an à la disposition de l'administration de la Junta de Andalucía.",
      "i-parte":
        "Demander à l'hôte une pièce d'identité pour remplir la fiche de police d'arrivée des voyageurs.",
      "i-horario":
        "Sauf accord contraire, l'hôte peut occuper le logement à partir de 15:00 le premier jour jusqu'à 11:00 le jour du départ.",
      "i-llaves":
        "Si les clés sont remises dans des cadenas, des boîtes à clés sécurisées ou similaires, ceux-ci ne peuvent pas être fixés au mobilier urbain des voies publiques.",
      "a-dr":
        "Avant de commencer, déposer par voie électronique une «declaración responsable» (déclaration sur l'honneur) auprès de la Consejería compétente en matière de tourisme, attestant que les exigences du décret sont remplies.",
      "a-publicidad": "Ce n'est qu'à partir de ce moment que le logement peut être annoncé comme logement à usage touristique.",
      "a-vivienda":
        "Identification du logement, avec sa référence cadastrale et sa capacité d'accueil maximale. Un seul logement est admis par référence cadastrale, sauf si la réglementation permet d'en justifier deux ou plus sous la même.",
      "a-explotador":
        "Identification de la personne ou de l'entité exploitante et du titre qui l'y habilite, avec un numéro de téléphone et une adresse e-mail pour les avis de notifications électroniques.",
      "a-propietario": "Identification du propriétaire ou du titulaire du bien, s'il n'est pas celui qui exploite le logement.",
      "a-proteccion":
        "Déclaration que le logement n'est soumis à aucun régime de protection publique ou qu'il en a été déclassé.",
      "a-urbanismo":
        "Déclaration que le logement est compatible avec l'usage de logement à usage touristique selon l'urbanisme applicable et qu'il dispose, lorsque c'est exigible, de la licence ou de la «declaración responsable» de changement d'usage qui permet sa destination touristique.",
      "a-licencia":
        "Respecter la réglementation d'urbanisme municipale et, lorsque c'est applicable, disposer de la licence ou de la «declaración responsable» qui permet la destination touristique du bien.",
      "a-datos":
        "Autorisation expresse pour que les administrations publiques (y compris les forces de sécurité et les autorités fiscales) cèdent et échangent des données pour exercer leurs compétences.",
      "a-comunidad":
        "Déclaration que les statuts ou le titre constitutif de la copropriété n'interdisent pas l'activité et que la copropriété l'a expressément autorisée dans les termes exigés par la législation nationale.",
      "a-periodos": "Indiquer la ou les périodes pendant lesquelles le service touristique sera fourni.",
      "a-comercializacion":
        "Le logement ne peut être commercialisé que pendant les périodes déclarées ; le faire en dehors de celles-ci constitue une activité clandestine.",
      "a-prohibidas":
        "Ne peuvent pas être des logements à usage touristique : les logements sous protection publique ; ceux d'immeubles dont les statuts ou le titre constitutif interdisent expressément l'hébergement touristique ; les unités d'hébergement des établissements touristiques qui doivent occuper tout l'immeuble ou une partie indépendante ; et les logements reconnus «asimilado a fuera de ordenación» (assimilés à hors plan), sauf autorisation préalable expresse de l'organe municipal compétent pour le changement d'activité.",
      "a-responsable":
        "La personne indiquée comme titulaire de l'exploitation répond devant l'administration et devant les hôtes, et doit disposer d'un titre juridique valable pour exploiter.",
      "a-copropiedad":
        "Si le bien est en copropriété et qu'une autre personne ou entité l'exploite, celle-ci a besoin du titre juridique valable de tous les propriétaires.",
      "a-publicos":
        "Les données du logement figurant dans la «declaración responsable» sont publiques dans les moteurs de recherche de la Consejería, à l'exception du téléphone et de l'adresse e-mail.",
      "a-cambios":
        "Communiquer au Registre du tourisme d'Andalousie toute modification touchant le lien juridique qui habilite l'exploitation ou les conditions du logement.",
      "a-cancelacion":
        "Si la Consejería constate une erreur, une inexactitude ou une fausseté essentielle dans la déclaration, ou que les conditions ne sont plus réunies, elle peut annuler l'inscription après audition des intéressés.",
      "a-clandestina":
        "Commencer l'activité sans déposer la «declaración responsable» constitue une activité clandestine, qualifiée d'infraction grave à l'article 71.1 de la loi 13/2011.",
      "a-ayuntamientos":
        "Les communes peuvent limiter, selon des critères clairs, objectifs et publiés, le nombre maximal de logements à usage touristique par immeuble, secteur, périmètre, période, zone ou quartier.",
    },
  },
}

/** Rótulos de la referencia al artículo, por idioma. «n» = «6.1.d»; letra = «c». */
const REF_LABEL: Record<Locale, { art: string; anexo: string }> = {
  es: { art: "art. {n}", anexo: "anexo, letra {n}" },
  en: { art: "art. {n}", anexo: "annex, letter {n}" },
  de: { art: "Art. {n}", anexo: "Anhang, Buchstabe {n}" },
  fr: { art: "art. {n}", anexo: "annexe, lettre {n}" },
}

/** «6.1.d» → «art. 6.1.d»; «anexo.c» → «anexo, letra c» (la página los pone entre paréntesis). */
export function formatearRef(ref: string, locale: Locale): string {
  const etiquetas = REF_LABEL[locale]
  if (ref.startsWith("anexo.")) return etiquetas.anexo.replace("{n}", ref.slice(6))
  return etiquetas.art.replace("{n}", ref)
}

export type Requisito = { id: string; texto: string; ref: string }
export type GrupoRequisitos = { id: GrupoId; titulo: string; items: Requisito[] }

/** Los requisitos de la guía, ya con el texto del idioma. */
export function requisitosDe(locale: Locale): GrupoRequisitos[] {
  const textos = TEXTOS[locale]
  return ESTRUCTURA.map((g) => ({
    id: g.id,
    titulo: textos.grupos[g.id],
    items: g.items.map((i) => ({ id: i.id, ref: i.ref, texto: textos.items[i.id] })),
  }))
}
