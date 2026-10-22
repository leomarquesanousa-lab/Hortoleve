import type { Data } from "../cms/contracts";
export interface TextSlot {key:string;label:string;text:string}
export interface ImageSlot {key:string;label:string;src:string;alt:string;width:number;height:number}
export interface PageTemplate {name:string;slug:string;texts:TextSlot[];images:ImageSlot[];slides?:Data[];published:boolean}
export const pageDefaults: Record<"sobre"|"tecnologias"|"contato"|"explorer"|"home",PageTemplate> = {
  "sobre": {
    "name": "Sobre a Hortoleve",
    "slug": "sobre",
    "texts": [
      {
        "key": "sobre-0",
        "label": "P — QUEM SOMOS · HORTOLEVE",
        "text": "QUEM SOMOS · HORTOLEVE"
      },
      {
        "key": "sobre-1",
        "label": "H1 — Tecnologia, conforto e sofisticação para o seu descanso.",
        "text": "Tecnologia, conforto e sofisticação para o seu descanso."
      },
      {
        "key": "sobre-2",
        "label": "P — Acreditamos que uma boa noite de sono vai muito além do descanso.",
        "text": "Acreditamos que uma boa noite de sono vai muito além do descanso. É um momento de renovação, equilíbrio e bem-estar."
      },
      {
        "key": "sobre-3",
        "label": "FIGCAPTION — O universo Hortoleve, em cada detalhe.",
        "text": "O universo Hortoleve, em cada detalhe."
      },
      {
        "key": "sobre-4",
        "label": "P — A NOSSA ESSÊNCIA",
        "text": "A NOSSA ESSÊNCIA"
      },
      {
        "key": "sobre-5",
        "label": "H2 — Cada detalhe importa.",
        "text": "Cada detalhe importa."
      },
      {
        "key": "sobre-6",
        "label": "P — É com essa visão que apresentamos soluções que unem conforto, ino",
        "text": "É com essa visão que apresentamos soluções que unem conforto, inovação e sofisticação. Nossa atuação é dedicada ao universo dos colchões de alto padrão, combinando materiais selecionados, acabamentos refinados e diferentes experiências de conforto."
      },
      {
        "key": "sobre-7",
        "label": "P — Da escolha dos tecidos à estrutura dos colchões, valorizamos qual",
        "text": "Da escolha dos tecidos à estrutura dos colchões, valorizamos qualidade, funcionalidade e elegância. Nossas linhas incorporam recursos como massagem, cromoterapia, infravermelho longo e componentes magnéticos, além de funcionalidades inteligentes e integração com assistentes virtuais em modelos selecionados."
      },
      {
        "key": "sobre-8",
        "label": "P — Colchão Recovery⁺, Diamond, Elegance, Majestic e Confort compõem um po",
        "text": "Colchão Recovery⁺, Diamond, Elegance, Majestic e Confort compõem um portfólio pensado para diferentes preferências, com identidade própria e atenção ao design, à tecnologia e ao conforto."
      },
      {
        "key": "sobre-9",
        "label": "P — O QUE NOS MOVE",
        "text": "O QUE NOS MOVE"
      },
      {
        "key": "sobre-10",
        "label": "H2 — Nossa missão",
        "text": "Nossa missão"
      },
      {
        "key": "sobre-11",
        "label": "P — Proporcionar experiências de descanso diferenciadas por meio de c",
        "text": "Proporcionar experiências de descanso diferenciadas por meio de colchões que combinam conforto, tecnologia e sofisticação, respeitando as necessidades e preferências de cada cliente."
      },
      {
        "key": "sobre-12",
        "label": "P — Queremos contribuir para uma escolha bem informada, com atendimen",
        "text": "Queremos contribuir para uma escolha bem informada, com atendimento próximo e produtos que expressem qualidade e cuidado em cada detalhe."
      },
      {
        "key": "sobre-13",
        "label": "P — PARA ONDE OLHAMOS",
        "text": "PARA ONDE OLHAMOS"
      },
      {
        "key": "sobre-14",
        "label": "H2 — Nossa visão",
        "text": "Nossa visão"
      },
      {
        "key": "sobre-15",
        "label": "P — Ser reconhecida como referência em colchões de alto padrão, pela ",
        "text": "Ser reconhecida como referência em colchões de alto padrão, pela inovação, pela apresentação sofisticada dos produtos e pela excelência no relacionamento com clientes, lojistas e parceiros comerciais."
      },
      {
        "key": "sobre-16",
        "label": "P — Acompanhar a evolução das tecnologias de conforto, aprimorar noss",
        "text": "Acompanhar a evolução das tecnologias de conforto, aprimorar nossas soluções e fortalecer relações baseadas na confiança e na satisfação."
      },
      {
        "key": "sobre-17",
        "label": "P — PRINCÍPIOS QUE NOS GUIAM",
        "text": "PRINCÍPIOS QUE NOS GUIAM"
      },
      {
        "key": "sobre-18",
        "label": "H2 — Nossos valores",
        "text": "Nossos valores"
      },
      {
        "key": "sobre-19",
        "label": "P — PROXIMIDADE EM CADA ESCOLHA",
        "text": "PROXIMIDADE EM CADA ESCOLHA"
      },
      {
        "key": "sobre-20",
        "label": "H2 — Atendimento que valoriza você",
        "text": "Atendimento que valoriza você"
      },
      {
        "key": "sobre-21",
        "label": "P — Escolher um colchão é uma decisão importante e pessoal. Por isso,",
        "text": "Escolher um colchão é uma decisão importante e pessoal. Por isso, valorizamos o atendimento consultivo: ouvir suas preferências e apresentar as características, tecnologias, dimensões e diferenciais de cada linha."
      },
      {
        "key": "sobre-22",
        "label": "P — Também buscamos construir relações de confiança com lojistas e re",
        "text": "Também buscamos construir relações de confiança com lojistas e revendedores, oferecendo informações sobre o portfólio e seus diferenciais comerciais. Do primeiro contato à escolha do colchão, nossa proposta é uma experiência acolhedora, profissional e transparente."
      },
      {
        "key": "sobre-23",
        "label": "P — NOSSO COMPROMISSO",
        "text": "NOSSO COMPROMISSO"
      },
      {
        "key": "sobre-24",
        "label": "H2 — O seu descanso, no centro de tudo.",
        "text": "O seu descanso, no centro de tudo."
      },
      {
        "key": "sobre-25",
        "label": "P — Do toque dos tecidos aos recursos inteligentes presentes em deter",
        "text": "Do toque dos tecidos aos recursos inteligentes presentes em determinados modelos, cada linha Hortoleve combina tecnologia, conforto e identidade própria para valorizar a experiência de cada pessoa."
      },
      {
        "key": "sobre-26",
        "label": "P — Hortoleve. Porque descansar bem é viver melhor.",
        "text": "Hortoleve. Porque descansar bem é viver melhor."
      },
      {
        "key": "values-0-title",
        "label": "Qualidade em cada detalhe — título",
        "text": "Qualidade em cada detalhe"
      },
      {
        "key": "values-0-body",
        "label": "Qualidade em cada detalhe — descrição",
        "text": "Materiais, acabamentos e características que valorizam a experiência de descanso."
      },
      {
        "key": "values-1-title",
        "label": "Inovação com propósito — título",
        "text": "Inovação com propósito"
      },
      {
        "key": "values-1-body",
        "label": "Inovação com propósito — descrição",
        "text": "Tecnologia para ampliar as possibilidades de conforto e personalização."
      },
      {
        "key": "values-2-title",
        "label": "Compromisso com o cliente — título",
        "text": "Compromisso com o cliente"
      },
      {
        "key": "values-2-body",
        "label": "Compromisso com o cliente — descrição",
        "text": "Escuta atenta para compreender necessidades e oferecer orientações adequadas."
      },
      {
        "key": "values-3-title",
        "label": "Transparência e confiança — título",
        "text": "Transparência e confiança"
      },
      {
        "key": "values-3-body",
        "label": "Transparência e confiança — descrição",
        "text": "Relações claras, responsáveis e duradouras com clientes e parceiros."
      },
      {
        "key": "values-4-title",
        "label": "Elegância e sofisticação — título",
        "text": "Elegância e sofisticação"
      },
      {
        "key": "values-4-body",
        "label": "Elegância e sofisticação — descrição",
        "text": "Conforto e design juntos para tornar o quarto um ambiente acolhedor e especial."
      }
    ],
    "images": [
      {
        "key": "showroom",
        "label": "Showroom institucional",
        "src": "/showroom/Luxury Bedding Showroom in Warm Green and Gold.png",
        "alt": "Showroom da Hortoleve com a apresentação das linhas de colchões",
        "width": 1536,
        "height": 1024
      }
    ],
    "published": true
  },
  "tecnologias": {
    "name": "Tecnologias Hortoleve",
    "slug": "tecnologias",
    "texts": [
      {
        "key": "tecnologias-6",
        "label": "P — 01 / ENGENHARIA DO CONFORTO",
        "text": "01 / ENGENHARIA DO CONFORTO"
      },
      {
        "key": "tecnologias-7",
        "label": "H2 — Conheça a estrutura por trás do conforto",
        "text": "Conheça a estrutura por trás do conforto"
      },
      {
        "key": "tecnologias-8",
        "label": "FIGCAPTION — Diagrama ilustrativo, em tratamento visual de blueprint. As legen",
        "text": "Diagrama ilustrativo, em tratamento visual de blueprint. As legendas e interfaces da arte são conceituais; não constituem especificações, comprovação de efeitos ou funções disponíveis."
      },
      {
        "key": "tecnologias-9",
        "label": "P — 02 / EXPLORE OS RECURSOS",
        "text": "02 / EXPLORE OS RECURSOS"
      },
      {
        "key": "tecnologias-10",
        "label": "H2 — Tecnologia que acompanha o seu descanso",
        "text": "Tecnologia que acompanha o seu descanso"
      },
      {
        "key": "tecnologias-11",
        "label": "FIGCAPTION — Representação conceitual. Luzes, pontos de massagem e interface n",
        "text": "Representação conceitual. Luzes, pontos de massagem e interface não documentam um produto ou aplicativo real."
      },
      {
        "key": "tecnologias-12",
        "label": "P — 03 / TECNOLOGIAS POR LINHA",
        "text": "03 / TECNOLOGIAS POR LINHA"
      },
      {
        "key": "tecnologias-13",
        "label": "H2 — Encontre a tecnologia ideal para você",
        "text": "Encontre a tecnologia ideal para você"
      },
      {
        "key": "tecnologias-14",
        "label": "P — Compare os dados comerciais cadastrados. Recursos e acessórios po",
        "text": "Compare os dados comerciais cadastrados. Recursos e acessórios podem variar por versão; “A confirmar” indica informação ainda não documentada na apresentação dos produtos."
      },
      {
        "key": "tecnologias-15",
        "label": "P — As ilustrações não foram usadas para confirmar recursos. Consulte",
        "text": "As ilustrações não foram usadas para confirmar recursos. Consulte a equipe sobre composição exata, versões, acessórios e disponibilidade."
      },
      {
        "key": "tecnologias-16",
        "label": "P — UMA ESCOLHA COM INFORMAÇÃO",
        "text": "UMA ESCOLHA COM INFORMAÇÃO"
      },
      {
        "key": "tecnologias-17",
        "label": "P — Descubra qual linha Hortoleve combina com você.",
        "text": "Descubra qual linha Hortoleve combina com você."
      },
      {
        "key": "tecnologias-18",
        "label": "A — Falar com um consultor ↗",
        "text": "Falar com um consultor ↗"
      },
      {
        "key": "structure-0-title",
        "label": "Pillow top e revestimentos — título",
        "text": "Pillow top e revestimentos"
      },
      {
        "key": "structure-0-body",
        "label": "Pillow top e revestimentos — descrição",
        "text": "A camada de contato e os tecidos participam da sensação de toque e do acabamento. Pillow, bordado e revestimento variam conforme a linha."
      },
      {
        "key": "structure-1-title",
        "label": "Espumas e densidades — título",
        "text": "Espumas e densidades"
      },
      {
        "key": "structure-1-body",
        "label": "Espumas e densidades — descrição",
        "text": "Densidades, combinações e características das espumas influenciam a resposta do conjunto. Densidade não é sinônimo de maciez."
      },
      {
        "key": "structure-2-title",
        "label": "Estruturas perfiladas — título",
        "text": "Estruturas perfiladas"
      },
      {
        "key": "structure-2-body",
        "label": "Estruturas perfiladas — descrição",
        "text": "O perfilado apresenta uma superfície com relevos. O nome Rabatan aparece nos materiais comerciais de linhas selecionadas; posição e composição exigem a ficha de cada modelo."
      },
      {
        "key": "structure-3-title",
        "label": "Sistemas de massagem — título",
        "text": "Sistemas de massagem"
      },
      {
        "key": "structure-3-body",
        "label": "Sistemas de massagem — descrição",
        "text": "Motores produzem vibração controlada nos modelos equipados. Quantidades, modos e controles devem ser conferidos por versão."
      },
      {
        "key": "structure-4-title",
        "label": "Recursos integrados — título",
        "text": "Recursos integrados"
      },
      {
        "key": "structure-4-body",
        "label": "Recursos integrados — descrição",
        "text": "Iluminação, som e conectividade podem compor o produto. A presença de um recurso na ilustração não indica disponibilidade em todas as linhas."
      },
      {
        "key": "explorer-0",
        "label": "H3 — Vibração controlada, conforme o modelo.",
        "text": "Vibração controlada, conforme o modelo."
      },
      {
        "key": "explorer-1",
        "label": "P — Determinadas linhas apresentam sistemas massageadores por vibraçã",
        "text": "Determinadas linhas apresentam sistemas massageadores por vibração, acionados pelos controles compatíveis. A quantidade de motores e os modos disponíveis dependem do modelo e da versão."
      },
      {
        "key": "explorer-2",
        "label": "P — Nos materiais comerciais cadastrados, Colchão Recovery⁺ informa 8 moto",
        "text": "Nos materiais comerciais cadastrados, Colchão Recovery⁺ informa 8 motores e 20 tipos de massagem; Elegance informa 6 motores e 20 massagens. Para as outras linhas, consulte os detalhes com a equipe."
      },
      {
        "key": "explorer-3",
        "label": "H3 — Uma demonstração de luz e cor.",
        "text": "Uma demonstração de luz e cor."
      },
      {
        "key": "explorer-4",
        "label": "P — Nos modelos com cromoterapia, a iluminação colorida é integrada a",
        "text": "Nos modelos com cromoterapia, a iluminação colorida é integrada ao colchão. Posição das luzes e forma de acionamento variam por linha e versão."
      },
      {
        "key": "explorer-5",
        "label": "LEGEND — Escolha uma cor demonstrativa",
        "text": "Escolha uma cor demonstrativa"
      },
      {
        "key": "explorer-6",
        "label": "P — Demonstração visual em",
        "text": "Demonstração visual em"
      },
      {
        "key": "explorer-7",
        "label": "P — . Não controla um colchão real e não representa efeitos sobre a s",
        "text": ". Não controla um colchão real e não representa efeitos sobre a saúde."
      },
      {
        "key": "explorer-8",
        "label": "H3 — Recursos que variam entre linhas e versões.",
        "text": "Recursos que variam entre linhas e versões."
      },
      {
        "key": "explorer-9",
        "label": "LI — Controle Cromos LCD: declarado nos materiais de Majestic e Confor",
        "text": "Controle Cromos LCD: declarado nos materiais de Majestic e Confort. Diamond apresenta Controle Cromos LCD ou Kit App."
      },
      {
        "key": "explorer-10",
        "label": "LI — Diamond: som Bluetooth, som embutido e carregamento por indução, ",
        "text": "Diamond: som Bluetooth, som embutido e carregamento por indução, conforme os materiais comerciais."
      },
      {
        "key": "explorer-11",
        "label": "LI — Elegance: versões Cromos ou Kit Therapy. A conexão com Alexa Echo",
        "text": "Elegance: versões Cromos ou Kit Therapy. A conexão com Alexa Echo corresponde à versão Kit Therapy."
      },
      {
        "key": "explorer-12",
        "label": "P — Compatibilidade, acessórios e funções devem ser conferidos para a",
        "text": "Compatibilidade, acessórios e funções devem ser conferidos para a versão escolhida; as artes não comprovam funcionalidades de aplicativos."
      },
      {
        "key": "explorer-13",
        "label": "H3 — Entenda os materiais além do nome.",
        "text": "Entenda os materiais além do nome."
      },
      {
        "key": "explorer-14",
        "label": "P — Densidade indica a quantidade de material em um volume de espuma;",
        "text": "Densidade indica a quantidade de material em um volume de espuma; maciez descreve a sensação ao toque, suporte diz respeito à sustentação e resiliência à recuperação após compressão. Esses conceitos não são equivalentes."
      },
      {
        "key": "explorer-15",
        "label": "P — Confort declara D33 + HR, camada perfilada D40 e acabamento Confo",
        "text": "Confort declara D33 + HR, camada perfilada D40 e acabamento Confort Soft D28, com opções em Suede e Linho. HR identifica uma espuma de alta resiliência. A composição e o revestimento devem ser consultados por linha."
      },
      {
        "key": "explorer-16",
        "label": "P — Infravermelho longo e componentes magnéticos são recursos declara",
        "text": "Infravermelho longo e componentes magnéticos são recursos declarados em materiais dos produtos. “Energia Quântica” é uma nomenclatura comercial, sem efeito científico ou benefício clínico demonstrado nesta apresentação."
      }
    ],
    "images": [
      {
        "key": "engineering",
        "label": "Diagrama de engenharia",
        "src": "/tecnologia/Smart Mattress Technology Showcase.png",
        "width": 1536,
        "height": 1024,
        "alt": "Diagrama conceitual de colchão com detalhes ilustrados de motores, iluminação, controle e conectividade"
      },
      {
        "key": "integrated",
        "label": "Ilustração de cromoterapia e massagem",
        "src": "/tecnologia/cromoterapia e massagem.png",
        "width": 1672,
        "height": 941,
        "alt": "Ilustração conceitual de colchão com pontos de vibração, iluminação colorida e controle"
      }
    ],
    "published": true,
    "slides": [
      {
        "key": "layers",
        "label": "Banner de tecnologias",
        "src": "/tecnologia/Tecnologias Hortoleve_ Conforto Inteligente.png",
        "width": 1672,
        "height": 941,
        "alt": "Representação conceitual de colchão em camadas separadas, com legendas de materiais e recursos integrados",
        "name": "Tecnologias Hortoleve",
        "eyebrow": "MATERIAIS · DESIGN · TECNOLOGIA",
        "subtitle": "A inovação por trás de cada experiência de conforto.",
        "text": "Um olhar sobre materiais e recursos que dão identidade às nossas linhas.",
        "cta": "Explore a estrutura",
        "href": "#engenharia",
        "caption": "Vista explodida conceitual. As camadas ilustradas não representam a construção certificada de um modelo.",
        "visible": true
      }
    ]
  },
  "contato": {
    "name": "Atendimento personalizado",
    "slug": "contato",
    "texts": [
      {
        "key": "contato-0",
        "label": "P — ATENDIMENTO HORTOLEVE",
        "text": "ATENDIMENTO HORTOLEVE"
      },
      {
        "key": "contato-1",
        "label": "H1 — Uma experiência de atendimento à altura do seu conforto.",
        "text": "Uma experiência de atendimento à altura do seu conforto."
      },
      {
        "key": "contato-2",
        "label": "P — Conte-nos o que você procura. Nossa equipe está pronta para ajuda",
        "text": "Conte-nos o que você procura. Nossa equipe está pronta para ajudar você a encontrar a solução ideal."
      },
      {
        "key": "contato-3",
        "label": "P — Uma conversa sobre suas preferências, com atenção a cada detalhe.",
        "text": "Uma conversa sobre suas preferências, com atenção a cada detalhe."
      },
      {
        "key": "contato-4",
        "label": "P — O canal de recebimento ainda está em configuração. Você pode prep",
        "text": "O canal de recebimento ainda está em configuração. Você pode preparar e revisar sua solicitação, mas o envio permanece indisponível."
      }
    ],
    "images": [],
    "published": true
  },
  "explorer": {
    "name": "Experiências de tecnologia",
    "slug": "explorer",
    "texts": [
      {
        "key": "explorer-0",
        "label": "H3 — Vibração controlada, conforme o modelo.",
        "text": "Vibração controlada, conforme o modelo."
      },
      {
        "key": "explorer-1",
        "label": "P — Determinadas linhas apresentam sistemas massageadores por vibraçã",
        "text": "Determinadas linhas apresentam sistemas massageadores por vibração, acionados pelos controles compatíveis. A quantidade de motores e os modos disponíveis dependem do modelo e da versão."
      },
      {
        "key": "explorer-2",
        "label": "P — Nos materiais comerciais cadastrados, Colchão Recovery⁺ informa 8 moto",
        "text": "Nos materiais comerciais cadastrados, Colchão Recovery⁺ informa 8 motores e 20 tipos de massagem; Elegance informa 6 motores e 20 massagens. Para as outras linhas, consulte os detalhes com a equipe."
      },
      {
        "key": "explorer-3",
        "label": "H3 — Uma demonstração de luz e cor.",
        "text": "Uma demonstração de luz e cor."
      },
      {
        "key": "explorer-4",
        "label": "P — Nos modelos com cromoterapia, a iluminação colorida é integrada a",
        "text": "Nos modelos com cromoterapia, a iluminação colorida é integrada ao colchão. Posição das luzes e forma de acionamento variam por linha e versão."
      },
      {
        "key": "explorer-5",
        "label": "LEGEND — Escolha uma cor demonstrativa",
        "text": "Escolha uma cor demonstrativa"
      },
      {
        "key": "explorer-6",
        "label": "P — Demonstração visual em",
        "text": "Demonstração visual em"
      },
      {
        "key": "explorer-7",
        "label": "P — . Não controla um colchão real e não representa efeitos sobre a s",
        "text": ". Não controla um colchão real e não representa efeitos sobre a saúde."
      },
      {
        "key": "explorer-8",
        "label": "H3 — Recursos que variam entre linhas e versões.",
        "text": "Recursos que variam entre linhas e versões."
      },
      {
        "key": "explorer-9",
        "label": "LI — Controle Cromos LCD: declarado nos materiais de Majestic e Confor",
        "text": "Controle Cromos LCD: declarado nos materiais de Majestic e Confort. Diamond apresenta Controle Cromos LCD ou Kit App."
      },
      {
        "key": "explorer-10",
        "label": "LI — Diamond: som Bluetooth, som embutido e carregamento por indução, ",
        "text": "Diamond: som Bluetooth, som embutido e carregamento por indução, conforme os materiais comerciais."
      },
      {
        "key": "explorer-11",
        "label": "LI — Elegance: versões Cromos ou Kit Therapy. A conexão com Alexa Echo",
        "text": "Elegance: versões Cromos ou Kit Therapy. A conexão com Alexa Echo corresponde à versão Kit Therapy."
      },
      {
        "key": "explorer-12",
        "label": "P — Compatibilidade, acessórios e funções devem ser conferidos para a",
        "text": "Compatibilidade, acessórios e funções devem ser conferidos para a versão escolhida; as artes não comprovam funcionalidades de aplicativos."
      },
      {
        "key": "explorer-13",
        "label": "H3 — Entenda os materiais além do nome.",
        "text": "Entenda os materiais além do nome."
      },
      {
        "key": "explorer-14",
        "label": "P — Densidade indica a quantidade de material em um volume de espuma;",
        "text": "Densidade indica a quantidade de material em um volume de espuma; maciez descreve a sensação ao toque, suporte diz respeito à sustentação e resiliência à recuperação após compressão. Esses conceitos não são equivalentes."
      },
      {
        "key": "explorer-15",
        "label": "P — Confort declara D33 + HR, camada perfilada D40 e acabamento Confo",
        "text": "Confort declara D33 + HR, camada perfilada D40 e acabamento Confort Soft D28, com opções em Suede e Linho. HR identifica uma espuma de alta resiliência. A composição e o revestimento devem ser consultados por linha."
      },
      {
        "key": "explorer-16",
        "label": "P — Infravermelho longo e componentes magnéticos são recursos declara",
        "text": "Infravermelho longo e componentes magnéticos são recursos declarados em materiais dos produtos. “Energia Quântica” é uma nomenclatura comercial, sem efeito científico ou benefício clínico demonstrado nesta apresentação."
      }
    ],
    "images": [],
    "published": true
  },
  "home": {
    "name": "Home Hortoleve",
    "slug": "home",
    "texts": [
      {
        "key": "home-0",
        "label": "COLCHÕES HORTOLEVE",
        "text": "COLCHÕES HORTOLEVE"
      },
      {
        "key": "home-1",
        "label": "Conheça nossas linhas",
        "text": "Conheça nossas linhas"
      },
      {
        "key": "home-8",
        "label": "TECNOLOGIAS & EXPERIÊNCIAS",
        "text": "TECNOLOGIAS & EXPERIÊNCIAS"
      },
      {
        "key": "home-9",
        "label": "Descubra novas possibilidades.",
        "text": "Descubra novas possibilidades."
      },
      {
        "key": "home-10",
        "label": "Recursos previstos para a evolução do site. Conheça o que está no plan",
        "text": "Recursos previstos para a evolução do site. Conheça o que está no planejamento."
      },
      {
        "key": "home-11",
        "label": "/ EM PLANEJAMENTO",
        "text": "/ EM PLANEJAMENTO"
      },
      {
        "key": "home-19",
        "label": "PODEMOS AJUDAR?",
        "text": "PODEMOS AJUDAR?"
      },
      {
        "key": "home-20",
        "label": "Antes de escolher, descubra.",
        "text": "Antes de escolher, descubra."
      },
      {
        "key": "home-21",
        "label": "UMA CONVERSA É UM BOM COMEÇO",
        "text": "UMA CONVERSA É UM BOM COMEÇO"
      },
      {
        "key": "home-23",
        "label": "Conheça a proposta de atendimento e os próximos passos.",
        "text": "Conheça a proposta de atendimento e os próximos passos."
      }
    ],
    "images": [],
    "published": true
  }
};
export function getPageText(content: Data | null | undefined, page: keyof typeof pageDefaults, key: string) { const entries = Array.isArray(content?.texts) ? content.texts as Data[] : []; return String(entries.find(t => t.key === key)?.text ?? pageDefaults[page].texts.find(t => t.key === key)?.text ?? ""); }
export function getPageImage(content: Data | null | undefined, key: string, fallback: {src:string;alt:string;width:number;height:number}) { const image = (Array.isArray(content?.images) ? content.images as Data[] : []).find(i => i.key === key) ?? fallback; return {src:String(image.src),alt:String(image.alt),width:Number(image.width),height:Number(image.height)}; }
