
interface Env {
    BUCKET: R2Bucket;
}

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
    const filename = ctx.params.filename as string;

    if (!filename) {
        return new Response("Filename missing", { status: 400 });
    }

    try {
        const object = await ctx.env.BUCKET.get(filename);

        if (!object) {
            return new Response("Not found", { status: 404 });
        }

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);

        return new Response(object.body, {
            headers,
        });
    } catch (e) {
        return new Response("Error fetching image", { status: 500 });
    }
};
