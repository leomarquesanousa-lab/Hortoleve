# Agendamento de visitas domiciliares

Rotas: `/agendar`, `/api/visits`, `/admin/visitas` e `/api/admin-visits`.
A marca, o catálogo e os logotipos existentes foram preservados.

## Ativação local

Reutiliza PostgreSQL/Prisma e Better Auth do projeto. Não depende de serviço de agenda ou de e-mail. Pode usar PostgreSQL local em `DATABASE_URL` e `DIRECT_URL`; a autenticação existente deve estar configurada (`BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `ADMIN_DATABASE_READY`). Não foi criado um segundo login.

A migração `prisma/migrations/20261101000000_visits/migration.sql` foi aplicada no banco local isolado `hortoleve_visits_dev`, junto com a estrutura-base necessária ao banco vazio. A API local agora responde HTTP 200. A conexão anteriormente configurada, associada à produção, foi preservada sem gravações. Consulte [LOCAL-DATABASE.md](./LOCAL-DATABASE.md) para inicialização e configuração privada de desenvolvimento.

`VISITS_TIME_ZONE=America/Bahia` é o padrão configurável (DDD 71 do site; não existia fuso comercial configurado). Datas e horários são validados nesse fuso no servidor. A restrição única em `slotKey` garante uma reserva por horário mesmo com múltiplos processos; cancelamento libera a chave. Reagendamento, atualização de estado, auditoria e notificações compartilham transação. Reservas canceladas não são reativadas. Alterações concorrentes usam versão otimista.

Acesso à gestão exige o login atual e permissão `leads:read`, também validada em cada chamada da API. Consulta limitada a 100 registros por vez, com filtro diário. Dados pessoais e erros internos não são retornados pela disponibilidade pública. Payload limitado a 10 KB, origem validada, honeypot, limites por telefone (HMAC) e global. Esses limites são uma proteção inicial; não substituem proteção de tráfego do servidor.

## E-mails opcionais

- `VISITS_EMAIL_ENABLED=false`: padrão seguro; agenda continua funcionando e a interface informa a notificação pendente.
- `VISITS_EMAIL_TO`: destinatário real da empresa; nenhum endereço foi presumido.
- `VISITS_EMAIL_FROM`: remetente autorizado no provedor.
- `RESEND_API_KEY`: credencial somente no servidor, reutilizando o provedor já previsto no projeto.

Quando habilitado, a reserva e as alterações geram e-mails para empresa e cliente. O registro da reserva e a outbox são atômicos. Falha de envio não desfaz a reserva nem informa confirmação de e-mail. A visita começa em `PENDING` e depende de confirmação da equipe, mesmo quando o e-mail foi enviado.

O processo Node do Next tenta a fila a cada minuto enquanto estiver ativo; falhas aguardam cinco minutos. A gestão também oferece tentativa manual. Em hospedagem que suspende o processo, o worker só atua enquanto o processo está ativo; a fila é persistente e pode ser processada pela gestão. Não há dependência de cron externo. Cada notificação tem lease no banco e chave de idempotência estável. Após 23 horas da primeira tentativa, a repetição automática fica bloqueada para evitar duplicação fora da janela do provedor; a gestão mostra necessidade de revisão. Verificar entrega no provedor antes de qualquer reenvio operacional. Para trabalhar sem serviços externos, mantenha e-mails desabilitados e use PostgreSQL local.

O consentimento e o protocolo ficam armazenados. A equipe deve restringir os acessos administrativos e definir sua política de retenção dos dados. Não são solicitados dados médicos.

## Verificações

`node --test --test-isolation=none tests/visits.test.mjs`

Testes focados com banco simulado: fuso e calendário, validação, duplicação de requisição, rollback da outbox, conflito único, proteção administrativa, ausência de chamadas externas com e-mail desabilitado e limites do corpo HTTP. O teste `tests/visits-postgres.test.mjs` acrescenta criação, consulta em outra conexão, concorrência real, cancelamento e liberação de horário em PostgreSQL local. TypeScript e lint foram executados. Nenhum e-mail real, migração remota ou deploy foi realizado.
