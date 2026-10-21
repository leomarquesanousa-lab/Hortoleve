import type { Metadata } from "next";
import { HomeHero } from "@/components/HomeHero";
import Link from "next/link";
import { SectionHeading } from "@/components/SectionHeading";
import { ProductCard } from "@/components/ProductCard";
import { CTAWhatsApp } from "@/components/CTAWhatsApp";
import { FAQ } from "@/components/FAQ";
import { experiences } from "@/modules/content/data";
import s from "@/components/site.module.css";
import { getPublicSnapshot, publicDocument, seoMetadata } from "@/modules/cms/public";
import { CmsHome } from "@/components/CmsHome";
export function generateMetadata(): Promise<Metadata> { return seoMetadata("/", { alternates: { canonical: "/" } }); }
export default async function Home() {
    const snapshot = await getPublicSnapshot();
    const products = snapshot.products;
    const content = await publicDocument("home");
    if (content) return <CmsHome data={content} products={products} />;
    return <>
    <HomeHero />
    <section className={s.section + " " + s.linesSection} aria-labelledby="lines-title"><div className={s.sectionTop}><div><p className={s.eyebrow}>COLCHÕES HORTOLEVE</p><h2 id="lines-title">Conheça nossas linhas</h2></div><Link className={s.textLink} href="/produtos/colchoes">Ver todos os colchões ↗</Link></div><div className={s.linesGrid}>{products.filter(p => p.categoryId === "colchoes" && p.featured).map(p => <ProductCard key={p.id} product={p}/>)}</div></section>
    <div className={s.strip} aria-label="Explore a experiência"><p><span>Seu ritmo.</span>Uma escolha com tempo e atenção.</p><p><span>Seu espaço.</span>Inspiração para o seu quarto.</p><p><span>Sua escolha.</span>Conheça antes de conversar.</p></div>

    <section className={s.dark}><div className={s.section}><SectionHeading eyebrow="TECNOLOGIAS & EXPERIÊNCIAS" title="Descubra novas possibilidades." description="Recursos previstos para a evolução do site. Conheça o que está no planejamento."/><div className={s.experienceGrid}>{experiences.map((item, index) => <article key={item.id} className={s.experience}><span className={s.eyebrow}>0{index + 1} / EM PLANEJAMENTO</span><h3>{item.name}</h3><p>{item.description}</p><Link className={s.textLink} href={"/tecnologias#" + item.id}>Conhecer a proposta ↗</Link></article>)}</div></div></section>
    <section className={s.section}><div className={s.story}><div className={s.storyVisual}><span>Mais pausa.<br /><em>Mais presença.</em></span><small>HORTOLEVE</small></div><div><SectionHeading eyebrow="A HORTOLEVE" title="Espaço para uma nova história."/><p>Uma nova apresentação digital começa aqui: mais espaço para conhecer a marca, explorar os produtos e conversar sobre o descanso.</p><p>A trajetória e os marcos da Hortoleve serão apresentados após validação do conteúdo institucional.</p><Link className={s.textLink} href="/sobre">Conheça essa nova etapa ↗</Link></div></div></section>
    <section className={s.section}><SectionHeading eyebrow="PODEMOS AJUDAR?" title="Antes de escolher, descubra."/><FAQ /></section>
    <section className={s.cta}><p className={s.eyebrow}>UMA CONVERSA É UM BOM COMEÇO</p><h2>O seu próximo descanso começa com uma escolha.</h2><p>Conheça a proposta de atendimento e os próximos passos.</p><CTAWhatsApp /></section>
    </>;
}
