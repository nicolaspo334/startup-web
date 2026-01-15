
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

        // Safe parsing attempt with Regex extraction
        let rawText = "";

        if (typeof result === 'string') rawText = result;
        else if (result.response) rawText = result.response;
        else if (typeof result === 'object') {
            // Sometimes it might already be the object we want, or a wrapped one
            // If it has small/medium/large keys, it's our object.
            if ('small' in result) return Response.json(result);
            rawText = JSON.stringify(result);
        }

        // Regex to find the FIRST valid JSON object structure "{...}"
        // This ignores "Here is your JSON:" prefixes or explanations.
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            throw new Error(`No JSON found in response: ${rawText.substring(0, 100)}...`);
        }

        const jsonStr = jsonMatch[0];
        const counts = JSON.parse(jsonStr);

        return Response.json(counts);

    } catch (e: any) {
        return Response.json({
            error: "AI Processing Error",
            details: e.message,
            // Return a safe fallback so the UI simply shows 0s instead of crashing/hanging
            fallback: { small: 0, medium: 0, large: 0 }
        }, { status: 200 }); // Return 200 with 0s so frontend displays *something*
    }
}
