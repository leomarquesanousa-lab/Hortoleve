import Link from "next/link";
import s from "@/components/site.module.css";
export default function NotFound() { return <section className={s.section}><p className={s.eyebrow}>PÁGINA NÃO ENCONTRADA</p><h1>Vamos encontrar<br />outro caminho.</h1><p>A página que você procura não está disponível.</p><Link className={s.textLink} href="/produtos">Explorar os produtos ↗</Link></section>; }
