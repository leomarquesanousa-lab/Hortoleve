import type { Product, ProductMedia } from "./types";
import type { ProductPresentation } from "./presentations";

const whiteMedia: ProductMedia[] = [
    { id: "corpo-white-cover", src: "/travesseiros/corpo-white-fibra/travesseiros_corpowhite1.png", alt: "Corpo White Fibra branco e alongado sobre a cama, com embalagem em fibra acrílica ao fundo", width: 1536, height: 1024 },
    { id: "corpo-white-second", src: "/travesseiros/corpo-white-fibra/travesseiros_corpowhite2.png", alt: "Corpo White Fibra em ambiente de descanso, com detalhe do acabamento branco", width: 1536, height: 1024 },
    { id: "corpo-white-sheet", src: "/travesseiros/corpo-white-fibra/travesseiros_corpowhite3.png", alt: "Ficha do Corpo White Fibra: enchimento de fibra acrílica, antiácaro e toque macio e suave", width: 1536, height: 1024 },
];
const magneticMedia: ProductMedia[] = [
    { id: "corpo-magnetico-cover", src: "/travesseiros/corpo-magnetico/travesseiro-corpo-magnetico1.png", alt: "Corpo Magnético branco e alongado, com superfície pontilhada e embalagem ao fundo", width: 1536, height: 1024 },
    { id: "corpo-magnetico-second", src: "/travesseiros/corpo-magnetico/travesseiro-corpo-magnetico2.png", alt: "Corpo Magnético apresentado sobre uma cama em ambiente de descanso", width: 1536, height: 1024 },
    { id: "corpo-magnetico-sheet", src: "/travesseiros/corpo-magnetico/travesseiro-corpo-magnetico3.png", alt: "Ficha do Corpo Magnético: espuma soft, fibra acrílica, antiácaro, pastilhas de infravermelho e recurso magnético", width: 1536, height: 1024 },
];

export const corpoWhiteProduct: Product = {
    id: "travesseiro-corpo-white-fibra", slug: "travesseiro-corpo-white-fibra", name: "Corpo White Fibra", categoryId: "travesseiros",
    summary: "Formato alongado, enchimento de fibra acrílica e toque macio e suave para compor seus momentos de descanso.",
    description: "O Corpo White Fibra é um travesseiro de corpo com formato alongado e acabamento branco. O material comercial informa enchimento de fibra acrílica, recurso antiácaro e toque macio e suave. Sua proposta é acompanhar diferentes posições de descanso, com uma apresentação discreta e elegante. Consulte nossa equipe para confirmar medidas e orientações de conservação.",
    highlights: ["Enchimento de fibra acrílica", "Formato alongado", "Macio e suave", "Antiácaro"],
    media: [whiteMedia[0]],
    specifications: [{ label: "Tipo", value: "Travesseiro de corpo" }, { label: "Enchimento", value: "Fibra acrílica" }, { label: "Toque informado", value: "Macio e suave" }, { label: "Recurso informado", value: "Antiácaro" }],
    technologyIds: [], featured: false, status: "published", isDemo: false,
};
export const corpoMagneticoProduct: Product = {
    id: "travesseiro-corpo-magnetico", slug: "travesseiro-corpo-magnetico", name: "Corpo Magnético", categoryId: "travesseiros",
    summary: "Travesseiro de corpo com espuma soft, fibra acrílica e recursos magnéticos e de infravermelho informados no material comercial.",
    description: "O Corpo Magnético reúne formato alongado e acabamento branco com superfície pontilhada. Sua ficha comercial informa espuma soft, enchimento de fibra acrílica, toque macio e suave e recurso antiácaro, além de pastilhas de infravermelho e componente magnético. Uma opção para compor o ambiente de descanso com conforto e apresentação refinada. Consulte nossa equipe para confirmar medidas e composição detalhada.",
    highlights: ["Espuma soft e fibra acrílica", "Formato alongado", "Antiácaro", "Pastilhas de infravermelho e magnético"],
    media: [magneticMedia[0]],
    specifications: [{ label: "Tipo", value: "Travesseiro de corpo" }, { label: "Espuma informada", value: "Soft" }, { label: "Enchimento informado", value: "Fibra acrílica" }, { label: "Toque informado", value: "Macio e suave" }, { label: "Recursos informados", value: "Antiácaro, pastilhas de infravermelho e magnético" }],
    technologyIds: [], featured: false, status: "published", isDemo: false,
};

export const corpoWhitePresentation: ProductPresentation = {
    title: "Corpo White Fibra", displayName: "Corpo White Fibra",
    subtitle: "Suavidade e formato alongado para acompanhar o seu descanso.",
    paragraphs: [corpoWhiteProduct.description, "As fotografias apresentam o produto branco em ambientes de descanso e a embalagem identificada como travesseiro de corpo em fibra acrílica. A ficha ilustrada destaca o formato que cobre a maior parte do corpo e se adapta à sua forma de dormir.", "Medidas, garantia e composição do revestimento não estão especificadas no material disponível. Confirme esses detalhes com o atendimento antes de escolher seu produto."],
    media: whiteMedia, technicalSheetId: "corpo-white-sheet",
    technologies: ["Fibra acrílica", "Antiácaro", "Toque macio e suave"],
    specifications: corpoWhiteProduct.specifications,
    sizes: [{ name: "Dimensões", dimensions: "Medidas não informadas no material. Consulte nossa equipe." }],
};
export const corpoMagneticoPresentation: ProductPresentation = {
    title: "Corpo Magnético", displayName: "Corpo Magnético",
    subtitle: "Formato de corpo, toque macio e os recursos apresentados pela Hortoleve.",
    paragraphs: [corpoMagneticoProduct.description, "As imagens mostram a superfície branca pontilhada e a embalagem identificada como travesseiro de corpo magnético. A ficha ilustrada reúne os materiais e recursos em uma apresentação que também destaca o formato alongado e o toque suave.", "Converse com nossa equipe para confirmar medidas, densidade, garantia e composição detalhada antes de escolher seu produto."],
    media: magneticMedia, technicalSheetId: "corpo-magnetico-sheet",
    technologies: ["Espuma soft", "Fibra acrílica", "Antiácaro", "Pastilhas de infravermelho", "Magnético"],
    specifications: corpoMagneticoProduct.specifications,
    sizes: [{ name: "Dimensões", dimensions: "Medidas não informadas no material. Consulte nossa equipe." }],
};
