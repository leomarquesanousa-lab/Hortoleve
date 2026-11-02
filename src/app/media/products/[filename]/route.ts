import { readLocalMedia, mediaFilename } from "@/modules/cms/local-storage";
import { originalImageURLs } from "@/modules/catalog/storage-images";
import { readFile } from "node:fs/promises";
import path from "node:path";


export async function GET(_request: Request, context: { params: Promise<{ filename: string }> }) {
    const { filename } = await context.params;
    if (!mediaFilename.test(filename)) return new Response(null, { status: 404 });
    try {
        // Local previews can use the exact original in public; production keeps its storage driver.
        const original = process.env.NODE_ENV === "development" && !process.env.CMS_STORAGE_PATH
            ? originalImageURLs("/media/products/" + filename)[0] : undefined;
        const bytes = original
            ? await readFile(path.join(process.cwd(), "public", original))
            : await readLocalMedia(filename);
        return new Response(new Uint8Array(bytes), { headers: {
            "Content-Type": filename.endsWith(".png") ? "image/png" : /\.jpe?g$/.test(filename) ? "image/jpeg" : "image/webp",
            "Content-Length": String(bytes.length),
            "Cache-Control": original ? "no-store" : "public, max-age=31536000, immutable",
            "X-Content-Type-Options": "nosniff",
            "Content-Security-Policy": "default-src 'none'; sandbox",
        } });
    } catch { return new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } }); }
}
