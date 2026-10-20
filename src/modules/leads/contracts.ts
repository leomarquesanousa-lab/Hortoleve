export const subjects = [
    { id: "colchoes", label: "Conhecer os colchões", icon: "M3 10H21V19H3ZM3 14H21M6 10V6H18V10" },
    { id: "especialista", label: "Falar com um especialista", icon: "M5 14V11A7 7 0 0 1 19 11V14M5 11H3V17H7V11ZM19 11H21V17H17V11ZM18 18Q15 22 12 20" },
    { id: "revenda", label: "Sou lojista ou revendedor", icon: "M4 10V21H20V10M3 10L5 3H19L21 10ZM8 21V14H13V21" },
    { id: "outros", label: "Outros assuntos", icon: "M3 4H21V17H10L5 21V17H3ZM7 9H17M7 13H13" },
] as const;
export type LeadSubject = typeof subjects[number]["id"];
export interface LeadRequest {
    subject: LeadSubject;
    line: string | null;
    name: string;
    phone: string;
    email: string;
    message: string;
    consent: boolean;
    website: string;
}
export type LeadErrors = Partial<Record<keyof LeadRequest, string>>;
export interface ReceivedLead extends Omit<LeadRequest, "website" | "consent"> {
    consentAt: string;
    createdAt: string;
}
export interface LeadReceipt { id: string; receivedAt: string }
export interface LeadDelivery {
    deliver(lead: ReceivedLead): Promise<LeadReceipt>;
}

export function formatPhone(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 15);
    if (value.trim().startsWith("+")) return "+" + digits;
    if (digits.length > 11) return digits;
    if (digits.length <= 2) return digits;
    const local = digits.slice(2);
    const split = local.length > 8 ? 5 : 4;
    return "(" + digits.slice(0, 2) + ") " + local.slice(0, split) + (local.length > split ? "-" + local.slice(split) : "");
}

export function validateLead(input: unknown, validSlugs: readonly string[]): { data?: LeadRequest; errors: LeadErrors } {
    if (!input || typeof input !== "object" || Array.isArray(input)) return { errors: { name: "Revise os dados da solicitação." } };
    const raw = input as Record<string, unknown>;
    const text = (key: string) => typeof raw[key] === "string" ? (raw[key] as string).trim() : "";
    const data: LeadRequest = { subject: text("subject") as LeadSubject, line: raw.line === null || raw.line === "" ? null : text("line"), name: text("name"), phone: text("phone"), email: text("email"), message: text("message"), consent: raw.consent === true, website: text("website") };
    const errors: LeadErrors = {};
    if (!subjects.some(subject => subject.id === data.subject)) errors.subject = "Escolha como podemos ajudar.";
    if (raw.line !== null && raw.line !== "" && (typeof raw.line !== "string" || !validSlugs.includes(data.line ?? ""))) errors.line = "Selecione uma linha de produtos ou Ainda não sei.";
    if (data.name.length < 2 || data.name.length > 100 || /[\r\n\u0000]/.test(data.name)) errors.name = "Informe seu nome, entre 2 e 100 caracteres.";
    const digits = data.phone.replace(/\D/g, "");
    if (!/^\+?[\d\s().-]+$/.test(data.phone) || digits.length < 10 || digits.length > 15 || /^(\d)\1+$/.test(digits)) errors.phone = "Informe telefone com DDD ou código internacional (10 a 15 dígitos).";
    if (data.email.length > 254 || (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))) errors.email = "Confira o endereço de e-mail.";
    if (data.message.length > 2000) errors.message = "Sua mensagem pode ter até 2.000 caracteres.";
    if (!data.consent) errors.consent = "Confirme o uso dos dados para este atendimento.";
    if (data.website || (raw.website !== undefined && typeof raw.website !== "string")) errors.website = "Não foi possível validar a solicitação.";
    return Object.keys(errors).length ? { errors } : { data: { ...data, phone: (data.phone.startsWith("+") ? "+" : "") + digits }, errors };
}
