"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { socialChannelUrl } from "@/config/social";
import { usePublicConfig, publicWhatsapp } from "./PublicConfig";
import s from "./SocialOrbit.module.css";

type Destination = { label: string; href: string | null; icon: string; external?: boolean };
const icons = {
    facebook: "M14 22V13H17L18 9H14V7Q14 5 18 5V2H15Q10 2 10 7V9H7V13H10V22",
    tiktok: "M14 3V15A5 5 0 1 1 9 10V13A2 2 0 1 0 11 15V3ZM14 3Q15 8 20 8V11Q17 11 14 9",
    instagram: "M7 3H17Q21 3 21 7V17Q21 21 17 21H7Q3 21 3 17V7Q3 3 7 3ZM16 12A4 4 0 1 1 8 12A4 4 0 1 1 16 12M17 7H17.01",
    whatsapp: "M5 19L3 22L8 21A9 9 0 1 0 5 19ZM8 7Q6 10 10 14Q14 18 17 15L14 13L12 14L10 12L11 10Z",
};

function OrbitMenu() {
    const { socials: socialChannels, settings } = usePublicConfig();
    const [open, setOpen] = useState(false);
    const [hint, setHint] = useState<string | null>(null);
    const [suppressed, setSuppressed] = useState(false);
    const root = useRef<HTMLDivElement>(null);
    const trigger = useRef<HTMLButtonElement>(null);
    const id = useId();
    const destinations: Destination[] = socialChannels.filter(channel => channel.visible).slice().sort((a, b) => a.order - b.order).map(channel => ({ label: channel.name, href: socialChannelUrl({ ...channel, url: channel.url ?? (channel.id === "whatsapp" ? publicWhatsapp(settings.whatsapp, "Olá! Gostaria de conhecer melhor a Hortoleve.") : null) }), icon: icons[channel.id], external: true }));
    destinations.push({ label: "Atendimento Personalizado", href: "/contato", icon: "M4 4H20V16H11L6 21V16H4ZM8 8H16M8 12H13" });

    useEffect(() => {
        let footerVisible = false;
        let frame = 0;
        const update = () => {
            frame = 0;
            const active = document.activeElement;
            const editing = active instanceof HTMLElement && !!active.closest("form, input, textarea, select, [contenteditable='true']");
            const menuOpen = !!document.querySelector("header details[open], header button[aria-expanded='true']");
            const blocked = footerVisible || editing || menuOpen;
            setSuppressed(blocked);
            if (blocked) setOpen(false);
        };
        const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
        const footer = document.querySelector("footer");
        const observer = new IntersectionObserver(entries => { footerVisible = entries.some(entry => entry.isIntersecting); schedule(); }, { rootMargin: "0px 0px 100px 0px" });
        if (footer) observer.observe(footer);
        const header = document.querySelector("header");
        const mutation = new MutationObserver(schedule);
        if (header) mutation.observe(header, { attributes: true, subtree: true, attributeFilter: ["open", "aria-expanded"] });
        document.addEventListener("focusin", schedule);
        document.addEventListener("focusout", schedule);
        schedule();
        return () => { observer.disconnect(); mutation.disconnect(); document.removeEventListener("focusin", schedule); document.removeEventListener("focusout", schedule); cancelAnimationFrame(frame); };
    }, []);

    useEffect(() => {
        if (!open) return;
        const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
        const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { event.preventDefault(); setOpen(false); trigger.current?.focus(); } };
        document.addEventListener("pointerdown", outside);
        document.addEventListener("keydown", escape);
        return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
    }, [open]);

    return <div ref={root} className={s.orbit} hidden={suppressed} data-open={open}
        onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}
        onKeyDown={event => {
            if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
            event.preventDefault();
            if (!open) { setOpen(true); requestAnimationFrame(() => root.current?.querySelector<HTMLElement>("[data-orbit-action]")?.focus()); return; }
            const links = Array.from(root.current?.querySelectorAll<HTMLElement>("[data-orbit-action]") ?? []);
            const index = links.indexOf(document.activeElement as HTMLElement);
            const next = event.key === "Home" ? 0 : event.key === "End" ? links.length - 1 : (index + (event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1) + links.length) % links.length;
            links[next]?.focus();
        }}>
        <button type="button" ref={trigger} className={s.trigger} aria-label={open ? "Fechar canais de atendimento Hortoleve" : "Conecte-se com a Hortoleve"} aria-expanded={open} aria-controls={id} onClick={() => setOpen(value => !value)}>
            <svg className={s.constellation} viewBox="0 0 40 40" fill="none" aria-hidden="true"><ellipse cx="20" cy="20" rx="15" ry="7" transform="rotate(-35 20 20)" /><ellipse cx="20" cy="20" rx="15" ry="7" transform="rotate(55 20 20)" /><circle cx="20" cy="20" r="3" /><circle cx="8" cy="12" r="2" /><circle cx="31" cy="27" r="2" /></svg>
            <span className={s.triggerLabel}>Conecte-se com a Hortoleve</span>
        </button>
        <nav id={id} className={s.fan} aria-label="Canais de atendimento Hortoleve" aria-hidden={!open} inert={!open}>
            {destinations.map((destination, index) => {
                const angle = destinations.length === 1 ? Math.PI / 2 : index / (destinations.length - 1) * Math.PI / 2;
                const radius = 168;
                const style = { "--x": (-Math.cos(angle) * radius).toFixed(2) + "px", "--y": (-Math.sin(angle) * radius).toFixed(2) + "px", "--delay": index * 40 + "ms" } as CSSProperties;
                const content = <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={destination.icon} /></svg><span className={s.label}>{destination.label}{!destination.href && <small>Em breve</small>}</span></>;
                const attributes = { className: s.action, style, "aria-label": destination.label + (!destination.href ? " ? Em breve" : ""), "data-hint": hint === destination.label, "data-orbit-action": true, tabIndex: open ? 0 : -1, onClick: () => setOpen(false) };
                if (!destination.href) return <button key={destination.label} {...attributes} type="button" aria-disabled="true" onClick={() => setHint(destination.label)}>{content}</button>;
                return destination.external ? <a key={destination.label} {...attributes} href={destination.href} target="_blank" rel="noopener noreferrer">{content}</a> : <Link key={destination.label} {...attributes} href={destination.href}>{content}</Link>;
            })}
        </nav>
    </div>;
}

export function SocialOrbit() {
    const pathname = usePathname();
    // O próprio fluxo de atendimento substitui o acesso flutuante nesta rota.
    if (pathname === "/contato" || pathname?.startsWith("/admin")) return null;
    return <OrbitMenu key={pathname} />;
}
