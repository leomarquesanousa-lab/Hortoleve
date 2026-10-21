import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { currentAdmin } from "@/modules/admin/session";
import { adminEnvironment } from "@/modules/admin/environment";
import { authorize, json, cmsKey, document } from "@/modules/cms/repository";
import { storageConfig, putMedia } from "@/modules/cms/storage";
import { getDatabase } from "@/modules/admin/database";
import { CmsError } from "@/modules/cms/validation";

export async function POST(request: Request) {
    try {
        const user = await currentAdmin(); if (!user) throw new CmsError("Sessão expirada.", 401);
        authorize(user, "midia");
        if (request.headers.get("origin") !== adminEnvironment()?.baseURL) throw new CmsError("Origem não autorizada.", 403);
        if (!storageConfig()) throw new CmsError("Configure storage persistente S3/R2 antes de enviar arquivos.", 503);
        // Contém limite real do stream, sem confiar apenas no Content-Length.
        const reader = request.body?.getReader(); const chunks: Uint8Array[] = []; let size = 0;
        if (reader) while (true) { const r = await reader.read(); if (r.done) break; size += r.value.byteLength; if (size > 24000000) { await reader.cancel(); throw new CmsError("Limite total: 24 MB por envio.", 413); } chunks.push(r.value); }
        const form = await new Request(request.url, { method: "POST", headers: { "content-type": request.headers.get("content-type") ?? "" }, body: Buffer.concat(chunks) }).formData();
        const files = form.getAll("files"); if (!files.length || files.length > 5) throw new CmsError("Selecione entre 1 e 5 imagens.");
        const replacement = form.get("replaceId");
        if (replacement && (typeof replacement !== "string" || files.length !== 1)) throw new CmsError("Substitua uma imagem por vez.");
        if (replacement && !await getDatabase().siteSetting.findUnique({ where: { key: cmsKey("midia", String(replacement)) } })) throw new CmsError("Mídia para substituir não encontrada.");
        const prepared = [];
        for (const file of files) {
            if (!(file instanceof File) || file.size > 6000000 || !["image/png", "image/jpeg", "image/webp"].includes(file.type)) throw new CmsError("Use PNG, JPEG ou WebP, até 6 MB por arquivo.");
            const image = sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 40000000, animated: false });
            const meta = await image.metadata();
            if (!["png", "jpeg", "webp"].includes(meta.format ?? "") || !meta.width || !meta.height || meta.pages && meta.pages > 1) throw new CmsError("Arquivo inválido ou animado.");
            const output = await image.rotate().webp({ quality: 90 }).toBuffer({ resolveWithObject: true });
            prepared.push({ name: file.name.replace(/[^\p{L}\p{N} ._-]/gu, "").slice(0, 100), bytes: output.data, width: output.info.width, height: output.info.height });
        }
        const results = [];
        for (const file of prepared) {
            const asset = await putMedia(file.bytes);
            const id = replacement ? String(replacement) : randomUUID();
            const data = { ...asset, name: file.name, alt: file.name.replace(/\.[^.]+$/, ""), width: file.width, height: file.height };
            await getDatabase().$transaction(async tx => {
                await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext('hortoleve-cms'))::text`;
                const key = cmsKey("midia", id), old = await tx.siteSetting.findUnique({ where: { key } });
                if (replacement && !old) throw new CmsError("Mídia não encontrada.");
                const previous = old ? document(old.value) : null;
                if (previous) {
                    // URL imutável nova; substitui referências sem apagar o arquivo anterior.
                    const from = String(previous.draft.src);
                    const replace = (value: unknown): unknown => value === from ? data.src : Array.isArray(value) ? value.map(replace) : value && typeof value === "object" ? Object.fromEntries(Object.entries(value).map(([k, v]) => [k, replace(v)])) : value;
                    const refs = await tx.siteSetting.findMany({ where: { key: { startsWith: "cms:", not: key } } });
                    for (const ref of refs) if (JSON.stringify(ref.value).includes(JSON.stringify(from))) { const doc = document(replace(ref.value)); doc.revision++; await tx.siteSetting.update({ where: { key: ref.key }, data: { value: json(doc) } }); }
                    await tx.productMedia.updateMany({ where: { url: from }, data: { url: data.src } });
                }
                await tx.siteSetting.upsert({ where: { key }, create: { key, value: json({ id, resource: "midia", revision: 1, draft: data, published: data }) }, update: { value: json({ id, resource: "midia", revision: (previous?.revision ?? 0) + 1, draft: data, published: data }) } });
                await tx.auditLog.create({ data: { userId: user.id, action: replacement ? "MEDIA_REPLACED" : "MEDIA_UPLOADED", entity: "midia", recordId: id } });
            }); results.push({ id, ...data });
        }
        return Response.json({ files: results }, { headers: { "Cache-Control": "no-store" } });
    } catch (error) { return Response.json({ error: error instanceof CmsError ? error.message : "Upload não concluído. Confira os arquivos e a configuração do storage. Arquivos anteriores foram preservados." }, { status: error instanceof CmsError ? error.status : 500, headers: { "Cache-Control": "no-store" } }); }
}
