export const site = {
    name: "Hortoleve", url: "https://hortoleve.com.br",
    description: "Um novo olhar para o descanso. Conheça a Hortoleve, explore os produtos e descubra nossa proposta de atendimento.",
    // WhatsApp comercial fornecido pelo cliente, com DDI e DDD.
    whatsapp: "5571996461138" as string | null, email: null as string | null, address: null as string | null,
    indexingEnabled: false, // Ativar após aprovação do conteúdo oficial.
};
export function whatsappUrl(message: string, whatsapp = site.whatsapp) {
    return whatsapp && /^\d{10,15}$/.test(whatsapp) ? "https://wa.me/" + whatsapp + (message ? "?text=" + encodeURIComponent(message) : "") : null;
}
