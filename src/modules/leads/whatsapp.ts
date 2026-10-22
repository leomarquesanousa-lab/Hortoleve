import { whatsappUrl } from "@/config/site";
import { subjects, type LeadRequest } from "./contracts";

export function leadMessage(data: LeadRequest, productName: string | undefined) {
    return ["Nova solicitação — Horto Leve", "", "Nome: " + data.name,
        "Telefone: " + data.phone, data.email && "E-mail: " + data.email,
        "Produto: " + (productName ?? "Ainda não definido"),
        "Assunto: " + subjects.find(item => item.id === data.subject)?.label,
        "Mensagem: " + (data.message || "Gostaria de receber atendimento personalizado."),
        "Origem: Página Contato" + (productName ? " — interesse em " + productName : ""),
    ].join("\n");
}

export function leadWhatsappUrl(base: string | null, data: LeadRequest, productName?: string) {
    if (!base) return null;
    try {
        const url = new URL(base);
        if (url.origin !== "https://wa.me" || !/^\/\d{10,15}$/.test(url.pathname)) return null;
        return whatsappUrl(leadMessage(data, productName), url.pathname.slice(1));
    } catch { return null; }
}
