// CONTACTO PAGE — dual conversion

function PageContacto({ onNav }) {
  const [mode, setMode] = useState("huesped"); // huesped | propietario
  const [sent, setSent] = useState(false);

  return (
    <div style={{ paddingTop: 100, minHeight: "100vh", background: "var(--stone)" }}>
      <section style={{ paddingTop: 56, paddingBottom: 24 }}>
        <div className="wrap" style={{ maxWidth: 1100 }}>
          <Reveal>
            <div className="eyebrow">— Conversación directa</div>
            <KineticHeadline as="h1" className="h-display" text="Hablemos de su <em>próxima estancia.</em>" style={{ marginTop: 18, fontSize: "clamp(48px, 6.2vw, 88px)" }} />
            <p className="lead" style={{ marginTop: 22, maxWidth: 600 }}>
              Respondemos en menos de 24 horas con una propuesta personalizada o un análisis de potencial confidencial — según su caso.
            </p>
          </Reveal>
        </div>
      </section>

      <section style={{ paddingTop: 32, paddingBottom: 80 }}>
        <div className="wrap" style={{ maxWidth: 1100 }}>
          {/* Mode toggle */}
          <Reveal>
            <div style={{ display: "inline-flex", background: "var(--stone-2)", border: "1px solid var(--line-soft)", borderRadius: 999, padding: 4, marginBottom: 32 }}>
              {[["huesped", "Soy huésped"], ["propietario", "Soy propietario"]].map(([id, label]) => (
                <button key={id} onClick={() => setMode(id)} style={{
                  padding: "12px 24px", borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
                  background: mode === id ? "var(--olive)" : "transparent",
                  color: mode === id ? "var(--stone)" : "var(--ink-2)",
                  transition: "all .35s"
                }}>
                  {label}
                </button>
              ))}
            </div>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 56, alignItems: "flex-start" }}>
            {/* FORM */}
            <Reveal>
              <div className="surface" style={{ padding: 40, borderRadius: 20 }}>
                {!sent ? (
                  mode === "huesped" ? <FormHuesped onSubmit={() => setSent(true)}/> : <FormPropietario onSubmit={() => setSent(true)}/>
                ) : (
                  <Confirmed mode={mode}/>
                )}
              </div>
            </Reveal>

            {/* Side info */}
            <Reveal delay={140}>
              <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                <SideCard
                  eyebrow={mode === "huesped" ? "Para huéspedes" : "Para propietarios"}
                  title={mode === "huesped" ? "Estancia a medida" : "Valoración confidencial"}
                  body={mode === "huesped"
                    ? "Le proponemos las residencias disponibles que mejor encajan con sus fechas, grupo y preferencias. Sin spam, sin newsletters."
                    : "Análisis de potencial en 48h: ocupación esperada, ADR y RevPAR para su propiedad, con benchmark de mercado."
                  }
                />

                <div className="surface" style={{ padding: 24, borderRadius: 16 }}>
                  <div className="eyebrow">— Equipo SEDA</div>
                  <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                      <Icon.bell width="18" height="18" style={{ color: "var(--olive)" }}/>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>info@sedaprivatehomes.com</div>
                        <div className="small" style={{ marginTop: 2 }}>Respuesta &lt; 24h</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                      <Icon.user width="18" height="18" style={{ color: "var(--olive)" }}/>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>+34 952 00 00 00</div>
                        <div className="small" style={{ marginTop: 2 }}>Lun–Dom · 09–22h</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                      <Icon.pin width="18" height="18" style={{ color: "var(--olive)" }}/>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>Costa del Sol, Málaga</div>
                        <div className="small" style={{ marginTop: 2 }}>Equipo local de hospitalidad</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ background: "var(--olive)", color: "var(--stone)", borderRadius: 16, padding: 24 }}>
                  <div className="eyebrow" style={{ color: "var(--bronze)" }}>— Accesos directos</div>
                  <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
                    <button onClick={() => openExternal(URL_HUESPED)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "var(--stone)", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.14em", transition: "all .25s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(254,182,74,0.15)"; e.currentTarget.style.borderColor = "var(--bronze)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}>
                      Acceso huéspedes<ExternalArrow/>
                    </button>
                    <button onClick={() => openExternal(URL_PROPIETARIO)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "var(--stone)", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.14em", transition: "all .25s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(254,182,74,0.15)"; e.currentTarget.style.borderColor = "var(--bronze)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}>
                      Acceso propietarios<ExternalArrow/>
                    </button>
                  </div>
                  <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.18)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <div style={{ fontFamily: "var(--serif)", fontSize: 28 }}><AnimatedNumber to={24} suffix="h"/></div>
                      <div className="small" style={{ color: "rgba(255,255,255,0.6)" }}>Respuesta media</div>
                    </div>
                    <div>
                      <div style={{ fontFamily: "var(--serif)", fontSize: 28 }}><AnimatedNumber to={14}/></div>
                      <div className="small" style={{ color: "rgba(255,255,255,0.6)" }}>Residencias</div>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}

function SideCard({ eyebrow, title, body }) {
  return (
    <div className="surface" style={{ padding: 28, borderRadius: 16 }}>
      <div className="eyebrow">{eyebrow}</div>
      <h3 style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 400, marginTop: 12 }}>{title}</h3>
      <p className="body" style={{ marginTop: 12 }}>{body}</p>
    </div>
  );
}

function Field({ label, type = "text", placeholder, full, options, value, onChange, required }) {
  const style = { width: "100%", padding: "14px 16px", border: "1px solid var(--line)", borderRadius: 10, fontFamily: "var(--sans)", fontSize: 14, background: "#fff", color: "var(--ink)", outline: "none", transition: "border-color .25s" };
  return (
    <div style={{ gridColumn: full ? "1 / -1" : "auto" }}>
      <label style={{ display: "block", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--muted)", fontWeight: 700, marginBottom: 8 }}>{label} {required && <span style={{ color: "var(--bronze-deep)" }}>*</span>}</label>
      {type === "textarea" ? (
        <textarea rows={4} placeholder={placeholder} value={value} onChange={onChange} style={{ ...style, resize: "vertical", minHeight: 110 }} onFocus={e => e.target.style.borderColor = "var(--olive)"} onBlur={e => e.target.style.borderColor = "var(--line)"}/>
      ) : type === "select" ? (
        <select value={value} onChange={onChange} style={{ ...style, appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%2344665c' stroke-width='1.4'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center" }}>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} placeholder={placeholder} value={value} onChange={onChange} style={style} onFocus={e => e.target.style.borderColor = "var(--olive)"} onBlur={e => e.target.style.borderColor = "var(--line)"}/>
      )}
    </div>
  );
}

function FormHuesped({ onSubmit }) {
  const [v, setV] = useState({ nombre: "", email: "", telefono: "", destino: "Marbella · Costa del Sol", fechas: "", huespedes: "2 adultos", mensaje: "" });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      <div className="eyebrow">— Solicitud de estancia</div>
      <h2 className="h3" style={{ marginTop: 12, fontFamily: "var(--serif)", fontSize: 30 }}>Cuéntenos sobre <em>su estancia.</em></h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 28 }}>
        <Field label="Nombre completo" required placeholder="Su nombre" value={v.nombre} onChange={e => setV({...v, nombre: e.target.value})}/>
        <Field label="Email" type="email" required placeholder="su@email.com" value={v.email} onChange={e => setV({...v, email: e.target.value})}/>
        <Field label="Teléfono" type="tel" placeholder="+34 ..." value={v.telefono} onChange={e => setV({...v, telefono: e.target.value})}/>
        <Field label="Destino" type="select" options={["Marbella · Costa del Sol","Puerto Banús","Estepona","Casares","Benahavís","Torremolinos","Indiferente"]} value={v.destino} onChange={e => setV({...v, destino: e.target.value})}/>
        <Field label="Fechas aproximadas" placeholder="Ej. 15–22 julio 2026" value={v.fechas} onChange={e => setV({...v, fechas: e.target.value})}/>
        <Field label="Huéspedes" type="select" options={["2 adultos","3 adultos","4 adultos","5+ adultos","Familia con niños","Grupo de amigos"]} value={v.huespedes} onChange={e => setV({...v, huespedes: e.target.value})}/>
        <Field label="¿Qué busca?" type="textarea" full placeholder="Cuéntenos qué tipo de estancia tiene en mente, preferencias o experiencias que le interesen." value={v.mensaje} onChange={e => setV({...v, mensaje: e.target.value})}/>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 28, flexWrap: "wrap", gap: 16 }}>
        <span className="small">Respondemos en menos de 24h.</span>
        <MagneticBtn className="btn btn-primary glow-hover" type="submit">Enviar solicitud<Icon.arrow className="arrow" width="14" height="14"/></MagneticBtn>
      </div>
    </form>
  );
}

function FormPropietario({ onSubmit }) {
  const [v, setV] = useState({ nombre: "", email: "", telefono: "", zona: "Marbella Golden Mile", tipo: "Villa independiente", dorm: "4", mensaje: "" });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      <div className="eyebrow">— Valoración confidencial</div>
      <h2 className="h3" style={{ marginTop: 12, fontFamily: "var(--serif)", fontSize: 30 }}>Calculemos el <em>potencial de su propiedad.</em></h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 28 }}>
        <Field label="Nombre completo" required placeholder="Su nombre" value={v.nombre} onChange={e => setV({...v, nombre: e.target.value})}/>
        <Field label="Email" type="email" required placeholder="su@email.com" value={v.email} onChange={e => setV({...v, email: e.target.value})}/>
        <Field label="Teléfono" type="tel" placeholder="+34 ..." value={v.telefono} onChange={e => setV({...v, telefono: e.target.value})}/>
        <Field label="Zona de la propiedad" type="select" options={["Marbella Golden Mile","Puerto Banús","Estepona","Casares","Benahavís","Torremolinos","Otra zona Costa del Sol"]} value={v.zona} onChange={e => setV({...v, zona: e.target.value})}/>
        <Field label="Tipología" type="select" options={["Villa independiente","Ático","Apartamento","Cortijo / Finca"]} value={v.tipo} onChange={e => setV({...v, tipo: e.target.value})}/>
        <Field label="Dormitorios" type="select" options={["1","2","3","4","5","6","7+"]} value={v.dorm} onChange={e => setV({...v, dorm: e.target.value})}/>
        <Field label="Información adicional" type="textarea" full placeholder="Disponibilidad anual, situación actual (gestión propia, otra agencia, sin gestionar), objetivos." value={v.mensaje} onChange={e => setV({...v, mensaje: e.target.value})}/>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 28, flexWrap: "wrap", gap: 16 }}>
        <span className="small">Análisis confidencial sin compromiso. Respuesta en 48h.</span>
        <MagneticBtn className="btn btn-bronze glow-hover" type="submit">Solicitar valoración<Icon.arrow className="arrow" width="14" height="14"/></MagneticBtn>
      </div>
    </form>
  );
}

function Confirmed({ mode }) {
  return (
    <div style={{ textAlign: "center", padding: "32px 0" }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--olive)", color: "var(--bronze)", display: "grid", placeItems: "center", margin: "0 auto 24px" }}>
        <Icon.check width="28" height="28"/>
      </div>
      <h2 className="h2"><em>Recibido.</em></h2>
      <p className="lead" style={{ marginTop: 16, maxWidth: "44ch", margin: "16px auto 0" }}>
        {mode === "huesped" ? "Le responderemos en menos de 24h con una propuesta de estancia personalizada." : "Recibirá su análisis confidencial de potencial en 48h."}
      </p>
      <div className="mono" style={{ marginTop: 32, fontSize: 11, letterSpacing: "0.18em", color: "var(--muted)" }}>REFERENCIA · SEDA-{Math.floor(Math.random() * 9000 + 1000)}</div>
    </div>
  );
}

Object.assign(window, { PageContacto });
