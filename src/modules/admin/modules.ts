import type { Permission } from "./contracts";
export const adminModules: { slug: string; name: string; permission: Permission }[] = [
    { slug: "home", name: "Home e banners", permission: "content:write" },
    { slug: "tecnologias", name: "Tecnologias", permission: "content:write" },
    { slug: "paginas", name: "Páginas institucionais", permission: "content:write" },
    { slug: "produtos", name: "Produtos", permission: "content:write" },
    { slug: "categorias", name: "Categorias", permission: "content:write" },
    { slug: "seo", name: "SEO", permission: "settings:write" },
    { slug: "redes-sociais", name: "Redes Sociais", permission: "settings:write" },
    { slug: "contatos", name: "Contatos", permission: "leads:read" },
    { slug: "usuarios", name: "Usuários", permission: "users:manage" },
    { slug: "analytics", name: "Analytics", permission: "settings:write" },
    { slug: "configuracoes", name: "Configurações", permission: "settings:write" },
];
