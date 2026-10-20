import type { Category, Product } from "./types";
export const categories: Category[] = [
    { id: "colchoes", name: "Colchões", slug: "colchoes", description: "Conheça nossas cinco linhas e explore diferentes propostas de conforto, acabamento e tecnologia.", icon: "M3 9H21V19H3ZM3 13H21M6 9V5H18V9" },
    { id: "linha-a-vacuo", name: "Linha a Vácuo", slug: "linha-a-vacuo", description: "Um espaço dedicado à Linha a Vácuo. A apresentação dos modelos será disponibilizada com o material oficial.", icon: "M5 4H19V20H5ZM9 8L12 11L15 8M9 16L12 13L15 16" },
    { id: "camas-box", name: "Camas Box", slug: "camas-box", description: "Explore a categoria de bases para compor seu espaço de descanso. Modelos e acabamentos serão apresentados após cadastramento.", icon: "M3 9H21V18H3ZM5 18V21M19 18V21M3 12H21" },
    { id: "cabeceiras", name: "Cabeceiras", slug: "cabeceiras", description: "Design e acabamento para a composição do quarto. Consulte nossa equipe enquanto preparamos a seleção oficial.", icon: "M4 21V6Q4 3 7 3H17Q20 3 20 6V21M4 16H20M9 4V16M15 4V16" },
    { id: "travesseiros", name: "Travesseiros", slug: "travesseiros", description: "Conheça o espaço dedicado aos travesseiros Hortoleve. Informações de materiais e modelos serão incluídas com o conteúdo oficial.", icon: "M4 6Q12 3 20 6Q18 12 20 18Q12 21 4 18Q6 12 4 6Z" },
    { id: "poltronas", name: "Poltronas", slug: "poltronas", description: "Uma categoria para ampliar as possibilidades do seu ambiente. A seleção de poltronas aguarda cadastro e apresentação oficial.", icon: "M6 11V6Q6 3 9 3H15Q18 3 18 6V11M3 10H7V17H17V10H21V20H3ZM6 20V22M18 20V22" },
    { id: "vibro-car", name: "Vibro Car", slug: "vibro-car", description: "Conheça a categoria Vibro Car. Consulte o atendimento para informações enquanto preparamos os detalhes oficiais do produto.", icon: "M4 10L6 5H18L20 10M3 10H21V18H3ZM5 18V21M19 18V21M6 14H8M16 14H18" },
    { id: "dream-pet", name: "Dream Pet", slug: "dream-pet", description: "Um espaço reservado à categoria Dream Pet. Modelos, fotografias e características serão apresentados após validação comercial.", icon: "M7 15Q12 8 17 15Q22 21 16 21L12 19L8 21Q2 21 7 15ZM5 7V10M10 3V7M15 3V7M20 7V10" },
];
// Descrições e destaques fornecidos pelo cliente para a apresentação das linhas.
const lines = [
    { slug: "recover-mais", name: "Recover Mais", image: "/recover+.webp", width: 941,
        summary: "Linha especial com conforto refrescante, massagem e cromoterapia.",
        highlights: ["Tecido Refresh gelado e refrescante", "8 motores · 20 tipos de massagem", "30 cm · pillow americano", "Cromoterapia"] },
    { slug: "diamond", name: "Diamond", image: "/diamond.webp", width: 941,
        summary: "Linha topo de linha com conforto superior e recursos tecnológicos exclusivos.",
        highlights: ["35 cm · pillow europeu/americano", "Cromoterapia lateral", "Som Bluetooth", "Carregador por indução e USB"] },
    { slug: "elegance", name: "Elegance", image: "/elegance.webp", width: 941,
        summary: "Sofisticação, conforto e tecnologia integrados em uma linha elegante.",
        highlights: ["30 cm · pillow americano bordado", "Cromos LCD", "6 motores · 20 massagens", "Integração com Alexa"] },
    { slug: "majestic", name: "Majestic", image: "/majestic.webp", width: 940,
        summary: "Linha sofisticada com toque ultra macio e recursos terapêuticos avançados.",
        highlights: ["30 cm · pillow americano ultra macio", "Densidade progressiva", "Massagem", "Infravermelho longo"] },
    { slug: "comfort", name: "Comfort Massageador", image: "/confort.webp", width: 941,
        summary: "Uma linha que combina conforto, tecnologia e materiais selecionados, com espuma D33 + HR, camada terapêutica D40 e recursos magnéticos e de infravermelho longo.",
        highlights: ["100% espuma D33 + HR", "Camada terapêutica D40", "Magnético + infravermelho longo"] },
];
export const products: Product[] = lines.map(line => ({
    id: line.slug, slug: line.slug, name: line.name, categoryId: "colchoes",
    summary: line.summary, highlights: line.highlights,
    description: line.summary,
    media: [{ id: line.slug + "-cover", src: line.image, alt: "Colchão da linha " + line.name + " Hortoleve em quarto ambientado", width: line.width, height: 1672 }],
    specifications: [], technologyIds: [], featured: true, status: "draft", isDemo: false,
}));
export function getProduct(slug: string) { return products.find(product => product.slug === slug); }
export function getCategory(slug: string) { return categories.find(category => category.slug === slug); }
export function getCategoryProducts(categoryId: string) { return products.filter(product => product.categoryId === categoryId); }
export function productHref(product: Product) {
    const category = categories.find(item => item.id === product.categoryId);
    if (!category) throw new Error("Categoria de produto não cadastrada");
    return "/produtos/" + category.slug + "/" + product.slug;
}
