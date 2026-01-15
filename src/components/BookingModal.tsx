import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
    start_date: string;
    end_date: string;
    qty_small: number;
    qty_medium: number;
    qty_large: number;
}

interface BookingModalProps {
    space: Space;
    onClose: () => void;
    initialStartDate?: string;
    initialEndDate?: string;
}

export default function BookingModal({ space, onClose, initialStartDate, initialEndDate }: BookingModalProps) {
    const navigate = useNavigate();
    const [reservations, setReservations] = useState<Reservation[]>([]);

    // Form State
    const [startDate, setStartDate] = useState(initialStartDate || "");
    const [endDate, setEndDate] = useState(initialEndDate || "");
    const [qtySmall, setQtySmall] = useState(0);
    const [qtyMedium, setQtyMedium] = useState(0);
    const [qtyLarge, setQtyLarge] = useState(0);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        // Fetch Existing Reservations for availability calculation
        fetch(`/api/get-space-reservations?space_id=${space.id}`)
            .then(res => res.json())
            .then((data: any) => {
                if (data.ok) setReservations(data.reservations);
            })
            .catch(err => console.error(err));
    }, [space.id]);

    // Calculate dynamic availability
    const getAvailability = () => {
        if (!startDate || !endDate) return { small: 0, medium: 0, large: 0 };
        if (startDate > endDate) return { small: 0, medium: 0, large: 0 };

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
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        const dailyTotal =
            (qtySmall * (space.price_small || 0)) +
            (qtyMedium * (space.price_medium || 0)) +
            (qtyLarge * (space.price_large || 0));

        return dailyTotal * diffDays;
    };
    const totalPrice = calculateTotal();

    // Reset quantities if availability drops
    useEffect(() => {
        if (qtySmall > availability.small) setQtySmall(0);
        if (qtyMedium > availability.medium) setQtyMedium(0);
        if (qtyLarge > availability.large) setQtyLarge(0);
    }, [startDate, endDate]);

    const handleReserve = () => {
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

        // Navigate to Verify Items (could also be modaled, but keeping navigation for now)
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

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 300); // Wait for animation
    };

    const imageUrl = space.image_base64 && space.image_base64.startsWith("data:")
        ? space.image_base64
        : space.image_base64 ? `/api/images/${space.image_base64}` : "";

    return (
        <div style={styles.overlay}>
            {/* Backdrop */}
            <div
                style={{ ...styles.backdrop, opacity: isClosing ? 0 : 1 }}
                onClick={handleClose}
            />

            <div style={styles.cardWrapper}>
                <div
                    style={{ ...styles.card, animation: isClosing ? 'scaleOut 0.3s forwards' : 'expandFromCenter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
                >
                    {/* Left: Image */}
                    <div style={styles.imageSection}>
                        {imageUrl ? (
                            <img src={imageUrl} style={styles.image} alt={space.name} />
                        ) : (
                            <div style={styles.placeholderImg}>Sin Imagen</div>
                        )}
                        <button style={styles.closeBtn} onClick={handleClose}>×</button>
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
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Hasta</label>
                                <input
                                    type="date"
                                    style={styles.input}
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div style={styles.divider} />

                        {/* Capacity */}
                        <div style={styles.sectionHeader}>Objetos a reservar</div>
                        {(!startDate || !endDate) && (
                            <p style={{ fontSize: 12, color: "#666" }}>Selecciona fechas para ver disponibilidad</p>
                        )}

                        <div style={styles.summaryBox}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 600 }}>Total:</span>
                                <span style={{ fontSize: 18, fontWeight: "bold" }}>{totalPrice.toFixed(2)}€</span>
                            </div>
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

                        <div style={styles.warningBox}>
                            ⚠️ Antes de realizar tu reserva deberás enviar fotos para aprobación.
                        </div>

                        <div style={styles.buttonRow}>
                            <button style={styles.cancelBtn} className="btn-secondary" onClick={handleClose}>Cancelar</button>
                            <button style={styles.reserveBtn} className="btn-primary" onClick={handleReserve}>
                                Continuar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    overlay: {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    backdrop: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        transition: 'opacity 0.3s ease'
    },
    cardWrapper: {
        position: 'relative',
        zIndex: 10000,
        width: 'min(90%, 800px)',
        height: 'min(90%, 600px)',
    },
    card: {
        background: 'white',
        width: '100%',
        height: '100%',
        borderRadius: 20,
        display: 'flex',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        transformOrigin: 'center center' // Expand from center
    },
    imageSection: {
        flex: 1,
        background: '#eee',
        position: 'relative',
        display: 'none', // Hide on mobile defaults? Let's keep flex logic
    },
    image: { width: '100%', height: '100%', objectFit: 'cover' },
    placeholderImg: { display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#888' },
    closeBtn: {
        position: 'absolute',
        top: 20, left: 20,
        background: 'rgba(255,255,255,0.8)',
        border: 'none', borderRadius: '50%',
        width: 36, height: 36,
        fontSize: 24, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
    detailsSection: {
        flex: 1,
        padding: 30,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        minWidth: 350
    },
    title: { margin: '0 0 5px', fontSize: 22, fontWeight: 'bold' },
    address: { fontSize: 13, color: '#666', margin: 0 },
    divider: { height: 1, background: '#eee', margin: '15px 0' },
    sectionHeader: { fontSize: 14, fontWeight: 600, marginBottom: 10 },
    row: { display: 'flex', gap: 10 },
    inputGroup: { flex: 1 },
    label: { display: 'block', fontSize: 11, color: '#999', marginBottom: 2 },
    input: { width: '100%', padding: '8px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 },
    summaryBox: { padding: 12, background: '#f9f9f9', borderRadius: 8, border: '1px solid #eee', marginBottom: 15 },
    capacityRow: { display: 'flex', gap: 8 },
    capItem: { flex: 1 },
    capLabel: { fontSize: 11, marginBottom: 2, display: 'block' },
    select: { width: '100%', padding: '6px', borderRadius: 6, border: '1px solid #ddd' },
    warningBox: { fontSize: 12, color: '#856404', background: '#fff3cd', padding: 10, borderRadius: 6, marginBottom: 15, borderLeft: '3px solid #ffeeba' },
    buttonRow: { marginTop: 'auto', display: 'flex', gap: 10 },
    cancelBtn: { flex: 1, padding: '10px', borderRadius: 8, background: 'transparent', border: '1px solid #ccc', cursor: 'pointer' },
    reserveBtn: { flex: 1, padding: '10px', borderRadius: 8, background: 'black', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }
};

// Add responsive logic via media queries or JS if needed, but flex handles basics.
