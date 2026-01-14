
interface Env {
    SPACES_DB: D1Database;
    USER_DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
    const url = new URL(ctx.request.url);
    const space_id = url.searchParams.get("space_id");
    const owner_id = url.searchParams.get("owner_id");

    if (!space_id || !owner_id) {
        return Response.json({ ok: false, error: "Missing parameters" }, { status: 400 });
    }

    try {
        // 1. Verify Ownership & Get Space Details
        const space = await ctx.env.SPACES_DB.prepare("SELECT * FROM spaces WHERE id = ? AND owner_id = ?")
            .bind(space_id, owner_id)
            .first();

        if (!space) {
            return Response.json({ ok: false, error: "Space not found or unauthorized" }, { status: 404 });
        }

        // 2. Get All Reservations for Space
        const reservationsResult = await ctx.env.SPACES_DB.prepare("SELECT * FROM reservations WHERE space_id = ?")
            .bind(space_id)
            .all();

        const reservations = reservationsResult.results as any[];

        // 3. Extract Unique User IDs to fetch names
        const userIds = [...new Set(reservations.map(r => r.user_id))];

        // 4. Fetch Usernames from USER_DB (Manual Join)
        // D1 doesn't support "WHERE id IN (...)" easily with dynamic array binding in strict mode, so we loop or query individually?
        // Optimization: Use ORs or fetch one by one if list is small. 
        // Better: `WHERE id IN (?, ?, ...)` constructing the string dynamically.

        let userMap: Record<string, string> = {};

        if (userIds.length > 0) {
            const placeholders = userIds.map(() => '?').join(',');
            const usersResult = await ctx.env.USER_DB.prepare(`SELECT id, username FROM users WHERE id IN (${placeholders})`)
                .bind(...userIds)
                .all();

            usersResult.results.forEach((u: any) => {
                userMap[u.id] = u.username;
            });
        }

        // 5. Enrich Reservations with Usernames
        const enrichedReservations = reservations.map(r => ({
            ...r,
            username: userMap[r.user_id] || "Usuario Desconocido"
        }));

        return Response.json({ ok: true, space, reservations: enrichedReservations });

    } catch (e: any) {
        return Response.json({ ok: false, error: e.message }, { status: 500 });
    }
};
