import { Link } from "react-router-dom";

export default function OwnerAuth() {
  return (
    <div style={styles.page}>
      <img src="/owner-bg-1.jpg" alt="Fondo" style={styles.bg} />
      <div style={styles.overlay} />

      <div style={styles.content}>
        <Link to="/" style={styles.backHome}>
          ← Volver a inicio
        </Link>

        {/* Izquierda */}
        <div style={styles.left}>
          <h1 style={styles.question}>¿Qué guardarás hoy?</h1>
        </div>

        {/* Derecha */}
        <div style={styles.right}>
          <div style={styles.card}>
            <Link to="/dueno/login" style={styles.primaryBtn}>
              Iniciar sesión
            </Link>

            <Link to="/dueno/register" style={styles.secondaryBtn}>
              Crear cuenta
            </Link>
          </div>
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
    background: "linear-gradient(90deg, rgba(0,0,0,0.25), rgba(0,0,0,0.45))",
  },
  content: {
    position: "relative",
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    alignItems: "center",
    padding: "clamp(18px, 4vw, 48px)",
    gap: 24,
  },

  backHome: {
    position: "absolute",
    top: 24,
    left: 24,
    fontFamily: '"Playfair Display", serif',
    fontSize: 16,
    color: "white",
    textDecoration: "none",
    background: "rgba(0,0,0,0.35)",
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.35)",
    backdropFilter: "blur(6px)",
  },

  left: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  question: {
    fontFamily: '"Playfair Display", serif',
    color: "white",
    fontSize: "clamp(42px, 5vw, 76px)",
    fontWeight: 700,
    margin: 0,
    textShadow: "0 14px 28px rgba(0,0,0,0.55)",
    lineHeight: 1.05,
  },
  right: {
    display: "flex",
    justifyContent: "center",
  },
  card: {
    width: "min(420px, 100%)",
    padding: 28,
    borderRadius: 20,
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.22)",
    boxShadow: "0 18px 40px rgba(0,0,0,0.28)",
    backdropFilter: "blur(10px)",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  primaryBtn: {
    fontFamily: '"Playfair Display", serif',
    textDecoration: "none",
    textAlign: "center",
    padding: "16px 18px",
    borderRadius: 14,
    fontSize: 20,
    fontWeight: 700,
    color: "#111827",
    background: "rgba(255,255,255,0.92)",
    border: "1px solid rgba(255,255,255,0.35)",
  },
  secondaryBtn: {
    fontFamily: '"Playfair Display", serif',
    textDecoration: "none",
    textAlign: "center",
    padding: "16px 18px",
    borderRadius: 14,
    fontSize: 20,
    fontWeight: 700,
    color: "white",
    background: "rgba(17,24,39,0.35)",
    border: "1px solid rgba(255,255,255,0.35)",
  },
};