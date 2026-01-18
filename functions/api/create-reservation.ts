
interface Env {
    SPACES_DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    try {
        const { request, env } = context;
        const body = await request.json() as any;
        const { user_id, space_id, start_date, end_date, qty_small, qty_medium, qty_large, item_photos, status, payment_method } = body;

        // Basic validation
        if (!user_id || !space_id || !start_date || !end_date) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
        }

        // Insert reservation
        // Note: In a production app, we should perform a transaction to check availability 
        // strictly before inserting. For this MVP, we assume the frontend sends valid data
        // or we can add a SELECT sum() check here if needed.

        // Default Payment Status: 'pending_approval' (Authorized but not captured)
        // Default Payment ID: Mock
        const paymentDetails = {
            method: payment_method || 'card',
            status: 'pending_approval',
            id: 'mw_' + Math.random().toString(36).substring(7)
        };

        // Simple insertion for now as per plan
        const info = await env.SPACES_DB.prepare(`
      INSERT INTO reservations (
        user_id, space_id, start_date, end_date, 
        qty_small, qty_medium, qty_large, 
        created_at, item_photos, status,
        payment_method, payment_status, payment_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
            user_id,
            space_id,
            start_date,
            end_date,
            qty_small || 0,
            qty_medium || 0,
            qty_large || 0,
            Date.now(),
            JSON.stringify(item_photos || []),
            status || 'pending',
            paymentDetails.method,
            paymentDetails.status,
            paymentDetails.id
        ).run();

        if (info.success) {
            return new Response(JSON.stringify({ ok: true, id: info.meta.last_row_id }), { headers: { "Content-Type": "application/json" } });
        } else {
            return new Response(JSON.stringify({ error: "Failed to insert reservation" }), { status: 500 });
        }

    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};
