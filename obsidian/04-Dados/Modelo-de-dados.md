---
tipo: dados
fonte: Supabase
atualizado: 2026-11-04
---

# Modelo de dados e Supabase

## Configuração e autenticação

`src/lib/supabase.ts` cria o cliente com `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY`. A sessão do Supabase fica em `AsyncStorage`. Sessões existentes são preservadas; sem sessão, o app oferece entrada por email/senha e não cria usuários anônimos. Minha conta permite definir senha após email confirmado, mantendo UUID e profile. Um cliente efêmero testa login e vínculo de casa sem persistir outra sessão. Não há nova migração para esse fluxo; reset de senha esquecida ainda não foi implementado.

## Tabelas

| Tabela | Finalidade |
| --- | --- |
| `households` | Casa compartilhada. |
| `profiles` | Usuário autenticado e sua casa. |
| `goals` | Meta percentual por categoria e casa. |
| `incomes` | Rendas mensais. |
| `work_expenses` | Gastos profissionais mensais, deduzidos da renda disponível. |
| `expenses` | Gastos mensais, data real e dados de parcelas. |
| `recurring_expenses` | Modelos de gastos recorrentes. |
| `persons` | Pessoas das carteiras pessoais. |
| `fun_entries` | Créditos e débitos das carteiras pessoais. |
| `investment_institutions` | Catálogo global de instituições, somente leitura para clientes autenticados. |
| `investments` | Posições por casa e objetivo, categoria/tipo, instituição, valor atual e data da avaliação manual. |
| `investment_contributions` | Histórico de aportes com valor, data e quantidade para renda variável. |

## Integridade e acesso

- Todas as tabelas de domínio usam `household_id` e RLS.
- `auth_household_id()` determina a casa do usuário autenticado; as policies permitem CRUD somente nessa casa.
- A migração 0001 associava novos usuários à primeira casa. A 0011, aplicada pelo usuário com funcionamento do app confirmado em 2026-11-04, substitui `handle_new_user()` por uma função sem associação automática. Novos usuários ficam sem profile/casa; membros anteriores são preservados e precisam de revisão.
- Após 0011, clientes podem alterar somente `display_name` no próprio profile; criação, exclusão e alteração de `id`/`household_id` exigem provisionamento administrativo. A migração revoga privilégios tanto de tabela quanto de coluna. Procedimento: [[05-Operacao/Restringir-acesso-a-casa]].
- `persons` → `fun_entries` usa exclusão em cascata.
- Valores não aceitam números negativos; em `fun_entries` o sinal deriva de `type`.

## Investimentos

`investments` usa os objetivos `liberdade_financeira`, `apartamento` e `metas`, com categoria `fixa`/`variavel` e tipos validados no banco. O nome é obrigatório. `current_value` é `numeric(14,2)` não negativo; `valued_at` é nulo até a primeira avaliação manual. `maturity_date date` é opcional e só pode ser preenchido para renda fixa; posições existentes ficam com nulo e o banco rejeita datas infinitas. A instituição é FK para o catálogo global.

`investment_contributions` guarda `amount numeric(14,2)` positivo, `quantity numeric(22,8)` positiva (obrigatória apenas para variável), `occurred_on date` até hoje e `created_at`. A FK composta `(investment_id, household_id)` garante que aporte e posição pertençam à mesma casa; exclusão da posição remove seus aportes. RLS limita posições e aportes à casa autenticada.

O gatilho `adjust_investment_contribution()` bloqueia a posição com `FOR UPDATE`, valida a quantidade e ajusta `current_value` na mesma transação pelo valor inserido, diferença editada ou valor removido, limitado a zero. A data da avaliação manual é preservada. Não permite transferir um aporte para outra posição/casa.

`create_investment(...)` executa com as permissões do chamador e cria posição e aporte inicial atomicamente. Valor inicial zero não gera aporte; falhas no aporte desfazem a posição. Execução concedida somente a `authenticated`.

A migração 0010 adiciona uma sobrecarga de `create_investment` com o parâmetro `p_maturity_date date` (sem default). Ela chama a assinatura anterior e atualiza o vencimento dentro da mesma transação: uma data incompatível desfaz posição e aporte. A assinatura de nove parâmetros permanece para compatibilidade com o APK instalado. Ambas usam as permissões do chamador; não ampliam a RLS. Vencimento pode ser atualizado diretamente somente na própria casa.

Filtros de categoria/instituição/tipo/ano são aplicados localmente à listagem e não geram novas tabelas ou índices.

Totais aportados, quantidade, preço por unidade, preço médio e valorização são derivados no aplicativo, sem colunas duplicadas. Não há tabela de objetivos: os três identificadores são fixos no domínio e validados por `CHECK` no banco.

## Migrações versionadas

| Arquivo | Conteúdo |
| --- | --- |
| `0001_init.sql` | Estrutura inicial, metas, trigger de usuário e RLS. |
| `0002_personal_wallets.sql` | Pessoas e carteiras pessoais. |
| `0003_recurring.sql` | Modelos de gastos recorrentes. |
| `0004_expense_date.sql` | `occurred_on` em gastos, com preenchimento dos registros antigos. |
| `0005_expense_installments.sql` | Grupo e índices de parcelas para gastos do orçamento. |
| `0006_work_expenses.sql` | Gastos com trabalho mensais, índice e política RLS. |
| `0007_add_apartment_category.sql` | Adiciona `apartamento` ao enum de categorias. |
| `0008_seed_apartment_goal.sql` | Cria a meta Apartamento com 0% nas casas existentes. |
| `0009_investments.sql` | Investimentos, instituições, aportes, função transacional, gatilho de saldo e RLS. Validada em PostgreSQL isolado e aplicada pelo usuário; leitura confirmada no aparelho. |
| `0010_investment_maturity.sql` | Vencimento opcional só para renda fixa e sobrecarga de criação compatível com versões anteriores. Validada em PostgreSQL isolado e aplicada pelo usuário; coluna e leitura pelo app confirmadas. |

Ao mudar o banco, crie uma nova migração sequencial em `supabase/migrations/`, aplique-a no Supabase e atualize esta nota.

`0011_restrict_household_membership.sql`: contenção de acesso automático à casa e proteção de campos de autorização. Validada em PostgreSQL isolado; **aplicada pelo usuário em 2026-11-04, com funcionamento do app confirmado**; revisão dos membros e conferência dos privilégios reais ainda pendentes. Não altera o armazenamento de sessão nem implementa login recuperável.
