-- Vencimento opcional; preserva posições existentes e o cadastro das versões anteriores.
begin;
alter table public.investments add column maturity_date date;
alter table public.investments add constraint investments_maturity_fixed_only
  check (maturity_date is null or (category = 'fixa' and isfinite(maturity_date)));

-- A assinatura anterior permanece disponível para o aplicativo já instalado.
-- A função anterior cria posição/aporte; a atualização do vencimento é parte da mesma transação.
create function public.create_investment(p_name text, p_objective text, p_category text,
 p_type text, p_institution uuid, p_amount numeric, p_quantity numeric, p_date date,
 p_maturity_date date)
returns uuid language plpgsql set search_path = public as $$
declare new_id uuid;
begin
  new_id := public.create_investment(p_name, p_objective, p_category,
    p_type, p_institution, p_amount, p_quantity, p_date);
  update public.investments set maturity_date = p_maturity_date where id = new_id;
  return new_id;
end;
$$;
revoke all on function public.create_investment(text,text,text,text,uuid,numeric,numeric,date,date) from public;
grant execute on function public.create_investment(text,text,text,text,uuid,numeric,numeric,date,date) to authenticated;
commit;
