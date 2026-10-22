import type { Category, Product, ProductMedia } from "./types";
import type { ProductPresentation } from "./presentations";

export const divanCategory: Category = {
    id: "linha-divan", slug: "linha-divan", name: "Linha Divan", parentId: "poltronas",
    description: "Poltrona massageadora com desenho reclinado, acabamento estofado e opções em preto e marrom. Conheça os detalhes da Linha Divan.",
    icon: "M6 4L10 12H17L21 19H4ZM6 4V19",
};
// Sequência explícita dos arquivos fornecidos: 1, 2, 3. Originais preservados.
const directory = "/poltronas/divan/";
const media: ProductMedia[] = [
    { id: "divan-cover", src: directory + "ChatGPT Image Oct 21, 2026, 08_36_16 PM-1.png", alt: "Poltrona massageadora Linha Divan preta com desenho reclinado e acabamento estofado com botões", width: 1536, height: 1024 },
    { id: "divan-brown", src: directory + "ChatGPT Image Oct 21, 2026, 08_36_17 PM-2.png", alt: "Poltrona Linha Divan marrom com encosto inclinado e apoio alongado para as pernas", width: 1536, height: 1024 },
    { id: "divan-sheet", src: directory + "ChatGPT Image Oct 21, 2026, 08_36_17 PM-3.png", alt: "Ficha comercial Linha Divan com cores preto e marrom, espuma de alta densidade, pastilhas magnéticas, infravermelho longo e massagem com controle Vibro", width: 1536, height: 1024 },
];

export const divanProduct: Product = {
    id: "divan", slug: "divan", name: "Poltrona Massageadora Divan", categoryId: "linha-divan",
    summary: "Desenho reclinado, acabamento estofado e massagem com controle Vibro: uma proposta de descanso nas cores preto e marrom.",
    description: "A Poltrona Massageadora Divan combina encosto inclinado, apoio alongado para as pernas e acabamento com botões. A ficha comercial informa espuma de alta densidade, pastilhas magnéticas, infravermelho longo e sistema de massagem com controle Vibro. Disponível em preto e marrom, com atendimento para lojistas, revendedores e clientes interessados.",
    highlights: ["Formato reclinado", "Espuma de alta densidade", "Massagem com controle Vibro", "Preto e marrom"],
    media: [media[0]],
    specifications: [
        { label: "Tipo", value: "Poltrona massageadora" },
        { label: "Formato", value: "Reclinado, quase deitado" },
        { label: "Espuma", value: "Alta densidade; densidade numérica não informada" },
        { label: "Sistema de massagem", value: "Controle Vibro" },
        { label: "Componentes informados", value: "Pastilhas magnéticas e infravermelho longo" },
        { label: "Cores", value: "Preto e marrom" },
    ],
    technologyIds: [], featured: false, status: "published", isDemo: false,
};

export const divanPresentation: ProductPresentation = {
    title: "Linha Divan", displayName: "Divan",
    subtitle: "Design reclinado e conforto para os seus momentos de pausa.",
    paragraphs: [
        "A Poltrona Massageadora Divan valoriza os momentos de descanso com uma silhueta contínua: encosto inclinado, assento curvo e apoio alongado para as pernas. O acabamento estofado com botões acompanha o desenho da peça, nas cores preto e marrom.",
        "Seu formato foi desenvolvido para uma posição reclinada, quase deitada. A espuma de alta densidade e o sistema de massagem com controle Vibro fazem parte da composição apresentada no material comercial, que também informa pastilhas magnéticas e infravermelho longo.",
        "Voltada também a lojistas e revendedores, a Linha Divan é apresentada para compor ambientes de descanso, consultórios e espaços de relaxamento. Uma peça com identidade própria para quem valoriza design e funcionalidade.",
        "Converse com nossa equipe para confirmar medidas, revestimentos, capacidade, garantia e configuração disponível antes de escolher sua Divan.",
    ],
    media, technicalSheetId: "divan-sheet",
    technologies: ["Pastilhas magnéticas", "Infravermelho Longo", "Espuma de alta densidade", "Massagem com controle Vibro"],
    specifications: divanProduct.specifications,
    sizes: [{ name: "Dimensões", dimensions: "Medidas não informadas no material. Consulte nossa equipe." }],
};
