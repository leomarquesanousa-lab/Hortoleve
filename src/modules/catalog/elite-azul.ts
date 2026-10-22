import type { Product, ProductMedia } from "./types";
import type { ProductPresentation } from "./presentations";

// Artes fornecidas pelo cliente; arquivos originais preservados, todos em 3:2.
const directory = "/a vacuo/elite/azul/";
const media: ProductMedia[] = [
    { id: "elite-azul-cover", src: directory + "Quarto Luxuoso com Colchão Hortoleve Azul.png", alt: "Colchão Hortoleve Azul em quarto sofisticado, com superfície clara e acabamento lateral azul", width: 1536, height: 1024 },
    { id: "elite-azul-commercial", src: directory + "Anúncio Colchão Elite a Vácuo Linha Azul.png", alt: "Apresentação do Colchão Elite Azul com laterais em linho azul, superfície clara, embalagem a vácuo e controles", width: 1536, height: 1024 },
    { id: "elite-azul-sheet", src: directory + "Linha Azul.png", alt: "Ficha comercial da versão Linho Azul com recursos declarados e diagramas de medidas; comprimentos de Solteiro e Casal sujeitos a confirmação", width: 1536, height: 1024 },
    { id: "elite-azul-line-infographic", src: directory + "Infográfico Colchão Elite a Vácuo.png", alt: "Infográfico geral da linha Elite a Vácuo, ilustrado com colchão claro; a composição detalhada deve ser confirmada para a versão Azul", width: 1536, height: 1024 },
];

export const eliteAzulProduct: Product = {
    id: "elite-azul", slug: "elite-azul", name: "Colchão Elite Azul", categoryId: "linha-a-vacuo",
    summary: "A elegância do linho azul encontra a praticidade da apresentação a vácuo, com espuma firme, acabamento refinado e recursos integrados para o descanso.",
    description: "O Colchão Elite Azul integra a Linha a Vácuo da Hortoleve. Laterais em linho azul, superfície clara e acabamento contrastante compõem uma apresentação elegante. O material comercial informa tecido premium, espuma firme e recursos como massagem e cromoterapia, com opções de controle Life Vibro ou Cromos LCD.",
    highlights: ["Acabamento em linho azul", "Tecido premium · espuma firme", "Apresentação a vácuo", "Massagem e cromoterapia"],
    media: [media[0]],
    specifications: [
        { label: "Linha", value: "Linha a Vácuo" },
        { label: "Acabamento lateral", value: "Linho azul" },
        { label: "Espuma", value: "Firme, conforme material comercial" },
        { label: "Controles informados", value: "Life Vibro ou Cromos LCD; consultar a versão" },
    ],
    technologyIds: [], featured: false, status: "published", isDemo: false,
};

export const eliteAzulPresentation: ProductPresentation = {
    title: "Colchão Elite Azul", displayName: "Elite Azul",
    subtitle: "Linho azul, acabamento refinado e a praticidade da Linha a Vácuo.",
    paragraphs: [
        "O Colchão Elite Azul traduz a proposta da Linha a Vácuo da Hortoleve em uma composição elegante: laterais em linho azul, superfície clara e contornos contrastantes que valorizam o acabamento do produto.",
        "Tecido premium e espuma firme fazem parte da apresentação comercial. O colchão é mostrado em embalagem a vácuo, acompanhada de caixa, reunindo o visual sofisticado do modelo e uma forma compacta de apresentação.",
        "As artes da versão Azul informam sistema massageador, cromoterapia, componentes magnéticos, pastilhas de infravermelho e opções de controle Life Vibro ou Cromos LCD. A configuração e os acessórios devem ser confirmados no atendimento.",
        "O material da versão Azul também apresenta os recursos Antiácaro e Energia Quântica. Nossa equipe orienta sobre as opções de configuração e os detalhes do modelo.",
        "Disponível nas apresentações Solteiro, Casal, Queen e King. Consulte o atendimento para confirmar os comprimentos de Solteiro e Casal e a composição correspondente à versão Azul.",
    ],
    media, technicalSheetId: "elite-azul-sheet",
    technologies: ["Tecido Premium", "Espuma firme", "Acabamento em linho azul", "Massageador", "Cromoterapia", "Magnético", "Pastilhas de infravermelho", "Antiácaro", "Energia Quântica", "Controle Life Vibro ou Cromos LCD"],
    specifications: eliteAzulProduct.specifications,
    sizes: [
        { name: "Solteiro", dimensions: "0,88 m de largura · comprimento sob consulta" },
        { name: "Casal", dimensions: "1,38 m de largura · comprimento sob consulta" },
        { name: "Queen", dimensions: "1,58 x 1,98 m" },
        { name: "King", dimensions: "1,93 x 2,03 m" },
    ],
};
