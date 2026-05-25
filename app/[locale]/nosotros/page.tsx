"use client"

import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { ArrowRight, ArrowUpRight } from "lucide-react"
import { useEffect } from "react"

/* ── Scroll-reveal hook ─────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("reveal-in")
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
    )
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

/* ── Data ───────────────────────────────────────────────────── */
const TIMELINE = [
  {
    period: "Formación",
    title: "Les Roches School of Hotel Management",
    location: "Bluche · Suiza",
    body: "Una de las escuelas de hotelería más reconocidas del mundo. Formación en gestión hotelera internacional, revenue management, F&B y liderazgo de equipos multiculturales.",
  },
  {
    period: "8+ años",
    title: "Iberostar Hotels & Resorts",
    location: "España · Internacional",
    body: "Gestión operativa en propiedades de cadena multinacional. Trabajo directo con equipos en múltiples países y culturas, con exposición a los estándares de hospitalidad más exigentes del mercado masivo y premium.",
  },
  {
    period: "Fundador",
    title: "Hotel Estepona Plaza ★★★",
    location: "Estepona · Málaga",
    body: "Propietario-operador de hotel boutique de 36 habitaciones en primera línea. Premio Hotel del Año España (Core Hospitality), Travellers' Choice TripAdvisor, Traveller Review Award Booking.com, Expedia y Orbitz — cinco premios consecutivos construidos desde cero.",
  },
  {
    period: "Próxima apertura",
    title: "Hotel Estepona Patio",
    location: "Estepona · Málaga",
    body: "Segunda propiedad en desarrollo. La continuación del modelo de hotelería íntima y de calidad en el corazón histórico de Estepona.",
  },
  {
    period: "Fundador",
    title: "Seda Private Homes",
    location: "Costa del Sol",
    body: "Traslado del modelo hotelero a la gestión de residencias privadas de lujo. La misma disciplina, los mismos estándares, la misma transparencia — aplicados a las villas más excepcionales de la Costa del Sol.",
  },
]

const AWARDS = [
  {
    platform: "TripAdvisor",
    title: "Travellers' Choice 2024",
    img: "https://hotelesteponaplaza.com/wp-content/uploads/2024/02/TC_white_winner-gif_L_2024-3.gif",
    alt: "TripAdvisor Travellers' Choice 2024",
    href: "https://www.tripadvisor.es/Hotel_Review-g187437-d23907969-Reviews-Hotel_Estepona_Plaza-Estepona_Costa_del_Sol_Province_of_Malaga_Andalucia.html",
  },
  {
    platform: "Booking.com",
    title: "Traveller Review Award 2026",
    img: "https://hotelesteponaplaza.com/wp-content/uploads/2024/02/booking-award-2026-1-1024x1024.jpg",
    alt: "Booking.com Traveller Review Award 2026",
    href: "https://hotelesteponaplaza.com",
  },
  {
    platform: "Core Hospitality",
    title: "Hotel of the Year · España",
    img: "https://hotelesteponaplaza.com/wp-content/uploads/2024/02/HOTY_Core-Logos_Positive-Masters_OL_Spain-Spanish-1024x881.webp",
    alt: "Core Masters — Hotel of the Year España",
    href: "https://hotelesteponaplaza.com",
  },
  {
    platform: "Expedia",
    title: "Traveler Preferred Award",
    img: "https://hotelesteponaplaza.com/wp-content/uploads/2024/02/expedia-aw-1024x1024.webp",
    alt: "Expedia Traveler Preferred Award",
    href: "https://hotelesteponaplaza.com",
  },
  {
    platform: "Orbitz",
    title: "Traveler Preferred Award",
    img: "https://hotelesteponaplaza.com/wp-content/uploads/2024/02/orbitz-aw-1024x1024.webp",
    alt: "Orbitz Traveler Preferred Award",
    href: "https://hotelesteponaplaza.com",
  },
]

const PLATFORM_NODES = [
  {
    tag: "A · Huéspedes",
    title: "Una app, un concierge.",
    body: "Llegada, climatización, reservas y experiencias — todo en un solo hilo. Sin llamadas, sin papel.",
    pill: "Guest App",
  },
  {
    tag: "B · Propietarios",
    title: "Rentabilidad, en silencio.",
    body: "Liquidación mensual clara, ocupación por encima del mercado y reportes en tiempo real.",
    pill: "SEDA OS",
  },
  {
    tag: "C · Operaciones",
    title: "Un equipo, no tres.",
    body: "Recepción, mantenimiento, limpieza y revenue management bajo un mismo mando.",
    pill: "Booking Platform",
  },
]

/* ── Page ───────────────────────────────────────────────────── */
export default function NosotrosPage() {
  useReveal()

  return (
    <main id="main-content">

      {/* ── 1. HERO ──────────────────────────────────────────── */}
      <header className="relative bg-foreground text-background overflow-hidden pt-40 pb-28 md:pb-36">
        {/* subtle texture overlay */}
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,hsl(88_18%_32%),transparent)]" />

        <div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-16 lg:gap-24 items-center">

            {/* Left: text */}
            <div>
              <p className="reveal font-mono text-[11px] tracking-[0.3em] uppercase text-[hsl(var(--gold))] mb-10">
                Fundador · Seda Private Homes
              </p>
              <h1 className="reveal font-serif font-light text-[clamp(52px,6.5vw,80px)] leading-[1.02] tracking-[-0.022em] text-balance">
                Ángel <span className="italic text-[hsl(var(--gold))]">Molina</span>.
              </h1>
              <p className="reveal text-[17px] leading-[1.75] text-background/65 max-w-[44ch] mt-7">
                Hostelero. Detrás de{" "}
                <span className="text-background/90 font-medium">Hotel Estepona Plaza</span>,
                premiado año tras año por Booking, TripAdvisor, Expedia y Core Hospitality.
                Fundador de{" "}
                <span className="text-background/90 font-medium">Seda Private Homes</span>{" "}
                — la misma disciplina hotelera aplicada a residencias privadas en la Costa del Sol.
              </p>

              {/* Meta strip */}
              <dl className="reveal mt-12 pt-8 border-t border-background/12 grid grid-cols-2 gap-x-12 gap-y-6 max-w-[480px]">
                <div>
                  <dt className="font-mono text-[10px] tracking-[0.24em] uppercase text-background/45 mb-2">
                    Base
                  </dt>
                  <dd className="font-serif italic text-[18px] text-background/90 tracking-[-0.01em]">
                    Estepona, Málaga
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] tracking-[0.24em] uppercase text-background/45 mb-2">
                    Idiomas
                  </dt>
                  <dd className="font-mono text-[13px] text-background/80 tracking-[0.06em]">
                    ES · EN · FR · PT · DE
                  </dd>
                </div>
              </dl>
            </div>

            {/* Right: portrait */}
            <div className="reveal relative">
              <div className="relative aspect-[3/4] overflow-hidden max-h-[580px]">
                <Image
                  src="/angel-molina.jpg"
                  alt="Ángel Molina Baena — Fundador de Seda Private Homes"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 44vw"
                  priority
                />
              </div>
              <p className="absolute bottom-[-28px] left-0 font-mono text-[10px] tracking-[0.26em] uppercase text-background/35">
                Retrato · Estepona, 2025
              </p>
            </div>

          </div>
        </div>
      </header>

      {/* ── 2. LA PREGUNTA ───────────────────────────────────── */}
      <section className="px-6 md:px-12 lg:px-20 py-28 md:py-36 bg-background text-center">
        <div className="max-w-7xl mx-auto">
          <p className="reveal font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-10">
            La pregunta que lo cambió todo
          </p>
          <blockquote className="reveal font-serif italic font-light text-[clamp(28px,4vw,48px)] leading-[1.2] tracking-[-0.02em] text-[hsl(var(--olive))] max-w-[760px] mx-auto text-balance relative">
            <span className="absolute top-[-0.3em] left-[-0.3em] font-serif text-[hsl(var(--gold))] opacity-40 text-[1.4em] not-italic">"</span>
            ¿Por qué las villas de lujo de la Costa del Sol no se gestionan con los mismos
            estándares que un hotel de cinco estrellas?
            <span className="absolute bottom-[-0.5em] right-[-0.2em] font-serif text-[hsl(var(--gold))] opacity-40 text-[1.4em] not-italic">"</span>
          </blockquote>
          <p className="reveal font-mono text-[10.5px] tracking-[0.28em] uppercase text-muted-foreground mt-10">
            — La pregunta que fundó Seda
          </p>
          <div className="reveal mt-14 max-w-[640px] mx-auto text-left space-y-5">
            <p className="text-[18px] leading-[1.7] text-muted-foreground font-light">
              Después de años gestionando hoteles con Iberostar y fundando el Hotel Estepona Plaza,
              veía el mismo patrón: propiedades excepcionales, gestión mediocre. Propietarios
              que no sabían lo que ganaban ni lo que gastaban. Huéspedes que pagaban tarifas
              de lujo por una experiencia de apartamento vacacional.
            </p>
            <p className="text-[18px] leading-[1.7] text-muted-foreground font-light">
              Los propietarios merecían operaciones de hotel. Los huéspedes merecían servicio
              de hotel. Seda fue la respuesta.
            </p>
          </div>
        </div>
      </section>

      {/* ── 3. TRAYECTORIA ───────────────────────────────────── */}
      <section className="px-6 md:px-12 lg:px-20 py-24 md:py-32 bg-secondary/40">
        <div className="max-w-7xl mx-auto">

          <div className="mb-16">
            <p className="reveal font-mono text-[11px] tracking-[0.3em] uppercase text-[hsl(var(--gold))] mb-5">
              Trayectoria
            </p>
            <h2 className="reveal font-serif font-light text-[clamp(36px,4.5vw,56px)] leading-[1.06] tracking-[-0.02em]">
              El camino <span className="italic text-[hsl(var(--olive))]">hasta aquí</span>
            </h2>
          </div>

          {/* Timeline */}
          <div className="border-t border-border">
            {TIMELINE.map((item, i) => (
              <div
                key={i}
                className="reveal grid grid-cols-1 md:grid-cols-[160px_1fr_auto] gap-4 md:gap-12 py-8 border-b border-border items-baseline"
              >
                <p className="font-serif font-light text-[clamp(26px,3vw,36px)] leading-none text-[hsl(var(--olive))] tracking-[-0.02em]">
                  {item.period}
                </p>
                <div>
                  <h3 className="font-serif font-medium text-[22px] leading-[1.3] tracking-[-0.01em] text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-[15px] leading-[1.65] text-muted-foreground max-w-[52ch]">
                    {item.body}
                  </p>
                </div>
                <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground md:text-right whitespace-nowrap">
                  {item.location}
                </p>
              </div>
            ))}
          </div>

          {/* Languages strip */}
          <div className="reveal mt-14 flex flex-wrap gap-3">
            <p className="font-mono text-[10px] tracking-[0.26em] uppercase text-muted-foreground self-center mr-4">
              Idiomas
            </p>
            {[
              ["ES", "Español"],
              ["EN", "English"],
              ["FR", "Français"],
              ["PT", "Português"],
              ["DE", "Deutsch"],
            ].map(([code, name]) => (
              <div
                key={code}
                className="flex items-center gap-2 px-4 py-2 border border-border bg-background rounded-full"
              >
                <span className="font-mono text-[11px] tracking-[0.18em] font-medium text-[hsl(var(--olive))]">
                  {code}
                </span>
                <span className="font-mono text-[10px] tracking-[0.1em] text-muted-foreground">
                  {name}
                </span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 4. EL HOTEL KPI ──────────────────────────────────── */}
      <section className="px-6 md:px-12 lg:px-20 py-24 md:py-32 bg-background">
        <div className="max-w-7xl mx-auto">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end mb-16">
            <div>
              <p className="reveal font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-5">
                01 · El hotel
              </p>
              <h2 className="reveal font-serif font-light text-[clamp(34px,4vw,52px)] leading-[1.06] tracking-[-0.02em] text-balance">
                Hotel Estepona Plaza, construido a base de{" "}
                <span className="italic text-[hsl(var(--olive))]">reseñas</span>.
              </h2>
            </div>
            <p className="reveal text-[16px] leading-[1.65] text-muted-foreground max-w-[44ch]">
              Hotel boutique de 36 habitaciones frente a la playa de La Rada, Estepona.
              Premiado consecutivamente por las plataformas que miden lo único que importa:
              lo que el huésped dice al volver a casa.
            </p>
          </div>

          {/* KPI grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-border">
            {[
              { value: "36",   sup: null,  em: false, label: "Habitaciones\n4 categorías" },
              { value: "9.6",  sup: "★",   em: false, label: "Nota media\nBooking · TripAdvisor" },
              { value: "5",    sup: null,  em: false, label: "Premios consecutivos\nBooking · TripAdvisor · Expedia · Orbitz · Core" },
              { value: "Nº 1", sup: null,  em: true,  label: "Hotel del Año\nEspaña · Core Hospitality" },
            ].map(({ value, sup, em, label }) => (
              <div
                key={label}
                className="reveal flex flex-col justify-between gap-8 p-7 border-b border-r border-border last:border-r-0 [&:nth-child(2)]:border-r-0 lg:[&:nth-child(2)]:border-r min-h-[180px]"
              >
                <div className="font-serif font-light text-[clamp(52px,5vw,72px)] leading-none tracking-[-0.025em] text-foreground">
                  {em ? (
                    <span className="italic text-[hsl(var(--olive))]">{value}</span>
                  ) : (
                    <>
                      {value}
                      {sup && (
                        <sup className="text-[0.42em] align-super text-[hsl(var(--gold))] italic font-normal ml-0.5">
                          {sup}
                        </sup>
                      )}
                    </>
                  )}
                </div>
                <p className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-muted-foreground leading-[1.6] whitespace-pre-line">
                  {label}
                </p>
              </div>
            ))}
          </div>

          <div className="reveal mt-8 text-right">
            <a
              href="https://hotelesteponaplaza.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              hotelesteponaplaza.com
              <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.75} />
            </a>
          </div>
        </div>
      </section>

      {/* ── 5. LA PLATAFORMA ─────────────────────────────────── */}
      <section className="px-6 md:px-12 lg:px-20 py-24 md:py-32 bg-secondary/40">
        <div className="max-w-7xl mx-auto">

          <div className="text-center max-w-[680px] mx-auto mb-16">
            <p className="reveal font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-5">
              02 · La plataforma
            </p>
            <h2 className="reveal font-serif font-light text-[clamp(36px,4.5vw,56px)] leading-[1.06] tracking-[-0.02em] text-balance">
              Una sola plataforma.{" "}
              <span className="italic text-[hsl(var(--olive))]">Tres lados.</span>
            </h2>
            <p className="reveal mt-5 text-[17px] leading-[1.65] text-muted-foreground max-w-[54ch] mx-auto">
              Seda une lo que la industria mantiene separado: la app del huésped, el dashboard
              del propietario y la operación diaria — un equipo, una historia.
            </p>
          </div>

          {/* 3-column platform cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLATFORM_NODES.map((node, i) => (
              <article
                key={i}
                className="reveal bg-background border border-border rounded-2xl p-8 flex flex-col gap-5"
              >
                <p className="font-mono text-[10px] tracking-[0.26em] uppercase text-[hsl(var(--gold))]">
                  {node.tag}
                </p>
                <h3 className="font-serif font-medium text-[24px] leading-[1.25] tracking-[-0.01em] text-foreground">
                  {node.title}
                </h3>
                <p className="text-[15px] leading-[1.65] text-muted-foreground flex-1">
                  {node.body}
                </p>
                <span className="self-start inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-secondary/60 font-mono text-[10px] tracking-[0.18em] uppercase text-[hsl(var(--olive))] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--gold))]" />
                  {node.pill}
                </span>
              </article>
            ))}
          </div>

          {/* SEDA centre badge */}
          <div className="reveal mt-8 flex justify-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-[hsl(var(--olive))] text-background rounded-full">
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[hsl(var(--gold))]">SEDA</span>
              <span className="w-px h-4 bg-background/20" />
              <span className="font-serif italic text-[16px] text-background/90">Private Homes</span>
            </div>
          </div>

        </div>
      </section>

      {/* ── 6. RECONOCIMIENTOS ───────────────────────────────── */}
      <section className="px-6 md:px-12 lg:px-20 py-24 md:py-32 bg-background">
        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-16">
            <p className="reveal font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-5">
              03 · Reconocimientos
            </p>
            <h2 className="reveal font-serif font-light text-[clamp(36px,4.5vw,56px)] leading-[1.06] tracking-[-0.02em]">
              La medida de un{" "}
              <span className="italic text-[hsl(var(--olive))]">oficio bien hecho</span>.
            </h2>
            <p className="reveal mt-5 text-[15px] text-muted-foreground max-w-[52ch] mx-auto">
              Cinco premios consecutivos — no por marketing, sino por lo único que las
              plataformas miden: lo que los huéspedes dicen al volver a casa.
            </p>
          </div>

          {/* Award badges */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 max-w-[1000px] mx-auto">
            {AWARDS.map((award) => (
              <a
                key={award.platform}
                href={award.href}
                target="_blank"
                rel="noopener noreferrer"
                className="reveal group flex flex-col items-center text-center p-6 bg-secondary/40 hover:bg-background border border-transparent hover:border-border transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-full aspect-square flex items-center justify-center p-3 mb-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={award.img}
                    alt={award.alt}
                    className="max-w-full max-h-full w-auto h-auto object-contain"
                    loading="lazy"
                  />
                </div>
                <p className="font-serif font-medium text-[15px] text-foreground tracking-[-0.005em] mb-1">
                  {award.platform}
                </p>
                <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted-foreground leading-[1.5]">
                  {award.title}
                </p>
              </a>
            ))}
          </div>

          <p className="reveal text-center mt-10 font-mono text-[11px] tracking-[0.22em] uppercase text-muted-foreground">
            Más en{" "}
            <a
              href="https://hotelesteponaplaza.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[hsl(var(--olive))] border-b border-[hsl(var(--olive))] pb-px hover:text-[hsl(var(--gold))] hover:border-[hsl(var(--gold))] transition-colors"
            >
              hotelesteponaplaza.com
            </a>
          </p>

        </div>
      </section>

      {/* ── 7. CTA ───────────────────────────────────────────── */}
      <section className="px-6 md:px-12 lg:px-20 py-28 md:py-36 bg-[hsl(var(--olive))] text-background text-center">
        <div className="max-w-4xl mx-auto">
          <p className="reveal font-mono text-[11px] tracking-[0.3em] uppercase text-[hsl(var(--gold))] mb-8">
            04 · Hablemos
          </p>
          <h2 className="reveal font-serif font-light text-[clamp(40px,5.2vw,64px)] leading-[1.04] tracking-[-0.022em] max-w-[18ch] mx-auto text-balance">
            ¿Una conversación tranquila,{" "}
            <span className="italic text-[hsl(var(--gold))]">en privado?</span>
          </h2>
          <p className="reveal mt-6 text-[18px] leading-[1.6] text-background/70 max-w-[48ch] mx-auto">
            Cuénteme qué propiedad tiene en mente o qué estancia busca. Le respondo en un
            solo hilo — y le presento al equipo si decide seguir.
          </p>

          <div className="reveal flex flex-wrap gap-4 justify-center mt-12">
            <Link
              href="/contacto?type=owner"
              className="group inline-flex items-center gap-3 px-7 py-4 bg-[hsl(var(--gold))] text-foreground font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-background transition-colors"
            >
              Valorar mi propiedad
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={1.75} />
            </Link>
            <Link
              href="/coleccion"
              className="group inline-flex items-center gap-3 px-7 py-4 border border-background/40 text-background font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-background/10 transition-colors"
            >
              Buscar estancia
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={1.75} />
            </Link>
          </div>

          <div className="reveal mt-14 pt-8 border-t border-background/15 flex flex-wrap justify-center gap-8 font-mono text-[11px] tracking-[0.18em] uppercase text-background/50">
            <a
              href="https://www.linkedin.com/in/angel-molina-119aa352/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[hsl(var(--gold))] transition-colors inline-flex items-center gap-1.5"
            >
              LinkedIn
              <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} />
            </a>
            <a
              href="https://hotelesteponaplaza.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[hsl(var(--gold))] transition-colors inline-flex items-center gap-1.5"
            >
              Hotel Estepona Plaza
              <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} />
            </a>
            <span>Estepona · Costa del Sol</span>
          </div>
        </div>
      </section>

    </main>
  )
}
