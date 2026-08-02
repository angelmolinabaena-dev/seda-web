import type { Locale } from "@/i18n/routing"

/*
  Entidad de autor para `/guias`. Solo hechos verificables — ver
  docs/audit/VERACIDAD-PUBLICA.md (retirada de premios/cifras ficticias,
  2026-08-02). Nada de premios, cifras, años de experiencia ni credenciales
  no trazables: si no está documentado, no se escribe.
*/

export type Autor = {
  id: string
  nombre: string
  /** Hechos verificables, uno por línea, traducidos. Sin cifras ni premios. */
  hechos: Record<Locale, string[]>
}

export const autores: Record<string, Autor> = {
  "angel-molina": {
    id: "angel-molina",
    nombre: "Ángel Molina",
    hechos: {
      es: [
        "Fundador de SEDA Private Homes.",
        "Fundador de Hotel Estepona Plaza.",
      ],
      en: [
        "Founder of SEDA Private Homes.",
        "Founder of Hotel Estepona Plaza.",
      ],
      fr: [
        "Fondateur de SEDA Private Homes.",
        "Fondateur de l'Hotel Estepona Plaza.",
      ],
      de: [
        "Gründer von SEDA Private Homes.",
        "Gründer des Hotel Estepona Plaza.",
      ],
    },
  },
}

export function getAutor(id: string): Autor | undefined {
  return autores[id]
}
