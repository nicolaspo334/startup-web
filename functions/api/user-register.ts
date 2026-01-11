export const onRequestPost: PagesFunction<{ USER_DB: D1Database }> = async (ctx) => {
  const body = (await ctx.request.json().catch(() => null)) as any;
  if (!body?.username || !body?.password) {
    return Response.json({ ok: false, error: "Faltan datos" }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const password_hash = await sha256(body.password);

  try {
    await ctx.env.USER_DB
      .prepare("INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)")
      .bind(id, body.username, password_hash)
      .run();

    return Response.json({ ok: true, id });
  } catch (e: any) {
    return Response.json(
      { ok: false, error: "Usuario ya existe o error", details: String(e?.message ?? e) },
      { status: 400 }
    );
  }
};

async function sha256(text: string) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}