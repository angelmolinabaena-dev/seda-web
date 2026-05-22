"use client"

import { ArrowUpRight } from "lucide-react"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"

export function ContactSection() {
  const { ref: headRef, isVisible: headVisible } = useScrollReveal(0.15)
  const { ref: bodyRef, isVisible: bodyVisible } = useScrollReveal(0.1)

  return (
    <section id="contact" className="px-6 py-28 md:px-12 lg:px-20 md:py-36 bg-foreground text-background">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-28">
        <div
          ref={headRef}
          className={`transition-all duration-1000 ${
            headVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <p className="text-[11px] tracking-[0.3em] uppercase text-background/40 mb-8">
            Get in Touch
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-extralight leading-[1.15] tracking-tight text-balance">
            {"Let's discuss your"}<br />next project
          </h2>
          <div className="mt-10">
            <a
              href="mailto:studio@vossarchitects.com"
              className="group inline-flex items-center gap-3 text-sm tracking-wide text-background/60 hover:text-background transition-colors duration-500"
            >
              <span className="border-b border-background/20 pb-0.5 group-hover:border-background/60 transition-colors duration-500">
                studio@vossarchitects.com
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
            </a>
          </div>
        </div>

        <div
          ref={bodyRef}
          className={`flex flex-col justify-end transition-all duration-1000 delay-200 ${
            bodyVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <p className="text-[11px] tracking-[0.3em] uppercase text-background/35 mb-5">
                Stockholm
              </p>
              <p className="text-sm leading-[1.75] text-background/55">
                Strandvagen 7B<br />
                114 56 Stockholm<br />
                Sweden
              </p>
              <p className="text-sm text-background/55 mt-4">
                +46 8 123 456 78
              </p>
            </div>
            <div>
              <p className="text-[11px] tracking-[0.3em] uppercase text-background/35 mb-5">
                Copenhagen
              </p>
              <p className="text-sm leading-[1.75] text-background/55">
                Bredgade 42<br />
                1260 Copenhagen K<br />
                Denmark
              </p>
              <p className="text-sm text-background/55 mt-4">
                +45 33 12 34 56
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
