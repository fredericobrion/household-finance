-- Contenção: preserva membros existentes, mas nunca autoriza novos cadastros.
-- Revisar membros existentes separadamente; esta migração não os certifica.
begin;

-- Auth pode criar identidades (inclusive via convite administrativo), mas
-- nenhuma identidade nova recebe casa/profile automaticamente.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  return new;
end;
$$;

-- O trigger chama a função sem precisar de EXECUTE concedido ao cliente.
revoke all on function public.handle_new_user() from public, anon, authenticated;

-- Revogar privilégios de tabela E de coluna (um não revoga o outro).
revoke insert, update, delete on public.profiles from public, anon, authenticated;
revoke insert (id, household_id, display_name, created_at),
       update (id, household_id, display_name, created_at)
on public.profiles from public, anon, authenticated;
grant update (display_name) on public.profiles to authenticated;

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Mantém auth_household_id e as policies financeiras: sem profile, a função
-- retorna NULL e o novo usuário não acessa nenhuma casa.
commit;
