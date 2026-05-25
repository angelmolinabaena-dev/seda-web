// PROPIETARIOS / SEDA OS PAGE
function PagePropietarios({ onNav }) {
  return (
    <div>
      {/* HERO with full SEDA OS dashboard overlay */}
      <header style={{ position: "relative", overflow: "hidden", color: "var(--stone)", minHeight: 760, display: "flex", alignItems: "center", paddingTop: 140, paddingBottom: 96 }}>
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <img src={PIC.ownerHero} alt="Residencia al atardecer" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(95deg, rgba(28,27,27,0.85) 0%, rgba(44,78,69,0.6) 45%, rgba(0,0,0,0.3) 100%)" }}></div>
        </div>
        <div className="wrap" style={{ position: "relative", zIndex: 2, display: "grid", gridTemplateColumns: "1fr 1.35fr", gap: 56, alignItems: "center" }}>
          <Reveal>
            <div className="eyebrow" style={{ color: "var(--bronze)" }}>— Propietarios SEDA</div>
            <h1 className="h-display" style={{ marginTop: 18, color: "var(--stone)", fontSize: "clamp(40px,5vw,72px)" }}>Su propiedad,<br/><em>bajo control absoluto.</em></h1>
            <p className="lead" style={{ marginTop: 22, color: "rgba(255,255,255,0.82)", maxWidth: "44ch" }}>
              SEDA OS es la capa de software propia que orquesta reservas, operación, mantenimiento, marketing y liquidaciones. Sin SaaS genéricos. Sin improvisación.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 36, flexWrap: "wrap" }}>
              <MagneticBtn className="btn btn-bronze glow-hover" onClick={() => onNav("contacto")}>Valorar mi propiedad<Icon.arrow className="arrow" width="14" height="14"/></MagneticBtn>
              <MagneticBtn className="btn btn-ghost-light" onClick={() => openExternal(URL_PROPIETARIO)}>Acceso propietarios<ExternalArrow/></MagneticBtn>
            </div>
            <div style={{ marginTop: 32, display: "flex", gap: 22, fontSize: 12, color: "rgba(255,255,255,0.65)" }} className="mono">
              <span style={{ letterSpacing: "0.14em" }}>+24% RevPAR VS MERCADO</span>
              <span style={{ letterSpacing: "0.14em" }}>14 PROPIEDADES EN GESTIÓN</span>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <SedaOSWindow />
          </Reveal>
        </div>
      </header>

      {/* SEDA OS — feature grid */}
      <section style={{ background: "var(--stone)" }}>
        <div className="wrap">
          <Reveal>
            <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto" }}>
              <div className="eyebrow">— Marketing intelligence</div>
              <h2 className="h2" style={{ marginTop: 14 }}>Marketing implacable, <em>narrativa editorial.</em></h2>
              <p className="lead" style={{ marginTop: 18 }}>
                Una ventana transparente a su inversión y un motor de marketing implacable. Información operativa, financiera y legal en tiempo real.
              </p>
            </div>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gridAutoRows: "minmax(180px, auto)", gap: 14, marginTop: 56 }}>
            <Reveal className="" style={{ gridColumn: "span 4", gridRow: "span 2" }}>
              <MIBento full>
                <div className="eyebrow" style={{ color: "var(--olive)" }}>Conversión en ficha</div>
                <h4 style={{ fontFamily: "var(--serif)", fontSize: 64, fontWeight: 300, marginTop: 18, color: "var(--olive)" }}>+<AnimatedNumber to={42}/>%</h4>
                <p className="small" style={{ marginTop: 12, maxWidth: "30ch" }}>Tests A/B continuos en imágenes y textos. Mejora media de listings SEDA frente a baseline del mercado.</p>
                <div style={{ marginTop: 22 }}>
                  <div className="mini-bars">
                    {[20, 28, 24, 32, 38, 35, 42, 48].map((h, i) => (
                      <span key={i} style={{ height: `${h}%` }}></span>
                    ))}
                  </div>
                  <div className="mono" style={{ fontSize: 9.5, color: "var(--muted)", marginTop: 6, letterSpacing: "0.14em" }}>ENE — AGO 2026</div>
                </div>
              </MIBento>
            </Reveal>

            <Reveal style={{ gridColumn: "span 4" }}>
              <MIBento>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Icon.globe width="22" height="22" style={{ color: "var(--olive)" }}/>
                  <span style={{ display: "flex", gap: 4 }}>
                    {["ES", "EN", "DE", "NL"].map(c => <span key={c} style={{ padding: "3px 7px", borderRadius: 999, background: "var(--olive-tint)", color: "var(--olive)", fontSize: 9.5, fontWeight: 700, letterSpacing: "0.14em" }}>{c}</span>)}
                  </span>
                </div>
                <h4 style={{ fontFamily: "var(--serif)", fontSize: 22, marginTop: 16 }}>Campañas multilingües</h4>
                <p className="small" style={{ marginTop: 8 }}>Estrategias adaptadas a los mercados clave de Costa del Sol.</p>
              </MIBento>
            </Reveal>

            <Reveal style={{ gridColumn: "span 4" }}>
              <MIBento>
                <Icon.doc width="22" height="22" style={{ color: "var(--olive)" }}/>
                <h4 style={{ fontFamily: "var(--serif)", fontSize: 22, marginTop: 16 }}>Descripciones premium</h4>
                <p className="small" style={{ marginTop: 8 }}>Copy editorial que destaca lo único de su propiedad.</p>
                <div style={{ marginTop: 16, padding: 12, background: "var(--stone-2)", borderRadius: 10, fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.4 }}>
                  «Un refugio donde la piedra caliza se encuentra con el mar de Alborán…»
                </div>
              </MIBento>
            </Reveal>

            <Reveal style={{ gridColumn: "span 4" }}>
              <MIBento>
                <Icon.chart width="22" height="22" style={{ color: "var(--olive)" }}/>
                <h4 style={{ fontFamily: "var(--serif)", fontSize: 22, marginTop: 16 }}>Análisis competencia</h4>
                <p className="small" style={{ marginTop: 8 }}>Monitoreo del compset Costa del Sol.</p>
                <div style={{ marginTop: 14 }}>
                  <CompsetSpark/>
                </div>
              </MIBento>
            </Reveal>

            <Reveal style={{ gridColumn: "span 4" }}>
              <MIBento dark>
                <Icon.euro width="22" height="22" style={{ color: "var(--bronze)" }}/>
                <h4 style={{ fontFamily: "var(--serif)", fontSize: 22, marginTop: 16, color: "#fff" }}>Pricing dinámico</h4>
                <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.62)", marginTop: 8 }}>Demanda, temporalidad y eventos locales.</p>
                <div style={{ marginTop: 14, padding: "10px 12px", background: "rgba(254,182,74,0.1)", border: "1px solid rgba(254,182,74,0.3)", borderRadius: 8 }}>
                  <div className="mono" style={{ fontSize: 9, color: "var(--bronze)", letterSpacing: "0.18em" }}>SUGERIDO HOY</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
                    <span style={{ fontFamily: "var(--serif)", fontSize: 22, color: "#fff" }}>€2.890</span>
                    <span style={{ fontSize: 11, color: "#5fbf8e" }}>↑ 12% vs baseline</span>
                  </div>
                </div>
              </MIBento>
            </Reveal>

            <Reveal style={{ gridColumn: "span 4" }}>
              <MIBento>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Icon.star width="22" height="22" style={{ color: "var(--olive)" }}/>
                  <div style={{ display: "flex", gap: 2 }}>
                    {Array.from({length: 5}).map((_, i) => <Icon.star key={i} width="13" height="13" style={{ color: "var(--bronze)" }}/>)}
                  </div>
                </div>
                <h4 style={{ fontFamily: "var(--serif)", fontSize: 22, marginTop: 16 }}>Reputación premium</h4>
                <p className="small" style={{ marginTop: 8 }}>Gestión impecable de reseñas para mantener el estatus 5★.</p>
              </MIBento>
            </Reveal>

            <Reveal style={{ gridColumn: "span 8" }}>
              <MIBento>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Icon.search width="22" height="22" style={{ color: "var(--olive)" }}/>
                    <h4 style={{ fontFamily: "var(--serif)", fontSize: 22 }}>SEO de alta intención</h4>
                  </div>
                  <span className="mono" style={{ fontSize: 10, letterSpacing: "0.16em", color: "var(--muted)" }}>POSICIÓN MEDIA</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                  {[["Villa de lujo Marbella", "#2"], ["Alquiler Costa del Sol", "#4"], ["Villa Puerto Banús", "#1"], ["Apartamento Torremolinos", "#3"]].map(([k, p], i) => (
                    <div key={i} style={{ padding: 12, background: "var(--stone-2)", borderRadius: 10 }}>
                      <div style={{ fontSize: 11, color: "var(--ink-2)" }}>{k}</div>
                      <div style={{ fontFamily: "var(--serif)", fontSize: 24, color: "var(--olive)", marginTop: 4 }}>{p}</div>
                    </div>
                  ))}
                </div>
              </MIBento>
            </Reveal>

            <Reveal style={{ gridColumn: "span 4" }}>
              <MIBento>
                <Icon.user width="22" height="22" style={{ color: "var(--olive)" }}/>
                <h4 style={{ fontFamily: "var(--serif)", fontSize: 22, marginTop: 16 }}>Non-Resident</h4>
                <p className="small" style={{ marginTop: 8 }}>Contenido específico para huéspedes e inversores internacionales.</p>
              </MIBento>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Trust Center & Compliance */}
      <section style={{ background: "var(--stone-2)" }}>
        <div className="wrap">
          <Reveal>
            <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", border: "1px solid var(--olive)", color: "var(--olive)", display: "grid", placeItems: "center", margin: "0 auto 18px" }}><Icon.shield width="24" height="24"/></div>
              <div className="eyebrow">— Cumplimiento</div>
              <h2 className="h2" style={{ marginTop: 14 }}><em>Centro de confianza</em> & Cumplimiento</h2>
              <p className="lead" style={{ marginTop: 18 }}>
                Tranquilidad total. Automatizamos y gestionamos todo el marco legal y fiscal aplicable a su propiedad, operando siempre bajo normativa.
              </p>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 64 }}>
            {[
              { i: <Icon.doc width="22" height="22"/>, t: "RD 633/2021", b: "Registro automatizado de viajeros conforme a normativa." },
              { i: <Icon.shield width="22" height="22"/>, t: "SES Hospedajes", b: "Conexión directa telemática con autoridades policiales." },
              { i: <Icon.list width="22" height="22"/>, t: "Modelo 179", b: "Declaración informativa trimestral de cesión automatizada." },
              { i: <Icon.building width="22" height="22"/>, t: "Liquidación IRNR", b: "Soporte fiscal para no residentes (Impuesto Renta)." },
              { i: <Icon.shield width="22" height="22"/>, t: "Cumplimiento RGPD", b: "Tratamiento legal de datos personales de huéspedes." },
              { i: <Icon.key width="22" height="22"/>, t: "Control de acceso", b: "Registro digital y revocación remota de accesos." },
              { i: <Icon.chart width="22" height="22"/>, t: "Trazabilidad total", b: "Log inmutable de todas las acciones e incidencias." },
              { i: <Icon.user width="22" height="22"/>, t: "Docs huéspedes", b: "Firma digital de contratos y normas de la casa." },
            ].map((c, i) => (
              <Reveal key={i} delay={i * 50}>
                <ComplianceCard {...c} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SEDA OS — Module overview (proprietary product feel) */}
      <section style={{ background: "var(--ink)", color: "#fff" }}>
        <div className="wrap">
          <Reveal>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24, marginBottom: 48 }}>
              <div>
                <div className="eyebrow" style={{ color: "var(--bronze)" }}>— Arquitectura SEDA OS</div>
                <h2 className="h2" style={{ marginTop: 14, color: "#fff" }}>Seis módulos. <em style={{ color: "var(--bronze)" }}>Un solo sistema.</em></h2>
              </div>
              <span className="mono" style={{ fontSize: 11, letterSpacing: "0.2em", color: "rgba(255,255,255,0.55)", textTransform: "uppercase" }}>v 4.2 · Build 2026.10</span>
            </div>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {[
              { k: "01", n: "Reservas", l: "Motor de reservas", c: "var(--bronze)", b: "Motor propio multicanal con sincronización en tiempo real, anti-overbooking y políticas dinámicas." },
              { k: "02", n: "Huéspedes", l: "CRM Huésped", c: "var(--bronze)", b: "Perfil unificado del huésped, comunicación ES·EN·DE·FR y secuencia de pre-llegada automatizada." },
              { k: "03", n: "Operación", l: "Consola operativa", c: "var(--bronze)", b: "Asignación de limpieza, mantenimiento, jardinería y rutas del equipo local en una sola consola." },
              { k: "04", n: "Marketing", l: "Distribución", c: "var(--bronze)", b: "Gestión de OTA, SEO, pricing dinámico y campañas internacionales coordinadas desde un panel." },
              { k: "05", n: "Finanzas", l: "Liquidaciones", c: "var(--bronze)", b: "Liquidaciones automatizadas, conciliación bancaria, IRNR y reporting fiscal trimestral." },
              { k: "06", n: "Propietario", l: "Portal Propietario", c: "var(--bronze)", b: "Su vista de propietario: ocupación, ingresos, calendario, documentos y mensajería SEDA." },
            ].map((m, i) => (
              <Reveal key={i} delay={i * 70}>
                <ModuleCard {...m} />
              </Reveal>
            ))}
          </div>

          <div style={{ marginTop: 48, padding: 32, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24 }}>
            {[
              ["Disponibilidad 2026", <><AnimatedNumber to={99.98} decimals={2}/>%</>],
              ["Tiempo de respuesta", <>&lt; <AnimatedNumber to={2}/> min</>],
              ["Reservas procesadas", <AnimatedNumber to={12480}/>],
              ["Idiomas soportados", "ES · EN · DE · FR"],
            ].map(([k, v], i) => (
              <div key={i}>
                <div className="mono" style={{ fontSize: 10.5, letterSpacing: "0.18em", color: "rgba(255,255,255,0.55)", textTransform: "uppercase" }}>{k}</div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 28, color: "#fff", marginTop: 6 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projection / Calculator */}
      <section style={{ background: "var(--stone)" }}>
        <div className="wrap">
          <Reveal>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24, marginBottom: 48 }}>
              <div style={{ maxWidth: 560 }}>
                <div className="eyebrow">— Simulador de ingresos</div>
                <h2 className="h2" style={{ marginTop: 14 }}>Antes de gestionar su propiedad, <em>calculemos su potencial.</em></h2>
                <p className="lead" style={{ marginTop: 16 }}>Ajuste los parámetros y descubra el impacto de SEDA OS en su rentabilidad anual.</p>
              </div>
            </div>
          </Reveal>
          <Projection onNav={onNav}/>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: "var(--stone-2)" }}>
        <div className="wrap" style={{ maxWidth: 980 }}>
          <Reveal>
            <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 48px" }}>
              <div className="eyebrow">— Preguntas frecuentes</div>
              <h2 className="h2" style={{ marginTop: 14 }}>Lo que <em>quiere saber</em> antes de hablar.</h2>
            </div>
          </Reveal>
          <Reveal>
            <FAQList items={[
              { q: "¿Cuánto cobra SEDA por gestionar mi propiedad?", a: "Aplicamos una comisión variable sobre los ingresos brutos, que detalla cada liquidación mensual en SEDA OS. No hay cuota fija, ni costes de alta, ni penalizaciones por baja. La comisión exacta depende del régimen (gestión integral, marketing-only, o concierge premium) y se acuerda en la propuesta inicial." },
              { q: "¿Quién atiende a los huéspedes y cuándo?", a: "Un equipo SEDA en plantilla local en Costa del Sol, disponible 24/7 por la Guest App. Las consultas habituales se prefiltran con Ask SEDA (concierge IA) y se escalan a un conserje humano según el contexto. Tiempo medio de respuesta: menos de 2 minutos." },
              { q: "¿Qué pasa con la fiscalidad de mi propiedad?", a: "SEDA OS automatiza la declaración del Modelo 179 (cesión de vivienda con fines turísticos) cada trimestre, conecta con SES.Hospedajes y mantiene el cumplimiento del RD 933/2021. Para no residentes (IRNR), nuestro equipo fiscal genera la documentación y le soporta en la presentación." },
              { q: "¿Tengo que estar en España para empezar?", a: "No. Todo el proceso (valoración, contrato, alta, fotografía, listado y operación) se firma digitalmente. Más del 60% de los propietarios SEDA son no residentes. La firma de contratos se realiza con identificación digital y sello cualificado." },
              { q: "¿Puedo usar mi propiedad cuando quiera?", a: "Sí. Bloquea las fechas en SEDA OS o en el portal de propietarios. El equipo prepara la casa para su llegada como una estancia más, sin coste adicional (sólo limpieza y reposición a tarifa interna)." },
              { q: "¿Cómo elige SEDA qué propiedades acepta?", a: "Valoramos arquitectura, ubicación, privacidad, capacidad operativa local y compatibilidad con el estándar SEDA. No trabajamos con todas las propiedades. El análisis es confidencial y sin compromiso." },
              { q: "¿Qué pasa si quiero rescindir el acuerdo?", a: "Preaviso de 60 días, sin penalizaciones. Las reservas confirmadas se respetan hasta la fecha de salida. Los datos operativos, fotos profesionales y reseñas son del propietario, exportables en cualquier momento." },
            ]}/>
          </Reveal>
        </div>
      </section>

      {/* Final CTA — proprietary band */}
      <section style={{ background: "var(--olive)", color: "var(--stone)", paddingTop: 120, paddingBottom: 120 }}>
        <div className="wrap" style={{ textAlign: "center" }}>
          <Reveal>
            <div className="eyebrow" style={{ color: "var(--bronze)" }}>— Próximo paso</div>
            <h2 className="h-display" style={{ marginTop: 18, color: "var(--stone)", maxWidth: "16ch", margin: "18px auto 0", fontSize: "clamp(40px,5vw,72px)" }}>
              Hablemos de su <em style={{ color: "var(--bronze)" }}>propiedad.</em>
            </h2>
            <p className="lead" style={{ marginTop: 22, color: "rgba(255,255,255,0.78)", maxWidth: 560, margin: "22px auto 0" }}>
              Análisis confidencial de potencial en 48 horas. Sin compromiso. Sin coste.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 40, justifyContent: "center", flexWrap: "wrap" }}>
              <MagneticBtn className="btn btn-bronze glow-hover" onClick={() => onNav("contacto")}>Valorar mi propiedad<Icon.arrow className="arrow" width="14" height="14"/></MagneticBtn>
              <MagneticBtn className="btn btn-ghost-light" onClick={() => openExternal(URL_PROPIETARIO)}>Acceso propietarios<ExternalArrow/></MagneticBtn>
            </div>
            <div style={{ marginTop: 64, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.18)", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24, textAlign: "center", maxWidth: 880, margin: "64px auto 0" }}>
              {[
                [<><AnimatedNumber to={48} suffix="h"/></>, "Valoración"],
                ["0€", "Sin coste inicial"],
                [<>+<AnimatedNumber to={24} suffix="%"/></>, "RevPAR vs mercado"],
                [<><AnimatedNumber to={100} suffix="%"/></>, "Cumplimiento legal"],
              ].map(([v, k], i) => (
                <div key={i}>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 36, color: "var(--bronze)" }}>{v}</div>
                  <div className="mono" style={{ fontSize: 10.5, letterSpacing: "0.18em", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", marginTop: 6 }}>{k}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ i, t, b }) {
  return (
    <div className="surface" style={{ padding: 26, height: "100%", transition: "all .35s", cursor: "default" }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = "var(--olive)"; e.currentTarget.style.boxShadow = "0 20px 40px rgba(68,102,92,0.08)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = ""; e.currentTarget.style.boxShadow = ""; }}>
      <div style={{ color: "var(--olive)", marginBottom: 18 }}>{i}</div>
      <h4 style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 400 }}>{t}</h4>
      <p className="small" style={{ marginTop: 8, color: "var(--muted)" }}>{b}</p>
    </div>
  );
}
function ComplianceCard({ i, t, b }) {
  return (
    <div style={{ background: "#fff", border: "1px solid var(--line-soft)", borderRadius: 14, padding: 26, height: "100%", textAlign: "center" }}>
      <div style={{ color: "var(--olive)", marginBottom: 16, display: "grid", placeItems: "center" }}>{i}</div>
      <h4 className="mono" style={{ fontSize: 11.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ink)", fontWeight: 700 }}>{t}</h4>
      <p className="small" style={{ marginTop: 8, color: "var(--muted)" }}>{b}</p>
    </div>
  );
}

function ModuleCard({ k, n, l, c, b }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 28, transition: "border-color .3s", height: "100%" }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--bronze)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: "0.2em", color: c }}>MÓDULO {k}</div>
        <div className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>{l}</div>
      </div>
      <h4 style={{ fontFamily: "var(--serif)", fontSize: 30, fontWeight: 400, marginTop: 16, color: "#fff" }}>{n}</h4>
      <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.65)", marginTop: 12, lineHeight: 1.55 }}>{b}</p>
    </div>
  );
}

/* ---------- SEDA OS Window (the full proprietary product) ---------- */
function SedaOSWindow() {
  const [tab, setTab] = useState("Resumen");
  const tabs = ["Resumen", "Reservas", "Finanzas", "Operación", "Reseñas", "Propietario"];
  return (
    <div style={{ background: "#fcf9f8", color: "var(--ink)", borderRadius: 18, overflow: "hidden", boxShadow: "0 60px 120px -30px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08)" }}>
      {/* Title bar */}
      <div style={{ background: "#1c1b1b", color: "rgba(255,255,255,0.85)", padding: "12px 18px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", gap: 6 }}>
          <span style={{ width: 11, height: 11, background: "#ff5f57", borderRadius: "50%" }}></span>
          <span style={{ width: 11, height: 11, background: "#febc2e", borderRadius: "50%" }}></span>
          <span style={{ width: 11, height: 11, background: "#28c840", borderRadius: "50%" }}></span>
        </div>
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
          <span style={{ width: 18, height: 18, borderRadius: 5, background: "var(--olive)", color: "var(--bronze)", display: "grid", placeItems: "center", fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 11, fontWeight: 500 }}>S</span>
          <span className="mono" style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase" }}>SEDA OS · EN DIRECTO</span>
          <span style={{ fontSize: 11, opacity: 0.55 }}>· app.sedaprivatehomes.com/os</span>
        </div>
        <span className="mono" style={{ fontSize: 10.5, color: "rgba(255,255,255,0.55)" }}>v4.2.1</span>
      </div>

      {/* Tabs */}
      <div style={{ background: "#fff", borderBottom: "1px solid var(--line-soft)", display: "flex", alignItems: "center", padding: "0 18px" }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "14px 16px", fontSize: 11.5, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600,
            color: tab === t ? "var(--olive)" : "var(--muted)", borderBottom: "2px solid", borderColor: tab === t ? "var(--olive)" : "transparent",
            marginBottom: -1, transition: "all .2s"
          }}>{t}</button>
        ))}
        <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "#3a9a64", fontWeight: 600 }}>
          <span style={{ width: 7, height: 7, background: "#3a9a64", borderRadius: "50%" }}></span>OPERATIVO
        </span>
      </div>

      {/* Content */}
      <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
        {/* KPI grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          <KPI label="Ingresos previstos" value="€45.000" delta="+12% vs prev." up sparkData={[3,5,4,6,5,7,8,7,9]}/>
          <KPI label="Ocupación" value="78%" delta="+6 pts" up sparkData={[5,6,7,7,8,7,8,9,8]}/>
          <KPI label="Llegadas hoy" value="3" delta="2 confirmadas" icon={<Icon.user width="14" height="14"/>} avatars/>
          <KPI label="Mantenimiento" value="1" delta="Climatización piscina" warn/>
        </div>

        {/* Second row */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 10 }}>
          <div style={{ background: "#fff", border: "1px solid var(--line-soft)", borderRadius: 12, padding: 16 }}>
            <div className="mono" style={{ fontSize: 9.5, letterSpacing: "0.18em", color: "var(--muted)", textTransform: "uppercase" }}>Liquidación próxima</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 6 }}>
              <div style={{ fontFamily: "var(--serif)", fontSize: 28 }}>€ 8.420</div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--olive)" }}><Icon.building width="13" height="13"/>SEPA · 01 Nov</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 12 }}>
              {[["Ingresos", "€ 10.890"], ["Comisión", "− € 1.960"], ["Servicios", "− € 510"]].map(([k, v], i) => (
                <div key={i} style={{ padding: "8px 10px", background: "var(--stone-2)", borderRadius: 8 }}>
                  <div style={{ fontSize: 9.5, color: "var(--muted)" }}>{k}</div>
                  <div className="mono" style={{ fontSize: 12, fontWeight: 600, marginTop: 2 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: "var(--olive)", color: "var(--stone)", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div className="mono" style={{ fontSize: 9.5, letterSpacing: "0.18em", color: "var(--bronze)", textTransform: "uppercase" }}>Guest App Status</div>
              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                <Row k="App Huésped" v="Activa" badge/>
                <Row k="Nuki Smart Lock" v="En línea" badge/>
                <Row k="Climatización" v="Auto · 22°" badge="warn"/>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <div className="mono" style={{ fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.6)" }}>SESIÓN ACTUAL</div>
              <div style={{ fontSize: 11.5, marginTop: 2, color: "rgba(255,255,255,0.85)" }}>Mr. Andersen · 4 huéspedes · check-in 16:00</div>
            </div>
          </div>
        </div>

        {/* Reservas timeline */}
        <div style={{ background: "#fff", border: "1px solid var(--line-soft)", borderRadius: 12, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="mono" style={{ fontSize: 9.5, letterSpacing: "0.18em", color: "var(--muted)", textTransform: "uppercase" }}>Timeline de reservas (14 días)</div>
            <button className="btn-text" style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase" }}>Ver calendario completo<Icon.arrow width="11" height="11"/></button>
          </div>
          <div style={{ marginTop: 14, position: "relative" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(14, 1fr)", gap: 4 }}>
              {Array.from({ length: 14 }).map((_, i) => {
                const a = i >= 0 && i <= 5;
                const b = i >= 7 && i <= 9;
                const c = i === 12;
                const bg = a ? "var(--olive)" : b ? "var(--bronze)" : c ? "var(--ink-2)" : "var(--stone-2)";
                return <div key={i} style={{ height: 36, borderRadius: 6, background: bg, display: "grid", placeItems: "center", color: a || c ? "var(--stone)" : "var(--ink)", fontSize: 10, fontWeight: 600 }}>
                  {i + 1}
                </div>;
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9.5, color: "var(--muted)", marginTop: 6, fontFamily: "var(--mono)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              <span>Hoy</span><span>+7 días</span><span>+14 días</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value, delta, up, warn, icon, avatars, sparkData }) {
  return (
    <div style={{ background: "#fff", border: "1px solid var(--line-soft)", borderRadius: 12, padding: 14 }}>
      <div className="mono" style={{ fontSize: 9, letterSpacing: "0.18em", color: "var(--muted)", textTransform: "uppercase" }}>{label}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 6 }}>
        <div style={{ fontFamily: "var(--serif)", fontSize: 24, fontWeight: 400 }}>{value}</div>
        {sparkData && <Sparkline data={sparkData}/>}
        {avatars && (
          <div style={{ display: "flex" }}>
            {["#1F2F2B", "#A77C45", "#151515"].map((c, i) => (
              <div key={i} style={{ width: 18, height: 18, borderRadius: "50%", background: c, marginLeft: i ? -6 : 0, border: "1.5px solid #fff" }}></div>
            ))}
          </div>
        )}
        {warn && <Icon.bell width="16" height="16" style={{ color: "var(--bronze-deep)" }}/>}
      </div>
      <div style={{ fontSize: 10.5, color: up ? "#3a9a64" : warn ? "var(--bronze-deep)" : "var(--muted)", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
        {up && <span style={{ display: "inline-block", transform: "rotate(-45deg)" }}>→</span>}
        {delta}
      </div>
    </div>
  );
}

function Sparkline({ data, color = "var(--olive)" }) {
  const max = Math.max(...data); const min = Math.min(...data);
  const w = 64, h = 22;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / (max - min || 1)) * h}`).join(" ");
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function Row({ k, v, badge }) {
  const badgeColor = badge === "warn" ? "var(--bronze)" : "#5fbf8e";
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11.5 }}>
      <span style={{ color: "rgba(255,255,255,0.75)" }}>{k}</span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#fff", fontWeight: 600 }}>
        <span style={{ width: 6, height: 6, background: badgeColor, borderRadius: "50%" }}></span>{v}
      </span>
    </div>
  );
}

/* ---------- Projection / revenue calculator ---------- */
function Projection({ onNav }) {
  const [beds, setBeds] = useState(4);
  const [occ, setOcc] = useState(72);
  const [adr, setAdr] = useState(1450);
  const [loc, setLoc] = useState("Marbella Golden Mile");
  const [type, setType] = useState("Villa independiente");
  const [avail, setAvail] = useState("Todo el año");

  const annualGross = Math.round(occ / 100 * 365 * adr);
  const annualNet = Math.round(annualGross * 0.75);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      <div className="surface" style={{ padding: 32, borderRadius: 18 }}>
        <div className="eyebrow">Configurar simulación</div>
        <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <Select label="Ubicación premium" value={loc} onChange={setLoc} options={["Marbella Golden Mile","Puerto Banús","Estepona","Casares","Benahavís","Torremolinos"]}/>
          <Select label="Tipología" value={type} onChange={setType} options={["Villa independiente","Ático","Apartamento","Cortijo / Finca"]}/>
          <Counter label="Dormitorios" value={beds} onChange={setBeds} min={1} max={10}/>
          <Select label="Disponibilidad" value={avail} onChange={setAvail} options={["Todo el año","Temporada alta","Solo verano","A medida"]}/>
        </div>

        <div style={{ marginTop: 24 }}>
          <Slider label="Ocupación esperada" value={occ} min={20} max={95} suffix="%" onChange={setOcc}
            tickLabels={[["Conservador (20%)", 20], ["Óptimo (95%)", 95]]}/>
          <Slider label="ADR (tarifa media diaria)" value={adr} min={300} max={5000} step={50} prefix="€"  onChange={setAdr}
            tickLabels={[["€300", 300], ["€5.000+", 5000]]}/>
        </div>

        <button className="btn-text" style={{ marginTop: 28, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700 }} onClick={() => onNav && onNav("contacto")}>
          Solicitar valoración exacta<Icon.arrow width="12" height="12"/>
        </button>
      </div>

      <div className="surface" style={{ padding: 32, borderRadius: 18, background: "var(--stone-2)", border: "1px solid var(--line)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 32, height: 32, borderRadius: 8, background: "var(--olive)", color: "var(--bronze)", display: "grid", placeItems: "center" }}><Icon.chart width="16" height="16"/></span>
            <span style={{ fontFamily: "var(--serif)", fontSize: 22 }}>Proyección SEDA OS</span>
          </div>
          <button className="btn-text" style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}><Icon.doc width="13" height="13"/></button>
        </div>

        <div style={{ marginTop: 28 }}>
          <div className="mono" style={{ fontSize: 10.5, letterSpacing: "0.18em", color: "var(--muted)", textTransform: "uppercase" }}>Ingresos brutos anuales</div>
          <div style={{ fontFamily: "var(--serif)", fontSize: 56, marginTop: 6, lineHeight: 1, fontWeight: 300 }}>€{annualGross.toLocaleString("es")}</div>
        </div>

        <div style={{ marginTop: 28 }}>
          <div className="mono" style={{ fontSize: 10.5, letterSpacing: "0.18em", color: "var(--muted)", textTransform: "uppercase" }}>Neto para el propietario</div>
          <div style={{ fontFamily: "var(--serif)", fontSize: 56, marginTop: 6, lineHeight: 1, fontWeight: 300, color: "var(--olive)" }}>€{annualNet.toLocaleString("es")}</div>
        </div>

        <div style={{ marginTop: 32, padding: 18, background: "var(--olive)", color: "var(--stone)", borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: "var(--bronze)", textTransform: "uppercase" }}>Mejora vs mercado</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 28, marginTop: 2 }}>+24% RevPAR</div>
          </div>
          <Sparkline data={[3,4,4,5,6,6,8,9,11]} color="var(--bronze)"/>
        </div>

        <div className="small" style={{ marginTop: 16, color: "var(--muted)" }}>
          ⓘ Estimaciones basadas en compset histórico Costa del Sol 2023–2025 y modelo SEDA OS. Sujeto a valoración profesional confidencial.
        </div>
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step = 1, prefix, suffix, onChange, tickLabels = [] }) {
  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div className="mono" style={{ fontSize: 10.5, letterSpacing: "0.18em", color: "var(--muted)", textTransform: "uppercase" }}>{label}</div>
        <div style={{ fontFamily: "var(--serif)", fontSize: 22 }}>{prefix}{Number(value).toLocaleString("es")}{suffix}</div>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", marginTop: 8, accentColor: "var(--olive)" }}/>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "var(--muted)", marginTop: 4 }}>
        {tickLabels.map(([l, v]) => <span key={v}>{l}</span>)}
      </div>
    </div>
  );
}

function Counter({ label, value, onChange, min = 0, max = 20 }) {
  return (
    <div>
      <div className="mono" style={{ fontSize: 10.5, letterSpacing: "0.18em", color: "var(--muted)", textTransform: "uppercase" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid var(--line)", borderRadius: 10, padding: "8px 12px", marginTop: 6 }}>
        <button onClick={() => onChange(Math.max(min, value - 1))} style={{ color: "var(--olive)" }}><Icon.minus width="16" height="16"/></button>
        <span style={{ fontFamily: "var(--serif)", fontSize: 20 }}>{value}</span>
        <button onClick={() => onChange(Math.min(max, value + 1))} style={{ color: "var(--olive)" }}><Icon.plus width="16" height="16"/></button>
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <div className="mono" style={{ fontSize: 10.5, letterSpacing: "0.18em", color: "var(--muted)", textTransform: "uppercase" }}>{label}</div>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{
        width: "100%", border: "1px solid var(--line)", borderRadius: 10, padding: "10px 12px", marginTop: 6, fontSize: 13.5,
        background: "#fff", color: "var(--ink)", fontFamily: "var(--sans)", appearance: "none",
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%2344665c' stroke-width='1.4'/%3E%3C/svg%3E\")",
        backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center"
      }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

/* ---------- MARKETING INTELLIGENCE BENTO HELPERS ---------- */
function MIBento({ children, dark, full }) {
  return (
    <div className="tilt" style={{
      background: dark ? "var(--ink)" : "#fff",
      color: dark ? "#fff" : "var(--ink)",
      border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid var(--line-soft)",
      borderRadius: 18, padding: 26, height: "100%", transition: "border-color .3s, transform .4s, box-shadow .4s",
      minHeight: full ? 400 : 180,
    }}>
      {children}
    </div>
  );
}

function CompsetSpark() {
  // 3 lines: SEDA, mercado, compset
  const W = 220, H = 56;
  const pts = (arr) => arr.map((v, i) => `${(i/(arr.length-1))*W},${H - v}`).join(" ");
  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ overflow: "visible" }}>
      <polyline points={pts([20, 24, 28, 32, 38, 42, 48, 52])} fill="none" stroke="var(--olive)" strokeWidth="2"/>
      <polyline points={pts([24, 26, 28, 30, 32, 34, 36, 38])} fill="none" stroke="var(--bronze)" strokeWidth="1.5" strokeDasharray="3 3"/>
      <polyline points={pts([28, 30, 28, 32, 30, 34, 32, 34])} fill="none" stroke="var(--muted)" strokeWidth="1" opacity="0.5"/>
      <g fontFamily="JetBrains Mono, monospace" fontSize="8" letterSpacing="1">
        <text x="0" y={H+8} fill="var(--muted)">ENE</text>
        <text x={W-20} y={H+8} fill="var(--muted)">AGO</text>
      </g>
    </svg>
  );
}

Object.assign(window, { PagePropietarios, MIBento, CompsetSpark });