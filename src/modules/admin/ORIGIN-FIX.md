# Origem HTTPS atrás do proxy Hostinger

## Diagnóstico desta revisão

BETTER_AUTH_URL local foi conferida como `https://hortoleve.com.br`, sem revelar
segredos ou alterar variáveis. A configuração da Hostinger não foi acessada.

Uma requisição POST de produção a `/api/auth/sign-in/email`, com corpo `{}` e
Origin `https://hortoleve.com.br`, retornou 400 `Credenciais inválidas`, e não 403.
Isso confirma aceitação da origem nessa verificação, não autenticação do OWNER.
Nenhuma senha foi enviada ou consultada e nenhuma tentativa de login válida foi feita.

A correção já estava presente no checkout: a rota usa a origem validada por
`adminEnvironment().baseURL`, compara Origin exatamente e recompõe a URL pública
antes de encaminhar ao Better Auth. Uma URL interna HTTP do proxy não participa
da comparação quando a configuração está válida. Host e X-Forwarded-* não são
fontes da origem confiável. A proteção de origem também cobre logout.

## Regressão e preservação de CSRF

O teste Hostinger reproduz a divergência da lógica antiga entre HTTP interno e
HTTPS público e verifica o comportamento corrigido. Origem correta alcança a
validação de credenciais (400 com corpo vazio). Origem ausente, `null`, HTTP,
outro domínio, subdomínio enganoso ou `www` não configurado recebem 403 mesmo
quando X-Forwarded-Host/Proto/Forwarded tentam indicar a origem autorizada.
O teste de Better Auth real em memória mantém login, cookie Secure/HttpOnly/
SameSite e logout funcionando com requisições que chegam por HTTP interno.

## Publicação manual

1. Revisar `src/app/api/auth/[...all]/route.ts` no pacote/branch de publicação:
   deve usar a variável `publicOrigin` derivada da configuração, nunca somente
   `new URL(request.url).origin` nem cabeçalhos encaminhados.
2. Executar os testes, lint e TypeScript antes de publicar pelo fluxo já existente
   da Hostinger. Não executar migrações, bootstrap ou alterações de variáveis.
3. Após publicação, testar o corpo vazio com Origin canônica: resultado esperado
   400, não 403. Origem externa deve continuar 403. Esse teste não autentica ninguém.
4. O operador testa sua senha somente em `https://hortoleve.com.br/admin/login`.
   Em caso de falha persistente, consultar apenas status e resposta da requisição
   na aba Network; não compartilhar payload, senha, cookies ou tokens.

Esta tarefa adicionou teste de regressão e esta instrução; não fez commit, push
ou deploy. O código de origem já corrigido foi preservado sem refatoração.
