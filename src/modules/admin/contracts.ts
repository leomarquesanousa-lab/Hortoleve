import type { Product, Category, ProductMedia } from "../catalog/types";
// Contratos apenas: nenhum endpoint administrativo ou autenticação simulada.
export type Role = "OWNER" | "ADMIN";
export type Permission = "content:write" | "leads:read" | "settings:write" | "users:manage";
export const rolePermissions: Record<Role, readonly Permission[]> = {
    OWNER: ["content:write", "leads:read", "settings:write", "users:manage"], ADMIN: ["content:write", "leads:read"],
};
export interface AdminSession {
    userId: string;
    role: Role;
    expiresAt: Date;
}
export interface AuthProvider {
    requireSession(): Promise<AdminSession>;
    requirePermission(permission: Permission): Promise<AdminSession>;
}
export interface Banner {
    id: string;
    title: string;
    mediaId: string;
    href: string | null;
    published: boolean;
}
export interface ContentText {
    id: string;
    key: string;
    title: string;
    body: string;
}
export interface FAQRecord {
    id: string;
    question: string;
    answer: string;
    order: number;
}
export interface Lead {
    id: string;
    name: string;
    phone: string;
    consentAt: Date;
    createdAt: Date;
}
export interface Settings {
    id: string;
    whatsapp: string | null;
    email: string | null;
    address: string | null;
}
export interface AdminEntities {
    products: Product;
    categories: Category;
    media: ProductMedia;
    banners: Banner;
    texts: ContentText;
    faqs: FAQRecord;
    leads: Lead;
    settings: Settings;
}
export interface Repository<T extends {
    id: string;
}> {
    list(): Promise<T[]>;
    findById(id: string): Promise<T | null>;
    save(entity: T): Promise<T>;
    delete(id: string): Promise<void>;
}
export type AdminRepositories = {
    [K in keyof AdminEntities]: Repository<AdminEntities[K]>;
};
// O futuro adapter Prisma implementará estes contratos. Cada operação administrativa
// deverá validar sessão e permissão no servidor; ocultar links não protege rotas.
export type ApplicationEnvironment = "LOCAL" | "PRODUCAO";
