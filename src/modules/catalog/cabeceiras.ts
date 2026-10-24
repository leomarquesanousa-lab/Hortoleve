import type { Product, ProductMedia } from "./types";
import type { ProductPresentation } from "./presentations";

const sizes = ["Solteiro", "Casal", "Queen", "King"].map(name => ({ name, dimensions: "Consulte as dimensões com o atendimento." }));
const models = [
    { slug: "lua", name: "Lua", order: [2, 3, 1], width: 1536, height: 1024,
        summary: "Design em curvas e revestimento claro para uma composição acolhedora e sofisticada.",
        description: "A Cabeceira Lua apresenta contorno superior arredondado e revestimento claro, com uma divisão horizontal que valoriza seu desenho. A fotografia do produto completo destaca as curvas suaves e a proposta acolhedora para o quarto.",
        highlights: ["Design em curvas", "Estrutura resistente", "Tecidos selecionados", "Diversas cores"],
        detail: "O material comercial apresenta apoio para leitura e descanso, além de opções Solteiro, Casal, Queen e King. Consulte os tecidos, as cores e as dimensões disponíveis antes de escolher." },
    { slug: "italia", name: "Itália", order: [1, 2, 3], width: 1536, height: 1024,
        summary: "Painéis verticais e acabamento claro em um desenho elegante para o quarto.",
        description: "A Cabeceira Itália combina linhas retas com painéis verticais no revestimento, criando uma apresentação elegante e equilibrada. A fotografia de capa mostra a peça completa, sem colchão, para evidenciar seu desenho e acabamento.",
        highlights: ["Painéis verticais", "Estrutura resistente", "Tecidos selecionados", "Diversas cores"],
        detail: "O material apresenta opções Solteiro, Casal, Queen e King. Consulte o atendimento para confirmar tecidos, cores, dimensões e instalação para o seu ambiente." },
    { slug: "grecia", name: "Grécia", order: [1, 2, 3], width: 1672, height: 941,
        summary: "Abas laterais e revestimento escuro em uma composição marcante e refinada.",
        description: "A Cabeceira Grécia se destaca pelas abas laterais e pelo revestimento escuro apresentado nas fotografias. Seu desenho envolve visualmente a cama, com divisão horizontal e linhas que conferem presença à composição do quarto.",
        highlights: ["Abas laterais de fixação", "Estrutura resistente", "Tecidos selecionados", "Diversas cores"],
        detail: "A arte comercial informa abas laterais de fixação e opções Solteiro, Casal, Queen e King. Confirme as dimensões, as cores, os tecidos e as condições de instalação com nossa equipe." },
];

export const cabeceiras = models.map(model => {
    const slug = "cabeceira-" + model.slug, name = "Cabeceira " + model.name;
    const media: ProductMedia[] = model.order.map((number, index) => ({
        id: `${slug}-${number}`, src: `/cabeceiras/${model.slug}/cabeceira_${model.slug} (${number}).png`,
        alt: index === 0 ? `${name} completa, apresentada sem colchão` : index === 2 ? `Apresentação comercial da ${name}, características e tamanhos disponíveis` : `${name} em quarto ambientado`,
        width: model.width, height: model.height,
    }));
    const specifications = [{ label: "Modelo", value: name }, { label: "Tamanhos apresentados", value: "Solteiro, Casal, Queen e King" }, { label: "Cores", value: "Diversas cores; consulte disponibilidade" }];
    const product: Product = { id: slug, slug, name, categoryId: "cabeceiras", summary: model.summary, description: model.description, highlights: model.highlights, specifications, media: [media[0]], technologyIds: [], featured: false, status: "published", isDemo: false };
    const presentation: ProductPresentation = { title: name, displayName: name, subtitle: model.summary, paragraphs: [model.description, model.detail], media, technicalSheetId: media[2].id, technologies: [], specifications, sizes };
    return { product, presentation };
});
