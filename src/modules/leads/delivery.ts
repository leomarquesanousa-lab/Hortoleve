import type { LeadDelivery } from "./contracts";
import "server-only";
import { getDatabase } from "@/modules/admin/database";
import { adminEnvironment } from "@/modules/admin/environment";

export function getLeadDelivery(): LeadDelivery | null {
    if (process.env.CMS_LEADS_ENABLED !== "true" || !adminEnvironment()) return null;
    return { async deliver(lead) {
        const db = getDatabase();
        const product = lead.line ? await db.product.findFirst({ where: { slug: lead.line, status: "PUBLISHED" } }) : null;
        const saved = await db.$transaction(async tx => {
            const record = await tx.contactLead.create({ data: { name: lead.name, phone: lead.phone, email: lead.email || null, subject: lead.subject, message: lead.message || null, productId: product?.id, consentAt: new Date(lead.consentAt) } });
            await tx.siteSetting.create({ data: { key: "lead-notes:" + record.id, value: { text: "", source: "/contato", interest: lead.line } } });
            return record;
        });
        return { id: saved.id, receivedAt: saved.createdAt.toISOString() };
    } };
}
