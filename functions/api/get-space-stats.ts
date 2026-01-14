
interface Env {
    SPACES_DB: D1Database;
    USER_DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
    const url = new URL(ctx.request.url);
    const space_id = url.searchParams.get("space_id");

    if (!space_id) {
        return Response.json({ ok: false, error: "Missing space_id" }, { status: 400 });
    }

    try {
        // 1. Get Space Details (to verify it exists and return name/address)
        const space = await ctx.env.SPACES_DB.prepare("SELECT name, address, size_m2 FROM spaces WHERE id = ?").bind(space_id).first();
        if (!space) {
            return Response.json({ ok: false, error: "Space not found" }, { status: 404 });
        }

        // 2. Get Reservations
        const resResult = await ctx.env.SPACES_DB.prepare(`
            SELECT id, user_id, start_date, end_date, qty_small, qty_medium, qty_large
            FROM reservations
            WHERE space_id = ?
            ORDER BY start_date DESC
        `).bind(space_id).all();

        const reservations = resResult.results as any[];

        // 3. Get Usernames (Cross-Database)
        const userIds = [...new Set(reservations.map(r => r.user_id))];
        const userMap = new Map<string, string>();

        if (userIds.length > 0) {
            // D1 doesn't support "WHERE id IN (?)" with array easily in prepared statement without constructing string
            // For safety and simplicity with small numbers, we can loop or construct the query carefully.
            // Or simple approach: fetch all users who might match? No, that's bad.
            // Construct placeholders
            const placeholders = userIds.map(() => "?").join(",");
            const userQuery = `SELECT id, username FROM users WHERE id IN (${placeholders})`;

            const usersResult = await ctx.env.USER_DB.prepare(userQuery).bind(...userIds).all();
            (usersResult.results as any[]).forEach(u => {
                userMap.set(u.id, u.username);
            });
        }

        // 4. Combine
        const enrichedReservations = reservations.map(r => ({
            ...r,
            username: userMap.get(r.user_id) || "Usuario Desconocido"
        }));

        // 5. Calculate Stats for "This Month"
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const thisMonthReservations = enrichedReservations.filter(r => {
            const d = new Date(r.start_date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const stats = {
            count_month: thisMonthReservations.length,
            income_month: 0 // Placeholder as requested
        };

        return Response.json({
            ok: true,
            space,
            reservations: enrichedReservations,
            stats
        });

    } catch (e: any) {
        return Response.json({ ok: false, error: e.message }, { status: 500 });
    }
};
