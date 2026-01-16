import { useState } from "react";
import AuthModal from "../components/AuthModal";

export default function Home() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authRole, setAuthRole] = useState<"user" | "owner">("user");

  const openAuth = (role: "user" | "owner") => {
    setAuthRole(role);
    setAuthOpen(true);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={styles.page}>

      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navLinks}>
          <button onClick={() => scrollToSection('about')} style={styles.navLink}>Sobre nosotros</button>
          <button onClick={() => scrollToSection('how-it-works')} style={styles.navLink}>Cómo funciona</button>
          <button onClick={() => scrollToSection('contact')} style={styles.navLink}>Contacto</button>
          <button onClick={() => scrollToSection('terms')} style={styles.navLink}>Términos</button>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={styles.heroSection}>
        <img src="/city.jpg" alt="Ciudad" style={styles.bg} />
        <div style={styles.overlay} />

        <div style={styles.heroContent}>
          <h1 style={styles.brand}>Guardyy</h1>
          <p style={styles.tagline}>Porque el espacio importa</p>

          <div style={styles.buttons}>
            <button onClick={() => openAuth("owner")} style={styles.primaryBtn}>
              Soy dueño de un espacio
            </button>

            <button onClick={() => openAuth("user")} style={styles.secondaryBtn}>
              Busco guardar mis cosas
            </button>
          </div>
        </div>

        {/* Marquee Section - Now inside Hero */}
        <div style={styles.marqueeContainer}>
          <div className="animate-marquee" style={styles.marqueeTrack}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={styles.marqueeItem}>
                <span>🔒 Hosts verificados, pago seguro</span>
                <span style={styles.separator}>•</span>
                <span>🇪🇸 Hecho por locales, para locales</span>
                <span style={styles.separator}>•</span>
                <span>📍 Almacenamiento cerca, estés donde estés</span>
                <span style={styles.separator}>•</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* About Section */}
      <div id="about" style={styles.section}>
        <img src="/about-bg.jpg" alt="Fondo Sobre Nosotros" style={styles.bg} />
        <div style={styles.overlay} />

        <div style={styles.sectionContentRelative}>
          <div style={styles.aboutText}>
            <h2 style={styles.sectionTitleWhite}>Sobre nosotros</h2>
            <div style={styles.aboutBox}>
              <p style={styles.aboutParagraph}>
                ¿Tienes cosas en casa que no quieres tirar pero a la vez no sabes dónde meterlas?
                ¿Cosas que usas unas pocas veces al año pero que sin embargo ocupan mucho espacio?
                <br /><br />
                <strong>Guardyy</strong> te conecta con espacios donde guardar tus cosas de una forma accesible y barata.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div id="how-it-works" style={styles.section}>
        <img src="/how-it-works-bg.jpg" alt="Fondo Cómo Funciona" style={styles.bg} />
        <div style={styles.overlay} />

        <div style={styles.sectionContentColumnRelative}>
          <h2 style={styles.sectionTitleCenterWhite}>Cómo funciona</h2>

          <div style={styles.cardsGrid}>
            {/* Card 1 */}
            <div style={styles.card}>
              <div style={styles.stepNumber}>1</div>
              <h3 style={styles.cardHeading}>Crea una cuenta</h3>
              <p style={styles.cardText}>¡Es sencillo y gratuito!</p>
            </div>

            {/* Card 2 */}
            <div style={styles.card}>
              <div style={styles.stepNumber}>2</div>
              <h3 style={styles.cardHeading}>Describe tu objeto</h3>
              <p style={styles.cardText}>
                Escribe lo que quieres guardar y durante cuánto tiempo.
                <br />
                <span style={styles.exampleText}>Ejemplo: Un armario viejo.</span>
              </p>
            </div>

            {/* Card 3 */}
            <div style={styles.card}>
              <div style={styles.stepNumber}>3</div>
              <h3 style={styles.cardHeading}>Reserva</h3>
              <p style={styles.cardText}> ¡Reserva el espacio que más te convenga!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Contact / Terms */}
      <div id="contact" style={styles.footer}>
        <div style={styles.footerContent}>
          <div id="terms">
            <p>© 2024 Guardyy. Todos los derechos reservados.</p>
            <p style={{ fontSize: 12, opacity: 0.7 }}>Términos y condiciones | Política de privacidad</p>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialRole={authRole}
        initialMode="login"
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    width: "100%",
    overflowX: "hidden", // Prevent horizontal scroll from marquee
    background: "#fff",
    fontFamily: '"Inter", sans-serif'
  },
  // Navbar
  navbar: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    padding: "20px 40px",
    display: "flex",
    justifyContent: "center", // Centered links as per sketch (implied) or top bar
    background: "rgba(0,0,0,0.1)", // Transparent initially? Or maybe solid. Let's go semi-transparent for style
    backdropFilter: "blur(4px)"
  },
  navLinks: {
    display: "flex",
    gap: 30,
  },
  navLink: {
    background: "transparent",
    border: "none",
    color: "white", // Assuming over Hero image
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    textTransform: "uppercase",
    letterSpacing: 1
  },
  // Hero
  heroSection: {
    position: "relative",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: 20
  },
  bg: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(180deg, rgba(0,0,0,0.3), rgba(0,0,0,0.6))",
  },
  heroContent: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 20
  },
  brand: {
    fontFamily: '"Lobster", sans-serif',
    fontSize: "clamp(60px, 10vw, 120px)",
    color: "white",
    margin: 0,
    textShadow: "0 10px 30px rgba(0,0,0,0.5)"
  },
  tagline: {
    fontFamily: '"Playfair Display", serif',
    fontSize: "clamp(24px, 4vw, 36px)",
    color: "white",
    margin: 0,
    fontStyle: "italic",
    opacity: 0.9
  },
  buttons: {
    display: "flex",
    gap: 24,
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 30
  },
  primaryBtn: {
    fontFamily: '"Playfair Display", serif',
    padding: "18px 32px",
    borderRadius: 50,
    fontSize: 18,
    fontWeight: 700,
    color: "#000",
    background: "white",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
  },
  secondaryBtn: {
    fontFamily: '"Playfair Display", serif',
    padding: "18px 32px",
    borderRadius: 50,
    fontSize: 18,
    fontWeight: 700,
    color: "white",
    background: "rgba(255,255,255,0.15)",
    border: "1px solid white",
    backdropFilter: "blur(4px)",
    cursor: "pointer"
  },
  // Marquee
  marqueeContainer: {
    position: "absolute",
    bottom: "15%", // Positioned between buttons and bottom
    left: 0,
    right: 0,
    background: "rgba(128, 128, 128, 0.25)", // Transparent grey
    backdropFilter: "blur(4px)",
    padding: "15px 0",
    borderTop: "1px solid rgba(255,255,255,0.2)",
    borderBottom: "1px solid rgba(255,255,255,0.2)",
    zIndex: 2,
    overflow: "hidden"
  },
  marqueeTrack: {
    gap: 60,
    alignItems: "center"
  },
  marqueeItem: {
    display: "flex",
    alignItems: "center",
    gap: 40,
    fontSize: 16,
    fontWeight: 600,
    color: "white", // White text
    fontFamily: '"Playfair Display", serif',
    textShadow: "0 2px 4px rgba(0,0,0,0.5)"
  },
  separator: {
    color: "rgba(255,255,255,0.5)"
  },
  // Sections
  section: {
    position: "relative",
    padding: "100px 20px",
    minHeight: "80vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#111", // Fallback
    overflow: "hidden"
  },
  sectionLight: {
    padding: "80px 20px",
    minHeight: "80vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fafafa"
  },
  sectionContent: {
    width: "min(1200px, 100%)",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 60,
    alignItems: "center",
    // Responsive: simplified here, grid works well on desktop
  },
  sectionContentRelative: {
    position: "relative",
    zIndex: 1,
    width: "min(1200px, 100%)",
    display: "flex",
    justifyContent: "flex-start", // Left align text for About
    paddingLeft: "5%"
  },
  sectionContentColumnRelative: {
    position: "relative",
    zIndex: 1,
    width: "min(1200px, 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 40
  },
  sectionTitle: {
    fontFamily: '"Playfair Display", serif',
    fontSize: 48,
    margin: "0 0 30px 0"
  },
  sectionTitleWhite: {
    fontFamily: '"Playfair Display", serif',
    fontSize: 56,
    color: "white",
    margin: "0 0 30px 0",
    textShadow: "0 4px 10px rgba(0,0,0,0.5)"
  },
  sectionTitleCenter: {
    fontFamily: '"Playfair Display", serif',
    fontSize: 48,
    textAlign: "center",
    margin: "0 0 40px 0"
  },
  sectionTitleCenterWhite: {
    fontFamily: '"Playfair Display", serif',
    fontSize: 56,
    textAlign: "center",
    color: "white",
    margin: "0 0 40px 0",
    textShadow: "0 4px 10px rgba(0,0,0,0.5)"
  },
  // About
  aboutText: {
    maxWidth: 600
  },
  aboutBox: {
    border: "2px solid rgba(255,255,255,0.8)",
    borderRadius: 30,
    padding: 40,
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(10px)",
    boxShadow: "10px 10px 0px rgba(0,0,0,0.3)", // Darker shadow for contrast
    color: "white"
  },
  aboutParagraph: {
    fontSize: 20,
    lineHeight: 1.6,
    color: "white",
    margin: 0,
    textShadow: "0 2px 4px rgba(0,0,0,0.5)"
  },
  aboutImageContainer: {
    display: "none" // Removed since we use background now
  },
  imagePlaceholder: {
    display: "none"
  },
  // Cards
  cardsGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 30,
    justifyContent: "center",
    width: "100%"
  },
  card: {
    flex: "1 1 300px",
    maxWidth: 350,
    border: "2px solid #000",
    borderRadius: 24,
    padding: 30,
    background: "white",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    position: "relative"
  },
  stepNumber: {
    position: "absolute",
    top: -20,
    left: "50%",
    transform: "translateX(-50%)",
    background: "white",
    border: "2px solid #28a745", // Green as requested
    color: "#28a745",
    width: 40,
    height: 40,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    fontWeight: "bold"
  },
  cardHeading: {
    fontFamily: '"Playfair Display", serif',
    fontSize: 20,
    marginTop: 10,
    marginBottom: 10
  },
  cardText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 1.5
  },
  exampleText: {
    display: "block",
    marginTop: 8,
    fontStyle: "italic",
    color: "#777"
  },
  // Footer
  footer: {
    background: "#111",
    color: "white",
    padding: "60px 20px",
    textAlign: "center"
  },
  footerContent: {
    maxWidth: 1000,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 20
  }
};