import { currentAdmin } from "@/modules/admin/session";
import { adminEnvironment } from "@/modules/admin/environment";
import { probeLocalStorage, validateStorageImages, diagnoseStorage } from "@/modules/cms/local-storage";
import { storageAssets } from "@/modules/cms/storage-assets.generated";

const headers = { "Cache-Control": "no-store" };

export async function POST(request: Request) {
    const user = await currentAdmin();
    if (!user?.active) return Response.json({ error: "Sessão expirada." }, { status: 401, headers });
    if (user.role !== "OWNER") return Response.json({ error: "Somente OWNER pode verificar o storage." }, { status: 403, headers });
    if (request.headers.get("origin") !== adminEnvironment()?.baseURL) return Response.json({ error: "Origem não autorizada." }, { status: 403, headers });
    try {
        if (new URL(request.url).searchParams.get("diagnose") === "storage") {
            const report = await diagnoseStorage(storageAssets);
            return Response.json(report, { status: report.readable ? 200 : 503, headers });
        }
        if (new URL(request.url).searchParams.get("validate") === "products") {
            const report = await validateStorageImages(storageAssets);
            return Response.json(report, { status: report.valid ? 200 : 409, headers });
        }
        return Response.json(await probeLocalStorage(), { headers });
    }
    catch { return Response.json({ error: "Diretório de storage indisponível ou configuração inválida. Execute o diagnóstico OWNER; não interprete esta falha como ausência das imagens." }, { status: 503, headers }); }
}
