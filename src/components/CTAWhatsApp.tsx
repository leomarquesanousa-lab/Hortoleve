"use client";
import Link from "next/link";
import { usePublicConfig, publicWhatsapp } from "./PublicConfig";
import styles from "./site.module.css";
export function CTAWhatsApp({ label = "Conversar com a Hortoleve", message = "Olá! Quero conhecer melhor a Hortoleve.", lineSlug }: {
    label?: string;
    message?: string;
    lineSlug?: string;
}) {
    const { settings } = usePublicConfig();
    const href = publicWhatsapp(settings.whatsapp, message);
    return href ? <a className={styles.button} href={href} target="_blank" rel="noopener noreferrer">{label} <span aria-hidden="true">↗</span></a> : <Link className={styles.button} href={lineSlug ? "/contato?linha=" + encodeURIComponent(lineSlug) : "/contato"}>Conhecer o atendimento <span aria-hidden="true">↗</span></Link>;
}