# Primeiro OWNER — procedimento controlado

## Estado confirmado em 20/10/2026

A migração `202610190001_admin_foundation` foi aplicada com autorização em
produção; checksum, 14 tabelas, índices, relações e enums foram conferidos.
O operador criou o primeiro OWNER no terminal: uma conta ativa com bcrypt custo
12 foi confirmada sem expor dados pessoais ou hash. Não repetir o bootstrap.

O ambiente local privado foi preparado com segredo de 32 bytes aleatórios
(base64url), BETTER_AUTH_URL=https://hortoleve.com.br, ADMIN_DATABASE_READY=true
e ADMIN_BOOTSTRAP_ALLOWED=false. A origem foi confirmada por HTTPS servindo a
aplicação premium. Os arquivos de ambiente continuam ignorados pelo Git.

Antes da publicação, copiar o mesmo segredo de `.env.local` diretamente para a
variável privada BETTER_AUTH_SECRET no painel Hostinger, sem terminal, logs,
chat ou commit. Preservar a DATABASE_URL existente; configurar a mesma URL HTTPS,
ADMIN_DATABASE_READY=true e ADMIN_BOOTSTRAP_ALLOWED=false. Não configurar prefixo
NEXT_PUBLIC_ para nenhum segredo. Aguardar confirmação do operador antes do push,
que pode disparar deploy automático. Não executar migrações ou criar contas no deploy.

Os procedimentos abaixo ficam como referência; a inspeção e o bootstrap já foram
concluídos. Os testes de login/cookie/logout usam Better Auth real em memória;
o login com a senha real do OWNER será validado pelo operador após publicação.

## Auditoria e alterações

O projeto usa a autenticação Better Auth existente, sem login paralelo. User,
Account, Session, Verification e RateLimit já estão no schema PostgreSQL. O hash
fica exclusivamente em Account.password. A senha agora usa bcrypt custo 12,
com salt aleatório, compartilhado entre login e bootstrap. São aceitos pelo menos
14 caracteres e no máximo 72 bytes UTF-8; entradas maiores são rejeitadas, nunca
truncadas. Nenhuma senha real é recebida por argumento, variável, URL ou log.

O script anterior gerava scrypt e era limitado ao desenvolvimento. O OWNER atual
foi criado com a versão bcrypt. Se outro ambiente já tiver um OWNER
com scrypt, este procedimento NÃO o substitui nem converte sua senha: interromper
e planejar uma recuperação autorizada antes de publicar esta mudança.

As páginas administrativas exigem sessão e consultam usuário ativo/papel/permissões
no servidor. Não há middleware/proxy; a proteção efetiva fica nos módulos de
servidor. O módulo de usuários ainda não tem CRUD; users:manage é exclusivo de
OWNER. Não existe rota pública para criar contas. Cookies são HttpOnly,
SameSite=Lax e Secure em produção; sessão de oito horas, sem cookie cache.

DATABASE_URL está presente no workspace e seu valor foi mantido privado.
A identidade do banco e a conta OWNER foram validadas em consultas somente leitura.

## Plano de migração — exige aprovação antes da execução

Nenhuma nova migração é necessária para estas mudanças. A migração inicial
existente é `prisma/migrations/202610190001_admin_foundation/migration.sql`:
cria quatro enums, 14 tabelas e respectivos índices/relações, incluindo conteúdo
do futuro CMS. Não contém DROP/TRUNCATE ou seed. Já aplicada no destino validado.

1. Confirmar banco/branch de destino e backup recuperável com o responsável.
2. Com acesso autorizado, inspecionar somente leitura o estado real das tabelas
   e `prisma migrate status`. Confirmar que DATABASE_URL e DIRECT_URL, se usada,
   apontam para o mesmo banco; DIRECT_URL tem prioridade no CLI.
3. Se o banco já contiver tabelas sem histórico Prisma, interromper e preparar
   baseline/reconciliação. Não aplicar a migração inicial às cegas nem usar db push.
4. Apresentar destino, SQL e resultado dessa inspeção e obter aprovação explícita.
5. Somente após aprovação, o operador executa `npm run db:deploy`. Não usar reset,
   seed ou comandos destrutivos. Esse comando não deve integrar o build/deploy.

## Configuração privada

Usar as variáveis existentes, sem substituir arquivos de ambiente:

- DATABASE_URL: PostgreSQL com TLS em produção; DIRECT_URL opcional para CLI.
- BETTER_AUTH_SECRET: segredo aleatório de pelo menos 32 caracteres, somente servidor.
- BETTER_AUTH_URL: origem HTTPS exata do site publicado, sem caminho/query/fragmento.
- ADMIN_DATABASE_READY=true: apenas após confirmar as tabelas/migração autorizada.
- ADMIN_BOOTSTRAP_ALLOWED: false normalmente; true somente no processo de bootstrap.
- ADMIN_TRUSTED_IP_HEADER: deixar vazio até confirmar que o proxy sobrescreve e
  saneia esse cabeçalho; não confiar em IP enviado livremente pelo cliente.

## Criar o primeiro OWNER no terminal

Requer Node.js 24, terminal interativo e dependências de desenvolvimento para
gerar o cliente. `npm run db:generate` gera código e não altera o banco.
Nome e e-mail são perguntados no terminal; senha é lida duas vezes sem eco.
O operador deve conferir o banco configurado de forma privada antes de continuar.

Em desenvolvimento autorizado:

```sh
ADMIN_BOOTSTRAP_ALLOWED=true npm run admin:first-owner -- --allow-development-write
```

Em produção, APÓS aprovação da migração e da criação inicial, em um terminal
seguro que já tenha acesso às variáveis privadas do destino:

```sh
NODE_ENV=production ADMIN_BOOTSTRAP_ALLOWED=true npm run admin:first-owner -- --allow-production-write
```

Os exemplos acima são para shell Linux. No PowerShell, usar flags temporárias e
restaurá-las mesmo em caso de erro, sem escrever credenciais no histórico:

```powershell
$previousNodeEnv = $env:NODE_ENV
$previousBootstrap = $env:ADMIN_BOOTSTRAP_ALLOWED
try {
    $env:NODE_ENV = 'production'
    $env:ADMIN_BOOTSTRAP_ALLOWED = 'true'
    npm.cmd run admin:first-owner -- --allow-production-write
} finally {
    $env:NODE_ENV = $previousNodeEnv
    $env:ADMIN_BOOTSTRAP_ALLOWED = $previousBootstrap
}
```

Produção exige digitar `CRIAR PRIMEIRO OWNER EM PRODUCAO`. A transação adquire
advisory lock, verifica se existe QUALQUER OWNER (inclusive inativo), cria User e
Account e registra somente IDs no AuditLog. Se houver OWNER, e-mail duplicado,
tabelas ausentes ou outro erro, não cria a conta; erros são genéricos para não
expor consultas/credenciais. Repetir o comando não cria outro OWNER. O e-mail não
é marcado como verificado sem comprovação. Não existe bypass de autenticação.

## Publicação e validação

1. Revisar o diff, `npm ci`, `npm run db:validate`, `npm run db:generate`,
   `npm run test:admin`, TypeScript e ESLint. Executar build no processo de revisão.
2. Cumprir o plano aprovado de banco e bootstrap; manter BOOTSTRAP desativado fora
   da execução controlada. Não ativar admin em banco com estado desconhecido.
3. Publicar pelo fluxo existente da Hostinger somente após revisão/autorização,
   sem alterar DNS/domínio. Build continua `npm run build`; início `npm start`.
4. Em HTTPS, testar login correto/incorreto, visitante sem sessão, `/admin/usuarios`
   com ADMIN sem permissão, logout e rejeição do cookie antigo. Conferir cookies
   HttpOnly/Secure/SameSite, logs sem segredos e funcionamento do site público.

Os testes locais usam mocks para banco/permissões/bootstrap e o Better Auth real
com adaptador em memória para login/cookies/logout. Não provam conexão, migração,
concorrência real ou persistência no PostgreSQL nem validam o proxy da Hostinger.
O OWNER real foi criado pelo operador; não foram criados usuários demonstrativos
ou credenciais padrão. O código de autenticação não conecta o site público ao banco.
