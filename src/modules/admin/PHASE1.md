# Administração Hortoleve — Fase 1

## Estado atual

Prisma 7.10.1, PostgreSQL/Neon, Better Auth 1.7.11. Não existe configuração de
banco real neste workspace. Não foram executados migrations, db push, seeds nem
bootstrap. Dados do site público continuam nos módulos existentes.

O hash de senha fica em `Account.password`, conforme Better Auth; User mantém o
perfil. Session, Account, Verification e RateLimit são tabelas do mecanismo real
de autenticação, não entidades adicionais de negócio. Também existem Banner,
Category, Product, ProductMedia, SocialLink, SiteSetting, SeoSetting, ContactLead
e AuditLog. Specifications/characteristics e settings usam JSON para suportar
categorias diferentes sem presumir características de colchões.

## Conectar o desenvolvimento

1. Criar uma branch Neon de desenvolvimento e confirmar o destino com o responsável.
2. Copiar `.env.example` para `.env.local` e preencher DATABASE_URL com a conexão
   pooled (`-pooler`) e DIRECT_URL com a conexão direta da mesma branch. TLS deve
   permanecer habilitado. Pool runtime limitado a cinco conexões por instância.
3. Gerar BETTER_AUTH_SECRET aleatório de pelo menos 32 caracteres, mantido somente
   no servidor. Definir BETTER_AUTH_URL como origem exata; HTTPS em produção.
4. Revisar o SQL preparado em `prisma/migrations/202610190001_admin_foundation/`.
   **Obter autorização antes de aplicar** `npm run db:deploy` ao desenvolvimento.
   Esse comando escreve no banco. Nunca executá-lo automaticamente em produção.
5. Só então definir ADMIN_DATABASE_READY=true e criar o primeiro OWNER com o
   procedimento abaixo. Sem as variáveis necessárias, API retorna 503 e login
   permanece desabilitado. Banco inacessível não dá acesso de demonstração.

## Primeiro OWNER

Depois de autorização para escrever na branch de desenvolvimento:

- Definir temporariamente ADMIN_BOOTSTRAP_ALLOWED=true em `.env.local`.
- Executar `npm run admin:first-owner -- --allow-development-write` em terminal
  interativo. O script exige confirmação escrita, pergunta nome/e-mail e lê a
  senha duas vezes sem eco. Não passar senha como argumento, arquivo ou env.
- Mínimo de 14 caracteres; hash scrypt do Better Auth. Nenhuma senha conhecida ou
  conta padrão é criada. Uma transação e advisory lock impedem dois primeiros
  OWNER concorrentes; o evento registra apenas IDs, nunca senha ou hash.
- Desativar ADMIN_BOOTSTRAP_ALLOWED imediatamente após uso. O script bloqueia
  NODE_ENV=production, não serve para provisionar contas adicionais e não foi executado.

## Segurança e delegação

- `/admin/login` é a única tela pública do admin; não há cadastro, reset de senha
  público ou OAuth. `/api/auth/[...all]` permite somente login, logout e consulta
  de sessão; os outros endpoints ficam bloqueados.
- Cookies HttpOnly e SameSite=Lax, Secure em produção, sessão de oito horas com
  armazenamento no banco e cookie cache desabilitado. Sessões novas exigem usuário
  ativo. Cada página consulta novamente o usuário no banco para revogação imediata
  de inatividade/papel/permissões; nenhuma proteção depende só da sidebar.
- OWNER possui todas as permissões. ADMIN não recebe privilégios por padrão:
  `User.permissions` precisa conter permissões delegadas permitidas por
  `rolePermissions.ADMIN` (`content:write`, `leads:read`). Gestão de usuários,
  configurações e SEO continuam OWNER nesta fase. Operações futuras devem chamar
  `requireAdminPermission`, mesmo que o botão esteja oculto.
- Rate limit Better Auth armazenado no banco, mais contador atômico por HMAC do
  e-mail: cinco tentativas por janela de 15 minutos. Nunca guardar e-mail como
  chave de rate limit. Cabeçalho interno de IP é sobrescrito pelo servidor.
- ADMIN_TRUSTED_IP_HEADER só pode apontar para um cabeçalho com IP único que o
  proxy de hospedagem **sobrescreva e saneie**. Sem isso, usa-se um IP compartilhado
  conservador para não confiar em x-forwarded-for fornecido pelo visitante. Isso
  pode limitar simultaneamente operadores até a configuração do proxy.
- Origem obrigatória nas requisições POST, corpo limitado a 8 KB, URLs de retorno
  fixas, erros genéricos e nenhum log de credenciais. Não há integração externa,
  upload, CRUD ou métricas fictícias. Backups, TLS e retenção de leads/auditoria
  devem ser definidos com o responsável antes de produção.

## Rotas

`/admin`, `/admin/login`, `/admin/banners`, `/admin/produtos`, `/admin/categorias`,
`/admin/seo`, `/admin/redes-sociais`, `/admin/contatos`, `/admin/usuarios`,
`/admin/analytics`, `/admin/configuracoes`. Dashboard consulta contagens reais
somente quando o usuário tem permissão. Demais módulos são bases em desenvolvimento.

O layout raiz mantém fontes e metadata pública. `SiteChrome` preserva exatamente
o chrome público e o separa das rotas administrativas, que possuem sua própria
navegação e `noindex`. Nenhuma página pública foi conectada ao banco.

## Referências oficiais

- https://better-auth.com/docs/adapters/prisma
- https://better-auth.com/docs/integrations/next
- https://better-auth.com/docs/concepts/rate-limit
- https://docs.prisma.io/docs/orm/v7/prisma-schema/overview/generators

## Pendências de validação

Conexão real, aplicação autorizada da migração, primeiro OWNER e testes de login,
expiração/revogação, rate limit e logout contra Neon. Testes locais sem banco
verificam os contratos e os caminhos fechados, não substituem esse ensaio integrado.

Verificações disponíveis: `npm run db:validate`, `npm run db:generate` (não escrevem
no banco) e `npm run test:admin`. O bootstrap usa o suporte TypeScript nativo do
Node 24 do ambiente atual. Schema, cliente, TypeScript, ESLint e oito testes locais
foram aprovados. Nenhum build completo foi executado.

Auditoria npm: dependências de produção sem alertas na consulta realizada. Existem
cinco alertas altos na cadeia de desenvolvimento eslint-config-next/fast-glob/
micromatch/braces. Não foi aplicado `audit fix --force` nem atualização fora do
escopo; revisar a atualização compatível dessas ferramentas antes da entrega final.
