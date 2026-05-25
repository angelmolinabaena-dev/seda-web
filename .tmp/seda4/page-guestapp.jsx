// GUEST APP PAGE — protagonist product page

const GUEST_APP_DEMO_URL = "https://guests.sedaprivatehomes.com/villa/apartamento-torremolinos/d1389271-1fbc-4d8a-8bb1-bfc0464d3bfc";

function PageGuestApp({ onNav }) {
  return (
    <div>
      {/* HERO */}
      <header style={{ position: "relative", minHeight: "92vh", overflow: "hidden", display: "flex", alignItems: "center", paddingTop: 140, paddingBottom: 96 }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 20% 30%, rgba(254,182,74,0.18), transparent 50%), radial-gradient(circle at 80% 70%, rgba(68,102,92,0.18), transparent 50%), var(--stone)" }}></div>

        <div className="wrap" style={{ position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "1.05fr 1fr", gap: 56, alignItems: "center" }}>
          <div>
            <Reveal>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px", background: "rgba(68,102,92,0.08)", borderRadius: 999, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600, color: "var(--olive)" }}>
                <span style={{ width: 7, height: 7, background: "#5fbf8e", borderRadius: "50%" }}></span>App Huésped · En producción
              </div>
            </Reveal>
            <KineticHeadline as="h1" className="h-display" text="Una estancia <em>completa</em> en el móvil del huésped." style={{ marginTop: 28, fontSize: "clamp(48px, 6.4vw, 88px)" }} delay={100} />
            <Reveal delay={500}>
              <p className="lead" style={{ marginTop: 28, maxWidth: "48ch" }}>
                Desde la llegada hasta el check-out, cada instrucción, código, recomendación y solicitud vive dentro de una interfaz privada, clara y diseñada para no interrumpir la experiencia.
              </p>
            </Reveal>
            <Reveal delay={600}>
              <div style={{ display: "flex", gap: 12, marginTop: 40, flexWrap: "wrap" }}>
                <MagneticBtn className="btn btn-primary glow-hover" onClick={() => openExternal(URL_HUESPED)}>
                  Acceso huéspedes<ExternalArrow/>
                </MagneticBtn>
                <MagneticBtn className="btn btn-ghost" onClick={() => onNav("coleccion")}>
                  Explorar Colección<Icon.arrow className="arrow" width="14" height="14"/>
                </MagneticBtn>
              </div>
            </Reveal>
            <Reveal delay={700}>
              <div style={{ display: "flex", gap: 18, marginTop: 40, alignItems: "center" }}>
                <div style={{ display: "flex" }}>
                  {["AGP", "MJ", "T", "L"].map((c, i) => (
                    <div key={i} style={{ width: 32, height: 32, borderRadius: "50%", background: i % 2 ? "var(--bronze)" : "var(--olive)", color: "var(--stone)", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700, marginLeft: i ? -8 : 0, border: "2px solid var(--stone)" }}>{c}</div>
                  ))}
                </div>
                <div className="small">12.480 estancias coordinadas desde la App en 2026</div>
              </div>
            </Reveal>
          </div>

          <Reveal delay={200}>
            <HeroPhoneStack />
          </Reveal>
        </div>
      </header>

      {/* ANATOMY — 5 navigation tabs as bento */}
      <section style={{ background: "var(--stone)" }}>
        <div className="wrap">
          <Reveal>
            <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto" }}>
              <div className="eyebrow">— Arquitectura</div>
              <h2 className="h2" style={{ marginTop: 14 }}>Cinco pestañas. <em>Una sola estancia.</em></h2>
              <p className="lead" style={{ marginTop: 18 }}>Toda la experiencia organizada en cinco caminos: día a día, llegada, conserje, durante la estancia, y descubrir el destino.</p>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginTop: 56 }}>
            {[
              { i: <Icon.sparkles width="22" height="22"/>, t: "Today", b: "Lo que importa hoy. Reservas, horarios, accesos." },
              { i: <Icon.key width="22" height="22"/>, t: "Arrival", b: "Guía de llegada con código y direcciones." },
              { i: <Icon.bell width="22" height="22"/>, t: "Ask SEDA", b: "Concierge IA y humano, 24/7. Centro del producto." },
              { i: <Icon.doc width="22" height="22"/>, t: "Stay", b: "Wi-Fi, climatización, normas, manual de la villa." },
              { i: <Icon.map width="22" height="22"/>, t: "Discover", b: "Costa del Sol curada por SEDA: comer, hacer, ver." },
            ].map((tab, i) => (
              <Reveal key={i} delay={i * 70}>
                <BentoTab {...tab} highlight={tab.t === "Ask SEDA"} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* JOURNEY — STICKY SCROLL STORY */}
      <section style={{ background: "var(--stone-2)", overflow: "visible" }}>
        <div className="wrap">
          <Reveal>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24, marginBottom: 32 }}>
              <div>
                <div className="eyebrow">— Recorrido del huésped</div>
                <h2 className="h2" style={{ marginTop: 14 }}>De la llegada al <em>check-out.</em></h2>
              </div>
              <p className="body" style={{ maxWidth: "44ch" }}>Sticky scroll. Cinco pantallas reales — cada una aparece cuando le toca.</p>
            </div>
          </Reveal>
          <StickyScrollStory/>
        </div>
      </section>

      {/* FEATURES strip — quiet, dense */}
      <section style={{ background: "var(--stone)" }}>
        <div className="wrap">
          <Reveal>
            <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto" }}>
              <div className="eyebrow">— Características</div>
              <h2 className="h2" style={{ marginTop: 14 }}>Detalles que no se ven, <em>pero se notan.</em></h2>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginTop: 56 }}>
            {[
              { i: <Icon.key width="22" height="22"/>, t: "Apertura sin llave", b: "Nuki Smart Lock integrado. Códigos temporales por estancia." },
              { i: <Icon.wifi width="22" height="22"/>, t: "Wi-Fi fibra 1 Gbps", b: "Detalles del router y QR de conexión en un toque." },
              { i: <Icon.bell width="22" height="22"/>, t: "Conserje 24/7", b: "Equipo SEDA local + Ask SEDA IA. Respuesta en < 2 min." },
              { i: <Icon.globe width="22" height="22"/>, t: "Multilingüe", b: "ES · EN · DE · FR de forma nativa, sin traducción automática." },
              { i: <Icon.chef width="22" height="22"/>, t: "Experiencias", b: "Chef, masaje, barco y golf pre-reservables." },
              { i: <Icon.doc width="22" height="22"/>, t: "Manual de la villa", b: "Climatización, cocina, piscina, sauna — todo documentado." },
              { i: <Icon.shield width="22" height="22"/>, t: "Privacidad", b: "Datos cifrados. Sin tracking de terceros." },
              { i: <Icon.lock width="22" height="22"/>, t: "Compliance", b: "RD 633/2021 · SES Hospedajes · firma digital." },
            ].map((f, i) => (
              <Reveal key={i} delay={i * 40}>
                <div className="surface tilt" style={{ padding: 24 }}>
                  <span style={{ color: "var(--olive)" }}>{f.i}</span>
                  <h4 style={{ fontFamily: "var(--serif)", fontSize: 20, marginTop: 16 }}>{f.t}</h4>
                  <p className="small" style={{ marginTop: 6 }}>{f.b}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <section style={{ background: "var(--ink)", color: "#fff", padding: "56px 0" }}>
        <Marquee items={["Apertura sin llave", "Concierge en vivo", "Discover Costa del Sol", "Reservas integradas", "Multilingüe ES·EN·DE·FR", "Climatización smart", "Asistencia 24/7", "Manual nativo de villa"]}/>
      </section>

      {/* CTA */}
      <section style={{ background: "var(--olive)", color: "var(--stone)", paddingTop: 120, paddingBottom: 120 }}>
        <div className="wrap" style={{ textAlign: "center" }}>
          <Reveal>
            <div className="eyebrow" style={{ color: "var(--bronze)" }}>— Producto real</div>
            <h2 className="h-display" style={{ marginTop: 18, color: "var(--stone)", maxWidth: "16ch", margin: "18px auto 0", fontSize: "clamp(40px,5vw,72px)" }}>
              Pruebe la app <em style={{ color: "var(--bronze)" }}>como un huésped real.</em>
            </h2>
            <p className="lead" style={{ marginTop: 22, color: "rgba(255,255,255,0.78)", maxWidth: 560, margin: "22px auto 0" }}>
              Acceso directo al entorno de huéspedes de SEDA. Apertura, mapa, Ask SEDA y Discover.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 40, justifyContent: "center", flexWrap: "wrap" }}>
              <MagneticBtn className="btn btn-bronze glow-hover" onClick={() => openExternal(URL_HUESPED)}>
                Acceso huéspedes<ExternalArrow/>
              </MagneticBtn>
              <MagneticBtn className="btn btn-ghost-light" onClick={() => onNav("coleccion")}>
                Explorar Colección<Icon.arrow className="arrow" width="14" height="14"/>
              </MagneticBtn>
            </div>
            <div className="mono" style={{ marginTop: 32, fontSize: 11, color: "rgba(255,255,255,0.5)", letterSpacing: "0.16em", wordBreak: "break-all" }}>
              guests.sedaprivatehomes.com/villa/apartamento-torremolinos
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

/* HERO PHONE STACK — 3 phones offset */
function HeroPhoneStack() {
  return (
    <div style={{ position: "relative", height: 640, display: "flex", justifyContent: "center", perspective: 1400 }}>
      <div style={{ position: "absolute", left: "10%", top: "8%", transform: "rotate(-6deg) scale(0.85)", opacity: 0.55, zIndex: 0 }}>
        <PhoneFrame compact><MiniArrival/></PhoneFrame>
      </div>
      <div style={{ position: "absolute", right: "8%", top: "12%", transform: "rotate(6deg) scale(0.85)", opacity: 0.55, zIndex: 0 }}>
        <PhoneFrame compact><MiniDiscover/></PhoneFrame>
      </div>
      <div style={{ position: "relative", zIndex: 1, transform: "translateY(0px)" }}>
        <PhoneFrame featured><MiniToday/></PhoneFrame>
      </div>
    </div>
  );
}

function BentoTab({ i, t, b, highlight }) {
  return (
    <div className="surface tilt" style={{
      padding: 24, height: "100%", position: "relative", overflow: "hidden",
      background: highlight ? "var(--olive)" : "#fff",
      color: highlight ? "var(--stone)" : "var(--ink)",
      borderColor: highlight ? "var(--olive)" : "var(--line-soft)"
    }}>
      {highlight && <div style={{ position: "absolute", top: 16, right: 16, width: 36, height: 36, borderRadius: "50%", background: "var(--bronze)", color: "var(--olive)", display: "grid", placeItems: "center" }}><Icon.bolt width="16" height="16"/></div>}
      <div style={{ color: highlight ? "var(--bronze)" : "var(--olive)" }}>{i}</div>
      <h4 style={{ fontFamily: "var(--serif)", fontSize: 24, marginTop: 16, color: highlight ? "var(--stone)" : "var(--ink)" }}>{t}</h4>
      <p style={{ fontSize: 12.5, marginTop: 6, color: highlight ? "rgba(255,255,255,0.7)" : "var(--muted)", lineHeight: 1.55 }}>{b}</p>
    </div>
  );
}

function JourneyCard({ step, title, subtitle, body, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ background: "var(--stone)", border: "1px solid var(--line-soft)", borderRadius: 22, padding: "24px 24px 0", height: 520, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", overflow: "hidden" }}>
        {children}
      </div>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="mono" style={{ fontSize: 11, color: "var(--bronze-deep)", letterSpacing: "0.18em" }}>{step}</span>
          <span className="mono" style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.2em" }}>{subtitle}</span>
        </div>
        <h4 style={{ fontFamily: "var(--serif)", fontSize: 22, marginTop: 6 }}>{title}</h4>
        <p className="small" style={{ marginTop: 6 }}>{body}</p>
      </div>
    </div>
  );
}

/* ---------- Phone frame helpers ---------- */
function PhoneFrame({ children, compact, featured }) {
  const w = compact ? 240 : featured ? 320 : 280;
  const h = compact ? 480 : featured ? 640 : 560;
  return (
    <div style={{
      width: w, background: "#1c1b1b", padding: 8, borderRadius: 44,
      boxShadow: featured ? "0 50px 100px -30px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.05) inset" : "0 30px 60px -20px rgba(0,0,0,0.4)",
      position: "relative"
    }}>
      <div style={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", width: 90, height: 24, background: "#000", borderRadius: 999, zIndex: 5 }}></div>
      <div style={{ background: "var(--stone)", borderRadius: 36, overflow: "hidden", height: h, padding: "44px 16px 16px", display: "flex", flexDirection: "column" }}>
        {children}
      </div>
    </div>
  );
}

function PhoneStatusBar() {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "0 4px", fontSize: 11, fontWeight: 700, color: "var(--ink)" }}>
      <span>9:41</span>
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <Icon.wifi width="12" height="12"/>
        <svg width="18" height="9" viewBox="0 0 24 12" fill="none"><rect x="0.5" y="0.5" width="20" height="11" rx="2.5" stroke="currentColor" opacity="0.6"/><rect x="2" y="2" width="16" height="8" rx="1.5" fill="currentColor"/></svg>
      </div>
    </div>
  );
}

/* ---- screen contents ---- */
function MiniToday() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
      <PhoneStatusBar/>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        <div>
          <div className="mono" style={{ fontSize: 9, color: "var(--olive)", letterSpacing: "0.18em" }}>HOY · MARTES</div>
          <div style={{ fontFamily: "var(--serif)", fontSize: 22, lineHeight: 1.1, marginTop: 2 }}>Buenas tardes, <em>Andersen.</em></div>
        </div>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--olive)", color: "var(--bronze)", display: "grid", placeItems: "center", fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 14 }}>A</div>
      </div>
      <div style={{ background: "var(--olive)", color: "var(--stone)", borderRadius: 18, padding: 16 }}>
        <div className="mono" style={{ fontSize: 9, letterSpacing: "0.18em", color: "var(--bronze)" }}>HOY · 20:30</div>
        <div style={{ fontFamily: "var(--serif)", fontSize: 18, marginTop: 4 }}>Cena con chef Alejandro</div>
        <div style={{ fontSize: 10.5, opacity: 0.75, marginTop: 4 }}>Terraza · 4 personas · confirmada</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {[[<Icon.key width="14" height="14"/>, "Abrir"], [<Icon.bell width="14" height="14"/>, "Ask SEDA"], [<Icon.spa width="14" height="14"/>, "Spa"], [<Icon.car width="14" height="14"/>, "Transfer"]].map(([ic, t], i) => (
          <div key={i} style={{ background: "#fff", border: "1px solid var(--line-soft)", borderRadius: 12, padding: 10, display: "flex", flexDirection: "column", gap: 8, minHeight: 64 }}>
            <span style={{ width: 24, height: 24, borderRadius: 6, background: "var(--olive-tint)", color: "var(--olive)", display: "grid", placeItems: "center" }}>{ic}</span>
            <span style={{ fontSize: 10.5, fontWeight: 700 }}>{t}</span>
          </div>
        ))}
      </div>
      <div style={{ background: "#fff", border: "1px solid var(--line-soft)", borderRadius: 12, padding: 10 }}>
        <div className="mono" style={{ fontSize: 9, color: "var(--muted)", letterSpacing: "0.16em" }}>DISCOVER · CERCA</div>
        <div style={{ fontFamily: "var(--serif)", fontSize: 14, marginTop: 4 }}>Bibo Andaluz Brasserie</div>
        <div style={{ fontSize: 10, color: "var(--muted)" }}>Restaurante · 8 min</div>
      </div>
      <div style={{ flex: 1 }}></div>
      <TabBar active="Today"/>
    </div>
  );
}

function MiniArrival() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
      <PhoneStatusBar/>
      <div style={{ marginTop: 6 }}>
        <div className="mono" style={{ fontSize: 9, color: "var(--olive)", letterSpacing: "0.18em" }}>ARRIVAL GUIDE</div>
        <div style={{ fontFamily: "var(--serif)", fontSize: 20, lineHeight: 1.1, marginTop: 2 }}>Su llegada, paso <em>a paso.</em></div>
      </div>
      {["Cómo llegar", "Código del lockbox", "Wi-Fi y código", "Normas de la casa", "Climatización"].map((t, i) => (
        <div key={i} style={{ background: "#fff", border: "1px solid var(--line-soft)", borderRadius: 10, padding: 10, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 22, height: 22, borderRadius: "50%", background: i === 0 ? "var(--olive)" : "var(--olive-tint)", color: i === 0 ? "var(--bronze)" : "var(--olive)", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700 }}>{i + 1}</span>
          <span style={{ fontSize: 11, fontWeight: 600, flex: 1 }}>{t}</span>
          <Icon.arrow width="11" height="11" style={{ color: "var(--muted)" }}/>
        </div>
      ))}
      <div style={{ flex: 1 }}></div>
      <TabBar active="Arrival"/>
    </div>
  );
}

function MiniDiscover() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
      <PhoneStatusBar/>
      <div style={{ marginTop: 6 }}>
        <div className="mono" style={{ fontSize: 9, color: "var(--olive)", letterSpacing: "0.18em" }}>DISCOVER</div>
        <div style={{ fontFamily: "var(--serif)", fontSize: 20, lineHeight: 1.1, marginTop: 2 }}>Torremolinos, <em>curado.</em></div>
      </div>
      {[
        ["Restaurante La Consula", "Gastronomía · 4 min"],
        ["Beach club Andaluz", "Playa · 8 min"],
        ["Mercado del Pasaje", "Local · 12 min"],
      ].map(([t, s], i) => (
        <div key={i} style={{ background: "#fff", border: "1px solid var(--line-soft)", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ height: 56, background: `linear-gradient(135deg, var(--olive-tint), var(--stone-3))` }}></div>
          <div style={{ padding: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700 }}>{t}</div>
            <div style={{ fontSize: 9.5, color: "var(--muted)" }}>{s}</div>
          </div>
        </div>
      ))}
      <div style={{ flex: 1 }}></div>
      <TabBar active="Discover"/>
    </div>
  );
}

function PhoneArrival() { return <div style={{ width: 240 }}><PhoneFrame compact><MiniArrival/></PhoneFrame></div>; }
function PhoneDiscover() { return <div style={{ width: 240 }}><PhoneFrame compact><MiniDiscover/></PhoneFrame></div>; }
function PhoneStay() {
  return <div style={{ width: 240 }}><PhoneFrame compact>
    <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
      <PhoneStatusBar/>
      <div style={{ marginTop: 6 }}>
        <div className="mono" style={{ fontSize: 9, color: "var(--olive)", letterSpacing: "0.18em" }}>MI ESTANCIA</div>
        <div style={{ fontFamily: "var(--serif)", fontSize: 20, lineHeight: 1.1, marginTop: 2 }}>Villa <em>Alborán</em></div>
      </div>
      <div style={{ background: "var(--olive-tint)", borderRadius: 10, padding: 10 }}>
        <div className="mono" style={{ fontSize: 9, color: "var(--olive)", letterSpacing: "0.16em" }}>WI-FI · FIBRA 1 GBPS</div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 12, marginTop: 4, color: "var(--ink)" }}>SEDA-Alboran-5G</div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 11, marginTop: 2, color: "var(--muted)" }}>•••••••• ⓘ</div>
      </div>
      <div style={{ background: "#fff", border: "1px solid var(--line-soft)", borderRadius: 10, padding: 10 }}>
        <div className="mono" style={{ fontSize: 9, color: "var(--muted)", letterSpacing: "0.16em" }}>CLIMATIZACIÓN</div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ fontFamily: "var(--serif)", fontSize: 22 }}>22°</span>
          <span style={{ fontSize: 10, color: "var(--olive)", alignSelf: "center" }}>Auto</span>
        </div>
      </div>
      {[["Manual de la villa", <Icon.doc width="12" height="12"/>], ["Normas", <Icon.shield width="12" height="12"/>], ["Check-out", <Icon.arrow width="12" height="12"/>]].map(([t, ic], i) => (
        <div key={i} style={{ background: "#fff", border: "1px solid var(--line-soft)", borderRadius: 10, padding: 10, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "var(--olive)" }}>{ic}</span>
          <span style={{ fontSize: 11, fontWeight: 600, flex: 1 }}>{t}</span>
        </div>
      ))}
      <div style={{ flex: 1 }}></div>
      <TabBar active="Stay"/>
    </div>
  </PhoneFrame></div>;
}
function PhoneAsk() {
  return <div style={{ width: 240 }}><PhoneFrame compact>
    <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
      <PhoneStatusBar/>
      <div style={{ marginTop: 6 }}>
        <div className="mono" style={{ fontSize: 9, color: "var(--olive)", letterSpacing: "0.18em" }}>ASK SEDA</div>
        <div style={{ fontFamily: "var(--serif)", fontSize: 20, lineHeight: 1.1, marginTop: 2 }}>Conserje <em>en vivo.</em></div>
      </div>
      <div style={{ background: "var(--olive-tint)", borderRadius: 12, padding: 8, alignSelf: "flex-start", maxWidth: "85%" }}>
        <div style={{ fontSize: 10.5, color: "var(--ink-2)" }}>Hola Laura, ¿podemos cenar fuera mañana?</div>
        <div style={{ fontSize: 8.5, color: "var(--muted)", marginTop: 2 }}>Tú · 18:42</div>
      </div>
      <div style={{ background: "var(--olive)", color: "var(--stone)", borderRadius: 12, padding: 8, alignSelf: "flex-end", maxWidth: "85%" }}>
        <div style={{ fontSize: 10.5 }}>Claro. Propongo Bibo · 20:30. ¿Reservo?</div>
        <div style={{ fontSize: 8.5, marginTop: 2, color: "rgba(255,255,255,0.65)" }}>Laura · SEDA · 18:43</div>
      </div>
      <div style={{ flex: 1 }}></div>
      {/* Central Ask SEDA action button */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: -8 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--bronze)", color: "var(--olive)", display: "grid", placeItems: "center", boxShadow: "0 12px 24px rgba(254,182,74,0.4)" }}>
          <span style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 24, fontWeight: 500 }}>S</span>
        </div>
      </div>
      <TabBar active="Ask"/>
    </div>
  </PhoneFrame></div>;
}

function TabBar({ active }) {
  const items = [
    ["Today", <Icon.sparkles width="14" height="14"/>],
    ["Arrival", <Icon.key width="14" height="14"/>],
    ["Ask", null],
    ["Stay", <Icon.doc width="14" height="14"/>],
    ["Discover", <Icon.map width="14" height="14"/>],
  ];
  return (
    <div style={{ marginTop: "auto", paddingTop: 8, borderTop: "1px solid var(--line-soft)", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 4px 4px" }}>
      {items.map(([t, ic], i) => {
        if (t === "Ask") {
          return (
            <div key={t} style={{ width: 36, height: 36, marginTop: -16, borderRadius: "50%", background: "var(--olive)", color: "var(--bronze)", display: "grid", placeItems: "center", fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 13, fontWeight: 500, boxShadow: "0 8px 16px rgba(68,102,92,0.3)" }}>S</div>
          );
        }
        return (
          <div key={t} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, color: active === t ? "var(--olive)" : "var(--muted)" }}>
            {ic}
            <span style={{ fontSize: 8, fontWeight: active === t ? 700 : 500 }}>{t}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- STICKY SCROLL STORY ---------- */
function StickyScrollStory() {
  const [active, setActive] = useState(0);
  const refs = useRef([]);
  const STEPS = [
    {
      tag: "01 · ANTES",
      title: "Arrival Guide",
      body: "Llegada guiada, dirección, mapa y códigos claros antes de pisar la propiedad.",
      screen: <ScreenArrival/>,
    },
    {
      tag: "02 · LLEGADA",
      title: "Mi estancia",
      body: "Wi-Fi, instrucciones, normas de la vivienda y servicios siempre disponibles.",
      screen: <ScreenStay/>,
    },
    {
      tag: "03 · EN VIVO",
      title: "Ask SEDA",
      body: "El huésped solicita un chef, un masaje, un transfer o una reserva sin llamadas.",
      screen: <ScreenAsk/>,
    },
    {
      tag: "04 · DURANTE",
      title: "Discover Torremolinos",
      body: "Recomendaciones locales, restaurantes, beach clubs y experiencias seleccionadas.",
      screen: <ScreenDiscover/>,
    },
    {
      tag: "05 · DESPUÉS",
      title: "Checkout",
      body: "Salida ordenada, incidencias centralizadas y comunicación sin fricción.",
      screen: <ScreenCheckout/>,
    },
  ];

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const i = Number(e.target.dataset.idx);
          setActive(i);
        }
      });
    }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });
    refs.current.forEach(r => r && obs.observe(r));
    return () => obs.disconnect();
  }, []);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "48px 1fr 1.05fr", gap: 32, alignItems: "flex-start" }}>
      {/* Progress rail */}
      <div className="story-progress">
        {STEPS.map((s, i) => (
          <React.Fragment key={i}>
            <div className={`story-dot ${i === active ? "active" : i < active ? "done" : ""}`}></div>
            {i < STEPS.length - 1 && <div className="story-line"></div>}
          </React.Fragment>
        ))}
      </div>

      {/* Left scrolling steps */}
      <div>
        {STEPS.map((s, i) => (
          <div
            key={i}
            ref={el => refs.current[i] = el}
            data-idx={i}
            className="story-step"
          >
            <div className="mono" style={{ fontSize: 11, letterSpacing: "0.22em", color: i === active ? "var(--bronze-deep)" : "var(--muted)", transition: "color .3s" }}>{s.tag}</div>
            <h3 style={{ fontFamily: "var(--serif)", fontSize: "clamp(32px, 3.4vw, 48px)", fontWeight: 300, lineHeight: 1.1, color: "var(--ink)" }}>
              <em>{s.title}</em>
            </h3>
            <p className="lead" style={{ maxWidth: "44ch" }}>{s.body}</p>
          </div>
        ))}
      </div>

      {/* Right sticky phone */}
      <div className="story-stage">
        <div style={{ position: "relative", width: 340 }}>
          {/* Floating label */}
          <div style={{ position: "absolute", left: -40, top: 24, padding: "8px 14px", background: "var(--ink)", color: "var(--bronze)", borderRadius: 999, fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600, zIndex: 10, transform: "rotate(-90deg) translateX(-50%)", transformOrigin: "left center", whiteSpace: "nowrap" }}>
            {String(active + 1).padStart(2, "0")} / {STEPS.length}
          </div>
          <PhoneFrame featured>
            <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column" }}>
              {STEPS.map((s, i) => (
                <div key={i} style={{
                  position: i === active ? "relative" : "absolute",
                  inset: 0,
                  opacity: i === active ? 1 : 0,
                  pointerEvents: i === active ? "auto" : "none",
                  transition: "opacity .55s ease",
                  display: "flex", flexDirection: "column", flex: 1
                }}>
                  {s.screen}
                </div>
              ))}
            </div>
          </PhoneFrame>
        </div>
      </div>
    </div>
  );
}

/* ---------- SCREENS for sticky story (use existing PhoneFrame inner pattern) ---------- */
function ScreenArrival() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
      <PhoneStatusBar/>
      <div style={{ marginTop: 6 }}>
        <div className="mono" style={{ fontSize: 9.5, color: "var(--olive)", letterSpacing: "0.18em" }}>ARRIVAL GUIDE</div>
        <div style={{ fontFamily: "var(--serif)", fontSize: 24, lineHeight: 1.1, marginTop: 2 }}>Tu llegada, <em>paso a paso.</em></div>
      </div>
      <div style={{ background: "#fff", border: "1px solid var(--line-soft)", borderRadius: 14, padding: 14 }}>
        <div className="mono" style={{ fontSize: 9, color: "var(--muted)", letterSpacing: "0.16em" }}>DIRECCIÓN</div>
        <div style={{ fontFamily: "var(--serif)", fontSize: 15, marginTop: 2 }}>Calle Casablanca 14, Torremolinos</div>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button style={{ flex: 1, padding: "10px 12px", borderRadius: 999, background: "var(--olive)", color: "var(--stone)", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Icon.map width="12" height="12"/>Map</button>
          <button style={{ flex: 1, padding: "10px 12px", borderRadius: 999, background: "var(--olive-tint)", color: "var(--olive)", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>Cómo llegar</button>
        </div>
      </div>
      <div style={{ background: "#fff", border: "1px solid var(--line-soft)", borderRadius: 14, padding: 14 }}>
        <div className="mono" style={{ fontSize: 9, color: "var(--muted)", letterSpacing: "0.16em" }}>FIND THE BUILDING</div>
        <div style={{ fontSize: 12, marginTop: 6, lineHeight: 1.5, color: "var(--ink-2)" }}>Entrada principal frente a la rotonda del Pinar. Buzón 14B, planta 3ª.</div>
      </div>
      <div style={{ background: "var(--olive)", color: "var(--stone)", borderRadius: 14, padding: 14 }}>
        <div className="mono" style={{ fontSize: 9, color: "var(--bronze)", letterSpacing: "0.16em" }}>MAIN GATE CODE</div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 30, marginTop: 4, letterSpacing: "0.3em" }}>4829#</div>
        <div style={{ fontSize: 10.5, opacity: 0.7, marginTop: 4 }}>Válido durante toda su estancia</div>
      </div>
      <div style={{ flex: 1 }}></div>
      <TabBar active="Arrival"/>
    </div>
  );
}

function ScreenStay() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
      <PhoneStatusBar/>
      <div style={{ marginTop: 6 }}>
        <div className="mono" style={{ fontSize: 9.5, color: "var(--olive)", letterSpacing: "0.18em" }}>MI ESTANCIA</div>
        <div style={{ fontFamily: "var(--serif)", fontSize: 24, lineHeight: 1.1, marginTop: 2 }}>Apartamento <em>Torremolinos.</em></div>
      </div>
      <div style={{ background: "var(--olive-tint)", borderRadius: 12, padding: 12 }}>
        <div className="mono" style={{ fontSize: 9, color: "var(--olive)", letterSpacing: "0.16em" }}>WI-FI</div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 14, marginTop: 4, color: "var(--ink)" }}>SEDA_GUEST</div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)", marginTop: 2 }}>•••••••• Tocar para copiar</div>
      </div>
      <div style={{ background: "#fff", border: "1px solid var(--line-soft)", borderRadius: 12, padding: 12 }}>
        <div className="mono" style={{ fontSize: 9, color: "var(--muted)", letterSpacing: "0.16em" }}>CÓDIGO DE ACCESO</div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 22, marginTop: 4, color: "var(--olive)", letterSpacing: "0.2em" }}>4829</div>
      </div>
      {[["Instrucciones de la villa", <Icon.doc width="13" height="13"/>], ["Normas de la casa", <Icon.shield width="13" height="13"/>], ["Reportar incidencia", <Icon.bell width="13" height="13"/>], ["Checkout", <Icon.arrow width="13" height="13"/>]].map(([t, ic], i) => (
        <div key={i} style={{ background: "#fff", border: "1px solid var(--line-soft)", borderRadius: 10, padding: 10, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 26, height: 26, borderRadius: 7, background: "var(--olive-tint)", color: "var(--olive)", display: "grid", placeItems: "center" }}>{ic}</span>
          <span style={{ fontSize: 11.5, fontWeight: 600, flex: 1 }}>{t}</span>
          <Icon.arrow width="11" height="11" style={{ color: "var(--muted)" }}/>
        </div>
      ))}
      <div style={{ flex: 1 }}></div>
      <TabBar active="Stay"/>
    </div>
  );
}

function ScreenAsk() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
      <PhoneStatusBar/>
      <div style={{ marginTop: 6 }}>
        <div className="mono" style={{ fontSize: 9.5, color: "var(--olive)", letterSpacing: "0.18em" }}>ASK SEDA</div>
        <div style={{ fontFamily: "var(--serif)", fontSize: 24, lineHeight: 1.1, marginTop: 2 }}>Concierge <em>en vivo.</em></div>
      </div>
      <div style={{ background: "var(--olive-tint)", borderRadius: 12, padding: 10, alignSelf: "flex-start", maxWidth: "85%" }}>
        <div style={{ fontSize: 11, color: "var(--ink-2)" }}>¿Pueden organizar un chef para esta noche?</div>
        <div style={{ fontSize: 9, color: "var(--muted)", marginTop: 2 }}>Tú · 18:42</div>
      </div>
      <div style={{ background: "var(--olive)", color: "var(--stone)", borderRadius: 12, padding: 10, alignSelf: "flex-end", maxWidth: "85%" }}>
        <div style={{ fontSize: 11 }}>Chef Alejandro está disponible. ¿20:30 en la terraza?</div>
        <div style={{ fontSize: 9, marginTop: 2, color: "rgba(255,255,255,0.65)" }}>Laura · SEDA · 18:43</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 4 }}>
        {[["Chef", <Icon.chef width="12" height="12"/>], ["Transfer", <Icon.car width="12" height="12"/>], ["Masaje", <Icon.spa width="12" height="12"/>], ["Restaurante", <Icon.wine width="12" height="12"/>]].map(([t, ic], i) => (
          <div key={i} style={{ background: "#fff", border: "1px solid var(--line-soft)", borderRadius: 10, padding: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 22, height: 22, borderRadius: 6, background: "var(--bronze)", color: "var(--ink)", display: "grid", placeItems: "center" }}>{ic}</span>
            <span style={{ fontSize: 10.5, fontWeight: 600 }}>{t}</span>
          </div>
        ))}
      </div>
      <div style={{ flex: 1 }}></div>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: -8 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--bronze)", color: "var(--olive)", display: "grid", placeItems: "center", boxShadow: "0 12px 24px rgba(254,182,74,0.4)" }}>
          <span style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 24, fontWeight: 500 }}>S</span>
        </div>
      </div>
      <TabBar active="Ask"/>
    </div>
  );
}

function ScreenDiscover() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
      <PhoneStatusBar/>
      <div style={{ marginTop: 6 }}>
        <div className="mono" style={{ fontSize: 9.5, color: "var(--olive)", letterSpacing: "0.18em" }}>DISCOVER</div>
        <div style={{ fontFamily: "var(--serif)", fontSize: 24, lineHeight: 1.1, marginTop: 2 }}>Torremolinos, <em>curado.</em></div>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {["Agenda local", "Restaurants", "Beach clubs", "Tours"].map((c, i) => (
          <span key={c} style={{ padding: "5px 10px", borderRadius: 999, background: i === 0 ? "var(--olive)" : "var(--olive-tint)", color: i === 0 ? "var(--stone)" : "var(--olive)", fontSize: 9.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>{c}</span>
        ))}
      </div>
      {[
        { t: "Restaurante La Cónsula", s: "Gastronomía · 4 min", grad: "linear-gradient(135deg, #5a7a6e, #44665c)" },
        { t: "Beach Club Andaluz", s: "Playa · 8 min", grad: "linear-gradient(135deg, #d4b896, #c9a87c)" },
        { t: "Mercado del Pasaje", s: "Local · 12 min", grad: "linear-gradient(135deg, #a39580, #806d5a)" },
      ].map((p, i) => (
        <div key={i} style={{ background: "#fff", border: "1px solid var(--line-soft)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ height: 56, background: p.grad }}></div>
          <div style={{ padding: 8 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700 }}>{p.t}</div>
            <div style={{ fontSize: 9.5, color: "var(--muted)", marginTop: 1 }}>{p.s}</div>
          </div>
        </div>
      ))}
      <div style={{ flex: 1 }}></div>
      <TabBar active="Discover"/>
    </div>
  );
}

function ScreenCheckout() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
      <PhoneStatusBar/>
      <div style={{ marginTop: 6 }}>
        <div className="mono" style={{ fontSize: 9.5, color: "var(--olive)", letterSpacing: "0.18em" }}>CHECKOUT</div>
        <div style={{ fontFamily: "var(--serif)", fontSize: 24, lineHeight: 1.1, marginTop: 2 }}>Una salida <em>ordenada.</em></div>
      </div>
      <div style={{ background: "var(--olive)", color: "var(--stone)", borderRadius: 14, padding: 14 }}>
        <div className="mono" style={{ fontSize: 9, color: "var(--bronze)", letterSpacing: "0.16em" }}>HOY · 11:00</div>
        <div style={{ fontFamily: "var(--serif)", fontSize: 18, marginTop: 4 }}>Hora de salida</div>
        <div style={{ fontSize: 10.5, opacity: 0.75, marginTop: 4 }}>Late check-out disponible · solicitar</div>
      </div>
      {[["Reportar incidencia", "0 abiertas", <Icon.bell width="12" height="12"/>], ["Dejar reseña", "Comparte tu experiencia", <Icon.star width="12" height="12"/>], ["Recibo de estancia", "PDF · €4.380", <Icon.doc width="12" height="12"/>]].map(([t, s, ic], i) => (
        <div key={i} style={{ background: "#fff", border: "1px solid var(--line-soft)", borderRadius: 12, padding: 12, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 28, height: 28, borderRadius: 8, background: "var(--olive-tint)", color: "var(--olive)", display: "grid", placeItems: "center" }}>{ic}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600 }}>{t}</div>
            <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 1 }}>{s}</div>
          </div>
        </div>
      ))}
      <div style={{ background: "var(--bronze)", color: "var(--ink)", borderRadius: 14, padding: 14, textAlign: "center", marginTop: 8 }}>
        <div style={{ fontFamily: "var(--serif)", fontSize: 18, fontStyle: "italic" }}>Gracias por tu estancia.</div>
      </div>
      <div style={{ flex: 1 }}></div>
      <TabBar active="Today"/>
    </div>
  );
}

Object.assign(window, { PageGuestApp });