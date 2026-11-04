---
tipo: operacao
atualizado: 2026-11-04
status: aplicada-acessos-anteriores-retirados
---

# Restringir acesso à casa

## Contexto

Contenção dos achados de [[06-Desenvolvimento/Auditoria-de-seguranca-2026-11-04]]. Testada localmente e aplicada ao Supabase pelo usuário em 2026-11-04, com confirmação de que o app continua funcionando. Verificação independente dos privilégios em produção e revisão de membros ainda pendentes. Não requer reinstalação do APK.

## Aplicação

1. Confirmar que o celular ainda abre seus dados. Não sair da sessão, limpar dados ou desinstalar: o acesso atual é anônimo, sem recuperação por senha.
2. No projeto correto do Supabase, guardar backup e consultar os membros com o SQL abaixo. Os resultados contêm identificadores pessoais; não publicá-los no repositório. A data do último acesso não prova que um usuário é legítimo. Correlacionar o UUID com a sessão do aparelho antes de remover qualquer membro.
3. No SQL Editor, executar integralmente `supabase/migrations/0011_restrict_household_membership.sql`. A transação substitui o cadastro automático e restringe escrita em profiles; não apaga usuários, perfis ou dados financeiros.
4. Reabrir o app sem limpar seus dados e verificar consulta e inclusão de um lançamento. A migração mantém as permissões financeiras dos membros existentes.
5. Revisar membros anteriores e logs de autenticação. Só após identificação positiva do usuário legítimo, remover associações indevidas e revogar as sessões correspondentes. Não executar exclusão em massa de usuários anônimos: seu usuário legítimo também é anônimo.
6. Restringir novos cadastros nas configurações de Auth como defesa adicional, após planejar recuperação/provisionamento. A migração em si permite criar identidades, mas não lhes concede casa; também não implementa CAPTCHA ou limitação de abuso de cadastros.

Consulta administrativa somente de leitura:

```sql
select u.id as user_id, u.is_anonymous,
       u.created_at, u.last_sign_in_at,
       p.household_id
from auth.users u
left join public.profiles p on p.id = u.id
order by u.created_at;
```

Verificação administrativa da função e privilégios:

```sql
select pg_get_functiondef('public.handle_new_user()'::regprocedure);
select
  has_column_privilege('authenticated', 'public.profiles', 'household_id', 'UPDATE') as pode_trocar_casa,
  has_column_privilege('authenticated', 'public.profiles', 'id', 'INSERT') as pode_criar_perfil,
  has_column_privilege('authenticated', 'public.profiles', 'display_name', 'UPDATE') as pode_editar_nome;
```

Resultado esperado: função retorna `new` sem criar perfil/casa; privilégios `false`, `false`, `true`. Conferir também policies e grants extras de produção, que não foram inspecionados localmente. Testes de RLS devem usar papel de cliente; SQL Editor administrativo pode ignorar RLS.

## Efeito e limites

- Usuários anteriores continuam membros: esta é contenção, não certificação de que todos são legítimos.
- Novos usuários não têm profile nem casa e não podem criar o próprio vínculo. O catálogo público aos autenticados de instituições permanece legível; não contém posições financeiras pessoais.
- `display_name` pode ser atualizado somente no próprio perfil. `id`, `household_id` e criação/exclusão de perfil ficam fora das permissões dos clientes.
- No APK atual, uma instalação nova pode autenticar sem ter acesso a dados e apresentar listas vazias/erros de gravação. Minha conta permite identificar a sessão existente; não há ainda uma tela de acesso restrito ou recuperação. Não associar usuários automaticamente para contornar essa situação.
- Instalações novas de desenvolvimento também precisam de provisionamento administrativo explícito de casa/metas/perfil, pois o bootstrap automático deixa de existir.

## Próxima etapa: acesso recuperável

Identificar o usuário legítimo no celular e vincular email verificado ou outro método permanente à mesma identidade, preservando UUID e casa. Implementar login/recuperação e tela de acesso não autorizado; testar recuperação antes de encerrar a sessão anônima. Qualquer novo membro deve ser associado por operação administrativa ou convite validado pelo servidor. Não confiar em `user_metadata` para autorizar casa. Não reativar a antiga função como rollback: ela reabre a falha.

Essa etapa não foi implementada; exige identificação da sessão e escolha do método de acesso. Uma simples atualização de dependências não substitui esta correção no servidor.

## Verificação local

`tests/household-security-db.mjs` executa migrações reais em PostgreSQL isolado via PGlite, com Auth simulado: sessão existente, escrita/leitura financeira, novo cadastro com metadata forjada, bloqueio de associação, permissões por coluna, leitura/escrita negadas a não membros e reaplicação da migração. Passou em 2026-11-04. Não valida configuração do serviço Auth em produção.

```sh
PGLITE_MODULE=/caminho/para/@electric-sql/pglite/dist/index.js node tests/household-security-db.mjs
```

Referências: [Supabase: usuários anônimos e vínculo de identidade](https://supabase.com/docs/guides/auth/auth-anonymous), [privilégios por coluna](https://supabase.com/docs/guides/database/postgres/column-level-security).

## Identificação no aparelho

Em 2026-11-04, a atualização com [[03-Fluxos/Minha-conta]] foi instalada preservando os dados. O usuário confirmou conta anônima e identificador compatível com um dos membros da lista administrativa. Identificadores reais não foram registrados no vault. Demais membros ainda não foram validados ou removidos; recuperação permanente continua pendente.

## Solicitação de vínculo

Em 2026-11-04, o email autorizado pelo usuário foi submetido pelo formulário autenticado no aparelho. A interface passou de Anônima para Permanente mantendo o identificador. Nenhuma conta foi removida ou mesclada. Ainda é necessário conferir o email vinculado e `email_confirmed_at` no servidor; não presumir entrega de mensagem ou confirmação pelo simples retorno da solicitação. Login/recuperação em nova instalação continuam pendentes.

## Confirmação do vínculo no servidor

O usuário apresentou resultado administrativo em 2026-11-04 confirmando email correto, mesmo UUID, `is_anonymous=false` e `email_confirmed_at` preenchido. Não recebeu link de confirmação. Isso confirma o estado registrado no servidor, mas não demonstra entrega de email nem posse verificada da caixa postal; a configuração de confirmação automática não foi inspecionada. Próximo passo: configurar e testar acesso recuperável sem encerrar a sessão atual.

## Definição de senha no aparelho

Atualização instalada no Galaxy A54 com Definir senha em Minha conta e entrada por email/senha quando não houver sessão. Interface e sessão preservada verificadas. O usuário deve digitar a senha diretamente no aparelho, sem enviá-la pelo chat. Ao salvar, o app testa credenciais e vínculo de casa com cliente efêmero; aguardar mensagem de validação. Não limpar dados para fazer esse teste. Teste real com a senha do usuário ainda depende de sua digitação. Reset de senha esquecida e revisão dos outros membros continuam pendentes.

## Acesso com senha validado

O usuário confirmou em 2026-11-04 a mensagem de sucesso após salvar a senha diretamente no aparelho. O fluxo verificou login por email/senha, mesmo UUID e vínculo de casa usando cliente efêmero, preservando a sessão principal. Nenhuma senha foi fornecida no chat ou registrada no vault. Revisão dos outros quatro membros, confirmação de privilégios reais e reset de senha esquecida continuam pendentes.

## Retirada dos acessos anteriores — aplicada pelo usuário

O usuário informou uso exclusivo no aparelho atual e autorizou a retirada dos demais acessos. `supabase/admin/revoke_previous_members.sql` remove somente os quatro profiles da mesma casa diferentes da identidade permanente validada. Exige UUID explícito, email confirmado e exatamente quatro candidatos; resultados inesperados não removem linhas. Outros households são preservados. Exportar as linhas retornadas para eventual reconstituição administrativa dos perfis. Nenhum identificador real foi incluído no script versionado.

Não exclui `auth.users`, casa ou dados financeiros. Sem profile, `auth_household_id()` retorna NULL e a RLS impede novos acessos aos registros da casa, mesmo com token anterior; dados já vistos não podem ser recolhidos. Não revoga sessões Auth nem acesso a eventuais recursos externos a essas policies. Nenhuma FK para profiles foi identificada nas migrações revisadas. Após execução, confirmar quatro linhas retornadas, um membro restante na casa e funcionamento do aparelho.

Script validado em PostgreSQL isolado: contagens 3/5 não alteram dados; com 4, remove só os candidatos e preserva proprietário e outra casa. **Executado pelo usuário em produção em 2026-11-04**: confirmou quatro linhas retornadas e funcionamento do app após a retirada dos vínculos. A consulta limita a remoção aos outros quatro membros da casa da identidade preservada. Não houve exclusão de usuários Auth ou revogação de suas sessões. Conferência independente dos privilégios reais e reset de senha esquecida continuam pendentes.
