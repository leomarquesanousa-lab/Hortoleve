"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { Category } from "@/modules/catalog/types";
import { categoryNavigation, type CategoryNode } from "@/modules/catalog/navigation";
import s from "./ProductsNavigation.module.css";
import { usePublicConfig } from "./PublicConfig";

// Share the same grace period at every menu level; re-entry and focus cancel it.
function useMenuClose() {
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const cancel = () => { if (timer.current !== null) clearTimeout(timer.current); timer.current = null; };
    useEffect(() => () => { if (timer.current !== null) clearTimeout(timer.current); }, []);
    const schedule = (close: () => void) => { cancel(); timer.current = setTimeout(() => { timer.current = null; close(); }, 250); };
    return { cancel, schedule };
}

export function ProductsNavigation({ categories, mobile = false }: { categories: Category[]; mobile?: boolean }) {
    const [open, setOpen] = useState(false);
    const closing = useMenuClose();
    const root = useRef<HTMLDivElement>(null);
    const trigger = useRef<HTMLButtonElement>(null);
    const id = useId();
    const { products } = usePublicConfig();
    const tree = categoryNavigation(categories, products);
    const close = () => { closing.cancel(); setOpen(false); if (mobile) root.current?.closest("details")?.removeAttribute("open"); };
    useEffect(() => {
        if (!open) return;
        const position = () => root.current?.style.setProperty("--menu-top", (root.current.getBoundingClientRect().bottom - 1) + "px");
        position();
        window.addEventListener("resize", position);
        window.addEventListener("scroll", position, { passive: true });
        const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
        document.addEventListener("pointerdown", outside);
        return () => { document.removeEventListener("pointerdown", outside); window.removeEventListener("resize", position); window.removeEventListener("scroll", position); };
    }, [open]);
    return <div ref={root} className={mobile ? s.mobile : s.desktop}
        onPointerEnter={event => { closing.cancel(); if (!mobile && event.pointerType === "mouse" && window.matchMedia("(hover: hover)").matches) setOpen(true); }}
        onFocusCapture={closing.cancel}
        onPointerLeave={event => { if (!mobile && event.pointerType === "mouse") closing.schedule(() => { if (!root.current?.contains(document.activeElement)) setOpen(false); }); }}
        onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}
        onKeyDown={event => { if (event.key === "Escape") { closing.cancel(); event.preventDefault(); event.stopPropagation(); setOpen(false); trigger.current?.focus(); } }}>
        <button type="button" ref={trigger} className={s.trigger} aria-expanded={open} aria-controls={id} onClick={event => { closing.cancel(); setOpen(value => !mobile && event.detail > 0 && window.matchMedia("(hover: hover)").matches ? true : !value); }}>Produtos <span aria-hidden="true">{open ? "−" : "+"}</span></button>
        <div className={s.panel} id={id} hidden={!open}>
            <div className={s.top}><p>UM OLHAR PARA O SEU DESCANSO</p><Link href="/produtos" onClick={close}>Ver todos os produtos ↗</Link></div>
            <div className={s.categories}>{tree.map(node => <CategoryBranch key={node.category.id} node={node} mobile={mobile} close={close} />)}</div>
        </div>
    </div>;
}

function CategoryBranch({ node, mobile, close }: { node: CategoryNode; mobile: boolean; close: () => void }) {
    const [expanded, setExpanded] = useState(false);
    const closing = useMenuClose();
    const id = useId();
    const root = useRef<HTMLDivElement>(null);
    const icon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={node.category.icon} /></svg>;
    return <div ref={root} className={s.branch} onPointerEnter={event => { closing.cancel(); if (!mobile && event.pointerType === "mouse") setExpanded(true); }}
        onFocusCapture={closing.cancel}
        onPointerLeave={event => { if (!mobile && event.pointerType === "mouse") closing.schedule(() => { if (!root.current?.contains(document.activeElement)) setExpanded(false); }); }}
        onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setExpanded(false); }}
        onKeyDown={event => { if (event.key === "Escape" && expanded) { closing.cancel(); event.preventDefault(); event.stopPropagation(); setExpanded(false); root.current?.querySelector("button")?.focus(); } }}>
        {node.children.length || node.models.length ? <><button type="button" className={s.category} aria-expanded={expanded} aria-controls={id} onClick={event => { closing.cancel(); setExpanded(value => !mobile && event.detail > 0 && window.matchMedia("(hover: hover)").matches ? true : !value); }}>{icon}<span>{node.label}</span><span aria-hidden="true">{mobile && expanded ? "−" : "›"}</span></button>
            <div id={id} className={s.subpanel} hidden={!expanded}><Link className={s.all} href={"/produtos/" + node.category.slug} onClick={close}>{node.category.id === "poltronas" ? "Todas as poltronas" : node.category.id === "travesseiros" ? "Todos os travesseiros" : "Ver todos em " + node.label} ↗</Link>
                {node.children.map(child => <CategoryBranch key={child.category.id} node={child} mobile={mobile} close={close} />)}
                {node.models.map(model => <Link key={model.href} className={s.category} href={model.href} onClick={close}><span>{model.label}</span><span aria-hidden="true">↗</span></Link>)}
            </div></> : <Link className={node.category.id === "colchoes" ? s.featured : s.category} href={"/produtos/" + node.category.slug} onClick={close}>{icon}<span>{node.label}</span><span aria-hidden="true">↗</span></Link>}
    </div>;
}
