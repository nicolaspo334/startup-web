
interface Env {
    SPACES_DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    try {
        const { request, env } = context;
        const body = await request.json() as any;
        const { reservation_id, status, owner_id } = body;

        if (!reservation_id || !status || !owner_id) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
        }

        if (!['approved', 'rejected'].includes(status)) {
            return new Response(JSON.stringify({ error: "Invalid status" }), { status: 400 });
        }

        // Verify ownership of the reservation's space
        // We join or subquery to ensure the space belongs to the owner
        const ownershipCheck = await env.SPACES_DB.prepare(`
            SELECT r.id 
            FROM reservations r
            JOIN spaces s ON r.space_id = s.id
            WHERE r.id = ? AND s.owner_id = ?
        `).bind(reservation_id, owner_id).first();

        if (!ownershipCheck) {
            return new Response(JSON.stringify({ error: "Unauthorized or reservation not found" }), { status: 403 });
        }

        // Update Status
        const info = await env.SPACES_DB.prepare(`
            UPDATE reservations SET status = ? WHERE id = ?
        `).bind(status, reservation_id).run();

        if (info.success) {
            return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
        } else {
            return new Response(JSON.stringify({ error: "Update failed" }), { status: 500 });
        }

    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};
