import { currentAdmin } from "@/modules/admin/session";
import { adminEnvironment } from "@/modules/admin/environment";
import { getDatabase } from "@/modules/admin/database";
import { synchronizeContent } from "@/modules/cms/synchronize";
import { storageConfig } from "@/modules/cms/storage";

const headers = { "Cache-Control": "no-store" };
async function handle(request: Request) {
    const user = await currentAdmin();
    if (!user?.active) return Response.json({ error: "Sessão expirada." }, { status: 401, headers });
    if (user.role !== "OWNER") return Response.json({ error: "Somente OWNER pode sincronizar a fonte inicial." }, { status: 403, headers });
    const apply = request.method === "POST";
    if (apply && request.headers.get("origin") !== adminEnvironment()?.baseURL) return Response.json({ error: "Origem não autorizada." }, { status: 403, headers });
    if (apply && request.headers.get("x-cms-confirm") !== "synchronize-missing") return Response.json({ error: "Confirme a sincronização dos registros ausentes." }, { status: 400, headers });
    try {
        const plan = await getDatabase().$transaction(tx => synchronizeContent(tx, apply, user.id), { timeout: 60000, maxWait: 10000 });
        return Response.json({ plan, publicEnabled: process.env.CMS_PUBLIC_ENABLED === "true", storageAvailable: !!storageConfig() }, { status: plan.conflicts.length ? 409 : 200, headers });
    } catch { return Response.json({ error: "Sincronização não concluída. Nenhum lote parcial foi confirmado; confira a conexão e a conciliação." }, { status: 500, headers }); }
}
export { handle as GET, handle as POST };
