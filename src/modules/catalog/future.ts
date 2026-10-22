import type { Category, Product, ProductMedia } from "./types";
import type { ProductPresentation } from "./presentations";

export const futureCategory: Category = {
    id: "linha-future", slug: "linha-future", name: "Linha Future", parentId: "travesseiros",
    description: "Travesseiro em espuma soft, com revestimento em malha e cerâmica Future. Explore os materiais e recursos apresentados da linha.",
    icon: "M4 6Q12 3 20 6Q18 12 20 18Q12 21 4 18Q6 12 4 6Z",
};
const media: ProductMedia[] = [
    { id: "future-cover", src: "/travesseiros/future/travesseiro_future_1.png", alt: "Travesseiro Future com revestimento branco em malha e apresentação ilustrada da espuma verde perfilada e dos componentes internos", width: 1536, height: 1024 },
    { id: "future-second", src: "/travesseiros/future/travesseiro_future_2.png", alt: "Travesseiro Future em cama ambientada, com revestimento em malha e espuma soft perfilada em destaque", width: 1536, height: 1024 },
    { id: "future-third", src: "/travesseiros/future/travesseiro_future_3.png", alt: "Ficha comercial do Travesseiro Future com detalhe da espuma perfilada, pastilhas de infravermelho, recurso magnético e cerâmica Future", width: 1536, height: 1024 },
];
export const futureProduct: Product = {
    id: "travesseiro-future", slug: "travesseiro-future", name: "Travesseiro Future", categoryId: "linha-future",
    summary: "Revestimento em malha e espuma soft em uma composição que reúne cerâmica Future, pastilhas de infravermelho e recurso magnético.",
    description: "O Travesseiro Future combina revestimento em malha, espuma soft e uma composição interna apresentada com superfície verde perfilada. O material comercial informa antiácaro, pastilhas de infravermelho, recurso magnético e cerâmica Future. Consulte nossa equipe para confirmar medidas e detalhes da composição.",
    highlights: ["Revestimento em malha", "Espuma soft", "Cerâmica Future", "Pastilhas de infravermelho e magnético"],
    media: [media[0]],
    specifications: [
        { label: "Tipo", value: "Travesseiro Future" },
        { label: "Revestimento", value: "Malha" },
        { label: "Espuma", value: "Soft" },
        { label: "Composição apresentada", value: "Espuma perfilada e cerâmica Future" },
        { label: "Recursos informados", value: "Antiácaro, pastilhas de infravermelho e magnético" },
    ], technologyIds: [], featured: false, status: "published", isDemo: false,
};
export const futurePresentation: ProductPresentation = {
    title: "Travesseiro Future", displayName: "Travesseiro Future",
    subtitle: "Malha, espuma soft e cerâmica Future em uma proposta dedicada ao descanso.",
    paragraphs: [
        "O Travesseiro Future reúne acabamento branco em malha e espuma soft em uma apresentação de linhas discretas. As imagens mostram a composição interna com superfície verde perfilada, valorizando os detalhes do produto.",
        "A cerâmica Future é um dos diferenciais informados no material comercial, acompanhada de pastilhas de infravermelho, recurso magnético e antiácaro. Materiais e recursos compõem a proposta da linha para os seus momentos de descanso.",
        "Conheça os detalhes com nossa equipe e confirme medidas, densidade, garantia e orientações de utilização e conservação antes de escolher seu Future.",
    ],
    media, technicalSheetId: "future-third",
    technologies: ["Revestimento em malha", "Espuma soft", "Antiácaro", "Pastilhas de infravermelho", "Magnético", "Cerâmica Future"],
    specifications: futureProduct.specifications,
    sizes: [{ name: "Dimensões", dimensions: "Medidas não informadas no material. Consulte nossa equipe." }],
};
