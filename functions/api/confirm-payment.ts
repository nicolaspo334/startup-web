
export const onRequestPost: PagesFunction<{ SPACES_DB: D1Database }> = async (ctx) => {
    const url = new URL(ctx.request.url);
    const id = url.searchParams.get("id");

    if (!id) {
        return Response.json({ ok: false, error: "Missing ID" }, { status: 400 });
    }

    try {
        await ctx.env.SPACES_DB.prepare(
            `UPDATE reservations SET status = 'confirmed', payment_status = 'paid' WHERE id = ?`
        ).bind(id).run();

        return Response.json({ ok: true });
    } catch (e: any) {
        return Response.json({ ok: false, error: e.message }, { status: 500 });
    }
};
