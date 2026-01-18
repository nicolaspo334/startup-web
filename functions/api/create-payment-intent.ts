import Stripe from 'stripe';

interface Env {
    STRIPE_SECRET_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    try {
        const { request, env } = context;
        const body = await request.json() as any;
        const { amount, currency = 'eur' } = body;

        if (!amount) {
            return new Response(JSON.stringify({ error: "Missing amount" }), { status: 400 });
        }

        if (!env.STRIPE_SECRET_KEY) {
            return new Response(JSON.stringify({ error: "Stripe key not configured" }), { status: 500 });
        }

        const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
            // apiVersion: '2025-01-27.acacia', // Removed to use default installed SDK version
        });

        // Create a PaymentIntent with 'manual' capture to hold funds
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: currency,
            capture_method: 'manual', // <--- This performs the "Hold"
            automatic_payment_methods: {
                enabled: true,
            },
        });

        return new Response(JSON.stringify({
            clientSecret: paymentIntent.client_secret,
            id: paymentIntent.id
        }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};
