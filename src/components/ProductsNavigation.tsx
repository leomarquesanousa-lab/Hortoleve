"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { Category } from "@/modules/catalog/types";
import s from "./ProductsNavigation.module.css";

export function ProductsNavigation({ categories, mobile = false }: { categories: Category[]; mobile?: boolean }) {
    const [open, setOpen] = useState(false);
    const root = useRef<HTMLDivElement>(null);
    const trigger = useRef<HTMLButtonElement>(null);
    const id = useId();
    const close = () => { setOpen(false); if (mobile) root.current?.closest("details")?.removeAttribute("open"); };
    useEffect(() => {
        if (!open) return;
        const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
        document.addEventListener("pointerdown", outside);
        return () => document.removeEventListener("pointerdown", outside);
    }, [open]);
    return <div ref={root} className={mobile ? s.mobile : s.desktop}
        onPointerEnter={event => { if (!mobile && event.pointerType === "mouse" && window.matchMedia("(hover: hover)").matches) setOpen(true); }}
        onPointerLeave={event => { if (!mobile && event.pointerType === "mouse" && !root.current?.contains(document.activeElement)) setOpen(false); }}
        onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}
        onKeyDown={event => { if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); setOpen(false); trigger.current?.focus(); } }}>
        <button type="button" ref={trigger} className={s.trigger} aria-expanded={open} aria-controls={id} onClick={() => setOpen(value => !value)}>Produtos <span aria-hidden="true">{open ? "−" : "+"}</span></button>
        <div className={s.panel} id={id} hidden={!open}>
            <div className={s.top}><p>UM OLHAR PARA O SEU DESCANSO</p><Link href="/produtos" onClick={close}>Ver todos os produtos ↗</Link></div>
            <div className={s.categories}>{categories.map(category => <Link key={category.id} className={category.id === "colchoes" ? s.featured : s.category} href={"/produtos/" + category.slug} onClick={close}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={category.icon} /></svg><span>{category.name}{category.id === "colchoes" && <small>Conheça nossas cinco linhas</small>}</span><span aria-hidden="true">↗</span>
            </Link>)}</div>
        </div>
    </div>;
}
