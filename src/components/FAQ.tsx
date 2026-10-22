import { faqs } from "@/modules/content/data";
import styles from "./site.module.css";
export function FAQ({ items = faqs }: {
    items?: typeof faqs;
}) { return <div className={styles.faq}>{items.map(item => <details key={item.id}><summary>{item.question}<span aria-hidden="true">+</span></summary>{item.answer.split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</details>)}</div>; }
