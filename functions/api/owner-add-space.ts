
interface Env {
    SPACES_DB: D1Database;
    BUCKET: R2Bucket;
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
    try {
        const body = await ctx.request.json() as any;
        const {
            owner_id,
            name,
            address,
            province,
            country,
            type,
            size_m2,
            capacity_small,
            capacity_medium,
            capacity_large,
            price_small,
            price_medium,
            price_large,
            iban,
            beneficiary_name,
            image_base64
        } = body;

        if (!owner_id || !name || !address || !type || !size_m2) {
            return Response.json({ ok: false, error: "Faltan datos obligatorios" }, { status: 400 });
        }

        const id = crypto.randomUUID();
        const allowed_items = "";
        let filename = "";

        // Process R2 Upload
        if (image_base64 && image_base64.includes("base64,")) {
            const matches = image_base64.match(/^data:(.+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                const contentType = matches[1];
                const base64Data = matches[2];

                const binaryString = atob(base64Data);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }

                const ext = contentType.split('/')[1] || "png";
                filename = `space-${owner_id}-${Date.now()}.${ext}`;

                await ctx.env.BUCKET.put(filename, bytes, {
                    httpMetadata: { contentType: contentType }
                });
            }
        }

        // --- GEOCODING LOGIC ---
        let lat = 0;
        let lng = 0;

        // Construct detailed query for better precision
        // If province/country provided, append them.
        let queryParts = [address];
        if (province) queryParts.push(province);
        if (country) queryParts.push(country);
        const qStr = queryParts.join(", ");

        try {
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(qStr)}&format=json&limit=1`, {
                headers: {
                    'User-Agent': 'GuardyApp/1.0'
                }
            });
            const geoData = await geoRes.json() as any[];
            if (geoData && geoData.length > 0) {
                lat = parseFloat(geoData[0].lat);
                lng = parseFloat(geoData[0].lon);
            }
        } catch (err) {
            console.error("Geocoding failed", err);
        }
        // -----------------------

        // Store
        await ctx.env.SPACES_DB.prepare(
            `INSERT INTO spaces (
             id, owner_id, name, address, province, country, type, size_m2, 
             capacity_small, capacity_medium, capacity_large, 
             price_small, price_medium, price_large,
             image_base64, lat, lng, min_days,
             iban, beneficiary_name
           ) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
            id,
            owner_id,
            name,
            address,
            province || null,
            country || null,
            type,
            size_m2,
            capacity_small,
            capacity_medium,
            capacity_large,
            price_small || 0,
            price_medium || 0,
            price_large || 0,
            allowed_items,
            filename,
            lat,
            lng,
            body.min_days || 1,
            body.iban || null,
            body.beneficiary_name || null
        ).run();

        return Response.json({ ok: true, id });

    } catch (e: any) {
        return Response.json(
            { ok: false, error: "Error al guardar espacio", details: String(e?.message ?? e) },
            { status: 500 }
        );
    }
};
