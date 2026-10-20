# Demonstração — checkpoint de 19/10/2026

Branch: `main`. Tag: `demo-hortoleve-2026-10-19`.

## Execução

- Instalar pelo lockfile com `npm ci` (incluindo dependências de desenvolvimento durante o build).
- Build: `npm run build`. Gera o cliente Prisma localmente antes do Next.js; não aplica migrações.
- Servidor: `npm start`. Usar hospedagem Node.js, não exportação estática. Validação local em Node.js 24.
- `.env` e demais ambientes privados não são versionados. `.env.example` contém somente exemplos.

## Administração permanece desativada

Manter `ADMIN_DATABASE_READY=false` e `ADMIN_BOOTSTRAP_ALLOWED=false` no ambiente da demonstração. Não cadastrar segredo de autenticação nem credenciais de banco para esta publicação. Não executar `db:deploy` ou `admin:first-owner`. O acesso administrativo sem sessão redireciona ao login; a autenticação indisponível retorna 503. Nenhum usuário temporário foi criado.

## Hostinger

O repositório não contém workflow de publicação. A consulta ao GitHub anterior ao push não encontrou webhooks, deployments ou checks que comprovem integração automática. Isso não exclui integração por GitHub App no painel da hospedagem.

No painel do site Node.js existente: **Websites → Dashboard → Deployments → Redeploy**. Conferir repositório `leomarquesanousa-lab/Hortoleve`, branch `main`, comandos acima e as duas flags administrativas desativadas. Confirmar o redeploy e aguardar sucesso nos logs. Não trocar repositório, excluir arquivos persistentes, alterar DNS ou executar migrações. A integração GitHub usa o código mais recente da branch selecionada.

Referência oficial: https://www.hostinger.com/support/how-to-redeploy-a-node-js-application/

## Verificação e limites

Build, lint e oito testes administrativos passaram. As oito categorias, cinco páginas de colchões e páginas públicas responderam localmente; os 33 arquivos públicos e uma imagem otimizada responderam 200. Redirecionamentos antigos e bloqueio administrativo foram conferidos, incluindo redirecionamentos transmitidos por streaming. A conferência visual/interativa em navegador permanece pendente.

Antes do push, `https://hortoleve.com.br` respondia HTTPS 200 com título “Create Next App”; `https://hortoleve.com` mostrava o site anterior. Isso não comprova a publicação desta demonstração. Após o deploy, conferir Home, menu, galerias, contato, Social Orbit, imagens e bloqueio de `/admin` no domínio escolhido.

## Continuidade

Confirmar deploy e URL de demonstração; revisar desktop/mobile no navegador. Contatos oficiais e entrega do formulário ainda não estão configurados. Sete categorias aguardam cadastro de produtos. A configuração segura do Neon, migrações e criação do OWNER ficam para uma etapa autorizada futura; seguir `src/modules/admin/PHASE1.md`.
