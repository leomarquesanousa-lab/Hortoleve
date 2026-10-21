import { getPageText, getPageImage } from "@/modules/content/page-defaults";
import Image from "next/image";
import Link from "next/link";
import { CTAWhatsApp } from "@/components/CTAWhatsApp";
import s from "@/app/sobre/page.module.css";


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

import type { Data } from "@/modules/cms/contracts";
export function ApprovedAbout({ content }: { content: Data | null }) {
    const text = (key: string) => getPageText(content, "sobre", key);
    const photo = getPageImage(content, "showroom", { ...institutionalPhoto, src: institutionalPhoto.src ?? "" });

    return <article className={s.editorial}>
        <div className={s.opening}>
            <header className={s.headline}>
                <p className={s.eyebrow}>{text("sobre-0")}</p>
                <h1>{text("sobre-1")}</h1>
                <p className={s.lead}>{text("sobre-2")}</p>
            </header>
            <figure className={s.photograph}>
                <div className={s.photoFrame}>
                    {photo.src ? <Image src={photo.src} alt={photo.alt}
                        width={photo.width} height={photo.height}
                        sizes="(max-width: 760px) 88vw, 44vw" />
                        : <div className={s.photoPlaceholder}><span className={s.photoRule} aria-hidden="true" /><span>Um olhar para a Hortoleve</span><small>Fotografia institucional em preparação</small></div>}
                </div>
                <figcaption>{text("sobre-3")}</figcaption>
            </figure>
        </div>

        <section className={s.continuation} aria-labelledby="essence-title">
            <p className={s.eyebrow}>{text("sobre-4")}</p>
            <h2 id="essence-title">{text("sobre-5")}</h2>
            <p>{text("sobre-6")}</p>
            <p>{text("sobre-7")}</p>
            <p>{text("sobre-8")}</p>
        </section>

        <div className={s.purpose}>
            <section aria-labelledby="mission-title"><p className={s.eyebrow}>{text("sobre-9")}</p><h2 id="mission-title">{text("sobre-10")}</h2>
                <p>{text("sobre-11")}</p>
                <p>{text("sobre-12")}</p>
            </section>
            <section aria-labelledby="vision-title"><p className={s.eyebrow}>{text("sobre-13")}</p><h2 id="vision-title">{text("sobre-14")}</h2>
                <p>{text("sobre-15")}</p>
                <p>{text("sobre-16")}</p>
            </section>
        </div>

        <section className={s.values} aria-labelledby="values-title"><p className={s.eyebrow}>{text("sobre-17")}</p><h2 id="values-title">{text("sobre-18")}</h2>
            <dl>{values.map((value, index) => <div key={value.title}><dt>{getPageText(content,"sobre", "values-"+index+"-title") || value.title}</dt><dd>{getPageText(content,"sobre", "values-"+index+"-body") || value.text}</dd></div>)}</dl>
        </section>

        <section className={s.service} aria-labelledby="service-title"><p className={s.eyebrow}>{text("sobre-19")}</p><h2 id="service-title">{text("sobre-20")}</h2>
            <p>{text("sobre-21")}</p>
            <p>{text("sobre-22")}</p>
        </section>

        <section className={s.closing} aria-labelledby="commitment-title"><p className={s.eyebrow}>{text("sobre-23")}</p><h2 id="commitment-title">{text("sobre-24")}</h2>
            <p>{text("sobre-25")}</p>
            <p className={s.signature}>{text("sobre-26")}</p>
            <div className={s.actions}><CTAWhatsApp /><Link href="/produtos">Conheça nossas linhas <span aria-hidden="true">↗</span></Link></div>
        </section>
    </article>;
}
