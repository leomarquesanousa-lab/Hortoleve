import type { Metadata } from "next";
import { getPublicSnapshot, publicDocument, seoMetadata } from "@/modules/cms/public";
import s from "@/components/Visit.module.css";
import { ApprovedHome } from "@/components/ApprovedHome";

export function generateMetadata(): Promise<Metadata> { return seoMetadata("/", { alternates: { canonical: "/" } }); }
export default async function Page() { const content=await publicDocument("home"); return <><ApprovedHome content={content} snapshot={await getPublicSnapshot()} /><section className={s.page} aria-labelledby="visit-title"><p className={s.eyebrow}>CONFORTO NA SUA CASA</p><h2 id="visit-title">Seu descanso merece aten??o especial.</h2><p className={s.intro}>Conhe?a uma experi?ncia personalizada de conforto. Agende uma demonstra??o em sua casa com um consultor especialista.</p><a className={s.button} href="/agendar">Agendar minha visita</a></section></>; }
