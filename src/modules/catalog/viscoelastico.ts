import type { Category, Product, ProductMedia } from "./types";
import type { ProductPresentation } from "./presentations";

export const viscoelasticoCategory: Category = {
    id: "linha-viscoelastico", slug: "linha-viscoelastico", name: "Linha Viscoelástico", parentId: "travesseiros",
    description: "Travesseiro de espuma viscoelástica firme, com revestimento branco e superfície texturizada. Conheça os recursos informados da Linha Viscoelástico.",
    icon: "M4 6Q12 3 20 6Q18 12 20 18Q12 21 4 18Q6 12 4 6Z",
};
const media: ProductMedia[] = [
    { id: "viscoelastico-cover", src: "/travesseiros/viscoelastico/travesseiro_viscoelastico_1.png", alt: "Travesseiro Viscoelástico branco com superfície texturizada e apresentação dos recursos e materiais", width: 1536, height: 1024 },
    { id: "viscoelastico-second", src: "/travesseiros/viscoelastico/travesseiro_viscoelastico_2.png", alt: "Travesseiro Viscoelástico e embalagens em cama ambientada, com destaque para espuma viscoelástica, antiácaro e tecido branco", width: 1536, height: 1024 },
    { id: "viscoelastico-third", src: "/travesseiros/viscoelastico/travesseiro_viscoelastico_3.png", alt: "Apresentação comercial do Travesseiro Viscoelástico com revestimento branco, espuma firme, pastilhas de infravermelho e recurso magnético", width: 1536, height: 1024 },
];
export const viscoelasticoProduct: Product = {
    id: "travesseiro-viscoelastico", slug: "travesseiro-viscoelastico", name: "Travesseiro Viscoelástico", categoryId: "linha-viscoelastico",
    summary: "Espuma viscoelástica firme e revestimento branco em uma apresentação texturizada, com recursos informados de antiácaro, infravermelho e magnetismo.",
    description: "O Travesseiro Viscoelástico combina espuma viscoelástica firme, revestimento em tecido branco e superfície texturizada. O material comercial informa antiácaro, pastilhas de infravermelho e recurso magnético. Consulte nossa equipe para confirmar medidas, densidade, composição detalhada e orientações de conservação.",
    highlights: ["Espuma viscoelástica firme", "Revestimento em tecido branco", "Antiácaro", "Pastilhas de infravermelho e magnético"],
    media: [media[0]],
    specifications: [
        { label: "Tipo", value: "Travesseiro viscoelástico" },
        { label: "Espuma", value: "Viscoelástica firme" },
        { label: "Revestimento", value: "Tecido branco" },
        { label: "Superfície", value: "Texturizada, conforme fotografias" },
        { label: "Recursos informados", value: "Antiácaro, pastilhas de infravermelho e magnético" },
    ], technologyIds: [], featured: false, status: "published", isDemo: false,
};
export const viscoelasticoPresentation: ProductPresentation = {
    title: "Travesseiro Viscoelástico", displayName: "Travesseiro Viscoelástico",
    subtitle: "Textura, acabamento branco e espuma viscoelástica para compor o seu descanso.",
    paragraphs: [
        "O Travesseiro Viscoelástico apresenta uma superfície branca texturizada e formato retangular, em uma composição discreta para o espaço de descanso.",
        "A espuma viscoelástica firme e o revestimento em tecido branco são os materiais informados nas artes do produto. O material comercial também apresenta antiácaro, pastilhas de infravermelho e recurso magnético.",
        "Converse com nossa equipe para conhecer os detalhes desta linha e confirmar medidas, densidade, composição do tecido e orientações de utilização e conservação antes de escolher seu travesseiro.",
    ],
    media, technicalSheetId: "viscoelastico-cover",
    technologies: ["Espuma viscoelástica", "Espuma firme", "Revestimento em tecido branco", "Antiácaro", "Pastilhas de infravermelho", "Magnético"],
    specifications: viscoelasticoProduct.specifications,
    sizes: [{ name: "Dimensões", dimensions: "Medidas não informadas no material. Consulte nossa equipe." }],
};
