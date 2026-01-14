
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Simple Calendar Component
const CalendarView = ({ reservations }: { reservations: any[] }) => {
    const today = new Date();
    const [month, setMonth] = useState(today.getMonth());
    const [year] = useState(today.getFullYear());

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday

    const getDaysArray = () => {
        const days: (number | null)[] = [];
        // Empty slots for days before first day of month
        // Adjust for Monday start if needed, but standard US Sunday start for simplicity or Monday? 
        // Let's do Monday start (Spanish Style)
        const startOffset = firstDay === 0 ? 6 : firstDay - 1;

        for (let i = 0; i < startOffset; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(i);
        return days;
    };

    const isReserved = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return reservations.some(r => dateStr >= r.start_date && dateStr <= r.end_date);
    };

    return (
        <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 10, width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <button onClick={() => setMonth(m => m === 0 ? 11 : m - 1)}>&lt;</button>
                <span style={{ fontWeight: "bold" }}>{year} / {month + 1}</span>
                <button onClick={() => setMonth(m => m === 11 ? 0 : m + 1)}>&gt;</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, textAlign: "center", fontSize: 12 }}>
                {["L", "M", "X", "J", "V", "S", "D"].map(d => <div key={d} style={{ fontWeight: "bold" }}>{d}</div>)}
                {getDaysArray().map((d, i) => (
                    <div
                        key={i}
                        style={{
                            padding: 6,
                            borderRadius: 4,
                            background: (d && isReserved(d)) ? "#4CAF50" : "transparent",
                            color: (d && isReserved(d)) ? "white" : "inherit"
                        }}
                    >
                        {d || ""}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function OwnerSpaceAnalytics() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        if (id) {
            fetch(`/api/get-space-stats?space_id=${id}`)
                .then(res => res.json())
                .then(d => {
                    if (d.ok) setData(d);
                })
                .catch(err => console.error(err));
        }
    }, [id]);

    if (!data) return <div style={{ padding: 40 }}>Cargando...</div>;

    const { space, reservations, stats } = data;

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                {/* Header */}
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.title}>{space.name}</h1>
                        <p style={styles.address}>{space.address}</p>
                    </div>
                </div>

                <div style={styles.contentGrid}>
                    {/* Left: Calendar */}
                    <div style={styles.leftCol}>
                        <h3 style={styles.sectionTitle}>Calendario de Ocupación</h3>
                        <CalendarView reservations={reservations} />

                        <button style={styles.acceptBtn} onClick={() => navigate("/dueno/dashboard")}>
                            Aceptar
                        </button>
                    </div>

                    {/* Right: Stats & List */}
                    <div style={styles.rightCol}>
                        <div style={styles.statsRow}>
                            <div style={styles.statBox}>
                                <span style={styles.statLabel}>Ingresos este mes</span>
                                <span style={styles.statValue}>TODO €</span>
                            </div>
                            <div style={styles.statBox}>
                                <span style={styles.statLabel}>Reservas este mes</span>
                                <span style={styles.statValue}>{stats.count_month}</span>
                            </div>
                        </div>

                        <div style={styles.listContainer}>
                            <h3 style={styles.sectionTitle}>Lista de Reservas</h3>
                            <div style={styles.list}>
                                {reservations.map((r: any) => (
                                    <div key={r.id} style={styles.resItem}>
                                        <div style={styles.resRow}>
                                            <span style={styles.resName}>{r.username || "Usuario"}</span>
                                            <span style={styles.resDate}>{r.start_date}</span>
                                        </div>
                                        <div style={styles.resDetails}>
                                            {r.qty_small > 0 && <span>P:{r.qty_small} </span>}
                                            {r.qty_medium > 0 && <span>M:{r.qty_medium} </span>}
                                            {r.qty_large > 0 && <span>G:{r.qty_large}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        width: "100vw",
        height: "100vh",
        background: "#f0f0f0",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20
    },
    card: {
        background: "white",
        width: "100%",
        maxWidth: 900,
        borderRadius: 20,
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        padding: 40,
        height: "80vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden" // Prevent overflow of the card itself
    },
    header: {
        marginBottom: 30
    },
    title: {
        fontSize: 24,
        margin: "0 0 8px 0"
    },
    address: {
        fontSize: 14,
        color: "#666",
        margin: 0
    },
    contentGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 40,
        flex: 1, // Take remaining space
        overflow: "hidden"
    },
    leftCol: {
        display: "flex",
        flexDirection: "column",
        gap: 20
    },
    rightCol: {
        display: "flex",
        flexDirection: "column",
        gap: 20,
        overflow: "hidden" // Allow list to scroll inside
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        margin: "0 0 10px 0"
    },
    statsRow: {
        display: "flex",
        gap: 20
    },
    statBox: {
        border: "1px solid #ddd",
        borderRadius: 12,
        padding: 15,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
    },
    statLabel: {
        fontSize: 12,
        color: "#888",
        marginBottom: 4
    },
    statValue: {
        fontSize: 20,
        fontWeight: "bold"
    },
    listContainer: {
        flex: 1,
        border: "1px solid #ddd",
        borderRadius: 12,
        padding: 15,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
    },
    list: {
        flex: 1,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 10
    },
    resItem: {
        background: "#f9f9f9",
        padding: 10,
        borderRadius: 8
    },
    resRow: {
        display: "flex",
        justifyContent: "space-between",
        fontWeight: 600,
        fontSize: 14,
        marginBottom: 4
    },
    resName: {},
    resDate: { fontSize: 12, color: "#666" },
    resDetails: {
        fontSize: 12,
        color: "#444"
    },
    acceptBtn: {
        marginTop: "auto",
        padding: "12px",
        background: "white",
        border: "1px solid #000",
        borderRadius: 8,
        cursor: "pointer",
        fontWeight: "bold"
    }
};
