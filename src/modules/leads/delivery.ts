import type { LeadDelivery } from "./contracts";

// Somente servidor. Nenhum canal de recebimento está configurado neste projeto.
// Ativar apenas com um adaptador real, confirmação de recebimento e limitação de abuso compartilhada.
export function getLeadDelivery(): LeadDelivery | null {
    return null;
}
