import { currentAdmin } from "@/modules/admin/session";
import { hasAdminPermission } from "@/modules/admin/authorization";
import { getDatabase } from "@/modules/admin/database";
import { changeVisit, VisitError } from "@/modules/visits/service";
import { deliverVisitNotifications } from "@/modules/visits/notifications";
import { visitBody, privateHeaders as headers } from "@/modules/visits/http";
async function authorized() { const user = await currentAdmin(); return user && hasAdminPermission(user, "leads:read") ? user : null; }
export async function GET(request: Request) {
    if (!await authorized()) return Response.json({ error: "Acesso restrito." }, { status: 403, headers });
    const date = new URL(request.url).searchParams.get("date") || undefined;
    try { return Response.json(await getDatabase().homeVisit.findMany({ where: { date }, include: { notifications: { select: { id: true, audience: true, sentAt: true, attempts: true, lastError: true } } }, orderBy: [{ date: "asc" }, { time: "asc" }], take: 100 }), { headers }); }
    catch { return Response.json({ error: "Não foi possível consultar a agenda." }, { status: 503, headers }); }
}
export async function POST(request: Request) {
    const user = await authorized(); if (!user) return Response.json({ error: "Acesso restrito." }, { status: 403, headers });
    try {
        const input = await visitBody(request);
        if (input.action === "retry") { await deliverVisitNotifications(); return Response.json({ message: "Fila processada. Consulte o estado das notificações." }, { headers }); }
        if (typeof input.id !== "string" || typeof input.status !== "string" || typeof input.date !== "string" || typeof input.time !== "string" || !Number.isInteger(input.version)) throw new VisitError("Dados inválidos.");
        await changeVisit(input.id, input.status, input.date, input.time, input.version as number, user.id);
        try { await deliverVisitNotifications(input.id); } catch { /* persisted */ }
        return Response.json({ message: "Reserva atualizada. Notificações pendentes permanecem na fila." }, { headers });
    } catch (error) { return Response.json({ error: error instanceof VisitError ? error.message : (error as { code?: string }).code === "P2002" ? "Horário ocupado. Escolha outro." : "Não foi possível atualizar. Recarregue e tente novamente." }, { status: error instanceof VisitError ? error.status : 409, headers }); }
}
