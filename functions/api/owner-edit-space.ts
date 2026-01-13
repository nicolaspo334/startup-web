
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
            type,
            size_m2,
            capacity_small,
            capacity_medium,
            capacity_large,
            image_base64
        } = body;

        if (!id || !owner_id || !name || !address || !type || !size_m2) {
            return Response.json({ ok: false, error: "Faltan datos obligatorios" }, { status: 400 });
        }

        let filename = image_base64; // Default to existing value if it's just a filename or url

        // Check if image is new base64 data to upload
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

        // Update DB
        const res = await ctx.env.SPACES_DB.prepare(
            `UPDATE spaces SET 
             name = ?, address = ?, type = ?, size_m2 = ?, 
             capacity_small = ?, capacity_medium = ?, capacity_large = ?, 
             image_base64 = ?
           WHERE id = ? AND owner_id = ?`
        ).bind(
            name,
            address,
            type,
            size_m2,
            capacity_small,
            capacity_medium,
            capacity_large,
            filename,
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
