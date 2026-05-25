import { Link } from "@/i18n/navigation"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { ArrowRight, ArrowUpRight, Users, BedDouble, Waves, Sparkles } from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { VILLAS, getVillaBySlug } from "@/lib/villas"

const PREFIX_KEYS: Record<string, "villa" | "atico" | "finca" | "residencia"> = {
  Villa: "villa",
  "Ático": "atico",
  Finca: "finca",
  Residencia: "residencia",
}

export async function generateStaticParams() {
  return VILLAS.map((villa) => ({ slug: villa.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const villa = getVillaBySlug(slug)
  const t = await getTranslations("villa")
  if (!villa) return { title: t("not_found_title") }
  const prefix = t(`prefix.${PREFIX_KEYS[villa.prefix] ?? "villa"}`)
  const sublocation = t(`items.${villa.slug}.sublocation`)
  const capacity = t(`items.${villa.slug}.capacity`)
  return {
    title: `${prefix} ${villa.italic} — SEDA Private Homes`,
    description: `${sublocation}. ${capacity}. ${t("meta_suffix")}`,
  }
}

// Price-per-night display values (placeholder until PMS integration).
// Today these point at the contact form; once PMS lands, swap the booking
// CTA `href` to `/booking/${slug}` and replace `desdeNoche` with live data.
const VILLA_PRICING: Record<string, { desdeNoche: string }> = {
  "villa-alboran":             { desdeNoche: "€4.200" },
  "atico-marina-puerto-banus": { desdeNoche: "€1.800" },
  "finca-los-olivos-casares":  { desdeNoche: "€2.800" },
  "residencia-duna-estepona":  { desdeNoche: "€3.500" },
}

export default async function VillaPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const villa = getVillaBySlug(slug)
  if (!villa) notFound()

  const t = await getTranslations("villa")
  const tb = await getTranslations("breadcrumb")

  const localizedPrefix = t(`prefix.${PREFIX_KEYS[villa.prefix] ?? "villa"}`)
  const localizedSublocation = t(`items.${villa.slug}.sublocation`)
  const localizedCapacity = t(`items.${villa.slug}.capacity`)
  const localizedDescription = t(`items.${villa.slug}.description`)
  const villaLabel = `${localizedPrefix} ${villa.italic}`
  const pricing = VILLA_PRICING[slug] ?? { desdeNoche: t("price_unavailable") }
  // When PMS is integrated, change this to: `/booking/${slug}`
  const bookHref = `/contacto?type=guest&villa=${encodeURIComponent(slug)}`
  const otherVillas = VILLAS.filter((v) => v.slug !== slug).slice(0, 3)

  // Locale-aware trail label (Inicio → Colección → {villa}).
  const breadcrumbItems = [
    { label: tb("coleccion"), href: "/coleccion" },
    { label: villaLabel }, // last item = current page, no href
  ]

  return (
    <main id="main-content">
      {/* HERO with primary booking CTA */}
      <section className="relative min-h-[88vh] flex flex-col justify-end overflow-hidden bg-foreground">
        <div className="absolute inset-0 z-0">
          <img
            src={villa.image}
            alt={`${villaLabel} — ${localizedSublocation}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/20 via-foreground/35 to-foreground/85" />
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-foreground/55 to-transparent pointer-events-none" />
        </div>

        <div className="relative z-10 px-6 pb-20 md:pb-24 md:px-12 lg:px-20 pt-36">
          <div className="max-w-7xl mx-auto">
            <Breadcrumbs items={breadcrumbItems} className="mb-12" />

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 lg:gap-16 items-end">
              <div>
                <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-[hsl(var(--gold))] mb-6">
                  {localizedSublocation}
                </p>
                <h1 className="font-serif font-light text-[clamp(2.75rem,7vw,5.75rem)] leading-[1.02] tracking-[-0.015em] text-background text-balance">
                  {localizedPrefix} <span className="italic">{villa.italic}</span>
                </h1>
                <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-background/70 mt-6">
                  {localizedCapacity}
                </p>
              </div>

              {/* Booking pill — price + primary CTA, prominent in hero */}
              <div className="bg-background/10 backdrop-blur-md border border-background/20 p-6 md:p-7 max-w-md w-full lg:min-w-[360px]">
                <div className="flex items-baseline justify-between mb-5 gap-4">
                  <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-background/65">
                    {t("from")}
                  </p>
                  <p className="font-serif font-light text-3xl md:text-[2.25rem] leading-none text-background tabular-nums">
                    {pricing.desdeNoche}<span className="font-mono text-xs text-background/65 tracking-[0.18em] uppercase ml-1.5">{t("per_night")}</span>
                  </p>
                </div>
                <Link
                  href={bookHref}
                  className="group flex items-center justify-center gap-3 px-6 py-4 bg-[hsl(var(--gold))] text-foreground font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-[hsl(var(--gold))]/90 transition-colors"
                >
                  {t("book_cta")}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={1.75} />
                </Link>
                <Link
                  href={bookHref}
                  className="flex items-center justify-center gap-2 mt-3 font-mono text-[10px] tracking-[0.22em] uppercase text-background/80 hover:text-background pb-0.5 border-b border-background/30 hover:border-background/70 w-fit mx-auto transition-colors"
                >
                  {t("check_availability")}
                  <ArrowUpRight className="h-3 w-3" strokeWidth={1.75} />
                </Link>
                <p className="font-mono text-[9px] tracking-[0.18em] uppercase text-background/45 text-center mt-5 leading-snug">
                  {t("response_note")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick facts strip */}
      <section className="px-6 md:px-12 lg:px-20 py-12 md:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { Icon: Users,     label: t("quick.guests"),   value: localizedCapacity.split("·")[0]?.trim() ?? "—" },
            { Icon: BedDouble, label: t("quick.bedrooms"), value: localizedCapacity.split("·")[1]?.trim() ?? "—" },
            { Icon: Sparkles,  label: t("quick.area"),     value: localizedCapacity.split("·")[2]?.trim() ?? "—" },
            { Icon: Waves,     label: t("quick.feature"),  value: localizedCapacity.split("·")[3]?.trim() ?? "—" },
          ].map(({ Icon, label, value }) => (
            <div key={label}>
              <Icon className="h-4 w-4 text-[hsl(var(--olive))] mb-3" strokeWidth={1.5} />
              <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
                {label}
              </p>
              <p className="font-serif font-light text-lg md:text-xl text-foreground mt-1.5 leading-tight">
                {value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Description + secondary CTA */}
      <section className="px-6 md:px-12 lg:px-20 py-24 md:py-32">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-6">
            {t("section_eyebrow")}
          </p>
          <h2 className="font-serif font-light text-3xl md:text-4xl lg:text-[2.75rem] leading-[1.05] tracking-[-0.015em] text-foreground text-balance mb-8">
            {localizedPrefix} <span className="italic">{villa.italic}</span>{t("section_h2.after_name")}
          </h2>
          <p className="text-base md:text-lg leading-[1.75] text-muted-foreground">
            {localizedDescription}
          </p>
          <p className="text-sm leading-[1.7] text-muted-foreground/85 mt-8">
            {t("section_note")}
          </p>
          <div className="flex flex-col sm:flex-row items-start gap-3 mt-12">
            <Link
              href={bookHref}
              className="group inline-flex items-center justify-center gap-3 px-7 py-3.5 bg-foreground text-background font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-foreground/90 transition-colors"
            >
              {t("book_villa")} {localizedPrefix.toLowerCase()} {villa.italic}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={1.75} />
            </Link>
            <Link
              href="/coleccion"
              className="group inline-flex items-center justify-center gap-3 px-7 py-3.5 border border-foreground/30 text-foreground font-mono text-[11px] tracking-[0.22em] uppercase hover:border-foreground transition-colors"
            >
              {t("see_others")}
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </Link>
          </div>
        </div>
      </section>

      {/* Otras residencias */}
      <section className="px-6 md:px-12 lg:px-20 py-24 md:py-32 bg-secondary/40">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-12">
            <div>
              <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-4">
                {t("back_link")}
              </p>
              <h2 className="font-serif font-light text-3xl md:text-4xl lg:text-[2.75rem] leading-[1.05] tracking-[-0.015em] text-foreground text-balance">
                {t("back_h2.line1")} <span className="italic">{t("back_h2.italic")}</span>
              </h2>
            </div>
            <Link
              href="/coleccion"
              className="group inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] uppercase text-foreground border-b border-foreground/30 hover:border-foreground pb-1 transition-colors"
            >
              {t("see_all")}
              <ArrowUpRight className="h-3 w-3" strokeWidth={1.75} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-7 gap-y-10">
            {otherVillas.map((v) => {
              const otherPrefix = t(`prefix.${PREFIX_KEYS[v.prefix] ?? "villa"}`)
              const otherSublocation = t(`items.${v.slug}.sublocation`)
              return (
                <Link key={v.slug} href={`/villa/${v.slug}`} className="group block">
                  <div className="aspect-[4/5] overflow-hidden mb-5">
                    <img
                      src={v.image}
                      alt={`${otherPrefix} ${v.italic}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                    />
                  </div>
                  <h3 className="font-serif font-light text-2xl text-foreground mb-1.5">
                    {otherPrefix} <span className="italic">{v.italic}</span>
                  </h3>
                  <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
                    {otherSublocation}
                  </p>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
      {/* MOBILE STICKY BOOKING BAR — only visible on /villa/* and only on mobile */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-md border-t border-border">
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-serif text-base leading-tight text-foreground truncate">
              {localizedPrefix} <span className="italic">{villa.italic}</span>
            </p>
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted-foreground mt-0.5 tabular-nums">
              {t("sticky.from")} {pricing.desdeNoche} {t("per_night")}
            </p>
          </div>
          <Link
            href={bookHref}
            className="shrink-0 inline-flex items-center gap-2 px-5 py-3 bg-foreground text-background font-mono text-[10px] tracking-[0.22em] uppercase hover:bg-foreground/90 transition-colors"
          >
            {t("sticky.book")}
            <ArrowRight className="h-3 w-3" strokeWidth={1.75} />
          </Link>
        </div>
      </div>
      {/* Spacer so the mobile sticky bar doesn't cover the last bit of content */}
      <div aria-hidden className="lg:hidden h-20" />
    </main>
  )
}
