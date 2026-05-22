"use client"

import { useEffect, useRef, useState } from "react"

export function Hero() {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section ref={ref} className="relative h-screen flex flex-col justify-end overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1920&q=80"
          alt="Modern concrete building with geometric facade"
          className={`w-full h-full object-cover transition-transform duration-[2s] ease-out ${
            visible ? "scale-100" : "scale-110"
          }`}
        />
        <div className="absolute inset-0 bg-foreground/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 pb-16 md:px-12 lg:px-20 md:pb-20">
        <div className="max-w-5xl">
          <div
            className={`overflow-hidden mb-6 transition-all duration-1000 delay-500 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <p className="text-[11px] tracking-[0.3em] uppercase text-background/50">
              Est. 2003 — Stockholm & Copenhagen
            </p>
          </div>

          <div
            className={`transition-all duration-1000 delay-700 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <h1 className="text-[clamp(2.25rem,6vw,5.5rem)] font-extralight leading-[1.05] tracking-[-0.03em] text-background text-balance">
              Architecture that shapes
              <br className="hidden md:block" />
              how we experience
              <br className="hidden md:block" />
              the world
            </h1>
          </div>
        </div>

        <div
          className={`mt-16 md:mt-20 flex items-center gap-6 transition-all duration-1000 delay-1000 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="w-12 h-px bg-background/30" />
          <span className="text-[11px] tracking-[0.2em] uppercase text-background/40">
            Scroll to explore
          </span>
        </div>
      </div>
    </section>
  )
}
