---
tipo: fluxo
atualizado: 2026-11-04
---

# Minha conta

O menu lateral oferece **Minha conta**, rota `/minha-conta`. Exibe o identificador do usuário da sessão atual e seu tipo (anônimo ou permanente), sem tokens ou dados financeiros. O identificador pode ser selecionado para comparação com o usuário no painel administrativo do Supabase.

A tela usa `useAuth()` e não cria usuários, não encerra sessões nem altera vínculos de casa. Contas anônimas recebem orientação para preservar os dados locais até ter uma forma de recuperação. Para contas anônimas, oferece formulário de vínculo de email. Contas permanentes podem definir senha. Sem sessão salva, a aplicação oferece entrada por email e senha. Recuperação de senha esquecida por email ainda não está implementada.

Uso na revisão de segurança: comparar o identificador visível no aparelho com os membros existentes antes de remover qualquer associação. Não registrar identificadores reais no vault. Ver [[05-Operacao/Restringir-acesso-a-casa]].

## Vínculo de email

`LinkAccountEmail` usa `getUser()` para conferir a identidade atual antes de chamar `updateUser({ email })`; nunca usa signup/signin para vincular. O email é informado pelo usuário, sem valor real no código. Erros de email já usado são apresentados sem trocar sessão ou mesclar usuários.

O usuário confirma o link recebido e usa Consultar confirmação. O app consulta o usuário no servidor e só renova a sessão como permanente após email confirmado. O serviço precisa permitir vínculo manual e entrega de emails; a URL de destino do link depende da configuração do projeto. Nenhum token de link é importado pelo app. Confirmação e configuração de Auth são etapas externas, sem garantia apenas pelo sucesso da solicitação.

O vínculo de email não solicita senha. Após confirmação, Minha conta oferece Definir senha. A revisão de membros antigos continua necessária.

## Definir senha e validar acesso

`AccountPasswordForm` solicita nova senha e confirmação, com campos protegidos. Exige pelo menos 12 caracteres iguais (sem remover espaços), bloqueia envios simultâneos e limpa os campos após a tentativa. Senhas não são gravadas pelo app em arquivos, logs, metadata ou documentação; o Supabase Auth gerencia a credencial.

`saveAccountPassword` verifica no servidor se a identidade ainda é a esperada e se o email está confirmado. Salva com `updateUser({ password })`. Em seguida, um cliente efêmero, sem persistência ou auto-refresh, usa `signInWithPassword` e confere o mesmo UUID e `auth_household_id()`. Não chama signOut nem substitui a sessão principal. Uma falha após salvar informa que a senha foi salva, mas o teste de entrada não foi concluído. Políticas de sessão do servidor continuam aplicáveis.

Sem sessão persistida, `SignInScreen` permite email/senha; erros de credenciais são apresentados sem revelar existência de contas. `AuthProvider` deixou de criar usuários anônimos automaticamente. Sessões existentes, inclusive anônimas antigas, continuam sendo reaproveitadas. RLS e associação administrativa da migração 0011 permanecem responsáveis por autorizar dados financeiros.

Não há botão de sair adicionado nesta mudança. O teste de recuperação ocorre após salvar a senha, no próprio app, para evitar perda da sessão antes de verificar as credenciais. Reset de senha esquecida e revisão das demais contas continuam pendentes.
