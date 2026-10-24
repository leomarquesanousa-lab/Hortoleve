import { cabeceiras } from "./cabeceiras.ts";
import type { ProductMedia } from "./types";
import { divanPresentation } from "./divan.ts";
import { housePresentation } from "./house.ts";
import { viscoelasticoPresentation } from "./viscoelastico.ts";
import { futurePresentation } from "./future.ts";
import { cervicalOrtoPlusPresentation } from "./cervical-orto-plus.ts";
import { recoveryMaisPresentation } from "./recovery-mais.ts";
import { eliteAzulPresentation } from "./elite-azul.ts";
import { eliteCinzaPresentation } from "./elite-cinza.ts";
import { corpoWhitePresentation, corpoMagneticoPresentation } from "./corpo.ts";
import { sensePro, dream, boxTatameElegance, boxTatameJapones } from "./novas-linhas.ts";
import { complementos } from "./complementos.ts";
import { withStorageImages } from "./storage-images.ts";

export interface ProductPresentation {
    displayName?: string;
    title: string;
    subtitle: string;
    paragraphs: string[];
    media: ProductMedia[];
    technicalSheetId: string;
    technologies: string[];
    technologyDescriptions?: Record<string, string>;
    technologyIcons?: Record<string, string>;
    specifications: { label: string; value: string }[];
    sizes: { name: string; dimensions: string }[];
}

// Conteúdo e dados comerciais fornecidos pelo cliente; nomes de tecnologias sem alegações clínicas.
export const sourcePresentations: Partial<Record<string, ProductPresentation>> = {
    divan: divanPresentation,
    house: housePresentation,
    "travesseiro-viscoelastico": viscoelasticoPresentation,
    "travesseiro-future": futurePresentation,
    "travesseiro-corpo-white-fibra": corpoWhitePresentation,
    "travesseiro-corpo-magnetico": corpoMagneticoPresentation,
    "sense-pro": sensePro.presentation,
    "dream": dream.presentation,
    "box-tatame-elegance": boxTatameElegance.presentation,
    "box-tatame-japones": boxTatameJapones.presentation,
    ...Object.fromEntries(complementos.map(item => [item.product.slug, item.presentation])),
    ...Object.fromEntries(cabeceiras.map(item => [item.product.slug, item.presentation])),
    "travesseiro-cervical-orto-plus": cervicalOrtoPlusPresentation,
    "recover-mais": recoveryMaisPresentation,
    comfort: {
        displayName: "Confort",
        title: "Linha Confort",
        subtitle: "Conforto, maciez e tecnologia para o seu descanso.",
        paragraphs: [
            "O Colchão Confort é um modelo exclusivo 100% espuma com tecnologia magnética e recursos voltados ao descanso.",
            "Foi desenvolvido para oferecer conforto, suporte e toque macio. Sua composição combina espuma D33 + HR, camada perfilada terapêutica D40 e acabamento Confort Soft D28, proporcionando conforto na medida certa com toque macio e relaxante.",
            "Além disso, o colchão reúne recursos como cromoterapia integrada, infravermelho longo, magnetismo e energia quântica.",
            "É ideal para quem deseja unir conforto, maciez e tecnologia, com opções em Suede e Linho.",
            "Uma proposta para transformar o momento de dormir em uma experiência de relaxamento e renovação.",
        ],
        media: [
            { id: "confort-room-front", src: "/confort/1.png", alt: "Colchão Confort em quarto ambientado, com acabamento claro e nome bordado na lateral", width: 1536, height: 1024 },
            { id: "confort-room-side", src: "/confort/2.png", alt: "Colchão Confort com superfície bordada e laterais claras, visto de outro ângulo", width: 1536, height: 1024 },
            { id: "confort-room-detail", src: "/confort/3.png", alt: "Colchão Confort sem roupa de cama, com superfície e acabamento lateral em destaque", width: 1536, height: 1024 },
            { id: "confort-sheet", src: "/confort/4.png", alt: "Apresentação técnica ilustrada Confort com composição, tecnologias, especificações e medidas", width: 1536, height: 1024 },
        ],
        technicalSheetId: "confort-sheet",
        technologies: ["Perfilado Rabatan", "Tecido Premium", "Magnético", "Densidade Inteligente", "Massageador", "Energia Quântica", "Infravermelho Longo", "Cromoterapia", "Antiácaro", "100% Espuma D33", "Controle Cromos LCD"],
        technologyIcons: {
            "100% Espuma D33": "M4 5L12 2L20 5L12 8ZM4 10L12 13L20 10M4 15L12 18L20 15M4 20L12 23L20 20",
            "Controle Cromos LCD": "M7 2H17V22H7ZM10 6H14M10 11H14M11 18H13",
        },
        specifications: [
            { label: "Garantia", value: "3 anos" },
            { label: "Altura do colchão", value: "20 | 25 | 30 | 35 cm" },
            { label: "Nível de conforto", value: "Macio" },
            { label: "Adequado para pessoas com até", value: "160 kg" },
        ],
        sizes: [
            { name: "Solteiro", dimensions: "0,88 x 1,88 m" },
            { name: "Casal", dimensions: "1,38 x 1,88 m" },
            { name: "Queen", dimensions: "1,58 x 1,98 m" },
            { name: "King", dimensions: "1,93 x 2,03 m" },
        ],
    },
    elegance: {
        title: "Linha Elegance",
        subtitle: "Conforto, tecnologia e sofisticação em Azul Royal.",
        paragraphs: [
            "O Colchão Elegance Premium é um modelo exclusivo em duas versões: Cromos ou Kit Therapy.",
            "Combina conforto, tecnologia e sofisticação. Com 30 cm de altura, possui acabamento premium em tecidos especiais, laterais em Azul Royal com bordado exclusivo e parte superior com design diferenciado, integrando um pillow americano com bordado especial, proporcionando toque macio, conforto elevado e um visual elegante.",
            "A versão Kit Therapy possui conexão com Alexa Echo.",
            "Além disso, o colchão reúne recursos como cromoterapia integrada, infravermelho longo, magnetismo e energia quântica.",
            "O Elegance é ideal para quem deseja unir conforto superior, tecnologia inovadora e um design sofisticado, transformando o momento de dormir em uma experiência de relaxamento e renovação.",
        ],
        media: [
            { id: "elegance-room-front", src: "/elegance/1.png", alt: "Colchão Elegance com laterais Azul Royal e pillow bordado, em quarto ambientado", width: 1536, height: 1024 },
            { id: "elegance-room-side", src: "/elegance/2.png", alt: "Colchão Elegance visto pelo ângulo oposto, com lateral azul e acabamento superior em destaque", width: 1536, height: 1024 },
            { id: "elegance-room-detail", src: "/elegance/3.png", alt: "Vista frontal do colchão Elegance com bordado geométrico Azul Royal e base clara", width: 1536, height: 1024 },
            { id: "elegance-sheet", src: "/elegance/4.png", alt: "Ficha técnica ilustrada Elegance com versões Cromos e Kit Therapy, tecnologias, especificações e medidas", width: 1122, height: 1402 },
        ],
        technicalSheetId: "elegance-sheet",
        technologies: ["Controle Cromos ou Kit Therapy", "Tecido Premium", "Pillow Top", "Densidade Inteligente", "Magnético", "Infravermelho Longo", "Massageador", "Cromoterapia", "Energia Quântica", "Alexa integrada"],
        technologyIcons: {
            "Controle Cromos ou Kit Therapy": "M7 2H17V22H7ZM10 6H14M10 11H14M11 18H13",
            "Pillow Top": "M4 7H20V18H4ZM4 11H20M8 7V11M16 7V11",
            "Magnético": "M6 5V13A6 6 0 0 0 18 13V5M6 9H9M15 9H18",
            "Infravermelho Longo": "M8 4Q2 12 8 20M12 7Q8 12 12 17M16 10Q14 12 16 14",
            "Massageador": "M8 3H16L18 21H6ZM10 8H14M10 13H14",
            "Energia Quântica": "M3 12Q12 0 21 12Q12 24 3 12ZM12 3Q0 12 12 21Q24 12 12 3",
            "Alexa integrada": "M3 8Q12 0 21 8M6 12Q12 6 18 12M9 16Q12 13 15 16M12 20H12.01",
        },
        specifications: [
            { label: "Garantia", value: "3 anos" },
            { label: "Altura do colchão", value: "30 cm" },
            { label: "Nível de conforto", value: "Intermediário" },
            { label: "Adequado para pessoas com até", value: "160 kg" },
        ],
        sizes: [
            { name: "Solteiro", dimensions: "0,88 x 1,88 m" },
            { name: "Casal", dimensions: "1,38 x 1,88 m" },
            { name: "Queen", dimensions: "1,58 x 1,98 m" },
            { name: "King", dimensions: "1,93 x 2,03 m" },
        ],
    },
    diamond: {
        title: "Linha Diamond",
        subtitle: "Exclusividade, tecnologia e sofisticação em cada detalhe.",
        paragraphs: [
            "O Colchão Luxo Diamond é um modelo de alto padrão que une exclusividade, tecnologia e sofisticação em cada detalhe.",
            "Com 35 cm de altura, possui acabamento premium em tecidos especiais, laterais com bordado exclusivo e superfície superior com design diferenciado.",
            "Seu pillow americano/europeu, com bordado especial localizado, proporciona toque macio, conforto elevado e uma apresentação elegante.",
            "O design integra cromoterapia lateral, carregamento por indução e sistema de som embutido.",
            "A Linha Diamond também apresenta sistema massageador, densidade progressiva, perfilado Rabatan, componentes magnéticos e infravermelho longo.",
        ],
        media: [
            { id: "diamond-room-front", src: "/diamond/1.png", alt: "Colchão Diamond cinza em quarto ambientado, com bordado e iluminação lateral em destaque", width: 1536, height: 1024 },
            { id: "diamond-room-side", src: "/diamond/2.png", alt: "Colchão Diamond visto pelo ângulo oposto, com pillow e lateral bordada iluminada", width: 1536, height: 1024 },
            { id: "diamond-room-detail", src: "/diamond/3.png", alt: "Colchão Diamond em quarto com cabeceira escura, mostrando acabamento superior e lateral", width: 1536, height: 1024 },
            { id: "diamond-sheet", src: "/diamond/4.png", alt: "Ficha técnica ilustrada Diamond com tecnologias, garantia, altura, capacidade, controle e medidas", width: 1122, height: 1402 },
        ],
        technicalSheetId: "diamond-sheet",
        technologies: ["Perfilado Rabatan", "Tecido Premium", "Magnético", "Densidade Inteligente", "Massageador", "Energia Quântica", "Infravermelho Longo", "Cromoterapia", "Carregador de Indução", "Pillow Top com Bordado Localizado", "Controle Cromos LCD ou Kit App", "Cromoterapia com Controle Sem Fio", "Som Embutido"],
        technologyIcons: {
            "Carregador de Indução": "M13 2L5 14H11L10 22L19 10H13Z",
            "Controle Cromos LCD ou Kit App": "M7 2H17V22H7ZM10 6H14M10 11H14M11 18H13",
            "Cromoterapia com Controle Sem Fio": "M3 8Q12 0 21 8M6 12Q12 6 18 12M9 16Q12 13 15 16M12 20H12.01",
            "Som Embutido": "M3 9H7L12 5V19L7 15H3ZM16 8Q21 12 16 16M19 5Q26 12 19 19",
        },
        specifications: [
            { label: "Garantia", value: "3 anos" },
            { label: "Altura", value: "35 cm" },
            { label: "Nível de conforto", value: "Intermediário" },
            { label: "Capacidade informada", value: "até 180 kg" },
            { label: "Pillow", value: "Americano/Europeu" },
            { label: "Acabamento", value: "Bordado especial" },
            { label: "Recursos", value: "Massagem, cromoterapia, som integrado e carregamento por indução" },
        ],
        sizes: [
            { name: "Solteiro", dimensions: "0,88 x 1,88 m" },
            { name: "Casal", dimensions: "1,38 x 1,88 m" },
            { name: "Queen", dimensions: "1,58 x 1,98 m" },
            { name: "King", dimensions: "1,93 x 2,03 m" },
        ],
    },
    majestic: {
        title: "Linha Majestic",
        subtitle: "O encontro perfeito entre sofisticação, conforto e tecnologia.",
        paragraphs: [
            "A Linha Majestic foi desenvolvida para quem valoriza elegância, conforto e inovação. Com design exclusivo e acabamento refinado, é uma excelente opção para lojistas e revendedores que desejam oferecer produtos de alto padrão.",
            "Com 30 cm de altura, acabamento bordado nas laterais e na superfície superior e uma sofisticada tonalidade cinza, o Majestic se destaca pelo visual moderno e requintado.",
            "Seu pillow americano de toque ultramacio proporciona uma agradável sensação de aconchego, combinando suavidade e suporte para noites de descanso ainda mais confortáveis.",
            "Além do design sofisticado, o Majestic reúne tecnologias como sistema massageador, densidade progressiva, perfilado Rabatan, componentes magnéticos, infravermelho longo e cromoterapia.",
        ],
        media: [
            { id: "majestic-room-front", src: "/majestic/2.png", alt: "Colchão Majestic cinza com bordado lateral e superior, em quarto ambientado", width: 1448, height: 1086 },
            { id: "majestic-room-side", src: "/majestic/3.png", alt: "Colchão Majestic visto pelo ângulo oposto, com pillow e acabamento cinza em destaque", width: 1448, height: 1086 },
            { id: "majestic-sheet", src: "/majestic/1.png", alt: "Ficha ilustrada da Linha Majestic: tecnologias, especificações, controle Cromos LCD e medidas", width: 1122, height: 1402 },
            { id: "majestic-room-detail", src: "/majestic/4.png", alt: "Colchão Majestic cinza em quarto com iluminação acolhedora, com nome bordado na lateral", width: 1536, height: 1024 },
        ],
        technicalSheetId: "majestic-sheet",
        technologies: ["Perfilado Rabatan", "Tecido Premium", "Magnético", "Densidade Inteligente", "Massageador", "Energia Quântica", "Infravermelho Longo", "Cromoterapia", "Antiácaro", "Pillow Top com Bordado Localizado"],
        specifications: [
            { label: "Garantia", value: "3 anos" },
            { label: "Altura", value: "30 cm" },
            { label: "Conforto", value: "Intermediário" },
            { label: "Capacidade informada", value: "até 160 kg" },
            { label: "Pillow", value: "Americano ultramacio" },
            { label: "Acabamento", value: "Bordado lateral e superior" },
            { label: "Controle", value: "Cromos LCD" },
        ],
        sizes: [
            { name: "Solteiro", dimensions: "0,88 x 1,88 m" },
            { name: "Casal", dimensions: "1,38 x 1,88 m" },
            { name: "Queen", dimensions: "1,58 x 1,98 m" },
            { name: "King", dimensions: "1,93 x 2,03 m" },
        ],
    },
    "elite-azul": eliteAzulPresentation,
    "elite-cinza": eliteCinzaPresentation,
};

export const presentations = withStorageImages(sourcePresentations);
