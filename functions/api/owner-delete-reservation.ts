
export const onRequestDelete: PagesFunction<{ SPACES_DB: D1Database }> = async (ctx) => {
    const url = new URL(ctx.request.url);
    const reservation_id = url.searchParams.get("id");
    const owner_id = url.searchParams.get("owner_id");

    if (!reservation_id || !owner_id) {
        return Response.json({ ok: false, error: "Missing parameters" }, { status: 400 });
    }

    try {
        // 1. Verify Space Ownership
        // We need to join the reservation with the space to check if the space belongs to this owner
        // SQLite: DELETE FROM reservations WHERE id = ? AND space_id IN (SELECT id FROM spaces WHERE owner_id = ?)

        const res = await ctx.env.SPACES_DB.prepare(`
            DELETE FROM reservations 
            WHERE id = ? 
            AND space_id IN (
                SELECT id FROM spaces WHERE owner_id = ?
            )
        `).bind(reservation_id, owner_id).run();

        if (res.meta.changes === 0) {
            return Response.json({ ok: false, error: "Reservation not found or unauthorized" }, { status: 404 });
        }

        return Response.json({ ok: true });
    } catch (e: any) {
        return Response.json({ ok: false, error: e.message }, { status: 500 });
    }
};
