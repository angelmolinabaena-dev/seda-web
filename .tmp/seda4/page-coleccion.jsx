// COLECCIÓN PAGE — Homora + Oakline inspired listing

function PageColeccion({ onNav }) {
  const [filter, setFilter] = useState("Todas");
  const FILTERS = ["Todas", "Villas", "Apartamentos", "Frente al mar", "Piscina privada", "Familias", "Wellness"];

  const visible = PROPERTIES.filter(p => {
    if (filter === "Todas") return true;
    if (filter === "Villas") return p.beds >= 4 && p.amenities.includes("pool");
    if (filter === "Apartamentos") return p.amenities.includes("apt");
    if (filter === "Frente al mar") return p.amenities.includes("sea") || p.tags.some(t => /mar|playa|panor/i.test(t));
    if (filter === "Piscina privada") return p.amenities.includes("pool");
    if (filter === "Familias") return p.amenities.includes("family");
    if (filter === "Wellness") return p.amenities.includes("wellness");
    return true;
  });

  const pins = [
    { price: "4.200€", x: 38, y: 62, active: true, label: "Casa Ciprés" },
    { price: "3.500€", x: 32, y: 70 },
    { price: "2.100€", x: 17, y: 50 },
    { price: "1.800€", x: 38, y: 67 },
    { price: "2.800€", x: 12, y: 60 },
    { price: "2.400€", x: 30, y: 65 },
  ];

  return (
    <div style={{ paddingTop: 100 }}>
      {/* SHORT HERO */}
      <section style={{ paddingTop: 56, paddingBottom: 32 }}>
        <div className="wrap">
          <Reveal>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24 }}>
              <div style={{ maxWidth: 640 }}>
                <div className="eyebrow">— 2026 · Selección anual</div>
                <h1 className="h1" style={{ marginTop: 14 }}><em>Colección</em> SEDA.</h1>
                <p className="lead" style={{ marginTop: 18, maxWidth: 560 }}>
                  Residencias privadas seleccionadas por ubicación, diseño, privacidad y experiencia. Todas con Guest App incluida y gestión conectada a SEDA OS.
                </p>
              </div>
              <div className="mono" style={{ fontSize: 11, letterSpacing: "0.22em", color: "var(--muted)", textTransform: "uppercase" }}>
                {PROPERTIES.length} residencias · Costa del Sol
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* STICKY SEARCH */}
      <section style={{ paddingTop: 0, paddingBottom: 28, position: "sticky", top: 76, zIndex: 30, background: "var(--stone)" }}>
        <div className="wrap">
          <div className="surface" style={{ padding: 8, display: "grid", gridTemplateColumns: "1.2fr 1.2fr 0.9fr 0.9fr auto", gap: 0, alignItems: "stretch", borderRadius: 12, boxShadow: "0 12px 32px -16px rgba(21,33,30,0.18)" }}>
            <SearchFieldLight icon={<Icon.pin width="16" height="16"/>} label="Destino" value="Costa del Sol" />
            <SearchFieldLight icon={<Icon.calendar width="16" height="16"/>} label="Fechas" value="Seleccionar" divider />
            <SearchFieldLight icon={<Icon.user width="16" height="16"/>} label="Huéspedes" value="2 Adultos" divider />
            <SearchFieldLight icon={<Icon.bed width="16" height="16"/>} label="Dormitorios" value="Cualquiera" divider />
            <MagneticBtn className="btn btn-primary glow-hover" style={{ padding: "14px 22px", margin: 0 }}>
              <Icon.search width="14" height="14"/> Buscar
            </MagneticBtn>
          </div>
        </div>
      </section>

      {/* TABS Homora-style */}
      <section style={{ paddingTop: 4, paddingBottom: 32 }}>
        <div className="wrap">
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: "10px 18px",
                    borderRadius: 999,
                    fontSize: 12,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    border: "1px solid",
                    borderColor: filter === f ? "var(--carbon)" : "var(--line)",
                    background: filter === f ? "var(--carbon)" : "transparent",
                    color: filter === f ? "var(--travertine)" : "var(--ink-2)",
                    transition: "all .25s",
                    cursor: "pointer",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 14, alignItems: "center", color: "var(--muted)", fontSize: 12 }}>
              <span>{visible.length} resultados</span>
              <div style={{ display: "flex", gap: 6 }}>
                <button style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid var(--line)", color: "var(--cypress)" }}><Icon.list width="16" height="16"/></button>
                <button style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid var(--cypress)", background: "var(--olive-tint)", color: "var(--cypress)" }}><Icon.map width="16" height="16"/></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GRID + MAP */}
      <section style={{ paddingTop: 0, paddingBottom: 96 }}>
        <div className="wrap">
          <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 28, alignItems: "flex-start" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
              {visible.map((p, i) => (
                <Reveal key={p.id} delay={i * 60}>
                  <HomoraCard p={p} onClick={() => onNav("contacto")} />
                </Reveal>
              ))}
              {visible.length === 0 && (
                <div style={{ gridColumn: "1 / -1", padding: 64, textAlign: "center", color: "var(--muted)", fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 18 }}>
                  Sin residencias para este filtro. <a onClick={() => setFilter("Todas")} style={{ color: "var(--cypress)", textDecoration: "underline", cursor: "pointer" }}>Ver todas</a>.
                </div>
              )}
            </div>
            <div style={{ position: "sticky", top: 200 }}>
              <CoastMap pins={pins} height={620}/>
              <div className="small" style={{ marginTop: 12, color: "var(--muted)", textAlign: "center" }}>Costa del Sol · Estepona → Torremolinos</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ background: "var(--cypress)", color: "var(--travertine)", paddingTop: 96, paddingBottom: 96 }}>
        <div className="wrap" style={{ textAlign: "center" }}>
          <Reveal>
            <div className="eyebrow" style={{ color: "var(--bronze)" }}>— Selección a medida</div>
            <h2 className="h2" style={{ marginTop: 14, color: "var(--travertine)", maxWidth: "18ch", margin: "14px auto 0" }}>
              ¿No encuentra <em>su residencia ideal?</em>
            </h2>
            <p className="lead" style={{ marginTop: 18, color: "rgba(255,255,255,0.7)", maxWidth: 560, margin: "18px auto 0" }}>
              Cuéntenos cómo es la estancia que tiene en mente. Le proponemos las residencias disponibles que mejor encajan con sus fechas.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 32, justifyContent: "center", flexWrap: "wrap" }}>
              <MagneticBtn className="btn btn-bronze glow-hover" onClick={() => onNav("contacto")}>Consultar disponibilidad<Icon.arrow className="arrow" width="14" height="14"/></MagneticBtn>
              <MagneticBtn className="btn btn-ghost-light" onClick={() => openExternal(URL_HUESPED)}>Acceso huéspedes<ExternalArrow/></MagneticBtn>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function SearchFieldLight({ icon, label, value, divider }) {
  return (
    <div style={{ padding: "12px 16px", borderLeft: divider ? "1px solid var(--line-soft)" : "none" }}>
      <div className="mono" style={{ fontSize: 9.5, letterSpacing: "0.22em", color: "var(--muted)", textTransform: "uppercase" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
        <span style={{ color: "var(--cypress)" }}>{icon}</span>
        <span style={{ fontSize: 14, fontWeight: 500, color: "var(--carbon)" }}>{value}</span>
      </div>
    </div>
  );
}

/* ---------- HOMORA-STYLE PROPERTY CARD ---------- */
function HomoraCard({ p, onClick }) {
  const priceLabel = p.price >= 3000 ? "Bajo consulta" : `Desde ${p.price.toLocaleString("es-ES")}€`;
  return (
    <div className="tilt" style={{
      borderRadius: 16, overflow: "hidden", background: "#fff", border: "1px solid var(--line-soft)",
      cursor: "pointer", transition: "border-color .35s, transform .4s, box-shadow .4s", display: "flex", flexDirection: "column",
    }} onClick={onClick}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--bronze)"; e.currentTarget.style.boxShadow = "0 24px 48px -20px rgba(21,33,30,0.18)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.boxShadow = ""; }}>
      <div className="img-zoom-wrap" style={{ position: "relative", aspectRatio: "5/4", overflow: "hidden" }}>
        <img src={p.photo} alt={p.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 60%, rgba(21,21,21,0.4) 100%)" }}></div>
        <div style={{ position: "absolute", top: 14, left: 14, display: "flex", gap: 6, flexWrap: "wrap" }}>
          {p.tags.slice(0, 2).map(t => (
            <span key={t} style={{ padding: "5px 10px", borderRadius: 999, background: "rgba(250,247,240,0.92)", backdropFilter: "blur(10px)", fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, color: "var(--carbon)" }}>{t}</span>
          ))}
        </div>
        <div style={{ position: "absolute", top: 14, right: 14, width: 36, height: 36, borderRadius: "50%", background: "rgba(250,247,240,0.92)", color: "var(--cypress)", display: "grid", placeItems: "center", backdropFilter: "blur(10px)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </div>
      </div>

      <div style={{ padding: 22, display: "flex", flexDirection: "column", flex: 1 }}>
        <div className="mono" style={{ fontSize: 10, color: "var(--cypress)", letterSpacing: "0.18em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
          <Icon.pin width="11" height="11"/>{p.city} · {p.region}
        </div>
        <h3 style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 400, marginTop: 8 }}>{p.name}</h3>

        <div style={{ display: "flex", gap: 16, marginTop: 14, color: "var(--ink-2)", fontSize: 12.5 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icon.bed width="14" height="14"/>{p.beds} dorm</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icon.bath width="14" height="14"/>{p.baths} baños</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icon.guests width="14" height="14"/>{p.guests} hués.</span>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
          {p.tags.slice(2, 4).map(t => (
            <span key={t} style={{ padding: "4px 9px", borderRadius: 999, background: "var(--olive-tint)", color: "var(--cypress)", fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600 }}>{t}</span>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "auto", paddingTop: 18, borderTop: "1px solid var(--line-soft)" }}>
          <div>
            <div className="mono" style={{ fontSize: 9.5, letterSpacing: "0.18em", color: "var(--muted)", textTransform: "uppercase" }}>{p.price >= 3000 ? "Tarifa" : "Desde"}</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 22, marginTop: 2, color: "var(--carbon)", whiteSpace: "nowrap" }}>
              {p.price >= 3000 ? "Bajo consulta" : <>{p.price.toLocaleString("es-ES")}€<span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--sans)" }}> / noche</span></>}
            </div>
          </div>
          <button className="btn-text" style={{ fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 6 }}
            onClick={(e) => { e.stopPropagation(); onClick && onClick(); }}>
            Consultar<Icon.arrow width="13" height="13"/>
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PageColeccion });
