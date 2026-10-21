import Image from "next/image";
import Link from "next/link";
import { whatsappUrl } from "@/config/site";
import { productHref } from "@/modules/catalog/data";
import type { Product } from "@/modules/catalog/types";
import { ProductPlaceholder } from "./ProductPlaceholder";
import styles from "./ProductCard.module.css";
import { getPublicSnapshot } from "@/modules/cms/public";

export async function ProductCard({ product }: { product: Product }) {
    const image = product.media[0];
    const href = productHref(product);
    const contact = whatsappUrl("Olá! Gostaria de conhecer a linha " + product.name + " da Hortoleve.", (await getPublicSnapshot()).settings.whatsapp);
    return <article className={styles.card} aria-labelledby={product.id + "-title"}>
        <Link className={styles.imageLink} href={href} data-line={product.slug} aria-label={"Conhecer linha " + product.name}>
            {image ? <Image src={image.src} alt={image.alt} width={image.width} height={image.height}
                sizes="(max-width: 640px) 88vw, (max-width: 1100px) 43vw, 400px" /> : <ProductPlaceholder />}
        </Link>
        <div className={styles.content}>
            <p className={styles.label}>LINHA HORTOLEVE</p>
            <h3 id={product.id + "-title"}><Link href={href}>{product.name}</Link></h3>
            <p className={styles.description}>{product.summary}</p>
            {product.highlights.length > 0 && <ul className={styles.highlights}>
                {product.highlights.map(highlight => <li key={highlight}>{highlight}</li>)}
            </ul>}
            <div className={styles.actions}>
                <Link className={styles.primaryAction} href={href}>Conhecer linha <span aria-hidden="true">↗</span></Link>
                {contact ? <a className={styles.consult} href={contact} target="_blank" rel="noopener noreferrer"
                    aria-label={"Consultar linha " + product.name + " pelo WhatsApp"}>Consultar pelo WhatsApp</a>
                    : <Link className={styles.consult} href={"/contato?linha=" + product.slug} aria-label={"Consultar linha " + product.name}>Consultar</Link>}
            </div>
        </div>
    </article>;
}
