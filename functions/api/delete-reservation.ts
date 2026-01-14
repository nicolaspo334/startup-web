
export const onRequestDelete: PagesFunction<{ SPACES_DB: D1Database }> = async (ctx) => {
    const url = new URL(ctx.request.url);
    const id = url.searchParams.get("id");
    const user_id = url.searchParams.get("user_id");

    if (!id || !user_id) {
        return Response.json({ ok: false, error: "Missing id or user_id" }, { status: 400 });
    }

    try {
        const res = await ctx.env.SPACES_DB.prepare(
            "DELETE FROM reservations WHERE id = ? AND user_id = ?"
        ).bind(id, user_id).run();

        if (res.meta.changes === 0) {
            return Response.json({ ok: false, error: "Reservation not found or unauthorized" }, { status: 404 });
        }

        return Response.json({ ok: true });
    } catch (e: any) {
        return Response.json({ ok: false, error: e.message }, { status: 500 });
    }
};
