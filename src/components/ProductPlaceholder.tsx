import styles from "./site.module.css";
export function ProductPlaceholder() {
    return <div className={styles.productPlaceholder}><span className={styles.placeholderMark} aria-hidden="true">H</span><span>Fotografia oficial em breve</span><small>Espaço reservado para imagem da linha</small></div>;
}
