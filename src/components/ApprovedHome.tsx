import { HomeHero } from "@/components/HomeHero";
import Link from "next/link";
import { SectionHeading } from "@/components/SectionHeading";
import { ProductCard } from "@/components/ProductCard";
import { CTAWhatsApp } from "@/components/CTAWhatsApp";
import { FAQ } from "@/components/FAQ";
import { experiences } from "@/modules/content/data";
import s from "@/components/site.module.css";
import { getPageText } from "@/modules/content/page-defaults";
import type { Data } from "@/modules/cms/contracts";
import type { Snapshot } from "@/modules/cms/public";
export function ApprovedHome({ content, snapshot }: { content: Data | null; snapshot: Snapshot }) {
    const products = snapshot.products;
    const homeProducts = products.filter(product => product.categoryId === "colchoes" && product.featured).slice(0, 5);
    const eliteAzul = products.find(product => product.id === "elite-azul" && product.categoryId === "linha-a-vacuo");
    if (eliteAzul) homeProducts.push(eliteAzul);
    const text = (key: string) => getPageText(content, "home", key);
    return <>
    <HomeHero slides={Array.isArray(content?.banners) ? content.banners as import("@/modules/cms/hero-defaults").HeroSlide[] : undefined} />
    <section className={s.section + " " + s.linesSection} aria-labelledby="lines-title"><div className={s.sectionTop}><div><p className={s.eyebrow}>{text("home-0")}</p><h2 id="lines-title">{text("home-1")}</h2></div><Link className={s.textLink} href="/produtos/colchoes">Ver todos os colchões ↗</Link></div><div className={s.linesGrid + " " + s.homeLinesGrid}>{homeProducts.map(p => <ProductCard key={p.id} product={p}/>)}</div></section>

    <section className={s.dark}><div className={s.section}><SectionHeading eyebrow={text("home-8")} title={text("home-9")} description={text("home-10")}/><div className={s.experienceGrid}>{(Array.isArray(content?.experiences) ? content.experiences as typeof experiences : experiences).map((item, index) => <article key={item.id} className={s.experience}><span className={s.eyebrow}>0{index + 1} {text("home-11")}</span><h3>{item.name}</h3><p>{item.description}</p><Link className={s.textLink} href={"/tecnologias#" + item.id}>Conhecer a proposta ↗</Link></article>)}</div>
    </div></section>
    <section className={s.section + " " + s.helpSection} aria-label={text("home-19")}><SectionHeading eyebrow={text("home-19")} title={text("home-20")}/><FAQ items={Array.isArray(content?.faq) ? content.faq as typeof import("@/modules/content/data").faqs : undefined} />
        <div className={s.helpContact}><p className={s.eyebrow}>{text("home-21")}</p><p>{text("home-23")}</p><CTAWhatsApp /></div>
    </section>
    </>;
}
