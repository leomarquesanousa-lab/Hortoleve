import { getPageText } from "@/modules/content/page-defaults";
import Link from "next/link";
import { ContactJourney } from "@/app/contato/ContactJourney";
import s from "@/app/contato/page.module.css";

import type { Data } from "@/modules/cms/contracts";
import type { Snapshot } from "@/modules/cms/public";
export function ApprovedContact({content,snapshot,requestedSlug,available}: {content:Data|null;snapshot:Snapshot;requestedSlug?:string;available:boolean}) {
    const { products, presentations, settings: site } = snapshot;
    const text = (key: string) => getPageText(content, "contato", key);
    const requested = typeof requestedSlug === "string" ? products.find(p => p.slug === requestedSlug) : undefined;
    const lines = products.map(product => ({ slug: product.slug, name: presentations[product.slug]?.displayName ?? product.name, ...product.media[0] }));
    const whatsapp = site.whatsapp && /^\d{10,15}$/.test(site.whatsapp) ? "https://wa.me/" + site.whatsapp : null;
    return <div className={s.page}>
        <header className={s.intro}><p className={s.eyebrow}>{text("contato-0")}</p><h1>{text("contato-1")}</h1><p>{text("contato-2")}</p>
            <div className={s.introNote}><p>{text("contato-3")}</p>{!available && <p>{text("contato-4")}</p>}<Link href="/produtos">Conheça nossas linhas ↗</Link></div>
        </header>
        <ContactJourney key={requested?.slug ?? "general"} lines={lines} initialLine={requested?.slug ?? null} available={available} whatsapp={whatsapp} />
    </div>;
}
