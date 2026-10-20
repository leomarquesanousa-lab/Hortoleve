# Próxima etapa administrativa

Contratos em contracts.ts; nenhum painel ou login é exposto nesta fase.

- Implementar adapter PostgreSQL/Prisma, validação de entrada e persistência; sem migrations nesta entrega.
- Autenticação real com sessão segura, expiração e validação de permissão no servidor em todas as rotas e operações de /admin e API. OWNER gerencia usuários/configurações; ADMIN gerencia conteúdo e consulta leads.
- Produtos, categorias, mídias, banners, textos, FAQs, leads e configurações usam os contratos definidos. Dados demonstrativos são isolados em catalog/data.ts.
- Definir consentimento/retenção antes da coleta de leads; validar uploads antes de habilitar mídias.
- Ambientes: LOCAL e PRODUÇÃO. Nenhuma conexão de produção nesta fase.
- Validar conteúdo do site original, catálogo, história e contatos. Recursos pendentes: simulador de massagem, cromoterapia, apresentação oficial de tecnologias e teste do colchão ideal.
- Confirmar dados em src/config/site.ts; substituir ilustrações e exemplos antes de habilitar indexação.
