import { Link } from "react-router-dom";

export default function RegistroUsuario() {
  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h2>Registro como usuario</h2>
      <p>Aquí el usuario se registrará para buscar un sitio donde guardar cosas.</p>
      <Link to="/">← Volver</Link>
    </div>
  );
}
