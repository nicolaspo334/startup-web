
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
            type,
            size_m2,
            capacity_small,
            capacity_medium,
            capacity_large,
            image_base64
        } = body;

        if (!owner_id || !name || !address || !type || !size_m2) {
            return Response.json({ ok: false, error: "Faltan datos obligatorios" }, { status: 400 });
        }

        const id = crypto.randomUUID();
        const allowed_items = "";
        let filename = "";

        // Process R2 Upload if image provided
        if (image_base64 && image_base64.includes("base64,")) {
            const matches = image_base64.match(/^data:(.+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                const contentType = matches[1]; // e.g., image/jpeg
                const base64Data = matches[2];

                // Convert Base64 to ArrayBuffer
                // using standard Atob for workers/browsers
                const binaryString = atob(base64Data);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }

                // Create unique filename
                const ext = contentType.split('/')[1] || "png";
                filename = `space-${owner_id}-${Date.now()}.${ext}`;

                // Upload to R2
                await ctx.env.BUCKET.put(filename, bytes, {
                    httpMetadata: { contentType: contentType }
                });
            }
        }

        // Store the FILENAME in the 'image_base64' column (reusing the column name as requested by user constraints)
        // Ideally we would rename the column to 'image_path' but we are sticking to user schema.
        await ctx.env.SPACES_DB.prepare(
            `INSERT INTO spaces (
             id, owner_id, name, address, type, size_m2, 
             capacity_small, capacity_medium, capacity_large, 
             allowed_items, image_base64
           ) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
            id,
            owner_id,
            name,
            address,
            type,
            size_m2,
            capacity_small,
            capacity_medium,
            capacity_large,
            allowed_items,
            filename // Note: Storing filename here!
        ).run();

        return Response.json({ ok: true, id });

    } catch (e: any) {
        return Response.json(
            { ok: false, error: "Error al guardar espacio", details: String(e?.message ?? e) },
            { status: 500 }
        );
    }
};
