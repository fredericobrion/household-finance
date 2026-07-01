-- =============================================================
-- Orçamento doméstico — schema inicial
-- Rode este arquivo inteiro no Supabase: SQL Editor > New query > Run
-- =============================================================

-- ---------- Enum de categorias ----------
create type budget_category as enum (
  'custos_fixos',
  'conforto',
  'metas',
  'prazeres',
  'liberdade_financeira',
  'conhecimento'
);

-- ---------- Households (o "lar" compartilhado) ----------
create table households (
  id         uuid primary key default gen_random_uuid(),
  name       text not null default 'Casa',
  created_at timestamptz not null default now()
);

-- ---------- Profiles (1:1 com auth.users) ----------
create table profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  household_id uuid not null references households (id) on delete cascade,
  display_name text,
  created_at   timestamptz not null default now()
);

-- ---------- Helper: household do usuário logado ----------
-- security definer p/ ler profiles sem recursão de RLS.
-- Usado nas policies E como default de household_id nos inserts.
create or replace function auth_household_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select household_id from profiles where id = auth.uid()
$$;

-- ---------- Goals (metas globais por household) ----------
create table goals (
  household_id uuid not null references households (id) on delete cascade,
  category     budget_category not null,
  percentage   numeric(5,2) not null default 0 check (percentage >= 0 and percentage <= 100),
  primary key (household_id, category)
);

-- ---------- Incomes (rendas do mês — vários lançamentos) ----------
create table incomes (
  id              uuid primary key default gen_random_uuid(),
  household_id    uuid not null default auth_household_id() references households (id) on delete cascade,
  reference_month date not null,                 -- 1º dia do mês
  description     text,
  amount          numeric(12,2) not null check (amount >= 0),
  created_at      timestamptz not null default now()
);

-- ---------- Expenses (gastos individuais) ----------
create table expenses (
  id              uuid primary key default gen_random_uuid(),
  household_id    uuid not null default auth_household_id() references households (id) on delete cascade,
  reference_month date not null,                 -- 1º dia do mês
  category        budget_category not null,
  description     text,
  amount          numeric(12,2) not null check (amount >= 0),
  created_at      timestamptz not null default now()
);

create index incomes_household_month_idx  on incomes  (household_id, reference_month);
create index expenses_household_month_idx on expenses (household_id, reference_month);

-- =============================================================
-- Gatilho: ao criar usuário, cria profile
-- (e household + metas padrão no primeiro cadastro)
-- =============================================================
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  hh uuid;
begin
  -- entra na casa existente (modelo single-household) ou cria a primeira
  select id into hh from households order by created_at limit 1;

  if hh is null then
    insert into households (name) values ('Casa') returning id into hh;
    -- semeia as metas com a distribuição padrão (soma = 100%)
    insert into goals (household_id, category, percentage) values
      (hh, 'custos_fixos', 30),
      (hh, 'conforto', 15),
      (hh, 'metas', 15),
      (hh, 'prazeres', 10),
      (hh, 'liberdade_financeira', 25),
      (hh, 'conhecimento', 5);
  end if;

  insert into profiles (id, household_id, display_name)
  values (new.id, hh, new.raw_user_meta_data ->> 'display_name');

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();

-- =============================================================
-- Row Level Security
-- =============================================================
alter table households enable row level security;
alter table profiles   enable row level security;
alter table goals      enable row level security;
alter table incomes    enable row level security;
alter table expenses   enable row level security;

-- households: membros leem a própria casa
create policy household_select on households
  for select using (id = auth_household_id());

-- profiles: leio perfis da minha casa; atualizo só o meu
create policy profiles_select on profiles
  for select using (household_id = auth_household_id());
create policy profiles_update on profiles
  for update using (id = auth.uid());

-- goals / incomes / expenses: CRUD restrito ao meu household
create policy goals_all on goals
  for all using (household_id = auth_household_id())
  with check (household_id = auth_household_id());

create policy incomes_all on incomes
  for all using (household_id = auth_household_id())
  with check (household_id = auth_household_id());

create policy expenses_all on expenses
  for all using (household_id = auth_household_id())
  with check (household_id = auth_household_id());
