-- Investimentos por objetivo. Catálogo global; posições e aportes isolados por casa.
begin;
create table public.investment_institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (length(trim(name)) > 0)
);
insert into public.investment_institutions(name) values
 ('Banco do Brasil'), ('Bradesco'), ('BTG Pactual'), ('Caixa'), ('C6 Bank'),
 ('Clear'), ('Inter'), ('Itaú'), ('Mercado Pago'), ('Nubank'), ('Rico'),
 ('Santander'), ('Sicoob'), ('Sicredi'), ('XP Investimentos'), ('Outra');
alter table public.investment_institutions enable row level security;
create policy institutions_read on public.investment_institutions for select to authenticated using (true);

create table public.investments (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null default public.auth_household_id() references public.households(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 100),
  objective text not null check (objective in ('liberdade_financeira', 'apartamento', 'metas')),
  category text not null check (category in ('fixa', 'variavel')),
  investment_type text not null,
  institution_id uuid not null references public.investment_institutions(id),
  current_value numeric(14,2) not null default 0 check (current_value >= 0 and current_value <> 'NaN'::numeric),
  valued_at timestamptz,
  created_at timestamptz not null default now(),
  unique (id, household_id),
  check ((category = 'fixa' and investment_type in ('CDB','RDB','LCI','LCA','LC','Tesouro Direto','Debênture','CRI','CRA','Poupança','Outros'))
    or (category = 'variavel' and investment_type in ('Ação','FII','ETF','BDR','Outros')))
);
create index investments_household_idx on public.investments(household_id);
alter table public.investments enable row level security;
create policy investments_all on public.investments for all to authenticated
 using (household_id = public.auth_household_id()) with check (household_id = public.auth_household_id());

create table public.investment_contributions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null default public.auth_household_id() references public.households(id) on delete cascade,
  investment_id uuid not null,
  amount numeric(14,2) not null check (amount > 0 and amount <> 'NaN'::numeric),
  quantity numeric(22,8) check (quantity > 0 and quantity <> 'NaN'::numeric),
  occurred_on date not null check (occurred_on <= current_date),
  created_at timestamptz not null default now(),
  foreign key (investment_id, household_id) references public.investments(id, household_id) on delete cascade
);
create index investment_contributions_parent_idx on public.investment_contributions(investment_id, occurred_on);
alter table public.investment_contributions enable row level security;
create policy contributions_all on public.investment_contributions for all to authenticated
 using (household_id = public.auth_household_id()) with check (household_id = public.auth_household_id());

-- Trava a posição e ajusta o valor atual pela diferença do aporte, na mesma transação.
-- Não altera a data da última avaliação manual. Exclusão limita o saldo a zero.
create function public.adjust_investment_contribution() returns trigger
language plpgsql set search_path = public as $$
declare
  parent public.investments;
  delta numeric;
begin
  if tg_op = 'UPDATE' and (new.investment_id <> old.investment_id or new.household_id <> old.household_id) then
    raise exception 'Não é possível transferir um aporte.';
  end if;
  select * into parent from public.investments
    where id = case when tg_op = 'DELETE' then old.investment_id else new.investment_id end for update;
  if not found then
    if tg_op = 'DELETE' then return old; end if;
    raise exception 'Investimento não encontrado.';
  end if;
  if tg_op <> 'DELETE' then
    if (parent.category = 'variavel' and new.quantity is null)
      or (parent.category = 'fixa' and new.quantity is not null) then
      raise exception 'Quantidade obrigatória somente para renda variável.';
    end if;
  end if;
  delta := case when tg_op = 'DELETE' then -old.amount
    when tg_op = 'UPDATE' then new.amount - old.amount else new.amount end;
  update public.investments set current_value = greatest(0, current_value + delta) where id = parent.id;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;
create trigger contribution_adjust before insert or update or delete on public.investment_contributions
 for each row execute function public.adjust_investment_contribution();

-- Criação atômica: uma falha no aporte inicial também desfaz o cadastro.
create function public.create_investment(p_name text, p_objective text, p_category text,
 p_type text, p_institution uuid, p_amount numeric, p_quantity numeric, p_date date)
returns uuid language plpgsql set search_path = public as $$
declare new_id uuid;
begin
  if p_amount is null or p_amount < 0 or p_amount = 'NaN'::numeric then
    raise exception 'Valor inicial inválido.';
  end if;
  if p_amount = 0 and p_quantity is not null then
    raise exception 'Sem valor inicial, deixe a quantidade vazia.';
  end if;
  insert into public.investments(name, objective, category, investment_type, institution_id)
    values(trim(p_name), p_objective, p_category, p_type, p_institution) returning id into new_id;
  if p_amount > 0 then
    insert into public.investment_contributions(investment_id, amount, quantity, occurred_on)
      values(new_id, p_amount, p_quantity, p_date);
  end if;
  return new_id;
end;
$$;
revoke all on function public.create_investment(text,text,text,text,uuid,numeric,numeric,date) from public;
grant execute on function public.create_investment(text,text,text,text,uuid,numeric,numeric,date) to authenticated;
commit;
