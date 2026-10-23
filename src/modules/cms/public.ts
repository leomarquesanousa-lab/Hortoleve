import "server-only";
import { withStorageImages } from "../catalog/storage-images";
import { cache } from "react";
import { connection } from "next/server";
import type { Metadata } from "next";
import { getDatabase } from "@/modules/admin/database";
import { products as originalProducts, categories as originalCategories } from "@/modules/catalog/data";
import { presentations as originalPresentations, type ProductPresentation } from "@/modules/catalog/presentations";
import type { Product, Category, ProductMedia } from "@/modules/catalog/types";
import { site } from "@/config/site";
import { socialChannels, type SocialChannel } from "@/config/social";
import type { Data, Resource } from "./contracts";
import type { Document } from "./repository";
import { lines } from "./validation";

export interface Snapshot { enabled: boolean; products: Product[]; categories: Category[]; presentations: Partial<Record<string, ProductPresentation>>; settings: typeof site & Data; socials: SocialChannel[]; documents: Document[] }
export function toProduct(id: string, d: Data): Product {
    d = withStorageImages(d);
    const gallery = (d.gallery ?? []) as ProductMedia[];
    const media = d.cardImage ? [{ id: id + "-cover", src: String(d.cardImage), alt: String(d.cardAlt || d.name), width: Number(d.cardWidth) || gallery[0]?.width || 900, height: Number(d.cardHeight) || gallery[0]?.height || 600 }] : gallery;
    return { id, categoryId: String(d.categoryId), slug: String(d.slug), name: String(d.name), summary: String(d.summary), description: String(d.description), highlights: [...lines(d.highlights), ...lines(d.benefits), ...lines(d.materials)], technologyIds: lines(d.technologyIds), featured: d.featured === true, media, specifications: (d.specifications ?? []) as Product["specifications"], status: "published", isDemo: false };
}
export function toPresentation(d: Data): ProductPresentation | undefined {
    d = withStorageImages(d);
    if (!d.title) return;
    const details = (d.technologyDetails ?? []) as Data[];
    return { ...(d.displayName ? { displayName: String(d.displayName) } : {}), title: String(d.title), subtitle: String(d.subtitle ?? ""), paragraphs: lines(d.paragraphs).length ? lines(d.paragraphs) : [String(d.description)], media: (d.gallery ?? []) as ProductMedia[], technicalSheetId: String(d.technicalSheetId ?? ""), technologies: lines(d.technologies), technologyIcons: Object.fromEntries(details.filter(t => t.icon).map(t => [String(t.name), String(t.icon)])), technologyDescriptions: Object.fromEntries(details.filter(t => t.description).map(t => [String(t.name), String(t.description)])), specifications: (d.specifications ?? []) as ProductPresentation["specifications"], sizes: (d.sizes ?? []) as ProductPresentation["sizes"] };
}
export const getPublicSnapshot = cache(async (): Promise<Snapshot> => {
    const fallback: Snapshot = { enabled: false, products: originalProducts, categories: originalCategories, presentations: originalPresentations, settings: { ...site }, socials: socialChannels, documents: [] };
    if (process.env.CMS_PUBLIC_ENABLED !== "true") return fallback;
    await connection();
    try {
        const db = getDatabase();
        if ((await db.siteSetting.findUnique({ where: { key: "cms-import-completed" } }))?.value !== true) return fallback;
        const documents = (await db.siteSetting.findMany({ where: { key: { startsWith: "cms:" } } })).map(r => withStorageImages(r.value as unknown as Document)).filter(d => d.published).map(d => ({ ...d, draft: {}, published: d.published }));
        const entries = (resource: Resource) => documents.filter(d => d.resource === resource).sort((a, b) => Number(a.published?.order ?? 0) - Number(b.published?.order ?? 0));
        const categories: Category[] = entries("categorias").map(d => ({ id: d.id, ...(d.published!.parentId ? { parentId: String(d.published!.parentId) } : {}), slug: String(d.published!.slug), name: String(d.published!.name), description: String(d.published!.description ?? ""), icon: String(d.published!.icon ?? "M3 9H21V19H3Z"), image: String(d.published!.image ?? "") }));
        const products = entries("produtos").map(d => toProduct(d.id, d.published!)).filter(p => categories.some(c => c.id === p.categoryId)).map(p => ({ ...p, categorySlug: categories.find(c => c.id === p.categoryId)!.slug }));
        const presentations: Snapshot["presentations"] = {};
        for (const d of entries("produtos")) {
            const p = toPresentation(d.published!);
            if (p) {
                const ids = lines(d.published!.technologyIds);
                const technologies = ids.flatMap(id => entries("tecnologias").filter(t => t.id === id));
                if (ids.length) p.technologies = technologies.map(t => String(t.published!.name));
                p.technologyDescriptions = { ...Object.fromEntries(technologies.map(t => [String(t.published!.name), String(t.published!.description ?? "")])), ...p.technologyDescriptions };
                presentations[String(d.published!.slug)] = p;
            }
        }
        const settings = { ...site, ...entries("configuracoes")[0]?.published } as Snapshot["settings"];
        settings.analytics = entries("analytics")[0]?.published ?? null;
        const socials = entries("redes-sociais").map(d => ({ id: d.published!.channel as SocialChannel["id"], name: String(d.published!.name), url: String(d.published!.url || "") || null, order: Number(d.published!.order), visible: d.published!.visible === true }));
        return { enabled: true, products, categories, presentations, settings, socials, documents };
    } catch { console.error("Conteúdo CMS indisponível; apresentação aprovada preservada."); return fallback; }
});
export async function publicDocument(resource: Resource, slug?: string) { return (await getPublicSnapshot()).documents.find(d => d.resource === resource && (!slug || d.published?.slug === slug))?.published ?? null; }
export async function seoMetadata(route: string, fallback: Metadata): Promise<Metadata> {
    const snapshot = await getPublicSnapshot();
    const seo = withStorageImages(snapshot.documents.find(d => d.resource === "seo" && d.published?.route === route)?.published);
    const product = withStorageImages(snapshot.documents.find(d => d.resource === "produtos" && snapshot.products.some(p => p.id === d.id && `/produtos/${p.categorySlug}/${p.slug}` === route))?.published);
    const base = seo ? { ...fallback, title: String(seo.title), description: String(seo.description), alternates: { canonical: String(seo.canonical || route) }, robots: { index: !!seo.indexable && snapshot.settings.indexingEnabled, follow: !!seo.indexable && snapshot.settings.indexingEnabled }, openGraph: { ...fallback.openGraph, title: String(seo.title), description: String(seo.description), url: route, ...(seo.ogImage ? { images: [{ url: String(seo.ogImage) }] } : {}) } } : fallback;
    if (!product?.seoTitle && !product?.seoDescription && !product?.seoImage) return base;
    return { ...base, ...(product.seoTitle ? { title: String(product.seoTitle) } : {}), ...(product.seoDescription ? { description: String(product.seoDescription) } : {}), openGraph: { ...base.openGraph, ...(product.seoTitle ? { title: String(product.seoTitle) } : {}), ...(product.seoDescription ? { description: String(product.seoDescription) } : {}), ...(product.seoImage ? { images: [{ url: String(product.seoImage) }] } : {}) } };
}
export async function savedRedirect(from: string) {
    if (!(await getPublicSnapshot()).enabled) return null;
    // Resolve cadeias sem permitir ciclos ou destinos externos.
    let current = from; const seen = new Set<string>();
    for (let i = 0; i < 10; i++) { if (seen.has(current)) return null; seen.add(current); const r = await getDatabase().siteSetting.findUnique({ where: { key: "redirect:" + current } }); const to = (r?.value as Data)?.to; if (typeof to !== "string" || !to.startsWith("/produtos/")) break; current = to; }
    return current !== from ? current : null;
}
