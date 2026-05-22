"use client"

import { useScrollReveal } from "@/hooks/use-scroll-reveal"

const principles = [
  {
    number: "01",
    title: "Context First",
    description:
      "Every design responds to its environment. We study topography, climate, cultural context, and the rhythms of daily life before a single line is drawn.",
  },
  {
    number: "02",
    title: "Material Honesty",
    description:
      "We let materials speak their own language. Concrete, timber, glass, stone -- each is used with respect for its inherent qualities and aging characteristics.",
  },
  {
    number: "03",
    title: "Light as Material",
    description:
      "Natural light is our most important building material. We design spaces where light becomes an active, changing presence throughout the day and seasons.",
  },
  {
    number: "04",
    title: "Enduring Design",
    description:
      "We reject the disposable. Every structure is conceived to age gracefully, to become more beautiful with time, and to serve generations to come.",
  },
]

function PrincipleCard({ principle, index }: { principle: typeof principles[0]; index: number }) {
  const { ref, isVisible } = useScrollReveal(0.15)

  return (
    <div
      ref={ref}
      className={`bg-background p-8 md:p-12 group transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
      style={{ transitionDelay: `${(index % 2) * 120}ms` }}
    >
      <div className="flex items-start justify-between mb-10">
        <span className="text-[11px] tracking-[0.15em] text-muted-foreground/40">
          ({principle.number})
        </span>
      </div>
      <h3 className="text-xl md:text-2xl font-extralight tracking-tight text-foreground mb-5 group-hover:translate-x-1 transition-transform duration-500">
        {principle.title}
      </h3>
      <div className="w-8 h-px bg-border mb-5 group-hover:w-12 transition-all duration-500" />
      <p className="text-sm leading-[1.75] text-muted-foreground max-w-sm">
        {principle.description}
      </p>
    </div>
  )
}

export function ApproachSection() {
  const { ref, isVisible } = useScrollReveal(0.05)

  return (
    <section id="approach" className="px-6 py-28 md:px-12 lg:px-20 md:py-36">
      <div
        ref={ref}
        className={`mb-20 pb-6 border-b border-border transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <p className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-3">
          Our Philosophy
        </p>
        <h2 className="text-3xl md:text-[2.75rem] font-extralight tracking-tight text-foreground">
          Approach
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
        {principles.map((principle, index) => (
          <PrincipleCard key={principle.number} principle={principle} index={index} />
        ))}
      </div>
    </section>
  )
}
