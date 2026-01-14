
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface Reservation {
    id: number;
    user_id: string;
    username: string;
    start_date: string;
    end_date: string;
    qty_small: number;
    qty_medium: number;
    qty_large: number;
}

interface Space {
    id: string;
    name: string;
    address: string;
}

export default function OwnerSpaceAnalytics() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [space, setSpace] = useState<Space | null>(null);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const ownerId = localStorage.getItem("owner_id");
        if (!ownerId || !id) return;

        fetch(`/api/get-owner-analytics?space_id=${id}&owner_id=${ownerId}`)
            .then(res => res.json())
            .then((data: any) => {
                if (data.ok) {
                    setSpace(data.space);
                    setReservations(data.reservations);
                } else {
                    alert("Error al cargar datos");
                    navigate("/dueno/dashboard");
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [id]);

    // Calendar Helpers
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Determine which days have reservations
    const getDayStatus = (day: number) => {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        // Check if any reservation overlaps this day
        const hasRes = reservations.some(r => dateStr >= r.start_date && dateStr <= r.end_date);
        return hasRes ? "#4CAF50" : "#eee"; // Green if booked, Grey if free
    };

    // Quick Stats
    const reservationsThisMonth = reservations.filter(r => {
        const rDate = new Date(r.start_date);
        return rDate.getMonth() === currentMonth && rDate.getFullYear() === currentYear;
    }).length;

    // Mock Revenue (e.g., 50 EUR per reservation avg)
    const revenue = reservationsThisMonth * 50;

    if (loading) return <div style={{ padding: 40 }}>Cargando...</div>;
    if (!space) return null;

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <h2 style={styles.header}>{space.name}</h2>
                <p style={styles.subHeader}>{space.address}</p>

                <div style={styles.grid}>
                    {/* Left: Calendar */}
                    <div style={styles.calendarCard}>
                        <h3 style={styles.cardTitle}>Calendario ({today.toLocaleString('default', { month: 'long' })})</h3>
                        <div style={styles.calendarGrid}>
                            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                                <div key={day} style={{ ...styles.dayCell, background: getDayStatus(day) }}>
                                    {day}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Stats & List */}
                    <div style={styles.rightCol}>
                        <div style={styles.statsRow}>
                            <div style={styles.statBox}>
                                <span style={styles.statVal}>{reservationsThisMonth}</span>
                                <span style={styles.statLabel}>Res. este mes</span>
                            </div>
                            <div style={styles.statBox}>
                                <span style={styles.statVal}>{revenue} €</span>
                                <span style={styles.statLabel}>Ingresos</span>
                            </div>
                        </div>

                        <div style={styles.listCard}>
                            <h3 style={styles.cardTitle}>Lista de reservas</h3>
                            <div style={styles.listScroll}>
                                {reservations.map(r => (
                                    <div key={r.id} style={styles.resItem}>
                                        <div style={styles.resHeader}>
                                            <span style={styles.resUser}>{r.username}</span>
                                            <span style={styles.resDate}>{r.start_date}</span>
                                        </div>
                                        <div style={styles.resObj}>
                                            {r.qty_small > 0 && `📦 Peq: ${r.qty_small} `}
                                            {r.qty_medium > 0 && `📦 Med: ${r.qty_medium} `}
                                            {r.qty_large > 0 && `📦 Gra: ${r.qty_large}`}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={styles.footer}>
                    <button style={styles.acceptBtn} onClick={() => navigate("/dueno/dashboard")}>
                        Aceptar
                    </button>
                </div>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    page: {
        minHeight: "100vh",
        background: "#f0f2f5",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20
    },
    container: {
        width: "min(1000px, 95%)",
        background: "white",
        borderRadius: 20,
        padding: 40,
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        border: "3px solid black" // Sketch style border
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        margin: "0 0 4px 0"
    },
    subHeader: {
        color: "#666",
        marginBottom: 30
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 30
    },
    calendarCard: {
        border: "1px solid #ccc",
        padding: 20,
        borderRadius: 12
    },
    cardTitle: {
        fontSize: 18,
        marginBottom: 16
    },
    calendarGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap: 6
    },
    dayCell: {
        aspectRatio: "1/1",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 4,
        fontSize: 12,
        fontWeight: "bold",
        color: "#333"
    },
    rightCol: {
        display: "flex",
        flexDirection: "column",
        gap: 20
    },
    statsRow: {
        display: "flex",
        gap: 20
    },
    statBox: {
        flex: 1,
        border: "1px solid #ccc",
        borderRadius: 12,
        padding: 16,
        textAlign: "center"
    },
    statVal: {
        display: "block",
        fontSize: 24,
        fontWeight: "bold"
    },
    statLabel: {
        fontSize: 12,
        color: "#666"
    },
    listCard: {
        flex: 1,
        border: "1px solid #ccc",
        borderRadius: 12,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        height: 300 // Fixed height for scroll
    },
    listScroll: {
        flex: 1,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 10
    },
    resItem: {
        border: "1px solid #eee",
        borderRadius: 8,
        padding: 10,
        background: "#fafafa"
    },
    resHeader: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 4,
        fontSize: 14,
        fontWeight: 600
    },
    resUser: {},
    resDate: { fontSize: 12, color: "#888" },
    resObj: { fontSize: 12, color: "#555" },
    footer: {
        marginTop: 30,
        display: "flex",
    },
    acceptBtn: {
        padding: "12px 30px",
        background: "white",
        border: "1px solid black",
        borderRadius: 8,
        fontSize: 16,
        fontWeight: 600,
        cursor: "pointer"
    }
};
