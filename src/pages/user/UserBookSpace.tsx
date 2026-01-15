import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";

interface Space {
    id: string;
    name: string;
    address: string;
    type: string;
    size_m2: number;
    capacity_small: number;
    capacity_medium: number;
    capacity_large: number;
    price_small: number;
    price_medium: number;
    price_large: number;
    image_base64: string;
}

interface Reservation {
    start_date: string; // YYYY-MM-DD
    end_date: string;   // YYYY-MM-DD
    qty_small: number;
    qty_medium: number;
    qty_large: number;
}

export default function UserBookSpace() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [space, setSpace] = useState<Space | null>(null);
    const [reservations, setReservations] = useState<Reservation[]>([]);

    // Form State
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [startTime, setStartTime] = useState("10:00");
    const [qtySmall, setQtySmall] = useState(0);
    const [qtyMedium, setQtyMedium] = useState(0);
    const [qtyLarge, setQtyLarge] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!id) return;

        // Fetch Space Details
        fetch(`/api/get-space?id=${id}`)
            .then(res => res.json())
            .then((data: any) => {
                if (data.ok) setSpace(data.space);
            })
            .catch(err => console.error(err));

        // Fetch Existing Reservations
        fetch(`/api/get-space-reservations?space_id=${id}`)
            .then(res => res.json())
            .then((data: any) => {
                if (data.ok) setReservations(data.reservations);
            })
            .catch(err => console.error(err));
    }, [id]);

    // Calculate dynamic availability
    const getAvailability = () => {
        if (!space || !startDate || !endDate) return { small: 0, medium: 0, large: 0 };
        if (startDate > endDate) return { small: 0, medium: 0, large: 0 };

        // Helper to get dates in range
        const getDatesInRange = (start: string, end: string) => {
            const date = new Date(start);
            const endD = new Date(end);
            const dates = [];
            while (date <= endD) {
                dates.push(date.toISOString().split('T')[0]);
                date.setDate(date.getDate() + 1);
            }
            return dates;
        };

        const rangeDates = getDatesInRange(startDate, endDate);

        let maxUsageSmall = 0;
        let maxUsageMedium = 0;
        let maxUsageLarge = 0;

        // For each day in the user's requested range, find the peak usage by other reservations
        for (const day of rangeDates) {
            let dailyUsageSmall = 0;
            let dailyUsageMedium = 0;
            let dailyUsageLarge = 0;

            for (const res of reservations) {
                if (day >= res.start_date && day <= res.end_date) {
                    dailyUsageSmall += res.qty_small || 0;
                    dailyUsageMedium += res.qty_medium || 0;
                    dailyUsageLarge += res.qty_large || 0;
                }
            }

            if (dailyUsageSmall > maxUsageSmall) maxUsageSmall = dailyUsageSmall;
            if (dailyUsageMedium > maxUsageMedium) maxUsageMedium = dailyUsageMedium;
            if (dailyUsageLarge > maxUsageLarge) maxUsageLarge = dailyUsageLarge;
        }

        return {
            small: Math.max(0, (space.capacity_small || 0) - maxUsageSmall),
            medium: Math.max(0, (space.capacity_medium || 0) - maxUsageMedium),
            large: Math.max(0, (space.capacity_large || 0) - maxUsageLarge)
        };
    };

    const availability = getAvailability();

    // Calculate Total Price
    const calculateTotal = () => {
        if (!space || !startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive

        const dailyTotal =
            (qtySmall * (space.price_small || 0)) +
            (qtyMedium * (space.price_medium || 0)) +
            (qtyLarge * (space.price_large || 0));

        return dailyTotal * diffDays;
    };
    const totalPrice = calculateTotal();

    // URL Params
    const [searchParams] = useSearchParams();
    const queryStart = searchParams.get("start");
    const queryEnd = searchParams.get("end");
    const [datesLocked, setDatesLocked] = useState(false);

    // Initial Date Logic
    useEffect(() => {
        if (queryStart && queryEnd) {
            setStartDate(queryStart);
            setEndDate(queryEnd);
            setDatesLocked(true);
        } else if (!startDate && !endDate) {
            // Default only if no params provided
            const today = new Date();
            const tomorrow = new Date();
            tomorrow.setDate(today.getDate() + 1);

            setStartDate(today.toISOString().split('T')[0]);
            setEndDate(tomorrow.toISOString().split('T')[0]);
        }
    }, [queryStart, queryEnd]);

    // Reset quantities if availability drops below selected while changing dates
    useEffect(() => {
        if (qtySmall > availability.small) setQtySmall(0);
        if (qtyMedium > availability.medium) setQtyMedium(0);
        if (qtyLarge > availability.large) setQtyLarge(0);
    }, [startDate, endDate]);

    const handleReserve = () => {
        if (!space) return;
        const userId = localStorage.getItem("user_id");
        if (!userId) {
            alert("Debes iniciar sesión para reservar");
            navigate("/usuario");
            return;
        }

        if (!startDate || !endDate) {
            alert("Selecciona las fechas");
            return;
        }

        if (qtySmall === 0 && qtyMedium === 0 && qtyLarge === 0) {
            alert("Selecciona al menos un objeto para guardar");
            return;
        }

        // Navigate to Verification Page with state
        navigate("/usuario/verificar-objetos", {
            state: {
                user_id: userId,
                space_id: space.id,
                space_name: space.name,
                start_date: startDate,
                end_date: endDate,
                qty_small: qtySmall,
                qty_medium: qtyMedium,
                qty_large: qtyLarge
            }
        });
    };

    if (!space) return <div style={{ padding: 40 }}>Cargando espacio...</div>;

    const imageUrl = space.image_base64.startsWith("data:")
        ? space.image_base64
        : `/api/images/${space.image_base64}`;

    return (
        <div style={styles.container}>
            <div style={styles.card}>

                {/* Left: Image */}
                <div style={styles.imageSection}>
                    <img src={imageUrl} style={styles.image} alt={space.name} />
                </div>

                {/* Right: Details & Form */}
                <div style={styles.detailsSection}>
                    <h1 style={styles.title}>{space.name}</h1>
                    <p style={styles.address}>{space.address}</p>

                    <div style={styles.divider} />

                    {/* Dates */}
                    <div style={styles.sectionHeader}>Fecha y Hora</div>
                    <div style={styles.row}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Desde</label>
                            <input
                                type="date"
                                style={styles.input}
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                disabled={datesLocked}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Hasta</label>
                            <input
                                type="date"
                                style={styles.input}
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                disabled={datesLocked}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Hora</label>
                            <input
                                type="time"
                                style={styles.input}
                                value={startTime}
                                onChange={e => setStartTime(e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={styles.divider} />

                    {/* Capacity */}
                    <div style={styles.sectionHeader}>Objetos a reservar</div>
                    {(!startDate || !endDate) && (
                        <p style={{ fontSize: 12, color: "#666" }}>Selecciona fechas para ver disponibilidad</p>
                    )}

                    <div style={{ marginBottom: 16, padding: 15, background: "#f5f5f5", borderRadius: 12, border: "1px solid #e0e0e0" }}>
                        <p style={{ margin: "0 0 10px 0", fontSize: 14, fontWeight: 600, color: "#333" }}>
                            Resumen de Costos
                        </p>
                        {(!startDate || !endDate) ? (
                            <p style={{ fontSize: 12, color: "#666", margin: 0 }}>Selecciona fechas para calcular el precio.</p>
                        ) : (
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                                    <span>Objetos seleccionados:</span>
                                    <span>{qtySmall + qtyMedium + qtyLarge}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                                    <span>Duración:</span>
                                    <span>{(new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24) + 1} días</span>
                                </div>
                                <div style={{ height: 1, background: "#ccc", margin: "10px 0" }} />
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontWeight: 600 }}>Precio Total:</span>
                                    <span style={{ fontSize: 18, fontWeight: "bold", color: "black" }}>{totalPrice.toFixed(2)}€</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={styles.capacityRow}>
                        <div style={styles.capItem}>
                            <span style={styles.capLabel}>Pequeños</span>
                            <select
                                style={styles.select}
                                value={qtySmall}
                                onChange={e => setQtySmall(Number(e.target.value))}
                                disabled={!startDate || !endDate}
                            >
                                {[...Array(Math.floor(availability.small || 0) + 1).keys()].map(n => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                        </div>

                        <div style={styles.capItem}>
                            <span style={styles.capLabel}>Medianos</span>
                            <select
                                style={styles.select}
                                value={qtyMedium}
                                onChange={e => setQtyMedium(Number(e.target.value))}
                                disabled={!startDate || !endDate}
                            >
                                {[...Array(Math.floor(availability.medium || 0) + 1).keys()].map(n => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                        </div>

                        <div style={styles.capItem}>
                            <span style={styles.capLabel}>Grandes</span>
                            <select
                                style={styles.select}
                                value={qtyLarge}
                                onChange={e => setQtyLarge(Number(e.target.value))}
                                disabled={!startDate || !endDate}
                            >
                                {[...Array(Math.floor(availability.large || 0) + 1).keys()].map(n => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={styles.divider} />

                    {/* Warning Note */}
                    <div style={{ marginBottom: 15, padding: 12, background: "#fff8e1", borderLeft: "4px solid #ffc107", borderRadius: 4 }}>
                        <p style={{ margin: 0, fontSize: 13, color: "#856404" }}>
                            ⚠️ Antes de realizar tu reserva deberás enviar al dueño del espacio una foto de cada objeto para su aprobación.
                        </p>
                    </div>

                    {/* Buttons */}
                    <div style={styles.buttonRow}>
                        <button style={styles.cancelBtn} onClick={() => navigate(-1)}>Cancelar</button>
                        <button style={styles.reserveBtn} onClick={handleReserve} disabled={loading}>
                            {loading ? "Procesando..." : "Continuar"}
                        </button>
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
        background: "#f5f5f5",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20
    },
    card: {
        background: "white",
        width: "100%",
        maxWidth: 900,
        height: 500,
        borderRadius: 20,
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        display: "flex",
        overflow: "hidden"
    },
    imageSection: {
        flex: 1,
        background: "#eee",
        position: "relative"
    },
    image: {
        width: "100%",
        height: "100%",
        objectFit: "cover"
    },
    detailsSection: {
        flex: 1,
        padding: 40,
        display: "flex",
        flexDirection: "column",
        overflowY: "auto"
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        margin: "0 0 8px 0"
    },
    address: {
        fontSize: 14,
        color: "#666",
        margin: 0
    },
    divider: {
        height: 1,
        background: "#eee",
        margin: "20px 0"
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: 600,
        marginBottom: 12
    },
    row: {
        display: "flex",
        gap: 15
    },
    inputGroup: {
        flex: 1
    },
    label: {
        display: "block",
        fontSize: 12,
        color: "#999",
        marginBottom: 4
    },
    input: {
        width: "100%",
        padding: "8px 12px",
        borderRadius: 8,
        border: "1px solid #ddd",
        fontSize: 14
    },
    capacityRow: {
        display: "flex",
        justifyContent: "space-between",
        gap: 10
    },
    capItem: {
        flex: 1,
        textAlign: "center"
    },
    capLabel: {
        display: "block",
        fontSize: 12,
        marginBottom: 4
    },
    select: {
        width: "100%",
        padding: "8px",
        borderRadius: 8,
        border: "1px solid #ddd",
        textAlign: "center"
    },
    buttonRow: {
        marginTop: "auto", // Push to bottom
        display: "flex",
        gap: 15,
        paddingTop: 20
    },
    cancelBtn: {
        flex: 1,
        padding: "12px",
        borderRadius: 8,
        border: "1px solid #ccc",
        background: "transparent",
        cursor: "pointer",
        fontWeight: 600
    },
    reserveBtn: {
        flex: 1,
        padding: "12px",
        borderRadius: 8,
        border: "none",
        background: "black",
        color: "white",
        cursor: "pointer",
        fontWeight: 600
    }
};
