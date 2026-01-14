
export const onRequestGet: PagesFunction<{ SPACES_DB: D1Database }> = async (ctx) => {
    const url = new URL(ctx.request.url);
    const id = url.searchParams.get("id");
    const owner_id = url.searchParams.get("owner_id");
    // If owner_id is provided, check ownership (for Owner Edit page)
    // If not, just return the space (for User Book page) - assuming public spaces
    let query = "SELECT * FROM spaces WHERE id = ?";
    let params: any[] = [id];

    if (owner_id) {
        query += " AND owner_id = ?";
        params.push(owner_id);
    }

    try {
        const space = await ctx.env.SPACES_DB
            .prepare(query)
            .bind(...params)
            .first();

        if (!space) {
            return Response.json({ ok: false, error: "Space not found" }, { status: 404 });
        }

        return Response.json({ ok: true, space });
    } catch (e: any) {
        return Response.json({ ok: false, error: e.message }, { status: 500 });
    }
};
