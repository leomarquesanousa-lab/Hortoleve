import { whatsappUrl } from "./site";

export type SocialChannelId = "facebook" | "tiktok" | "instagram" | "whatsapp";
export interface SocialChannel {
    id: SocialChannelId;
    name: string;
    url: string | null;
    visible: boolean;
    order: number;
}
// Registro pronto para um futuro repositório OWNER/ADMIN; sem persistência nesta etapa.
export const socialChannels: SocialChannel[] = [
    { id: "facebook", name: "Facebook", url: null, visible: true, order: 1 },
    { id: "tiktok", name: "TikTok", url: null, visible: true, order: 2 },
    { id: "instagram", name: "Instagram", url: null, visible: true, order: 3 },
    { id: "whatsapp", name: "WhatsApp", url: null, visible: true, order: 4 },
];

export function socialChannelUrl(channel: SocialChannel): string | null {
    const value = channel.url ?? (channel.id === "whatsapp" ? whatsappUrl("Olá! Gostaria de conhecer melhor a Hortoleve.") : null);
    if (!value) return null;
    const hosts: Record<SocialChannelId, string[]> = {
        facebook: ["facebook.com", "www.facebook.com", "m.facebook.com"],
        tiktok: ["tiktok.com", "www.tiktok.com", "vm.tiktok.com", "vt.tiktok.com"],
        instagram: ["instagram.com", "www.instagram.com"],
        whatsapp: ["wa.me", "api.whatsapp.com", "web.whatsapp.com", "www.whatsapp.com"],
    };
    try {
        const url = new URL(value);
        if (url.protocol !== "https:" || url.username || url.password || !hosts[channel.id].includes(url.hostname.toLowerCase())) return null;
        if (channel.id === "whatsapp") {
            const phone = url.hostname === "wa.me" ? url.pathname.slice(1) : url.searchParams.get("phone");
            return phone && /^\d{10,15}$/.test(phone) ? url.href : null;
        }
        return url.pathname !== "/" ? url.href : null;
    } catch { return null; }
}
