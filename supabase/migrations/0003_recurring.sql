-- =============================================================
-- Gastos recorrentes (modelos) — reutiliza budget_category / households / auth_household_id do 0001
-- Rode no Supabase: SQL Editor > New query > Run
-- Não afetam o orçamento sozinhos; servem de atalho para incluir no mês.
-- =============================================================

create table recurring_expenses (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null default auth_household_id() references households (id) on delete cascade,
  description  text not null,
  category     budget_category not null,
  base_amount  numeric(12,2) check (base_amount is null or base_amount >= 0),  -- valor base opcional
  created_at   timestamptz not null default now()
);

create index recurring_expenses_household_idx on recurring_expenses (household_id);

alter table recurring_expenses enable row level security;

create policy recurring_expenses_all on recurring_expenses
  for all using (household_id = auth_household_id())
  with check (household_id = auth_household_id());
