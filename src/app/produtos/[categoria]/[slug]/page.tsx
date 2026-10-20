import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/ProductGallery";
import { CTAWhatsApp } from "@/components/CTAWhatsApp";
import { ProductPresentation } from "@/components/ProductPresentation";
import { categories, getCategory, getCategoryProducts, getProduct, products, productHref } from "@/modules/catalog/data";
import { presentations } from "@/modules/catalog/presentations";
import s from "@/components/site.module.css";
import pageStyles from "../../products.module.css";

export const instant = false;
type Props = { params: Promise<{ categoria: string; slug: string }> };
function resolveProduct(categorySlug: string, slug: string) {
    const category = getCategory(categorySlug);
    const product = getProduct(slug);
    return category && product?.categoryId === category.id ? { category, product } : undefined;
}
export function generateStaticParams() {
    return products.map(product => ({ categoria: categories.find(category => category.id === product.categoryId)!.slug, slug: product.slug }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { categoria, slug } = await params;
    const resolved = resolveProduct(categoria, slug);
    if (!resolved) return { title: "Produto não encontrado", robots: { index: false } };
    const { product } = resolved;
    const presentation = presentations[product.slug];
    const cover = presentation?.media[0] ?? product.media[0];
    const title = presentation?.title ?? product.name;
    const description = presentation?.subtitle ?? product.summary;
    return { title, description, alternates: { canonical: productHref(product) }, robots: { index: false, follow: false },
        openGraph: { title, description, url: productHref(product), ...(cover ? { images: [{ url: cover.src, width: cover.width, height: cover.height, alt: cover.alt }] } : {}) } };
}
export default async function ProductPage({ params }: Props) {
    const { categoria, slug } = await params;
    const resolved = resolveProduct(categoria, slug);
    if (!resolved) notFound();
    const { product, category } = resolved;
    const presentation = presentations[product.slug];
    const related = getCategoryProducts(category.id).filter(item => item.id !== product.id);
    return <>
        {presentation ? <ProductPresentation product={product} presentation={presentation} />
            : <section className={s.section}><nav aria-label="Navegação estrutural" className={s.breadcrumbs}><Link href="/">Início</Link> / <Link href="/produtos">Produtos</Link> / <Link href={"/produtos/" + category.slug}>{category.name}</Link> / <span aria-current="page">{product.name}</span></nav>
                <div className={s.detail}><ProductGallery media={product.media} /><div><span className={s.status}>{category.name} Hortoleve</span><h1>{product.name}</h1><p>{product.summary}</p>{product.description !== product.summary && <p>{product.description}</p>}
                    {product.highlights.length > 0 && <ul>{product.highlights.map(item => <li key={item}>{item}</li>)}</ul>}
                    {product.specifications.length > 0 && <dl>{product.specifications.map(spec => <div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}</dl>}
                    <CTAWhatsApp lineSlug={product.slug} message={"Olá! Gostaria de conhecer " + product.name + " da Hortoleve."} />
                </div></div>
            </section>}
        {related.length > 0 && <aside className={pageStyles.related} aria-labelledby="related-title"><h2 id="related-title">Conheça também</h2><nav aria-label={"Outros produtos de " + category.name}>{related.map(item => <Link key={item.id} href={productHref(item)}>{presentations[item.slug]?.displayName ?? item.name} ↗</Link>)}</nav></aside>}
    </>;
}
