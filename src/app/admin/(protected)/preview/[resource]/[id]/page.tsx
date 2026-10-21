import { notFound } from "next/navigation";
import { requireAdmin } from "@/modules/admin/session";
import { authorize, listDocuments } from "@/modules/cms/repository";
import { getPublicSnapshot, toPresentation, toProduct } from "@/modules/cms/public";
import { isResource } from "@/modules/cms/contracts";
import { ProductPresentation } from "@/components/ProductPresentation";
import { ProductGallery } from "@/components/ProductGallery";
import { CmsHome } from "@/components/CmsHome";
import { CmsPage } from "@/components/CmsPage";
export const metadata = { title: "Prévia restrita", robots: { index: false, follow: false } };
export default async function Preview({ params }: { params: Promise<{ resource: string; id: string }> }) {
    const user = await requireAdmin(), { resource, id } = await params;
    if (!isResource(resource) || !["produtos", "home", "paginas"].includes(resource)) notFound();
    authorize(user, resource); const doc = (await listDocuments(resource)).find(d => d.id === id); if (!doc) notFound();
    const data = doc.draft;
    return <><p role="status">Prévia do rascunho salvo — não publicado. Navegação e CTAs levam ao site público.</p>{resource === "produtos" ? (() => { const product = toProduct(id, data), presentation = toPresentation(data); return presentation ? <ProductPresentation product={product} presentation={presentation} /> : <article><h1>{product.name}</h1><p>{product.summary}</p><ProductGallery media={product.media} /><p>{product.description}</p></article>; })() : resource === "home" ? <CmsHome data={data} products={(await getPublicSnapshot()).products} /> : <CmsPage data={data} />}</>;
}
