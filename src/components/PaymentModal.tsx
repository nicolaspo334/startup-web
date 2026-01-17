import { useState } from "react";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    spaceName: string;
    onSuccess: () => void;
}

export default function PaymentModal({ isOpen, onClose, amount, spaceName, onSuccess }: PaymentModalProps) {
    const [loading, setLoading] = useState(false);
    const [method, setMethod] = useState<"card" | "paypal" | null>(null);

    // Mock Payment Process
    const handlePayment = async (selectedMethod: "card" | "paypal") => {
        setMethod(selectedMethod);
        setLoading(true);

        // Simulate API call
        // In real life: call /api/create-payment-intent (Stripe) or /api/create-paypal-order
        setTimeout(() => {
            setLoading(false);
            onSuccess();
            onClose();
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.backdrop} onClick={onClose} />
            <div style={styles.modal}>
                <button style={styles.closeBtn} onClick={onClose}>×</button>

                <h2 style={styles.title}>Finalizar Reserva</h2>
                <p style={styles.subtitle}>Estás a un paso de reservar en <strong>{spaceName}</strong></p>

                <div style={styles.amountBox}>
                    <span style={{ fontSize: 14, color: '#666' }}>Total a pagar</span>
                    <span style={{ fontSize: 32, fontWeight: 'bold' }}>{amount.toFixed(2)}€</span>
                </div>

                <div style={styles.methods}>
                    {/* Stripe / Card Option */}
                    <button
                        style={{ ...styles.methodBtn, border: method === 'card' ? '2px solid black' : '1px solid #ddd' }}
                        onClick={() => handlePayment('card')}
                        disabled={loading}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 24 }}>💳</span>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontWeight: 600 }}>Tarjeta de Crédito</div>
                                <div style={{ fontSize: 11, color: '#888' }}>Pago seguro vía Stripe</div>
                            </div>
                        </div>
                        {loading && method === 'card' && <div style={styles.loader}></div>}
                    </button>

                    {/* PayPal Option */}
                    <button
                        style={{ ...styles.methodBtn, border: method === 'paypal' ? '2px solid #003087' : '1px solid #ddd' }}
                        onClick={() => handlePayment('paypal')}
                        disabled={loading}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 24 }}>🅿️</span>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontWeight: 600, color: '#003087' }}>PayPal</div>
                                <div style={{ fontSize: 11, color: '#888' }}>Usa tu saldo o tarjeta</div>
                            </div>
                        </div>
                        {loading && method === 'paypal' && <div style={styles.loader}></div>}
                    </button>
                </div>

                <div style={styles.secureBadge}>
                    🔒 Tus pagos están protegidos con encriptación SSL de 256-bits.
                </div>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    overlay: {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    backdrop: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(3px)'
    },
    modal: {
        position: 'relative',
        background: 'white',
        width: 'min(90%, 400px)',
        borderRadius: 20,
        padding: 30,
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        textAlign: 'center'
    },
    closeBtn: {
        position: 'absolute',
        top: 15, right: 15,
        background: 'none',
        border: 'none',
        fontSize: 24,
        cursor: 'pointer',
        color: '#888'
    },
    title: {
        margin: '0 0 5px 0',
        fontFamily: '"Playfair Display", serif',
        fontSize: 24
    },
    subtitle: {
        margin: '0 0 25px 0',
        fontSize: 14,
        color: '#666'
    },
    amountBox: {
        background: '#f9f9f9',
        padding: 20,
        borderRadius: 16,
        marginBottom: 25,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 5
    },
    methods: {
        display: 'flex',
        flexDirection: 'column',
        gap: 12
    },
    methodBtn: {
        background: 'white',
        padding: 15,
        borderRadius: 12,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'all 0.2s',
        position: 'relative',
        overflow: 'hidden'
    },
    secureBadge: {
        marginTop: 25,
        fontSize: 11,
        color: '#888',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6
    },
    loader: {
        width: 16,
        height: 16,
        border: '2px solid #ccc',
        borderTopColor: '#333',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    }
};

// Add keyframes via style tag logic or assumes global css is present for spinner
