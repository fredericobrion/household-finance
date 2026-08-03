-- Gastos profissionais mensais, abatidos da renda disponível do orçamento.
create table work_expenses (
  id              uuid primary key default gen_random_uuid(),
  household_id    uuid not null default auth_household_id() references households (id) on delete cascade,
  reference_month date not null,
  description     text,
  amount          numeric(12,2) not null check (amount >= 0),
  created_at      timestamptz not null default now()
);

create index work_expenses_household_month_idx
  on work_expenses (household_id, reference_month);

alter table work_expenses enable row level security;

create policy work_expenses_all on work_expenses
  for all using (household_id = auth_household_id())
  with check (household_id = auth_household_id());
