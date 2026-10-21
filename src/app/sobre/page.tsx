import { publicDocument, seoMetadata } from "@/modules/cms/public";
import { CmsPage } from "@/components/CmsPage";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CTAWhatsApp } from "@/components/CTAWhatsApp";
import s from "./page.module.css";

const defaultMetadata: Metadata = {
    title: "Quem somos — A Hortoleve",
    description: "Conheça a Hortoleve: colchões de alto padrão, materiais selecionados, tecnologia e atendimento próximo. Nossa missão, visão e valores.",
    alternates: { canonical: "/sobre" },
};

// Arquivo original preservado; dimensões nativas em proporção 3:2.
const institutionalPhoto: { src: string | null; alt: string; width: number; height: number } = {
    src: "/showroom/Luxury Bedding Showroom in Warm Green and Gold.png",
    alt: "Showroom da Hortoleve com a apresentação das linhas de colchões",
    width: 1536,
    height: 1024,
};

const values = [
    { title: "Qualidade em cada detalhe", text: "Materiais, acabamentos e características que valorizam a experiência de descanso." },
    { title: "Inovação com propósito", text: "Tecnologia para ampliar as possibilidades de conforto e personalização." },
    { title: "Compromisso com o cliente", text: "Escuta atenta para compreender necessidades e oferecer orientações adequadas." },
    { title: "Transparência e confiança", text: "Relações claras, responsáveis e duradouras com clientes e parceiros." },
    { title: "Elegância e sofisticação", text: "Conforto e design juntos para tornar o quarto um ambiente acolhedor e especial." },
];

export function generateMetadata() { return seoMetadata("/sobre", defaultMetadata); }
export default async function Sobre() {
    const content = await publicDocument("paginas", "sobre");
    if (content) return <CmsPage data={content} />;
    return <article className={s.editorial}>
        <div className={s.opening}>
            <header className={s.headline}>
                <p className={s.eyebrow}>QUEM SOMOS · HORTOLEVE</p>
                <h1>Tecnologia, conforto e sofisticação para o seu descanso.</h1>
                <p className={s.lead}>Acreditamos que uma boa noite de sono vai muito além do descanso. É um momento de renovação, equilíbrio e bem-estar.</p>
            </header>
            <figure className={s.photograph}>
                <div className={s.photoFrame}>
                    {institutionalPhoto.src ? <Image src={institutionalPhoto.src} alt={institutionalPhoto.alt}
                        width={institutionalPhoto.width} height={institutionalPhoto.height}
                        sizes="(max-width: 760px) 88vw, 44vw" />
                        : <div className={s.photoPlaceholder}><span className={s.photoRule} aria-hidden="true" /><span>Um olhar para a Hortoleve</span><small>Fotografia institucional em preparação</small></div>}
                </div>
                <figcaption>O universo Hortoleve, em cada detalhe.</figcaption>
            </figure>
        </div>

        <section className={s.continuation} aria-labelledby="essence-title">
            <p className={s.eyebrow}>A NOSSA ESSÊNCIA</p>
            <h2 id="essence-title">Cada detalhe importa.</h2>
            <p>É com essa visão que apresentamos soluções que unem conforto, inovação e sofisticação. Nossa atuação é dedicada ao universo dos colchões de alto padrão, combinando materiais selecionados, acabamentos refinados e diferentes experiências de conforto.</p>
            <p>Da escolha dos tecidos à estrutura dos colchões, valorizamos qualidade, funcionalidade e elegância. Nossas linhas incorporam recursos como massagem, cromoterapia, infravermelho longo e componentes magnéticos, além de funcionalidades inteligentes e integração com assistentes virtuais em modelos selecionados.</p>
            <p>Recover Mais, Diamond, Elegance, Majestic e Confort compõem um portfólio pensado para diferentes preferências, com identidade própria e atenção ao design, à tecnologia e ao conforto.</p>
        </section>

        <div className={s.purpose}>
            <section aria-labelledby="mission-title"><p className={s.eyebrow}>O QUE NOS MOVE</p><h2 id="mission-title">Nossa missão</h2>
                <p>Proporcionar experiências de descanso diferenciadas por meio de colchões que combinam conforto, tecnologia e sofisticação, respeitando as necessidades e preferências de cada cliente.</p>
                <p>Queremos contribuir para uma escolha bem informada, com atendimento próximo e produtos que expressem qualidade e cuidado em cada detalhe.</p>
            </section>
            <section aria-labelledby="vision-title"><p className={s.eyebrow}>PARA ONDE OLHAMOS</p><h2 id="vision-title">Nossa visão</h2>
                <p>Ser reconhecida como referência em colchões de alto padrão, pela inovação, pela apresentação sofisticada dos produtos e pela excelência no relacionamento com clientes, lojistas e parceiros comerciais.</p>
                <p>Acompanhar a evolução das tecnologias de conforto, aprimorar nossas soluções e fortalecer relações baseadas na confiança e na satisfação.</p>
            </section>
        </div>

        <section className={s.values} aria-labelledby="values-title"><p className={s.eyebrow}>PRINCÍPIOS QUE NOS GUIAM</p><h2 id="values-title">Nossos valores</h2>
            <dl>{values.map(value => <div key={value.title}><dt>{value.title}</dt><dd>{value.text}</dd></div>)}</dl>
        </section>

        <section className={s.service} aria-labelledby="service-title"><p className={s.eyebrow}>PROXIMIDADE EM CADA ESCOLHA</p><h2 id="service-title">Atendimento que valoriza você</h2>
            <p>Escolher um colchão é uma decisão importante e pessoal. Por isso, valorizamos o atendimento consultivo: ouvir suas preferências e apresentar as características, tecnologias, dimensões e diferenciais de cada linha.</p>
            <p>Também buscamos construir relações de confiança com lojistas e revendedores, oferecendo informações sobre o portfólio e seus diferenciais comerciais. Do primeiro contato à escolha do colchão, nossa proposta é uma experiência acolhedora, profissional e transparente.</p>
        </section>

        <section className={s.closing} aria-labelledby="commitment-title"><p className={s.eyebrow}>NOSSO COMPROMISSO</p><h2 id="commitment-title">O seu descanso, no centro de tudo.</h2>
            <p>Do toque dos tecidos aos recursos inteligentes presentes em determinados modelos, cada linha Hortoleve combina tecnologia, conforto e identidade própria para valorizar a experiência de cada pessoa.</p>
            <p className={s.signature}>Hortoleve. Porque descansar bem é viver melhor.</p>
            <div className={s.actions}><CTAWhatsApp /><Link href="/produtos">Conheça nossas linhas <span aria-hidden="true">↗</span></Link></div>
        </section>
    </article>;
}
