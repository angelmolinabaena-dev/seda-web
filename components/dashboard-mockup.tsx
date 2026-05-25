"use client"

import { useTranslations } from "next-intl"

const calendarCells = Array.from({ length: 40 }).map((_, i) => {
  if ([3, 4, 5, 6, 7, 8, 9].includes(i)) return "olive"
  if ([15, 16, 17].includes(i)) return "gold"
  if ([22, 23, 24, 25, 26, 27, 28].includes(i)) return "olive"
  if ([33, 34, 35].includes(i)) return "ink"
  return "empty"
})

export function DashboardMockup() {
  const t = useTranslations()

  const kpis = [
    { label: t("home.dashboard.kpi.ocupacion"), value: "78%", sub: t("home.dashboard.kpi.ocupacion_sub") },
    { label: t("home.dashboard.kpi.ingresos"), value: "€ 142.300", sub: t("home.dashboard.kpi.ingresos_sub") },
    { label: t("home.dashboard.kpi.reservas"), value: "14", sub: t("home.dashboard.kpi.reservas_sub") },
  ]

  const liquidacion: ReadonlyArray<readonly [string, string]> = [
    [t("home.dashboard.liquidacion.row1"), "€ 38.420"],
    [t("home.dashboard.liquidacion.row2"), "− € 6.915"],
    [t("home.dashboard.liquidacion.row3"), "− € 1.240"],
    [t("home.dashboard.liquidacion.row4"), "€ 30.265"],
  ] as const

  return (
    <div className="bg-[hsl(var(--accent))]/95 text-foreground p-4 md:p-5 space-y-3 rounded-sm shadow-[0_30px_80px_-20px_rgba(0,0,0,0.4)] border border-foreground/10">
      {/* Top bar */}
      <div className="flex items-center gap-3 font-mono text-[9px] sm:text-[10px] tracking-wide text-muted-foreground border-b border-foreground/8 pb-3">
        <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--olive))] flex-none" />
        <span className="uppercase tracking-[0.15em] truncate">
          <span className="hidden sm:inline">SEDA OS · </span>{t("home.dashboard.topbar")}
        </span>
        <span className="ml-auto text-foreground/70 flex-none whitespace-nowrap">
          {t("home.dashboard.location")}
        </span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="bg-background border border-foreground/8 p-3 rounded-sm"
          >
            <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-muted-foreground">
              {k.label}
            </p>
            <p className="font-serif font-light text-2xl md:text-[1.75rem] leading-tight tracking-tight text-foreground mt-1">
              {k.value}
            </p>
            <p className="font-mono text-[9px] text-muted-foreground/80 mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="bg-background border border-foreground/8 p-4 rounded-sm">
        <div className="flex items-baseline justify-between mb-3">
          <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-muted-foreground">
            {t("home.dashboard.calendar.title")}
          </p>
          <p className="font-mono text-[9px] text-muted-foreground/80">{t("home.dashboard.calendar.range")}</p>
        </div>
        <div className="grid grid-cols-[repeat(40,_minmax(0,1fr))] gap-[2px]">
          {calendarCells.map((kind, i) => (
            <div
              key={i}
              className={`h-3 sm:h-5 rounded-[2px] ${
                kind === "olive"
                  ? "bg-[hsl(var(--olive))]"
                  : kind === "gold"
                    ? "bg-[hsl(var(--gold))]"
                    : kind === "ink"
                      ? "bg-foreground"
                      : "bg-foreground/5"
              }`}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 font-mono text-[9px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 bg-[hsl(var(--olive))]" /> {t("home.dashboard.calendar.legend_booked")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 bg-[hsl(var(--gold))]" /> {t("home.dashboard.calendar.legend_owner")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 bg-foreground" /> {t("home.dashboard.calendar.legend_maint")}
          </span>
        </div>
      </div>

      {/* Bottom row: liquidación + estado */}
      <div className="grid grid-cols-1 sm:grid-cols-[1.4fr_1fr] gap-2">
        <div className="bg-background border border-foreground/8 p-4 rounded-sm">
          <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-muted-foreground">
            {t("home.dashboard.liquidacion.title")}
          </p>
          <div className="mt-3 flex flex-col">
            {liquidacion.map(([k, v], i) => (
              <div
                key={k}
                className={`flex justify-between items-center py-2 ${
                  i < liquidacion.length - 1 ? "border-b border-foreground/6" : ""
                }`}
              >
                <span
                  className={`font-mono text-[10px] text-foreground ${
                    i === liquidacion.length - 1 ? "font-semibold" : ""
                  }`}
                >
                  {k}
                </span>
                <span
                  className={`font-mono text-[10px] text-foreground tabular-nums ${
                    i === liquidacion.length - 1 ? "font-semibold" : ""
                  }`}
                >
                  {v}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[hsl(var(--olive))] text-background p-4 rounded-sm flex flex-col justify-between min-h-[140px]">
          <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-[hsl(var(--gold))]">
            {t("home.dashboard.status.title")}
          </p>
          <div>
            <p className="font-serif text-lg leading-tight mt-2">{t("home.dashboard.status.ok")}</p>
            <p className="font-mono text-[9px] text-background/70 mt-1 leading-snug whitespace-pre-line">
              {t("home.dashboard.status.details")}
            </p>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <span
                key={i}
                className={`flex-1 h-1 rounded-sm ${
                  i < 6 ? "bg-[hsl(var(--gold))]" : "bg-background/25"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
