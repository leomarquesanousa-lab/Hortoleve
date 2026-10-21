import { getPublicSnapshot } from "@/modules/cms/public";
import { adminEnvironment } from "@/modules/admin/environment";
import { getDatabase } from "@/modules/admin/database";
import { createHmac } from "node:crypto";
import { validateLead } from "@/modules/leads/contracts";
import { getLeadDelivery } from "@/modules/leads/delivery";

const MAX_BYTES = 12_000;
const headers = { "Cache-Control": "no-store" };

export async function POST(request: Request) {
    if (request.headers.get("origin") !== (adminEnvironment()?.baseURL ?? new URL(request.url).origin)) return Response.json({ error: "Origem não autorizada." }, { status: 403, headers });
    if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") return Response.json({ error: "Formato de envio inválido." }, { status: 415, headers });
    const reader = request.body?.getReader();
    if (!reader) return Response.json({ error: "Solicitação vazia." }, { status: 400, headers });
    let size = 0;
    let body = "";
    const decoder = new TextDecoder();
    try {
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            size += value.byteLength;
            if (size > MAX_BYTES) { await reader.cancel(); return Response.json({ error: "Solicitação muito longa." }, { status: 413, headers }); }
            body += decoder.decode(value, { stream: true });
        }
        body += decoder.decode();
    } catch { return Response.json({ error: "Não foi possível ler a solicitação." }, { status: 400, headers }); }
    let input: unknown;
    try { input = JSON.parse(body); } catch { return Response.json({ error: "Solicitação inválida." }, { status: 400, headers }); }
    const { products } = await getPublicSnapshot();
    const { data, errors } = validateLead(input, products.map(product => product.slug));
    if (!data) return Response.json({ error: "Revise os campos informados.", errors }, { status: 400, headers });
    const delivery = getLeadDelivery();
    if (!delivery) return Response.json({ error: "O recebimento de solicitações ainda não está disponível. Seus dados não foram enviados nem armazenados." }, { status: 503, headers });
    try {
        const secret = adminEnvironment()!.secret;
        const nowMs = Date.now(), window = Math.floor(nowMs / 3600000);
        const key = "lead-phone:" + createHmac("sha256", secret).update(data.phone).digest("hex") + ":" + window;
        const db = getDatabase();
        const [phoneLimit, globalLimit] = await db.$transaction([db.rateLimit.upsert({ where: { key }, create: { key, count: 1, lastRequest: BigInt(nowMs) }, update: { count: { increment: 1 }, lastRequest: BigInt(nowMs) } }), db.rateLimit.upsert({ where: { key: "lead-global:" + window }, create: { key: "lead-global:" + window, count: 1, lastRequest: BigInt(nowMs) }, update: { count: { increment: 1 }, lastRequest: BigInt(nowMs) } })]);
        if (phoneLimit.count > 5 || globalLimit.count > 100) return Response.json({ error: "Limite de solicitações atingido. Tente novamente mais tarde." }, { status: 429, headers: { ...headers, "Retry-After": "3600" } });
        await db.rateLimit.deleteMany({ where: { key: { startsWith: "lead-" }, lastRequest: { lt: BigInt(nowMs - 86400000) } } });
        const now = new Date().toISOString();
        const { website: _website, consent: _consent, ...details } = data;
        void _website; void _consent;
        const receipt = await delivery.deliver({ ...details, createdAt: now, consentAt: now });
        if (!receipt.id || !receipt.receivedAt) throw new Error("Missing receipt");
        return Response.json({ receipt }, { status: 201, headers });
    } catch { return Response.json({ error: "Não foi possível confirmar o recebimento. Tente novamente mais tarde." }, { status: 502, headers }); }
}
