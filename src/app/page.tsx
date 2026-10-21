import type { Metadata } from "next";
import { getPublicSnapshot, publicDocument, seoMetadata } from "@/modules/cms/public";
import { ApprovedHome } from "@/components/ApprovedHome";

export function generateMetadata(): Promise<Metadata> { return seoMetadata("/", { alternates: { canonical: "/" } }); }
export default async function Page() { const content=await publicDocument("home"); return <ApprovedHome content={content} snapshot={await getPublicSnapshot()} />; }
