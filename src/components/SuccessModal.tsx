
import React, { useEffect, useState } from "react";

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: string;
}

export default function SuccessModal({ isOpen, onClose, message }: SuccessModalProps) {
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsClosing(false);
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 300); // Match animation duration
    };

    if (!isOpen) return null;

    return (
        <div style={styles.overlay}>
            <div
                style={{ ...styles.backdrop, opacity: isClosing ? 0 : 1 }}
                onClick={handleClose}
            />
            <div style={{
                ...styles.modal,
                animation: isClosing ? 'scaleOut 0.3s forwards' : 'scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
            }}>
                <button onClick={handleClose} style={styles.closeBtn}>✕</button>

                <h2 style={styles.message}>
                    {message}
                </h2>

                <div style={styles.videoContainer}>
                    <video
                        src="/success-tick.mp4"
                        autoPlay
                        muted
                        playsInline
                        // No loop by default? loops usually better for ticks if they pause at end. 
                        // User said "video en bucle" (loop), so loop it is.
                        loop
                        style={styles.video}
                    />
                </div>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0)", // Transparent container, backdrop handles dimming
        zIndex: 10000,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        pointerEvents: "auto" // Ensure clicks are captured
    },
    backdrop: {
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.5)",
        transition: "opacity 0.3s"
    },
    modal: {
        position: "relative",
        background: "white",
        width: "min(400px, 90%)",
        padding: "40px 30px",
        borderRadius: 20,
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        zIndex: 10001
    },
    closeBtn: {
        position: "absolute",
        top: 15,
        right: 15,
        background: "transparent",
        border: "none",
        fontSize: 20,
        cursor: "pointer",
        color: "#888"
    },
    message: {
        fontFamily: '"Playfair Display", serif',
        fontStyle: "italic",
        fontSize: 24,
        color: "#333",
        marginBottom: 30,
        lineHeight: 1.4
    },
    videoContainer: {
        width: 150,
        height: 150,
        // borderRadius: "50%", // Removed as per request
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f9f9f9" // Fallback
    },
    video: {
        width: "100%",
        height: "100%",
        objectFit: "cover"
    }
};
