import { routing, type Locale } from "@/i18n/routing"
import { EXPERIENCIAS } from "@/lib/experiencias"
import { faqHuespedes, faqPortada, faqPropietarios, type FaqEntry, type Translate } from "@/lib/faq"
import { getGuiasPublicadas } from "@/lib/guias"
import { localeUrl, SITE_URL } from "@/lib/seo-urls"
import { SITE_DESCRIPTION, SITE_NAME, SITE_PAGES } from "@/lib/site-pages"
import { REGION, ZONAS } from "@/lib/zonas"

/*
  /llms.txt y /llms-full.txt (formato de llmstxt.org), generados con las
  mismas fuentes que pintan la web:
    · páginas: lib/site-pages.ts (el mismo título y descripción del <title>);
    · zonas: lib/zonas.ts;  experiencias: lib/experiencias.ts;
    · preguntas frecuentes: lib/faq.ts;  guías publicadas: lib/guias.ts.
  Una página, zona, experiencia, pregunta o guía nueva aparece aquí sin tocar
  este fichero.

  Propiedades: no hay sección porque no hay ninguna publicada ni una fuente de
  datos de propiedades (ver lib/jsonld.ts). Cuando exista, se listarán aquí.

  En español, el idioma por defecto del sitio; la sección «Idiomas» enlaza las
  otras versiones.
*/

const LOCALE: Locale = routing.defaultLocale

const lista = (nombres: string[]) =>
  nombres.length > 1 ? `${nombres.slice(0, -1).join(", ")} y ${nombres[nombres.length - 1]}` : nombres.join("")

const enlace = (texto: string, url: string, nota?: string) => `- [${texto}](${url})${nota ? `: ${nota}` : ""}`

function seccionFaq(titulo: string, entradas: FaqEntry[], full: boolean): string[] {
  const url = localeUrl(LOCALE, "/faq")
  return [
    `### ${titulo}`,
    "",
    ...entradas.flatMap(({ q, a }) => (full ? [`**${q}**`, "", a, ""] : [enlace(q, url)])),
    ...(full ? [] : [""]),
  ]
}

export function buildLlmsTxt(t: Translate, { full = false }: { full?: boolean } = {}): string {
  const paginas = SITE_PAGES.filter((p) => !p.legal)
  const legales = SITE_PAGES.filter((p) => p.legal)
  const guias = getGuiasPublicadas()
  const idiomas = new Intl.DisplayNames([LOCALE], { type: "language" })

  const out: string[] = [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    `Opera en ${lista(ZONAS.map((z) => z.name))} (${REGION}). ` +
      `Web en ${lista(routing.locales.map((l) => idiomas.of(l) ?? l))}.`,
    "",
    "## Páginas",
    "",
    ...paginas.map((p) => {
      const { title, description } = p.copy(t, LOCALE)
      return enlace(title, localeUrl(LOCALE, p.path), description)
    }),
    "",
    "## Zonas",
    "",
    ...ZONAS.map((z) => `- ${z.name} (${REGION})`),
    "",
    "## Experiencias",
    "",
    `Catálogo completo: ${localeUrl(LOCALE, "/experiencias")}`,
    "",
    ...EXPERIENCIAS.map(
      ({ id }) => `- ${t(`exp.catalog.items.${id}.title`)}: ${t(`exp.catalog.items.${id}.line`)}`,
    ),
    "",
    "## Preguntas frecuentes",
    "",
    ...seccionFaq(t("faq.tab.guests"), faqHuespedes(t), full),
    ...seccionFaq(t("faq.tab.owners"), faqPropietarios(t), full),
    ...(full ? seccionFaq(t("breadcrumb.home"), faqPortada(t), full) : []),
  ]

  if (guias.length > 0) {
    out.push(
      "## Guías",
      "",
      ...guias.map((g) => {
        const tr = g.traducciones[LOCALE]
        return enlace(tr.titulo, localeUrl(LOCALE, `/guias/${g.slug}`), tr.entradilla)
      }),
      "",
    )
  }

  out.push(
    "## Idiomas",
    "",
    ...routing.locales.map((l) => enlace(idiomas.of(l) ?? l, localeUrl(l, ""))),
    "",
    "## Optional",
    "",
    ...legales.map((p) => {
      const { title, description } = p.copy(t, LOCALE)
      return enlace(title, localeUrl(LOCALE, p.path), description)
    }),
    ...(full ? [] : ["", `Versión completa, con las respuestas: ${SITE_URL}/llms-full.txt`]),
    "",
  )

  return out.join("\n")
}
