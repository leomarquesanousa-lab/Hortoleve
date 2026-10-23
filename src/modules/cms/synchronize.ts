import type { Prisma } from "../../generated/prisma/client.ts";
import { initialContent } from "./initial-content.ts";

// Usado pelo painel e pelo terminal. Nunca sobrescreve documentos existentes.
export async function synchronizeContent(tx: Prisma.TransactionClient, apply = false, userId?: string) {
    if (apply) await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext('hortoleve-cms'))::text`;
    const rows = await tx.siteSetting.findMany({ where: { OR: [{ key: { startsWith: "cms:" } }, { key: { startsWith: "cms-deleted:" } }] } });
    const categories = await tx.category.findMany();
    const products = await tx.product.findMany();
    const pending = initialContent.filter(item => !rows.some(row => row.key === `cms:${item.resource}:${item.id}` || row.key === `cms-deleted:${item.resource}:${item.id}`));
    const conflicts: string[] = [];
    const create = pending.filter(item => {
        const saved = rows.filter(row => row.key.startsWith(`cms:${item.resource}:`)).map(row => row.value as { id?: string; draft?: Record<string, unknown>; published?: Record<string, unknown> | null });
        const unique = item.resource === "seo" ? "route" : item.resource === "midia" ? "src" : "slug";
        if (item.data[unique] && saved.some(doc => [doc.draft, doc.published].some(data => data?.[unique] === item.data[unique]))) {
            if (item.resource !== "midia") conflicts.push(`${item.resource}: ${item.id} possui identificador equivalente já cadastrado. Concilie antes de importar.`);
            return false;
        }
        if (item.resource === "categorias" && categories.some(c => c.id === item.id || c.slug === item.data.slug)) conflicts.push(`Categoria ${item.id} já existe sem documento CMS correspondente.`);
        if (item.resource === "produtos" && products.some(p => p.id === item.id || p.slug === item.data.slug)) conflicts.push(`Produto ${item.id} já existe sem documento CMS correspondente.`);
        return true;
    });
    const newCategoryIds = new Set(create.filter(i => i.resource === "categorias").map(i => i.id));
    for (const c of create.filter(i => i.resource === "categorias" && i.data.parentId)) {
        if (!newCategoryIds.has(String(c.data.parentId)) && !categories.some(parent => parent.id === c.data.parentId && parent.active)) conflicts.push(`Categoria ${c.id}: categoria superior ausente ou não publicada.`);
    }
    for (const p of create.filter(i => i.resource === "produtos")) {
        if (!newCategoryIds.has(String(p.data.categoryId)) && !categories.some(c => c.id === p.data.categoryId && c.active)) conflicts.push(`Produto ${p.id}: categoria ausente ou não publicada.`);
    }
    const plan = { create: Object.fromEntries([...new Set(create.map(i => i.resource))].map(resource => [resource, create.filter(i => i.resource === resource).length])), preserved: initialContent.length - create.length, conflicts, applied: false };
    if (!apply || conflicts.length) return plan;
    const json = (value: unknown) => JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
    for (const item of create.filter(i => i.resource === "categorias")) {
        const d = item.data;
        await tx.category.create({ data: { id: item.id, name: String(d.name), slug: String(d.slug), description: String(d.description ?? ""), order: Number(d.order ?? 0), active: item.published } });
    }
    for (const item of create.filter(i => i.resource === "produtos")) {
        const d = item.data;
        await tx.product.create({ data: { id: item.id, categoryId: String(d.categoryId), name: String(d.name), slug: String(d.slug), description: String(d.description), status: item.published ? "PUBLISHED" : "DRAFT", characteristics: json(d), specifications: json(d.specifications ?? []) } });
        const gallery = d.gallery as { src: string; alt: string }[];
        if (gallery.length) await tx.productMedia.createMany({ data: gallery.map((m, order) => ({ productId: item.id, url: m.src, alt: m.alt, order })) });
    }
    for (const item of create) {
        await tx.siteSetting.create({ data: { key: `cms:${item.resource}:${item.id}`, value: json({ id: item.id, resource: item.resource, revision: 1, draft: item.data, published: item.published ? item.data : null }) } });
    }
    await tx.siteSetting.upsert({ where: { key: "cms-import-completed" }, create: { key: "cms-import-completed", value: true }, update: { value: true } });
    await tx.auditLog.create({ data: { ...(userId ? { userId } : {}), action: "STATIC_CONTENT_SYNCHRONIZED", entity: "CMS", metadata: json({ created: plan.create, preserved: plan.preserved }) } });
    return { ...plan, applied: true };
}
