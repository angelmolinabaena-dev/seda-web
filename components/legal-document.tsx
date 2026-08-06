import { Link } from "@/i18n/navigation"
import type { Locale } from "@/i18n/routing"
import {
  ETIQUETAS_IDENTIFICACION,
  legalEntity,
  resolverTokens,
  type CampoIdentidad,
} from "@/lib/legal/entity"
import type { BloqueLegal, DocumentoLegalMultilingue } from "@/lib/legal/types"

/*
  Renderizador único de las tres páginas legales. Server Component: estas
  páginas no tienen interacción, así que no viajan al cliente ni un byte de
  JavaScript — y el texto legal, que es largo, no engorda ningún bundle.

  El estilo es el editorial del sitio (serif ligera, versalitas mono,
  medida de lectura corta), no el de un documento pegado en un <pre>: una
  página legal que no se puede leer cumple la forma y falla el fondo, que
  es informar (art. 12.1 RGPD, «forma concisa, transparente, inteligible»).
*/

const FORMATO_FECHA: Record<Locale, string> = {
  es: "es-ES",
  en: "en-GB",
  fr: "fr-FR",
  de: "de-DE",
}

function formatearFecha(iso: string, locale: Locale) {
  // Mediodía UTC para que el desplazamiento de zona nunca reste un día.
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString(FORMATO_FECHA[locale], {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  })
}

function BloqueIdentificacion({ locale }: { locale: Locale }) {
  const etq = ETIQUETAS_IDENTIFICACION[locale]
  const filas: [string, string | null][] = [
    [etq.titular, legalEntity.titular],
    [etq.nif, legalEntity.nif],
    [etq.domicilio, legalEntity.domicilio],
    [etq.nombreComercial, legalEntity.nombreComercial],
    [etq.dominio, legalEntity.dominio],
    [etq.email, legalEntity.email],
    [etq.telefono, legalEntity.telefono],
    [etq.inscripcion, legalEntity.inscripcionRegistral ?? etq.sinInscripcion],
  ]

  return (
    <dl className="my-8 border-t border-border">
      {filas.map(([etiqueta, valor]) => (
        <div
          key={etiqueta}
          className="grid grid-cols-1 sm:grid-cols-[minmax(9rem,14rem)_1fr] gap-1 sm:gap-6 py-3 border-b border-border"
        >
          <dt className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground pt-1">
            {etiqueta}
          </dt>
          <dd className="text-[0.95rem] leading-[1.7] text-foreground/90">
            {valor ?? (
              // Sólo alcanzable en desarrollo: en producción `exigirIdentidad`
              // ya ha detenido el build antes de llegar aquí.
              <span className="text-[#b85432] font-mono text-[11px] uppercase tracking-[0.18em]">
                pendiente
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function Bloque({ bloque, locale }: { bloque: BloqueLegal; locale: Locale }) {
  switch (bloque.tipo) {
    case "parrafo":
      return (
        <p className="text-[0.95rem] md:text-base leading-[1.85] text-foreground/85 mb-5 max-w-[68ch]">
          {resolverTokens(bloque.texto)}
        </p>
      )

    case "lista":
      return (
        <ul className="mb-6 space-y-2.5 max-w-[68ch]">
          {bloque.items.map((item) => (
            <li
              key={item}
              className="relative pl-5 text-[0.95rem] leading-[1.8] text-foreground/85 before:absolute before:left-0 before:top-[0.85em] before:h-px before:w-2.5 before:bg-[hsl(var(--gold))]"
            >
              {resolverTokens(item)}
            </li>
          ))}
        </ul>
      )

    case "tabla":
      return (
        <div className="my-8 -mx-6 md:mx-0 px-6 md:px-0 overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-left">
            <thead>
              <tr>
                {bloque.cabeceras.map((cabecera) => (
                  <th
                    key={cabecera}
                    scope="col"
                    className="border-b border-foreground/25 pb-3 pr-6 align-bottom font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground font-normal"
                  >
                    {cabecera}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bloque.filas.map((fila) => (
                <tr key={fila.join("|")} className="align-top">
                  {fila.map((celda, i) => (
                    <td
                      key={i}
                      className="border-b border-border py-4 pr-6 text-[0.9rem] leading-[1.7] text-foreground/85"
                    >
                      {resolverTokens(celda)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )

    case "identificacion":
      return <BloqueIdentificacion locale={locale} />
  }
}

export function LegalDocument({
  documento,
  locale,
  pendientes,
  etiquetaActualizado,
  etiquetaIndice,
}: {
  documento: DocumentoLegalMultilingue
  locale: Locale
  /** Campos de identidad sin rellenar. Siempre vacío en producción. */
  pendientes: CampoIdentidad[]
  /** «Última actualización» traducido — la fecha se formatea aquí, por idioma. */
  etiquetaActualizado: string
  etiquetaIndice: string
}) {
  const doc = documento.traducciones[locale]

  return (
    <main id="main-content">
      {pendientes.length > 0 && (
        <div className="mx-6 md:mx-12 lg:mx-20 mt-32 border-l-2 border-[#b85432] bg-[#b85432]/8 px-5 py-4">
          <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#b85432]">
            Sólo en desarrollo — esta página no puede publicarse
          </p>
          <p className="mt-2 text-[0.9rem] leading-[1.7] text-foreground/85">
            Faltan datos identificativos en{" "}
            <code className="font-mono text-[0.85rem]">lib/legal/entity.ts</code>:{" "}
            {pendientes.join(", ")}. Con cualquiera de ellos vacío,{" "}
            <code className="font-mono text-[0.85rem]">next build</code> falla a propósito.
          </p>
        </div>
      )}

      <section className="px-6 md:px-12 lg:px-20 pt-24 md:pt-40 pb-10 md:pb-14">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-8">
            SEDA Private Homes
          </p>
          <h1 className="font-serif font-light text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.05] tracking-[-0.02em] text-foreground text-balance">
            {doc.titulo}
          </h1>
          <p className="mt-8 text-[1rem] md:text-[1.05rem] leading-[1.8] text-muted-foreground max-w-[62ch]">
            {doc.entradilla}
          </p>
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-20 pb-24 md:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Índice — sticky en escritorio, plegado arriba en móvil. */}
          <nav aria-label={etiquetaIndice} className="lg:col-span-3">
            <div className="lg:sticky lg:top-32">
              <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-muted-foreground/70 mb-4">
                {etiquetaIndice}
              </p>
              <ol className="space-y-2.5">
                {doc.secciones.map((seccion, i) => (
                  <li key={seccion.id} className="flex gap-3">
                    <span className="font-mono text-[10px] text-muted-foreground/50 pt-[3px]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <a
                      href={`#${seccion.id}`}
                      className="text-[0.85rem] leading-[1.5] text-foreground/70 hover:text-foreground transition-colors"
                    >
                      {seccion.titulo}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          <div className="lg:col-span-9 lg:border-l lg:border-border lg:pl-16">
            {doc.secciones.map((seccion, i) => (
              <section
                key={seccion.id}
                id={seccion.id}
                className="scroll-mt-32 mb-14 last:mb-0"
              >
                <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-[hsl(var(--gold))] mb-3">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h2 className="font-serif font-light text-2xl md:text-[1.85rem] leading-tight tracking-[-0.01em] text-foreground mb-6">
                  {seccion.titulo}
                </h2>
                {seccion.bloques.map((bloque, j) => (
                  <Bloque key={j} bloque={bloque} locale={locale} />
                ))}
                {seccion.enlaces && (
                  <div className="flex flex-wrap gap-x-6 gap-y-2 mt-6">
                    {seccion.enlaces.map((enlace) => (
                      <Link
                        key={enlace.href}
                        href={enlace.href}
                        className="font-mono text-[11px] tracking-[0.18em] uppercase text-foreground/70 border-b border-border pb-0.5 hover:text-foreground hover:border-foreground/60 transition-colors"
                      >
                        {enlace.etiqueta}
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            ))}

            <p className="mt-16 pt-6 border-t border-border font-mono text-[11px] tracking-[0.15em] text-muted-foreground/70">
              {etiquetaActualizado}:{" "}
              <time dateTime={documento.actualizado}>
                {formatearFecha(documento.actualizado, locale)}
              </time>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
