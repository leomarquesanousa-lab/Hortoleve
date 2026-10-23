import { gallery, line } from "./novas-linhas.ts";

const consultSizes = [{ name: "Medidas", dimensions: "Consulte medidas e configurações disponíveis com nossa equipe." }];
const boxSizes = ["Solteiro", "Casal", "Queen", "King"].map(name => ({ name, dimensions: "Dimensões a confirmar com o atendimento." }));
const tatameSizes = [{ name: "Solteiro", dimensions: "0,88 x 1,88 m" }, { name: "Casal", dimensions: "1,38 x 1,88 m" }, { name: "Queen", dimensions: "1,58 x 1,98 m" }, { name: "King", dimensions: "1,93 x 2,03 m" }];
function numbered(slug: string, folder: string, prefix: string, order: number[], technical: number[], name: string) {
    return gallery(slug, folder, order.map(n => {
        const large = (prefix === "camabox" && n === 7) || (prefix === "camaboxbau" && (n <= 4 || n === 7)) || (prefix === "camaboxcomauxiliar" && n === 1);
        return { file: `${prefix} (${n}).png`, alt: technical.includes(n) ? `Ficha de ${name} — apresentação ${n}` : `${name} completo em ambiente de quarto — vista ${n}`, width: large ? 3000 : 1536, height: large ? 2000 : 1024 };
    }));
}
export const car = line({
    slug: "car", name: "Vibro Car", categoryId: "vibro-car",
    summary: "Conforto portátil para o carro, a cadeira ou a poltrona, com opções tradicional e massageadora.",
    description: "O Vibro Car é um acessório acolchoado para assento e encosto, apresentado para uso no carro, em cadeiras e em poltronas. Seu formato acompanha essas superfícies e permite compor uma área de apoio em diferentes momentos da rotina.",
    paragraphs: ["O material comercial apresenta duas versões: com massageador e sem massageador. Confirme compatibilidade, alimentação e orientações de instalação e utilização com nossa equipe.", "As imagens mostram acabamento escuro e fixação ao assento. Medidas, composição e garantia devem ser confirmadas com o atendimento."],
    highlights: ["Uso no carro, cadeira ou poltrona", "Versão com massageador", "Versão tradicional", "Formato portátil"],
    specifications: [{ label: "Nome comercial", value: "Vibro Car" }, { label: "Aplicações informadas", value: "Carro, cadeira e poltrona" }, { label: "Versões apresentadas", value: "Com massageador e sem massageador" }],
    media: gallery("car", "/car/", [{ file: "vibro-car1.png", alt: "Vibro Car completo sobre o banco de um automóvel, com assento e encosto acolchoados" }, { file: "vibrocar2.png", alt: "Apresentação do Vibro Car com versões tradicional e massageadora" }]), sheet: 1, sizes: consultSizes,
});
export const pillowTop = line({
    slug: "pillow-top", name: "Pillow Top", categoryId: "colchoes",
    summary: "Camada de conforto com tecido premium e opções de revestimento para compor o seu descanso.",
    description: "O Pillow Top apresenta uma superfície clara com acabamento trabalhado e laterais escuras, como uma camada complementar sobre o colchão. O material comercial informa tecido premium, massageador, recurso magnético, infravermelho longo e controle de massagem.",
    paragraphs: ["A arte apresenta opções de revestimento em Suede, Linho e Colony, com diferentes cores. Consulte a disponibilidade e os recursos incluídos na versão escolhida.", "Medidas, espessura, composição interna e compatibilidade com o colchão devem ser confirmadas com nossa equipe."],
    highlights: ["Tecido premium", "Massageador e controle", "Magnético e infravermelho longo", "Suede, Linho e Colony"],
    specifications: [{ label: "Tipo", value: "Pillow Top" }, { label: "Revestimentos apresentados", value: "Suede, Linho e Colony" }, { label: "Recursos informados", value: "Massageador, magnético e infravermelho longo" }, { label: "Controle", value: "Controle de massagem" }],
    media: gallery("pillow-top", "/pilow-top/", [1, 2, 3].map(n => ({ file: `pilow-top${n}.png`, alt: n === 3 ? "Ficha do Pillow Top com recursos, revestimentos e cores" : `Pillow Top completo sobre um colchão em quarto ambientado — vista ${n}` }))), sheet: 2, sizes: consultSizes,
});
export const boxTatame = line({
    slug: "box-tatame", name: "Box Tatame", categoryId: "camas-box",
    summary: "Base baixa de inspiração tatame, com madeira tratada e acabamento em tecido premium.",
    description: "O Box Tatame combina perfil baixo, desenho amplo e acabamento estofado escuro. Seu visual minimalista valoriza a composição do quarto, enquanto a ficha comercial informa estrutura em madeira tratada e revestimento em tecido premium.",
    paragraphs: ["As fichas apresentam altura de 25 cm, capacidade informada de até 300 kg e versões Solteiro, Casal, Queen e King. Confirme condições de uso e configuração com nossa equipe.", "O produto é apresentado como base para colchão. Consulte revestimentos, cores e garantia disponíveis antes da escolha."],
    highlights: ["Madeira tratada", "Tecido premium", "Perfil baixo estilo tatame", "Quatro tamanhos apresentados"],
    specifications: [{ label: "Altura informada", value: "25 cm" }, { label: "Capacidade informada", value: "Até 300 kg" }, { label: "Estrutura", value: "Madeira tratada" }, { label: "Revestimento informado", value: "Tecido premium" }],
    media: numbered("box-tatame", "/Box Tatame/", "camaboxtatame", [1, 2, 3, 4, 5, 6, 7, 8], [5, 6, 7, 8], "Box Tatame"), sheet: 4, sizes: tatameSizes,
});
export const camaBox = line({
    slug: "cama-box", name: "Cama Box", categoryId: "camas-box",
    summary: "Base de linhas clássicas, estrutura reforçada e acabamento em tecidos selecionados.",
    description: "A Cama Box apresenta uma base estofada com pés aparentes e desenho discreto para compor diferentes ambientes. O material informa madeira tratada de alta resistência, estrutura reforçada e acabamento em tecidos selecionados.",
    paragraphs: ["As artes apresentam versões Solteiro, Casal, Queen e King, além de opções de tecidos e cores. Consulte dimensões, altura, capacidade e garantia com nossa equipe.", "A fotografia principal mostra a base completa, sem colchão. Confirme os itens incluídos na configuração escolhida."],
    highlights: ["Madeira tratada", "Estrutura reforçada", "Tecidos selecionados", "Opções de tecidos e cores"],
    specifications: [{ label: "Tipo", value: "Base Cama Box" }, { label: "Estrutura informada", value: "Reforçada, em madeira tratada de alta resistência" }, { label: "Acabamento", value: "Tecidos selecionados" }, { label: "Tamanhos apresentados", value: "Solteiro, Casal, Queen e King" }],
    media: numbered("cama-box", "/Cama Box/", "camabox", [7, 1, 2, 8, 3, 4, 5, 6], [3, 4, 5, 6], "Cama Box"), sheet: 4, sizes: boxSizes,
});
export const camaBoxBau = line({
    slug: "cama-box-bau", name: "Cama Box Baú", categoryId: "camas-box",
    summary: "Compartimento interno e abertura por pistões a gás em uma base estofada com acabamento refinado.",
    description: "A Cama Box Baú reúne base estofada e compartimento interno para organizar o quarto. Sua abertura é apresentada com pistões a gás, enquanto o material informa estrutura em madeira tratada e base reforçada.",
    paragraphs: ["O material apresenta opções de tecidos e cores e versões Solteiro, Casal, Queen e King. Dimensões externas, capacidade do compartimento e garantia devem ser confirmadas com o atendimento.", "A galeria mostra a base aberta e os detalhes comerciais do produto, preservando a apresentação original."],
    highlights: ["Compartimento interno", "Pistões a gás", "Madeira tratada", "Base reforçada"],
    specifications: [{ label: "Tipo", value: "Cama Box com baú" }, { label: "Abertura", value: "Pistões a gás" }, { label: "Estrutura informada", value: "Madeira tratada e base reforçada" }, { label: "Tamanhos apresentados", value: "Solteiro, Casal, Queen e King" }],
    media: numbered("cama-box-bau", "/Cama Box Baú/", "camaboxbau", [7, 5, 6, 1, 2, 3, 4], [1, 2, 3, 4], "Cama Box Baú"), sheet: 3, sizes: boxSizes,
});
export const camaBoxAuxiliar = line({
    slug: "cama-box-com-auxiliar", name: "Cama Box com Auxiliar", categoryId: "camas-box",
    summary: "Cama auxiliar embutida para ampliar as possibilidades de acomodação no quarto.",
    description: "A Cama Box com Auxiliar apresenta uma cama extra que se recolhe sob a principal. O material informa colchão auxiliar incluso, estrutura reforçada, revestimento em tecido premium e acabamento refinado.",
    paragraphs: ["As fichas apresentam altura de 25 cm e versões Solteiro, Casal, Queen e King. No Solteiro, a auxiliar é informada com 0,78 x 1,78 m; nas versões Casal e Queen, 0,88 x 1,88 m; na King, 0,96 x 1,88 m.", "Confirme as dimensões externas, os colchões incluídos e a configuração disponível com nossa equipe antes de planejar o ambiente."],
    highlights: ["Cama auxiliar embutida", "Colchão auxiliar incluso", "Estrutura reforçada", "Tecido premium"],
    specifications: [{ label: "Altura informada", value: "25 cm (base + colchão, conforme a ficha)" }, { label: "Estrutura", value: "Reforçada" }, { label: "Revestimento", value: "Tecido premium" }, { label: "Auxiliar", value: "Colchão auxiliar incluso" }, { label: "Medidas da auxiliar", value: "Solteiro: 0,78 x 1,78 m; Casal/Queen: 0,88 x 1,88 m; King: 0,96 x 1,88 m" }],
    media: numbered("cama-box-com-auxiliar", "/Cama Box com Auxiliar/", "camaboxcomauxiliar", [1, 2, 3, 4, 5, 6, 7, 8], [5, 6, 7, 8], "Cama Box com Auxiliar"), sheet: 4, sizes: tatameSizes,
});
export const pet = line({
    slug: "dream-pet", name: "Dream Pet", categoryId: "dream-pet",
    summary: "Cama para pets com superfície macia, acabamento escuro e formato dedicado ao descanso.",
    description: "A Dream Pet é apresentada como uma cama para cães e gatos, com superfície macia e aconchegante e estrutura resistente. O material comercial informa pastilhas magnéticas e infravermelho longo, em uma proposta de descanso para animais de diferentes portes.",
    paragraphs: ["As fotografias mostram a cama completa, com acabamento estofado escuro e superfície trabalhada. Consulte dimensões e capacidade adequadas ao seu pet.", "Composição do revestimento, higienização, garantia e versões disponíveis devem ser confirmadas com nossa equipe."],
    highlights: ["Para cães e gatos", "Superfície macia", "Estrutura resistente", "Magnético e infravermelho longo"],
    specifications: [{ label: "Nome comercial", value: "Dream Pet" }, { label: "Uso informado", value: "Cães e gatos" }, { label: "Superfície", value: "Macia e aconchegante" }, { label: "Recursos informados", value: "Pastilhas magnéticas e infravermelho longo" }],
    media: gallery("dream-pet", "/pet/", [1, 3, 2].map(n => ({ file: `colchao_pet${n}.png`, alt: n === 2 ? "Ficha comercial Dream Pet com superfície macia e recursos informados" : `Dream Pet completa em ambiente de sala, com cão deitado sobre a cama — vista ${n}` }))), sheet: 2, sizes: consultSizes,
});
export const complementos = [car, pillowTop, boxTatame, camaBox, camaBoxBau, camaBoxAuxiliar, pet];
