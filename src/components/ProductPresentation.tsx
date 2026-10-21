import Link from "next/link";
import { getPublicSnapshot } from "@/modules/cms/public";
import { whatsappUrl } from "@/config/site";
import type { Product } from "@/modules/catalog/types";
import type { ProductPresentation as Presentation } from "@/modules/catalog/presentations";
import { ProductGallery } from "./ProductGallery";
import s from "./ProductPresentation.module.css";

const icons = ["M4 8Q8 2 12 8T20 8M4 16Q8 10 12 16T20 16", "M4 5H20V19H4ZM4 10H20M9 5V19M15 5V19", "M6 5V13A6 6 0 0 0 18 13V5M6 9H9M15 9H18", "M4 18V14M9 18V11M14 18V8M19 18V5", "M8 3H16L18 21H6ZM10 8H14M10 13H14", "M3 12Q12 0 21 12Q12 24 3 12ZM12 3Q0 12 12 21Q24 12 12 3", "M8 4Q2 12 8 20M12 7Q8 12 12 17M16 10Q14 12 16 14", "M12 3V6M12 18V21M3 12H6M18 12H21M6 6L8 8M16 16L18 18M6 18L8 16M16 8L18 6M16 12A4 4 0 1 1 8 12A4 4 0 1 1 16 12", "M12 3L20 6V12Q20 18 12 21Q4 18 4 12V6ZM8 12L11 15L16 9", "M4 7H20V18H4ZM4 11H20M8 7V11M16 7V11"];

export async function ProductPresentation({ product, presentation: p }: { product: Product; presentation: Presentation }) {
    const { categories, settings } = await getPublicSnapshot();
    const category = categories.find(item => item.id === product.categoryId);
    const name = p.displayName ?? product.name;
    const contact = whatsappUrl("Olá! Gostaria de consultar sobre a Linha " + name + ".", settings.whatsapp);
    const sheet = p.media.find(image => image.id === p.technicalSheetId);
    return <article className={s.page}>
        <nav className={s.breadcrumbs} aria-label="Navegação estrutural"><Link href="/">Início</Link><span>/</span><Link href="/produtos">Produtos</Link><span>/</span>{category && <><Link href={"/produtos/" + category.slug}>{category.name}</Link><span>/</span></>}<span>/</span><span aria-current="page">{name}</span></nav>
        <div className={s.introduction}>
            <ProductGallery media={p.media} interactive />
            <div className={s.copy}><p className={s.eyebrow}>HORTOLEVE · LINHAS DE COLCHÕES</p><h1>{p.title}</h1><p className={s.subtitle}>{p.subtitle}</p>
                {p.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
                <a className={s.contact} href={contact ?? "/contato?linha=" + product.slug} {...(contact ? { target: "_blank", rel: "noopener noreferrer" } : {})}>Consultar sobre a Linha {name}<span aria-hidden="true">↗</span></a>
            </div>
        </div>
        <section className={s.section} aria-labelledby="technologies-title"><p className={s.eyebrow}>ACABAMENTO & RECURSOS</p><h2 id="technologies-title">Tecnologias da linha</h2>
            <ul className={s.technologies}>{p.technologies.map((name, index) => <li key={name}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={p.technologyIcons?.[name] ?? icons[index % icons.length]} /></svg><span>{name}</span></li>)}</ul>
        </section>
        <div className={s.technicalLayout}>
            <section aria-labelledby="specifications-title"><p className={s.eyebrow}>EM CADA DETALHE</p><h2 id="specifications-title">Especificações técnicas</h2>
                <table className={s.specifications}><caption>Dados técnicos da Linha {name}</caption><tbody>{p.specifications.map(spec => <tr key={spec.label}><th scope="row">{spec.label}</th><td>{spec.value}</td></tr>)}</tbody></table>
            </section>
            {sheet && <section className={s.sheet} aria-labelledby="sheet-title"><h2 id="sheet-title">Ficha técnica ilustrada</h2><p>Consulte a apresentação completa e amplie para ver os detalhes.</p><ProductGallery media={[sheet]} interactive compact /></section>}
        </div>
        <section className={s.section} aria-labelledby="sizes-title"><p className={s.eyebrow}>ENCONTRE A SUA MEDIDA</p><h2 id="sizes-title">Tamanhos da linha</h2>
            <ul className={s.sizes}>{p.sizes.map(size => <li key={size.name}><span className={s.bed} aria-hidden="true" /><h3>{size.name}</h3><p>{size.dimensions}</p></li>)}</ul>
        </section>
    </article>;
}
