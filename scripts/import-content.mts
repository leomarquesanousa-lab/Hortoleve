import env from "@next/env";
import { createHash } from "node:crypto";
import { createInterface } from "node:readline/promises";
import fs from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import { products, categories } from "../src/modules/catalog/data.ts";
import { presentations } from "../src/modules/catalog/presentations.ts";
import { faqs, experiences } from "../src/modules/content/data.ts";
import { defaultHeroSlides } from "../src/modules/cms/hero-defaults.ts";
import { site } from "../src/config/site.ts";
env.loadEnvConfig(process.cwd());
type Data = Record<string, unknown>;
const items: { resource: string; id: string; data: Data; published: boolean }[] = [];
const add = (resource: string, id: string, data: Data, published = true) => items.push({ resource, id, data: { ...data, published }, published });
categories.forEach((c, order) => add("categorias", c.id, { ...c, order, image: "" }));
products.forEach((p, order) => {
    const presentation = presentations[p.slug], cover = p.media[0];
    add("produtos", p.id, { ...p, order, highlights: p.highlights.join("\n"), benefits: "", materials: "", technologyIds: "", technologies: presentation?.technologies.join("\n") ?? "", displayName: presentation?.displayName ?? "", title: presentation?.title ?? "", subtitle: presentation?.subtitle ?? "", paragraphs: presentation?.paragraphs.join("\n") ?? "", gallery: presentation?.media ?? p.media, specifications: presentation?.specifications ?? p.specifications, sizes: presentation?.sizes ?? [], technicalSheetId: presentation?.technicalSheetId ?? "", cardImage: cover?.src ?? "", cardAlt: cover?.alt ?? "", cardWidth: cover?.width ?? 0, cardHeight: cover?.height ?? 0 });
});
const technologyNames = [...new Set(Object.values(presentations).flatMap(p => p?.technologies ?? []))];
const slug = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
technologyNames.forEach((name, order) => add("tecnologias", slug(name), { name, slug: slug(name), description: "", image: "", order }));
for (const item of items.filter(i => i.resource === "produtos")) item.data.technologyIds = String(item.data.technologies).split("\n").filter(Boolean).map(slug).join("\n");
add("configuracoes", "principal", { ...site, phone: "", hours: "", logo: "/logo/logo-offwhite.PNG", footerText: "Um novo olhar para o seu descanso. Conheça nossas linhas de colchões e encontre inspiração para o seu espaço.", footerLinks: [{ title: "Sobre a marca", href: "/sobre" }, { title: "Produtos", href: "/produtos" }, { title: "Tecnologias", href: "/tecnologias" }, { title: "Contato", href: "/contato" }] });
for (const [index, channel] of ["facebook", "tiktok", "instagram", "whatsapp"].entries()) add("redes-sociais", channel, { channel, name: ["Facebook", "TikTok", "Instagram", "WhatsApp"][index], url: "", visible: true, order: index + 1 });
add("home", "principal", { name: "Home Hortoleve", banners: defaultHeroSlides.map((b, i) => ({ ...b, width: i === 1 ? 1672 : 1536, height: i === 1 ? 941 : 1024 })), sections: [
    { type: "linhas", eyebrow: "COLCHÕES HORTOLEVE", title: "Conheça nossas linhas", text: "", items: [] },
    { type: "beneficios", title: "Seu ritmo. Seu espaço. Sua escolha.", text: "Uma escolha com tempo e atenção.", items: [] },
    { type: "tecnologias", eyebrow: "TECNOLOGIAS & EXPERIÊNCIAS", title: "Descubra novas possibilidades.", text: "Recursos previstos para a evolução do site. Conheça o que está no planejamento.", items: experiences.map(e => ({ title: e.name, text: e.description })) },
    { type: "historia", eyebrow: "A HORTOLEVE", title: "Espaço para uma nova história.", text: "Uma nova apresentação digital começa aqui: mais espaço para conhecer a marca, explorar os produtos e conversar sobre o descanso.\nA trajetória e os marcos da Hortoleve serão apresentados após validação do conteúdo institucional.", href: "/sobre", cta: "Conheça essa nova etapa", items: [] },
    { type: "faq", eyebrow: "PODEMOS AJUDAR?", title: "Antes de escolher, descubra.", text: "", items: faqs.map(f => ({ title: f.question, text: f.answer })) },
    { type: "atendimento", eyebrow: "UMA CONVERSA É UM BOM COMEÇO", title: "O seu próximo descanso começa com uma escolha.", text: "Conheça a proposta de atendimento e os próximos passos.", items: [] },
] }, false);
// Somente textos literais existentes; os layouts aprovados continuam ativos até publicação explícita.
for (const name of ["sobre", "tecnologias", "contato"]) {
    const source = fs.readFileSync(`src/app/${name}/page.tsx`, "utf8");
    const paragraphs = [...source.matchAll(/<p(?:\s[^>]*)?>([^<{]+)<\/p>/g)].map(m => m[1].trim()).filter(Boolean);
    add("paginas", name, { slug: name, name: { sobre: "A Hortoleve", tecnologias: "Tecnologias Hortoleve", contato: "Atendimento personalizado" }[name], subtitle: "", image: name === "sobre" ? "/showroom/Luxury Bedding Showroom in Warm Green and Gold.png" : "", sections: paragraphs.map(text => ({ title: "", text, image: "", alt: "" })) }, false);
}
const assets = new Map<string, { alt: string; width: number; height: number }>();
for (const p of products) for (const m of [...p.media, ...(presentations[p.slug]?.media ?? [])]) assets.set(m.src, m);
for (const b of defaultHeroSlides) assets.set(b.src, { alt: b.alt, width: b.kind === "technology" ? 1672 : 1536, height: b.kind === "technology" ? 941 : 1024 });
assets.set("/logo/logo-offwhite.PNG", { alt: "Logotipo oficial Hortoleve", width: 2172, height: 724 });
assets.set("/showroom/Luxury Bedding Showroom in Warm Green and Gold.png", { alt: "Showroom Hortoleve", width: 1536, height: 1024 });
assets.set("/tecnologia/Smart Mattress Technology Showcase.png", { alt: "Diagrama conceitual das tecnologias do colchão", width: 1536, height: 1024 });
assets.set("/tecnologia/cromoterapia e massagem.png", { alt: "Representação conceitual de cromoterapia e massagem", width: 1672, height: 941 });
for (const [src, info] of assets) add("midia", createHash("sha256").update(src).digest("hex").slice(0, 24), { src, ...info, name: src.split("/").pop() });
console.log("Plano de importação (nenhum segredo):", JSON.stringify(Object.fromEntries([...new Set(items.map(i => i.resource))].map(r => [r, items.filter(i => i.resource === r).length]))));
async function main() {
    if (!process.argv.includes("--apply")) { console.log("Simulação local concluída. Nenhuma conexão ou escrita executada."); return; }
    if (process.env.CMS_IMPORT_ALLOWED !== "true" || !process.stdin.isTTY || (process.env.NODE_ENV === "production" && !process.argv.includes("--allow-production-write"))) throw Error("Não autorizado");
    const url = new URL(process.env.DATABASE_URL ?? ""); if (!["postgres:", "postgresql:"].includes(url.protocol) || (process.env.NODE_ENV === "production" && !["require", "verify-full"].includes(url.searchParams.get("sslmode") ?? ""))) throw Error("Destino inválido");
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    try { if (await rl.question("Após backup e aprovação, digite IMPORTAR CONTEUDO SEM SOBRESCREVER: ") !== "IMPORTAR CONTEUDO SEM SOBRESCREVER") throw Error("Cancelado"); } finally { rl.close(); }
    const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 }), log: [] });
    try {
        await db.$transaction(async tx => {
            await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext('hortoleve-cms'))::text`;
            if (await tx.siteSetting.count({ where: { OR: [{ key: { startsWith: "cms:" } }, { key: "cms-import-completed" }] } }) || await tx.product.count() || await tx.category.count()) throw Error("Há conteúdo existente. Conciliação manual necessária");
            for (const c of categories) await tx.category.create({ data: { id: c.id, name: c.name, slug: c.slug, description: c.description, active: true, order: categories.indexOf(c) } });
            for (const p of products) {
                const data = items.find(i => i.resource === "produtos" && i.id === p.id)!.data;
                await tx.product.create({ data: { id: p.id, categoryId: p.categoryId, name: p.name, slug: p.slug, description: p.description, status: "PUBLISHED", characteristics: JSON.parse(JSON.stringify(data)), specifications: JSON.parse(JSON.stringify(data.specifications)) } });
                await tx.productMedia.createMany({ data: (presentations[p.slug]?.media ?? p.media).map((m, order) => ({ productId: p.id, url: m.src, alt: m.alt, order })) });
            }
            for (const i of items) await tx.siteSetting.create({ data: { key: `cms:${i.resource}:${i.id}`, value: JSON.parse(JSON.stringify({ id: i.id, resource: i.resource, revision: 1, draft: i.data, published: i.published ? i.data : null })) } });
            await tx.siteSetting.create({ data: { key: "cms-import-completed", value: true } });
            await tx.auditLog.create({ data: { action: "STATIC_CONTENT_IMPORTED", entity: "CMS", metadata: { source: "terminal-autorizado", documents: items.length } } });
        }, { timeout: 60000, maxWait: 10000 });
        console.log("Importação concluída. Conteúdo anterior preservado. Revogue CMS_IMPORT_ALLOWED.");
    } finally { await db.$disconnect(); }
}
main().catch(() => { console.error("Importação não concluída. Verifique autorização, destino e conteúdo existente. Nenhum detalhe de conexão foi exibido."); process.exitCode = 1; });
