# CMS Hortoleve — implementação e ativação controlada

## Auditoria de origem

A fundação já tinha Better Auth, OWNER/ADMIN, Prisma/PostgreSQL, Dashboard com
contagens e nove módulos sem CRUD. O site usava catálogo, apresentações e textos
estáticos; leads não eram entregues. Não havia biblioteca ou storage durável.
A correção local do login atrás do proxy foi preservada e coberta por testes.

## Implementado localmente

- APIs administrativas únicas em `/api/admin/[resource]`, sessão e permissão no
  servidor, CSRF por origem configurada, limite de 200 KB e erros sem dados internos.
- Editor de produtos com categorias/tecnologias selecionáveis, apresentação,
  resumo, materiais, benefícios, especificações, medidas, imagem de card e galeria
  com alt/capa/reordenação. Rascunho e publicação separados; prévia autenticada.
- Categorias e tecnologias: cadastro, edição, ordem/status, exclusão condicionada
  a referências. Slugs únicos; alterações publicadas criam redirecionamentos de
  catálogo, resolvidos com HTTP 301 pelo proxy quando o CMS está ativo.
- Biblioteca: seleção de imagens existentes, upload múltiplo (5 por envio, 6 MB
  por arquivo, 24 MB total), validação e decodificação PNG/JPEG/WebP com limite
  de 40 milhões de pixels; reprocessamento WebP remove metadados. SVG/HTML,
  imagens animadas e formatos desconhecidos são recusados. Uploads vão para S3/R2,
  nunca para disco efêmero. Substituição cria URL nova e atualiza referências.
  Remoção da biblioteca verifica referências; objetos e originais são preservados.
- Editor da Home: os três banners atuais, até cinco no total, imagem, texto,
  botão, destino, ordem, visibilidade e prévia individual; textos reais das seções,
  experiências e FAQ. Os componentes e a composição aprovados são reutilizados.
- Sobre/Tecnologias/Contato: campos vinculados aos textos e imagens reais, sem
  editor de páginas arbitrárias. Prévia e publicação utilizam os mesmos componentes.
  Abas, comparação de tecnologias e formulário de contato permanecem presentes.
  Tecnologias tinha um banner estático, não um carrossel: começa com um slide;
  controles manuais acessíveis aparecem somente quando há mais de um, até cinco.
- Configuração compartilhada: empresa, WhatsApp, e-mail, telefone, endereço,
  horários, logo, rodapé e redes. Somente perfis válidos da plataforma são aceitos.
- SEO por rota: title/description/canonical/OG/indexação, sitemap/robots derivados
  dos publicados e JSON-LD de produto sem preço/checkout. Sem HTML arbitrário.
- Leads: gravação real no PostgreSQL, recibo somente após persistência, consentimento,
  assunto/produto/origem, busca/filtro/paginação e tratamento de status/notas.
  Honeypot, limite por telefone via HMAC e teto global compartilhado no banco.
  A listagem atual carrega até os 1.000 registros mais recentes e pagina 15 por tela;
  paginação de consulta no servidor para volumes maiores é uma evolução pendente.
- Usuários: criar/editar/excluir/desativar, permissões delegadas, hash bcrypt,
  revogação de sessões após edição, bloqueio da exclusão da própria conta e do
  rebaixamento/desativação/exclusão do último OWNER ativo. Somente OWNER gerencia.
- Auditoria transacional de publicação, edição, exclusão, usuários e uploads.
  Revisão otimista e lock compartilhado evitam sobrescritas concorrentes.
- Dashboard consulta produtos, categorias, leads e usuários reais. Analytics tem
  Measurement ID, habilitação após consentimento e consulta explícita à Data API.
  Sem configuração/autorização externa, não mostra números ou conexão fictícios.

## Persistência e migrações

Nenhuma alteração de schema ou nova migração SQL foi necessária. `SiteSetting`
guarda documentos versionados (`cms:recurso:id`) com rascunho/publicação. Os models
Product, Category, ProductMedia, SeoSetting e SocialLink recebem a versão publicada
relacional; ContactLead, User, Account, Session e AuditLog continuam reutilizados.
Conteúdo extenso e apresentação permanecem em JSON, conforme a arquitetura original.

Nenhuma migração, importação ou escrita de dados de produção foi executada nesta
tarefa. O OWNER existente não foi alterado. Imagens locais, inclusive trabalho
não commitado, foram preservadas. Nenhum `_old`/backup foi adicionado ao Git.

## Importação segura dos dados estáticos

```powershell
npm.cmd run cms:import
```

Sem `--apply`, o comando apenas prepara e conta documentos locais; não conecta
ao banco. Plano atual: 8 categorias, 5 produtos, 19 tecnologias, 26 mídias,
configurações, quatro redes, Home, três páginas, 18 registros SEO e uma configuração
GA4 desativada. Fotos e slugs são reutilizados,
sem copiar/renomear arquivos. Imagens de card e galerias mantêm suas fontes próprias.

O script só aplica com `CMS_IMPORT_ALLOWED=true`, terminal interativo e confirmação
`IMPORTAR CONTEUDO SEM SOBRESCREVER`. Em produção exige ainda `NODE_ENV=production`
e `--allow-production-write`. Não executá-lo antes de revisar backup e obter
aprovação específica. Comando preparado, **não executado**:

```sh
NODE_ENV=production CMS_IMPORT_ALLOWED=true npm run cms:import -- --apply --allow-production-write
```

É uma transação: se já houver produtos/categorias ou uma importação concluída,
interrompe sem sobrescrever. Configurações CMS previamente salvas são preservadas.
A marca
`cms-import-completed` só aparece ao concluir. Repetição não duplica conteúdo.
Home e páginas usam versões publicadas equivalentes ao conteúdo estático atual;
nenhuma novidade é publicada na importação. A flag pública permanece desativada
até a homologação. Antes da importação, o painel apresenta fontes locais claramente
identificadas, com revisão zero: não são registros persistidos. Edição desses
conteúdos exige a importação autorizada. Não é necessário recadastrar produtos.
Somente a simulação foi executada nesta tarefa.

## Variáveis novas — nenhuma configurada na Hostinger nesta tarefa

| Variável | Uso |
| --- | --- |
| CMS_PUBLIC_ENABLED | `true` somente após importação e homologação; exige novo build/deploy |
| CMS_LEADS_ENABLED | `true` após validar recebimento, privacidade e limitação de abuso |
| CMS_IMPORT_ALLOWED | `false` normalmente; true só no processo autorizado de importação |
| CMS_STORAGE_ENDPOINT | Endpoint HTTPS da API S3/R2 |
| CMS_STORAGE_BUCKET | Bucket persistente dedicado |
| CMS_STORAGE_ACCESS_KEY | Chave privada com escopo mínimo no bucket |
| CMS_STORAGE_SECRET_KEY | Segredo privado, nunca NEXT_PUBLIC_ ou Git |
| CMS_STORAGE_PUBLIC_URL | Origem/base HTTPS pública para servir as imagens |
| CMS_STORAGE_REGION | Região do S3; `auto` no R2 |
| GA4_PROPERTY_ID | ID numérico da propriedade, apenas servidor |
| GOOGLE_SERVICE_ACCOUNT_EMAIL | Conta de serviço com papel Leitor na propriedade |
| GOOGLE_PRIVATE_KEY | Chave privada da conta; nunca Git, logs ou NEXT_PUBLIC_ |

Manter DATABASE_URL, BETTER_AUTH_SECRET/URL, ADMIN_DATABASE_READY e
ADMIN_BOOTSTRAP_ALLOWED conforme a configuração segura existente. `.env.example`
tem somente placeholders. Não modificar `.env`/`.env.local` para executar simulações.
S3/R2 deve permitir PUT autenticado no prefixo `hortoleve/`; acesso público somente
para leitura das imagens. A allowlist de next/image vem de CMS_STORAGE_PUBLIC_URL
no build. Configuração do bucket, credenciais e ciclo de vida não foram criados.
O signer SigV4 usa path-style e precisa de teste com o provedor escolhido antes
de produção. Objetos órfãos/falhas parciais são preservados; definir retenção/limpeza
com backup, sem exclusões automáticas nesta entrega.

## Ativação e limites de validação

1. Revisar diff e a correção do login; testar em banco de homologação isolado.
2. Importar conteúdo somente com aprovação e backup. Conferir slugs/galerias.
3. Configurar storage, fazer upload/substituição e testar referências/exclusão.
4. Validar CRUD com OWNER e ADMIN delegado, duas sessões concorrentes, publicação
   e 301, recebimento de lead, observações, logout e revogação de permissões.
5. Conferir desktop/tablet/mobile em navegador e as prévias de Home/páginas.
6. Ativar CMS_PUBLIC_ENABLED no ambiente de build/runtime autorizado. Revisar
   consentimento/retenção antes de CMS_LEADS_ENABLED. Publicar só com autorização.
7. Smoke test público e login real do operador. Não executar migrations/seeds no build.

O fallback estático aprovado permanece enquanto o CMS está desativado, não foi
importado ou está temporariamente indisponível. Isso mantém o site disponível;
em indisponibilidade de banco uma versão estática anterior pode reaparecer.
Monitorar esse modo antes de depender exclusivamente do catálogo dinâmico.

Testes automatizados usam Better Auth real com memória, validação real de imagem
via sharp e doubles explícitos de PostgreSQL/storage para lógica de serviços.
Não são evidência de upload S3 real, CRUD em PostgreSQL, entrega de lead real ou
conferência visual no navegador. Essas validações permanecem pendentes de ambiente
e credenciais. Não há ingestão automática de conversas do WhatsApp.

## Google Analytics 4

No módulo Analytics, informar Measurement ID `G-…`, habilitar e salvar. Com CMS
ativado e configuração publicada, o site carrega gtag somente após consentimento.
Eventos: `page_view`, `view_item`, `whatsapp_click`, `generate_lead` após recibo real
e `banner_interaction` em navegação manual. Eventos próprios não enviam nome,
telefone, e-mail, mensagem nem parâmetros da URL. Para esta coleta manual, desligar
no fluxo GA4 a medição aprimorada automática de formulários, cliques externos e
mudanças de histórico, evitando eventos duplicados ou URLs com dados pessoais.

Habilitar Google Analytics Data API no projeto Google Cloud, criar uma conta de
serviço e conceder papel Leitor somente na propriedade necessária. Configurar as
três variáveis privadas acima no servidor autorizado. JWT RS256 usa exclusivamente
`analytics.readonly`; endpoints Google são fixos, consultas têm timeout e no-store.
O Dashboard consulta sob demanda os últimos 28 dias completos; ausência de linhas
é informada como ausência de dados, sem fabricar zeros. A API exige OWNER.

Referências: [Data API](https://developers.google.com/analytics/devguides/reporting/data/v1/quickstart)
e [eventos GA4](https://developers.google.com/analytics/devguides/collection/ga4/events).

## Comando Windows preparado — não executado

Somente após backup, homologação e autorização explícita da importação:

```cmd
cmd /D /C "set NODE_ENV=production&&set CMS_IMPORT_ALLOWED=true&&npm.cmd run cms:import -- --apply --allow-production-write"
```

A autorização existe apenas nesse processo filho. O script ainda exige a frase
interativa de confirmação. Não alterar `.env` para simular nem executar no build.
