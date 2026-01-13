
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function OwnerEditSpace() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form Fields
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [province, setProvince] = useState("");
    const [country, setCountry] = useState("");
    const [type, setType] = useState("Trastero");
    const [size, setSize] = useState("");
    const [capSmall, setCapSmall] = useState("");
    const [capMedium, setCapMedium] = useState("");
    const [capLarge, setCapLarge] = useState("");

    // Image
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string>("");

    useEffect(() => {
        const ownerId = localStorage.getItem("owner_id");
        if (!ownerId) {
            navigate("/dueno/login");
            return;
        }

        // Fetch existing data
        fetch(`/api/get-space?id=${id}&owner_id=${ownerId}`)
            .then(res => res.json())
            .then((data: any) => {
                if (data.ok && data.space) {
                    const s = data.space;
                    setName(s.name);
                    setAddress(s.address);
                    setProvince(s.province || "");
                    setCountry(s.country || "");
                    setType(s.type);
                    setSize(String(s.size_m2));
                    setCapSmall(String(s.capacity_small));
                    setCapMedium(String(s.capacity_medium));
                    setCapLarge(String(s.capacity_large));

                    // Handle image preview
                    if (s.image_base64) {
                        setImageBase64(s.image_base64); // Keep original value unless changed
                        if (s.image_base64.startsWith("data:")) {
                            setImagePreview(s.image_base64);
                        } else {
                            setImagePreview(`/api/images/${s.image_base64}`);
                        }
                    }
                } else {
                    alert("Espacio no encontrado");
                    navigate("/dueno/dashboard");
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));

    }, [id, navigate]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setImagePreview(url);

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setImageBase64(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDelete = async () => {
        if (!confirm("¿Seguro que quieres eliminar este espacio? Esta acción no se puede deshacer.")) return;

        const ownerId = localStorage.getItem("owner_id");
        setSaving(true);

        try {
            const res = await fetch(`/api/owner-delete-space?id=${id}&owner_id=${ownerId}`, {
                method: "DELETE"
            });
            if (res.ok) {
                navigate("/dueno/dashboard");
            } else {
                alert("Error al eliminar");
            }
        } catch (e) {
            alert("Error de conexión");
        } finally {
            setSaving(false);
        }
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const ownerId = localStorage.getItem("owner_id");

        try {
            const res = await fetch("/api/owner-edit-space", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id,
                    owner_id: ownerId,
                    name,
                    address,
                    province,
                    country,
                    type,
                    size_m2: parseFloat(size) || 0,
                    capacity_small: parseInt(capSmall) || 0,
                    capacity_medium: parseInt(capMedium) || 0,
                    capacity_large: parseInt(capLarge) || 0,
                    image_base64: imageBase64
                }),
            });

            const data = await res.json() as any;

            if (res.ok) {
                alert("¡Cambios guardados!");
                navigate("/dueno/dashboard");
            } else {
                alert("Error: " + (data.error || "No se pudo actualizar"));
            }
        } catch (err) {
            console.error(err);
            alert("Error de conexión");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return null;

    return (
        <div style={styles.page}>
            <img src="/owner-dashboard-bg.jpg" alt="Background" style={styles.bg} />
            <div style={styles.overlay} />

            <div style={styles.content}>
                <div style={styles.card}>
                    <h2 style={styles.title}>Editar espacio</h2>

                    <form onSubmit={onSubmit} style={styles.formGrid}>

                        {/* Left Column: Image Area */}
                        <div style={styles.leftCol}>
                            <label style={styles.imageDropZone}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    style={{ display: 'none' }}
                                />
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" style={styles.previewImg} />
                                ) : (
                                    <div style={styles.placeholderContent}>
                                        <span style={{ fontSize: 40 }}>📷</span>
                                        <span>Cambiar imágen</span>
                                    </div>
                                )}
                            </label>
                        </div>

                        {/* Right Column: Fields */}
                        <div style={styles.rightCol}>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Nombre del espacio</label>
                                <input
                                    style={styles.input}
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Ej. Trastero Centro"
                                    required
                                />
                            </div>

                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Dirección</label>
                                <input
                                    style={styles.input}
                                    value={address}
                                    onChange={e => setAddress(e.target.value)}
                                    placeholder="Calle Principal 123"
                                    required
                                />
                            </div>

                            <div style={styles.row}>
                                <div style={styles.fieldGroup}>
                                    <label style={styles.label}>Provincia</label>
                                    <input
                                        style={styles.input}
                                        value={province}
                                        onChange={e => setProvince(e.target.value)}
                                        placeholder="Madrid"
                                        required
                                    />
                                </div>
                                <div style={styles.fieldGroup}>
                                    <label style={styles.label}>País</label>
                                    <input
                                        style={styles.input}
                                        value={country}
                                        onChange={e => setCountry(e.target.value)}
                                        placeholder="España"
                                        required
                                    />
                                </div>
                            </div>

                            <div style={styles.row}>
                                <div style={styles.fieldGroup}>
                                    <label style={styles.label}>Tipo</label>
                                    <select
                                        style={styles.input}
                                        value={type}
                                        onChange={e => setType(e.target.value)}
                                    >
                                        <option value="Trastero">Trastero</option>
                                        <option value="Habitación">Habitación</option>
                                        <option value="Garaje">Garaje</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>

                                <div style={styles.fieldGroup}>
                                    <label style={styles.label}>Tamaño (m²)</label>
                                    <input
                                        style={styles.input}
                                        type="number"
                                        value={size}
                                        onChange={e => setSize(e.target.value)}
                                        placeholder="Ej. 15"
                                        required
                                    />
                                </div>
                            </div>

                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Capacidad (Nº objetos)</label>
                                <div style={styles.capacityRow}>
                                    <input
                                        style={styles.inputSmall}
                                        type="number"
                                        placeholder="Pequeño"
                                        value={capSmall}
                                        onChange={e => setCapSmall(e.target.value)}
                                    />
                                    <input
                                        style={styles.inputSmall}
                                        type="number"
                                        placeholder="Mediano"
                                        value={capMedium}
                                        onChange={e => setCapMedium(e.target.value)}
                                    />
                                    <input
                                        style={styles.inputSmall}
                                        type="number"
                                        placeholder="Grande"
                                        value={capLarge}
                                        onChange={e => setCapLarge(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div style={styles.actions}>
                                <button type="button" onClick={handleDelete} style={styles.deleteBtn}>
                                    Eliminar espacio
                                </button>
                                <button type="submit" disabled={saving} style={styles.submitBtn}>
                                    {saving ? "Guardando..." : "Continuar"}
                                </button>
                            </div>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    page: { position: "relative", minHeight: "100vh", width: "100%", overflow: "hidden" },
    bg: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" },
    overlay: {
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(5px)"
    },
    content: {
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: 20
    },
    card: {
        width: "min(900px, 100%)",
        background: "rgba(255,255,255,0.95)",
        borderRadius: 20,
        padding: "30px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
    },
    title: {
        fontFamily: '"Playfair Display", serif',
        fontSize: 28,
        margin: "0 0 24px 0",
        textAlign: "center"
    },
    formGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1.2fr",
        gap: 30,
    },
    leftCol: {
        display: "flex",
        flexDirection: "column",
    },
    rightCol: {
        display: "flex",
        flexDirection: "column",
        gap: 16
    },
    imageDropZone: {
        width: "100%",
        aspectRatio: "4/3",
        border: "3px dashed #ccc",
        borderRadius: 12,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
        background: "#f9f9f9",
        overflow: "hidden"
    },
    placeholderContent: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        color: "#888",
        fontWeight: 500
    },
    previewImg: {
        width: "100%",
        height: "100%",
        objectFit: "cover"
    },
    fieldGroup: {
        display: "flex",
        flexDirection: "column",
        gap: 6
    },
    label: {
        fontWeight: 600,
        fontSize: 14,
        color: "#444"
    },
    input: {
        padding: "10px 12px",
        fontSize: 16,
        borderRadius: 8,
        border: "1px solid #ccc",
        outline: "none"
    },
    row: {
        display: "flex",
        gap: 12
    },
    capacityRow: {
        display: "flex",
        gap: 10
    },
    inputSmall: {
        flex: 1,
        padding: "10px",
        fontSize: 14,
        borderRadius: 8,
        border: "1px solid #ccc",
        outline: "none"
    },
    actions: {
        display: "flex",
        gap: 12,
        marginTop: 20,
        justifyContent: "space-between"
    },
    deleteBtn: {
        padding: "10px 20px",
        borderRadius: 10,
        border: "1px solid #d32f2f",
        background: "#ffebee",
        color: "#d32f2f",
        cursor: "pointer",
        fontWeight: 600
    },
    submitBtn: {
        padding: "10px 24px",
        borderRadius: 10,
        border: "none",
        background: "black",
        color: "white",
        cursor: "pointer",
        fontWeight: 600
    }
};
