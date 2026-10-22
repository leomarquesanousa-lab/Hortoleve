import { products } from "./data";
import { presentations } from "./presentations";

// A comparação usa somente conteúdo comercial já registrado no catálogo.
export function getTechnologyComparison(catalog = { products, presentations }) {
    const { products, presentations } = catalog;
    return products.filter(product => product.categoryId === "colchoes").map(product => {
        const detail = presentations[product.slug];
        const technologies = detail?.technologies ?? [];
        const specification = (term: string) => detail?.specifications.find(item => item.label.toLowerCase().includes(term))?.value;
        const highlight = (term: string) => product.highlights.find(item => item.toLowerCase().includes(term));
        const massage = highlight("motores") ?? (technologies.includes("Massageador") || highlight("massagem") ? "Declarado na linha" : "A confirmar");
        const connectivity = [
            highlight("bluetooth"),
            ...technologies.filter(item => /som embutido|controle cromos/i.test(item)),
            ...(detail?.paragraphs.some(text => text.includes("Kit Therapy") && text.includes("Alexa")) ? ["Alexa Echo na versão Kit Therapy"] : []),
        ].filter(Boolean).join(" · ") || "A confirmar";
        return {
            slug: product.slug,
            name: detail?.displayName ?? product.name,
            values: [
                specification("altura") ?? product.highlights.find(text => /^\d+ cm/.test(text))?.split(" · ")[0] ?? "A confirmar",
                specification("conforto") ?? "A confirmar",
                massage,
                highlight("cromoterapia") ?? (technologies.includes("Cromoterapia") ? "Declarada na linha" : "A confirmar"),
                connectivity,
                highlight("indução") ?? (technologies.includes("Carregador de Indução") ? "Declarado na linha" : "A confirmar"),
                highlight("D33") ? "D33 + HR · camada D40 · acabamento D28" : "A confirmar",
                product.highlights.join("; "),
            ],
        };
    });
}

export const comparisonAttributes = ["Altura", "Nível de conforto", "Sistema massageador", "Cromoterapia", "Controles e conectividade", "Carregamento por indução", "Composição da espuma", "Destaques informados"];
