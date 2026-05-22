"use client"

import { useScrollReveal } from "@/hooks/use-scroll-reveal"

const stats = [
  { value: "87", label: "Projects Completed" },
  { value: "14", label: "International Awards" },
  { value: "22", label: "Years of Practice" },
]

export function StudioSection() {
  const { ref: headRef, isVisible: headVisible } = useScrollReveal(0.15)
  const { ref: bodyRef, isVisible: bodyVisible } = useScrollReveal(0.1)

  return (
    <section id="studio" className="px-6 py-28 md:px-12 lg:px-20 md:py-36 bg-foreground text-background">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-28">
        <div
          ref={headRef}
          className={`transition-all duration-1000 ${
            headVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <p className="text-[11px] tracking-[0.3em] uppercase text-background/40 mb-8">
            About the Studio
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-extralight leading-[1.15] tracking-tight text-balance">
            We believe architecture is the most intimate form of public art
          </h2>
        </div>

        <div
          ref={bodyRef}
          className={`flex flex-col justify-end gap-10 transition-all duration-1000 delay-200 ${
            bodyVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="flex flex-col gap-6 max-w-lg">
            <p className="text-sm leading-[1.75] text-background/55">
              Founded in Stockholm in 2003, Voss Architects is a practice built on the conviction
              that thoughtful design transforms not just spaces, but the lives unfolding within them.
              Our work spans residential, cultural, and commercial projects across Scandinavia and
              Northern Europe.
            </p>
            <p className="text-sm leading-[1.75] text-background/55">
              Every project begins with listening. We study the site, the light, the way people
              move through a space. From this understanding, we craft architecture that feels
              both inevitable and surprising.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-8 pt-10 border-t border-background/10">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl md:text-4xl font-extralight text-background tracking-tight">
                  {stat.value}
                </p>
                <p className="text-[11px] tracking-[0.1em] uppercase text-background/35 mt-2">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
