import Image from "next/image";
import type { Data } from "@/modules/cms/contracts";
import { CTAWhatsApp } from "./CTAWhatsApp";
import s from "@/app/sobre/page.module.css";
export function CmsPage({ data }: { data: Data }) {
    const sections = (data.sections ?? []) as Data[];
    return <article className={s.editorial}><header className={s.headline}><p className={s.eyebrow}>HORTOLEVE</p><h1>{String(data.name)}</h1>{!!data.subtitle && <p>{String(data.subtitle)}</p>}</header><section className={s.opening}><div>{sections.slice(0, 1).map((block, i) => <div key={i}><h2>{String(block.title ?? "")}</h2><p style={{ whiteSpace: "pre-line" }}>{String(block.text)}</p></div>)}</div>{!!data.image && <figure><Image src={String(data.image)} alt={String(data.name)} width={1536} height={1024} sizes="(max-width:760px) 88vw, 46vw" style={{ width: "100%", height: "auto", aspectRatio: "3/2", objectFit: "cover", borderRadius: 12 }} /></figure>}</section>{sections.slice(1).map((block, i) => <section key={i} className={s.service}><h2>{String(block.title ?? "")}</h2><p style={{ whiteSpace: "pre-line" }}>{String(block.text)}</p>{!!block.image && <Image src={String(block.image)} alt={String(block.alt || block.title)} width={900} height={600} sizes="(max-width:760px) 88vw, 50vw" style={{ maxWidth: "100%", height: "auto" }} />}</section>)}<div className={s.closing}><CTAWhatsApp /></div></article>;
}
