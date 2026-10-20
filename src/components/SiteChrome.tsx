"use client";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { SocialOrbit } from "./SocialOrbit";

export function SiteChrome({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    if (pathname === "/admin" || pathname?.startsWith("/admin/")) return children;
    return <><a className="skip-link" href="#conteudo">Pular para o conteúdo</a><Header /><main id="conteudo">{children}</main><Footer /><SocialOrbit /></>;
}
