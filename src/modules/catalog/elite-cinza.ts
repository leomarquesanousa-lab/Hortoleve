import type { Product, ProductMedia } from "./types";
import type { ProductPresentation } from "./presentations";

// Arquivos fornecidos pelo cliente, preservados nas dimensões originais 3:2.
const directory = "/a vacuo/elite/Cinza/";
const media: ProductMedia[] = [
    { id: "elite-cinza-cover", src: directory + "Cama Cinza.png", alt: "Colchão Hortoleve Cinza em quarto ambientado, com superfície clara e acabamento lateral cinza", width: 1536, height: 1024 },
    { id: "elite-cinza-detail", src: directory + "CINZA.png", alt: "Apresentação do Elite Cinza com detalhes do linho cinza, tecido premium, embalagem a vácuo e controles", width: 1536, height: 1024 },
    { id: "elite-cinza-sheet", src: directory + "Colchão Elite a Vácuo Hortoleve Linha cinza.png", alt: "Ficha comercial do Colchão Elite Cinza com acabamento, recursos declarados, controles e medidas", width: 1536, height: 1024 },
    { id: "elite-cinza-line-infographic", src: directory + "Infográfico Colchão Elite a Vácuo.png", alt: "Infográfico geral da linha Elite a Vácuo, ilustrado com colchão claro; a composição detalhada deve ser confirmada para a versão Cinza", width: 1536, height: 1024 },
];

export const eliteCinzaProduct: Product = {
    id: "elite-cinza", slug: "elite-cinza", name: "Colchão Elite Cinza", categoryId: "linha-a-vacuo",
    summary: "A sofisticação do linho cinza em uma composição de tons neutros, com espuma firme, acabamento refinado e a praticidade da apresentação a vácuo.",
    description: "O Colchão Elite Cinza integra a Linha a Vácuo da Hortoleve. O acabamento lateral em linho cinza e a superfície clara compõem um visual elegante e versátil. Seu material comercial informa tecido premium, espuma firme, massagem e cromoterapia, com opções de controle Life Vibro ou Cromos LCD.",
    highlights: ["Acabamento em linho cinza", "Tecido premium · espuma firme", "Apresentação a vácuo", "Massagem e cromoterapia"],
    media: [media[0]],
    specifications: [
        { label: "Linha", value: "Linha a Vácuo" },
        { label: "Acabamento lateral", value: "Linho cinza" },
        { label: "Espuma", value: "Firme, conforme material comercial" },
        { label: "Controles informados", value: "Life Vibro ou Cromos LCD; consultar a versão" },
    ],
    technologyIds: [], featured: false, status: "published", isDemo: false,
};

export const eliteCinzaPresentation: ProductPresentation = {
    title: "Colchão Elite Cinza", displayName: "Elite Cinza",
    subtitle: "Linho cinza, elegância em tons neutros e a praticidade da Linha a Vácuo.",
    paragraphs: [
        "O Colchão Elite Cinza combina a presença discreta dos tons neutros com um acabamento que valoriza a composição do quarto. As laterais em linho cinza contrastam com a superfície clara e os contornos escuros, criando um visual sóbrio e sofisticado.",
        "Integrante da Linha a Vácuo da Hortoleve, o modelo é apresentado em embalagem compacta, acompanhada de caixa. O material da versão Cinza destaca tecido premium e espuma firme, reunindo acabamento refinado e uma proposta própria para o descanso.",
        "As artes informam sistema massageador, cromoterapia, componentes magnéticos e pastilhas de infravermelho. Os controles apresentados são Life Vibro ou Cromos LCD; consulte o atendimento para confirmar a configuração e os acessórios correspondentes.",
        "Antiácaro e Energia Quântica também constam no material comercial da versão Cinza. A equipe Hortoleve orienta sobre os recursos e as opções disponíveis para o modelo.",
        "A ficha comercial apresenta os tamanhos Solteiro, Casal, Queen e King. O infográfico complementar descreve a linha Elite a Vácuo de forma geral; a composição detalhada deve ser confirmada para a versão Cinza.",
    ],
    media, technicalSheetId: "elite-cinza-sheet",
    technologies: ["Tecido Premium", "Espuma firme", "Acabamento em linho cinza", "Massageador", "Cromoterapia", "Magnético", "Pastilhas de infravermelho", "Antiácaro", "Energia Quântica", "Controle Life Vibro ou Cromos LCD"],
    specifications: eliteCinzaProduct.specifications,
    sizes: [
        { name: "Solteiro", dimensions: "0,88 x 1,88 m" },
        { name: "Casal", dimensions: "1,38 x 1,88 m" },
        { name: "Queen", dimensions: "1,58 x 1,98 m" },
        { name: "King", dimensions: "1,93 x 2,03 m" },
    ],
};
