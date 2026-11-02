import "server-only";
import { createHash, createHmac, randomUUID } from "node:crypto";
import { getDatabase } from "@/modules/admin/database";
import { validSlot, validateVisit } from "./validation";
import type { Prisma } from "@/generated/prisma/client";
export function visitZone() { const zone = process.env.VISITS_TIME_ZONE || "America/Bahia"; new Intl.DateTimeFormat("pt-BR", { timeZone: zone }); return zone; }
export class VisitError extends Error { constructor(message: string, public status = 400) { super(message); } }
export async function queueNotifications(tx: Prisma.TransactionClient, visit: { id: string; version: number; name: string; phone: string; email: string; city: string; address: string; notes: string; date: string; time: string; timeZone: string; status: string }) {
    const text = `Protocolo: ${visit.id}\nSituação: ${visit.status}\nNome: ${visit.name}\nWhatsApp: ${visit.phone}\nE-mail: ${visit.email}\nCidade e bairro: ${visit.city}\nEndereço: ${visit.address}\nData: ${visit.date} às ${visit.time} (${visit.timeZone})\nObservações: ${visit.notes}`;
    for (const audience of ["COMPANY", "CUSTOMER"]) await tx.visitNotification.create({ data: { id: `${visit.id}-${visit.version}-${audience}`, visitId: visit.id, audience, payload: { subject: "Hortoleve — atualização da visita domiciliar", text, email: visit.email } } });
}
export async function reserve(input: Record<string, unknown>) {
    const zone = visitZone(); const data = validateVisit(input, zone, false);
    const requestKey = typeof input.requestKey === "string" ? input.requestKey : "";
    if (!/^[a-f0-9-]{36}$/i.test(requestKey)) throw new VisitError("Atualize a página e tente novamente.");
    const fingerprint = createHash("sha256").update(JSON.stringify(data)).digest("hex");
    const db = getDatabase();
    const existing = await db.homeVisit.findUnique({ where: { requestKey } });
    if (existing) { if (existing.fingerprint !== fingerprint) throw new VisitError("Este envio já foi utilizado. Atualize a página.", 409); return existing; }
    if (!validSlot(data.date, data.time, zone)) throw new VisitError("Escolha um hor?rio futuro de segunda a sexta-feira.");
    try {
        return await db.$transaction(async tx => {
            const now = Date.now(); const key = `visits:${Math.floor(now / 3600000)}`;
            const limit = await tx.rateLimit.upsert({ where: { key }, create: { key, count: 1, lastRequest: BigInt(now) }, update: { count: { increment: 1 } } });
            const secret = process.env.BETTER_AUTH_SECRET;
            if (!secret) throw new Error("Missing server secret");
            const phoneKey = "visit-phone:" + createHmac("sha256", secret).update(data.phone).digest("hex");
            const recent = await tx.rateLimit.upsert({ where: { key: phoneKey }, create: { key: phoneKey, count: 1, lastRequest: BigInt(now) }, update: { count: { increment: 1 } } });
            if (limit.count > 100 || (recent.count > 3 && now - Number(recent.lastRequest) < 3600000)) throw new VisitError("Limite de solicitações atingido. Tente mais tarde.", 429);
            if (now - Number(recent.lastRequest) >= 3600000) await tx.rateLimit.update({ where: { key: phoneKey }, data: { count: 1, lastRequest: BigInt(now) } });
            const visit = await tx.homeVisit.create({ data: { ...data, id: "HL-" + randomUUID(), requestKey, fingerprint, timeZone: zone, slotKey: `${data.date}/${data.time}` } });
            await queueNotifications(tx, visit); return visit;
        });
    } catch (error) {
        if (error instanceof VisitError) throw error;
        if ((error as { code?: string }).code === "P2002") {
            const retry = await db.homeVisit.findUnique({ where: { requestKey } });
            if (retry?.fingerprint === fingerprint) return retry;
            throw new VisitError("Este horário acabou de ser ocupado. Escolha outro.", 409);
        }
        throw error;
    }
}
export async function changeVisit(id: string, status: string, date: string, time: string, version: number, userId: string) {
    if (!["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].includes(status)) throw new VisitError("Situação inválida.");
    return getDatabase().$transaction(async tx => {
        const old = await tx.homeVisit.findUniqueOrThrow({ where: { id } });
        if (old.version !== version) throw new VisitError("A reserva foi alterada. Recarregue a lista.", 409);
        if (old.status === "CANCELLED" && status !== "CANCELLED") throw new VisitError("Uma reserva cancelada não pode ser reativada.");
        if ((date !== old.date || time !== old.time) && !validSlot(date, time, old.timeZone)) throw new VisitError("Escolha um horário futuro válido.");
        const changed = await tx.homeVisit.updateMany({ where: { id, version }, data: { date, time, status, slotKey: status === "CANCELLED" ? null : `${date}/${time}`, version: { increment: 1 } } });
        if (!changed.count) throw new VisitError("Reserva alterada por outro usuário. Recarregue.", 409);
        const visit = await tx.homeVisit.findUniqueOrThrow({ where: { id } });
        await queueNotifications(tx, visit);
        await tx.auditLog.create({ data: { userId, action: "VISIT_UPDATE", entity: "HomeVisit", recordId: id, metadata: { status, date, time } } });
        return visit;
    });
}
