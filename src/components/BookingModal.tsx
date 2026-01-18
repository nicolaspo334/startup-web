
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SuccessModal from "./SuccessModal";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { STRIPE_PUBLIC_KEY } from "../config";

// Load Stripe outside of render
const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

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
    min_days?: number;
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
    initialQtySmall?: number;
    initialQtyMedium?: number;
    initialQtyLarge?: number;
    onSuccess?: () => void;
}

// --- Checkout Form Component (Child of Elements) ---
const CheckoutForm = ({
    totalPrice,
    onSubmit,
    onBack,
    loading
}: {
    totalPrice: number,
    onSubmit: (paymentMethodId?: string) => void,
    onBack: () => void,
    loading: boolean
}) => {
    const stripe = useStripe();
    const elements = useElements();
    const [msg, setMsg] = useState("");
    const [localLoading, setLocalLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setLocalLoading(true);
        setMsg("");

        // Trigger the payment confirmation (Authentication + Authorization - capture manual)
        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    // We don't actually intend to redirect if unnecessary, 
                    // but return_url is required by Stripe just in case.
                    return_url: window.location.origin + "/payment-finished",
                },
                redirect: "if_required",
            });

            if (error) {
                setMsg(error.message || "Error en el pago");
                setLocalLoading(false);
            } else if (paymentIntent && (paymentIntent.status === "requires_capture" || paymentIntent.status === "succeeded")) {
                // Success! The money is on hold.
                onSubmit(paymentIntent.id);
            } else {
                setMsg("Estado del pago: " + (paymentIntent?.status || "desconocido"));
                setLocalLoading(false);
            }
        } catch (err: any) {
            setMsg(err.message || "Error desconocido");
            setLocalLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <PaymentElement />
            {msg && <div style={{ color: "#d32f2f", marginTop: 10, fontSize: 13, background: "#ffebee", padding: 10, borderRadius: 6 }}>{msg}</div>}

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button type="button" style={styles.cancelBtn} className="btn-secondary" onClick={onBack}>Atrás</button>
                <button type="submit" style={styles.reserveBtn} className="btn-primary" disabled={loading || localLoading || !stripe}>
                    {(loading || localLoading) ? "Procesando..." : `Pagar ${totalPrice.toFixed(2)}€`}
                </button>
            </div>
        </form>
    );
};


export default function BookingModal({
    space,
    onClose,
    initialStartDate,
    initialEndDate,
    initialQtySmall = 0,
    initialQtyMedium = 0,
    initialQtyLarge = 0,
    onSuccess
}: BookingModalProps) {
    const navigate = useNavigate();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [successOpen, setSuccessOpen] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    // UI State
    const [step, setStep] = useState(1); // 1: Details, 2: Verification, 3: Payment
    const [isClosing, setIsClosing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State (Step 1)
    const [startDate, setStartDate] = useState(initialStartDate || "");
    const [endDate, setEndDate] = useState(initialEndDate || "");
    const [qtySmall, setQtySmall] = useState(initialQtySmall);
    const [qtyMedium, setQtyMedium] = useState(initialQtyMedium);
    const [qtyLarge, setQtyLarge] = useState(initialQtyLarge);

    // Verification State (Step 2)
    const [items, setItems] = useState<{ type: string, index: number, file: File | null, preview: string }[]>([]);

    // Payment State (Step 3)
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
    const [clientSecret, setClientSecret] = useState("");
    // const [paymentIntentId, setPaymentIntentId] = useState(""); // Not strictly needed in state if passed through onSubmit

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

    useEffect(() => {
        if (startDate && endDate) {
            if (qtySmall > availability.small) setQtySmall(availability.small);
            if (qtyMedium > availability.medium) setQtyMedium(availability.medium);
            if (qtyLarge > availability.large) setQtyLarge(availability.large);
        }
    }, [startDate, endDate, availability.small, availability.medium, availability.large]);

    // Step 1 -> Step 2
    const handleNext = () => {
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

        // Validate Minimum Stay
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive days

        if (space.min_days && diffDays < space.min_days) {
            alert(`Este espacio requiere una estancia mínima de ${space.min_days} días.`);
            return;
        }

        if (qtySmall === 0 && qtyMedium === 0 && qtyLarge === 0) {
            alert("Selecciona al menos un objeto para guardar");
            return;
        }

        // Prepare items for verification if Step 1
        if (step === 1) {
            const newItems = [];
            for (let i = 0; i < qtySmall; i++) newItems.push({ type: "Pequeño", index: i + 1, file: null, preview: "" });
            for (let i = 0; i < qtyMedium; i++) newItems.push({ type: "Mediano", index: i + 1, file: null, preview: "" });
            for (let i = 0; i < qtyLarge; i++) newItems.push({ type: "Grande", index: i + 1, file: null, preview: "" });
            setItems(newItems);
            setStep(2);
        }
    };

    // Step 2 Logic (Image Upload)
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

    const handleBack = () => {
        if (step === 2) setStep(1);
        if (step === 3) setStep(2);
    };

    // Step 2 -> Step 3
    const handleGoToPayment = async () => {
        if (items.some(i => !i.file)) {
            alert("Por favor, sube una foto para cada objeto.");
            return;
        }

        setLoading(true);
        // Initialize Payment Intent
        try {
            const res = await fetch("/api/create-payment-intent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: totalPrice })
            });
            const data = await res.json() as any;

            if (data.clientSecret) {
                setClientSecret(data.clientSecret);
                // setPaymentIntentId(data.id);
                setStep(3);
            } else {
                alert("Error al iniciar el pago: " + (data.error || "Desconocido"));
            }
        } catch (e) {
            console.error(e);
            alert("Error de conexión al iniciar pago");
        } finally {
            setLoading(false);
        }
    };

    // Final Submit (Step 3) - Called by Stripe Form or PayPal Button
    const handleFinalSubmit = async (confirmedPaymentId?: string) => {
        const userId = localStorage.getItem("user_id");
        if (!userId) return;

        setLoading(true);
        try {
            const itemPhotos = items.map(i => i.preview);

            const payload = {
                user_id: userId,
                space_id: space.id,
                start_date: startDate,
                end_date: endDate,
                qty_small: qtySmall,
                qty_medium: qtyMedium,
                qty_large: qtyLarge,
                item_photos: itemPhotos,
                status: "pending", // Owner needs to approve
                payment_method: paymentMethod,
                payment_intent_id: confirmedPaymentId || "paypal_mock_id",
                payment_status: confirmedPaymentId ? "requires_capture" : "pending_approval"
            };

            const res = await fetch("/api/create-reservation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json() as any;
            if (data.ok) {
                setSuccessMsg("¡Reserva solicitada! El dinero está retenido hasta la aprobación del dueño.");
                setSuccessOpen(true);
                setTimeout(() => {
                    if (onSuccess) onSuccess();
                    handleClose();
                }, 3000);
            } else {
                alert("Error al guardar reserva: " + data.error);
            }
        } catch (err) {
            console.error(err);
            alert("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 300);
    };

    const imageUrl = space.image_base64 && space.image_base64.startsWith("data:")
        ? space.image_base64
        : space.image_base64 ? `/api/images/${space.image_base64}` : "";

    return (
        <div style={styles.overlay}>
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

                    {/* Right: Content */}
                    <div style={styles.detailsSection}>
                        {step === 1 ? (
                            <>
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
                                    <button
                                        style={{ ...styles.reserveBtn, opacity: (!startDate || !endDate) ? 0.5 : 1 }}
                                        className="btn-primary"
                                        onClick={handleNext}
                                        disabled={!startDate || !endDate}
                                    >
                                        Continuar
                                    </button>
                                </div>
                            </>
                        ) : step === 2 ? (
                            <>
                                <h1 style={styles.title}>Verificación de Objetos</h1>
                                <p style={styles.address}>Sube una foto clara de cada objeto para continuar.</p>
                                <div style={styles.divider} />

                                <div style={{ flex: 1, overflowY: 'auto', marginBottom: 20 }}>
                                    {items.map((item, idx) => (
                                        <div key={idx} style={styles.itemRow}>
                                            <div style={{ flex: 1 }}>
                                                <span style={{ fontWeight: 600, fontSize: 14 }}>Objeto {item.type} #{item.index}</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileChange(idx, e.target.files?.[0] || null)}
                                                    style={{ display: 'block', marginTop: 8, fontSize: 12 }}
                                                />
                                            </div>
                                            {item.preview && (
                                                <img src={item.preview} alt="Preview" style={{ width: 50, height: 50, borderRadius: 6, objectFit: "cover", marginLeft: 10 }} />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div style={styles.buttonRow}>
                                    <button style={styles.cancelBtn} className="btn-secondary" onClick={handleBack}>Atrás</button>
                                    <button style={styles.reserveBtn} className="btn-primary" onClick={handleGoToPayment}>
                                        {loading ? "Cargando..." : "Continuar al Pago"}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h1 style={styles.title}>Pago Seguro</h1>
                                <p style={styles.address}>El dueño confirmará tu reserva antes de cobrarte.</p>
                                <div style={styles.divider} />

                                <div style={styles.summaryBox}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                        <span>Total a pagar:</span>
                                        <span style={{ fontWeight: "bold" }}>{totalPrice.toFixed(2)}€</span>
                                    </div>
                                    <p style={{ fontSize: 11, color: '#666', margin: 0 }}>
                                        * Se realizará una retención en tu tarjeta. Solo se cobrará si el dueño acepta la reserva.
                                    </p>
                                </div>

                                <div style={{ marginBottom: 20 }}>
                                    <div style={styles.paymentMethods}>
                                        <button
                                            style={paymentMethod === 'card' ? styles.paymentMethodActive : styles.paymentMethodInactive}
                                            onClick={() => setPaymentMethod('card')}
                                        >
                                            Tarjeta (Stripe)
                                        </button>
                                        <button
                                            style={paymentMethod === 'paypal' ? styles.paymentMethodActive : styles.paymentMethodInactive}
                                            onClick={() => setPaymentMethod('paypal')}
                                        >
                                            PayPal
                                        </button>
                                    </div>

                                    {paymentMethod === 'card' ? (
                                        clientSecret ? (
                                            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                                                <CheckoutForm
                                                    totalPrice={totalPrice}
                                                    onSubmit={(pid) => handleFinalSubmit(pid)}
                                                    onBack={handleBack}
                                                    loading={loading}
                                                />
                                            </Elements>
                                        ) : (
                                            <div style={{ textAlign: 'center', padding: 20 }}>Cargando seguridad de pago...</div>
                                        )
                                    ) : (
                                        <div style={styles.paypalBox}>
                                            <p style={{ margin: '0 0 10px 0', fontSize: 14 }}>
                                                Serás redirigido a PayPal para completar el pago de forma segura.
                                            </p>
                                            <button style={styles.paypalBtn} onClick={() => handleFinalSubmit("paypal_mock_id")}>
                                                Pagar con PayPal
                                            </button>
                                            <div style={{ marginTop: 20 }}>
                                                <button style={styles.cancelBtn} onClick={handleBack}>Atrás</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <SuccessModal
                isOpen={successOpen}
                onClose={() => {
                    setSuccessOpen(false);
                    // Ensure we close the parent modal if user manually closes success modal early
                    if (onSuccess) onSuccess();
                    handleClose();
                }}
                message={successMsg}
            />
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
        transformOrigin: 'center center'
    },
    imageSection: {
        flex: 1,
        background: '#eee',
        position: 'relative',
        display: 'none', // Can use JS to show on large screens if desired, keeping simple logic
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
    reserveBtn: { flex: 1, padding: '10px', borderRadius: 8, background: 'black', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 },
    itemRow: {
        display: 'flex',
        alignItems: 'center',
        background: '#f9f9f9',
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
        border: '1px solid #eee'
    },
    paymentMethods: {
        display: 'flex',
        gap: 10,
        marginBottom: 15
    },
    paymentMethodActive: {
        flex: 1,
        padding: '8px',
        borderRadius: 6,
        border: '1px solid black',
        background: 'black',
        color: 'white',
        fontSize: 13,
        cursor: 'pointer'
    },
    paymentMethodInactive: {
        flex: 1,
        padding: '8px',
        borderRadius: 6,
        border: '1px solid #ddd',
        background: 'white',
        color: '#444',
        fontSize: 13,
        cursor: 'pointer'
    },
    cardForm: {
        background: '#f8f9fa',
        padding: 15,
        borderRadius: 10,
        border: '1px solid #eee',
        display: 'flex',
        flexDirection: 'column',
        gap: 10
    },
    paypalBox: {
        background: '#f9f9f9',
        padding: 20,
        borderRadius: 10,
        border: '1px solid #eee',
        textAlign: 'center'
    },
    paypalBtn: {
        background: '#0070ba',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: 20,
        fontWeight: 'bold',
        cursor: 'pointer',
        fontSize: 14
    }
};
