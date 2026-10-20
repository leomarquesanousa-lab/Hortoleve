import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { whatsappUrl } from "@/config/site";
import { comparisonAttributes, getTechnologyComparison } from "@/modules/catalog/technology-comparison";
import { TechnologyExplorer } from "./TechnologyExplorer";
import s from "./page.module.css";

export const metadata: Metadata = { title: "Tecnologias Hortoleve", description: "Explore materiais, massagem, iluminação e conectividade das linhas Hortoleve. Compare os recursos informados por modelo e versão.", alternates: { canonical: "/tecnologias" } };

const images = {
    layers: { src: "/tecnologia/Tecnologias Hortoleve_ Conforto Inteligente.png", width: 1672, height: 941, alt: "Representação conceitual de colchão em camadas separadas, com legendas de materiais e recursos integrados" },
    engineering: { src: "/tecnologia/Smart Mattress Technology Showcase.png", width: 1536, height: 1024, alt: "Diagrama conceitual de colchão com detalhes ilustrados de motores, iluminação, controle e conectividade" },
    integrated: { src: "/tecnologia/cromoterapia e massagem.png", width: 1672, height: 941, alt: "Ilustração conceitual de colchão com pontos de vibração, iluminação colorida e controle" },
};
const structure = [
    ["Pillow top e revestimentos", "A camada de contato e os tecidos participam da sensação de toque e do acabamento. Pillow, bordado e revestimento variam conforme a linha."],
    ["Espumas e densidades", "Densidades, combinações e características das espumas influenciam a resposta do conjunto. Densidade não é sinônimo de maciez."],
    ["Estruturas perfiladas", "O perfilado apresenta uma superfície com relevos. O nome Rabatan aparece nos materiais comerciais de linhas selecionadas; posição e composição exigem a ficha de cada modelo."],
    ["Sistemas de massagem", "Motores produzem vibração controlada nos modelos equipados. Quantidades, modos e controles devem ser conferidos por versão."],
    ["Recursos integrados", "Iluminação, som e conectividade podem compor o produto. A presença de um recurso na ilustração não indica disponibilidade em todas as linhas."],
];

export default function Tecnologias() {
    const comparison = getTechnologyComparison();
    const contact = whatsappUrl("Olá! Gostaria de conhecer as tecnologias das linhas Hortoleve.");
    return <div className={s.page}>
        <section className={s.hero} aria-labelledby="technology-title"><div className={s.heroCopy}><p className={s.eyebrow}>MATERIAIS · DESIGN · TECNOLOGIA</p><h1 id="technology-title">Tecnologias Hortoleve</h1><p className={s.subtitle}>A inovação por trás de cada experiência de conforto.</p><p>Um olhar sobre materiais e recursos que dão identidade às nossas linhas.</p><a className={s.heroLink} href="#engenharia">Explore a estrutura <span aria-hidden="true">↓</span></a></div>
            <figure><Image {...images.layers} alt={images.layers.alt} loading="eager" fetchPriority="high" sizes="(max-width: 760px) 88vw, 58vw" /><figcaption>Vista explodida conceitual. As camadas ilustradas não representam a construção certificada de um modelo.</figcaption></figure>
        </section>

        <section className={s.section} id="engenharia" aria-labelledby="engineering-title"><p className={s.eyebrow}>01 / ENGENHARIA DO CONFORTO</p><h2 id="engineering-title">Conheça a estrutura por trás do conforto</h2><div className={s.engineering}>
            <figure className={s.blueprint}><Image {...images.engineering} alt={images.engineering.alt} sizes="(max-width: 760px) 88vw, 48vw" /><figcaption>Diagrama ilustrativo, em tratamento visual de blueprint. As legendas e interfaces da arte são conceituais; não constituem especificações, comprovação de efeitos ou funções disponíveis.</figcaption></figure>
            <dl className={s.structure}>{structure.map(([title, text], index) => <div key={title}><dt><span aria-hidden="true">0{index + 1}</span>{title}</dt><dd>{text}</dd></div>)}</dl>
        </div></section>

        <section className={s.section} id="massagem" aria-labelledby="interactive-title"><p className={s.eyebrow}>02 / EXPLORE OS RECURSOS</p><h2 id="interactive-title">Tecnologia que acompanha o seu descanso</h2><div className={s.interactive}>
            <figure><Image {...images.integrated} alt={images.integrated.alt} sizes="(max-width: 760px) 88vw, 48vw" /><figcaption>Representação conceitual. Luzes, pontos de massagem e interface não documentam um produto ou aplicativo real.</figcaption></figure>
            <div id="cromoterapia"><TechnologyExplorer /></div>
        </div></section>

        <section className={s.section} id="colchao-ideal" aria-labelledby="comparison-title"><p className={s.eyebrow}>03 / TECNOLOGIAS POR LINHA</p><h2 id="comparison-title">Encontre a tecnologia ideal para você</h2><p className={s.intro}>Compare os dados comerciais cadastrados. Recursos e acessórios podem variar por versão; “A confirmar” indica informação ainda não documentada na apresentação dos produtos.</p>
            <div className={s.tableScroll} role="region" aria-label="Comparação das cinco linhas; role horizontalmente para consultar todas as colunas" tabIndex={0}><table className={s.comparison}><caption>Características informadas das linhas Hortoleve</caption><thead><tr><th scope="col">Característica</th>{comparison.map(line => <th scope="col" key={line.slug}><Link href={"/produtos/colchoes/" + line.slug}>{line.name} ↗</Link></th>)}</tr></thead><tbody>{comparisonAttributes.map((attribute, index) => <tr key={attribute}><th scope="row">{attribute}</th>{comparison.map(line => <td key={line.slug}>{line.values[index]}</td>)}</tr>)}</tbody></table></div>
            <p className={s.note}>As ilustrações não foram usadas para confirmar recursos. Consulte a equipe sobre composição exata, versões, acessórios e disponibilidade.</p>
        </section>

        <aside className={s.closing} aria-label="Conheça as linhas Hortoleve"><p className={s.eyebrow}>UMA ESCOLHA COM INFORMAÇÃO</p><p className={s.closingTitle}>Descubra qual linha Hortoleve combina com você.</p><div className={s.actions}><Link href="/produtos">Conhecer nossas linhas ↗</Link><a href={contact ?? "/contato"} {...(contact ? { target: "_blank", rel: "noopener noreferrer" } : {})}>Falar com um consultor ↗</a></div></aside>
    </div>;
}
