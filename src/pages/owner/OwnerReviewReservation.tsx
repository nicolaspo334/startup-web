import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function OwnerReviewReservation() {
    const location = useLocation();
    const navigate = useNavigate();
    const reservation = location.state?.reservation;
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!reservation) {
            navigate("/dueno/dashboard");
        }
    }, [reservation, navigate]);

    if (!reservation) return null;

    // Parse photos safely
    let photos: string[] = [];
    try {
        photos = JSON.parse(reservation.item_photos || "[]");
    } catch (e) {
        console.error("Error parsing photos", e);
    }

    const handleAction = async (status: 'approved' | 'rejected') => {
        const ownerId = localStorage.getItem("owner_id");
        if (!ownerId) return;

        if (!confirm(status === 'approved' ? "¿Aceptar esta reserva?" : "¿Rechazar esta reserva?")) return;

        setLoading(true);
        try {
            const res = await fetch("/api/owner-update-reservation-status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reservation_id: reservation.id,
                    status: status,
                    owner_id: ownerId
                })
            });

            const data = await res.json() as any;
            if (data.ok) {
                alert(status === 'approved' ? "Reserva aceptada" : "Reserva rechazada");
                navigate(-1); // Go back to analytics
            } else {
                alert("Error: " + data.error);
            }
        } catch (err) {
            console.error(err);
            alert("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>Revisar Solicitud</h1>
                <div style={styles.info}>
                    <p><strong>Usuario:</strong> {reservation.username}</p>
                    <p><strong>Fechas:</strong> {reservation.start_date} al {reservation.end_date}</p>
                    <p><strong>Objetos:</strong>
                        {reservation.qty_small > 0 && ` ${reservation.qty_small} Pequeños`}
                        {reservation.qty_medium > 0 && ` ${reservation.qty_medium} Medianos`}
                        {reservation.qty_large > 0 && ` ${reservation.qty_large} Grandes`}
                    </p>
                </div>

                <div style={styles.photosGrid}>
                    {photos.length === 0 ? (
                        <p style={{ color: "#999" }}>No hay fotos disponibles.</p>
                    ) : (
                        photos.map((photo, idx) => (
                            <img key={idx} src={photo} alt={`Objeto ${idx + 1}`} style={styles.photo} />
                        ))
                    )}
                </div>

                <div style={styles.actions}>
                    <button style={styles.backBtn} onClick={() => navigate(-1)}>Volver</button>
                    <button
                        style={styles.rejectBtn}
                        onClick={() => handleAction('rejected')}
                        disabled={loading}
                    >
                        Denegar
                    </button>
                    <button
                        style={styles.approveBtn}
                        onClick={() => handleAction('approved')}
                        disabled={loading}
                    >
                        Aceptar
                    </button>
                </div>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        minHeight: "100vh",
        background: "#f0f2f5",
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
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center"
    },
    info: {
        background: "#f9f9f9",
        padding: 15,
        borderRadius: 12,
        marginBottom: 20,
        fontSize: 14,
        lineHeight: 1.6
    },
    photosGrid: {
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
        justifyContent: "center",
        marginBottom: 30
    },
    photo: {
        width: 150,
        height: 150,
        objectFit: "cover",
        borderRadius: 8,
        border: "1px solid #ddd"
    },
    actions: {
        display: "flex",
        gap: 15
    },
    backBtn: {
        padding: "12px 20px",
        border: "1px solid #ccc",
        background: "transparent",
        borderRadius: 8,
        cursor: "pointer",
        fontWeight: 600
    },
    rejectBtn: {
        flex: 1,
        padding: "12px 20px",
        border: "none",
        background: "#dc3545",
        color: "white",
        borderRadius: 8,
        cursor: "pointer",
        fontWeight: 600
    },
    approveBtn: {
        flex: 1,
        padding: "12px 20px",
        border: "none",
        background: "#28a745",
        color: "white",
        borderRadius: 8,
        cursor: "pointer",
        fontWeight: 600
    }
};
