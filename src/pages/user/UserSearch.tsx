
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet Default Icon issue in React
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
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
    image_base64: string;
    lat: number;
    lng: number;
}

export default function UserSearch() {
    const navigate = useNavigate(); // Used for Back button
    const [query, setQuery] = useState("");
    const [loadingAI, setLoadingAI] = useState(false);

    // All spaces from DB
    const [allSpaces, setAllSpaces] = useState<Space[]>([]);
    // Filtered spaces to show on map
    const [filteredSpaces, setFilteredSpaces] = useState<Space[]>([]);

    // AI Requirement result
    const [requirements, setRequirements] = useState<{ small: number, medium: number, large: number } | null>(null);

    useEffect(() => {
        // Fetch all spaces on load
        fetch("/api/get-all-spaces")
            .then(res => res.json())
            .then((data: any) => {
                if (data.ok) {
                    setAllSpaces(data.spaces);
                    setFilteredSpaces(data.spaces); // Show all initially
                }
            })
            .catch(err => console.error(err));
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoadingAI(true);
        try {
            const res = await fetch("/api/classify-items", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query })
            });

            const reqs = await res.json() as any;

            // Expected: { small: X, medium: Y, large: Z }
            if (reqs) {
                setRequirements(reqs);

                // Filter logic
                const filtered = allSpaces.filter(s => {
                    const enoughSmall = (s.capacity_small || 0) >= (reqs.small || 0);
                    const enoughMedium = (s.capacity_medium || 0) >= (reqs.medium || 0);
                    const enoughLarge = (s.capacity_large || 0) >= (reqs.large || 0);
                    return enoughSmall && enoughMedium && enoughLarge;
                });

                setFilteredSpaces(filtered);
            }

        } catch (err) {
            console.error("AI Search error", err);
            alert("Error al procesar la búsqueda inteligente");
        } finally {
            setLoadingAI(false);
        }
    };

    return (
        <div style={styles.page}>
            {/* Search Bar Overlay */}
            <div style={styles.searchContainer}>
                <button onClick={() => navigate("/usuario")} style={styles.backBtn}>
                    ←
                </button>
                <form onSubmit={handleSearch} style={styles.searchForm}>
                    <input
                        style={styles.input}
                        placeholder="ej. Quiero guardar 2 bicis y un sofá..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                    <button type="submit" disabled={loadingAI} style={styles.searchBtn}>
                        {loadingAI ? "..." : "🔍"}
                    </button>
                </form>
                {requirements && (
                    <div style={styles.aiBadge}>
                        Detectado: {requirements.small} Peq, {requirements.medium} Med, {requirements.large} Gran
                    </div>
                )}
            </div>

            {/* Map */}
            <MapContainer center={[40.416775, -3.703790]} zoom={13} style={{ width: "100%", height: "100%" }}>
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
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
                                    <button style={styles.bookBtn} onClick={() => alert("Reserva no disponible en demo")}>
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
    searchContainer: {
        position: "absolute",
        top: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        width: "90%",
        maxWidth: 550,
        display: "flex",
        alignItems: "center",
        gap: 12
    },
    backBtn: {
        background: "white",
        border: "none",
        width: 48,
        height: 48,
        borderRadius: "50%",
        fontSize: 24,
        cursor: "pointer",
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        fontWeight: "bold"
    },
    searchForm: {
        display: "flex",
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        borderRadius: 50,
        background: "white",
        overflow: "hidden",
        padding: "4px"
    },
    input: {
        flex: 1,
        border: "none",
        padding: "12px 20px",
        fontSize: 16,
        outline: "none"
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
        background: "rgba(0,0,0,0.8)",
        color: "white",
        alignSelf: "center",
        padding: "6px 16px",
        borderRadius: 20,
        fontSize: 12,
        backdropFilter: "blur(5px)"
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
