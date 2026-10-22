import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/ProductGallery";
import { CTAWhatsApp } from "@/components/CTAWhatsApp";
import { ProductPresentation } from "@/components/ProductPresentation";
import { categories, products, productHref } from "@/modules/catalog/data";
import { getPublicSnapshot, savedRedirect, seoMetadata } from "@/modules/cms/public";
import { permanentRedirect } from "next/navigation";
import s from "@/components/site.module.css";
import pageStyles from "../../products.module.css";

export const instant = false;
type Props = { params: Promise<{ categoria: string; slug: string }> };
async function resolveProduct(categorySlug: string, slug: string) {
    const snapshot = await getPublicSnapshot();
    const category = snapshot.categories.find(c => c.slug === categorySlug);
    const product = snapshot.products.find(p => p.slug === slug && p.categoryId === category?.id);
    if (!category || !product) return;
    const sameCategory = snapshot.products.filter(p => p.id !== product.id && (p.categoryId === category.id || (category.parentId && snapshot.categories.some(c => c.id === p.categoryId && c.parentId === category.parentId))));
    const related = sameCategory.length ? sameCategory : snapshot.products.filter(p => p.id !== product.id && p.featured).slice(0, 3);
    return { category, product, presentation: snapshot.presentations[product.slug], presentations: snapshot.presentations, related };
}
export function generateStaticParams() {
    return products.map(product => ({ categoria: categories.find(category => category.id === product.categoryId)!.slug, slug: product.slug }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { categoria, slug } = await params;
    const resolved = await resolveProduct(categoria, slug);
    if (!resolved) return { title: "Produto não encontrado", robots: { index: false } };
    const { product, presentation } = resolved;
    const cover = presentation?.media[0] ?? product.media[0];
    const title = (presentation?.title ?? product.name).replaceAll("⁺", "+");
    const description = presentation?.subtitle ?? product.summary;
    return seoMetadata(productHref(product), { title, description, alternates: { canonical: productHref(product) }, robots: { index: false, follow: false },
        openGraph: { title, description, url: productHref(product), ...(cover ? { images: [{ url: cover.src, width: cover.width, height: cover.height, alt: cover.alt }] } : {}) } });
}
export default async function ProductPage({ params }: Props) {
    const { categoria, slug } = await params;
    const resolved = await resolveProduct(categoria, slug);
    if (!resolved) { const redirect = await savedRedirect(`/produtos/${categoria}/${slug}`); if (redirect) permanentRedirect(redirect); notFound(); }
    const { product, category, presentation, related, presentations } = resolved;
    return <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Product", name: product.name.replaceAll("⁺", "+"), description: product.summary, image: (presentation?.media ?? product.media).map(image => new URL(image.src, "https://hortoleve.com.br").href), brand: { "@type": "Brand", name: "Hortoleve" }, category: category.name }).replace(/</g, "\\u003c") }} />
        {presentation ? <ProductPresentation product={product} presentation={presentation} />
            : <section className={s.section}><nav aria-label="Navegação estrutural" className={s.breadcrumbs}><Link href="/">Início</Link> / <Link href="/produtos">Produtos</Link> / <Link href={"/produtos/" + category.slug}>{category.name}</Link> / <span aria-current="page">{product.name}</span></nav>
                <div className={s.detail}><ProductGallery media={product.media} /><div><span className={s.status}>{category.name} Hortoleve</span><h1>{product.name}</h1><p>{product.summary}</p>{product.description !== product.summary && <p>{product.description}</p>}
                    {product.highlights.length > 0 && <ul>{product.highlights.map(item => <li key={item}>{item}</li>)}</ul>}
                    {product.specifications.length > 0 && <dl>{product.specifications.map(spec => <div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}</dl>}
                    <CTAWhatsApp lineSlug={product.slug} message={"Olá! Gostaria de conhecer " + product.name + " da Hortoleve."} />
                </div></div>
            </section>}
        {related.length > 0 && <aside className={pageStyles.related} aria-labelledby="related-title"><h2 id="related-title">Conheça também</h2><nav aria-label={related.every(item => item.categoryId === category.id) ? "Outros produtos de " + category.name : "Outros produtos Hortoleve"}>{related.map(item => <Link key={item.id} href={productHref(item)}>{presentations[item.slug]?.displayName ?? item.name} ↗</Link>)}</nav></aside>}
    </>;
}
