
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
          You are a helpful assistant for a storage rental app. 
          The user will describe what they want to store (e.g. "2 bikes and a sofa").
          Your job is to categorize these items into three sizes: small (boxes, suitcases), medium (bikes, chairs), large (sofas, wardrobes, pianos).
          Return ONLY a valid JSON object with the count of each size. Do not write any other text.
          Example output: { "small": 0, "medium": 2, "large": 1 }
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
