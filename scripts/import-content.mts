import env from "@next/env";
import { createInterface } from "node:readline/promises";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import { products, categories } from "../src/modules/catalog/data.ts";
import { presentations } from "../src/modules/catalog/presentations.ts";
env.loadEnvConfig(process.cwd());
import { initialContent as items } from "../src/modules/cms/initial-content.ts";
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
            if ((await tx.siteSetting.findUnique({ where: { key: "cms-import-completed" } }))?.value === true) throw Error("Importação já concluída; não será repetida");
            if (await tx.product.count() || await tx.category.count()) throw Error("Há produtos ou categorias existentes. Conciliação manual necessária");
            for (const c of categories) await tx.category.create({ data: { id: c.id, name: c.name, slug: c.slug, description: c.description, active: true, order: categories.indexOf(c) } });
            for (const p of products) {
                const data = items.find(i => i.resource === "produtos" && i.id === p.id)!.data;
                await tx.product.create({ data: { id: p.id, categoryId: p.categoryId, name: p.name, slug: p.slug, description: p.description, status: "PUBLISHED", characteristics: JSON.parse(JSON.stringify(data)), specifications: JSON.parse(JSON.stringify(data.specifications)) } });
                await tx.productMedia.createMany({ data: (presentations[p.slug]?.media ?? p.media).map((m, order) => ({ productId: p.id, url: m.src, alt: m.alt, order })) });
            }
            for (const i of items) { const key = `cms:${i.resource}:${i.id}`; if (!await tx.siteSetting.findUnique({ where: { key } })) await tx.siteSetting.create({ data: { key, value: JSON.parse(JSON.stringify({ id: i.id, resource: i.resource, revision: 1, draft: i.data, published: i.published ? i.data : null })) } }); }
            await tx.siteSetting.create({ data: { key: "cms-import-completed", value: true } });
            await tx.auditLog.create({ data: { action: "STATIC_CONTENT_IMPORTED", entity: "CMS", metadata: { source: "terminal-autorizado", documents: items.length } } });
        }, { timeout: 60000, maxWait: 10000 });
        console.log("Importação concluída. Conteúdo anterior preservado. Revogue CMS_IMPORT_ALLOWED.");
    } finally { await db.$disconnect(); }
}
main().catch(() => { console.error("Importação não concluída. Verifique autorização, destino e conteúdo existente. Nenhum detalhe de conexão foi exibido."); process.exitCode = 1; });
