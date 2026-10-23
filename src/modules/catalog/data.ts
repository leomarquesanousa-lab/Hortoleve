import type { Category, Product } from "./types";
import { divanCategory, divanProduct } from "./divan.ts";
import { houseCategory, houseProduct } from "./house.ts";
import { viscoelasticoCategory, viscoelasticoProduct } from "./viscoelastico.ts";
import { futureCategory, futureProduct } from "./future.ts";
import { cervicalOrtoPlusCategory, cervicalOrtoPlusProduct } from "./cervical-orto-plus.ts";
import { eliteAzulProduct } from "./elite-azul.ts";
import { eliteCinzaProduct } from "./elite-cinza.ts";
import { corpoWhiteProduct, corpoMagneticoProduct } from "./corpo.ts";
import { sensePro, dream, boxTatameElegance, boxTatameJapones } from "./novas-linhas.ts";
import { complementos } from "./complementos.ts";
import { withStorageImages } from "./storage-images.ts";
export const categories: Category[] = [
    { id: "colchoes", name: "Colchões", slug: "colchoes", description: "Conheça nossas cinco linhas e explore diferentes propostas de conforto, acabamento e tecnologia.", icon: "M3 9H21V19H3ZM3 13H21M6 9V5H18V9" },
    { id: "linha-a-vacuo", parentId: "colchoes", name: "Linha a Vácuo", slug: "linha-a-vacuo", description: "Conheça a Linha a Vácuo Hortoleve: acabamento refinado, recursos para o descanso e apresentação em embalagem compacta.", icon: "M5 4H19V20H5ZM9 8L12 11L15 8M9 16L12 13L15 16" },
    { id: "camas-box", name: "Camas Box", slug: "camas-box", description: "Bases e camas box para compor o quarto: explore os modelos e seus acabamentos.", icon: "M3 9H21V18H3ZM5 18V21M19 18V21M3 12H21" },
    { id: "cabeceiras", name: "Cabeceiras", slug: "cabeceiras", description: "Design e acabamento para a composição do quarto. Consulte nossa equipe enquanto preparamos a seleção oficial.", icon: "M4 21V6Q4 3 7 3H17Q20 3 20 6V21M4 16H20M9 4V16M15 4V16" },
    { id: "travesseiros", name: "Travesseiros", slug: "travesseiros", description: "Conheça o espaço dedicado aos travesseiros Hortoleve. Explore a Linha Viscoelástico e consulte os detalhes de materiais e recursos.", icon: "M4 6Q12 3 20 6Q18 12 20 18Q12 21 4 18Q6 12 4 6Z" },
    { id: "poltronas", name: "Poltronas", slug: "poltronas", description: "Uma categoria para ampliar as possibilidades do seu ambiente. Conheça as linhas Divan e House e suas opções de acabamento e recursos para o descanso.", icon: "M6 11V6Q6 3 9 3H15Q18 3 18 6V11M3 10H7V17H17V10H21V20H3ZM6 20V22M18 20V22" },
    divanCategory,
    houseCategory,
    viscoelasticoCategory,
    futureCategory,
    cervicalOrtoPlusCategory,
    { id: "vibro-car", name: "Automotivo", slug: "vibro-car", description: "Conheça o Vibro Car e suas versões para uso no carro, em cadeiras e poltronas.", icon: "M4 10L6 5H18L20 10M3 10H21V18H3ZM5 18V21M19 18V21M6 14H8M16 14H18" },
    { id: "dream-pet", name: "Pet", slug: "dream-pet", description: "Conheça a Dream Pet e os materiais e recursos apresentados para o descanso de cães e gatos.", icon: "M7 15Q12 8 17 15Q22 21 16 21L12 19L8 21Q2 21 7 15ZM5 7V10M10 3V7M15 3V7M20 7V10" },
];
// Descrições e destaques fornecidos pelo cliente para a apresentação das linhas.
const lines = [
    { slug: "recover-mais", name: "Colchão Recovery⁺", image: "/recover+/1.png", width: 1536, height: 1024,
        summary: "Linha especial com conforto refrescante, massagem e cromoterapia.",
        highlights: ["Tecido Refresh gelado e refrescante", "8 motores · 20 tipos de massagem", "30 cm · pillow americano", "Cromoterapia"] },
    { slug: "diamond", name: "Diamond", image: "/diamond/1.png", width: 1536, height: 1024,
        summary: "Linha topo de linha com conforto superior e recursos tecnológicos exclusivos.",
        highlights: ["35 cm · pillow europeu/americano", "Cromoterapia lateral", "Som Bluetooth", "Carregador por indução e USB"] },
    { slug: "elegance", name: "Elegance", image: "/elegance/1.png", width: 1536, height: 1024,
        summary: "Sofisticação, conforto e tecnologia integrados em uma linha elegante.",
        highlights: ["30 cm · pillow americano bordado", "Cromos LCD", "6 motores · 20 massagens", "Integração com Alexa"] },
    { slug: "majestic", name: "Majestic", image: "/majestic/3.png", width: 1536, height: 1024,
        summary: "Linha sofisticada com toque ultra macio e recursos terapêuticos avançados.",
        highlights: ["30 cm · pillow americano ultra macio", "Densidade progressiva", "Massagem", "Infravermelho longo"] },
    { slug: "comfort", name: "Comfort Massageador", image: "/confort/2.png", width: 1536, height: 1024,
        summary: "Uma linha que combina conforto, tecnologia e materiais selecionados, com espuma D33 + HR, camada terapêutica D40 e recursos magnéticos e de infravermelho longo.",
        highlights: ["100% espuma D33 + HR", "Camada terapêutica D40", "Magnético + infravermelho longo"] },
];
export const sourceProducts: Product[] = [...lines.map((line): Product => ({
    id: line.slug, slug: line.slug, name: line.name, categoryId: "colchoes",
    summary: line.summary, highlights: line.highlights,
    description: line.summary,
    media: [{ id: line.slug + "-cover", src: line.image, alt: line.slug === "recover-mais" ? "Colchão Recovery+ Hortoleve em quarto ambientado" : "Colchão da linha " + line.name + " Hortoleve em quarto ambientado", width: line.width, height: line.height ?? 1672 }],
    specifications: [], technologyIds: [], featured: true, status: "draft", isDemo: false,
})), eliteAzulProduct, eliteCinzaProduct, divanProduct, houseProduct, viscoelasticoProduct, futureProduct, cervicalOrtoPlusProduct, corpoWhiteProduct, corpoMagneticoProduct, sensePro.product, dream.product, boxTatameElegance.product, boxTatameJapones.product, ...complementos.map(item => item.product)];
export const products = withStorageImages(sourceProducts);
export function getProduct(slug: string) { return products.find(product => product.slug === slug); }
export function getCategory(slug: string) { return categories.find(category => category.slug === slug); }
export function getCategoryProducts(categoryId: string) { return products.filter(product => product.categoryId === categoryId || categories.some(category => category.parentId === categoryId && category.id === product.categoryId)); }
export function productHref(product: Product) {
    const category = product.categorySlug ? { slug: product.categorySlug } : categories.find(item => item.id === product.categoryId);
    if (!category) throw new Error("Categoria de produto não cadastrada");
    return "/produtos/" + category.slug + "/" + product.slug;
}
