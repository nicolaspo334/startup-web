import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialRole: "user" | "owner";
    initialMode: "login" | "register";
}

export default function AuthModal({ isOpen, onClose, initialRole, initialMode }: AuthModalProps) {
    const navigate = useNavigate();
    const [mode, setMode] = useState(initialMode); // 'login' | 'register'
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const toggleMode = () => {
        setMode(mode === "login" ? "register" : "login");
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const endpoint =
            initialRole === "user"
                ? mode === "login" ? "/api/user-login" : "/api/user-register"
                : mode === "login" ? "/api/owner-login" : "/api/owner-register";

        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json() as any;

            if (res.ok) {
                // Success
                if (mode === "login") {
                    if (initialRole === "user") {
                        localStorage.setItem("user_id", data.id);
                        navigate("/buscar");
                    } else {
                        localStorage.setItem("owner_id", data.id);
                        navigate("/dueno/dashboard");
                    }
                    onClose();
                } else {
                    // Register success -> Auto login or just switch to login?
                    // The original flow was: Register -> Alert -> Navigate to Login. 
                    // Let's make it seamless: Auto-login would be best, but for now let's just log them in if the API returns the ID (it usually does for register).
                    // Checking previous register logic: it returned ID.

                    if (initialRole === "user") {
                        localStorage.setItem("user_id", data.id);
                        navigate("/buscar");
                    } else {
                        localStorage.setItem("owner_id", data.id);
                        navigate("/dueno/dashboard");
                    }
                    alert(mode === 'register' ? "¡Cuenta creada y sesión iniciada!" : "¡Bienvenido!");
                    onClose();
                }
            } else {
                alert("Error: " + (data.error || "Algo salió mal"));
            }
        } catch (err) {
            console.error(err);
            alert("Error de conexión");
        } finally {
            setLoading(false);
        }
    };



    return (
        <div style={styles.overlay}>
            <div style={styles.backdrop} onClick={onClose} />

            <div className="animate-expandFromCenter" style={styles.modal}>

                {/* Close Button */}
                <button onClick={onClose} style={styles.closeBtn}>✕</button>

                <div style={styles.content}>
                    <h2 style={styles.title}>
                        {mode === "login" ? "Bienvenido de nuevo" : "Crea tu cuenta"}
                    </h2>
                    <p style={styles.subtitle}>
                        {initialRole === "user" ? "Encuentra el espacio perfecto" : "Rentabiliza tu espacio"}
                    </p>

                    <form onSubmit={onSubmit} style={styles.form}>
                        <div style={styles.field}>
                            <label style={styles.label}>Usuario</label>
                            <input
                                style={styles.input}
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                placeholder="Tu nombre de usuario"
                                required
                            />
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Contraseña</label>
                            <input
                                style={styles.input}
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button type="submit" disabled={loading} style={styles.submitBtn}>
                            {loading ? "Procesando..." : (mode === "login" ? "Entrar" : "Registrarse")}
                        </button>
                    </form>

                    <div style={styles.footer}>
                        <span>
                            {mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
                        </span>
                        <button onClick={toggleMode} style={styles.linkBtn}>
                            {mode === "login" ? "Regístrate" : "Inicia sesión"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    overlay: {
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
    },
    backdrop: {
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(5px)'
    },
    modal: {
        position: 'relative',
        background: 'white',
        width: 'min(400px, 100%)',
        borderRadius: 24,
        padding: '40px 30px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: 20
    },
    closeBtn: {
        position: 'absolute',
        top: 20,
        right: 20,
        background: 'transparent',
        border: 'none',
        fontSize: 20,
        cursor: 'pointer',
        color: '#999'
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 8
    },
    title: {
        fontFamily: '"Playfair Display", serif',
        fontSize: 28,
        fontWeight: 700,
        color: '#111',
        margin: 0
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20
    },
    form: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 16
    },
    field: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 6
    },
    label: {
        fontSize: 12,
        fontWeight: 600,
        color: '#444',
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    input: {
        width: '100%',
        padding: '12px 16px',
        borderRadius: 12,
        border: '1px solid #ddd',
        fontSize: 16,
        outline: 'none',
        transition: 'border-color 0.2s',
        background: '#f9f9f9'
    },
    submitBtn: {
        width: '100%',
        padding: '14px',
        borderRadius: 12,
        border: 'none',
        background: '#111',
        color: 'white',
        fontSize: 16,
        fontWeight: 600,
        cursor: 'pointer',
        marginTop: 10,
        transition: 'transform 0.1s'
    },
    footer: {
        display: 'flex',
        gap: 6,
        fontSize: 14,
        color: '#666',
        marginTop: 10
    },
    linkBtn: {
        background: 'transparent',
        border: 'none',
        color: '#111',
        fontWeight: 700,
        cursor: 'pointer',
        padding: 0,
        fontSize: 14,
        textDecoration: 'underline'
    }
};
