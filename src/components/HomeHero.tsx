"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import s from "./HomeHero.module.css";

const slides = [
    { src: "/majestic/4.png", name: "O descanso em um novo nível", eyebrow: "O SEU TEMPO DE DESCANSAR", text: "Conforto, sofisticação e tecnologia em colchões de alto padrão.", cta: "Conheça nossos produtos", href: "/produtos", kind: "photo", alt: "Colchão Majestic cinza em ambiente sofisticado, com iluminação acolhedora e acabamento bordado" },
    { src: "/tecnologia/Tecnologias Hortoleve_ Conforto Inteligente.png", name: "Tecnologia em cada detalhe", eyebrow: "INOVAÇÃO & CONFORTO", text: "Conheça os materiais e recursos que dão identidade às nossas linhas.", cta: "Explorar tecnologias", href: "/tecnologias", kind: "technology", alt: "Vista explodida conceitual de colchão Hortoleve, com camadas, materiais e recursos tecnológicos ilustrados" },
    { src: "/elegance/1.png", name: "Elegância para o seu descanso", eyebrow: "ACABAMENTO QUE ENCANTA", text: "Linhas exclusivas com acabamento premium, inovação e design sofisticado.", cta: "Ver colchões", href: "/produtos/colchoes", kind: "photo", alt: "Colchão Elegance com laterais Azul Royal em quarto sofisticado de tons naturais" },
];
function subscribeMotion(callback: () => void) {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    media.addEventListener("change", callback);
    return () => media.removeEventListener("change", callback);
}
function reducedMotion() { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }

export function HomeHero() {
    const [active, setActive] = useState(0);
    const [paused, setPaused] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const reduced = useSyncExternalStore(subscribeMotion, reducedMotion, () => true);
    const rotating = !paused && !hovered && !focused && !reduced;
    useEffect(() => {
        if (!rotating) return;
        const timer = window.setInterval(() => { if (!document.hidden) setActive(index => (index + 1) % slides.length); }, 6000);
        return () => window.clearInterval(timer);
    }, [rotating]);
    const select = (index: number) => { setPaused(true); setActive((index + slides.length) % slides.length); };

    return <section className={s.hero} role="region" aria-roledescription="carrossel" aria-label="Destaques Hortoleve" tabIndex={0}
        onPointerEnter={event => { if (event.pointerType === "mouse") setHovered(true); }} onPointerLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
        onKeyDown={event => {
            if (event.key === "ArrowRight") { event.preventDefault(); select(active + 1); }
            if (event.key === "ArrowLeft") { event.preventDefault(); select(active - 1); }
            if (event.key === "Home") { event.preventDefault(); select(0); }
            if (event.key === "End") { event.preventDefault(); select(slides.length - 1); }
        }}>
        <h1 className={s.srOnly}>Hortoleve — tecnologia, conforto e sofisticação para o seu descanso</h1>
        <div className={s.stage} onPointerDown={() => setPaused(true)}>
            {slides.map((slide, index) => <div className={s.slide} key={slide.src} data-active={active === index} data-kind={slide.kind} aria-hidden={active !== index} inert={active !== index} role="group" aria-roledescription="slide" aria-label={(index + 1) + " de 3: " + slide.name}>
                <div className={s.copy}><p className={s.eyebrow}>{slide.eyebrow}</p><h2>{slide.name}</h2><p className={s.description}>{slide.text}</p><Link className={s.cta} href={slide.href}>{slide.cta}<span aria-hidden="true">↗</span></Link></div>
                <div className={s.media}><Image src={slide.src} alt={slide.alt} fill sizes="(max-width: 760px) 100vw, (max-width: 1280px) 58vw, 742px" loading={index === 0 ? "eager" : "lazy"} fetchPriority={index === 0 ? "high" : "auto"} /></div>
            </div>)}
        </div>
        <div className={s.controls}>
            <div className={s.navigation}>
                <button type="button" onClick={() => select(active - 1)} aria-label="Banner anterior"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true"><path d="M12 5L7 10L12 15" /></svg></button>
                <div className={s.dots} role="group" aria-label="Escolher banner">{slides.map((slide, index) => <button key={slide.src} type="button" aria-label={"Exibir banner " + (index + 1) + ": " + slide.name} aria-pressed={active === index} onClick={() => select(index)}><span /></button>)}</div>
                <button type="button" onClick={() => select(active + 1)} aria-label="Próximo banner"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true"><path d="M8 5L13 10L8 15" /></svg></button>
                {!reduced && <button type="button" className={s.rotation} onClick={() => setPaused(value => !value)} aria-label={paused ? "Retomar rotação automática ao sair do carrossel" : "Pausar rotação automática"} title={paused ? "Retomar rotação" : "Pausar rotação"}><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">{paused ? <path d="M7 5L14 10L7 15Z" /> : <path d="M7 5V15M13 5V15" />}</svg></button>}
            </div>
            <p className={s.caption}>{active === 1 ? "Representação tecnológica conceitual · recursos variam por linha." : "HORTOLEVE · CONFORTO EM CADA DETALHE"}</p>
        </div>
        <span className={s.srOnly} aria-live={rotating ? "off" : "polite"}>{active + 1} de 3 · {slides[active].name}</span>
    </section>;
}
