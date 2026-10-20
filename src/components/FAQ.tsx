import { faqs } from "@/modules/content/data";
import styles from "./site.module.css";
export function FAQ({ items = faqs }: {
    items?: typeof faqs;
}) { return <div className={styles.faq}>{items.map(item => <details key={item.id}><summary>{item.question}<span aria-hidden="true">+</span></summary><p>{item.answer}</p></details>)}</div>; }
