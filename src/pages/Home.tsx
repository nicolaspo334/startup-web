import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={styles.page}>
      <img src="/city.jpg" alt="Ciudad" style={styles.bg} />
      <div style={styles.overlay} />

      <div style={styles.content}>
        <h1 style={styles.brand}>Guardy</h1>

        <div style={styles.buttons}>
          <Link to="/dueno" style={styles.primaryBtn}>
            Soy dueño de un espacio
          </Link>

          <Link to="/usuario" style={styles.secondaryBtn}>
            Busco guardar mis cosas
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    position: "relative",
    minHeight: "100vh",
    width: "100%",
    overflow: "hidden",
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
    background:
      "linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.55))",
  },
  content: {
    position: "relative",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 32,
    padding: 24,
    textAlign: "center",
  },
  brand: {
    fontFamily: '"Playfair Display", serif',
    fontSize: "clamp(56px, 8vw, 96px)",
    fontWeight: 700,
    color: "white",
    margin: 0,
    letterSpacing: 2,
    textShadow: "0 18px 36px rgba(0,0,0,0.6)",
  },
  buttons: {
    display: "flex",
    gap: 24,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  primaryBtn: {
    fontFamily: '"Playfair Display", serif',
    padding: "18px 28px",
    borderRadius: 16,
    fontSize: 20,
    fontWeight: 700,
    color: "#111827",
    background: "rgba(255,255,255,0.95)",
    textDecoration: "none",
    border: "1px solid rgba(255,255,255,0.4)",
    boxShadow: "0 14px 28px rgba(0,0,0,0.35)",
  },
  secondaryBtn: {
    fontFamily: '"Playfair Display", serif',
    padding: "18px 28px",
    borderRadius: 16,
    fontSize: 20,
    fontWeight: 700,
    color: "white",
    background: "rgba(17,24,39,0.35)",
    textDecoration: "none",
    border: "1px solid rgba(255,255,255,0.4)",
    boxShadow: "0 14px 28px rgba(0,0,0,0.35)",
  },
};