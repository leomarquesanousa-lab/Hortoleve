import type { Category, Product, ProductMedia } from "./types";
import type { ProductPresentation } from "./presentations";

export const cervicalOrtoPlusCategory: Category = {
    id: "linha-cervical-orto-plus", slug: "linha-cervical-orto-plus", name: "Linha Cervical Orto Plus", parentId: "travesseiros",
    description: "Formato ergonômico com perfil ondulado, revestimento em malha e espuma soft. Conheça o Travesseiro Cervical Orto Plus.",
    icon: "M3 15Q6 5 10 11Q14 17 21 8V19H3Z",
};
const media: ProductMedia[] = [
    { id: "cervical-orto-plus-cover", src: "/travesseiros/cervicalortoplus/travesseiro_cervical_1.png", alt: "Travesseiro Cervical Orto Plus de perfil ondulado, com revestimento branco em malha e corte ilustrativo das camadas internas", width: 1536, height: 1024 },
    { id: "cervical-orto-plus-second", src: "/travesseiros/cervicalortoplus/travesseiro_cervical_2.png", alt: "Detalhes do Travesseiro Cervical Orto Plus mostrando malha, espuma soft e superfície interna perfilada", width: 1536, height: 1024 },
    { id: "cervical-orto-plus-third", src: "/travesseiros/cervicalortoplus/travesseiro_cervical_3.png", alt: "Apresentação comercial do Travesseiro Cervical Orto Plus com formato ergonômico, antiácaro, pastilhas de infravermelho e recurso magnético", width: 1536, height: 1024 },
];
export const cervicalOrtoPlusProduct: Product = {
    id: "travesseiro-cervical-orto-plus", slug: "travesseiro-cervical-orto-plus", name: "Travesseiro Cervical Orto Plus", categoryId: "linha-cervical-orto-plus",
    summary: "Perfil ondulado e formato ergonômico, com revestimento em malha, espuma soft e recursos informados de infravermelho e magnetismo.",
    description: "O Travesseiro Cervical Orto Plus apresenta perfil ondulado e formato ergonômico, com revestimento em malha e espuma soft. As artes mostram camadas internas e informam antiácaro, pastilhas de infravermelho e recurso magnético. Consulte nossa equipe para confirmar medidas e detalhes da composição.",
    highlights: ["Formato ergonômico", "Revestimento em malha", "Espuma soft", "Pastilhas de infravermelho e magnético"],
    media: [media[0]],
    specifications: [
        { label: "Tipo", value: "Travesseiro Cervical Orto Plus" },
        { label: "Formato", value: "Ergonômico, com perfil ondulado" },
        { label: "Revestimento", value: "Malha" },
        { label: "Espuma", value: "Soft" },
        { label: "Recursos informados", value: "Antiácaro, pastilhas de infravermelho e magnético" },
    ], technologyIds: [], featured: false, status: "published", isDemo: false,
};
export const cervicalOrtoPlusPresentation: ProductPresentation = {
    title: "Travesseiro Cervical Orto Plus", displayName: "Travesseiro Cervical Orto Plus",
    subtitle: "Design ergonômico, perfil ondulado e acabamento em malha para o seu descanso.",
    paragraphs: [
        "O Travesseiro Cervical Orto Plus se distingue pelo desenho ondulado e pelo formato ergonômico apresentado no material comercial. O revestimento branco em malha acompanha os contornos do produto, compondo uma apresentação discreta e refinada.",
        "A espuma soft integra a composição informada nas artes. Os cortes ilustrativos mostram as camadas internas e uma superfície verde perfilada; o material também apresenta antiácaro, pastilhas de infravermelho e recurso magnético.",
        "Nossa equipe orienta sobre os detalhes do modelo e confirma medidas, densidade, garantia e cuidados de utilização e conservação. Conheça a proposta do Cervical Orto Plus e escolha com informação e atendimento personalizado.",
    ],
    media, technicalSheetId: "cervical-orto-plus-second",
    technologies: ["Formato ergonômico", "Revestimento em malha", "Espuma soft", "Antiácaro", "Pastilhas de infravermelho", "Magnético"],
    specifications: cervicalOrtoPlusProduct.specifications,
    sizes: [{ name: "Dimensões", dimensions: "Medidas não informadas no material. Consulte nossa equipe." }],
};
