import "server-only";
import { randomUUID } from "node:crypto";
import type { Prisma } from "@/generated/prisma/client";
import { getDatabase } from "@/modules/admin/database";
import type { AdminIdentity } from "@/modules/admin/authorization";
import { hasAdminPermission } from "@/modules/admin/authorization";
import { hashAdminPassword } from "@/modules/admin/password";
import { definitions, type Data, type Resource } from "./contracts";
import { CmsError, hasReference, lines, validateData } from "./validation";
import { initialContent } from "./initial-content";
import { withStorageImages } from "../catalog/storage-images";

export interface Document { id: string; resource: Resource; revision: number; draft: Data; published: Data | null; source?: "static" }
export const cmsKey = (resource: Resource, id: string) => `cms:${resource}:${id}`;
export const json = (value: unknown) => JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
export function document(value: unknown): Document { return value as Document; }
export function authorize(user: AdminIdentity, resource: Resource) { if (!hasAdminPermission(user, definitions[resource].permission)) throw new CmsError("Sem permissão para esta operação.", 403); }
export async function listDocuments(resource: Resource): Promise<Document[]> {
    const db = getDatabase();
    if (resource === "usuarios") return (await db.user.findMany({ select: { id: true, name: true, email: true, role: true, active: true, permissions: true, updatedAt: true }, orderBy: { createdAt: "desc" } })).map(u => ({ id: u.id, resource, revision: u.updatedAt.getTime(), published: null, draft: { name: u.name, email: u.email, role: u.role, active: u.active, contentWrite: u.permissions.includes("content:write"), leadsRead: u.permissions.includes("leads:read") } }));
    if (resource === "contatos") {
        const [leads, notes] = await Promise.all([db.contactLead.findMany({ take: 1000, orderBy: { createdAt: "desc" } }), db.siteSetting.findMany({ where: { key: { startsWith: "lead-notes:" } } })]);
        return leads.map(l => ({ id: l.id, resource, revision: l.updatedAt.getTime(), published: null, draft: { name: l.name, phone: l.phone, email: l.email ?? "", subject: l.subject, message: l.message ?? "", status: l.status, productId: l.productId, createdAt: l.createdAt.toISOString(), source: String((notes.find(n => n.key === "lead-notes:" + l.id)?.value as Data)?.source ?? "Não informado"), interest: String((notes.find(n => n.key === "lead-notes:" + l.id)?.value as Data)?.interest ?? ""), notes: String((notes.find(n => n.key === "lead-notes:" + l.id)?.value as Data)?.text ?? "") } }));
    }
    const saved = (await db.siteSetting.findMany({ where: { key: { startsWith: `cms:${resource}:` } }, orderBy: { key: "asc" } })).map(r => document(r.value));
    const deleted = await db.siteSetting.findMany({ where: { key: { startsWith: `cms-deleted:${resource}:` } } });
    const initial: Document[] = initialContent.filter(i => i.resource === resource && !saved.some(d => d.id === i.id) && !deleted.some(row => row.key === `cms-deleted:${resource}:${i.id}`)).map(i => ({ id: i.id, resource, revision: 0, draft: structuredClone(i.data), published: i.published ? structuredClone(i.data) : null, source: "static" }));
    // Fonte real do site visível antes da importação; nenhuma escrita implícita.
    return withStorageImages([...saved, ...initial]);
}
export async function allDocuments() { return (await getDatabase().siteSetting.findMany({ where: { key: { startsWith: "cms:" } } })).map(r => withStorageImages(document(r.value))); }
function replaceRoute(from: string, to: string) { return { from, to }; }
export async function saveDocument(user: AdminIdentity, resource: Resource, raw: unknown, id: string | undefined, revision: number, publish: boolean) {
    authorize(user, resource);
    const data = validateData(resource, raw), db = getDatabase();
    if (definitions[resource].singleton && id && id !== "principal") throw new CmsError("Este módulo possui uma única configuração.");
    if (resource === "paginas") {
        if (!["sobre", "tecnologias", "contato"].includes(String(data.slug)) || id && id !== data.slug) throw new CmsError("Selecione uma das páginas institucionais existentes.");
        id = String(data.slug);
    }
    if (resource === "redes-sociais") {
        if (id && id !== data.channel) throw new CmsError("O canal social não pode ser alterado.");
        id = String(data.channel);
    }
    if (resource === "usuarios") {
        const passwordHash = data.password ? await hashAdminPassword(String(data.password)) : undefined;
        if (!id && !passwordHash) throw new CmsError("Defina uma senha inicial segura.");
        return db.$transaction(async tx => {
            await tx.$queryRaw`SELECT pg_advisory_xact_lock(72836491)::text`;
            const previous = id ? await tx.user.findUnique({ where: { id } }) : null;
            if (id && (!previous || previous.updatedAt.getTime() !== revision)) throw new CmsError("Registro alterado por outro operador. Atualize.", 409);
            if (previous?.role === "OWNER" && previous.active && (data.role !== "OWNER" || !data.active) && await tx.user.count({ where: { role: "OWNER", active: true } }) <= 1) throw new CmsError("O último OWNER ativo não pode ser desativado ou rebaixado.");
            const values = { name: String(data.name), email: String(data.email), role: data.role as "OWNER" | "ADMIN", active: data.active === true, permissions: [data.contentWrite ? "content:write" : "", data.leadsRead ? "leads:read" : ""].filter(Boolean) };
            const result = previous ? await tx.user.update({ where: { id }, data: values }) : await tx.user.create({ data: values });
            if (passwordHash) await tx.account.upsert({ where: { providerId_accountId: { providerId: "credential", accountId: result.id } }, create: { userId: result.id, providerId: "credential", accountId: result.id, password: passwordHash }, update: { password: passwordHash } });
            if (previous) await tx.session.deleteMany({ where: { userId: result.id } });
            await tx.auditLog.create({ data: { userId: user.id, action: previous ? "USER_UPDATED" : "USER_CREATED", entity: "User", recordId: result.id } });
            return result.id;
        });
    }
    if (resource === "contatos") {
        if (!id) throw new CmsError("Leads são recebidos pelo formulário público.");
        await db.$transaction(async tx => {
            const changed = await tx.contactLead.updateMany({ where: { id, updatedAt: new Date(revision) }, data: { status: data.status as "NEW" | "IN_PROGRESS" | "CLOSED" } });
            if (changed.count !== 1) throw new CmsError("Solicitação alterada por outro operador. Atualize.", 409);
            const previousNotes = await tx.siteSetting.findUnique({ where: { key: "lead-notes:" + id } });
            const notes = json({ ...(previousNotes?.value as Data ?? {}), text: String(data.notes) });
            await tx.siteSetting.upsert({ where: { key: "lead-notes:" + id }, create: { key: "lead-notes:" + id, value: notes }, update: { value: notes } });
            await tx.auditLog.create({ data: { userId: user.id, action: "LEAD_UPDATED", entity: "ContactLead", recordId: id } });
        }); return id;
    }
    id ??= definitions[resource].singleton ? "principal" : resource === "categorias" ? String(data.slug) : randomUUID();
    const key = cmsKey(resource, id);
    return db.$transaction(async tx => {
        // Serializa revisões e publicação entre operadores; não depende de estado no processo.
        await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext('hortoleve-cms'))::text`;
        const oldRow = await tx.siteSetting.findUnique({ where: { key } });
        const previous = oldRow ? document(oldRow.value) : null;
        if (!previous && ["produtos", "categorias", "tecnologias", "home", "paginas", "midia"].includes(resource) && initialContent.some(i => i.resource === resource && (i.id === id || data.slug && i.data.slug === data.slug))) {
            if ((await tx.siteSetting.findUnique({ where: { key: "cms-import-completed" } }))?.value !== true) throw new CmsError("Conteúdo atual ainda não importado. A importação inicial exige autorização; nenhuma alteração foi gravada.", 409);
        }
        if ((previous?.revision ?? 0) !== revision) throw new CmsError("Conteúdo alterado por outro operador. Atualize antes de salvar.", 409);
        const docs = (await tx.siteSetting.findMany({ where: { key: { startsWith: `cms:${resource}:` } } })).map(r => document(r.value));
        const unique = resource === "redes-sociais" ? "channel" : resource === "seo" ? "route" : "slug";
        if (data[unique] && docs.some(d => d.id !== id && (d.draft[unique] === data[unique] || d.published?.[unique] === data[unique]))) throw new CmsError("Slug, rota ou canal já cadastrado.");
        if (resource === "produtos") {
            if (!await tx.category.findUnique({ where: { id: String(data.categoryId) } })) throw new CmsError("Cadastre e publique a categoria antes do produto.");
            for (const technology of lines(data.technologyIds)) if (!await tx.siteSetting.findUnique({ where: { key: cmsKey("tecnologias", technology) } })) throw new CmsError("ID de tecnologia não cadastrado: " + technology);
        }
        if (resource === "categorias" && data.parentId) {
            const parents = (await tx.siteSetting.findMany({ where: { key: { startsWith: "cms:categorias:" } } })).map(r => document(r.value));
            let current = String(data.parentId);
            const seen = new Set([id!]);
            while (current) {
                if (seen.has(current)) throw new CmsError("A hierarquia de categorias não pode formar um ciclo.");
                seen.add(current);
                const parent = parents.find(c => c.id === current)?.published;
                if (!parent) throw new CmsError("Selecione uma categoria superior publicada.");
                current = String(parent.parentId ?? "");
            }
        }
        const next: Document = { id: id!, resource, revision: (previous?.revision ?? 0) + 1, draft: data, published: publish ? (data.published === false ? null : data) : previous?.published ?? null };
        // Documentos guardam rascunho e apresentação rica; models relacionais espelham a versão publicada.
        if (publish && resource === "produtos") {
            const old = await tx.product.findUnique({ where: { id } });
            const category = await tx.category.findUniqueOrThrow({ where: { id: String(data.categoryId) } });
            if (next.published && !category.active) throw new CmsError("Publique a categoria antes de publicar o produto.");
            const values = { categoryId: category.id, name: String(data.name), slug: String(data.slug), description: String(data.description), status: next.published ? "PUBLISHED" as const : "DRAFT" as const, characteristics: json(data), specifications: json(data.specifications ?? []) };
            await tx.product.upsert({ where: { id }, create: { id, ...values }, update: values });
            await tx.productMedia.deleteMany({ where: { productId: id } });
            const gallery = data.gallery as Data[];
            if (gallery.length) await tx.productMedia.createMany({ data: gallery.map((m, order) => ({ productId: id!, url: String(m.src), alt: String(m.alt), order })) });
            if (old && old.status === "PUBLISHED") {
                const oldCategory = await tx.category.findUniqueOrThrow({ where: { id: old.categoryId } });
                const from = `/produtos/${oldCategory.slug}/${old.slug}`, to = `/produtos/${category.slug}/${data.slug}`;
                if (from !== to) await tx.siteSetting.upsert({ where: { key: "redirect:" + from }, create: { key: "redirect:" + from, value: replaceRoute(from, to) }, update: { value: replaceRoute(from, to) } });
            }
        }
        if (publish && resource === "categorias") {
            const old = await tx.category.findUnique({ where: { id } });
            if (!next.published && (docs.some(c => c.published?.parentId === id) || await tx.product.count({ where: { categoryId: id, status: "PUBLISHED" } }))) throw new CmsError("Despublique ou mova os produtos e subcategorias vinculados antes desta categoria.");
            const values = { name: String(data.name), slug: String(data.slug), description: String(data.description), order: Number(data.order), active: !!next.published };
            await tx.category.upsert({ where: { id }, create: { id, ...values }, update: values });
            if (old?.active && old.slug !== data.slug) {
                const mappings = [{ from: "/produtos/" + old.slug, to: "/produtos/" + data.slug }, ...(await tx.product.findMany({ where: { categoryId: id, status: "PUBLISHED" } })).map(p => ({ from: `/produtos/${old.slug}/${p.slug}`, to: `/produtos/${data.slug}/${p.slug}` }))];
                for (const r of mappings) await tx.siteSetting.upsert({ where: { key: "redirect:" + r.from }, create: { key: "redirect:" + r.from, value: r }, update: { value: r } });
            }
        }
        if (publish && resource === "seo") await tx.seoSetting.upsert({ where: { route: String(data.route) }, create: { route: String(data.route), title: String(data.title), description: String(data.description), canonical: String(data.canonical), ogImage: String(data.ogImage), indexable: !!data.indexable && !!next.published }, update: { title: String(data.title), description: String(data.description), canonical: String(data.canonical), ogImage: String(data.ogImage), indexable: !!data.indexable && !!next.published } });
        if (publish && resource === "redes-sociais") await tx.socialLink.upsert({ where: { channel: String(data.channel).toUpperCase() as "FACEBOOK" }, create: { channel: String(data.channel).toUpperCase() as "FACEBOOK", url: String(data.url) || null, active: !!data.visible && !!next.published, order: Number(data.order) }, update: { url: String(data.url) || null, active: !!data.visible && !!next.published, order: Number(data.order) } });
        await tx.siteSetting.upsert({ where: { key }, create: { key, value: json(next) }, update: { value: json(next) } });
        await tx.auditLog.create({ data: { userId: user.id, action: publish ? "CONTENT_PUBLISHED" : "DRAFT_SAVED", entity: resource, recordId: id } });
        return id!;
    }, { timeout: 30000 });
}
export async function removeDocument(user: AdminIdentity, resource: Resource, id: string, revision: number) {
    authorize(user, resource);
    if (!definitions[resource].deletable) throw new CmsError("Este registro não pode ser excluído. Desative ou despublique.");
    if (resource === "usuarios") {
        if (id === user.id) throw new CmsError("Sua própria conta não pode ser excluída nesta sessão.");
        await getDatabase().$transaction(async tx => {
            await tx.$queryRaw`SELECT pg_advisory_xact_lock(72836491)::text`;
            const target = await tx.user.findUnique({ where: { id } });
            if (!target || target.updatedAt.getTime() !== revision) throw new CmsError("Usuário alterado. Atualize.", 409);
            if (target.active && target.role === "OWNER" && await tx.user.count({ where: { role: "OWNER", active: true } }) <= 1) throw new CmsError("O último OWNER ativo não pode ser excluído.");
            await tx.user.delete({ where: { id } });
            await tx.auditLog.create({ data: { userId: user.id, action: "USER_DELETED", entity: "User", recordId: id } });
        }); return;
    }
    await getDatabase().$transaction(async tx => {
        await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext('hortoleve-cms'))::text`;
        const key = cmsKey(resource, id), row = await tx.siteSetting.findUnique({ where: { key } });
        if (!row || document(row.value).revision !== revision) throw new CmsError("Registro alterado. Atualize.", 409);
        const doc = document(row.value);
        if (doc.published && resource !== "midia") throw new CmsError("Despublique antes de excluir.");
        if (resource === "categorias" && await tx.product.count({ where: { categoryId: id } })) throw new CmsError("A categoria possui produtos vinculados.");
        const tokens = [id, ...(resource === "midia" ? [String(doc.draft.src)] : [])];
        const others = await tx.siteSetting.findMany({ where: { key: { startsWith: "cms:", not: key } } });
        if (others.some(other => hasReference(other.value, tokens))) throw new CmsError("Registro referenciado por outro conteúdo. Remova os vínculos primeiro.");
        if (resource === "produtos") { if (await tx.contactLead.count({ where: { productId: id } })) throw new CmsError("Produto possui leads. Preserve o registro como rascunho."); await tx.product.deleteMany({ where: { id } }); }
        if (resource === "categorias") await tx.category.deleteMany({ where: { id } });
        // Arquivos originais e objetos S3 não são apagados: exclusão da biblioteca só após checar referências.
        await tx.siteSetting.delete({ where: { key } });
        await tx.siteSetting.upsert({ where: { key: `cms-deleted:${resource}:${id}` }, create: { key: `cms-deleted:${resource}:${id}`, value: true }, update: { value: true } });
        await tx.auditLog.create({ data: { userId: user.id, action: "CONTENT_DELETED", entity: resource, recordId: id } });
    });
}
