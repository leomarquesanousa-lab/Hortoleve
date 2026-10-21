"use client";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { SocialOrbit } from "./SocialOrbit";
import { PublicAnalytics } from "./PublicAnalytics";
import { PublicConfigProvider, type PublicConfig } from "./PublicConfig";

export function SiteChrome({ children, config }: { children: React.ReactNode; config?: PublicConfig }) {
    const pathname = usePathname();
    if (pathname === "/admin" || pathname?.startsWith("/admin/")) return children;
    const content = <><a className="skip-link" href="#conteudo">Pular para o conteúdo</a><Header /><main id="conteudo">{children}</main><Footer /><SocialOrbit /></>;
    return config ? <PublicConfigProvider value={config}>{content}<PublicAnalytics /></PublicConfigProvider> : content;
}
