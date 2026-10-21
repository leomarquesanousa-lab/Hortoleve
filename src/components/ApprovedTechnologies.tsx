import { TechnologyHero } from "@/components/TechnologyHero";
import { getPageText, getPageImage, pageDefaults } from "@/modules/content/page-defaults";
import Link from "next/link";
import Image from "next/image";
import { whatsappUrl } from "@/config/site";
import { comparisonAttributes, getTechnologyComparison } from "@/modules/catalog/technology-comparison";
import { TechnologyExplorer } from "@/app/tecnologias/TechnologyExplorer";
import s from "@/app/tecnologias/page.module.css";
const originalImages = Object.fromEntries(pageDefaults.tecnologias.images.map(image => [image.key, image])) as Record<string, {src:string;alt:string;width:number;height:number}>;

const structure = [
    ["Pillow top e revestimentos", "A camada de contato e os tecidos participam da sensação de toque e do acabamento. Pillow, bordado e revestimento variam conforme a linha."],
    ["Espumas e densidades", "Densidades, combinações e características das espumas influenciam a resposta do conjunto. Densidade não é sinônimo de maciez."],
    ["Estruturas perfiladas", "O perfilado apresenta uma superfície com relevos. O nome Rabatan aparece nos materiais comerciais de linhas selecionadas; posição e composição exigem a ficha de cada modelo."],
    ["Sistemas de massagem", "Motores produzem vibração controlada nos modelos equipados. Quantidades, modos e controles devem ser conferidos por versão."],
    ["Recursos integrados", "Iluminação, som e conectividade podem compor o produto. A presença de um recurso na ilustração não indica disponibilidade em todas as linhas."],
];

import type { Data } from "@/modules/cms/contracts";
import type { Snapshot } from "@/modules/cms/public";
export function ApprovedTechnologies({ content, snapshot }: { content: Data | null; snapshot: Snapshot }) {
    const text = (key: string) => getPageText(content, "tecnologias", key);
    const images = Object.fromEntries(Object.entries(originalImages).map(([key,image])=>[key,getPageImage(content,key,image)])) as typeof originalImages;

    const comparison = getTechnologyComparison(snapshot);
    const contact = whatsappUrl("Olá! Gostaria de conhecer as tecnologias das linhas Hortoleve.", snapshot.settings.whatsapp);
    return <div className={s.page}>
        <TechnologyHero slides={Array.isArray(content?.slides) ? content.slides as import("@/modules/cms/contracts").Data[] : undefined} />

        <section className={s.section} id="engenharia" aria-labelledby="engineering-title"><p className={s.eyebrow}>{text("tecnologias-6")}</p><h2 id="engineering-title">{text("tecnologias-7")}</h2><div className={s.engineering}>
            <figure className={s.blueprint}><Image {...images.engineering} alt={images.engineering.alt} sizes="(max-width: 760px) 88vw, 48vw" /><figcaption>{text("tecnologias-8")}</figcaption></figure>
            <dl className={s.structure}>{structure.map(([title, body], index) => <div key={title}><dt><span aria-hidden="true">0{index + 1}</span>{getPageText(content,"tecnologias","structure-"+index+"-title") || title}</dt><dd>{getPageText(content,"tecnologias","structure-"+index+"-body") || body}</dd></div>)}</dl>
        </div></section>

        <section className={s.section} id="massagem" aria-labelledby="interactive-title"><p className={s.eyebrow}>{text("tecnologias-9")}</p><h2 id="interactive-title">{text("tecnologias-10")}</h2><div className={s.interactive}>
            <figure><Image {...images.integrated} alt={images.integrated.alt} sizes="(max-width: 760px) 88vw, 48vw" /><figcaption>{text("tecnologias-11")}</figcaption></figure>
            <div id="cromoterapia"><TechnologyExplorer content={content} /></div>
        </div></section>

        <section className={s.section} id="colchao-ideal" aria-labelledby="comparison-title"><p className={s.eyebrow}>{text("tecnologias-12")}</p><h2 id="comparison-title">{text("tecnologias-13")}</h2><p className={s.intro}>{text("tecnologias-14")}</p>
            <div className={s.tableScroll} role="region" aria-label="Comparação das cinco linhas; role horizontalmente para consultar todas as colunas" tabIndex={0}><table className={s.comparison}><caption>Características informadas das linhas Hortoleve</caption><thead><tr><th scope="col">Característica</th>{comparison.map(line => <th scope="col" key={line.slug}><Link href={"/produtos/colchoes/" + line.slug}>{line.name} ↗</Link></th>)}</tr></thead><tbody>{comparisonAttributes.map((attribute, index) => <tr key={attribute}><th scope="row">{attribute}</th>{comparison.map(line => <td key={line.slug}>{line.values[index]}</td>)}</tr>)}</tbody></table></div>
            <p className={s.note}>{text("tecnologias-15")}</p>
        </section>

        <aside className={s.closing} aria-label="Conheça as linhas Hortoleve"><p className={s.eyebrow}>{text("tecnologias-16")}</p><p className={s.closingTitle}>{text("tecnologias-17")}</p><div className={s.actions}><Link href="/produtos">Conhecer nossas linhas ↗</Link><a href={contact ?? "/contato"} {...(contact ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{text("tecnologias-18")}</a></div></aside>
    </div>;
}
