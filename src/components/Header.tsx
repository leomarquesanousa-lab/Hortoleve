"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { categories } from "@/modules/catalog/data";
import { ProductsNavigation } from "./ProductsNavigation";
import { BrandLogo } from "./BrandLogo";
import styles from "./site.module.css";
const links = [["/tecnologias", "Tecnologias"], ["/sobre", "A Hortoleve"], ["/contato", "Contato"]];
export function Header() {
    const [compact, setCompact] = useState(false);
    useEffect(() => {
        let frame = 0;
        const update = () => { frame = 0; setCompact(window.scrollY > 60); };
        const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(frame); };
    }, []);
    return <div className={styles.headerShell}><header className={styles.header} data-compact={compact}><Link className={styles.brand} href="/" aria-label="Hortoleve — início"><BrandLogo /></Link><nav className={styles.desktopNav} aria-label="Principal"><ProductsNavigation categories={categories} />{links.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}</nav><Link className={styles.headerContact} href="/contato">Vamos conversar ↗</Link><details className={styles.mobileNav} onKeyDown={event => { if (event.key === "Escape") { event.preventDefault(); event.currentTarget.open = false; event.currentTarget.querySelector("summary")?.focus(); } }}><summary>Menu</summary><nav aria-label="Principal móvel" onClick={event => { if ((event.target as HTMLElement).closest("a")) event.currentTarget.closest("details")?.removeAttribute("open"); }}><ProductsNavigation categories={categories} mobile />{links.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}</nav></details></header></div>; }
