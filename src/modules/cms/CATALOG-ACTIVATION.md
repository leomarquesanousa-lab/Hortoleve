# Catálogo administrável: correção e ativação

## Diagnóstico

O catálogo usa dados estáticos enquanto `CMS_PUBLIC_ENABLED` não for `true` ou
antes da importação inicial. O painel já usa PostgreSQL e documentos versionados
em `SiteSetting`, com espelhos relacionais em `Category`, `Product` e
`ProductMedia`. Não é necessário outro modelo nem migração de schema.

Uma importação antiga ocultava da listagem os novos produtos incluídos depois
no código. Agora todos os registros ausentes aparecem como fonte estática,
mantendo prioridade dos documentos salvos. Editar a fonte inicial requer sua
sincronização explícita, evitando gravações durante consultas.

## Sincronização

O OWNER tem a ação “Sincronizar registros existentes do site” nos módulos
Produtos e Categorias. Primeiro consulta o plano; somente depois da confirmação
executa uma transação. ADMIN não pode executar a sincronização inicial, mas
continua podendo gerir conteúdo quando autorizado pelo OWNER.

São preservados IDs, slugs, nomes, campos, hierarquia, ordem das galerias,
capa independente, ficha técnica, detalhes e ícones das tecnologias e SEO.
Documentos existentes não são sobrescritos. Duplicidades e registros relacionais
sem documento correspondente bloqueiam o lote para conciliação. Exclusões
registradas em `cms-deleted` não são reimportadas. Exclusões anteriores a este
controle devem ser revisadas no plano, pois não há histórico que permita inferir
automaticamente sua intenção.

O mesmo mecanismo pode ser usado pelo terminal:

```cmd
npm.cmd run cms:import
```

O comando acima apenas simula a fonte local: não conecta ao banco.
Após confirmar backup/restauração, destino e aprovação do operador, o comando
de aplicação em produção, com a flag restrita ao processo filho, é:

```cmd
cmd /D /C "set NODE_ENV=production&&set CMS_IMPORT_ALLOWED=true&&npm.cmd run cms:import -- --apply --allow-production-write"
```

O script solicita confirmação interativa e não toca em usuários, senhas,
sessões ou autenticação. Repetir a sincronização adiciona somente ausentes.
Não executar a importação como parte do build, inicialização ou deploy.

## Uploads permanentes

Usar o adaptador S3/R2 já existente, configurando no servidor:

- `CMS_STORAGE_ENDPOINT`
- `CMS_STORAGE_BUCKET`
- `CMS_STORAGE_ACCESS_KEY`
- `CMS_STORAGE_SECRET_KEY`
- `CMS_STORAGE_PUBLIC_URL`
- `CMS_STORAGE_REGION` (conforme o provedor)

O endpoint é privado, com sessão, permissão e validação de origem. As imagens
são decodificadas, validadas e armazenadas em WebP em chaves imutáveis no bucket.
Arquivos originais em `public/` não são editados; devem continuar no pacote da
aplicação enquanto forem referenciados. O catálogo guarda URLs, não uploads em
disco temporário da Hostinger. Remover uma imagem da galeria não apaga o objeto
do bucket nem imagens de outros produtos.

O editor de produto permite enviar novas imagens diretamente, escolher da
biblioteca, substituir a seleção, ordenar e remover itens. Salvar rascunho não
altera a versão pública; “Aplicar publicação” efetiva a mudança.

## Leitura pública e publicação

Após sincronização e conferência, configurar `CMS_PUBLIC_ENABLED=true` no
servidor. Não sobrescrever DATABASE_URL, credenciais ou flags de autenticação.
Esta ativação inicial e a configuração do domínio do storage exigem reinício ou
publicação do código/configuração na hospedagem. Depois disso, alterações de
conteúdo pelo painel são lidas do banco por requisição, sem novo deploy.

Conferir Home (seis destaques), catálogo, categorias/subcategorias, todos os
produtos, fotos, galeria/modal, rodapé, SEO e WhatsApp. Conferir as URLs antigas
e redirecionamentos. A versão pública nunca utiliza rascunhos.

## Limites da validação local

Testes com transações simuladas cobrem prévia sem escrita, repetição,
preservação de edições e exclusões registradas, bloqueio de conflitos e
permissões. A simulação de terminal não comprova estado do banco de produção,
backup nem envio real ao storage. A ativação final exige validar esses itens no
ambiente de destino; não declarar a importação ou publicação concluída antes.
# Storage no servidor Hostinger

A alternativa local já está implementada. Para usar o diretório persistente
informado pelo operador, seguir [HOSTINGER-STORAGE.md](./HOSTINGER-STORAGE.md).
Com CMS_STORAGE_PATH definido, o upload existente usa disco local e URLs
controladas pela aplicação; as orientações S3/R2 abaixo são opcionais.
A ativação continua dependendo de testar permissões no processo Node real.

