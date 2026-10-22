import type { ProductPresentation } from "./presentations";

export const recoveryMaisPresentation: ProductPresentation = {
    displayName: "Colchão Recovery⁺",
    title: "Colchão Recovery⁺",
    subtitle: "Acabamento azul, toque refrescante e tecnologia em cada detalhe.",
    paragraphs: [
        "O Colchão Recovery⁺ reúne uma superfície clara bordada e laterais azuis com acabamento personalizado. Uma composição elegante, com a identidade Hortoleve presente no próprio produto.",
        "O tecido bordado Refresh, apresentado no material comercial como gelado e refrescante, acompanha uma estrutura de 30 cm de altura, densidade progressiva 28 · 33 · 45, espuma AG Tech e EPS térmico para sustentação e suporte.",
        "A linha conta com Rabatan tratado, pastilhas de infravermelho longo, magnetismo e pastilha nanotecnológica azul. O kit com 8 motores massageadores oferece 20 tipos de massagem, acompanhado de cromoterapia.",
        "Conheça os acabamentos e confirme com nossa equipe as medidas, a configuração e os acessórios disponíveis para o seu pedido.",
    ],
    media: [
        { id: "recovery-cover", src: "/recover+/1.png", alt: "Colchão Recovery+ com superfície clara bordada, laterais azuis e marca Hortoleve em quarto ambientado", width: 1536, height: 1024 },
        { id: "recovery-second", src: "/recover+/2.png", alt: "Segunda fotografia do Colchão Recovery+ mostrando o acabamento azul e a superfície bordada", width: 1536, height: 1024 },
        { id: "recovery-sheet", src: "/recover+/3.png", alt: "Ficha ilustrada Colchão Recovery+ com composição, tecido Refresh, oito motores, vinte massagens e altura de 30 cm", width: 1536, height: 1024 },
        { id: "recovery-details", src: "/recover+/4.png", alt: "Apresentação técnica Colchão Recovery+ com lista de componentes e acabamento do colchão", width: 1536, height: 1024 },
        { id: "recovery-commercial", src: "/recover+/5.png", alt: "Arte comercial Colchão Recovery+ com colchão azul e representação ilustrativa do descanso", width: 1536, height: 1024 },
    ],
    technicalSheetId: "recovery-sheet",
    technologies: ["Rabatan tratado", "Tecido Refresh gelado e refrescante", "Magnetismo", "Densidade progressiva 28 · 33 · 45", "8 motores · 20 tipos de massagem", "Pastilha nanotecnológica azul", "Infravermelho Longo", "Cromoterapia", "Espuma AG Tech", "EPS térmico"],
    specifications: [
        { label: "Altura", value: "30 cm" },
        { label: "Tecido superior", value: "Bordado Refresh" },
        { label: "Acabamento lateral", value: "Tecido personalizado azul" },
        { label: "Densidade progressiva", value: "28 · 33 · 45" },
        { label: "Espuma", value: "AG Tech" },
        { label: "Sistema massageador", value: "8 motores · 20 tipos de massagem" },
        { label: "Acabamento superior", value: "Pillow americano, conforme cadastro comercial" },
    ],
    sizes: [{ name: "Medidas disponíveis", dimensions: "Consulte nossa equipe para confirmar as opções do Colchão Recovery⁺." }],
};
