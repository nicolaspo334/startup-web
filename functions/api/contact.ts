
interface Env {
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    try {
        const { name, surname, email, message } = await context.request.json() as any;

        if (!name || !email || !message) {
            return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
        }

        // SIMULATION: In a real app, you would use MailChannels, SendGrid, or Resend here.
        // For now, we log to the Cloudflare Functions logs.
        console.log("--------------- NEW CONTACT MESSAGE ---------------");
        console.log(`From: ${name} ${surname} <${email}>`);
        console.log(`Message: ${message}`);
        console.log("---------------------------------------------------");

        return new Response(JSON.stringify({ ok: true, message: "Email sent successfully (simulated)" }), {
            headers: { "Content-Type": "application/json" },
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
    }
};
