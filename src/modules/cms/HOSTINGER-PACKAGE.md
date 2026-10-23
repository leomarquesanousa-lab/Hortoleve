# Pacote de imagens — 25 produtos

Pacote preparado localmente, sem conexão ou escrita no PostgreSQL.

- ZIP para enviar: `.cache/hostinger-products-25.zip`.
- 112 imagens únicas, relativas a 113 caminhos originais dos 25 produtos.
- Imagens: 289.471.456 bytes; ZIP: 274.364.303 bytes.
- SHA-256 ZIP: `04ce75966872d58eba4ab22637b2db4d9dae6ac25c69854cbcd37aa829b8554b`.
- Estrutura: `products/<sha256>.<ext>`, `manifest.json`, `manifest.sha256`.
- Os 112 arquivos dentro do ZIP foram lidos e conferidos por tamanho e SHA-256.
- Os nomes das entradas ZIP usam `/`, compatível com extração Linux.

O manifesto informa nome e URL originais, nome e URL de destino, SHA-256,
tamanho, IDs/nomes/slugs dos produtos, uso como capa e posições nas galerias.
A mesma imagem usada por mais de um produto aparece uma única vez no ZIP.
Não inclui logos, ícones, institucionais ou versões sem associação com produto.
As 136 mídias selecionáveis não equivalem às imagens dos produtos.

## Enviar e extrair manualmente

1. Fazer backup dos arquivos existentes no servidor. No hPanel, abrir o
   Gerenciador de Arquivos com acesso aos arquivos da conta, não apenas public_html.
2. Acessar `/home/u604106388/hortoleve-storage/` e enviar o ZIP indicado.
   Não enviar o pacote à pasta de deploy ou public_html.
3. Usar Extrair, escolhendo o destino de modo que a pasta `products/` do ZIP
   resulte em `/home/u604106388/hortoleve-storage/products/`.
4. Se o gerenciador criar uma pasta intermediária, conferir a árvore e copiar
   somente os 112 arquivos de seu `products/` para o diretório final existente.
   Não criar `products/products`. Não sobrescrever arquivos existentes sem
   comparar hashes; se houver conflito, interromper. Manter ZIP e manifesto.
5. O diretório final deve conter diretamente os arquivos hash.ext. Manifestos
   ficam no diretório pai, fora da rota pública. Confirmar proprietário e acesso
   do runtime, sem liberar 0777. Não excluir arquivos de public.

Referência: https://www.hostinger.com/support/1583613-how-to-extract-archives-using-the-file-manager-in-hostinger/

## Validação após envio

Publicar a versão com `storage-assets.generated.ts` e a extensão do endpoint de
verificação somente mediante autorização. Estar autenticado como OWNER em
HTTPS na aplicação. Não há interface adicional de biblioteca.

No console do navegador, na própria página administrativa:

```js
// Testa leitura/escrita usando apenas um arquivo temporário próprio.
await fetch('/api/admin-storage-check', { method: 'POST' }).then(r => r.json())

// Somente leitura: compara cada imagem com o inventário esperado do pacote.
await fetch('/api/admin-storage-check?validate=products', { method: 'POST' }).then(r => r.json())
```

Esperado no segundo teste: `valid: true`, `expected: 112`, `verified: 112`,
`missing: []`, `invalid: []`. Falhas retornam HTTP 409. Sessão OWNER ativa e
Origin público correto são obrigatórios; não são aceitos caminhos enviados
pelo cliente. A validação compara bytes e SHA-256 pelo runtime real da aplicação.

Depois, abrir algumas URLs `publicURL` do manifesto por HTTPS, incluindo capas,
e confirmar carregamento no Next.js. O teste local do ZIP não comprova acesso
na Hostinger nem a persistência após restart/deploy: validar isso no servidor.

## Referências e ativação posterior

O migrador existente `cms:media-migrate -- --apply-cms --allow-production-write`
permanece separado. Exige autorização temporária, confirmação interativa,
CMS sincronizado, cópias válidas no storage real e backup. Atualiza apenas URLs
exatas numa transação e registra dados de reversão. Não foi executado.

No Cloud gerenciado, a execução interativa Node desse comando ainda deve ser
confirmada com a Hostinger; cron não atende à proteção de TTY. Não incluir
migração no build, não desativar proteções e não atualizar o CMS a partir de
cópias locais que não tenham sido validadas no storage real.

Nenhuma referência pública ou variável foi alterada. Manter os originais em
public e CMS_PUBLIC_ENABLED no estado atual até a ativação autorizada.
Uploads novos já usam o driver local com CMS_STORAGE_PATH configurado e
acessível: geram UUID.webp e URLs /media/products/, com o mesmo endpoint de upload.

Para reconstruir o inventário/cópias de preparação, usar
`node scripts/package-product-images.mts`. O script recusa sobrescrever a pasta
de pacote existente e não gera ZIP automaticamente. O pacote atual está em
.cache (ignorado pelo Git); guardar cópia local antes de qualquer limpeza.
