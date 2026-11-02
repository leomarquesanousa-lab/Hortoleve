import "server-only";
import { getDatabase } from "@/modules/admin/database";
// Durable outbox: leases prevent concurrent workers; provider keys protect ambiguous retries.
export async function deliverVisitNotifications(visitId?: string) {
    if (process.env.VISITS_EMAIL_ENABLED !== "true") return;
    const key = process.env.RESEND_API_KEY, from = process.env.VISITS_EMAIL_FROM, company = process.env.VISITS_EMAIL_TO;
    if (!key || !from || !company || /[\r\n]/.test(from + company)) return;
    const db = getDatabase(); const now = new Date();
    const retryAfter = new Date(now.getTime() - 23 * 3600000);
    await db.visitNotification.updateMany({ where: { sentAt: null, firstAttemptAt: { lt: retryAfter } }, data: { lastError: "REVIEW_REQUIRED: prazo de repeti??o segura encerrado. Verifique a entrega no provedor antes de reenviar." } });
    const jobs = await db.visitNotification.findMany({ where: { visitId, sentAt: null, AND: [{ OR: [{ lockedUntil: null }, { lockedUntil: { lt: now } }] }, { OR: [{ firstAttemptAt: null }, { firstAttemptAt: { gte: retryAfter } }] }] }, take: 20, orderBy: { createdAt: "asc" } });
    for (const job of jobs) {
        // Never retry an ambiguous delivery beyond the provider's idempotency window.
        if (job.firstAttemptAt && now.getTime() - job.firstAttemptAt.getTime() > 23 * 3600000) {
            await db.visitNotification.update({ where: { id: job.id }, data: { lastError: "REVIEW_REQUIRED: verificar entrega no provedor antes de reenviar." } }); continue;
        }
        const claim = await db.visitNotification.updateMany({ where: { id: job.id, sentAt: null, OR: [{ lockedUntil: null }, { lockedUntil: { lt: now } }] }, data: { lockedUntil: new Date(Date.now() + 60000), firstAttemptAt: job.firstAttemptAt ?? now, attempts: { increment: 1 } } });
        if (!claim.count) continue;
        try {
            const payload = job.payload as { subject: string; text: string; email: string };
            const response = await fetch("https://api.resend.com/emails", { method: "POST", signal: AbortSignal.timeout(15000), headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "Idempotency-Key": job.id }, body: JSON.stringify({ from, to: [job.audience === "COMPANY" ? company : payload.email], subject: payload.subject, text: payload.text }) });
            if (!response.ok || typeof (await response.json()).id !== "string") throw new Error("Delivery unconfirmed");
            await db.visitNotification.update({ where: { id: job.id }, data: { sentAt: new Date(), lockedUntil: null, lastError: null } });
        } catch { await db.visitNotification.update({ where: { id: job.id }, data: { lockedUntil: new Date(Date.now() + 300000), lastError: "Entrega não confirmada; nova tentativa disponível após 5 minutos." } }); }
    }
}
