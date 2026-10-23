# Inventário e sincronização — preparação local

Inspeção do PostgreSQL executada exclusivamente com BEGIN READ ONLY, SELECT e
ROLLBACK. Identidade do banco confirmada; nenhuma escrita, importação ou
migração executada. Inventário detalhado: catalog-inventory.json.

## Resultado

- 12 produtos publicados no catálogo estático; zero documentos CMS de produtos
  e zero produtos relacionais no banco consultado. Faltam os 12 no CMS.
- 13 categorias/subcategorias estáticas; zero categorias relacionais e zero
  documentos CMS correspondentes. Faltam as 13.
- 82 arquivos de imagem em public; zero registros CMS de mídia.
- 76 imagens raster decodificadas, incluídas na biblioteca preparada.
- 6 SVGs inventariados, sem inclusão na biblioteca selecionável: file.svg,
  globe.svg, images/bedroom.svg, next.svg, vercel.svg e window.svg.
- Classificação por referência/pasta: 44 caminhos associados a produtos
  (43 conteúdos únicos), 13 versões antigas, 3 tecnologias, 2 identidade visual,
  20 sem associação publicada. A classificação não certifica o conteúdo visual.

Produtos: Colchão Recovery⁺, Diamond, Elegance, Majestic, Comfort Massageador,
Colchão Elite Azul, Colchão Elite Cinza, Poltrona Massageadora Divan,
Poltrona Massageadora House, Travesseiro Viscoelástico, Travesseiro Future e
Travesseiro Cervical Orto Plus.

Categorias principais: Colchões, Linha a Vácuo, Camas Box, Cabeceiras,
Travesseiros, Poltronas, Vibro Car e Dream Pet. Nomes/IDs internos preservados;
aliases comerciais da navegação não criam categorias extras.

Subcategorias: Poltronas → Linha Divan / Linha House; Travesseiros → Linha
Viscoelástico / Linha Future / Linha Cervical Orto Plus.

As pastas corpo-magnetico e corpo-white-fibra possuem três imagens cada,
agora incluídas no acervo preparado, mas não há produtos publicados associados.
Sensepro também possui imagens sem produto associado. Não criar produtos ou
especificações automaticamente a partir de nomes de arquivos.

## Causa da ausência na biblioteca

O importador anterior montava uma lista explícita de imagens referenciadas no
catálogo/apresentações e algumas páginas. Não varria todas as pastas de public.
Arquivo no disco não equivale a registro PostgreSQL. A mensagem “Conteúdo real
do site carregado para conferência” é a indicação correta da fonte estática,
não uma confirmação de importação. Não foi removida nem ocultada.

## Correções locais

- cms:inventory inventaria recursivamente public, valida dimensões/formato e
  registra referências, áreas, pastas e produtos. Ignora symlinks.
- --generate atualiza public-media.generated.ts, usado pelo importador existente
  e pela prévia administrativa; nenhum filesystem scan é feito no runtime.
- Mesmo ID SHA-256 truncado por URL, sem duplicação da mídia já conhecida;
  sincronização existente também evita duplicidade por URL em outro ID.
- Biblioteca e seletores existentes ganham nomes com produto/pasta/arquivo;
  campos de organização permanecem editáveis e pesquisáveis no painel.
- Imagens avulsas e versões antigas são identificadas como tal; não são
  publicadas automaticamente como produtos ou inseridas nas galerias aprovadas.
- Produtos mantêm textos, galerias ordenadas, especificações, tecnologias,
  categorias/subcategorias, SEO, IDs e URLs da fonte atual.

## Execução futura, somente após autorização

1. Confirmar backup restaurável do banco e arquivos. Revisar o JSON do inventário.
2. Publicar as correções locais por fluxo autorizado. Antes disso, o painel
   em produção continua utilizando o inventário da versão publicada.
3. OWNER: usar “Sincronizar registros existentes do site” em Produtos/Categorias.
   Revisar a prévia e confirmar. O fluxo existente é aditivo, transacional,
   respeita exclusões registradas e bloqueia conflitos; não sobrescreve edições.
   Biblioteca usa a mesma sincronização, com 76 mídias previstas no banco vazio.
4. Conferir os 12 produtos, 13 categorias/subcategorias e todas as galerias.
5. Testar o diretório persistente no próprio runtime pelo botão de Mídia.
   O teste real da Hostinger continua pendente. Não executar migração no build.
6. Para copiar imagens de produtos ao storage e atualizar referências, seguir
   HOSTINGER-STORAGE.md. Preservar arquivos e URLs originais em public. Logos,
   ícones e institucionais continuam estáticos. Biblioteca de imagens existentes
   não exige transferência física para funcionar.
7. Ativar leitura pública CMS somente após revisão e autorização específica.
   Nenhuma variável foi alterada nesta tarefa. Conteúdo futuro pode ser editado
   no painel sem deploy depois dessa ativação inicial.

Comandos de preparação: npm run cms:inventory -- --generate (somente arquivos
locais), npm run cms:inventory -- --with-cms (leitura do banco), npm run cms:import
(simulação local). Não confundir geração do inventário com importação real.
