
interface Env {
    AI: any;
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
    try {
        const body = await ctx.request.json() as any;
        const { query } = body;

        if (!query) return Response.json({ ok: false, error: "Query missing" }, { status: 400 });

        // System prompt to guide the AI
        const prompt = `
          You are a strict logistics assistant for a storage app.
          Analyze the user's input string, which describes items to store. It may be a full sentence ("I want to store a piano") or just a list ("1 piano").
          
          RULES:
          1. Categorize EACH item into "small", "medium", or "large".
             - SMALL: Boxes, suitcases, bags, toys, lamps, kitchen items (cups, plates), books, small electronics.
             - MEDIUM: Chairs, bikes, tables, TVs, microwaves, shelving units.
             - LARGE: Sofas, beds, wardrobes, pianos, fridges, washing machines, cars, motorcycles.
          2. Count the total items for each category.
          3. If the input is vague (e.g. "some stuff"), estimate 5 small items.
          4. IGNORE conversational filler like "hello", "I want", "please". Focus on the objects.
          5. Return ONLY a valid JSON object. NO markdown formatting. NO explanations.
          
          EXAMPLES:
          Input: "I want to store 2 bikes and a sofa"
          Output: { "small": 0, "medium": 2, "large": 1 }

          Input: "1 vaso"
          Output: { "small": 1, "medium": 0, "large": 0 }

          Input: "una caja y 3 maletas"
          Output: { "small": 4, "medium": 0, "large": 0 }

          Input: "mesa"
          Output: { "small": 0, "medium": 1, "large": 0 }
        `;

        const messages = [
            { role: "system", content: prompt },
            { role: "user", content: query }
        ];

        // Call Workers AI
        const response = await ctx.env.AI.run('@cf/meta/llama-3-8b-instruct', {
            messages
        });

        // Parse valid JSON from response (sometimes models add chatty text, careful)
        // Ideally Llama 3 with that prompt is obedient.
        let result = response.result || response;
        // Sometimes result is an object already if using the binding directly? 
        // Usually it returns { response: "string" }

        // Let's assume we get a string and try to parse it. 
        // If it's already an object, great. 
        // Note: The specific return shape depends on valid binding execution.

        // Safe parsing attempt
        let jsonStr = "";
        if (typeof result === 'string') jsonStr = result;
        else if (result.response) jsonStr = result.response;
        else if (typeof result === 'object') return Response.json(result); // Already JSON?

        // Clean markdown code blocks if any
        jsonStr = jsonStr.replace(/```json/g, "").replace(/```/g, "").trim();

        const counts = JSON.parse(jsonStr);

        return Response.json(counts);

    } catch (e: any) {
        return Response.json({ error: "AI Error", details: e.message }, { status: 500 });
    }
}
