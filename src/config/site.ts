export const site = {
    name: "Hortoleve", url: "https://hortoleve.com.br",
    description: "Um novo olhar para o descanso. Conheça a Hortoleve, explore os produtos e descubra nossa proposta de atendimento.",
    // Preencher somente após validação comercial; telefone com DDI e DDD.
    whatsapp: null as string | null, email: null as string | null, address: null as string | null,
    indexingEnabled: false, // Ativar após aprovação do conteúdo oficial.
};
export function whatsappUrl(message: string) {
    return site.whatsapp && /^\d{10,15}$/.test(site.whatsapp) ? "https://wa.me/" + site.whatsapp + "?text=" + encodeURIComponent(message) : null;
}
