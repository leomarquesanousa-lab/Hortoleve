import type { Metadata } from "next";
import { publicDocument, seoMetadata } from "@/modules/cms/public";
import { ApprovedAbout } from "@/components/ApprovedAbout";
const defaultMetadata: Metadata = {
    title: "Quem somos — A Hortoleve",
    description: "Conheça a Hortoleve: colchões de alto padrão, materiais selecionados, tecnologia e atendimento próximo. Nossa missão, visão e valores.",
    alternates: { canonical: "/sobre" },
};
export function generateMetadata() { return seoMetadata("/sobre", defaultMetadata); }
export default async function Page() { const content=await publicDocument("paginas", "sobre"); return <ApprovedAbout content={content} />; }
