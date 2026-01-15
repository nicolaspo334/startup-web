
interface Env {
    SPACES_DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    try {
        const { request, env } = context;
        const url = new URL(request.url);
        const space_id = url.searchParams.get("space_id");

        if (!space_id) {
            return new Response(JSON.stringify({ error: "Missing space_id" }), { status: 400 });
        }

        // Get all future reservations (where end_date >= today) or potentially all
        // to calculate overlapping properly. We'll fetch all future-ish ones.
        const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        const reservations = await env.SPACES_DB.prepare(`
      SELECT * FROM reservations 
      WHERE space_id = ? AND end_date >= ? AND status != 'rejected'
    `).bind(space_id, now).all();

        return new Response(JSON.stringify({
            ok: true,
            reservations: reservations.results
        }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};
