import {
  CalendarRange,
  TrendingUp,
  Star,
  BarChart3,
  LayoutGrid,
  MessagesSquare,
} from "lucide-react";

const beneficios = [
  {
    icon: CalendarRange,
    titulo: "Calendario unificado",
    descripcion:
      "Reservas de Booking, Airbnb, Vrbo y directas en una sola vista.",
  },
  {
    icon: TrendingUp,
    titulo: "Previsión de ingresos",
    descripcion:
      "Forecast de temporada, tarifas dinámicas y proyección anual.",
  },
  {
    icon: Star,
    titulo: "Reseñas centralizadas",
    descripcion:
      "Opiniones, valoraciones y respuestas de todas las plataformas.",
  },
  {
    icon: BarChart3,
    titulo: "Análisis de ocupación",
    descripcion:
      "Tasa de ocupación, ADR, RevPAR y comparativa entre temporadas.",
  },
  {
    icon: LayoutGrid,
    titulo: "Multi-villa en un panel",
    descripcion:
      "Gestiona una o varias propiedades desde la misma cuenta.",
  },
  {
    icon: MessagesSquare,
    titulo: "Comunicación directa",
    descripcion:
      "Canal abierto con tu gestor y trazabilidad de cada solicitud.",
  },
];

export default function BeneficiosPropietarios() {
  return (
    <section className="bg-[#FAF7F3] py-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="max-w-2xl mb-16">
          <p className="text-xs uppercase tracking-[0.2em] text-seda-gold mb-4">
            Para propietarios
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-seda-text leading-tight">
            Todo lo que necesitas saber
            <br />
            <em className="italic">sin tener que preguntar.</em>
          </h2>
          <p className="mt-6 text-seda-text/70 text-lg leading-relaxed">
            SEDA OS reúne calendario, ingresos, reseñas y comunicación en un
            solo portal. Una visión completa de tu villa, en tiempo real, desde
            cualquier dispositivo.
          </p>
        </div>

        {/* Grid de beneficios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {beneficios.map(({ icon: Icon, titulo, descripcion }) => (
            <article
              key={titulo}
              className="group bg-white rounded-2xl p-8 border border-[#EADED4]/60 transition-all duration-300 hover:border-seda-gold/40 hover:-translate-y-0.5"
              style={{ boxShadow: "0 40px 80px -20px rgba(44,44,42,0.05)" }}
            >
              <div className="w-12 h-12 rounded-xl bg-seda-gold-light flex items-center justify-center mb-6 transition-colors group-hover:bg-seda-gold/15">
                <Icon className="w-5 h-5 text-seda-gold" strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-xl text-seda-text mb-2">
                {titulo}
              </h3>
              <p className="text-sm text-seda-text/60 leading-relaxed">
                {descripcion}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
