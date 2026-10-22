import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categories } from "@/modules/catalog/data";
import { ProductCard } from "@/components/ProductCard";
import s from "../products.module.css";
import { getPublicSnapshot, savedRedirect, seoMetadata } from "@/modules/cms/public";
import { permanentRedirect } from "next/navigation";
import shared from "@/components/site.module.css";

type Props = { params: Promise<{ categoria: string }> };
export const instant = false;
export function generateStaticParams() { return categories.map(category => ({ categoria: category.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const slug = (await params).categoria;
    const snapshot = await getPublicSnapshot();
    const category = snapshot.categories.find(c => c.slug === slug);
    return seoMetadata("/produtos/" + slug, category ? { title: category.name, description: category.description, alternates: { canonical: "/produtos/" + category.slug } } : { title: "Categoria não encontrada", robots: { index: false } });
}
export default async function Categoria({ params }: Props) {
    const slug = (await params).categoria;
    const snapshot = await getPublicSnapshot();
    const category = snapshot.categories.find(c => c.slug === slug);
    if (!category) { const redirect = await savedRedirect("/produtos/" + slug); if (redirect) permanentRedirect(redirect); notFound(); }
    const parent = snapshot.categories.find(c => c.id === category.parentId);
    const children = snapshot.categories.filter(c => c.parentId === category.id);
    const items = snapshot.products.filter(p => p.categoryId === category.id || children.some(c => c.id === p.categoryId));
    return <div className={s.page}><nav className={s.breadcrumbs} aria-label="Navegação estrutural"><Link href="/">Início</Link><span>/</span><Link href="/produtos">Produtos</Link><span>/</span><span aria-current="page">{category.name}</span></nav>
        <header className={s.hero}><p className={s.eyebrow}>{parent ? <Link href={"/produtos/" + parent.slug}>{parent.name} / </Link> : null}PRODUTOS HORTOLEVE</p><h1>{category.name}</h1><p>{category.description}</p>{children.length > 0 && <nav className={category.id === "travesseiros" ? s.pillowLinks : undefined} aria-label={"Linhas de " + category.name}>{children.map(child => <Link className={s.inlineLink} key={child.id} href={"/produtos/" + child.slug}>{child.name} ↗</Link>)}</nav>}</header>
        {items.length ? <section aria-label={"Produtos de " + category.name} className={shared.linesGrid}>{items.map(product => <ProductCard product={product} key={product.id} />)}</section>
            : <section className={s.empty} aria-labelledby="empty-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden="true"><path d={category.icon} /></svg><div><p className={s.eyebrow}>UMA SELEÇÃO EM PREPARAÇÃO</p><h2 id="empty-title">Em breve, mais detalhes.</h2><p>Os produtos desta categoria ainda não foram cadastrados. Consulte nossa equipe para informações comerciais ou conheça as linhas de colchões já apresentadas.</p><Link className={s.inlineLink} href="/produtos/colchoes">Ver todos os colchões ↗</Link></div></section>}
        <aside className={s.consult}><div><p className={s.eyebrow}>ATENDIMENTO CONSULTIVO</p><h2>Vamos conversar sobre sua escolha?</h2></div><Link className={s.button} href="/contato">Falar com a Hortoleve ↗</Link></aside>
    </div>;
}
