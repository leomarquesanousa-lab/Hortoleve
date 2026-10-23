import { readLocalMedia, mediaFilename } from "@/modules/cms/local-storage";


export async function GET(_request: Request, context: { params: Promise<{ filename: string }> }) {
    const { filename } = await context.params;
    if (!mediaFilename.test(filename)) return new Response(null, { status: 404 });
    try {
        const bytes = await readLocalMedia(filename);
        return new Response(new Uint8Array(bytes), { headers: {
            "Content-Type": filename.endsWith(".png") ? "image/png" : /\.jpe?g$/.test(filename) ? "image/jpeg" : "image/webp",
            "Content-Length": String(bytes.length),
            "Cache-Control": "public, max-age=31536000, immutable",
            "X-Content-Type-Options": "nosniff",
            "Content-Security-Policy": "default-src 'none'; sandbox",
        } });
    } catch { return new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } }); }
}
