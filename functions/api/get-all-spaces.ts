
export const onRequestGet: PagesFunction<{ SPACES_DB: D1Database }> = async (ctx) => {
    try {
        const spaces = await ctx.env.SPACES_DB
            .prepare("SELECT id, name, address, type, size_m2, capacity_small, capacity_medium, capacity_large, image_base64, lat, lng FROM spaces")
            .all();

        return Response.json({ ok: true, spaces: spaces.results });
    } catch (e: any) {
        return Response.json({ ok: false, error: e.message }, { status: 500 });
    }
};
