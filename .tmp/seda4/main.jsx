// MAIN ROUTER — 5 pages: home, coleccion, guestapp, propietarios, contacto

function App() {
  const VALID = ["home","coleccion","ecosistema","guestapp","propietarios","contacto"];
  const [page, setPage] = useState(() => {
    const h = (window.location.hash || "#home").replace("#", "");
    if (VALID.includes(h)) return h;
    return "home";
  });

  const onNav = useCallback((id) => {
    // route aliases
    const map = { collection: "coleccion", "villa-alboran": "coleccion", villa: "coleccion", owners: "propietarios", sedaos: "ecosistema", "seda-os": "ecosistema", ecosystem: "ecosistema", contact: "contacto", "contact-anchor": "contacto" };
    if (map[id]) id = map[id];
    if (!VALID.includes(id)) id = "home";
    setPage(id);
  }, []);

  useEffect(() => {
    window.location.hash = page;
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [page]);

  const onHero = page === "home" || page === "propietarios" || page === "guestapp" || page === "contacto" || page === "ecosistema";

  return (
    <>
      <CursorDot />
      <Nav page={page} onNav={onNav} transparentOnHero={onHero} />
      <div key={page} className="page-fade">
        {page === "home" && <PageHome onNav={onNav} />}
        {page === "coleccion" && <PageColeccion onNav={onNav} />}
        {page === "ecosistema" && <PageEcosistema onNav={onNav} />}
        {page === "guestapp" && <PageGuestApp onNav={onNav} />}
        {page === "propietarios" && <PagePropietarios onNav={onNav} />}
        {page === "contacto" && <PageContacto onNav={onNav} />}
      </div>
      <Footer onNav={onNav} />
      <StickyMobileCTA onNav={onNav} page={page} />
    </>
  );
}

function StickyMobileCTA({ onNav, page }) {
  if (page === "contacto") return null;
  return (
    <div className="mob-cta">
      <button className="btn btn-ghost-light" onClick={() => onNav("coleccion")}>Estancia</button>
      <button className="btn btn-bronze" onClick={() => onNav("contacto")}>Contacto</button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
