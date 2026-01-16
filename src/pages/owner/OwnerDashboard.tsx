
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

interface Space {
    id: string;
    owner_id: string;
    name: string;
    address: string;
    type: string;
    size_m2: number;
    capacity_small: number;
    capacity_medium: number;
    capacity_large: number;
    allowed_items: string;
    image_base64: string;
    pending_count?: number;
}

export default function OwnerDashboard() {
    const navigate = useNavigate();
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const ownerId = localStorage.getItem("owner_id");
        if (!ownerId) {
            navigate("/dueno/login");
            return;
        }

        // Fetch spaces from API
        fetch(`/api/owner-spaces?owner_id=${ownerId}`)
            .then((res) => {
                if (!res.ok) throw new Error("Error fetching spaces");
                return res.json();
            })
            .then((data: any) => {
                if (data.ok && Array.isArray(data.spaces)) {
                    setSpaces(data.spaces);
                }
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("owner_id");
        navigate("/");
    };

    if (loading) return null; // Or a spinner

    return (
        <div style={styles.page}>
            <img src="/owner-dashboard-bg.jpg" alt="Background" style={styles.bg} />
            <div style={styles.overlay} />

            <div style={styles.content}>
                <div style={styles.topBar}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                        <button onClick={handleLogout} style={styles.logoutBtn}>Cerrar Sesión</button>
                        <h1 style={styles.title}>Mis Espacios</h1>
                    </div>
                </div>

                <div style={styles.mainArea}>
                    {spaces.length === 0 ? (
                        // STATE 1: No spaces
                        <div style={styles.emptyStateCard}>
                            <div style={styles.plusIcon}>+</div>
                            <h2 style={styles.emptyText}>Añadir espacio</h2>
                            <p style={{ color: "rgba(255,255,255,0.7)", textAlign: "center" }}>
                                No tienes ningún espacio registrado.
                            </p>
                            {/* Here we would link to the "Add Space" form later */}
                            <button
                                style={styles.addBtn}
                                onClick={() => navigate("/dueno/add-space")}
                            >
                                Comenzar
                            </button>
                        </div>
                    ) : (
                        // STATE 2: Has spaces
                        <div style={styles.grid}>
                            {spaces.map((space) => (
                                <div key={space.id} style={styles.spaceCard}>
                                    {/* Image placeholder or real image logic */}
                                    <div style={styles.imageContainer}>
                                        {space.pending_count ? (
                                            <div style={styles.notificationBadge}>
                                                {space.pending_count} solicitudes
                                            </div>
                                        ) : null}
                                        {space.image_base64 ? (
                                            <img
                                                src={
                                                    space.image_base64.startsWith("data:")
                                                        ? space.image_base64
                                                        : `/api/images/${space.image_base64}`
                                                }
                                                alt="Espacio"
                                                style={styles.spaceImg}
                                            />
                                        ) : (
                                            <div style={styles.placeholderImg}>Sin Imagen</div>
                                        )}
                                    </div>

                                    <div style={styles.cardInfo}>
                                        <h3 style={styles.cardTitle}>{space.name || "Sin nombre"}</h3>
                                        <p style={styles.cardDetail}>{space.address}</p>
                                        <p style={styles.cardDetail}>{space.type} • {space.size_m2} m²</p>

                                        <div style={styles.tags}>
                                            {/* Simple badge for capacity */}
                                            <span style={styles.tag}>P: {space.capacity_small || 0}</span>
                                            <span style={styles.tag}>M: {space.capacity_medium || 0}</span>
                                            <span style={styles.tag}>G: {space.capacity_large || 0}</span>
                                        </div>
                                    </div>

                                    <div style={styles.cardActions}>
                                        <div style={styles.actions}>
                                            <Link to={`/dueno/edit-space/${space.id}`} style={styles.editBtn}>
                                                Editar
                                            </Link>
                                            <button
                                                onClick={() => navigate(`/dueno/analytics/${space.id}`)}
                                                style={styles.viewBtn} // Blue button style
                                            >
                                                Ver Reservas
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Add more card */}
                            <div style={styles.addCardSmall} onClick={() => navigate("/dueno/add-space")}>
                                <div style={styles.plusIconSmall}>+</div>
                                <span>Añadir espacio</span>
                            </div>
                        </div>
                    )}
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
        background: "rgba(0,0,0,0.6)", // Darker overlay for dashboard
        backdropFilter: "blur(5px)"
    },
    content: {
        position: "relative",
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        boxSizing: "border-box"
    },
    topBar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 40
    },
    title: {
        fontFamily: '"Playfair Display", serif',
        color: "white",
        fontSize: 32,
        margin: 0
    },
    logoutBtn: {
        background: "transparent",
        border: "1px solid rgba(255,255,255,0.4)",
        color: "white",
        padding: "8px 16px",
        borderRadius: 8,
        cursor: "pointer"
    },
    backBtn: {
        background: "rgba(255,255,255,0.2)",
        border: "1px solid rgba(255,255,255,0.4)",
        borderRadius: "50%",
        width: 40,
        height: 40,
        color: "white",
        fontSize: 20,
        cursor: "pointer",
        display: "flex", // Keep flex for centering
        justifyContent: "center",
        alignItems: "center"
    },
    mainArea: {
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start", // Top align for grid
        overflowY: "auto"
    },
    // Empty State Styles
    emptyStateCard: {
        width: 300,
        height: 300,
        background: "rgba(255,255,255,0.1)",
        border: "2px dashed rgba(255,255,255,0.3)",
        borderRadius: 24,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
        padding: 24
    },
    plusIcon: {
        fontSize: 48,
        color: "white",
        border: "2px solid white",
        borderRadius: "50%",
        width: 64,
        height: 64,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 4
    },
    emptyText: {
        color: "white",
        fontFamily: '"Playfair Display", serif',
        fontSize: 24,
        margin: 0
    },
    addBtn: {
        marginTop: 12,
        background: "white",
        color: "black",
        border: "none",
        padding: "10px 20px",
        borderRadius: 12,
        fontWeight: "bold",
        cursor: "pointer"
    },
    // Grid State
    grid: {
        display: "flex",
        flexWrap: "wrap",
        gap: 24,
        width: "100%",
        justifyContent: "center"
    },
    spaceCard: {
        width: 300,
        background: "rgba(255,255,255,0.95)",
        borderRadius: 16,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
    },
    imageContainer: {
        height: 180,
        background: "#ddd",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative"
    },
    notificationBadge: {
        position: "absolute",
        top: 10,
        right: 10,
        background: "#ff4444",
        color: "white",
        padding: "4px 8px",
        borderRadius: 12,
        fontSize: 12,
        fontWeight: "bold",
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        zIndex: 10
    },
    spaceImg: {
        width: "100%",
        height: "100%",
        objectFit: "cover"
    },
    placeholderImg: {
        color: "#666",
        fontWeight: "bold"
    },
    cardInfo: {
        padding: 16,
        flex: 1
    },
    cardTitle: {
        margin: "0 0 8px 0",
        fontSize: 18,
        fontFamily: '"Playfair Display", serif'
    },
    cardDetail: {
        margin: "0 0 12px 0",
        fontSize: 14,
        color: "#555"
    },
    tags: {
        display: "flex",
        gap: 6,
        flexWrap: "wrap"
    },
    tag: {
        fontSize: 12,
        background: "#eee",
        padding: "4px 8px",
        borderRadius: 4,
        color: "#333"
    },
    cardActions: {
        padding: "12px 16px",
        borderTop: "1px solid #eee",
        display: "flex",
        justifyContent: "flex-end"
    },
    editBtn: {
        background: "transparent",
        border: "1px solid #ccc",
        borderRadius: 6,
        padding: "6px 12px",
        cursor: "pointer",
        fontSize: 13
    },
    addCardSmall: {
        width: 300,
        minHeight: 300, // Match space card height roughly
        background: "rgba(255,255,255,0.05)",
        border: "2px dashed rgba(255,255,255,0.3)",
        borderRadius: 16,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
        color: "white",
        gap: 12
    },
    plusIconSmall: {
        fontSize: 32,
        border: "2px solid white",
        borderRadius: "50%",
        width: 48,
        height: 48,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 4
    }
};
