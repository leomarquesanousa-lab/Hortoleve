import Link from "next/link";
import { products, productHref } from "@/modules/catalog/data";
import { presentations } from "@/modules/catalog/presentations";
import { site, whatsappUrl } from "@/config/site";
import { BrandLogo } from "./BrandLogo";
import styles from "./Footer.module.css";

export function Footer() {
    const whatsapp = whatsappUrl("Olá! Gostaria de conhecer as linhas da Hortoleve.");
    return <footer className={styles.footer}>
        <div className={styles.inner}>
            <div className={styles.columns}>
                <div className={styles.identity}><Link className={styles.brand} href="/" aria-label="Hortoleve — início"><BrandLogo footer /></Link><p>Um novo olhar para o seu descanso. Conheça nossas linhas de colchões e encontre inspiração para o seu espaço.</p></div>
                <nav aria-labelledby="footer-institutional"><h2 id="footer-institutional">A Hortoleve</h2><Link href="/sobre">Sobre a marca</Link><Link href="/produtos">Produtos</Link><Link href="/tecnologias">Tecnologias</Link><Link href="/contato">Contato</Link></nav>
                <nav aria-labelledby="footer-lines"><h2 id="footer-lines">Nossas linhas</h2>{products.map(product => <Link href={productHref(product)} key={product.id}>{presentations[product.slug]?.displayName ?? product.name}</Link>)}</nav>
                <section className={styles.contact} aria-labelledby="footer-contact"><h2 id="footer-contact">Atendimento</h2><p>Converse com a Hortoleve para conhecer nossas linhas.</p><Link className={styles.contactLink} href="/contato">Fale com nossa equipe <span aria-hidden="true">↗</span></Link>
                    {whatsapp && <a href={whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp ↗</a>}
                    {site.email && <a href={"mailto:" + site.email}>{site.email}</a>}
                    {site.address && <address>{site.address}</address>}
                </section>
            </div>
            <div className={styles.bottom}><small>© {new Date().getFullYear()} {site.name}. Todos os direitos reservados.</small><Link href="/produtos">Explore os produtos <span aria-hidden="true">↗</span></Link></div>
        </div>
    </footer>;
}
