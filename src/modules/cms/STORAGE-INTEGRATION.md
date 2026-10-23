# Integracao local do catalogo com o storage

25 produtos; 113 URLs originais; 112 arquivos unicos. Foram convertidas 25 referencias de cards e 113 referencias de galerias.
Capas, ordem, IDs, slugs e textos preservados. O mapa usa correspondencias exatas; URLs personalizadas e uploads UUID permanecem intactos.

As correcoes do validador ja coincidem com o worktree publicado 0104bb1. Nenhuma operacao Git foi necessaria.
Catalogo estatico, fonte inicial CMS e leitura de documentos usam /media/products/. Nenhum UPDATE foi executado: a conversao dos documentos existentes ocorre em memoria.
As fontes originais permanecem disponiveis para inventario. IDs de midia continuam derivados das URLs originais. A sincronizacao aditiva preserva edicoes existentes.

Uploads novos continuam no endpoint existente e no CMS_STORAGE_PATH configurado. Nenhuma variavel foi alterada.
Divan: tres URLs de producao responderam HTTP 200. A imagem comparada preserva dimensoes e pixels; o CDN reencoda PNG, portanto o hash HTTP pode diferir. A validacao SHA-256 do disco pelo OWNER continua sendo a referencia.

## Pastas candidatas a limpeza futura

NAO remover nesta etapa. A tabela identifica somente os arquivos do manifesto; pode haver outros arquivos nas mesmas pastas.

| Pasta original | Arquivos no manifesto |
|---|---:|
| `public/Box Tatame Elegance` | 7 |
| `public/Box Tatame Japonês` | 8 |
| `public/Box Tatame` | 8 |
| `public/Cama Box Baú` | 7 |
| `public/Cama Box com Auxiliar` | 8 |
| `public/Cama Box` | 8 |
| `public/a vacuo/Dream` | 3 |
| `public/a vacuo/Sense Pro` | 6 |
| `public/a vacuo/elite/Cinza` | 4 |
| `public/a vacuo/elite/azul` | 4 |
| `public/car` | 2 |
| `public/confort` | 4 |
| `public/diamond` | 4 |
| `public/elegance` | 4 |
| `public/majestic` | 4 |
| `public/pet` | 3 |
| `public/pilow-top` | 3 |
| `public/poltronas/divan` | 3 |
| `public/poltronas/house` | 3 |
| `public/recover+` | 5 |
| `public/travesseiros/cervicalortoplus` | 3 |
| `public/travesseiros/corpo-magnetico` | 3 |
| `public/travesseiros/corpo-white-fibra` | 3 |
| `public/travesseiros/future` | 3 |
| `public/travesseiros/viscoelastico` | 3 |

Antes de qualquer exclusao: backup restauravel, publicacao autorizada, conferencia de todas as paginas e galerias, teste apos reinicio/deploy, auditoria de referencias CMS e externas e preservacao/redirecionamento das URLs antigas.
Nao remover pastas inteiras sem revisar arquivos adicionais. Logos, icones, favicons, showroom e tecnologia ficam fora desta limpeza.

## Validacao e pendencias

61 testes administrativos aprovados; TypeScript e lint direcionado aprovados. Nenhum build completo nesta etapa.
A validacao de 112 arquivos no disco da Hostinger foi informada pelo operador. A integracao permanece local, aguardando publicacao manual e conferencia visual completa em producao.
Para previa local no Windows, o servidor precisa de um storage local valido fora da pasta da aplicacao; o caminho Linux nao funciona no Windows.
CMS_PUBLIC_ENABLED permanece inalterado. Nao houve sincronizacao, migracao, escrita no banco, exclusao de imagens, commit, push, pull, merge ou deploy.
