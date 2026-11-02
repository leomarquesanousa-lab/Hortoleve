# Banco local de agendamentos

Foi criada uma instância PostgreSQL 18 exclusiva para desenvolvimento da Hortoleve em `127.0.0.1:55439`, banco `hortoleve_visits_dev`. Não utiliza nem altera o serviço PostgreSQL já existente na porta padrão.

O destino anteriormente configurado é remoto e está associado à produção pela documentação `src/modules/admin/OWNER-SETUP.md`. Ele recebeu apenas consultas de verificação. Nenhuma migração ou dado de teste foi enviado para esse destino.

## Configuração privada

As conexões locais e um segredo de autenticação exclusivo foram gravados em `.env.development.local`, ignorado pelo Git. `.env` e `.env.local` foram preservados. E-mails ficam desabilitados em desenvolvimento. A origem local é `http://localhost:3001`.

O Prisma agora carrega o mesmo ambiente de desenvolvimento do Next por padrão; com `NODE_ENV=production`, continua usando o ambiente de produção. Não execute comandos com esse modo nesta etapa.

## Inicialização

O cluster está em `.cache/visits-postgres`; esses arquivos mantêm os dados locais e não devem ser removidos se quiser preservá-los. Após reiniciar o computador, iniciar o banco com PowerShell:

```powershell
& 'C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe' -D 'C:\Projetos\hortoleve\.cache\visits-postgres' -l 'C:\Projetos\hortoleve\.cache\visits-postgres.log' -o '-h 127.0.0.1 -p 55439' -w start
npm.cmd run dev -- --hostname 127.0.0.1 --port 3001
```

Nesta entrega, o banco e o servidor local foram iniciados e a disponibilidade em `/api/visits` respondeu HTTP 200.

## Migrações e testes

Como o banco local estava vazio, foram aplicadas `202610190001_admin_foundation` e `20261101000000_visits`. A segunda migração cria apenas `HomeVisit`, `VisitNotification`, suas restrições e índices. Não contém alterações ou exclusões de dados existentes; a relação com exclusão em cascata está limitada às notificações da própria visita.

```powershell
node --test --test-isolation=none tests/visits-postgres.test.mjs
```

O teste exige exatamente o banco local isolado e recusa destinos remotos. Verifica criação, consulta por outra conexão, reenvio idempotente, bloqueio de horário ocupado, concorrência real entre duas reservas, cancelamento e liberação do horário. Os agendamentos, notificações e usuário fictícios são removidos ao final. Produtos e usuários anteriores são preservados. Nenhum envio de e-mail é executado.

Este banco novo não contém contas reais nem produtos copiados de produção. O catálogo público continua usando a configuração existente; o acesso administrativo local depende de cadastrar uma conta de desenvolvimento pelo procedimento autorizado do projeto, com a conexão local explicitamente selecionada. Nenhuma conta de produção foi alterada.

## Ativação futura em produção

Exige autorização separada para aplicar a migração de visitas ao destino de produção após revisão e backup. Depois, conferir disponibilidade, reserva e gestão com a autenticação existente. Para e-mail, configurar `VISITS_EMAIL_ENABLED`, `VISITS_EMAIL_FROM`, `VISITS_EMAIL_TO` e `RESEND_API_KEY` no servidor. O agendamento pode operar com e-mail desabilitado, exibindo a notificação pendente. Nenhum deploy foi feito nesta entrega.
