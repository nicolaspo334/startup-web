
export const onRequestGet: PagesFunction<{ SPACES_DB: D1Database }> = async (ctx) => {
    const url = new URL(ctx.request.url);
    const ownerId = url.searchParams.get("owner_id");

    if (!ownerId) {
        return Response.json({ ok: false, error: "Missing owner_id" }, { status: 400 });
    }

    try {
        const { results } = await ctx.env.SPACES_DB
            .prepare(`
                SELECT s.*, 
                (SELECT COUNT(*) FROM reservations r WHERE r.space_id = s.id AND r.status = 'pending') as pending_count 
                FROM spaces s 
                WHERE s.owner_id = ? 
                ORDER BY s.created_at DESC
            `)
            .bind(ownerId)
            .all();

        return Response.json({ ok: true, spaces: results });
    } catch (e: any) {
        return Response.json(
            { ok: false, error: "Error fetching spaces", details: String(e?.message ?? e) },
            { status: 500 }
        );
    }
};
