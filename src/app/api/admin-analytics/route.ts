import { currentAdmin } from "@/modules/admin/session";
import { hasAdminPermission } from "@/modules/admin/authorization";
import { analyticsReport } from "@/modules/cms/analytics";
export async function GET() {
    const headers = { "Cache-Control": "no-store" };
    const user = await currentAdmin();
    if (!user) return Response.json({ error: "Autenticação necessária." }, { status: 401, headers });
    if (!hasAdminPermission(user, "settings:write")) return Response.json({ error: "Acesso não delegado." }, { status: 403, headers });
    try {
        const report = await analyticsReport();
        return report ? Response.json(report, { headers }) : Response.json({ error: "Data API não configurada. Informe a propriedade e a conta de serviço no servidor." }, { status: 503, headers });
    } catch { return Response.json({ error: "Não foi possível consultar o Google Analytics. Confira a autorização externa." }, { status: 502, headers }); }
}
