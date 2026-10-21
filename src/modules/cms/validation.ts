import { definitions, type Data, type Field, type Resource } from "./contracts";
import { socialChannelUrl } from "@/config/social";

export class CmsError extends Error { constructor(message: string, public status = 400) { super(message); } }
export function safeLink(value: string) {
    if (value.startsWith("/") && !value.startsWith("//") && !/[\\\u0000-\u001f]/.test(value)) return true;
    try { const u = new URL(value); return u.protocol === "https:" && !u.username && !u.password; } catch { return false; }
}
export function mediaPath(value: string) {
    try { return safeLink(value) && !value.split(/[?#]/)[0].split("/").some(part => [".", ".."].includes(decodeURIComponent(part))) && !/\.(svg|html?|js)(?:[?#]|$)/i.test(value); } catch { return false; }
}
function fields(input: unknown, schema: Field[]): Data {
    if (!input || typeof input !== "object" || Array.isArray(input)) throw new CmsError("Preencha os campos do formulário.");
    const raw = input as Data, result: Data = {};
    for (const f of schema) {
        const v = raw[f.key];
        if (f.type === "array") {
            if (v !== undefined && (!Array.isArray(v) || v.length > 100)) throw new CmsError(f.label + ": limite de 100 itens.");
            result[f.key] = (Array.isArray(v) ? v : []).map(item => fields(item, f.fields ?? [])); continue;
        }
        if (f.type === "checkbox") { result[f.key] = v === true; continue; }
        if (f.type === "number") { const n = Number(v ?? 0); if (!Number.isSafeInteger(n) || n < 0 || n > 40000 || f.required && n === 0) throw new CmsError(f.label + ": número inválido."); result[f.key] = n; continue; }
        const text = typeof v === "string" ? (f.type === "password" ? v : v.trim()) : "";
        if ((f.required && !text) || text.length > (f.max ?? (f.type === "textarea" ? 16000 : 1000)) || /\u0000/.test(text)) throw new CmsError("Revise: " + f.label);
        if (f.type === "select" && !f.options?.includes(text)) throw new CmsError("Selecione: " + f.label);
        if (["slug", "categoryId"].includes(f.key) && text && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(text)) throw new CmsError(f.label + ": use letras minúsculas, números e hífens.");
        if (["src", "image", "logo", "ogImage", "cardImage"].includes(f.key) && text && !mediaPath(text)) throw new CmsError(f.label + ": caminho de imagem inválido.");
        if (["href", "url"].includes(f.key) && text && !safeLink(text)) throw new CmsError(f.label + ": URL inválida.");
        if (["route", "canonical"].includes(f.key) && text && (!safeLink(text) || !text.startsWith("/") || text.includes("?") || text.startsWith("/admin") || text.startsWith("/api"))) throw new CmsError(f.label + ": use uma rota pública local.");
        result[f.key] = text;
    }
    return result;
}
export function validateData(resource: Resource, input: unknown): Data {
    const data = fields(input, definitions[resource].fields);
    if (resource === "usuarios" || resource === "configuracoes") {
        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email))) throw new CmsError("E-mail inválido.");
        if (data.email) data.email = String(data.email).toLowerCase();
    }
    if (resource === "configuracoes" && data.whatsapp && !/^\d{10,15}$/.test(String(data.whatsapp))) throw new CmsError("WhatsApp precisa de DDI e DDD, com 10 a 15 dígitos.");
    if (resource === "redes-sociais" && data.url && !socialChannelUrl({ id: data.channel as "facebook", name: String(data.name), url: String(data.url), visible: true, order: 0 })) throw new CmsError("Informe a URL oficial correspondente à plataforma.");
    if (resource === "produtos" && data.published && !(data.gallery as unknown[])?.length) throw new CmsError("Inclua uma imagem com texto alternativo antes de publicar.");
    return data;
}
export function lines(value: unknown): string[] { return typeof value === "string" ? value.split(/\r?\n/).map(s => s.trim()).filter(Boolean) : []; }
export function hasReference(value: unknown, tokens: string[]): boolean {
    if (typeof value === "string") return tokens.includes(value) || lines(value).some(line => tokens.includes(line));
    if (Array.isArray(value)) return value.some(v => hasReference(v, tokens));
    return !!value && typeof value === "object" && Object.values(value).some(v => hasReference(v, tokens));
}
