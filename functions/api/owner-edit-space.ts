
interface Env {
    SPACES_DB: D1Database;
    BUCKET: R2Bucket;
}

export const onRequestPut: PagesFunction<Env> = async (ctx) => {
    try {
        const body = await ctx.request.json() as any;
        const {
            id,
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

        if (!id || !owner_id || !name || !address || !type || !size_m2) {
            return Response.json({ ok: false, error: "Faltan datos obligatorios" }, { status: 400 });
        }

        let filename = image_base64;
        if (image_base64 && image_base64.startsWith("data:")) {
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

        let queryParts = [address];
        if (province) queryParts.push(province);
        if (country) queryParts.push(country);
        const qStr = queryParts.join(", ");

        try {
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(qStr)}&format=json&limit=1`, {
                headers: { 'User-Agent': 'GuardyApp/1.0' }
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

        const res = await ctx.env.SPACES_DB.prepare(
            `UPDATE spaces SET 
             name = ?, address = ?, province = ?, country = ?, type = ?, size_m2 = ?, 
             capacity_small = ?, capacity_medium = ?, capacity_large = ?, 
             price_small = ?, price_medium = ?, price_large = ?,
             image_base64 = ?, lat = ?, lng = ?, min_days = ?,
             iban = ?, beneficiary_name = ?
           WHERE id = ? AND owner_id = ?`
        ).bind(
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
            filename,
            lat,
            lng,
            body.min_days || 1,
            body.iban || null,
            body.beneficiary_name || null,
            id,
            owner_id
        ).run();

        if (res.meta.changes === 0) {
            return Response.json({ ok: false, error: "No changes made or space not found" }, { status: 404 });
        }

        return Response.json({ ok: true });

    } catch (e: any) {
        return Response.json(
            { ok: false, error: "Error al actualizar espacio", details: String(e?.message ?? e) },
            { status: 500 }
        );
    }
};
