import type { Metadata } from "next";
import { Suspense } from "react";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { site } from "@/config/site";
import "./globals.css";
import { SiteChrome } from "@/components/SiteChrome";
import { getPublicSnapshot, seoMetadata } from "@/modules/cms/public";
const display = Cormorant_Garamond({ variable: "--font-display", subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });
const sans = Manrope({ variable: "--font-sans", subsets: ["latin"], display: "swap" });
const defaultMetadata: Metadata = {
    icons: {
        icon: { url: "/favicom/Luxury%20Gold%20H%20Wave%20Emblem.png", type: "image/png", sizes: "1278x1230" },
        shortcut: "/favicom/Luxury%20Gold%20H%20Wave%20Emblem.png",
    },
    metadataBase: new URL(site.url), title: { default: "Hortoleve | Um novo olhar para o descanso", template: "%s | Hortoleve" }, description: site.description,
    robots: { index: site.indexingEnabled, follow: site.indexingEnabled },
    openGraph: { type: "website", locale: "pt_BR", siteName: site.name, title: "Hortoleve | Um novo olhar para o descanso", description: site.description },
};
export default function RootLayout({ children }: {
    children: React.ReactNode;
}) { return <html lang="pt-BR" className={display.variable + " " + sans.variable}><body><Suspense><PublicChrome>{children}</PublicChrome></Suspense></body></html>; }
async function PublicChrome({ children }: { children: React.ReactNode }) { const { settings, products, categories, socials, presentations } = await getPublicSnapshot(); return <SiteChrome config={{ settings, products, categories, socials, presentations }}>{children}</SiteChrome>; }
export async function generateMetadata() { const { settings } = await getPublicSnapshot(); return seoMetadata("/", { ...defaultMetadata, description: settings.description, title: { default: settings.name + " | Um novo olhar para o descanso", template: "%s | " + settings.name }, robots: { index: settings.indexingEnabled, follow: settings.indexingEnabled } }); }
