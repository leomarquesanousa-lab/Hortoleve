import { adminEnvironment } from "@/modules/admin/environment";
export const privateHeaders = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
export async function visitBody(request: Request) {
    if (request.headers.get("origin") !== (adminEnvironment()?.baseURL ?? new URL(request.url).origin)) throw new Error("Origem não autorizada.");
    if (request.headers.get("content-type")?.split(";")[0] !== "application/json") throw new Error("Formato inválido.");
    const reader = request.body?.getReader(); if (!reader) throw new Error("Envio vazio.");
    const chunks: Uint8Array[] = []; let size = 0;
    while (true) { const { value, done } = await reader.read(); if (done) break; size += value.length; if (size > 10000) { await reader.cancel(); throw new Error("Envio muito longo."); } chunks.push(value); }
    const input = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Envio inválido.");
    return input as Record<string, unknown>;
}
