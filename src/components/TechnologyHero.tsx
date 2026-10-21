"use client";
import { useState } from "react";
import Image from "next/image";
import type { Data } from "@/modules/cms/contracts";
import { pageDefaults } from "@/modules/content/page-defaults";
import s from "@/app/tecnologias/page.module.css";
import c from "./TechnologyHero.module.css";
export function TechnologyHero({ slides = pageDefaults.tecnologias.slides ?? [] }: { slides?: Data[] }) {
    const visible = slides.filter(slide => slide.visible !== false).slice(0, 5);
    const [selected, setSelected] = useState(0);
    const index = Math.min(selected, Math.max(0, visible.length - 1)), slide = visible[index];
    if (!slide) return null;
    const move = (delta: number) => { const next = (index + delta + visible.length) % visible.length; setSelected(next); window.dispatchEvent(new CustomEvent("hortoleve:banner", { detail: { placement: "tecnologias", index: next + 1 } })); };
    return <section className={s.hero + " " + c.hero} aria-labelledby="technology-title" aria-roledescription={visible.length > 1 ? "carrossel" : undefined} onKeyDown={event => { if (event.key === "ArrowRight") { event.preventDefault(); move(1); } if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); } }}><div className={s.heroCopy}><p className={s.eyebrow}>{String(slide.eyebrow ?? "")}</p><h1 id="technology-title">{String(slide.name)}</h1><p className={s.subtitle}>{String(slide.subtitle ?? "")}</p><p>{String(slide.text ?? "")}</p><a className={s.heroLink} href={String(slide.href)}>{String(slide.cta)}<span aria-hidden="true">↓</span></a></div>
        <figure><Image src={String(slide.src)} alt={String(slide.alt)} width={Number(slide.width)} height={Number(slide.height)} loading="eager" fetchPriority="high" sizes="(max-width:760px) 88vw,58vw" /><figcaption>{String(slide.caption ?? "")}</figcaption></figure>
        {visible.length > 1 && <nav className={c.controls} aria-label="Slides de tecnologias"><button type="button" onClick={() => move(-1)} aria-label="Slide anterior">←</button><span aria-live="polite">{index + 1} / {visible.length}</span><button type="button" onClick={() => move(1)} aria-label="Próximo slide">→</button></nav>}
    </section>;
}
