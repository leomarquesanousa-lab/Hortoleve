import Image from "next/image";
import Link from "next/link";
import { HomeHero } from "./HomeHero";
import { ProductCard } from "./ProductCard";
import { FAQ } from "./FAQ";
import { CTAWhatsApp } from "./CTAWhatsApp";
import type { Data } from "@/modules/cms/contracts";
import type { HeroSlide } from "@/modules/cms/hero-defaults";
import type { Product } from "@/modules/catalog/types";
import s from "./site.module.css";
export function CmsHome({ data, products }: { data: Data; products: Product[] }) {
    const sections = (data.sections ?? []) as Data[];
    return <><HomeHero slides={(data.banners ?? []) as HeroSlide[]} />{sections.map((section, i) => {
        const items = (section.items ?? []) as Data[];
        return <section key={i} className={section.type === "atendimento" ? s.cta : s.section}><p className={s.eyebrow}>{String(section.eyebrow ?? "")}</p><h2>{String(section.title)}</h2>{!!section.image && <Image src={String(section.image)} alt={String(section.title)} width={900} height={600} sizes="(max-width:760px) 88vw, 50vw" style={{ maxWidth: "100%", height: "auto", borderRadius: 12 }} />}{!!section.text && <p style={{ whiteSpace: "pre-line", margin: "18px 0", lineHeight: 1.8 }}>{String(section.text)}</p>}
            {section.type === "linhas" && <div className={s.linesGrid}>{products.filter(p => p.featured).map(p => <ProductCard key={p.id} product={p} />)}</div>}
            {section.type === "faq" ? <FAQ items={items.map((item, n) => ({ id: String(n), question: String(item.title), answer: String(item.text) }))} /> : !!items.length && <div className={s.experienceGrid}>{items.map((item, n) => <article className={s.experience} key={n}><h3>{String(item.title)}</h3><p>{String(item.text)}</p></article>)}</div>}
            {section.type === "atendimento" ? <CTAWhatsApp label={String(section.cta || "Conversar com a Hortoleve")} /> : !!section.href && <Link className={s.textLink} href={String(section.href)}>{String(section.cta || "Conhecer")} ↗</Link>}
        </section>;
    })}</>;
}
