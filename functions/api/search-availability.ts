
interface Env {
    SPACES_DB: D1Database;
    AI: any; // We might not need this here if we pass classification result
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
    try {
        const body = await ctx.request.json() as any;
        const { start_date, end_date, req_small, req_medium, req_large } = body;

        // Basic Validation
        if (!start_date || !end_date) {
            return Response.json({ ok: false, error: "Missing dates" }, { status: 400 });
        }

        // 1. Get All Spaces
        // Ideally we would do this in SQL, but for complex overlap logic with simple D1, JS filtering is often easier for MVP
        // Optimization: Fetch all active spaces
        const spacesResult = await ctx.env.SPACES_DB.prepare("SELECT * FROM spaces").all();
        const spaces = spacesResult.results as any[];

        // 2. Get Reservations that overlap with the requested window
        // Overlap Condition: (StartA <= EndB) and (EndA >= StartB)
        const overlapResult = await ctx.env.SPACES_DB.prepare(`
            SELECT * FROM reservations 
            WHERE start_date <= ? AND end_date >= ?
        `).bind(end_date, start_date).all();

        const reservations = overlapResult.results as any[];

        // 3. Helper: Get dates in range (inclusive)
        const getDates = (s: string, e: string) => {
            const arr = [];
            const dt = new Date(s);
            const end = new Date(e);
            while (dt <= end) {
                arr.push(dt.toISOString().split('T')[0]);
                dt.setDate(dt.getDate() + 1);
            }
            return arr;
        };
        const searchDates = getDates(start_date, end_date);

        // 4. Filter Spaces
        const availableSpaces = spaces.filter(space => {
            // Find reservations for this specific space
            const spaceRes = reservations.filter(r => r.space_id === space.id);

            // Calculate max usage on any single day within the search range
            let maxUsedSmall = 0;
            let maxUsedMedium = 0;
            let maxUsedLarge = 0;

            for (const day of searchDates) {
                let daySmall = 0;
                let dayMedium = 0;
                let dayLarge = 0;

                // Check active reservations on this day
                for (const r of spaceRes) {
                    if (day >= r.start_date && day <= r.end_date) {
                        daySmall += (r.qty_small || 0);
                        dayMedium += (r.qty_medium || 0);
                        dayLarge += (r.qty_large || 0);
                    }
                }

                if (daySmall > maxUsedSmall) maxUsedSmall = daySmall;
                if (dayMedium > maxUsedMedium) maxUsedMedium = dayMedium;
                if (dayLarge > maxUsedLarge) maxUsedLarge = dayLarge;
            }

            // Check if remaining capacity satisfies requirements
            const availableSmall = (space.capacity_small || 0) - maxUsedSmall;
            const availableMedium = (space.capacity_medium || 0) - maxUsedMedium;
            const availableLarge = (space.capacity_large || 0) - maxUsedLarge;

            return (
                availableSmall >= (req_small || 0) &&
                availableMedium >= (req_medium || 0) &&
                availableLarge >= (req_large || 0)
            );
        });

        return Response.json({ ok: true, spaces: availableSpaces });

    } catch (e: any) {
        return Response.json({ ok: false, error: e.message }, { status: 500 });
    }
};
