import React from "react";

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
    if (!isOpen) return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.backdrop} onClick={onClose} />
            <div className="animate-scaleIn" style={styles.modal}>
                <button onClick={onClose} style={styles.closeBtn}>✕</button>

                <h2 style={styles.title}>TÉRMINOS Y CONDICIONES DE USO</h2>
                <div style={styles.content}>
                    <p><strong>Guardyy</strong><br />Última actualización: 16 / 01 / 2026</p>
                    <hr style={styles.divider} />

                    <h3>1. Objeto</h3>
                    <p>Guardyy es una plataforma digital que conecta a personas que disponen de espacios de almacenamiento (“Anfitriones”) con personas que necesitan guardar objetos (“Usuarios”). Guardyy actúa como intermediario y no es propietario de los espacios publicados.</p>
                    <hr style={styles.divider} />

                    <h3>2. Aceptación de los términos</h3>
                    <p>Al registrarse o utilizar la plataforma, el usuario declara haber leído, comprendido y aceptado estos Términos y Condiciones. Si no está de acuerdo, no debe utilizar Guardyy.</p>
                    <hr style={styles.divider} />

                    <h3>3. Registro de usuarios</h3>
                    <p>Para utilizar determinadas funcionalidades, es necesario crear una cuenta.<br />
                        El usuario se compromete a:</p>
                    <ul>
                        <li>Proporcionar información veraz y actualizada.</li>
                        <li>Mantener la confidencialidad de sus credenciales.</li>
                        <li>No suplantar la identidad de terceros.</li>
                    </ul>
                    <p>Guardyy se reserva el derecho de suspender cuentas que incumplan estos términos.</p>
                    <hr style={styles.divider} />

                    <h3>4. Uso de la plataforma</h3>
                    <p>Los usuarios se comprometen a:</p>
                    <ul>
                        <li>Utilizar la plataforma de forma lícita.</li>
                        <li>No almacenar objetos ilegales, peligrosos o prohibidos (armas, drogas, material inflamable, etc.).</li>
                        <li>Respetar las condiciones acordadas entre Usuario y Anfitrión.</li>
                    </ul>
                    <hr style={styles.divider} />

                    <h3>5. Espacios y reservas</h3>
                    <ul>
                        <li>Los Anfitriones son responsables de la información proporcionada sobre sus espacios.</li>
                        <li>Las reservas se realizan por períodos determinados y según disponibilidad.</li>
                        <li>Guardyy no garantiza la disponibilidad continua de los espacios.</li>
                    </ul>
                    <hr style={styles.divider} />

                    <h3>6. Responsabilidad</h3>
                    <p>Guardyy no se hace responsable de:</p>
                    <ul>
                        <li>Daños, pérdidas o robos de objetos almacenados.</li>
                        <li>Incumplimientos entre Usuarios y Anfitriones.</li>
                        <li>Uso indebido de la plataforma por parte de terceros.</li>
                    </ul>
                    <p>La responsabilidad de Guardyy se limita al correcto funcionamiento técnico de la plataforma.</p>
                    <hr style={styles.divider} />

                    <h3>7. Pagos</h3>
                    <p>Cuando se habiliten los pagos:</p>
                    <ul>
                        <li>Las transacciones se gestionarán a través de proveedores de pago externos.</li>
                        <li>Guardyy no almacena datos bancarios de los usuarios.</li>
                        <li>Las condiciones económicas se mostrarán de forma clara antes de confirmar cualquier pago.</li>
                    </ul>
                    <hr style={styles.divider} />

                    <h3>8. Cancelaciones y finalización</h3>
                    <p>Guardyy se reserva el derecho de:</p>
                    <ul>
                        <li>Cancelar reservas en caso de uso indebido.</li>
                        <li>Suspender o eliminar cuentas que infrinjan estos términos.</li>
                        <li>Modificar o interrumpir el servicio de forma temporal o permanente.</li>
                    </ul>
                    <hr style={styles.divider} />

                    <h3>9. Propiedad intelectual</h3>
                    <p>Todos los contenidos de Guardyy (marca, diseño, código, textos) son propiedad de Guardyy o de sus licenciantes y están protegidos por la legislación vigente. Queda prohibida su reproducción sin autorización.</p>
                    <hr style={styles.divider} />

                    <h3>10. Protección de datos</h3>
                    <p>El tratamiento de los datos personales se rige por la Política de Privacidad, conforme a la normativa aplicable (RGPD). Los usuarios pueden ejercer sus derechos de acceso, rectificación y eliminación.</p>
                    <hr style={styles.divider} />

                    <h3>11. Modificaciones</h3>
                    <p>Guardyy podrá modificar estos Términos y Condiciones en cualquier momento. Los cambios serán publicados en la plataforma y entrarán en vigor desde su publicación.</p>
                    <hr style={styles.divider} />

                    <h3>12. Legislación aplicable</h3>
                    <p>Estos términos se rigen por la legislación española. Cualquier controversia se someterá a los juzgados y tribunales competentes.</p>
                </div>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    overlay: {
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
    },
    backdrop: {
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(5px)'
    },
    modal: {
        position: 'relative',
        background: 'white',
        width: 'min(800px, 100%)',
        maxHeight: '85vh',
        borderRadius: 20,
        padding: 40,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
    },
    closeBtn: {
        position: 'absolute',
        top: 20,
        right: 20,
        background: 'transparent',
        border: 'none',
        fontSize: 24,
        cursor: 'pointer',
        color: '#666'
    },
    title: {
        fontFamily: '"Playfair Display", serif',
        fontSize: 24,
        fontWeight: 700,
        marginBottom: 20,
        textAlign: 'center'
    },
    content: {
        overflowY: 'auto',
        paddingRight: 10,
        lineHeight: 1.6,
        fontSize: 14,
        color: '#333'
    },
    divider: {
        border: 'none',
        borderTop: '1px solid #eee',
        margin: '20px 0'
    }
};
