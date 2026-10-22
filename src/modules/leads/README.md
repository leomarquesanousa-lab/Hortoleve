# Atendimento e recebimento

## Auditoria

O único formulário público é `ContactJourney`, em `/contato`. Home, produtos e
demais CTAs reutilizam o WhatsApp central ou direcionam ao contato com
`?linha=slug`. Formulários administrativos não fazem parte da captação.

Nome, telefone e consentimento são obrigatórios. E-mail, produto e mensagem são
opcionais. A validação compartilhada verifica limites, formato, produto e
honeypot; erros ficam associados aos campos.

## WhatsApp principal

Depois da revisão e validação, “Continuar no WhatsApp” abre a mensagem com nome,
telefone, e-mail opcional, produto, assunto, mensagem e origem. O número vem da
configuração central. Não há envio automático nem armazenamento pelo site
nesse fluxo: o visitante precisa confirmar o envio no aplicativo. A interface
não afirma recebimento; o link da revisão permite tentar novamente.

## CMS existente

Quando `CMS_LEADS_ENABLED` e a configuração administrativa permitem, o botão
secundário preserva `POST /api/leads`. Só confirma com comprovante do backend.
Permanecem validação no servidor, origem obrigatória, corpo máximo de 12 KB,
honeypot e limites por telefone/global no banco. Nenhuma configuração foi
ativada por esta alteração. Não registrar conteúdo pessoal em logs.

## E-mail complementar pendente

Não foi encontrada integração SMTP/transacional configurada. `email.ts` prepara
um adaptador opcional para Resend, sem dependências e somente no servidor.
Variáveis em `.env.example`: `CONTACT_EMAIL_ENABLED`, `RESEND_API_KEY`,
`CONTACT_EMAIL_FROM` e `CONTACT_EMAIL_TO`.

Para ativar: fornecer remetente autorizado e destinatário comercial, configurar
a chave no servidor, conectar explicitamente o adaptador após validação e rate
limit da rota e testar entrega. O adaptador ainda não está conectado à rota;
nenhuma opção de e-mail é anunciada como ativa. O ID do provedor confirma
aceitação, não entrega na caixa postal nem leitura. O WhatsApp independe disso.

Não incluir dados sensíveis nas mensagens nem segredos em logs. Revisar retenção
e acesso com a operação comercial antes de habilitar novos destinos.
