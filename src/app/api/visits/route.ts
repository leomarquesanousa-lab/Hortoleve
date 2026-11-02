import { getDatabase } from "@/modules/admin/database";
import { reserve, visitZone, VisitError } from "@/modules/visits/service";
import { localNow, TIMES, validSlot } from "@/modules/visits/validation";
import { deliverVisitNotifications } from "@/modules/visits/notifications";
import { privateHeaders as headers, visitBody } from "@/modules/visits/http";
export async function GET(request: Request) {
    try {
        const zone = visitZone(), today = localNow(zone).date;
        const date = new URL(request.url).searchParams.get("date") ?? today;
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return Response.json({ error: "Data inválida." }, { status: 400, headers });
        const occupied = await getDatabase().homeVisit.findMany({ where: { date, slotKey: { not: null } }, select: { time: true } });
        return Response.json({ today, zone, times: TIMES.filter(time => validSlot(date, time, zone) && !occupied.some(slot => slot.time === time)) }, { headers });
    } catch { return Response.json({ error: "Agenda temporariamente indisponível. Tente novamente em instantes." }, { status: 503, headers }); }
}
export async function POST(request: Request) {
    let input;
    try { input = await visitBody(request); } catch (error) { return Response.json({ error: (error as Error).message }, { status: 400, headers }); }
    let visit;
    try { visit = await reserve(input); } catch (error) {
        const expected = error instanceof VisitError || (error as Error).message.startsWith("Informe") || (error as Error).message.startsWith("Revise") || (error as Error).message.startsWith("Escolha") || (error as Error).message.startsWith("Autorize");
        return Response.json({ error: expected ? (error as Error).message : "Não foi possível registrar a reserva. Tente novamente com os mesmos dados." }, { status: error instanceof VisitError ? error.status : expected ? 400 : 503, headers });
    }
    // Delivery cannot turn a committed reservation into a failed booking response.
    try { await deliverVisitNotifications(visit.id); } catch { /* durable outbox remains pending */ }
    let sent = false;
    try { sent = await getDatabase().visitNotification.count({ where: { visitId: visit.id, audience: "COMPANY", sentAt: { not: null } } }) > 0; } catch { /* show conservative pending state */ }
    return Response.json({ protocol: visit.id, message: `Sua solicitação foi registrada e o horário reservado para ${visit.date.split("-").reverse().join("/")} às ${visit.time} (${visit.timeZone}). A confirmação da visita depende do contato da equipe. ${sent ? "A empresa foi notificada por e-mail." : "A notificação por e-mail está pendente; a reserva permanece salva."}` }, { status: 201, headers });
}
