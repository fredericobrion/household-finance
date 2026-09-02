---
tipo: dados
fonte: Supabase
atualizado: 2026-09-02
---

# Modelo de dados e Supabase

## Configuração e autenticação

`src/lib/supabase.ts` cria o cliente com `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY`. A sessão do Supabase fica em `AsyncStorage` e o app autentica anonimamente se não encontrar uma sessão.

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

## Integridade e acesso

- Todas as tabelas de domínio usam `household_id` e RLS.
- `auth_household_id()` determina a casa do usuário autenticado; as policies permitem CRUD somente nessa casa.
- O gatilho `handle_new_user()` cria um profile e, caso ainda não exista, a casa inicial e as sete metas padrão; Apartamento é criada com 0%.
- `persons` → `fun_entries` usa exclusão em cascata.
- Valores não aceitam números negativos; em `fun_entries` o sinal deriva de `type`.

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

Ao mudar o banco, crie uma nova migração sequencial em `supabase/migrations/`, aplique-a no Supabase e atualize esta nota.
