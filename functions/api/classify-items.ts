
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
          You are a strict JSON data extractor.
          Your ONLY job is to extract item counts from the user's text and return them as a valid JSON object.
          
          CATEGORIES:
          - "small": Boxes, suitcases, bags, toys, lamps, kitchen items, books.
          - "medium": Chairs, bikes, tables, TVs, microwaves, shelving units.
          - "large": Sofas, beds, wardrobes, pianos, fridges, washing machines, cars, motorcycles.

          RULES:
          1. Output MUST be valid JSON.
          2. Keys must be exactly: "small", "medium", "large".
          3. Values must be Integers.
          4. DO NOT write any text outside the JSON object.
          5. DO NOT use markdown code blocks.
          
          EXAMPLES:
          User: "I want to store 2 bikes and a sofa"
          Response: { "small": 0, "medium": 2, "large": 1 }

          User: "1 vaso"
          Response: { "small": 1, "medium": 0, "large": 0 }
        `;

        const messages = [
            { role: "system", content: prompt },
            { role: "user", content: query }
        ];

        // Call Workers AI (Using Google Gemma)
        const response = await ctx.env.AI.run('@cf/google/gemma-7b-it', {
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
