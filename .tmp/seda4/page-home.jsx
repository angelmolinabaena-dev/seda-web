// HOME PAGE
function PageHome({ onNav }) {
  return (
    <div>
      {/* HERO */}
      <header style={{ position: "relative", minHeight: "100vh", overflow: "hidden", display: "flex", alignItems: "flex-end", color: "#fff" }}>
        <div className="kb" style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <img src={PIC.hero} alt="Villa mediterránea al atardecer" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.10) 35%, rgba(0,0,0,0.78) 100%)" }}></div>
        </div>

        <div className="wrap" style={{ position: "relative", zIndex: 2, paddingTop: 120, paddingBottom: 64, width: "100%" }}>
          <div className="mono" style={{ fontSize: 11, letterSpacing: "0.22em", color: "rgba(255,255,255,0.7)", display: "flex", gap: 22, marginBottom: 36, textTransform: "uppercase" }}>
            <span>36°30'N · 04°53'W</span>
            <span style={{ opacity: 0.5 }}>·</span>
            <span>Costa del Sol · 2026</span>
            <span style={{ opacity: 0.5 }}>·</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><span style={{ width: 7, height: 7, background: "#5fbf8e", borderRadius: "50%" }}></span>SEDA OS Operativo</span>
          </div>

          <KineticHeadline as="h1" className="h-display" text="Hospitalidad inteligente. <em>Alma mediterránea.</em>" style={{ maxWidth: "16ch", color: "#fff" }} />
          <Reveal delay={700}>
            <p className="lead" style={{ marginTop: 28, maxWidth: 640, color: "rgba(255,255,255,0.85)" }}>
              Residencias excepcionales en la Costa del Sol, gestionadas con precisión invisible, atención humana y tecnología propia.
            </p>
          </Reveal>

          <Reveal delay={850}>
            <div style={{ display: "flex", gap: 12, marginTop: 36, flexWrap: "wrap" }}>
              <MagneticBtn className="btn btn-bronze glow-hover" onClick={() => onNav("coleccion")}>Buscar estancia<Icon.arrow className="arrow" width="14" height="14"/></MagneticBtn>
              <MagneticBtn className="btn btn-ghost-light" onClick={() => onNav("propietarios")}>Valorar mi propiedad<Icon.arrow className="arrow" width="14" height="14"/></MagneticBtn>
            </div>
          </Reveal>

          {/* Search bar (glass) */}
          <Reveal delay={1000}>
          <div style={{ marginTop: 40, background: "rgba(255,255,255,0.12)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 18, padding: 10, display: "grid", gridTemplateColumns: "1.2fr 1.2fr 1fr 1fr auto", gap: 0, alignItems: "stretch", maxWidth: 1080, boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
            <SearchField icon={<Icon.pin width="18" height="18"/>} label="Destino" value="Marbella · Costa del Sol" />
            <SearchField icon={<Icon.calendar width="18" height="18"/>} label="Llegada · Salida" value="Seleccionar fechas" divider />
            <SearchField icon={<Icon.user width="18" height="18"/>} label="Huéspedes" value="2 Adultos" divider />
            <SearchField icon={<Icon.bed width="18" height="18"/>} label="Dormitorios" value="Cualquiera" divider />
            <MagneticBtn className="btn btn-bronze" style={{ padding: "16px 26px", margin: 0 }} onClick={() => onNav("coleccion")}>
              <Icon.search width="16" height="16"/> Buscar
            </MagneticBtn>
          </div>
          </Reveal>

          <Reveal delay={1150}>
          <div style={{ marginTop: 36, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span className="chip chip-dark"><span className="chip-dot" style={{ background: "#5fbf8e" }}></span>Guest App activa</span>
            <span className="chip chip-dark"><Icon.bolt width="12" height="12"/>Concierge IA</span>
            <span className="chip chip-dark"><Icon.shield width="12" height="12"/>SEDA OS conectado</span>
            <span className="chip chip-dark"><Icon.chart width="12" height="12"/>Control propietario</span>
            <span className="chip chip-dark"><Icon.euro width="12" height="12"/>Previsión de ingresos</span>
          </div>
          </Reveal>
        </div>
      </header>

      {/* INTRO TRIO */}
      <section style={{ background: "var(--stone)" }}>
        <div className="wrap" style={{ textAlign: "center" }}>
          <Reveal>
            <div className="eyebrow">— Manifiesto</div>
            <h2 className="h2" style={{ marginTop: 18, maxWidth: "18ch", marginLeft: "auto", marginRight: "auto" }}>
              <em>El lujo de no tener que pensar en nada.</em>
            </h2>
            <div style={{ width: 48, height: 1, background: "var(--bronze)", margin: "32px auto 0" }}></div>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 56, marginTop: 72, textAlign: "left" }}>
            {[
              { icon: <Icon.sparkles width="24" height="24"/>, t: "Hospitalidad real", b: "Equipo dedicado localmente para anticiparse a sus necesidades, combinando la calidez del sur con estándares internacionales." },
              { icon: <Icon.bolt width="24" height="24"/>, t: "Tecnología invisible", b: "Sistemas que funcionan sin esfuerzo en segundo plano. Acceso sin llave, climatización inteligente y conserjería digital 24/7." },
              { icon: <Icon.chart width="24" height="24"/>, t: "Transparencia total", b: "Para propietarios, un ecosistema digital que ofrece control absoluto, métricas en tiempo real y tranquilidad garantizada." },
            ].map((p, i) => (
              <Reveal key={i} delay={i * 120}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: "var(--olive-tint)", color: "var(--olive)", display: "grid", placeItems: "center", marginBottom: 22 }}>{p.icon}</div>
                <h3 className="h3">{p.t}</h3>
                <p className="body" style={{ marginTop: 12, maxWidth: 38 + "ch" }}>{p.b}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SEDA SPLIT EXPERIENCE — full-width dual */}
      <SplitExperience onNav={onNav}/>

      {/* STATS marquee */}
      <section style={{ background: "var(--ink)", color: "#fff", padding: "40px 0" }}>
        <Marquee items={["14 residencias en gestión", "+24% RevPAR vs mercado", "12.480 estancias coordinadas", "78% ocupación media 2026", "4 idiomas nativos", "99,98% disponibilidad SEDA OS"]}/>
      </section>

      {/* FEATURED COLLECTION — HOMORA 3-UP */}
      <section style={{ background: "var(--stone-2)" }}>
        <div className="wrap">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24, marginBottom: 36 }}>
            <Reveal>
              <div className="eyebrow">— 02 · Colección destacada</div>
              <h2 className="h2" style={{ marginTop: 14, maxWidth: "20ch" }}>Residencias seleccionadas en la <em>Costa del Sol.</em></h2>
              <p className="body" style={{ marginTop: 16, maxWidth: "50ch" }}>Villas, áticos y apartamentos preparados para una estancia sin fricción, con Guest App incluida y gestión conectada a SEDA OS.</p>
            </Reveal>
            <Reveal delay={140}>
              <MagneticBtn className="btn btn-ghost glow-hover" onClick={() => onNav("coleccion")}>
                Ver colección completa<ExternalArrow/>
              </MagneticBtn>
            </Reveal>
          </div>

          <HomoraTabs onNav={onNav}/>
        </div>
      </section>

      {/* EXPERIENCIAS */}
      <section style={{ background: "var(--stone)" }}>
        <div className="wrap">
          <Reveal>
            <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto" }}>
              <div className="eyebrow">— 03 · Servicios a medida</div>
              <h2 className="h2" style={{ marginTop: 14 }}><em>Experiencias SEDA</em></h2>
              <p className="lead" style={{ marginTop: 18 }}>Elevamos su estancia con servicios personalizados gestionados directamente desde la Guest App o por su conserje privado.</p>
            </div>
          </Reveal>

          <SnapSlider>
            {[
              { icon: <Icon.chef width="22" height="22"/>, t: "Chef privado", b: "Gastronomía local en la intimidad de su villa.", img: PIC.diningSet },
              { icon: <Icon.car width="22" height="22"/>, t: "Transfer premium", b: "Llegada fluida desde el momento en que aterriza.", img: PIC.transfer },
              { icon: <Icon.spa width="22" height="22"/>, t: "Masaje en villa", b: "Bienestar y relajación sin salir de casa.", img: PIC.wellness },
              { icon: <Icon.sparkles width="22" height="22"/>, t: "Beach clubs", b: "Acceso prioritario a los mejores clubes de playa.", img: PIC.terrace },
              { icon: <Icon.yacht width="22" height="22"/>, t: "Barco privado", b: "Explore la costa mediterránea a su ritmo.", img: PIC.yacht },
              { icon: <Icon.golf width="22" height="22"/>, t: "Golf", b: "Green fees en los mejores campos andaluces.", img: PIC.golf },
              { icon: <Icon.wine width="22" height="22"/>, t: "Restaurantes seleccionados", b: "Reservas garantizadas en mesas exclusivas.", img: PIC.diningSet },
              { icon: <Icon.spa width="22" height="22"/>, t: "Wellness", b: "Yoga, entrenadores y rituales privados.", img: PIC.spa },
            ].map((e, i) => (
              <div key={i} style={{ width: 340 }}>
                <ExperienceTile {...e} />
              </div>
            ))}
          </SnapSlider>
        </div>
      </section>

      {/* GUEST APP — LARGE, REALISTIC */}
      <section style={{ background: "var(--stone-2)" }}>
        <div className="wrap">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 72, alignItems: "center" }}>
            <Reveal>
              <div className="eyebrow">— 04 · Guest App</div>
              <h2 className="h2" style={{ marginTop: 14, maxWidth: "14ch" }}>Su estancia, en la <em>palma de su mano.</em></h2>
              <p className="lead" style={{ marginTop: 22, maxWidth: "48ch" }}>
                Una sola interfaz para todo lo que sucede antes, durante y después de su llegada. Apertura de puertas, concierge instantáneo, guía de la villa, experiencias y comunicación directa con su anfitrión SEDA.
              </p>
              <ul style={{ marginTop: 36, listStyle: "none", display: "flex", flexDirection: "column", gap: 18 }}>
                {[
                  ["Llaves digitales", "Acceso sin llave con Nuki Smart Lock integrado."],
                  ["Concierge instantáneo", "Chef, masaje, transfer o reserva en pocos toques."],
                  ["Guía de la propiedad", "Manuales, contactos y servicios en un solo lugar."],
                  ["Incidencias en tiempo real", "Respuesta inmediata del equipo SEDA, 24/7."],
                ].map(([t, b], i) => (
                  <li key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 999, background: "var(--olive)", color: "var(--bronze)", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon.check width="14" height="14"/></div>
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--ink)" }}>{t}</div>
                      <div className="small" style={{ marginTop: 4 }}>{b}</div>
                    </div>
                  </li>
                ))}
              </ul>
              <MagneticBtn className="btn btn-primary glow-hover" style={{ marginTop: 40 }} onClick={() => onNav("guestapp")}>Ver Guest App<Icon.arrow className="arrow" width="14" height="14"/></MagneticBtn>
            </Reveal>

            <Reveal delay={160}>
              <GuestAppPhone />
            </Reveal>
          </div>
        </div>
      </section>

      {/* SEDA OS PREVIEW */}
      <section style={{ background: "var(--ink)", color: "#fff" }}>
        <div className="wrap">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 56, alignItems: "center" }}>
            <Reveal>
              <div className="eyebrow eyebrow-gold">— 05 · SEDA OS</div>
              <h2 className="h2" style={{ marginTop: 14, color: "#fff", maxWidth: "14ch" }}>
                Para propietarios: <em style={{ color: "var(--bronze)" }}>visibilidad total.</em>
              </h2>
              <p className="lead" style={{ marginTop: 22, maxWidth: "44ch", color: "rgba(255,255,255,0.75)" }}>
                Un panel de control dedicado adaptado a la longevidad. Monitoreo del rendimiento, visibilidad total del mantenimiento, y acceso a las liquidaciones financieras en tiempo real.
              </p>
              <ul style={{ marginTop: 36, listStyle: "none", display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  ["Métricas en tiempo real", "Ocupación, ADP y RevPAR actualizados al instante."],
                  ["Procesos transparentes", "Liquidaciones claras, ingresos brutos y netos visibles."],
                  ["Calendario unificado", "Reservas, uso propietario y mantenimiento en una vista."],
                ].map(([t, b], i) => (
                  <li key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--bronze)", marginTop: 9, flexShrink: 0 }}></div>
                    <div>
                      <div style={{ fontWeight: 600, color: "#fff" }}>{t}</div>
                      <div className="small" style={{ marginTop: 4, color: "rgba(255,255,255,0.55)" }}>{b}</div>
                    </div>
                  </li>
                ))}
              </ul>
              <MagneticBtn className="btn btn-ghost-light glow-hover" style={{ marginTop: 40 }} onClick={() => onNav("ecosistema")}>Conocer el Ecosistema SEDA OS<Icon.arrow className="arrow" width="14" height="14"/></MagneticBtn>
            </Reveal>

            <Reveal delay={160}>
              <SedaOSPreview />
            </Reveal>
          </div>
        </div>
      </section>

      {/* BENEFICIOS PROPIETARIO BENTO */}
      <section style={{ background: "var(--stone-2)" }}>
        <div className="wrap">
          <Reveal>
            <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 56px" }}>
              <div className="eyebrow">— Para propietarios</div>
              <h2 className="h2" style={{ marginTop: 14 }}>Lo que cambia <em>cuando SEDA gestiona.</em></h2>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gridAutoRows: "minmax(180px, auto)", gap: 16 }}>
            <BentoCell span="6/2" highlight>
              <div className="eyebrow" style={{ color: "var(--bronze)" }}>RevPAR</div>
              <h3 style={{ fontFamily: "var(--serif)", fontSize: 64, fontWeight: 300, color: "var(--bronze)", lineHeight: 1, marginTop: 18 }}>+<AnimatedNumber to={24}/>%</h3>
              <p className="body" style={{ marginTop: 18, color: "rgba(255,255,255,0.7)", maxWidth: "30ch" }}>Mejora media frente a gestión tradicional, según compset Costa del Sol 2023–2025.</p>
            </BentoCell>
            <BentoCell span="3/1">
              <Icon.bolt width="22" height="22" style={{ color: "var(--olive)" }}/>
              <h4 style={{ fontFamily: "var(--serif)", fontSize: 20, marginTop: 16 }}>Control en tiempo real</h4>
              <p className="small" style={{ marginTop: 6 }}>Ocupación, ingresos y operaciones, siempre actualizados.</p>
            </BentoCell>
            <BentoCell span="3/1">
              <Icon.shield width="22" height="22" style={{ color: "var(--olive)" }}/>
              <h4 style={{ fontFamily: "var(--serif)", fontSize: 20, marginTop: 16 }}>Compliance automatizado</h4>
              <p className="small" style={{ marginTop: 6 }}>RD 933/2021, SES, Modelo 179, IRNR sin intervención.</p>
            </BentoCell>
            <BentoCell span="3/1">
              <Icon.chart width="22" height="22" style={{ color: "var(--olive)" }}/>
              <h4 style={{ fontFamily: "var(--serif)", fontSize: 20, marginTop: 16 }}>Transparencia financiera</h4>
              <p className="small" style={{ marginTop: 6 }}>Ingresos brutos, comisiones y netos visibles cada mes.</p>
            </BentoCell>
            <BentoCell span="3/1">
              <Icon.wrench width="22" height="22" style={{ color: "var(--olive)" }}/>
              <h4 style={{ fontFamily: "var(--serif)", fontSize: 20, marginTop: 16 }}>Menos llamadas</h4>
              <p className="small" style={{ marginTop: 6 }}>SEDA OS coordina equipo local, sin que usted intervenga.</p>
            </BentoCell>
            <BentoCell span="3/1">
              <Icon.globe width="22" height="22" style={{ color: "var(--olive)" }}/>
              <h4 style={{ fontFamily: "var(--serif)", fontSize: 20, marginTop: 16 }}>Marketing premium</h4>
              <p className="small" style={{ marginTop: 6 }}>Copy editorial multilingüe, SEO y campañas internacionales.</p>
            </BentoCell>
            <BentoCell span="6/1" image={PIC.ownerHero}>
              <div style={{ position: "relative", zIndex: 1, color: "#fff", display: "flex", flexDirection: "column", height: "100%", justifyContent: "flex-end" }}>
                <div className="eyebrow" style={{ color: "var(--bronze)" }}>Su residencia, protegida</div>
                <h3 style={{ fontFamily: "var(--serif)", fontSize: 28, fontWeight: 400, marginTop: 14, color: "#fff", maxWidth: "20ch" }}>Acceso digital, log inmutable y trazabilidad completa.</h3>
              </div>
            </BentoCell>
          </div>
        </div>
      </section>

      {/* TECNOLOGÍA INVISIBLE — icon strip */}
      <section style={{ background: "var(--stone)" }}>
        <div className="wrap">
          <Reveal>
            <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 56px" }}>
              <div className="eyebrow">— Tecnología invisible</div>
              <h2 className="h2" style={{ marginTop: 14 }}>Lo que <em>no se ve,</em> es lo que la hace funcionar.</h2>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {[
              { icon: <Icon.key width="22" height="22"/>, t: "Nuki Smart Lock", tip: "Apertura sin llave. Códigos temporales por estancia, revocables al instante." },
              { icon: <Icon.wifi width="22" height="22"/>, t: "Wi-Fi fibra 1 Gbps", tip: "Conexión simétrica con QR de acceso. Monitoreo de saturación en SEDA OS." },
              { icon: <Icon.bell width="22" height="22"/>, t: "Concierge IA + humano", tip: "Modelo propio entrenado en hospitalidad. Escalado automático al equipo SEDA." },
              { icon: <Icon.chart width="22" height="22"/>, t: "Pricing dinámico", tip: "Compset diario, eventos locales y demanda en tiempo real." },
              { icon: <Icon.globe width="22" height="22"/>, t: "OTA distribution", tip: "Sincronización con Airbnb, Booking, Vrbo y canales premium. Anti-overbooking." },
              { icon: <Icon.shield width="22" height="22"/>, t: "SES Hospedajes", tip: "Conexión telemática con autoridades. RD 933/2021 cumplido por sistema." },
              { icon: <Icon.doc width="22" height="22"/>, t: "Modelo 179 · IRNR", tip: "Declaración trimestral automatizada. Soporte fiscal a no residentes." },
              { icon: <Icon.lock width="22" height="22"/>, t: "Log inmutable", tip: "Cada acción del equipo y huésped queda registrada y exportable." },
            ].map((c, i) => (
              <Reveal key={i} delay={i * 40}>
                <IconCard icon={c.icon} title={c.t} tip={c.tip}/>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* DUAL CTA FINAL */}
      <section id="contact-anchor" style={{ background: "var(--olive)", color: "var(--stone)" }}>
        <div className="wrap">
          <Reveal>
            <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto" }}>
              <div className="eyebrow" style={{ color: "var(--bronze)" }}>— 06 · Conversación</div>
              <h2 className="h2" style={{ marginTop: 14, color: "var(--stone)" }}>Hablemos de su <em style={{ color: "var(--bronze)" }}>próxima estancia</em> — o de su <em style={{ color: "var(--bronze)" }}>propiedad.</em></h2>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, marginTop: 56, borderTop: "1px solid rgba(255,255,255,0.18)", borderBottom: "1px solid rgba(255,255,255,0.18)" }}>
            <CTACell
              eyebrow="Huésped"
              title={<>Planifique su próxima <em>estancia privada.</em></>}
              body="Le contactamos en menos de 24h con una propuesta personalizada y disponibilidades reales."
              btn="Solicitar estancia"
              variant="gold"
              onClick={() => onNav("contacto")}
            />
            <CTACell
              eyebrow="Propietario"
              title={<>Convierta su propiedad en un <em>activo gestionado.</em></>}
              body="Análisis confidencial de potencial: ocupación esperada, ADR y RevPAR. Sin compromiso."
              btn="Hablar con un asesor"
              variant="ghost"
              border
              onClick={() => onNav("contacto")}
            />
          </div>
          <div className="mono" style={{ marginTop: 48, fontSize: 11, letterSpacing: "0.22em", color: "rgba(255,255,255,0.55)", display: "flex", justifyContent: "center", gap: 30, textTransform: "uppercase", flexWrap: "wrap" }}>
            <span>info@sedaprivatehomes.com</span>
            <span>·</span>
            <span>+34 952 00 00 00</span>
            <span>·</span>
            <span>Costa del Sol · Málaga</span>
          </div>
        </div>
      </section>
    </div>
  );
}

function SearchField({ icon, label, value, divider }) {
  return (
    <div style={{ padding: "14px 18px", borderLeft: divider ? "1px solid rgba(255,255,255,0.2)" : "none" }}>
      <div className="mono" style={{ fontSize: 9.5, letterSpacing: "0.22em", color: "rgba(255,255,255,0.75)", textTransform: "uppercase" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6, color: "#fff" }}>
        <span style={{ opacity: 0.85 }}>{icon}</span>
        <span style={{ fontSize: 14, fontWeight: 500 }}>{value}</span>
      </div>
    </div>
  );
}

function FeaturedCard({ p, onClick }) {
  return (
    <div onClick={onClick} className="tile" style={{ cursor: "pointer", borderRadius: 18 }}>
      <div style={{ position: "relative", aspectRatio: "4/5" }}>
        <img src={p.photo} alt={p.name} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.7) 100%)" }}></div>
        <div style={{ position: "absolute", top: 16, left: 16, display: "flex", gap: 6, flexWrap: "wrap" }}>
          {p.tags.slice(0, 2).map((t) => <span key={t} className="chip">{t}</span>)}
        </div>
        <div style={{ position: "absolute", bottom: 22, left: 22, right: 22, color: "#fff" }}>
          <div className="mono" style={{ fontSize: 10.5, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.75)" }}>{p.city} · {p.region}</div>
          <h3 style={{ fontFamily: "var(--serif)", fontSize: 30, fontWeight: 400, marginTop: 6, color: "#fff" }}>{p.name}</h3>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 12 }}>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>{p.beds} dorm · {p.baths} baños · {p.guests} huéspedes</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: "var(--bronze)", whiteSpace: "nowrap" }}>Desde {p.price.toLocaleString("es-ES")}€<span style={{ opacity: 0.7, fontSize: 11 }}> / noche</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExperienceCard({ icon, t, b }) {
  return (
    <div className="surface" style={{ padding: 32, transition: "transform .5s,box-shadow .5s,border-color .5s", borderRadius: 18 }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 20px 40px rgba(68,102,92,0.08)"; e.currentTarget.style.borderColor = "var(--olive)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = ""; }}
    >
      <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--olive-tint)", color: "var(--olive)", display: "grid", placeItems: "center", marginBottom: 22 }}>{icon}</div>
      <h4 style={{ fontFamily: "var(--serif)", fontSize: 24, fontWeight: 400 }}>{t}</h4>
      <p className="small" style={{ marginTop: 8 }}>{b}</p>
    </div>
  );
}

function ExperienceTile({ icon, t, b, img }) {
  return (
    <div className="tile" style={{ borderRadius: 18, height: 440, position: "relative", overflow: "hidden", cursor: "pointer" }}>
      <div style={{ position: "absolute", inset: 0 }}>
        <img src={img} alt={t} style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.8) 100%)" }}></div>
      </div>
      <div style={{ position: "absolute", top: 22, left: 22, width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)", color: "var(--olive)", display: "grid", placeItems: "center" }}>{icon}</div>
      <div style={{ position: "absolute", top: 22, right: 22, padding: "6px 12px", borderRadius: 999, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(10px)", color: "var(--bronze)", fontSize: 10, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", border: "1px solid rgba(254,182,74,0.3)" }}>Solicitar desde Guest App</div>
      <div style={{ position: "absolute", bottom: 24, left: 24, right: 24, color: "#fff" }}>
        <h4 style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 400, color: "#fff" }}>{t}</h4>
        <p style={{ marginTop: 6, fontSize: 13, color: "rgba(255,255,255,0.78)" }}>{b}</p>
      </div>
      <div style={{ position: "absolute", bottom: 24, right: 24, width: 38, height: 38, borderRadius: "50%", background: "var(--bronze)", color: "var(--ink)", display: "grid", placeItems: "center", transition: "transform .3s" }}><Icon.arrow width="15" height="15"/></div>
    </div>
  );
}

function CTACell({ eyebrow, title, body, btn, variant, border, onClick }) {
  return (
    <div style={{ padding: "64px 48px", borderRight: border ? "none" : "1px solid rgba(255,255,255,0.18)", display: "flex", flexDirection: "column", gap: 22 }}>
      <div className="eyebrow" style={{ color: "var(--bronze)" }}>{eyebrow}</div>
      <h3 className="h3" style={{ color: "var(--stone)", fontSize: "clamp(26px, 2.4vw, 36px)", maxWidth: "18ch" }}>{title}</h3>
      <p className="body" style={{ color: "rgba(255,255,255,0.7)", maxWidth: "40ch" }}>{body}</p>
      <MagneticBtn className={variant === "gold" ? "btn btn-bronze glow-hover" : "btn btn-ghost-light"} style={{ alignSelf: "flex-start", marginTop: 12 }} onClick={onClick}>{btn}<Icon.arrow className="arrow" width="14" height="14"/></MagneticBtn>
    </div>
  );
}

function DualPath({ dark, tag, title, body, image, tags, btn }) {  return (
    <div className="tilt" style={{
      borderRadius: 22, overflow: "hidden", position: "relative", height: 560,
      background: dark ? "var(--olive)" : "var(--stone)", color: dark ? "var(--stone)" : "var(--ink)",
      border: "1px solid", borderColor: dark ? "transparent" : "var(--line-soft)"
    }}>
      <div style={{ position: "absolute", inset: 0, opacity: dark ? 0.35 : 0.5 }}>
        <img src={image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
        <div style={{ position: "absolute", inset: 0, background: dark
          ? "linear-gradient(180deg, rgba(44,78,69,0.5) 0%, var(--olive) 75%)"
          : "linear-gradient(180deg, transparent 0%, var(--stone) 75%)" }}></div>
      </div>
      <div style={{ position: "relative", padding: 40, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
        <div className="eyebrow" style={{ color: dark ? "var(--bronze)" : "var(--olive)" }}>{tag}</div>
        <h3 style={{ fontFamily: "var(--serif)", fontSize: "clamp(28px, 2.8vw, 42px)", fontWeight: 300, marginTop: 14, color: dark ? "var(--stone)" : "var(--ink)", lineHeight: 1.1 }}>{title}</h3>
        <p className="body" style={{ marginTop: 16, maxWidth: "44ch", color: dark ? "rgba(255,255,255,0.75)" : "var(--ink-2)" }}>{body}</p>
        <div style={{ display: "flex", gap: 8, marginTop: 22, flexWrap: "wrap" }}>
          {tags.map(t => (
            <span key={t} style={{ display: "inline-flex", padding: "5px 12px", borderRadius: 999, fontSize: 10.5, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 600,
              background: dark ? "rgba(255,255,255,0.08)" : "var(--olive-tint)",
              color: dark ? "var(--bronze)" : "var(--olive)",
              border: "1px solid", borderColor: dark ? "rgba(255,255,255,0.12)" : "transparent" }}>{t}</span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 28, flexWrap: "wrap" }}>
          {btn.map((b, i) => (
            <MagneticBtn key={i} className={b.gold ? "btn btn-bronze glow-hover" : dark ? "btn btn-ghost-light" : "btn btn-ghost"} onClick={b.action}>
              {b.l}{b.external ? <ExternalArrow/> : <Icon.arrow className="arrow" width="13" height="13"/>}
            </MagneticBtn>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- LARGE GUEST APP PHONE ---------------- */
function GuestAppPhone() {
  return (
    <div style={{ position: "relative", display: "flex", justifyContent: "center", perspective: 1400 }}>
      {/* glow */}
      <div style={{ position: "absolute", width: 460, height: 460, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(254,182,74,0.15), transparent 70%)", left: "50%", top: "50%", transform: "translate(-50%,-50%)", filter: "blur(20px)" }}></div>

      <div style={{ width: 360, background: "#1c1b1b", padding: 10, borderRadius: 48, boxShadow: "0 40px 80px -20px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.05) inset", position: "relative", transform: "rotateY(-3deg) rotateX(2deg)" }}>
        {/* Notch */}
        <div style={{ position: "absolute", top: 18, left: "50%", transform: "translateX(-50%)", width: 110, height: 28, background: "#000", borderRadius: 999, zIndex: 5 }}></div>
        <div style={{ background: "var(--stone)", borderRadius: 40, overflow: "hidden", position: "relative", minHeight: 720 }}>
          {/* Status bar */}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 26px 0", fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>
            <span>9:41</span>
            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
              <Icon.wifi width="14" height="14"/>
              <svg width="22" height="11" viewBox="0 0 24 12" fill="none"><rect x="0.5" y="0.5" width="20" height="11" rx="2.5" stroke="currentColor" opacity="0.6"/><rect x="2" y="2" width="16" height="8" rx="1.5" fill="currentColor"/><rect x="21" y="3" width="2" height="6" rx="1" fill="currentColor" opacity="0.6"/></svg>
            </div>
          </div>

          <div style={{ padding: "44px 22px 100px", display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div className="mono" style={{ fontSize: 9.5, letterSpacing: "0.2em", color: "var(--olive)", textTransform: "uppercase" }}>Bienvenido</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>Mr. Andersen</div>
              </div>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--olive)", color: "var(--bronze)", display: "grid", placeItems: "center", fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 17, fontWeight: 500 }}>A</div>
            </div>

            {/* Hero card */}
            <div style={{ background: "var(--olive)", color: "var(--stone)", borderRadius: 22, padding: 20, position: "relative", overflow: "hidden" }}>
              <div className="mono" style={{ fontSize: 9.5, letterSpacing: "0.2em", color: "var(--bronze)", textTransform: "uppercase" }}>Su residencia</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 26, marginTop: 4, lineHeight: 1.15 }}>Villa Alborán</div>
              <div style={{ fontSize: 11, marginTop: 6, opacity: 0.7 }}>Marbella · Llegada hoy, 16:00</div>
              <div style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ flex: 1, height: 6, borderRadius: 999, background: "rgba(255,255,255,0.18)", overflow: "hidden" }}><div style={{ width: "78%", height: "100%", background: "var(--bronze)" }}></div></div>
                <div className="mono" style={{ fontSize: 10, opacity: 0.8 }}>4h 12m</div>
              </div>
            </div>

            {/* Open door */}
            <div style={{ background: "#fff", border: "1px solid var(--line-soft)", borderRadius: 18, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div className="mono" style={{ fontSize: 9.5, letterSpacing: "0.18em", color: "var(--olive)", textTransform: "uppercase" }}>Acceso inteligente</div>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 18, marginTop: 2 }}>Abrir residencia</div>
                </div>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--olive-tint)", color: "var(--olive)", display: "grid", placeItems: "center" }}><Icon.key width="16" height="16"/></div>
              </div>
              <div style={{ height: 42, borderRadius: 999, background: "linear-gradient(90deg, var(--bronze) 0%, #ffc870 100%)", display: "flex", alignItems: "center", padding: 4, position: "relative" }}>
                <div style={{ width: 34, height: 34, background: "#fff", borderRadius: "50%", display: "grid", placeItems: "center", color: "var(--ink)" }}><Icon.arrow width="14" height="14"/></div>
                <span style={{ flex: 1, textAlign: "center", fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink)", marginRight: 34 }}>Deslizar para abrir</span>
              </div>
            </div>

            {/* Quick actions */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { i: <Icon.chef width="16" height="16"/>, t: "Chef privado", s: "Disponible esta noche" },
                { i: <Icon.spa width="16" height="16"/>, t: "Masaje en villa", s: "20:00 reservado" },
                { i: <Icon.car width="16" height="16"/>, t: "Transfer", s: "AGP · 16:00" },
                { i: <Icon.sparkles width="16" height="16"/>, t: "Concierge", s: "Responde en 2 min" },
              ].map((x, i) => (
                <div key={i} style={{ background: "#fff", border: "1px solid var(--line-soft)", borderRadius: 14, padding: 12, minHeight: 78, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--olive-tint)", color: "var(--olive)", display: "grid", placeItems: "center" }}>{x.i}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{x.t}</div>
                    <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 1 }}>{x.s}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Concierge message */}
            <div style={{ background: "#fff", border: "1px solid var(--line-soft)", borderRadius: 14, padding: 14, display: "flex", gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--olive)", color: "var(--stone)", display: "grid", placeItems: "center", flexShrink: 0, fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 15 }}>L</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>Laura · Conserje SEDA</div>
                  <div className="mono" style={{ fontSize: 9, color: "var(--muted)" }}>19:30</div>
                </div>
                <div style={{ fontSize: 12, marginTop: 4, color: "var(--ink-2)", lineHeight: 1.4 }}>Su cena con el chef Alejandro está confirmada. Comenzamos a las 20:30 en la terraza.</div>
              </div>
            </div>
          </div>

          {/* Tab bar */}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, background: "#fff", borderTop: "1px solid var(--line-soft)", padding: "12px 26px 26px", display: "flex", justifyContent: "space-between" }}>
            {[
              [<Icon.sparkles width="18" height="18"/>, "Estancia", true],
              [<Icon.key width="18" height="18"/>, "Acceso"],
              [<Icon.bell width="18" height="18"/>, "Concierge"],
              [<Icon.doc width="18" height="18"/>, "Guía"],
            ].map(([i, t, active], idx) => (
              <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: active ? "var(--olive)" : "var(--muted)" }}>
                {i}
                <span style={{ fontSize: 9.5, fontWeight: active ? 700 : 500 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- SEDA OS PREVIEW (compact dashboard for home page) ---------------- */
function SedaOSPreview() {
  return (
    <div style={{ background: "#fff", color: "var(--ink)", borderRadius: 18, padding: 24, boxShadow: "0 40px 80px -30px rgba(0,0,0,0.5)" }}>
      {/* App chrome */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 18, borderBottom: "1px solid var(--line-soft)" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--olive)", color: "var(--bronze)", display: "grid", placeItems: "center", fontFamily: "var(--serif)", fontStyle: "italic", fontWeight: 500, fontSize: 16 }}>S</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>SEDA OS</div>
            <div className="mono" style={{ fontSize: 9.5, letterSpacing: "0.16em", color: "var(--muted)", textTransform: "uppercase" }}>Reporting Propietario</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span className="chip chip-line" style={{ background: "var(--olive-tint)", borderColor: "transparent", color: "var(--olive)" }}><span style={{ width: 6, height: 6, background: "#5fbf8e", borderRadius: "50%" }}></span>Operativo</span>
          <span className="mono" style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.12em" }}>OCT 2026</span>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 22 }}>
        {[
          { label: "Ingresos previstos", value: "€45.000", delta: "+12% vs prev.", up: true },
          { label: "Ocupación", value: "78%", delta: "+6 pts", up: true },
          { label: "Liquidación próxima", value: "€8.420", delta: "01 Nov", up: false },
        ].map((k, i) => (
          <div key={i} style={{ border: "1px solid var(--line-soft)", borderRadius: 12, padding: 16, background: "var(--stone)" }}>
            <div className="mono" style={{ fontSize: 9.5, letterSpacing: "0.18em", color: "var(--muted)", textTransform: "uppercase" }}>{k.label}</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 30, marginTop: 6 }}>{k.value}</div>
            <div style={{ fontSize: 11, color: k.up ? "var(--olive)" : "var(--ink-2)", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
              {k.up && <Icon.arrow width="11" height="11" style={{ transform: "rotate(-45deg)" }}/>}{k.delta}
            </div>
          </div>
        ))}
      </div>

      {/* Sparkline + calendar */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 12, marginTop: 12 }}>
        <div style={{ border: "1px solid var(--line-soft)", borderRadius: 12, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="mono" style={{ fontSize: 9.5, letterSpacing: "0.18em", color: "var(--muted)", textTransform: "uppercase" }}>Calendario · Villa Alborán</div>
            <div className="mono" style={{ fontSize: 10, color: "var(--muted)" }}>OCT — DIC</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(36, 1fr)", gap: 2, marginTop: 14 }}>
            {Array.from({ length: 36 }).map((_, i) => {
              const olive = [2,3,4,5,6,7,12,13,14,21,22,23,24,25,30,31,32].includes(i);
              const gold = [9,10,18].includes(i);
              const ink = [27,28].includes(i);
              const bg = olive ? "var(--olive)" : gold ? "var(--bronze)" : ink ? "var(--ink-2)" : "var(--stone-2)";
              return <div key={i} style={{ height: 22, borderRadius: 3, background: bg }}></div>;
            })}
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 14 }}>
            <Legend color="var(--olive)" label="Reservado"/>
            <Legend color="var(--bronze)" label="Propietario"/>
            <Legend color="var(--ink-2)" label="Mantenimiento"/>
          </div>
        </div>

        <div style={{ background: "var(--olive)", color: "var(--stone)", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div className="mono" style={{ fontSize: 9.5, letterSpacing: "0.18em", color: "var(--bronze)", textTransform: "uppercase" }}>Estado operativo</div>
          <div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 24, color: "var(--stone)" }}>Todo en orden</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>0 incidencias · 3 mantenimientos preventivos · 1 limpieza activa</div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {Array.from({ length: 7 }).map((_, i) => <span key={i} style={{ flex: 1, height: 4, background: i < 6 ? "var(--bronze)" : "rgba(255,255,255,0.2)", borderRadius: 2 }}></span>)}
          </div>
        </div>
      </div>

      {/* Liquidation */}
      <div style={{ border: "1px solid var(--line-soft)", borderRadius: 12, padding: 18, marginTop: 12 }}>
        <div className="mono" style={{ fontSize: 9.5, letterSpacing: "0.18em", color: "var(--muted)", textTransform: "uppercase" }}>Liquidación · Octubre 2026</div>
        <div style={{ marginTop: 12 }}>
          {[["Ingresos brutos","€ 38.420"],["Comisión SEDA","− € 6.915"],["Servicios","− € 1.240"],["Neto al propietario","€ 30.265"]].map(([k,v], i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < 3 ? "1px solid var(--line-soft)" : "none" }}>
              <span style={{ fontSize: 12.5, fontWeight: i === 3 ? 700 : 400, color: i === 3 ? "var(--olive)" : "var(--ink-2)" }}>{k}</span>
              <span className="mono" style={{ fontSize: 12.5, fontWeight: i === 3 ? 700 : 500, color: i === 3 ? "var(--olive)" : "var(--ink)" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10.5, color: "var(--muted)" }}>
    <span style={{ width: 8, height: 8, background: color, borderRadius: 2 }}></span>{label}
  </span>;
}

function BentoCell({ children, span = "3/1", highlight, image }) {
  const [cols, rows] = span.split("/").map(Number);
  const dark = highlight;
  return (
    <div className="tilt" style={{
      gridColumn: `span ${cols}`,
      gridRow: `span ${rows}`,
      background: dark ? "var(--ink)" : "#fff",
      color: dark ? "#fff" : "var(--ink)",
      border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid var(--line-soft)",
      borderRadius: 18, padding: 32, position: "relative", overflow: "hidden",
      transition: "transform .4s, box-shadow .4s",
      minHeight: rows > 1 ? 380 : 180,
    }}>
      {image && (
        <>
          <img src={image} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}/>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.7) 100%)" }}></div>
        </>
      )}
      <div style={{ position: "relative", zIndex: 1, height: "100%" }}>{children}</div>
    </div>
  );
}

/* ---------- HOMORA-STYLE 3-UP with tabs ---------- */
function HomoraTabs({ onNav }) {
  const [tab, setTab] = useState("Todas");
  const TABS = ["Todas", "Villas", "Apartamentos", "Frente al mar", "Piscina privada"];
  const list = PROPERTIES.filter(p => {
    if (tab === "Todas") return true;
    if (tab === "Villas") return p.beds >= 4 && p.amenities.includes("pool");
    if (tab === "Apartamentos") return p.amenities.includes("apt");
    if (tab === "Frente al mar") return p.amenities.includes("sea");
    if (tab === "Piscina privada") return p.amenities.includes("pool");
    return true;
  }).slice(0, 6);

  return (
    <div>
      {/* TAB ROW */}
      <div style={{ display: "flex", gap: 6, marginBottom: 36, flexWrap: "wrap" }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "10px 18px", borderRadius: 999, fontSize: 11.5, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600,
            border: "1px solid", borderColor: tab === t ? "var(--carbon)" : "var(--line)",
            background: tab === t ? "var(--carbon)" : "transparent",
            color: tab === t ? "var(--travertine)" : "var(--ink-2)",
            transition: "all .25s", cursor: "pointer"
          }}>{t}</button>
        ))}
      </div>

      {/* 3 LARGE CARDS PER ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
        {list.slice(0, 3).map((p, i) => (
          <Reveal key={p.id} delay={i * 100}>
            <HomoraTallCard p={p} onClick={() => onNav("coleccion")}/>
          </Reveal>
        ))}
      </div>

      {/* SECONDARY ROW if more than 3 */}
      {list.length > 3 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28, marginTop: 28 }}>
          {list.slice(3, 6).map((p, i) => (
            <Reveal key={p.id} delay={i * 100}>
              <HomoraTallCard p={p} onClick={() => onNav("coleccion")}/>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}

function HomoraTallCard({ p, onClick }) {
  const priceLabel = p.price >= 3000 ? "Bajo consulta" : `Desde ${p.price.toLocaleString("es-ES")}€`;
  return (
    <div className="tilt" style={{ cursor: "pointer", transition: "transform .4s" }} onClick={onClick}>
      <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", marginBottom: 22, transition: "border-color .35s" }} className="img-zoom-wrap">
        <div style={{ aspectRatio: "4/5", overflow: "hidden", position: "relative" }}>
          <img src={p.photo} alt={p.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
        </div>
        <div style={{ position: "absolute", top: 16, left: 16, display: "flex", gap: 6, flexWrap: "wrap" }}>
          {p.tags.slice(0, 2).map(t => (
            <span key={t} style={{ padding: "6px 12px", borderRadius: 999, background: "rgba(250,247,240,0.92)", backdropFilter: "blur(10px)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, color: "var(--carbon)" }}>{t}</span>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14 }}>
        <div>
          <div className="mono" style={{ fontSize: 10.5, letterSpacing: "0.2em", color: "var(--cypress)", textTransform: "uppercase" }}>{p.city} · {p.region}</div>
          <h3 style={{ fontFamily: "var(--serif)", fontSize: 28, fontWeight: 400, marginTop: 6 }}>{p.name}</h3>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div className="mono" style={{ fontSize: 9.5, letterSpacing: "0.18em", color: "var(--muted)", textTransform: "uppercase" }}>{p.price >= 3000 ? "Tarifa" : "Desde"}</div>
          <div style={{ fontFamily: "var(--serif)", fontSize: 22, marginTop: 4, color: "var(--carbon)", whiteSpace: "nowrap" }}>
            {p.price >= 3000 ? "Bajo consulta" : <>{p.price.toLocaleString("es-ES")}€</>}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 18, marginTop: 14, color: "var(--ink-2)", fontSize: 13, paddingBottom: 18, borderBottom: "1px solid var(--line-soft)" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Icon.guests width="14" height="14"/>{p.guests} hués.</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Icon.bed width="14" height="14"/>{p.beds} dorm</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Icon.bath width="14" height="14"/>{p.baths} baños</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {p.tags.slice(2, 3).map(t => (
            <span key={t} className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)" }}>{t}</span>
          ))}
        </div>
        <button className="btn-text" style={{ fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 8 }}
          onClick={(e) => { e.stopPropagation(); onClick && onClick(); }}>
          Consultar disponibilidad<Icon.arrow width="13" height="13"/>
        </button>
      </div>
    </div>
  );
}

/* ---------- SEDA SPLIT EXPERIENCE ---------- */
function SplitExperience({ onNav }) {
  const [hover, setHover] = useState(null);  // 'guest' | 'owner' | null
  const flexL = hover === "guest" ? 1.5 : hover === "owner" ? 0.85 : 1;
  const flexR = hover === "owner" ? 1.5 : hover === "guest" ? 0.85 : 1;
  return (
    <section style={{ padding: 0, position: "relative" }}>
      <div style={{ display: "flex", height: "80vh", minHeight: 620 }}
        onMouseLeave={() => setHover(null)}>
        {/* LEFT — Huésped */}
        <SplitPanel
          side="left"
          flex={flexL}
          onMouseEnter={() => setHover("guest")}
          label="Como huésped"
          headline={<>Una estancia <em>sin fricción.</em></>}
          copy="Cada llegada, código, recomendación y solicitud vive en la Guest App."
          image={PIC.terrace}
          chips={["Check-in guiado", "Código listo", "Concierge IA", "Discover Costa del Sol"]}
          cta="Ver Guest App"
          ctaAction={() => onNav("guestapp")}
          secondary="Acceso huéspedes"
          secondaryAction={() => openExternal(URL_HUESPED)}
          floating={<GuestFloatingMock/>}
        />

        {/* RIGHT — Propietario */}
        <SplitPanel
          side="right"
          flex={flexR}
          onMouseEnter={() => setHover("owner")}
          label="Como propietario"
          headline={<>Tu propiedad, <em>bajo control total.</em></>}
          copy="SEDA OS conecta reservas, ingresos, mantenimiento y reporting en un único sistema."
          image={PIC.ownerHero}
          chips={["Ocupación 78%", "Ingresos €45.000", "Liquidación €8.420", "Guest App activa"]}
          cta="Soy propietario"
          ctaAction={() => onNav("propietarios")}
          secondary="Acceso propietarios"
          secondaryAction={() => openExternal(URL_PROPIETARIO)}
          dark
          floating={<OwnerFloatingMock/>}
        />
      </div>
    </section>
  );
}

function SplitPanel({ side, flex, onMouseEnter, label, headline, copy, image, chips, cta, ctaAction, secondary, secondaryAction, dark, floating }) {
  return (
    <div onMouseEnter={onMouseEnter} style={{
      flex, position: "relative", overflow: "hidden",
      transition: "flex 1.1s cubic-bezier(.2,.8,.2,1)", cursor: "pointer",
      borderRight: side === "left" ? "1px solid rgba(0,0,0,0.18)" : "none",
    }}>
      {/* BG image */}
      <div style={{ position: "absolute", inset: 0 }}>
        <img src={image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.05)", transition: "transform 8s ease" }}/>
        <div style={{ position: "absolute", inset: 0, background: dark
          ? "linear-gradient(140deg, rgba(21,21,21,0.55) 0%, rgba(31,47,43,0.85) 100%)"
          : "linear-gradient(140deg, rgba(21,21,21,0.32) 0%, rgba(21,21,21,0.7) 100%)" }}></div>
      </div>

      {/* Floating chips */}
      <div style={{ position: "absolute", top: 80, [side === "left" ? "right" : "left"]: 48, display: "flex", flexDirection: "column", gap: 12, zIndex: 2, pointerEvents: "none" }}>
        {chips.map((c, i) => (
          <span key={c} style={{
            display: "inline-block", padding: "8px 14px", borderRadius: 999,
            background: "rgba(250,247,240,0.14)", backdropFilter: "blur(14px)", border: "1px solid rgba(250,247,240,0.2)",
            color: "var(--travertine)", fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600,
            transform: `translateY(${i * 4}px)`, opacity: 0.92,
            alignSelf: side === "left" ? "flex-end" : "flex-start", whiteSpace: "nowrap",
            animation: `float-y 6s ease-in-out infinite ${i * 0.5}s`,
          }}>{c}</span>
        ))}
      </div>

      {/* Floating mockup */}
      <div style={{ position: "absolute", [side === "left" ? "right" : "left"]: -40, bottom: -40, zIndex: 1, opacity: 0.92, pointerEvents: "none" }}>
        {floating}
      </div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 3, padding: "72px 56px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", color: "var(--travertine)" }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: "0.22em", color: "var(--bronze)", textTransform: "uppercase", fontWeight: 700 }}>{label}</div>
        <h3 style={{ fontFamily: "var(--serif)", fontSize: "clamp(40px, 4.4vw, 64px)", fontWeight: 300, lineHeight: 1.05, marginTop: 18, color: "var(--travertine)", maxWidth: "14ch" }}>
          {headline}
        </h3>
        <p style={{ marginTop: 18, fontSize: 16, lineHeight: 1.6, color: "rgba(250,247,240,0.85)", maxWidth: "42ch" }}>{copy}</p>
        <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
          <MagneticBtn className="btn btn-bronze glow-hover" onClick={ctaAction}>{cta}<Icon.arrow className="arrow" width="14" height="14"/></MagneticBtn>
          <MagneticBtn className="btn btn-ghost-light" onClick={secondaryAction}>{secondary}<ExternalArrow/></MagneticBtn>
        </div>
      </div>
    </div>
  );
}

function GuestFloatingMock() {
  return (
    <div style={{ width: 220, height: 460, background: "var(--carbon)", padding: 8, borderRadius: 36, boxShadow: "0 40px 80px -20px rgba(0,0,0,0.6)", transform: "rotate(-3deg)" }}>
      <div style={{ position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)", width: 70, height: 18, background: "#000", borderRadius: 999, zIndex: 5 }}></div>
      <div style={{ background: "var(--travertine)", borderRadius: 28, height: "100%", padding: "32px 14px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="mono" style={{ fontSize: 8.5, letterSpacing: "0.18em", color: "var(--cypress)" }}>ARRIVAL · TORREMOLINOS</div>
        <div style={{ fontFamily: "var(--serif)", fontSize: 18, lineHeight: 1.1, color: "var(--carbon)" }}>Su llegada, <em>guiada.</em></div>
        <div style={{ background: "var(--cypress)", color: "var(--travertine)", borderRadius: 10, padding: 10, marginTop: 4 }}>
          <div className="mono" style={{ fontSize: 8, color: "var(--bronze)", letterSpacing: "0.16em" }}>MAIN GATE</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 22, marginTop: 4, letterSpacing: "0.2em" }}>4829#</div>
        </div>
        {["Map", "Wi-Fi", "Concierge"].map((t, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 8, padding: 8, fontSize: 10, fontWeight: 600, color: "var(--carbon)" }}>{t}</div>
        ))}
      </div>
    </div>
  );
}

function OwnerFloatingMock() {
  return (
    <div style={{ width: 340, background: "var(--warm-white)", borderRadius: 16, padding: 18, boxShadow: "0 40px 80px -20px rgba(0,0,0,0.5)", transform: "rotate(2deg)", border: "1px solid var(--line-soft)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 14, borderBottom: "1px solid var(--line-soft)" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ width: 22, height: 22, borderRadius: 5, background: "var(--cypress)", color: "var(--bronze)", display: "grid", placeItems: "center", fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 12, fontWeight: 500 }}>S</span>
          <span className="mono" style={{ fontSize: 9, letterSpacing: "0.16em", color: "var(--carbon)" }}>SEDA OS · LIVE</span>
        </div>
        <span style={{ display: "inline-flex", gap: 5, alignItems: "center", fontSize: 9, color: "#3a9a64" }}><span style={{ width: 6, height: 6, background: "#3a9a64", borderRadius: "50%" }}></span>OPERATIVO</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
        {[["INGRESOS", "€45K"], ["OCUPACIÓN", "78%"], ["CHECK-INS", "3"], ["LIQUIDACIÓN", "€8.420"]].map(([k, v], i) => (
          <div key={i} style={{ padding: 10, background: "var(--travertine)", borderRadius: 8 }}>
            <div className="mono" style={{ fontSize: 8, color: "var(--muted)", letterSpacing: "0.16em" }}>{k}</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 18, color: "var(--carbon)", marginTop: 2 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { BentoCell, HomoraTabs, HomoraTallCard, SplitExperience });
Object.assign(window, { PageHome });
