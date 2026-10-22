import "server-only";
import type { ReceivedLead, LeadDelivery } from "./contracts";
import { leadMessage } from "./whatsapp";

// Adaptador opcional: só deve ser chamado após validação e limitação no servidor.
// Não é ativado automaticamente nem substitui o recebimento atual do CMS.
export function getLeadEmailDelivery(): LeadDelivery | null {
    const key = process.env.RESEND_API_KEY;
    const from = process.env.CONTACT_EMAIL_FROM;
    const to = process.env.CONTACT_EMAIL_TO;
    if (process.env.CONTACT_EMAIL_ENABLED !== "true" || !key || !from || !to) return null;
    if (/[\r\n]/.test(from + to) || !from.includes("@") || !to.includes("@")) return null;
    return { async deliver(lead: ReceivedLead) {
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST", signal: AbortSignal.timeout(15000),
            headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
            body: JSON.stringify({ from, to: [to], subject: "Nova solicitação — Horto Leve",
                text: leadMessage({ ...lead, consent: true, website: "" }, lead.line ?? undefined),
                ...(lead.email ? { reply_to: lead.email } : {}),
            }),
        });
        if (!response.ok) throw new Error("Entrega de e-mail não confirmada.");
        const receipt = await response.json();
        if (typeof receipt.id !== "string" || !receipt.id) throw new Error("Entrega sem comprovante.");
        return { id: receipt.id, receivedAt: new Date().toISOString() };
    } };
}
