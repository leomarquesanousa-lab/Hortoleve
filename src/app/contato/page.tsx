import type { Metadata } from "next";
import { getPublicSnapshot, publicDocument, seoMetadata } from "@/modules/cms/public";
import { getLeadDelivery } from "@/modules/leads/delivery";
import { ApprovedContact } from "@/components/ApprovedContact";
export function generateMetadata(): Promise<Metadata> { return seoMetadata("/contato", { title: "Atendimento personalizado", description: "Conte o que procura e conheça o atendimento Hortoleve para escolher sua linha de colchões ou conversar sobre revenda.", alternates: { canonical: "/contato" } }); }
export default async function Page({searchParams}: {searchParams:Promise<{linha?:string|string[]}>}) {const query=await searchParams; return <ApprovedContact content={await publicDocument("paginas","contato")} snapshot={await getPublicSnapshot()} requestedSlug={typeof query.linha==="string"?query.linha:undefined} available={getLeadDelivery()!==null}/>;}
