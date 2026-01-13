
export const onRequestGet: PagesFunction<{ SPACES_DB: D1Database }> = async (ctx) => {
    const url = new URL(ctx.request.url);
    const id = url.searchParams.get("id");
    const owner_id = url.searchParams.get("owner_id");

    if (!id || !owner_id) {
        return Response.json({ ok: false, error: "Missing id or owner_id" }, { status: 400 });
    }

    try {
        const space = await ctx.env.SPACES_DB
            .prepare("SELECT * FROM spaces WHERE id = ? AND owner_id = ?")
            .bind(id, owner_id)
            .first();

        if (!space) {
            return Response.json({ ok: false, error: "Space not found" }, { status: 404 });
        }

        return Response.json({ ok: true, space });
    } catch (e: any) {
        return Response.json({ ok: false, error: e.message }, { status: 500 });
    }
};
