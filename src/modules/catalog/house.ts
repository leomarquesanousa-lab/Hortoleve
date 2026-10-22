import type { Category, Product, ProductMedia } from "./types";
import type { ProductPresentation } from "./presentations";

export const houseCategory: Category = {
    id: "linha-house", slug: "linha-house", name: "Linha House", parentId: "poltronas",
    description: "O aconchego da tradicional poltrona do papai, com tecido suede, sistema reclinável e massagem com controle Vibro. Conheça a Linha House.",
    icon: "M6 11V6Q6 3 9 3H15Q18 3 18 6V11M3 10H7V17H17V10H21V20H3Z",
};

// Ordem numérica fornecida pelo cliente, sem alterar os arquivos originais.
const media: ProductMedia[] = [
    { id: "house-cover", src: "/poltronas/house/poltronahouse_1.png", alt: "Poltrona House bege reclinada, com apoio para pernas estendido, braços estofados e bolso lateral", width: 1536, height: 1024 },
    { id: "house-sheet", src: "/poltronas/house/poltronahouse_2.png", alt: "Ficha comercial Linha House: tecido suede, espuma de alta densidade, bolso lateral, sistema reclinável, massagem com controle Vibro e cores preto, bege e marrom", width: 1536, height: 1024 },
    { id: "house-black", src: "/poltronas/house/poltronahouse_3.png", alt: "Poltrona House preta em posição fechada, com encosto acolchoado, braços estofados e bolso lateral", width: 1536, height: 1024 },
];

export const houseProduct: Product = {
    id: "house", slug: "house", name: "Poltrona Massageadora House", categoryId: "linha-house",
    summary: "O aconchego da poltrona do papai em tecido suede, com sistema reclinável, bolso lateral e massagem com controle Vibro.",
    description: "A Poltrona Massageadora House reúne o desenho da tradicional poltrona do papai, encosto acolchoado e braços estofados. Seu sistema reclinável permite ajustar a posição para o descanso. A ficha comercial informa tecido suede, espuma de alta densidade, bolso lateral e massagem com controle Vibro, nas cores preto, bege e marrom.",
    highlights: ["Tecido suede", "Sistema reclinável", "Massagem com controle Vibro", "Bolso lateral"],
    media: [media[0]],
    specifications: [
        { label: "Tipo", value: "Poltrona massageadora reclinável" },
        { label: "Revestimento", value: "Tecido suede" },
        { label: "Espuma", value: "Alta densidade; densidade numérica não informada" },
        { label: "Sistema de massagem", value: "Controle Vibro" },
        { label: "Funcionalidades", value: "Sistema reclinável e bolso lateral" },
        { label: "Cores", value: "Preto, bege e marrom" },
    ],
    technologyIds: [], featured: false, status: "published", isDemo: false,
};

export const housePresentation: ProductPresentation = {
    title: "Linha House", displayName: "House",
    subtitle: "O conforto da tradicional poltrona do papai, com design acolhedor e funcionalidade.",
    paragraphs: [
        "A Poltrona Massageadora House traduz o aconchego da tradicional poltrona do papai em uma peça de presença elegante. O encosto acolchoado e os braços estofados compõem um desenho convidativo para salas de estar, quartos e espaços de descanso.",
        "O tecido suede acompanha os volumes do estofado, disponível nas cores preto, bege e marrom. A espuma de alta densidade integra a composição informada no material comercial, enquanto o bolso lateral acrescenta praticidade ao uso cotidiano.",
        "Seu sistema reclinável permite ajustar a posição para os momentos de pausa. A linha também conta com sistema de massagem com controle Vibro, reunindo conforto e funcionalidade em uma proposta voltada a clientes, lojistas e revendedores.",
        "Converse com nossa equipe para conhecer as opções de cor e confirmar medidas, capacidade, garantia e configuração disponível para o seu pedido.",
    ],
    media, technicalSheetId: "house-sheet",
    technologies: ["Massagem com controle Vibro", "Espuma de alta densidade", "Tecido suede", "Bolso lateral", "Sistema reclinável"],
    specifications: houseProduct.specifications,
    sizes: [{ name: "Dimensões", dimensions: "Medidas não informadas no material. Consulte nossa equipe." }],
};
