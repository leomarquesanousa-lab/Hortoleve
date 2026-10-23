import type { Product, ProductMedia } from "./types";
import type { ProductPresentation } from "./presentations";

export function gallery(id: string, directory: string, files: { file: string; alt: string; width?: number; height?: number }[]): ProductMedia[] {
    return files.map((image, index) => ({ id: `${id}-${index + 1}`, src: directory + image.file, alt: image.alt, width: image.width ?? 1536, height: image.height ?? 1024 }));
}
const senseMedia = gallery("sense-pro", "/a vacuo/Sense Pro/", [
    { file: "colchão-sensepro1.png", alt: "Colchão Sense Pro completo em quarto ambientado, com acabamento lateral bege" },
    { file: "colchão-sensepro6.png", alt: "Apresentação do Sense Pro a vácuo em linho bege com embalagem e controles" },
    { file: "colchão-sensepro3.png", alt: "Camadas internas e tabela de quantidade de pastilhas do Sense Pro" },
    { file: "colchão-sensepro4.png", alt: "Composição ilustrada do Sense Pro e controles Cromos LCD e Life Vibro" },
    { file: "colchão-sensepro2.png", alt: "Descrição das sete camadas do colchão Sense Pro" },
    { file: "colchão-sensepro5.png", alt: "Ficha do Sense Pro: altura de 25 cm e capacidade informada de 140 kg por lado" },
]);
const dreamMedia = gallery("dream", "/a vacuo/Dream/", [
    { file: "Colchão Dream.png", alt: "Colchão Dream completo em quarto ambientado, com acabamento marrom", width: 3000, height: 2000 },
    { file: "Anúncio Elegante de Colchão Dream a Vácuo.png", alt: "Apresentação do Dream a vácuo em linho marrom com embalagem e controles" },
    { file: "Colchão DREAM HortoLeve_ Conforto e Tecnologia.png", alt: "Ficha do Dream: camadas, altura de 20 cm e capacidade informada de 130 kg por lado", width: 1535 },
]);
const eleganceMedia = gallery("box-tatame-elegance", "/Box Tatame Elegance/", [1, 2, 3, 4, 5, 6, 7].map(n => ({ file: `camabox-tatame${n}.png`, alt: n <= 3 ? `Apresentação completa do Box Tatame Elegance ${["Casal", "Queen", "King"][n - 1]}` : `Ficha do Box Tatame Elegance ${["Casal", "Queen", "King", "Solteiro"][n - 4]} com medida compatível do colchão`, width: 1672, height: 941 })));
const japaneseMedia = gallery("box-tatame-japones", "/Box Tatame Japonês/", [8, 1, 2, 3, 4, 5, 6, 7].map(n => ({ file: `camabox-tatame${n}.png`, alt: n === 8 ? "Box Tatame Japonês completo em quarto ambientado, com base acolchoada e bordas elevadas" : n <= 3 ? `Apresentação do Box Tatame Japonês ${["Casal", "Queen", "King"][n - 1]}` : `Ficha do Box Tatame Japonês ${["Casal", "Queen", "King", "Solteiro"][n - 4]} com medida compatível do colchão` })));
const standardSizes = [{ name: "Solteiro", dimensions: "0,88 x 1,88 m" }, { name: "Casal", dimensions: "1,38 x 1,88 m" }, { name: "Queen", dimensions: "1,58 x 1,98 m" }, { name: "King", dimensions: "1,93 x 2,03 m" }];

export function line(config: { slug: string; name: string; categoryId: string; summary: string; description: string; paragraphs: string[]; highlights: string[]; specifications: Product["specifications"]; media: ProductMedia[]; sheet: number; sizes: ProductPresentation["sizes"] }) {
    const product: Product = { id: config.slug, slug: config.slug, name: config.name, categoryId: config.categoryId, summary: config.summary, description: config.description, highlights: config.highlights, specifications: config.specifications, media: [config.media[0]], technologyIds: [], featured: false, status: "published", isDemo: false };
    const presentation: ProductPresentation = { title: config.name, displayName: config.name, subtitle: config.summary, paragraphs: [config.description, ...config.paragraphs], media: config.media, technicalSheetId: config.media[config.sheet].id, technologies: config.highlights, specifications: config.specifications, sizes: config.sizes };
    return { product, presentation };
}
export const sensePro = line({
    slug: "sense-pro", name: "Colchão Sense Pro", categoryId: "linha-a-vacuo",
    summary: "Linho bege, tecido ActiveCool e camadas de conforto em uma apresentação premium a vácuo.",
    description: "O Colchão Sense Pro combina acabamento em linho bege e tecido ActiveCool com uma composição em camadas. O material comercial apresenta espuma Green D33 Sleep, camada de conforto ComfyBLU HRSense e suporte SenseGRAY D28, além de massageadores, componentes magnéticos e pastilhas de infravermelho longo.",
    paragraphs: ["A ficha informa 25 cm de altura e capacidade de 140 kg por lado. Os controles apresentados são Cromos LCD ou Life Vibro; confirme a configuração disponível com o atendimento.", "A apresentação a vácuo e o acabamento neutro compõem uma proposta para diferentes ambientes. Consulte garantia e disponibilidade de medidas antes da escolha."],
    highlights: ["Tecido ActiveCool", "Linho bege", "Camadas de conforto", "Massagem e cromoterapia"],
    specifications: [{ label: "Altura", value: "25 cm" }, { label: "Capacidade informada", value: "140 kg por lado" }, { label: "Acabamento", value: "Linho bege" }, { label: "Tecido", value: "ActiveCool" }, { label: "Camadas informadas", value: "Green D33 Sleep, ComfyBLU HRSense e SenseGRAY D28" }, { label: "Recursos informados", value: "Massagem, cromoterapia, magnético e infravermelho longo" }, { label: "Controles apresentados", value: "Cromos LCD ou Life Vibro" }],
    media: senseMedia, sheet: 5, sizes: standardSizes,
});
export const dream = line({
    slug: "dream", name: "Colchão Dream", categoryId: "linha-a-vacuo",
    summary: "Linho marrom, tecido ActiveCool e recursos de massagem em um colchão de 20 cm com apresentação a vácuo.",
    description: "O Colchão Dream apresenta acabamento em linho marrom, superfície clara e composição em camadas. A ficha comercial informa tecido ActiveCool, espuma Green High-Tech D33 Sleep, suporte Dream GRAY D28 Tech, sistema massageador, pastilhas magnéticas e de infravermelho longo.",
    paragraphs: ["A altura informada é de 20 cm, com capacidade de 130 kg por lado. As artes apresentam controles Cromos LCD ou Life Vibro e cromoterapia, conforme a configuração disponível.", "O acabamento marrom valoriza a composição do quarto. Confirme medidas, garantia e recursos da versão escolhida com nossa equipe."],
    highlights: ["Linho marrom", "Tecido ActiveCool", "Massagem e cromoterapia", "Apresentação a vácuo"],
    specifications: [{ label: "Altura", value: "20 cm" }, { label: "Capacidade informada", value: "130 kg por lado" }, { label: "Acabamento", value: "Linho marrom" }, { label: "Camadas informadas", value: "Green High-Tech D33 Sleep e Dream GRAY D28 Tech" }, { label: "Recursos informados", value: "Massagem, cromoterapia, magnético e infravermelho longo" }, { label: "Controles apresentados", value: "Cromos LCD ou Life Vibro" }],
    media: dreamMedia, sheet: 2, sizes: [{ name: "Medidas", dimensions: "Consulte as medidas e a configuração disponíveis com o atendimento." }],
});
const boxSpecifications = [{ label: "Tipo", value: "Base acolchoada estilo tatame" }, { label: "Altura informada", value: "25 cm" }, { label: "Estrutura informada", value: "Robusta e reforçada" }, { label: "Encaixe", value: "Envolve o colchão" }, { label: "Acabamento informado", value: "Refinado" }, { label: "Tamanhos apresentados", value: "Solteiro, Casal, Queen e King" }];
const boxHighlights = ["Base acolchoada estilo tatame", "Encaixe que envolve o colchão", "Estrutura robusta e reforçada", "Acabamento refinado"];
export const boxTatameElegance = line({
    slug: "box-tatame-elegance", name: "Box Tatame Elegance", categoryId: "camas-box",
    summary: "Base acolchoada com inspiração japonesa, acabamento refinado e encaixe que envolve o colchão.",
    description: "O Box Tatame Elegance valoriza o ambiente com uma base acolchoada de linhas retas, revestimento claro e pés aparentes. Inspirado no design japonês, apresenta encaixe que envolve o colchão e estrutura descrita no material comercial como robusta e reforçada.",
    paragraphs: ["As fichas apresentam altura de 25 cm e versões Solteiro, Casal, Queen e King. As medidas abaixo se referem ao colchão compatível, conforme as artes; confirme as dimensões externas da base com o atendimento.", "O visual neutro e o acabamento refinado permitem compor diferentes propostas de quarto. Consulte revestimento, garantia e disponibilidade antes de escolher."],
    highlights: boxHighlights, specifications: boxSpecifications, media: eleganceMedia, sheet: 3, sizes: standardSizes,
});
export const boxTatameJapones = line({
    slug: "box-tatame-japones", name: "Box Tatame Japonês", categoryId: "camas-box",
    summary: "Base de perfil baixo, bordas acolchoadas e encaixe envolvente para uma composição elegante do quarto.",
    description: "O Box Tatame Japonês apresenta base acolchoada de perfil baixo e bordas que envolvem o colchão. Seu acabamento claro e desenho de linhas retas acompanham uma proposta de inspiração japonesa, com estrutura robusta e reforçada conforme o material comercial.",
    paragraphs: ["As fichas informam altura de 25 cm e compatibilidade com colchões Solteiro, Casal, Queen e King. As medidas apresentadas são do colchão compatível; consulte as dimensões externas da base antes de planejar o ambiente.", "A fotografia de apresentação mostra a base completa em um quarto ambientado. Confirme revestimentos, garantia e configurações disponíveis com nossa equipe."],
    highlights: boxHighlights, specifications: boxSpecifications, media: japaneseMedia, sheet: 4, sizes: standardSizes,
});
