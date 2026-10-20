# Atendimento e recebimento de solicitações

`/contato` usa quatro etapas e `POST /api/leads`. Atualmente não existe banco,
provedor de entrega ou WhatsApp comercial configurado. O envio está desabilitado
na interface; chamadas diretas válidas ao endpoint retornam 503. Não há gravação
em arquivos, armazenamento local, envio a terceiros ou confirmação simulada.

Para ativar:

1. Definir o canal comercial real e um adaptador de servidor em `delivery.ts`,
   implementando `LeadDelivery`. Segredos devem permanecer somente no servidor.
2. Retornar `LeadReceipt` apenas após o destino confirmar o recebimento.
3. Configurar limitação distribuída de solicitações no gateway ou armazenamento
   compartilhado confiável. Não há contador em memória que simule proteção entre instâncias.
4. Revisar retenção, acesso e política de privacidade com a operação comercial.
5. Se aprovado, cadastrar o telefone verdadeiro em `src/config/site.ts` para o
   WhatsApp opcional, aberto somente por ação explícita do visitante.

Proteções atuais: origem obrigatória do próprio site, JSON limitado a 12 KB durante
a leitura, validação no servidor, slugs permitidos, limites de campos e honeypot.
O endpoint não registra dados pessoais em logs. Não foi criada infraestrutura de
banco, migração ou painel administrativo. `ReceivedLead` é o contrato de entrada
para um futuro receptor/painel; `LeadReceipt` representa confirmação real.
