import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/config/site";
import { products, getProduct } from "@/modules/catalog/data";
import { presentations } from "@/modules/catalog/presentations";
import { getLeadDelivery } from "@/modules/leads/delivery";
import { ContactJourney } from "./ContactJourney";
import s from "./page.module.css";

export const metadata: Metadata = { title: "Atendimento personalizado", description: "Conte o que procura e conheça o atendimento Hortoleve para escolher sua linha de colchões ou conversar sobre revenda.", alternates: { canonical: "/contato" } };
export default async function Contato({ searchParams }: { searchParams: Promise<{ linha?: string | string[] }> }) {
    const params = await searchParams;
    const requested = typeof params.linha === "string" ? getProduct(params.linha) : undefined;
    const lines = products.map(product => ({ slug: product.slug, name: presentations[product.slug]?.displayName ?? product.name, ...product.media[0] }));
    const available = getLeadDelivery() !== null;
    const whatsapp = site.whatsapp && /^\d{10,15}$/.test(site.whatsapp) ? "https://wa.me/" + site.whatsapp : null;
    return <div className={s.page}>
        <header className={s.intro}><p className={s.eyebrow}>ATENDIMENTO HORTOLEVE</p><h1>Uma experiência de atendimento à altura do seu conforto.</h1><p>Conte-nos o que você procura. Nossa equipe está pronta para ajudar você a encontrar a solução ideal.</p>
            <div className={s.introNote}><p>Uma conversa sobre suas preferências, com atenção a cada detalhe.</p>{!available && <p>O canal de recebimento ainda está em configuração. Você pode preparar e revisar sua solicitação, mas o envio permanece indisponível.</p>}<Link href="/produtos">Conheça nossas linhas ↗</Link></div>
        </header>
        <ContactJourney key={requested?.slug ?? "general"} lines={lines} initialLine={requested?.slug ?? null} available={available} whatsapp={whatsapp} />
    </div>;
}
