import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { categories, getCategoryProducts } from "@/modules/catalog/data";
import s from "./products.module.css";

export const metadata: Metadata = { title: "Produtos", description: "Explore as categorias Hortoleve e conheça nossas cinco linhas de colchões, com atendimento consultivo.", alternates: { canonical: "/produtos" } };

export default function Produtos() {
    return <div className={s.page}><header className={s.hero}><p className={s.eyebrow}>UNIVERSO HORTOLEVE</p><h1>Produtos para compor<br />o seu descanso.</h1><p>Uma escolha começa com tempo, informação e atenção aos detalhes. Explore nossas categorias e conheça as linhas já apresentadas.</p></header>
        <section aria-label="Categorias de produtos" className={s.categories}>{categories.map(category => {
            const cover = getCategoryProducts(category.id)[0]?.media[0];
            return <Link className={category.id === "colchoes" ? s.featuredCategory : s.category} key={category.id} href={"/produtos/" + category.slug}>
                {cover ? <div className={s.categoryImage}><Image src={cover.src} alt={cover.alt} width={cover.width} height={cover.height} sizes="(max-width: 760px) 88vw, 38vw" /></div>
                    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={category.icon} /></svg>}
                <div className={s.categoryCopy}><p className={s.eyebrow}>{cover ? "NOSSAS CINCO LINHAS" : "EXPLORE A CATEGORIA"}</p><h2>{category.name}</h2><p>{category.description}</p><span className={s.categoryAction}>Conhecer {category.name} <span aria-hidden="true">↗</span></span></div>
            </Link>;
        })}</section>
    </div>;
}
