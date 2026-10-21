import { currentAdmin } from "@/modules/admin/session";
import { adminEnvironment } from "@/modules/admin/environment";
import { isResource } from "@/modules/cms/contracts";
import { authorize, listDocuments, removeDocument, saveDocument } from "@/modules/cms/repository";
import { CmsError } from "@/modules/cms/validation";

const noStore = { "Cache-Control": "no-store" };
type Context = { params: Promise<{ resource: string }> };
async function handle(request: Request, context: Context) {
    try {
        const user = await currentAdmin();
        if (!user) return Response.json({ error: "Sessão expirada. Entre novamente." }, { status: 401, headers: noStore });
        const { resource } = await context.params;
        if (!isResource(resource)) throw new CmsError("Módulo não encontrado.", 404);
        authorize(user, resource);
        if (request.method === "GET") return Response.json({ records: await listDocuments(resource) }, { headers: noStore });
        const origin = adminEnvironment()?.baseURL;
        if (!origin || request.headers.get("origin") !== origin) throw new CmsError("Origem não autorizada.", 403);
        if (request.headers.get("content-type")?.split(";")[0] !== "application/json") throw new CmsError("Formato inválido.", 415);
        const reader = request.body?.getReader(); let bytes = 0; const chunks: Uint8Array[] = [];
        if (reader) while (true) { const r = await reader.read(); if (r.done) break; bytes += r.value.byteLength; if (bytes > 200000) { await reader.cancel(); throw new CmsError("Conteúdo excede 200 KB.", 413); } chunks.push(r.value); }
        let input; try { input = JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { throw new CmsError("Conteúdo inválido."); }
        if (!input || typeof input !== "object" || (input.id !== undefined && (typeof input.id !== "string" || input.id.length > 100)) || !Number.isSafeInteger(input.revision) || input.revision < 0) throw new CmsError("Identificação ou revisão inválida.");
        if (request.method === "DELETE") { if (!input.id) throw new CmsError("Registro ausente."); await removeDocument(user, resource, input.id, input.revision); return Response.json({ ok: true }, { headers: noStore }); }
        const id = await saveDocument(user, resource, input.data, input.id, input.revision, input.publish === true);
        return Response.json({ id }, { headers: noStore });
    } catch (error) {
        return Response.json({ error: error instanceof CmsError ? error.message : "Não foi possível salvar. Confira os campos, vínculos e unicidade; tente novamente." }, { status: error instanceof CmsError ? error.status : 500, headers: noStore });
    }
}
export { handle as GET, handle as POST, handle as DELETE };
