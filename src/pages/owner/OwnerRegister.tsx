import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function OwnerRegister() {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");

  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/owner-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usuario, password: contrasena }),
      });

      const data = await res.json() as any;

      if (res.ok) {
        alert("¡Cuenta creada con éxito!");
        localStorage.setItem("owner_id", data.id);
        navigate("/dueno/dashboard");
      } else {
        alert("Error: " + (data.error || "No se pudo registrar"));
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión");
    }
  };

  return (
    <div style={styles.page}>
      <img src="/owner-bg-3.jpg" alt="Fondo" style={styles.bg} />
      <div style={styles.overlay} />

      <div style={styles.content}>
        <div style={styles.left}>
          <h1 style={styles.question}>¿Qué guardarás hoy?</h1>
        </div>

        <div style={styles.right}>
          <form style={styles.card} onSubmit={onSubmit}>
            <div style={styles.headerRow}>
              <h2 style={styles.title}>Registrarse</h2>
              <Link to="/dueno" style={styles.back}>Volver</Link>
            </div>

            <input
              style={styles.input}
              placeholder="Usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              autoComplete="username"
            />

            <input
              style={styles.input}
              placeholder="Contraseña"
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              autoComplete="new-password"
            />

            <button type="submit" style={styles.primaryBtn}>
              Continuar
            </button>

            <div style={styles.footer}>
              <span style={styles.footerText}>¿Ya tienes cuenta?</span>{" "}
              <Link to="/dueno/login" style={styles.footerLink}>
                Iniciar sesión
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { position: "relative", minHeight: "100vh", width: "100%", overflow: "hidden" },
  bg: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" },
  overlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(90deg, rgba(0,0,0,0.25), rgba(0,0,0,0.55))",
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
  left: { display: "flex", alignItems: "center" },
  question: {
    fontFamily: '"Playfair Display", serif',
    color: "white",
    fontSize: "clamp(42px, 5vw, 76px)",
    fontWeight: 700,
    margin: 0,
    textShadow: "0 14px 28px rgba(0,0,0,0.55)",
    lineHeight: 1.05,
  },
  right: { display: "flex", justifyContent: "center" },
  card: {
    width: "min(460px, 100%)",
    padding: 28,
    borderRadius: 22,
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.22)",
    boxShadow: "0 18px 40px rgba(0,0,0,0.28)",
    backdropFilter: "blur(10px)",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 },
  title: {
    fontFamily: '"Playfair Display", serif',
    color: "white",
    fontSize: 28,
    margin: 0,
    fontWeight: 700,
  },
  back: { color: "rgba(255,255,255,0.85)", textDecoration: "none", fontSize: 14 },
  input: {
    fontFamily: '"Playfair Display", serif',
    fontSize: 18,
    padding: "14px 14px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.30)",
    background: "rgba(255,255,255,0.92)",
    outline: "none",
  },
  primaryBtn: {
    fontFamily: '"Playfair Display", serif',
    fontSize: 18,
    padding: "14px 16px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.35)",
    background: "rgba(255,255,255,0.92)",
    fontWeight: 800,
    cursor: "pointer",
  },
  footer: { marginTop: 6, fontSize: 14, color: "rgba(255,255,255,0.85)" },
  footerText: { fontFamily: "system-ui" },
  footerLink: { color: "white", fontWeight: 700, textDecoration: "none" },
};