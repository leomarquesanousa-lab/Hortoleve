import { currentAdmin } from "@/modules/admin/session";
import { adminEnvironment } from "@/modules/admin/environment";
import { probeLocalStorage } from "@/modules/cms/local-storage";

export const runtime = "nodejs";
const headers = { "Cache-Control": "no-store" };

export async function POST(request: Request) {
    const user = await currentAdmin();
    if (!user?.active) return Response.json({ error: "Sessão expirada." }, { status: 401, headers });
    if (user.role !== "OWNER") return Response.json({ error: "Somente OWNER pode verificar o storage." }, { status: 403, headers });
    if (request.headers.get("origin") !== adminEnvironment()?.baseURL) return Response.json({ error: "Origem não autorizada." }, { status: 403, headers });
    try { return Response.json(await probeLocalStorage(), { headers }); }
    catch { return Response.json({ error: "O processo Node não conseguiu ler e gravar no storage. Confira caminho, proprietário, permissões e isolamento da hospedagem." }, { status: 503, headers }); }
}
