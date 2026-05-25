// ECOSISTEMA SEDA OS — system architecture page (distinct from Propietarios conversion page)

function PageEcosistema({ onNav }) {
  return (
    <div>
      {/* HERO */}
      <header style={{ position: "relative", minHeight: "92vh", overflow: "hidden", display: "flex", alignItems: "center", paddingTop: 140, paddingBottom: 80, color: "#fff" }}>
        <div style={{ position: "absolute", inset: 0, zIndex: 0, background: "linear-gradient(180deg, #1F2F2B 0%, #151515 100%)" }}>
          {/* subtle grid pattern overlay */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.07 }} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="eco-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M60 0H0V60" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#eco-grid)"/>
          </svg>
          {/* gold halo */}
          <div style={{ position: "absolute", right: "-10%", top: "20%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(254,182,74,0.25), transparent 60%)", filter: "blur(40px)" }}></div>
        </div>

        <div className="wrap" style={{ position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 56, alignItems: "center" }}>
          <Reveal>
            <div className="eyebrow" style={{ color: "var(--bronze)" }}>— Ecosistema</div>
            <KineticHeadline as="h1" className="h-display" text="Tecnología invisible. <em>Hospitalidad real.</em>" style={{ marginTop: 18, color: "#fff", fontSize: "clamp(48px, 6vw, 88px)" }}/>
            <p className="lead" style={{ marginTop: 26, color: "rgba(255,255,255,0.78)", maxWidth: "52ch" }}>
              SEDA conecta huéspedes, propietarios y operaciones en un ecosistema digital donde Guest App, SEDA OS e inteligencia operativa trabajan para que todo parezca sencillo.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 36, flexWrap: "wrap" }}>
              <MagneticBtn className="btn btn-bronze glow-hover" onClick={() => onNav("guestapp")}>Ver Guest App<Icon.arrow className="arrow" width="14" height="14"/></MagneticBtn>
              <MagneticBtn className="btn btn-ghost-light" onClick={() => onNav("propietarios")}>Soy propietario<Icon.arrow className="arrow" width="14" height="14"/></MagneticBtn>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <EcosystemDiagram/>
          </Reveal>
        </div>
      </header>

      {/* 1 · UN SISTEMA, DOS EXPERIENCIAS */}
      <section style={{ background: "var(--stone)" }}>
        <div className="wrap">
          <Reveal>
            <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto" }}>
              <div className="eyebrow">— 01 · Arquitectura</div>
              <h2 className="h2" style={{ marginTop: 14 }}>Un sistema, <em>dos experiencias.</em></h2>
              <p className="lead" style={{ marginTop: 18 }}>El mismo sistema operativo presenta dos caras: una privada para huéspedes, otra estratégica para propietarios. Conectadas en tiempo real.</p>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 64 }}>
            <Reveal>
              <SystemFace
                tag="Para huéspedes"
                title={<>Guest App</>}
                body="Apertura, código de acceso, conserje y experiencias locales. Una sola interfaz nativa."
                modules={["Arrival Guide", "Ask SEDA", "Discover", "Mi estancia", "Concierge IA"]}
                accent="gold"
                cta="Explorar Guest App"
                onClick={() => onNav("guestapp")}
                external={URL_HUESPED}
              />
            </Reveal>
            <Reveal delay={120}>
              <SystemFace
                dark
                tag="Para propietarios"
                title={<>SEDA OS</>}
                body="Ocupación, ingresos, mantenimiento, marketing y liquidaciones. Una sola consola operativa."
                modules={["Reservas", "Liquidaciones", "Operación", "Marketing", "Compliance"]}
                accent="gold"
                cta="Conocer Propietarios"
                onClick={() => onNav("propietarios")}
                external={URL_PROPIETARIO}
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* 2 · SEDA OS DASHBOARD (live preview) */}
      <section style={{ background: "var(--stone-2)" }}>
        <div className="wrap">
          <Reveal>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24, marginBottom: 48 }}>
              <div style={{ maxWidth: 580 }}>
                <div className="eyebrow">— 02 · SEDA OS Dashboard</div>
                <h2 className="h2" style={{ marginTop: 14 }}>El estado de su residencia, <em>en tiempo real.</em></h2>
              </div>
              <p className="body" style={{ maxWidth: "44ch" }}>Métricas, calendario, operación y finanzas en una sola pantalla. Sin recopilar datos de SaaS dispersos.</p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <EcoDashboardPanel/>
          </Reveal>
        </div>
      </section>

      {/* 3 · IA APLICADA */}
      <section style={{ background: "var(--stone)" }}>
        <div className="wrap">
          <Reveal>
            <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto" }}>
              <div className="eyebrow">— 03 · Inteligencia operativa</div>
              <h2 className="h2" style={{ marginTop: 14 }}>IA aplicada a la <em>hospitalidad.</em></h2>
              <p className="lead" style={{ marginTop: 18 }}>Modelos propios y de terceros, orquestados desde SEDA OS para amplificar al equipo local — nunca sustituirlo.</p>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 56 }}>
            {[
              { i: <Icon.bell width="22" height="22"/>, t: "Concierge IA", b: "Pre-respuesta a huéspedes 24/7 con escalado al equipo humano." },
              { i: <Icon.map width="22" height="22"/>, t: "Recomendaciones locales", b: "Discover personalizado por perfil, fecha y meteorología." },
              { i: <Icon.globe width="22" height="22"/>, t: "Marketing multilingüe", b: "ES · EN · DE · FR · NL. Campañas adaptadas a mercados clave." },
              { i: <Icon.euro width="22" height="22"/>, t: "Pricing dinámico", b: "Ajustes por demanda, eventos y compset diario." },
              { i: <Icon.shield width="22" height="22"/>, t: "Detección de incidencias", b: "Patrones anómalos en consumo, accesos y consumo eléctrico." },
              { i: <Icon.chart width="22" height="22"/>, t: "Reporting inteligente", b: "Resúmenes mensuales auto-generados, explicables y exportables." },
              { i: <Icon.bolt width="22" height="22"/>, t: "Automatización operativa", b: "Asignación de tareas a equipo local + proveedores." },
              { i: <Icon.user width="22" height="22"/>, t: "Comunicación huésped", b: "Plantillas IA personalizadas por idioma, tono y contexto." },
            ].map((c, i) => (
              <Reveal key={i} delay={i * 50}>
                <div className="surface tilt" style={{ padding: 24, height: "100%" }}>
                  <div style={{ color: "var(--olive)", marginBottom: 16 }}>{c.i}</div>
                  <h4 style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 400 }}>{c.t}</h4>
                  <p className="small" style={{ marginTop: 8 }}>{c.b}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3.5 · TABS Guest App / SEDA OS / IA / Operaciones */}
      <section style={{ background: "var(--ink)", color: "#fff" }}>
        <div className="wrap">
          <Reveal>
            <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 56px" }}>
              <div className="eyebrow" style={{ color: "var(--bronze)" }}>— Capas del sistema</div>
              <h2 className="h2" style={{ marginTop: 14, color: "#fff" }}>Cuatro capas, <em style={{ color: "var(--bronze)" }}>un solo plano de control.</em></h2>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <EcoTabs/>
          </Reveal>
        </div>
      </section>

      {/* 3.6 · TIMELINE OPERATIVA */}
      <section style={{ background: "var(--stone)" }}>
        <div className="wrap">
          <Reveal>
            <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 64px" }}>
              <div className="eyebrow">— Timeline operativa</div>
              <h2 className="h2" style={{ marginTop: 14 }}>Lo que <em>sucede entre una reserva y otra.</em></h2>
              <p className="lead" style={{ marginTop: 18 }}>Cada estancia activa una secuencia coordinada de SEDA OS, equipo local y Guest App. El propietario solo ve el resultado.</p>
            </div>
          </Reveal>
          <EcoTimeline/>
        </div>
      </section>

      {/* 4 · DIFERENCIA VS GESTIÓN TRADICIONAL */}
      <section style={{ background: "var(--ink)", color: "#fff" }}>
        <div className="wrap">
          <Reveal>
            <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 64px" }}>
              <div className="eyebrow" style={{ color: "var(--bronze)" }}>— 04 · Comparativa</div>
              <h2 className="h2" style={{ marginTop: 14, color: "#fff" }}>La diferencia frente a la <em style={{ color: "var(--bronze)" }}>gestión tradicional.</em></h2>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Reveal>
              <CompareCard
                title="Agencia tradicional"
                tag="STATUS QUO"
                color="rgba(255,255,255,0.55)"
                items={[
                  "Información dispersa entre WhatsApp, Excel y email",
                  "Reportes mensuales con dos semanas de retraso",
                  "Llamadas constantes para coordinar limpieza y mantenimiento",
                  "Poca visibilidad de los ingresos reales y comisiones",
                  "Experiencia del huésped poco guiada · PDFs y manuales",
                  "Cumplimiento legal por cuenta del propietario",
                ]}
              />
            </Reveal>
            <Reveal delay={120}>
              <CompareCard
                title="SEDA"
                tag="SEDA OS · 2026"
                color="var(--bronze)"
                accent
                items={[
                  "Guest App privada por residencia, con marca y datos de SEDA",
                  "SEDA OS en directo, mismo número que el equipo SEDA",
                  "Reporting claro: ingresos brutos, comisiones y netos",
                  "Concierge IA + humano, escalado automatizado",
                  "Operaciones trazables y log inmutable de cada acción",
                  "Cumplimiento legal automatizado (RD 933/2021 · SES · 179 · IRNR)",
                ]}
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* 5 · CTA */}
      <section style={{ background: "var(--olive)", color: "var(--stone)" }}>
        <div className="wrap" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, borderTop: "1px solid rgba(255,255,255,0.18)", borderBottom: "1px solid rgba(255,255,255,0.18)" }}>
          <CTAHalf
            eyebrow="Como huésped"
            title={<>Explore la experiencia <em>SEDA.</em></>}
            body="Acceda a un demo en vivo de la Guest App."
            btn="Acceso huéspedes"
            external
            url={URL_HUESPED}
            inner="Ver Guest App"
            onInner={() => onNav("guestapp")}
          />
          <CTAHalf
            eyebrow="Como propietario"
            title={<>Convierta su propiedad en un <em>activo gestionado.</em></>}
            body="Acceso a SEDA OS en producción + valoración confidencial."
            btn="Acceso propietarios"
            external
            url={URL_PROPIETARIO}
            inner="Soy propietario"
            onInner={() => onNav("propietarios")}
            border
          />
        </div>
      </section>
    </div>
  );
}

/* ---------- ECOSYSTEM DIAGRAM ---------- */
function EcosystemDiagram() {
  return (
    <div style={{ position: "relative", aspectRatio: "1/1", maxWidth: 480, margin: "0 auto" }}>
      <svg viewBox="0 0 480 480" style={{ width: "100%", height: "100%" }}>
        <defs>
          <radialGradient id="core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#A77C45" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#A77C45" stopOpacity="0"/>
          </radialGradient>
        </defs>
        {/* core */}
        <circle cx="240" cy="240" r="160" fill="url(#core)"/>
        <circle cx="240" cy="240" r="70" fill="#A77C45" opacity="0.95"/>
        <text x="240" y="234" textAnchor="middle" fontFamily="Newsreader,serif" fontStyle="italic" fontSize="26" fill="#151515">SEDA</text>
        <text x="240" y="256" textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize="10" letterSpacing="2" fill="#151515">OS</text>
        {/* orbital rings */}
        <circle cx="240" cy="240" r="160" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" strokeDasharray="2 4"/>
        <circle cx="240" cy="240" r="220" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8"/>
        {/* satellites */}
        {[
          { x: 240, y: 80, label: "Guest App", role: "Huésped" },
          { x: 400, y: 240, label: "Reservas", role: "Sistema" },
          { x: 240, y: 400, label: "Liquidaciones", role: "Propietario" },
          { x: 80, y: 240, label: "Operación", role: "Equipo local" },
        ].map((s, i) => (
          <g key={i}>
            <circle cx={s.x} cy={s.y} r="34" fill="rgba(255,255,255,0.06)" stroke="rgba(254,182,74,0.4)" strokeWidth="0.8"/>
            <circle cx={s.x} cy={s.y} r="6" fill="#A77C45"/>
            <line x1={s.x} y1={s.y} x2="240" y2="240" stroke="rgba(254,182,74,0.25)" strokeWidth="0.6" strokeDasharray="2 4"/>
            <text x={s.x} y={s.y - 50} textAnchor="middle" fontFamily="Newsreader,serif" fontSize="14" fill="#fff">{s.label}</text>
            <text x={s.x} y={s.y - 36} textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize="8" letterSpacing="2" fill="rgba(255,255,255,0.5)">{s.role.toUpperCase()}</text>
          </g>
        ))}
        {/* diagonals */}
        {[[160,160],[320,160],[320,320],[160,320]].map(([x,y],i) => (
          <circle key={i} cx={x} cy={y} r="3" fill="rgba(167,124,69,0.5)"/>
        ))}
      </svg>
    </div>
  );
}

function SystemFace({ dark, tag, title, body, modules, cta, onClick, external }) {
  return (
    <div style={{ background: dark ? "var(--ink)" : "#fff", color: dark ? "#fff" : "var(--ink)", borderRadius: 22, padding: 40, border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid var(--line-soft)", height: "100%", display: "flex", flexDirection: "column" }}>
      <div className="eyebrow" style={{ color: dark ? "var(--bronze)" : "var(--olive)" }}>{tag}</div>
      <h3 style={{ fontFamily: "var(--serif)", fontSize: 44, fontWeight: 300, marginTop: 14, color: dark ? "var(--bronze)" : "var(--olive)" }}>{title}</h3>
      <p style={{ fontSize: 15, marginTop: 14, color: dark ? "rgba(255,255,255,0.7)" : "var(--ink-2)" }}>{body}</p>
      <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 8 }}>
        {modules.map(m => (
          <span key={m} style={{
            fontSize: 11, padding: "5px 12px", borderRadius: 999, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600,
            background: dark ? "rgba(255,255,255,0.06)" : "var(--olive-tint)",
            color: dark ? "rgba(255,255,255,0.8)" : "var(--olive)"
          }}>{m}</span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: "auto", paddingTop: 32, flexWrap: "wrap" }}>
        <MagneticBtn className={dark ? "btn btn-bronze glow-hover" : "btn btn-primary glow-hover"} onClick={onClick}>{cta}<Icon.arrow className="arrow" width="13" height="13"/></MagneticBtn>
        {external && (
          <button className="nav-pill" onClick={() => openExternal(external)} style={{ borderColor: dark ? "rgba(255,255,255,0.3)" : "var(--olive)", color: dark ? "#fff" : "var(--olive)" }}>
            {dark ? "Acceso propietarios" : "Acceso huéspedes"}<ExternalArrow/>
          </button>
        )}
      </div>
    </div>
  );
}

function CompareCard({ title, tag, items, accent, color }) {
  return (
    <div style={{ background: accent ? "rgba(254,182,74,0.06)" : "rgba(255,255,255,0.03)", border: `1px solid ${accent ? "rgba(254,182,74,0.3)" : "rgba(255,255,255,0.1)"}`, borderRadius: 18, padding: 36, height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h3 style={{ fontFamily: "var(--serif)", fontSize: 28, fontWeight: 400, color: accent ? "var(--bronze)" : "#fff" }}>{title}</h3>
        <span className="mono" style={{ fontSize: 9.5, letterSpacing: "0.18em", color: accent ? "var(--bronze)" : "rgba(255,255,255,0.5)" }}>{tag}</span>
      </div>
      <ul style={{ listStyle: "none", marginTop: 24, display: "flex", flexDirection: "column", gap: 14 }}>
        {items.map((t, i) => (
          <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", fontSize: 14, lineHeight: 1.55, color: "rgba(255,255,255,0.78)" }}>
            <span style={{ flexShrink: 0, marginTop: 6, width: 6, height: 6, borderRadius: "50%", background: accent ? "var(--bronze)" : "rgba(255,255,255,0.3)" }}></span>
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CTAHalf({ eyebrow, title, body, btn, url, external, inner, onInner, border }) {
  return (
    <div style={{ padding: "72px 48px", borderRight: border ? "none" : "1px solid rgba(255,255,255,0.18)", display: "flex", flexDirection: "column", gap: 22 }}>
      <div className="eyebrow" style={{ color: "var(--bronze)" }}>{eyebrow}</div>
      <h3 className="h3" style={{ color: "var(--stone)", fontSize: "clamp(28px, 2.6vw, 38px)", maxWidth: "18ch" }}>{title}</h3>
      <p className="body" style={{ color: "rgba(255,255,255,0.7)", maxWidth: "40ch" }}>{body}</p>
      <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
        {external ? (
          <MagneticBtn className="btn btn-bronze glow-hover" onClick={() => openExternal(url)}>{btn}<ExternalArrow/></MagneticBtn>
        ) : null}
        <MagneticBtn className="btn btn-ghost-light" onClick={onInner}>{inner}<Icon.arrow className="arrow" width="14" height="14"/></MagneticBtn>
      </div>
    </div>
  );
}

/* ---------- Compact SEDA OS dashboard for ecosystem page ---------- */
function EcoDashboardPanel() {
  return (
    <div style={{ background: "#fff", borderRadius: 18, overflow: "hidden", boxShadow: "0 40px 80px -30px rgba(0,0,0,0.25)", border: "1px solid var(--line-soft)" }}>
      <div style={{ background: "#1c1b1b", color: "#fff", padding: "14px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <span style={{ width: 24, height: 24, borderRadius: 6, background: "var(--olive)", color: "var(--bronze)", display: "grid", placeItems: "center", fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 13, fontWeight: 500 }}>S</span>
          <span className="mono" style={{ fontSize: 11, letterSpacing: "0.14em" }}>SEDA OS · LIVE</span>
          <span style={{ fontSize: 11, opacity: 0.55 }}>app.sedaprivatehomes.com/os</span>
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "#5fbf8e" }}><span style={{ width: 7, height: 7, background: "#5fbf8e", borderRadius: "50%" }}></span>OPERATIVO</span>
      </div>
      <div style={{ padding: 24, display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 12 }}>
        <KPIBig label="Ingresos previstos" value="€45.000" delta="+12%" sparkData={[3,5,4,6,5,7,8,9]} span={2}/>
        <KPIBig label="Ocupación" value="78%" delta="+6 pts" sparkData={[5,6,7,7,8,7,8,9]} span={2}/>
        <KPIBig label="Check-ins hoy" value="3" delta="2 confirmados" icon avatars span={2}/>
        <KPIBig label="Liquidación" value="€8.420" delta="01 Nov" span={1} dark/>
      </div>
      <div style={{ padding: "0 24px 24px", display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
        <div style={{ background: "var(--stone)", border: "1px solid var(--line-soft)", borderRadius: 12, padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="mono" style={{ fontSize: 9.5, letterSpacing: "0.18em", color: "var(--muted)", textTransform: "uppercase" }}>Calendario unificado · 14 días</div>
            <span className="mono" style={{ fontSize: 10, color: "var(--muted)" }}>OCT 2026</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(14,1fr)", gap: 4, marginTop: 12 }}>
            {Array.from({length: 14}).map((_, i) => {
              const a = i >= 0 && i <= 4;
              const b = i >= 7 && i <= 9;
              const c = i === 12;
              return <div key={i} style={{ height: 32, borderRadius: 6, background: a ? "var(--olive)" : b ? "var(--bronze)" : c ? "var(--ink-2)" : "#fff", border: "1px solid var(--line-soft)", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 600, color: (a||c) ? "var(--stone)" : "var(--ink)" }}>{i+1}</div>;
            })}
          </div>
          <div style={{ display: "flex", gap: 18, marginTop: 12 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10.5, color: "var(--muted)" }}><span style={{ width: 8, height: 8, background: "var(--olive)", borderRadius: 2 }}></span>Reservado</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10.5, color: "var(--muted)" }}><span style={{ width: 8, height: 8, background: "var(--bronze)", borderRadius: 2 }}></span>Propietario</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10.5, color: "var(--muted)" }}><span style={{ width: 8, height: 8, background: "var(--ink-2)", borderRadius: 2 }}></span>Mantenimiento</span>
          </div>
        </div>
        <div style={{ background: "var(--olive)", color: "var(--stone)", borderRadius: 12, padding: 18, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div className="mono" style={{ fontSize: 9.5, letterSpacing: "0.18em", color: "var(--bronze)", textTransform: "uppercase" }}>Estado operativo</div>
          <div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 22 }}>Todo en orden</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>0 incidencias · App Huésped activa · Nuki en línea</div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {Array.from({length: 7}).map((_, i) => <span key={i} style={{ flex: 1, height: 4, background: i < 6 ? "var(--bronze)" : "rgba(255,255,255,0.2)", borderRadius: 2 }}></span>)}
          </div>
        </div>
      </div>
    </div>
  );
}

function KPIBig({ label, value, delta, sparkData, icon, avatars, dark, span = 1 }) {
  return (
    <div style={{
      gridColumn: `span ${span}`,
      background: dark ? "var(--olive)" : "var(--stone)",
      color: dark ? "var(--stone)" : "var(--ink)",
      border: dark ? "none" : "1px solid var(--line-soft)",
      borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 100
    }}>
      <div className="mono" style={{ fontSize: 9, letterSpacing: "0.18em", color: dark ? "var(--bronze)" : "var(--muted)", textTransform: "uppercase" }}>{label}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 6 }}>
        <div style={{ fontFamily: "var(--serif)", fontSize: 26 }}>{value}</div>
        {sparkData && (
          <svg width="56" height="22" style={{ overflow: "visible" }}>
            {(() => {
              const max = Math.max(...sparkData), min = Math.min(...sparkData);
              const pts = sparkData.map((v, i) => `${(i/(sparkData.length-1))*56},${22 - ((v-min)/(max-min||1))*22}`).join(" ");
              return <polyline points={pts} fill="none" stroke={dark ? "var(--bronze)" : "var(--olive)"} strokeWidth="1.5" strokeLinecap="round"/>;
            })()}
          </svg>
        )}
        {avatars && (
          <div style={{ display: "flex" }}>
            {["#1F2F2B","#A77C45","#151515"].map((c, i) => (
              <div key={i} style={{ width: 18, height: 18, borderRadius: "50%", background: c, marginLeft: i ? -6 : 0, border: "1.5px solid #fff" }}></div>
            ))}
          </div>
        )}
      </div>
      <div style={{ fontSize: 10.5, color: dark ? "rgba(255,255,255,0.65)" : "var(--olive)", marginTop: 4 }}>{delta}</div>
    </div>
  );
}

/* ---------- ECO TABS (4 capas) ---------- */
function EcoTabs() {
  const [tab, setTab] = useState(0);
  const TABS = [
    { i: <Icon.user width="16" height="16"/>, k: "Guest App", t: "Capa huésped",
      body: "La cara visible para el huésped. Marca SEDA, datos privados, conserje 24/7. Vive en el móvil, sin descargas.",
      bullets: ["Apertura Nuki sin llave", "Concierge IA + humano", "Discover · gastronomía, playa, cultura", "Multilingüe ES · EN · DE · FR"] },
    { i: <Icon.chart width="16" height="16"/>, k: "SEDA OS", t: "Capa operativa",
      body: "El sistema operativo propio que coordina reservas, operación, marketing y liquidaciones. Sin SaaS dispersos.",
      bullets: ["Booking engine propio multicanal", "Calendario unificado", "Settlements automatizados", "Reporting en tiempo real"] },
    { i: <Icon.sparkles width="16" height="16"/>, k: "IA", t: "Capa de inteligencia",
      body: "Modelos propios y de terceros. Amplifican al equipo local — nunca lo sustituyen.",
      bullets: ["Pricing dinámico diario", "Detección de incidencias", "Marketing copy multilingüe", "Recomendaciones personalizadas"] },
    { i: <Icon.wrench width="16" height="16"/>, k: "Operaciones", t: "Capa de equipo local",
      body: "Personas reales en Marbella. Limpieza, mantenimiento, jardinería, recepción. SEDA OS asigna, ellos ejecutan.",
      bullets: ["Equipo en plantilla local", "Asignación automatizada de tareas", "Log de cada intervención", "Proveedores premium certificados"] },
  ];
  const cur = TABS[tab];
  return (
    <div>
      <div className="tab-row">
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)} className={tab === i ? "active" : ""}>
            {t.i}{t.k}
          </button>
        ))}
      </div>
      <div style={{ paddingTop: 48, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }}>
        <div>
          <div className="eyebrow" style={{ color: "var(--bronze)" }}>{cur.t}</div>
          <h3 style={{ fontFamily: "var(--serif)", fontSize: 44, fontWeight: 300, marginTop: 14, color: "#fff" }}>{cur.k}</h3>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: "rgba(255,255,255,0.72)", marginTop: 18, maxWidth: "44ch" }}>{cur.body}</p>
          <ul style={{ listStyle: "none", marginTop: 28, display: "flex", flexDirection: "column", gap: 12 }}>
            {cur.bullets.map((b, i) => (
              <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", color: "rgba(255,255,255,0.82)", fontSize: 14 }}>
                <span style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(254,182,74,0.18)", color: "var(--bronze)", display: "grid", placeItems: "center", flexShrink: 0, marginTop: 2 }}><Icon.check width="11" height="11"/></span>
                {b}
              </li>
            ))}
          </ul>
        </div>
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: 36, minHeight: 380 }}>
          {tab === 0 && <EcoTabGuest/>}
          {tab === 1 && <EcoTabOS/>}
          {tab === 2 && <EcoTabAI/>}
          {tab === 3 && <EcoTabOps/>}
        </div>
      </div>
    </div>
  );
}

function EcoTabGuest() {
  return (
    <div>
      <div className="mono" style={{ fontSize: 10.5, letterSpacing: "0.18em", color: "var(--bronze)" }}>VIEW · GUEST APP</div>
      <h4 style={{ fontFamily: "var(--serif)", fontSize: 22, color: "#fff", marginTop: 6 }}>Villa Alborán · Mr. Andersen</h4>
      <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 10 }}>
        {[["Apertura digital", "Lista", "var(--bronze)"], ["Wi-Fi", "Sincronizado", "#5fbf8e"], ["Concierge Laura", "En línea", "#5fbf8e"], ["Cena chef", "Confirmada · 20:30", "var(--bronze)"], ["Discover", "12 lugares cerca", "var(--bronze)"]].map(([k, v, c], i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 8, fontSize: 13 }}>
            <span style={{ color: "rgba(255,255,255,0.75)" }}>{k}</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#fff", fontWeight: 600 }}><span style={{ width: 6, height: 6, background: c, borderRadius: "50%" }}></span>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
function EcoTabOS() {
  return (
    <div>
      <div className="mono" style={{ fontSize: 10.5, letterSpacing: "0.18em", color: "var(--bronze)" }}>VIEW · SEDA OS</div>
      <h4 style={{ fontFamily: "var(--serif)", fontSize: 22, color: "#fff", marginTop: 6 }}>Resumen operativo</h4>
      <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[["Ocupación", "78%"], ["Ingresos", "€45.000"], ["Check-ins", "3 hoy"], ["Mantenimiento", "1 abierto"], ["NPS huésped", "92"], ["Disponibilidad", "99,98%"]].map(([k, v], i) => (
          <div key={i} style={{ padding: 14, background: "rgba(255,255,255,0.03)", borderRadius: 10 }}>
            <div className="mono" style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", letterSpacing: "0.18em" }}>{k.toUpperCase()}</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 22, color: "#fff", marginTop: 2 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
function EcoTabAI() {
  return (
    <div>
      <div className="mono" style={{ fontSize: 10.5, letterSpacing: "0.18em", color: "var(--bronze)" }}>VIEW · IA · COPILOT</div>
      <h4 style={{ fontFamily: "var(--serif)", fontSize: 22, color: "#fff", marginTop: 6 }}>Sugerencias activas</h4>
      <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          ["Pricing", "Subir tarifa +18% del 15–22 jul (Marbella Music Fest)"],
          ["Marketing", "Lanzar campaña DE para verano. Mercado infraservido."],
          ["Operación", "Reasignar limpieza Casa Almendro al equipo B (carga ↑)."],
          ["Reputación", "Reseña 4★ · sugerir respuesta personalizada (revisar)."],
        ].map(([k, v], i) => (
          <div key={i} style={{ padding: 12, background: "rgba(254,182,74,0.06)", border: "1px solid rgba(254,182,74,0.2)", borderRadius: 10 }}>
            <div className="mono" style={{ fontSize: 9, letterSpacing: "0.18em", color: "var(--bronze)" }}>{k.toUpperCase()}</div>
            <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.85)", marginTop: 4, lineHeight: 1.5 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
function EcoTabOps() {
  return (
    <div>
      <div className="mono" style={{ fontSize: 10.5, letterSpacing: "0.18em", color: "var(--bronze)" }}>VIEW · OPERACIONES</div>
      <h4 style={{ fontFamily: "var(--serif)", fontSize: 22, color: "#fff", marginTop: 6 }}>Equipo activo · Hoy</h4>
      <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          ["LM", "Laura · Conserje", "En línea · 4 conversaciones"],
          ["MC", "Marcos · Limpieza", "Villa Alborán · 11:00–14:00"],
          ["DV", "Diego · Mantenimiento", "Climatización piscina · curso"],
          ["RA", "Rocío · Jardinería", "Finca Olivos · semanal"],
        ].map(([init, name, status], i) => (
          <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--olive)", color: "var(--bronze)", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700 }}>{init}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "#fff" }}>{name}</div>
              <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.55)", marginTop: 1 }}>{status}</div>
            </div>
            <span style={{ width: 7, height: 7, background: "#5fbf8e", borderRadius: "50%" }}></span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- ECO TIMELINE ---------- */
function EcoTimeline() {
  const steps = [
    { phase: "Antes", t: "Reserva confirmada", b: "Pricing dinámico, screening huésped, pre-llegada multilingüe." },
    { phase: "Antes", t: "Pre-llegada", b: "Guía de llegada en Guest App. Código Nuki temporal generado." },
    { phase: "Llegada", t: "Check-in autónomo", b: "Apertura digital, registro SES, contrato firmado." },
    { phase: "Estancia", t: "Concierge activo", b: "Ask SEDA disponible 24/7. Experiencias bajo demanda." },
    { phase: "Estancia", t: "Operación trazable", b: "Limpieza, mantenimiento y jardinería con log inmutable." },
    { phase: "Salida", t: "Check-out", b: "Encuesta, gestión de reseñas, comunicación final." },
    { phase: "Después", t: "Liquidación", b: "Ingresos brutos, comisiones y netos al propietario." },
  ];
  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "absolute", left: 24, top: 24, bottom: 24, width: 2, background: "linear-gradient(180deg, var(--bronze), var(--olive))", opacity: 0.5 }}></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {steps.map((s, i) => (
          <Reveal key={i} delay={i * 70}>
            <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: i === 0 ? "var(--bronze)" : "var(--olive)", color: i === 0 ? "var(--ink)" : "var(--stone)", display: "grid", placeItems: "center", flexShrink: 0, position: "relative", zIndex: 1, fontFamily: "var(--mono)", fontSize: 12, fontWeight: 700, border: "4px solid var(--stone)" }}>{(i + 1).toString().padStart(2, "0")}</div>
              <div className="surface" style={{ padding: 22, flex: 1, display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 24, alignItems: "center" }}>
                <span className="mono" style={{ fontSize: 10, color: "var(--olive)", letterSpacing: "0.18em", textTransform: "uppercase" }}>{s.phase}</span>
                <div>
                  <h4 style={{ fontFamily: "var(--serif)", fontSize: 20 }}>{s.t}</h4>
                  <p className="small" style={{ marginTop: 4 }}>{s.b}</p>
                </div>
                <Icon.arrow width="16" height="16" style={{ color: "var(--muted)" }}/>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { PageEcosistema });