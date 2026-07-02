-- =============================================================
-- Gastos Pessoais — carteira por pessoa (saldo acumulado, carrega mês a mês)
-- Rode no Supabase: SQL Editor > New query > Run
-- Reutiliza households/auth_household_id() do 0001.
-- =============================================================

-- ---------- Pessoas (lista compartilhada do household) ----------
create table persons (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null default auth_household_id() references households (id) on delete cascade,
  name         text not null,
  created_at   timestamptz not null default now()
);

-- ---------- Lançamentos da carteira de cada pessoa ----------
create table fun_entries (
  id                uuid primary key default gen_random_uuid(),
  household_id      uuid not null default auth_household_id() references households (id) on delete cascade,
  person_id         uuid not null references persons (id) on delete cascade,
  reference_month   date not null,                          -- mês em que o lançamento conta
  type              text not null check (type in ('saldo', 'gasto')),
  description       text,
  amount            numeric(12,2) not null check (amount >= 0),  -- sempre positivo; sinal vem do type
  group_id          text,                                    -- agrupa parcelas (null se avulso)
  installment_index int not null default 1,
  installment_count int not null default 1,
  created_at        timestamptz not null default now()
);

create index persons_household_idx        on persons (household_id);
create index fun_entries_person_month_idx on fun_entries (person_id, reference_month);

alter table persons     enable row level security;
alter table fun_entries enable row level security;

create policy persons_all on persons
  for all using (household_id = auth_household_id())
  with check (household_id = auth_household_id());

create policy fun_entries_all on fun_entries
  for all using (household_id = auth_household_id())
  with check (household_id = auth_household_id());
