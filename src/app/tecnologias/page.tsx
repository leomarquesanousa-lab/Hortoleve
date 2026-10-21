import type { Metadata } from "next";
import { getPublicSnapshot, publicDocument, seoMetadata } from "@/modules/cms/public";
import { ApprovedTechnologies } from "@/components/ApprovedTechnologies";
const defaultMetadata: Metadata = { title: "Tecnologias Hortoleve", description: "Explore materiais, massagem, iluminação e conectividade das linhas Hortoleve. Compare os recursos informados por modelo e versão.", alternates: { canonical: "/tecnologias" } };

export function generateMetadata() { return seoMetadata("/tecnologias", defaultMetadata); }
export default async function Page() { const content=await publicDocument("paginas", "tecnologias"); return <ApprovedTechnologies content={content} snapshot={await getPublicSnapshot()} />; }
