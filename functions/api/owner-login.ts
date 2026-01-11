export const onRequestPost: PagesFunction<{ OWNER_DB: D1Database }> = async (ctx) => {
  const body = (await ctx.request.json().catch(() => null)) as any;
  if (!body?.username || !body?.password) {
    return Response.json({ ok: false, error: "Faltan datos" }, { status: 400 });
  }

  const password_hash = await sha256(body.password);

  const row = await ctx.env.OWNER_DB
    .prepare("SELECT id FROM owners WHERE username = ? AND password_hash = ?")
    .bind(body.username, password_hash)
    .first<{ id: string }>();

  if (!row?.id) return Response.json({ ok: false, error: "Credenciales incorrectas" }, { status: 401 });

  return Response.json({ ok: true, id: row.id });
};

async function sha256(text: string) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}