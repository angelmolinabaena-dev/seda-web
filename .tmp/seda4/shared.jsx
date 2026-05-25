// Shared chrome: icons, nav, footer, photo registry, helpers
const { useState, useEffect, useRef, useMemo, useCallback } = React;

/* ---------------- ICONS ---------------- */
// Hairline inline SVG icons, stroke 1.5
const ICON_BASE = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" };
const Icon = {
  arrow: (p) => <svg {...ICON_BASE} {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>,
  search: (p) => <svg {...ICON_BASE} {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>,
  pin: (p) => <svg {...ICON_BASE} {...p}><path d="M12 21s-7-6.2-7-12a7 7 0 1 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>,
  calendar: (p) => <svg {...ICON_BASE} {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>,
  user: (p) => <svg {...ICON_BASE} {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.7-6 8-6s6.5 2 8 6"/></svg>,
  bed: (p) => <svg {...ICON_BASE} {...p}><path d="M3 18V8M21 18v-5a3 3 0 0 0-3-3H3M3 14h18M7 11a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/></svg>,
  bath: (p) => <svg {...ICON_BASE} {...p}><path d="M4 12h16v2a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-2zM6 12V6a2 2 0 0 1 2-2h1M9 8h3M4 20l1-2M20 20l-1-2"/></svg>,
  guests: (p) => <svg {...ICON_BASE} {...p}><circle cx="9" cy="8" r="3.5"/><circle cx="17" cy="9.5" r="2.5"/><path d="M3 20c1-3.5 3.5-5.5 6-5.5s5 2 6 5.5M15 20c.6-2 2-3.4 3.5-3.4s2.5 1 3 2.4"/></svg>,
  pool: (p) => <svg {...ICON_BASE} {...p}><path d="M3 17c1.5 1 3 1 4.5 0s3-1 4.5 0 3 1 4.5 0 3-1 4.5 0M3 13c1.5 1 3 1 4.5 0s3-1 4.5 0 3 1 4.5 0 3-1 4.5 0M8 10V5l3 1.5M16 10V5l-3 1.5"/></svg>,
  gym: (p) => <svg {...ICON_BASE} {...p}><path d="M3 9v6M7 6v12M11 9v6M17 9v6M21 9v6M11 12h6"/></svg>,
  wine: (p) => <svg {...ICON_BASE} {...p}><path d="M8 3h8c0 4-1.5 7-4 7s-4-3-4-7zM12 10v7M9 21h6"/></svg>,
  spa: (p) => <svg {...ICON_BASE} {...p}><path d="M12 13c0-5 4-9 9-9-1 5-4 9-9 9zM12 13c0-5-4-9-9-9 1 5 4 9 9 9zM12 13v8"/></svg>,
  chef: (p) => <svg {...ICON_BASE} {...p}><path d="M7 12a4 4 0 1 1 1.5-7.7A4 4 0 0 1 16 5a4 4 0 0 1 1 7M7 12v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-6M7 12h10"/></svg>,
  cinema: (p) => <svg {...ICON_BASE} {...p}><rect x="3" y="6" width="18" height="12" rx="1.5"/><path d="M3 10h18M7 14h2M11 14h2M15 14h2"/></svg>,
  wifi: (p) => <svg {...ICON_BASE} {...p}><path d="M5 12.5a10 10 0 0 1 14 0M8 15.5a6 6 0 0 1 8 0"/><circle cx="12" cy="18.5" r="1" fill="currentColor"/></svg>,
  key: (p) => <svg {...ICON_BASE} {...p}><circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3"/></svg>,
  shield: (p) => <svg {...ICON_BASE} {...p}><path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z"/></svg>,
  chart: (p) => <svg {...ICON_BASE} {...p}><path d="M4 19h16M6 16V9M11 16V5M16 16v-7"/></svg>,
  globe: (p) => <svg {...ICON_BASE} {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 3 4 6 4 9s-1.5 6-4 9c-2.5-3-4-6-4-9s1.5-6 4-9z"/></svg>,
  star: (p) => <svg {...ICON_BASE} {...p}><path d="M12 3l2.6 5.6 6 .9-4.4 4.3 1.1 6.2L12 17l-5.3 3 1-6.2L3.5 9.5l6-.9L12 3z"/></svg>,
  doc: (p) => <svg {...ICON_BASE} {...p}><path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM14 3v5h5M8 13h8M8 17h5"/></svg>,
  lock: (p) => <svg {...ICON_BASE} {...p}><rect x="4" y="11" width="16" height="10" rx="1.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>,
  bell: (p) => <svg {...ICON_BASE} {...p}><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2H4.5L6 16zM10 21a2 2 0 0 0 4 0"/></svg>,
  check: (p) => <svg {...ICON_BASE} {...p}><path d="M4 12.5l5 5 11-12"/></svg>,
  plus: (p) => <svg {...ICON_BASE} {...p}><path d="M12 5v14M5 12h14"/></svg>,
  minus: (p) => <svg {...ICON_BASE} {...p}><path d="M5 12h14"/></svg>,
  bolt: (p) => <svg {...ICON_BASE} {...p}><path d="M13 3L4 14h6l-1 7 9-11h-6l1-7z"/></svg>,
  euro: (p) => <svg {...ICON_BASE} {...p}><path d="M17 5.5a7 7 0 0 0-10 8 7 7 0 0 0 10 5M5 10h9M5 14h9"/></svg>,
  building: (p) => <svg {...ICON_BASE} {...p}><path d="M4 21V8l8-4v17M12 21V11l8 3v7M16 16h.01M16 19h.01M8 9h.01M8 13h.01M8 17h.01"/></svg>,
  sparkles: (p) => <svg {...ICON_BASE} {...p}><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3zM18 14l.8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8L18 14z"/></svg>,
  yacht: (p) => <svg {...ICON_BASE} {...p}><path d="M3 18l9-2 9 2-2 3H5l-2-3zM5 16l1-7h4M14 9l4 7M10 5l4 1v3"/></svg>,
  golf: (p) => <svg {...ICON_BASE} {...p}><path d="M12 3v15M12 6l6 2-6 2M5 21c2-2 5-2 7-2s5 0 7 2"/></svg>,
  car: (p) => <svg {...ICON_BASE} {...p}><path d="M5 16V12l2-5h10l2 5v4M5 16h14M5 16v3M19 16v3M8 12h8"/><circle cx="8" cy="18" r="1.5" fill="currentColor"/><circle cx="16" cy="18" r="1.5" fill="currentColor"/></svg>,
  list: (p) => <svg {...ICON_BASE} {...p}><path d="M4 6h16M4 12h16M4 18h10"/></svg>,
  map: (p) => <svg {...ICON_BASE} {...p}><path d="M3 7l6-3 6 3 6-3v13l-6 3-6-3-6 3V7zM9 4v13M15 7v13"/></svg>,
  wrench: (p) => <svg {...ICON_BASE} {...p}><path d="M14 6a4 4 0 1 0-2.8 6.8l-7.2 7.2a1.5 1.5 0 0 0 2.1 2.1l7.2-7.2A4 4 0 0 0 14 6z"/><path d="M14 6l4-4M16 4l4 4"/></svg>,
};

/* ---------------- PHOTOS ---------------- */
const U = (id, w = 1600) => `https://images.unsplash.com/photo-${id}?w=${w}&q=82&auto=format&fit=crop`;
const _PIC_DEFAULT = {
  hero:        U("1582719508461-905c673771fd", 2200),
  villa1:      U("1613977257363-707ba9348227"),
  villa2:      U("1564013799919-ab600027ffc6"),
  villa3:      U("1568605114967-8130f3a36994"),
  villa4:      U("1499793983690-e29da59ef1c2"),
  villa5:      U("1600585154340-be6161a56a0c"),
  villa6:      U("1582719508461-905c673771fd"),
  villaAlboran:U("1613977257363-707ba9348227", 2000),
  pool:        U("1582719508461-905c673771fd"),
  terrace:     U("1564501049412-61c2a3083791"),
  diningSet:   U("1414235077428-338989a2e8c0"),
  arch:        U("1545324418-cc1a3fa10c00"),
  interior:    U("1600210492486-724fe5c67fb0"),
  bedroom:     U("1600585154340-be6161a56a0c"),
  costa:       U("1502602898657-3e91760cbb34", 2000),
  ownerHero:   U("1600596542815-ffad4c1539a9", 2000),
  garden:      U("1568605114967-8130f3a36994"),
  livingRoom:  U("1600607687939-ce8a6c25118c"),
  chef:        U("1414235077428-338989a2e8c0"),
  yacht:       U("1567899378494-47b22a2ae96a"),
  spa:         U("1540555700478-4be289fbecef"),
  golf:        U("1587174486073-ae5e5cff23aa"),
  transfer:    U("1503376780353-7e6692767b70"),
  wellness:    U("1540555700478-4be289fbecef"),
};
const PIC = (() => {
  const r = (typeof window !== "undefined" && window.__resources) || {};
  const out = {};
  for (const k of Object.keys(_PIC_DEFAULT)) {
    out[k] = r["pic_" + k] || _PIC_DEFAULT[k];
  }
  return out;
})();

/* ---------------- HOOKS ---------------- */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); } });
    }, { rootMargin: "-10% 0px" });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return ref;
}
function Reveal({ children, delay = 0, className = "", style }) {
  const r = useReveal();
  return <div ref={r} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms`, ...style }}>{children}</div>;
}

/* ---------------- 2026 INTERACTION PRIMITIVES ---------------- */
// Magnetic hover (button attracts cursor)
function useMagnetic(strength = 0.22) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const inner = el.querySelector(".mag-inner") || el;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      inner.style.transform = `translate(${x * strength * 0.5}px, ${y * strength * 0.5}px)`;
      // glow follow
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    const onLeave = () => { el.style.transform = ""; inner.style.transform = ""; };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => { el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave); };
  }, [strength]);
  return ref;
}

function MagneticBtn({ children, className = "", onClick, style, type, target, as }) {
  const ref = useMagnetic(0.18);
  const onClickRipple = (e) => {
    const t = e.currentTarget;
    const r = t.getBoundingClientRect();
    const rip = document.createElement("span");
    rip.className = "rip";
    rip.style.left = `${e.clientX - r.left}px`;
    rip.style.top = `${e.clientY - r.top}px`;
    rip.style.width = "12px"; rip.style.height = "12px";
    t.appendChild(rip);
    setTimeout(() => rip.remove(), 720);
    onClick && onClick(e);
  };
  const Cmp = as || "button";
  // Roll any plain-string child into a rolling-text span; keep React elements intact.
  const wrapped = React.Children.map(children, (c, i) => {
    if (typeof c === "string") {
      const txt = c.trim();
      if (!txt) return c;
      return (
        <span key={i} className="roll">
          <span className="roll-stack">
            <span>{txt}</span>
            <span>{txt}</span>
          </span>
        </span>
      );
    }
    return c;
  });
  return (
    <Cmp ref={ref} type={type} target={target} href={as === "a" ? (style?.href || undefined) : undefined}
      className={`mag ${className}`} onClick={onClickRipple} style={style}>
      <span className="mag-inner">{wrapped}</span>
    </Cmp>
  );
}

// Tilt — soft 3D depth on hover
function useTilt(strength = 6) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(1000px) rotateY(${x * strength}deg) rotateX(${-y * strength}deg) translateY(-4px)`;
    };
    const onLeave = () => el.style.transform = "";
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => { el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave); };
  }, [strength]);
  return ref;
}

// Animated counter
function AnimatedNumber({ to, prefix = "", suffix = "", duration = 1600, decimals = 0 }) {
  const ref = useRef(null);
  const [val, setVal] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const step = (now) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          setVal(to * eased);
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { rootMargin: "-15% 0px" });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to, duration]);
  const fmt = decimals > 0 ? val.toFixed(decimals).replace(".", ",") : Math.round(val).toLocaleString("es-ES");
  return <span ref={ref} className="count">{prefix}{fmt}{suffix}</span>;
}

// Kinetic headline — word spans with margin-based spacing (italic-safe)
function KineticHeadline({ text = "", className = "", as: As = "h1", style, delay = 0 }) {
  const raw = typeof text === "string" ? text : String(text || "");
  const tokens = raw.split(/(\s+|<em>|<\/em>)/g).filter(Boolean);
  let isEm = false;
  const out = [];
  let idx = 0;
  for (const p of tokens) {
    if (p === "<em>") { isEm = true; continue; }
    if (p === "</em>") { isEm = false; continue; }
    if (/^\s+$/.test(p)) continue; // skip whitespace tokens — spacing comes from word marginRight
    out.push(
      <span key={idx} style={{ display: "inline-block", fontStyle: isEm ? "italic" : "normal", marginRight: "0.28em" }}>{p}</span>
    );
    idx++;
  }
  return <As className={className} style={style}>{out}</As>;
}

// Marquee
function Marquee({ items, className = "", style }) {
  return (
    <div className={`marquee-wrap ${className}`} style={style}>
      <div className="marquee">
        {[...items, ...items, ...items].map((it, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 30, color: "rgba(255,255,255,0.55)", fontFamily: "var(--serif)", fontSize: 32, fontWeight: 300, fontStyle: "italic", whiteSpace: "nowrap" }}>
            {it}
            <span style={{ width: 6, height: 6, background: "var(--bronze)", borderRadius: "50%" }}></span>
          </span>
        ))}
      </div>
    </div>
  );
}

// Click ripple wrapper (anywhere)
function Ripple({ children, className = "", style, onClick, as: As = "div" }) {
  const handle = (e) => {
    const t = e.currentTarget;
    const r = t.getBoundingClientRect();
    const rip = document.createElement("span");
    rip.className = "rip";
    rip.style.left = `${e.clientX - r.left}px`;
    rip.style.top = `${e.clientY - r.top}px`;
    rip.style.width = "12px"; rip.style.height = "12px";
    t.appendChild(rip);
    setTimeout(() => rip.remove(), 720);
    onClick && onClick(e);
  };
  return <As className={`ripple ${className}`} style={style} onClick={handle}>{children}</As>;
}

// Custom cursor dot
function CursorDot() {
  useEffect(() => {
    const dot = document.createElement("div"); dot.className = "cursor-dot";
    const ring = document.createElement("div"); ring.className = "cursor-ring";
    document.body.appendChild(dot); document.body.appendChild(ring);
    let mx = 0, my = 0, rx = 0, ry = 0;
    const move = (e) => { mx = e.clientX; my = e.clientY; dot.style.left = mx + "px"; dot.style.top = my + "px"; };
    const loop = () => { rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18; ring.style.left = rx + "px"; ring.style.top = ry + "px"; requestAnimationFrame(loop); };
    const enter = (e) => {
      const t = e.target.closest("button,a,.tile,.surface");
      if (t) { ring.style.width = "56px"; ring.style.height = "56px"; ring.style.borderColor = "var(--bronze)"; }
    };
    const leave = (e) => {
      const t = e.target.closest("button,a,.tile,.surface");
      if (t) { ring.style.width = "36px"; ring.style.height = "36px"; ring.style.borderColor = "rgba(254,182,74,0.5)"; }
    };
    window.addEventListener("mousemove", move);
    document.addEventListener("mouseover", enter);
    document.addEventListener("mouseout", leave);
    loop();
    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", enter);
      document.removeEventListener("mouseout", leave);
      dot.remove(); ring.remove();
    };
  }, []);
  return null;
}

function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const f = () => setY(window.scrollY);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  return y;
}

/* ---------------- EXTERNAL ACCESS URLS ---------------- */
const URL_HUESPED = "https://guests.sedaprivatehomes.com/villa/apartamento-torremolinos/d1389271-1fbc-4d8a-8bb1-bfc0464d3bfc";
const URL_PROPIETARIO = "https://portal.sedaprivatehomes.com/admin/reservas";
const openExternal = (url) => window.open(url, "_blank", "noopener,noreferrer");

/* ---------------- NAV ---------------- */
const NAV_ITEMS = [
  ["coleccion", "Colección"],
  ["ecosistema", "Ecosistema SEDA OS"],
  ["guestapp", "Guest App"],
  ["propietarios", "Propietarios"],
  ["contacto", "Contacto"],
];

const MEGAMENUS = {};  // intentionally empty — header simplificado, sin submenús

function Nav({ page, onNav, transparentOnHero }) {
  const y = useScrollY();
  const solid = !transparentOnHero || y > 60;
  const [drawer, setDrawer] = useState(false);
  useEffect(() => { document.body.style.overflow = drawer ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [drawer]);
  const goto = (id) => { setDrawer(false); onNav(id); };
  return (
    <>
      <nav className={`nav ${solid ? "nav-solid" : "nav-light"}`}>
        <div className="nav-inner">
          <button className="nav-logo" onClick={() => onNav("home")} aria-label="SEDA — Inicio">SEDA</button>
          <div className="nav-links hide-mob">
            {NAV_ITEMS.map(([id, label]) => {
              const hasMenu = MEGAMENUS[id];
              return (
                <div key={id} className={hasMenu ? "menu-host" : ""}>
                  <a className={`under ${page === id ? "active" : ""}`} onClick={() => onNav(id)} href={`#${id}`}>{label}</a>
                  {hasMenu && (
                    <div className="menu-panel">
                      {hasMenu.map((m, i) => (
                        <div key={i} className="menu-item" onClick={() => m.external ? openExternal(m.external) : onNav(m.a())}>
                          <span>{m.l}</span>
                          <span className="menu-item-arrow">{m.external ? "↗" : "→"}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="nav-access hide-mob">
            <button className="nav-pill" onClick={() => openExternal(URL_HUESPED)} aria-label="Acceso huéspedes">Acceso huéspedes<ExternalArrow/></button>
            <button className="nav-pill" onClick={() => openExternal(URL_PROPIETARIO)} aria-label="Acceso propietarios">Acceso propietarios<ExternalArrow/></button>
            <MagneticBtn className="btn btn-primary glow-hover" style={{ padding: "10px 18px" }} onClick={() => onNav("propietarios")}>
              Valorar mi propiedad<Icon.arrow className="arrow" width="14" height="14" />
            </MagneticBtn>
          </div>
          <button className="nav-burger" onClick={() => setDrawer(true)} aria-label="Abrir menú">
            <div className={`burger-icon ${drawer ? "open" : ""}`}><span/><span/><span/></div>
          </button>
        </div>
      </nav>

      {/* MOBILE DRAWER */}
      <div className={`drawer ${drawer ? "open" : ""}`}>
        <div className="drawer-head">
          <button className="nav-logo" style={{ color: "var(--stone)" }} onClick={() => goto("home")}>SEDA</button>
          <button onClick={() => setDrawer(false)} style={{ width: 44, height: 44, borderRadius: 12, border: "1px solid rgba(255,255,255,0.2)", color: "var(--stone)", display: "grid", placeItems: "center" }} aria-label="Cerrar menú">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>
        <div className="drawer-content">
          <div>
            <div className="drawer-access-title">Navegación</div>
            <div className="drawer-links" style={{ marginTop: 16 }}>
              <a onClick={() => goto("home")}>Inicio<span style={{ fontSize: 14 }}>→</span></a>
              {NAV_ITEMS.map(([id, label]) => (
                <a key={id} onClick={() => goto(id)}>{label}<span style={{ fontSize: 14 }}>→</span></a>
              ))}
            </div>
          </div>
          <div>
            <div className="drawer-access-title">Accesos privados</div>
            <div className="drawer-access">
              <a onClick={() => openExternal(URL_HUESPED)}>Acceso huéspedes<ExternalArrow/></a>
              <a onClick={() => openExternal(URL_PROPIETARIO)}>Acceso propietarios<ExternalArrow/></a>
            </div>
          </div>
          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="mono" style={{ fontSize: 10.5, letterSpacing: "0.22em", color: "rgba(255,255,255,0.55)" }}>info@sedaprivatehomes.com</div>
            <div className="mono" style={{ fontSize: 10.5, letterSpacing: "0.22em", color: "rgba(255,255,255,0.55)" }}>Costa del Sol · Málaga</div>
          </div>
        </div>
        <div className="drawer-sticky">
          <MagneticBtn className="btn btn-bronze glow-hover" style={{ width: "100%", justifyContent: "center" }} onClick={() => goto("propietarios")}>
            Valorar mi propiedad<Icon.arrow className="arrow" width="14" height="14"/>
          </MagneticBtn>
        </div>
      </div>
    </>
  );
}

function ExternalArrow() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 6 }}>
      <path d="M7 17L17 7M9 7h8v8"/>
    </svg>
  );
}

/* ---------------- FOOTER ---------------- */
function Footer({ onNav }) {
  return (
    <footer className="footer">
      <div className="wrap">
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 48, paddingBottom: 56, borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
          <div>
            <div style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 40, color: "#fff", letterSpacing: "-0.02em" }}>SEDA</div>
            <div className="mono" style={{ fontSize: 10.5, letterSpacing: "0.22em", color: "rgba(255,255,255,0.55)", marginTop: 4 }}>PRIVATE HOMES · COSTA DEL SOL</div>
            <p style={{ marginTop: 22, maxWidth: 360, color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.6 }}>
              Residencias privadas excepcionales, hospitalidad mediterránea y un sistema operativo propio para propietarios.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 24, alignItems: "center" }}>
              <span className="chip-dot" style={{ background: "#5fbf8e" }}></span>
              <span className="mono" style={{ fontSize: 11, letterSpacing: "0.18em", color: "rgba(255,255,255,0.65)", textTransform: "uppercase" }}>SEDA OS · Operativo</span>
            </div>
          </div>

          <FooterCol title="Experiencia" links={[
            ["Colección 2026", "coleccion"], ["Ecosistema SEDA OS", "ecosistema"], ["Guest App", "guestapp"], ["Propietarios", "propietarios"], ["Contacto", "contacto"],
          ]} onNav={onNav} />

          <FooterCol title="Accesos" links={[
            ["Acceso huéspedes ↗", null, URL_HUESPED], ["Acceso propietarios ↗", null, URL_PROPIETARIO],
          ]} />

          <FooterCol title="Legal" links={[
            ["Privacidad"], ["Términos"], ["Cookies"],
          ]} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 28, color: "rgba(255,255,255,0.5)", fontSize: 12, flexWrap: "wrap", gap: 12 }}>
          <div className="mono" style={{ letterSpacing: "0.14em" }}>© 2026 SEDA PRIVATE HOMES · TODOS LOS DERECHOS RESERVADOS</div>
          <div style={{ display: "flex", gap: 22 }} className="mono">
            <span style={{ letterSpacing: "0.14em" }}>RD 633/2021 · CUMPLIMIENTO</span>
            <span style={{ letterSpacing: "0.14em" }}>VTAR/MA/27.143</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
function FooterCol({ title, links, onNav, muted }) {
  return (
    <div>
      <div className="eyebrow" style={{ color: "var(--bronze)" }}>{title}</div>
      <ul style={{ listStyle: "none", marginTop: 22, display: "flex", flexDirection: "column", gap: 12 }}>
        {links.map(([label, id, href], i) => (
          <li key={i}>
            {href ? (
              <a onClick={() => openExternal(href)} style={{ cursor: "pointer", color: "rgba(255,255,255,0.7)", fontSize: 14, transition: "color .25s" }}>{label}</a>
            ) : id && onNav ? (
              <a onClick={() => onNav(id)} style={{ cursor: "pointer", color: "rgba(255,255,255,0.7)", fontSize: 14, transition: "color .25s" }}>{label}</a>
            ) : (
              <span style={{ color: muted ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.7)", fontSize: 14 }}>{label}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- SNAP SLIDER ---------------- */
function SnapSlider({ children, gap = 22 }) {
  const ref = useRef(null);
  const scroll = (dir) => {
    if (!ref.current) return;
    const w = ref.current.clientWidth;
    ref.current.scrollBy({ left: dir * (w * 0.6), behavior: "smooth" });
  };
  return (
    <div style={{ position: "relative" }}>
      <div ref={ref} className="snap-row" style={{ gap }}>
        {children}
      </div>
      <div className="snap-controls" style={{ marginTop: 22 }}>
        <button className="snap-btn" onClick={() => scroll(-1)} aria-label="Anterior">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>
        </button>
        <button className="snap-btn" onClick={() => scroll(1)} aria-label="Siguiente">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M5 12h14M13 18l6-6-6-6"/></svg>
        </button>
      </div>
    </div>
  );
}

/* ---------------- FAQ ---------------- */
function FAQList({ items }) {
  const [open, setOpen] = useState(0);
  return (
    <div>
      {items.map((it, i) => (
        <div key={i} className={`faq-item ${open === i ? "open" : ""}`} onClick={() => setOpen(open === i ? -1 : i)}>
          <div className="faq-q">
            <span>{it.q}</span>
            <span style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid currentColor", display: "grid", placeItems: "center", flexShrink: 0, transition: "transform .3s", transform: open === i ? "rotate(45deg)" : "none" }}>
              <Icon.plus width="14" height="14"/>
            </span>
          </div>
          <div className="faq-a">
            <div className="faq-a-inner">{it.a}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- ICON CARD with tooltip ---------------- */
function IconCard({ icon, title, body, tip }) {
  return (
    <div className="surface tilt" style={{ padding: 24, height: "100%", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <span style={{ color: "var(--olive)" }}>{icon}</span>
        {tip && (
          <span className="tip" style={{ width: 22, height: 22, borderRadius: "50%", border: "1px solid var(--line)", color: "var(--muted)", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700, cursor: "help" }}>
            i
            <span className="tip-text">{tip}</span>
          </span>
        )}
      </div>
      <h4 style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 400 }}>{title}</h4>
      {body && <p className="small" style={{ marginTop: 8 }}>{body}</p>}
    </div>
  );
}

/* ---------------- COASTLINE MAP (replaces iceberg) ---------------- */
function CoastMap({ pins = [], height = 460 }) {
  // A stylised, abstract Costa del Sol coastline. No external map service.
  return (
    <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", border: "1px solid var(--line-soft)", background: "linear-gradient(160deg,#eaf0ec 0%,#d7e3dd 100%)", height }}>
      <svg viewBox="0 0 600 460" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <defs>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M30 0H0V30" fill="none" stroke="rgba(31,47,43,0.07)" strokeWidth="0.5"/>
          </pattern>
          <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#cdd9d2"/>
            <stop offset="1" stopColor="#a8bdb1"/>
          </linearGradient>
        </defs>
        <rect width="600" height="460" fill="url(#grid)"/>
        {/* Sea */}
        <path d="M0,260 C80,250 140,290 220,275 C300,260 360,300 440,285 C520,272 560,300 600,290 L600,460 L0,460 Z" fill="url(#sea)" opacity="0.55"/>
        {/* Coastline */}
        <path d="M0,260 C80,250 140,290 220,275 C300,260 360,300 440,285 C520,272 560,300 600,290" fill="none" stroke="#1F2F2B" strokeWidth="1.2" strokeDasharray="2 3" opacity="0.55"/>
        {/* Land contours */}
        <path d="M40,170 C140,140 220,180 320,160 C420,140 500,180 580,150" fill="none" stroke="#1F2F2B" strokeWidth="0.6" opacity="0.35"/>
        <path d="M20,210 C120,180 200,220 300,200 C400,180 480,220 580,200" fill="none" stroke="#1F2F2B" strokeWidth="0.6" opacity="0.25"/>
        {/* Cities */}
        <g fontFamily="var(--mono)" fontSize="9" fill="#1F2F2B" opacity="0.75" letterSpacing="2">
          <text x="100" y="245">ESTEPONA</text>
          <text x="230" y="262">MARBELLA</text>
          <text x="340" y="255">FUENGIROLA</text>
          <text x="470" y="270">TORREMOLINOS</text>
        </g>
      </svg>
      {/* Pins */}
      {pins.map((p, i) => (
        <div key={i} style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%,-100%)" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ background: p.active ? "var(--olive)" : "#fff", color: p.active ? "var(--stone)" : "var(--ink)", padding: "6px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, boxShadow: "0 6px 16px rgba(0,0,0,0.12)", border: "1px solid var(--line-soft)", whiteSpace: "nowrap" }}>{p.price}</div>
            <div style={{ width: 1, height: 8, background: "var(--olive)" }}></div>
            <div style={{ width: 7, height: 7, background: "var(--olive)", borderRadius: "50%" }}></div>
          </div>
        </div>
      ))}
      <div style={{ position: "absolute", left: 16, bottom: 16, display: "flex", gap: 14, alignItems: "center" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--ink-2)" }}><span style={{ width: 8, height: 8, background: "var(--olive)", borderRadius: "50%" }}></span>Disponible</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--ink-2)" }}><span style={{ width: 8, height: 8, background: "var(--bronze)", borderRadius: "50%" }}></span>Destacado</span>
      </div>
      <div className="mono" style={{ position: "absolute", right: 16, top: 16, fontSize: 10, letterSpacing: "0.18em", color: "rgba(28,27,27,0.55)" }}>36.5°N · 04.9°W</div>
    </div>
  );
}

/* ---------------- DATA: 6 properties ---------------- */
const PROPERTIES = [
  { id: "casa-cipres",     name: "Casa Ciprés",      city: "La Zagaleta",        region: "Benahavís",       beds: 6, baths: 7, guests: 12, price: 4200, photo: PIC.villaAlboran, tags: ["Frente al mar", "Piscina privada", "Guest App incluida"],     amenities: ["pool","sea","family"],   desc: "Refugio mediterráneo con piscina infinita y vistas panorámicas al mar de Alborán." },
  { id: "villa-sirocco",   name: "Villa Sirocco",    city: "Sierra Blanca",      region: "Marbella",        beds: 5, baths: 6, guests: 10, price: 3500, photo: PIC.villa2,       tags: ["Vistas al mar", "Piscina privada", "Gestionada con SEDA OS"], amenities: ["pool","sea"],            desc: "Villa contemporánea sobre la Milla de Oro, con piscina infinita y terraza envolvente." },
  { id: "casa-almendro",   name: "Casa Almendro",    city: "El Paraíso",         region: "Estepona",        beds: 4, baths: 5, guests: 8,  price: 2100, photo: PIC.villa3,       tags: ["Familia", "Wellness", "Guest App incluida"],                  amenities: ["family","wellness"],     desc: "Casa familiar entre olivos centenarios, con piscina y spa privado." },
  { id: "atico-mar-lino",  name: "Ático Mar de Lino", city: "Puerto Banús",      region: "Marbella",        beds: 3, baths: 3, guests: 6,  price: 1800, photo: PIC.terrace,      tags: ["Frente al mar", "Wellness", "Guest App incluida"],            amenities: ["apt","sea","wellness"],  desc: "Ático con terraza envolvente sobre el puerto y vistas al horizonte." },
  { id: "villa-laurel",    name: "Villa Laurel",     city: "Finca Cortesín",     region: "Casares",         beds: 5, baths: 5, guests: 10, price: 2800, photo: PIC.garden,       tags: ["Piscina privada", "Golf", "Gestionada con SEDA OS"],          amenities: ["pool","family"],         desc: "Cortijo restaurado junto al campo de golf, con jardines mediterráneos." },
  { id: "casa-jara",       name: "Casa Jara",        city: "Nueva Andalucía",    region: "Marbella",        beds: 4, baths: 4, guests: 8,  price: 2400, photo: PIC.interior,     tags: ["Piscina privada", "Familia", "Guest App incluida"],           amenities: ["pool","family"],         desc: "Casa íntima en valle de golf, con piscina templada y patio andaluz." },
];

Object.assign(window, { Icon, PIC, Reveal, useReveal, useScrollY, Nav, Footer, CoastMap, PROPERTIES, MagneticBtn, useMagnetic, AnimatedNumber, KineticHeadline, Marquee, Ripple, CursorDot, useTilt, URL_HUESPED, URL_PROPIETARIO, openExternal, ExternalArrow, SnapSlider, FAQList, IconCard });
