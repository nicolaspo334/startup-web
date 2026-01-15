import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface ReservationState {
    user_id: string;
    space_id: string;
    space_name: string;
    start_date: string;
    end_date: string;
    qty_small: number;
    qty_medium: number;
    qty_large: number;
}

export default function UserVerifyItems() {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as ReservationState;

    const [items, setItems] = useState<{ type: string, index: number, file: File | null, preview: string }[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!state) {
            navigate("/usuario");
            return;
        }

        const newItems = [];
        for (let i = 0; i < state.qty_small; i++) newItems.push({ type: "Pequeño", index: i + 1, file: null, preview: "" });
        for (let i = 0; i < state.qty_medium; i++) newItems.push({ type: "Mediano", index: i + 1, file: null, preview: "" });
        for (let i = 0; i < state.qty_large; i++) newItems.push({ type: "Grande", index: i + 1, file: null, preview: "" });

        setItems(newItems);
    }, [state, navigate]);

    const handleFileChange = (index: number, file: File | null) => {
        const updated = [...items];
        updated[index].file = file;
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updated[index].preview = reader.result as string;
                setItems([...updated]);
            };
            reader.readAsDataURL(file);
        } else {
            updated[index].preview = "";
            setItems(updated);
        }
    };

    const handleSubmit = async () => {
        // Validation
        if (items.some(i => !i.file)) {
            alert("Por favor, sube una foto para cada objeto.");
            return;
        }

        setLoading(true);
        try {
            // Prepare images as base64 strings
            const itemPhotos = items.map(i => i.preview); // preview is already base64 data URL

            const res = await fetch("/api/create-reservation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: state.user_id,
                    space_id: state.space_id,
                    start_date: state.start_date,
                    end_date: state.end_date,
                    qty_small: state.qty_small,
                    qty_medium: state.qty_medium,
                    qty_large: state.qty_large,
                    item_photos: itemPhotos,
                    status: "pending" // Explicitly set pending
                })
            });

            const data = await res.json() as any;
            if (data.ok) {
                alert("¡Solicitud enviada! El dueño revisará tus objetos.");
                navigate("/buscar");
            } else {
                alert("Error al enviar solicitud: " + data.error);
            }
        } catch (err) {
            console.error(err);
            alert("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    if (!state) return null;

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>Verificación de Objetos</h1>
                <p style={styles.subtitle}>
                    Reserva en: <strong>{state.space_name}</strong><br />
                    Sube una foto clara de cada objeto para que el dueño pueda aprobarlos.
                </p>

                <div style={styles.list}>
                    {items.map((item, idx) => (
                        <div key={idx} style={styles.itemRow}>
                            <div style={styles.itemInfo}>
                                <span style={styles.itemType}>Objeto {item.type} #{item.index}</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(idx, e.target.files?.[0] || null)}
                                    style={styles.fileInput}
                                />
                            </div>
                            {item.preview && (
                                <img src={item.preview} alt="Preview" style={styles.preview} />
                            )}
                        </div>
                    ))}
                </div>

                <div style={styles.buttonRow}>
                    <button style={styles.cancelBtn} onClick={() => navigate(-1)}>Atrás</button>
                    <button style={styles.confirmBtn} onClick={handleSubmit} disabled={loading}>
                        {loading ? "Enviando..." : "Enviar Solicitud"}
                    </button>
                </div>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        minHeight: "100vh",
        background: "#f5f5f5",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20
    },
    card: {
        background: "white",
        width: "100%",
        maxWidth: 600,
        borderRadius: 20,
        padding: 30,
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        maxHeight: "90vh"
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center"
    },
    subtitle: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        marginBottom: 20,
        lineHeight: 1.5
    },
    list: {
        flex: 1,
        overflowY: "auto",
        marginBottom: 20,
        paddingRight: 5
    },
    itemRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#f9f9f9",
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        border: "1px solid #eee"
    },
    itemInfo: {
        display: "flex",
        flexDirection: "column",
        gap: 8,
        flex: 1
    },
    itemType: {
        fontWeight: 600,
        fontSize: 15
    },
    fileInput: {
        fontSize: 12
    },
    preview: {
        width: 60,
        height: 60,
        borderRadius: 8,
        objectFit: "cover",
        marginLeft: 15,
        border: "1px solid #ddd"
    },
    buttonRow: {
        display: "flex",
        gap: 15
    },
    cancelBtn: {
        flex: 1,
        padding: "14px",
        borderRadius: 12,
        border: "1px solid #ccc",
        background: "transparent",
        fontSize: 16,
        fontWeight: 600,
        cursor: "pointer"
    },
    confirmBtn: {
        flex: 1,
        padding: "14px",
        borderRadius: 12,
        border: "none",
        background: "black",
        color: "white",
        fontSize: 16,
        fontWeight: 600,
        cursor: "pointer"
    }
};
