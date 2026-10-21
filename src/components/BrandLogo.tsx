"use client";
import Image from "next/image";
import { usePublicConfig } from "./PublicConfig";
import styles from "./BrandLogo.module.css";

export function BrandLogo({ footer = false }: { footer?: boolean }) {
    const { settings } = usePublicConfig();
    return <Image className={footer ? styles.footerLogo : styles.logo}
        src={String(settings.logo || "/logo/logo-offwhite.PNG")} alt="Hortoleve — O seu tempo de descansar"
        width={2172} height={724} sizes={footer ? "240px" : "(max-width: 640px) 174px, 204px"}
        loading={footer ? "lazy" : "eager"} />;
}
