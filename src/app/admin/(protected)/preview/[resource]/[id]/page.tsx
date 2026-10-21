import { notFound } from "next/navigation";
import { requireAdmin } from "@/modules/admin/session";
import { authorize, listDocuments } from "@/modules/cms/repository";
import { getPublicSnapshot, toPresentation, toProduct } from "@/modules/cms/public";
import { isResource } from "@/modules/cms/contracts";
import { ProductPresentation } from "@/components/ProductPresentation";
import { ProductGallery } from "@/components/ProductGallery";
import { ApprovedHome } from "@/components/ApprovedHome";
import { ApprovedAbout } from "@/components/ApprovedAbout";
import { ApprovedTechnologies } from "@/components/ApprovedTechnologies";
import { ApprovedContact } from "@/components/ApprovedContact";
export const metadata = { title: "Prévia restrita", robots: { index: false, follow: false } };
export default async function Preview({ params }: { params: Promise<{ resource: string; id: string }> }) {
    const user = await requireAdmin(), { resource, id } = await params;
    if (!isResource(resource) || !["produtos", "home", "paginas"].includes(resource)) notFound();
    authorize(user, resource); const doc = (await listDocuments(resource)).find(d => d.id === id); if (!doc) notFound();
    const data = doc.draft;
    const snapshot = await getPublicSnapshot();
    return <><p role="status">Prévia restrita — não altera o site publicado. Navegação e CTAs levam ao site público.</p>{resource === "produtos" ? (() => { const product = toProduct(id, data), presentation = toPresentation(data); return presentation ? <ProductPresentation product={product} presentation={presentation} /> : <article><h1>{product.name}</h1><p>{product.summary}</p><ProductGallery media={product.media} /><p>{product.description}</p></article>; })() : resource === "home" ? <ApprovedHome content={data} snapshot={snapshot} /> : data.slug === "sobre" ? <ApprovedAbout content={data} /> : data.slug === "tecnologias" ? <ApprovedTechnologies content={data} snapshot={snapshot} /> : <ApprovedContact content={data} snapshot={snapshot} available={false} />}</>;
}
