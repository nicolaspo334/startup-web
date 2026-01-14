
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Custom Red Pin Icon
import L from "leaflet";
import redPin from "../../assets/red_pin.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
    iconUrl: redPin,
    shadowUrl: iconShadow,
    iconSize: [40, 40], // Adjusted size for the pin
    iconAnchor: [20, 40], // Point at bottom center
    popupAnchor: [0, -40] // Popup opens above the pin
});
L.Marker.prototype.options.icon = DefaultIcon;

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
    lat: number;
    lng: number;
}

interface Reservation {
    id: number;
    space_name: string;
    space_address: string;
    space_id: string;
    start_date: string;
    end_date: string;
    qty_small: number;
    qty_medium: number;
    qty_large: number;
    image_base64: string;
}

export default function UserSearch() {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [loadingAI, setLoadingAI] = useState(false);

    // Data
    const [allSpaces, setAllSpaces] = useState<Space[]>([]);
    const [filteredSpaces, setFilteredSpaces] = useState<Space[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);

    // AI Requirement result
    const [requirements, setRequirements] = useState<{ small: number, medium: number, large: number } | null>(null);

    // Initial Load
    useEffect(() => {
        // Fetch Spaces
        fetch("/api/get-all-spaces")
            .then(res => res.json())
            .then((data: any) => {
                if (data.ok) {
                    setAllSpaces(data.spaces);
                    setFilteredSpaces(data.spaces);
                }
            })
            .catch(err => console.error(err));

        loadReservations();
    }, []);

    const loadReservations = () => {
        const userId = localStorage.getItem("user_id");
        if (userId) {
            fetch(`/api/get-user-reservations?user_id=${userId}`)
                .then(res => res.json())
                .then((data: any) => {
                    if (data.ok) setReservations(data.reservations);
                })
                .catch(err => console.error("Error fetching reservations", err));
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("user_id");
        navigate("/usuario/login");
    };

    const handleDeleteReservation = async (id: number) => {
        if (!confirm("¿Seguro que quieres eliminar esta reserva?")) return;
        const userId = localStorage.getItem("user_id");
        if (!userId) return;

        try {
            const res = await fetch(`/api/delete-reservation?id=${id}&user_id=${userId}`, { method: "DELETE" });
            if (res.ok) {
                loadReservations(); // Refresh list
            } else {
                alert("No se pudo eliminar la reserva");
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión");
        }
    };

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!query.trim()) {
            setFilteredSpaces(allSpaces);
            setRequirements(null);
            return;
        }

        if (!startDate || !endDate) {
            alert("Por favor selecciona fecha de inicio y fin para buscar disponibilidad real.");
            return;
        }

        if (startDate > endDate) {
            alert("La fecha de fin debe ser posterior a la de inicio");
            return;
        }

        setLoadingAI(true);
        try {
            // 1. AI Classify
            const resClassify = await fetch("/api/classify-items", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query })
            });
            const reqs = await resClassify.json() as any;

            if (reqs) {
                setRequirements(reqs);

                // 2. Availability Check (Server Side)
                const resAvail = await fetch("/api/search-availability", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        start_date: startDate,
                        end_date: endDate,
                        req_small: reqs.small || 0,
                        req_medium: reqs.medium || 0,
                        req_large: reqs.large || 0
                    })
                });

                const dataAvail = await resAvail.json() as any;
                if (dataAvail.ok) {
                    setFilteredSpaces(dataAvail.spaces);
                } else {
                    console.error("Availability error", dataAvail.error);
                    // Fallback to local filter if server fails, though risky
                    const filtered = allSpaces.filter(s => {
                        return (
                            (s.capacity_small || 0) >= reqs.small &&
                            (s.capacity_medium || 0) >= reqs.medium &&
                            (s.capacity_large || 0) >= reqs.large
                        );
                    });
                    setFilteredSpaces(filtered);
                }
            }
        } catch (err) {
            console.error("Search error", err);
            alert("Error en la búsqueda");
        } finally {
            setLoadingAI(false);
        }
    };

    return (
        <div style={styles.page}>
            {/* Top Bar Overlay */}
            <div style={styles.topBar}>
                <button onClick={handleLogout} style={styles.logoutBtn}>
                    Cerrar Sesión
                </button>
                <form onSubmit={handleSearch} style={styles.searchForm}>
                    <input
                        style={styles.input}
                        placeholder="ej. Quiero guardar 2 bicis..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />

                    {/* Date Inputs */}
                    <div style={styles.dateGroup}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ fontSize: 10, color: '#888' }}>Inicio</label>
                            <input
                                type="date"
                                style={styles.dateInput}
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ fontSize: 10, color: '#888' }}>Fin</label>
                            <input
                                type="date"
                                style={styles.dateInput}
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <button type="submit" disabled={loadingAI} style={styles.searchBtn}>
                        {loadingAI ? "..." : "🔍"}
                    </button>
                </form>
                {requirements && (
                    <div style={styles.aiBadge}>
                        {requirements.small} Peq, {requirements.medium} Med, {requirements.large} Gran
                    </div>
                )}
            </div>

            {/* Right Side Panel - My Reservations */}
            <div style={styles.sidePanel}>
                <h2 style={styles.panelTitle}>Tus Reservas</h2>
                <div style={styles.reservationsList}>
                    {reservations.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#666', fontSize: 14 }}>No tienes reservas activas.</p>
                    ) : (
                        reservations.map(res => (
                            <div key={res.id} style={styles.resCard}>
                                <div style={styles.resHeader}>
                                    <h3 style={styles.resTitle}>{res.space_name}</h3>
                                    <span style={styles.resDate}>{res.start_date.split('T')[0]} / {res.end_date.split('T')[0]}</span>
                                </div>
                                <p style={styles.resAddress}>{res.space_address}</p>
                                <div style={styles.resItems}>
                                    {res.qty_small > 0 && <span>📦 Peq: {res.qty_small}</span>}
                                    {res.qty_medium > 0 && <span>📦 Med: {res.qty_medium}</span>}
                                    {res.qty_large > 0 && <span>📦 Gra: {res.qty_large}</span>}
                                </div>
                                <div style={styles.resActions}>
                                    <button
                                        style={styles.editBtn}
                                        onClick={() => navigate(`/usuario/reservar/${res.space_id}`)}
                                        title="Editar (Crear nueva reserva)"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        style={styles.deleteBtn}
                                        onClick={() => handleDeleteReservation(res.id)}
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Map */}
            <MapContainer center={[40.416775, -3.703790]} zoom={13} style={{ width: "100%", height: "100%" }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {filteredSpaces.map(space => {
                    // Only render if valid coords
                    if (!space.lat || !space.lng) return null;

                    return (
                        <Marker key={space.id} position={[space.lat, space.lng]}>
                            <Popup>
                                <div style={{ width: 200 }}>
                                    {space.image_base64 && (
                                        <img
                                            src={space.image_base64.startsWith("data:") ? space.image_base64 : `/api/images/${space.image_base64}`}
                                            style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8 }}
                                        />
                                    )}
                                    <h3 style={{ margin: "8px 0", fontSize: 16 }}>{space.name}</h3>
                                    <p style={{ margin: 0, fontSize: 12, color: "#666" }}>{space.type} • {space.size_m2}m²</p>
                                    <p style={{ margin: "4px 0", fontSize: 12 }}>{space.address}</p>

                                    {/* Estimated Price Display */}
                                    {(requirements && startDate && endDate) && (
                                        <div style={{ margin: "8px 0", padding: "6px", background: "#f0f0f0", borderRadius: 6 }}>
                                            <p style={{ margin: 0, fontSize: 11, color: "#555" }}>Est. Total:</p>
                                            <p style={{ margin: 0, fontSize: 14, fontWeight: "bold" }}>
                                                {(() => {
                                                    const start = new Date(startDate);
                                                    const end = new Date(endDate);
                                                    const days = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) + 1);

                                                    const totalInfo =
                                                        (requirements.small * (space.price_small || 0)) +
                                                        (requirements.medium * (space.price_medium || 0)) +
                                                        (requirements.large * (space.price_large || 0));

                                                    return (totalInfo * days).toFixed(2) + "€";
                                                })()}
                                            </p>
                                        </div>
                                    )}
                                    <button
                                        style={styles.bookBtn}
                                        onClick={() => navigate(`/usuario/reservar/${space.id}?start=${startDate}&end=${endDate}`)}
                                    >
                                        Reservar
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    page: {
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden"
    },
    topBar: {
        position: "absolute",
        top: 20,
        left: 20,
        right: 320, // Leave space for side panel
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        gap: 12,
        pointerEvents: "none" // Allow map clicks through empty space
    },
    logoutBtn: {
        pointerEvents: "auto",
        background: "white",
        border: "1px solid #ccc",
        padding: "10px 16px",
        borderRadius: 20,
        fontWeight: 600,
        cursor: "pointer",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        whiteSpace: "nowrap"
    },
    searchForm: {
        pointerEvents: "auto",
        display: "flex",
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        borderRadius: 50,
        background: "white",
        overflow: "hidden",
        padding: "4px",
        alignItems: "center"
        // removed maxWidth 900
    },
    input: {
        width: 250, // Reduced width
        border: "none",
        padding: "12px 20px",
        fontSize: 16,
        outline: "none"
    },
    dateGroup: {
        display: "flex",
        gap: 8,
        padding: "0 10px",
        borderLeft: "1px solid #eee"
    },
    dateInput: {
        border: "none",
        fontSize: 13,
        outline: "none",
        fontFamily: "inherit"
    },
    searchBtn: {
        background: "black",
        color: "white",
        border: "none",
        borderRadius: 50,
        width: 48,
        height: 48,
        cursor: "pointer",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: 20
    },
    aiBadge: {
        pointerEvents: "auto",
        background: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "6px 16px",
        borderRadius: 20,
        fontSize: 12,
        backdropFilter: "blur(5px)"
    },
    sidePanel: {
        position: "absolute",
        top: 20,
        right: 20,
        bottom: 20,
        width: 300,
        background: "white",
        borderRadius: 20,
        boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        padding: 20,
        overflow: "hidden"
    },
    panelTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 16,
        fontFamily: '"Playfair Display", serif'
    },
    reservationsList: {
        flex: 1,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 12
    },
    resCard: {
        border: "1px solid #eee",
        borderRadius: 12,
        padding: 12,
        background: "#f9f9f9"
    },
    resHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        marginBottom: 4
    },
    resTitle: {
        fontSize: 14,
        fontWeight: "bold",
        margin: 0
    },
    resDate: {
        fontSize: 10,
        color: "#888"
    },
    resAddress: {
        fontSize: 11,
        color: "#666",
        margin: "0 0 8px 0"
    },
    resItems: {
        fontSize: 11,
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        marginBottom: 10
    },
    resActions: {
        display: "flex",
        gap: 8
    },
    editBtn: {
        flex: 1,
        padding: "6px",
        borderRadius: 6,
        border: "1px solid #2196F3",
        background: "transparent",
        color: "#2196F3",
        fontSize: 12,
        cursor: "pointer",
        fontWeight: 600
    },
    deleteBtn: {
        flex: 1,
        padding: "6px",
        borderRadius: 6,
        border: "1px solid #F44336",
        background: "transparent",
        color: "#F44336",
        fontSize: 12,
        cursor: "pointer",
        fontWeight: 600
    },
    bookBtn: {
        width: "100%",
        background: "black",
        color: "white",
        border: "none",
        padding: "8px",
        borderRadius: 6,
        marginTop: 8,
        cursor: "pointer",
        fontWeight: 600
    }
};
