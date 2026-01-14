
export const onRequestGet: PagesFunction<{ SPACES_DB: D1Database }> = async (ctx) => {
    const url = new URL(ctx.request.url);
    const user_id = url.searchParams.get("user_id");

    if (!user_id) {
        return Response.json({ ok: false, error: "Missing user_id" }, { status: 400 });
    }

    try {
        const results = await ctx.env.SPACES_DB.prepare(`
            SELECT 
                r.id, r.start_date, r.end_date, 
                r.qty_small, r.qty_medium, r.qty_large,
                s.name as space_name, s.address as space_address, s.id as space_id, s.image_base64
            FROM reservations r
            JOIN spaces s ON r.space_id = s.id
            WHERE r.user_id = ?
            ORDER BY r.start_date ASC
        `).bind(user_id).all();

        return Response.json({ ok: true, reservations: results.results });
    } catch (e: any) {
        return Response.json({ ok: false, error: e.message }, { status: 500 });
    }
};
