import styles from "./site.module.css";
export function SectionHeading({ eyebrow, title, description }: {
    eyebrow: string;
    title: string;
    description?: string;
}) { return <div className={styles.heading}><p className={styles.eyebrow}>{eyebrow}</p><h2>{title}</h2>{description && <p>{description}</p>}</div>; }
