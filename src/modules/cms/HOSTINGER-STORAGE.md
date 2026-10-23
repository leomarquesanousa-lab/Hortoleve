# Armazenamento local persistente na Hostinger

## Variável no ambiente da aplicação Node.js (hPanel)

```dotenv
CMS_STORAGE_PATH=/home/u604106388/hortoleve-storage/products
```

Não usar NEXT_PUBLIC_, nem configurar URL externa para este driver. CMS_STORAGE_PATH
tem prioridade sobre o adapter S3 existente; configuração inválida não usa fallback.
Nenhum arquivo .env foi modificado. Não há migração de banco.

## Ativação posterior à publicação autorizada

1. Confirmar no Gerenciador de Arquivos que o diretório existente pertence ao
   usuário u604106388 e fica fora de public_html, nodejs e hbuilds.
2. Usar permissão 0700 no diretório se o Node executar como esse mesmo usuário;
   garantir permissão de travessia nos diretórios pais. Não usar 0777. Se o
   processo executar com outra identidade, solicitar à Hostinger acesso por
   grupo/ACL restrita, sem abrir o diretório publicamente.
3. Configurar CMS_STORAGE_PATH nas variáveis da aplicação Node no hPanel.
   Publicar a alteração de código e reiniciar a aplicação pelo fluxo habitual,
   somente mediante autorização. Nada disso foi executado nesta tarefa.
4. Entrar como OWNER em /admin, módulo Mídia, clicar em
   “Verificar acesso ao storage local”. Esse POST autenticado, com validação
   de Origin, cria um arquivo de teste aleatório, lê e remove somente esse
   arquivo. Confirma o acesso sob a identidade real do runtime, sem banco
   de dados de conteúdo e sem tocar imagens existentes.
5. Testar um upload autorizado, abrir a URL /media/products/<uuid>.webp,
   associar a um produto e verificar substituição, ordenação e remoção da
   galeria. As alterações dos produtos usam o CMS existente e exigem sua
   importação/ativação prévia. Nenhum conteúdo foi importado nesta tarefa.
6. Confirmar com a Hostinger que esse diretório é montado no runtime e
   preservado em deploys/restarts; depois de uma publicação autorizada,
   conferir novamente a mesma URL. Habilitar backup desse diretório:
   backup PostgreSQL sozinho não inclui arquivos de imagens.

## Se a verificação falhar

Não há opção do hPanel comprovada aqui que libere acesso fora do sandbox.
Solicitar ao suporte: “Na aplicação Next.js do Cloud Startup, o processo
Node precisa ler e gravar /home/u604106388/hortoleve-storage/products.
Qual é o UID/GID do runtime? Esse caminho é visível e persistente entre
deploys e reinícios? Há isolamento, montagem ou ACL a configurar?”
Não mover os arquivos para public_html/hbuilds para contornar a restrição.
Não considerar o storage ativado até o teste pelo runtime passar.

## Segurança e conservação

- Mesmo endpoint de upload, sessão, permissão e CSRF existentes.
- 1–5 imagens por envio, até 6 MB cada, limite total real 24 MB;
  extensão, MIME e decodificação real PNG/JPEG/WebP; máximo 40 megapixels.
- Saída WebP sem metadados originais, nomes UUID imutáveis e criação exclusiva.
- Diretório deve existir; nenhum mkdir/chmod automático em produção.
- Rota pública aceita somente UUID.webp ou SHA256.png/jpg/webp migrado, não lista diretório, rejeita traversal,
  não segue symlinks em Linux e envia Content-Type fixo e nosniff.
- Substituição cria arquivo novo; exclusão da galeria remove a associação,
  sem apagar fotos físicas, inclusive as antigas. Sem coleta automática.
- URLs são públicas para quem as conhece, inclusive antes da publicação
  de um produto; não enviar documentos confidenciais ao acervo público.
- Todas as imagens antigas e seus caminhos continuam funcionando.

Referência: https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/

## Migração das imagens publicadas (preparada, não executada)

O comando inventaria as capas, galerias e SEO dos produtos estáticos (12 no
catálogo atual) e, com --with-cms, também rascunhos/publicações dos produtos
no banco. Não inclui imagens órfãs sem associação com produtos, logotipos,
ícones ou artes institucionais. Estes permanecem em public. A prévia local
sem --with-cms não consulta o banco e não informa quantos produtos há nele.

Os bytes originais são copiados sem conversão ou edição. O nome físico usa
SHA-256 + extensão para deduplicação e segurança; o manifesto mantém o nome
e o caminho originais. Nomes da biblioteca, IDs das galerias, alt, ordem,
dimensões, produtos, slugs e hierarquia não são alterados.

### Limitação da hospedagem Node.js gerenciada

A documentação da Hostinger informa que npm não pode ser executado via SSH
nos planos Business/Cloud gerenciados. Os comandos abaixo são referências
para um ambiente Node com terminal interativo; NÃO são instruções confirmadas
para executar diretamente no SSH do Cloud Startup.

Fonte: https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/

A Hostinger oferece execução Node em Avançado → Cron Jobs, com binário explícito,
caminho do script e ambiente carregado por --env-file. Isso não fornece terminal
interativo: as etapas --copy, --apply-cms e --rollback-cms deste script recusam
execução sem TTY. Não remover essa proteção nem colocar a migração no build.
Mesmo a prévia por cron exige confirmar Node 24, arquivos fonte/dependências
disponíveis, diretório de trabalho da aplicação e caminho real do ambiente.
Não agendar migração recorrente para contornar essa limitação.

Fonte: https://www.hostinger.com/support/how-to-run-cron-jobs-for-node-js-websites-at-hostinger/

Para a publicação de teste, basta manter public e usar o teste de storage do
painel como OWNER. A migração permanece independente e pendente.

Para transferência posterior pelo Gerenciador de Arquivos, é possível executar
--copy num ambiente local Node 24 com terminal interativo e CMS_STORAGE_PATH
apontando para uma pasta de preparação fora do projeto. Enviar os arquivos
SHA256.ext resultantes para o diretório persistente, preservando os nomes.
Não enviar o diretório inteiro public, credenciais ou relatórios ao acervo público.
Essa transferência NÃO atualiza o CMS. Antes de trocar referências, ainda é
obrigatório validar todos os hashes, leitura pelo runtime e URLs HTTPS no servidor.
Não executar --apply-cms localmente contando com as cópias locais: a validação
deve alcançar o storage real de produção. A execução integral exige um terminal
Node interativo com acesso ao storage real confirmado pelo suporte, ou uma
futura adaptação administrativa protegida, revisada e autorizada separadamente.
Essa adaptação não foi implementada nesta publicação de teste.

Comandos de referência em ambiente interativo compatível, após revisão e autorização:

```sh
# Prévia local: nenhuma conexão nem escrita, sem necessidade de storage
npm run cms:media-migrate

# Prévia incluindo CMS real: somente leitura do banco
NODE_ENV=production npm run cms:media-migrate -- --with-cms --out=/home/u604106388/hortoleve-storage/media-plan.json

# Depois de backup do banco E do diretório, aprovação e teste de runtime
NODE_ENV=production CMS_MEDIA_MIGRATION_ALLOWED=true npm run cms:media-migrate -- --with-cms --copy --allow-production-write

# Validar URLs públicas copiadas antes desta etapa; requer CMS sincronizado
NODE_ENV=production CMS_MEDIA_MIGRATION_ALLOWED=true npm run cms:media-migrate -- --apply-cms --allow-production-write

# Se necessário: restaura referências, sem excluir nenhum arquivo
NODE_ENV=production CMS_MEDIA_MIGRATION_ALLOWED=true npm run cms:media-migrate -- --rollback-cms --allow-production-write
```

CMS_STORAGE_PATH deve estar disponível também no processo SSH; variáveis do
hPanel não são necessariamente herdadas pelo terminal. Exportar somente esse
caminho se necessário. Não copiar segredos para comandos/logs. O script carrega
o ambiente existente com @next/env. Não cadastrar CMS_MEDIA_MIGRATION_ALLOWED
permanentemente no hPanel: a autorização acima vale somente para o comando.
Todos os modos de escrita exigem terminal interativo, flag e frase de confirmação.

O plano opcional usa criação exclusiva: não sobrescreve um relatório anterior.
Conferir o inventário e a existência de todos os produtos no CMS antes da cópia.
Se faltarem produtos, usar primeiro o fluxo add-only de sincronização já existente,
com autorização específica. Não há sincronização automática oculta nesta migração.

A cópia verifica formato real, tamanho, SHA-256 antes/depois e não sobrescreve
destinos existentes. Reexecutar --copy é idempotente se as cópias estiverem íntegras.
Um arquivo parcial/conflitante interrompe a execução; revisar manualmente, sem
apagar originais. Permissões no SSH não comprovam permissões no runtime Node.

--apply-cms confirma todas as cópias antes de uma transação atômica com o mesmo
lock do CMS. Atualiza apenas URLs exatas nos documentos CMS e ProductMedia,
inclusive referências em home/SEO para as mesmas imagens, incrementando revisões.
Registra valores anteriores em SiteSetting cms-media-migration:v1 para reversão.
Não toca usuários, autenticação ou categorias. Reaplicação é bloqueada.
Uma edição concorrente exige nova prévia. Manter janela sem edição durante as etapas.

--rollback-cms é atômico e só restaura documentos/associações se não tiverem sido
editados desde a migração. Caso contrário, interrompe para conciliação manual,
preservando as edições. Nunca remove arquivos; backup externo continua obrigatório.

As URLs antigas continuam válidas porque os originais ficam em public; os slugs
das páginas não mudam. CMS_PUBLIC_ENABLED=true é necessário para o site consumir
as publicações do CMS. A mudança inicial de código/configuração requer publicação
autorizada; edições futuras de conteúdo não exigem deploy.

Antes de qualquer exclusão futura de public: confirmar backup restaurável, cópia
íntegra, URLs HTTP e next/image, todos os produtos, galeria/SEO/home, teste em
desktop/mobile e persistência após novo deploy/reinício. A fallback estática ainda
usa public: remover arquivos agora quebraria essa proteção. Esta implementação
não oferece comando de exclusão de originais.
